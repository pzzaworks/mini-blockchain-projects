// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Stake {
    mapping(address => bool) public hasStaked;
    mapping(address => uint256) public stakeAmount;
    uint256 public totalStakes;
    string public status;

    event StakeCreated(address indexed staker, uint256 amount);
    event StakeReset(address indexed staker);
    event StakeRemoved(address indexed staker, uint256 amount, bool withRewards);
    event CounterIncremented(uint256 newTotalStakes);
    event CounterDecremented(uint256 newTotalStakes);
    event StatusUpdated(string newStatus);

    function stake(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(!hasStaked[msg.sender], "Already staked.");
        hasStaked[msg.sender] = true;
        stakeAmount[msg.sender] += amount;
        incrementTotalStakes();
        setStatus("stake");
        emit StakeCreated(msg.sender, amount);
    }

    function incrementTotalStakes() internal {
        totalStakes += 1;
        setStatus("incrementTotalStakes");
        emit CounterIncremented(totalStakes);
    }

    function resetStake() public {
        require(hasStaked[msg.sender], "No stake to reset.");
        hasStaked[msg.sender] = false;
        decrementTotalStakes();
        setStatus("resetStake");
        emit StakeReset(msg.sender);
    }

    function decrementTotalStakes() internal {
        totalStakes -= 1;
        setStatus("decrementTotalStakes");
        emit CounterDecremented(totalStakes);
    }

    function setStatus(string memory action) internal {
        status = action;
        emit StatusUpdated(status);
    }

    function unstake() public {
        require(hasStaked[msg.sender], "Nothing to unstake.");
        uint256 amount = stakeAmount[msg.sender];
        hasStaked[msg.sender] = false;
        stakeAmount[msg.sender] = 0;
        emit StakeRemoved(msg.sender, amount, true);
        setStatus("unstake");
    }

    function unstakeWithoutRewards() public {
        require(hasStaked[msg.sender], "Nothing to unstake.");
        uint256 amount = stakeAmount[msg.sender];
        hasStaked[msg.sender] = false;
        stakeAmount[msg.sender] = 0;
        emit StakeRemoved(msg.sender, amount, false);
        setStatus("unstakeWithoutRewards");
    }
}
