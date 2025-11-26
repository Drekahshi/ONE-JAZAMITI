#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod governance {
    use ink::storage::Mapping;
    use ink::prelude::string::String;

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Proposal {
        description: String,
        votes_for: u64,
        votes_against: u64,
        end_time: Timestamp,
        executed: bool,
    }

    #[ink(storage)]
    pub struct Governance {
        proposals: Mapping<u64, Proposal>,
        next_proposal_id: u64,
        votes: Mapping<(u64, AccountId), bool>, // true = for, false = against
    }

    #[ink(event)]
    pub struct ProposalCreated {
        id: u64,
        description: String,
    }

    impl Governance {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                proposals: Mapping::default(),
                next_proposal_id: 1,
                votes: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn create_proposal(&mut self, description: String, duration: u64) -> u64 {
            let id = self.next_proposal_id;
            self.next_proposal_id += 1;

            let proposal = Proposal {
                description: description.clone(),
                votes_for: 0,
                votes_against: 0,
                end_time: self.env().block_timestamp() + duration,
                executed: false,
            };

            self.proposals.insert(id, &proposal);
            self.env().emit_event(ProposalCreated { id, description });
            id
        }

        #[ink(message)]
        pub fn vote(&mut self, proposal_id: u64, approve: bool) {
            let caller = self.env().caller();
            // Simple 1 account = 1 vote logic for stub
            if self.votes.contains(&(proposal_id, caller)) {
                return; // Already voted
            }

            let mut proposal = self.proposals.get(proposal_id).expect("Proposal not found");
            if approve {
                proposal.votes_for += 1;
            } else {
                proposal.votes_against += 1;
            }

            self.votes.insert((proposal_id, caller), &approve);
            self.proposals.insert(proposal_id, &proposal);
        }
    }
}
