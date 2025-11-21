# 🎬 Demo Guide - Dungeon Flip Lite

Complete guide for demoing the project at OneHack 2.0.

## 📋 Pre-Demo Checklist

### Before the Presentation

- [ ] Deploy contracts to OneChain testnet/mainnet
- [ ] Verify contracts on block explorer
- [ ] Build frontend (`npm run frontend:build`)
- [ ] Test complete flow locally
- [ ] Prepare demo wallet with testnet tokens
- [ ] Have block explorer tab ready
- [ ] Take screenshots of successful transactions

### Demo Environment Setup

```bash
# 1. Ensure contracts are deployed
npm run deploy:onechain

# 2. Start frontend
npm run frontend:dev

# 3. Open browser to http://localhost:3000
```

---

## 🎯 Demo Script (2-3 minutes)

### Opening (15 seconds)

> "Hi! I'm presenting **Dungeon Flip Lite**, a Web3 roguelite game built on OneChain for the OneHack 2.0 hackathon.
>
> This project demonstrates complete Web3 gaming integration: NFT minting, token rewards, and on-chain progress tracking—all using OneChain and OneWallet."

### Part 1: Project Overview (30 seconds)

**[Show landing page]**

> "The game is simple but demonstrates key Web3 concepts:
>
> 1. Players connect their OneWallet
> 2. Mint a free Adventurer NFT with fixed stats
> 3. Play dungeon runs by flipping 4 random cards
> 4. Face monsters, treasures, and traps
> 5. Earn Soul Fragment tokens for defeating monsters
> 6. All progress is stored permanently on OneChain"

### Part 2: Live Demo (90 seconds)

#### Step 1: Connect Wallet (10s)

**[Click "Connect OneWallet"]**

> "First, I'll connect my OneWallet..."

**[Show wallet popup, confirm]**

> "And we're connected! You can see my wallet address and current Soul Fragment balance here."

#### Step 2: Mint NFT (20s)

**[Click "Mint Adventurer NFT"]**

> "Now I'll mint my free Adventurer NFT. Each wallet gets one free mint."

**[Show transaction in wallet, confirm]**

> "This creates an ERC-721 NFT with fixed stats: 1 ATK, 1 DEF, 4 HP. The NFT is now in my wallet and verifiable on-chain."

**[Show minted stats]**

#### Step 3: Play Game (40s)

**[Click "Enter the Dungeon"]**

> "Let's play a dungeon run! Each run has 4 random cards."

**[Click first card - Treasure]**

> "First card: Treasure! I collect gold."

**[Click second card - Monster]**

> "Second card: Monster with ATK 2. My adventurer has DEF 1, so I block 1 damage and take 1 HP damage, surviving the encounter!"

**[Point to "Claim Reward" button]**

> "Notice the 'Claim Soul Fragment' button appears. I'll claim this after the run."

**[Click third card - Trap]**

> "Third card: Trap! I lose 1 HP."

**[Click fourth card - Treasure]**

> "Last card: Another treasure! I survived with 2 HP remaining. Notice that gold is tracked in the frontend for cosmetic purposes."

**[Show results screen]**

#### Step 4: Claim Reward (20s)

**[Click "Claim Soul Fragment"]**

> "Now I'll claim my on-chain reward for defeating that monster."

**[Show wallet transaction, confirm]**

> "This mints 1 Soul Fragment token (ERC-20) to my wallet and records my monster kill on-chain."

**[Show updated balance]**

> "You can see my Soul Fragment balance increased from 0 to 1."

### Part 3: On-Chain Verification (30 seconds)

**[Switch to block explorer]**

> "Everything is verifiable on OneChain's block explorer:
>
> - Here's my Adventurer NFT contract with all minted tokens
> - Here's the Soul Fragment token contract with my balance
> - And here's the DungeonProgress contract storing runs and kills
>
> All game progress is permanently stored on-chain and fully transparent."

### Closing (15 seconds)

> "To summarize: Dungeon Flip Lite is a complete Web3 game with NFTs, tokens, and on-chain stats—all built on OneChain with OneWallet integration.
>
> The code is modular, well-documented, and ready for expansion with features like PvP, equipment, and leaderboards.
>
> Thank you!"

---

## 🗣️ Key Points to Emphasize

### Technical Highlights

