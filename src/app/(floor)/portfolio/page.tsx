import type { Metadata } from "next";
import { scanMarkets } from "@/lib/chain/scanner";
import { WalletPanel } from "@/components/floor/WalletPanel";
import { ChainStrip } from "@/components/shell/ChainStrip";

export const metadata: Metadata = { title: "Portfolio" };
export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const snap = await scanMarkets();
  return (
    <div>
      <ChainStrip snap={snap} />
      <div className="px-4 py-8">
        <header className="mb-5 max-w-3xl">
          <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">YOUR BOOK.</h1>
          <p className="mt-2 mono-tight text-[11px] leading-relaxed text-steel">
            Read directly from your wallet with one multicall against Robinhood Chain. BOILER holds nothing, custodies
            nothing, and will never ask you for a seed phrase or a private key.
          </p>
        </header>
        <WalletPanel markets={snap.markets} trades={snap.trades} />
      </div>
    </div>
  );
}
