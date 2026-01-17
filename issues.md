# Cat Daily Login - Issues

This file contains all planned tasks and issues for the Cat Daily Login Mini App.

## 🧠 Smart Contract Issues

### Issue #1: DailyReward Dispenser (ERC-20)

**Status:** ✅ COMPLETED
**Labels:** `smart-contract`, `solidity`
**Priority:** HIGH

**Description:**
Develop a `DailyReward.sol` contract.
- **Core Logic:** Distribute ERC-20 $CAT tokens to users once every 24 hours.
- **Admin:** Owner can withdraw tokens and update the reward amount.
- **Events:** Emit `Claimed` event for indexers.

**Acceptance Criteria:**
- [x] Users limited to 1 claim per 24 hours.
- [x] Owner functions secured.
- [x] Tests covering claim windows and permissions.

**Implementation Notes:**
- Created `DailyReward.sol` with core claim logic
- Implemented 24-hour claim window using `lastClaimTime` mapping
- Added owner-only `setRewardAmount()` and `withdraw()` functions
- Implemented `canClaim()` view function for frontend eligibility checking
- Created comprehensive test suite in `DailyReward.test.ts`
- Tests cover:
  - Basic claim functionality
  - 24-hour claim prevention (double claiming)
  - Claim eligibility checking
  - Owner functions

**Completed:** All acceptance criteria met. DailyReward contract fully implemented with tests.

---

## 🎨 Frontend Issues

### Issue #2: Single Page App with Tabs

**Status:** ❌ PENDING
**Labels:** `frontend`, `ui`, `farcaster`
**Priority:** HIGH

**Description:**
Build a **Single Page Application** optimized for Farcaster Frames/Mini Apps.
- **Layout:** Simple, mobile-first design.
- **Navigation:** Use **Tabs** to switch between views without page reloads.
  - **Tab 1: Claim:** Main logic. Connect wallet, check eligibility, "Claim Reward" button.
  - **Tab 2: Leaderboard:** (Placeholder/Future) Top claimers or streaks.
  - **Tab 3: Profile/Settings:** User stats or minimal settings.

**Acceptance Criteria:**
- [ ] Tab navigation works.
- [ ] "Claim" tab effectively handles wallet connection and contract interaction.
- [ ] Visually "wow" design (as per general guidelines) - use extensive CSS/Tailwind for premium feel.

---

### Issue #3: Farcaster/Wallet Integration

**Status:** ❌ PENDING
**Labels:** `frontend`, `auth`
**Priority:** HIGH

**Description:**
Integrate Farcaster specific auth or standard `ConnectKit`/`RainbowKit` customized for the Frame environment.

**Acceptance Criteria:**
- [ ] Auto-connect capability if possible within Frame.
- [ ] Clean "Connect" UI state.

