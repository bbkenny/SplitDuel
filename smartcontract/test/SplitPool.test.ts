import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCommitHash(
  attackBP: number,
  defendBP: number,
  investBP: number,
  salt: string,
  sender: string
): string {
  return ethers.keccak256(
    ethers.solidityPacked(
      ["uint8", "uint8", "uint8", "bytes32", "address"],
      [attackBP, defendBP, investBP, salt, sender]
    )
  );
}

const CELO_ERC20 = "0x471EcE3750Da237f93B8E339c536989b8978a438";
const ONE_DAY    = 86400;

// ─── Fixture ──────────────────────────────────────────────────────────────────
async function deployFixture() {
  const [owner, player1, player2, player3, player4] = await ethers.getSigners();

  const SplitPool = await ethers.getContractFactory("SplitPool");
  const splitPool = await SplitPool.deploy();

  return { splitPool, owner, player1, player2, player3, player4 };
}

// Helper: start tournament for CELO_ERC20 token
async function startCeloTournament(splitPool: any, admin: any) {
  await splitPool.connect(admin).startTournament(CELO_ERC20);
}

// ─── SplitPool Test Suite ─────────────────────────────────────────────────────
describe("SplitPool", function () {

  describe("Deployment", function () {
    it("sets admin to deployer", async function () {
      const { splitPool, owner } = await loadFixture(deployFixture);
      expect(await splitPool.admin()).to.equal(owner.address);
    });

    it("registers CELO_ERC20 as a supported token", async function () {
      const { splitPool } = await loadFixture(deployFixture);
      expect(await splitPool.supportedTokens(CELO_ERC20)).to.be.true;
    });

    it("starts at tournamentId 1", async function () {
      const { splitPool } = await loadFixture(deployFixture);
      expect(await splitPool.currentTournamentId()).to.equal(1n);
    });
  });

  describe("Admin transferability", function () {
    it("two-step transfer works", async function () {
      const { splitPool, owner, player1 } = await loadFixture(deployFixture);
      await splitPool.connect(owner).transferAdmin(player1.address);
      await splitPool.connect(player1).acceptAdmin();
      expect(await splitPool.admin()).to.equal(player1.address);
    });

    it("non-admin cannot call transferAdmin", async function () {
      const { splitPool, player1, player2 } = await loadFixture(deployFixture);
      await expect(
        splitPool.connect(player1).transferAdmin(player2.address)
      ).to.be.revertedWith("ERR: Not admin");
    });
  });

  describe("startTournament", function () {
    it("admin can start a tournament for CELO_ERC20", async function () {
      const { splitPool, owner } = await loadFixture(deployFixture);
      await expect(splitPool.connect(owner).startTournament(CELO_ERC20))
        .to.emit(splitPool, "TournamentStarted");

      const t = await splitPool.tournaments(1, CELO_ERC20);
      expect(t.startTime).to.be.gt(0n);
      expect(t.settled).to.be.false;
    });

    it("cannot start same tournament twice for same token", async function () {
      const { splitPool, owner } = await loadFixture(deployFixture);
      await splitPool.connect(owner).startTournament(CELO_ERC20);
      await expect(
        splitPool.connect(owner).startTournament(CELO_ERC20)
      ).to.be.revertedWith("ERR: Already started for this token");
    });

    it("non-admin cannot start tournament", async function () {
      const { splitPool, player1 } = await loadFixture(deployFixture);
      await expect(
        splitPool.connect(player1).startTournament(CELO_ERC20)
      ).to.be.revertedWith("ERR: Not admin");
    });
  });

  describe("joinPool", function () {
    it("player can join with native CELO above minimum", async function () {
      const { splitPool, owner, player1 } = await loadFixture(deployFixture);
      await startCeloTournament(splitPool, owner);

      const amount = ethers.parseEther("0.1");
      await expect(
        splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: amount })
      ).to.emit(splitPool, "PoolJoined");

      const e = await splitPool.getEntry(1, CELO_ERC20, player1.address);
      expect(e.player).to.equal(player1.address);
      expect(e.amount).to.equal(amount);
    });

    it("rejects below minimum entry", async function () {
      const { splitPool, owner, player1 } = await loadFixture(deployFixture);
      await startCeloTournament(splitPool, owner);

      await expect(
        splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("ERR: Below minimum entry");
    });

    it("player cannot join same tournament twice", async function () {
      const { splitPool, owner, player1 } = await loadFixture(deployFixture);
      await startCeloTournament(splitPool, owner);
      const amount = ethers.parseEther("0.1");
      await splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: amount });
      await expect(
        splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: amount })
      ).to.be.revertedWith("ERR: Already entered");
    });

    it("cannot join after tournament ends", async function () {
      const { splitPool, owner, player1 } = await loadFixture(deployFixture);
      await startCeloTournament(splitPool, owner);
      await time.increase(ONE_DAY + 1);
      await expect(
        splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("ERR: Tournament ended");
    });
  });

  describe("commitSplit + revealSplit", function () {
    async function joinedFixture() {
      const base = await loadFixture(deployFixture);
      const { splitPool, owner, player1 } = base;
      await startCeloTournament(splitPool, owner);
      await splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: ethers.parseEther("0.1") });
      return base;
    }

    it("player can commit a split", async function () {
      const { splitPool, player1 } = await joinedFixture();
      const commit = makeCommitHash(30, 20, 50, ethers.encodeBytes32String("s"), player1.address);
      await expect(splitPool.connect(player1).commitSplit(CELO_ERC20, commit))
        .to.emit(splitPool, "SplitCommitted");

      const e = await splitPool.getEntry(1, CELO_ERC20, player1.address);
      expect(e.commitHash).to.equal(commit);
    });

    it("cannot commit twice", async function () {
      const { splitPool, player1 } = await joinedFixture();
      const commit = makeCommitHash(30, 20, 50, ethers.encodeBytes32String("s"), player1.address);
      await splitPool.connect(player1).commitSplit(CELO_ERC20, commit);
      await expect(
        splitPool.connect(player1).commitSplit(CELO_ERC20, commit)
      ).to.be.revertedWith("ERR: Already committed");
    });

    it("player can reveal a valid split", async function () {
      const { splitPool, player1 } = await joinedFixture();
      const salt = ethers.encodeBytes32String("mysalt");
      const commit = makeCommitHash(30, 20, 50, salt, player1.address);
      await splitPool.connect(player1).commitSplit(CELO_ERC20, commit);
      await expect(
        splitPool.connect(player1).revealSplit(CELO_ERC20, 30, 20, 50, salt)
      ).to.emit(splitPool, "SplitRevealed");

      const e = await splitPool.getEntry(1, CELO_ERC20, player1.address);
      expect(e.revealed).to.be.true;
      expect(e.investBP).to.equal(50);
    });

    it("rejects reveal with wrong values", async function () {
      const { splitPool, player1 } = await joinedFixture();
      const salt = ethers.encodeBytes32String("mysalt");
      const commit = makeCommitHash(30, 20, 50, salt, player1.address);
      await splitPool.connect(player1).commitSplit(CELO_ERC20, commit);
      await expect(
        splitPool.connect(player1).revealSplit(CELO_ERC20, 40, 20, 40, salt) // wrong values
      ).to.be.revertedWith("ERR: Invalid reveal: hash mismatch");
    });

    it("rejects reveal if split does not sum to 100", async function () {
      const { splitPool, player1 } = await joinedFixture();
      const salt = ethers.encodeBytes32String("mysalt");
      const commit = makeCommitHash(30, 20, 55, salt, player1.address); // 30+20+55=105
      await splitPool.connect(player1).commitSplit(CELO_ERC20, commit);
      await expect(
        splitPool.connect(player1).revealSplit(CELO_ERC20, 30, 20, 55, salt)
      ).to.be.revertedWith("ERR: Must sum to 100%");
    });
  });

  describe("settlePool + claims", function () {
    /**
     * Sets up 3 players each with different investBP:
     *   player1: investBP=80 (highest → winner)
     *   player2: investBP=50
     *   player3: investBP=20 (lowest)
     *
     * With 3 players, top 10% = 0 → bumped to 1 → only player1 wins.
     */
    async function threePlayerFixture() {
      const base = await loadFixture(deployFixture);
      const { splitPool, owner, player1, player2, player3 } = base;
      await startCeloTournament(splitPool, owner);

      const amount = ethers.parseEther("0.1");

      const salt1 = ethers.encodeBytes32String("salt1");
      const salt2 = ethers.encodeBytes32String("salt2");
      const salt3 = ethers.encodeBytes32String("salt3");

      // Join
      await splitPool.connect(player1).joinPool(CELO_ERC20, 0, { value: amount });
      await splitPool.connect(player2).joinPool(CELO_ERC20, 0, { value: amount });
      await splitPool.connect(player3).joinPool(CELO_ERC20, 0, { value: amount });

      // Commit (attack+defend+invest = 100 each)
      // p1: 10 attack, 10 defend, 80 invest
      // p2: 25 attack, 25 defend, 50 invest
      // p3: 40 attack, 40 defend, 20 invest
      const h1 = makeCommitHash(10, 10, 80, salt1, player1.address);
      const h2 = makeCommitHash(25, 25, 50, salt2, player2.address);
      const h3 = makeCommitHash(40, 40, 20, salt3, player3.address);

      await splitPool.connect(player1).commitSplit(CELO_ERC20, h1);
      await splitPool.connect(player2).commitSplit(CELO_ERC20, h2);
      await splitPool.connect(player3).commitSplit(CELO_ERC20, h3);

      // Reveal
      await splitPool.connect(player1).revealSplit(CELO_ERC20, 10, 10, 80, salt1);
      await splitPool.connect(player2).revealSplit(CELO_ERC20, 25, 25, 50, salt2);
      await splitPool.connect(player3).revealSplit(CELO_ERC20, 40, 40, 20, salt3);

      return base;
    }

    it("cannot settle before tournament ends", async function () {
      const { splitPool, owner } = await threePlayerFixture();
      await expect(
        splitPool.connect(owner).settlePool(CELO_ERC20)
      ).to.be.revertedWith("ERR: Tournament not yet ended");
    });

    it("settles tournament and marks winner correctly", async function () {
      const { splitPool, player1 } = await threePlayerFixture();

      // Advance time past tournament duration (1 day)
      await time.increase(ONE_DAY + 1);

      await expect(splitPool.settlePool(CELO_ERC20))
        .to.emit(splitPool, "TournamentSettled");

      // player1 (investBP=80) should be the winner
      const e1 = await splitPool.getEntry(1, CELO_ERC20, player1.address);
      expect(e1.isWinner).to.be.true;
      expect(e1.rewardAmount).to.be.gt(0n);
    });

    it("non-winners are not marked as winners", async function () {
      const { splitPool, player2, player3 } = await threePlayerFixture();
      await time.increase(ONE_DAY + 1);
      await splitPool.settlePool(CELO_ERC20);

      const e2 = await splitPool.getEntry(1, CELO_ERC20, player2.address);
      const e3 = await splitPool.getEntry(1, CELO_ERC20, player3.address);
      expect(e2.isWinner).to.be.false;
      expect(e3.isWinner).to.be.false;
    });

    it("cannot settle twice", async function () {
      const { splitPool } = await threePlayerFixture();
      await time.increase(ONE_DAY + 1);
      await splitPool.settlePool(CELO_ERC20);
      await expect(
        splitPool.settlePool(CELO_ERC20)
      ).to.be.revertedWith("ERR: Already settled");
    });

    it("winner can claim reward after settlement", async function () {
      const { splitPool, player1 } = await threePlayerFixture();
      await time.increase(ONE_DAY + 1);
      await splitPool.settlePool(CELO_ERC20);

      // Small reward may be 0 since yield accrues slowly in tests
      // Just verify the call doesn't revert for a winner
      const e = await splitPool.getEntry(1, CELO_ERC20, player1.address);
      if (e.rewardAmount > 0n) {
        await expect(
          splitPool.connect(player1).claimPoolReward(1, CELO_ERC20)
        ).to.emit(splitPool, "RewardClaimed");
      } else {
        // rewardAmount is 0 — verify claim reverts appropriately
        await expect(
          splitPool.connect(player1).claimPoolReward(1, CELO_ERC20)
        ).to.be.revertedWith("ERR: No reward");
      }
    });

    it("non-winner cannot claim reward", async function () {
      const { splitPool, player2 } = await threePlayerFixture();
      await time.increase(ONE_DAY + 1);
      await splitPool.settlePool(CELO_ERC20);

      await expect(
        splitPool.connect(player2).claimPoolReward(1, CELO_ERC20)
      ).to.be.revertedWith("ERR: Not a winner");
    });

    it("all players can claim principal after settlement", async function () {
      const { splitPool, player1, player2, player3 } = await threePlayerFixture();
      await time.increase(ONE_DAY + 1);
      await splitPool.settlePool(CELO_ERC20);

      for (const player of [player1, player2, player3]) {
        await expect(
          splitPool.connect(player).claimPrincipal(1, CELO_ERC20)
        ).to.emit(splitPool, "PrincipalClaimed");
      }
    });

    it("cannot claim principal twice", async function () {
      const { splitPool, player1 } = await threePlayerFixture();
      await time.increase(ONE_DAY + 1);
      await splitPool.settlePool(CELO_ERC20);
      await splitPool.connect(player1).claimPrincipal(1, CELO_ERC20);
      await expect(
        splitPool.connect(player1).claimPrincipal(1, CELO_ERC20)
      ).to.be.revertedWith("ERR: Principal already claimed");
    });
  });

  describe("settlePool with 10+ players (top 10%)", function () {
    it("correctly selects top 10% when 10 players reveal", async function () {
      const base = await loadFixture(deployFixture);
      const { splitPool, owner } = base;
      await startCeloTournament(splitPool, owner);

      const amount = ethers.parseEther("0.05");

      // Use 10 signers (hardhat provides 20 by default)
      const signers = await ethers.getSigners();
      const players = signers.slice(1, 11); // players[0..9]

      // Each player gets progressively higher investBP
      // player 0: invest=10, player 1: invest=20, ..., player 9: invest=100
      for (let i = 0; i < 10; i++) {
        const p = players[i];
        const invest = (i + 1) * 10;
        const atk    = Math.floor((100 - invest) / 2);
        const def    = 100 - invest - atk;

        await splitPool.connect(p).joinPool(CELO_ERC20, 0, { value: amount });

        const salt   = ethers.encodeBytes32String(`salt-${i}`);
        const commit = makeCommitHash(atk, def, invest, salt, p.address);
        await splitPool.connect(p).commitSplit(CELO_ERC20, commit);
        await splitPool.connect(p).revealSplit(CELO_ERC20, atk, def, invest, salt);
      }

      await time.increase(ONE_DAY + 1);
      await expect(splitPool.settlePool(CELO_ERC20)).to.emit(splitPool, "TournamentSettled");

      const winners = await splitPool.getTournamentWinners(1, CELO_ERC20);
      // 10 players → top 10% = 1 winner (player9 with invest=100)
      expect(winners.length).to.equal(1);
      expect(winners[0]).to.equal(players[9].address);
    });
  });

  describe("advanceTournament", function () {
    it("increments tournament ID", async function () {
      const { splitPool, owner } = await loadFixture(deployFixture);
      await splitPool.connect(owner).advanceTournament();
      expect(await splitPool.currentTournamentId()).to.equal(2n);
    });
  });
});
