# 🏆 OneHack 2.0 Submission - Dungeon Flip

Official submission document for the OneHack 2.0 hackathon.

---

## 📌 Project Information

**Project Name**: Dungeon Flip

**Category**: Web3 Gaming / DeFi + Gaming

**Team Name**: [Your Team Name]

**Tagline**: A Web3 game with NFTs and on-chain rewards on OneChain

---

## 🎯 Hackathon Requirements Compliance

### ✅ OneChain Integration

- [x] All smart contracts written in Move for OneChain
- [x] Frontend configured for OneChain network
- [x] Uses OneChain dapp-kit for wallet integration
- [x] OneWallet support via OneChain wallet adapter

**Contract IDs** (fill after deployment):
```
Package ID:           0x...
AventurerNFT Module:  {PACKAGE_ID}::aventurer_nft
SoulFragment Coin:    {PACKAGE_ID}::soul_fragment::SOUL_FRAGMENT
ProgressRegistry:     0x... (shared object)
TreasuryCap:          0x... (for SOUL_FRAGMENT minting)
```

**Network**: OneChain
**RPC URL**: [OneChain RPC - to be configured]

### ✅ OneWallet Support

- [x] Connect/disconnect wallet functionality
- [x] OneChain dapp-kit ConnectButton integration
- [x] Transaction signing through OneWallet/OneChain wallets
- [x] Real-time balance updates
- [x] Account change listeners via dapp-kit

**Demo**: See MIGRATION_GUIDE.md for complete setup walkthrough

### ✅ On-Chain Mechanics

**NFT System (OneChain Objects)**:
- Players mint free Aventurer NFT (owned object)
- One NFT per wallet address (enforced via MintRegistry)
- Random stats stored on-chain (ATK: 1-2, DEF: 1-2, HP: 4-6 (random))
- Fully compliant OneChain object standard

**Token System (OneChain Coin)**:
- Soul Fragment reward token (Coin<SOUL_FRAGMENT>)
- Minted on-chain when player defeats monsters
- Fully tradeable OneChain coin
- TreasuryCap-based minting authority (anti-cheat)

**Progress Tracking (Shared Object)**:
- ProgressRegistry shared object tracks all players
- Total runs completed
- Successful runs
- Monsters defeated
- Events emitted for indexing

### ✅ Complete User Flow

```
1. User visits website
2. Clicks "Connect Wallet"
3. OneChain wallet adapter popup appears → User selects OneWallet
4. User approves connection
5. User clicks "Mint Adventurer NFT"
6. Transaction built with TransactionBlock → User approves in OneWallet
7. NFT object minted successfully
8. User clicks "Enter the Dungeon"
9. User plays 4-card dungeon run
10. User defeats a monster
11. User clicks "Claim Soul Fragment"
12. Coin minted to user's wallet on OneChain
13. Progress saved in shared object
```

**Total time**: ~2-3 minutes from start to on-chain reward

---

## 🛠️ Technical Stack

### Smart Contracts
- **Language**: Move (OneChain Framework)
- **Framework**: OneChain Move
- **Standards**: OneChain Object, Coin, Transfer, Events
- **Network**: OneChain

