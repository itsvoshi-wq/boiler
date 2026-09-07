import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { scanMarkets } from "@/lib/chain/scanner";
import { computeHeat } from "@/lib/domain/heat";
import { riskFlags } from "@/lib/domain/risk";
import { resolveAllCalls } from "@/lib/domain/calls";
import { SEED_DESKS } from "@/lib/data/desks";
import { EXPLORER } from "@/lib/chain/chains";
import { addr, duration, num, pct, stamp, usd } from "@/lib/format";
import { ChainStrip } from "@/components/shell/ChainStrip";
import { RightRail } from "@/components/shell/RightRail";
import { OrderTicket } from "@/components/floor/OrderTicket";
import { HeatBreakdown } from "@/components/floor/HeatBadge";
import { Panel } from "@/components/ui/Panel";
import { Badge, ClassBadge, Delta } from "@/components/ui/Badge";
import { ProvenanceLine, SourceChip } from "@/components/ui/Provenance";
import { Empty } from "@/components/ui/Empty";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}): Promise<Metadata> {
  const { symbol } = await params;
  return { title: symbol.toUpperCase() };
}

export default async function MarketPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const snap = await scanMarkets();
  const market = snap.markets.find((m) => m.symbol.toUpperCase() === decodeURIComponent(symbol).toUpperCase());
  if (!market) notFound();

  const heat = computeHeat(market, snap.windowSeconds);
  const flags = riskFlags(market, snap.block.latest);
  const trades = snap.trades.filter((t) => t.marketId === market.id).slice(0, 40);
  const { results } = await resolveAllCalls(snap.markets, snap.block.latest);
  const calls = results.filter((r) => r.call.symbol.toUpperCase() === market.symbol.toUpperCase());
  const watching = SEED_DESKS.filter((d) => d.universe.includes(market.symbol));

  const reserveBase = Number(market.pool.reserve0) / 10 ** market.base.decimals;
  const baseIsToken0 = market.pool.token0.toLowerCase() === market.base.address.toLowerCase();

  return (
    <div className="flex">
      <div className="min-w-0 flex-1">
        <ChainStrip snap={snap} />

        <header className="border-b border-ash2 px-4 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="headline text-[clamp(2.5rem,7vw,5rem)] leading-none text-cream">{market.symbol}</h1>
                <ClassBadge assetClass={market.assetClass} />
                {market.liquidityQuote < 25_000 && <Badge tone="down">THIN</Badge>}
              </div>
              <p className="mt-1 mono-tight text-[11px] text-steel">{market.base.name}</p>
              <a
                href={EXPLORER.token(market.base.address)}
                target="_blank"
                rel="noreferrer"
                className="mono-tight text-[10px] text-steel2 hover:text-term"
              >
                {market.base.address}
              </a>
            </div>
            <div className="text-right">
              <p className="cond text-[clamp(2rem,5vw,3.5rem)] leading-none tabular text-cream crt-bloom">
                {market.price >= 1 ? `$${market.price.toFixed(market.price >= 1000 ? 2 : 4)}` : `$${market.price.toPrecision(5)}`}
              </p>
              <p className="mt-1 text-lg">
                <Delta value={market.priceChangePct} />
                <span className="ml-2 mono-tight text-[11px] text-steel2">over {duration(snap.windowSeconds)}</span>
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px border border-ash2 bg-ash2 md:grid-cols-6">
            {[
              ["VOLUME", usd(market.windowVolumeQuote, { compact: true })],
              ["INVENTORY", usd(market.liquidityQuote, { compact: true })],
              ["TRADES", num(market.trades)],
              ["BUYERS / SELLERS", `${market.uniqueBuyers} / ${market.uniqueSellers}`],
              ["LARGEST PRINT", usd(market.largestTradeQuote, { compact: true })],
              ["POOL FEE", `${(market.pool.feePips / 10_000).toFixed(2)}%`],
            ].map(([k, v]) => (
              <div key={k} className="bg-char px-3 py-2.5">
                <dt className="mono-tight text-[9px] tracking-[0.16em] text-steel2">{k}</dt>
                <dd className="mt-0.5 cond text-xl tabular text-cream">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {flags.length > 0 && (
              <Panel label="RISK ON THIS MARKET" bodyClassName="p-0">
                <ul>
                  {flags.map((f) => (
                    <li key={f.code} className="flex gap-3 border-b border-ash2/60 px-3 py-2 last:border-0">
                      <span
                        className={`mt-0.5 h-2 w-2 shrink-0 ${
                          f.severity === "STOP" ? "bg-red" : f.severity === "WARN" ? "bg-brass" : "bg-steel2"
                        }`}
                      />
                      <div>
                        <p className="cond text-[13px] text-cream">{f.label}</p>
                        <p className="mono-tight text-[10px] leading-relaxed text-steel">{f.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <HeatBreakdown heat={heat} />

            <Panel label="THE TAPE" right={<SourceChip source="CHAIN" />} bodyClassName="p-0">
              {trades.length === 0 ? (
                <Empty title="NOTHING MOVING. YET." sub="No decoded swaps for this pool in the window." className="m-3" />
              ) : (
                <table className="w-full">
                  <tbody>
                    {trades.map((t) => (
                      <tr key={`${t.txHash}-${t.blockNumber}`} className="border-b border-ash2/50 last:border-0">
                        <td className={`px-3 py-1.5 mono-tight text-[11px] ${t.side === "BUY" ? "text-term" : "text-red"}`}>
                          {t.side}
                        </td>
                        <td className="px-3 py-1.5 text-right mono-tight tabular text-[11px] text-cream2">
                          {t.baseAmount.toPrecision(6)}
                        </td>
                        <td className="px-3 py-1.5 text-right mono-tight tabular text-[11px] text-cream">
                          {usd(t.quoteAmount)}
                        </td>
                        <td className="px-3 py-1.5 text-right mono-tight tabular text-[11px] text-steel">
                          ${t.price.toPrecision(6)}
                        </td>
                        <td className="px-3 py-1.5 text-right mono-tight text-[10px] text-steel2">
                          {t.tag === "BLOCK" ? <span className="text-brass">BLOCK</span> : addr(t.taker)}
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <a
                            href={EXPLORER.tx(t.txHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="mono-tight text-[10px] text-steel2 hover:text-term"
                          >
                            #{num(t.blockNumber)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel label="POOL STATE" right={<SourceChip source="CHAIN" />}>
              <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {[
                  ["POOL", <a key="p" href={EXPLORER.address(market.pool.address)} target="_blank" rel="noreferrer" className="hover:text-term">{market.pool.address}</a>],
                  ["TOKEN0", market.pool.token0],
                  ["TOKEN1", market.pool.token1],
                  ["FEE TIER", `${market.pool.feePips} pips (${(market.pool.feePips / 10_000).toFixed(2)}%)`],
                  ["TICK", num(market.pool.tick)],
                  ["IN-RANGE LIQUIDITY", market.pool.liquidity],
                  ["RESERVE " + (baseIsToken0 ? market.base.symbol : market.quote.symbol), reserveBase.toPrecision(8)],
                  ["sqrtPriceX96", market.pool.sqrtPriceX96],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between gap-3 border-b border-ash2/40 py-1">
                    <dt className="mono-tight text-[10px] tracking-[0.14em] text-steel2">{k}</dt>
                    <dd className="mono-tight text-[10px] text-cream2 break-all text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="label">ORDER TICKET</span>
                <span className="mono-tight text-[9px] text-steel2">FEES SHOWN BEFORE YOU SIGN</span>
              </div>
              <OrderTicket market={market} />
            </div>

            <Panel label="CALLS ON THIS NAME">
              {calls.length === 0 ? (
                <Empty title="NO CALLS ON THE BOOK." sub="Nobody has put their name on this one." />
              ) : (
                <ul className="space-y-2">
                  {calls.map((r) => (
                    <li key={r.call.id} className="border-l-2 border-ash2 pl-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <Link href={`/desks/${r.call.deskSlug}`} className="cond text-[13px] text-cream hover:text-term">
                          {r.call.deskSlug.toUpperCase()}
                        </Link>
                        <span
                          className={`mono-tight text-[10px] tracking-[0.14em] ${
                            r.status === "PINK SLIPPED" ? "text-red" : r.status === "LIVE" ? "text-term" : "text-steel"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="mono-tight text-[10px] text-steel2">
                        {r.call.direction} @ ${r.call.entryReference.toPrecision(6)} · {stamp(r.call.publishedAt)}
                      </p>
                      <p className="mono-tight text-[11px] tabular">
                        <span className={r.returnPct != null && r.returnPct >= 0 ? "text-term" : "text-red"}>
                          {pct(r.returnPct)}
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel label="DESKS WATCHING">
              {watching.length === 0 ? (
                <Empty title="EMPTY DESK." sub="No desk lists this market in its universe." />
              ) : (
                <ul className="space-y-1">
                  {watching.map((d) => (
                    <li key={d.slug}>
                      <Link href={`/desks/${d.slug}`} className="flex items-baseline justify-between hover:text-term">
                        <span className="cond text-[13px] text-cream">{d.name}</span>
                        <span className="mono-tight text-[10px] text-steel2">{num(d.followers)} following</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>

        <div className="px-4 pb-6">
          <ProvenanceLine p={snap.provenance} />
        </div>
      </div>
      <RightRail symbol={market.symbol} />
    </div>
  );
}
