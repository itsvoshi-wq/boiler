import type { Metadata } from "next";
import Link from "next/link";
import { scanMarkets } from "@/lib/chain/scanner";
import { computeHeat } from "@/lib/domain/heat";
import { PINK_SECTIONS } from "@/lib/domain/pinksheets";
import { duration, num, usd } from "@/lib/format";
import { ChainStrip } from "@/components/shell/ChainStrip";
import { RightRail } from "@/components/shell/RightRail";
import { MarketTable } from "@/components/floor/MarketTable";
import { Panel } from "@/components/ui/Panel";
import { ProvenanceLine } from "@/components/ui/Provenance";
import { Empty } from "@/components/ui/Empty";
import { Btn } from "@/components/ui/Btn";

export const metadata: Metadata = { title: "The Floor" };
export const dynamic = "force-dynamic";

export default async function FloorPage() {
  const snap = await scanMarkets();
  const hot = PINK_SECTIONS[0].pick(snap.markets, snap.windowSeconds).slice(0, 6);
  const totalVolume = snap.markets.reduce((a, m) => a + m.windowVolumeQuote, 0);
  const totalLiquidity = snap.markets.reduce((a, m) => a + m.liquidityQuote, 0);
  const totalTrades = snap.markets.reduce((a, m) => a + m.trades, 0);
  const takers = new Set(snap.trades.map((t) => t.taker)).size;

  return (
    <div className="flex">
      <div className="min-w-0 flex-1">
        <ChainStrip snap={snap} />

        <section className="border-b border-ash2 px-4 py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="headline text-[clamp(2.2rem,6vw,4.5rem)] text-cream">THE FLOOR IS OPEN.</h1>
              <p className="mt-2 max-w-2xl mono-tight text-[11px] leading-relaxed text-steel">
                Everything below was read off Robinhood Chain in the last {duration(snap.windowSeconds)}. No index, no
                aggregator, no cached vendor feed. Blocks {num(snap.block.from)} to {num(snap.block.to)}.
              </p>
            </div>
            <div className="flex gap-2">
              <Btn href="/pinks" variant="ghost">
                SHOW ME THE SHEET
              </Btn>
              <Btn href="/books">SEE THE BOOKS</Btn>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px border border-ash2 bg-ash2 md:grid-cols-5">
            {[
              ["WINDOW VOLUME", usd(totalVolume, { compact: true })],
              ["POOL INVENTORY", usd(totalLiquidity, { compact: true })],
              ["TRADES", num(totalTrades)],
              ["DISTINCT TAKERS", num(takers)],
              ["MARKETS ON TAPE", num(snap.markets.length)],
            ].map(([k, v]) => (
              <div key={k} className="bg-char px-3 py-3">
                <dt className="mono-tight text-[9px] tracking-[0.18em] text-steel2">{k}</dt>
                <dd className="mt-1 cond text-2xl tabular text-cream">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {snap.degraded ? (
          <div className="p-4">
            <Empty
              title="THE TAPE IS DOWN."
              sub={snap.degradedReason ?? "RPC unreachable. Nothing is being invented to fill the gap."}
            />
          </div>
        ) : (
          <>
            <section className="border-b border-ash2 px-4 py-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="cond text-xl text-cream">WHAT&apos;S MOVING</h2>
                <Link href="/pinks" className="mono-tight text-[10px] tracking-[0.16em] text-steel hover:text-term">
                  FULL SHEET →
                </Link>
              </div>
              <div className="grid gap-px bg-ash2 sm:grid-cols-2 lg:grid-cols-3">
                {hot.map((m) => {
                  const heat = computeHeat(m, snap.windowSeconds);
                  return (
                    <Link key={m.id} href={`/market/${m.symbol}`} className="group bg-char p-3 hover:bg-char2">
                      <div className="flex items-baseline justify-between">
                        <span className="cond text-2xl text-cream group-hover:text-term">{m.symbol}</span>
                        <span
                          className={`mono-tight tabular text-[13px] ${m.priceChangePct >= 0 ? "text-term" : "text-red"}`}
                        >
                          {m.priceChangePct >= 0 ? "+" : ""}
                          {m.priceChangePct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between mono-tight text-[11px] text-steel">
                        <span className="tabular text-cream2">
                          {m.price >= 1 ? `$${m.price.toFixed(2)}` : `$${m.price.toPrecision(4)}`}
                        </span>
                        <span>{usd(m.windowVolumeQuote, { compact: true })} vol</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="mono-tight text-[9px] tracking-[0.14em] text-steel2">
                          {heat.band} {heat.score.toFixed(0)}
                        </span>
                        <span className="h-[5px] flex-1 bg-ash">
                          <span className="block h-full bg-term" style={{ width: `${Math.min(100, heat.score)}%` }} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <Panel
              label="THE BOOK"
              right={<span className="mono-tight text-[10px] text-steel2">RANKED BY WINDOW VOLUME</span>}
              className="m-4"
              bodyClassName="p-0"
            >
              <MarketTable markets={snap.markets} windowSeconds={snap.windowSeconds} />
              <div className="border-t border-ash2 p-3">
                <ProvenanceLine p={snap.provenance} />
              </div>
            </Panel>
          </>
        )}
      </div>
      <RightRail />
    </div>
  );
}
