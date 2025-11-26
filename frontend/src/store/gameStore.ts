import { create } from "zustand";
import { GameCard, GameResult } from "@/lib/gameLogic";
import { GameState, CardRevealState } from "@/lib/constants";

interface PlayerStats {
  hp: number;
  maxHP: number; // Maximum HP from NFT (frontend only, for healing limits)
  atk: number;
  def: number;
  gold: number; // Actually gems, but keeping variable name for compatibility
}

export interface AdventureLogEntry {
  id: string;
  message: string;
  type: "start" | "monster" | "treasure" | "trap" | "potion" | "room" | "death" | "exit" | "combat";
  timestamp: number;
}

// Combat system interfaces
export interface Monster {
  name: string;
  hp: number;
  maxHp: number;
  attackRange: [number, number];
  hitChance: number;
}

export interface CombatLog {
  id: string;
  message: string;
  type: "monster_attack" | "player_attack" | "miss" | "victory" | "defeat";
  timestamp: number;
}

export interface CombatState {
  inCombat: boolean;
  monster: Monster | null;
  combatLogs: CombatLog[];
  playerTurn: boolean;
  combatResult: "victory" | "defeat" | null;
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

  // Adventure log
  adventureLog: AdventureLogEntry[];

  // Combat state
  combatState: CombatState;

  // Avatar state
  avatarSrc: string;

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
  setPlayerStats: (stats: Partial<PlayerStats>) => void;

  // Actions - Adventure log
  addLogEntry: (message: string, type: AdventureLogEntry["type"]) => void;
  clearLog: () => void;

  // Actions - Combat
  startCombat: (monster: Monster) => void;
  addCombatLog: (message: string, type: CombatLog["type"]) => void;
  playerAttack: () => void;
  monsterAttack: () => void;
  endCombat: (result: "victory" | "defeat") => void;
  resetCombat: () => void;

  // Actions - Avatar
  setAvatarSrc: (src: string) => void;
}

