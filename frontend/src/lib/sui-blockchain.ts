import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
  PACKAGE_ID,
  GAME_ADMIN_ID,
  MINT_REGISTRY_ID,
  PROGRESS_REGISTRY_ID,
  ENTRY_FEE_MIST,
} from "./constants";

// Type definitions for Sui
export interface WalletConnection {
  address: string;
  network: string;
}

export interface AventurerNFT {
  id: string;
  name: string;
  atk: number;
  def: number;
  hp: number;
  owner: string;
}

export interface PlayerProgress {
  totalRuns: number;
  successfulRuns: number;
  monstersDefeated: number;
  maxRoomReached: number;
  maxGemsCollected: number;
}

/**
 * Get Sui client for the configured network
 */
export const getSuiClient = (): SuiClient => {
  // For now use testnet, will be configured for OneChain later
  return new SuiClient({ url: getFullnodeUrl("testnet") });
};

/**
 * Mint a basic Aventurer NFT
 * Requires MintRegistry object ID to enforce 1 NFT per address
 */
export const mintAventurer = async (
  signAndExecuteTransactionBlock: any,
  address: string
): Promise<string> => {
  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::aventurer_nft::mint_basic_aventurer`,
      arguments: [tx.object(MINT_REGISTRY_ID)],
    });

    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    // ✅ FIX: Validate result exists before accessing effects
    if (!result) {
      throw new Error("Transaction failed - no result returned");
    }

    if (!result.effects) {
      throw new Error("Transaction succeeded but effects not available");
    }

    // Get the NFT object ID from created objects
    const createdObjects = result.effects.created;
    if (createdObjects && createdObjects.length > 0) {
      return createdObjects[0].reference.objectId;
    }

    throw new Error("Failed to get NFT object ID from transaction");
  } catch (error: any) {
    console.error("Error minting aventurer:", error);
    throw new Error(error.message || "Failed to mint aventurer");
  }
};

/**
 * Check if player has an Aventurer NFT
 */
export const hasAventurer = async (address: string): Promise<boolean> => {
  try {
    // If package ID is not set, return false (contracts not deployed yet)
    if (!PACKAGE_ID) {
      return false;
    }

    const client = getSuiClient();

    const objects = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::aventurer_nft::AventurerNFT`,
      },
    });

    return objects.data.length > 0;
  } catch (error) {
    console.error("Error checking aventurer:", error);
    return false;
  }
};

/**
 * Get Aventurer NFT data
 */
export const getAventurerNFT = async (
  address: string
): Promise<AventurerNFT | null> => {
  try {
    // If package ID is not set, return null (contracts not deployed yet)
    if (!PACKAGE_ID) {
      return null;
    }

    const client = getSuiClient();

    const objects = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::aventurer_nft::AventurerNFT`,
      },
      options: {
        showContent: true,
      },
    });

    if (objects.data.length === 0) return null;

    const nftData = objects.data[0];
    const content = nftData.data?.content;

    if (content && content.dataType === "moveObject") {
      const fields = content.fields as any;
      return {
        id: nftData.data!.objectId,
        name: fields.name || "Basic Aventurer",
        atk: Number(fields.atk) || 1,
        def: Number(fields.def) || 0,
        hp: Number(fields.hp) || 3,
        owner: fields.owner || address,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting aventurer NFT:", error);
    return null;
  }
};


/**
 * Record a completed run with rooms reached
 */
export const recordRun = async (
  signAndExecuteTransactionBlock: any,
  success: boolean,
  roomsReached: number
): Promise<void> => {
  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::dungeon_progress::record_run`,
      arguments: [
        tx.object(PROGRESS_REGISTRY_ID),
        tx.pure.bool(success),
        tx.pure.u64(roomsReached),
      ],
    });

    await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
      },
    });
  } catch (error: any) {
    console.error("Error recording run:", error);
    throw new Error(error.message || "Failed to record run");
  }
};


/**
 * Get player progress
 */
