"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useGameStore } from "@/store/gameStore";
import { useWallet } from "@/hooks/useWallet";
import Card from "./Card";
import {
  generateDeck,
  resolveCard as resolveCardLogic,
  isGameOver,
} from "@/lib/gameLogic";
import {
  GAME_CONFIG,
  GameState,
  CardRevealState,
  DEV_MODE,
  ENTRY_FEE_SUI,
} from "@/lib/constants";
import {
  startDungeonRun,
  advanceToNextRoom as advanceRoomBlockchain,
  exitDungeonRun,
} from "@/lib/sui-blockchain";

export default function GameBoard() {
  const {
    gameState,
    currentDeck,
    currentCardIndex,
    playerStats,
    currentRunMonsters,
    currentRoomMonsters,
    currentRoom,
    activeRunId,
    awaitingDecision,
    address,
    message,
    startGame,
    revealCard,
    resolveCard,
    endGame,
    resetGame,
    setLoading,
    setError,
    setMessage,
    setActiveRunId,
    advanceToNextRoom,
    setAwaitingDecision,
    addLogEntry,
  } = useGameStore();

  const { refreshBalance, signAndExecuteTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState("/avatars/adventurer-idle.png");

  // Ensure avatar resets to idle when no run is active
  useEffect(() => {
    if (gameState === GameState.NOT_STARTED) {
      setAvatarSrc("/avatars/adventurer-idle.png");
    }
  }, [gameState]);

  // Start a new dungeon run with entry fee
  const handleStartGame = async () => {
    setLoading(true);
    setError(null);

    try {
      let runId = null;

      if (!DEV_MODE && signAndExecuteTransaction) {
        try {
          runId = await startDungeonRun(
            signAndExecuteTransaction,
            GAME_CONFIG.BASIC_HP,
            GAME_CONFIG.BASIC_ATK
          );
          setActiveRunId(runId);
          setMessage(`Entry fee paid! (${ENTRY_FEE_SUI} SUI)`);
        } catch (error: any) {
          setError(error.message || "Failed to start run");
          setLoading(false);
          return;
        }
      } else if (DEV_MODE) {
        setMessage("Dev mode: Skipping entry fee");
      }

      const deck = generateDeck();
      startGame(deck);
      setAvatarSrc("/avatars/adventurer-idle.png");

      addLogEntry("You enter the dark dungeon. The air is thick with mystery...", "start");
      addLogEntry(`Starting stats: ${GAME_CONFIG.BASIC_HP} HP, ${GAME_CONFIG.BASIC_ATK} ATK`, "start");
    } catch (error: any) {
      console.error("Error starting game:", error);
      setError(error.message || "Failed to start game");
    } finally {
      setLoading(false);
    }
  };

  // Reveal and resolve a card
  const handleCardClick = async (index: number) => {
    if (currentDeck[index].revealed !== CardRevealState.HIDDEN) return;
    if (awaitingDecision) return;
    if (isProcessing) return;

    setIsProcessing(true);
    revealCard(index);

    setTimeout(() => {
      const card = currentDeck[index];
      const result = resolveCardLogic(card, playerStats.def, playerStats.hp);

      // Add log entry and swap avatar based on card type
      if (card.type === "MONSTER") {
        if (result.defeated) {
          addLogEntry(`Defeated Monster (ATK ${card.value})! Earned ${result.gold} gems.`, "monster");
        } else {
          addLogEntry(`Monster (ATK ${card.value}) attacks! Lost ${result.hpLost} HP.`, "monster");
        }
        setAvatarSrc("/avatars/adventurer-monster.png");
      } else if (card.type === "TREASURE") {
        addLogEntry(`Found treasure! Earned ${result.gold} gems.`, "treasure");
        setAvatarSrc("/avatars/adventurer-gem.png");
      } else if (card.type === "TRAP") {
        addLogEntry(`Trap triggered! Lost ${result.hpLost} HP.`, "trap");
        setAvatarSrc("/avatars/adventurer-trap.png");
      } else if (card.type === "POTION") {
        addLogEntry(`Drank a potion! Restored ${result.hpGained} HP.`, "potion");
        setAvatarSrc("/avatars/adventurer-potion.png");
      }

      resolveCard(index, result.newHP, result.gold, result.defeated);
      setMessage(result.message);

      if (isGameOver(result.newHP)) {
        setTimeout(() => {
          handleDeath();
        }, 1500);
      } else {
        setTimeout(() => {
          setAwaitingDecision(true);
          setIsProcessing(false);
          setMessage(null);
        }, 1500);
      }

      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  // Handle death (HP = 0)
  const handleDeath = async () => {
    setIsProcessing(true);
    setMessage("You died! Recording your progress...");
    addLogEntry(`Your adventure ends at Room ${currentRoom}. Final score: ${playerStats.gold} gems.`, "death");

    try {
      if (!DEV_MODE && signAndExecuteTransaction && activeRunId) {
        await exitDungeonRun(
          signAndExecuteTransaction,
          activeRunId,
          false,
          currentRunMonsters,
          currentRoom,
          playerStats.gold
        );
        setMessage(`Run recorded! Reached Room ${currentRoom}`);
        refreshBalance();
      }
    } catch (error: any) {
      console.error("Error recording death:", error);
      setError(error.message || "Failed to record run");
    } finally {
      setIsProcessing(false);
      endGame(false);
      setActiveRunId(null);
      setAwaitingDecision(false);
      setAvatarSrc("/avatars/adventurer-idle.png");
    }
  };

  // Continue to next room
  const handleContinue = async () => {
    setIsProcessing(true);
    setMessage("Advancing to next room...");

    try {
      if (!DEV_MODE && signAndExecuteTransaction && activeRunId) {
        await advanceRoomBlockchain(
          signAndExecuteTransaction,
          activeRunId,
          playerStats.hp
        );
      }

      const newDeck = generateDeck();
      advanceToNextRoom(newDeck);
      setAvatarSrc("/avatars/adventurer-idle.png");
      setMessage(`Entering Room ${currentRoom + 1}...`);
      addLogEntry(`Survived Room ${currentRoom}! Entering Room ${currentRoom + 1}...`, "room");

      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error("Error advancing room:", error);
      setError(error.message || "Failed to advance room");
    } finally {
      setIsProcessing(false);
    }
  };

  // Exit dungeon and claim rewards
  const handleExit = async () => {
    setIsProcessing(true);
    setMessage("Exiting dungeon and claiming rewards...");
    addLogEntry(`Successfully escaped! Cleared ${currentRoom} rooms with ${playerStats.gold} gems!`, "exit");

    try {
      const totalMonsters = currentRunMonsters + currentRoomMonsters;

      if (!DEV_MODE && signAndExecuteTransaction && activeRunId) {
        await exitDungeonRun(
          signAndExecuteTransaction,
          activeRunId,
          true,
          totalMonsters,
          currentRoom,
          playerStats.gold
        );
        setMessage(
          `Success! Defeated ${totalMonsters} monster${totalMonsters > 1 ? "s" : ""}! Score recorded.`
        );
        refreshBalance();
      } else if (DEV_MODE) {
        setMessage(
          `Dev mode: Defeated ${totalMonsters} monster${totalMonsters > 1 ? "s" : ""}`
        );
      }

      setTimeout(() => {
        endGame(true);
        setActiveRunId(null);
        setAwaitingDecision(false);
        setAvatarSrc("/avatars/adventurer-idle.png");
      }, 2000);
    } catch (error: any) {
      console.error("Error exiting dungeon:", error);
      setError(error.message || "Failed to exit dungeon");
      setIsProcessing(false);
    }
  };

  // Render game over screen
  if (gameState === GameState.GAME_OVER || gameState === GameState.COMPLETED) {
    return (
      <div className="card text-center animate-fade-in max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">
          {gameState === GameState.COMPLETED ? (
            <span className="text-green-400">Run Complete!</span>
          ) : (
            <span className="text-red-400">You Died</span>
          )}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-box">
            <div className="text-xs text-gray-400">Rooms Reached</div>
            <div className="text-2xl font-bold text-purple-400">{currentRoom}</div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">Monsters Defeated</div>
            <div className="text-2xl font-bold text-red-400">
              {gameState === GameState.COMPLETED ? currentRunMonsters + currentRoomMonsters : currentRunMonsters}
            </div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">Leaderboard Score</div>
            <div className="text-2xl font-bold text-dungeon-gold">
              {playerStats.gold}
            </div>
          </div>
        </div>

        {gameState === GameState.COMPLETED && (
          <p className="text-green-400 mb-4">
            You successfully exited the dungeon!
          </p>
        )}

        <button onClick={resetGame} className="btn-primary">
          New Run (Pay {ENTRY_FEE_SUI} SUI)
        </button>
      </div>
    );
  }

  // Render game start screen
  if (gameState === GameState.NOT_STARTED) {
    return (
      <div className="card text-center animate-fade-in max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-dungeon-gold mb-4">
          Enter the Infinite Dungeon
        </h2>

        <p className="text-gray-300 mb-4">
          Pay an entry fee of <span className="text-dungeon-gold font-bold">{ENTRY_FEE_SUI} SUI</span> to
          enter the dungeon and compete for weekly prizes!
        </p>

        <p className="text-gray-400 text-sm mb-6">
          Each room has 4 cards. Choose 1 to reveal.
          <br />
          50% Monster | 30% Treasure | 10% Trap | 10% Potion
          <br />
          After each room: Continue (risk death) or Exit (claim rewards).
          <br />
          Your score = gems collected!
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          <div className="stat-box">
            <div className="text-xs text-gray-400">Your ATK</div>
            <div className="text-3xl font-bold text-red-400">
              {GAME_CONFIG.BASIC_ATK}
            </div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">Your DEF</div>
            <div className="text-3xl font-bold text-blue-400">
              {GAME_CONFIG.BASIC_DEF}
            </div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">Your HP</div>
            <div className="text-3xl font-bold text-green-400">
              {GAME_CONFIG.BASIC_HP}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartGame}
          disabled={isProcessing}
          className="btn-success"
        >
          {isProcessing ? "Starting..." : `Pay ${ENTRY_FEE_SUI} SUI & Enter`}
        </button>

        {DEV_MODE && (
          <p className="text-yellow-500 text-xs mt-4">
            Dev Mode: Entry fee skipped
          </p>
        )}
      </div>
    );
  }

  // Render active game
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 2xl:grid-cols-[clamp(160px,15vw,190px),1fr] gap-2 xl:gap-4 items-stretch">
        <div className="card relative h-full flex flex-col gap-3 bg-gradient-to-b from-amber-900/50 to-gray-900/60">
          <div className="text-xs uppercase tracking-widest text-amber-200/80">Adventurer</div>
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg border border-amber-800/60 bg-gradient-to-b from-gray-800/70 to-black/80 shadow-inner">
            <Image
              src={avatarSrc}
              alt="Adventurer portrait"
              fill
              className="object-cover scale-103"
              priority
            />
            <div className="absolute inset-0 pointer-events-none border-2 border-amber-900/70 rounded-lg shadow-inner" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="stat-box">
              <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">HP</div>
              <div className="text-2xl font-bold text-green-400 drop-shadow-md">
                {playerStats.hp}
              </div>
            </div>
            <div className="stat-box">
              <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">DEF</div>
              <div className="text-2xl font-bold text-blue-400 drop-shadow-md">
                {playerStats.def}
              </div>
            </div>
            <div className="stat-box">
              <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">Gems</div>
              <div className="text-2xl font-bold text-dungeon-gold drop-shadow-md">
                {playerStats.gold}
              </div>
            </div>
          </div>
          <p className="text-xs text-amber-100/70 text-center">
            Ready for the next flip? Pick a card to reveal your fate.
          </p>
        </div>

        <div className="card h-full flex flex-col gap-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-xl font-bold text-amber-400 drop-shadow-lg">
              Room {currentRoom}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-amber-200/80">
              <span className="px-2 py-1 rounded-full border border-amber-700/60 bg-amber-900/30">
                HP {playerStats.hp}
              </span>
              <span className="px-2 py-1 rounded-full border border-amber-700/60 bg-amber-900/30">
                DEF {playerStats.def}
              </span>
              <span className="px-2 py-1 rounded-full border border-amber-700/60 bg-amber-900/30">
                Gems {playerStats.gold}
              </span>
            </div>
          </div>
          <div className="text-xs text-amber-200/80">
            {awaitingDecision ? "Choose: Continue or Exit" : `Choose 1 of 4 cards`}
          </div>
          <div className="flex justify-center gap-1 flex-wrap overflow-x-auto px-0 py-1">
            {currentDeck.map((card, index) => (
              <div
                key={card.id}
                className="shrink-0 scale-[0.62] sm:scale-[0.7] md:scale-[0.78] lg:scale-[0.84] 2xl:scale-[0.88] origin-top"
              >
                <Card
                  card={card}
                  onClick={() => handleCardClick(index)}
                  disabled={
                    awaitingDecision ||
                    card.revealed !== CardRevealState.HIDDEN ||
                    isProcessing
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {awaitingDecision && !isProcessing && (
        <div className="card text-center animate-fade-in">
          <h3 className="text-xl font-bold text-dungeon-gold mb-4">
            What will you do?
          </h3>

          <p className="text-gray-300 mb-6">
            You survived Room {currentRoom}!
            <br />
            <span className="text-sm text-gray-400">
              Continue for more rewards or exit to claim what you have.
            </span>
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleContinue}
              className="btn-primary"
              disabled={isProcessing}
            >
              Continue (Room {currentRoom + 1})
            </button>

            <button
              onClick={handleExit}
              className="btn-success"
              disabled={isProcessing}
            >
              Exit & Claim Rewards ({playerStats.gold} gems)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
