module dungeon_flip::aventurer_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use sui::random::{Self, Random};

    /// Shared registry to track which addresses have minted
    public struct MintRegistry has key {
        id: UID,
        minted_addresses: Table<address, bool>,
    }

    /// The Aventurer NFT with fixed stats
    public struct AventurerNFT has key, store {
        id: UID,
        name: String,
        atk: u64,
        def: u64,
        hp: u64,
        owner: address,
    }

    /// Event emitted when an Aventurer is minted
    public struct AventurerMinted has copy, drop {
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

    /// Mint a basic Aventurer NFT with random stats
    /// Stats: HP:4-6, ATK:1-2, DEF:1-2
    /// TEMPORARY: Allows multiple NFTs per address for testing
    public entry fun mint_basic_aventurer(
        registry: &mut MintRegistry,
        r: &Random,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // TEMPORARY: Commented out for testing - allows multiple mints per wallet
        // Check if address has already minted
        // assert!(!table::contains(&registry.minted_addresses, sender), EAlreadyMinted);

        // Mark address as having minted (only if not already marked)
        if (!table::contains(&registry.minted_addresses, sender)) {
            table::add(&mut registry.minted_addresses, sender, true);
        };

        // Generate random stats
        let mut generator = random::new_generator(r, ctx);
        let hp = random::generate_u8_in_range(&mut generator, 4, 6); // 4-6
        let atk = random::generate_u8_in_range(&mut generator, 1, 2); // 1-2
        let def = random::generate_u8_in_range(&mut generator, 1, 2); // 1-2

        let aventurer = AventurerNFT {
            id: object::new(ctx),
            name: string::utf8(b"Basic Aventurer"),
            atk: (atk as u64),
            def: (def as u64),
            hp: (hp as u64),
            owner: sender,
        };

        let aventurer_id = object::uid_to_address(&aventurer.id);

        // Emit event with actual random stats
        event::emit(AventurerMinted {
            aventurer_id,
            owner: sender,
            atk: (atk as u64),
            def: (def as u64),
            hp: (hp as u64),
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
