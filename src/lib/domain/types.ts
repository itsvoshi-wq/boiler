import { z } from "zod";
import type { Provenance } from "./provenance";

/* ------------------------------------------------------------------ assets */

export const AssetClass = z.enum([
  "TOKENIZED_EQUITY",
  "CRYPTO",
  "ALTCOIN",
  "MEME",
  "STABLE",
  "UNKNOWN",
]);
export type AssetClass = z.infer<typeof AssetClass>;

export const AssetSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number().int().min(0).max(36),
  assetClass: AssetClass,
  /** Tokenized equity exposure is not legal share ownership. Say so, always. */
  wrapperDisclosure: z.string().nullable(),
});
export type Asset = z.infer<typeof AssetSchema>;

/* ----------------------------------------------------------------- markets */

export const PoolSchema = z.object({
  address: z.string(),
  token0: z.string(),
  token1: z.string(),
  feePips: z.number().int(),
  sqrtPriceX96: z.string(),
  liquidity: z.string(),
  tick: z.number().int(),
  reserve0: z.string(),
  reserve1: z.string(),
});
export type Pool = z.infer<typeof PoolSchema>;

export const MarketSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  base: AssetSchema,
  quote: AssetSchema,
  pool: PoolSchema,
  price: z.number(),
  priceChangePct: z.number(),
  windowVolumeQuote: z.number(),
  liquidityQuote: z.number(),
  trades: z.number().int(),
  uniqueBuyers: z.number().int(),
  uniqueSellers: z.number().int(),
  largestTradeQuote: z.number(),
  spreadBps: z.number(),
  assetClass: AssetClass,
  firstSeenBlock: z.number().int(),
  isNew: z.boolean(),
});
export type Market = z.infer<typeof MarketSchema>;

export const TradeSchema = z.object({
  marketId: z.string(),
  symbol: z.string(),
  side: z.enum(["BUY", "SELL"]),
  baseAmount: z.number(),
  quoteAmount: z.number(),
  price: z.number(),
  blockNumber: z.number().int(),
  txHash: z.string(),
  taker: z.string(),
  tag: z.enum(["BLOCK", "ORDINARY", "DUST"]),
});
export type Trade = z.infer<typeof TradeSchema>;

/* -------------------------------------------------------------------- heat */

export const HeatComponentSchema = z.object({
  key: z.string(),
  label: z.string(),
  raw: z.number(),
  display: z.string(),
  weight: z.number(),
  score: z.number(),
});
export type HeatComponent = z.infer<typeof HeatComponentSchema>;

export const HeatSchema = z.object({
  score: z.number(),
  band: z.enum(["COLD", "WARM", "HEATING UP", "HOT", "MELTING"]),
  components: z.array(HeatComponentSchema),
});
export type Heat = z.infer<typeof HeatSchema>;

/* ------------------------------------------------------------------- desks */

export const CreatorRank = z.enum([
  "INTERN",
  "BROKER",
  "SENIOR BROKER",
  "VP",
  "DIRECTOR",
  "MANAGING DIRECTOR",
  "WOLF",
]);
export type CreatorRank = z.infer<typeof CreatorRank>;

export const DeskSchema = z.object({
  slug: z.string(),
  name: z.string(),
  operator: z.string(),
  mandate: z.string(),
  liveSince: z.number(),
  followers: z.number().int(),
  followedCapitalQuote: z.number(),
  creatorFeeBps: z.number().int(),
  rank: CreatorRank,
  bio: z.string(),
  universe: z.array(z.string()),
});
export type Desk = z.infer<typeof DeskSchema>;

/* ---------------------------------------------------------- verified calls */

export const CallStatus = z.enum(["LIVE", "CLOSED", "INVALIDATED", "EXPIRED", "PINK SLIPPED"]);
export type CallStatus = z.infer<typeof CallStatus>;

export const CallVersionSchema = z.object({
  version: z.number().int(),
  publishedAt: z.number(),
  thesis: z.string(),
  target: z.number().nullable(),
  invalidation: z.number().nullable(),
  /** Content hash of the version, so edits are visible instead of silent. */
  digest: z.string(),
});
export type CallVersion = z.infer<typeof CallVersionSchema>;

export const VerifiedCallSchema = z.object({
  id: z.string(),
  deskSlug: z.string(),
  symbol: z.string(),
  direction: z.enum(["LONG", "SHORT"]),
  entryReference: z.number(),
  entryBlock: z.number().int(),
  publishedAt: z.number(),
  expiresAt: z.number().nullable(),
  status: CallStatus,
  closedAt: z.number().nullable(),
  closeReference: z.number().nullable(),
  versions: z.array(CallVersionSchema),
});
export type VerifiedCall = z.infer<typeof VerifiedCallSchema>;

export type CallResult = {
  call: VerifiedCall;
  markPrice: number | null;
  returnPct: number | null;
  status: CallStatus;
  ageMs: number;
  reason: string;
};

/* -------------------------------------------------------------- strategies */

export const StrategySchema = z.object({
  id: z.string(),
  deskSlug: z.string(),
  name: z.string(),
  universe: z.array(z.string()),
  rules: z.object({
    maxSingleAssetPct: z.number(),
    minLiquidityQuote: z.number(),
    rebalance: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    profitTargetPct: z.number().nullable(),
    maxDrawdownPct: z.number().nullable(),
  }),
  version: z.number().int(),
  forks: z.number().int(),
  followers: z.number().int(),
});
export type Strategy = z.infer<typeof StrategySchema>;

/* ------------------------------------------------------------------ street */

export const StreetEventKind = z.enum([
  "BLOCK_TRADE",
  "NEW_MARKET",
  "LIQUIDITY_SURGE",
  "LIQUIDITY_DRAIN",
  "HEATING_UP",
  "NEW_CALL",
  "CALL_CLOSED",
  "PINK_SLIPPED",
  "DESK_UPDATE",
]);
export type StreetEventKind = z.infer<typeof StreetEventKind>;

export const StreetEventSchema = z.object({
  id: z.string(),
  kind: StreetEventKind,
  headline: z.string(),
  detail: z.string(),
  symbol: z.string().nullable(),
  at: z.number(),
  blockNumber: z.number().int().nullable(),
  txHash: z.string().nullable(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
});
export type StreetEvent = z.infer<typeof StreetEventSchema>;

/* -------------------------------------------------------------- portfolios */

export type Position = {
  symbol: string;
  address: string;
  balance: number;
  price: number;
  valueQuote: number;
  assetClass: AssetClass;
};

/* ------------------------------------------------------------------- risk */

export type RiskFlag = {
  code:
    | "THIN_LIQUIDITY"
    | "NEW_MARKET"
    | "HIGH_CONCENTRATION"
    | "HIGH_VOLATILITY"
    | "UNVERIFIED_CONTRACT"
    | "WIDE_SPREAD"
    | "WRAPPED_EQUITY";
  label: string;
  detail: string;
  severity: "NOTE" | "WARN" | "STOP";
};

/* ------------------------------------------------------------- aggregates */

export type MarketSnapshot = {
  markets: Market[];
  trades: Trade[];
  block: { from: number; to: number; latest: number };
  windowSeconds: number;
  provenance: Provenance;
  chain: { id: number; blockNumber: number; gasPriceWei: string; blockTimeSec: number };
  degraded: boolean;
  degradedReason: string | null;
};
