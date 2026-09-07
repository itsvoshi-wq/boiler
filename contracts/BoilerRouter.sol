// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapRouter02, IBoilerFeeController} from "./interfaces/IBoiler.sol";

/**
 * @title BoilerRouter
 * @notice The contract that makes BOILER's fees real instead of modelled.
 *
 * @dev A swap routed through here pays the protocol fee and the desk fee out of
 *      the INPUT token before the swap happens, then the remainder is swapped
 *      through Uniswap V3 SwapRouter02 with the caller as recipient. Taking the
 *      fee on the way in means the accounting is one subtraction rather than a
 *      guess about what came out, and the user's amountOutMinimum still applies
 *      to the real swap.
 *
 *      Deliberate properties:
 *      - The router never holds user funds between transactions. Anything left
 *        behind can only be swept to the revenue sink, never to the owner, so
 *        there is no path for the owner to take a user's tokens.
 *      - Approval to the Uniswap router is set to the exact swap amount and
 *        reset to zero in the same call.
 *      - Fee on transfer tokens are handled by measuring the balance actually
 *        received rather than trusting amountIn.
 *      - Pausable, so a bad market or a bad day can be stopped without
 *        touching anyone's balance.
 *
 *      NOT AUDITED. Read it before you route size through it.
 */
contract BoilerRouter is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BPS_DENOMINATOR = 10_000;

    ISwapRouter02 public immutable swapRouter;
    IBoilerFeeController public feeController;

    /// @notice Where the protocol's share goes. Normally the RevenueRouter.
    address public revenueSink;

    struct SwapParams {
        address tokenIn;
        address tokenOut;
        uint24 poolFee;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
        address desk;
        address broker;
        uint256 deadline;
    }

    event BoilerSwap(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountSwapped,
        uint256 amountOut,
        uint256 protocolFee,
        uint256 deskFee,
        uint256 brokerFee,
        address desk,
        address broker
    );
    event FeeControllerUpdated(address indexed previous, address indexed next);
    event RevenueSinkUpdated(address indexed previous, address indexed next);
    event Swept(address indexed token, uint256 amount, address indexed to);

    error Expired(uint256 deadline, uint256 nowTs);
    error ZeroAmount();
    error NoMinimumOut();
    error NothingReceived();
    error SinkNotSet();

    constructor(address owner_, address swapRouter_, address feeController_, address revenueSink_) Ownable(owner_) {
        require(swapRouter_ != address(0) && feeController_ != address(0) && revenueSink_ != address(0), "zero addr");
        swapRouter = ISwapRouter02(swapRouter_);
        feeController = IBoilerFeeController(feeController_);
        revenueSink = revenueSink_;
    }

    /**
     * @notice Swap through BOILER, paying the published fees.
     * @dev amountOutMinimum is required to be non zero. A swap with no floor is
     *      an invitation, and this router will not sign one for you.
     */
    function exactInputSingle(SwapParams calldata p)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amountOut)
    {
        if (block.timestamp > p.deadline) revert Expired(p.deadline, block.timestamp);
        if (p.amountIn == 0) revert ZeroAmount();
        if (p.amountOutMinimum == 0) revert NoMinimumOut();
        if (revenueSink == address(0)) revert SinkNotSet();

        IERC20 tokenIn = IERC20(p.tokenIn);

        // Measure what actually arrived. A fee on transfer token delivers less
        // than amountIn, and swapping a number we never received would revert
        // deep inside Uniswap with a useless message.
        uint256 before = tokenIn.balanceOf(address(this));
        tokenIn.safeTransferFrom(msg.sender, address(this), p.amountIn);
        uint256 received = tokenIn.balanceOf(address(this)) - before;
        if (received == 0) revert NothingReceived();

        (uint16 protocolBps, uint16 creatorBps) = feeController.bpsFor(p.desk);
        uint256 protocolFee = (received * protocolBps) / BPS_DENOMINATOR;
        uint256 deskFee = (received * creatorBps) / BPS_DENOMINATOR;

        uint256 brokerFee;
        if (p.broker != address(0) && protocolFee > 0) {
            brokerFee = (protocolFee * feeController.brokerShareOfProtocolBps()) / BPS_DENOMINATOR;
            protocolFee -= brokerFee;
        }

        uint256 swapAmount = received - protocolFee - deskFee - brokerFee;
        if (swapAmount == 0) revert ZeroAmount();

        if (protocolFee > 0) tokenIn.safeTransfer(revenueSink, protocolFee);
        if (deskFee > 0) tokenIn.safeTransfer(p.desk, deskFee);
        if (brokerFee > 0) tokenIn.safeTransfer(p.broker, brokerFee);

        tokenIn.forceApprove(address(swapRouter), swapAmount);
        amountOut = swapRouter.exactInputSingle(
            ISwapRouter02.ExactInputSingleParams({
                tokenIn: p.tokenIn,
                tokenOut: p.tokenOut,
                fee: p.poolFee,
                recipient: msg.sender,
                amountIn: swapAmount,
                amountOutMinimum: p.amountOutMinimum,
                sqrtPriceLimitX96: p.sqrtPriceLimitX96
            })
        );
        tokenIn.forceApprove(address(swapRouter), 0);

        emit BoilerSwap(
            msg.sender,
            p.tokenIn,
            p.tokenOut,
            p.amountIn,
            swapAmount,
            amountOut,
            protocolFee,
            deskFee,
            brokerFee,
            p.desk,
            p.broker
        );
    }

    /// @notice What this trade will cost, readable before signing.
    function quote(uint256 amountIn, address desk, address broker)
        external
        view
        returns (uint256 protocolFee, uint256 deskFee, uint256 brokerFee, uint256 amountToSwap)
    {
        (uint16 protocolBps, uint16 creatorBps) = feeController.bpsFor(desk);
        protocolFee = (amountIn * protocolBps) / BPS_DENOMINATOR;
        deskFee = (amountIn * creatorBps) / BPS_DENOMINATOR;
        if (broker != address(0) && protocolFee > 0) {
            brokerFee = (protocolFee * feeController.brokerShareOfProtocolBps()) / BPS_DENOMINATOR;
            protocolFee -= brokerFee;
        }
        amountToSwap = amountIn - protocolFee - deskFee - brokerFee;
    }

    /* ------------------------------------------------------------- admin */

    function setFeeController(address next) external onlyOwner {
        require(next != address(0), "zero addr");
        emit FeeControllerUpdated(address(feeController), next);
        feeController = IBoilerFeeController(next);
    }

    function setRevenueSink(address next) external onlyOwner {
        require(next != address(0), "zero addr");
        emit RevenueSinkUpdated(revenueSink, next);
        revenueSink = next;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Move a stuck balance out of the router.
     * @dev Only ever to the revenue sink. There is no owner destination on
     *      purpose: a rescue function that pays the owner is a rug with a
     *      polite name.
     */
    function sweep(address token) external onlyOwner {
        uint256 amount = IERC20(token).balanceOf(address(this));
        if (amount == 0) return;
        IERC20(token).safeTransfer(revenueSink, amount);
        emit Swept(token, amount, revenueSink);
    }
}
