import { useEffect, useCallback } from "react";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useGameStore } from "@/store/gameStore";
import {
  hasAventurer,
  getSoulBalance,
  mintAventurer,
  getAventurerNFT,
  getPlayerProgress,
} from "@/lib/sui-blockchain";

export const useWallet = () => {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const {
    isConnected,
    address,
    hasNFT,
    tokenId,
    soulBalance,
    isLoading,
    error,
    setWalletConnection,
    disconnectWallet,
    setHasNFT,
    setSoulBalance,
    setLoading,
    setError,
    setMessage,
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
        } else {
          setHasNFT(false);
        }
      } else {
        setHasNFT(false);
      }

      // Get soul balance
      const balance = await getSoulBalance(walletAddress);
      setSoulBalance(balance);
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

      // Refresh balance after minting
      await refreshBalance();
    } catch (err: any) {
      console.error("Failed to mint aventurer:", err);
      setError(err.message || "Failed to mint aventurer");
    } finally {
      setLoading(false);
    }
  }, [account, signAndExecuteTransaction, setHasNFT, setLoading, setError, setMessage]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!account?.address) return;

    try {
      const balance = await getSoulBalance(account.address);
      setSoulBalance(balance);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [account, setSoulBalance]);

  // Refresh NFT status
  const refreshNFT = useCallback(async () => {
    if (!account?.address) return;

    try {
      const hasNFT = await hasAventurer(account.address);

      if (hasNFT) {
        const nftData = await getAventurerNFT(account.address);
        if (nftData) {
          setHasNFT(true, nftData.id);
        }
      } else {
        setHasNFT(false);
      }
    } catch (err) {
      console.error("Failed to refresh NFT status:", err);
    }
  }, [account, setHasNFT]);

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
    soulBalance,
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
