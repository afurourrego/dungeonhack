"use client";

import { useEffect, useState } from "react";
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
    setAvatarSrc,
  } = useGameStore();

  const { refreshBalance, signAndExecuteTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  // Ensure avatar resets to idle when no run is active
  useEffect(() => {
    if (gameState === GameState.NOT_STARTED) {
      setAvatarSrc("/avatars/adventurer-idle.png");
    }
  }, [gameState, setAvatarSrc]);

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
    <>
      <div className="animate-fade-in">
        {/* Cards Grid - Outside of card container */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 justify-items-center">
          {currentDeck.map((card, index) => (
            <div
              key={card.id}
              className="w-full flex justify-center"
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

      {/* Floating Decision Modal */}
      {awaitingDecision && !isProcessing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in pb-8">
          <div className="card w-full max-w-2xl mx-4 animate-slide-up shadow-2xl border-2 border-amber-600/50">
            {/* Header with Icon + Title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">🏰</div>
              <div className="text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-dungeon-gold leading-tight">
                  Room {currentRoom} Clear!
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Continue deeper or exit with your rewards
                </p>
              </div>
            </div>

            {/* Buttons - Stack on mobile, side by side on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleContinue}
                className="btn-primary px-4 py-3 text-center"
                disabled={isProcessing}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">⚔️</span>
                  <div className="text-left">
                    <div className="text-lg font-bold">Continue</div>
                    <div className="text-xs opacity-80">Enter Room {currentRoom + 1}</div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleExit}
                className="btn-success px-4 py-3 text-center"
                disabled={isProcessing}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">💰</span>
                  <div className="text-left">
                    <div className="text-lg font-bold">Exit & Claim</div>
                    <div className="text-xs opacity-80">Collect {playerStats.gold} gems</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
