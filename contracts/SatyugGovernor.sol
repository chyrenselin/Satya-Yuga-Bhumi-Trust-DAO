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

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title SatyugGovernor
 * @author Satya Yuga Bhumi Trust (DAO)
 * @notice The core governance contract for the Satyug DAO, orchestrating proposals and voting.
 * @dev This contract is the "brain" of the DAO. It is built by combining several modular contracts
 * from OpenZeppelin's governance framework to ensure security and maintainability.
 *
 * It inherits from the following modules:
 * - Governor: The base contract providing the core proposal lifecycle.
 * - GovernorSettings: Manages settings like voting delay and period. We set proposal threshold to 0,
 *   allowing anyone with voting power to create a proposal.
 * - GovernorCountingSimple: A standard module for tallying For, Against, and Abstain votes.
 * - GovernorVotes: Links governance to an ERC20-votable token (`SatyugReputation`). It checks a user's
 *   `getPastVotes` (reputation) at the time of proposal creation for their voting power.
 * - GovernorVotesQuorumFraction: Defines the quorum as a percentage of the total reputation supply.
 * - GovernorTimelockControl: Connects the Governor to a Timelock contract, ensuring that all
 *   successful proposals are executed through the timelock's secure, delayed process.
 */
contract SatyugGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // --- Constructor ---

    /**
     * @notice Initializes the Governor with its core components and settings.
     * @dev This constructor configures the entire governance process by linking the reputation token (`_token`)
     * and the security timelock (`_timelock`), and by setting the rules for voting.
     * @param _token The address of the `SatyugReputation` (SEVA) token contract, which implements the IVotes interface.
     * @param _timelock The address of the `SatyugTimeLock` contract that will execute proposals.
     * @param _votingDelay The delay (in blocks) from when a proposal is created until voting begins. Allows time for review.
     * @param _votingPeriod The duration (in blocks) that a proposal will be open for voting.
     * @param _quorumPercentage The percentage of the total SEVA supply that must participate in a vote for it to be valid.
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _quorumPercentage
    )
        Governor("SatyugGovernor")
        GovernorSettings(_votingDelay, _votingPeriod, 0) // Proposal threshold is 0; any SEVA holder can propose.
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {}

    // --- Overridden Functions ---
    // The following functions are overridden to resolve inheritance conflicts from using multiple Governor extensions.
    // They explicitly call the `super` function to use the logic from the intended parent module.

    /**
     * @notice Returns the delay from a proposal's creation until voting starts.
     * @dev See {IGovernor-votingDelay}. This override resolves inheritance ambiguity.
     */
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    /**
     * @notice Returns the duration of a vote in blocks.
     * @dev See {IGovernor-votingPeriod}. This override resolves inheritance ambiguity.
     */
    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    /**
     * @notice Returns the quorum required for a vote to be successful.
     * @dev See {IGovernor-quorum}. This override resolves inheritance ambiguity from GovernorVotesQuorumFraction.
     */
    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }
    
    /**
     * @notice Public function to create a new proposal.
     * @dev See {IGovernor-propose}. Any member with voting power can create a proposal.
     * @param targets The array of addresses that the proposal will call.
     * @param values The array of Ether values to be sent with each call (usually 0).
     * @param calldatas The array of encoded function calls for each target address.
     * @param description A human-readable description of the proposal.
     * @return The ID of the newly created proposal.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    /**
     * @notice Internal execution logic for a proposal.
     * @dev See {Governor-_execute}. This override routes execution through the TimelockController.
     */
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @notice Internal cancellation logic for a proposal.
     * @dev See {Governor-_cancel}. This override routes cancellation through the TimelockController.
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /**
     * @notice Returns the current state of a proposal.
     * @dev See {IGovernor-state}. This override integrates the Timelock's state.
     */
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    /**
     * @notice Internal logic for casting a vote.
     * @dev See {GovernorCountingSimple-_castVote}. This override resolves inheritance ambiguity.
     */
    function _castVote(
        uint256 proposalId,
        address account,
        uint8 support,
        string memory reason
    ) internal override(Governor, GovernorCountingSimple) returns (uint256) {
        return super._castVote(proposalId, account, support, reason);
    }
    
    /**
     * @notice Internal logic for retrieving voting power.
     * @dev See {GovernorVotes-_getVotes}. This override resolves inheritance ambiguity.
     */
    function _getVotes(
        address account,
        uint256 blockNumber
    ) internal view override(Governor, GovernorVotes) returns (uint256) {
        return super._getVotes(account, blockNumber);
    }
}
