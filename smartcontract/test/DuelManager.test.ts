import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCommitHash(
  attackPct: number,
  defendPct: number,
  investPct: number,
  salt: string,
  sender: string
): string {
  return ethers.keccak256(
    ethers.solidityPacked(
      ["uint8", "uint8", "uint8", "bytes32", "address"],
      [attackPct, defendPct, investPct, salt, sender]
    )
  );
}

const ZERO = ethers.ZeroAddress;
const STAKE = ethers.parseEther("0.5");

// ─── Fixture ──────────────────────────────────────────────────────────────────
async function deployFixture() {
  const [owner, player1, player2, player3] = await ethers.getSigners();

  // Deploy a mock router (returns reputationScore = 0 for everyone)
  const MockRouter = await ethers.getContractFactory("MockRouter");
  const mockRouter = await MockRouter.deploy();

  const DuelManager = await ethers.getContractFactory("DuelManager");
  const duelManager = await DuelManager.deploy(await mockRouter.getAddress());

  return { duelManager, mockRouter, owner, player1, player2, player3 };
}

// ─── DuelManager Test Suite ───────────────────────────────────────────────────
describe("DuelManager", function () {

  describe("Deployment", function () {
    it("sets admin to deployer", async function () {
      const { duelManager, owner } = await loadFixture(deployFixture);
      expect(await duelManager.admin()).to.equal(owner.address);
    });

    it("sets REVEAL_WINDOW to 60", async function () {
      const { duelManager } = await loadFixture(deployFixture);
      expect(await duelManager.REVEAL_WINDOW()).to.equal(60n);
    });
  });

  describe("Admin transferability", function () {
    it("allows two-step admin transfer", async function () {
      const { duelManager, owner, player1 } = await loadFixture(deployFixture);
      await duelManager.connect(owner).transferAdmin(player1.address);
      expect(await duelManager.pendingAdmin()).to.equal(player1.address);
      await duelManager.connect(player1).acceptAdmin();
      expect(await duelManager.admin()).to.equal(player1.address);
    });

    it("rejects non-pending-admin calling acceptAdmin", async function () {
      const { duelManager, owner, player1, player2 } = await loadFixture(deployFixture);
      await duelManager.connect(owner).transferAdmin(player1.address);
      await expect(duelManager.connect(player2).acceptAdmin())
        .to.be.revertedWith("ERR: Not pending admin");
    });

    it("non-admin cannot call transferAdmin", async function () {
      const { duelManager, player1, player2 } = await loadFixture(deployFixture);
      await expect(duelManager.connect(player1).transferAdmin(player2.address))
        .to.be.revertedWith("ERR: Not admin");
    });
  });

  describe("createDuel", function () {
    it("creates a duel and deposits native CELO", async function () {
      const { duelManager, player1 } = await loadFixture(deployFixture);
      await expect(
        duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE })
      ).to.emit(duelManager, "DuelCreated");

      const d = await duelManager.getDuel(1);
      expect(d.player1).to.equal(player1.address);
      expect(d.stakePerPlayer).to.equal(STAKE);
      expect(d.state).to.equal(0); // Open
    });

    it("rejects mismatched msg.value", async function () {
      const { duelManager, player1 } = await loadFixture(deployFixture);
      await expect(
        duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE / 2n })
      ).to.be.revertedWith("ERR: msg.value must equal stake");
    });

    it("prevents player from creating two duels simultaneously", async function () {
      const { duelManager, player1 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await expect(
        duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE })
      ).to.be.revertedWith("ERR: Already in a duel");
    });
  });

  describe("joinDuel", function () {
    it("player2 can join an open duel", async function () {
      const { duelManager, player1, player2 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await expect(
        duelManager.connect(player2).joinDuel(1, { value: STAKE })
      ).to.emit(duelManager, "DuelJoined");

      const d = await duelManager.getDuel(1);
      expect(d.player2).to.equal(player2.address);
      expect(d.state).to.equal(1); // Active
      expect(d.currentRound).to.equal(1);
    });

    it("player1 cannot join their own duel", async function () {
      const { duelManager, player1 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await expect(
        duelManager.connect(player1).joinDuel(1, { value: STAKE })
      ).to.be.revertedWith("ERR: Already in a duel");
    });

    it("cannot join a non-open duel", async function () {
      const { duelManager, player1, player2, player3 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await duelManager.connect(player2).joinDuel(1, { value: STAKE });
      await expect(
        duelManager.connect(player3).joinDuel(1, { value: STAKE })
      ).to.be.revertedWith("ERR: Duel not open");
    });
  });

  describe("cancelDuel", function () {
    it("player1 can cancel an open duel and get stake back", async function () {
      const { duelManager, player1 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });

      const balBefore = await ethers.provider.getBalance(player1.address);
      const tx = await duelManager.connect(player1).cancelDuel(1);
      const receipt = await tx.wait();
      const gas = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(player1.address);

      expect(balAfter + gas - balBefore).to.be.closeTo(STAKE, ethers.parseEther("0.001"));

      const d = await duelManager.getDuel(1);
      expect(d.state).to.equal(3); // Cancelled
    });

    it("cannot cancel an active duel", async function () {
      const { duelManager, player1, player2 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await duelManager.connect(player2).joinDuel(1, { value: STAKE });
      await expect(
        duelManager.connect(player1).cancelDuel(1)
      ).to.be.revertedWith("ERR: Can only cancel open duels");
    });
  });

  describe("commitRound + revealRound — full 5-round duel", function () {
    const SALT1 = ethers.encodeBytes32String("salt-p1-round1");
    const SALT2 = ethers.encodeBytes32String("salt-p2-round1");

    async function startActiveDuel() {
      const fixture = await loadFixture(deployFixture);
      const { duelManager, player1, player2 } = fixture;
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await duelManager.connect(player2).joinDuel(1, { value: STAKE });
      return { ...fixture, duelId: 1 };
    }

    it("emits RoundCommitted when both commit", async function () {
      const { duelManager, player1, player2, duelId } = await startActiveDuel();
      const h1 = makeCommitHash(50, 30, 20, SALT1, player1.address);
      const h2 = makeCommitHash(20, 40, 40, SALT2, player2.address);

      await expect(duelManager.connect(player1).commitRound(duelId, h1))
        .to.emit(duelManager, "RoundCommitted");
      await expect(duelManager.connect(player2).commitRound(duelId, h2))
        .to.emit(duelManager, "RoundCommitted");

      const rc = await duelManager.getRoundCommit(duelId, 1);
      expect(rc.bothCommittedAt).to.be.gt(0n);
    });

    it("cannot reveal before both have committed", async function () {
      const { duelManager, player1, duelId } = await startActiveDuel();
      const h1 = makeCommitHash(50, 30, 20, SALT1, player1.address);
      await duelManager.connect(player1).commitRound(duelId, h1);

      await expect(
        duelManager.connect(player1).revealRound(duelId, 50, 30, 20, SALT1)
      ).to.be.revertedWith("ERR: Both players must commit first");
    });

    it("rejects reveal with wrong hash", async function () {
      const { duelManager, player1, player2, duelId } = await startActiveDuel();
      const h1 = makeCommitHash(50, 30, 20, SALT1, player1.address);
      const h2 = makeCommitHash(20, 40, 40, SALT2, player2.address);
      await duelManager.connect(player1).commitRound(duelId, h1);
      await duelManager.connect(player2).commitRound(duelId, h2);

      await expect(
        duelManager.connect(player1).revealRound(duelId, 60, 20, 20, SALT1) // wrong values
      ).to.be.revertedWith("ERR: Reveal hash does not match commit");
    });

    it("resolves round after both reveal and advances round counter", async function () {
      const { duelManager, player1, player2, duelId } = await startActiveDuel();
      const h1 = makeCommitHash(50, 30, 20, SALT1, player1.address);
      const h2 = makeCommitHash(20, 40, 40, SALT2, player2.address);
      await duelManager.connect(player1).commitRound(duelId, h1);
      await duelManager.connect(player2).commitRound(duelId, h2);
      await duelManager.connect(player1).revealRound(duelId, 50, 30, 20, SALT1);
      await expect(
        duelManager.connect(player2).revealRound(duelId, 20, 40, 40, SALT2)
      ).to.emit(duelManager, "RoundResolved");

      const d = await duelManager.getDuel(duelId);
      expect(d.currentRound).to.equal(2); // advanced to round 2
    });

    it("completes full 5-round duel and resolves with principal returned", async function () {
      const { duelManager, player1, player2, duelId } = await startActiveDuel();

      // Seed contract with CELO so the simulated yield prize distribution doesn't run out of balance
      await player1.sendTransaction({ to: await duelManager.getAddress(), value: ethers.parseEther("1") });

      // Play all 5 rounds — p1 always invests heavy to build yield score
      for (let round = 1; round <= 5; round++) {
        const salt1 = ethers.encodeBytes32String(`s1-r${round}`);
        const salt2 = ethers.encodeBytes32String(`s2-r${round}`);

        // p1: 0 attack, 10 defend, 90 invest → grows fast
        // p2: 90 attack, 5 defend, 5 invest → aggressive but low growth
        const h1 = makeCommitHash(0, 10, 90, salt1, player1.address);
        const h2 = makeCommitHash(90, 5, 5, salt2, player2.address);

        await duelManager.connect(player1).commitRound(duelId, h1);
        await duelManager.connect(player2).commitRound(duelId, h2);
        await duelManager.connect(player1).revealRound(duelId, 0, 10, 90, salt1);
        await duelManager.connect(player2).revealRound(duelId, 90, 5, 5, salt2);
      }

      const d = await duelManager.getDuel(duelId);
      expect(d.state).to.equal(2); // Resolved
      expect(await duelManager.activeDuel(player1.address)).to.equal(0n);
      expect(await duelManager.activeDuel(player2.address)).to.equal(0n);
    });
  });

  describe("forfeitRound (reveal window timeout)", function () {
    it("applies penalty to non-revealer after REVEAL_WINDOW expires", async function () {
      const { duelManager, player1, player2, owner } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await duelManager.connect(player2).joinDuel(1, { value: STAKE });

      const salt1 = ethers.encodeBytes32String("forfeit-salt1");
      const salt2 = ethers.encodeBytes32String("forfeit-salt2");
      const h1 = makeCommitHash(30, 30, 40, salt1, player1.address);
      const h2 = makeCommitHash(30, 30, 40, salt2, player2.address);

      // Both commit, only p1 reveals, window expires
      await duelManager.connect(player1).commitRound(1, h1);
      await duelManager.connect(player2).commitRound(1, h2);
      await duelManager.connect(player1).revealRound(1, 30, 30, 40, salt1);

      // Advance time past REVEAL_WINDOW
      await time.increase(65);

      await expect(duelManager.connect(owner).forfeitRound(1))
        .to.emit(duelManager, "RoundForfeited");
    });

    it("reverts forfeitRound if window is still open", async function () {
      const { duelManager, player1, player2 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await duelManager.connect(player2).joinDuel(1, { value: STAKE });

      const h1 = makeCommitHash(30, 30, 40, ethers.encodeBytes32String("s1"), player1.address);
      const h2 = makeCommitHash(30, 30, 40, ethers.encodeBytes32String("s2"), player2.address);
      await duelManager.connect(player1).commitRound(1, h1);
      await duelManager.connect(player2).commitRound(1, h2);

      await expect(duelManager.connect(player1).forfeitRound(1))
        .to.be.revertedWith("ERR: Reveal window still open");
    });
  });

  describe("revealRound — rejects after window", function () {
    it("rejects reveal after REVEAL_WINDOW has expired", async function () {
      const { duelManager, player1, player2 } = await loadFixture(deployFixture);
      await duelManager.connect(player1).createDuel(ZERO, STAKE, { value: STAKE });
      await duelManager.connect(player2).joinDuel(1, { value: STAKE });

      const salt1 = ethers.encodeBytes32String("late-s1");
      const salt2 = ethers.encodeBytes32String("late-s2");
      const h1 = makeCommitHash(30, 30, 40, salt1, player1.address);
      const h2 = makeCommitHash(30, 30, 40, salt2, player2.address);
      await duelManager.connect(player1).commitRound(1, h1);
      await duelManager.connect(player2).commitRound(1, h2);

      await time.increase(65); // past reveal window

      await expect(
        duelManager.connect(player1).revealRound(1, 30, 30, 40, salt1)
      ).to.be.revertedWith("ERR: Reveal window expired. Call forfeitRound() instead");
    });
  });
});