const initialPlayerStats: PlayerStats = {
  hp: 4,
  maxHP: 4,
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

  // Initial state - Adventure log
  adventureLog: [],

  // Initial state - Combat
  combatState: {
    inCombat: false,
    monster: null,
    combatLogs: [],
    playerTurn: false,
    combatResult: null,
  },

  // Initial state - Avatar
  avatarSrc: "/avatars/adventurer-idle.png",

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
    set((state) => ({
      gameState: GameState.IN_PROGRESS,
      currentDeck: deck,
      currentCardIndex: 0,
      currentRunMonsters: 0,
      currentRoomMonsters: 0,
      currentRoom: 1, // Always start at room 1
      awaitingDecision: false,
      // Reset HP to maxHP, preserve ATK, DEF, maxHP from NFT, reset gold
      playerStats: {
        ...state.playerStats,
        hp: state.playerStats.maxHP, // Start each run with full HP
        gold: 0
      },
      message: null,
      error: null,
    })),

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
    set((state) => ({
      gameState: GameState.NOT_STARTED,
      currentDeck: [],
      currentCardIndex: 0,
      currentRunMonsters: 0,
      currentRoomMonsters: 0,
      currentRoom: 1,
      activeRunId: null,
      awaitingDecision: false,
      // Preserve NFT stats (atk, def, maxHP) but reset HP to maxHP and gold to 0
      playerStats: {
        ...state.playerStats,
        hp: state.playerStats.maxHP,
        gold: 0
      },
      adventureLog: [],
      message: null,
      error: null,
    })),

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

  setPlayerStats: (stats) =>
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        ...stats,
      },
    })),

  // Adventure log actions
  addLogEntry: (message, type) =>
    set((state) => ({
      adventureLog: [
        ...state.adventureLog,
        {
          id: `${Date.now()}-${Math.random()}`,
          message,
          type,
          timestamp: Date.now(),
        },
      ],
    })),

  clearLog: () =>
    set({
      adventureLog: [],
    }),

  // Combat actions
  startCombat: (monster) =>
    set({
      combatState: {
        inCombat: true,
        monster,
        combatLogs: [],
        playerTurn: false, // Monster attacks first
        combatResult: null,
      },
    }),

  addCombatLog: (message, type) =>
    set((state) => ({
      combatState: {
        ...state.combatState,
        combatLogs: [
          ...state.combatState.combatLogs,
          {
            id: `${Date.now()}-${Math.random()}`,
            message,
            type,
            timestamp: Date.now(),
          },
        ],
      },
    })),

  playerAttack: () =>
    set((state) => {
      if (!state.combatState.monster || !state.combatState.inCombat) return state;

      const { monster } = state.combatState;
      const playerAtk = state.playerStats.atk;

      // Roll for hit (80% chance)
      const hitRoll = Math.random();
      const hits = hitRoll < 0.8; // 80% hit chance

      if (!hits) {
        // Miss
        const timestamp = Date.now();
        const logMessage = `⚔️ Your attack misses!`;
        return {
          combatState: {
            ...state.combatState,
            playerTurn: false, // Switch to monster turn
            combatLogs: [
              ...state.combatState.combatLogs,
              {
                id: `${timestamp}-${Math.random()}`,
                message: logMessage,
                type: "miss" as const,
                timestamp,
              },
            ],
          },
          adventureLog: [
            ...state.adventureLog,
            {
              id: `${timestamp}-${Math.random()}`,
              message: logMessage,
              type: "combat" as const,
              timestamp,
            },
          ],
        };
      }

      // Hit - deal damage
      const newMonsterHp = Math.max(0, monster.hp - playerAtk);
      const updatedMonster = { ...monster, hp: newMonsterHp };

      if (newMonsterHp <= 0) {
        // Monster defeated
        const timestamp = Date.now();
        const logMessage = `⚔️ You deal ${playerAtk} damage! ${monster.name} is defeated!`;
        return {
          combatState: {
            ...state.combatState,
            monster: updatedMonster,
            combatResult: "victory",
            combatLogs: [
              ...state.combatState.combatLogs,
              {
                id: `${timestamp}-${Math.random()}`,
                message: logMessage,
                type: "victory" as const,
                timestamp,
              },
            ],
          },
          adventureLog: [
            ...state.adventureLog,
            {
              id: `${timestamp}-${Math.random()}`,
              message: logMessage,
              type: "combat" as const,
              timestamp,
            },
          ],
        };
      }

      // Monster still alive, switch turns
      const timestamp = Date.now();
      const logMessage = `⚔️ You deal ${playerAtk} damage! ${monster.name} has ${newMonsterHp}/${monster.maxHp} HP.`;
      return {
        combatState: {
          ...state.combatState,
          monster: updatedMonster,
          playerTurn: false,
          combatLogs: [
            ...state.combatState.combatLogs,
            {
              id: `${timestamp}-${Math.random()}`,
              message: logMessage,
              type: "player_attack" as const,
              timestamp,
            },
          ],
        },
        adventureLog: [
          ...state.adventureLog,
          {
            id: `${timestamp}-${Math.random()}`,
            message: logMessage,
            type: "combat" as const,
            timestamp,
          },
        ],
      };
    }),

  monsterAttack: () =>
    set((state) => {
      if (!state.combatState.monster || !state.combatState.inCombat) return state;

      const { monster } = state.combatState;
      const [minDmg, maxDmg] = monster.attackRange;

      // Roll for damage (random between min and max)
      const damage = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg;

      // Apply defense (reduce damage by DEF, min 0)
      const actualDamage = Math.max(0, damage - state.playerStats.def);
      const newPlayerHp = Math.max(0, state.playerStats.hp - actualDamage);

      if (newPlayerHp <= 0) {
        // Player defeated
        const timestamp = Date.now();
        const logMessage = `💀 ${monster.name} deals ${actualDamage} damage! You have been defeated!`;
        return {
          playerStats: {
            ...state.playerStats,
            hp: 0,
          },
          combatState: {
            ...state.combatState,
            combatResult: "defeat",
            combatLogs: [
              ...state.combatState.combatLogs,
              {
                id: `${timestamp}-${Math.random()}`,
                message: logMessage,
                type: "defeat" as const,
                timestamp,
              },
            ],
          },
          adventureLog: [
            ...state.adventureLog,
            {
              id: `${timestamp}-${Math.random()}`,
              message: logMessage,
              type: "combat" as const,
              timestamp,
            },
          ],
        };
      }

      // Player still alive, switch turns
      const timestamp = Date.now();
      const logMessage = `🗡️ ${monster.name} attacks for ${damage} damage (${actualDamage} after defense)! You have ${newPlayerHp} HP.`;
      return {
        playerStats: {
          ...state.playerStats,
          hp: newPlayerHp,
        },
        combatState: {
          ...state.combatState,
          playerTurn: true,
          combatLogs: [
            ...state.combatState.combatLogs,
            {
              id: `${timestamp}-${Math.random()}`,
              message: logMessage,
              type: "monster_attack" as const,
              timestamp,
            },
          ],
        },
        adventureLog: [
          ...state.adventureLog,
          {
            id: `${timestamp}-${Math.random()}`,
            message: logMessage,
            type: "combat" as const,
            timestamp,
          },
        ],
      };
    }),

  endCombat: (result) =>
    set((state) => ({
      combatState: {
        ...state.combatState,
        inCombat: false,
        combatResult: result,
      },
    })),

  resetCombat: () =>
    set({
      combatState: {
        inCombat: false,
        monster: null,
        combatLogs: [],
        playerTurn: false,
        combatResult: null,
      },
    }),

  // Avatar actions
  setAvatarSrc: (src: string) =>
    set({
      avatarSrc: src,
    }),
}));
