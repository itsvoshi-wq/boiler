import { encodeFunctionData, type Address, type Hex } from "viem";
import { ADDRESSES } from "./chains";

export const ERC20_ABI = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const SWAP_ROUTER_ABI = [
  {
    type: "function",
    name: "exactInputSingle",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

export type SwapPlan = {
  router: Address;
  tokenIn: Address;
  tokenOut: Address;
  fee: number;
  amountIn: bigint;
  amountOutMinimum: bigint;
  recipient: Address;
  data: Hex;
};

/**
 * Builds the exact calldata that will be signed.
 *
 * amountOutMinimum is never zero and never optional: it is the slippage guard,
 * computed from the indicative quote and the user's tolerance, and it is what
 * stops a sandwich from taking the whole trade.
 */
export function buildSwap(args: {
  tokenIn: Address;
  tokenOut: Address;
  feePips: number;
  amountIn: bigint;
  amountOutMinimum: bigint;
  recipient: Address;
}): SwapPlan {
  if (args.amountIn <= 0n) throw new Error("ORDER REJECTED. Zero size.");
  if (args.amountOutMinimum <= 0n) throw new Error("ORDER REJECTED. No minimum output set.");

  const data = encodeFunctionData({
    abi: SWAP_ROUTER_ABI,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: args.tokenIn,
        tokenOut: args.tokenOut,
        fee: args.feePips,
        recipient: args.recipient,
        amountIn: args.amountIn,
        amountOutMinimum: args.amountOutMinimum,
        sqrtPriceLimitX96: 0n,
      },
    ],
  });

  return {
    router: ADDRESSES.swapRouter02 as Address,
    tokenIn: args.tokenIn,
    tokenOut: args.tokenOut,
    fee: args.feePips,
    amountIn: args.amountIn,
    amountOutMinimum: args.amountOutMinimum,
    recipient: args.recipient,
    data,
  };
}

export function approveData(spender: Address, amount: bigint): Hex {
  return encodeFunctionData({ abi: ERC20_ABI, functionName: "approve", args: [spender, amount] });
}

export function minOutFor(amountOut: bigint, slippageBps: number): bigint {
  const bps = Math.max(1, Math.min(2000, Math.round(slippageBps)));
  return (amountOut * BigInt(10_000 - bps)) / 10_000n;
}
