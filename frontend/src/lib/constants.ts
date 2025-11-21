// Game constants
export const GAME_CONFIG = {
  CARDS_PER_RUN: 4,
  BASIC_ATK: 1, // ATK is for display only, not used in combat
  BASIC_DEF: 1, // DEF is used to block monster attacks
  BASIC_HP: 4,
} as const;

// Card type probabilities
export const CARD_PROBABILITIES = {
  MONSTER: 0.5, // 50%
  TREASURE: 0.3, // 30%
  TRAP: 0.1, // 10%
  POTION: 0.1, // 10%
} as const;

// Card types
export enum CardType {
  MONSTER = "MONSTER",
  TREASURE = "TREASURE",
  TRAP = "TRAP",
  POTION = "POTION",
}

// Monster difficulties (ATK values)
export const MONSTER_DIFFICULTIES = [1, 2, 3] as const;

// Treasure rewards (Gem amounts - off-chain for Phase 1)
export const TREASURE_REWARDS = [10, 20, 30] as const;

// Potion types (HP restoration)
export const POTION_TYPES = [
  1, // Small potion: +1 HP
  999, // Full potion: Restore to max HP (represented as 999)
] as const;

// Sui Network configuration
export const SUI_NETWORK_CONFIG = {
  network: process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet", // Will use OneChain when available
  rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL || "", // Will be OneChain RPC
} as const;

// Sui Package and Object IDs (will be filled after deployment)
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "";
export const GAME_ADMIN_ID = process.env.NEXT_PUBLIC_GAME_ADMIN_ID || "";
export const MINT_REGISTRY_ID = process.env.NEXT_PUBLIC_MINT_REGISTRY_ID || "";
export const PROGRESS_REGISTRY_ID = process.env.NEXT_PUBLIC_PROGRESS_REGISTRY_ID || "";

// Development mode - allows testing game without deployed contracts
// Set to "true" to enable demo mode (bypass blockchain checks)
export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

// Entry fee for dungeon runs in USDC (stablecoin)
export const ENTRY_FEE_USDC = 1.0; // 1 USDC
export const ENTRY_FEE_USDC_UNITS = 1_000_000; // 1 USDC with 6 decimals

// Fee distribution (automatic on entry):
// 70% → Weekly Rewards Pool (distributed to top 10 players)
// 20% → Dev Treasury
// 10% → Marketing Reserve

// Weekly distribution schedule:
// - Distribution happens every Friday at 4:20 UTC
// - Top 10 players receive: 30%, 20%, 15%, 10%, 8%, 6%, 4%, 3%, 2%, 2%

// Reward per monster defeated (off-chain tracking for Phase 1)
export const REWARD_PER_MONSTER = 1; // Used for leaderboard scoring

// For testing purposes, you can set these manually after deploying:
// PACKAGE_ID: The package ID from `sui client publish`
// MINT_REGISTRY_ID: The MintRegistry shared object ID for tracking NFT mints
// PROGRESS_REGISTRY_ID: The ProgressRegistry shared object ID for tracking game progress

// Game states
export enum GameState {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  GAME_OVER = "GAME_OVER",
}

// Card reveal states
export enum CardRevealState {
  HIDDEN = "HIDDEN",
  REVEALED = "REVEALED",
  RESOLVED = "RESOLVED",
}
