"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ONECHAIN_NETWORK_CONFIG } from "@/lib/constants";

// Configure the network
const { networkConfig } = createNetworkConfig({
  [ONECHAIN_NETWORK_CONFIG.network]: { url: ONECHAIN_NETWORK_CONFIG.rpcUrl },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={ONECHAIN_NETWORK_CONFIG.network}>
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
