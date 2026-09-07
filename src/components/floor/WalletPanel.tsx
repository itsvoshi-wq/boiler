"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useChainId, useConnect, useDisconnect, usePublicClient, useSwitchChain } from "wagmi";
import type { Address } from "viem";
import { ERC20_ABI } from "@/lib/chain/swap";
import { ROBINHOOD_CHAIN_ID } from "@/lib/chain/chains";
import { addr, num, usd } from "@/lib/format";
import type { Market, Trade } from "@/lib/domain/types";
import { Empty } from "@/components/ui/Empty";
import { cn } from "@/lib/cn";

type Holding = { market: Market; balance: number; value: number };

/**
 * Real balances, read from the connected wallet with one multicall. No
 * simulated portfolio, no demo positions: if the wallet is empty, the page says
 * the wallet is empty.
 */
export function WalletPanel({ markets, trades }: { markets: Market[]; trades: Trade[] }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();

  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [nativeBalance, setNativeBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !publicClient || markets.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const unique = new Map<string, Market>();
        for (const m of markets) if (!unique.has(m.base.address)) unique.set(m.base.address, m);
        const list = [...unique.values()].slice(0, 60);

        const results = await publicClient.multicall({
          contracts: list.map((m) => ({
            address: m.base.address as Address,
            abi: ERC20_ABI,
            functionName: "balanceOf" as const,
            args: [address] as const,
          })),
          allowFailure: true,
        });

        const native = await publicClient.getBalance({ address });
        if (cancelled) return;
        setNativeBalance(Number(native) / 1e18);

        const rows: Holding[] = [];
        results.forEach((r, i) => {
          const m = list[i];
          if (!m || r.status !== "success") return;
          const bal = Number(r.result as bigint) / 10 ** m.base.decimals;
          if (bal <= 0) return;
          rows.push({ market: m, balance: bal, value: bal * m.price });
        });
        rows.sort((a, b) => b.value - a.value);
        setHoldings(rows);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Balance read failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, publicClient, markets]);

  if (!isConnected) {
    return (
      <div className="border border-ash2 bg-char p-5">
        <p className="cond text-2xl text-cream">NO WALLET ON THE DESK.</p>
        <p className="mt-1 mono-tight text-[11px] text-steel">
          BOILER never takes custody and never asks for a seed phrase. Connect and it reads balances, nothing else.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {connectors.length === 0 && (
            <span className="mono-tight text-[11px] text-steel2">No injected wallet detected in this browser.</span>
          )}
          {connectors.map((c) => (
            <button
              key={c.uid}
              onClick={() => connect({ connector: c })}
              disabled={isPending}
              className="border border-cream bg-cream px-4 py-2.5 cond text-[13px] text-pitch hover:border-term hover:bg-term"
            >
              CONNECT {c.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const wrongChain = chainId !== ROBINHOOD_CHAIN_ID;
  const total = (holdings ?? []).reduce((a, h) => a + h.value, 0);
  const mine = trades.filter((t) => address && t.taker.toLowerCase() === address.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-ash2 bg-char px-3 py-2.5">
        <div className="mono-tight text-[11px]">
          <span className="tracking-[0.16em] text-steel2">WALLET </span>
          <span className="text-cream">{addr(address ?? "", 6)}</span>
          {nativeBalance != null && (
            <span className="ml-3 text-steel">{nativeBalance.toFixed(5)} ETH for gas</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {wrongChain && (
            <button
              onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}
              className="border border-red px-3 py-1.5 cond text-[12px] text-red hover:bg-red hover:text-pitch"
            >
              WRONG CHAIN · SWITCH TO 4663
            </button>
          )}
          <button
            onClick={() => disconnect()}
            className="border border-ash2 px-3 py-1.5 mono-tight text-[10px] tracking-[0.14em] text-steel hover:border-cream hover:text-cream"
          >
            DISCONNECT
          </button>
        </div>
      </div>

      {error && <p className="mono-tight text-[11px] text-red">{error}</p>}

      <div className="border border-ash2">
        <div className="flex items-baseline justify-between border-b border-ash2 px-3 py-2">
          <span className="label">POSITIONS</span>
          <span className="cond text-xl tabular text-cream">{usd(total)}</span>
        </div>
        {holdings == null ? (
          <p className="px-3 py-6 mono-tight text-[11px] text-steel2">READING BALANCES…</p>
        ) : holdings.length === 0 ? (
          <Empty title="YOU'RE FLAT." sub="No balances in any market currently on the tape." className="m-3" />
        ) : (
          <table className="w-full">
            <tbody>
              {holdings.map((h) => (
                <tr key={h.market.id} className="border-b border-ash2/50 last:border-0">
                  <td className="px-3 py-2">
                    <Link href={`/market/${h.market.symbol}`} className="cond text-[15px] text-cream hover:text-term">
                      {h.market.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[12px] text-cream2">
                    {h.balance.toPrecision(6)}
                  </td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[12px] text-steel">
                    ${h.market.price.toPrecision(6)}
                  </td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[13px] text-cream">{usd(h.value)}</td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right mono-tight tabular text-[12px]",
                      h.market.priceChangePct >= 0 ? "text-term" : "text-red",
                    )}
                  >
                    {h.market.priceChangePct >= 0 ? "+" : ""}
                    {h.market.priceChangePct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border border-ash2">
        <div className="flex items-baseline justify-between border-b border-ash2 px-3 py-2">
          <span className="label">YOUR PRINTS IN THE SCAN WINDOW</span>
          <span className="mono-tight text-[10px] text-steel2">{num(mine.length)}</span>
        </div>
        {mine.length === 0 ? (
          <Empty
            title="NOTHING ON THE TAPE."
            sub="No swaps from this wallet inside the current block window. That window is minutes, not days."
            className="m-3"
          />
        ) : (
          <table className="w-full">
            <tbody>
              {mine.map((t) => (
                <tr key={`${t.txHash}-${t.blockNumber}`} className="border-b border-ash2/50 last:border-0">
                  <td className={cn("px-3 py-2 mono-tight text-[11px]", t.side === "BUY" ? "text-term" : "text-red")}>
                    {t.side}
                  </td>
                  <td className="px-3 py-2 cond text-[14px] text-cream">{t.symbol}</td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-cream2">
                    {t.baseAmount.toPrecision(6)}
                  </td>
                  <td className="px-3 py-2 text-right mono-tight tabular text-[11px] text-cream">
                    {usd(t.quoteAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
