module dungeon_flip::rewards_pool {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::vector;

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

    /// Errors
    const EDistributionNotReady: u64 = 0;
    const EInvalidWinners: u64 = 1;
    const EInvalidAmounts: u64 = 2;
    const EAmountMismatch: u64 = 3;
    const EDuplicateWinner: u64 = 4;

    /// Week duration in milliseconds (7 days)
    const WEEK_DURATION_MS: u64 = 604_800_000;

    /// Distribution percentages for top 10 (in basis points, 100 = 1%)
    const TOP_1_PCT: u64 = 3000;  // 30%
    const TOP_2_PCT: u64 = 2000;  // 20%
    const TOP_3_PCT: u64 = 1500;  // 15%
    const TOP_4_PCT: u64 = 1000;  // 10%
    const TOP_5_PCT: u64 = 800;   // 8%
    const TOP_6_PCT: u64 = 600;   // 6%
    const TOP_7_PCT: u64 = 400;   // 4%
    const TOP_8_PCT: u64 = 300;   // 3%
    const TOP_9_PCT: u64 = 200;   // 2%
    const TOP_10_PCT: u64 = 200;  // 2%

    /// Weekly rewards pool
    struct RewardsPool has key {
        id: UID,
        pool_balance: Balance<USDC>,
        current_week: u64,
        last_distribution: u64,
        next_distribution_time: u64,
        total_distributed: u64,
    }

    /// Event emitted when tokens are added to pool
    struct TokensAddedToPool has copy, drop {
        week: u64,
        amount: u64,
        new_balance: u64,
        timestamp: u64,
    }

    /// Event emitted when weekly distribution completes
    struct WeeklyDistributionCompleted has copy, drop {
        week: u64,
        total_distributed: u64,
        winners: vector<address>,
        amounts: vector<u64>,
        timestamp: u64,
    }

    /// Initialize rewards pool
    fun init(ctx: &mut TxContext) {
        let pool = RewardsPool {
            id: object::new(ctx),
            pool_balance: balance::zero(),
            current_week: 1,
            last_distribution: 0,
            next_distribution_time: 0, // Will be set on first deposit
            total_distributed: 0,
        };

        transfer::share_object(pool);
    }

    /// Add tokens to the current week's pool (called by fee_distributor)
    public fun add_to_pool(
        pool: &mut RewardsPool,
        tokens: Coin<USDC>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&tokens);
        balance::join(&mut pool.pool_balance, coin::into_balance(tokens));

        // Initialize distribution time on first deposit
        if (pool.next_distribution_time == 0) {
            pool.next_distribution_time = clock::timestamp_ms(clock) + WEEK_DURATION_MS;
        }

        event::emit(TokensAddedToPool {
            week: pool.current_week,
            amount,
            new_balance: balance::value(&pool.pool_balance),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// ⚠️ SECURITY WARNING: This function needs admin-only access control!
    /// Currently callable by ANYONE - allows attackers to submit fake winner addresses.
    ///
    /// TODO for production:
    /// 1. Add AdminCap parameter to restrict access
    /// 2. OR integrate oracle/leaderboard verification
    /// 3. OR use commit-reveal scheme
    ///
    /// Temporary solution for hackathon: Trust off-chain script to call with correct winners
    public entry fun try_distribute_weekly_rewards(
        pool: &mut RewardsPool,
        clock: &Clock,
        winners: vector<address>,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);

        // Verify 1 week has passed
        assert!(
            current_time >= pool.next_distribution_time,
            EDistributionNotReady
        );

        // Verify exactly 10 winners
        assert!(vector::length(&winners) == 10, EInvalidWinners);

        // Verify no duplicate addresses (basic anti-fraud check)
        let mut i = 0;
        while (i < 10) {
            let addr = *vector::borrow(&winners, i);
            let mut j = i + 1;
            while (j < 10) {
                assert!(addr != *vector::borrow(&winners, j), EDuplicateWinner);
                j = j + 1;
            };
            i = i + 1;
        };

        // Calculate distribution amounts based on pool balance
        let total_pool = balance::value(&pool.pool_balance);
        let mut amounts = vector::empty<u64>();

        vector::push_back(&mut amounts, (total_pool * TOP_1_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_2_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_3_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_4_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_5_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_6_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_7_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_8_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_9_PCT) / 10000);
        vector::push_back(&mut amounts, (total_pool * TOP_10_PCT) / 10000);

        // Distribute to winners
        let mut i = 0;
        let mut total_sent = 0;
        while (i < 10) {
            let winner = *vector::borrow(&winners, i);
            let amount = *vector::borrow(&amounts, i);

            let reward = coin::from_balance(
                balance::split(&mut pool.pool_balance, amount),
                ctx
            );
            transfer::public_transfer(reward, winner);

            total_sent = total_sent + amount;
            i = i + 1;
        };

        // Update pool state
        pool.total_distributed = pool.total_distributed + total_sent;
        pool.last_distribution = current_time;
        pool.next_distribution_time = current_time + WEEK_DURATION_MS;
        pool.current_week = pool.current_week + 1;

        // Emit event
        event::emit(WeeklyDistributionCompleted {
            week: pool.current_week - 1, // Previous week that just completed
            total_distributed: total_sent,
            winners,
            amounts,
            timestamp: current_time,
        });
    }

    /// View functions
    public fun get_pool_balance(pool: &RewardsPool): u64 {
        balance::value(&pool.pool_balance)
    }

    public fun get_current_week(pool: &RewardsPool): u64 {
        pool.current_week
    }

    public fun get_next_distribution_time(pool: &RewardsPool): u64 {
        pool.next_distribution_time
    }

    public fun get_total_distributed(pool: &RewardsPool): u64 {
        pool.total_distributed
    }

    public fun is_distribution_ready(pool: &RewardsPool, clock: &Clock): bool {
        let current_time = clock::timestamp_ms(clock);
        current_time >= pool.next_distribution_time && pool.next_distribution_time > 0
    }

    /// Calculate time remaining until next distribution
    public fun time_until_distribution(pool: &RewardsPool, clock: &Clock): u64 {
        let current_time = clock::timestamp_ms(clock);
        if (current_time >= pool.next_distribution_time) {
            0
        } else {
            pool.next_distribution_time - current_time
        }
    }
}
