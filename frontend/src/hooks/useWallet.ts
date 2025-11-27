import { useEffect, useCallback } from "react";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useGameStore } from "@/store/gameStore";
import {
  hasAventurer,
  mintAventurer,
  getAventurerNFT,
  getPlayerProgress,
} from "@/lib/onechain-blockchain";

export const useWallet = () => {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: signAndExecuteTransactionAsync } = useSignAndExecuteTransaction();

  // ✅ FIX: Wrapper that returns a Promise with the transaction result
  const signAndExecuteTransaction = useCallback(
    async (params: any) => {
      // mutateAsync already returns a Promise with the result
      const result = await signAndExecuteTransactionAsync(params);
      return result;
    },
    [signAndExecuteTransactionAsync]
  );

  const {
    isConnected,
    address,
    hasNFT,
    tokenId,
    isLoading,
    error,
    setWalletConnection,
    disconnectWallet,
    setHasNFT,
    setLoading,
    setError,
    setMessage,
    setPlayerStats,
  } = useGameStore();

  // Sync account state with game store
  useEffect(() => {
    if (account?.address && account.address !== address) {
      setWalletConnection(account.address, null);
      checkNFTAndBalance(account.address);
    } else if (!account && isConnected) {
      disconnectWallet();
    }
  }, [account, address, isConnected]);

  // Check NFT and balance
  const checkNFTAndBalance = async (walletAddress: string) => {
    setLoading(true);
    try {
      // Check if user has NFT
      const hasNFT = await hasAventurer(walletAddress);

      if (hasNFT) {
        // Get NFT details
        const nftData = await getAventurerNFT(walletAddress);
        if (nftData) {
          setHasNFT(true, nftData.id);
          // Set player stats from NFT
          setPlayerStats({
            hp: nftData.hp,
            maxHP: nftData.hp, // NFT HP is the maximum HP
            atk: nftData.atk,
            def: nftData.def,
          });
        } else {
          setHasNFT(false);
        }
      } else {
        setHasNFT(false);
      }

    } catch (err: any) {
      console.error("Error checking NFT and balance:", err);
      setError(err.message || "Failed to check account status");
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet (handled by ConnectButton component)
  const connect = useCallback(() => {
    // Connection is handled by @mysten/dapp-kit ConnectButton
    // This function exists for backwards compatibility
    setMessage("Please use the Connect Wallet button");
    setTimeout(() => setMessage(null), 3000);
  }, [setMessage]);

  // Disconnect wallet
  const disconnectWalletHandler = useCallback(() => {
    disconnect();
    disconnectWallet();
    setMessage("Wallet disconnected");
    setTimeout(() => setMessage(null), 3000);
  }, [disconnect, disconnectWallet, setMessage]);

  // Refresh NFT status
  const refreshNFT = useCallback(async () => {
    if (!account?.address) return;

    try {
      const hasNFT = await hasAventurer(account.address);

      if (hasNFT) {
        const nftData = await getAventurerNFT(account.address);
        if (nftData) {
          setHasNFT(true, nftData.id);
          // Update player stats from NFT
          setPlayerStats({
            hp: nftData.hp,
            maxHP: nftData.hp, // NFT HP is the maximum HP
            atk: nftData.atk,
            def: nftData.def,
          });
        }
      } else {
        setHasNFT(false);
      }
    } catch (err) {
      console.error("Failed to refresh NFT status:", err);
    }
  }, [account, setHasNFT, setPlayerStats]);

  // Mint NFT
  const mint = useCallback(async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newTokenId = await mintAventurer(
        signAndExecuteTransaction,
        account.address
      );
      setHasNFT(true, newTokenId);
      setMessage("Aventurer minted successfully!");
      setTimeout(() => setMessage(null), 3000);

      // Wait a bit for the blockchain to process the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refresh NFT data to get the actual stats
      await refreshNFT();
    } catch (err: any) {
      console.error("Failed to mint aventurer:", err);
      setError(err.message || "Failed to mint aventurer");
    } finally {
      setLoading(false);
    }
  }, [account, signAndExecuteTransaction, setHasNFT, setLoading, setError, setMessage, refreshNFT]);

  // Refresh balance - removed (no longer using Soul Fragments)
  const refreshBalance = useCallback(async () => {
    // Soul Fragment system removed
    return;
  }, []);

  // Refresh player progress
  const refreshProgress = useCallback(async () => {
    if (!account?.address) return;

    try {
      const progress = await getPlayerProgress(account.address);
      return progress;
    } catch (err) {
      console.error("Failed to refresh progress:", err);
      return null;
    }
  }, [account]);

  return {
    // State
    isConnected: !!account,
    address: account?.address || null,
    hasNFT,
    tokenId,
    isLoading,
    error,

    // Actions
    connect,
    disconnect: disconnectWalletHandler,
    mint,
    refreshBalance,
    refreshNFT,
    refreshProgress,
    signAndExecuteTransaction,
  };
};
