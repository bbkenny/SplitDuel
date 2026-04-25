# PayWhen — Intent-Based Payment Protocol

<div align="center">

![PayWhen](https://img.shields.io/badge/PayWhen-Protocol-8FA828?style=for-the-badge&logo=ethereum&logoColor=white)

[![Network](https://img.shields.io/badge/Celo-Testnet-16D14E?style=flat-square&logo=celo)](https://celo.org)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[Live Miniapp](https://paywhen.vercel.app) · [GitHub](https://github.com/BitBand-Labs/paywhen)**

</div>

---

> **The Problem:** Payments today are manual, trust-based, and non-conditional. Users rely on verbal agreements, manual follow-ups, and third-party intermediaries — creating friction, disputes, and inefficiency.
> 
> **The Solution:** PayWhen is an intent-based payment protocol that allows users to define conditions under which funds are automatically executed on-chain. Instead of sending money immediately, users define rules — and the protocol enforces them.

---

## 🎯 Overview

PayWhen transforms **user intent** into **enforceable on-chain payment logic**:

- "Send when delivery is confirmed"
- "Pay every Friday"  
- "Release funds after milestone completion"

The system holds funds in escrow, monitors conditions, and executes automatically — no intermediaries, no manual intervention.

---

## 🧩 Core Features

### 1. Conditional Payment Contracts
- Create payments with custom conditions
- Funds locked securely in escrow
- Automatic execution when conditions are met
- Refund logic if conditions fail

### 2. Supported Conditions

**Time-based**
- Execute at specific timestamp
- Recurring payments (weekly/monthly)

**Manual Trigger**
- Recipient confirms delivery
- Multi-party approval flows

**Oracle-based** (Phase 2)
- GPS/location verification
- API-based external triggers

### 3. Payment Types
- One-time conditional payments
- Recurring subscriptions
- Group contributions (threshold unlock)

### 4. Escrow System
- Funds locked in audited smart contracts
- Timeout-based refunds
- Optional dispute resolution period
- Non-custodial — users always control their keys

---

## 🏗️ Architecture

| Layer | Technology | Purpose |
|-------|-----------|----------|
| **Smart Contracts** | Solidity 0.8.20, Hardhat | Conditional payments, escrow, condition registry |
| **Frontend** | Next.js 16, React 19, Tailwind | Mobile-first miniapp UI |
| **Network** | Celo (Alfajores) | EVM-compatible, mobile-first L2 |

### Smart Contracts

#### `PaymentFactory.sol`
- Creates new conditional payment contracts
- Tracks all active payments
- Manages payment lifecycle

#### `ConditionalPayment.sol`
- Core escrow contract
- Stores sender, recipient, amount, condition logic
- Handles execution, refunds, and disputes

#### `ConditionRegistry.sol` (optional)
- Standardized condition handlers
- Reusable trigger patterns

---

## 🎨 Frontend Miniapp

Lightweight, mobile-first interface:

- **Create Payment**: Set amount, recipient, condition type
- **View Status**: Active, pending, completed, refunded
- **Trigger Execution**: Manual approval or auto-execute
- **Real-time Updates**: Live contract state via Web3

**Routes:**
- `/` — Landing & payment creation
- `/payments` — View all your payments
- `/create` — Step-by-step payment setup
- `/history` — Past payments & execution log

---

## 🔐 Security

- Reentrancy protection (Checks-Effects-Interactions)
- Escrow fund safety (pull vs push patterns)
- Condition validation (on-chain verification)
- Timeout fallback logic (automatic refunds)
- Auditable on-chain execution (full transparency)
- CEI pattern compliance

---

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

## 📊 Success Metrics

- Number of payments created
- Total transaction volume
- Unique users
- Execution success rate
- Average time-to-execution

---

## 🗺️ Roadmap

### Phase 1 (MVP)
- Time-based payments
- Manual trigger
- Simple miniapp UI
- Basic escrow with refunds

### Phase 2
- Oracle integrations (Chainlink)
- Recurring payments
- Email/SMS notifications
- Multi-signature approvals

### Phase 3
- SDK for developers
- API integrations (Zapier, IFTTT)
- Cross-app triggers
- Mobile app (Celo Wallet integration)

---

## 🔗 Links

- [Live Miniapp](https://paywhen.vercel.app/)
- [GitHub Repository](https://github.com/BitBand-Labs/paywhen)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)

---

### 🤝 Contributing

Pull requests welcome! Please ensure:
- All tests pass
- Code follows existing style
- New features include tests
- Security best practices followed

### 📄 License

MIT © PayWhen Protocol
