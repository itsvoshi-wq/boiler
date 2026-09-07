import { describe, expect, it } from "vitest";
import { computeHeat, band } from "@/lib/domain/heat";
import type { Market } from "@/lib/domain/types";

const base: Market = {
  id: "0xpool",
  symbol: "TEST",
  base: {
    address: "0xa",
    symbol: "TEST",
    name: "Test",
    decimals: 18,
    assetClass: "ALTCOIN",
    wrapperDisclosure: null,
  },
  quote: {
    address: "0xb",
    symbol: "USDG",
    name: "Global Dollar",
    decimals: 6,
    assetClass: "STABLE",
    wrapperDisclosure: null,
  },
  pool: {
    address: "0xpool",
    token0: "0xa",
    token1: "0xb",
    feePips: 3000,
    sqrtPriceX96: "1",
    liquidity: "1",
    tick: 0,
    reserve0: "0",
    reserve1: "0",
  },
  price: 1,
  priceChangePct: 0,
  windowVolumeQuote: 0,
  liquidityQuote: 100_000,
  trades: 0,
  uniqueBuyers: 0,
  uniqueSellers: 0,
  largestTradeQuote: 0,
  spreadBps: 30,
  assetClass: "ALTCOIN",
  firstSeenBlock: 0,
  isNew: false,
};

describe("HEAT", () => {
  it("weights sum to one, so the score is bounded at 100", () => {
    const heat = computeHeat(
      { ...base, trades: 100_000, windowVolumeQuote: 10_000_000, uniqueBuyers: 5_000, priceChangePct: 90 },
      300,
    );
    const totalWeight = heat.components.reduce((a, c) => a + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 9);
    expect(heat.score).toBeLessThanOrEqual(100);
  });

  it("is zero-ish for a dead market", () => {
    const heat = computeHeat(base, 300);
    expect(heat.score).toBeLessThan(15);
    expect(heat.band).toBe("COLD");
  });

  it("always exposes every component so the score can be argued with", () => {
    const heat = computeHeat({ ...base, trades: 50 }, 300);
    expect(heat.components.map((c) => c.key)).toEqual([
      "tradesPerMinute",
      "volumePerLiquidity",
      "uniqueBuyers",
      "buyPressure",
      "priceRange",
    ]);
    for (const c of heat.components) expect(c.display).toBeTruthy();
  });

  it("does not divide by zero when liquidity is zero", () => {
    const heat = computeHeat({ ...base, liquidityQuote: 0, windowVolumeQuote: 1_000 }, 300);
    expect(Number.isFinite(heat.score)).toBe(true);
  });

  it("bands are monotone", () => {
    expect(band(0)).toBe("COLD");
    expect(band(20)).toBe("WARM");
    expect(band(40)).toBe("HEATING UP");
    expect(band(60)).toBe("HOT");
    expect(band(90)).toBe("MELTING");
  });
});
