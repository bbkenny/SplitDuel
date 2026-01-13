import { expect } from "chai";
import { ethers } from "hardhat";
import { DailyReward, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DailyReward", function () {
    let dailyReward: DailyReward;
    let mockToken: MockERC20;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    const REWARD_AMOUNT = ethers.parseEther("100");

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy Mock Token
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        mockToken = await MockERC20Factory.deploy("Cat Token", "CAT") as MockERC20;

        // Deploy DailyReward
        const DailyRewardFactory = await ethers.getContractFactory("DailyReward");
        dailyReward = await DailyRewardFactory.deploy(await mockToken.getAddress(), REWARD_AMOUNT) as DailyReward;

        // Fund the DailyReward contract
        await mockToken.mint(await dailyReward.getAddress(), ethers.parseEther("10000"));
    });

    it("Should allow user to claim reward", async function () {
        await dailyReward.connect(user1).claim();
        expect(await mockToken.balanceOf(user1.address)).to.equal(REWARD_AMOUNT);
    });

    it("Should prevent double claiming within 24 hours", async function () {
        await dailyReward.connect(user1).claim();
        await expect(dailyReward.connect(user1).claim()).to.be.revertedWith("Claim available once every 24 hours");
    });

    it("Should verify canClaim status", async function () {
        expect(await dailyReward.canClaim(user1.address)).to.be.true;
        await dailyReward.connect(user1).claim();
        expect(await dailyReward.canClaim(user1.address)).to.be.false;
    });
});
