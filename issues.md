# Cat Daily Login - Issues

This file contains all GitHub issues for the Cat Daily Login project, covering both Smart Contracts and Frontend. Each issue follows the structure for professional contribution.

---

## 🧠 Smart Contracts Issues

### Issue #10: Event Indexing & Analytics Support
**Status:** ❌ PENDING  
**Labels:** `smart-contracts`, `analytics`, `infrastructure`  
**Priority:** LOW

**Description:**
Define an indexing strategy (e.g., Goldsky, The Graph, or custom indexer) to track all `Claimed` events. This will enable historical data visualization on the frontend.

**Acceptance Criteria:**
- [ ] Ensure all necessary events are emitted with `indexed` parameters.
- [ ] Create a configuration for a subgraph or an event listener.
- [ ] Expose an endpoint or query for fetching user claim history.

---

### Issue #11: Security Polish & Ownership Management
**Status:** ❌ PENDING  
**Labels:** `smart-contracts`, `security`  
**Priority:** MEDIUM

**Description:**
Implement professional ownership management. Ensure the contract can transition to a Multi-sig or be renounced for true decentralization.

**Acceptance Criteria:**
- [ ] Implement `Ownable2Step` for secure ownership transfers.
- [ ] Document the process for emergency token withdrawal by the community/DAO.

---

## 🎨 Frontend Issues

### Design Specifications:
- **Primary Color:** `#B0A5D0` (Light Purple/Lavender)
- **Secondary Color:** `#442F8C` (Deep Purple)
- **Tertiary Color:** `White` (#FFFFFF) for text and accents.

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

**Implementation Notes:**
- Use the defined color palette: Primary (#B0A5D0), Secondary (#442F8C), and White.
- Ensure high contrast for accessibility.

---

### Issue #12: Design Assets & Branding
**Status:** ❌ PENDING  
**Labels:** `frontend`, `design`, `branding`  
**Priority:** MEDIUM

**Description:**
Source or create high-quality "Cat" themed assets (icons, animations, logo). Ensure the branding is consistent with a "premium" feel.

**Acceptance Criteria:**
- [ ] Create SVG icons for Claim, Leaderboard, and Profile tabs.
- [ ] Add a high-resolution logo and favicon.
- [ ] (Optional) Add Lottie animations for "Successful Claim".

---

### Issue #13: Transaction History & Activity Feed
**Status:** ❌ PENDING  
**Labels:** `frontend`, `feature`, `history`  
**Priority:** MEDIUM

**Description:**
Implement an activity feed in the **Profile** tab that shows the user's historical claims (e.g., "Claimed 100 $CAT on Jan 20th").

**Acceptance Criteria:**
- [ ] Fetch historical events from the blockchain or indexer.
- [ ] Display list of past claims with date and transaction hash.
- [ ] Show total $CAT claimed by the user.

---

### Issue #14: Comprehensive Project Documentation
**Status:** ❌ PENDING  
**Labels:** `docs`, `project-wide`  
**Priority:** MEDIUM

**Description:**
Update the root `README.md` and project documentation to reflect the new UI structure, Frame v2 capabilities, and deployment instructions.

**Acceptance Criteria:**
- [ ] Update `README.md` with new features and screenshots (placeholders).
- [ ] Add a "Contribution Guide" for future developers.
- [ ] Document the smart contract addresses for Base Mainnet.

---

## ✅ Completed Issues

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
- [x] (REMOVED) Mock ERC-20 token for testing.

**Implementation Notes:**
- Tests implemented in `smartcontract/test/DailyReward.test.ts`.
- Mock token removed as per updated requirements. Using dummy address for $CAT token.

**Completed:** Core functionality verification tests are ready (using dummy address).

---

### Issue #4: Deployment & Verification Scripts
**Status:** ✅ COMPLETED  
**Labels:** `smart-contracts`, `deployment`  
**Priority:** MEDIUM

**Description:**
Create scripts to deploy the `DailyReward` contract to Base Sepolia and Mainnet, and handle automatic verification on BaseScan.

**Acceptance Criteria:**
- [x] Create `scripts/deploy.ts`.
- [x] Implement contract verification logic.
- [x] Store deployment artifacts (addresses/ABIs) for frontend use.

**Implementation Notes:**
- Deployment script implemented at `smartcontract/scripts/deploy.ts`.
- Configured Base Sepolia and Base Mainnet in `hardhat.config.ts`.
- Ready for deployment with dummy $CAT token address.

---

### Issue #5: Project Initialization & Web3 Infrastructure
**Status:** ✅ COMPLETED  
**Labels:** `frontend`, `infrastructure`, `setup`  
**Priority:** HIGH

**Description:**
Set up the Next.js project with Tailwind CSS and integrate Web3 providers (Wagmi, Viem, Reown AppKit) configured for Base Mainnet.

**Acceptance Criteria:**
- [x] Initialize Next.js 14+ (App Router).
- [x] Configure Wagmi and AppKit for Base.
- [x] Create `Navbar` and `Providers` components.
- [x] Set up `.env.local` template for RPC URLs and Project IDs.

**Implementation Notes:**
- Next.js 15+ used.
- Installed `@reown/appkit`, `wagmi`, `viem`.
- Providers setup in `app/providers.tsx`.
- Navbar with connect button in `src/components/Navbar.tsx`.

---
