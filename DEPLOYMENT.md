# 🚀 Deployment Guide - Dungeon Flip

Complete guide for deploying Dungeon Flip to OneChain.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Node.js v18+ installed
- [x] npm or yarn package manager
- [x] OneWallet browser extension installed
- [x] OneChain testnet/mainnet account
- [x] Testnet/mainnet tokens for gas fees
- [x] Private key with sufficient balance

---

## 🔧 Step 1: Environment Setup

### 1.1 Clone and Install

```bash
# Navigate to project directory
cd DungeonFlip

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 1.2 Configure Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your OneChain configuration:

```env
# OneChain Network Configuration
ONECHAIN_RPC_URL=https://rpc.onechain.network
ONECHAIN_CHAIN_ID=1

# Deployer Private Key (NEVER commit this!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Treasury Address (optional)
TREASURY_ADDRESS=your_treasury_address_here

# Block Explorer API Key (optional, for verification)
ONECHAIN_EXPLORER_API_KEY=your_api_key_here
```

⚠️ **Security Warning**: Never commit your private key to git!

### 1.3 Verify Configuration

Test your configuration:

```bash
# Compile contracts
npm run compile
```

Expected output:
```
Compiled 3 Solidity files successfully
```

---

## 📦 Step 2: Deploy Smart Contracts

### 2.1 Deploy to OneChain

```bash
npm run deploy:onechain
```

**This will**:
1. Deploy `AventurerNFT.sol`
2. Deploy `SoulFragmentToken.sol`
3. Deploy `DungeonProgress.sol`
4. Configure contract authorizations
5. Save deployment addresses to:
   - `deployments/onechain.json`
   - `frontend/src/lib/contracts.ts` (auto-generated)

**Expected output**:
```
🎮 Starting Dungeon Flip deployment...

📍 Deploying contracts with account: 0x...
💰 Account balance: X.XX ETH

🗡️  Deploying AventurerNFT...
✅ AventurerNFT deployed to: 0x...

💎 Deploying SoulFragmentToken...
✅ SoulFragmentToken deployed to: 0x...

🏰 Deploying DungeonProgress...
✅ DungeonProgress deployed to: 0x...

⚙️  Configuring contracts...
✅ DungeonProgress authorized as reward distributor
✅ Deployer authorized as game contract

💾 Deployment info saved to: deployments/onechain.json
📝 Frontend config saved to: frontend/src/lib/contracts.ts

====================================================================
🎉 DEPLOYMENT COMPLETE!
====================================================================
```

### 2.2 Save Contract Addresses

Contract addresses are automatically saved to:

**File**: `deployments/onechain.json`
```json
{
  "network": "onechain",
  "chainId": 1,
  "deployedAt": "2025-11-20T...",
  "deployer": "0x...",
  "contracts": {
    "AventurerNFT": "0x...",
    "SoulFragmentToken": "0x...",
    "DungeonProgress": "0x..."
  }
}
```

**File**: `frontend/src/lib/contracts.ts` (auto-generated)
```typescript
export const CONTRACT_ADDRESSES = {
  AVENTURER_NFT: "0x...",
  SOUL_FRAGMENT_TOKEN: "0x...",
  DUNGEON_PROGRESS: "0x...",
} as const;
```

### 2.3 Verify Contracts (Optional but Recommended)

```bash
npm run verify:onechain
```

This verifies your contracts on OneChain's block explorer for transparency.

---

## 🌐 Step 3: Deploy Frontend

### 3.1 Configure Frontend Environment

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
# OneChain Network Configuration
NEXT_PUBLIC_ONECHAIN_RPC_URL=https://rpc.onechain.network
NEXT_PUBLIC_ONECHAIN_CHAIN_ID=1

# Contract Addresses (auto-filled by deployment script)
NEXT_PUBLIC_AVENTURER_NFT_ADDRESS=0x...
NEXT_PUBLIC_SOUL_FRAGMENT_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_DUNGEON_PROGRESS_ADDRESS=0x...
```

**Note**: If you used the deployment script, `frontend/src/lib/contracts.ts` already has the addresses. The `.env.local` is optional backup configuration.

### 3.2 Build Frontend

```bash
npm run frontend:build
```

This creates an optimized production build in `frontend/.next/`.

### 3.3 Deploy Options

#### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables from `.env.local`
7. Click "Deploy"

**Result**: Your app will be live at `https://your-app.vercel.app`

#### Option B: Netlify

1. Build locally: `npm run frontend:build`
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `frontend/.next` folder
4. Configure environment variables
5. Deploy

#### Option C: Self-Hosted (VPS)

