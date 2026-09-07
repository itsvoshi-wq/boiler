import type { Metadata } from "next";
import { scanMarkets } from "@/lib/chain/scanner";
import { DEFAULT_FEES, FEE_HARD_CAP_BPS, modelledProtocolTake } from "@/lib/domain/fees";
import { FLAGGED_ALLOCATION, REVENUE_STATE, routeRevenue } from "@/lib/domain/revenue";
import { FLAGS, FLAG_NOTES, type FlagKey } from "@/lib/flags";
import { STORE_NOTE } from "@/lib/data/store";
import { ADDRESSES, EXPLORER } from "@/lib/chain/chains";
import { rpcUrlPublic } from "@/lib/chain/public";
import { duration, num, usd } from "@/lib/format";
import { ChainStrip } from "@/components/shell/ChainStrip";
import { SourceChip } from "@/components/ui/Provenance";

export const metadata: Metadata = { title: "The Books" };
export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const snap = await scanMarkets();
  const observedVolume = snap.markets.reduce((a, m) => a + m.windowVolumeQuote, 0);
  const observedTrades = snap.markets.reduce((a, m) => a + m.trades, 0);
  const modelled = modelledProtocolTake(observedVolume);
  const allocation = routeRevenue(modelled.protocol);

  return (
    <div>
      <ChainStrip snap={snap} />

      <header className="border-b border-ash2 px-4 py-10">
        <h1 className="headline text-[clamp(1.9rem,5.6vw,4.6rem)] leading-[0.86] text-cream">
          BOILER ROOMS USED TO
          <br />
          HIDE THE BOOKS.
        </h1>
        <h2 className="mt-2 headline text-[clamp(1.9rem,5.6vw,4.6rem)] leading-[0.86] text-term crt-bloom">
          WE PUT OURS ONCHAIN.
        </h2>
        <p className="mt-4 max-w-3xl mono-tight text-[11px] leading-relaxed text-steel">
          This page is the reason the rest of the product is allowed to be loud. Everything below is one of four things
          and it says which: read off the chain, derived from chain reads by a printed formula, modelled from the
          configured fee schedule, or a configuration value. Nothing is rounded up into a better story.
        </p>
      </header>

      {/* --------------------------------------------------------- realised */}
      <section className="border-b border-ash2 px-4 py-8">
        <div className="mb-4 flex items-baseline gap-3">
          <h3 className="cond text-2xl text-cream">REALISED PROTOCOL ECONOMICS</h3>
          <SourceChip source="CHAIN" />
        </div>

        <div className="tex-paper paper-edge on-paper relative max-w-4xl p-5">
          <div className="tex-grain pointer-events-none absolute inset-0" />
          <table className="relative w-full">
            <tbody className="mono-tight text-[12px]">
              {[
                ["PROTOCOL REVENUE COLLECTED", usd(REVENUE_STATE.realisedRevenueUsd)],
                ["CREATOR PAYOUTS", usd(0)],
                ["BROKER PAYOUTS", usd(0)],
                ["$BOIL BUYBACKS EXECUTED", usd(REVENUE_STATE.buybacksExecutedUsd)],
                ["$BOIL BURNED", num(REVENUE_STATE.boilBurned)],
                ["PROTOCOL OWNED LIQUIDITY", usd(REVENUE_STATE.protocolOwnedLiquidityUsd)],
                ["TREASURY", usd(REVENUE_STATE.treasuryUsd)],
              ].map(([k, v], i) => (
                <tr key={k} className="border-b border-black/25 last:border-0">
                  <td className="py-2 pr-4 tracking-[0.1em] text-black/60">
                    {String(i + 1).padStart(2, "0")} {k}
                  </td>
                  <td className="py-2 text-right tabular text-xl text-black">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="relative mt-4 border-t-2 border-black/60 pt-3 mono-tight text-[11px] leading-relaxed text-black/75">
            <strong className="tracking-[0.12em]">WHY EVERY LINE IS ZERO: </strong>
            {REVENUE_STATE.note}
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- observed */}
      <section className="border-b border-ash2 px-4 py-8">
        <div className="mb-4 flex flex-wrap items-baseline gap-3">
          <h3 className="cond text-2xl text-cream">WHAT ACTUALLY TRADED</h3>
          <SourceChip source="CHAIN" />
          <span className="mono-tight text-[10px] text-steel2">
            blocks {num(snap.block.from)}–{num(snap.block.to)} · {duration(snap.windowSeconds)}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-px border border-ash2 bg-ash2 md:grid-cols-4">
          {[
            ["VOLUME IN WINDOW", usd(observedVolume, { compact: true })],
            ["SWAPS DECODED", num(observedTrades)],
            ["MARKETS", num(snap.markets.length)],
            ["POOL INVENTORY", usd(snap.markets.reduce((a, m) => a + m.liquidityQuote, 0), { compact: true })],
          ].map(([k, v]) => (
            <div key={k} className="bg-char px-3 py-3">
              <dt className="mono-tight text-[9px] tracking-[0.16em] text-steel2">{k}</dt>
              <dd className="mt-1 cond text-3xl tabular text-cream">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 mono-tight text-[10px] leading-relaxed text-steel2">
          There is no 24 hour figure on this page. Robinhood Chain produces a block roughly every{" "}
          {snap.chain.blockTimeSec.toFixed(2)}s, so 24 hours is about {num(Math.round(86_400 / snap.chain.blockTimeSec))}{" "}
          blocks and the public RPC caps a log query at 10,000 matches. BOILER states the window it can actually read
          instead of extrapolating one it cannot.
        </p>
      </section>

      {/* -------------------------------------------------------- modelled */}
      <section className="border-b border-ash2 px-4 py-8">
        <div className="mb-4 flex flex-wrap items-baseline gap-3">
          <h3 className="cond text-2xl text-cream">MODELLED ON THAT ACTIVITY</h3>
          <SourceChip source="MODELLED" />
        </div>
        <p className="mb-4 max-w-3xl mono-tight text-[11px] leading-relaxed text-steel">
          If the configured fee schedule had been live over the window above, it would have produced the numbers below.
          It was not live. These are not revenue, they are arithmetic, and they exist so the economics can be argued
          with before they are deployed rather than after.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border border-ash2">
            <div className="border-b border-ash2 px-3 py-2">
              <span className="label">FEE SCHEDULE (CONFIG)</span>
            </div>
            <table className="w-full mono-tight text-[11px]">
              <tbody>
                {[
                  ["PROTOCOL SWAP FEE", `${DEFAULT_FEES.protocolSwapBps} bps`],
                  ["DESK FEE MIN / DEFAULT / MAX", `${DEFAULT_FEES.creatorSwapBps.min} / ${DEFAULT_FEES.creatorSwapBps.default} / ${DEFAULT_FEES.creatorSwapBps.max} bps`],
                  ["HARD CAP, PROTOCOL + DESK", `${FEE_HARD_CAP_BPS} bps`],
                  ["BROKER SHARE OF PROTOCOL FEE", `${DEFAULT_FEES.brokerShareOfProtocolBps / 100}%`],
                  ["AUTOMATION ACTION", `${DEFAULT_FEES.automationActionBps} bps`],
                  ["STRATEGY EXECUTION", `${DEFAULT_FEES.strategyExecutionBps} bps`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-ash2/50 last:border-0">
                    <td className="px-3 py-2 tracking-[0.1em] text-steel">{k}</td>
                    <td className="px-3 py-2 text-right tabular text-cream">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-ash2 px-3 py-2 mono-tight text-[9px] leading-relaxed text-steel2">
              The Uniswap pool fee is separate and goes to liquidity providers, not to BOILER. Both are itemised on
              every order ticket before signature.
            </p>
          </div>

          <div className="border border-ash2">
            <div className="border-b border-ash2 px-3 py-2">
              <span className="label">MODELLED TAKE ON THE WINDOW</span>
            </div>
            <table className="w-full mono-tight text-[12px]">
              <tbody>
                <tr className="border-b border-ash2/50">
                  <td className="px-3 py-2 text-steel">OBSERVED VOLUME</td>
                  <td className="px-3 py-2 text-right tabular text-cream">{usd(modelled.volume)}</td>
                </tr>
                <tr className="border-b border-ash2/50">
                  <td className="px-3 py-2 text-steel">PROTOCOL FEE @ {DEFAULT_FEES.protocolSwapBps} bps</td>
                  <td className="px-3 py-2 text-right tabular text-brass">{usd(modelled.protocol)}</td>
                </tr>
                <tr className="border-b border-ash2/50">
                  <td className="px-3 py-2 text-steel">DESK FEE @ {DEFAULT_FEES.creatorSwapBps.default} bps</td>
                  <td className="px-3 py-2 text-right tabular text-brass">{usd(modelled.creator)}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-cream">ACTUALLY COLLECTED</td>
                  <td className="px-3 py-2 text-right tabular text-xl text-term">{usd(modelled.realised)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- allocation */}
      <section className="border-b border-ash2 px-4 py-8">
        <div className="mb-4 flex flex-wrap items-baseline gap-3">
          <h3 className="cond text-2xl text-cream">REVENUE ROUTER ALLOCATION</h3>
          <SourceChip source="CONFIG" />
        </div>
        <div className="max-w-4xl border border-ash2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ash2">
                {["DESTINATION", "SHARE", "ON THE MODELLED TAKE", "NOTE"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 mono-tight text-[9px] font-normal tracking-[0.16em] text-steel2 ${i === 3 ? "text-left" : i === 0 ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allocation.map((a) => (
                <tr key={a.destination} className="border-b border-ash2/50 last:border-0">
                  <td className="px-3 py-2 cond text-[14px] text-cream">{a.destination.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[12px] text-cream2">
                    {(a.bps / 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[12px] text-brass">{usd(a.amount)}</td>
                  <td className="px-3 py-2 mono-tight text-[10px] leading-relaxed text-steel">{a.note}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-ash2 bg-char2">
                <td className="px-3 py-2 cond text-[14px] text-steel2">
                  {FLAGGED_ALLOCATION.destination.replace(/_/g, " ")}
                </td>
                <td className="px-3 py-2 text-right mono-tight text-[12px] text-red">OFF</td>
                <td className="px-3 py-2 text-right mono-tight text-[12px] text-red">—</td>
                <td className="px-3 py-2 mono-tight text-[10px] leading-relaxed text-red">{FLAGGED_ALLOCATION.note}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 max-w-4xl mono-tight text-[10px] leading-relaxed text-steel2">
          Allocation is validated to total exactly 10,000 bps and rejected otherwise. Changing it changes this table.
          There is no second set of percentages anywhere in the codebase.
        </p>
      </section>

      {/* ------------------------------------------------------------ flags */}
      <section className="border-b border-ash2 px-4 py-8">
        <h3 className="mb-4 cond text-2xl text-cream">WHAT IS SWITCHED ON</h3>
        <ul className="grid gap-px border border-ash2 bg-ash2 md:grid-cols-2">
          {(Object.keys(FLAGS) as FlagKey[]).map((key) => (
            <li key={key} className="flex gap-3 bg-char px-3 py-2.5">
              <span className={`mt-1 h-2 w-2 shrink-0 ${FLAGS[key] ? "bg-term" : "bg-ox2"}`} />
              <div>
                <p className="mono-tight text-[11px] tracking-[0.14em] text-cream">
                  {key.replace(/([A-Z])/g, " $1").toUpperCase()} · {FLAGS[key] ? "ON" : "OFF"}
                </p>
                <p className="mono-tight text-[10px] leading-relaxed text-steel2">{FLAG_NOTES[key]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------ infrastructure */}
      <section className="px-4 py-8">
        <h3 className="mb-4 cond text-2xl text-cream">WHERE THE DATA COMES FROM</h3>
        <dl className="max-w-4xl border border-ash2">
          {[
            ["RPC ENDPOINT", rpcUrlPublic()],
            ["CHAIN ID", String(snap.chain.id)],
            ["UNISWAP V3 FACTORY", ADDRESSES.v3Factory],
            ["SWAP ROUTER 02", ADDRESSES.swapRouter02],
            ["MULTICALL3", ADDRESSES.multicall3],
            ["QUOTE ASSET (USDG)", ADDRESSES.usdg],
            ["WETH9", ADDRESSES.weth9],
            ["STORAGE", STORE_NOTE],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-ash2/50 px-3 py-2 last:border-0">
              <dt className="mono-tight text-[10px] tracking-[0.16em] text-steel2">{k}</dt>
              <dd className="mono-tight text-[10px] break-all text-cream2">
                {String(v).startsWith("0x") ? (
                  <a href={EXPLORER.address(String(v))} target="_blank" rel="noreferrer" className="hover:text-term">
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
