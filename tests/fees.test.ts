import { describe, expect, it } from "vitest";
import { DEFAULT_FEES, FEE_HARD_CAP_BPS, clampCreatorBps, modelledProtocolTake, quoteFees } from "@/lib/domain/fees";

describe("FeeController", () => {
  it("itemises pool, protocol and creator fees separately", () => {
    const q = quoteFees({ notional: 10_000, poolFeePips: 500, creatorBps: 10 });
    expect(q.poolFee).toBeCloseTo(5, 6); // 0.05% of 10k
    expect(q.protocolFee).toBeCloseTo(25, 6); // 25 bps
    expect(q.creatorFee).toBeCloseTo(10, 6); // 10 bps
    expect(q.totalFee).toBeCloseTo(40, 6);
    expect(q.netNotional).toBeCloseTo(9_960, 6);
  });

  it("clamps a desk fee to the configured maximum", () => {
    expect(clampCreatorBps(9_999)).toBe(DEFAULT_FEES.creatorSwapBps.max);
    expect(clampCreatorBps(-5)).toBe(DEFAULT_FEES.creatorSwapBps.min);
    expect(clampCreatorBps(Number.NaN)).toBe(DEFAULT_FEES.creatorSwapBps.default);
  });

  it("never lets protocol plus creator exceed the hard cap", () => {
    const q = quoteFees({ notional: 1_000, poolFeePips: 3000, creatorBps: 50 });
    expect(q.protocolBps + q.creatorBps).toBeLessThanOrEqual(FEE_HARD_CAP_BPS);
  });

  it("takes the broker share out of the protocol fee, not out of the user", () => {
    const withBroker = quoteFees({ notional: 100_000, poolFeePips: 500, hasBroker: true });
    const without = quoteFees({ notional: 100_000, poolFeePips: 500, hasBroker: false });
    expect(withBroker.totalFee).toBeCloseTo(without.totalFee, 9);
    expect(withBroker.brokerFee).toBeCloseTo(withBroker.protocolFee * 0.2, 6);
    expect(without.brokerFee).toBe(0);
  });

  it("reports zero realised revenue no matter how much volume is modelled", () => {
    expect(modelledProtocolTake(50_000_000).realised).toBe(0);
  });

  it("treats a zero notional as zero fees rather than NaN", () => {
    const q = quoteFees({ notional: 0, poolFeePips: 10_000, creatorBps: 50 });
    expect(q.totalFee).toBe(0);
    expect(Number.isNaN(q.netNotional)).toBe(false);
  });
});
