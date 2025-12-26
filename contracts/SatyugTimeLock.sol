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

import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title SatyugTimeLock
 * @author Satya Yuga Bhumi Trust (DAO)
 * @notice A time-lock contract that acts as the secure execution arm of the Satyug DAO.
 * @dev This contract enforces a mandatory delay on all administrative actions, providing a crucial window
 * for the community to react to proposals after they have passed a vote but before they are executed.
 * It is built on OpenZeppelin's robust TimelockController. In our system, this contract is designed
 * to be the ultimate owner of critical contracts like `SatyugReputation` and `LandLock`. The `SatyugGovernor`
 * contract is the sole "proposer" of actions to this timelock, creating a secure, decentralized chain of command.
 */
contract SatyugTimeLock is TimelockController {
    // --- Constructor ---

    /**
     * @notice Initializes the Timelock Controller and configures its roles and delay period.
     * @dev This constructor sets up the entire access control system for the DAO's actions.
     * The `proposers` array should contain the address of the `SatyugGovernor` contract.
     * The `executors` array should ideally be set to `[address(0)]` to allow anyone to execute a
     * proposal once its time lock has passed, promoting decentralization.
     * The `admin` role is a powerful role capable of managing roles. It should be granted to the deployer
     * initially, and then ideally transferred to the Timelock itself, making the DAO fully self-governing.
     *
     * @param minDelay The minimum delay in seconds between a proposal being queued and when it can be executed.
     * @param proposers An array of addresses authorized to schedule operations. This must include the Governor.
     * @param executors An array of addresses authorized to execute operations. `address(0)` allows anyone.
     * @param admin The administrative address for managing roles. Initially the deployer, then the DAO itself.
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    )
        TimelockController(minDelay, proposers, executors, admin)
    {
        // The core logic for scheduling, executing, and access control is handled by the parent
        // OpenZeppelin TimelockController contract. No additional implementation is needed here.
    }
}
