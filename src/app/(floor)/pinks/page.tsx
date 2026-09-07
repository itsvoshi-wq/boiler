import type { Metadata } from "next";
import { scanMarkets } from "@/lib/chain/scanner";
import { PINK_SECTIONS } from "@/lib/domain/pinksheets";
import { duration, num } from "@/lib/format";
import { ChainStrip } from "@/components/shell/ChainStrip";
import { MarketTable } from "@/components/floor/MarketTable";
import { ProvenanceLine } from "@/components/ui/Provenance";
import { Empty } from "@/components/ui/Empty";

export const metadata: Metadata = { title: "Pink Sheets" };
export const dynamic = "force-dynamic";

export default async function PinksPage() {
  const snap = await scanMarkets();

  return (
    <div>
      <ChainStrip snap={snap} />

      <div className="px-4 py-6">
        {/* A physical pink market sheet, dropped into a dark institutional app. */}
        <div className="tex-pink paper-edge on-paper relative mx-auto max-w-[1400px] px-5 py-6 sm:px-8 sm:py-8">
          <div className="tex-grain pointer-events-none absolute inset-0" />
          <header className="relative flex flex-wrap items-end justify-between gap-4 border-b-2 border-black/70 pb-3">
            <div>
              <h1 className="headline text-[clamp(2rem,7vw,5rem)] leading-[0.82] text-black">PINK SHEETS</h1>
              <p className="mt-2 max-w-xl cond text-[15px] leading-tight text-black/75">
                The stuff your broker won&apos;t put on the front page.
              </p>
            </div>
            <div className="text-right">
              <span className="stamp text-pinkink">DAILY QUOTATION</span>
              <p className="mt-2 mono-tight text-[10px] leading-relaxed text-black/60">
                BLOCKS {num(snap.block.from)}–{num(snap.block.to)}
                <br />
                WINDOW {duration(snap.windowSeconds)} · {num(snap.markets.length)} MARKETS
              </p>
            </div>
          </header>

          <p className="relative mt-3 max-w-3xl mono-tight text-[10px] leading-relaxed text-black/70">
            Nothing on this sheet is ranked by price increase alone. Each section states the rule it sorts by, and the
            rule is the same for everybody. If a market is thin, it says so in red rather than quietly falling off the
            page.
          </p>

          {snap.degraded ? (
            <div className="relative mt-6">
              <Empty
                title="NOTHING MOVING. YET."
                sub={snap.degradedReason ?? "No decoded swaps in the window."}
                className="border-black/30 text-black"
              />
            </div>
          ) : (
            <div className="relative mt-6 space-y-8">
              {PINK_SECTIONS.map((section) => {
                const rows = section.pick(snap.markets, snap.windowSeconds).slice(0, 12);
                return (
                  <section key={section.key} id={section.key}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/40 pb-1">
                      <h2 className="cond text-2xl text-black">{section.title}</h2>
                      <p className="mono-tight text-[9px] leading-tight text-black/55">{section.rule}</p>
                    </div>
                    {rows.length === 0 ? (
                      <p className="py-4 cond text-lg text-black/40">NO PRINTS IN THIS SECTION.</p>
                    ) : (
                      <MarketTable markets={rows} windowSeconds={snap.windowSeconds} variant="paper" />
                    )}
                  </section>
                );
              })}
            </div>
          )}

          <footer className="relative mt-8 border-t border-black/40 pt-3">
            <p className="mono-tight text-[9px] leading-relaxed text-black/60">
              Methodology: markets are discovered by decoding Uniswap V3 Swap logs on Robinhood Chain over the stated
              block window. Pool and token state is read through Multicall3. Prices come from slot0. Inventory is
              ERC20 balanceOf on the pool. One market per base token, the deepest pool wins.
            </p>
          </footer>
        </div>

        <div className="mx-auto mt-4 max-w-[1400px]">
          <ProvenanceLine p={snap.provenance} />
        </div>
      </div>
    </div>
  );
}
