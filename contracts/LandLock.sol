// @author Satya Yuga Bhumi Trust (DAO)
// @license MIT
// @copyright (c) 2025 Satya Yuga Bhumi Trust (DAO)
//
// This source code is part of the Satya Yuga Bhumi Trust (DAO) project.
// It is distributed under the MIT License.
//
// For more information, please visit:
// https://github.com/chyrenselin/Satya-Yuga-Bhumi-Trust-DAO

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandLock
 * @author Satya Yuga Bhumi Trust (DAO)
 * @notice This contract is the immutable, on-chain registry for land deeds committed to the Bhumi Trust.
 * @dev Its sole purpose is to create a permanent, globally verifiable, and tamper-proof record of land
 * parcels that are "Eternally Locked" for community stewardship. The contract is intentionally designed
 * to be simple, non-upgradable, and non-transferable, ensuring the integrity of the land records over millennia.
 * The owner of this contract is intended to be the SatyugTimeLock contract, ensuring that new land
 * can only be added after a successful community vote and time delay.
 */
contract LandLock {
    // --- State Variables ---

    /// @notice The address of the entity that owns and controls this contract.
    /// @dev This owner is set immutably at deployment. It is expected to be the address of the DAO's TimeLock contract,
    /// which ensures that all administrative actions (like locking new land) are subject to governance.
    address public immutable owner;

    /// @notice A mapping from a unique land ID to the IPFS hash of its corresponding digitized deed.
    /// @dev Kept private to enforce access through the getter function, which includes existence checks.
    mapping(uint256 => string) private _landDeeds;

    /// @notice A counter to generate a unique, sequential ID for each new land parcel locked in the contract.
    uint256 private _landIdCounter;

    // --- Events ---

    /**
     * @notice Emitted whenever a new land deed is successfully and permanently locked in the contract.
     * @param landId The unique identifier assigned to the new land parcel.
     * @param ipfsHash The IPFS Content Identifier (CID) for the archived land deed document.
     * @param timestamp The block timestamp indicating when the lock occurred, creating a permanent chronological record.
     */
    event LandLocked(uint256 indexed landId, string ipfsHash, uint256 timestamp);

    // --- Modifiers ---

    /**
     * @notice A modifier that restricts function execution to only the contract `owner`.
     * @dev Throws an error if called by any address other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "LandLock: Caller is not the owner");
        _;
    }

    // --- Constructor ---

    /**
     * @notice Initializes the LandLock contract and sets its immutable owner.
     * @param _initialOwner The address of the governing entity (e.g., SatyugTimeLock) that will have the sole
     * permission to lock new land deeds.
     */
    constructor(address _initialOwner) {
        require(_initialOwner != address(0), "LandLock: Initial owner cannot be the zero address");
        owner = _initialOwner;
    }

    // --- Core Functions ---

    /**
     * @notice Permanently adds a new land deed's IPFS hash to the on-chain ledger.
     * @dev This is the contract's primary function. It can only be called by the `owner` (the DAO's TimeLock).
     * It increments a counter to assign a new, unique ID to the land parcel and emits an event to record the action.
     * @param _ipfsHash The IPFS hash (CID string) of the deed document to be locked.
     * @return newLandId The unique ID assigned to the newly locked land parcel.
     */
    function lockLand(string calldata _ipfsHash) external onlyOwner returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "LandLock: IPFS hash cannot be empty");
        
        _landIdCounter++;
        uint256 newLandId = _landIdCounter;
        
        _landDeeds[newLandId] = _ipfsHash;
        
        emit LandLocked(newLandId, _ipfsHash, block.timestamp);
        
        return newLandId;
    }

    /**
     * @notice Retrieves the IPFS hash for a given land ID, providing a public way to verify the deed.
     * @param _landId The unique identifier of the land parcel to query.
     * @return The IPFS hash (CID string) of the corresponding land deed.
     */
    function getLandDeed(uint256 _landId) external view returns (string memory) {
        string memory ipfsHash = _landDeeds[_landId];
        require(bytes(ipfsHash).length > 0, "LandLock: Land ID does not exist");
        return ipfsHash;
    }
    
    /**
     * @notice Returns the total number of land parcels that have been locked in the Trust.
     * @return The current value of the land ID counter, representing the total count.
     */
    function getTotalLandCount() external view returns (uint256) {
        return _landIdCounter;
    }

    // --- Forbidden Functions ---

    /**
     * @notice **FORBIDDEN**: This function will always fail. It is included to explicitly signal that land records
     * are not transferable assets.
     * @dev By including and reverting in this function, we prevent the contract from being compliant with
     * ERC721 or other NFT standards, reinforcing the "Eternal Lock" principle at a technical level.
     */
    function transferFrom(address, address, uint256) public pure {
        revert("LandLock: Land deeds are non-transferable and eternally locked.");
    }

    /**
     * @notice **FORBIDDEN**: This function will always fail, reinforcing the non-transferable nature of the land records.
     * @dev See `transferFrom` for the design rationale.
     */
    function safeTransferFrom(address, address, uint256) public pure {
        revert("LandLock: Land deeds are non-transferable and eternally locked.");
    }
    
    /**
     * @notice **FORBIDDEN**: This function will always fail. Approvals for transfers are not possible.
     * @dev Prevents any attempt to approve a third party to move a land record, which is impossible anyway.
     */
    function approve(address, uint256) public pure {
        revert("LandLock: Land deeds are non-transferable and cannot be approved for transfer.");
    }
    
    /**
     * @notice **FORBIDDEN**: This function will always fail. The ownership of this contract itself is immutable.
     * @dev The contract `owner` is set once in the constructor and can never be changed, ensuring the governance
     * link is permanent.
     */
    function transferOwnership(address) public pure {
        revert("LandLock: Contract ownership is immutable and cannot be transferred.");
    }
}