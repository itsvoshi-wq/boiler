"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Wordmark, ValveMark } from "@/components/brand/Wordmark";

const PRIMARY = [
  { href: "/floor", label: "FLOOR" },
  { href: "/pinks", label: "PINKS" },
  { href: "/desks", label: "DESKS" },
  { href: "/calls", label: "CALLS" },
  { href: "/books", label: "BOOKS" },
];

const SECONDARY = [
  { href: "/new-issues", label: "NEW ISSUES" },
  { href: "/leaderboards", label: "LEADERBOARDS" },
  { href: "/strategies", label: "STRATEGIES" },
  { href: "/portfolio", label: "PORTFOLIO" },
  { href: "/orders", label: "ORDERS" },
  { href: "/automation", label: "AUTOMATION" },
  { href: "/brokers", label: "BROKERS" },
  { href: "/boil", label: "$BOIL" },
];

export function FloorNav() {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-ash2 bg-pitch/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-3 py-2">
        <Link href="/" className="flex items-center gap-2 pr-3">
          <ValveMark className="text-ox2" />
          <Wordmark size="sm" withRule={false} />
        </Link>

        <nav className="flex items-center gap-0 overflow-x-auto" aria-label="Floor">
          {PRIMARY.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "border-b-2 px-3 py-2 cond text-[13px] whitespace-nowrap transition-colors",
                active(l.href)
                  ? "border-term text-term"
                  : "border-transparent text-cream/70 hover:border-cream/40 hover:text-cream",
              )}
            >
              {l.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-ash2" />
          {SECONDARY.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-2.5 py-2 mono-tight text-[10px] tracking-[0.14em] whitespace-nowrap transition-colors",
                active(l.href) ? "text-term" : "text-steel hover:text-cream",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/books"
            className="hidden border border-ash2 px-3 py-2 mono-tight text-[10px] tracking-[0.16em] text-steel hover:border-cream hover:text-cream md:inline-block"
          >
            SEE THE BOOKS
          </Link>
          <Link
            href="/floor"
            className="border border-cream bg-cream px-3 py-2 cond text-[12px] text-pitch hover:bg-term hover:border-term"
          >
            ENTER THE FLOOR
          </Link>
        </div>
      </div>
    </header>
  );
}
