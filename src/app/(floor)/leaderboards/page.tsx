import type { Metadata } from "next";
import Link from "next/link";
import { scanMarkets } from "@/lib/chain/scanner";
import { buildDeskRows } from "@/lib/domain/calls";
import { LEADERBOARDS, sortDesks } from "@/lib/domain/ranking";
import { num, pct, usd } from "@/lib/format";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { Badge } from "@/components/ui/Badge";
import { Empty } from "@/components/ui/Empty";

export const metadata: Metadata = { title: "Leaderboards" };
export const dynamic = "force-dynamic";

export default async function LeaderboardsPage() {
  const snap = await scanMarkets();
  const rows = await buildDeskRows(snap.markets, snap.block.latest, {
    nero: 61,
    graybar: 148,
    "the-cage": 27,
    "pit-boss": 3,
  });

  return (
    <div className="px-4 py-8">
      <header className="max-w-3xl">
        <h1 className="headline text-[clamp(2rem,6vw,4.2rem)] text-cream">THE STREET REMEMBERS.</h1>
        <p className="mt-3 mono-tight text-[11px] leading-relaxed text-steel">
          None of these boards rank by absolute return. Rank by absolute return and the winner is always whoever took
          the most reckless position and got lucky once. Each board prints its own rule.
        </p>
      </header>

      <div className="mt-5 max-w-3xl">
        <DemoBanner what="Desks are seeded and their resolved calls are demo history." real="The ranking maths is the production implementation." />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {LEADERBOARDS.map((board) => {
          const sorted = sortDesks(board.key, rows).slice(0, 8);
          return (
            <section key={board.key} className="border border-ash2">
              <header className="border-b border-ash2 px-3 py-2">
                <h2 className="cond text-xl text-cream">{board.title}</h2>
                <p className="mono-tight text-[9px] leading-relaxed text-steel2">{board.rule}</p>
              </header>
              {sorted.length === 0 ? (
                <Empty title="NO TRACK RECORD. NO RESPECT." sub="Not enough resolved calls to rank." className="m-3" />
              ) : (
                <ol>
                  {sorted.map((r, i) => (
                    <li
                      key={r.desk.slug}
                      className="flex items-center gap-3 border-b border-ash2/50 px-3 py-2 last:border-0"
                    >
                      <span className="w-6 cond text-lg text-steel2">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <Link href={`/desks/${r.desk.slug}`} className="cond text-[15px] text-cream hover:text-term">
                          {r.desk.name}
                        </Link>
                        <p className="mono-tight text-[9px] text-steel2">
                          {num(r.track.closed)} resolved · median {pct(r.track.medianReturnPct)} · worst{" "}
                          {pct(r.track.maxDrawdownPct)}
                        </p>
                      </div>
                      <Badge tone="brass">{r.rank}</Badge>
                      <span className="w-20 text-right mono-tight tabular text-[13px] text-term">
                        {board.key === "most-followed"
                          ? num(r.desk.followers)
                          : board.key === "followed-capital"
                            ? usd(r.desk.followedCapitalQuote, { compact: true })
                            : board.key === "most-forked"
                              ? num(r.forks)
                              : board.key === "most-consistent"
                                ? (r.track.consistency ?? 0).toFixed(3)
                                : board.key === "lowest-drawdown"
                                  ? pct(r.track.maxDrawdownPct)
                                  : r.score.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      <section className="mt-8 max-w-4xl border border-ash2 p-4">
        <h2 className="cond text-xl text-cream">RANKS</h2>
        <p className="mt-1 mono-tight text-[10px] leading-relaxed text-steel">
          INTERN, BROKER, SENIOR BROKER, VP, DIRECTOR, MANAGING DIRECTOR, WOLF. Progression is gated on resolved call
          count, track record age, consistency and drawdown control. It is deliberately not gated on how often a desk
          publishes, because paying people to publish more is how a call feed turns into noise.
        </p>
      </section>
    </div>
  );
}
