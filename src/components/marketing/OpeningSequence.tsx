"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 8:29 AM. The room is dark, a printer runs, three lines land, the shutter goes
 * up. Steps timing, no easing: this is a fax machine, not a fade.
 */
const LINES = [
  { text: "THE FLOOR IS OPEN.", cls: "text-term crt-bloom text-[clamp(1.1rem,3.4vw,2.2rem)] cond" },
  { text: "BOILER", cls: "text-cream headline text-[clamp(3rem,15vw,11rem)] leading-none" },
  {
    text: "THE SPECULATIVE MARKET FLOOR OF ROBINHOOD CHAIN.",
    cls: "text-steel mono-tight text-[clamp(0.6rem,1.5vw,0.85rem)] tracking-[0.22em]",
  },
];

export function OpeningSequence() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const skip = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(skip);
    }
    const timers = [
      setTimeout(() => setStep(1), 420),
      setTimeout(() => setStep(2), 980),
      setTimeout(() => setStep(3), 1560),
      setTimeout(() => setDone(true), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pitch"
      role="presentation"
      onClick={() => setDone(true)}
    >
      <div className="tex-scan pointer-events-none absolute inset-0" />
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        {LINES.map((l, i) => (
          <p key={l.text} className={cn(l.cls, step > i ? "print-in" : "invisible")}>
            {l.text}
          </p>
        ))}
      </div>
      <button
        onClick={() => setDone(true)}
        className="absolute bottom-6 right-6 mono-tight text-[10px] tracking-[0.2em] text-steel2 hover:text-cream"
      >
        SKIP →
      </button>
    </div>
  );
}
