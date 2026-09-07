export function usd(n: number | null | undefined, opts: { compact?: boolean; sig?: number } = {}): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (opts.compact && abs >= 1000) {
    const units = [
      { v: 1e15, s: "Q" },
      { v: 1e12, s: "T" },
      { v: 1e9, s: "B" },
      { v: 1e6, s: "M" },
      { v: 1e3, s: "K" },
    ];
    for (const u of units) {
      if (abs >= u.v) return `$${(n / u.v).toFixed(abs / u.v >= 100 ? 0 : 1)}${u.s}`;
    }
  }
  if (abs === 0) return "$0.00";
  // Nothing legitimate on this floor is this big. Show it as what it is rather
  // than as a wall of digits.
  if (abs >= 1e18) return `$${n.toExponential(3)}`;
  if (abs < 0.000001) return `$${n.toExponential(2)}`;
  if (abs < 1) return `$${n.toFixed(Math.min(8, Math.max(4, opts.sig ?? 6)))}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function num(n: number | null | undefined, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pct(n: number | null | undefined, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return "—";
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(digits)}%`;
}

export function bps(n: number): string {
  return `${n.toFixed(n % 1 === 0 ? 0 : 1)} bps`;
}

export function addr(a: string, size = 4): string {
  if (!a || a.length < 10) return a || "—";
  return `${a.slice(0, 2 + size)}…${a.slice(-size)}`;
}

export function duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, "0")}m`;
}

export function ago(ms: number): string {
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 45) return `${s.toFixed(0)}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function stamp(ms: number): string {
  return new Date(ms).toISOString().replace("T", " ").slice(0, 19) + "Z";
}

export function gwei(wei: string | bigint): string {
  const v = Number(BigInt(wei)) / 1e9;
  if (!Number.isFinite(v)) return "—";
  if (v < 0.001) return `${(v * 1000).toFixed(3)} mgwei`;
  return `${v.toFixed(4)} gwei`;
}
