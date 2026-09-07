import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "key" | "ghost" | "stamp" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 cond text-[13px] leading-none px-4 py-3 border transition-[transform,background-color,color] duration-75 active:translate-y-[1px] select-none";

const variants: Record<Variant, string> = {
  key: "bg-cream text-pitch border-cream hover:bg-term hover:border-term shadow-[0_3px_0_0_rgba(0,0,0,0.55)] active:shadow-[0_1px_0_0_rgba(0,0,0,0.55)]",
  ghost: "bg-transparent text-cream border-ash2 hover:border-cream hover:text-term",
  stamp: "bg-transparent text-ox2 border-ox2 border-2 hover:bg-ox2 hover:text-cream",
  danger: "bg-ox text-cream border-ox hover:bg-ox2 hover:border-ox2",
};

export function Btn({
  href,
  variant = "key",
  className,
  children,
  ...rest
}: {
  href?: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
