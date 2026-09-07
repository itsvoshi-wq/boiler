import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Market } from "@/lib/domain/types";

/** A physical tape, printed big. Real prices, doubled so the loop is seamless. */
export function BigTicker({ markets, fast = false }: { markets: Market[]; fast?: boolean }) {
  const strip = markets.length ? [...markets, ...markets] : [];
  if (strip.length === 0) {
    return (
      <div className="border-y border-ash2 bg-black py-4">
        <p className="px-4 mono-tight text-[12px] text-steel2">PULLING THE TAPE…</p>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden border-y border-ash2 bg-black py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />
      <div className={cn("flex w-max items-baseline gap-10 px-6", fast ? "tape-roll-fast" : "tape-roll")}>
        {strip.map((m, i) => (
          <Link key={`${m.id}-${i}`} href={`/market/${m.symbol}`} className="flex items-baseline gap-3 hover:opacity-80">
            <span className="headline text-[clamp(1.6rem,4vw,3rem)] leading-none text-cream">{m.symbol}</span>
            <span className="cond text-[clamp(1rem,2.2vw,1.6rem)] tabular text-cream2">
              {m.price >= 1 ? m.price.toFixed(2) : m.price.toPrecision(4)}
            </span>
            <span
              className={cn(
                "cond text-[clamp(0.85rem,1.8vw,1.3rem)] tabular",
                m.priceChangePct >= 0 ? "text-term" : "text-red",
              )}
            >
              {m.priceChangePct >= 0 ? "▲" : "▼"}
              {Math.abs(m.priceChangePct).toFixed(2)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
