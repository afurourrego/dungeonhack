"use client";

import { useState } from "react";
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
import Leaderboard from "./Leaderboard";

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

  // Start a new dungeon run with entry fee
  const handleStartGame = async () => {
    setLoading(true);
    setError(null);

    try {
      let runId = null;

      // In production mode, pay entry fee and create ActiveRun
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

      // Generate first room deck and start game
      const deck = generateDeck();
      startGame(deck);

      // Log start of adventure
      addLogEntry("🏰 You enter the dark dungeon. The air is thick with mystery...", "start");
      addLogEntry(`💪 Starting stats: ${GAME_CONFIG.BASIC_HP} HP, ${GAME_CONFIG.BASIC_ATK} ATK`, "start");
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
    if (awaitingDecision) return; // Don't allow card clicks while waiting for decision
    if (isProcessing) return; // Prevent multiple clicks

    // Block further clicks immediately
    setIsProcessing(true);

    // Reveal the card
    revealCard(index);

    // Wait for animation
    setTimeout(() => {
      const card = currentDeck[index];
      const result = resolveCardLogic(card, playerStats.def, playerStats.hp);

      console.log("Card resolved:", {
        cardType: card.type,
        cardValue: card.value,
        goldEarned: result.gold,
        currentGold: playerStats.gold
      });

      // Add log entry based on card type
      if (card.type === "MONSTER") {
        if (result.defeated) {
          addLogEntry(`⚔️ Defeated Monster (ATK ${card.value})! Earned ${result.gold} gems.`, "monster");
        } else {
          addLogEntry(`⚔️ Monster (ATK ${card.value}) attacks! Lost ${result.hpLost} HP.`, "monster");
        }
      } else if (card.type === "TREASURE") {
        addLogEntry(`💎 Found treasure! Earned ${result.gold} gems.`, "treasure");
      } else if (card.type === "TRAP") {
        addLogEntry(`🕸️ Trap triggered! Lost ${result.hpLost} HP.`, "trap");
      } else if (card.type === "POTION") {
        addLogEntry(`🧪 Drank a potion! Restored ${result.hpGained} HP.`, "potion");
      }

      // Update game state
      resolveCard(index, result.newHP, result.gold, result.defeated);
      setMessage(result.message);

      // Check if game over (death)
      if (isGameOver(result.newHP)) {
        setTimeout(() => {
          handleDeath();
        }, 1500);
      } else {
        // Card resolved successfully, show Continue/Exit decision
        setTimeout(() => {
          setAwaitingDecision(true);
          setIsProcessing(false); // Re-enable for decision buttons
          setMessage(null);
        }, 1500);
      }

      // Clear message after delay
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  // Handle death (HP = 0)
  const handleDeath = async () => {
    setIsProcessing(true);
    setMessage("💀 You died! Recording your progress...");
    addLogEntry(`💀 Your adventure ends at Room ${currentRoom}. Final score: ${playerStats.gold} gems.`, "death");

    try{
      // Exit dungeon run on blockchain
      if (!DEV_MODE && signAndExecuteTransaction && activeRunId) {
        await exitDungeonRun(
          signAndExecuteTransaction,
          activeRunId,
          false, // survived = false
          currentRunMonsters,
          currentRoom,
          playerStats.gold // gems collected
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
    }
  };

  // Continue to next room
  const handleContinue = async () => {
    setIsProcessing(true);
    setMessage("⏳ Advancing to next room...");

    try {
      // Advance room on blockchain
      if (!DEV_MODE && signAndExecuteTransaction && activeRunId) {
        await advanceRoomBlockchain(
          signAndExecuteTransaction,
          activeRunId,
          playerStats.hp
        );
      }

      // Generate new deck for next room
      const newDeck = generateDeck();
      advanceToNextRoom(newDeck);
      setMessage(`Entering Room ${currentRoom + 1}...`);
      addLogEntry(`🚪 Survived Room ${currentRoom}! Entering Room ${currentRoom + 1}...`, "room");

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
    setMessage("⏳ Exiting dungeon and claiming rewards...");
    addLogEntry(`✅ Successfully escaped! Cleared ${currentRoom} rooms with ${playerStats.gold} gems!`, "exit");

    try {
      // Calculate total monsters including current room
      const totalMonsters = currentRunMonsters + currentRoomMonsters;

      // Exit dungeon run and claim rewards
      if (!DEV_MODE && signAndExecuteTransaction && activeRunId) {
        await exitDungeonRun(
          signAndExecuteTransaction,
          activeRunId,
          true, // survived = true
          totalMonsters,
          currentRoom,
          playerStats.gold // gems collected
        );
        setMessage(
          `✅ Success! Defeated ${totalMonsters} monster${
            totalMonsters > 1 ? "s" : ""
          }! Score recorded.`
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
            <span className="text-green-400">🎉 Run Complete!</span>
          ) : (
            <span className="text-red-400">💀 You Died</span>
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

        <div className="mt-6">
          <Leaderboard showPersonal={false} variant="compact" />
        </div>
      </div>
    );
  }

  // Render game start screen
  if (gameState === GameState.NOT_STARTED) {
    return (
      <div className="card text-center animate-fade-in max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-dungeon-gold mb-4">
          🏰 Enter the Infinite Dungeon
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
            🚧 Dev Mode: Entry fee skipped
          </p>
        )}
      </div>
    );
  }

  // Render active game
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Room & Player Stats */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <div className="text-xl font-bold text-amber-400 drop-shadow-lg">
            🏰 Room {currentRoom}
          </div>
          <div className="text-xs text-amber-200/80">
            {awaitingDecision
              ? "Choose: Continue or Exit"
              : `Choose 1 of 4 cards`}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="stat-box flex-1">
            <div className="text-xs text-amber-300/70 uppercase tracking-wider">HP</div>
            <div className="text-2xl font-bold text-green-400 drop-shadow-md">
              {playerStats.hp}
            </div>
          </div>
          <div className="stat-box flex-1">
            <div className="text-xs text-amber-300/70 uppercase tracking-wider">DEF</div>
            <div className="text-2xl font-bold text-blue-400 drop-shadow-md">
              {playerStats.def}
            </div>
          </div>
          <div className="stat-box flex-1">
            <div className="text-xs text-amber-300/70 uppercase tracking-wider">Gems</div>
            <div className="text-2xl font-bold text-dungeon-gold drop-shadow-md">
              {playerStats.gold}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div>
        <div className="flex justify-center gap-4 flex-wrap">
          {currentDeck.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleCardClick(index)}
              disabled={
                awaitingDecision ||
                card.revealed !== CardRevealState.HIDDEN ||
                isProcessing
              }
            />
          ))}
        </div>
      </div>

      {/* Continue/Exit Decision */}
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
              ⚔️ Continue (Room {currentRoom + 1})
            </button>

            <button
              onClick={handleExit}
              className="btn-success"
              disabled={isProcessing}
            >
              ✅ Exit & Claim Rewards ({playerStats.gold} gems)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
