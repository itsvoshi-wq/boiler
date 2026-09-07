// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title BOIL Staking
/// @notice Specification. NOT DEPLOYED. No $BOIL token exists.
/// @dev Deliberately boring: lock, read tier, unlock. No rebasing, no transfer
///      tax, no blacklist, no mint path, no rewards accrual that depends on new
///      emissions. Tiers gate capability inside the product, and that is all.
interface IBoilStaking {
    enum Tier {
        FLOOR,
        DESK,
        PARTNER,
        HOUSE
    }

    struct Position {
        uint128 amount;
        uint64 lockedUntil;
        Tier tier;
    }

    event Staked(address indexed account, uint256 amount, Tier tier);
    event Unstaked(address indexed account, uint256 amount);
    event TierThresholdsUpdated(uint256[4] previous, uint256[4] next);

    error StillLocked(uint64 until);
    error NothingStaked();

    function stake(uint256 amount, uint64 lockSeconds) external;

    function unstake(uint256 amount) external;

    function positionOf(address account) external view returns (Position memory);

    function tierOf(address account) external view returns (Tier);

    /// @notice Basis points taken off the protocol swap fee for this account.
    function feeDiscountBps(address account) external view returns (uint16);
}
