import hre from "hardhat";

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying AutoSplit to network: ${networkName}`);

  let cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1".toLowerCase(); // Default to Celo Alfajores Testnet
  if (networkName === "celo") {
    cUSDAddress = "0x765DE81E75624D24eB7477D1c0308c7322F2B482".toLowerCase(); // Celo Mainnet cUSD
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
  const vaultAdapter = await VaultAdapter.deploy(cUSDAddress, "AutoSplit Vault");
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
        constructorArguments: [cUSDAddress, "AutoSplit Vault"],
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

  // Log summary
  console.log("\n==================================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log(`Network: ${networkName}`);
  console.log(`AutoSplitRouter: ${routerAddress}`);
  console.log(`VaultAdapter: ${adapterAddress}`);
  console.log(`cUSD Token: ${cUSDAddress}`);
  console.log("==================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
