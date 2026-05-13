# 📝 AutoSplit Development TODO

> [!IMPORTANT]
> This document tracks the pending tasks for the **AutoSplit** project. The core focus is on automating stablecoin routing on Celo.

## 🚀 Phase 1: Smart Contract Refinement
- [x] **Security Hardening**: Added `ReentrancyGuard` to `AutoSplitRouter.sol` and enforced checks-effects-interactions pattern.
- [ ] **Yield-Bearing Adapters**: Implement concrete adapters for Celo DeFi protocols (e.g., Moola Market, Aave) to enable "Auto-Invest" functionality.
- [x] **Gas Optimization**: Optimized loop logic and state storage access in `routePayment`.
- [x] **Event Optimization**: Emitted detailed `PaymentRouted` events for all transactions.

## 🖥️ Frontend & UX Enhancements
- [x] **Vault Selection**: Implemented UI toggles for each recipient to enable specialized routing to yield vaults.
- [x] **Transaction History**: Added an "Activity Log" with localized storage to track past splits.
- [x] **Multi-Token Support**: Integrated a token selector (cUSD, cEUR, CELO) with dynamic amount labeling.
- [ ] **Balance Checks**: Implement real-time balance validation before execution.
- [x] **Mobile Optimization**: Refined the dashboard for a premium, responsive "MiniPay" experience.

## 🛠 Deployment & DevOps
- [ ] **Contract Verification**: Verify the `AutoSplitRouter` on Celo Explorer.
- [ ] **Environment Variables**: Clean up and secure `NEXT_PUBLIC_PROJECT_ID`.
- [x] **Vercel Routing Fix**: Resolved 403/404 deployment errors and corrected Tailwind 4 configuration.

## 🧪 Testing & Validation
- [ ] **Automated Test Suite**: Expand `AutoSplitRouter.test.js` to cover the new security features.
- [ ] **Integration Testing**: Perform end-to-end tests on Alfajores testnet with multiple recipients and vaults.
