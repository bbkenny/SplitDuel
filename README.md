# 🎮 SplitDuel (Yield Tactics)

**The Lossless Yield Battle Game on Celo.**

Two players. Five rounds. Split your energy into Attack, Defend, or Invest. Best treasury wins the yield — principal 100% safe.

## 🎯 The Game Paradigm

Traditional DeFi yield products are complex and lack engagement. SplitDuel transforms yield generation into a 1v1 tactical strategy game. Players deposit an equal stake into the DuelManager. This principal is NEVER at risk.

Over 5 rounds, players allocate 100% of their energy across three vaults:
- ⚔️ **Attack**
- 🛡️ **Defend**
- 📈 **Invest**

**Combat Mechanics:**
- **Attack** vs **Defend**: Blocked — attack wasted, shield holds.
- **Attack** vs **Invest**: Hit — you drain a % of their yield gain this round.
- **Invest** vs **Invest**: Both grow cleanly.

Players submit their choices secretly (commit-reveal). After 5 rounds, the player with the highest treasury score wins the accumulated yield. BOTH players get their principal back.

---

## 🏗️ Directory Architecture

```
SplitDuel/
├── smartcontract/             # Solidity Workspace
│   ├── contracts/             # Core Protocol Contracts
│   │   ├── DuelManager.sol    # Matchmaking, commit-reveal, resolution
│   │   └── SplitPool.sol      # Daily tournament pool
│   └── hardhat.config.ts      # TypeScript Hardhat config
│
└── frontend/                  # NextJS Web3 Game Client
    ├── src/
    │   ├── app/
    │   │   └── page.tsx       # 3-Slider UI, Visual Routing Animations
    └── package.json           # Frontend packages
```

---

## 🌟 Key Features
* **Lossless Gameplay:** 100% principal protection.
* **Commit-Reveal Mechanism:** Prevents front-running and creates high psychological tension.
* **Daily Split Pool:** A multiplayer daily tournament for the top 10% most efficient allocators.
* **Reputation Buffs:** Earn small efficiency buffs (Novice → Legend) based on your fight count.
* **MiniPay Optimized:** USDm fee abstraction (CIP-64) and mobile-first 60-second rounds.

---

## 🔗 Live Deployments

**Celo Mainnet:**
* **DuelManager:** `0xb564244275a393567dECede23cfB2fB3424AFc0F`
* **SplitPool:** `0x1D3184144fC75f4912a2805eeD7a218f2B48b4e9`
