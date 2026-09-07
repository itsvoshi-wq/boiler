import Link from "next/link";
import { cn } from "@/lib/cn";
import { computeHeat } from "@/lib/domain/heat";
import type { Market } from "@/lib/domain/types";
import { num, usd } from "@/lib/format";
import { ClassBadge, Delta } from "@/components/ui/Badge";
import { HeatBadge } from "./HeatBadge";

function priceText(p: number) {
  if (!Number.isFinite(p) || p <= 0) return "—";
  if (p >= 1000) return `$${p.toFixed(2)}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  if (p >= 0.0001) return `$${p.toFixed(6)}`;
  return `$${p.toExponential(3)}`;
}

export function MarketTable({
  markets,
  windowSeconds,
  variant = "dark",
  limit,
  showHeat = true,
}: {
  markets: Market[];
  windowSeconds: number;
  variant?: "dark" | "paper";
  limit?: number;
  showHeat?: boolean;
}) {
  const rows = limit ? markets.slice(0, limit) : markets;
  const paper = variant === "paper";

  return (
    <div className={cn("overflow-x-auto", paper && "on-paper")}>
      <table className="w-full min-w-[880px] border-collapse">
        <thead>
          <tr className={cn("border-b", paper ? "border-black/25" : "border-ash2")}>
            {["SYMBOL", "CLASS", "LAST", "WINDOW", "VOLUME", "LIQUIDITY", "TRADES", "BUYERS", "FEE", showHeat ? "HEAT" : ""]
              .filter(Boolean)
              .map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-3 py-2 mono-tight text-[9px] font-normal uppercase tracking-[0.18em]",
                    i === 0 ? "text-left" : "text-right",
                    paper ? "text-black/50" : "text-steel2",
                  )}
                >
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const heat = computeHeat(m, windowSeconds);
            return (
              <tr
                key={m.id}
                className={cn(
                  "border-b transition-colors",
                  paper ? "border-black/10 hover:bg-black/5" : "border-ash2/60 hover:bg-char2",
                )}
              >
                <td className="px-3 py-2">
                  <Link href={`/market/${m.symbol}`} className="group flex flex-col">
                    <span
                      className={cn(
                        "cond text-[15px] leading-tight",
                        paper ? "text-black group-hover:text-pinkink" : "text-cream group-hover:text-term",
                      )}
                    >
                      {m.symbol}
                    </span>
                    <span
                      className={cn(
                        "mono-tight text-[9px] leading-tight",
                        paper ? "text-black/50" : "text-steel2",
                      )}
                    >
                      {m.base.name.slice(0, 38)}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2 text-right">
                  <ClassBadge assetClass={m.assetClass} />
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right mono-tight tabular text-[12px]",
                    paper ? "text-black" : "text-cream",
                  )}
                >
                  {priceText(m.price)}
                </td>
                <td className="px-3 py-2 text-right text-[12px]">
                  <Delta value={m.priceChangePct} />
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right mono-tight tabular text-[12px]",
                    paper ? "text-black/80" : "text-cream2",
                  )}
                >
                  {usd(m.windowVolumeQuote, { compact: true })}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right mono-tight tabular text-[12px]",
                    m.liquidityQuote < 25_000 ? "text-red" : paper ? "text-black/80" : "text-cream2",
                  )}
                >
                  {usd(m.liquidityQuote, { compact: true })}
                </td>
                <td className={cn("px-3 py-2 text-right mono-tight tabular text-[12px]", paper ? "text-black/70" : "text-steel")}>
                  {num(m.trades)}
                </td>
                <td className={cn("px-3 py-2 text-right mono-tight tabular text-[12px]", paper ? "text-black/70" : "text-steel")}>
                  {num(m.uniqueBuyers)}
                </td>
                <td className={cn("px-3 py-2 text-right mono-tight tabular text-[11px]", paper ? "text-black/50" : "text-steel2")}>
                  {(m.pool.feePips / 10_000).toFixed(2)}%
                </td>
                {showHeat && (
                  <td className="px-3 py-2 text-right">
                    <HeatBadge heat={heat} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
