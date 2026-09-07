import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main"
      className="tex-grain relative flex min-h-screen flex-col items-center justify-center bg-pitch px-6 text-center"
    >
      <div className="lamp pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(184,147,63,0.14),transparent_65%)]" />
      <p className="relative mono-tight text-[11px] tracking-[0.3em] text-steel2">404</p>
      <h1 className="relative mt-3 headline text-[clamp(3rem,14vw,9rem)] leading-none text-cream">WRONG FLOOR.</h1>
      <p className="relative mt-4 max-w-md mono-tight text-[11px] leading-relaxed text-steel">
        Nothing trades here. Whatever you were looking for is on another desk, or it never existed.
      </p>
      <Link
        href="/floor"
        className="relative mt-8 border border-cream bg-cream px-6 py-3 cond text-[14px] text-pitch hover:border-term hover:bg-term"
      >
        BACK TO THE DESK
      </Link>
    </main>
  );
}
