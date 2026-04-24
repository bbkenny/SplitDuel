# AutoSplit — Payment Routing Miniapp

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![Network](https://img.shields.io/badge/Celo-Testnet-16D14E?style=flat-square&logo=celo)](https://celo.org)

**One transaction → multiple financial outcomes.**

**[Live Miniapp](https://autosplit.vercel.app/) · [GitHub](https://github.com/bbkenny/autosplit)**

</div>

---

## 🟢 Problem Statement

Sending money today is fragmented:
- Users **manually split payments**
- Savings require **separate actions**  
- Investing requires **additional steps**

This creates friction for gig workers, DAOs, and users managing multiple obligations with stablecoins.

---

## 💡 Solution

**AutoSplit** — A smart contract-based payment router that automatically splits and routes stablecoin transactions in a single action.

**Send once → money splits, saves, and routes instantly.**

---

## 🏗️ Architecture

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Smart Contracts** | Solidity 0.8.20, Hardhat | AutoSplitRouter, VaultAdapter |
| **Frontend** | Next.js 14, React 18, Tailwind | Split config & execution UI |
| **Network** | Celo Alfajores | EVM-compatible stablecoin L2 |

### Smart Contracts

#### 🚦 AutoSplitRouter.sol
- Accepts stablecoin payments
- Applies user-defined percentage splits
- Routes to recipients or vault adapters
- Single-transaction execution

#### 🏦 VaultAdapter.sol  
- Optional vault integration for yield
- Handles token deposits/withdrawals
- 1:1 share accounting (MVP)
- Emergency admin controls

---

## 🎯 Key Features

- **Multi-Recipient Routing**: Split to multiple addresses in one tx
- **Vault Integration**: Route portions to yield protocols
- **Custom Rules**: Define percentage splits per transaction
- **Real-Time Preview**: See distribution before execution
- **Gas Efficient**: Minimal overhead on Celo L2

---

## 📊 Example Flow

User sends **100 cUSD** with rules:
- 50% → Recipient (50 cUSD)
- 30% → Savings Vault (30 cUSD)  
- 20% → Yield Strategy (20 cUSD)

✅ All executed in **one transaction**

---

## 🚀 Development

### Prerequisites

- Node.js 18+
- npm/yarn

### Smart Contracts

```bash
cd smartcontract

# Install
npm install

# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy
npx hardhat run scripts/deploy.js --network alfajores
```

### Frontend

```bash
cd frontend

# Install
npm install

# Dev server
npm run dev

# Build
npm run build
```

---

## 🔐 Security

- ReentrancyGuard on all state-changing functions
- Input validation (percentages ≤ 100%)
- Safe transfer patterns (Checks-Effects-Interactions)
- Access control for admin operations

---

## 📈 MVP Scope

- Basic percentage-based split routing
- Single recipient + optional vault
- Celo stablecoin support (cUSD)
- Simple frontend interface

---

## 🔮 Future Enhancements

- Recurring payment schedules
- Multi-token support
- Social/group splitting
- Farcaster miniapp integration
- Advanced analytics dashboard

---

## 🧠 "Wow" Moment

User sends money **once** → sees it automatically:
- ✅ Delivered to recipient
- ✅ Saved in vault  
- ✅ Invested for yield

---

## 🔗 Links

- [Live Miniapp](https://autosplit.vercel.app/)
- [Smart Contracts](https://github.com/bbkenny/autosplit/tree/main/smartcontract)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)

---

### License

MIT © AutoSplit Protocol
- **$CAT Rewards:** Automated distribution of ERC-20 $CAT tokens.
- **Farcaster Integration:** Seamless login and wallet connection via Farcaster Frame/Mini App authentication.
- **Base Network:** Low-cost, fast transactions on Base Mainnet.

## Project Structure

The project follows a monorepo-style structure:

```
cat-daily-login/
├── smartcontract/       # Solidity contracts, tests, and deployment scripts
│   ├── contracts/       # DailyReward.sol
│   └── ...
│
└── frontend/           # Next.js application for the Mini App interface
    ├── components/
    └── ...
```

## Tech Stack

### Smart Contracts
- **Network:** Base Mainnet
- **Framework:** Hardhat
- **Language:** Solidity ^0.8.20
- **Standards:** ERC-20 (for $CAT token interaction)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Platform:** Farcaster Mini App (Frames v2)
- **Styling:** Tailwind CSS (Primary: #B0A5D0, Secondary: #442F8C)
- **Web3:** Wagmi, Viem, ConnectKit/RainbowKit

## Design & Aesthetic

The application uses a "Cat" themed aesthetic with the following color palette:
- **Primary:** `#B0A5D0` (Light Purple/Lavender)
- **Secondary:** `#442F8C` (Deep Purple)
- **Accents:** `White` (#FFFFFF) for text and highlights.

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd cat-daily-login
    ```

2.  **Smart Contracts**
    ```bash
    cd smartcontract
    npm install
    # Set up .env with PRIVATE_KEY and BASE_RPC_URL
    ```

3.  **Frontend**
    ```bash
    cd frontend
    npm install
    # Set up .env.local with NEXT_PUBLIC_PROJECT_ID etc.
    npm run dev
    ```

## Roadmap
- [ ] **Phase 1: MVP**
    - Smart Contract for daily distribution.
    - Basic Claim UI.
    - Farcaster Login.
- [ ] **Phase 2: Gamification**
    - Streak bonuses (e.g., extra $CAT for 7-day streaks).
    - Leaderboards.
- [ ] **Phase 3: Analytics**
    - User retention stats.
    - Total $CAT distributed.

## License
MIT
