/**
 * Uniswap V3 math, only the parts BOILER actually needs, kept honest about
 * what it can and cannot know.
 */

const Q96 = 2n ** 96n;

/** Price of token0 denominated in token1, adjusted for decimals. */
export function priceFromSqrtX96(sqrtPriceX96: bigint, dec0: number, dec1: number): number {
  if (sqrtPriceX96 <= 0n) return 0;
  const ratio = Number(sqrtPriceX96) / Number(Q96);
  const raw = ratio * ratio;
  return raw * 10 ** (dec0 - dec1);
}

export function tickToPrice(tick: number, dec0: number, dec1: number): number {
  return 1.0001 ** tick * 10 ** (dec0 - dec1);
}

/**
 * Single tick constant liquidity quote.
 *
 * This is an INDICATIVE quote. It assumes liquidity is constant across the
 * price move, which is true until the swap crosses a tick boundary. BOILER
 * labels it as indicative everywhere it is shown, and the real amountOut for a
 * live trade comes from an eth_call simulation of the router, never from here.
 */
export function quoteExactInputSingleTick(args: {
  sqrtPriceX96: bigint;
  liquidity: bigint;
  feePips: number;
  zeroForOne: boolean;
  amountIn: bigint;
}): { amountOut: bigint; sqrtPriceAfterX96: bigint; exactWithinTick: boolean } {
  const { sqrtPriceX96, liquidity, feePips, zeroForOne, amountIn } = args;
  if (liquidity <= 0n || sqrtPriceX96 <= 0n || amountIn <= 0n) {
    return { amountOut: 0n, sqrtPriceAfterX96: sqrtPriceX96, exactWithinTick: false };
  }
  const afterFee = (amountIn * BigInt(1_000_000 - feePips)) / 1_000_000n;

  if (zeroForOne) {
    // token0 in, token1 out, price moves down
    const denom = liquidity * Q96 + afterFee * sqrtPriceX96;
    if (denom === 0n) return { amountOut: 0n, sqrtPriceAfterX96: sqrtPriceX96, exactWithinTick: false };
    const nextSqrt = (liquidity * Q96 * sqrtPriceX96) / denom;
    const amountOut = (liquidity * (sqrtPriceX96 - nextSqrt)) / Q96;
    return { amountOut: amountOut > 0n ? amountOut : 0n, sqrtPriceAfterX96: nextSqrt, exactWithinTick: true };
  }
  // token1 in, token0 out, price moves up
  const nextSqrt = sqrtPriceX96 + (afterFee * Q96) / liquidity;
  if (nextSqrt <= 0n) return { amountOut: 0n, sqrtPriceAfterX96: sqrtPriceX96, exactWithinTick: false };
  const amountOut =
    (liquidity * Q96 * (nextSqrt - sqrtPriceX96)) / (nextSqrt * sqrtPriceX96);
  return { amountOut: amountOut > 0n ? amountOut : 0n, sqrtPriceAfterX96: nextSqrt, exactWithinTick: true };
}

export function priceImpactBps(spot: number, executed: number): number {
  if (spot <= 0 || executed <= 0) return 0;
  return Math.abs((executed - spot) / spot) * 10_000;
}

export const FEE_TIER_LABEL = (fee: number) => `${(fee / 10_000).toFixed(fee % 10_000 === 0 ? 2 : 3)}%`;
