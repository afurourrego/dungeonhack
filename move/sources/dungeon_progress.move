module dungeon_flip::dungeon_progress {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::event;

    /// Shared object to track all players' progress
    struct ProgressRegistry has key {
        id: UID,
        player_progress: Table<address, PlayerProgress>,
    }

    /// Individual player progress
    struct PlayerProgress has store {
        total_runs: u64,
        successful_runs: u64,
        monsters_defeated: u64,
        max_room_reached: u64,  // Max rooms reached in a single run
        max_gems_collected: u64,  // Max gems collected in a single run
    }

    /// Event emitted when a run is completed
    struct RunCompleted has copy, drop {
        player: address,
        success: bool,
        total_runs: u64,
        rooms_reached: u64,
    }

    /// Event emitted when a new room record is set
    struct NewRoomRecord has copy, drop {
        player: address,
        rooms_reached: u64,
    }

    /// Event emitted when a new gems record is set
    struct NewGemsRecord has copy, drop {
        player: address,
        gems_collected: u64,
    }

    /// Event emitted when a monster is defeated
    struct MonsterDefeated has copy, drop {
        player: address,
        monsters_defeated: u64,
    }

    /// Initialize the progress registry (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let registry = ProgressRegistry {
            id: object::new(ctx),
            player_progress: table::new(ctx),
        };

        transfer::share_object(registry);
    }

    /// Record a monster defeated by a player
    public entry fun record_monster_defeated(
        registry: &mut ProgressRegistry,
        ctx: &mut TxContext
    ) {
        let player = tx_context::sender(ctx);

        if (!table::contains(&registry.player_progress, player)) {
            // Initialize player progress
            table::add(&mut registry.player_progress, player, PlayerProgress {
                total_runs: 0,
                successful_runs: 0,
                monsters_defeated: 0,
                max_room_reached: 0,
                max_gems_collected: 0,
            });
        };

        let progress = table::borrow_mut(&mut registry.player_progress, player);
        progress.monsters_defeated = progress.monsters_defeated + 1;

        event::emit(MonsterDefeated {
            player,
            monsters_defeated: progress.monsters_defeated,
        });
    }

    /// Record a completed run (success or failure)
    public entry fun record_run(
        registry: &mut ProgressRegistry,
        success: bool,
        rooms_reached: u64,
        gems_collected: u64,
        ctx: &mut TxContext
    ) {
        let player = tx_context::sender(ctx);

        if (!table::contains(&registry.player_progress, player)) {
            // Initialize player progress
            table::add(&mut registry.player_progress, player, PlayerProgress {
                total_runs: 0,
                successful_runs: 0,
                monsters_defeated: 0,
                max_room_reached: 0,
                max_gems_collected: 0,
            });
        };

        let progress = table::borrow_mut(&mut registry.player_progress, player);
        progress.total_runs = progress.total_runs + 1;

        if (success) {
            progress.successful_runs = progress.successful_runs + 1;
        };

        // Update room record if this is a new high
        if (rooms_reached > progress.max_room_reached) {
            progress.max_room_reached = rooms_reached;

            event::emit(NewRoomRecord {
                player,
                rooms_reached,
            });
        };

        // Update gems record if this is a new high
        if (gems_collected > progress.max_gems_collected) {
            progress.max_gems_collected = gems_collected;

            event::emit(NewGemsRecord {
                player,
                gems_collected,
            });
        };

        event::emit(RunCompleted {
            player,
            success,
            total_runs: progress.total_runs,
            rooms_reached,
        });
    }

    /// Get player progress (view function)
    public fun get_progress(
        registry: &ProgressRegistry,
        player: address
    ): (u64, u64, u64, u64, u64) {
        if (table::contains(&registry.player_progress, player)) {
            let progress = table::borrow(&registry.player_progress, player);
            (progress.total_runs, progress.successful_runs, progress.monsters_defeated, progress.max_room_reached, progress.max_gems_collected)
        } else {
            (0, 0, 0, 0, 0)
        }
    }
}
