// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Challenge.sol";

contract ChallengeFactory {
    address[] public challenges;
    mapping(address => address[]) public creatorChallenges;

    event ChallengeCreated(address indexed creator, address indexed challengeAddress, string description, uint256 initialPool);

    function createChallenge(string memory description) external payable returns (address) {
        require(msg.value > 0, "Initial pool must be greater than 0");
        
        // Deploy new Challenge contract
        Challenge newChallenge = new Challenge{value: msg.value}(msg.sender, description);
        address challengeAddress = address(newChallenge);
        
        // Store challenge address
        challenges.push(challengeAddress);
        creatorChallenges[msg.sender].push(challengeAddress);
        
        emit ChallengeCreated(msg.sender, challengeAddress, description, msg.value);
        
        return challengeAddress;
    }

    function getAllChallenges() external view returns (address[] memory) {
        return challenges;
    }

    function getChallengesByCreator(address creator) external view returns (address[] memory) {
        return creatorChallenges[creator];
    }
} 