// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OJZToken is ERC20, Ownable {
    constructor() ERC20("One Jaza", "OJZ") Ownable(msg.sender) {
        // Mint initial supply to the deployer (e.g., 1 million tokens)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Allow owner to mint more tokens (e.g., for rewards)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
