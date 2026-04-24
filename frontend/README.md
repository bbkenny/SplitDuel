# AutoSplit — Payment Routing Miniapp

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Network](https://img.shields.io/badge/Celo-Testnet-16D14E?style=flat-square&logo=celo)](https://celo.org)

Next.js 14 frontend for **AutoSplit** — automatic stablecoin payment routing on Celo.

**[Live Miniapp](https://autosplit.vercel.app/) · [GitHub](https://github.com/bbkenny/autosplit)**

</div>

---

## 🚀 What is AutoSplit?

**One transaction. Multiple outcomes.**

AutoSplit is a smart contract-based payment router that lets users automatically split and route stablecoin payments in a single action. Send once, and your money splits, saves, and routes instantly.

### Use Cases

- **Freelancers**: Auto-split payments (50% savings, 30% ops, 20% personal)
- **DAOs**: Route treasury funds to multiple vaults in one tx
- **Businesses**: Split revenue across team, savings, and growth
- **Emerging Markets**: Programmable stablecoin distribution

---

## 🎨 Features

- **Multi-Recipient Routing**: Send to multiple addresses in one tx
- **Vault Integration**: Optional routing to yield protocols
- **Custom Splits**: Define percentage-based distribution rules
- **Real-Time Preview**: See distribution before execution
- **Celo-Native**: Built for Celo stablecoins (cUSD, cEUR)

---

## 📁 Project Structure

```
frontend/
├── app/
│   └── page.tsx                 # Main dashboard
│
└── package.json                # Dependencies
```

---

## 🚦 Pages

| Route | Description |
|-------|-------------|
| `/` | Split creation & execution dashboard |

---

## 🧩 Components

| Component | Description |
|-----------|-------------|
| Main Dashboard | Split config, preview, execution |

---

## ⚙️ Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
```

---

## 🔗 Links

- [Live Miniapp](https://autosplit.vercel.app/)
- [Smart Contracts](https://github.com/bbkenny/autosplit/tree/main/smartcontract)
- [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)

---

## 📄 License

MIT © AutoSplit Protocol