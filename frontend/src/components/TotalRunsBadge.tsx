"use client";

import { useEffect, useState } from "react";
import { getTotalRuns } from "@/lib/sui-blockchain";

export default function TotalRunsBadge() {
  const [totalRuns, setTotalRuns] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const total = await getTotalRuns();
      setTotalRuns(total);
    } catch (error) {
      console.error("Error fetching total runs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="run-counter shadow-lg">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-amber-200/80 dot-matrix">
        <span className="royal-dot" />
        <span>Total executed runs</span>
      </div>
      <div className="text-3xl font-extrabold text-amber-100 leading-none drop-shadow-lg dot-matrix">
        {loading && totalRuns === null ? "..." : totalRuns ?? 0}
      </div>
      <div className="run-counter-shine" aria-hidden />
    </div>
  );
}
