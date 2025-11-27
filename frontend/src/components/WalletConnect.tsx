"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress } from "@/lib/onechain-blockchain";
import { useState } from "react";

export default function WalletConnect() {
  const { isConnected, address, disconnect } = useWallet();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const previewButtons = [
    { id: "quests", label: "Quests" },
    { id: "arena", label: "Arena" },
  ];

  const renderIcon = (id: string) => {
    if (id === "quests") {
      return (
        <svg
          className="w-7 h-7 text-amber-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="6" y="5" width="12" height="14" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 12h6M9 15h4" />
          <circle cx="8" cy="9" r="0.5" fill="currentColor" />
          <circle cx="8" cy="12" r="0.5" fill="currentColor" />
          <circle cx="8" cy="15" r="0.5" fill="currentColor" />
        </svg>
      );
    }

    return (
      <svg
        className="w-7 h-7 text-blue-300"
        fill="none"
        viewBox="0 0 24 24"
      >
        <g transform="translate(2 2)" shapeRendering="crispEdges">
          {/* Outline */}
          <rect x="6" y="0" width="8" height="1" fill="#0F172A" />
          <rect x="4" y="1" width="12" height="1" fill="#0F172A" />
          <rect x="2" y="2" width="16" height="1" fill="#0F172A" />
          <rect x="1" y="3" width="18" height="1" fill="#0F172A" />
          <rect x="0" y="4" width="20" height="1" fill="#0F172A" />
          <rect x="1" y="5" width="18" height="1" fill="#0F172A" />
          <rect x="2" y="6" width="16" height="1" fill="#0F172A" />
          <rect x="3" y="7" width="14" height="1" fill="#0F172A" />
          <rect x="4" y="8" width="12" height="1" fill="#0F172A" />
          <rect x="5" y="9" width="10" height="1" fill="#0F172A" />
          <rect x="6" y="10" width="8" height="1" fill="#0F172A" />
          <rect x="7" y="11" width="6" height="1" fill="#0F172A" />
          <rect x="8" y="12" width="4" height="1" fill="#0F172A" />
          <rect x="9" y="13" width="2" height="1" fill="#0F172A" />

          {/* Body */}
          <rect x="6" y="0" width="8" height="1" fill="#7DD3FC" />
          <rect x="4" y="1" width="12" height="1" fill="#38BDF8" />
          <rect x="2" y="2" width="16" height="1" fill="#38BDF8" />
          <rect x="1" y="3" width="18" height="1" fill="#22D3EE" />
          <rect x="0" y="4" width="20" height="1" fill="#0EA5E9" />
          <rect x="1" y="5" width="18" height="1" fill="#22D3EE" />
          <rect x="2" y="6" width="16" height="1" fill="#38BDF8" />
          <rect x="3" y="7" width="14" height="1" fill="#38BDF8" />
          <rect x="4" y="8" width="12" height="1" fill="#22D3EE" />
          <rect x="5" y="9" width="10" height="1" fill="#22D3EE" />
          <rect x="6" y="10" width="8" height="1" fill="#0EA5E9" />
          <rect x="7" y="11" width="6" height="1" fill="#0EA5E9" />
          <rect x="8" y="12" width="4" height="1" fill="#0EA5E9" />
          <rect x="9" y="13" width="2" height="1" fill="#0EA5E9" />

          {/* Facet highlights */}
          <rect x="10" y="2" width="4" height="1" fill="#BAE6FD" />
          <rect x="9" y="5" width="5" height="1" fill="#BAE6FD" />
          <rect x="8" y="6" width="4" height="3" fill="#BAE6FD" />
          <rect x="7" y="8" width="3" height="2" fill="#7DD3FC" />
        </g>
      </svg>
    );
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="stat-box">
          <div className="text-xs text-gray-400">Wallet</div>
          <div className="text-sm font-mono">{formatAddress(address)}</div>
        </div>

        <div className="flex items-center gap-2">
          {previewButtons.map((btn) => (
            <div
              key={btn.id}
              className="relative"
              onMouseEnter={() => setHoveredButton(btn.id)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <button className="btn-secondary px-3 py-1 text-sm">
                {renderIcon(btn.id)}
              </button>
              {hoveredButton === btn.id && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-amber-500 text-amber-200 text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
                  Coming soon
                </div>
              )}
            </div>
          ))}

          <button onClick={disconnect} className="btn-secondary">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <ConnectButton
        className="btn-primary"
        connectText="Connect Wallet"
      />

      {previewButtons.map((btn) => (
        <div
          key={btn.id}
          className="relative"
          onMouseEnter={() => setHoveredButton(btn.id)}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <button className="btn-secondary px-3 py-1 text-sm">
            {renderIcon(btn.id)}
          </button>
          {hoveredButton === btn.id && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-amber-500 text-amber-200 text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
              Coming soon
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
