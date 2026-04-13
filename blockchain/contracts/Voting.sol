// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title Minimal voting contract — extend with your election logic
contract Voting {
    address public admin;
    mapping(address => bool) public hasVoted;
    uint256 public voteCount;

    event Voted(address indexed voter, uint256 newTotal);

    constructor() {
        admin = msg.sender;
    }

    function vote() external {
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        voteCount += 1;
        emit Voted(msg.sender, voteCount);
    }

    function votes() external view returns (uint256) {
        return voteCount;
    }
}
