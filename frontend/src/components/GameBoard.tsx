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
      const result = resolveCardLogic(card, playerStats.atk, playerStats.hp);

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

    try {
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
          playerStats.hp,
          0, // gold gained (tracked off-chain for now)
          currentRunMonsters > 0 // monster defeated in this room
        );
      }

      // Generate new deck for next room
      const newDeck = generateDeck();
      advanceToNextRoom(newDeck);
      setMessage(`Entering Room ${currentRoom + 1}...`);

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
          `✅ Success! Claimed ${totalMonsters} SOUL token${
            totalMonsters > 1 ? "s" : ""
          }!`
        );
        refreshBalance();
      } else if (DEV_MODE) {
        setMessage(
          `Dev mode: Simulated claiming ${totalMonsters} SOUL tokens`
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
            <div className="text-xs text-gray-400">SOUL Tokens</div>
            <div className="text-2xl font-bold text-dungeon-gold">
              {gameState === GameState.COMPLETED ? currentRunMonsters + currentRoomMonsters : 0}
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
          🏰 Enter the Infinite Dungeon
        </h2>

        <p className="text-gray-300 mb-4">
          Pay a tax of <span className="text-dungeon-gold font-bold">{ENTRY_FEE_SUI} SUI</span> to
          the Emperor to enter the dungeon.
        </p>

        <p className="text-gray-400 text-sm mb-6">
          Each room has 4 cards. Choose 1 to reveal.
          <br />
          50% Monster | 30% Treasure | 10% Trap | 10% Potion
          <br />
          After each room: Continue (risk death) or Exit (claim rewards).
          <br />
          Earn 1 SOUL token per monster defeated!
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
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold text-purple-400">
            🏰 Room {currentRoom}
          </div>
          <div className="text-sm text-gray-400">
            {awaitingDecision
              ? "Choose: Continue or Exit"
              : `Choose 1 of 4 cards`}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="stat-box">
            <div className="text-xs text-gray-400">HP</div>
            <div className="text-2xl font-bold text-green-400">
              {playerStats.hp}
            </div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">ATK</div>
            <div className="text-2xl font-bold text-red-400">
              {playerStats.atk}
            </div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">Gems</div>
            <div className="text-2xl font-bold text-dungeon-gold">
              {playerStats.gold}
            </div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">Monsters</div>
            <div className="text-2xl font-bold text-red-400">
              {currentRunMonsters}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="card">
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
              ✅ Exit & Claim ({currentRunMonsters + currentRoomMonsters} SOUL)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
