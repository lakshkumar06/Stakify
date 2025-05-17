// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Challenge {
    address public creator;
    string public description;
    uint256 public initialPool;
    uint256 public remainingPool;
    uint256 public constant REWARD_PERCENT = 2; // 2% reward for completion

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
        require(msg.value > 0, "Initial pool must be greater than 0");
        creator = _creator;
        description = _description;
        initialPool = msg.value;
        remainingPool = msg.value;
    }

    function completeChallenge(string memory proofURL) external notEnded {
        require(!participants[msg.sender].completed, "Already completed");
        require(bytes(proofURL).length > 0, "Proof URL cannot be empty");
        
        participants[msg.sender].completed = true;
        participants[msg.sender].proofURL = proofURL;
        
        emit ChallengeCompleted(msg.sender, proofURL);
    }

    function approveProof(address participant) external onlyCreator notEnded {
        // Check if participant exists
        require(participant != address(0), "Invalid participant address");
        
        // Check participant status
        Participant storage p = participants[participant];
        require(p.completed, "Participant has not completed the challenge");
        require(!p.approved, "Participant is already approved");
        
        // Calculate and verify reward
        uint256 reward = (initialPool * REWARD_PERCENT) / 100;
        require(reward > 0, "Reward amount is zero");
        require(remainingPool >= reward, string.concat(
            "Insufficient remaining pool. Required: ",
            _uint2str(reward),
            ", Available: ",
            _uint2str(remainingPool)
        ));
        
        // Update state before transfer
        p.approved = true;
        remainingPool -= reward;
        
        // Transfer reward to participant
        (bool success, ) = payable(participant).call{value: reward}("");
        require(success, "Reward transfer failed");
        
        emit ProofApproved(participant, reward);
    }

    function disapproveProof(address participant) external onlyCreator notEnded {
        require(participant != address(0), "Invalid participant address");
        require(participants[participant].completed, "Participant has not completed the challenge");
        require(!participants[participant].approved, "Participant is already approved");
        
        // Delete the submission
        delete participants[participant];
        
        emit ProofDisapproved(participant);
    }

    function endChallenge() external onlyCreator notEnded {
        ended = true;
        
        // Return remaining funds to creator
        if (remainingPool > 0) {
            (bool success, ) = payable(creator).call{value: remainingPool}("");
            require(success, "Failed to return remaining funds to creator");
            remainingPool = 0;
        }
        
        emit ChallengeEnded();
    }

    // Helper function to convert uint to string
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
} 