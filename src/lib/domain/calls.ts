import { LIVE_CALL_TEMPLATES, SEED_CLOSED_CALLS, SEED_DESKS } from "../data/desks";
import { getStore } from "../data/store";
import { buildTrackRecord, digestOf, resolveCall, type TrackRecord } from "./performance";
import { deskScore, rankFor } from "./ranking";
import type { CallResult, Desk, Market, VerifiedCall } from "./types";

/**
 * Live calls are anchored, not back-dated.
 *
 * The first time this deployment sees a price for a symbol, that price becomes
 * the call's entry reference and the anchor time is stored. From then on the
 * return is real market movement since a real, stated moment. Nothing is
 * recomputed to look better later, because the anchor is written once.
 */
export async function buildLiveCalls(markets: Market[], latestBlock: number): Promise<VerifiedCall[]> {
  const store = getStore();
  const bySymbol = new Map(markets.map((m) => [m.symbol.toUpperCase(), m]));
  const out: VerifiedCall[] = [];

  for (const tpl of LIVE_CALL_TEMPLATES) {
    const market = bySymbol.get(tpl.symbol.toUpperCase());
    if (!market) continue;

    let anchor = await store.getAnchor(tpl.id);
    if (!anchor) {
      anchor = {
        id: tpl.id,
        symbol: tpl.symbol,
        entryReference: market.price,
        entryBlock: latestBlock,
        anchoredAt: Date.now(),
      };
      await store.putAnchor(anchor);
    }

    const dir = tpl.direction === "LONG" ? 1 : -1;
    const target = anchor.entryReference * (1 + (tpl.targetPct / 100) * dir);
    const invalidation = anchor.entryReference * (1 + (tpl.invalidationPct / 100) * dir);

    out.push({
      id: tpl.id,
      deskSlug: tpl.deskSlug,
      symbol: tpl.symbol,
      direction: tpl.direction,
      entryReference: anchor.entryReference,
      entryBlock: anchor.entryBlock,
      publishedAt: anchor.anchoredAt,
      expiresAt: null,
      status: "LIVE",
      closedAt: null,
      closeReference: null,
      versions: [
        {
          version: 1,
          publishedAt: anchor.anchoredAt,
          thesis: tpl.thesis,
          target,
          invalidation,
          digest: digestOf(`${tpl.id}|${anchor.anchoredAt}|${tpl.thesis}|${target}|${invalidation}`),
        },
      ],
    });
  }
  return out;
}

export async function resolveAllCalls(markets: Market[], latestBlock: number) {
  const live = await buildLiveCalls(markets, latestBlock);
  const priceOf = new Map(markets.map((m) => [m.symbol.toUpperCase(), m.price]));
  const all = [...live, ...SEED_CLOSED_CALLS];
  const results: CallResult[] = all.map((c) =>
    resolveCall(c, priceOf.get(c.symbol.toUpperCase()) ?? null),
  );
  return { live, historical: SEED_CLOSED_CALLS, results };
}

export type DeskRow = {
  desk: Desk;
  track: TrackRecord;
  score: number;
  rank: Desk["rank"];
  results: CallResult[];
  forks: number;
};

export async function buildDeskRows(markets: Market[], latestBlock: number, forkCounts: Record<string, number> = {}) {
  const { results } = await resolveAllCalls(markets, latestBlock);
  const rows: DeskRow[] = SEED_DESKS.map((desk) => {
    const mine = results.filter((r) => r.call.deskSlug === desk.slug);
    const track = buildTrackRecord(mine, desk.liveSince);
    const score = deskScore(track);
    return {
      desk,
      track,
      score,
      rank: rankFor(track, desk.followers),
      results: mine.sort((a, b) => b.call.publishedAt - a.call.publishedAt),
      forks: forkCounts[desk.slug] ?? 0,
    };
  });
  return rows.sort((a, b) => b.score - a.score);
}
