module dungeon_flip::fee_distributor {
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::object;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use dungeon_flip::rewards_pool::{Self, RewardsPool};
    use sui::sui::SUI;

    /// Fee distribution percentages (in basis points, 100 = 1%)
    const POOL_PCT: u64 = 7000;      // 70%
    const DEV_PCT: u64 = 2000;       // 20%
    const MARKETING_PCT: u64 = 1000; // 10%

    /// Fee distribution treasury - holds accumulated fees
    public struct FeeDistributor has key {
        id: UID,
        dev_balance: Balance<SUI>,
        marketing_balance: Balance<SUI>,
        total_fees_collected: u64,
    }

    /// Admin capability for withdrawing accumulated fees
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Event emitted when fees are distributed
    public struct FeesDistributed has copy, drop {
        total_fee: u64,
        pool_amount: u64,
        dev_amount: u64,
        marketing_amount: u64,
        timestamp: u64,
    }

    /// Event emitted when funds are withdrawn
    public struct FundsWithdrawn has copy, drop {
        fund_type: vector<u8>, // "dev" or "marketing"
        amount: u64,
        recipient: address,
    }

    /// Initialize fee distributor
    fun init(ctx: &mut TxContext) {
        let distributor = FeeDistributor {
            id: object::new(ctx),
            dev_balance: balance::zero(),
            marketing_balance: balance::zero(),
            total_fees_collected: 0,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(distributor);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    /// Distribute entry fee automatically (called when player pays to enter dungeon)
    /// 70% to rewards pool, 20% to dev, 10% to marketing
    public fun distribute_entry_fee(
        distributor: &mut FeeDistributor,
        rewards_pool: &mut RewardsPool,
        fee_payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let total_fee = coin::value(&fee_payment);
        let mut fee_balance = coin::into_balance(fee_payment);

        // Calculate distribution amounts
        let pool_amount = (total_fee * POOL_PCT) / 10000;
        let dev_amount = (total_fee * DEV_PCT) / 10000;
        let marketing_amount = (total_fee * MARKETING_PCT) / 10000;

        // 1. Send to rewards pool (70%)
        let pool_coin = coin::from_balance(
            balance::split(&mut fee_balance, pool_amount),
            ctx
        );
        rewards_pool::add_to_pool(rewards_pool, pool_coin, clock, ctx);

        // 2. Accumulate dev treasury (20%)
        balance::join(
            &mut distributor.dev_balance,
            balance::split(&mut fee_balance, dev_amount)
        );

        // 3. Accumulate marketing reserve (10%)
        balance::join(
            &mut distributor.marketing_balance,
            balance::split(&mut fee_balance, marketing_amount)
        );

        // Verify all fees were distributed (remaining should be ~0 due to rounding)
        let remaining = balance::value(&fee_balance);
        if (remaining > 0) {
            // Add any dust to dev balance
            balance::join(&mut distributor.dev_balance, fee_balance);
        } else {
            balance::destroy_zero(fee_balance);
        };

        // Update totals
        distributor.total_fees_collected = distributor.total_fees_collected + total_fee;

        // Emit event
        event::emit(FeesDistributed {
            total_fee,
            pool_amount,
            dev_amount,
            marketing_amount,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Withdraw dev funds (admin only)
    public entry fun withdraw_dev_funds(
        _: &AdminCap,
        distributor: &mut FeeDistributor,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let withdrawn = coin::from_balance(
            balance::split(&mut distributor.dev_balance, amount),
            ctx
        );
        transfer::public_transfer(withdrawn, recipient);

        event::emit(FundsWithdrawn {
            fund_type: b"dev",
            amount,
            recipient,
        });
    }

    /// Withdraw marketing funds (admin only)
    public entry fun withdraw_marketing_funds(
        _: &AdminCap,
        distributor: &mut FeeDistributor,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let withdrawn = coin::from_balance(
            balance::split(&mut distributor.marketing_balance, amount),
            ctx
        );
        transfer::public_transfer(withdrawn, recipient);

        event::emit(FundsWithdrawn {
            fund_type: b"marketing",
            amount,
            recipient,
        });
    }

    /// View functions
    public fun get_dev_balance(distributor: &FeeDistributor): u64 {
        balance::value(&distributor.dev_balance)
    }

    public fun get_marketing_balance(distributor: &FeeDistributor): u64 {
        balance::value(&distributor.marketing_balance)
    }

    public fun get_total_fees_collected(distributor: &FeeDistributor): u64 {
        distributor.total_fees_collected
    }
}
