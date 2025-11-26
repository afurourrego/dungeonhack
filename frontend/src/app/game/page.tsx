"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import WalletConnect from "@/components/WalletConnect";
import GameBoard from "@/components/GameBoard";
import AdventureLog from "@/components/AdventureLog";

export default function GamePage() {
  const router = useRouter();
  const { isConnected, hasNFT, error, message } = useGameStore();

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
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  // Helper function to get message styling based on content
  const getMessageStyle = (msg: string) => {
    if (msg.includes("⚔️") || msg.includes("defeated")) {
      return { bg: "bg-red-900/95", border: "border-red-500", text: "text-red-400" };
    } else if (msg.includes("💎") || msg.includes("gems")) {
      return { bg: "bg-yellow-900/95", border: "border-yellow-500", text: "text-yellow-400" };
    } else if (msg.includes("🕸️") || msg.includes("Trap")) {
      return { bg: "bg-purple-900/95", border: "border-purple-500", text: "text-purple-400" };
    } else if (msg.includes("🧪") || msg.includes("Potion") || msg.includes("HP")) {
      return { bg: "bg-green-900/95", border: "border-green-500", text: "text-green-400" };
    } else if (msg.includes("💔") || msg.includes("lose") || msg.includes("too strong")) {
      return { bg: "bg-red-900/95", border: "border-red-500", text: "text-red-400" };
    } else if (msg.includes("✅") || msg.includes("Success")) {
      return { bg: "bg-green-900/95", border: "border-green-500", text: "text-green-400" };
    } else if (msg.includes("⏳") || msg.includes("Advancing") || msg.includes("Entering")) {
      return { bg: "bg-blue-900/95", border: "border-blue-500", text: "text-blue-400" };
    } else if (msg.includes("💀") || msg.includes("died")) {
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push("/")}
                className="text-2xl font-bold text-dungeon-gold text-glow hover:text-yellow-300 transition-colors"
              >
                ⚔️ Dungeon Flip Lite
              </button>
              <p className="text-xs text-gray-400">Powered by OneChain</p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Global Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-center animate-slide-up mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Grid Layout: Game Board + Adventure Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Board - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <GameBoard />
            </div>

            {/* Adventure Log - Takes 1 column on large screens, full width on mobile */}
            <div className="lg:col-span-1">
              <AdventureLog />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>
            Built for OneHack 2.0 Hackathon
            <span className="mx-2">•</span>
            Powered by OneChain & OneWallet
          </p>
        </div>
      </footer>
    </main>
  );
}
