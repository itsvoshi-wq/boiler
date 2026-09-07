import type { Metadata } from "next";
import { fetchNewPools, scanMarkets } from "@/lib/chain/scanner";
import { multicall } from "@/lib/chain/multicall";
import { SELECTORS, decodeString, decodeUint } from "@/lib/chain/abi";
import { classifyAsset } from "@/lib/domain/classify";
import { ADDRESSES, EXPLORER } from "@/lib/chain/chains";
import { duration, num } from "@/lib/format";
import { ChainStrip } from "@/components/shell/ChainStrip";
import { ClassBadge } from "@/components/ui/Badge";
import { SourceChip } from "@/components/ui/Provenance";
import { Empty } from "@/components/ui/Empty";

export const metadata: Metadata = { title: "New Issues" };
export const dynamic = "force-dynamic";

export default async function NewIssuesPage() {
  const snap = await scanMarkets();
  const pools = (await fetchNewPools(200_000)).slice(0, 60);

  const tokens = [...new Set(pools.flatMap((p) => [p.token0, p.token1]))];
  const calls = tokens.flatMap((t) => [
    { target: t, data: SELECTORS.symbol },
    { target: t, data: SELECTORS.name },
    { target: t, data: SELECTORS.decimals },
  ]);
  const res = await multicall(calls);
  const meta = new Map<string, { symbol: string; name: string; decimals: number }>();
  tokens.forEach((t, i) => {
    const [s, n, d] = res.slice(i * 3, i * 3 + 3);
    meta.set(t, {
      symbol: decodeString(s?.data ?? null) || t.slice(0, 8),
      name: decodeString(n?.data ?? null) || "",
      decimals: Number(decodeUint(d?.data ?? null)) || 18,
    });
  });

  const blockTime = snap.chain.blockTimeSec || 0.1;

  return (
    <div>
      <ChainStrip snap={snap} />
      <div className="px-4 py-8">
        <header className="max-w-3xl">
          <div className="flex items-center gap-3">
            <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">NEW ON THE TAPE.</h1>
            <SourceChip source="CHAIN" />
          </div>
          <p className="mt-2 mono-tight text-[11px] leading-relaxed text-steel">
            Every pool below was created by the Uniswap V3 factory at{" "}
            <a href={EXPLORER.address(ADDRESSES.v3Factory)} target="_blank" rel="noreferrer" className="text-cream2 hover:text-term">
              {ADDRESSES.v3Factory.slice(0, 12)}…
            </a>{" "}
            inside the last 200,000 blocks, read from PoolCreated events. These are not IPOs, they are not offerings,
            and nothing here has been vetted. A new pool means somebody deployed a pool.
          </p>
        </header>

        {pools.length === 0 ? (
          <div className="mt-6">
            <Empty title="NOTHING NEW." sub="No PoolCreated events in the scanned range." />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto border border-ash2">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="border-b border-ash2">
                  {["PAIR", "CLASS", "FEE TIER", "CREATED", "AGE", "POOL"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-3 py-2 mono-tight text-[9px] font-normal tracking-[0.16em] text-steel2 ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pools.map((p) => {
                  const a = meta.get(p.token0);
                  const b = meta.get(p.token1);
                  const cls = classifyAsset(a?.symbol ?? "", a?.name ?? "");
                  const ageBlocks = snap.chain.blockNumber - p.block;
                  return (
                    <tr key={p.pool} className="border-b border-ash2/50 last:border-0 hover:bg-char2">
                      <td className="px-3 py-2">
                        <span className="cond text-[15px] text-cream">
                          {a?.symbol ?? "?"} / {b?.symbol ?? "?"}
                        </span>
                        <p className="mono-tight text-[9px] text-steel2">{(a?.name ?? "").slice(0, 44)}</p>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <ClassBadge assetClass={cls} />
                      </td>
                      <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-cream2">
                        {(p.fee / 10_000).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-steel">
                        #{num(p.block)}
                      </td>
                      <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-cream2">
                        {duration(ageBlocks * blockTime)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <a
                          href={EXPLORER.address(p.pool)}
                          target="_blank"
                          rel="noreferrer"
                          className="mono-tight text-[10px] text-steel2 hover:text-term"
                        >
                          {p.pool.slice(0, 12)}…
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 max-w-3xl mono-tight text-[10px] leading-relaxed text-steel2">
          BOILER does not call this an IPO or a first trade unless that is what the instrument actually is. A pool
          creation is a pool creation.
        </p>
      </div>
    </div>
  );
}
