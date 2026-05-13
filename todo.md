# 📝 AutoSplit Development TODO

> [!IMPORTANT]
> This document tracks the pending tasks for the **AutoSplit** project. The core focus is on automating stablecoin routing on Celo.

## 🚀 Phase 1: Smart Contract Refinement
- [ ] **Security Hardening**: Add `ReentrancyGuard` to `AutoSplitRouter.sol` and ensure all state updates happen before external calls.
- [ ] **Yield-Bearing Adapters**: Implement concrete adapters for Celo DeFi protocols (e.g., Moola Market, Aave) to enable "Auto-Invest" functionality.
- [ ] **Event Optimization**: Ensure all routing actions emit detailed events for frontend tracking.
- [ ] **Gas Optimization**: Optimize the loop in `routePayment` to handle up to 10 recipients efficiently.

## 🖥️ Frontend & UX Enhancements
- [ ] **Vault Toggle UI**: Add a switch or dropdown in the "Recipient" row to mark a destination as a "Vault" (invoking the `isVault` logic in the contract).
- [ ] **Transaction History**: Implement a "Past Splits" section using contract events to show user routing history.
- [ ] **Multi-Token Support**: Add a token selector (cUSD, cEUR, CELO) instead of the hardcoded cUSD label.
- [ ] **Balance Checks**: Implement real-time balance validation before execution.
- [ ] **Mobile Optimization**: Refine the responsive design for a seamless "MiniPay" experience.

## 🛠 Deployment & DevOps
- [ ] **Contract Verification**: Verify the `AutoSplitRouter` on Celo Explorer.
- [ ] **Environment Variables**: Clean up and secure `NEXT_PUBLIC_PROJECT_ID` and other sensitive keys.
- [ ] **Vercel Routing Fix**: (Completed) Fixed the 404 deployment error by correcting missing imports and Tailwind configuration.

## 🧪 Testing & Validation
- [ ] **Automated Test Suite**: Expand `AutoSplitRouter.test.js` to cover edge cases like remainder/dust calculations.
- [ ] **Integration Testing**: Perform end-to-end tests on Alfajores testnet with multiple recipients and vaults.
