import type { Metadata } from "next";
import { BROKER_TIERS } from "@/lib/data/desks";
import { DEFAULT_FEES } from "@/lib/domain/fees";
import { FLAGS } from "@/lib/flags";
import { num, usd } from "@/lib/format";
import { FlagBanner } from "@/components/ui/DemoBanner";
import { Panel } from "@/components/ui/Panel";

export const metadata: Metadata = { title: "Brokers" };

export default function BrokersPage() {
  const example = 1_000_000;
  const protocolFee = (example * DEFAULT_FEES.protocolSwapBps) / 10_000;

  return (
    <div className="px-4 py-8">
      <header className="max-w-3xl">
        <h1 className="headline text-[clamp(2rem,6vw,4.2rem)] text-cream">WE DON&apos;T HIDE THE FEES.</h1>
        <p className="mt-3 mono-tight text-[11px] leading-relaxed text-steel">
          A broker brings people onto the floor and takes a disclosed share of the protocol fee those people generate.
          Not a markup on top of their trades. Not a hidden spread. A share of what BOILER already charges, shown to
          the referred user on their own ticket, with the referring broker named.
        </p>
      </header>

      <div className="mt-5 max-w-3xl">
        {!FLAGS.brokerPayouts && (
          <FlagBanner note="Broker accounting is modelled. No protocol fees have been collected, so no broker fees have been earned or paid." />
        )}
      </div>

      <section className="mt-8 max-w-4xl">
        <h2 className="mb-3 cond text-2xl text-cream">TIERS</h2>
        <div className="border border-ash2">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ash2">
                {["TIER", "REFERRED VOLUME FROM", "SHARE OF PROTOCOL FEE", "ON $1M OF REFERRED VOLUME"].map((h, i) => (
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
              {BROKER_TIERS.map((t) => (
                <tr key={t.tier} className="border-b border-ash2/50 last:border-0">
                  <td className="px-3 py-3 cond text-xl text-cream">{t.tier}</td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-cream2">
                    {usd(t.minReferredVolume, { compact: true })}
                  </td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-term">
                    {t.shareOfProtocolFeePct}%
                  </td>
                  <td className="px-3 py-3 text-right mono-tight tabular text-[12px] text-brass">
                    {usd((protocolFee * t.shareOfProtocolFeePct) / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 mono-tight text-[10px] leading-relaxed text-steel2">
          Worked from {usd(example)} of referred volume at the configured protocol fee of {DEFAULT_FEES.protocolSwapBps}{" "}
          bps, which is {usd(protocolFee)}. The broker share comes out of that number, never out of a larger charge to
          the user.
        </p>
      </section>

      <section className="mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
        <Panel label="WHAT A REFERRED USER SEES">
          <ul className="space-y-2 mono-tight text-[11px] leading-relaxed text-cream2">
            <li>The name of the broker who referred them, on the ticket.</li>
            <li>The protocol fee, unchanged by the referral.</li>
            <li>The broker&apos;s share of that fee, in basis points and in dollars.</li>
            <li>A link to this page, so they can check the tier themselves.</li>
          </ul>
        </Panel>
        <Panel label="WHAT A BROKER SEES">
          <ul className="space-y-2 mono-tight text-[11px] leading-relaxed text-cream2">
            <li>Referred wallets, {num(0)} today.</li>
            <li>Referred volume, attributed onchain per trade.</li>
            <li>Eligible fees and paid fees, separately.</li>
            <li>Current tier and the volume to the next one.</li>
          </ul>
        </Panel>
      </section>
    </div>
  );
}
