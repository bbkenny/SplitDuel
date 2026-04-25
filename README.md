# AutoSplit

<div align="center">

![AutoSplit](https://img.shields.io/badge/AutoSplit-Protocol-8FA828?style=for-the-badge&logo=ethereum&logoColor=white)

[![Network](https://img.shields.io/badge/Celo-Testnet-16D14E?style=flat-square&logo=celo)](https://celo.org)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Miniapp](https://auto-split.vercel.app) · [GitHub](https://github.com/bbkenny/autosplit)**

</div>

---

> **The Problem:** Payments today are manual, trust-based, and non-conditional. Users rely on verbal agreements, manual follow-ups, and third-party intermediaries — creating friction, disputes, and inefficiency.
> 
> **The Solution:** AutoSplit is an intent-based payment protocol that allows users to define conditions under which funds are automatically executed on-chain. Instead of sending money immediately, users define rules — and the protocol enforces them.

---

## 🎯 Overview

AutoSplit transforms **user intent** into **enforceable on-chain payment logic**:

- "Send when delivery is confirmed"
- "Pay every Friday"  
- "Release funds after milestone completion"

The system holds funds in escrow, monitors conditions, and executes automatically — no intermediaries, no manual intervention.

---

## 🧩 Core Features

### 1. Payment Routing Engine
- Input: amount + routing rules
- Output: automatic distribution
- Example:

100 cUSD →
  50 to recipient
  30 to savings vault
  20 to yield strategy

### 2. Rule Configuration
Users define:
- Percentage splits
- Destination addresses
- Optional yield allocation

### 3. Vault Integration (Optional)
- Connect to DeFi protocols (e.g. Aave-like)
- Route funds into yield strategies

### 4. One-Click Execution
- Single transaction handles all logic
- No multi-step flows

### 5. Transaction Transparency
- Display breakdown before execution
- Show post-transaction distribution

---

## 🧩 User Flow
1. User inputs amount
2. User defines split rules
3. System calculates distribution
4. User confirms transaction
5. Smart contract executes routing
6. UI displays results

---

## 🏗️ Technical Architecture

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Smart Contracts** | Solidity 0.8.20, Hardhat | Conditional payments, escrow, condition registry |
| **Frontend** | Next.js 16, React 19, Tailwind | Mobile-first miniapp UI |
| **Network** | Celo (Alfajores) | EVM-compatible, mobile-first L2 |

### Smart Contracts

#### `PaymentRouter.sol`
- Accepts funds
- Applies split logic
- Executes transfers

#### `VaultAdapter.sol` (optional)
- Integrates with DeFi protocols
- Handles deposits

---

## 🔐 Security Considerations
- Reentrancy protection
- Input validation (percentages ≤ 100%)
- Safe transfer patterns
- Access control (user-specific configs)

---

## 📊 Success Metrics
- Number of transactions executed
- Total volume routed (cUSD)
- Number of active users
- Average splits per transaction
- Vault participation rate

---

## 🚀 MVP Scope
- Basic split routing
- Fixed percentage rules
- Single recipient + optional vault
- Simple UI

---

## 🔮 Future Enhancements
- Recurring payments
- AI-based financial suggestions
- Social/group splitting
- Multi-token support
- Farcaster miniapp integration

---

## 🧠 "Wow" Moment
User sends money once → sees it automatically:
- Delivered
- Saved
- Invested

---

## ⚠️ Risks
- Overcomplication of UI
- Low user understanding of splits
- Integration complexity with DeFi

---

## ✅ Out of Scope (MVP)
- Cross-chain routing
- Advanced analytics dashboards
- Token swapping

---

## 📌 Positioning
AutoSplit is not a wallet.

It is: 👉 A programmable payment primitive for stablecoins.

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm/yarn
- Celo Alfajores testnet funds

### Smart Contracts

```bash
cd smartcontract

# Install dependencies
npm install

# Compile
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Celo Alfajores
npx hardhat run scripts/deploy.js --network alfajores
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Configuration
Contract addresses are configured in `frontend/lib/constants.ts`:

```typescript
export const PAYMENT_FACTORY_ADDRESS = "0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c" // Celo Mainnet
```

### Deployed Addresses

| Network | PaymentFactory | Block Explorer |
|---------|---------------|----------------|
| Celo Mainnet | `0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c` | [celoscan.io](https://celoscan.io/address/0x8D6259A4138032Df3FB6594012ff38Db1d1aB96c) |
| Celo Alfajores | *(deploy when ready)* | — |

To deploy to Alfajores testnet:
```bash
npx hardhat run scripts/deploy.ts --network celoAlfajores
```

---

## 📄 License

MIT © AutoSplit Protocol
