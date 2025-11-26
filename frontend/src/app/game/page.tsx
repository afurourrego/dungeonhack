"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { GameState } from "@/lib/constants";
import WalletConnect from "@/components/WalletConnect";
import GameBoard from "@/components/GameBoard";
import CharacterCard from "@/components/CharacterCard";
import AdventureLog from "@/components/AdventureLog";
import TotalRunsBadge from "@/components/TotalRunsBadge";

export default function GamePage() {
  const router = useRouter();
  const { isConnected, hasNFT, error, message, gameState, avatarSrc } = useGameStore();

  // Redirect if not connected or no NFT
  useEffect(() => {
    if (!isConnected || !hasNFT) {
      router.push("/");
    }
  }, [isConnected, hasNFT, router]);

  // Don't render until verified
  if (!isConnected || !hasNFT) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">...</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  // Helper function to get message styling based on content
  const getMessageStyle = (msg: string) => {
    const normalized = msg.toLowerCase();
    if (normalized.includes("monster") || normalized.includes("defeated")) {
      return { bg: "bg-red-900/95", border: "border-red-500", text: "text-red-400" };
    } else if (normalized.includes("gem") || normalized.includes("treasure")) {
      return { bg: "bg-yellow-900/95", border: "border-yellow-500", text: "text-yellow-400" };
    } else if (normalized.includes("trap")) {
      return { bg: "bg-purple-900/95", border: "border-purple-500", text: "text-purple-400" };
    } else if (normalized.includes("potion") || normalized.includes("hp") || normalized.includes("heal")) {
      return { bg: "bg-green-900/95", border: "border-green-500", text: "text-green-400" };
    } else if (normalized.includes("lose") || normalized.includes("too strong")) {
      return { bg: "bg-red-900/95", border: "border-red-500", text: "text-red-400" };
    } else if (normalized.includes("success") || normalized.includes("escaped") || normalized.includes("claimed")) {
      return { bg: "bg-green-900/95", border: "border-green-500", text: "text-green-400" };
    } else if (normalized.includes("advancing") || normalized.includes("entering") || normalized.includes("room")) {
      return { bg: "bg-amber-900/95", border: "border-amber-600", text: "text-amber-400" };
    } else if (normalized.includes("died") || normalized.includes("death")) {
      return { bg: "bg-gray-900/95", border: "border-gray-500", text: "text-gray-300" };
    } else {
      return { bg: "bg-gray-900/95", border: "border-dungeon-gold", text: "text-dungeon-gold" };
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Floating Toast Message - Fixed at top level */}
      {message && (() => {
        const style = getMessageStyle(message);
        return (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down-center max-w-lg">
            <div className={`${style.bg} border-2 ${style.border} rounded-lg px-6 py-3 shadow-2xl backdrop-blur-sm`}>
              <p className={`${style.text} font-semibold text-center`}>
                {message}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push("/")}
                className="text-xl font-bold text-dungeon-gold text-glow hover:text-yellow-300 transition-colors"
              >
                Dungeon Flip Lite
              </button>
              <p className="text-[10px] text-gray-400">Powered by OneChain</p>
            </div>
            <div className="flex-1 flex justify-center">
              <TotalRunsBadge />
            </div>
            <div className="flex-shrink-0">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Global Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-center animate-slide-up mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Main Layout: Top (Game Board full width) + Bottom (Character + Log) */}
          <div className="space-y-4">
            {/* Top Section: Game Board - Full width */}
            <div className="w-full">
              <GameBoard />
            </div>

            {/* Bottom Section: Character Card + Adventure Log (side by side) - Only show during active gameplay */}
            {gameState === GameState.IN_PROGRESS && (
              <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-stretch">
                {/* Character Card - Left side */}
                <div className="flex">
                  <CharacterCard avatarSrc={avatarSrc} />
                </div>

                {/* Adventure Log - Right side, takes remaining space, matches height */}
                <div className="flex h-[320px]">
                  <AdventureLog />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>
            Built for OneHack 2.0 Hackathon
            <span className="mx-2">*</span>
            Powered by OneChain & OneWallet
          </p>
        </div>
      </footer>
    </main>
  );
}