1. **Complete OneChain Integration**
   - Custom network configuration
   - Seamless wallet switching
   - All contracts deployed on OneChain

2. **OneWallet Support**
   - Native integration
   - Automatic network detection
   - Transaction signing flow

3. **Smart Contract Architecture**
   - 3 separate contracts (NFT, Token, Progress)
   - Authorization system
   - OpenZeppelin standards

4. **Clean Code**
   - TypeScript throughout
   - Modular components
   - Comprehensive documentation

### Game Design Highlights

1. **Simple but Engaging**
   - Easy to understand
   - Quick gameplay loop
   - Clear win/loss conditions

2. **Hybrid On-Chain/Off-Chain**
   - Game logic off-chain (fast, no gas)
   - Rewards on-chain (tradeable, verifiable)
   - Progress on-chain (permanent record)

3. **Scalable Design**
   - Room for additional features
   - Multiple game modes possible
   - Upgradeable stats system

---

## 🎥 Alternative Demo Flows

### Short Demo (1 minute)

Use if time is limited:

1. **Show landing page** → "Web3 roguelite on OneChain"
2. **Connect wallet** → "OneWallet integration"
3. **Show already-minted NFT** → "ERC-721 with stats"
4. **Play one card** → "Defeat monster"
5. **Claim reward** → "On-chain ERC-20 token"
6. **Show block explorer** → "Fully verifiable"

### Extended Demo (5 minutes)

Use if you have extra time:

- Show contract source code
- Explain state management (Zustand)
- Demonstrate responsive design
- Show deployment scripts
- Discuss future roadmap
- Answer technical questions

---

## 🐛 Troubleshooting During Demo

### "Transaction failed"

**Stay calm!**

> "Looks like we hit a gas issue. Let me try again with adjusted gas."

**Or show backup transaction:**

> "I have a successful transaction from earlier testing. Let me show you that..."

### "Wallet not connecting"

**Have backup plan:**

> "Let me switch to my backup wallet..."

**Or use screenshots:**

> "I have screenshots of the successful flow. Here's what it looks like..."

### "Network error"

**Explain gracefully:**

> "We're hitting a network issue, but the key point is the architecture. Let me show you the code instead..."

---

## 📸 Backup Materials

### Screenshots to Prepare

1. Successful wallet connection
2. Minted NFT with stats
3. Complete game run (all 4 cards)
4. Reward claim transaction
5. Block explorer showing contracts
6. Block explorer showing transactions

### Code Snippets to Show

```solidity
// AventurerNFT.sol - Minting function
function mintBasicAventurer() external returns (uint256) {
    require(!hasMinted[msg.sender], "Already minted");
    uint256 tokenId = _tokenIdCounter++;
    _safeMint(msg.sender, tokenId);
    // ...
}
```

```typescript
// gameLogic.ts - Card generation
export const generateCard = (id: number): GameCard => {
  const random = Math.random();
  if (random < 0.1) return TRAP;
  if (random < 0.4) return TREASURE;
  return MONSTER;
};
```

---

## 🎤 Q&A Preparation

### Expected Questions

**Q: Why store progress on-chain if game logic is off-chain?**

> "Great question! Game logic off-chain keeps gameplay fast and gas-free. But storing achievements on-chain makes them permanent, verifiable, and potentially usable in other games or systems."

**Q: How do you prevent cheating?**

> "The reward distribution is controlled by authorized contracts only. Players can't directly mint tokens—they must go through the authorized DungeonProgress contract, which we control."

**Q: What's next for the project?**

> "Post-hackathon, we plan to add multiple adventurer classes, an equipment system with more NFTs, PvP battles, and a leaderboard contract. The architecture is designed for easy expansion."

**Q: Gas costs?**

> "Minting an adventurer costs ~80k gas, claiming a reward ~50k. We optimized by keeping game logic off-chain and only storing essential data on-chain."

---

## ✅ Final Checklist

Before going on stage:

- [ ] Contracts deployed and verified
- [ ] Frontend running smoothly
- [ ] Demo wallet loaded with tokens
- [ ] Block explorer bookmarked
- [ ] Backup screenshots ready
- [ ] Timer set for 2-3 minutes
- [ ] Confident in demo flow

**Good luck! You've got this! 🚀**

---

**Practice makes perfect. Run through the demo 3-5 times before presenting.**
