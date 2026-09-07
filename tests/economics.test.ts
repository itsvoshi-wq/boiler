import { describe, expect, it } from "vitest";
import { DEFAULT_ALLOCATION, routeRevenue, validateAllocation } from "@/lib/domain/revenue";
import { TIERS, effectiveProtocolBps, tierFor } from "@/lib/domain/staking";
import { DEFAULT_FEES } from "@/lib/domain/fees";
import { PINK_SECTIONS } from "@/lib/domain/pinksheets";
import { riskFlags, worstSeverity } from "@/lib/domain/risk";
import type { Market } from "@/lib/domain/types";

const market = (over: Partial<Market> = {}): Market => ({
  id: "0xp",
  symbol: "X",
  base: { address: "0xa", symbol: "X", name: "X", decimals: 18, assetClass: "MEME", wrapperDisclosure: null },
  quote: { address: "0xb", symbol: "USDG", name: "Global Dollar", decimals: 6, assetClass: "STABLE", wrapperDisclosure: null },
  pool: { address: "0xp", token0: "0xa", token1: "0xb", feePips: 3000, sqrtPriceX96: "1", liquidity: "1", tick: 0, reserve0: "0", reserve1: "0" },
  price: 1,
  priceChangePct: 0,
  windowVolumeQuote: 1000,
  liquidityQuote: 1_000_000,
  trades: 10,
  uniqueBuyers: 5,
  uniqueSellers: 5,
  largestTradeQuote: 100,
  spreadBps: 30,
  assetClass: "MEME",
  firstSeenBlock: -1,
  isNew: false,
  ...over,
});

describe("RevenueRouter", () => {
  it("the default allocation totals exactly 10000 bps", () => {
    expect(validateAllocation(DEFAULT_ALLOCATION)).toMatchObject({ ok: true, total: 10_000 });
  });

  it("rejects an allocation that does not total 10000", () => {
    const bad = [...DEFAULT_ALLOCATION.slice(1)];
    expect(validateAllocation(bad).ok).toBe(false);
  });

  it("rejects staker distribution while the flag is off", () => {
    const withStakers = [
      { destination: "STAKER_DISTRIBUTION" as const, bps: 10_000, note: "" },
    ];
    expect(validateAllocation(withStakers).ok).toBe(false);
  });

  it("routes an amount without losing or inventing money", () => {
    const routed = routeRevenue(1_000);
    const sum = routed.reduce((a, b) => a + b.amount, 0);
    expect(sum).toBeCloseTo(1_000, 9);
  });

  it("routing zero revenue produces zero everywhere", () => {
    expect(routeRevenue(0).every((r) => r.amount === 0)).toBe(true);
  });
});

describe("staking tiers", () => {
  it("picks the highest tier the stake qualifies for", () => {
    expect(tierFor(0).key).toBe("FLOOR");
    expect(tierFor(25_000).key).toBe("DESK");
    expect(tierFor(24_999).key).toBe("FLOOR");
    expect(tierFor(50_000_000).key).toBe("HOUSE");
  });

  it("discounts never take the protocol fee below zero", () => {
    for (const t of TIERS) {
      expect(effectiveProtocolBps(DEFAULT_FEES.protocolSwapBps, t.minStake)).toBeGreaterThanOrEqual(0);
    }
  });

  it("higher tiers keep a bigger share of desk fees", () => {
    const splits = TIERS.map((t) => t.deskFeeSplitPct);
    expect([...splits].sort((a, b) => a - b)).toEqual(splits);
  });
});

describe("pink sheet ranking", () => {
  const markets = [
    market({ id: "1", symbol: "A", priceChangePct: 900, trades: 1, windowVolumeQuote: 5 }),
    market({ id: "2", symbol: "B", priceChangePct: 3, trades: 500, windowVolumeQuote: 500_000 }),
  ];

  it("HOT is not won by the biggest green candle on one trade", () => {
    const hot = PINK_SECTIONS[0].pick(markets, 300);
    expect(hot[0].symbol).toBe("B");
  });

  it("HIGH BETA still floors on trade count", () => {
    const beta = PINK_SECTIONS.find((s) => s.key === "high-beta")!.pick(markets, 300);
    expect(beta.find((m) => m.symbol === "A")).toBeUndefined();
  });

  it("every section publishes a rule", () => {
    for (const s of PINK_SECTIONS) expect(s.rule.length).toBeGreaterThan(20);
  });
});

describe("risk flags", () => {
  it("stops on a nearly empty pool", () => {
    const flags = riskFlags(market({ liquidityQuote: 1_000 }), 1_000_000);
    expect(worstSeverity(flags)).toBe("STOP");
  });

  it("warns on a market that is only a few hands", () => {
    const flags = riskFlags(market({ trades: 40, uniqueBuyers: 1, uniqueSellers: 1 }), 10_000_000);
    expect(flags.some((f) => f.code === "HIGH_CONCENTRATION")).toBe(true);
  });

  it("always discloses tokenized equity wrappers", () => {
    const flags = riskFlags(
      market({
        base: {
          address: "0xa",
          symbol: "NVDA",
          name: "NVIDIA • Robinhood Token",
          decimals: 18,
          assetClass: "TOKENIZED_EQUITY",
          wrapperDisclosure: "Tokenized exposure, not a legal share.",
        },
      }),
      10_000_000,
    );
    expect(flags.some((f) => f.code === "WRAPPED_EQUITY")).toBe(true);
  });

  it("does not call a market NEW when its listing age is simply unknown", () => {
    const flags = riskFlags(market({ firstSeenBlock: -1, liquidityQuote: 5_000_000 }), 10_000_000);
    expect(flags.some((f) => f.code === "NEW_MARKET")).toBe(false);
  });

  it("does call a market NEW when the factory says the pool is recent", () => {
    const flags = riskFlags(market({ firstSeenBlock: 9_950_000, liquidityQuote: 5_000_000 }), 10_000_000);
    expect(flags.some((f) => f.code === "NEW_MARKET")).toBe(true);
  });

  it("a deep, old, calm market raises nothing alarming", () => {
    const flags = riskFlags(market({ liquidityQuote: 5_000_000, firstSeenBlock: -1, spreadBps: 5 }), 300_000);
    expect(worstSeverity(flags)).not.toBe("STOP");
  });
});
