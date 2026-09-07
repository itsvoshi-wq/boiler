import { digestOf } from "../domain/performance";
import type { CallVersion, Desk, Strategy, VerifiedCall } from "../domain/types";

/**
 * SEEDED CREATOR CONTENT.
 *
 * There are no real BOILER desks yet, so these exist to make the creator layer
 * inspectable rather than an empty page. They are flagged DEMO everywhere they
 * render. The important part is what is NOT faked: live call performance is
 * computed against real Robinhood Chain prices, and the historical block below
 * is explicitly labelled as demo history rather than dressed up as a record.
 */

export const SEED_DESKS: Desk[] = [
  {
    slug: "nero",
    name: "NERO'S DESK",
    operator: "0x0000000000000000000000000000000000000000",
    mandate: "SPECIAL SITUATIONS / HIGH BETA",
    liveSince: Date.UTC(2026, 3, 18),
    followers: 8420,
    followedCapitalQuote: 4_180_000,
    creatorFeeBps: 12,
    rank: "DIRECTOR",
    bio: "Runs tokenized equity dislocations against the crypto tape. Publishes invalidation before entry, every time.",
    universe: ["SPY", "NVDA", "TSLA", "WETH"],
  },
  {
    slug: "the-cage",
    name: "THE CAGE",
    operator: "0x0000000000000000000000000000000000000000",
    mandate: "MEME FLOW / THIN BOOKS",
    liveSince: Date.UTC(2026, 5, 2),
    followers: 3160,
    followedCapitalQuote: 610_000,
    creatorFeeBps: 25,
    rank: "SENIOR BROKER",
    bio: "Trades the bottom of the sheet. Says out loud that most of it goes to zero.",
    universe: ["MEME", "MCAT", "PONS", "NTB"],
  },
  {
    slug: "graybar",
    name: "GRAYBAR CAPITAL",
    operator: "0x0000000000000000000000000000000000000000",
    mandate: "LIQUIDITY / MARKET STRUCTURE",
    liveSince: Date.UTC(2025, 11, 9),
    followers: 12_940,
    followedCapitalQuote: 9_450_000,
    creatorFeeBps: 8,
    rank: "MANAGING DIRECTOR",
    bio: "Boring on purpose. Sizes to inventory, not to conviction. Lowest drawdown on the floor.",
    universe: ["WETH", "SPY", "USDG", "XMR"],
  },
  {
    slug: "pit-boss",
    name: "PIT BOSS",
    operator: "0x0000000000000000000000000000000000000000",
    mandate: "MOMENTUM / TAPE READING",
    liveSince: Date.UTC(2026, 6, 21),
    followers: 1105,
    followedCapitalQuote: 88_000,
    creatorFeeBps: 30,
    rank: "BROKER",
    bio: "Fast in, fast out. Track record is short and says so.",
    universe: ["GME", "TSLA", "MEME"],
  },
];

function version(v: number, publishedAt: number, thesis: string, target: number | null, invalidation: number | null): CallVersion {
  return {
    version: v,
    publishedAt,
    thesis,
    target,
    invalidation,
    digest: digestOf(`${v}|${publishedAt}|${thesis}|${target}|${invalidation}`),
  };
}

/**
 * Demo history. Fixed entry and close references, never recomputed, so the
 * numbers cannot drift into looking better than they were. This block is what
 * feeds the ranking maths, and every surface that uses it says DEMO HISTORY.
 */
