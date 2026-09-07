import Link from "next/link";
import { cn } from "@/lib/cn";
import type { CallResult } from "@/lib/domain/types";
import { ago, pct, stamp } from "@/lib/format";

const statusTone: Record<string, string> = {
  LIVE: "border-term text-term",
  CLOSED: "border-steel2 text-steel",
  EXPIRED: "border-steel2 text-steel",
  INVALIDATED: "border-red text-red",
  "PINK SLIPPED": "border-red bg-ox text-cream",
};

/**
 * A published call, printed like a broker slip. The version digest is on the
 * card because an edited call has to be visibly an edited call.
 */
export function CallCard({ result, showDesk = false }: { result: CallResult; showDesk?: boolean }) {
  const { call } = result;
  const head = call.versions[call.versions.length - 1];
  const edited = call.versions.length > 1;

  return (
    <article className="border border-ash2 bg-char">
      <header className="flex items-center justify-between gap-2 border-b border-ash2 px-3 py-2">
        <div className="flex items-baseline gap-2">
          <Link href={`/market/${call.symbol}`} className="cond text-xl text-cream hover:text-term">
            {call.symbol}
          </Link>
          <span className={cn("mono-tight text-[11px]", call.direction === "LONG" ? "text-term" : "text-red")}>
            {call.direction}
          </span>
        </div>
        <span
          className={cn("border px-1.5 py-0.5 mono-tight text-[9px] uppercase tracking-[0.14em]", statusTone[result.status])}
        >
          {result.status}
        </span>
      </header>

      <div className="space-y-2 p-3">
        {showDesk && (
          <Link href={`/desks/${call.deskSlug}`} className="mono-tight text-[10px] tracking-[0.16em] text-steel hover:text-term">
            {call.deskSlug.toUpperCase()}
          </Link>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 mono-tight text-[11px]">
          <Row k="ENTRY REF" v={`$${call.entryReference.toPrecision(6)}`} />
          <Row k="MARK" v={result.markPrice ? `$${result.markPrice.toPrecision(6)}` : "—"} />
          <Row k="TARGET" v={head?.target ? `$${head.target.toPrecision(6)}` : "—"} />
          <Row k="INVALIDATION" v={head?.invalidation ? `$${head.invalidation.toPrecision(6)}` : "—"} />
        </dl>

        <p className={cn("cond text-3xl tabular", (result.returnPct ?? 0) >= 0 ? "text-term" : "text-red")}>
          {pct(result.returnPct)}
        </p>

        <p className="mono-tight text-[11px] leading-relaxed text-cream2">{head?.thesis}</p>
        <p className="mono-tight text-[10px] leading-relaxed text-steel2">{result.reason}</p>

        <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ash2 pt-2 mono-tight text-[9px] text-steel2">
          <span>PUBLISHED {stamp(call.publishedAt)}</span>
          <span>{ago(call.publishedAt)}</span>
          <span>
            v{head?.version} · DIGEST {head?.digest}
          </span>
          {edited && <span className="text-brass">EDITED · {call.versions.length} VERSIONS ON RECORD</span>}
        </footer>
      </div>
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-ash2/40 py-0.5">
      <dt className="tracking-[0.12em] text-steel2">{k}</dt>
      <dd className="tabular text-cream2">{v}</dd>
    </div>
  );
}
