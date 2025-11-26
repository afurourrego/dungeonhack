"use client";

import { useGameStore } from "@/store/gameStore";
import { useEffect, useRef, useState } from "react";

export default function CombatScreen() {
  const { combatState, playerStats, playerAttack, monsterAttack, endCombat, addLogEntry } = useGameStore();
  const { monster, combatLogs, playerTurn, combatResult, inCombat } = combatState;
  const [isRolling, setIsRolling] = useState(false);

  // Auto-execute monster turn after delay
  useEffect(() => {
    if (inCombat && !playerTurn && !combatResult && !isRolling) {
      const timer = setTimeout(() => {
        setIsRolling(true);
        setTimeout(() => {
          monsterAttack();
          setIsRolling(false);
        }, 2000); // Roll animation duration (increased from 1500 to 2000)
      }, 1500); // Wait before monster attack (increased from 1000 to 1500)
      return () => clearTimeout(timer);
    }
  }, [inCombat, playerTurn, combatResult, isRolling, monsterAttack]);

  // Handle combat end
  useEffect(() => {
    if (combatResult) {
      const timer = setTimeout(() => {
        if (combatResult === "victory") {
          addLogEntry(`⚔️ Defeated ${monster?.name}!`, "combat");
        } else {
          addLogEntry(`💀 Defeated by ${monster?.name}!`, "combat");
        }
        endCombat(combatResult);
      }, 3000); // Increased from 2000 to 3000 to show result longer
      return () => clearTimeout(timer);
    }
  }, [combatResult, monster, endCombat, addLogEntry]);

  if (!inCombat || !monster) return null;

  const handlePlayerAttack = () => {
    if (playerTurn && !isRolling && !combatResult) {
      setIsRolling(true);
      setTimeout(() => {
        playerAttack();
        setIsRolling(false);
      }, 2000); // Roll animation duration (increased from 1500 to 2000)
    }
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case "monster_attack":
        return "text-red-400 border-l-red-500";
      case "player_attack":
        return "text-green-400 border-l-green-500";
      case "miss":
        return "text-gray-400 border-l-gray-500";
      case "victory":
        return "text-yellow-400 border-l-yellow-500";
      case "defeat":
        return "text-red-600 border-l-red-700";
      default:
        return "text-gray-400 border-l-gray-600";
    }
  };

  // Create a fake monster card to display using the Card component
  const monsterCard = {
    id: -1,
    type: "MONSTER" as const,
    value: 0,
    revealed: "RESOLVED" as const,
  };

  return (
    <div className="animate-fade-in grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 justify-items-center">
      {/* Combat card - similar structure to CharacterCard */}
      <div className="col-span-2 lg:col-span-4 card relative flex flex-col gap-3 bg-gradient-to-b from-red-900/50 to-gray-900/60 border-2 border-red-600/60 shadow-2xl w-full"
           style={{
             boxShadow: '0 0 20px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.2)'
           }}>

        {/* Main content: Image on left, everything else on right */}
        <div className="flex gap-4 w-full">
          {/* Monster Image - same size as adventurer */}
          <div className="relative w-[160px] h-[290px] overflow-hidden rounded-lg border border-red-800/60 bg-gradient-to-b from-gray-800/70 to-black/80 shadow-inner shrink-0 flex items-center justify-center">
            <img
              src="/cards/monster.png"
              alt={monster.name}
              className="w-full h-full object-cover scale-110"
            />
            {/* Monster glow effect */}
            <div className="absolute inset-0 bg-red-500/25 pointer-events-none animate-pulse rounded-lg" />
            <div className="absolute inset-0 pointer-events-none border-2 border-red-900/70 rounded-lg shadow-inner" />
          </div>

          {/* Stats and combat on the right */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Monster name */}
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{monster.name}</div>
              <div className="text-xs text-amber-300/70">Enemy</div>
            </div>

            {/* Monster Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="stat-box text-center">
                <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">HP</div>
                <div className="text-xl font-bold text-red-400 drop-shadow-md">
                  {monster.hp}/{monster.maxHp}
                </div>
              </div>
              <div className="stat-box text-center">
                <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">DMG</div>
                <div className="text-xl font-bold text-amber-300 drop-shadow-md">
                  {monster.attackRange[0]}-{monster.attackRange[1]}
                </div>
              </div>
            </div>

            {/* Combat Status */}
            <div className="stat-box text-center">
              <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">Status</div>
              <div className="text-base text-red-200/90 tracking-wider font-semibold">
                {combatResult ? (
                  combatResult === "victory" ? "🎉 Victory!" : "💀 Defeated!"
                ) : playerTurn ? (
                  "⚔️ Your Turn!"
                ) : (
                  "⏳ Monster's Turn..."
                )}
              </div>
            </div>

            {/* Dice Animation or Combat Log - Fixed height to prevent size changes */}
            <div className="min-h-[60px]">
              {isRolling ? (
                <div className="flex items-center justify-center py-2">
                  <div className="text-5xl animate-bounce">🎲</div>
                </div>
              ) : combatLogs.length > 0 && (
                <div className="overflow-y-auto space-y-1 pr-1 max-h-[60px]">
                  {combatLogs.slice(-2).map((log) => (
                    <div
                      key={log.id}
                      className={`text-[10px] border-l-2 pl-2 py-1 bg-gray-900/40 rounded ${getLogStyle(
                        log.type
                      )} animate-fade-in`}
                    >
                      {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-center mt-auto">
              {combatResult ? (
                <div className="text-center py-1">
                  <p className="text-[10px] text-gray-400">Closing...</p>
                </div>
              ) : (
                <button
                  onClick={handlePlayerAttack}
                  disabled={!playerTurn || isRolling}
                  className={`btn-primary px-6 py-2 text-sm transition-all duration-300 hover:scale-105 ${
                    !playerTurn || isRolling ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isRolling ? "🎲 Rolling..." : playerTurn ? "⚔️ Attack!" : "⏳ Waiting..."}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
