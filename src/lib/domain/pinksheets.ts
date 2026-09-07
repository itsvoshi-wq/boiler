import { computeHeat } from "./heat";
import type { Market } from "./types";

/**
 * PINK SHEETS ranking.
 *
 * Deliberately NOT "sort by price increase". A board that ranks by green candle
 * is a board that pays people to pump. Every section below is a published,
 * inspectable rule.
 */

export type PinkSection = {
  key: string;
  title: string;
  rule: string;
  pick: (markets: Market[], windowSeconds: number) => Market[];
};

const byVolume = (a: Market, b: Market) => b.windowVolumeQuote - a.windowVolumeQuote;

export const PINK_SECTIONS: PinkSection[] = [
  {
    key: "hot",
    title: "HOT",
    rule: "Ranked by composite HEAT, which is activity based, not price based.",
    pick: (m, w) =>
      [...m]
        .map((x) => ({ x, h: computeHeat(x, w).score }))
        .sort((a, b) => b.h - a.h)
        .map((r) => r.x),
  },
  {
    key: "most-active",
    title: "MOST ACTIVE",
    rule: "Ranked by decoded swap count in the window. One trade, one count, no weighting.",
    pick: (m) => [...m].sort((a, b) => b.trades - a.trades),
  },
  {
    key: "high-beta",
    title: "HIGH BETA",
    rule: "Absolute price move in the window, floored at 50 trades so a single fill cannot top the board.",
    pick: (m) =>
      [...m]
        .filter((x) => x.trades >= 5)
        .sort((a, b) => Math.abs(b.priceChangePct) - Math.abs(a.priceChangePct)),
  },
  {
    key: "liquidity",
    title: "LIQUIDITY MOVERS",
    rule: "Window volume divided by pool inventory. Measures how hard the book is being worked.",
    pick: (m) =>
      [...m].sort(
        (a, b) =>
          (b.liquidityQuote > 0 ? b.windowVolumeQuote / b.liquidityQuote : 0) -
          (a.liquidityQuote > 0 ? a.windowVolumeQuote / a.liquidityQuote : 0),
      ),
  },
  {
    key: "equities",
    title: "TOKENIZED EQUITIES",
    rule: "Tokens whose onchain name marks them as issued equity exposure. Volume ranked.",
    pick: (m) => m.filter((x) => x.assetClass === "TOKENIZED_EQUITY").sort(byVolume),
  },
  {
    key: "memes",
    title: "MEMES",
    rule: "Classified by name and symbol shape. Volume ranked. Read the risk flags first.",
    pick: (m) => m.filter((x) => x.assetClass === "MEME").sort(byVolume),
  },
  {
    key: "alts",
    title: "ALTCOINS",
    rule: "Everything not equity, not stable, not a major. Volume ranked.",
    pick: (m) => m.filter((x) => x.assetClass === "ALTCOIN").sort(byVolume),
  },
  {
    key: "crypto",
    title: "CRYPTO",
    rule: "Majors with an established market off this chain. Volume ranked.",
    pick: (m) => m.filter((x) => x.assetClass === "CRYPTO").sort(byVolume),
  },
  {
    key: "thin",
    title: "THIN ICE",
    rule: "Under $25k of pool inventory but still trading. Shown because hiding it would be the dishonest option.",
    pick: (m) => m.filter((x) => x.liquidityQuote < 25_000 && x.trades > 0).sort(byVolume),
  },
];

export function sectionByKey(key: string) {
  return PINK_SECTIONS.find((s) => s.key === key) ?? PINK_SECTIONS[0];
}
