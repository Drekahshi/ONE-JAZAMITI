#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod staking {
    use ink::storage::Mapping;

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct StakeInfo {
        amount: Balance,
        start_time: Timestamp,
        tier: u8, // 1: Bronze, 2: Silver, 3: Gold, 4: Platinum
    }

    #[ink(storage)]
    pub struct Staking {
        stakes: Mapping<AccountId, StakeInfo>,
        total_staked: Balance,
    }

    #[ink(event)]
    pub struct Staked {
        #[ink(topic)]
        user: AccountId,
        amount: Balance,
        tier: u8,
    }

    impl Staking {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                stakes: Mapping::default(),
                total_staked: 0,
            }
        }

        #[ink(message)]
        pub fn stake(&mut self, tier: u8) {
            let caller = self.env().caller();
            let value = self.env().transferred_value();
            
            // Logic to validate tier vs value would go here
            
            let info = StakeInfo {
                amount: value,
                start_time: self.env().block_timestamp(),
                tier,
            };
            
            self.stakes.insert(caller, &info);
            self.total_staked += value;
            
            self.env().emit_event(Staked {
                user: caller,
                amount: value,
                tier,
            });
        }

        #[ink(message)]
        pub fn get_stake(&self, user: AccountId) -> Option<StakeInfo> {
            self.stakes.get(user)
        }
    }
}
