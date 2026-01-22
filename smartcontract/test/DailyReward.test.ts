import { expect } from "chai";
import { ethers } from "hardhat";
import { DailyReward } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DailyReward", function () {
    let dailyReward: DailyReward;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    const REWARD_AMOUNT = ethers.parseEther("100");
    const DUMMY_CAT_TOKEN = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy DailyReward with dummy address
        const DailyRewardFactory = await ethers.getContractFactory("DailyReward");
        dailyReward = await DailyRewardFactory.deploy(DUMMY_CAT_TOKEN, REWARD_AMOUNT) as DailyReward;
    });

    it("Should be deployed with dummy address", async function () {
        expect(await dailyReward.catToken()).to.equal(DUMMY_CAT_TOKEN);
    });

    it("Should verify canClaim status", async function () {
        expect(await dailyReward.canClaim(user1.address)).to.be.true;
    });
});
