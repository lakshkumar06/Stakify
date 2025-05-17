// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Challenge {
    address public creator;
    string public description;
    uint256 public initialPool;
    uint256 public remainingPool;
    uint256 public constant REWARD_PERCENT = 20; // 10% reward for completion

    struct Participant {
        bool completed;
        bool approved;
        string proofURL;
    }

    mapping(address => Participant) public participants;
    bool public ended;

    event ChallengeCompleted(address indexed participant, string proofURL);
    event ProofApproved(address indexed participant, uint256 reward);
    event ProofDisapproved(address indexed participant);
    event ChallengeEnded();

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }

    modifier notEnded() {
        require(!ended, "Challenge has ended");
        _;
    }

    constructor(address _creator, string memory _description) payable {
        creator = _creator;
        description = _description;
        initialPool = msg.value;
        remainingPool = msg.value;
    }

    function completeChallenge(string memory proofURL) external notEnded {
        require(!participants[msg.sender].completed, "Already completed");
        
        participants[msg.sender].completed = true;
        participants[msg.sender].proofURL = proofURL;
        
        emit ChallengeCompleted(msg.sender, proofURL);
    }

    function approveProof(address participant) external onlyCreator notEnded {
        require(participants[participant].completed, "Not completed");
        require(!participants[participant].approved, "Already approved");
        
        // Calculate reward (20% of initial pool)
        uint256 reward = (initialPool * REWARD_PERCENT) / 100;
        require(reward > 0, "Reward amount is zero");
        require(remainingPool >= reward, "Insufficient remaining pool");
        
        // Update state before transfer
        participants[participant].approved = true;
        remainingPool -= reward;
        
        // Transfer reward to participant
        (bool success, ) = payable(participant).call{value: reward}("");
        require(success, "Reward transfer failed");
        
        emit ProofApproved(participant, reward);
    }

    function disapproveProof(address participant) external onlyCreator notEnded {
        require(participants[participant].completed, "Not completed");
        require(!participants[participant].approved, "Already approved");
        
        // Delete the submission
        delete participants[participant];
        
        emit ProofDisapproved(participant);
    }

    function endChallenge() external onlyCreator notEnded {
        ended = true;
        
        // Return remaining funds to creator
        if (remainingPool > 0) {
            payable(creator).transfer(remainingPool);
            remainingPool = 0;
        }
        
        emit ChallengeEnded();
    }
} 