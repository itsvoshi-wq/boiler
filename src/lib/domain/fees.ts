import type { Provenance } from "./provenance";

/**
 * FeeController.
 *
 * Nothing here is hardcoded into a component. Final economics are not approved,
 * so the numbers live in one configurable place, they are bounded, and every
 * quote prints them before a user signs anything.
 */

export type FeeConfig = {
  /** BOILER's own take on a swap, in basis points. */
  protocolSwapBps: number;
  /** What a Desk may add on top when a trade is routed through it. */
  creatorSwapBps: { min: number; default: number; max: number };
  /** Broker share OF THE PROTOCOL FEE. Never an extra charge on the user. */
  brokerShareOfProtocolBps: number;
  /** Charged per automated action, not per market move. */
  automationActionBps: number;
  strategyExecutionBps: number;
};

export const DEFAULT_FEES: FeeConfig = {
  protocolSwapBps: 25,
  creatorSwapBps: { min: 0, default: 10, max: 50 },
  brokerShareOfProtocolBps: 2000, // 20% of the protocol fee
  automationActionBps: 5,
  strategyExecutionBps: 10,
};

export const FEE_HARD_CAP_BPS = 100; // 1.00% total, protocol + creator, enforced

export type FeeQuote = {
  notional: number;
  poolFeeBps: number;
  protocolBps: number;
  creatorBps: number;
  totalBps: number;
  poolFee: number;
  protocolFee: number;
  creatorFee: number;
  brokerFee: number;
  totalFee: number;
  netNotional: number;
  capped: boolean;
  provenance: Provenance;
};

export function clampCreatorBps(requested: number, cfg: FeeConfig = DEFAULT_FEES): number {
  if (!Number.isFinite(requested)) return cfg.creatorSwapBps.default;
  return Math.min(cfg.creatorSwapBps.max, Math.max(cfg.creatorSwapBps.min, Math.round(requested)));
}

export function quoteFees(args: {
  notional: number;
  poolFeePips: number;
  creatorBps?: number;
  hasBroker?: boolean;
  cfg?: FeeConfig;
}): FeeQuote {
  const cfg = args.cfg ?? DEFAULT_FEES;
  const notional = Math.max(0, args.notional);
  const poolFeeBps = args.poolFeePips / 100;
  const creatorBpsRaw = clampCreatorBps(args.creatorBps ?? 0, cfg);

  let protocolBps = cfg.protocolSwapBps;
  let creatorBps = creatorBpsRaw;
  let capped = false;
  if (protocolBps + creatorBps > FEE_HARD_CAP_BPS) {
    capped = true;
    creatorBps = Math.max(0, FEE_HARD_CAP_BPS - protocolBps);
    if (protocolBps > FEE_HARD_CAP_BPS) protocolBps = FEE_HARD_CAP_BPS;
  }

  const poolFee = (notional * poolFeeBps) / 10_000;
  const protocolFee = (notional * protocolBps) / 10_000;
  const creatorFee = (notional * creatorBps) / 10_000;
  const brokerFee = args.hasBroker ? (protocolFee * cfg.brokerShareOfProtocolBps) / 10_000 : 0;
  const totalFee = poolFee + protocolFee + creatorFee;

  return {
    notional,
    poolFeeBps,
    protocolBps,
    creatorBps,
    totalBps: poolFeeBps + protocolBps + creatorBps,
    poolFee,
    protocolFee,
    creatorFee,
    brokerFee,
    totalFee,
    netNotional: notional - totalFee,
    capped,
    provenance: {
      source: "CONFIG",
      method: `poolFee=${poolFeeBps}bps (Uniswap V3 tier, paid to LPs) + protocol=${protocolBps}bps + creator=${creatorBps}bps, total capped at ${FEE_HARD_CAP_BPS}bps`,
      updatedAt: Date.now(),
    },
  };
}

/**
 * Protocol fees are NOT being collected. No BOILER contract is deployed. This
 * function exists so The Books can show what the configured model would have
 * produced on activity that actually happened, labelled MODELLED, never as
 * revenue.
 */
export function modelledProtocolTake(observedVolumeUsd: number, cfg: FeeConfig = DEFAULT_FEES) {
  return {
    volume: observedVolumeUsd,
    protocol: (observedVolumeUsd * cfg.protocolSwapBps) / 10_000,
    creator: (observedVolumeUsd * cfg.creatorSwapBps.default) / 10_000,
    realised: 0,
  };
}
