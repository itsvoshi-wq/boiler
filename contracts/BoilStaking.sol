// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BoilStaking
 * @notice Stake $BOIL for capability, not for yield.
 *
 * @dev Deliberately boring. Lock, read tier, unlock. There is no rewards
 *      accrual, no emissions, no rebasing and no APR, because printing tokens
 *      and calling the print yield is the oldest trick in the room this product
 *      is named after. What staking buys is inside the product: a discount on
 *      the protocol fee, more automation slots, a bigger share of desk fees.
 *
 *      The token address is set once and then frozen, so the contract cannot be
 *      pointed at a different token after people have staked.
 *
 *      NOT AUDITED.
 */
contract BoilStaking is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_LOCK = 365 days;

    IERC20 public boil;
    bool public tokenFrozen;

    struct Position {
        uint128 amount;
        uint64 lockedUntil;
    }

    mapping(address account => Position) public positions;
    uint256 public totalStaked;

    /// @notice Ascending thresholds for FLOOR, DESK, PARTNER, HOUSE.
    uint256[4] public tierThresholds;
    /// @notice Basis points off the protocol fee, per tier, same order.
    uint16[4] public tierFeeDiscountBps;

    event TokenSet(address indexed token);
    event TiersUpdated(uint256[4] thresholds, uint16[4] discounts);
    event Staked(address indexed account, uint256 amount, uint64 lockedUntil, uint8 tier);
    event Unstaked(address indexed account, uint256 amount);

    error TokenAlreadySet();
    error TokenNotSet();
    error StillLocked(uint64 until);
    error NothingStaked();
    error LockTooLong(uint256 requested, uint256 max);
    error ThresholdsNotAscending();

    constructor(address owner_, uint256[4] memory thresholds, uint16[4] memory discounts) Ownable(owner_) {
        _setTiers(thresholds, discounts);
    }

    /* ------------------------------------------------------------- reads */

    /// @return tier 0 FLOOR, 1 DESK, 2 PARTNER, 3 HOUSE
    function tierOf(address account) public view returns (uint8 tier) {
        uint256 amount = positions[account].amount;
        for (uint8 i = 0; i < 4; i++) {
            if (amount >= tierThresholds[i]) tier = i;
        }
    }

    function feeDiscountBpsOf(address account) external view returns (uint16) {
        return tierFeeDiscountBps[tierOf(account)];
    }

    function positionOf(address account) external view returns (Position memory) {
        return positions[account];
    }

    /* ------------------------------------------------------------ writes */

    function setToken(address token) external onlyOwner {
        if (tokenFrozen) revert TokenAlreadySet();
        require(token != address(0), "zero token");
        boil = IERC20(token);
        tokenFrozen = true;
        emit TokenSet(token);
    }

    function setTiers(uint256[4] calldata thresholds, uint16[4] calldata discounts) external onlyOwner {
        _setTiers(thresholds, discounts);
    }

    function stake(uint256 amount, uint64 lockSeconds) external nonReentrant {
        if (address(boil) == address(0)) revert TokenNotSet();
        if (amount == 0) revert NothingStaked();
        if (lockSeconds > MAX_LOCK) revert LockTooLong(lockSeconds, MAX_LOCK);

        uint256 before = boil.balanceOf(address(this));
        boil.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = boil.balanceOf(address(this)) - before;
        if (received == 0) revert NothingStaked();

        Position storage p = positions[msg.sender];
        p.amount += uint128(received);
        uint64 until_ = uint64(block.timestamp) + lockSeconds;
        if (until_ > p.lockedUntil) p.lockedUntil = until_;
        totalStaked += received;

        emit Staked(msg.sender, received, p.lockedUntil, tierOf(msg.sender));
    }

    function unstake(uint256 amount) external nonReentrant {
        Position storage p = positions[msg.sender];
        if (p.amount == 0 || amount == 0 || amount > p.amount) revert NothingStaked();
        if (block.timestamp < p.lockedUntil) revert StillLocked(p.lockedUntil);

        p.amount -= uint128(amount);
        totalStaked -= amount;
        boil.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function _setTiers(uint256[4] memory thresholds, uint16[4] memory discounts) internal {
        for (uint256 i = 1; i < 4; i++) {
            if (thresholds[i] <= thresholds[i - 1]) revert ThresholdsNotAscending();
        }
        tierThresholds = thresholds;
        tierFeeDiscountBps = discounts;
        emit TiersUpdated(thresholds, discounts);
    }
}
