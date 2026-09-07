import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { scanMarkets } from "@/lib/chain/scanner";
import { buildDeskRows } from "@/lib/domain/calls";
import { SEED_DESKS, SEED_STRATEGIES } from "@/lib/data/desks";
import { TRACK_RECORD_METHOD } from "@/lib/domain/performance";
import { DEFAULT_FEES } from "@/lib/domain/fees";
import { ago, num, pct, stamp, usd } from "@/lib/format";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { CallCard } from "@/components/floor/CallCard";
import { Empty } from "@/components/ui/Empty";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const desk = SEED_DESKS.find((d) => d.slug === slug);
  return { title: desk?.name ?? "Desk" };
}

export default async function DeskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SEED_DESKS.some((d) => d.slug === slug)) notFound();

  const snap = await scanMarkets();
  const rows = await buildDeskRows(snap.markets, snap.block.latest);
  const row = rows.find((r) => r.desk.slug === slug);
  if (!row) notFound();

  const strategies = SEED_STRATEGIES.filter((s) => s.deskSlug === slug);
  const live = row.results.filter((r) => r.status === "LIVE");
  const closed = row.results.filter((r) => r.status !== "LIVE");

  return (
    <div className="px-4 py-6">
      <header className="border-b border-ash2 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">{row.desk.mandate}</p>
            <h1 className="headline text-[clamp(2.2rem,7vw,4.5rem)] leading-none text-cream">{row.desk.name}</h1>
            <p className="mt-2 max-w-2xl mono-tight text-[11px] leading-relaxed text-steel">{row.desk.bio}</p>
          </div>
          <div className="text-right">
            <Badge tone="brass" className="text-[11px]">
              {row.rank}
            </Badge>
            <p className="mt-2 cond text-4xl tabular text-term">{row.score.toFixed(1)}</p>
            <p className="mono-tight text-[9px] tracking-[0.16em] text-steel2">DESK SCORE</p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-px border border-ash2 bg-ash2 md:grid-cols-4 lg:grid-cols-7">
          {[
            ["LIVE SINCE", `${Math.round(row.track.ageDays)} DAYS`],
            ["FOLLOWERS", num(row.desk.followers)],
            ["FOLLOWED CAPITAL", usd(row.desk.followedCapitalQuote, { compact: true })],
            ["ACTIVE CALLS", num(row.track.live)],
            ["RESOLVED CALLS", num(row.track.closed)],
            ["MEDIAN RETURN", pct(row.track.medianReturnPct)],
            ["MAX DRAWDOWN", pct(row.track.maxDrawdownPct)],
          ].map(([k, v]) => (
            <div key={k} className="bg-char px-3 py-2.5">
              <dt className="mono-tight text-[8px] tracking-[0.16em] text-steel2">{k}</dt>
              <dd className="mt-0.5 cond text-xl tabular text-cream">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 mono-tight text-[10px] text-steel2">
          DESK FEE {row.desk.creatorFeeBps} bps, inside the protocol maximum of {DEFAULT_FEES.creatorSwapBps.max} bps.
          Charged only on volume routed through this desk, shown on the ticket before you sign.
        </p>
      </header>

      <div className="mt-5">
        <DemoBanner
          what="Seeded desk."
          real={`Live calls are anchored to the first price this deployment observed and their returns are real market movement since. Resolved calls below are labelled DEMO HISTORY.`}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <section>
            <h2 className="mb-2 cond text-2xl text-cream">ACTIVE CALLS</h2>
            {live.length === 0 ? (
              <Empty title="NO CALLS ON THE BOOK." sub="Nothing live from this desk right now." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {live.map((r) => (
                  <CallCard key={r.call.id} result={r} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="cond text-2xl text-cream">CLOSED</h2>
              <span className="mono-tight text-[9px] tracking-[0.18em] text-pink2">DEMO HISTORY</span>
            </div>
            <div className="border border-ash2">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ash2">
                    {["SYMBOL", "SIDE", "ENTRY", "CLOSE", "RESULT", "STATUS", "PUBLISHED"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-3 py-2 mono-tight text-[9px] font-normal tracking-[0.16em] text-steel2 ${i === 0 ? "text-left" : "text-right"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {closed.map((r) => (
                    <tr key={r.call.id} className="border-b border-ash2/50 last:border-0">
                      <td className="px-3 py-2">
                        <Link href={`/market/${r.call.symbol}`} className="cond text-[14px] text-cream hover:text-term">
                          {r.call.symbol}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right mono-tight text-[11px] text-steel">{r.call.direction}</td>
                      <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-cream2">
                        ${r.call.entryReference.toPrecision(6)}
                      </td>
                      <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-cream2">
                        {r.call.closeReference ? `$${r.call.closeReference.toPrecision(6)}` : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 text-right mono-tight tabular text-[12px] ${
                          (r.returnPct ?? 0) >= 0 ? "text-term" : "text-red"
                        }`}
                      >
                        {pct(r.returnPct)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={`mono-tight text-[9px] tracking-[0.14em] ${
                            r.status === "PINK SLIPPED" ? "text-red" : "text-steel"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right mono-tight text-[10px] text-steel2">
                        {ago(r.call.publishedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <Panel label="TRACK RECORD METHOD">
            <p className="mono-tight text-[10px] leading-relaxed text-steel">{TRACK_RECORD_METHOD}</p>
            <dl className="mt-3 space-y-1 mono-tight text-[11px]">
              {[
                ["HIT RATE", row.track.hitRate == null ? "—" : `${(row.track.hitRate * 100).toFixed(0)}%`],
                ["MEAN RETURN", pct(row.track.meanReturnPct)],
                ["BEST", pct(row.track.bestPct)],
                ["WORST", pct(row.track.worstPct)],
                ["CONSISTENCY", row.track.consistency == null ? "—" : row.track.consistency.toFixed(3)],
                ["PINK SLIPPED", num(row.track.pinkSlipped)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-ash2/40 py-1">
                  <dt className="tracking-[0.14em] text-steel2">{k}</dt>
                  <dd className="tabular text-cream">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel label="UNIVERSE">
            <div className="flex flex-wrap gap-1">
              {row.desk.universe.map((u) => (
                <Link key={u} href={`/market/${u}`}>
                  <Badge>{u}</Badge>
                </Link>
              ))}
            </div>
          </Panel>

          {strategies.length > 0 && (
            <Panel label="STRATEGIES">
              <ul className="space-y-2">
                {strategies.map((s) => (
                  <li key={s.id}>
                    <Link href="/strategies" className="cond text-[14px] text-cream hover:text-term">
                      {s.name}
                    </Link>
                    <p className="mono-tight text-[10px] text-steel2">
                      v{s.version} · {num(s.forks)} forks · max {s.rules.maxSingleAssetPct}% single asset
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel label="OPERATOR">
            <p className="mono-tight text-[10px] leading-relaxed text-steel">
              Registered {stamp(row.desk.liveSince)}. Capital that follows this desk stays in the follower&apos;s own
              wallet. BOILER never takes custody.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
