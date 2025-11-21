"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { getPlayerProgress } from "@/lib/sui-blockchain";
import { formatAddress } from "@/lib/sui-blockchain";

interface PlayerStats {
  address: string;
  maxRoomReached: number;
  totalRuns: number;
  monstersDefeated: number;
  maxGemsCollected: number;
}

export default function Leaderboard() {
  const { address } = useGameStore();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadPlayerStats();
    }
  }, [address]);

  const loadPlayerStats = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const progress = await getPlayerProgress(address);
      setPlayerStats({
        address,
        maxRoomReached: progress.maxRoomReached,
        totalRuns: progress.totalRuns,
        monstersDefeated: progress.monstersDefeated,
        maxGemsCollected: progress.maxGemsCollected,
      });
    } catch (error) {
      console.error("Error loading player stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="card text-center">
        <h2 className="text-xl font-bold text-dungeon-gold mb-4">
          🏆 Leaderboard
        </h2>
        <p className="text-gray-400">Connect your wallet to view stats</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-dungeon-gold mb-6">
        🏆 Your Stats
      </h2>

      {loading ? (
        <p className="text-gray-400 text-center">Loading...</p>
      ) : playerStats ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Address</span>
            <span className="text-dungeon-gold font-mono">
              {formatAddress(playerStats.address)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-box">
              <div className="text-xs text-gray-400">Max Room Reached</div>
              <div className="text-2xl font-bold text-purple-400">
                {playerStats.maxRoomReached}
              </div>
            </div>

            <div className="stat-box">
              <div className="text-xs text-gray-400">Max Gems Collected</div>
              <div className="text-2xl font-bold text-yellow-400">
                💎 {playerStats.maxGemsCollected}
              </div>
            </div>

            <div className="stat-box">
              <div className="text-xs text-gray-400">Total Runs</div>
              <div className="text-2xl font-bold text-blue-400">
                {playerStats.totalRuns}
              </div>
            </div>

            <div className="stat-box">
              <div className="text-xs text-gray-400">Monsters Defeated</div>
              <div className="text-2xl font-bold text-red-400">
                {playerStats.monstersDefeated}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              📊 <strong>Coming Soon:</strong> Global leaderboard with top
              players ranked by max rooms reached!
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center">No stats available yet</p>
      )}
    </div>
  );
}
