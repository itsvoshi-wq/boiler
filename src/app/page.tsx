import Link from "next/link";
import { scanMarkets } from "@/lib/chain/scanner";
import { resolveAllCalls, buildDeskRows } from "@/lib/domain/calls";
import { PINK_SECTIONS } from "@/lib/domain/pinksheets";
import { DEFAULT_FEES, modelledProtocolTake } from "@/lib/domain/fees";
import { REVENUE_STATE } from "@/lib/domain/revenue";
import { duration, num, pct, stamp, usd } from "@/lib/format";
import { OpeningSequence } from "@/components/marketing/OpeningSequence";
import { BigTicker } from "@/components/marketing/BigTicker";
import { Wordmark, ValveMark } from "@/components/brand/Wordmark";
import { Btn } from "@/components/ui/Btn";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snap = await scanMarkets();
  const hot = PINK_SECTIONS[0].pick(snap.markets, snap.windowSeconds).slice(0, 8);
  const sheet = snap.markets.slice(0, 7);
  const { results } = await resolveAllCalls(snap.markets, snap.block.latest);
  const desks = await buildDeskRows(snap.markets, snap.block.latest);
  const liveCalls = results.filter((r) => r.status === "LIVE").slice(0, 3);
  const slipped = results.find((r) => r.status === "PINK SLIPPED");
  const observedVolume = snap.markets.reduce((a, m) => a + m.windowVolumeQuote, 0);
  const modelled = modelledProtocolTake(observedVolume);
  const topDesk = desks[0];

  return (
    <div className="tex-grain relative min-h-screen bg-pitch">
      <OpeningSequence />

      {/* ------------------------------------------------------------ nav */}
      <header className="sticky top-0 z-40 border-b border-ash2 bg-pitch/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
          <span className="flex items-center gap-2">
            <ValveMark className="text-ox2" />
            <Wordmark size="sm" withRule={false} />
          </span>
          <nav className="hidden gap-5 mono-tight text-[10px] tracking-[0.18em] text-steel md:flex">
            <Link href="/pinks" className="hover:text-cream">PINK SHEETS</Link>
            <Link href="/desks" className="hover:text-cream">DESKS</Link>
            <Link href="/calls" className="hover:text-cream">CALLS</Link>
            <Link href="/books" className="hover:text-cream">THE BOOKS</Link>
            <Link href="/boil" className="hover:text-cream">$BOIL</Link>
          </nav>
          <div className="flex gap-2">
            <Btn href="/books" variant="ghost" className="hidden sm:inline-flex">
              SEE THE BOOKS
            </Btn>
            <Btn href="/floor">ENTER THE FLOOR</Btn>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------- hero */}
      <section className="relative overflow-hidden px-4 pb-8 pt-14 sm:pt-20">
        <div className="lamp pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_20%_0%,rgba(184,147,63,0.16),transparent_60%)]" />
        <div className="relative mx-auto max-w-[1600px]">
          <p className="mono-tight text-[10px] tracking-[0.34em] text-term">THE FLOOR IS OPEN.</p>
          <h1 className="mt-5 headline text-[clamp(2.6rem,10.5vw,9.5rem)] leading-[0.84] text-cream">
            DON&apos;T JUST
            <br />
            TRADE THE FLOOR.
          </h1>
          <h2 className="mt-1 headline text-[clamp(2.6rem,10.5vw,9.5rem)] leading-[0.84] text-ox2">OWN THE FLOOR.</h2>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Btn href="/floor" className="px-7 py-4 text-[15px]">
              ENTER THE FLOOR
            </Btn>
            <Btn href="/books" variant="ghost" className="px-7 py-4 text-[15px]">
              SEE THE BOOKS
            </Btn>
            <p className="mono-tight text-[10px] leading-relaxed text-steel">
              {num(snap.markets.length)} live markets · {usd(observedVolume, { compact: true })} traded in the last{" "}
              {duration(snap.windowSeconds)} · read at block {num(snap.chain.blockNumber)}
            </p>
          </div>
        </div>
      </section>

      <BigTicker markets={hot.length ? hot : snap.markets.slice(0, 8)} />

      {/* -------------------------------------------------------- section 2 */}
      <section className="mx-auto max-w-[1600px] px-4 py-16">
        <h2 className="headline text-[clamp(2rem,7vw,6rem)] leading-[0.86] text-cream">
          WALL STREET NEVER DIED.
        </h2>
        <h3 className="headline text-[clamp(2rem,7vw,6rem)] leading-[0.86] text-term crt-bloom">IT WENT ONCHAIN.</h3>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.35rem)] leading-relaxed text-cream2">
            Tokenized equities, majors, alts and the bottom of the sheet, all clearing through the same pools on the
            same chain, all day, at a hundred milliseconds a block. The old boiler rooms had the energy and hid the
            books. BOILER keeps the energy and opens them.
          </p>
          <dl className="grid grid-cols-2 gap-px border border-ash2 bg-ash2 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ["CHAIN", `ROBINHOOD ${snap.chain.id}`],
              ["BLOCK TIME", `${snap.chain.blockTimeSec.toFixed(2)}s`],
              ["MARKETS ON TAPE", num(snap.markets.length)],
              ["SWAPS IN WINDOW", num(snap.markets.reduce((a, m) => a + m.trades, 0))],
            ].map(([k, v]) => (
              <div key={k} className="bg-char px-4 py-5">
                <dt className="mono-tight text-[9px] tracking-[0.18em] text-steel2">{k}</dt>
                <dd className="mt-1 cond text-3xl tabular text-cream">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* -------------------------------------------------------- section 3 */}
      <section className="mx-auto max-w-[1600px] px-4 py-10">
        <div className="tex-pink paper-edge on-paper relative p-6 sm:p-10">
          <div className="tex-grain pointer-events-none absolute inset-0" />
          <div className="relative flex flex-wrap items-end justify-between gap-4 border-b-2 border-black/70 pb-3">
            <h2 className="headline text-[clamp(2rem,8vw,6rem)] leading-[0.82] text-black">PINK SHEETS</h2>
            <span className="stamp text-pinkink">SPECULATIVE</span>
          </div>
          <p className="relative mt-4 max-w-2xl cond text-[clamp(1.1rem,2.4vw,1.9rem)] leading-tight text-black/80">
            The stuff your broker won&apos;t put on the front page.
          </p>

          <table className="relative mt-6 w-full">
            <tbody>
              {sheet.map((m) => (
                <tr key={m.id} className="border-b border-black/20">
                  <td className="py-2 pr-3">
                    <Link href={`/market/${m.symbol}`} className="cond text-xl text-black hover:text-pinkink">
                      {m.symbol}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 mono-tight text-[10px] text-black/55">{m.base.name.slice(0, 34)}</td>
                  <td className="py-2 pr-3 text-right mono-tight tabular text-[13px] text-black">
                    {m.price >= 1 ? `$${m.price.toFixed(2)}` : `$${m.price.toPrecision(4)}`}
                  </td>
                  <td
                    className={`py-2 pr-3 text-right mono-tight tabular text-[13px] ${m.priceChangePct >= 0 ? "text-[#0d5c2f]" : "text-[#8e1b1b]"}`}
                  >
                    {pct(m.priceChangePct)}
                  </td>
                  <td className="py-2 text-right mono-tight tabular text-[12px] text-black/70">
                    {usd(m.windowVolumeQuote, { compact: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="relative mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/pinks"
              className="border-2 border-black px-5 py-2.5 cond text-[13px] text-black hover:bg-black hover:text-pink"
            >
              SHOW ME THE SHEET
            </Link>
            <p className="mono-tight text-[9px] leading-relaxed text-black/60">
              Ranked by composite activity, never by price alone. Every section prints its rule.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- section 4 */}
      <section className="mx-auto max-w-[1600px] px-4 py-16">
        <h2 className="headline text-[clamp(1.9rem,6.4vw,5.4rem)] leading-[0.86] text-cream">
          EVERYBODY HAS AN OPINION.
        </h2>
        <h3 className="headline text-[clamp(1.9rem,6.4vw,5.4rem)] leading-[0.86] text-term">
          NOW IT HAS A TRACK RECORD.
        </h3>

        {topDesk && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="border border-ash2 bg-char p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label">{topDesk.desk.mandate}</p>
                  <Link href={`/desks/${topDesk.desk.slug}`} className="cond text-4xl text-cream hover:text-term">
                    {topDesk.desk.name}
                  </Link>
                </div>
                <Badge tone="brass">{topDesk.rank}</Badge>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-px bg-ash2 sm:grid-cols-3">
                {[
                  ["LIVE SINCE", `${Math.round(topDesk.track.ageDays)} DAYS`],
                  ["FOLLOWERS", num(topDesk.desk.followers)],
                  ["FOLLOWED CAPITAL", usd(topDesk.desk.followedCapitalQuote, { compact: true })],
                  ["RESOLVED CALLS", num(topDesk.track.closed)],
                  ["MEDIAN RETURN", pct(topDesk.track.medianReturnPct)],
                  ["MAX DRAWDOWN", pct(topDesk.track.maxDrawdownPct)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-char px-3 py-3">
                    <dt className="mono-tight text-[8px] tracking-[0.16em] text-steel2">{k}</dt>
                    <dd className="mt-0.5 cond text-xl tabular text-cream">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 mono-tight text-[10px] leading-relaxed text-steel2">
                A desk cannot type a number into this panel. Performance is derived from timestamped calls priced
                against the same chain data everything else on this site reads.
              </p>
            </div>

            <div>
              <p className="max-w-xl text-[clamp(1rem,1.6vw,1.3rem)] leading-relaxed text-cream2">
                Everybody is a genius after the chart moves. A desk on BOILER publishes the entry reference, the
                target and the invalidation before the trade, and the record follows it around forever.
              </p>
              <div className="mt-5 flex gap-2">
                <Btn href="/desks" variant="ghost">
                  WHO&apos;S CALLING IT
                </Btn>
                <Btn href="/leaderboards" variant="ghost">
                  LEADERBOARDS
                </Btn>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- section 5 */}
      <section className="border-y border-ash2 bg-char">
        <div className="mx-auto max-w-[1600px] px-4 py-16">
          <h2 className="headline text-[clamp(1.9rem,6.4vw,5.4rem)] leading-[0.86] text-cream">
            CALL IT BEFORE IT MOVES.
          </h2>
          <h3 className="headline text-[clamp(1.9rem,6.4vw,5.4rem)] leading-[0.86] text-ox2">OR SAY NOTHING.</h3>
          <p className="mt-5 max-w-2xl text-[clamp(1rem,1.6vw,1.3rem)] leading-relaxed text-cream2">
            No screenshots. No stories. The call, the timestamp, the rule that kills it, and the result.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {liveCalls.map((r) => (
              <article key={r.call.id} className="border border-ash2 bg-pitch p-4">
                <div className="flex items-baseline justify-between">
                  <Link href={`/market/${r.call.symbol}`} className="cond text-2xl text-cream hover:text-term">
                    {r.call.symbol}
                  </Link>
                  <span className="mono-tight text-[10px] text-term">{r.call.direction}</span>
                </div>
                <p className="mt-2 cond text-3xl tabular text-term">{pct(r.returnPct)}</p>
                <dl className="mt-2 space-y-0.5 mono-tight text-[10px] text-steel">
                  <div className="flex justify-between">
                    <dt>ENTRY REF</dt>
                    <dd className="tabular text-cream2">${r.call.entryReference.toPrecision(6)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>PUBLISHED</dt>
                    <dd className="tabular text-cream2">{stamp(r.call.publishedAt).slice(0, 16)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>DIGEST</dt>
                    <dd className="tabular text-cream2">{r.call.versions[0]?.digest}</dd>
                  </div>
                </dl>
              </article>
            ))}

            {slipped && (
              <article className="border-2 border-ox2 bg-ox/30 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="cond text-2xl text-cream">{slipped.call.symbol}</span>
                  <span className="stamp text-red">PINK SLIPPED</span>
                </div>
                <p className="mt-2 cond text-3xl tabular text-red">{pct(slipped.returnPct)}</p>
                <p className="mt-2 mono-tight text-[10px] leading-relaxed text-cream2">
                  Hit the invalidation it published before entry. Nobody gets to delete this one.
                </p>
              </article>
            )}
          </div>

          <div className="mt-8">
            <Btn href="/calls">SEE EVERY CALL</Btn>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- section 6 */}
      <section className="mx-auto max-w-[1600px] px-4 py-16">
        <h2 className="headline text-[clamp(1.9rem,6.2vw,5.2rem)] leading-[0.86] text-cream">
          BOILER ROOMS USED TO HIDE THE BOOKS.
        </h2>
        <h3 className="headline text-[clamp(1.9rem,6.2vw,5.2rem)] leading-[0.86] text-term crt-bloom">
          WE PUT OURS ONCHAIN.
        </h3>

        <div className="mt-8 tex-paper paper-edge on-paper relative max-w-4xl p-6">
          <div className="tex-grain pointer-events-none absolute inset-0" />
          <table className="relative w-full mono-tight text-[12px]">
            <tbody>
              {[
                ["OBSERVED VOLUME, THIS WINDOW", usd(modelled.volume), "CHAIN"],
                [`MODELLED PROTOCOL FEE @ ${DEFAULT_FEES.protocolSwapBps} BPS`, usd(modelled.protocol), "MODELLED"],
                [`MODELLED DESK FEE @ ${DEFAULT_FEES.creatorSwapBps.default} BPS`, usd(modelled.creator), "MODELLED"],
                ["PROTOCOL REVENUE ACTUALLY COLLECTED", usd(REVENUE_STATE.realisedRevenueUsd), "CHAIN"],
                ["$BOIL BUYBACKS EXECUTED", usd(REVENUE_STATE.buybacksExecutedUsd), "CHAIN"],
                ["$BOIL BURNED", num(REVENUE_STATE.boilBurned), "CHAIN"],
              ].map(([k, v, src], i) => (
                <tr key={String(k)} className="border-b border-black/25 last:border-0">
                  <td className="py-2 pr-4 tracking-[0.08em] text-black/60">
                    {String(i + 1).padStart(2, "0")} {k}
                  </td>
                  <td className="py-2 pr-3 text-right text-[9px] tracking-[0.16em] text-black/45">{src}</td>
                  <td className="py-2 text-right tabular text-xl text-black">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="relative mt-4 border-t-2 border-black/60 pt-3 mono-tight text-[11px] leading-relaxed text-black/75">
            Zero is not a rounding error. No BOILER contract is deployed, so no fee has been collected, and the page
            says so instead of showing you a chart.
          </p>
        </div>

        <div className="mt-6">
          <Btn href="/books">OPEN THE LEDGER</Btn>
        </div>
      </section>

      {/* -------------------------------------------------------- section 7 */}
      <section className="border-y border-ash2 bg-char">
        <div className="mx-auto max-w-[1600px] px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="headline text-[clamp(1.9rem,6vw,5rem)] leading-[0.86] text-cream">$BOIL</h2>
              <h3 className="mt-1 headline text-[clamp(1.4rem,4vw,3.2rem)] leading-[0.9] text-term">
                MORE ACTIVITY.
                <br />
                MORE FUEL.
              </h3>
              <p className="mt-5 max-w-xl text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-cream2">
                Staking buys capability: cheaper execution, more automation, a bigger share of what your desk earns,
                access to the data layer. No headline APR, because printing a token and calling the print yield is the
                oldest trick in the room this thing is named after.
              </p>
              <div className="mt-6">
                <Btn href="/boil" variant="ghost">
                  READ THE DESIGN
                </Btn>
              </div>
            </div>
            <ul className="grid gap-px self-start bg-ash2 sm:grid-cols-2">
              {[
                ["FLOOR", "Full market access, the call feed, The Books."],
                ["DESK", "Open a desk, publish calls, bracket automation."],
                ["PARTNER", "Publish strategies, replication, priority feeds."],
                ["HOUSE", "Data and API keys, custom routing limits, broker programme."],
              ].map(([k, v]) => (
                <li key={k} className="bg-char px-4 py-4">
                  <p className="cond text-2xl text-cream">{k}</p>
                  <p className="mt-1 mono-tight text-[10px] leading-relaxed text-steel">{v}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- section 8 */}
      <section className="relative overflow-hidden px-4 py-24">
        <div className="lamp pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(184,147,63,0.2),transparent_55%)]" />
        <div className="relative mx-auto max-w-[1000px] text-center">
          <p className="mono-tight text-[10px] tracking-[0.34em] text-steel2">ONE DESK LAMP. ONE PHONE RINGING.</p>
          <h2 className="mt-6 headline text-[clamp(2.2rem,9vw,7rem)] leading-[0.86] text-cream">
            THE FLOOR IS STILL OPEN.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn href="/floor" className="px-8 py-4 text-[15px]">
              ENTER THE FLOOR
            </Btn>
            <Btn href="/methodology" variant="ghost" className="px-8 py-4 text-[15px]">
              HOW EVERY NUMBER IS MADE
            </Btn>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- footer */}
      <footer className="border-t border-ash2">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-6 px-4 py-10">
          <div>
            <Wordmark size="lg" />
            <p className="mt-3 mono-tight text-[10px] tracking-[0.18em] text-steel2">ROBINHOOD CHAIN · 4663</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 mono-tight text-[11px] tracking-[0.14em] text-steel">
            <Link href="/floor" className="hover:text-cream">FLOOR</Link>
            <Link href="/pinks" className="hover:text-cream">PINKS</Link>
            <Link href="/books" className="hover:text-cream">BOOKS</Link>
            <Link href="/boil" className="hover:text-cream">$BOIL</Link>
            <Link href="/methodology" className="hover:text-cream">METHODOLOGY</Link>
            <Link href="/terms" className="hover:text-cream">TERMS</Link>
          </nav>
        </div>
        <div className="border-t border-ash2 px-4 py-4">
          <p className="cond text-lg tracking-[0.1em] text-cream/60">THE FLOOR NEVER SLEEPS.</p>
        </div>
      </footer>
    </div>
  );
}
