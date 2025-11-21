module dungeon_flip::soul_fragment {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::option;

    /// The Soul Fragment token type
    struct SOUL_FRAGMENT has drop {}

    /// Capability to control minting (only deployer has this)
    struct GameAdmin has key {
        id: UID,
        treasury_cap: TreasuryCap<SOUL_FRAGMENT>,
    }

    /// Initialize the Soul Fragment token
    fun init(witness: SOUL_FRAGMENT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            0, // 0 decimals for simplicity
            b"SOUL",
            b"Soul Fragment",
            b"Soul Fragments are rewards earned by defeating monsters in Dungeon Flip",
            option::none(),
            ctx
        );

        // Store treasury in an admin capability object (only deployer owns this)
        let admin = GameAdmin {
            id: object::new(ctx),
            treasury_cap: treasury,
        };
        transfer::transfer(admin, tx_context::sender(ctx));

        // Freeze metadata
        transfer::public_freeze_object(metadata);
    }

    /// Reward a player with Soul Fragments
    /// Only the game admin (contract deployer) can call this
    public entry fun reward_player(
        admin: &mut GameAdmin,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(&mut admin.treasury_cap, 1, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Batch reward for multiple monsters defeated
    /// Only the game admin (contract deployer) can call this
    public entry fun batch_reward(
        admin: &mut GameAdmin,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(&mut admin.treasury_cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }
}
