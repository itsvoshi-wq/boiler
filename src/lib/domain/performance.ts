import type { CallResult, CallStatus, VerifiedCall } from "./types";

/**
 * Track records are derived, never entered.
 *
 * A Desk cannot type a number into its own performance panel. Every figure on
 * this page comes out of timestamped calls priced against the same market data
 * the rest of BOILER reads.
 */

export function digestOf(input: string): string {
  // FNV-1a. Small, deterministic, dependency free. It is a change detector, not
  // a security primitive, and it is labelled as such in the UI.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function resolveCall(call: VerifiedCall, markPrice: number | null, now = Date.now()): CallResult {
  const head = call.versions[call.versions.length - 1];
  const dir = call.direction === "LONG" ? 1 : -1;
  const ageMs = now - call.publishedAt;

  if (call.status === "CLOSED" && call.closeReference != null) {
    const ret = ((call.closeReference - call.entryReference) / call.entryReference) * 100 * dir;
    return {
      call,
      markPrice: call.closeReference,
      returnPct: ret,
      status: "CLOSED",
      ageMs,
      reason: "Closed by the desk at a timestamped reference price.",
    };
  }

  if (markPrice == null || !Number.isFinite(markPrice) || markPrice <= 0) {
    return {
      call,
      markPrice: null,
      returnPct: null,
      status: call.status,
      ageMs,
      reason: "No live market read for this symbol in the current scan window.",
    };
  }

  const ret = ((markPrice - call.entryReference) / call.entryReference) * 100 * dir;

  const invalidated =
    head?.invalidation != null &&
    (call.direction === "LONG" ? markPrice <= head.invalidation : markPrice >= head.invalidation);

  if (invalidated) {
    return {
      call,
      markPrice,
      returnPct: ret,
      status: "PINK SLIPPED",
      ageMs,
      reason: `Published invalidation ${head?.invalidation} was hit. The rule was written before the trade, not after.`,
    };
  }

  if (call.expiresAt != null && now > call.expiresAt) {
    return { call, markPrice, returnPct: ret, status: "EXPIRED", ageMs, reason: "Ran past its published expiry." };
  }

  const hitTarget =
    head?.target != null &&
    (call.direction === "LONG" ? markPrice >= head.target : markPrice <= head.target);

  return {
    call,
    markPrice,
    returnPct: ret,
    status: "LIVE",
    ageMs,
    reason: hitTarget ? "Trading through its published target, still open." : "Open against its published rules.",
  };
}

export type TrackRecord = {
  calls: number;
  live: number;
  closed: number;
  pinkSlipped: number;
  hitRate: number | null;
  medianReturnPct: number | null;
  meanReturnPct: number | null;
  maxDrawdownPct: number | null;
  bestPct: number | null;
  worstPct: number | null;
  ageDays: number;
  consistency: number | null;
  method: string;
};

export const TRACK_RECORD_METHOD =
  "Every resolved call contributes exactly one observation. Median is reported ahead of mean because one lucky meme should not carry a desk. Max drawdown is the worst single resolved call. Consistency is 1 minus the coefficient of variation of resolved returns, floored at 0.";

export function buildTrackRecord(results: CallResult[], liveSince: number, now = Date.now()): TrackRecord {
  const resolved = results.filter((r) => r.returnPct != null && r.status !== "LIVE");
  const returns = resolved.map((r) => r.returnPct as number).sort((a, b) => a - b);
  const ageDays = Math.max(0, (now - liveSince) / 86_400_000);

  if (returns.length === 0) {
    return {
      calls: results.length,
      live: results.filter((r) => r.status === "LIVE").length,
      closed: 0,
      pinkSlipped: 0,
      hitRate: null,
      medianReturnPct: null,
      meanReturnPct: null,
      maxDrawdownPct: null,
      bestPct: null,
      worstPct: null,
      ageDays,
      consistency: null,
      method: TRACK_RECORD_METHOD,
    };
  }

  const mid = Math.floor(returns.length / 2);
  const median =
    returns.length % 2 === 0 ? ((returns[mid - 1] ?? 0) + (returns[mid] ?? 0)) / 2 : (returns[mid] ?? 0);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length;
  const sd = Math.sqrt(variance);
  const cv = Math.abs(mean) > 1e-9 ? sd / Math.abs(mean) : Infinity;

  return {
    calls: results.length,
    live: results.filter((r) => r.status === "LIVE").length,
    closed: resolved.length,
    pinkSlipped: results.filter((r) => r.status === "PINK SLIPPED").length,
    hitRate: returns.filter((r) => r > 0).length / returns.length,
    medianReturnPct: median,
    meanReturnPct: mean,
    maxDrawdownPct: Math.min(...returns),
    bestPct: Math.max(...returns),
    worstPct: Math.min(...returns),
    ageDays,
    consistency: Number.isFinite(cv) ? Math.max(0, 1 - cv) : 0,
    method: TRACK_RECORD_METHOD,
  };
}

export function statusTone(status: CallStatus): "up" | "down" | "neutral" {
  if (status === "PINK SLIPPED" || status === "INVALIDATED") return "down";
  if (status === "CLOSED") return "neutral";
  return "up";
}
