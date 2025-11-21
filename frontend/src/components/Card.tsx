"use client";

import { GameCard } from "@/lib/gameLogic";
import { CardRevealState } from "@/lib/constants";
import { getCardDisplayInfo } from "@/lib/gameLogic";

interface CardProps {
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Card({ card, onClick, disabled }: CardProps) {
  const isRevealed = card.revealed !== CardRevealState.HIDDEN;
  const displayInfo = isRevealed ? getCardDisplayInfo(card) : null;

  if (!isRevealed) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="card-back hover:scale-110 disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="text-4xl">🎴</div>
        <div className="text-xs mt-2 text-gray-400">Click to reveal</div>
      </button>
    );
  }

  return (
    <div className={`${displayInfo?.className} animate-fade-in`}>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-5xl mb-2">{displayInfo?.icon}</div>
        <div className="text-sm font-bold">{displayInfo?.title}</div>
        <div className="text-xs mt-1">{displayInfo?.description}</div>
      </div>
    </div>
  );
}
