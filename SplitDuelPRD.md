# 📘 Product Requirements Document (PRD): SplitDuel (Yield Tactics)

## 🟢 Product Name
SplitDuel (Yield Tactics)

## 🧠 One-Line Summary
A 1v1 tactical yield battle game on Celo where players allocate energy across Attack, Defend, and Invest vaults to win accumulated yield while keeping their principal 100% safe.

---

## 🎯 Problem Statement
DeFi protocols are boring and abstract, while traditional GameFi often involves ponzinomics and risk to the player's principal capital.
- Yield interfaces are essentially spreadsheets with high friction.
- Traditional yield products don't drive daily active users (DAUs) or retention.
- Zero-sum games cause players to lose capital, leading to churn.

---

## 💡 Solution
SplitDuel refactors the AutoSplit routing engine into a GameFi mechanic:
- **Lossless Principal:** Players stake CELO, USDm, or other tokens, and their principal is completely protected. They only fight for the *yield* generated.
- **Commit-Reveal Combat:** Across 5 rounds, players split their energy (100% total) between **Attack**, **Defend**, and **Invest**. Secret commits prevent front-running.
- **Visual Routing:** Energy routes to vaults visibly, showing the strategic choices of both players.
- **Winner Takes Yield:** The player with the highest treasury at the end of the 5 rounds wins the yield.

---

## ⚙️ Core Product Features

### 1. 1v1 Combat Mechanics (Rock-Paper-Scissors)
- **Attack vs Defend**: Blocked (Attack wasted).
- **Attack vs Invest**: Hit (Drains a % of opponent's yield gain).
- **Invest vs Invest**: Both grow.

### 2. Daily Split Pool
- A multiplayer mode where the top 10% of the most efficient splitters share the day's accumulated yield pool.

### 3. Reputation Buffs
- Active players build a reputation score based on fights completed, unlocking small % efficiency buffs for their vaults (Novice -> Legend).

### 4. MiniPay Integration
- USDm fee abstraction (CIP-64) natively supported.
- Wagmi + Viem stack for MiniPay compatibility (no ethers.js in frontend).
- Short 60-second rounds tailored perfectly for mobile sessions.

---

## 🏗️ Technical Architecture

### Smart Contracts (Solidity)
- **`DuelManager.sol`**:
  - Handles matchmaking, commit-reveal mechanics, 5-round resolution, and prize distribution.
- **`SplitPool.sol`**:
  - Manages the Daily Split Pool and efficiency scoring.

### Frontend
- Next.js (TypeScript) + Tailwind CSS.
- Visual routing animations to display energy flows.
- 3-slider allocation screen for Attack/Defend/Invest.
