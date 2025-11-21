"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/sui-blockchain";

export default function WalletConnect() {
  const { isConnected, address, soulBalance, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="stat-box">
          <div className="text-xs text-gray-400">Soul Fragments</div>
          <div className="text-lg font-bold text-dungeon-gold">
            {soulBalance}
          </div>
        </div>

        <div className="stat-box">
          <div className="text-xs text-gray-400">Wallet</div>
          <div className="text-sm font-mono">{formatAddress(address)}</div>
        </div>

        <button onClick={disconnect} className="btn-secondary">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <ConnectButton
      className="btn-primary"
      connectText="Connect Wallet"
    />
  );
}