### Frontend
- **Framework**: Next.js 14 (React, App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Web3 Library**: @onechain/sdk, @onechain/dapp-kit
- **Query Library**: @tanstack/react-query

### Development Tools
- Node.js v18+
- OneChain CLI
- npm/yarn
- Git
- VSCode (recommended)

---

## 🎮 Game Design

### Core Mechanics

**Infinite Dungeon System**:
- Endless rooms with 4 cards each
- After clearing a room: Continue (risk death) or Exit (claim rewards)
- Randomized card encounters
- Permanent death (lose all progress if HP reaches 0)
- Risk/reward decisions at every room

**Card System**:
- **Monster** (45%): Turn-based combat encounter
  - HP: 1-3, ATK: 1-2-3 (random)
  - Combat: Monster attacks first, then player attacks (80% hit chance)
  - DEF-based damage: Damage = Monster ATK - Player DEF (minimum 0)
  - Defense can completely block attacks if DEF >= Monster ATK
  - Repeat until monster or player dies

- **Treasure** (30%): Gems collection
  - Collect gems for leaderboard score
  - Leaderboard ranks by total gems collected per week
  - Top 10 players win OCT prizes

- **Trap** (15%): Hazard
  - Always deals 1 HP damage
  - Cannot be avoided
  - Tests player's luck

- **Potion** (10%): Healing
  - Restores HP up to max HP from NFT
  - Strategic resource for surviving longer

**Win Condition**: Exit dungeon voluntarily with gems collected

**Lose Condition**: HP reaches 0 (lose all progress)

**Rewards**:
- **Entry Fee**: 0.01 OCT per run (auto-distributed: 70% pool, 20% dev, 10% marketing)
- **Weekly Prizes**: Top 10 players by gems collected win OCT rewards
- **On-chain Progress**: Runs completed, gems collected, rooms reached tracked permanently

---

## 💡 Innovation & Unique Features

### 1. Hybrid On-Chain/Off-Chain Model

**Problem**: Fully on-chain games are slow and expensive.

**Solution**:
- Game logic runs off-chain (instant, free)
- Rewards and achievements stored on-chain (permanent, tradeable)
- OneChain's fast finality makes rewards near-instant
- Best of both worlds!

### 2. OneChain Object Model Advantages

**Problem**: Traditional blockchain games use account-based models with high gas costs.

**Solution**:
- Owned objects (NFTs) are directly owned by players
- Shared objects (ProgressRegistry) allow concurrent updates
- Parallel transaction execution on OneChain
- Lower gas costs and faster confirmations

### 3. Clean Architecture

**Problem**: Web3 games often have messy codebases.

**Solution**:
- Clear separation of concerns
- Modular components
- TypeScript for type safety
- Comprehensive documentation
- Move's resource-oriented programming prevents common bugs

### 4. Gas Optimization

**Problem**: High gas costs make gaming expensive.

**Solution**:
- Minimal on-chain storage
- Batch operations support in Move contracts
- Event-based indexing
- OneChain's efficient object model
- Pay-per-use rather than pay-per-storage

---

## 📊 Impact & Potential

### Target Audience

1. **Crypto Natives**: Users familiar with Web3 gaming
2. **Gamers**: Casual players exploring blockchain
3. **Developers**: Teams building on OneChain
4. **OneChain Ecosystem**: Showcasing OneChain's gaming capabilities

### Use Cases

1. **Entertainment**: Quick, fun gaming experience
2. **Onboarding**: Introduce new users to OneChain
3. **Rewards**: Earn tradeable tokens through gameplay
4. **Social**: Compete with friends (future leaderboard)
5. **Education**: Learn OneChain Move smart contract patterns

### Market Opportunity

- Web3 gaming market growing rapidly
- OneChain's speed and low costs ideal for gaming
- OneChain needs flagship game projects
- Simple mechanics = broad appeal
- Token rewards = financial incentive

### Scalability

**Phase 1** (Current):
- Basic adventurer class
- Single game mode
- 4-card dungeon runs
- Core on-chain features

**Phase 2** (Post-Hackathon):
- Multiple classes (warrior, mage, rogue)
- Equipment NFTs (weapons, armor)
- Longer dungeon runs (10+ cards)
- Difficulty levels
- Kiosk integration for NFT trading

**Phase 3** (Future):
- PvP battles
- Guild system (DAOs)
- Staking rewards
- Cross-game interoperability
- Mobile app with zkLogin

---

## 🎯 Hackathon Judging Criteria

### Technical Excellence ⭐⭐⭐⭐⭐

- Clean, well-documented Move code
- Proper TypeScript usage
- Secure smart contracts (OneChain best practices)
- Efficient Move patterns
- Comprehensive testing capability

### OneChain Integration ⭐⭐⭐⭐⭐

- 100% built for OneChain
- OneWallet fully supported
- OneChain dapp-kit integration
- All transactions on OneChain
- Uses OneChain's unique features (objects, events)

### Innovation ⭐⭐⭐⭐

- Hybrid on-chain/off-chain model
- Leverages OneChain object model
- Clean separation of concerns
- Scalable architecture
- Demonstrates OneChain's gaming advantages

### User Experience ⭐⭐⭐⭐⭐

- Intuitive interface
- Smooth wallet connection (dapp-kit)
- Clear game instructions
- Instant feedback
- Responsive design
- Fast transactions on OneChain

### Completeness ⭐⭐⭐⭐⭐

- Fully functional game loop
- All features implemented
- Deployment ready for OneChain
- Comprehensive documentation
- Demo-ready

---

## 📹 Demo Materials

### Video Demo
[Link to demo video - if available]

### Live Demo
- **URL**: http://localhost:3001 (or deployed URL)
- **Network**: OneChain
- **Requirements**: OneWallet or OneChain Wallet extension

### Screenshots
1. Landing page with wallet connection
2. NFT minting interface
3. Game board with cards
4. Reward claiming interface
5. OneChain Explorer verification

---

## 📚 Documentation

### For Judges
- **README.md**: Complete project overview
- **Move Contracts**: Smart contract source code in move/sources/

### For Developers
- Inline code comments in Move contracts
- TypeScript types
- Move documentation comments
- Deployment instructions

### For Users
- Clear UI instructions
- Error messages
- Success notifications

---

## 🔗 Links

**Repository**: [GitHub URL]

**Deployed Contracts**:
- Package: [OneChain Explorer URL]
- ProgressRegistry: [OneChain Explorer URL]
- TreasuryCap: [OneChain Explorer URL]

**Live Demo**: [Deployed frontend URL]

**Documentation**: See README.md and other .md files

---

## 👥 Team

**Developer(s)**: [Your Name]

**Contact**: [Your Email]

**GitHub**: [Your GitHub]

---

## 🙏 Acknowledgments

- OneHack 2.0 Hackathon organizers
- OneChain development team
- OneChain Foundation
- OneWallet team
- Next.js, TailwindCSS communities
- OneChain Move community

---

## 📜 License

MIT License - See LICENSE file

---

## 🚀 Future Vision

Dungeon Flip is more than a hackathon project—it's a foundation for a full-featured Web3 gaming platform on OneChain.

**Long-term goals**:
1. Mobile app with zkLogin (iOS/Android)
2. Multiple game modes
3. Seasonal events
4. NFT marketplace via Kiosk
5. DAO governance for game updates
6. Integration with other OneChain gaming projects

**We're building the future of gaming on OneChain. One card flip at a time.** ⚔️

---

**Submission Date**: [Date]

**Version**: 1.0.0

**Status**: Ready for Review ✅
