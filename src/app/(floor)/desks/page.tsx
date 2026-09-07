import type { Metadata } from "next";
import Link from "next/link";
import { scanMarkets } from "@/lib/chain/scanner";
import { buildDeskRows } from "@/lib/domain/calls";
import { RANK_METHOD } from "@/lib/domain/ranking";
import { num, pct, usd } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { DemoBanner } from "@/components/ui/DemoBanner";

export const metadata: Metadata = { title: "Desks" };
export const dynamic = "force-dynamic";

export default async function DesksPage() {
  const snap = await scanMarkets();
  const rows = await buildDeskRows(snap.markets, snap.block.latest, {
    nero: 61,
    graybar: 148,
    "the-cage": 27,
    "pit-boss": 3,
  });

  return (
    <div className="px-4 py-6">
      <header className="mb-4">
        <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">EVERYBODY HAS AN OPINION.</h1>
        <h2 className="headline text-[clamp(2rem,6vw,4rem)] text-term">NOW IT HAS A TRACK RECORD.</h2>
        <p className="mt-3 max-w-3xl mono-tight text-[11px] leading-relaxed text-steel">
          A desk cannot type a number into its own performance panel. Every figure below is derived from timestamped
          calls priced against the same Robinhood Chain data the rest of the floor reads.
        </p>
      </header>

      <DemoBanner
        what="These desks are seeded so the creator layer is inspectable before there are real creators."
        real="Live call performance is computed against real onchain prices, and the historical block is labelled DEMO HISTORY wherever it appears."
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {rows.map((row) => (
          <Panel
            key={row.desk.slug}
            label={row.desk.mandate}
            right={<Badge tone="brass">{row.rank}</Badge>}
          >
            <Link href={`/desks/${row.desk.slug}`} className="group block">
              <h3 className="cond text-3xl text-cream group-hover:text-term">{row.desk.name}</h3>
              <p className="mt-1 mono-tight text-[11px] leading-relaxed text-steel">{row.desk.bio}</p>
            </Link>

            <dl className="mt-4 grid grid-cols-2 gap-px bg-ash2 sm:grid-cols-4">
              {[
                ["FOLLOWERS", num(row.desk.followers)],
                ["FOLLOWED CAPITAL", usd(row.desk.followedCapitalQuote, { compact: true })],
                ["RESOLVED CALLS", num(row.track.closed)],
                ["LIVE", num(row.track.live)],
                ["MEDIAN RETURN", pct(row.track.medianReturnPct)],
                ["HIT RATE", row.track.hitRate == null ? "—" : `${(row.track.hitRate * 100).toFixed(0)}%`],
                ["WORST CALL", pct(row.track.maxDrawdownPct)],
                ["SCORE", row.score.toFixed(1)],
              ].map(([k, v]) => (
                <div key={k} className="bg-char px-2 py-2">
                  <dt className="mono-tight text-[8px] tracking-[0.16em] text-steel2">{k}</dt>
                  <dd className="mt-0.5 cond text-lg tabular text-cream">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 flex flex-wrap gap-1">
              {row.desk.universe.map((u) => (
                <Link key={u} href={`/market/${u}`}>
                  <Badge>{u}</Badge>
                </Link>
              ))}
            </div>
          </Panel>
        ))}
      </div>

      <p className="mt-6 max-w-4xl mono-tight text-[10px] leading-relaxed text-steel2">
        <span className="tracking-[0.18em] text-steel">RANKING METHOD · </span>
        {RANK_METHOD}
      </p>
    </div>
  );
}
