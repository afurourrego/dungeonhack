"use client";

import { GameCard } from "@/lib/gameLogic";
import { CardRevealState, CardType } from "@/lib/constants";
import { getCardDisplayInfo } from "@/lib/gameLogic";
import Image from "next/image";
import { useState, useEffect } from "react";

interface CardProps {
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Card({ card, onClick, disabled }: CardProps) {
  const isRevealed = card.revealed !== CardRevealState.HIDDEN;
  const displayInfo = isRevealed ? getCardDisplayInfo(card) : null;
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFront, setShowFront] = useState(false);

  // Trigger flip animation when card is revealed
  useEffect(() => {
    if (isRevealed && !showFront) {
      setIsFlipping(true);
      // Show front after half the flip animation (when card is perpendicular)
      setTimeout(() => {
        setShowFront(true);
      }, 300);
      // End flip animation
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }
  }, [isRevealed, showFront]);

  // Get card image based on type
  const getCardImage = (type: CardType) => {
    switch (type) {
      case CardType.MONSTER:
        return "/cards/monster.png";
      case CardType.TREASURE:
        return "/cards/gem.png";
      case CardType.TRAP:
        return "/cards/trap.png";
      case CardType.POTION:
        return "/cards/potion.png";
      default:
        return "/cards/reverse.png";
    }
  };

  // Get special effect class based on card type
  const getEffectClass = (type: CardType) => {
    switch (type) {
      case CardType.TREASURE:
        return "animate-shine"; // Brillo para gemas
      case CardType.TRAP:
        return "animate-shake"; // Shake para trampas
      case CardType.MONSTER:
        return "animate-glow-red"; // Glow rojo para monstruos
      case CardType.POTION:
        return "animate-bubble"; // Burbujeo para pociones
      default:
        return "";
    }
  };

  if (!isRevealed) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative w-56 h-96 rounded-2xl transition-all duration-300
          ${disabled ? "opacity-80 cursor-not-allowed" : "hover:scale-105 hover:shadow-2xl cursor-pointer"}
          ${isFlipping ? "animate-flip-3d" : ""}`}
      >
        <Image
          src="/cards/reverse.png"
          alt="Card Back"
          fill
          className="object-contain"
          priority
        />
      </button>
    );
  }

  return (
    <div
      className={`relative w-56 h-96 rounded-2xl transition-all duration-300 bg-gray-900
        ${isFlipping ? "animate-flip-3d" : "animate-fade-in"}
        ${displayInfo ? getEffectClass(card.type) : ""}`}
    >
      <Image
        src={getCardImage(card.type)}
        alt={displayInfo?.title || "Card"}
        fill
        className="object-contain"
        priority
      />

      {/* Card info overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col items-center justify-end pb-3 px-2">
        <div className="text-center">
          <div className="text-sm font-bold text-white drop-shadow-lg mb-1">
            {displayInfo?.title}
          </div>
          <div className="text-xs text-gray-200 drop-shadow-md">
            {displayInfo?.description}
          </div>
        </div>
      </div>

      {/* Special glow effect for different card types */}
      {card.type === CardType.MONSTER && (
        <div className="absolute inset-0 bg-red-500/20 pointer-events-none animate-pulse" />
      )}
      {card.type === CardType.TREASURE && (
        <div className="absolute inset-0 bg-yellow-400/20 pointer-events-none animate-ping" style={{ animationDuration: '2s' }} />
      )}
      {card.type === CardType.POTION && (
        <div className="absolute inset-0 bg-green-400/20 pointer-events-none animate-pulse" />
      )}
      {card.type === CardType.TRAP && (
        <div className="absolute inset-0 bg-purple-500/20 pointer-events-none" />
      )}
    </div>
  );
}
