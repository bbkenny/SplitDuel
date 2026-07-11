const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");
    const splitDeployer = "0x6C150Cbd3C9Fe63F2ca7D58b1939e77A8299D48c".toLowerCase();
    const popDeployer = "0xC1e4453d98fEe92504A2dC2114e6613053880A30".toLowerCase();

    const splitBal = await provider.getBalance(splitDeployer);
    const popBal = await provider.getBalance(popDeployer);

    console.log(`\n=== Deployer Balances ===`);
    console.log(`SplitDuel Deployer (${splitDeployer}): ${ethers.formatEther(splitBal)} CELO`);
    console.log(`PayOrPass Deployer (${popDeployer}): ${ethers.formatEther(popBal)} CELO`);

    console.log(`\n=== Interaction Wallets (0-5) ===`);
    const mnemonic = process.env.INTERACTION_MNEMONIC;
    if (!mnemonic) {
        console.log("No INTERACTION_MNEMONIC found in .env");
    } else {
        const root = ethers.HDNodeWallet.fromPhrase(mnemonic);
        for (let i = 0; i <= 5; i++) {
            const wallet = root.derivePath(`m/44'/60'/0'/0/${i}`);
            const bal = await provider.getBalance(wallet.address);
            console.log(`Index ${i} (${wallet.address}): ${ethers.formatEther(bal)} CELO`);
        }
    }
}

main().catch(console.error);

main().catch(console.error);
