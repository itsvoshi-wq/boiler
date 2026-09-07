import { describe, expect, it } from "vitest";
import { buildTrackRecord, digestOf, resolveCall } from "@/lib/domain/performance";
import { deskScore, rankFor, sortDesks } from "@/lib/domain/ranking";
import type { VerifiedCall } from "@/lib/domain/types";

function call(partial: Partial<VerifiedCall> = {}): VerifiedCall {
  const publishedAt = Date.UTC(2026, 0, 1);
  return {
    id: "c1",
    deskSlug: "d",
    symbol: "SPY",
    direction: "LONG",
    entryReference: 100,
    entryBlock: 1,
    publishedAt,
    expiresAt: null,
    status: "LIVE",
    closedAt: null,
    closeReference: null,
    versions: [
      {
        version: 1,
        publishedAt,
        thesis: "t",
        target: 120,
        invalidation: 90,
        digest: digestOf("x"),
      },
    ],
    ...partial,
  };
}

describe("verified calls", () => {
  it("marks a call PINK SLIPPED when its published invalidation is hit", () => {
    const r = resolveCall(call(), 89);
    expect(r.status).toBe("PINK SLIPPED");
    expect(r.returnPct).toBeCloseTo(-11, 5);
  });

  it("keeps a call live between the invalidation and the target", () => {
    expect(resolveCall(call(), 110).status).toBe("LIVE");
  });

  it("inverts the maths for a short", () => {
    const r = resolveCall(call({ direction: "SHORT", versions: [{ ...call().versions[0], invalidation: 110, target: 80 }] }), 90);
    expect(r.returnPct).toBeCloseTo(10, 5);
    expect(r.status).toBe("LIVE");
  });

  it("pink slips a short when price runs through its invalidation", () => {
    const c = call({ direction: "SHORT", versions: [{ ...call().versions[0], invalidation: 110, target: 80 }] });
    expect(resolveCall(c, 111).status).toBe("PINK SLIPPED");
  });

  it("uses the frozen close reference for a closed call, not the live mark", () => {
    const r = resolveCall(call({ status: "CLOSED", closeReference: 130 }), 5);
    expect(r.returnPct).toBeCloseTo(30, 5);
    expect(r.markPrice).toBe(130);
  });

  it("refuses to invent a return when there is no market read", () => {
    const r = resolveCall(call(), null);
    expect(r.returnPct).toBeNull();
  });

  it("expires a call that ran past its published expiry", () => {
    const r = resolveCall(call({ expiresAt: Date.UTC(2026, 0, 2) }), 105, Date.UTC(2026, 0, 3));
    expect(r.status).toBe("EXPIRED");
  });

  it("digest changes when the content changes, so an edit cannot be silent", () => {
    expect(digestOf("thesis a")).not.toBe(digestOf("thesis b"));
    expect(digestOf("thesis a")).toBe(digestOf("thesis a"));
  });
});

describe("track record", () => {
  const results = [10, -5, 30, -20, 8].map((ret, i) =>
    resolveCall(call({ id: `c${i}`, status: "CLOSED", closeReference: 100 * (1 + ret / 100) }), null),
  );

  it("reports median ahead of mean and both are real", () => {
    const t = buildTrackRecord(results, Date.UTC(2026, 0, 1), Date.UTC(2026, 6, 1));
    expect(t.closed).toBe(5);
    expect(t.medianReturnPct).toBeCloseTo(8, 5);
    expect(t.maxDrawdownPct).toBeCloseTo(-20, 5);
    expect(t.hitRate).toBeCloseTo(3 / 5, 5);
  });

  it("returns nulls rather than zeros when there is nothing resolved", () => {
    const t = buildTrackRecord([], Date.UTC(2026, 0, 1));
    expect(t.medianReturnPct).toBeNull();
    expect(t.hitRate).toBeNull();
  });
});

describe("ranking", () => {
  it("a single lucky call cannot outrank a long consistent record", () => {
    const lucky = buildTrackRecord(
      [resolveCall(call({ status: "CLOSED", closeReference: 1000 }), null)],
      Date.UTC(2026, 7, 1),
      Date.UTC(2026, 8, 1),
    );
    const steady = buildTrackRecord(
      Array.from({ length: 25 }, (_, i) =>
        resolveCall(call({ id: `s${i}`, status: "CLOSED", closeReference: 106 }), null),
      ),
      Date.UTC(2025, 6, 1),
      Date.UTC(2026, 8, 1),
    );
    expect(deskScore(steady)).toBeGreaterThan(deskScore(lucky));
  });

  it("keeps a desk at INTERN until it has a credible sample", () => {
    const thin = buildTrackRecord(
      [resolveCall(call({ status: "CLOSED", closeReference: 300 }), null)],
      Date.now() - 86_400_000,
    );
    expect(rankFor(thin, 100_000)).toBe("INTERN");
  });

  it("boards that need a sample exclude desks that do not have one", () => {
    const thin = buildTrackRecord([resolveCall(call({ status: "CLOSED", closeReference: 150 }), null)], Date.UTC(2026, 0, 1));
    const rows = [
      {
        desk: {
          slug: "thin",
          name: "T",
          operator: "0x0",
          mandate: "m",
          liveSince: 0,
          followers: 1,
          followedCapitalQuote: 1,
          creatorFeeBps: 1,
          rank: "INTERN" as const,
          bio: "",
          universe: [],
        },
        track: thin,
        score: deskScore(thin),
        forks: 0,
      },
    ];
    expect(sortDesks("most-consistent", rows)).toHaveLength(0);
    expect(sortDesks("most-followed", rows)).toHaveLength(1);
  });
});
