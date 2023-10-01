// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

interface INFTContract {
    function burn(address account, uint256 tokenId) external;
    function setScore(uint256 tokenId, uint256 score) external;
    function getScore(uint256 tokenId) external view returns (uint256);
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

/**
 * @title Battle Contract
 * @notice This contract allows users to battle two NFTs against each other
 * @dev Berke (pzzaworks) - pzza.works
 */
contract BattleContract {
    INFTContract immutable private nftContract;

    event BattleCompleted(uint256 firstNftId, uint256 secondNftId, uint256 winnerNftId, address indexed caller);

    /**
     * @notice Constructs a new instance of the contract
     * @param nftContractAddress The address of the NFT contract
     */
    constructor(address nftContractAddress) {
        nftContract = INFTContract(nftContractAddress);
    }  
    
    /**
     * @notice Allows two NFTs to battle against each other
     * @dev !!! DO NOT USE IN PRODUCTION, random numbers should not be generated inside smart contracts 
     *      like this. In production this function should only emit a battle started event and then with 
     *      an api call battle result should be revealed !!!
     * @param firstNftId The ID of the first NFT
     * @param secondNftId The ID of the second NFT
     * @return The ID of the winning NFT
     */
    function battle(uint256 firstNftId, uint256 secondNftId) public returns (uint256) {
        require(nftContract.balanceOf(msg.sender, firstNftId) > 0 && nftContract.balanceOf(msg.sender, secondNftId) > 0, "Both NFTs must be owned by the caller");

        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, firstNftId, secondNftId)));
        uint256 winnerNftId = 0;
        uint256 loserNftId = 0;

        if (randomNumber % 2 == 0) {
            winnerNftId = firstNftId;
            loserNftId = secondNftId;
        } else {
            winnerNftId = secondNftId;
            loserNftId = firstNftId;
        }

        uint256 winnerPreviousScore = nftContract.getScore(winnerNftId);
        winnerPreviousScore = winnerPreviousScore + 1;

        emit BattleCompleted(firstNftId, secondNftId, winnerNftId, msg.sender);

        nftContract.setScore(winnerNftId, winnerPreviousScore);
        nftContract.burn(msg.sender, loserNftId);

        return winnerNftId;
    }
}