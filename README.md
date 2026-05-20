# AutoSplit — Automated Payment Routing Protocol

<div align="center">

![AutoSplit](https://img.shields.io/badge/AutoSplit-Protocol-022D2B?style=for-the-badge&logo=ethereum&logoColor=white)

[![Network](https://img.shields.io/badge/Celo-Mainnet-16D14E?style=flat-square&logo=celo)](https://celo.org)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Miniapp](https://auto-splits.vercel.app) · [GitHub](https://github.com/bbkenny/autosplit)**

</div>

---

> **The Problem:** Sending money today is fragmented and manual. Users have to manually split payments between family, savings, and business obligations, creating friction and missing opportunities for automatic yield.
> 
> **The Solution:** AutoSplit is a programmable payment primitive for stablecoins. It allows one transaction to result in multiple financial outcomes — automatically splitting, saving, and investing in real time.

---

## 🎯 Overview

AutoSplit transforms a **single send** into a **diversified financial action**:

- **Split & Pay:** Direct 50% to a recipient and 50% to another.
- **Save & Invest:** Route a percentage of every incoming payment into a savings vault.
- **Business Automation:** Automatically set aside tax or operating expenses from revenue.

The system uses a smart contract router to execute all distributions in a single atomic transaction.

---

## 🧩 Core Features

### 1. Payment Routing Engine
- Supports percentage-based split rules (basis points).
- Precision-based distribution (prevents dust accumulation).
- Supports direct ERC20 transfers and Vault Adapter routing.

### 2. Rule Configuration
- Users define their own split destinations.
- Mapping of up to 10 recipients per user (gas optimized).
- Real-time preview of payment distribution.

### 3. Vault Integration
- `VaultAdapter.sol` interface for yield protocols.
- 1:1 share accounting (MVP implementation).
- Automatic yield generation for routed portions.

### 4. Safety & Efficiency
- Zero-amount validation.
- Basis point math (10000 = 100%).
- Atomic execution — all splits happen or none do.

---

## 🏗️ Architecture

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin | Payment routing, vault adapters, ownership |
| **Frontend** | Next.js 15, Tailwind, Reown AppKit | Mobile-first dashboard & rule builder |
| **Network** | Celo (Mainnet & Alfajores) | High-speed, low-fee stablecoin infrastructure |

### Smart Contracts

#### `AutoSplitRouter.sol`
- Main entry point for routed payments.
- Manages user-specific split rules.
- Executes multi-transfer logic.

#### `VaultAdapter.sol`
- Standardized bridge to yield protocols.
- Handles deposits/withdrawals for routed funds.

---

## 🎨 Frontend Dashboard

Professional, mobile-first interface designed for clarity:

- **Configure Rules:** Set your default split percentages and recipients.
- **Execute Payment:** Input amount and watch the protocol route your funds.
- **View History:** Track your total volume and transaction count.
- **Portfolio Preview:** Real-time calculation of where your money goes.

## 🔗 Deployed Contracts (Celo Mainnet)

The AutoSplit Protocol is successfully deployed on Celo Mainnet:

*   **AutoSplitRouter**: [`0x8774Fdee9fBde0B2D855CB5B929590EF57930231`](https://celoscan.io/address/0x8774Fdee9fBde0B2D855CB5B929590EF57930231)
*   **VaultAdapter (Multi-Token)**: [`0x565c7EfBB49895a66fBA203401d4E2623B2FE5c2`](https://celoscan.io/address/0x565c7EfBB49895a66fBA203401d4E2623B2FE5c2)
*   **Supported Tokens**: Natively supports routing and vaulting of **both cUSD stablecoin and native CELO**!

> 💡 **On-Chain Vault Authorization**: The multi-token `VaultAdapter` has been fully authorized inside the `AutoSplitRouter` on-chain (via `setVaultAdapter(0x565c7EfBB49895a66fBA203401d4E2623B2FE5c2, true)`), enabling instant vault routing out-of-the-box.

---

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm/yarn
- Celo testnet funds (cUSD/cEUR)

### Setup

```bash
# Clone
git clone https://github.com/bbkenny/autosplit
cd autosplit

# Install all dependencies
npm install
```

### Smart Contract Management

```bash
cd smartcontract
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network celo
```

### Frontend Development

```bash
cd frontend
npm run dev
```

---

## 🔐 Security

- **Reentrancy Guards:** Strictly enforced on all state-changing functions.
- **Checks-Effects-Interactions (CEI):** Compliance throughout routing logic.
- **Pull over Push:** Safe fund withdrawal patterns for vault adapters.
- **Non-Custodial:** The router only handles funds during the transaction lifecycle.

---

## 🔗 Links

- [Live Application](https://auto-splits.vercel.app/)
- [Smart Contract Code](https://github.com/bbkenny/autosplit/tree/main/smartcontract)
- [Celo Documentation](https://docs.celo.org/)

---

### 📄 License

MIT © AutoSplit Protocol
 
