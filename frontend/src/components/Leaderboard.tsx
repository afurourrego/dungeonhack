"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import {
  getPlayerWeeklyScore,
  getWeeklyLeaderboard,
  getCurrentWeek,
  formatAddress,
  LeaderboardEntry,
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
  currentWeek: number;
  playerWeeklyScore: { score: number; rooms: number };
  loadingPlayer: boolean;
  onRefreshPlayer: () => void;
  playerAddress: string | null;
}

function LeaderboardTable({
  entries,
  loading,
  onRefresh,
  variant,
  error,
  currentWeek,
  playerWeeklyScore,
  loadingPlayer,
  onRefreshPlayer,
  playerAddress,
}: LeaderboardTableProps) {
  const hasData = entries.length > 0;
  const padding = variant === "compact" ? "p-4" : "p-6";

  return (
    <div className={`royal-board ${padding}`}>
      <div className="relative flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-200 text-[11px] uppercase tracking-[0.2em]">
              <span className="royal-dot" /> Week {currentWeek} • Top 10
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-100 drop-shadow-sm mt-2">
              Weekly Leaderboard - Best Scores
            </h2>
            <p className="text-amber-100/70 text-xs md:text-sm">
              This week's top performers • Resets every 7 days
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

        {/* Personal Best Score - Show if player is connected */}
        {playerAddress && (
          <div className="bg-gradient-to-r from-amber-900/20 via-amber-800/10 to-transparent rounded-lg border border-amber-700/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">👤</div>
                <div>
                  <div className="text-sm text-amber-300/70 uppercase tracking-wider">
                    Your Best This Week
                  </div>
                  <div className="font-mono text-xs text-amber-400/80">
                    {formatAddress(playerAddress)}
                  </div>
                </div>
              </div>

              {loadingPlayer ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : playerWeeklyScore.score > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-amber-300/60 uppercase tracking-wider">Score</div>
                    <div className="text-2xl font-bold text-dungeon-gold dot-matrix">
                      {playerWeeklyScore.score}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-amber-300/60 uppercase tracking-wider">Rooms</div>
                    <div className="text-xl font-bold text-purple-400">
                      {playerWeeklyScore.rooms}
                    </div>
                  </div>
                  <button
                    onClick={onRefreshPlayer}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-500/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  No runs this week yet
                </div>
              )}
            </div>
          </div>
        )}

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
  const [playerWeeklyScore, setPlayerWeeklyScore] = useState<{ score: number; rooms: number }>({ score: 0, rooms: 0 });
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    loadGlobal();
  }, []);

  useEffect(() => {
    if (showPersonal && address) {
      loadPlayerStats();
    } else {
      setPlayerWeeklyScore({ score: 0, rooms: 0 });
    }
  }, [address, showPersonal]);

  const loadPlayerStats = async () => {
    if (!address || !showPersonal) return;

    setLoadingPlayer(true);
    try {
      const weeklyScore = await getPlayerWeeklyScore(address);
      setPlayerWeeklyScore(weeklyScore);
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
      const week = await getCurrentWeek();
      setCurrentWeek(week);
      const data = await getWeeklyLeaderboard(); // Use weekly instead of global
      setEntries(data);
    } catch (error) {
      console.error("Error loading weekly leaderboard:", error);
      setGlobalError("Failed to load weekly leaderboard.");
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <LeaderboardTable
      entries={entries}
      loading={globalLoading}
      onRefresh={loadGlobal}
      variant={variant}
      error={globalError}
      currentWeek={currentWeek}
      playerWeeklyScore={playerWeeklyScore}
      loadingPlayer={loadingPlayer}
      onRefreshPlayer={loadPlayerStats}
      playerAddress={showPersonal ? address : null}
    />
  );
}
