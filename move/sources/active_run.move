module dungeon_flip::active_run {
    use sui::coin::{Self, Coin};
    use sui::clock::Clock;
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use dungeon_flip::fee_distributor::{Self, FeeDistributor};
    use dungeon_flip::rewards_pool::RewardsPool;

    // ⚠️ CRITICAL: Replace with actual USDC coin type before deployment!
    // This placeholder struct is NOT the real USDC on Sui.
    //
    // To use real USDC:
    // 1. Find USDC package address on Sui (testnet/mainnet)
    // 2. Replace with: use 0xUSCD_PACKAGE::usdc::USDC;
    // 3. Remove the struct definition below
    //
    // WARNING: Deploying with this placeholder allows anyone to create fake USDC!
    struct USDC has drop {}

    // Errors
    const EInsufficientPayment: u64 = 0;
    const EInvalidRun: u64 = 1;
    const EInvalidStats: u64 = 2;

    // Entry fee: 0.05 USDC (50_000 with 6 decimals)
    const ENTRY_FEE: u64 = 50_000;

    /// Admin capability for managing entry fees
    struct AdminCap has key, store {
        id: UID,
    }

    /// Config for entry fee (adjustable by admin)
    struct FeeConfig has key {
        id: UID,
        entry_fee: u64,
    }

    /// Represents an active dungeon run
    /// Owned by the player during their adventure
    struct ActiveRun has key, store {
        id: UID,
        player: address,
        current_room: u64,
        hp: u64,
        atk: u64,
        started_at: u64,
    }

    /// Event emitted when a run starts
    struct RunStarted has copy, drop {
        run_id: ID,
        player: address,
        room: u64,
        timestamp: u64,
    }

    /// Event emitted when a player advances to next room
    struct RoomAdvanced has copy, drop {
        run_id: ID,
        player: address,
        new_room: u64,
        hp: u64,
    }

    /// Event emitted when a run ends
    struct RunEnded has copy, drop {
        run_id: ID,
        player: address,
        final_room: u64,
        survived: bool,
    }

    /// Initialize fee config (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let fee_config = FeeConfig {
            id: object::new(ctx),
            entry_fee: ENTRY_FEE,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(fee_config);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Start a new dungeon run by paying entry fee in USDC
    public entry fun start_run(
        fee_config: &FeeConfig,
        fee_distributor: &mut FeeDistributor,
        rewards_pool: &mut RewardsPool,
        payment: Coin<USDC>,
        clock: &Clock,
        initial_hp: u64,
        initial_atk: u64,
        ctx: &mut TxContext
    ) {
        // Verify entry fee payment
        let paid_amount = coin::value(&payment);
        assert!(paid_amount >= fee_config.entry_fee, EInsufficientPayment);

        // Validate initial stats
        assert!(initial_hp > 0 && initial_atk > 0, EInvalidStats);

        // Distribute fee automatically (70% pool, 20% dev, 10% marketing)
        fee_distributor::distribute_entry_fee(
            fee_distributor,
            rewards_pool,
            payment,
            clock,
            ctx
        );

        let sender = tx_context::sender(ctx);
        let run_id = object::new(ctx);
        let run_id_copy = object::uid_to_inner(&run_id);

        let run = ActiveRun {
            id: run_id,
            player: sender,
            current_room: 1, // Always start at room 1
            hp: initial_hp,
            atk: initial_atk,
            started_at: tx_context::epoch(ctx),
        };

        event::emit(RunStarted {
            run_id: run_id_copy,
            player: sender,
            room: 1,
            timestamp: tx_context::epoch(ctx),
        });

        // Transfer ActiveRun to player
        transfer::transfer(run, sender);
    }

    /// Advance to the next room (called when player chooses "Continue")
    /// Note: gold and monsters_defeated are tracked off-chain in the frontend
    public entry fun advance_room(
        run: &mut ActiveRun,
        new_hp: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(run.player == sender, EInvalidRun);

        // Update run state
        run.current_room = run.current_room + 1;
        run.hp = new_hp;

        event::emit(RoomAdvanced {
            run_id: object::uid_to_inner(&run.id),
            player: sender,
            new_room: run.current_room,
            hp: run.hp,
        });
    }

    /// End the run (called when player exits or dies)
    /// Note: gold and monsters_defeated are tracked off-chain and passed separately
    public fun end_run(
        run: ActiveRun,
        survived: bool,
        ctx: &mut TxContext
    ): (address, u64) {
        let sender = tx_context::sender(ctx);
        assert!(run.player == sender, EInvalidRun);

        let ActiveRun {
            id,
            player,
            current_room,
            hp: _,
            atk: _,
            started_at: _,
        } = run;

        event::emit(RunEnded {
            run_id: object::uid_to_inner(&id),
            player,
            final_room: current_room,
            survived,
        });

        object::delete(id);

        // Return player address and final room
        (player, current_room)
    }

    // === View Functions ===

    public fun get_player(run: &ActiveRun): address {
        run.player
    }

    public fun get_current_room(run: &ActiveRun): u64 {
        run.current_room
    }

    public fun get_hp(run: &ActiveRun): u64 {
        run.hp
    }

    public fun get_entry_fee(fee_config: &FeeConfig): u64 {
        fee_config.entry_fee
    }

    /// Update entry fee (admin only)
    public entry fun update_entry_fee(
        _: &AdminCap,
        fee_config: &mut FeeConfig,
        new_fee: u64
    ) {
        fee_config.entry_fee = new_fee;
    }
}
