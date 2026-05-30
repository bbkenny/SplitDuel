# 📘 Product Requirements Document (PRD): AutoSplit v2.0

## 🟢 Product Name
AutoSplit: The Decentralized Mobile Credit Union & Autonomous Yield Router

## 🧠 One-Line Summary
Route stablecoins and CELO native payments dynamically to direct recipients, auto-deposit splits to compound interest vaults, farm financial reputation scores, and borrow under-collateralized micro-loans.

---

## 🎯 Problem Statement
Digital money in mobile-first emerging economies remains fragmented and transactional, failing to nurture sustainable financial behavior:
- 💸 Outbound/inbound transfers go 80-90% to immediate consumption, leaving zero cushion for future growth or savings.
- 💳 Existing DeFi yields and micro-savings require high friction and manual multi-step transactions.
- 🚫 Everyday microfinance users have no access to collateral-free overdrafts or credit lines due to the lack of on-chain reputation histories.

---

## 💡 Solution
AutoSplit introduces **Autonomous stablecoin credit reputation and yield routing** directly inside mobile miniapps (Valora / MiniPay):
- **Precision Routing Builder**: Automatically splits outbound/inbound stablecoins (`cUSD`) and native `CELO` in a single atomic transaction.
- **DeFi Growth Vault**: Portions routed to savings vaults automatically compound interest natively at **4.5% APY** inside a self-compounding custody structure.
- **Financial Reputation Score**: Mints on-chain credit reputation points when users route payments and save.
- **Micro-Credit Hub**: Allows users to instantly request and repay under-collateralized micro-loans up to their score-derived credit limit.

---

## 🎯 Target Users
- **Freelancers / Gig Workers**: Automatically split earnings into savings, taxes, and operational wallets.
- **Small Business Owners**: Access fast reputation-backed credit lines to purchase inventory.
- **Everyday Mobile Users**: Build an on-chain credit rating simply by sending money.

---

## ⚙️ Core Product Features

### 1. Payment Routing Engine
- Supports splits of ERC-20 `cUSD` and native `CELO`.
- Percentage-based basis point matrix (e.g. 50% recipient, 30% business, 20% savings).
- Atomic execution reduces gas overhead and user friction.

### 2. Autonomous Yield Savings (Growth Vault)
- Self-compounding virtual share price formula compounding yield dynamically at **4.5% APY** based on elapsed block timestamp.
- Direct deposits and routing splits into the vault adapter custody.

### 3. Credit Reputation Engine
- Earn **1 Reputation Point** per whole unit (1e18) split-routed.
- Earn **5 Reputation Points** per whole unit deposited directly or auto-routed to savings.
- Mapped as an active Credit Score on-chain.

### 4. Microfinance Credit Line
- Dynamic borrowing limit equal to **2x the user's reputation score** in tokens.
- Instant loan request and dispersal directly from active vault adapters.
- 2% fixed interest fee to reward vault depositors.
- Timely repayment awards a huge credit rating boost (+15 points).

---

## 🏗️ Technical Architecture

### Smart Contracts (Solidity)
- **`AutoSplitRouter.sol`**:
  - Implements split configurations, vault balance tracking, reputation scoring, and lending ledgers.
  - Compounds interest on block timestamps.
- **`VaultAdapter.sol`**:
  - Direct custodian contract for deposited stablecoins and CELO.
  - Authorizable by the main router contract.

### Frontend
- Next.js (TypeScript) + Tailwind CSS + Lucide Icons.
- Wagmi / Viem hooks integrated with MiniPay legacy type transaction constraints.

---

## 🔐 Security Considerations
- NonReentrant guard protection on all asset withdraws and borrows.
- Strict limit validations on percentage rules (must equal exactly 100%).
- Full custody adapter separation keeps capital safe.
