import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export function FloorFooter() {
  return (
    <footer className="mt-16 border-t border-ash2 bg-char">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-end justify-between gap-6 px-4 py-8">
        <div>
          <Wordmark size="md" />
          <p className="mt-2 mono-tight text-[10px] tracking-[0.16em] text-steel2">ROBINHOOD CHAIN · 4663</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 mono-tight text-[11px] tracking-[0.14em] text-steel">
          <Link href="/floor" className="hover:text-cream">FLOOR</Link>
          <Link href="/pinks" className="hover:text-cream">PINK SHEETS</Link>
          <Link href="/books" className="hover:text-cream">THE BOOKS</Link>
          <Link href="/boil" className="hover:text-cream">$BOIL</Link>
          <Link href="/methodology" className="hover:text-cream">METHODOLOGY</Link>
          <Link href="/terms" className="hover:text-cream">TERMS</Link>
        </nav>
      </div>
      <div className="border-t border-ash2 px-4 py-3">
        <p className="cond text-sm tracking-[0.1em] text-cream/60">THE FLOOR NEVER SLEEPS.</p>
      </div>
    </footer>
  );
}
