"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { usd } from "@/lib/format";
import type { Trade } from "@/lib/domain/types";

/**
 * ORDER FLOW rail. Real decoded Uniswap V3 swaps, newest at the top, tagged by
 * size. BLOCK means it crossed at 25k or more, which is a threshold, not an
 * opinion.
 */
export function RightRail({ symbol }: { symbol?: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [err, setErr] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const q = symbol ? `?symbol=${encodeURIComponent(symbol)}&limit=40` : "?limit=40";
        const res = await fetch(`/api/tape${q}`, { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        const next: Trade[] = json.trades ?? [];
        // Work out what is new here, in the effect, and hand render a plain set.
        const nowFresh = new Set<string>();
        for (const t of next) {
          const key = t.txHash + t.blockNumber;
          if (!seen.current.has(key)) {
            nowFresh.add(key);
            seen.current.add(key);
          }
        }
        if (seen.current.size > 2000) seen.current = new Set([...seen.current].slice(-1000));
        setFresh(nowFresh);
        setTrades(next);
        setErr(null);
      } catch {
        if (!cancelled) setErr("TAPE UNREACHABLE");
      }
    };
    pull();
    const t = setInterval(pull, 12_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [symbol]);

  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-ash2 bg-char xl:block">
      <div className="sticky top-[54px] max-h-[calc(100vh-54px)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-ash2 px-3 py-2">
          <span className="mono-tight text-[10px] tracking-[0.2em] text-steel">
            {symbol ? `${symbol} ORDER FLOW` : "THE TAPE"}
          </span>
          <span className="h-[6px] w-[6px] bg-term blink" />
        </div>
        {err && <p className="px-3 py-4 mono-tight text-[11px] text-red">{err}</p>}
        {!err && trades.length === 0 && (
          <p className="px-3 py-6 mono-tight text-[11px] text-steel2">NOTHING MOVING. YET.</p>
        )}
        <ul>
          {trades.map((t) => {
            const isNew = fresh.has(t.txHash + t.blockNumber);
            return (
              <li
                key={`${t.txHash}-${t.blockNumber}-${t.symbol}`}
                className={cn(
                  "flex items-baseline justify-between gap-2 border-b border-ash2/50 px-3 py-1.5 mono-tight text-[11px]",
                  isNew && (t.side === "BUY" ? "flash-up" : "flash-down"),
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className={cn("w-8", t.side === "BUY" ? "text-term" : "text-red")}>{t.side}</span>
                  <Link href={`/market/${t.symbol}`} className="text-cream hover:text-term">
                    {t.symbol}
                  </Link>
                  {t.tag === "BLOCK" && (
                    <span className="border border-brass px-1 text-[8px] tracking-[0.14em] text-brass">BLOCK</span>
                  )}
                </span>
                <span className="tabular text-cream2">{usd(t.quoteAmount, { compact: true })}</span>
              </li>
            );
          })}
        </ul>
        <p className="px-3 py-3 mono-tight text-[9px] leading-relaxed text-steel2">
          Decoded from Uniswap V3 Swap logs on Robinhood Chain. Size is the quote leg of each swap. Nothing here is
          simulated.
        </p>
      </div>
    </aside>
  );
}
