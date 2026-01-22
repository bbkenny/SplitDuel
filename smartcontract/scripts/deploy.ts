import { ethers, run } from "hardhat";

async function main() {
  console.log("Starting deployment of DailyReward...");

  // Placeholder for CAT Token Address (Address Zero for now)
  const CAT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
  const REWARD_AMOUNT = ethers.parseEther("100");

  const DailyReward = await ethers.getContractFactory("DailyReward");
  const dailyReward = await DailyReward.deploy(CAT_TOKEN_ADDRESS, REWARD_AMOUNT);

  await dailyReward.waitForDeployment();

  const address = await dailyReward.getAddress();
  console.log(`DailyReward deployed to: ${address}`);

  // Wait for block confirmations before verification
  if (process.env.HARDHAT_NETWORK !== "hardhat" && process.env.HARDHAT_NETWORK !== "localhost") {
    console.log("Waiting for block confirmations...");
    await dailyReward.deploymentTransaction()?.wait(5);

    console.log("Verifying contract...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [CAT_TOKEN_ADDRESS, REWARD_AMOUNT],
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("Contract is already verified!");
      } else {
        console.log("Verification failed:", error);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
