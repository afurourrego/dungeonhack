# 🚀 Quick Start Guide - Dungeon Flip

Get your game running in 5 minutes!

## ⚡ Fast Setup

### 1. Install Everything

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure OneChain

```bash
# Copy environment template
cp .env.example .env
```

**Edit `.env` with your OneChain details:**

```env
ONECHAIN_RPC_URL=https://rpc.onechain.network
ONECHAIN_CHAIN_ID=1
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
```

⚠️ **Important**: Never commit your private key!

### 3. Deploy Contracts

```bash
# Compile contracts
npm run compile

# Deploy to OneChain
npm run deploy:onechain
```

✅ Contracts will be deployed and addresses saved automatically.

### 4. Run Frontend

```bash
npm run frontend:dev
```

🎮 Open http://localhost:3000

## 🎯 Test the Game

1. **Connect OneWallet** (make sure you have testnet tokens)
2. **Mint Adventurer NFT** (free, one per wallet)
3. **Start Dungeon Run**
4. **Flip Cards** (4 per run)
5. **Claim Rewards** (if you defeat monsters)

## 🐛 Troubleshooting

### "OneWallet is not installed"
→ Install OneWallet browser extension

### "Failed to connect wallet"
→ Check if you're on the correct network
→ Run: Check wallet is unlocked

### "Transaction failed"
→ Ensure you have enough testnet tokens
→ Check gas limits in transactions

### "Contracts not found"
→ Run `npm run deploy:onechain` first
→ Check `deployments/onechain.json` exists

## 📝 Quick Commands

```bash
# Compile contracts
npm run compile

# Deploy to OneChain
npm run deploy:onechain

# Verify contracts
npm run verify

# Run frontend dev server
npm run frontend:dev

# Build frontend for production
npm run frontend:build
```

## 🎮 Demo Flow

For hackathon judges:

1. Show landing page → Connect wallet
2. Mint Adventurer NFT → Show stats
3. Play dungeon run → Reveal cards
4. Defeat monster → Claim Soul Fragment
5. Show on-chain verification

**Demo time**: ~2 minutes

## 💡 Need Help?

- Read full README.md
- Check OneChain documentation
- Verify contract addresses in deployments/

---

**Happy hacking! ⚔️**
