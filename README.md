# AutoSplit

## 🟢 Product Name

AutoSplit

A mobile-first payment routing miniapp that allows users to automatically split and route stablecoin transactions in a single action.

## 🧠 One-Line Summary

Send once, and your money automatically splits, saves, and invests in real time.

## 🎯 Problem Statement

Sending money today is fragmented:

- Users manually split payments
- Savings require separate actions
- Investing requires additional steps

This creates friction, especially in mobile-first economies where users:

- Manage multiple obligations (family, savings, business)
- Operate with stablecoins (cUSD, cEUR)
- Need automation, not complexity

## 💡 Solution

A smart contract-based payment router that:

- Automatically splits incoming or outgoing funds
- Routes portions to recipients, savings vaults, or yield strategies
- Executes all actions in a single transaction

## 🎯 Target Users

- Freelancers / gig workers
- Small business owners
- DAOs / small teams
- Crypto-native users on Celo
- Emerging market users using stablecoins

## 🔥 Core Value Proposition

- One transaction → multiple financial outcomes
- Eliminates manual money management steps
- Enables programmable finance for everyday users

## ⚙️ Core Features

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

## 🧩 User Flow

1. User inputs amount
2. User defines split rules
3. System calculates distribution
4. User confirms transaction
5. Smart contract executes routing
6. UI displays results

## 🏗️ Technical Architecture

### Smart Contracts (Solidity)

- Router Contract
  - Accepts funds
  - Applies split logic
  - Executes transfers
- Vault Adapter (optional)
  - Integrates with DeFi protocols
  - Handles deposits

### Frontend

- Framework: Next.js
- Wallet: Wagmi / WalletConnect
- UI: Tailwind CSS

## 🔐 Security Considerations

- Reentrancy protection
- Input validation (percentages ≤ 100%)
- Safe transfer patterns
- Access control (user-specific configs)

## 📊 Success Metrics

- Number of transactions executed
- Total volume routed (cUSD)
- Number of active users
- Average splits per transaction
- Vault participation rate

## 🚀 MVP Scope

- Basic split routing
- Fixed percentage rules
- Single recipient + optional vault
- Simple UI

## 🔮 Future Enhancements

- Recurring payments
- AI-based financial suggestions
- Social/group splitting
- Multi-token support
- Farcaster miniapp integration

## 🧠 "Wow" Moment

User sends money once → sees it automatically:

- Delivered
- Saved
- Invested

## ⚠️ Risks

- Overcomplication of UI
- Low user understanding of splits
- Integration complexity with DeFi

## ✅ Out of Scope (MVP)

- Cross-chain routing
- Advanced analytics dashboards
- Token swapping

## 📌 Positioning

AutoSplit is not a wallet.

It is: 👉 A programmable payment primitive for stablecoins.
