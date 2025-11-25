"use client";

import { useWallet } from "@/hooks/useWallet";
import { GAME_CONFIG, DEV_MODE } from "@/lib/constants";
import { useGameStore } from "@/store/gameStore";

export default function MintAventurer() {
  const { hasNFT, isLoading, mint } = useWallet();
  const { setHasNFT } = useGameStore();

  if (hasNFT) {
    return (
      <div className="card text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-dungeon-gold mb-4">
          🗡️ Your Adventurer is Ready!
        </h2>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          <div className="stat-box">
            <div className="text-xs text-gray-400">ATK</div>
            <div className="text-3xl font-bold text-red-400">{GAME_CONFIG.BASIC_ATK}</div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">DEF</div>
            <div className="text-3xl font-bold text-blue-400">{GAME_CONFIG.BASIC_DEF}</div>
          </div>
          <div className="stat-box">
            <div className="text-xs text-gray-400">HP</div>
            <div className="text-3xl font-bold text-green-400">{GAME_CONFIG.BASIC_HP}</div>
          </div>
        </div>

        <p className="text-gray-400">Ready to enter the dungeon?</p>
      </div>
    );
  }

  return (
    <div className="card text-center animate-fade-in">
      <h2 className="text-2xl font-bold text-dungeon-gold mb-4">
        🎭 Mint Your Adventurer
      </h2>

      <p className="text-dungeon-gold mb-6">
        Create your basic adventurer NFT to start playing Dungeon Flip Lite.
        <br />
        <span className="text-sm text-gray-400">
          (Free mint - one per wallet)
        </span>
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
        <div className="stat-box opacity-50">
          <div className="text-xs text-gray-400">ATK</div>
          <div className="text-3xl font-bold text-red-400">{GAME_CONFIG.BASIC_ATK}</div>
        </div>
        <div className="stat-box opacity-50">
          <div className="text-xs text-gray-400">DEF</div>
          <div className="text-3xl font-bold text-blue-400">{GAME_CONFIG.BASIC_DEF}</div>
        </div>
        <div className="stat-box opacity-50">
          <div className="text-xs text-gray-400">HP</div>
          <div className="text-3xl font-bold text-green-400">{GAME_CONFIG.BASIC_HP}</div>
        </div>
      </div>

      <button
        onClick={mint}
        disabled={isLoading}
        className="btn-primary"
      >
        {isLoading ? "Minting..." : "Mint Adventurer NFT"}
      </button>

      {/* Development mode bypass */}
      {DEV_MODE && (
        <div className="mt-4">
          <p className="text-xs text-yellow-500 mb-2">
            🚧 Dev Mode: Skip blockchain minting
          </p>
          <button
            onClick={() => setHasNFT(true, "dev-mock-nft")}
            className="btn-secondary text-sm"
          >
            Skip & Play (Demo Mode)
          </button>
        </div>
      )}
    </div>
  );
}
