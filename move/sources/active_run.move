module dungeon_flip::active_run {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Errors
    const EInsufficientPayment: u64 = 0;
    const EInvalidRun: u64 = 1;

    // Entry fee: 0.01 SUI (10_000_000 MIST)
    const ENTRY_FEE: u64 = 10_000_000;

    /// Treasury object to hold collected fees
    struct Treasury has key {
        id: UID,
        balance: u64,
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

    /// Initialize the treasury (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let treasury = Treasury {
            id: object::new(ctx),
            balance: 0,
        };

        transfer::share_object(treasury);
    }

    /// Start a new dungeon run by paying entry fee
    public entry fun start_run(
        treasury: &mut Treasury,
        payment: Coin<SUI>,
        initial_hp: u64,
        initial_atk: u64,
        ctx: &mut TxContext
    ) {
        // Verify entry fee payment
        let paid_amount = coin::value(&payment);
        assert!(paid_amount >= ENTRY_FEE, EInsufficientPayment);

        // Update treasury balance tracking
        treasury.balance = treasury.balance + paid_amount;

        // Transfer payment to treasury (the contract deployer will own this)
        // In production, this should go to a multisig or DAO treasury address
        let deployer = @0x0; // Replace with actual treasury/deployer address before deployment
        transfer::public_transfer(payment, deployer);

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

    public fun get_entry_fee(): u64 {
        ENTRY_FEE
    }

    public fun get_treasury_balance(treasury: &Treasury): u64 {
        treasury.balance
    }
}
