export function DemoBanner({ what, real }: { what: string; real?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-pink2/60 bg-pink2/10 px-3 py-2">
      <span className="mono-tight text-[9px] tracking-[0.2em] text-pink2">SEEDED</span>
      <p className="mono-tight text-[10px] leading-relaxed text-cream2">
        {what}
        {real ? <span className="text-steel"> {real}</span> : null}
      </p>
    </div>
  );
}

export function FlagBanner({ note }: { note: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-brass/50 bg-brass/10 px-3 py-2">
      <span className="mono-tight text-[9px] tracking-[0.2em] text-brass">FEATURE FLAGGED OFF</span>
      <p className="mono-tight text-[10px] leading-relaxed text-cream2">{note}</p>
    </div>
  );
}
