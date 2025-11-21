module dungeon_flip::aventurer_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};

    /// Shared registry to track which addresses have minted
    struct MintRegistry has key {
        id: UID,
        minted_addresses: Table<address, bool>,
    }

    /// The Aventurer NFT with fixed stats
    struct AventurerNFT has key, store {
        id: UID,
        name: String,
        atk: u64,
        def: u64,
        hp: u64,
        owner: address,
    }

    /// Event emitted when an Aventurer is minted
    struct AventurerMinted has copy, drop {
        aventurer_id: address,
        owner: address,
        atk: u64,
        def: u64,
        hp: u64,
    }

    /// Error codes
    const EAlreadyMinted: u64 = 0;

    /// Initialize the mint registry (called once on deployment)
    fun init(ctx: &mut TxContext) {
        let registry = MintRegistry {
            id: object::new(ctx),
            minted_addresses: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    /// Mint a basic Aventurer NFT
    /// Stats: ATK:1, DEF:1, HP:4
    /// Only allows 1 NFT per address
    public entry fun mint_basic_aventurer(
        registry: &mut MintRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Check if address has already minted
        assert!(!table::contains(&registry.minted_addresses, sender), EAlreadyMinted);

        // Mark address as having minted
        table::add(&mut registry.minted_addresses, sender, true);

        let aventurer = AventurerNFT {
            id: object::new(ctx),
            name: string::utf8(b"Basic Aventurer"),
            atk: 1,
            def: 1,
            hp: 4,
            owner: sender,
        };

        let aventurer_id = object::uid_to_address(&aventurer.id);

        // Emit event
        event::emit(AventurerMinted {
            aventurer_id,
            owner: sender,
            atk: 1,
            def: 1,
            hp: 4,
        });

        // Transfer to the minter
        transfer::transfer(aventurer, sender);
    }

    /// Get Aventurer stats
    public fun get_stats(aventurer: &AventurerNFT): (u64, u64, u64) {
        (aventurer.atk, aventurer.def, aventurer.hp)
    }

    /// Get Aventurer name
    public fun get_name(aventurer: &AventurerNFT): String {
        aventurer.name
    }

    /// Get Aventurer owner
    public fun get_owner(aventurer: &AventurerNFT): address {
        aventurer.owner
    }

    /// Check if an address has already minted (view function)
    public fun has_minted(registry: &MintRegistry, addr: address): bool {
        table::contains(&registry.minted_addresses, addr)
    }
}
