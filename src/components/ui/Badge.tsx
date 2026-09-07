import { cn } from "@/lib/cn";
import type { AssetClass } from "@/lib/domain/types";
import { ASSET_CLASS_LABEL } from "@/lib/domain/classify";

export function Badge({
  children,
  tone = "steel",
  className,
}: {
  children: React.ReactNode;
  tone?: "steel" | "up" | "down" | "pink" | "brass" | "cream";
  className?: string;
}) {
  const tones = {
    steel: "border-steel2 text-steel",
    up: "border-term2 text-term",
    down: "border-ox2 text-red",
    pink: "border-pink2 text-pink",
    brass: "border-brass text-brass",
    cream: "border-cream/40 text-cream",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 mono-tight text-[9px] uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ClassBadge({ assetClass }: { assetClass: AssetClass }) {
  const tone =
    assetClass === "TOKENIZED_EQUITY"
      ? "brass"
      : assetClass === "MEME"
        ? "pink"
        : assetClass === "STABLE"
          ? "steel"
          : assetClass === "CRYPTO"
            ? "cream"
            : "steel";
  return <Badge tone={tone as never}>{ASSET_CLASS_LABEL[assetClass]}</Badge>;
}

export function Delta({ value, className }: { value: number | null; className?: string }) {
  if (value == null || !Number.isFinite(value)) return <span className={cn("text-steel2", className)}>—</span>;
  const up = value >= 0;
  return (
    <span className={cn("tabular mono-tight", up ? "text-term" : "text-red", className)}>
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}
