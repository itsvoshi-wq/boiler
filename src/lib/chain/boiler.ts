import { encodeFunctionData, type Address, type Hex } from "viem";
import { ARTIFACTS } from "../contracts/artifacts";
import { ADDRESSES } from "./chains";

/**
 * The deployed BOILER swap router, if there is one.
 *
 * Until this is configured every trade goes straight to Uniswap SwapRouter02
 * and BOILER collects nothing, which is what the order ticket says. Once it is
 * set, the same ticket routes through the fee taking contract and the fee it
 * prints is the fee that leaves the wallet. The interface reads this in exactly
 * one place so the two states can never disagree.
 */
export const BOILER_ROUTER = (process.env.NEXT_PUBLIC_BOILER_ROUTER || "").trim() as Address | "";

export const feesAreLive = (): boolean => /^0x[0-9a-fA-F]{40}$/.test(BOILER_ROUTER);

/** Who the user must approve for this trade. */
export function spenderFor(): Address {
  return feesAreLive() ? (BOILER_ROUTER as Address) : (ADDRESSES.swapRouter02 as Address);
}

export type BoilerSwapArgs = {
  tokenIn: Address;
  tokenOut: Address;
  poolFee: number;
  amountIn: bigint;
  amountOutMinimum: bigint;
  desk?: Address;
  broker?: Address;
  /** Seconds from now. The router rejects a late fill rather than taking it. */
  ttlSeconds?: number;
};

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

export function buildBoilerSwap(args: BoilerSwapArgs): { to: Address; data: Hex } {
  if (!feesAreLive()) throw new Error("ORDER REJECTED. No BOILER router configured.");
  if (args.amountIn <= 0n) throw new Error("ORDER REJECTED. Zero size.");
  if (args.amountOutMinimum <= 0n) throw new Error("ORDER REJECTED. No minimum output set.");

  const deadline = BigInt(Math.floor(Date.now() / 1000) + (args.ttlSeconds ?? 600));
  const data = encodeFunctionData({
    abi: ARTIFACTS.BoilerRouter.abi,
    functionName: "exactInputSingle",
    args: [
      {
        tokenIn: args.tokenIn,
        tokenOut: args.tokenOut,
        poolFee: args.poolFee,
        amountIn: args.amountIn,
        amountOutMinimum: args.amountOutMinimum,
        sqrtPriceLimitX96: 0n,
        desk: args.desk ?? ZERO,
        broker: args.broker ?? ZERO,
        deadline,
      },
    ],
  } as never);

  return { to: BOILER_ROUTER as Address, data };
}
