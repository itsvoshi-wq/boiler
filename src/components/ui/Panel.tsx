import { cn } from "@/lib/cn";

export function Panel({
  label,
  right,
  children,
  className,
  bodyClassName,
  tone = "dark",
}: {
  label?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "dark" | "paper" | "pink";
}) {
  const toneClass =
    tone === "paper" ? "tex-paper paper-edge" : tone === "pink" ? "tex-pink paper-edge" : "bg-char border border-ash2";
  return (
    <section className={cn("relative", toneClass, className)}>
      {(label || right) && (
        <header
          className={cn(
            "flex items-center justify-between gap-3 border-b px-3 py-2",
            tone === "dark" ? "border-ash2" : "border-black/20",
          )}
        >
          {label && (
            <h2
              className={cn(
                "mono-tight text-[10px] uppercase tracking-[0.2em]",
                tone === "dark" ? "text-steel" : "text-black/60",
              )}
            >
              {label}
            </h2>
          )}
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className={cn("p-3", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-ash2", className)} />;
}
