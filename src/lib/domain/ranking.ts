import type { TrackRecord } from "./performance";
import type { CreatorRank, Desk } from "./types";

/**
 * Leaderboard methodology.
 *
 * Ranking by absolute return is how you build a product that rewards the one
 * guy who put everything on a meme and got lucky. BOILER ranks a blend that
 * cannot be won by recklessness alone, and prints the blend on the page.
 */

export const RANK_WEIGHTS = {
  median: 0.35,
  consistency: 0.2,
  drawdown: 0.2,
  sample: 0.15,
  age: 0.1,
} as const;

export const RANK_METHOD =
  "SCORE = 0.35 median resolved return (capped at +50%) + 0.20 consistency + 0.20 drawdown control + 0.15 sample size (log scaled, 30 calls saturates) + 0.10 track record age (180 days saturates). Absolute return is deliberately capped so a single lucky call cannot buy the top spot.";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function deskScore(track: TrackRecord): number {
  if (track.closed === 0) return 0;
  const median = clamp01(((track.medianReturnPct ?? 0) + 20) / 70); // -20% -> 0, +50% -> 1
  const consistency = clamp01(track.consistency ?? 0);
  const drawdown = clamp01(1 - Math.abs(track.maxDrawdownPct ?? 0) / 60);
  const sample = clamp01(Math.log10(1 + track.closed) / Math.log10(31));
  const age = clamp01(track.ageDays / 180);
  return (
    (RANK_WEIGHTS.median * median +
      RANK_WEIGHTS.consistency * consistency +
      RANK_WEIGHTS.drawdown * drawdown +
      RANK_WEIGHTS.sample * sample +
      RANK_WEIGHTS.age * age) *
    100
  );
}

/**
 * Rank progression is career shaped, and deliberately does not reward trading
 * frequency. You cannot grind your way to WOLF by spamming calls.
 */
export function rankFor(track: TrackRecord, followers: number): CreatorRank {
  const score = deskScore(track);
  const credible = track.closed >= 5 && track.ageDays >= 7;
  if (!credible) return "INTERN";
  if (score >= 78 && track.closed >= 40 && followers >= 5000) return "WOLF";
  if (score >= 70 && track.closed >= 25) return "MANAGING DIRECTOR";
  if (score >= 62 && track.closed >= 18) return "DIRECTOR";
  if (score >= 54 && track.closed >= 12) return "VP";
  if (score >= 46) return "SENIOR BROKER";
  return "BROKER";
}

export type LeaderboardKey =
  | "top-desks"
  | "most-consistent"
  | "lowest-drawdown"
  | "most-followed"
  | "followed-capital"
  | "most-forked";

export const LEADERBOARDS: { key: LeaderboardKey; title: string; rule: string }[] = [
  { key: "top-desks", title: "TOP DESKS", rule: RANK_METHOD },
  {
    key: "most-consistent",
    title: "MOST CONSISTENT",
    rule: "Ranked by 1 minus the coefficient of variation of resolved returns. Minimum 5 resolved calls.",
  },
  {
    key: "lowest-drawdown",
    title: "LOWEST DRAWDOWN",
    rule: "Ranked by the smallest worst-single-call loss. Minimum 5 resolved calls, so a one call desk cannot sit at the top.",
  },
  { key: "most-followed", title: "MOST FOLLOWED", rule: "Raw follower count. A popularity number, and labelled as one." },
  {
    key: "followed-capital",
    title: "HIGHEST FOLLOWED CAPITAL",
    rule: "Self-custodied capital that has opted into a desk. Capital never leaves the user's wallet.",
  },
  { key: "most-forked", title: "MOST FORKED STRATEGY", rule: "Count of published forks of a desk's strategies." },
];

export type RankableRow = { desk: Desk; track: TrackRecord; score: number; forks: number };

export function sortDesks<T extends RankableRow>(key: LeaderboardKey, rows: T[]): T[] {
  const withSample = rows.filter((r) => r.track.closed >= 5);
  switch (key) {
    case "most-consistent":
      return [...withSample].sort((a, b) => (b.track.consistency ?? 0) - (a.track.consistency ?? 0));
    case "lowest-drawdown":
      return [...withSample].sort(
        (a, b) => Math.abs(a.track.maxDrawdownPct ?? 999) - Math.abs(b.track.maxDrawdownPct ?? 999),
      );
    case "most-followed":
      return [...rows].sort((a, b) => b.desk.followers - a.desk.followers);
    case "followed-capital":
      return [...rows].sort((a, b) => b.desk.followedCapitalQuote - a.desk.followedCapitalQuote);
    case "most-forked":
      return [...rows].sort((a, b) => b.forks - a.forks);
    default:
      return [...rows].sort((a, b) => b.score - a.score);
  }
}
