# Cat Daily Login - Issues

This file contains all GitHub issues for the Cat Daily Login project, covering both Smart Contracts and Frontend. Each issue follows the structure for professional contribution.

---

## 🧠 Smart Contracts Issues

### Issue #1: Project Setup & Hardhat Configuration
**Status:** ✅ COMPLETED  
**Labels:** `smart-contracts`, `infrastructure`, `setup`  
**Priority:** HIGH

**Description:**
Set up the Hardhat environment for the Cat Daily Login project. Configure compiler settings, network settings for Base Mainnet/Sepolia, and install necessary dependencies.

**Acceptance Criteria:**
- [x] Initialize Hardhat project.
- [x] Configure `hardhat.config.ts` for Base networks.
- [x] Set up `.gitignore` and `.env.example`.
- [x] Install OpenZeppelin contracts and Hardhat toolbox.

**Implementation Notes:**
- Project initialized in `smartcontract/` directory.
- Using Solidity ^0.8.20.

**Completed:** Project structure and configuration are ready for development.

---

### Issue #2: DailyReward.sol — Core Reward Logic
**Status:** ✅ COMPLETED  
**Labels:** `smart-contracts`, `feature`, `solidity`  
**Priority:** HIGH

**Description:**
Develop the core `DailyReward.sol` contract to manage the distribution of $CAT tokens. Users should be able to claim rewards once every 24 hours.

**Acceptance Criteria:**
- [x] Implement 24-hour claim window logic.
- [x] Add owner functions to set reward amount and withdraw tokens.
- [x] Include `canClaim(address)` view function for frontend checks.
- [x] Emit `Claimed` events.

**Implementation Notes:**
- Contract implemented at `smartcontract/contracts/DailyReward.sol`.
- Uses a mapping `lastClaimTime` to track user claims.

**Completed:** Core contract logic is implemented and functional.

---

### Issue #3: Smart Contract Test Suite
**Status:** ✅ COMPLETED  
**Labels:** `smart-contracts`, `testing`, `quality`  
**Priority:** HIGH

**Description:**
Write comprehensive tests for the `DailyReward` contract to ensure security and reliability of the claim mechanism.

**Acceptance Criteria:**
- [x] Test successful claims.
- [x] Test double-claiming prevention (24h rule).
- [x] Test owner-only restrictions.
- [x] Mock ERC-20 token for testing.

**Implementation Notes:**
- Tests implemented in `smartcontract/test/DailyReward.test.ts`.
- Mock token at `smartcontract/contracts/MockERC20.sol`.

**Completed:** 100% test coverage for core functionality.

---

### Issue #4: Deployment & Verification Scripts
**Status:** ❌ PENDING  
**Labels:** `smart-contracts`, `deployment`  
**Priority:** MEDIUM

**Description:**
Create scripts to deploy the `DailyReward` contract to Base Sepolia and Mainnet, and handle automatic verification on BaseScan.

**Acceptance Criteria:**
- [ ] Create `scripts/deploy.ts`.
- [ ] Implement contract verification logic.
- [ ] Store deployment artifacts (addresses/ABIs) for frontend use.

---

## 🎨 Frontend Issues

### Issue #5: Project Initialization & Web3 Infrastructure
**Status:** ❌ PENDING  
**Labels:** `frontend`, `infrastructure`, `setup`  
**Priority:** HIGH

**Description:**
Set up the Next.js project with Tailwind CSS and integrate Web3 providers (Wagmi, Viem, Reown AppKit) configured for Base Mainnet.

**Acceptance Criteria:**
- [ ] Initialize Next.js 14+ (App Router).
- [ ] Configure Wagmi and AppKit for Base.
- [ ] Create `Navbar` and `Providers` components.

---

### Issue #6: One-Page Tabbed Interface (BlocxTacToe Style)
**Status:** ❌ PENDING  
**Labels:** `frontend`, `ui/ux`, `layout`  
**Priority:** HIGH

**Description:**
Implement a simple, high-quality one-page UI with a tab-based navigation system, similar to the BlocxTacToe project.

**Acceptance Criteria:**
- [ ] Create a `TabNavigation` component.
- [ ] Implement state-based rendering for three tabs:
  - **Claim:** The main dashboard for claiming $CAT.
  - **Leaderboard:** Display top claimers/streaks.
  - **Profile:** Show user stats and wallet info.
- [ ] Ensure smooth transitions between tabs.

**Implementation Notes:**
- Follow the pattern in `BlocxTacToe/blocxtactoe-frontend/src/app/page.tsx`.

---

### Issue #7: Farcaster Frames v2 Integration
**Status:** ❌ PENDING  
**Labels:** `frontend`, `farcaster`, `integration`  
**Priority:** HIGH

**Description:**
Integrate Farcaster Frames v2 (Mini App) capabilities to allow the app to be launched directly from Farcaster.

**Acceptance Criteria:**
- [ ] Configure Frame metadata in `layout.tsx`.
- [ ] Implement `useMiniKit` or equivalent Frame SDK hooks.
- [ ] Handle auto-connection or splash screen behavior.

---

### Issue #8: Claim Logic & Contract Interaction
**Status:** ❌ PENDING  
**Labels:** `frontend`, `feature`, `web3`  
**Priority:** HIGH

**Description:**
Connect the "Claim" tab to the `DailyReward` smart contract. Handle eligibility checking and transaction execution.

**Acceptance Criteria:**
- [ ] Fetch `canClaim` status on load.
- [ ] Implement `claim()` function with transaction feedback (loading/success/error).
- [ ] Show a countdown timer if the user has already claimed.

---

### Issue #9: UI/UX Polish & Responsiveness
**Status:** ❌ PENDING  
**Labels:** `frontend`, `ui/ux`, `design`  
**Priority:** MEDIUM

**Description:**
Apply a modern, visually "wow" design using Tailwind CSS. Ensure the app is perfectly responsive for mobile (especially inside Farcaster).

**Acceptance Criteria:**
- [ ] Implement "Cat" themed aesthetic (colors, icons).
- [ ] Add toast notifications for user feedback.
- [ ] Optimize for mobile viewport heights.

---

**Note:** Move issues to "✅ Completed Issues" and mark as `✅ COMPLETED` once finished.
