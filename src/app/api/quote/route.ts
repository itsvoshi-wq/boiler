import { NextResponse } from "next/server";
import { z } from "zod";
import { scanMarkets } from "@/lib/chain/scanner";
import { quoteExactInputSingleTick, priceImpactBps } from "@/lib/chain/uniswapV3";
import { DEFAULT_FEES, quoteFees } from "@/lib/domain/fees";
import { riskFlags } from "@/lib/domain/risk";

export const dynamic = "force-dynamic";

const Body = z.object({
  marketId: z.string(),
  side: z.enum(["BUY", "SELL"]),
  /** Quote currency notional for a buy, base units for a sell. */
  amount: z.number().positive().finite(),
  creatorBps: z.number().min(0).max(50).optional(),
  slippageBps: z.number().min(1).max(2000).optional(),
  hasBroker: z.boolean().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "ORDER REJECTED. Malformed ticket." }, { status: 400 });
  }
  const { marketId, side, amount, creatorBps, slippageBps, hasBroker } = parsed.data;

  const snap = await scanMarkets();
  const market = snap.markets.find((m) => m.id.toLowerCase() === marketId.toLowerCase());
  if (!market) {
    return NextResponse.json({ ok: false, error: "ORDER REJECTED. Market not in the current scan window." }, { status: 404 });
  }

  const baseIsToken0 = market.pool.token0.toLowerCase() === market.base.address.toLowerCase();
  const zeroForOne = side === "SELL" ? baseIsToken0 : !baseIsToken0;
  const inDecimals = side === "SELL" ? market.base.decimals : market.quote.decimals;
  const outDecimals = side === "SELL" ? market.quote.decimals : market.base.decimals;

  const amountIn = BigInt(Math.floor(amount * 10 ** inDecimals));
  const { amountOut, exactWithinTick } = quoteExactInputSingleTick({
    sqrtPriceX96: BigInt(market.pool.sqrtPriceX96),
    liquidity: BigInt(market.pool.liquidity),
    feePips: market.pool.feePips,
    zeroForOne,
    amountIn,
  });

  const outHuman = Number(amountOut) / 10 ** outDecimals;
  const executed = side === "SELL" ? (outHuman > 0 ? outHuman / amount : 0) : outHuman > 0 ? amount / outHuman : 0;
  const notionalUsd = side === "SELL" ? amount * market.price : amount;

  const fees = quoteFees({
    notional: notionalUsd,
    poolFeePips: market.pool.feePips,
    creatorBps: creatorBps ?? 0,
    hasBroker,
    cfg: DEFAULT_FEES,
  });

  const slip = slippageBps ?? 50;
  const minOut = (amountOut * BigInt(10_000 - slip)) / 10_000n;

  return NextResponse.json({
    ok: true,
    indicative: true,
    market: {
      id: market.id,
      symbol: market.symbol,
      price: market.price,
      pool: market.pool.address,
      feeTierBps: market.pool.feePips / 100,
    },
    quote: {
      amountIn: amountIn.toString(),
      amountOut: amountOut.toString(),
      amountOutHuman: outHuman,
      minAmountOut: minOut.toString(),
      slippageBps: slip,
      executedPrice: executed,
      priceImpactBps: priceImpactBps(market.price, side === "SELL" ? executed : executed),
      exactWithinTick,
      caveat:
        "Indicative. Computed from pool state with constant liquidity inside the current tick. The number you sign against comes from an eth_call simulation of SwapRouter02 with your address and your approvals.",
    },
    fees,
    risk: riskFlags(market, snap.block.latest),
    provenance: snap.provenance,
  });
}
