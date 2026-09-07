import { ADDRESSES, EXPLORER } from "@/lib/chain/chains";
import { rpcUrlPublic } from "@/lib/chain/public";
import { duration, gwei, num } from "@/lib/format";
import type { MarketSnapshot } from "@/lib/domain/types";

/**
 * The strip that makes the honesty checkable at a glance: which chain, which
 * block, how wide the window is, and how long ago it was read.
 */
export function ChainStrip({ snap }: { snap: MarketSnapshot }) {
  const items: [string, React.ReactNode][] = [
    ["CHAIN", `ROBINHOOD ${snap.chain.id}`],
    [
      "BLOCK",
      <a
        key="b"
        href={EXPLORER.block(snap.chain.blockNumber)}
        target="_blank"
        rel="noreferrer"
        className="hover:text-term"
      >
        #{num(snap.chain.blockNumber)}
      </a>,
    ],
    ["BLOCK TIME", `${snap.chain.blockTimeSec.toFixed(2)}s`],
    ["GAS", gwei(snap.chain.gasPriceWei)],
    ["WINDOW", `${num(snap.block.to - snap.block.from + 1)} blk / ${duration(snap.windowSeconds)}`],
    ["MARKETS", num(snap.markets.length)],
    ["RPC", rpcUrlPublic().replace("https://", "")],
    [
      "FACTORY",
      <a key="f" href={EXPLORER.address(ADDRESSES.v3Factory)} target="_blank" rel="noreferrer" className="hover:text-term">
        {ADDRESSES.v3Factory.slice(0, 10)}…
      </a>,
    ],
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-ash2 bg-char px-3 py-1.5">
      {items.map(([k, v]) => (
        <span key={k} className="mono-tight text-[10px]">
          <span className="tracking-[0.16em] text-steel2">{k} </span>
          <span className="text-cream2">{v}</span>
        </span>
      ))}
      {snap.degraded && (
        <span className="mono-tight text-[10px] text-red">DEGRADED · {snap.degradedReason}</span>
      )}
    </div>
  );
}
