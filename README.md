# AutoSplit

The elite Programmable Revenue Router on Celo.

One Address → Many Outcomes. Instantly split incoming revenue among your team, creators, or DAO, while automatically diverting a percentage into a yield-generating shared treasury. No accountants. No spreadsheets.

## How it works

### 1. Split Matrix Configurations
This section replaces traditional static transfers with dynamic routing.
* **Add Destination:** Click this to create a new split recipient. You can add as many as you want.
* **Recipient Address:** Enter the `0x...` address for each destination.
* **Share (%):** Define the exact percentage of the incoming transfer each address should receive. *Important:* The sum of all splits must exactly equal 100%.
* **Vault Toggle (Yield Treasury):** By toggling the switch next to an address, you convert it from a "Direct Transfer" to "Routing to Yield Treasury." This automatically diverts those funds into compound savings instead of sending them to the wallet.
* **Save On-Chain:** Once configured, clicking this saves your exact split matrix into the smart contract permanently.

### 2. Execute Routing
* **Route Payment:** Once your rules are saved on-chain, you use this execution panel. Input a total amount and select an asset (CELO or cUSD).
* When you click **Execute Routing**, the smart contract instantly distributes the funds to the various recipients and diverts the specified percentage directly into the Shared Treasury.

### 3. Shared Treasury (Compound Yield Severance Fund)
* This widget tracks the balances (cUSD and CELO) that you've routed into the compound treasury vault. 
* **Vault Interactions:** You can manually deposit more funds or withdraw your existing savings anytime. It explicitly states the simulated yield (e.g., 4.5% APY).
