# AutoSplit — The Decentralized Mobile Credit Union & Yield Router

<div align="center">

![AutoSplit](https://img.shields.io/badge/AutoSplit-DeFi_Credit_Union-022D2B?style=for-the-badge&logo=ethereum&logoColor=white)

[![Network](https://img.shields.io/badge/Celo-Mainnet-16D14E?style=flat-square&logo=celo)](https://celo.org)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Miniapp](https://auto-splits.vercel.app) · [GitHub](https://github.com/bbkenny/autosplit)**

</div>

---

> **The Problem:** In digital economies, managing collaborative revenue and shared treasuries is a painful, manual process requiring spreadsheets and trust. 
> 
> **The Solution:** AutoSplit v2.0 introduces a **Programmable Revenue Router** — "One address → many outcomes." Instantly route incoming revenue among collaborators while automatically diverting a percentage into a yield-generating shared treasury.

---

## 🌐 Deployed Contracts (Celo Mainnet)

* **AutoSplitRouter:** [`0x8fd08cf9b2A54E498F1C78116A9Ad2620038B462`](https://celoscan.io/address/0x8fd08cf9b2A54E498F1C78116A9Ad2620038B462)
* **VaultAdapter:** [`0xCc070bBDF79AD0Ef42747BCB7AD349708Ee19161`](https://celoscan.io/address/0xCc070bBDF79AD0Ef42747BCB7AD349708Ee19161)

---

## 🎯 Overview

AutoSplit acts as production-grade infrastructure for teams, DAOs, creators, and agencies:
- **Programmable Routing Engine:** Split native `CELO` or ERC-20 `cUSD` payments dynamically across a recipient matrix in a single atomic transaction.
- **DeFi Shared Treasury:** Auto-route split percentages directly into a Vault that compounds interest dynamically.

---

## 🏗️ Architecture

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin | Payment routing, yield vaults, credit scoring, micro-lending |
| **Frontend** | Next.js 15, Tailwind, Wagmi / Viem | Mobile-first DeFi Credit Union Dashboard |
| **Network** | Celo (Mainnet & Alfajores) | 5-second blocks, sub-penny gas stablecoin infrastructure |

### Smart Contracts

#### `AutoSplitRouter.sol`
- Core payment splitting matrix.
- Generates dynamic credit scoring reputation and compounding interest.
- Manages under-collateralized micro-lending borrows and repayments.

#### `VaultAdapter.sol`
- Bridged asset custody vault for routed deposits.

---

## 🎨 Frontend Dashboard

Professional, mobile-first interface designed for Opera **MiniPay** and **Valora**:

- **Routing Matrix Builder:** Setup percentages (basis points) and recipients.
- **Reputation Hub:** View your live credit points, rating tiers (Bronze, Gold, Elite), and borrow limit.
- **Growth Savings Vault:** Deposit or withdraw directly to see savings compound in real-time.
- **Micro-Credit Hub:** Request micro-loans and execute one-tap loan repayments.
- **Secure Admin Panel:** An owner-gated dashboard available only to the contract deployer, featuring UI controls for dynamic APY adjustments, loan interest fee tuning, and credit multiplier configurations.

---

## 🚀 Development & Setup

### Setup
```bash
git clone https://github.com/bbkenny/autosplit
cd autosplit
npm install
```

### Smart Contract Compilation & Testing
```bash
cd smartcontract
npx hardhat compile
npx hardhat test
```

### Frontend Development
```bash
cd frontend
npm run dev
```

---

## 🔐 Security
- **Non-Custodial Integrity:** Assets are held in an authorized `VaultAdapter` separating custody from routing rules.
- **NonReentrant Protection:** Strictly guarded against reentrancy vectors during borrows and withdrawals.
- **Legacy Transaction Constraints:** Configured with legacy transaction types for native MiniPay EIP-1559 compatibility.

---

## ⚠️ Yield Implementation Note

The **4.5% APY** displayed in the Growth Vault is currently **simulated yield** — it is computed entirely on-chain using elapsed block timestamps inside `AutoSplitRouter.sol` via a virtual share price formula. There is **no external DeFi protocol connected** (e.g., no Ubeswap LP, no Mento reserve integration).

This is intentional for the current MVP build and provides a realistic demo of how yield accrual would behave. The roadmap for real yield integration includes:
- **Phase 2:** Ubeswap liquidity pool routing for cUSD deposits
- **Phase 3:** Mento reserve yield or tokenized RWA vaults on Celo

Until then, all APY figures shown are **projections based on the internal compounding formula**, not actual earned yield from an external source.

---

### 📄 License
MIT © AutoSplit Protocol
