#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod nft {
    use ink::storage::Mapping;
    use ink::prelude::string::String;

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct TreeData {
        tree_type: String,
        gps: String,
        planting_date: Timestamp,
    }

    #[ink(storage)]
    pub struct TreeNft {
        owner_of: Mapping<u64, AccountId>,
        token_data: Mapping<u64, TreeData>,
        next_id: u64,
    }

    #[ink(event)]
    pub struct Minted {
        #[ink(topic)]
        owner: AccountId,
        id: u64,
        tree_type: String,
    }

    impl TreeNft {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner_of: Mapping::default(),
                token_data: Mapping::default(),
                next_id: 1,
            }
        }

        #[ink(message)]
        pub fn mint(&mut self, tree_type: String, gps: String) -> u64 {
            let caller = self.env().caller();
            let id = self.next_id;
            self.next_id += 1;

            self.owner_of.insert(id, &caller);
            self.token_data.insert(id, &TreeData {
                tree_type: tree_type.clone(),
                gps,
                planting_date: self.env().block_timestamp(),
            });

            self.env().emit_event(Minted {
                owner: caller,
                id,
                tree_type,
            });

            id
        }

        #[ink(message)]
        pub fn owner_of(&self, id: u64) -> Option<AccountId> {
            self.owner_of.get(id)
        }
    }
}