```bash
# On your server

# Install dependencies
npm install --production

# Build frontend
npm run frontend:build

# Start production server
npm run frontend:start
```

Use PM2 or similar for process management:

```bash
pm2 start "npm run frontend:start" --name dungeon-flip
```

#### Option D: Local Testing

For testing before deploying:

```bash
npm run frontend:dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Smart Contracts

Visit OneChain block explorer and verify:

1. **AventurerNFT Contract**:
   - Has `mintBasicAventurer` function
   - Shows 0 total supply (before any mints)

2. **SoulFragmentToken Contract**:
   - Has `reward` function
   - Shows 0 total supply (before any rewards)

3. **DungeonProgress Contract**:
   - Has `recordRun` function
   - Is authorized as reward distributor

### 4.2 Test Frontend Connection

1. Open your deployed frontend
2. Click "Connect OneWallet"
3. Verify wallet connects successfully
4. Check network is OneChain (Chain ID: 1)

### 4.3 End-to-End Test

Complete a full game flow:

1. Connect OneWallet ✅
2. Mint Adventurer NFT ✅
3. Start dungeon run ✅
4. Complete 4 cards ✅
5. Claim Soul Fragment (if defeated monster) ✅
6. Verify token balance increased ✅

---

## 🔍 Step 5: Post-Deployment Tasks

### 5.1 Update Documentation

Update the following with your deployed addresses:

**File**: `README.md`
```markdown
## Deployed Contracts

- **AventurerNFT**: [0x...](https://explorer.onechain.network/address/0x...)
- **SoulFragmentToken**: [0x...](https://explorer.onechain.network/address/0x...)
- **DungeonProgress**: [0x...](https://explorer.onechain.network/address/0x...)

**Live Demo**: https://your-app.vercel.app
```

**File**: `ONEHACK_SUBMISSION.md`
```markdown
## Contract Addresses

AventurerNFT:       0x...
SoulFragmentToken:  0x...
DungeonProgress:    0x...

**Live Demo**: https://your-app.vercel.app
```

### 5.2 Create Demo Account

Set up a demo wallet for judges:

1. Create new OneWallet account
2. Get testnet tokens from faucet
3. Mint an Adventurer NFT
4. Play 1-2 successful runs
5. Note the wallet address for demos

### 5.3 Monitor Transactions

Set up monitoring for:

- NFT mints
- Token claims
- Game completions

Use OneChain block explorer or create custom dashboard.

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution**:
- Ensure deployer account has enough OneChain tokens
- Check gas price settings in `hardhat.config.js`

### Issue: "Contract already deployed"

**Solution**:
- Delete `deployments/onechain.json`
- Run deployment again
- Or update addresses manually

### Issue: "Network connection failed"

**Solution**:
- Verify `ONECHAIN_RPC_URL` is correct
- Check if RPC endpoint is accessible
- Try alternative RPC if available

### Issue: "Transaction reverted"

**Solution**:
- Check deployer has correct permissions
- Verify contract code compiled successfully
- Review error message for specific issue

### Issue: "Frontend shows wrong addresses"

**Solution**:
- Verify `frontend/src/lib/contracts.ts` has correct addresses
- Clear Next.js cache: `rm -rf frontend/.next`
- Rebuild: `npm run frontend:build`

---

## 📊 Deployment Checklist

Before submitting to hackathon:

- [ ] All contracts deployed to OneChain
- [ ] Contracts verified on block explorer
- [ ] Frontend built and deployed
- [ ] End-to-end test completed successfully
- [ ] Documentation updated with addresses
- [ ] Demo account prepared
- [ ] Screenshots/video recorded
- [ ] ONEHACK_SUBMISSION.md completed

---

## 🔄 Redeployment

If you need to redeploy (e.g., found a bug):

```bash
# 1. Clean old deployment
npm run clean
rm deployments/onechain.json

# 2. Fix contracts/frontend

# 3. Recompile
npm run compile

# 4. Redeploy
npm run deploy:onechain

# 5. Rebuild frontend
npm run frontend:build

# 6. Test again
```

---

## 📞 Support

If you encounter issues during deployment:

1. Check this guide thoroughly
2. Review error messages carefully
3. Check OneChain documentation
4. Review Hardhat documentation
5. Ask in OneHack community

---

## 🎉 Deployment Complete!

Congratulations! Your Dungeon Flip game is now live on OneChain.

**Next Steps**:
1. Test thoroughly
2. Prepare demo presentation
3. Submit to OneHack 2.0
4. Share with community

**⚔️ Good luck with the hackathon!**

---

*Last Updated: November 2025*
*Version: 1.0.0*
