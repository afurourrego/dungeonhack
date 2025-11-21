import { create } from "zustand";
import { GameCard, GameResult } from "@/lib/gameLogic";
import { GameState, CardRevealState } from "@/lib/constants";

interface PlayerStats {
  hp: number;
  atk: number;
  def: number;
  gold: number; // Actually gems, but keeping variable name for compatibility
}

interface GameStore {
  // Wallet state
  isConnected: boolean;
  address: string | null;
  hasNFT: boolean;
  tokenId: string | null;

  // Player state
  playerStats: PlayerStats;
  soulBalance: number;

  // Game state
  gameState: GameState;
  currentDeck: GameCard[];
  currentCardIndex: number;
  monstersDefeated: number;
  currentRunMonsters: number;
  currentRoomMonsters: number; // Monsters defeated in current room only

  // Infinite dungeon state
  currentRoom: number;
  activeRunId: string | null;
  awaitingDecision: boolean; // true when waiting for Continue/Exit choice

  // UI state
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // Actions - Wallet
  setWalletConnection: (address: string, signer: any | null) => void;
  disconnectWallet: () => void;
  setHasNFT: (hasNFT: boolean, tokenId?: string) => void;
  setSoulBalance: (balance: number) => void;

  // Actions - Game
  startGame: (deck: GameCard[]) => void;
  revealCard: (index: number) => void;
  resolveCard: (index: number, newHP: number, gold: number, defeated: boolean) => void;
  endGame: (success: boolean) => void;
  resetGame: () => void;

  // Actions - Infinite dungeon
  setActiveRunId: (runId: string | null) => void;
  advanceToNextRoom: (newDeck: GameCard[]) => void;
  setAwaitingDecision: (awaiting: boolean) => void;

  // Actions - UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMessage: (message: string | null) => void;

  // Actions - Player
  updatePlayerHP: (hp: number) => void;
  addGold: (amount: number) => void;
}

const initialPlayerStats: PlayerStats = {
  hp: 4,
  atk: 1,
  def: 1,
  gold: 0,
};

export const useGameStore = create<GameStore>((set) => ({
  // Initial state - Wallet
  isConnected: false,
  address: null,
  hasNFT: false,
  tokenId: null,

  // Initial state - Player
  playerStats: initialPlayerStats,
  soulBalance: 0,

  // Initial state - Game
  gameState: GameState.NOT_STARTED,
  currentDeck: [],
  currentCardIndex: 0,
  monstersDefeated: 0,
  currentRunMonsters: 0,
  currentRoomMonsters: 0,

  // Initial state - Infinite dungeon
  currentRoom: 1,
  activeRunId: null,
  awaitingDecision: false,

  // Initial state - UI
  isLoading: false,
  error: null,
  message: null,

  // Wallet actions
  setWalletConnection: (address, _signer) =>
    set({
      isConnected: true,
      address,
      error: null,
    }),

  disconnectWallet: () =>
    set({
      isConnected: false,
      address: null,
      hasNFT: false,
      tokenId: null,
      playerStats: initialPlayerStats,
      gameState: GameState.NOT_STARTED,
      currentDeck: [],
      currentCardIndex: 0,
    }),

  setHasNFT: (hasNFT, tokenId) =>
    set({
      hasNFT,
      tokenId: tokenId || null,
    }),

  setSoulBalance: (balance) =>
    set({
      soulBalance: balance,
    }),

  // Game actions
  startGame: (deck) =>
    set({
      gameState: GameState.IN_PROGRESS,
      currentDeck: deck,
      currentCardIndex: 0,
      currentRunMonsters: 0,
      currentRoomMonsters: 0,
      currentRoom: 1, // Always start at room 1
      awaitingDecision: false,
      playerStats: { ...initialPlayerStats, gold: 0 },
      message: null,
      error: null,
    }),

  revealCard: (index) =>
    set((state) => {
      const newDeck = [...state.currentDeck];
      if (newDeck[index]) {
        newDeck[index].revealed = CardRevealState.REVEALED;
      }
      return {
        currentDeck: newDeck,
        currentCardIndex: index,
      };
    }),

  resolveCard: (index, newHP, gold, defeated) =>
    set((state) => {
      const newDeck = [...state.currentDeck];
      if (newDeck[index]) {
        newDeck[index].revealed = CardRevealState.RESOLVED;
      }

      const newRoomMonsterCount = defeated ? state.currentRoomMonsters + 1 : state.currentRoomMonsters;

      return {
        currentDeck: newDeck,
        currentCardIndex: index + 1, // Move to next card
        playerStats: {
          ...state.playerStats,
          hp: newHP,
          gold: state.playerStats.gold + gold,
        },
        currentRoomMonsters: newRoomMonsterCount,
      };
    }),

  endGame: (success) =>
    set((state) => ({
      gameState: success ? GameState.COMPLETED : GameState.GAME_OVER,
      monstersDefeated: state.monstersDefeated + state.currentRunMonsters,
    })),

  resetGame: () =>
    set({
      gameState: GameState.NOT_STARTED,
      currentDeck: [],
      currentCardIndex: 0,
      currentRunMonsters: 0,
      currentRoomMonsters: 0,
      currentRoom: 1,
      activeRunId: null,
      awaitingDecision: false,
      playerStats: initialPlayerStats,
      message: null,
      error: null,
    }),

  // Infinite dungeon actions
  setActiveRunId: (runId) =>
    set({
      activeRunId: runId,
    }),

  advanceToNextRoom: (newDeck) =>
    set((state) => ({
      currentRoom: state.currentRoom + 1,
      currentDeck: newDeck,
      currentCardIndex: 0,
      currentRunMonsters: state.currentRunMonsters + state.currentRoomMonsters, // Add room monsters to total
      currentRoomMonsters: 0, // Reset room monsters for new room
      awaitingDecision: false,
      message: null,
    })),

  setAwaitingDecision: (awaiting) =>
    set({
      awaitingDecision: awaiting,
    }),

  // UI actions
  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  setMessage: (message) =>
    set({
      message,
    }),

  // Player actions
  updatePlayerHP: (hp) =>
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        hp,
      },
    })),

  addGold: (amount) =>
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        gold: state.playerStats.gold + amount,
      },
    })),
}));
