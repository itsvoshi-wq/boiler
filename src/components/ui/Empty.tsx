import { cn } from "@/lib/cn";

/** Savage where it costs nothing, plain where it matters. */
export function Empty({
  title,
  sub,
  className,
}: {
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-1 border border-dashed border-ash2 px-4 py-8", className)}>
      <p className="cond text-xl text-cream/80">{title}</p>
      {sub && <p className="mono-tight text-[11px] text-steel2">{sub}</p>}
    </div>
  );
}
