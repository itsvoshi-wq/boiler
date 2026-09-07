// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BOILER FeeController
/// @notice Specification. NOT DEPLOYED. No BOILER contract exists on Robinhood Chain.
/// @dev Bounds live here so no other contract or interface can invent a fee.
///      Every change emits an event, because a fee schedule that can move
///      quietly is the thing this whole product exists to argue against.
interface IFeeController {
    struct Schedule {
        uint16 protocolSwapBps;
        uint16 creatorMinBps;
        uint16 creatorDefaultBps;
        uint16 creatorMaxBps;
        uint16 brokerShareOfProtocolBps;
        uint16 automationActionBps;
        uint16 strategyExecutionBps;
    }

    event ScheduleUpdated(Schedule previous, Schedule next, address indexed by);
    event DeskFeeSet(address indexed desk, uint16 bps);

    error AboveHardCap(uint16 requested, uint16 cap);
    error OutOfBounds(uint16 requested, uint16 min, uint16 max);

    /// @notice protocol + creator can never exceed this, enforced on write.
    function HARD_CAP_BPS() external view returns (uint16);

    function schedule() external view returns (Schedule memory);

    /// @notice Reverts rather than silently clamping, so a desk cannot set 20%
    ///         and quietly be charged 1%.
    function setDeskFee(address desk, uint16 bps) external;

    /// @notice Full breakdown for a notional, identical to what the interface
    ///         renders on the ticket before signature.
    function quote(uint256 notional, address desk, address broker)
        external
        view
        returns (uint256 protocolFee, uint256 creatorFee, uint256 brokerFee, uint256 totalFee);
}
