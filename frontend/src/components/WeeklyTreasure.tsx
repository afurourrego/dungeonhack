"use client";

import { useEffect, useState } from "react";
import { getRewardsPoolInfo, RewardsPoolInfo } from "@/lib/onechain-blockchain";

export default function WeeklyTreasure() {
  const [poolInfo, setPoolInfo] = useState<RewardsPoolInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Fetch pool info on mount and refresh every 30 seconds
  useEffect(() => {
    const fetchPoolInfo = async () => {
      const info = await getRewardsPoolInfo();
      setPoolInfo(info);
      setLoading(false);
    };

    fetchPoolInfo();
    const interval = setInterval(fetchPoolInfo, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  // Calculate next Friday 4:20 PM UTC
  const getNextFriday420PM = (): number => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 5 = Friday
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    let daysUntilFriday = (5 - dayOfWeek + 7) % 7; // Days until next Friday

    // If today is Friday
    if (dayOfWeek === 5) {
      // If it's before 4:20 PM UTC, use today
      if (currentHour < 16 || (currentHour === 16 && currentMinute < 20)) {
        daysUntilFriday = 0;
      } else {
        // If it's after 4:20 PM UTC, use next Friday
        daysUntilFriday = 7;
      }
    }

    // If daysUntilFriday is 0 and we're past Friday, go to next week
    if (daysUntilFriday === 0 && dayOfWeek !== 5) {
      daysUntilFriday = 7;
    }

    const nextFriday = new Date(now);
    nextFriday.setUTCDate(now.getUTCDate() + daysUntilFriday);
    nextFriday.setUTCHours(16, 20, 0, 0); // 4:20 PM UTC

    return nextFriday.getTime();
  };

  // Update countdown timer every second
  useEffect(() => {
    if (!poolInfo) return;

    const updateTimer = () => {
      // Calculate remaining time to next Friday 4:20 PM UTC
      const now = Date.now();
      const nextFriday = getNextFriday420PM();
      const remaining = nextFriday - now;

      if (remaining <= 0) {
        setTimeRemaining("Distribution ready!");
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [poolInfo]);

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏳</div>
          <div className="text-sm text-gray-400">Loading treasure pool...</div>
        </div>
      </div>
    );
  }

  if (!poolInfo) {
    return null; // Don't show if pool data unavailable
  }

  // Calculate prize distribution
  const prizes = [
    { place: "1st", percentage: 30, amount: poolInfo.poolBalance * 0.30 },
    { place: "2nd", percentage: 20, amount: poolInfo.poolBalance * 0.20 },
    { place: "3rd", percentage: 15, amount: poolInfo.poolBalance * 0.15 },
  ];

  return (
    <div className="royal-board p-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="text-5xl animate-bounce-slow">💰</div>
          <h2 className="text-3xl font-bold text-dungeon-gold drop-shadow-lg">
            Weekly Treasure Pool
          </h2>
          <div className="text-5xl animate-bounce-slow">💰</div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="royal-dot" />
          <p className="text-amber-300/80 text-sm uppercase tracking-wider">
            Week {poolInfo.currentWeek}
          </p>
          <div className="royal-dot" />
        </div>
      </div>

      {/* Main Pool Display */}
      <div className="relative mb-6 p-6 rounded-xl bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-amber-900/40 border-2 border-amber-500/60 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-600/10 rounded-xl pointer-events-none animate-pulse" />

        <div className="relative text-center">
          <div className="text-xs text-amber-300/70 uppercase tracking-wider mb-2">
            Current Prize Pool
          </div>
          <div className="text-6xl font-bold text-dungeon-gold drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] mb-1 dot-matrix">
            {poolInfo.poolBalance.toFixed(2)} OCT
          </div>
          <div className="text-xs text-amber-300/60">
            ≈ ${(poolInfo.poolBalance * 1.5).toFixed(2)} USD
          </div>
        </div>

        {/* Countdown */}
        {timeRemaining && (
          <div className="mt-4 pt-4 border-t border-amber-600/30">
            <div className="text-center">
              <div className="text-xs text-amber-300/70 uppercase tracking-wider mb-1">
                Distribution In
              </div>
              <div className="text-2xl font-bold text-amber-400 drop-shadow-lg dot-matrix">
                {timeRemaining}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prize Breakdown */}
      <div className="space-y-3 mb-4">
        <div className="text-center text-sm text-amber-300/80 uppercase tracking-wider mb-3">
          Top 3 Prizes
        </div>

        {prizes.map((prize, index) => (
          <div
            key={prize.place}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-900/30 to-transparent border border-amber-700/40 hover:border-amber-600/60 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`
                text-2xl w-10 h-10 flex items-center justify-center rounded-full
                ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                ${index === 1 ? 'bg-gray-400/20 text-gray-300' : ''}
                ${index === 2 ? 'bg-amber-700/20 text-amber-500' : ''}
              `}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div>
                <div className="font-bold text-white">{prize.place} Place</div>
                <div className="text-xs text-amber-300/60">{prize.percentage}% of pool</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-dungeon-gold dot-matrix">
                {prize.amount.toFixed(2)} OCT
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-4 border-t border-amber-700/30">
        <p className="text-xs text-amber-300/60 mb-1">
          70% of all entry fees go to the weekly prize pool
        </p>
        <p className="text-xs text-amber-300/50">
          Top 10 players share the pool • Distribution every 7 days
        </p>
      </div>
    </div>
  );
}
