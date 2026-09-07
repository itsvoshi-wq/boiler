// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BOILER RevenueRouter
/// @notice Specification. NOT DEPLOYED.
/// @dev Allocation must total 10_000 bps or the write reverts. Staker
///      distribution is gated behind a switch that is off, and turning it on is
///      a public transaction rather than a config change nobody sees.
interface IRevenueRouter {
    enum Destination {
        TREASURY,
        BUYBACK,
        BURN,
        PROTOCOL_OWNED_LIQUIDITY,
        CREATOR_ECOSYSTEM,
        BROKER_PAYOUTS,
        STAKER_DISTRIBUTION
    }

    struct Allocation {
        Destination destination;
        uint16 bps;
    }

    event AllocationUpdated(Allocation[] previous, Allocation[] next, address indexed by);
    event Routed(address indexed token, uint256 amount, Allocation[] applied);
    event BuybackExecuted(uint256 spent, uint256 boilAcquired, bytes32 reference);
    event Burned(uint256 amount, bytes32 reference);
    event StakerDistributionEnabled(address indexed by, string legalReference);

    error AllocationMustTotal10000(uint16 got);
    error StakerDistributionDisabled();

    function allocation() external view returns (Allocation[] memory);

    function stakerDistributionEnabled() external view returns (bool);

    /// @notice Splits `amount` of `token` across the current allocation.
    function route(address token, uint256 amount) external;

    /// @notice Historical record, so The Books can show allocation over time
    ///         rather than only the version that is live right now.
    function allocationAt(uint256 blockNumber) external view returns (Allocation[] memory);
}
