import type { Metadata } from "next";
import { scanMarkets } from "@/lib/chain/scanner";
import { WalletPanel } from "@/components/floor/WalletPanel";
import { Panel } from "@/components/ui/Panel";
import { ChainStrip } from "@/components/shell/ChainStrip";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const snap = await scanMarkets();
  return (
    <div>
      <ChainStrip snap={snap} />
      <div className="px-4 py-8">
        <header className="mb-5 max-w-3xl">
          <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">ORDERS.</h1>
          <p className="mt-2 mono-tight text-[11px] leading-relaxed text-steel">
            Every BOILER order is a swap you signed yourself, submitted straight to Uniswap V3 SwapRouter02 on
            Robinhood Chain. There is no internal order book holding your funds, so an order is either onchain or it
            does not exist.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <WalletPanel markets={snap.markets} trades={snap.trades} />

          <div className="space-y-4">
            <Panel label="ORDER LIFECYCLE">
              <ol className="space-y-2 mono-tight text-[11px] leading-relaxed text-cream2">
                {[
                  "Quote. Pool state is read and an indicative output is computed inside the current tick.",
                  "Guard. A minimum output is set from your slippage tolerance. Never zero, never optional.",
                  "Approve. The router is approved for the exact amount of this order, not an unlimited allowance.",
                  "Simulate. The exact calldata is run through eth_call against your address. A revert stops here.",
                  "Sign. You sign. BOILER never holds a key.",
                  "Receipt. The ticket prints with the transaction hash and a link to the explorer.",
                ].map((s, i) => (
                  <li key={s} className="flex gap-3 border-b border-ash2/40 pb-2">
                    <span className="cond text-lg text-ox2">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Panel>

            <Panel label="WHY REJECTIONS SAY WHAT THEY SAY">
              <p className="mono-tight text-[10px] leading-relaxed text-steel">
                A rejected order shows the real reason: the revert string, the failed guard, the wrong chain. It never
                shows a generic apology, and it never retries with a wider slippage tolerance on your behalf.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
