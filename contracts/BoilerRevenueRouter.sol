// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title BoilerRevenueRouter
 * @notice Splits collected protocol revenue across published destinations.
 *
 * @dev The allocation must total exactly 10,000 basis points or the write
 *      reverts, and every change is an event with the old and new arrays in it,
 *      so The Books can show allocation over time rather than only whatever is
 *      live right now.
 *
 *      Distribution to stakers is switched off and cannot be allocated to while
 *      it is off. Turning it on is its own transaction that records a legal
 *      reference string on chain, because "we quietly enabled it in a config
 *      change" is not a thing this contract lets you do.
 *
 *      NOT AUDITED.
 */
contract BoilerRevenueRouter is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BPS_TOTAL = 10_000;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

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

    Allocation[] private _allocation;
    mapping(Destination => address) public sink;

    bool public stakerDistributionEnabled;
    string public stakerDistributionLegalReference;

    /// @notice Cumulative, per token, for anyone auditing The Books.
    mapping(address token => uint256 amount) public totalRouted;
    mapping(Destination => mapping(address token => uint256 amount)) public totalTo;

    event AllocationUpdated(Allocation[] previous, Allocation[] next, address indexed by);
    event SinkUpdated(Destination indexed destination, address indexed previous, address indexed next);
    event Routed(address indexed token, uint256 amount, uint256 destinations);
    event Paid(address indexed token, Destination indexed destination, address indexed to, uint256 amount);
    event StakerDistributionEnabled(address indexed by, string legalReference);

    error AllocationMustTotal10000(uint256 got);
    error StakerDistributionDisabled();
    error SinkMissing(Destination destination);
    error NothingToRoute();

    constructor(address owner_, address treasury_) Ownable(owner_) {
        require(treasury_ != address(0), "zero treasury");
        sink[Destination.TREASURY] = treasury_;
        sink[Destination.BURN] = BURN_ADDRESS;

        // The default published split. Change it and the event records both sides.
        Allocation[] memory initial = new Allocation[](6);
        initial[0] = Allocation(Destination.BUYBACK, 3000);
        initial[1] = Allocation(Destination.BURN, 1000);
        initial[2] = Allocation(Destination.PROTOCOL_OWNED_LIQUIDITY, 1500);
        initial[3] = Allocation(Destination.CREATOR_ECOSYSTEM, 2000);
        initial[4] = Allocation(Destination.BROKER_PAYOUTS, 1000);
        initial[5] = Allocation(Destination.TREASURY, 1500);
        _setAllocation(initial);
    }

    /* ------------------------------------------------------------- reads */

    function allocation() external view returns (Allocation[] memory) {
        return _allocation;
    }

    function allocationLength() external view returns (uint256) {
        return _allocation.length;
    }

    /**
     * @notice What routing `amount` would pay out, without moving anything.
     * @dev Deliberately does not revert on a missing sink. The admin page uses
     *      this to show which destination still needs an address, and a view
     *      that blows up is useless for that. `route` is where a missing sink
     *      stops the world.
     */
    function preview(uint256 amount)
        external
        view
        returns (Destination[] memory destinations, address[] memory sinks, uint256[] memory amounts)
    {
        uint256 n = _allocation.length;
        destinations = new Destination[](n);
        sinks = new address[](n);
        amounts = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            Destination d = _allocation[i].destination;
            destinations[i] = d;
            sinks[i] = sink[d] == address(0) && d == Destination.BURN ? BURN_ADDRESS : sink[d];
            amounts[i] = (amount * _allocation[i].bps) / BPS_TOTAL;
        }
    }

    /// @notice True when every destination in the live allocation has a sink.
    function readyToRoute() external view returns (bool) {
        for (uint256 i = 0; i < _allocation.length; i++) {
            Destination d = _allocation[i].destination;
            if (sink[d] == address(0) && d != Destination.BURN) return false;
        }
        return true;
    }

    /* ------------------------------------------------------------ writes */

    function setAllocation(Allocation[] calldata next) external onlyOwner {
        _setAllocation(next);
    }

    function setSink(Destination destination, address to) external onlyOwner {
        emit SinkUpdated(destination, sink[destination], to);
        sink[destination] = to;
    }

    /**
     * @notice Turn on direct distribution to stakers.
     * @param legalReference Free text, stored on chain. Put the opinion, the
     *        date, the counsel. Future readers get to check your homework.
     */
    function enableStakerDistribution(string calldata legalReference) external onlyOwner {
        require(bytes(legalReference).length > 0, "reference required");
        stakerDistributionEnabled = true;
        stakerDistributionLegalReference = legalReference;
        emit StakerDistributionEnabled(msg.sender, legalReference);
    }

    /// @notice Split this contract's whole balance of `token`.
    function route(address token) external nonReentrant returns (uint256 routed) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert NothingToRoute();

        uint256 n = _allocation.length;
        for (uint256 i = 0; i < n; i++) {
            Allocation memory a = _allocation[i];
            uint256 amount = (balance * a.bps) / BPS_TOTAL;
            if (amount == 0) continue;
            address to = _sinkFor(a.destination);
            IERC20(token).safeTransfer(to, amount);
            totalTo[a.destination][token] += amount;
            routed += amount;
            emit Paid(token, a.destination, to, amount);
        }
        totalRouted[token] += routed;
        emit Routed(token, routed, n);
        // Integer division leaves dust behind on purpose. It joins the next
        // route rather than being swept somewhere unaccounted.
    }

    /* ---------------------------------------------------------- internal */

    function _sinkFor(Destination d) internal view returns (address to) {
        to = sink[d];
        if (to == address(0)) {
            if (d == Destination.BURN) return BURN_ADDRESS;
            revert SinkMissing(d);
        }
    }

    function _setAllocation(Allocation[] memory next) internal {
        uint256 total;
        for (uint256 i = 0; i < next.length; i++) {
            total += next[i].bps;
            if (next[i].destination == Destination.STAKER_DISTRIBUTION && next[i].bps > 0 && !stakerDistributionEnabled)
            {
                revert StakerDistributionDisabled();
            }
        }
        if (total != BPS_TOTAL) revert AllocationMustTotal10000(total);

        emit AllocationUpdated(_allocation, next, msg.sender);
        delete _allocation;
        for (uint256 i = 0; i < next.length; i++) {
            _allocation.push(next[i]);
        }
    }
}
