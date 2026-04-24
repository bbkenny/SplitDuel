import { ethers, run } from "hardhat";

async function main() {
  console.log("Deploying AutoSplitRouter...");

  const AutoSplitRouter = await ethers.getContractFactory("AutoSplitRouter");
  const autoSplitRouter = await AutoSplitRouter.deploy();

  await autoSplitRouter.waitForDeployment();

  const routerAddress = await autoSplitRouter.getAddress();
  console.log(`AutoSplitRouter deployed to: ${routerAddress}`);

  console.log("Deploying VaultAdapter...");
  const VaultAdapter = await ethers.getContractFactory("VaultAdapter");
  const vaultAdapter = await VaultAdapter.deploy(
    ethers.ZeroAddress,
    "AutoSplit Vault"
  );

  await vaultAdapter.waitForDeployment();

  const adapterAddress = await vaultAdapter.getAddress();
  console.log(`VaultAdapter deployed to: ${adapterAddress}`);

  // Wait for block confirmations before verification
  if (process.env.HARDHAT_NETWORK !== "hardhat" && process.env.HARDHAT_NETWORK !== "localhost") {
    console.log("Waiting for block confirmations...");
    await autoSplitRouter.deploymentTransaction()?.wait(5);
    await vaultAdapter.deploymentTransaction()?.wait(5);

    console.log("Verifying contracts...");
    try {
      await run("verify:verify", {
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

    try {
      await run("verify:verify", {
        address: adapterAddress,
        constructorArguments: [ethers.ZeroAddress, "AutoSplit Vault"],
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

  // Save addresses for frontend
  const fs = require("fs");
  const addresses = {
    celo: {
      AUTO_SPLIT_ROUTER: routerAddress,
      VAULT_ADAPTER: adapterAddress,
    },
    celoAlfajores: {
      AUTO_SPLIT_ROUTER: routerAddress,
      VAULT_ADAPTER: adapterAddress,
    },
  };

  fs.writeFileSync(
    "../frontend/src/lib/deployed-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Addresses saved to frontend/src/lib/deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
