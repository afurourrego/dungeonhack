# 🏆 OneHack 2.0 Submission - Dungeon Flip Lite

Official submission document for the OneHack 2.0 hackathon.

---

## 📌 Project Information

**Project Name**: Dungeon Flip Lite

**Category**: Web3 Gaming / DeFi + Gaming

**Team Name**: [Your Team Name]

**Tagline**: A Web3 roguelite mini-game with NFTs and on-chain rewards on OneChain (Sui-based)

---

## 🎯 Hackathon Requirements Compliance

### ✅ OneChain Integration

- [x] All smart contracts written in Move for Sui/OneChain
- [x] Frontend configured for OneChain (Sui-based) network
- [x] Uses Sui dapp-kit for wallet integration
- [x] OneWallet support via Sui wallet adapter

**Contract IDs** (fill after deployment):
```
Package ID:           0x...
AventurerNFT Module:  {PACKAGE_ID}::aventurer_nft
SoulFragment Coin:    {PACKAGE_ID}::soul_fragment::SOUL_FRAGMENT
ProgressRegistry:     0x... (shared object)
TreasuryCap:          0x... (for SOUL_FRAGMENT minting)
```

**Network**: OneChain (Sui-based)
**RPC URL**: [OneChain Sui RPC - to be configured]

### ✅ OneWallet Support

- [x] Connect/disconnect wallet functionality
- [x] Sui dapp-kit ConnectButton integration
- [x] Transaction signing through OneWallet/Sui wallets
- [x] Real-time balance updates
- [x] Account change listeners via dapp-kit

**Demo**: See MIGRATION_GUIDE.md for complete setup walkthrough

### ✅ On-Chain Mechanics

**NFT System (Sui Objects)**:
- Players mint free Aventurer NFT (owned object)
- One NFT per wallet address (enforced via MintRegistry)
- Fixed stats stored on-chain (ATK 1, DEF 1, HP 4)
- Fully compliant Sui object standard

**Token System (Sui Coin)**:
- Soul Fragment reward token (Coin<SOUL_FRAGMENT>)
- Minted on-chain when player defeats monsters
- Fully tradeable Sui coin
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
3. Sui wallet adapter popup appears → User selects OneWallet
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
- **Language**: Move (Sui Framework)
- **Framework**: Sui Move
- **Standards**: Sui Object, Coin, Transfer, Events
- **Network**: OneChain (Sui-based)

### Frontend
- **Framework**: Next.js 14 (React, App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Web3 Library**: @mysten/sui, @mysten/dapp-kit
- **Query Library**: @tanstack/react-query

### Development Tools
- Node.js v18+
- Sui CLI
- npm/yarn
- Git
- VSCode (recommended)

---

## 🎮 Game Design

### Core Mechanics

**Roguelite Elements**:
- Randomized card encounters
- Risk/reward decisions
- Permanent death (lose run)
- Progressive difficulty (future)

**Card System**:
- **Monster** (60%): Combat encounter
  - ATK values: 1, 2, or 3 (random)
  - DEF-based combat: Damage = Monster ATK - Player DEF
  - Player survives if remaining HP > 0
  - Monsters count only when player survives the encounter

- **Treasure** (30%): Reward
  - Gold values: 10, 20, or 30 (random)
  - Tracked off-chain in frontend (cosmetic)
  - Future: Purchase upgrades

- **Trap** (10%): Hazard
  - Always deals 1 HP damage
  - Cannot be avoided
  - Tests player's luck

**Win Condition**: Complete all 4 cards with HP > 0

**Lose Condition**: HP reaches 0

**Rewards**:
- Off-chain: Gold and monsters defeated count (tracked in frontend, cosmetic)
- On-chain: Soul Fragment coins (per monster defeated, synced at run end)
- On-chain: Progress stats (permanent record in shared object)
- Treasury system for secure entry fee collection (future feature)

---

## 💡 Innovation & Unique Features

### 1. Hybrid On-Chain/Off-Chain Model

**Problem**: Fully on-chain games are slow and expensive.

**Solution**:
- Game logic runs off-chain (instant, free)
- Rewards and achievements stored on-chain (permanent, tradeable)
- Sui's fast finality makes rewards near-instant
- Best of both worlds!

### 2. Sui Object Model Advantages

**Problem**: Traditional blockchain games use account-based models with high gas costs.

**Solution**:
- Owned objects (NFTs) are directly owned by players
- Shared objects (ProgressRegistry) allow concurrent updates
- Parallel transaction execution on Sui
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
- Sui's efficient object model
- Pay-per-use rather than pay-per-storage

---

## 📊 Impact & Potential

### Target Audience

1. **Crypto Natives**: Users familiar with Web3 gaming
2. **Gamers**: Casual players exploring blockchain
3. **Developers**: Teams building on OneChain/Sui
4. **Sui Ecosystem**: Showcasing Sui's gaming capabilities

### Use Cases

1. **Entertainment**: Quick, fun gaming experience
2. **Onboarding**: Introduce new users to OneChain/Sui
3. **Rewards**: Earn tradeable tokens through gameplay
4. **Social**: Compete with friends (future leaderboard)
5. **Education**: Learn Sui Move smart contract patterns

### Market Opportunity

- Web3 gaming market growing rapidly
- Sui's speed and low costs ideal for gaming
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
- Secure smart contracts (Sui best practices)
- Efficient Move patterns
- Comprehensive testing capability

### OneChain Integration ⭐⭐⭐⭐⭐

- 100% built for Sui/OneChain
- OneWallet fully supported
- Sui dapp-kit integration
- All transactions on OneChain
- Uses Sui's unique features (objects, events)

### Innovation ⭐⭐⭐⭐

- Hybrid on-chain/off-chain model
- Leverages Sui object model
- Clean separation of concerns
- Scalable architecture
- Demonstrates Sui's gaming advantages

### User Experience ⭐⭐⭐⭐⭐

- Intuitive interface
- Smooth wallet connection (dapp-kit)
- Clear game instructions
- Instant feedback
- Responsive design
- Fast transactions on Sui

### Completeness ⭐⭐⭐⭐⭐

- Fully functional game loop
- All features implemented
- Deployment ready for Sui/OneChain
- Comprehensive documentation
- Demo-ready

---

## 📹 Demo Materials

### Video Demo
[Link to demo video - if available]

### Live Demo
- **URL**: http://localhost:3001 (or deployed URL)
- **Network**: OneChain (Sui-based)
- **Requirements**: OneWallet or Sui Wallet extension

### Screenshots
1. Landing page with wallet connection
2. NFT minting interface
3. Game board with cards
4. Reward claiming interface
5. Sui Explorer verification

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
- Package: [Sui Explorer URL]
- ProgressRegistry: [Sui Explorer URL]
- TreasuryCap: [Sui Explorer URL]

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
- Sui Foundation and Mysten Labs
- OneWallet team
- Next.js, TailwindCSS communities
- Sui Move community

---

## 📜 License

MIT License - See LICENSE file

---

## 🚀 Future Vision

Dungeon Flip Lite is more than a hackathon project—it's a foundation for a full-featured Web3 gaming platform on OneChain/Sui.

**Long-term goals**:
1. Mobile app with zkLogin (iOS/Android)
2. Multiple game modes
3. Seasonal events
4. NFT marketplace via Kiosk
5. DAO governance for game updates
6. Integration with other Sui gaming projects

**We're building the future of gaming on OneChain. One card flip at a time.** ⚔️

---

**Submission Date**: [Date]

**Version**: 1.0.0

**Status**: Ready for Review ✅
