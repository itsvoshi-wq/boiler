import { cn } from "@/lib/cn";
import { SOURCE_COPY, type Provenance as P, type SourceKind } from "@/lib/domain/provenance";
import { ago } from "@/lib/format";

const toneFor: Record<SourceKind, string> = {
  CHAIN: "border-term2 text-term",
  DERIVED: "border-brass text-brass",
  MODELLED: "border-steel2 text-steel",
  DEMO: "border-pink2 text-pink2",
  CONFIG: "border-cream/40 text-cream/70",
};

export function SourceChip({ source, className }: { source: SourceKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 mono-tight text-[9px] uppercase tracking-[0.18em]",
        toneFor[source],
        className,
      )}
      title={SOURCE_COPY[source].blurb}
    >
      {SOURCE_COPY[source].label}
    </span>
  );
}

/** Prints where a number came from, in full, under the number. */
export function ProvenanceLine({ p, className }: { p: P; className?: string }) {
  return (
    <p className={cn("mono-tight text-[10px] leading-relaxed text-steel2", className)}>
      <SourceChip source={p.source} className="mr-2 align-middle" />
      {p.method}
      {p.window ? ` · ${p.window}` : ""} · read {ago(p.updatedAt)}
    </p>
  );
}
