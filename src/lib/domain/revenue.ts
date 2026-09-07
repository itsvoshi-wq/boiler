import { FLAGS } from "../flags";

/**
 * RevenueRouter, described in code before it exists in a contract.
 *
 * Allocation percentages are configuration, not a promise. Direct distribution
 * of protocol revenue to token holders is behind a feature flag and stays off
 * until it has been through legal review, because shipping that quietly is how
 * a protocol becomes a security with extra steps.
 */

export type RevenueDestination =
  | "TREASURY"
  | "BUYBACK"
  | "BURN"
  | "PROTOCOL_OWNED_LIQUIDITY"
  | "CREATOR_ECOSYSTEM"
  | "BROKER_PAYOUTS"
  | "STAKER_DISTRIBUTION";

export type Allocation = { destination: RevenueDestination; bps: number; note: string };

export const DEFAULT_ALLOCATION: Allocation[] = [
  { destination: "BUYBACK", bps: 3000, note: "Open market $BOIL purchases executed by the router." },
  { destination: "BURN", bps: 1000, note: "Purchased $BOIL sent to a burn address, transaction published." },
  { destination: "PROTOCOL_OWNED_LIQUIDITY", bps: 1500, note: "Liquidity the protocol owns and cannot rug." },
  { destination: "CREATOR_ECOSYSTEM", bps: 2000, note: "Paid to desks on top of their direct creator fees." },
  { destination: "BROKER_PAYOUTS", bps: 1000, note: "Broker share, disclosed at the point of referral." },
  { destination: "TREASURY", bps: 1500, note: "Operations, audits, market data, incident reserve." },
];

export const FLAGGED_ALLOCATION: Allocation = {
  destination: "STAKER_DISTRIBUTION",
  bps: 0,
  note: "Direct revenue distribution to stakers. Disabled. Requires legal review before any allocation is set above zero.",
};

export function validateAllocation(allocation: Allocation[]): { ok: boolean; total: number; error?: string } {
  const total = allocation.reduce((a, b) => a + b.bps, 0);
  if (total !== 10_000) return { ok: false, total, error: `Allocation must total 10000 bps, got ${total}.` };
  if (allocation.some((a) => a.bps < 0)) return { ok: false, total, error: "Negative allocation." };
  if (!FLAGS.stakerRevenueDistribution && allocation.some((a) => a.destination === "STAKER_DISTRIBUTION" && a.bps > 0)) {
    return { ok: false, total, error: "STAKER_DISTRIBUTION is feature flagged off." };
  }
  return { ok: true, total };
}

export function routeRevenue(amount: number, allocation: Allocation[] = DEFAULT_ALLOCATION) {
  const check = validateAllocation(allocation);
  if (!check.ok) throw new Error(check.error);
  return allocation.map((a) => ({ ...a, amount: (amount * a.bps) / 10_000 }));
}

export const REVENUE_STATE = {
  contractsDeployed: false,
  realisedRevenueUsd: 0,
  buybacksExecutedUsd: 0,
  boilBurned: 0,
  protocolOwnedLiquidityUsd: 0,
  treasuryUsd: 0,
  note:
    "No BOILER contract is deployed on Robinhood Chain. Realised protocol revenue is zero and every figure below that is not zero is explicitly MODELLED from observed market activity.",
} as const;
