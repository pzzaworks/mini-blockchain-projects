// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Airdrop {
    mapping(address => bool) public hasClaimed;
    uint256 public counter;
    string public status;

    event Claimed(address claimer);
    event CounterIncremented();
    event CounterDecremented();
    event StatusSet(string status);
    event Reset(address claimer);

    function claim() public {
        require(!hasClaimed[msg.sender], "Already claimed.");
        hasClaimed[msg.sender] = true;
        incrementCounter();
        setStatus("claim");

        emit Claimed(msg.sender);
    }

    function incrementCounter() internal {
        counter += 1;
        setStatus("incrementCounter");

        emit CounterIncremented();
    }

    function reset() public {
        require(hasClaimed[msg.sender], "Nothing to reset.");
        hasClaimed[msg.sender] = false;
        decrementCounter();
        setStatus("reset");

        emit Reset(msg.sender);
    }

    function decrementCounter() internal {
        counter -= 1;
        setStatus("decrementCounter");

        emit CounterDecremented();
    }

    function setStatus(string memory action) internal {
        status = action;

        emit StatusSet(action);
    }
}
