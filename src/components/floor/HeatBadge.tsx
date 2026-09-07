import { cn } from "@/lib/cn";
import { HEAT_METHOD } from "@/lib/domain/heat";
import type { Heat } from "@/lib/domain/types";

const tone: Record<Heat["band"], string> = {
  COLD: "border-steel2 text-steel2",
  WARM: "border-cream/40 text-cream/70",
  "HEATING UP": "border-brass text-brass",
  HOT: "border-red text-red",
  MELTING: "border-red bg-ox text-paper",
};

export function HeatBadge({ heat, className }: { heat: Heat; className?: string }) {
  return (
    <span
      title={HEAT_METHOD}
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 mono-tight text-[9px] uppercase tracking-[0.14em]",
        tone[heat.band],
        className,
      )}
    >
      {heat.band}
      <span className="tabular opacity-70">{heat.score.toFixed(0)}</span>
    </span>
  );
}

/** WHY IS THIS HOT? is a link that actually answers, not a decorative label. */
export function HeatBreakdown({ heat }: { heat: Heat }) {
  return (
    <div className="border border-ash2 bg-char2">
      <div className="flex items-center justify-between border-b border-ash2 px-3 py-2">
        <span className="cond text-sm text-cream">WHY IS THIS HOT?</span>
        <HeatBadge heat={heat} />
      </div>
      <table className="w-full">
        <tbody>
          {heat.components.map((c) => (
            <tr key={c.key} className="border-b border-ash2/50 last:border-0">
              <td className="px-3 py-1.5 mono-tight text-[11px] text-steel">{c.label}</td>
              <td className="px-3 py-1.5 text-right mono-tight text-[11px] tabular text-cream">{c.display}</td>
              <td className="w-[35%] px-3 py-1.5">
                <span className="block h-[6px] w-full bg-ash">
                  <span
                    className="block h-full bg-term"
                    style={{ width: `${Math.round(c.score * 100)}%` }}
                    aria-label={`${(c.score * 100).toFixed(0)} percent of ceiling`}
                  />
                </span>
              </td>
              <td className="px-3 py-1.5 text-right mono-tight text-[10px] tabular text-steel2">
                ×{c.weight.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-ash2 px-3 py-2 mono-tight text-[9px] leading-relaxed text-steel2">{HEAT_METHOD}</p>
    </div>
  );
}
