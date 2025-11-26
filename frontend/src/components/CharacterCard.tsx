"use client";

import Image from "next/image";
import { useGameStore } from "@/store/gameStore";

interface CharacterCardProps {
  avatarSrc: string;
}

export default function CharacterCard({ avatarSrc }: CharacterCardProps) {
  const { playerStats } = useGameStore();

  return (
    <div className="card relative h-full flex flex-col gap-3 bg-gradient-to-b from-amber-900/50 to-gray-900/60 w-[360px] shrink-0">
      {/* Main content: Image on left, stats on right */}
      <div className="flex gap-4">
        {/* Avatar Image */}
        <div className="relative w-[160px] h-[290px] overflow-hidden rounded-lg border border-amber-800/60 bg-gradient-to-b from-gray-800/70 to-black/80 shadow-inner shrink-0">
          <Image
            src={avatarSrc}
            alt="Adventurer portrait"
            fill
            className="object-cover scale-103"
            priority
          />
          <div className="absolute inset-0 pointer-events-none border-2 border-amber-900/70 rounded-lg shadow-inner" />
        </div>

        {/* Stats on the right */}
        <div className="flex-1 flex flex-col gap-2">
          {/* HP and DEF side by side */}
          <div className="grid grid-cols-2 gap-2">
            <div className="stat-box text-center">
              <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">HP</div>
              <div className="text-2xl font-bold text-green-400 drop-shadow-md">
                {playerStats.hp}
              </div>
            </div>
            <div className="stat-box text-center">
              <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">DEF</div>
              <div className="text-2xl font-bold text-blue-400 drop-shadow-md">
                {playerStats.def}
              </div>
            </div>
          </div>
          {/* Gems full width */}
          <div className="stat-box text-center">
            <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">Gems</div>
            <div className="text-2xl font-bold text-dungeon-gold drop-shadow-md">
              {playerStats.gold}
            </div>
          </div>

          {/* Message */}
          <div className="text-xs text-amber-100/70 text-center mt-5">
            <div className="text-amber-200/80 tracking-wider font-semibold">
              Adventurer are you ready for the next flip?
            </div>
            <div className="mt-1 text-[10px]">
              Pick a card to reveal your fate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
