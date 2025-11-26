// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is ReentrancyGuard {
    IERC20 public stakingToken;

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public constant REWARD_RATE = 10; // 10% APY (simplified)

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        // Transfer tokens to this contract
        stakingToken.transferFrom(msg.sender, address(this), amount);

        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");

        // Calculate rewards before withdrawing (simplified)
        uint256 rewards = calculateRewards(msg.sender);
        if (rewards > 0) {
            // Mint or transfer rewards (here we assume contract has funds)
            // For simplicity in this demo, we just track it or assume contract is funded
            // In production, this would mint new tokens or use a rewards pool
        }

        stakes[msg.sender].amount -= amount;
        stakingToken.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory info = stakes[user];
        if (info.amount == 0) return 0;

        uint256 timeElapsed = block.timestamp - info.timestamp;
        // Simple reward calculation: amount * rate * time / year
        return (info.amount * REWARD_RATE * timeElapsed) / (365 days * 100);
    }
    
    function getStake(address user) external view returns (uint256) {
        return stakes[user].amount;
    }
}
