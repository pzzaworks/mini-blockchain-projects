// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NFT Contract
 * @notice This contract allows users to mint ERC1155 tokens
 * @dev Berke (pzzaworks) - pzza.works
 */
contract NFTContract is ERC1155, AccessControl {
    using Strings for uint256;
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant FRIEND_CONTRACT = keccak256("FRIEND_CONTRACT");

    string public constant name = "NFT Name";
    string public constant symbol = "NFTSymbol";
    string public constant BASE_URI = "ipfs://.../";
    string public constant CONSTRUCTOR_URI = "ipfs://.../{id}.json";
    
    Counters.Counter private tokenSupplyCounter;

    uint256 public mintPrice = 0.01 ether;
    uint256 public constant MAX_SUPPLY = 100;

    mapping(uint256 => uint256) private scores;

    event NFTMinted(uint256 tokenId, address indexed minter);
    event NFTBatchMinted(uint256 firstTokenId, uint256 lastTokenId, address indexed minter);
    event NFTBurned(uint256 tokenId, address indexed burner);
    event MintPriceUpdated(uint256 tokenId, uint256 price);
    event ScoreChanged(uint256 tokenId, uint256 score);
    event Withdrawn(uint256 amount, address receiver);

    /**
     * @notice Constructor function
     */
    constructor() ERC1155(CONSTRUCTOR_URI) {
        _setRoleAdmin(ADMIN, ADMIN);
        _setRoleAdmin(FRIEND_CONTRACT, ADMIN);
        _setupRole(ADMIN, msg.sender);
    }

    /**
     * @notice Mints a single token to the caller
     */
    function mint() public payable {
        uint256 currentTokenId = tokenSupplyCounter.current();

        require(currentTokenId + 1 <= MAX_SUPPLY, "Maximum token supply exceeded");
        require(msg.value >= mintPrice, "Insufficient funds");

        emit NFTMinted(currentTokenId, msg.sender);

        tokenSupplyCounter.increment();

        _mint(msg.sender, currentTokenId, 1, '');
    }

    /**
     * @notice Mints a batch of tokens to the caller
     * @param amount The amount of tokens to mint
     */
    function mintBatch(uint256 amount) public payable {
        uint256 currentTokenId = tokenSupplyCounter.current();

        require(amount > 0, "Mint amount must be greater than zero");
        require(currentTokenId + amount <= MAX_SUPPLY, "Maximum token supply exceeded");
        require(msg.value >= mintPrice * amount, "Insufficient funds");

        emit NFTBatchMinted(currentTokenId, currentTokenId + (amount - 1), msg.sender);

        for (uint256 i = 0; i < amount; i++) {
            currentTokenId = tokenSupplyCounter.current();
            tokenSupplyCounter.increment();
            _mint(msg.sender, currentTokenId, 1, '');
        }
    }

    /**
     * @notice Burns tokens from an account
     * @param account The account to burn tokens from
     * @param tokenId The ID of the token to burn
     */
    function burn(address account, uint256 tokenId) external {
        require(hasRole(ADMIN, msg.sender) || hasRole(FRIEND_CONTRACT, msg.sender), "Only administrators and authorized friend contracts are allowed to burn tokens");
        require(account != address(0), "Burn from the zero address is not allowed");
        require(tokenSupplyCounter.current() > 0, "There is no tokens to burn");

        emit NFTBurned(tokenId, msg.sender);

        tokenSupplyCounter.decrement();

        _burn(account, tokenId, 1);
    }

    /**
     * @notice Withdraws the contract balance in ETH to the administrator's address
     */
    function withdraw() public payable {
        require(hasRole(ADMIN, msg.sender), "Only administrators are allowed to withdraw tokens");

        uint256 balance = address(this).balance;
        require(balance > 0, "Not enough balance");

        emit Withdrawn(balance, msg.sender);

        (bool successOwner, ) = payable(msg.sender).call{value: (address(this).balance)}("");
        require(successOwner, "Withdraw failed.");
    }

    /**
     * @notice Sets the mint price for a specific token
     * @param tokenId The ID of the token
     * @param price The mint price to set
     */
    function setMintPrice(uint256 tokenId, uint256 price) public {
        require(hasRole(ADMIN, msg.sender), "Only administrators are allowed to set mint price");

        mintPrice = price;
        
        emit MintPriceUpdated(tokenId, price);
    }

    /**
     * @notice Sets the score for a specific token
     * @param tokenId The ID of the token
     * @param score The score to set
     */
    function setScore(uint256 tokenId, uint256 score) external {
        require(hasRole(ADMIN, msg.sender) || hasRole(FRIEND_CONTRACT, msg.sender), "Only administrators and authorized authorized friend contracts are allowed to set score");

        scores[tokenId] = score;
        
        emit ScoreChanged(tokenId, score);
    }

    /**
     * @notice Returns the URI for a given token ID
     * @param tokenId The ID of the token
     * @return The URI string
     */
    function uri(uint256 tokenId) override public pure returns (string memory) {
        return string(abi.encodePacked(BASE_URI, tokenId.toString(), ".json"));
    }

    /**
     * @notice Checks if a contract supports a specific interface
     * @param interfaceId The interface ID to check
     * @return True if the contract supports the interface, false otherwise
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool){
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @notice Gets the score for a given token ID
     * @param tokenId The ID of the token
     * @return The score value
     */
    function getScore(uint256 tokenId) external view returns (uint256) {
        return scores[tokenId];
    }
    
    /**
     * @notice Returns the total supply of tokens
     * @return The total supply
     */
    function totalSupply() public view returns (uint) {
        return tokenSupplyCounter.current();
    }
}