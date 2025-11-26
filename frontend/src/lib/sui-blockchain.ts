import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";
import {
  PACKAGE_ID,
  GAME_ADMIN_ID,
  MINT_REGISTRY_ID,
  PROGRESS_REGISTRY_ID,
  FEE_CONFIG_ID,
  FEE_DISTRIBUTOR_ID,
  REWARDS_POOL_ID,
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

export interface LeaderboardEntry {
  address: string;
  maxRoomsCleared: number;
  maxGemsCollected: number;
  successfulRuns: number;
  totalRuns: number;
  monstersDefeated: number;
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

    console.log("Executing mint transaction...");
    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    console.log("Mint transaction result:", result);
    console.log("Effects type:", typeof result.effects);
    console.log("Has digest:", !!result.digest);

    // ✅ FIX: Validate result exists before accessing effects
    if (!result) {
      throw new Error("Transaction failed - no result returned");
    }

    // If transaction has a digest, it likely succeeded
    // Some wallets return effects as base64 strings, so we'll use the digest as success indicator
    if (result.digest) {
      console.log("Transaction has digest, assuming success. Digest:", result.digest);

      // Wait for blockchain to process
      console.log("Waiting 3 seconds for blockchain to process...");
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Query for all NFTs owned by this address
      console.log("Querying for all Aventurer NFTs...");
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

      console.log("Found NFTs:", objects.data.length);

      if (objects.data.length > 0) {
        // Return the most recently created NFT (last one in the array)
        const latestNFT = objects.data[objects.data.length - 1];
        const nftId = latestNFT.data?.objectId;
        console.log("Returning latest NFT ID:", nftId);
        if (nftId) {
          return nftId;
        }
      }

      throw new Error("Transaction completed but could not find the minted NFT. Please refresh the page.");
    }

    throw new Error("Transaction failed - no digest returned");
  } catch (error: any) {
    console.error("Error minting aventurer:", error);

    // Check if it's the "already minted" error (error code 0 = EAlreadyMinted)
    if (error?.message?.includes("MoveAbort") && error?.message?.includes("}, 0)")) {
      throw new Error("You have already minted an Aventurer NFT with this wallet. Only one NFT per wallet is allowed.");
    }

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

    // ✅ FIX: Parse the BCS-encoded return values
    // The view function returns (u64, u64, u64, u64, u64): totalRuns, successfulRuns, monstersDefeated, maxRoomReached, maxGemsCollected
    if (result.results && result.results.length > 0) {
      const moveCallResult = result.results[0];
      if (moveCallResult.returnValues && moveCallResult.returnValues.length === 5) {
        // Each returnValue is a tuple of [bytes: number[], type: string]
        // Parse each u64 value from BCS bytes
        const totalRuns = Number(bcs.u64().parse(Uint8Array.from(moveCallResult.returnValues[0][0])));
        const successfulRuns = Number(bcs.u64().parse(Uint8Array.from(moveCallResult.returnValues[1][0])));
        const monstersDefeated = Number(bcs.u64().parse(Uint8Array.from(moveCallResult.returnValues[2][0])));
        const maxRoomReached = Number(bcs.u64().parse(Uint8Array.from(moveCallResult.returnValues[3][0])));
        const maxGemsCollected = Number(bcs.u64().parse(Uint8Array.from(moveCallResult.returnValues[4][0])));

        return {
          totalRuns,
          successfulRuns,
          monstersDefeated,
          maxRoomReached,
          maxGemsCollected,
        };
      }
    }

    // If no results or parsing failed, return zeros (new player)
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
 * Build global leaderboard from real on-chain data.
 * We read RunCompleted events and only keep successful runs,
 * then enrich entries with the latest player progress snapshot.
 */
export const getGlobalLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (!PACKAGE_ID || !PROGRESS_REGISTRY_ID) return [];

  try {
    const client = getSuiClient();
    const eventType = `${PACKAGE_ID}::dungeon_progress::RunCompleted`;

    // Track each wallet's best successful room count.
    const successMap = new Map<string, number>();

    let cursor: any = null;
    const pageLimit = 50;
    const maxPages = 20; // safety guard to avoid unbounded scans
    let pagesFetched = 0;

    while (pagesFetched < maxPages) {
      const events = await client.queryEvents({
        query: { MoveEventType: eventType },
        cursor: cursor ?? undefined,
        limit: pageLimit,
        order: "descending",
      });

      for (const ev of events.data) {
        const parsed = (ev as any).parsedJson;
        if (!parsed) continue;

        const success =
          parsed.success === true ||
          parsed.success === "true" ||
          parsed.success === 1 ||
          parsed.success === "1";

        if (!success) continue;

        const player = parsed.player as string | undefined;
        const roomsReached = Number(
          parsed.rooms_reached ?? parsed.rooms ?? parsed.roomsReached ?? 0
        );

        if (!player || !roomsReached) continue;

        const currentBest = successMap.get(player);
        if (!currentBest || roomsReached > currentBest) {
          successMap.set(player, roomsReached);
        }
      }

      cursor = events.nextCursor ?? null;
      pagesFetched += 1;
      if (!events.hasNextPage || !cursor) {
        break;
      }
    }

    const baseEntries: LeaderboardEntry[] = await Promise.all(
      Array.from(successMap.entries()).map(async ([address, maxRoomsCleared]) => {
        const progress = await getPlayerProgress(address);

        return {
          address,
          maxRoomsCleared,
          maxGemsCollected: progress.maxGemsCollected,
          successfulRuns: progress.successfulRuns,
          totalRuns: progress.totalRuns,
          monstersDefeated: progress.monstersDefeated,
        };
      })
    );

    return baseEntries
      .filter((entry) => entry.maxRoomsCleared > 0)
      .sort((a, b) => {
        if (b.maxRoomsCleared !== a.maxRoomsCleared) {
          return b.maxRoomsCleared - a.maxRoomsCleared;
        }
        if (b.maxGemsCollected !== a.maxGemsCollected) {
          return b.maxGemsCollected - a.maxGemsCollected;
        }
        return b.successfulRuns - a.successfulRuns;
      })
      .slice(0, 10);
  } catch (error) {
    console.error("Error building global leaderboard:", error);
    return [];
  }
};

/**
 * Get total runs ever recorded (success or fail) by counting RunCompleted events.
 */
export const getTotalRuns = async (): Promise<number> => {
  if (!PACKAGE_ID) return 0;

  try {
    const client = getSuiClient();
    const eventType = `${PACKAGE_ID}::dungeon_progress::RunCompleted`;

    let cursor: any = null;
    const pageLimit = 50;
    const maxPages = 50; // safety cap
    let pagesFetched = 0;
    let total = 0;

    while (pagesFetched < maxPages) {
      const events = await client.queryEvents({
        query: { MoveEventType: eventType },
        cursor: cursor ?? undefined,
        limit: pageLimit,
        order: "descending",
      });

      total += events.data.length;
      cursor = events.nextCursor ?? null;
      pagesFetched += 1;

      if (!events.hasNextPage || !cursor) break;
    }

    return total;
  } catch (error) {
    console.error("Error counting total runs:", error);
    return 0;
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

    // ✅ FIX: Call start_run with ALL required arguments
    tx.moveCall({
      target: `${PACKAGE_ID}::active_run::start_run`,
      arguments: [
        tx.object(FEE_CONFIG_ID), // fee_config
        tx.object(FEE_DISTRIBUTOR_ID), // fee_distributor
        tx.object(REWARDS_POOL_ID), // rewards_pool
        coin, // payment
        tx.object("0x6"), // clock
        tx.pure.u64(initialHP), // initial_hp
        tx.pure.u64(initialATK), // initial_atk
      ],
    });

    const result = await signAndExecuteTransactionBlock({
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    // ✅ FIX: Validate result exists
    if (!result) {
      throw new Error("Transaction failed - no result returned");
    }

    // ✅ FIX: dapp-kit returns minimal response, we need to fetch full transaction details
    // With OneWallet, transaction may take time to propagate, so retry with delays
    const client = getSuiClient();
    let txDetails = null;
    let retries = 0;
    const maxRetries = 5;

    while (!txDetails && retries < maxRetries) {
      try {
        txDetails = await client.getTransactionBlock({
          digest: result.digest,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });
      } catch (error: any) {
        if (error.message?.includes("Could not find the referenced transaction") && retries < maxRetries - 1) {
          console.log(`Transaction not found yet, retrying in ${(retries + 1) * 500}ms... (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, (retries + 1) * 500));
          retries++;
        } else {
          throw error;
        }
      }
    }

    if (!txDetails) {
      throw new Error("Failed to fetch transaction details after multiple retries");
    }

    console.log("Full transaction details:", JSON.stringify(txDetails, null, 2));

    // Try objectChanges first
    if (txDetails.objectChanges) {
      const created = txDetails.objectChanges.filter(
        (change: any) => change.type === "created" && change.objectType?.includes("ActiveRun")
      );
      if (created && created.length > 0 && 'objectId' in created[0]) {
        return (created[0] as any).objectId;
      }
    }

    // Fallback: Try using effects.created
    if (txDetails.effects?.created) {
      const createdObjects = txDetails.effects.created;
      // The ActiveRun is owned by an address (not shared/immutable)
      const ownedObjects = createdObjects.filter((obj: any) => {
        const owner = obj.owner;
        return owner && typeof owner === 'object' && 'AddressOwner' in owner;
      });

      if (ownedObjects.length > 0) {
        return ownedObjects[ownedObjects.length - 1].reference.objectId;
      }
    }

    console.error("Failed to find ActiveRun in transaction");
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
