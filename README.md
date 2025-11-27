# ⚔️ Dungeon Flip Lite

A Web3 roguelite mini-game built for **OneHack 2.0 Hackathon**, featuring NFT adventurers, on-chain rewards, and progress tracking on **OneChain**.

![Built for OneHack 2.0](https://img.shields.io/badge/Built%20for-OneHack%202.0-blue)
![OneChain](https://img.shields.io/badge/Blockchain-OneChain-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Game Overview

**Dungeon Flip Lite** is a simple yet engaging roguelite card game where players:

1. Connect their **OneWallet** on OneChain
2. Mint a free **Aventurer NFT** (OneChain Move object)
3. Pay **0.01 OCT** entry fee per dungeon run
4. Play dungeon runs with 4 random cards per room
5. Face **Monsters**, collect **Treasures**, avoid **Traps**, and use **Potions**
6. Compete for **weekly OCT prizes** distributed to top 10 players
7. Track progress on-chain via shared objects

### Game Mechanics

- **Infinite Dungeon**: Continue through rooms or exit with your rewards
- **Cards per Room**: 4 cards
- **Card Types**:
  - 🦹 **Monster** (50%): Enter turn-based combat with random dice rolls
  - 💎 **Treasure** (30%): Collect gems (leaderboard score)
  - 🕸️ **Trap** (10%): Lose 1 HP
  - 🧪 **Potion** (10%): Restore HP up to your max HP

- **Basic Adventurer Stats**:
  - ATK: 1-2
  - DEF: 1-2
  - HP: 4-6

- **Combat System**:
  - Turn-based battles with monsters
  - 80% hit chance for player attacks
  - Monster damage: ATK roll - Player DEF (minimum 0)
  - Defense can completely block attacks if DEF >= Monster ATK

- **Win Condition**: Exit the dungeon voluntarily with gems collected
- **Lose Condition**: HP reaches 0

### 💰 Economy (OCT-Based)

- **Entry Fee**: 0.01 OCT per run
- **Automatic Distribution**:
  - 70% → Weekly Rewards Pool (top 10 players)
  - 20% → Dev Treasury
  - 10% → Marketing Reserve
- **Weekly Prizes**: Every Friday 4:20 UTC
  - 1st place: 30% of pool
  - 2nd-10th: Decreasing percentages
  - See [ONECHAIN_ECONOMY.md](ONECHAIN_ECONOMY.md) for full details

## 🏗️ Project Structure

```
DungeonFlip/
├── move/                          # OneChain Move smart contracts
│   ├── Move.toml                  # Package configuration
│   └── sources/
│       ├── aventurer_nft.move     # NFT (Owned Object)
│       ├── active_run.move        # Dungeon run management + entry fees
│       ├── fee_distributor.move   # OCT distribution logic
│       ├── rewards_pool.move      # Weekly prize pool
│       └── dungeon_progress.move  # Progress tracking (Shared Object)
├── frontend/                      # Next.js frontend
│   ├── src/
│   │   ├── app/                   # Next.js 14 App Router
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities & OneChain blockchain logic
│   │   ├── hooks/                 # React hooks (wallet integration)
│   │   ├── store/                 # Zustand state management
│   │   └── styles/                # Global styles
│   └── package.json
├── ONEHACK_SUBMISSION.md          # Hackathon submission document
└── README.md                      # This file
```

## 🚀 Quick Start

### 🎮 Option 1: Test Locally (No Blockchain Required)

**Want to test the game immediately without deploying contracts?**

See **[DEVELOPMENT_MODE.md](DEVELOPMENT_MODE.md)** for instructions on enabling **Dev Mode**.

**Quick steps**:
1. `cd frontend`
2. `cp .env.example .env.local`
3. Set `NEXT_PUBLIC_DEV_MODE=true` in `.env.local`
4. `npm run dev`
5. Click "Skip & Play (Demo Mode)" to test the full game!

---

### 🔗 Option 2: Full Blockchain Deployment

### Prerequisites

- **Node.js** v18+ and **npm**
- **OneChain CLI** (based on Move)
- **OneWallet** browser extension
- **OneChain** testnet/mainnet access
- OCT tokens for gas fees

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Deploy Move Contracts

```bash
# Navigate to move directory
cd move

# Build contracts
onechain move build

# Publish to OneChain testnet
onechain client publish --gas-budget 100000000

# Save the output:
# - Package ID
# - MintRegistry Object ID
# - ProgressRegistry Object ID
# - FeeConfig Object ID
# - FeeDistributor Object ID
# - RewardsPool Object ID
```

### 3. Configure Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc-testnet.onechain.network
NEXT_PUBLIC_PACKAGE_ID=0x...                 # from onechain client publish
NEXT_PUBLIC_MINT_REGISTRY_ID=0x...           # MintRegistry shared object
NEXT_PUBLIC_PROGRESS_REGISTRY_ID=0x...       # ProgressRegistry shared object
NEXT_PUBLIC_FEE_CONFIG_ID=0x...              # FeeConfig shared object
NEXT_PUBLIC_FEE_DISTRIBUTOR_ID=0x...         # FeeDistributor shared object
NEXT_PUBLIC_REWARDS_POOL_ID=0x...            # RewardsPool shared object
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect Wallet & Play

1. Click **"Connect Wallet"**
2. Select **OneWallet**
3. Click **"Mint Adventurer NFT"** (free, requires gas)
4. Click **"Enter the Dungeon"** and pay 0.01 OCT
5. Play and earn rewards!

## 🛠️ Technology Stack

### Smart Contracts
- **Language**: Move (OneChain Framework)
- **Network**: OneChain
- **Tools**: OneChain CLI

### Frontend
- **Framework**: Next.js 14 (React, App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Web3**: OneChain SDK, @mysten/dapp-kit (OneChain is based on Move)
- **Query**: @tanstack/react-query

## 📜 Smart Contract Architecture

### 1. aventurer_nft.move
- **Type**: Owned Object (NFT)
- **Functions**:
  - `mint_basic_aventurer()` - Mint free Adventurer NFT
- **Stats**: ATK=1, DEF=0, HP=4
- **Events**: `AventurerMinted`

### 2. active_run.move + fee_distributor.move + rewards_pool.move
- **Entry Fee**: 0.01 OCT per run
- **Auto-Distribution**: 70% pool / 20% dev / 10% marketing
- **Weekly Prizes**: Automatic distribution to top 10 players
- See [ONECHAIN_ECONOMY.md](ONECHAIN_ECONOMY.md) for complete documentation

### 3. dungeon_progress.move
- **Type**: Shared Object (ProgressRegistry)
- **Functions**:
  - `record_run()` - Record completed run with gems and rooms reached
  - `get_progress()` - Query player stats
  - `advance_week()` - Advance to next season week
- **Events**: `RunCompleted`, `WeekAdvanced`

## 🎯 Key Features

### On-Chain (OneChain)
- ✅ NFT ownership verification
- ✅ OCT-Based reward economy
- ✅ Automatic fee distribution
- ✅ Weekly prize pool
- ✅ Progress tracking in shared object
- ✅ Event emission for indexing
- ✅ Random NFT stats on mint

### Off-Chain (Frontend)
- ✅ Game logic (instant, free)
- ✅ Card generation
- ✅ Turn-based combat with dice rolls
- ✅ DEF-based damage calculation
- ✅ Gems and rooms tracking
- ✅ Visual feedback

### Hybrid Model Benefits
- ⚡ Fast gameplay (no waiting for blocks)
- 💰 Low gas costs (only entry fee & progress)
- 🔐 Verifiable ownership & rewards
- 📈 Scalable architecture

## 📚 Documentation

- **[ONECHAIN_ECONOMY.md](ONECHAIN_ECONOMY.md)** - Complete OCT economy guide
- **[ONEHACK_SUBMISSION.md](ONEHACK_SUBMISSION.md)** - Hackathon submission document
- **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** - Security analysis and vulnerabilities
- **[DEVELOPMENT_MODE.md](DEVELOPMENT_MODE.md)** - Test without blockchain
- **[Move Contracts](move/sources/)** - Smart contract source code with inline comments

## 🔗 Useful Links

### OneChain Resources
- [OneChain Documentation](https://docs.onechain.network/)
- [OneHack 2.0 Website](https://onehackathon.com/)
- [OneWallet Documentation](https://onewallet.docs/)

### Move Resources
- [Move Language](https://move-language.github.io/)
- [Move by Example](https://examples.move-language.org/)

## 🧪 Testing

```bash
# Test Move contracts
cd move
onechain move test

# Run frontend (dev mode)
cd frontend
npm run dev

# Build for production
npm run build
```

## 🚀 Deployment

### Deploy to OneChain Mainnet

```bash
# Switch to mainnet
onechain client switch --env mainnet

# Publish contracts
cd move
onechain client publish --gas-budget 100000000
```

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

Set environment variables in Vercel dashboard.

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 👥 Contributors

Built for OneHack 2.0 Hackathon

## 🙏 Acknowledgments

- OneHack 2.0 Hackathon organizers
- OneChain Foundation
- OneWallet team
- Next.js, TailwindCSS, React Query communities

---

**Status**: 🚀 Ready for Deployment

**Version**: 1.0.0

**Last Updated**: 2025-11-27
