// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @notice Uniswap V3 SwapRouter02 on Robinhood Chain, verified live at
///         0xcaf681a66d020601342297493863e78c959e5cb2. Note there is no
///         deadline field: that is SwapRouter02, not the original SwapRouter.
interface ISwapRouter02 {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}

interface IBoilerFeeController {
    /// @return protocolBps the protocol's own take
    /// @return creatorBps  the desk's take, already clamped to its bounds
    function bpsFor(address desk) external view returns (uint16 protocolBps, uint16 creatorBps);

    function brokerShareOfProtocolBps() external view returns (uint16);

    function quote(uint256 notional, address desk, bool hasBroker)
        external
        view
        returns (uint256 protocolFee, uint256 creatorFee, uint256 brokerFee, uint256 totalFee);
}

interface IBoilStaking {
    /// @notice Basis points taken off the protocol swap fee for this account.
    function feeDiscountBpsOf(address account) external view returns (uint16);
}
