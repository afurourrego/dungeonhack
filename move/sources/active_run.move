module dungeon_flip::active_run {
    use one::coin::{Self, Coin};
    use one::clock::{Self, Clock};
    use one::event;
    use one::object;
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use dungeon_flip::fee_distributor::{Self, FeeDistributor};
    use dungeon_flip::rewards_pool::RewardsPool;
    use one::oct::OCT;

    // Errors
    const EInsufficientPayment: u64 = 0;
    const EInvalidRun: u64 = 1;
    const EInvalidStats: u64 = 2;
    const EInvalidHP: u64 = 3;

    // Entry fee: 0.01 OCT (10_000_000 base units - OCT has 9 decimals)
    const ENTRY_FEE: u64 = 10_000_000;

    /// Admin capability for managing entry fees
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Config for entry fee (adjustable by admin)
    public struct FeeConfig has key {
        id: UID,
        entry_fee: u64,
    }

    /// Represents an active dungeon run
    /// Owned by the player during their adventure
    public struct ActiveRun has key, store {
        id: UID,
        player: address,
        current_room: u64,
        hp: u64,
        max_hp: u64, // Maximum HP (from NFT stats, for potion cap)
        atk: u64,
        started_at: u64,
    }

    /// Event emitted when a run starts
    public struct RunStarted has copy, drop {
        run_id: ID,
        player: address,
        room: u64,
        timestamp: u64,
    }

    /// Event emitted when a player advances to next room
    public struct RoomAdvanced has copy, drop {
        run_id: ID,
        player: address,
        new_room: u64,
        hp: u64,
    }

    /// Event emitted when a run ends
    public struct RunEnded has copy, drop {
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

    /// Start a new dungeon run by paying entry fee in OCT
    public entry fun start_run(
        fee_config: &FeeConfig,
        fee_distributor: &mut FeeDistributor,
        rewards_pool: &mut RewardsPool,
        payment: Coin<OCT>,
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
            max_hp: initial_hp, // Store max HP for potion validation
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

        // ✅ SECURITY: HP must remain positive (if 0, should call end_run instead)
        assert!(new_hp > 0, EInvalidHP);

        // ✅ SECURITY: Allow HP to increase (potions) but cap at max_hp from NFT
        assert!(new_hp <= run.max_hp, EInvalidHP);

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
            max_hp: _,
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