export const getPlayerProgress = async (
  address: string
): Promise<PlayerProgress> => {
  try {
    const client = getSuiClient();

    // Call the view function
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::dungeon_progress::get_progress`,
      arguments: [tx.object(PROGRESS_REGISTRY_ID), tx.pure.address(address)],
    });

    const result = await client.devInspectTransactionBlock({
      sender: address,
      transactionBlock: tx,
    });

    // Parse the results
    // The view function returns (u64, u64, u64, u64, u64): totalRuns, successfulRuns, monstersDefeated, maxRoomReached, maxGemsCollected
    // This is a simplified version, actual parsing may vary based on dev mode
    return {
      totalRuns: 0,
      successfulRuns: 0,
      monstersDefeated: 0,
      maxRoomReached: 0,
      maxGemsCollected: 0,
    };
  } catch (error) {
    console.error("Error getting player progress:", error);
    return {
      totalRuns: 0,
      successfulRuns: 0,
      monstersDefeated: 0,
      maxRoomReached: 0,
      maxGemsCollected: 0,
    };
  }
};

/**
 * Start a new dungeon run by paying entry fee
 * Returns the ActiveRun object ID
 */
export const startDungeonRun = async (
  signAndExecuteTransactionBlock: any,
  initialHP: number,
  initialATK: number
): Promise<string> => {
  try {
    const tx = new Transaction();

    // Split SUI coins to get exact entry fee amount
    const [coin] = tx.splitCoins(tx.gas, [ENTRY_FEE_MIST]);

    // Call start_run with entry fee payment
    tx.moveCall({
      target: `${PACKAGE_ID}::active_run::start_run`,
      arguments: [
        coin,
        tx.pure.u64(initialHP),
        tx.pure.u64(initialATK),
      ],
    });

    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    // ✅ FIX: Validate result exists before accessing objectChanges
    if (!result) {
      throw new Error("Transaction failed - no result returned");
    }

    if (!result.objectChanges) {
      throw new Error("Transaction succeeded but objectChanges not available");
    }

    // Find the ActiveRun object ID from object changes
    const created = result.objectChanges.filter(
      (change: any) => change.type === "created" && change.objectType.includes("ActiveRun")
    );

    if (created && created.length > 0) {
      return created[0].objectId;
    }

    throw new Error("Failed to get ActiveRun object ID from transaction");
  } catch (error: any) {
    console.error("Error starting dungeon run:", error);
    throw new Error(error.message || "Failed to start run");
  }
};

/**
 * Advance to next room (called when player chooses "Continue")
 * Note: gold and monsters are tracked off-chain in the frontend
 */
export const advanceToNextRoom = async (
  signAndExecuteTransactionBlock: any,
  activeRunId: string,
  newHP: number
): Promise<void> => {
  try {
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::active_run::advance_room`,
      arguments: [
        tx.object(activeRunId),
        tx.pure.u64(newHP),
      ],
    });

    await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
      },
    });
  } catch (error: any) {
    console.error("Error advancing room:", error);
    throw new Error(error.message || "Failed to advance room");
  }
};

/**
 * Exit dungeon and end the active run
 * ✅ UPDATED: Now passes ActiveRun object to record_run (security fix)
 * The Move contract will consume the ActiveRun object internally
 */
export const exitDungeonRun = async (
  signAndExecuteTransactionBlock: any,
  activeRunId: string,
  survived: boolean,
  monstersDefeated: number,
  roomsReached: number,
  gemsCollected: number
): Promise<void> => {
  try {
    const tx = new Transaction();

    // ✅ FIX: Pass ActiveRun object directly to record_run
    // The Move contract (dungeon_progress::record_run) will:
    // 1. Validate the run belongs to the player
    // 2. Call active_run::end_run internally to consume the object
    // 3. Record the stats
    tx.moveCall({
      target: `${PACKAGE_ID}::dungeon_progress::record_run`,
      arguments: [
        tx.object(PROGRESS_REGISTRY_ID),
        tx.object("0x6"), // Clock object
        tx.object(activeRunId), // ✅ Pass ActiveRun object (will be consumed by contract)
        tx.pure.bool(survived),
        tx.pure.u64(gemsCollected),
      ],
    });

    await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
      },
    });
  } catch (error: any) {
    console.error("Error exiting dungeon run:", error);
    throw new Error(error.message || "Failed to exit run");
  }
};

/**
 * Format address for display
 */
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
