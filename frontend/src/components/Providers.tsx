"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import type { SuiWalletFeatures, WalletWithRequiredFeatures } from "@mysten/wallet-standard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ONECHAIN_NETWORK_CONFIG } from "@/lib/constants";

// Configure the network
const { networkConfig } = createNetworkConfig({
  [ONECHAIN_NETWORK_CONFIG.network]: { url: ONECHAIN_NETWORK_CONFIG.rpcUrl },
});

const BLOCKED_WALLETS = new Set(["Slush", "Phantom"]);
const REQUIRED_SIGN_FEATURES: (keyof SuiWalletFeatures)[] = [
  "sui:signTransaction",
  "sui:signTransactionBlock",
];

const walletFilter = (wallet: WalletWithRequiredFeatures) => {
  const supportsRequiredSigning = REQUIRED_SIGN_FEATURES.some(
    (feature) => wallet.features[feature]
  );

  if (!supportsRequiredSigning) return false;
  return !BLOCKED_WALLETS.has(wallet.name);
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={ONECHAIN_NETWORK_CONFIG.network}>
        <WalletProvider
          autoConnect
          walletFilter={walletFilter}
          preferredWallets={["OneWallet"]}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
