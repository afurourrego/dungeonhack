"use client";

import { useState, useEffect } from "react";
import {
  getWeeklyLeaderboard,
  getCurrentWeek,
  formatAddress,
  LeaderboardEntry,
} from "@/lib/onechain-blockchain";

interface WeekWinner {
  weekNumber: number;
  winner: LeaderboardEntry | null;
  top3: LeaderboardEntry[];
  loading: boolean;
}

export default function PastSeasons() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [pastWeeks, setPastWeeks] = useState<WeekWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPastSeasons();
  }, []);

  const loadPastSeasons = async () => {
    setLoading(true);
    try {
      const week = await getCurrentWeek();
      setCurrentWeek(week);

      // Load past weeks (excluding current week)
      const pastWeeksData: WeekWinner[] = [];

      // Only load completed weeks (week < current week)
      if (week > 1) {
        // Load last 5 completed weeks (or fewer if game is new)
        const lastCompletedWeek = week - 1;
        const startWeek = Math.max(1, lastCompletedWeek - 4); // Show last 5 weeks

        for (let w = lastCompletedWeek; w >= startWeek; w--) {
          pastWeeksData.push({
            weekNumber: w,
            winner: null,
            top3: [],
            loading: true,
          });
        }
      }

      setPastWeeks(pastWeeksData);

      // Load data for each week
      for (let i = 0; i < pastWeeksData.length; i++) {
        const weekData = pastWeeksData[i];
        try {
          const leaderboard = await getWeeklyLeaderboard(weekData.weekNumber);
          const top3 = leaderboard.slice(0, 3);
          const winner = leaderboard[0] || null;

          setPastWeeks(prev => prev.map(w =>
            w.weekNumber === weekData.weekNumber
              ? { ...w, winner, top3, loading: false }
              : w
          ));
        } catch (error) {
          console.error(`Error loading week ${weekData.weekNumber}:`, error);
          setPastWeeks(prev => prev.map(w =>
            w.weekNumber === weekData.weekNumber
              ? { ...w, loading: false }
              : w
          ));
        }
      }
    } catch (error) {
      console.error("Error loading past seasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="royal-board p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏳</div>
          <div className="text-sm text-gray-400">Loading past seasons...</div>
        </div>
      </div>
    );
  }

  if (pastWeeks.length === 0 || currentWeek === 1) {
    return (
      <div className="royal-board p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-lg font-bold text-amber-300 mb-2">Past Season Winners</div>
          <div className="text-sm text-gray-400">
            No completed seasons yet. Check back after Week 1 ends!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="royal-board p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/50 bg-amber-500/10 text-amber-200 text-[11px] uppercase tracking-[0.2em] mb-3">
          <span className="royal-dot" /> Hall of Champions
        </div>
        <h2 className="text-2xl font-bold text-amber-100 drop-shadow-sm">
          Past Season Winners
        </h2>
        <p className="text-amber-100/70 text-sm mt-1">
          Historical winners from previous weeks
        </p>
        <div className="royal-divider mt-3" />
      </div>

      {/* Past Weeks List */}
      <div className="space-y-4">
        {pastWeeks.map((weekData) => (
          <div
            key={weekData.weekNumber}
            className="bg-gradient-to-r from-amber-900/20 via-transparent to-transparent rounded-lg border border-amber-800/40 overflow-hidden transition-all duration-300 hover:border-amber-700/60"
          >
            {/* Week Header */}
            <button
              onClick={() => setSelectedWeek(
                selectedWeek === weekData.weekNumber ? null : weekData.weekNumber
              )}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-900/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {weekData.winner ? "🏆" : "📅"}
                </div>
                <div className="text-left">
                  <div className="font-bold text-amber-200">
                    Week {weekData.weekNumber}
                  </div>
                  {weekData.loading ? (
                    <div className="text-xs text-gray-400">Loading...</div>
                  ) : weekData.winner ? (
                    <div className="text-xs text-gray-300">
                      Winner: <span className="font-mono text-amber-300">
                        {formatAddress(weekData.winner.address)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">No data available</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {weekData.winner && (
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-gray-400">Top Score</div>
                    <div className="text-lg font-bold text-dungeon-gold dot-matrix">
                      {weekData.winner.maxGemsCollected}
                    </div>
                  </div>
                )}
                <div className="text-amber-400">
                  {selectedWeek === weekData.weekNumber ? "▼" : "▶"}
                </div>
              </div>
            </button>

            {/* Expanded Top 3 */}
            {selectedWeek === weekData.weekNumber && weekData.top3.length > 0 && (
              <div className="px-4 pb-4 pt-2 border-t border-amber-800/30 bg-black/20">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-3">
                  Top 3 Finishers
                </div>
                <div className="space-y-2">
                  {weekData.top3.map((player, index) => (
                    <div
                      key={player.address}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/20 to-transparent border border-amber-800/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl w-10 text-center">
                          {getMedalEmoji(index + 1)}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-amber-100">
                            {formatAddress(player.address)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {player.successfulRuns} successful runs
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-dungeon-gold dot-matrix">
                          {player.maxGemsCollected}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.maxRoomsCleared} rooms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadPastSeasons}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-amber-500/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
}
