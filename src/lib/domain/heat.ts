import type { Heat, HeatComponent, Market } from "./types";

/**
 * HEAT is not a mystery score.
 *
 * Five components, fixed weights, every input readable off the same chain data
 * the rest of the page shows. The UI always renders the breakdown next to the
 * band, which is the whole point.
 */

const WEIGHTS = {
  tradesPerMinute: 0.3,
  volumePerLiquidity: 0.25,
  uniqueBuyers: 0.2,
  buyPressure: 0.15,
  priceRange: 0.1,
} as const;

const norm = (value: number, ceiling: number) =>
  ceiling <= 0 ? 0 : Math.max(0, Math.min(1, value / ceiling));

export function computeHeat(market: Market, windowSeconds: number): Heat {
  const minutes = Math.max(windowSeconds / 60, 1 / 60);
  const tpm = market.trades / minutes;
  const turnover = market.liquidityQuote > 0 ? market.windowVolumeQuote / market.liquidityQuote : 0;
  const takers = market.uniqueBuyers + market.uniqueSellers;
  const buyPressure = takers > 0 ? market.uniqueBuyers / takers : 0.5;
  const absMove = Math.abs(market.priceChangePct);

  const components: HeatComponent[] = [
    {
      key: "tradesPerMinute",
      label: "Trades / min",
      raw: tpm,
      display: `${tpm.toFixed(1)}/min`,
      weight: WEIGHTS.tradesPerMinute,
      score: norm(tpm, 40),
    },
    {
      key: "volumePerLiquidity",
      label: "Volume / liquidity",
      raw: turnover,
      display: `${(turnover * 100).toFixed(1)}%`,
      weight: WEIGHTS.volumePerLiquidity,
      score: norm(turnover, 0.5),
    },
    {
      key: "uniqueBuyers",
      label: "Unique buyers",
      raw: market.uniqueBuyers,
      display: `${market.uniqueBuyers}`,
      weight: WEIGHTS.uniqueBuyers,
      score: norm(market.uniqueBuyers, 40),
    },
    {
      key: "buyPressure",
      label: "Buy side share",
      raw: buyPressure,
      display: `${(buyPressure * 100).toFixed(0)}%`,
      weight: WEIGHTS.buyPressure,
      score: norm(Math.abs(buyPressure - 0.5) * 2, 1),
    },
    {
      key: "priceRange",
      label: "Move in window",
      raw: absMove,
      display: `${absMove.toFixed(2)}%`,
      weight: WEIGHTS.priceRange,
      score: norm(absMove, 8),
    },
  ];

  const score = components.reduce((acc, c) => acc + c.weight * c.score, 0) * 100;
  return { score, band: band(score), components };
}

export function band(score: number): Heat["band"] {
  if (score >= 75) return "MELTING";
  if (score >= 55) return "HOT";
  if (score >= 35) return "HEATING UP";
  if (score >= 15) return "WARM";
  return "COLD";
}

export const HEAT_METHOD =
  "HEAT = 0.30 trades/min + 0.25 volume/liquidity + 0.20 unique buyers + 0.15 buy-side skew + 0.10 absolute move, each normalised against a fixed ceiling, over the stated block window.";