export const SEED_CLOSED_CALLS: VerifiedCall[] = [
  mk("nero", "SPY", "LONG", 641.2, 688.4, "CLOSED", 62, "Index dislocation against the crypto tape.", 700, 610),
  mk("nero", "NVDA", "LONG", 128.4, 141.9, "CLOSED", 55, "Supply constraint priced as demand collapse.", 150, 118),
  mk("nero", "TSLA", "SHORT", 402.1, 366.4, "CLOSED", 47, "Delivery guide unreachable at this multiple.", 350, 430),
  mk("nero", "MEME", "LONG", 0.121, 0.0784, "PINK SLIPPED", 41, "Bought the flow, flow left.", 0.2, 0.09),
  mk("nero", "WETH", "LONG", 2288, 2461, "CLOSED", 33, "Gas floor holding, chain activity climbing.", 2600, 2150),
  mk("nero", "GME", "LONG", 22.4, 19.1, "PINK SLIPPED", 28, "Squeeze setup never showed up in the tape.", 30, 19.5),
  mk("nero", "SPY", "LONG", 705.6, 741.2, "CLOSED", 19, "Same trade, tighter stop.", 760, 690),
  mk("the-cage", "MEME", "LONG", 0.041, 0.129, "CLOSED", 58, "Thin book, one buyer, took the ride early.", 0.12, 0.03),
  mk("the-cage", "MCAT", "LONG", 0.0000121, 0.0000038, "PINK SLIPPED", 44, "It went to zero. It usually does.", 0.00003, 0.000008),
  mk("the-cage", "PONS", "LONG", 0.61, 0.94, "CLOSED", 36, "Liquidity arrived before the story did.", 1.1, 0.5),
  mk("the-cage", "NTB", "LONG", 0.0000000181, 0.0000000094, "PINK SLIPPED", 24, "No trader behind it. Name checks out.", 0.00000004, 0.00000001),
  mk("the-cage", "MEME", "SHORT", 0.184, 0.121, "CLOSED", 15, "Faded the second leg.", 0.1, 0.22),
  mk("graybar", "WETH", "LONG", 2104, 2288, "CLOSED", 190, "Sized to inventory, held through the chop.", 2400, 2000),
  mk("graybar", "SPY", "LONG", 598.4, 641.2, "CLOSED", 165, "Boring. Worked.", 660, 575),
  mk("graybar", "SPY", "LONG", 655.1, 668.9, "CLOSED", 121, "Half size into an untested tape.", 690, 640),
  mk("graybar", "XMR", "LONG", 141.2, 152.8, "CLOSED", 96, "Liquidity migration, not a narrative.", 165, 132),
  mk("graybar", "WETH", "SHORT", 2612, 2488, "CLOSED", 71, "Faded an unfunded move.", 2400, 2700),
  mk("graybar", "SPY", "LONG", 702.4, 698.1, "CLOSED", 44, "Flat. Published anyway.", 730, 680),
  mk("graybar", "NVDA", "LONG", 134.9, 148.2, "CLOSED", 22, "Same thesis, better entry.", 158, 126),
  mk("pit-boss", "GME", "LONG", 18.9, 21.4, "CLOSED", 12, "Momentum, nothing deeper.", 24, 17.5),
  mk("pit-boss", "TSLA", "LONG", 388.4, 361.2, "PINK SLIPPED", 9, "Chased. Paid for it.", 420, 365),
  mk("pit-boss", "MEME", "LONG", 0.094, 0.141, "CLOSED", 5, "In and out inside an hour.", 0.14, 0.08),
];

function mk(
  deskSlug: string,
  symbol: string,
  direction: "LONG" | "SHORT",
  entry: number,
  close: number,
  status: "CLOSED" | "PINK SLIPPED",
  daysAgo: number,
  thesis: string,
  target: number | null,
  invalidation: number | null,
): VerifiedCall {
  const publishedAt = Date.UTC(2026, 8, 7) - daysAgo * 86_400_000;
  return {
    id: `${deskSlug}-${symbol}-${daysAgo}`,
    deskSlug,
    symbol,
    direction,
    entryReference: entry,
    entryBlock: 0,
    publishedAt,
    expiresAt: null,
    status,
    closedAt: publishedAt + 3 * 86_400_000,
    closeReference: close,
    versions: [version(1, publishedAt, thesis, target, invalidation)],
  };
}

/**
 * Live call templates. The entry reference is anchored to the first price this
 * deployment actually observed for the symbol, never back-dated, so the return
 * shown is real market movement since a real timestamp.
 */
