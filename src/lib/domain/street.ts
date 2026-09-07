import { computeHeat } from "./heat";
import type { MarketSnapshot, StreetEvent } from "./types";
import { usd } from "../format";

/**
 * STREET FEED.
 *
 * Every event is deterministic: same snapshot in, same feed out. There is no
 * language model writing headlines here and nothing is invented. Copy is
 * templated from numbers that were read off the chain.
 */
export function buildStreet(snapshot: MarketSnapshot, newPools: { pool: string; block: number }[] = []): StreetEvent[] {
  const events: StreetEvent[] = [];
  const bySymbol = new Map(snapshot.markets.map((m) => [m.id, m]));

  for (const t of snapshot.trades) {
    if (t.tag !== "BLOCK") continue;
    events.push({
      id: `blk-${t.txHash}-${t.blockNumber}`,
      kind: "BLOCK_TRADE",
      headline: `BLOCK ${t.side} ${t.symbol}`,
      detail: `${usd(t.quoteAmount * (bySymbol.get(t.marketId)?.quote.assetClass === "STABLE" ? 1 : 1), { compact: true })} crossed at ${usd(t.price)} in block ${t.blockNumber.toLocaleString()}.`,
      symbol: t.symbol,
      at: Date.now() - (snapshot.block.to - t.blockNumber) * snapshot.chain.blockTimeSec * 1000,
      blockNumber: t.blockNumber,
      txHash: t.txHash,
      severity: "HIGH",
    });
  }

  for (const m of snapshot.markets) {
    const heat = computeHeat(m, snapshot.windowSeconds);
    if (heat.band === "HOT" || heat.band === "MELTING") {
      events.push({
        id: `heat-${m.id}-${snapshot.block.to}`,
        kind: "HEATING_UP",
        headline: `${m.symbol} ${heat.band}`,
        detail: `${m.trades} trades, ${m.uniqueBuyers} unique buyers, ${usd(m.windowVolumeQuote, { compact: true })} through the pool in the window.`,
        symbol: m.symbol,
        at: Date.now(),
        blockNumber: snapshot.block.to,
        txHash: null,
        severity: heat.band === "MELTING" ? "HIGH" : "MEDIUM",
      });
    }
    if (m.liquidityQuote > 0 && m.liquidityQuote < 10_000 && m.trades > 20) {
      events.push({
        id: `thin-${m.id}-${snapshot.block.to}`,
        kind: "LIQUIDITY_DRAIN",
        headline: `${m.symbol} THINNING`,
        detail: `${m.trades} trades against ${usd(m.liquidityQuote, { compact: true })} of inventory. The book cannot absorb size.`,
        symbol: m.symbol,
        at: Date.now(),
        blockNumber: snapshot.block.to,
        txHash: null,
        severity: "MEDIUM",
      });
    }
  }

  for (const p of newPools.slice(0, 12)) {
    events.push({
      id: `new-${p.pool}`,
      kind: "NEW_MARKET",
      headline: "NEW ON THE TAPE",
      detail: `Pool ${p.pool.slice(0, 10)}… created in block ${p.block.toLocaleString()} by the V3 factory.`,
      symbol: null,
      at: Date.now() - (snapshot.block.to - p.block) * snapshot.chain.blockTimeSec * 1000,
      blockNumber: p.block,
      txHash: null,
      severity: "LOW",
    });
  }

  return events.sort((a, b) => b.at - a.at).slice(0, 80);
}
