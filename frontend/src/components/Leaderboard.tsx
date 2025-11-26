"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  getPlayerProgress,
  getGlobalLeaderboard,
  formatAddress,
  LeaderboardEntry,
  PlayerProgress,
} from "@/lib/sui-blockchain";

interface LeaderboardProps {
  showPersonal?: boolean;
  variant?: "full" | "compact";
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  onRefresh: () => void;
  variant: "full" | "compact";
  error: string | null;
}

function LeaderboardTable({
  entries,
  loading,
  onRefresh,
  variant,
  error,
}: LeaderboardTableProps) {
  const hasData = entries.length > 0;
  const padding = variant === "compact" ? "p-4" : "p-6";

  return (
    <div className={`royal-board ${padding}`}>
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-200 text-[11px] uppercase tracking-[0.2em]">
              <span className="royal-dot" /> Top 10 Adventurers
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-100 drop-shadow-sm mt-2">
              Best victories by rooms cleared
            </h2>
            <p className="text-amber-100/70 text-xs md:text-sm">
              On-chain data - Successful runs only - Testnet
            </p>
            <div className="royal-divider mt-2" />
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="self-start md:self-auto px-3 py-2 text-sm font-semibold rounded-lg border border-amber-500/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh table"}
          </button>
        </div>

        {error && (
          <div className="text-red-200 text-sm bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-amber-900/50 backdrop-blur-sm bg-black/10">
          <div className="leaderboard-scroll">
            <table className="min-w-full table-fixed text-[13px] md:text-sm">
              <thead className="bg-black/30 text-amber-200/80 uppercase text-[11px] tracking-widest">
                <tr>
                  <th className="px-3 py-3 text-left w-12">#</th>
                  <th className="px-3 py-3 text-left w-2/5">Wallet</th>
                  <th className="px-3 py-3 text-center w-1/5">Rooms (win)</th>
                  <th className="px-3 py-3 text-center w-1/5">Max gems</th>
                  <th className="px-3 py-3 text-center w-1/5">Successful runs</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-amber-100/80"
                    >
                      Querying blockchain...
                    </td>
                  </tr>
                ) : hasData ? (
                  entries.map((player, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    return (
                      <tr
                        key={player.address}
                        className={`border-t border-amber-900/40 ${
                          isTop3 ? "bg-amber-500/5" : "bg-black/10"
                        }`}
                      >
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold rank-medal ${
                              rank === 1
                                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/40"
                                : "bg-amber-900/60 text-amber-200"
                            }`}
                          >
                            {rank}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div
                            className="font-mono text-amber-100"
                            title={player.address}
                          >
                            {formatAddress(player.address)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-amber-100">
                          {player.maxRoomsCleared}
                        </td>
                        <td className="px-3 py-3 text-center text-amber-100/90">
                          {player.maxGemsCollected}
                        </td>
                        <td className="px-3 py-3 text-center text-amber-100/90">
                          {player.successfulRuns} / {player.totalRuns}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-amber-100/80"
                    >
                      No victories yet. Be the first to escape the dungeon.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard({
  showPersonal = true,
  variant = "full",
}: LeaderboardProps) {
  const { address } = useGameStore();
  const [playerStats, setPlayerStats] = useState<PlayerProgress | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadGlobal();
  }, []);

  useEffect(() => {
    if (showPersonal && address) {
      loadPlayerStats();
    } else {
      setPlayerStats(null);
    }
  }, [address, showPersonal]);

  const loadPlayerStats = async () => {
    if (!address || !showPersonal) return;

    setLoadingPlayer(true);
    try {
      const progress = await getPlayerProgress(address);
      setPlayerStats(progress);
    } catch (error) {
      console.error("Error loading player stats:", error);
    } finally {
      setLoadingPlayer(false);
    }
  };

  const loadGlobal = async () => {
    setGlobalLoading(true);
    setGlobalError(null);
    try {
      const data = await getGlobalLeaderboard();
      setEntries(data);
    } catch (error) {
      console.error("Error loading global leaderboard:", error);
      setGlobalError("Failed to load global leaderboard.");
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <LeaderboardTable
        entries={entries}
        loading={globalLoading}
        onRefresh={loadGlobal}
        variant={variant}
        error={globalError}
      />

      {showPersonal && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-dungeon-gold">Your runs</h3>
            <button
              onClick={loadPlayerStats}
              disabled={loadingPlayer || !address}
              className="px-3 py-1 bg-dungeon-gold/20 hover:bg-dungeon-gold/30 border border-dungeon-gold/50 rounded-lg text-dungeon-gold text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlayer ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {!address ? (
            <p className="text-gray-400 text-center">
              Connect your wallet to see your progress.
            </p>
          ) : loadingPlayer ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : playerStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="stat-box">
                <div className="text-xs text-gray-400">Rooms (best run)</div>
                <div className="text-2xl font-bold text-purple-400">
                  {playerStats.maxRoomReached}
                </div>
              </div>

              <div className="stat-box">
                <div className="text-xs text-gray-400">Max gems</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {playerStats.maxGemsCollected}
                </div>
              </div>

              <div className="stat-box">
                <div className="text-xs text-gray-400">Successful runs</div>
                <div className="text-2xl font-bold text-green-400">
                  {playerStats.successfulRuns}
                </div>
              </div>

              <div className="stat-box">
                <div className="text-xs text-gray-400">Total runs</div>
                <div className="text-2xl font-bold text-blue-400">
                  {playerStats.totalRuns}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center">
              You have no runs yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
