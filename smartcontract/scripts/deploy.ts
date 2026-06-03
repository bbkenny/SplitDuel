import hre, { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying AutoSplit to network: ${networkName}`);

  let cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1".toLowerCase(); // Default to Celo Alfajores Testnet
  if (networkName === "celo") {
    cUSDAddress = "0x765de816845861e75a25fca122bb6898b8b1282a".toLowerCase(); // Celo Mainnet cUSD
  }

  console.log(`Using cUSD Address: ${cUSDAddress}`);

  console.log("Deploying AutoSplitRouter...");
  const AutoSplitRouter = await hre.ethers.getContractFactory("AutoSplitRouter");
  const autoSplitRouter = await AutoSplitRouter.deploy();
  await autoSplitRouter.waitForDeployment();
  const routerAddress = await autoSplitRouter.getAddress();
  console.log(`AutoSplitRouter deployed to: ${routerAddress}`);

  console.log("Deploying VaultAdapter...");
  const VaultAdapter = await hre.ethers.getContractFactory("VaultAdapter");
  const vaultAdapter = await VaultAdapter.deploy("AutoSplit Vault");
  await vaultAdapter.waitForDeployment();
  const adapterAddress = await vaultAdapter.getAddress();
  console.log(`VaultAdapter deployed to: ${adapterAddress}`);

  console.log("Authorizing VaultAdapter in AutoSplitRouter...");
  const authTx = await autoSplitRouter.setVaultAdapter(adapterAddress, true);
  await authTx.wait(1);
  console.log("VaultAdapter authorized in Router.");

  // Wait for block confirmations before verification
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("Waiting for block confirmations...");
    await autoSplitRouter.deploymentTransaction()?.wait(5);
    await vaultAdapter.deploymentTransaction()?.wait(5);

    console.log("Verifying AutoSplitRouter...");
    try {
      await hre.run("verify:verify", {
        address: routerAddress,
        constructorArguments: [],
      });
      console.log("AutoSplitRouter verified successfully!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("AutoSplitRouter is already verified!");
      } else {
        console.log("AutoSplitRouter verification failed:", error);
      }
    }

    console.log("Verifying VaultAdapter...");
    try {
      await hre.run("verify:verify", {
        address: adapterAddress,
        constructorArguments: ["AutoSplit Vault"],
      });
      console.log("VaultAdapter verified successfully!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("VaultAdapter is already verified!");
      } else {
        console.log("VaultAdapter verification failed:", error);
      }
    }
  }

  // Read deployed governance defaults from contract
  const apyBasisPoints = await autoSplitRouter.apyBasisPoints();
  const loanInterestBps = await autoSplitRouter.loanInterestBps();
  const creditMultiplier = await autoSplitRouter.creditMultiplier();
  const deployer = (await ethers.getSigners())[0];
  const network = await ethers.provider.getNetwork();

  // Log summary
  console.log("\n==================================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log(`Network:           ${networkName} (Chain ID: ${network.chainId})`);
  console.log(`Deployer:          ${deployer.address}`);
  console.log(`AutoSplitRouter:   ${routerAddress}`);
  console.log(`VaultAdapter:      ${adapterAddress}`);
  console.log(`cUSD Token:        ${cUSDAddress}`);
  console.log("--- Governance Defaults ---");
  console.log(`apyBasisPoints:    ${apyBasisPoints} (${Number(apyBasisPoints) / 100}% APY)`);
  console.log(`loanInterestBps:   ${loanInterestBps} (${Number(loanInterestBps) / 100}% loan interest)`);
  console.log(`creditMultiplier:  ${creditMultiplier}x tokens per reputation point`);
  console.log("==================================================\n");

  // Save deployment record
  const deploymentData = {
    network: networkName,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AutoSplitRouter: {
        address: routerAddress,
        transactionHash: autoSplitRouter.deploymentTransaction()?.hash ?? "",
      },
      VaultAdapter: {
        address: adapterAddress,
        transactionHash: vaultAdapter.deploymentTransaction()?.hash ?? "",
        constructorArgs: ["AutoSplit Vault"],
      },
    },
    governanceDefaults: {
      apyBasisPoints: apyBasisPoints.toString(),
      loanInterestBps: loanInterestBps.toString(),
      creditMultiplier: creditMultiplier.toString(),
    },
    tokens: { cUSD: cUSDAddress },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, "deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("✅ Deployment record saved to deployments/deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
