# ⚔️ Dungeon Flip Lite

A Web3 roguelite mini-game built for **OneHack 2.0 Hackathon**, featuring NFT adventurers, on-chain rewards, and progress tracking on **OneChain** (Sui-based).

![Built for OneHack 2.0](https://img.shields.io/badge/Built%20for-OneHack%202.0-blue)
![OneChain](https://img.shields.io/badge/Blockchain-OneChain%20(Sui)-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎮 Game Overview

**Dungeon Flip Lite** is a simple yet engaging roguelite card game where players:

1. Connect their **OneWallet** (Sui wallet)
2. Mint a free **Aventurer NFT** (Sui Object)
3. Play dungeon runs with 4 random cards
4. Face **Monsters**, collect **Treasures**, and avoid **Traps**
5. Earn **Soul Fragment tokens** (Sui Coin) for defeating monsters
6. Track progress on-chain via shared objects

### Game Mechanics

- **Cards per Run**: 4 cards
- **Card Types**:
  - 🦹 **Monster** (60%): Block attacks with DEF, take damage = Monster ATK - Player DEF
  - 💎 **Treasure** (30%): Collect gold (tracked off-chain in frontend)
  - 🕸️ **Trap** (10%): Lose 1 HP

- **Basic Adventurer Stats**:
  - ATK: 1
  - DEF: 1
  - HP: 4

- **Win Condition**: Survive all 4 cards with HP > 0
- **Lose Condition**: HP reaches 0

## 🏗️ Project Structure

```
DungeonFlip/
├── move/                          # Sui Move smart contracts
│   ├── Move.toml                  # Package configuration
│   └── sources/
│       ├── aventurer_nft.move     # NFT (Owned Object)
│       ├── soul_fragment.move     # Reward token (Coin<T>)
│       └── dungeon_progress.move  # Progress tracking (Shared Object)
├── frontend/                      # Next.js frontend
│   ├── src/
│   │   ├── app/                   # Next.js 14 App Router
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities & Sui blockchain logic
│   │   ├── hooks/                 # React hooks (Sui dapp-kit)
│   │   ├── store/                 # Zustand state management
│   │   └── styles/                # Global styles
│   └── package.json
├── MIGRATION_SUMMARY.md           # EVM → Sui migration details
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
- **Sui CLI** ([installation guide](https://docs.sui.io/guides/developer/getting-started/sui-install))
- **OneWallet** or **Sui Wallet** browser extension
- **OneChain** testnet/mainnet access (Sui-based)
- SUI tokens for gas fees

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
sui move build

# Publish to Sui testnet (or OneChain when available)
sui client publish --gas-budget 100000000

# Save the output:
# - Package ID
# - TreasuryCap Object ID
# - ProgressRegistry Object ID
```

### 3. Configure Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_TREASURY_CAP_ID=0x...
NEXT_PUBLIC_PROGRESS_REGISTRY_ID=0x...

# When OneChain is available:
# NEXT_PUBLIC_SUI_NETWORK=onechain
# NEXT_PUBLIC_SUI_RPC_URL=https://rpc.onechain.network
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect Wallet & Play

1. Click **"Connect Wallet"**
2. Select **OneWallet** or **Sui Wallet**
3. Click **"Mint Adventurer NFT"** (free, requires gas)
4. Click **"Enter the Dungeon"**
5. Play and earn rewards!

## 🛠️ Technology Stack

### Smart Contracts
- **Language**: Move (Sui Framework)
- **Network**: OneChain (Sui-based)
- **Tools**: Sui CLI

### Frontend
- **Framework**: Next.js 14 (React, App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Web3**: @mysten/sui, @mysten/dapp-kit
- **Query**: @tanstack/react-query

## 📜 Smart Contract Architecture

### 1. aventurer_nft.move
- **Type**: Owned Object (NFT)
- **Functions**:
  - `mint_basic_aventurer()` - Mint free Adventurer NFT
- **Stats**: ATK=1, DEF=1, HP=4
- **Events**: `AventurerMinted`

### 2. soul_fragment.move
- **Type**: Coin<SOUL_FRAGMENT>
- **Functions**:
  - `reward_player()` - Mint 1 token
  - `batch_reward()` - Mint multiple tokens
- **Authority**: TreasuryCap (owned by deployer)

### 3. dungeon_progress.move
- **Type**: Shared Object (ProgressRegistry)
- **Functions**:
  - `record_monster_defeated()` - Increment monsters defeated
  - `record_run()` - Record completed run (success/fail)
  - `get_progress()` - Query player stats
- **Events**: `MonsterDefeated`, `RunCompleted`

## 🎯 Key Features

### On-Chain (Sui)
- ✅ NFT ownership verification
- ✅ Token rewards (Soul Fragments)
- ✅ Progress tracking in shared object
- ✅ Event emission for indexing

### Off-Chain (Frontend)
- ✅ Game logic (instant, free)
- ✅ Card generation
- ✅ Combat resolution (DEF-based damage calculation)
- ✅ Gold and monsters defeated tracking
- ✅ Visual feedback

### Hybrid Model Benefits
- ⚡ Fast gameplay (no waiting for blocks)
- 💰 Low gas costs (only rewards & progress)
- 🔐 Verifiable ownership & rewards
- 📈 Scalable architecture

## 📚 Documentation

- **[ONEHACK_SUBMISSION.md](ONEHACK_SUBMISSION.md)** - Hackathon submission document
- **[Move Contracts](move/sources/)** - Smart contract source code with inline comments

## 🔗 Useful Links

### Sui Resources
- [Sui Documentation](https://docs.sui.io/)
- [Sui Move by Example](https://examples.sui.io/)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [dApp Kit](https://sdk.mystenlabs.com/dapp-kit)

### OneChain
- [OneHack 2.0 Website](https://onehackathon.com/)
- [OneChain Documentation](https://docs.onechain.com/)

## 🧪 Testing

```bash
# Test Move contracts
cd move
sui move test

# Run frontend (dev mode)
cd frontend
npm run dev

# Build for production
npm run build
```

## 🚀 Deployment

### Deploy to Sui Mainnet/OneChain

```bash
# Switch to mainnet
sui client switch --env mainnet

# Publish contracts
cd move
sui client publish --gas-budget 100000000
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
- OneChain & Sui Foundation
- Mysten Labs
- OneWallet team
- Next.js, TailwindCSS, React Query communities

---

**Status**: 🚀 Ready for Deployment

**Version**: 1.0.0

**Last Updated**: 2025-11-21
