import type { Metadata } from "next";
import { scanMarkets } from "@/lib/chain/scanner";
import { resolveAllCalls } from "@/lib/domain/calls";
import { CallCard } from "@/components/floor/CallCard";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { Empty } from "@/components/ui/Empty";
import { num } from "@/lib/format";

export const metadata: Metadata = { title: "Verified Calls" };
export const dynamic = "force-dynamic";

export default async function CallsPage() {
  const snap = await scanMarkets();
  const { results } = await resolveAllCalls(snap.markets, snap.block.latest);
  const live = results.filter((r) => r.status === "LIVE");
  const slipped = results.filter((r) => r.status === "PINK SLIPPED");
  const closed = results.filter((r) => r.status === "CLOSED" || r.status === "EXPIRED");

  return (
    <div className="px-4 py-6">
      <header className="mb-4">
        <h1 className="headline text-[clamp(2rem,6vw,4.2rem)] text-cream">CALL IT BEFORE IT MOVES.</h1>
        <h2 className="headline text-[clamp(2rem,6vw,4.2rem)] text-ox2">OR SAY NOTHING.</h2>
        <p className="mt-3 max-w-3xl mono-tight text-[11px] leading-relaxed text-steel">
          A call is timestamped at publication, its content is hashed, and its invalidation is written before the trade
          rather than after the chart. Edits do not overwrite history: every version stays on the record with its own
          digest. When a published invalidation is hit, the call is marked PINK SLIPPED and it stays that way.
        </p>
      </header>

      <DemoBanner
        what="Seeded desks."
        real="Live calls below are anchored to the first price this deployment observed, and their returns are real Robinhood Chain movement since that anchor."
      />

      <section className="mt-6">
        <h3 className="mb-3 cond text-2xl text-cream">LIVE ON THE BOOK · {num(live.length)}</h3>
        {live.length === 0 ? (
          <Empty title="NO CALLS ON THE BOOK." sub="Nothing live in the current scan window." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {live.map((r) => (
              <CallCard key={r.call.id} result={r} showDesk />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline gap-3">
          <h3 className="cond text-2xl text-red">PINK SLIPPED · {num(slipped.length)}</h3>
          <span className="mono-tight text-[10px] text-steel2">
            Hit its own published invalidation. Nobody gets to delete these.
          </span>
        </div>
        {slipped.length === 0 ? (
          <Empty title="NOTHING SLIPPED. YET." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {slipped.map((r) => (
              <CallCard key={r.call.id} result={r} showDesk />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline gap-3">
          <h3 className="cond text-2xl text-cream">CLOSED · {num(closed.length)}</h3>
          <span className="mono-tight text-[9px] tracking-[0.18em] text-pink2">DEMO HISTORY</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {closed.map((r) => (
            <CallCard key={r.call.id} result={r} showDesk />
          ))}
        </div>
      </section>
    </div>
  );
}
