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

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function Card({ card, onClick, disabled }: CardProps) {
  const isRevealed = card.revealed !== CardRevealState.HIDDEN;
  const displayInfo = isRevealed ? getCardDisplayInfo(card) : null;
  const [isFlipping, setIsFlipping] = useState(false);
  const [showFront, setShowFront] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Reset state when card changes (new room)
  useEffect(() => {
    setShowFront(false);
    setIsFlipping(false);
    setParticles([]);
    setIsHovered(false);
  }, [card.id]);

  // Trigger flip animation and particles when card is revealed
  useEffect(() => {
    if (isRevealed && !showFront) {
      setIsFlipping(true);

      // Generate particles based on card type
      const particleColors = {
        [CardType.MONSTER]: ['#ef4444', '#dc2626', '#991b1b'],
        [CardType.TREASURE]: ['#fbbf24', '#f59e0b', '#d97706'],
        [CardType.TRAP]: ['#a855f7', '#9333ea', '#7e22ce'],
        [CardType.POTION]: ['#4ade80', '#22c55e', '#16a34a'],
      };

      const colors = particleColors[card.type] || ['#fbbf24'];
      const newParticles: Particle[] = [];

      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: i,
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
        });
      }

      setParticles(newParticles);

      // Show front after half the flip animation
      setTimeout(() => {
        setShowFront(true);
      }, 350);

      // End flip animation and clear particles
      setTimeout(() => {
        setIsFlipping(false);
        setParticles([]);
      }, 800);
    }
  }, [isRevealed, showFront, card.type]);

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-56 h-96 rounded-2xl transition-all duration-300
          ${disabled ? "opacity-80 cursor-not-allowed" : "hover:scale-110 hover:shadow-2xl hover:brightness-110 cursor-pointer"}
          ${isFlipping ? "animate-flip-3d" : ""}
          ${isHovered && !disabled ? "shadow-lg shadow-amber-500/50" : ""}`}
      >
        <Image
          src="/cards/reverse.png"
          alt="Card Back"
          fill
          className="object-contain"
          priority
        />

        {/* Hover glow effect */}
        {isHovered && !disabled && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 via-transparent to-purple-500/20 pointer-events-none animate-energy-pulse"
               style={{ '--glow-color': 'rgba(251, 191, 36, 0.6)' } as React.CSSProperties} />
        )}

        {/* Particles when flipping */}
        {isFlipping && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none animate-particle-burst"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              '--tx': `${particle.x}px`,
              '--ty': `${particle.y}px`,
            } as React.CSSProperties}
          />
        ))}
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

      {/* Card info overlay con gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col items-center justify-end pb-4 px-3">
        <div className="text-center">
          <div className="text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-1.5">
            {displayInfo?.title}
          </div>
          <div className="text-xs text-gray-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {displayInfo?.description}
          </div>
        </div>
      </div>

      {/* Enhanced glow effects por tipo de carta */}
      {card.type === CardType.MONSTER && (
        <>
          <div className="absolute inset-0 bg-red-500/25 pointer-events-none animate-pulse rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(239,68,68,0.4)] pointer-events-none" />
        </>
      )}
      {card.type === CardType.TREASURE && (
        <>
          <div className="absolute inset-0 bg-yellow-400/25 pointer-events-none rounded-2xl"
               style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(251,191,36,0.5),0_0_20px_rgba(251,191,36,0.3)] pointer-events-none" />
        </>
      )}
      {card.type === CardType.POTION && (
        <>
          <div className="absolute inset-0 bg-green-400/25 pointer-events-none animate-pulse rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(74,222,128,0.4)] pointer-events-none" />
        </>
      )}
      {card.type === CardType.TRAP && (
        <>
          <div className="absolute inset-0 bg-purple-500/25 pointer-events-none rounded-2xl" />
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(168,85,247,0.4)] pointer-events-none" />
        </>
      )}

      {/* Particles burst effect */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none animate-particle-burst"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
