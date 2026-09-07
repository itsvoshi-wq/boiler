/**
 * $BOIL staking tiers.
 *
 * Utility first. There is no headline APR here on purpose: emissions dressed up
 * as yield is the oldest trick in the room BOILER is named after.
 */

export type TierKey = "FLOOR" | "DESK" | "PARTNER" | "HOUSE";

export type StakeTier = {
  key: TierKey;
  minStake: number;
  swapFeeDiscountBps: number;
  automationSlots: number;
  watchlists: number;
  deskFeeSplitPct: number;
  apiTier: "NONE" | "READ" | "PRO" | "INSTITUTIONAL";
  perks: string[];
};

export const TIERS: StakeTier[] = [
  {
    key: "FLOOR",
    minStake: 0,
    swapFeeDiscountBps: 0,
    automationSlots: 2,
    watchlists: 3,
    deskFeeSplitPct: 70,
    apiTier: "NONE",
    perks: ["Full market access", "Verified call feed", "The Books"],
  },
  {
    key: "DESK",
    minStake: 25_000,
    swapFeeDiscountBps: 5,
    automationSlots: 10,
    watchlists: 15,
    deskFeeSplitPct: 78,
    apiTier: "READ",
    perks: ["Open a Desk", "Publish verified calls", "Bracket and trailing automation"],
  },
  {
    key: "PARTNER",
    minStake: 250_000,
    swapFeeDiscountBps: 12,
    automationSlots: 40,
    watchlists: 50,
    deskFeeSplitPct: 85,
    apiTier: "PRO",
    perks: ["Publish strategies", "Strategy replication", "Priority tape and depth feeds"],
  },
  {
    key: "HOUSE",
    minStake: 2_000_000,
    swapFeeDiscountBps: 20,
    automationSlots: 250,
    watchlists: 250,
    deskFeeSplitPct: 90,
    apiTier: "INSTITUTIONAL",
    perks: ["Data and API keys", "Custom routing limits", "Broker programme access"],
  },
];

export function tierFor(stake: number): StakeTier {
  let current = TIERS[0];
  for (const t of TIERS) if (stake >= t.minStake) current = t;
  return current;
}

export function effectiveProtocolBps(baseBps: number, stake: number): number {
  return Math.max(0, baseBps - tierFor(stake).swapFeeDiscountBps);
}

export const STAKING_NOTE =
  "Staking buys capability, not yield. Tiers change what the product lets you do and what share of desk fees you keep. Any distribution of protocol revenue to stakers is feature flagged off pending legal review.";
