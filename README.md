# Cat Daily Login - Farcaster Mini App

A Farcaster Mini App that rewards users with **$CAT** tokens for logging in daily. Built on **Base Mainnet**.

## Overview

This project is a gamified engagement tool designed for the Farcaster community. Users open the Mini App (Frame) daily to claim free $CAT tokens. The system uses a smart contract on Base to manage the reward pool and verify daily claims.

### Key Features
- **Daily Check-in:** Users can claim rewards once every 24 hours.
- **$CAT Rewards:** Automated distribution of ERC-20 $CAT tokens.
- **Farcaster Integration:** Seamless login and wallet connection via Farcaster Frame/Mini App authentication.
- **Base Network:** Low-cost, fast transactions on Base Mainnet.

## Project Structure

The project follows a monorepo-style structure:

```
cat-daily-login/
├── smartcontract/       # Solidity contracts, tests, and deployment scripts
│   ├── contracts/       # DailyReward.sol
│   └── ...
│
└── frontend/           # Next.js application for the Mini App interface
    ├── components/
    └── ...
```

## Tech Stack

### Smart Contracts
- **Network:** Base Mainnet
- **Framework:** Hardhat
- **Language:** Solidity ^0.8.20
- **Standards:** ERC-20 (for $CAT token interaction)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Platform:** Farcaster Mini App (Frames v2)
- **Styling:** Tailwind CSS (Primary: #B0A5D0, Secondary: #442F8C)
- **Web3:** Wagmi, Viem, ConnectKit/RainbowKit

## Design & Aesthetic

The application uses a "Cat" themed aesthetic with the following color palette:
- **Primary:** `#B0A5D0` (Light Purple/Lavender)
- **Secondary:** `#442F8C` (Deep Purple)
- **Accents:** `White` (#FFFFFF) for text and highlights.

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd cat-daily-login
    ```

2.  **Smart Contracts**
    ```bash
    cd smartcontract
    npm install
    # Set up .env with PRIVATE_KEY and BASE_RPC_URL
    ```

3.  **Frontend**
    ```bash
    cd frontend
    npm install
    # Set up .env.local with NEXT_PUBLIC_PROJECT_ID etc.
    npm run dev
    ```

## Roadmap
- [ ] **Phase 1: MVP**
    - Smart Contract for daily distribution.
    - Basic Claim UI.
    - Farcaster Login.
- [ ] **Phase 2: Gamification**
    - Streak bonuses (e.g., extra $CAT for 7-day streaks).
    - Leaderboards.
- [ ] **Phase 3: Analytics**
    - User retention stats.
    - Total $CAT distributed.

## License
MIT
