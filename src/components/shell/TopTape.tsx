"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Row = { symbol: string; price: number; priceChangePct: number; id: string };

function fmt(p: number) {
  if (!Number.isFinite(p) || p <= 0) return "—";
  if (p >= 1000) return p.toFixed(0);
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.001) return p.toFixed(5);
  return p.toExponential(2);
}

/**
 * The tape. Always visible, always moving, never lying: prices come from the
 * same scan the rest of the floor reads.
 */
export function TopTape() {
  const [rows, setRows] = useState<Row[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const res = await fetch("/api/markets", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        setRows(
          (json.markets ?? []).slice(0, 26).map((m: Row) => ({
            id: m.id,
            symbol: m.symbol,
            price: m.price,
            priceChangePct: m.priceChangePct,
          })),
        );
        setLive(!json.degraded);
      } catch {
        if (!cancelled) setLive(false);
      }
    };
    pull();
    const t = setInterval(pull, 20_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const strip = rows.length ? [...rows, ...rows] : [];

  return (
    <div className="relative z-40 h-[30px] w-full overflow-hidden border-b border-ash2 bg-black">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent" />
      <div className="absolute inset-y-0 left-0 z-20 flex items-center gap-2 border-r border-ash2 bg-black px-3">
        <span className={cn("h-[6px] w-[6px]", live ? "bg-term blink" : "bg-red")} />
        <span className="mono-tight text-[10px] tracking-[0.2em] text-steel">{live ? "TAPE LIVE" : "TAPE DOWN"}</span>
      </div>
      {strip.length === 0 ? (
        <div className="flex h-full items-center pl-32 mono-tight text-[11px] text-steel2">PULLING THE TAPE…</div>
      ) : (
        <div className="tape-roll flex h-full w-max items-center">
          {strip.map((r, i) => (
            <Link
              key={`${r.id}-${i}`}
              href={`/market/${r.symbol}`}
              className="flex items-center gap-2 border-r border-ash2/60 px-4 mono-tight text-[11px] hover:bg-char2"
            >
              <span className="text-cream">{r.symbol}</span>
              <span className="tabular text-cream2">{fmt(r.price)}</span>
              <span className={cn("tabular", r.priceChangePct >= 0 ? "text-term" : "text-red")}>
                {r.priceChangePct >= 0 ? "▲" : "▼"}
                {Math.abs(r.priceChangePct).toFixed(2)}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
