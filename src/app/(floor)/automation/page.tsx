import type { Metadata } from "next";
import { DEFAULT_FEES } from "@/lib/domain/fees";
import { TIERS } from "@/lib/domain/staking";
import { FLAGS } from "@/lib/flags";
import { FlagBanner } from "@/components/ui/DemoBanner";
import { Panel } from "@/components/ui/Panel";

export const metadata: Metadata = { title: "Automation" };

const RULES = [
  { name: "LIMIT", trigger: "Pool mid price crosses your level", guard: "Minimum output, revalidated at fire time" },
  { name: "DCA", trigger: "Fixed interval, fixed size", guard: "Skips the fire if liquidity is below your floor" },
  { name: "TWAP", trigger: "Slice a parent order over N intervals", guard: "Per-slice price impact ceiling" },
  { name: "TRAILING STOP", trigger: "Price retraces X% from the high watermark", guard: "Watermark stored per position" },
  { name: "PROFIT TARGET", trigger: "Unrealised return reaches your target", guard: "Executes once, then disarms" },
  { name: "BRACKET", trigger: "Target and stop as one paired instruction", guard: "Cancels the sibling when one fires" },
  { name: "ROTATION", trigger: "Scheduled rebalance of a published strategy", guard: "Respects the strategy position limits" },
  { name: "LAUNCH WATCHER", trigger: "New pool for a token on your watchlist", guard: "Alert only, never auto-buys" },
];

export default function AutomationPage() {
  return (
    <div className="px-4 py-8">
      <header className="max-w-3xl">
        <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">RULES, NOT VIBES.</h1>
        <p className="mt-2 mono-tight text-[11px] leading-relaxed text-steel">
          BOILER automation is deterministic. A rule states its trigger, its guard and its size before it is armed, and
          it does exactly that. There is no model deciding when to buy on your behalf, and there never will be one
          hiding behind the word smart.
        </p>
      </header>

      <div className="mt-5 max-w-3xl">
        {!FLAGS.automationExecution && (
          <FlagBanner note="Rules can be written and inspected. Nothing in this build submits a transaction from a rule. When it does, each fire will be quoted, guarded and simulated exactly like a manual order." />
        )}
      </div>

      <div className="mt-6 overflow-x-auto border border-ash2">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-ash2">
              {["RULE", "TRIGGER", "GUARD"].map((h) => (
                <th key={h} className="px-3 py-2 text-left mono-tight text-[9px] font-normal tracking-[0.16em] text-steel2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RULES.map((r) => (
              <tr key={r.name} className="border-b border-ash2/50 last:border-0">
                <td className="px-3 py-2.5 cond text-[15px] text-cream">{r.name}</td>
                <td className="px-3 py-2.5 mono-tight text-[11px] text-cream2">{r.trigger}</td>
                <td className="px-3 py-2.5 mono-tight text-[11px] text-steel">{r.guard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid max-w-4xl gap-4 md:grid-cols-2">
        <Panel label="COST">
          <p className="mono-tight text-[11px] leading-relaxed text-cream2">
            {DEFAULT_FEES.automationActionBps} bps per executed action under the current configuration, charged on the
            action, not on the position. A rule that does not fire costs nothing.
          </p>
        </Panel>
        <Panel label="LIMITS BY TIER">
          <ul className="space-y-1 mono-tight text-[11px]">
            {TIERS.map((t) => (
              <li key={t.key} className="flex justify-between border-b border-ash2/40 py-1">
                <span className="tracking-[0.12em] text-steel2">{t.key}</span>
                <span className="tabular text-cream2">{t.automationSlots} armed rules</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
