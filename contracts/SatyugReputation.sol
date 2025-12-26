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

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title SatyugReputation
 * @author Satya Yuga Bhumi Trust (DAO)
 * @notice Represents "Proof of Seva" reputation within the Satyug DAO as a non-transferable ERC20-like token.
 * @dev This contract uses OpenZeppelin's ERC20 and Ownable modules. It makes the token non-transferable
 * by overriding transfer-related functions. It is designed to serve as the voting power source for
 * the SatyugGovernor contract. The owner, which can mint and burn tokens, is intended to be the SatyugTimeLock contract.
 */
contract SatyugReputation is Context, ERC20, Ownable {
    // --- Constructor ---

    /**
     * @notice Initializes the contract, setting its name, symbol, and the initial administrative owner.
     * @dev The ERC20 constructor is called with the token name "Satyug Reputation" and symbol "SEVA".
     * The Ownable constructor sets the deployer as the initial owner. This ownership should be transferred
     * to the SatyugTimeLock contract after deployment.
     * @param initialOwner The address that will have initial administrative control to mint/burn reputation.
     */
    constructor(address initialOwner)
        ERC20("Satyug Reputation", "SEVA")
        Ownable(initialOwner)
    {
        // No initial supply is minted. Reputation is awarded based on service after deployment.
    }

    // --- Reputation Management ---

    /**
     * @notice Mints new SEVA reputation tokens, granting them to a specific address.
     * @dev This is a privileged function restricted to the contract owner. The owner is expected to be the
     * SatyugTimeLock contract, which acts on behalf of successful DAO proposals.
     * @param to The recipient address that will receive the new reputation tokens.
     * @param amount The quantity of reputation tokens to mint.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burns (destroys) a specified amount of SEVA reputation tokens from an address.
     * @dev This is a privileged function restricted to the contract owner. It can be used to reduce reputation
     * based on a DAO vote. The owner is expected to be the SatyugTimeLock contract.
     * @param from The address from which to burn reputation tokens.
     * @param amount The quantity of reputation tokens to burn.
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // --- Non-Transferability Overrides ---

    /**
     * @notice Internal function override to prevent all token transfers between user accounts.
     * @dev This is the core of the non-transferable (soulbound) mechanism. It allows the `_mint` (from address(0))
     * and `_burn` (to address(0)) operations to function, but reverts any other transfer attempt.
     * @param from The sender's address.
     * @param to The recipient's address.
     * @param amount The amount of tokens to transfer.
     */
    function _transfer(address from, address to, uint256 amount) internal override {
        // Only allow minting (from address 0) and burning (to address 0).
        if (from != address(0) && to != address(0)) {
            revert("SatyugReputation: SEVA tokens are non-transferable.");
        }
        // Calls the original ERC20 _transfer function for the allowed cases.
        super._transfer(from, to, amount);
    }

    /**
     * @notice **FORBIDDEN**: Public transfer function is disabled.
     * @dev Overrides the standard ERC20 `transfer` function to always revert, making tokens non-transferable.
     * @param to The recipient address.
     * @param amount The amount of tokens.
     * @return boolean Returns a boolean value indicating whether the operation succeeded. This function will never return true.
     */
    function transfer(address to, uint256 amount) public pure override returns (bool) {
        revert("SatyugReputation: SEVA tokens are non-transferable.");
    }

    /**
     * @notice **FORBIDDEN**: Delegated transfer function is disabled.
     * @dev Overrides the standard ERC20 `transferFrom` function to always revert.
     * @param from The address to transfer from.
     * @param to The recipient address.
     * @param amount The amount of tokens.
     * @return boolean Returns a boolean value indicating whether the operation succeeded. This function will never return true.
     */
    function transferFrom(address from, address to, uint256 amount) public pure override returns (bool) {
        revert("SatyugReputation: SEVA tokens are non-transferable.");
    }

    /**
     * @notice **FORBIDDEN**: Approval function is disabled.
     * @dev Overrides the standard ERC20 `approve` function to always revert, as allowances are not needed for non-transferable tokens.
     * @param spender The address to approve.
     * @param amount The amount of tokens to approve.
     * @return boolean Returns a boolean value indicating whether the operation succeeded. This function will never return true.
     */
    function approve(address spender, uint256 amount) public pure override returns (bool) {
        revert("SatyugReputation: SEVA tokens cannot be approved for transfer.");
    }

    /**
     * @notice Overrides the ERC20 `allowance` function to always return 0.
     * @dev Since approvals are disabled, the allowance for any address will always be zero.
     * @param owner The address of the token owner.
     * @param spender The address of the approved spender.
     * @return uint256 Always returns 0.
     */
    function allowance(address owner, address spender) public view override returns (uint256) {
        return 0;
    }
}
