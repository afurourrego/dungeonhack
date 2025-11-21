module dungeon_flip::dungeon_progress {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::vec_map::{Self, VecMap};

    /// Week duration in milliseconds (7 days)
    const WEEK_DURATION_MS: u64 = 604_800_000;

    /// Shared object to track all players' progress
    struct ProgressRegistry has key {
        id: UID,
        player_progress: Table<address, PlayerProgress>,
        weekly_scores: Table<u64, WeeklyLeaderboard>, // week_number -> leaderboard
        current_week: u64,
        week_start_time: u64,
    }

    /// Individual player progress (all-time stats)
    struct PlayerProgress has store {
        total_runs: u64,
        successful_runs: u64,
        monsters_defeated: u64,
        max_room_reached: u64,  // Max rooms reached in a single run
        max_gems_collected: u64,  // Max gems collected in a single run (all-time)
    }

    /// Weekly leaderboard for a specific week
    struct WeeklyLeaderboard has store {
        week_number: u64,
        player_scores: VecMap<address, u64>, // player -> best score this week
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
            weekly_scores: table::new(ctx),
            current_week: 1,
            week_start_time: 0, // Will be set on first run
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
        clock: &Clock,
        success: bool,
        rooms_reached: u64,
        gems_collected: u64,
        ctx: &mut TxContext
    ) {
        let player = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Initialize week start time on first run
        if (registry.week_start_time == 0) {
            registry.week_start_time = current_time;
        };

        // Check if we need to advance to next week
        let time_elapsed = current_time - registry.week_start_time;
        if (time_elapsed >= WEEK_DURATION_MS) {
            registry.current_week = registry.current_week + 1;
            registry.week_start_time = current_time;
        };

        // Update all-time player progress
        if (!table::contains(&registry.player_progress, player)) {
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

        // Update all-time room record
        if (rooms_reached > progress.max_room_reached) {
            progress.max_room_reached = rooms_reached;
            event::emit(NewRoomRecord {
                player,
                rooms_reached,
            });
        };

        // Update all-time gems record
        if (gems_collected > progress.max_gems_collected) {
            progress.max_gems_collected = gems_collected;
            event::emit(NewGemsRecord {
                player,
                gems_collected,
            });
        };

        // Update weekly leaderboard
        let current_week = registry.current_week;

        if (!table::contains(&registry.weekly_scores, current_week)) {
            // Create new weekly leaderboard
            table::add(&mut registry.weekly_scores, current_week, WeeklyLeaderboard {
                week_number: current_week,
                player_scores: vec_map::empty(),
            });
        };

        let weekly_board = table::borrow_mut(&mut registry.weekly_scores, current_week);

        // Update player's best score for this week
        if (vec_map::contains(&weekly_board.player_scores, &player)) {
            let current_best = vec_map::get(&weekly_board.player_scores, &player);
            if (gems_collected > *current_best) {
                vec_map::remove(&mut weekly_board.player_scores, &player);
                vec_map::insert(&mut weekly_board.player_scores, player, gems_collected);
            };
        } else {
            vec_map::insert(&mut weekly_board.player_scores, player, gems_collected);
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

    /// Get current week number
    public fun get_current_week(registry: &ProgressRegistry): u64 {
        registry.current_week
    }

    /// Get player's best score for a specific week
    public fun get_weekly_score(
        registry: &ProgressRegistry,
        week: u64,
        player: address
    ): u64 {
        if (table::contains(&registry.weekly_scores, week)) {
            let weekly_board = table::borrow(&registry.weekly_scores, week);
            if (vec_map::contains(&weekly_board.player_scores, &player)) {
                *vec_map::get(&weekly_board.player_scores, &player)
            } else {
                0
            }
        } else {
            0
        }
    }

    /// Get time until next week (in milliseconds)
    public fun time_until_next_week(
        registry: &ProgressRegistry,
        clock: &Clock
    ): u64 {
        if (registry.week_start_time == 0) {
            return 0
        };

        let current_time = clock::timestamp_ms(clock);
        let time_elapsed = current_time - registry.week_start_time;

        if (time_elapsed >= WEEK_DURATION_MS) {
            0
        } else {
            WEEK_DURATION_MS - time_elapsed
        }
    }
}
