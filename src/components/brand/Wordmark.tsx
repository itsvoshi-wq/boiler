import { cn } from "@/lib/cn";

/**
 * BOILER wordmark. A brokerage nameplate, not a coin logo: heavy grotesk, a
 * rule under it, and an industrial furnace glyph that reads as a valve rather
 * than a flame.
 */
export function Wordmark({
  className,
  size = "md",
  withRule = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withRule?: boolean;
}) {
  const sizes = {
    sm: "text-[15px] tracking-[0.14em]",
    md: "text-2xl tracking-[0.12em]",
    lg: "text-5xl tracking-[0.06em]",
    xl: "text-[clamp(3rem,13vw,10rem)] tracking-[0.02em]",
  } as const;
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className={cn("headline leading-none text-cream", sizes[size])}>BOILER</span>
      {withRule && <span className="mt-1 h-[2px] w-full bg-ox2" />}
    </span>
  );
}

export function ValveMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-5 w-5", className)} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 4.5v5M16 22.5v5M4.5 16h5M22.5 16h5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}