export const LIVE_CALL_TEMPLATES: {
  id: string;
  deskSlug: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  thesis: string;
  targetPct: number;
  invalidationPct: number;
}[] = [
  {
    id: "live-nero-spy",
    deskSlug: "nero",
    symbol: "SPY",
    direction: "LONG",
    thesis: "Index exposure onchain trades at a discount to the reference whenever the chain is busy. Taking the discount, not the index view.",
    targetPct: 4,
    invalidationPct: -2.5,
  },
  {
    id: "live-nero-nvda",
    deskSlug: "nero",
    symbol: "NVDA",
    direction: "LONG",
    thesis: "Onchain NVDA liquidity is thinner than the flow hitting it. Positioning ahead of the book deepening.",
    targetPct: 6,
    invalidationPct: -4,
  },
  {
    id: "live-cage-meme",
    deskSlug: "the-cage",
    symbol: "MEME",
    direction: "LONG",
    thesis: "Bottom of the sheet. Buying the tape, not the token. This one has a published exit and I will take it.",
    targetPct: 25,
    invalidationPct: -18,
  },
  {
    id: "live-graybar-weth",
    deskSlug: "graybar",
    symbol: "WETH",
    direction: "LONG",
    thesis: "Gas is paid in ETH on this chain and chain activity is rising. Structural bid, sized to pool inventory.",
    targetPct: 5,
    invalidationPct: -3,
  },
  {
    id: "live-pit-gme",
    deskSlug: "pit-boss",
    symbol: "GME",
    direction: "LONG",
    thesis: "Momentum only. If it stops going up I am out, and the invalidation is printed before the entry.",
    targetPct: 9,
    invalidationPct: -5,
  },
  {
    id: "live-cage-pons",
    deskSlug: "the-cage",
    symbol: "PONS",
    direction: "LONG",
    thesis: "Liquidity showed up before the story. That order is rare and usually worth a small position.",
    targetPct: 30,
    invalidationPct: -20,
  },
];

export const SEED_STRATEGIES: Strategy[] = [
  {
    id: "nero-high-beta",
    deskSlug: "nero",
    name: "NERO HIGH BETA",
    universe: ["SPY", "NVDA", "TSLA", "WETH", "MEME"],
    rules: {
      maxSingleAssetPct: 25,
      minLiquidityQuote: 100_000,
      rebalance: "WEEKLY",
      profitTargetPct: 18,
      maxDrawdownPct: 22,
    },
    version: 4,
    forks: 61,
    followers: 2140,
  },
  {
    id: "graybar-inventory",
    deskSlug: "graybar",
    name: "GRAYBAR INVENTORY WEIGHTED",
    universe: ["WETH", "SPY", "XMR"],
    rules: {
      maxSingleAssetPct: 40,
      minLiquidityQuote: 500_000,
      rebalance: "MONTHLY",
      profitTargetPct: null,
      maxDrawdownPct: 12,
    },
    version: 9,
    forks: 148,
    followers: 5310,
  },
  {
    id: "cage-bottom-sheet",
    deskSlug: "the-cage",
    name: "BOTTOM OF THE SHEET",
    universe: ["MEME", "MCAT", "PONS", "NTB"],
    rules: {
      maxSingleAssetPct: 10,
      minLiquidityQuote: 15_000,
      rebalance: "DAILY",
      profitTargetPct: 60,
      maxDrawdownPct: 45,
    },
    version: 2,
    forks: 27,
    followers: 890,
  },
];

export const BROKER_TIERS = [
  { tier: "RUNNER", minReferredVolume: 0, shareOfProtocolFeePct: 10 },
  { tier: "BROKER", minReferredVolume: 250_000, shareOfProtocolFeePct: 15 },
  { tier: "SENIOR BROKER", minReferredVolume: 2_500_000, shareOfProtocolFeePct: 20 },
  { tier: "PARTNER", minReferredVolume: 25_000_000, shareOfProtocolFeePct: 25 },
];
