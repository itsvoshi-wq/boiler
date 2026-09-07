import type { Metadata } from "next";
import Link from "next/link";
import { SEED_STRATEGIES, SEED_DESKS } from "@/lib/data/desks";
import { DEFAULT_FEES } from "@/lib/domain/fees";
import { FLAGS } from "@/lib/flags";
import { num, usd } from "@/lib/format";
import { FlagBanner, DemoBanner } from "@/components/ui/DemoBanner";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Strategies" };

export default function StrategiesPage() {
  return (
    <div className="px-4 py-8">
      <header className="max-w-3xl">
        <h1 className="headline text-[clamp(2rem,6vw,4.2rem)] text-cream">NO PLAN. JUST VIBES.</h1>
        <p className="mt-3 mono-tight text-[11px] leading-relaxed text-steel">
          That is the empty state. A strategy is the opposite: a named universe, explicit position limits, a liquidity
          floor, a rebalance schedule, and a drawdown policy, all published before anyone follows it. Capital stays in
          the follower&apos;s own wallet.
        </p>
      </header>

      <div className="mt-5 max-w-3xl space-y-2">
        <DemoBanner what="Seeded strategies from seeded desks." />
        {!FLAGS.strategyReplication && (
          <FlagBanner note="Strategies are publishable, inspectable and forkable. Automated replication does not submit transactions in this build." />
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {SEED_STRATEGIES.map((s) => {
          const desk = SEED_DESKS.find((d) => d.slug === s.deskSlug);
          return (
            <Panel key={s.id} label={`v${s.version} · ${num(s.forks)} FORKS`} right={<Badge>{s.rules.rebalance}</Badge>}>
              <h2 className="cond text-2xl text-cream">{s.name}</h2>
              {desk && (
                <Link href={`/desks/${desk.slug}`} className="mono-tight text-[10px] tracking-[0.14em] text-steel hover:text-term">
                  {desk.name}
                </Link>
              )}

              <div className="mt-3">
                <span className="label">UNIVERSE</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.universe.map((u) => (
                    <Link key={u} href={`/market/${u}`}>
                      <Badge>{u}</Badge>
                    </Link>
                  ))}
                </div>
              </div>

              <dl className="mt-3 space-y-1 mono-tight text-[11px]">
                {[
                  ["MAX SINGLE ASSET", `${s.rules.maxSingleAssetPct}%`],
                  ["MIN POOL INVENTORY", usd(s.rules.minLiquidityQuote, { compact: true })],
                  ["REBALANCE", s.rules.rebalance],
                  ["PROFIT TARGET", s.rules.profitTargetPct ? `${s.rules.profitTargetPct}%` : "NONE PUBLISHED"],
                  ["MAX DRAWDOWN POLICY", s.rules.maxDrawdownPct ? `${s.rules.maxDrawdownPct}%` : "NONE PUBLISHED"],
                  ["FOLLOWERS", num(s.followers)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-ash2/40 py-1">
                    <dt className="tracking-[0.12em] text-steel2">{k}</dt>
                    <dd className="tabular text-cream2">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 grid grid-cols-3 gap-1">
                {["FOLLOW", "FORK", "RUN"].map((a) => (
                  <button
                    key={a}
                    disabled
                    className="border border-ash2 px-2 py-2 cond text-[12px] text-steel2 disabled:cursor-not-allowed"
                    title="Replication is feature flagged off in this build."
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <section className="mt-8 max-w-4xl border border-ash2 p-4">
        <h2 className="cond text-xl text-cream">FEES ON A STRATEGY</h2>
        <p className="mt-1 mono-tight text-[10px] leading-relaxed text-steel">
          Strategy execution is charged at {DEFAULT_FEES.strategyExecutionBps} bps per action under the current
          configuration, on top of the pool fee and the protocol fee, and inside the same {""}
          hard cap that applies everywhere else. Every action a strategy takes on your behalf is quoted and itemised
          before it is signed. Capital is never pooled unless a separately disclosed pooled product exists, and none
          does.
        </p>
      </section>
    </div>
  );
}
