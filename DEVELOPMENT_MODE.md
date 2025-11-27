# 🚧 Development Mode - Testing Without Blockchain

This guide explains how to test **Dungeon Flip Lite** locally without deploying smart contracts.

---

## Why Development Mode?

**Problem**: You want to test the game mechanics, UI, and user flow, but:
- ❌ You don't have OneChain CLI installed yet
- ❌ Contracts aren't deployed to testnet
- ❌ You don't have testnet OCT tokens
- ❌ You just want to see how the game works

**Solution**: Enable **Dev Mode** to bypass blockchain requirements and test the full game loop.

---

## How to Enable Dev Mode

### 1. Create `.env.local` file

In the `frontend/` directory, create a file named `.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

### 2. Edit `.env.local`

Set `NEXT_PUBLIC_DEV_MODE=true`:

```env
# Development Mode - Set to "true" to test game without deployed contracts
NEXT_PUBLIC_DEV_MODE=true

# Leave these empty for dev mode
NEXT_PUBLIC_PACKAGE_ID=
NEXT_PUBLIC_GAME_ADMIN_ID=
NEXT_PUBLIC_MINT_REGISTRY_ID=
NEXT_PUBLIC_PROGRESS_REGISTRY_ID=
```

### 3. Restart the development server

**IMPORTANT**: You must restart the server for environment variables to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## What Works in Dev Mode

### ✅ Fully Functional
- **Connect Wallet**: Connect OneChain Wallet or OneWallet
- **Skip NFT Minting**: Click "Skip & Play (Demo Mode)" button
- **Play Full Game**:
  - Start dungeon run
  - Flip 4 cards
  - Battle monsters
  - Collect treasures
  - Avoid traps
  - Win/lose conditions
- **Claim Rewards**: Simulate claiming Soul Fragments (no blockchain transaction)
- **Play Again**: Reset and start new runs
- **All UI/UX**: Test complete user experience

### ⚠️ Simulated (Not Real Blockchain)
- NFT minting (just sets a flag)
- Soul Fragment rewards (no actual tokens minted)
- Progress tracking (not saved on-chain)

---

## User Flow in Dev Mode

```
1. Open http://localhost:3000
2. Click "Connect Wallet" → Connect OneChain Wallet
3. See "Mint Adventurer NFT" screen
4. Click "Skip & Play (Demo Mode)" button 🚧
5. Click "Enter the Dungeon"
6. Play the full game:
   - Flip cards
   - Battle monsters
   - Reach end of run
7. Click "Claim Soul Fragment" (simulated)
8. Click "Play Again" to test multiple runs
```

---

## Visual Indicators

When dev mode is active, you'll see:

- 🚧 **"Dev Mode: Skip blockchain minting"** on mint screen
- 🚧 **"Simulate claiming Soul Fragment reward (Demo Mode)"** on reward screen
- Yellow text warnings indicating dev mode features

---

## Switching to Production Mode

When you're ready to deploy contracts and use real blockchain:

### 1. Deploy Contracts

```bash
cd move
onechain move build
onechain client publish --gas-budget 100000000
```

### 2. Update `.env.local`

```env
# Disable dev mode
NEXT_PUBLIC_DEV_MODE=false

# Add your deployed contract IDs
NEXT_PUBLIC_PACKAGE_ID=0xabc123...
NEXT_PUBLIC_GAME_ADMIN_ID=0xdef456...
NEXT_PUBLIC_MINT_REGISTRY_ID=0xghi789...
NEXT_PUBLIC_PROGRESS_REGISTRY_ID=0xjkl012...
```

### 3. Restart Server

```bash
# Stop and restart
npm run dev
```

Now the game will use real blockchain transactions!

---

## Testing Checklist

Use dev mode to test these scenarios:

- [ ] Wallet connection flow
- [ ] Minting screen UI
- [ ] Skip to game button works
- [ ] Navigate to game page
- [ ] Start new dungeon run
- [ ] Flip all 4 cards
- [ ] Monster combat (win/lose)
- [ ] Treasure collection
- [ ] Trap damage
- [ ] Win condition (survive 4 cards)
- [ ] Lose condition (HP = 0)
- [ ] Reward claim flow
- [ ] Play multiple runs
- [ ] Disconnect wallet

---

## Troubleshooting

### "Skip & Play" button not showing
- ✅ Check `.env.local` exists in `frontend/` directory
- ✅ Verify `NEXT_PUBLIC_DEV_MODE=true` is set
- ✅ Restart the dev server (Ctrl+C then `npm run dev`)
- ✅ Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Changes not taking effect
- ✅ Always restart dev server after changing `.env.local`
- ✅ Clear browser cache
- ✅ Check browser console for errors

### Still shows "Mint Adventurer NFT" only
- ✅ Click the **"Skip & Play (Demo Mode)"** button (appears below main mint button)
- ✅ This sets the NFT flag without blockchain

---

## Notes

- **Dev mode is for testing only** - no real tokens are minted
- **Don't use dev mode in production** - always deploy contracts for real users
- **Progress isn't saved** - refreshing the page resets everything
- **Perfect for development** - test game mechanics without blockchain complexity

---

## Next Steps

Once you've tested in dev mode:

1. **Install OneChain CLI** - [Installation Guide](https://docs.sui.io/guides/developer/getting-started/sui-install)
2. **Deploy Contracts** - Follow [README.md](README.md) deployment instructions
3. **Configure Production** - Update `.env.local` with contract IDs
4. **Test on Testnet** - Full blockchain integration testing
5. **Deploy to Mainnet** - Production deployment

---

**Happy Testing!** 🎮
