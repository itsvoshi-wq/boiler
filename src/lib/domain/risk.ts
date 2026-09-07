import type { Market, RiskFlag } from "./types";

/**
 * The look can be savage. The warnings cannot.
 *
 * Every flag is derived from a real read and states the number that triggered
 * it, so nobody has to take BOILER's word for it.
 */
export function riskFlags(market: Market, latestBlock: number): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (market.liquidityQuote < 25_000) {
    flags.push({
      code: "THIN_LIQUIDITY",
      label: "THIN LIQUIDITY",
      detail: `Pool holds about $${Math.round(market.liquidityQuote).toLocaleString()} of inventory. Size in, and you are the price.`,
      severity: market.liquidityQuote < 5_000 ? "STOP" : "WARN",
    });
  }

  // firstSeenBlock is -1 when the pool was created before the PoolCreated window
  // BOILER scanned. That is "older than we looked", not "new", and saying NEW
  // there would be the exact kind of invented signal this product exists against.
  if (market.firstSeenBlock >= 0) {
    const ageBlocks = latestBlock - market.firstSeenBlock;
    flags.push({
      code: "NEW_MARKET",
      label: "NEW MARKET",
      detail: `Pool created ${ageBlocks.toLocaleString()} blocks ago, read from the factory's PoolCreated event. Short history, no track record, no assumptions.`,
      severity: "WARN",
    });
  }

  if (Math.abs(market.priceChangePct) > 10) {
    flags.push({
      code: "HIGH_VOLATILITY",
      label: "HIGH BETA",
      detail: `Moved ${market.priceChangePct.toFixed(2)}% inside the scan window. This cuts both ways.`,
      severity: "NOTE",
    });
  }

  const takers = market.uniqueBuyers + market.uniqueSellers;
  if (takers > 0 && takers <= 3 && market.trades >= 10) {
    flags.push({
      code: "HIGH_CONCENTRATION",
      label: "CONCENTRATED FLOW",
      detail: `${market.trades} trades from ${takers} distinct takers. This tape is a small number of hands.`,
      severity: "WARN",
    });
  }

  if (market.spreadBps >= 100) {
    flags.push({
      code: "WIDE_SPREAD",
      label: "WIDE FEE TIER",
      detail: `${(market.spreadBps / 100).toFixed(2)}% pool fee tier. Round trip costs you at least twice that.`,
      severity: "NOTE",
    });
  }

  if (market.base.wrapperDisclosure) {
    flags.push({
      code: "WRAPPED_EQUITY",
      label: "TOKENIZED EXPOSURE",
      detail: market.base.wrapperDisclosure,
      severity: "NOTE",
    });
  }

  return flags;
}

export function worstSeverity(flags: RiskFlag[]): "NONE" | "NOTE" | "WARN" | "STOP" {
  if (flags.some((f) => f.severity === "STOP")) return "STOP";
  if (flags.some((f) => f.severity === "WARN")) return "WARN";
  if (flags.length) return "NOTE";
  return "NONE";
}
