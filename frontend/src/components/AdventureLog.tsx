"use client";

import { useGameStore, AdventureLogEntry } from "@/store/gameStore";
import { useEffect, useRef } from "react";

export default function AdventureLog() {
  const { adventureLog, currentRoom } = useGameStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [adventureLog]);

  const getEntryStyle = (type: AdventureLogEntry["type"]) => {
    switch (type) {
      case "start":
        return "text-dungeon-gold border-l-dungeon-gold";
      case "monster":
        return "text-red-400 border-l-red-500";
      case "treasure":
        return "text-yellow-400 border-l-yellow-500";
      case "trap":
        return "text-purple-400 border-l-purple-500";
      case "potion":
        return "text-green-400 border-l-green-500";
      case "room":
        return "text-blue-400 border-l-blue-500";
      case "death":
        return "text-gray-300 border-l-gray-500";
      case "exit":
        return "text-green-400 border-l-green-600";
      default:
        return "text-gray-400 border-l-gray-600";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="card flex flex-col h-[250px]">
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className="text-lg font-bold text-amber-400 drop-shadow-lg">
          📜 Adventure Log <span className="text-amber-300/80">• Room {currentRoom}</span>
        </h3>
        {adventureLog.length > 0 && (
          <span className="text-xs text-amber-300/60 uppercase tracking-wider">
            {adventureLog.length} {adventureLog.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
        {adventureLog.length === 0 ? (
          <div className="flex items-center justify-center h-full text-amber-300/50">
            <div className="text-center">
              <p className="text-3xl mb-1">🏰</p>
              <p className="text-sm">Your adventure begins here...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {adventureLog.map((entry) => (
              <div
                key={entry.id}
                className={`text-sm border-l-4 pl-3 py-2 bg-gray-900/40 backdrop-blur-sm rounded ${getEntryStyle(
                  entry.type
                )} animate-fade-in`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="flex-1">{entry.message}</p>
                  <span className="text-xs text-amber-300/40 whitespace-nowrap">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
