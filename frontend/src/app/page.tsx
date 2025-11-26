"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import WalletConnect from "@/components/WalletConnect";
import MintAventurer from "@/components/MintAventurer";
import Leaderboard from "@/components/Leaderboard";
import TotalRunsBadge from "@/components/TotalRunsBadge";
import { useWallet } from "@/hooks/useWallet";

export default function Home() {
  const router = useRouter();
  const { isConnected, hasNFT, error, message } = useGameStore();

  // Navigate to game page when ready
  useEffect(() => {
    if (isConnected && hasNFT) {
      const timer = setTimeout(() => {}, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, hasNFT, router]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-dungeon-gold text-glow">
                Dungeon Flip Lite
              </h1>
              <p className="text-xs text-gray-400">Powered by OneChain</p>
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
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Message */}
          {!isConnected && (
            <div className="card text-center animate-fade-in">
              <h2 className="text-3xl font-bold text-dungeon-gold mb-4">
                Welcome to Dungeon Flip Lite!
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                A Web3 roguelite mini-game built for OneHack 2.0. Connect your OneWallet
                to mint your Adventurer NFT and start exploring the dungeon!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto mb-8">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-2xl mb-2">🗡️</div>
                  <h3 className="font-bold mb-1">Flip Cards</h3>
                  <p className="text-xs text-gray-400">
                    Reveal 4 mysterious cards each run
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-2xl mb-2">⚔️</div>
                  <h3 className="font-bold mb-1">Battle Monsters</h3>
                  <p className="text-xs text-gray-400">
                    Defeat enemies with your ATK stat
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-2xl mb-2">💎</div>
                  <h3 className="font-bold mb-1">Earn Rewards</h3>
                  <p className="text-xs text-gray-400">
                    Claim Soul Fragment tokens on-chain
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Global Message Display */}
          {message && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 text-center animate-slide-up">
              <p className="text-green-400">{message}</p>
            </div>
          )}

          {/* Global Error Display */}
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-center animate-slide-up">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Mint Adventurer Section */}
          {isConnected && <MintAventurer />}

          {/* Play Button */}
          {isConnected && hasNFT && (
            <div className="text-center animate-fade-in">
              <button
                onClick={() => router.push("/game")}
                className="btn-success text-lg py-4 px-8"
              >
                Enter the Dungeon
              </button>
            </div>
          )}

          {/* Leaderboard Section */}
          <Leaderboard showPersonal={isConnected} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm py-6">
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
