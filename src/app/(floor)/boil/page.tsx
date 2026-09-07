import type { Metadata } from "next";
import { TIERS, STAKING_NOTE } from "@/lib/domain/staking";
import { DEFAULT_FEES } from "@/lib/domain/fees";
import { FLAGS } from "@/lib/flags";
import { num } from "@/lib/format";
import { FlagBanner } from "@/components/ui/DemoBanner";
import { Panel } from "@/components/ui/Panel";
import { Btn } from "@/components/ui/Btn";

export const metadata: Metadata = { title: "$BOIL" };

export default function BoilPage() {
  return (
    <div className="px-4 py-8">
      <header className="max-w-4xl">
        <h1 className="headline text-[clamp(2rem,6.5vw,5rem)] leading-[0.86] text-cream">DON&apos;T JUST TRADE THE FLOOR.</h1>
        <h2 className="headline text-[clamp(2rem,6.5vw,5rem)] leading-[0.86] text-term crt-bloom">OWN THE FLOOR.</h2>
        <p className="mt-4 mono-tight text-[11px] leading-relaxed text-steel">
          $BOIL is the participation layer. It buys capability inside the product: cheaper execution, more automation,
          a bigger share of what a desk earns, access to the data layer. It is not a claim on revenue and this page
          will not pretend otherwise until that question has a legal answer.
        </p>
      </header>

      <div className="mt-6 max-w-4xl space-y-2">
        {!FLAGS.boilToken && (
          <FlagBanner note="No $BOIL contract is deployed on Robinhood Chain. Everything on this page is the published design, not a live balance, not a price, and not a presale." />
        )}
        {!FLAGS.stakerRevenueDistribution && (
          <FlagBanner note="Direct distribution of protocol revenue to stakers is switched off pending legal review. The allocation in The Books shows it at zero and the validator rejects any config that sets it above zero while the flag is off." />
        )}
      </div>

      <section className="mt-8">
        <h3 className="mb-3 cond text-2xl text-cream">WHAT STAKING ACTUALLY DOES</h3>
        <div className="overflow-x-auto border border-ash2">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-ash2">
                {["TIER", "MIN STAKE", "FEE DISCOUNT", "EFFECTIVE PROTOCOL FEE", "AUTOMATION", "WATCHLISTS", "DESK SPLIT", "API"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-3 py-2 mono-tight text-[9px] font-normal tracking-[0.16em] text-steel2 ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.key} className="border-b border-ash2/50 last:border-0">
                  <td className="px-3 py-3">
                    <span className="cond text-xl text-cream">{t.key}</span>
                    <p className="mono-tight text-[9px] leading-relaxed text-steel2">{t.perks.join(" · ")}</p>
                  </td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-cream2">
                    {num(t.minStake)} $BOIL
                  </td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-term">
                    {t.swapFeeDiscountBps ? `-${t.swapFeeDiscountBps} bps` : "—"}
                  </td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-cream">
                    {DEFAULT_FEES.protocolSwapBps - t.swapFeeDiscountBps} bps
                  </td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-cream2">{t.automationSlots}</td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-cream2">{t.watchlists}</td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-cream2">{t.deskFeeSplitPct}%</td>
                  <td className="px-3 py-3 text-right mono-tight text-[11px] text-steel">{t.apiTier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 max-w-3xl mono-tight text-[10px] leading-relaxed text-steel2">{STAKING_NOTE}</p>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <Panel label="THE FLYWHEEL, WITHOUT THE ARROWS">
          <ol className="space-y-2 mono-tight text-[11px] leading-relaxed text-cream2">
            {[
              "People trade the floor because the markets are real and the fees are visible.",
              "Trading produces protocol revenue at a rate printed on every ticket.",
              "Revenue is routed by a validated allocation, published in The Books.",
              "Part of that allocation buys $BOIL on the open market and part is burned.",
              "Staking $BOIL lowers your costs and raises what a desk keeps, so the people who use the floor most hold the most.",
              "Better desk economics attract better desks, which is what brings the next round of users.",
            ].map((s, i) => (
              <li key={s} className="flex gap-3 border-b border-ash2/40 pb-2">
                <span className="cond text-lg text-ox2">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel label="WHAT $BOIL IS NOT">
          <ul className="space-y-2 mono-tight text-[11px] leading-relaxed text-cream2">
            <li className="border-l-2 border-ox2 pl-3">
              It is not an emissions machine. There is no headline APR because printing tokens and calling the print
              yield is the oldest trick in the room this product is named after.
            </li>
            <li className="border-l-2 border-ox2 pl-3">
              It is not a governance-only token whose entire job is to exist.
            </li>
            <li className="border-l-2 border-ox2 pl-3">
              It is not a promise of revenue distribution. If that ever ships it will ship with a legal opinion and a
              flag flipped in public, not quietly in a release note.
            </li>
            <li className="border-l-2 border-ox2 pl-3">
              It is not live. There is no contract, no price and no way to buy it from this page.
            </li>
          </ul>
        </Panel>
      </section>

      <div className="mt-8 flex gap-2">
        <Btn href="/books">SEE THE BOOKS</Btn>
        <Btn href="/floor" variant="ghost">
          ENTER THE FLOOR
        </Btn>
      </div>
    </div>
  );
}
