# 🏗️ Architecture Documentation - Dungeon Flip Lite

Technical overview of the project structure and design decisions.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Smart Contracts](#smart-contracts)
3. [Frontend Architecture](#frontend-architecture)
4. [State Management](#state-management)
5. [Blockchain Integration](#blockchain-integration)
6. [Game Logic](#game-logic)
7. [Design Decisions](#design-decisions)

---

## Overview

**Dungeon Flip Lite** is a Web3 roguelite game with a clear separation between:
- **On-chain logic** (Smart contracts on OneChain)
- **Off-chain logic** (Frontend game mechanics)
- **Hybrid rewards** (On-chain token distribution for achievements)

### Tech Stack

**Blockchain:**
- Solidity 0.8.20
- Hardhat (development framework)
- OpenZeppelin contracts (ERC-721, ERC-20)
- ethers.js v6 (blockchain interaction)

**Frontend:**
- Next.js 14 (React framework, App Router)
- TypeScript (type safety)
- TailwindCSS (styling)
- Zustand (state management)

---

## Smart Contracts

### 1. AventurerNFT.sol (ERC-721)

**Purpose**: Represent player's adventurer as an NFT.

**Key Features:**
- One free mint per wallet (enforced via MintRegistry)
- Random stats stored on-chain: ATK: 1-2, DEF: 1-2, HP: 4-6 (random stats)
- Sequential token IDs starting from 1
- Owner can query their token ID

**Design Decision**:
- Stats are **fixed** for Phase 1 (simplicity)
- Future: Dynamic stats, upgradeable NFTs

```solidity
struct Adventurer {
    uint256 atk;
    uint256 def;
    uint256 hp;
    uint256 mintedAt;
}
```

### 2. SoulFragmentToken.sol (ERC-20)

**Purpose**: Reward token for defeating monsters.

**Key Features:**
- Standard ERC-20 token
- Authorized distributors can mint rewards
- Fixed reward amount (1 token per claim)
- Batch reward function for future server integration

**Design Decision**:
- Only authorized contracts can mint (prevents cheating)
- Owner must authorize `DungeonProgress` contract

```solidity
mapping(address => bool) public isRewardDistributor;
```

### 3. DungeonProgress.sol

**Purpose**: Store player progress on-chain.

**Key Features:**
- Track runs completed (total & successful)
- Track monsters defeated
- Track treasures & traps
- Authorized game contracts only
- Timestamp of last play

**Design Decision**:
- Separate tracking from game logic
- Allows multiple game modes in future
- Events for off-chain indexing

```solidity
struct PlayerStats {
    uint256 totalRuns;
    uint256 successfulRuns;
    uint256 totalMonsters;
    uint256 totalTreasures;
    uint256 totalTraps;
    uint256 lastPlayedAt;
}
```

### Contract Interactions

```
Player (Frontend)
    ↓
AventurerNFT.mintBasicAventurer()
    ↓
[Player owns NFT] → Start game
    ↓
[Defeat monster] → DungeonProgress.recordMonsterDefeated()
    ↓
SoulFragmentToken.reward(player)
    ↓
[End run] → DungeonProgress.recordRun(success)
```

---

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (connect + mint)
│   └── game/
│       └── page.tsx        # Game page
├── components/              # React components
│   ├── WalletConnect.tsx   # Wallet connection UI
│   ├── MintAventurer.tsx   # NFT minting UI
│   ├── GameBoard.tsx       # Main game component
│   ├── Card.tsx            # Individual card display
│   └── RewardClaim.tsx     # Token claim UI
├── lib/                     # Core logic
│   ├── blockchain.ts       # Blockchain interactions
│   ├── gameLogic.ts        # Game mechanics
│   ├── constants.ts        # Game constants
│   ├── contracts.ts        # Contract addresses (auto-generated)
│   └── abis.ts             # Contract ABIs
├── hooks/
│   └── useWallet.ts        # Wallet management hook
├── store/
│   └── gameStore.ts        # Zustand global state
└── styles/
    └── globals.css         # TailwindCSS + custom styles
```

### Component Hierarchy

```
App Layout
├── Home Page (/)
│   ├── WalletConnect
│   ├── MintAventurer
│   └── [Enter Dungeon Button]
└── Game Page (/game)
    ├── WalletConnect
    └── GameBoard
        ├── [Player Stats Display]
        ├── Card (x4)
        └── RewardClaim
```

---

## State Management

### Zustand Store (`gameStore.ts`)

Centralized state for entire app:

```typescript
interface GameStore {
  // Wallet
  isConnected: boolean;
  address: string | null;
  signer: JsonRpcSigner | null;
  hasNFT: boolean;
  tokenId: string | null;
  soulBalance: number;

  // Player
  playerStats: { hp, atk, def, gold };

  // Game
  gameState: GameState;
  currentDeck: GameCard[];
  currentCardIndex: number;
  monstersDefeated: number;

  // UI
  isLoading: boolean;
  error: string | null;
  message: string | null;
}
```

**Why Zustand?**
- Simpler than Redux
- No providers needed
- TypeScript support
- Small bundle size

---

## Blockchain Integration

### Connection Flow

```
User clicks "Connect OneWallet"
    ↓
window.ethereum.request({ method: "eth_requestAccounts" })
    ↓
Create BrowserProvider & Signer
    ↓
Check network (switch if needed)
    ↓
Store connection in Zustand
    ↓
Load player data (hasNFT, balance, progress)
```

### Transaction Flow

```
User action (mint, claim, etc.)
    ↓
setLoading(true)
    ↓
Call contract method
    ↓
Wait for transaction confirmation
    ↓
Update UI with result
    ↓
setLoading(false)
    ↓
Show success/error message
```

### Key Functions (`blockchain.ts`)

```typescript
// Wallet
connectWallet() → WalletConnection
switchNetwork() → void

// NFT
mintAventurer(signer) → tokenId
hasAventurer(signer, address) → boolean
getAdventurerStats(signer, tokenId) → stats

// Tokens
claimReward(signer) → void
getSoulBalance(signer, address) → number

// Progress
recordRun(signer, address, success) → void
recordMonsterDefeated(signer, address) → void
getPlayerProgress(signer, address) → { runs, monsters }
```

---

## Game Logic

### Card Generation (`gameLogic.ts`)

**Probability Distribution:**
- 45% Monster (HP 1-3, ATK 1-3 random)
- 30% Treasure (gems for leaderboard score)
- 15% Trap (1 HP damage)
- 10% Potion (restore HP up to max HP)

```typescript
export const generateCard = (id: number): GameCard => {
  const random = Math.random();

  if (random < 0.1) return TRAP;
  if (random < 0.2) return POTION;
  if (random < 0.5) return TREASURE;
  return MONSTER;
};
```

### Turn-Based Combat System

**Combat Flow:**
1. Player encounters monster card
2. Monster attacks first (random damage roll)
3. Player attacks (80% hit chance)
4. Repeat until monster or player dies

**Combat Mechanics:**
- **Player Attack**: 80% hit chance, deals ATK damage
- **Monster Attack**: Random damage between [min, max] range
- **Defense**: Damage = Monster ATK - Player DEF (minimum 0)
- **Defense can completely block**: If DEF >= Monster ATK, no damage taken

```typescript
// Monster Attack
const damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;
const actualDamage = Math.max(0, damage - playerDEF);
playerHP -= actualDamage;

// Player Attack
const hitRoll = Math.random();
if (hitRoll < 0.8) { // 80% hit chance
  monsterHP -= playerATK;
}
```

### Infinite Dungeon System

**Room Progression:**
1. Player enters room with 4 cards
2. Flip one card at a time
3. Resolve card effect (combat, treasure, trap, potion)
4. After 4 cards, player chooses:
   - **Continue**: Go to next room (risk death for more rewards)
   - **Exit**: End run successfully, record score

**Scoring:**
- Score = Total gems collected
- Leaderboard ranks by gems collected per week
- Top 10 players win OCT prizes

### Game Flow

```
1. User pays 0.01 OCT entry fee
   → Generate 4 random cards for room 1
   → Set gameState = IN_PROGRESS

2. User clicks card
   → Reveal card
   → If Monster: Enter turn-based combat
   → If Treasure: Collect gems
   → If Trap: Lose 1 HP
   → If Potion: Restore HP

3. After 4 cards cleared
   → Show decision modal
   → User chooses: Continue or Exit

4. If Continue
   → Generate new 4 cards for next room
   → Repeat from step 2

5. If Exit or Death
   → Record run on-chain (gems + rooms reached)
   → Update weekly leaderboard
   → Show results screen
```

---

## Design Decisions

### Why On-Chain?

**On-Chain:**
- NFT minting (ownership proof)
- Token rewards (tradeable assets)
- Progress tracking (verifiable stats)

**Off-Chain:**
- Card generation (save gas)
- Combat calculations (instant feedback)
- Gold tracking (cosmetic only, tracked in frontend)
- Monsters defeated count (tracked in frontend, synced on run completion)

### Why This Stack?

**Next.js 14**: Modern React framework, App Router for better UX
**TypeScript**: Catch errors early, better developer experience
**TailwindCSS**: Rapid UI development, custom theme
**Zustand**: Simple state management without boilerplate
**ethers.js v6**: Latest version, better TypeScript support

### Security Considerations

1. **Contract Authorization**: Only authorized addresses can distribute rewards
2. **One NFT per Wallet**: Prevents multi-minting abuse
3. **On-Chain Progress**: Immutable record of achievements
4. **Client-Side Validation**: Check stats before transaction
5. **Error Handling**: Graceful failures with user feedback

### Scalability

**Current Limitations:**
- One adventurer type
- Random stats
- Single game mode

**Future Extensions:**
- Multiple NFT classes (warrior, mage, rogue)
- Dynamic stats (level up system)
- Equipment NFTs
- PvP battles
- Leaderboard contract

---

## Gas Optimization

**Techniques Used:**

1. **Minimal On-Chain Data**: Only essential data stored
2. **Batch Operations**: `batchReward()` for multiple players
3. **Events Over Storage**: Use events for off-chain indexing
4. **Optimized Loops**: Limit iteration in contracts
5. **OpenZeppelin**: Gas-optimized standard implementations

**Estimated Gas Costs:**
- Mint Adventurer: ~80,000 gas
- Claim Reward: ~50,000 gas
- Record Progress: ~40,000 gas

---

## Testing Strategy

**Unit Tests** (Future):
- Contract functions
- Game logic functions
- State management

**Integration Tests** (Future):
- Full game flow
- Wallet connection
- Transaction signing

**Manual Testing**:
- Connect wallet
- Mint NFT
- Play game
- Claim rewards
- Verify on-chain

---

## Deployment Process

```bash
1. Compile contracts
   → npm run compile

2. Deploy to OneChain
   → npm run deploy:onechain
   → Saves addresses to deployments/onechain.json
   → Auto-generates frontend/src/lib/contracts.ts

3. Verify contracts (optional)
   → npm run verify

4. Build frontend
   → npm run frontend:build

5. Deploy frontend (Vercel, Netlify, etc.)
```

---

## Monitoring & Analytics

**On-Chain Events:**
- `AventurerMinted` - Track NFT mints
- `RewardDistributed` - Track token claims
- `RunCompleted` - Track game completions
- `MonsterDefeated` - Track kills

**Off-Chain Tracking:**
- User sessions
- Game completion rate
- Average run duration
- Popular card outcomes

---

## Future Roadmap

**Phase 2 (Post-Hackathon):**
- [ ] Multiple adventurer classes
- [ ] Equipment system (weapons, armor)
- [ ] Dungeon difficulty levels
- [ ] Achievement NFTs

**Phase 3:**
- [ ] PvP arena
- [ ] Guild system
- [ ] Staking Soul Fragments
- [ ] Mobile app

---

**Last Updated**: 2025-11-20

Built with ❤️ for OneHack 2.0
