"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { useAccount, useChainId, useConnect, usePublicClient, useSendTransaction, useSwitchChain } from "wagmi";
import { ROBINHOOD_CHAIN_ID, ADDRESSES, EXPLORER } from "@/lib/chain/chains";
import { ERC20_ABI, approveData, buildSwap, minOutFor } from "@/lib/chain/swap";
import { FLAGS } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { bps as bpsFmt, usd } from "@/lib/format";
import type { Market, RiskFlag } from "@/lib/domain/types";
import type { FeeQuote } from "@/lib/domain/fees";

type QuoteResponse = {
  ok: boolean;
  error?: string;
  quote?: {
    amountIn: string;
    amountOut: string;
    amountOutHuman: number;
    minAmountOut: string;
    executedPrice: number;
    priceImpactBps: number;
    exactWithinTick: boolean;
    caveat: string;
  };
  fees?: FeeQuote;
  risk?: RiskFlag[];
};

type Stage = "IDLE" | "QUOTING" | "APPROVING" | "SIMULATING" | "SIGNING" | "FILLED" | "REJECTED";

export function OrderTicket({ market, creatorBps = 0 }: { market: Market; creatorBps?: number }) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("100");
  const [slippage, setSlippage] = useState(50);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [stage, setStage] = useState<Stage>("IDLE");
  const [message, setMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const numeric = Number(amount);
  const valid = Number.isFinite(numeric) && numeric > 0;

  const tokenIn = (side === "BUY" ? market.quote.address : market.base.address) as Address;
  const tokenOut = (side === "BUY" ? market.base.address : market.quote.address) as Address;
  const inDecimals = side === "BUY" ? market.quote.decimals : market.base.decimals;
  const inSymbol = side === "BUY" ? market.quote.symbol : market.base.symbol;
  const outSymbol = side === "BUY" ? market.base.symbol : market.quote.symbol;

  useEffect(() => {
    let cancelled = false;
    if (!valid) {
      const clear = setTimeout(() => {
        setQuote(null);
        setStage("IDLE");
      }, 0);
      return () => clearTimeout(clear);
    }
    const t = setTimeout(async () => {
      setStage("QUOTING");
      try {
        const res = await fetch("/api/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            marketId: market.id,
            side,
            amount: numeric,
            creatorBps,
            slippageBps: slippage,
          }),
        });
        const json: QuoteResponse = await res.json();
        if (!cancelled) {
          setQuote(json);
          setStage("IDLE");
        }
      } catch {
        if (!cancelled) {
          setQuote({ ok: false, error: "Quote service unreachable." });
          setStage("IDLE");
        }
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [market.id, side, numeric, slippage, creatorBps, valid]);

  const amountInWei = useMemo(
    () => (valid ? BigInt(Math.floor(numeric * 10 ** inDecimals)) : 0n),
    [numeric, inDecimals, valid],
  );

  const submit = useCallback(async () => {
    setMessage(null);
    setTxHash(null);
    if (!FLAGS.liveExecution) {
      setStage("REJECTED");
      setMessage("ORDER REJECTED. Live execution is switched off in this deployment.");
      return;
    }
    if (!isConnected || !address) {
      const first = connectors[0];
      if (first) connect({ connector: first });
      return;
    }
    if (chainId !== ROBINHOOD_CHAIN_ID) {
      switchChain({ chainId: ROBINHOOD_CHAIN_ID });
      setMessage("Wrong chain. Switch to Robinhood Chain 4663 and send it again.");
      return;
    }
    if (!publicClient || !quote?.quote) return;

    try {
      const amountOut = BigInt(quote.quote.amountOut);
      const minOut = minOutFor(amountOut, slippage);
      if (minOut <= 0n) throw new Error("ORDER REJECTED. Quote produced no output.");

      // 1. Approval, exact amount, never unlimited by default.
      setStage("APPROVING");
      const allowance = (await publicClient.readContract({
        address: tokenIn,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, ADDRESSES.swapRouter02 as Address],
      })) as bigint;

      if (allowance < amountInWei) {
        const approveHash = await sendTransactionAsync({
          to: tokenIn,
          data: approveData(ADDRESSES.swapRouter02 as Address, amountInWei),
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // 2. Simulate the exact calldata before asking for a signature.
      setStage("SIMULATING");
      const plan = buildSwap({
        tokenIn,
        tokenOut,
        feePips: market.pool.feePips,
        amountIn: amountInWei,
        amountOutMinimum: minOut,
        recipient: address,
      });
      await publicClient.call({ account: address, to: plan.router, data: plan.data });

      // 3. Sign.
      setStage("SIGNING");
      const hash = await sendTransactionAsync({ to: plan.router, data: plan.data });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(receipt.transactionHash);
      setStage(receipt.status === "success" ? "FILLED" : "REJECTED");
      if (receipt.status !== "success") setMessage("ORDER REJECTED. The transaction reverted on chain.");
    } catch (err) {
      setStage("REJECTED");
      const raw = err instanceof Error ? err.message : String(err);
      setMessage(`ORDER REJECTED. ${raw.split("\n")[0]}`);
    }
  }, [
    isConnected,
    address,
    connectors,
    connect,
    chainId,
    switchChain,
    publicClient,
    quote,
    slippage,
    tokenIn,
    tokenOut,
    market.pool.feePips,
    amountInWei,
    sendTransactionAsync,
  ]);

  const fees = quote?.fees;
  const q = quote?.quote;

  if (stage === "FILLED" && txHash) {
    return (
      <div className="tex-paper paper-edge on-paper print-in relative p-4">
        <div className="flex items-baseline justify-between border-b border-black/40 pb-2">
          <span className="headline text-2xl text-black">FILLED.</span>
          <span className="mono-tight text-[10px] text-black/60">BOILER TICKET</span>
        </div>
        <dl className="mt-3 space-y-1 mono-tight text-[11px] text-black/80">
          <Row k={side === "BUY" ? "BOUGHT" : "SOLD"} v={`${outSymbol}`} />
          <Row k="PAID" v={`${amount} ${inSymbol}`} />
          <Row k="EST. RECEIVED" v={`${q?.amountOutHuman.toPrecision(8) ?? "—"} ${outSymbol}`} />
          <Row k="MIN ACCEPTED" v={`${q ? (Number(q.minAmountOut) / 10 ** (side === "BUY" ? market.base.decimals : market.quote.decimals)).toPrecision(8) : "—"}`} />
          <Row k="POOL FEE" v={usd(fees?.poolFee ?? 0)} />
          <Row k="PROTOCOL FEE" v={`${usd(fees?.protocolFee ?? 0)} (not collected, no contract deployed)`} />
          <Row k="TX" v={txHash.slice(0, 18) + "…"} />
        </dl>
        <a
          href={EXPLORER.tx(txHash)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block border-2 border-black px-3 py-1.5 cond text-[12px] text-black hover:bg-black hover:text-paper"
        >
          VIEW ON CHAIN
        </a>
        <button
          onClick={() => {
            setStage("IDLE");
            setTxHash(null);
          }}
          className="ml-2 mt-3 inline-block border border-black/40 px-3 py-1.5 cond text-[12px] text-black/70 hover:border-black"
        >
          NEW TICKET
        </button>
      </div>
    );
  }

  return (
    <div className="border border-ash2 bg-char">
      <div className="grid grid-cols-2">
        {(["BUY", "SELL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "border-b px-3 py-2.5 cond text-[14px] transition-colors",
              side === s
                ? s === "BUY"
                  ? "border-term bg-money text-term"
                  : "border-red bg-ox text-cream"
                : "border-ash2 text-steel hover:text-cream",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-3">
        <label className="block">
          <span className="label">SIZE ({inSymbol})</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="mt-1 w-full border border-ash2 bg-pitch px-3 py-2.5 mono-tight tabular text-lg text-cream focus:border-term focus:outline-none"
          />
        </label>

        <div>
          <span className="label">SLIPPAGE GUARD</span>
          <div className="mt-1 flex gap-1">
            {[10, 30, 50, 100, 300].map((b) => (
              <button
                key={b}
                onClick={() => setSlippage(b)}
                className={cn(
                  "flex-1 border px-2 py-1.5 mono-tight text-[11px]",
                  slippage === b ? "border-term text-term" : "border-ash2 text-steel hover:text-cream",
                )}
              >
                {(b / 100).toFixed(b % 100 === 0 ? 0 : 1)}%
              </button>
            ))}
          </div>
        </div>

        <dl className="space-y-1 border-t border-ash2 pt-3 mono-tight text-[11px]">
          <Row dark k="ROUTE" v={`UNIV3 ${market.symbol}/${market.quote.symbol} ${(market.pool.feePips / 10_000).toFixed(2)}%`} />
          <Row dark k="EST. OUTPUT" v={q ? `${q.amountOutHuman.toPrecision(8)} ${outSymbol}` : "—"} />
          <Row dark k="EXECUTED PRICE" v={q ? `$${q.executedPrice.toPrecision(6)}` : "—"} />
          <Row
            dark
            k="PRICE IMPACT"
            v={q ? `${(q.priceImpactBps / 100).toFixed(3)}%` : "—"}
            tone={q && q.priceImpactBps > 300 ? "bad" : undefined}
          />
          <Row dark k="MIN RECEIVED" v={q ? `${(Number(q.minAmountOut) / 10 ** (side === "BUY" ? market.base.decimals : market.quote.decimals)).toPrecision(8)}` : "—"} />
        </dl>

        {/* The protocol and desk fees are the configured model, and no BOILER
            contract is deployed to collect them. Showing them on a ticket
            without saying that would be the exact trick this product is
            named after. */}
        <dl className="space-y-1 border-t border-ash2 pt-3 mono-tight text-[11px]">
          <Row dark k={`POOL FEE (${bpsFmt(fees?.poolFeeBps ?? 0)})`} v={usd(fees?.poolFee ?? 0)} />
          <Row
            dark
            k={`PROTOCOL FEE (${bpsFmt(fees?.protocolBps ?? 0)})`}
            v={
              <span>
                {usd(fees?.protocolFee ?? 0)}{" "}
                <span className="text-brass">NOT CHARGED</span>
              </span>
            }
          />
          <Row
            dark
            k={`DESK FEE (${bpsFmt(fees?.creatorBps ?? 0)})`}
            v={
              <span>
                {usd(fees?.creatorFee ?? 0)} <span className="text-brass">NOT CHARGED</span>
              </span>
            }
          />
          <Row dark k="YOU PAY TODAY" v={usd(fees?.poolFee ?? 0)} strong />
        </dl>
        <p className="mono-tight text-[9px] leading-relaxed text-brass">
          Only the Uniswap pool fee leaves your wallet. The protocol and desk fees above are the published model, and
          no BOILER contract is deployed to collect them, so this swap routes straight to SwapRouter02 and BOILER takes
          nothing. When that changes it changes here first.
        </p>

        {quote?.risk && quote.risk.length > 0 && (
          <ul className="space-y-1 border-t border-ash2 pt-3">
            {quote.risk.map((r) => (
              <li
                key={r.code}
                className={cn(
                  "border-l-2 pl-2 mono-tight text-[10px] leading-relaxed",
                  r.severity === "STOP" ? "border-red text-red" : r.severity === "WARN" ? "border-brass text-brass" : "border-steel2 text-steel",
                )}
              >
                <strong className="tracking-[0.14em]">{r.label}</strong> · {r.detail}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={submit}
          disabled={!valid || stage === "QUOTING"}
          className={cn(
            "w-full border px-4 py-3 cond text-[15px] transition-colors disabled:opacity-40",
            side === "BUY"
              ? "border-cream bg-cream text-pitch hover:border-term hover:bg-term"
              : "border-red bg-red text-pitch hover:bg-ox2 hover:text-cream",
          )}
        >
          {stage === "APPROVING"
            ? "APPROVING…"
            : stage === "SIMULATING"
              ? "SIMULATING…"
              : stage === "SIGNING"
                ? "WAITING ON SIGNATURE…"
                : !isConnected
                  ? "CONNECT WALLET"
                  : side === "BUY"
                    ? "SEND IT"
                    : "PUT IT ON THE BOOK"}
        </button>

        {message && <p className="mono-tight text-[11px] leading-relaxed text-red">{message}</p>}

        <p className="mono-tight text-[9px] leading-relaxed text-steel2">
          {q?.caveat ??
            "Quote is indicative until simulated. BOILER simulates the exact calldata against your address before asking for a signature, sets a non-zero minimum output, and approves the exact amount rather than an unlimited allowance."}
        </p>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  dark,
  strong,
  tone,
}: {
  k: string;
  v: React.ReactNode;
  dark?: boolean;
  strong?: boolean;
  tone?: "bad";
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
      <dt className={cn("min-w-0 tracking-[0.12em]", dark ? "text-steel2" : "text-black/50")}>{k}</dt>
      <dd
        className={cn(
          "tabular text-right",
          tone === "bad" ? "text-red" : dark ? (strong ? "text-cream" : "text-cream2") : "text-black",
        )}
      >
        {v}
      </dd>
    </div>
  );
}
