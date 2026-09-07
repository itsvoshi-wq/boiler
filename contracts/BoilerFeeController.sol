// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IBoilStaking} from "./interfaces/IBoiler.sol";

/**
 * @title BoilerFeeController
 * @notice The single place a BOILER fee can be decided.
 * @dev Bounds are enforced on write, not on read, so a desk cannot set 20% and
 *      quietly be charged 1%: the transaction reverts instead. Every change
 *      emits an event, because a fee schedule that can move quietly is the
 *      thing this whole product exists to argue against.
 *
 *      NOT AUDITED. Deployed by whoever runs the admin page, owned by them,
 *      and every parameter is readable by anyone.
 */
contract BoilerFeeController is Ownable2Step {
    /// @notice Protocol + desk can never exceed this, enforced on every write.
    uint16 public constant HARD_CAP_BPS = 100;
    uint16 public constant BPS_DENOMINATOR = 10_000;

    struct Schedule {
        uint16 protocolSwapBps;
        uint16 creatorMinBps;
        uint16 creatorDefaultBps;
        uint16 creatorMaxBps;
        uint16 brokerShareOfProtocolBps;
        uint16 automationActionBps;
        uint16 strategyExecutionBps;
    }

    Schedule private _schedule;

    /// @notice Per desk fee, in basis points. Zero means the desk uses nothing.
    mapping(address desk => uint16 bps) public deskFeeBps;
    mapping(address desk => bool set) public deskFeeSet;

    /// @notice Optional staking contract. When set, stakers get a discount on
    ///         the protocol fee. Never on the pool fee, which is not ours.
    IBoilStaking public staking;

    event ScheduleUpdated(Schedule previous, Schedule next, address indexed by);
    event DeskFeeSet(address indexed desk, uint16 bps);
    event StakingUpdated(address indexed previous, address indexed next);

    error AboveHardCap(uint16 requested, uint16 cap);
    error OutOfBounds(uint16 requested, uint16 min, uint16 max);
    error BadSchedule(string reason);

    constructor(address owner_, Schedule memory initial) Ownable(owner_) {
        _setSchedule(initial);
    }

    /* ------------------------------------------------------------- reads */

    function schedule() external view returns (Schedule memory) {
        return _schedule;
    }

    function brokerShareOfProtocolBps() external view returns (uint16) {
        return _schedule.brokerShareOfProtocolBps;
    }

    /// @notice Effective basis points for a trade routed through `desk`.
    function bpsFor(address desk) public view returns (uint16 protocolBps, uint16 creatorBps) {
        protocolBps = _schedule.protocolSwapBps;
        creatorBps = deskFeeSet[desk] ? deskFeeBps[desk] : 0;
        if (desk == address(0)) creatorBps = 0;
        if (protocolBps + creatorBps > HARD_CAP_BPS) {
            creatorBps = HARD_CAP_BPS > protocolBps ? HARD_CAP_BPS - protocolBps : 0;
        }
    }

    /// @notice Same maths the interface prints on the ticket before signature.
    function quote(uint256 notional, address desk, bool hasBroker)
        external
        view
        returns (uint256 protocolFee, uint256 creatorFee, uint256 brokerFee, uint256 totalFee)
    {
        (uint16 protocolBps, uint16 creatorBps) = bpsFor(desk);
        protocolFee = (notional * protocolBps) / BPS_DENOMINATOR;
        creatorFee = (notional * creatorBps) / BPS_DENOMINATOR;
        brokerFee = hasBroker ? (protocolFee * _schedule.brokerShareOfProtocolBps) / BPS_DENOMINATOR : 0;
        totalFee = protocolFee + creatorFee;
    }

    /// @notice Protocol basis points for one trader, after any staking discount.
    function protocolBpsFor(address trader) external view returns (uint16) {
        uint16 base = _schedule.protocolSwapBps;
        if (address(staking) == address(0)) return base;
        uint16 discount = staking.feeDiscountBpsOf(trader);
        return discount >= base ? 0 : base - discount;
    }

    /* ------------------------------------------------------------ writes */

    function setSchedule(Schedule calldata next) external onlyOwner {
        _setSchedule(next);
    }

    /// @notice A desk sets its own fee, inside the published bounds. The owner
    ///         may also set it, which is how a desk gets corrected rather than
    ///         removed.
    function setDeskFee(address desk, uint16 bps) external {
        if (msg.sender != desk && msg.sender != owner()) revert OutOfBounds(bps, 0, 0);
        if (bps < _schedule.creatorMinBps || bps > _schedule.creatorMaxBps) {
            revert OutOfBounds(bps, _schedule.creatorMinBps, _schedule.creatorMaxBps);
        }
        if (_schedule.protocolSwapBps + bps > HARD_CAP_BPS) {
            revert AboveHardCap(_schedule.protocolSwapBps + bps, HARD_CAP_BPS);
        }
        deskFeeBps[desk] = bps;
        deskFeeSet[desk] = true;
        emit DeskFeeSet(desk, bps);
    }

    function setStaking(address next) external onlyOwner {
        emit StakingUpdated(address(staking), next);
        staking = IBoilStaking(next);
    }

    function _setSchedule(Schedule memory next) internal {
        if (next.creatorMinBps > next.creatorMaxBps) revert BadSchedule("min above max");
        if (next.creatorDefaultBps < next.creatorMinBps || next.creatorDefaultBps > next.creatorMaxBps) {
            revert BadSchedule("default outside bounds");
        }
        if (next.protocolSwapBps + next.creatorMaxBps > HARD_CAP_BPS) {
            revert AboveHardCap(next.protocolSwapBps + next.creatorMaxBps, HARD_CAP_BPS);
        }
        if (next.brokerShareOfProtocolBps > BPS_DENOMINATOR) revert BadSchedule("broker share above 100%");
        emit ScheduleUpdated(_schedule, next, msg.sender);
        _schedule = next;
    }
}
