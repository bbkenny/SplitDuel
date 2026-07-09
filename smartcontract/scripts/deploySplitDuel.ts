import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// The existing AutoSplitRouter address on Mainnet
const ROUTER_ADDRESS = "0x8fd08cf9b2A54E498F1C78116A9Ad2620038B462";

async function main() {
  console.log("Starting Split Duel Game Mechanics deployment to Celo Mainnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  // 1. Deploy DuelManager
  console.log("\nDeploying DuelManager...");
  const DuelManager = await ethers.getContractFactory("DuelManager");
  const duelManager = await DuelManager.deploy(ROUTER_ADDRESS);
  await duelManager.waitForDeployment();
  const duelManagerAddress = await duelManager.getAddress();
  console.log("✅ DuelManager deployed to:", duelManagerAddress);

  // 2. Deploy SplitPool (Tournament Engine)
  console.log("\nDeploying SplitPool...");
  const SplitPool = await ethers.getContractFactory("SplitPool");
  const splitPool = await SplitPool.deploy();
  await splitPool.waitForDeployment();
  const splitPoolAddress = await splitPool.getAddress();
  console.log("✅ SplitPool deployed to:", splitPoolAddress);

  console.log("\n--- Deployment Complete ---");
  console.log(`DuelManager: ${duelManagerAddress}`);
  console.log(`SplitPool: ${splitPoolAddress}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
