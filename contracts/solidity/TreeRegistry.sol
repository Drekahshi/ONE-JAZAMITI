// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TreeRegistry {
    struct Tree {
        uint256 id;
        address planter;
        string treeType;
        string location;
        string photoUrl;
        uint256 timestamp;
        bool verified;
    }

    uint256 private _nextId;
    mapping(uint256 => Tree) public trees;
    mapping(address => uint256[]) public userTrees;

    event TreePlanted(uint256 indexed id, address indexed planter, string treeType, string location);
    event TreeVerified(uint256 indexed id, address indexed verifier);

    function plantTree(string memory treeType, string memory location, string memory photoUrl) public {
        uint256 id = _nextId++;
        trees[id] = Tree({
            id: id,
            planter: msg.sender,
            treeType: treeType,
            location: location,
            photoUrl: photoUrl,
            timestamp: block.timestamp,
            verified: false // Requires verification logic (simplified for now)
        });

        userTrees[msg.sender].push(id);
        emit TreePlanted(id, msg.sender, treeType, location);
    }

    function verifyTree(uint256 id) public {
        // In a real system, this would have access control (e.g., only verifiers)
        require(id < _nextId, "Tree does not exist");
        require(!trees[id].verified, "Tree already verified");
        
        trees[id].verified = true;
        emit TreeVerified(id, msg.sender);
    }

    function getTree(uint256 id) public view returns (Tree memory) {
        return trees[id];
    }

    function getUserTreeCount(address user) public view returns (uint256) {
        return userTrees[user].length;
    }
}
