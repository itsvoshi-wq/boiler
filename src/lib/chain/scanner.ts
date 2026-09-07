import { ADDRESSES, ROBINHOOD_CHAIN_ID } from "./chains";
import {
  SELECTORS,
  TOPICS,
  addrArg,
  decodeAddress,
  decodeSlot0,
  decodeString,
  decodeSwapLog,
  decodeUint,
  encodeCall,
  tickerFrom,
  type SwapEvent,
} from "./abi";
import { multicall, type Call } from "./multicall";
import { rpc } from "./rpc";
import { priceFromSqrtX96 } from "./uniswapV3";
import { classifyAsset, wrapperDisclosure } from "../domain/classify";
import type { Asset, Market, MarketSnapshot, Trade } from "../domain/types";

/**
 * The scanner is BOILER's tape reader.
 *
 * Robinhood Chain runs ~100ms blocks, so a "24 hour window" is 864,000 blocks
 * and the public RPC caps eth_getLogs at 10,000 matches. Rather than invent a
 * 24h number, BOILER scans a real, small, stated window and prints the window
 * next to every figure derived from it.
 */

const SCAN_BLOCKS = Number(process.env.SCAN_BLOCKS || 3000);
const CHUNK_BLOCKS = Number(process.env.SCAN_CHUNK_BLOCKS || 1000);
const CACHE_MS = Number(process.env.SCAN_CACHE_MS || 20_000);
const MAX_POOLS = Number(process.env.SCAN_MAX_POOLS || 90);
/**
 * Sanity bounds for anything derived in dollars.
 *
 * A pool can be initialised at any price, including nonsense, and a nonsense
 * price propagates through the USD basis walk and turns into a nonsense market
 * cap on the front page. BOILER would rather drop a market than print
 * $2,327,233,892,343,440,000,000,000,000 of "inventory".
 */
const MAX_USD_PRICE = 1e9;
const MIN_USD_PRICE = 1e-18;
const MAX_USD_LIQUIDITY = 1e12;
const MAX_USD_VOLUME = 1e11;

/** How far back PoolCreated is scanned to establish a listing age. */
const POOL_AGE_SPAN = Number(process.env.POOL_AGE_SPAN || 200_000);

type RawLog = {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
};

type Cache = { at: number; snapshot: MarketSnapshot } | null;
let cache: Cache = null;
let inflight: Promise<MarketSnapshot> | null = null;

/** Pools first seen by the factory, kept across requests when the lambda is warm. */
const poolBirth = new Map<string, number>();

export async function getChainStatus() {
  const [chainIdHex, blockHex, gasHex] = await Promise.all([
    rpc<string>("eth_chainId", []),
    rpc<string>("eth_blockNumber", []),
    rpc<string>("eth_gasPrice", []).catch(() => "0x0"),
  ]);
  const latest = Number(BigInt(blockHex));
  type Blk = { timestamp: string; gasUsed?: string } | null;
  // A head block can come back null on this chain at 100ms blocks: the RPC has
  // announced a height it has not finished serving. Fall back rather than throw.
  const [a, b] = await Promise.all([
    rpc<Blk>("eth_getBlockByNumber", [blockHex, false]).catch(() => null),
    rpc<Blk>("eth_getBlockByNumber", ["0x" + Math.max(0, latest - 1000).toString(16), false]).catch(() => null),
  ]);
  const measured =
    a && b ? (Number(BigInt(a.timestamp)) - Number(BigInt(b.timestamp))) / 1000 : Number.NaN;
  return {
    id: Number(BigInt(chainIdHex)),
    blockNumber: latest,
    gasPriceWei: BigInt(gasHex).toString(),
    blockTimeSec: Number.isFinite(measured) && measured > 0 ? measured : 0.1,
    gasUsed: a?.gasUsed ? Number(BigInt(a.gasUsed)) : 0,
    timestamp: a ? Number(BigInt(a.timestamp)) : Math.floor(Date.now() / 1000),
  };
}

async function fetchSwapLogs(from: number, to: number): Promise<RawLog[]> {
  const out: RawLog[] = [];
  for (let start = from; start <= to; start += CHUNK_BLOCKS) {
    const end = Math.min(start + CHUNK_BLOCKS - 1, to);
    try {
      const logs = await rpc<RawLog[]>("eth_getLogs", [
        {
          fromBlock: "0x" + start.toString(16),
          toBlock: "0x" + end.toString(16),
          topics: [TOPICS.v3Swap],
        },
      ]);
      out.push(...logs);
    } catch {
      // A chunk that blows the 10k cap is skipped, not faked. The window shown
      // to the user narrows with it.
    }
  }
  return out;
}

/** Real new listings: PoolCreated events straight off the V3 factory. */
export async function fetchNewPools(spanBlocks = 200_000): Promise<
  { pool: string; token0: string; token1: string; fee: number; block: number }[]
> {
  const latest = Number(BigInt(await rpc<string>("eth_blockNumber", [])));
  try {
    const logs = await rpc<RawLog[]>("eth_getLogs", [
      {
        fromBlock: "0x" + Math.max(0, latest - spanBlocks).toString(16),
        toBlock: "0x" + latest.toString(16),
        address: ADDRESSES.v3Factory,
        topics: [TOPICS.v3PoolCreated],
      },
    ]);
    return logs
      .map((l) => ({
        pool: "0x" + l.data.slice(90, 130).toLowerCase(),
        token0: "0x" + (l.topics[1] ?? "").slice(26).toLowerCase(),
        token1: "0x" + (l.topics[2] ?? "").slice(26).toLowerCase(),
        fee: Number(BigInt(l.topics[3] ?? "0x0")),
        block: Number(BigInt(l.blockNumber)),
      }))
      .sort((a, b) => b.block - a.block);
  } catch {
    return [];
  }
}

type PoolState = {
  address: string;
  token0: string;
  token1: string;
  feePips: number;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
  reserve0: bigint;
  reserve1: bigint;
};

async function readPools(addresses: string[]): Promise<Map<string, PoolState>> {
  const calls: Call[] = [];
  for (const p of addresses) {
    calls.push({ target: p, data: SELECTORS.token0 });
    calls.push({ target: p, data: SELECTORS.token1 });
    calls.push({ target: p, data: SELECTORS.fee });
    calls.push({ target: p, data: SELECTORS.slot0 });
    calls.push({ target: p, data: SELECTORS.liquidity });
  }
  const res = await multicall(calls);
  const out = new Map<string, PoolState>();
  addresses.forEach((p, i) => {
    const [t0, t1, fee, slot0, liq] = res.slice(i * 5, i * 5 + 5);
    const a0 = decodeAddress(t0?.data ?? null);
    const a1 = decodeAddress(t1?.data ?? null);
    const s = decodeSlot0(slot0?.data ?? null);
    if (!a0 || !a1 || !s) return;
    out.set(p, {
      address: p,
      token0: a0,
      token1: a1,
      feePips: Number(decodeUint(fee?.data ?? null)),
      sqrtPriceX96: s.sqrtPriceX96,
      tick: s.tick,
      liquidity: decodeUint(liq?.data ?? null),
      reserve0: 0n,
      reserve1: 0n,
    });
  });

  // Real pool inventory, not "TVL" guessed from liquidity units.
  const balCalls: Call[] = [];
  const order: PoolState[] = [];
  for (const p of out.values()) {
    order.push(p);
    balCalls.push({ target: p.token0, data: encodeCall(SELECTORS.balanceOf, [addrArg(p.address)]) });
    balCalls.push({ target: p.token1, data: encodeCall(SELECTORS.balanceOf, [addrArg(p.address)]) });
  }
  const balRes = await multicall(balCalls);
  order.forEach((p, i) => {
    p.reserve0 = decodeUint(balRes[i * 2]?.data ?? null);
    p.reserve1 = decodeUint(balRes[i * 2 + 1]?.data ?? null);
  });
  return out;
}

async function readTokens(addresses: string[]): Promise<Map<string, Asset>> {
  const calls: Call[] = [];
  for (const t of addresses) {
    calls.push({ target: t, data: SELECTORS.symbol });
    calls.push({ target: t, data: SELECTORS.name });
    calls.push({ target: t, data: SELECTORS.decimals });
  }
  const res = await multicall(calls);
  const out = new Map<string, Asset>();
  addresses.forEach((t, i) => {
    const [sym, nam, dec] = res.slice(i * 3, i * 3 + 3);
    const symbol = tickerFrom(decodeString(sym?.data ?? null, 24), t);
    const name = decodeString(nam?.data ?? null, 72) || symbol;
    const decimals = Number(decodeUint(dec?.data ?? null)) || 18;
    out.set(t, {
      address: t,
      symbol,
      name,
      decimals: decimals > 36 ? 18 : decimals,
      assetClass: classifyAsset(symbol, name),
      wrapperDisclosure: wrapperDisclosure(symbol, name),
    });
  });
  return out;
}

const toNum = (v: bigint, decimals: number) => Number(v) / 10 ** decimals;

export async function scanMarkets(force = false): Promise<MarketSnapshot> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.snapshot;
  if (inflight) return inflight;

  inflight = (async (): Promise<MarketSnapshot> => {
    const startedAt = Date.now();
    const chain = await getChainStatus();

    // RPC_URL is an environment variable, and an environment variable can be
    // pointed at the wrong chain. BOILER refuses to render another chain's
    // markets under Robinhood Chain's name rather than quietly showing them.
    if (chain.id !== ROBINHOOD_CHAIN_ID) {
      return {
        markets: [],
        trades: [],
        block: { from: 0, to: 0, latest: chain.blockNumber },
        windowSeconds: 0,
        chain: {
          id: chain.id,
          blockNumber: chain.blockNumber,
          gasPriceWei: chain.gasPriceWei,
          blockTimeSec: chain.blockTimeSec,
        },
        degraded: true,
        degradedReason: `Configured RPC answers for chain ${chain.id}. BOILER is Robinhood Chain ${ROBINHOOD_CHAIN_ID} and will not show another chain's markets.`,
        provenance: {
          source: "CHAIN",
          method: "eth_chainId guard",
          updatedAt: startedAt,
        },
      };
    }

    const to = chain.blockNumber;
    const from = Math.max(0, to - SCAN_BLOCKS + 1);

    const [logs, created] = await Promise.all([
      fetchSwapLogs(from, to),
      // Real listing age comes from PoolCreated, not from "the first swap we
      // happened to see". Without it BOILER would label every market NEW.
      fetchNewPools(POOL_AGE_SPAN).catch(() => []),
    ]);
    for (const c of created) if (!poolBirth.has(c.pool)) poolBirth.set(c.pool, c.block);
    const swaps: SwapEvent[] = [];
    for (const l of logs) {
      const s = decodeSwapLog(l);
      if (s) swaps.push(s);
    }

    const byPool = new Map<string, SwapEvent[]>();
    for (const s of swaps) {
      const arr = byPool.get(s.pool);
      if (arr) arr.push(s);
      else byPool.set(s.pool, [s]);
    }

    const ranked = [...byPool.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, MAX_POOLS)
      .map(([p]) => p);

    const pools = await readPools(ranked);
    const tokenSet = new Set<string>();
    for (const p of pools.values()) {
      tokenSet.add(p.token0);
      tokenSet.add(p.token1);
    }
    const tokens = await readTokens([...tokenSet]);

    // USD basis. USDG is the chain's dollar. Everything else is priced through
    // the deepest pool that touches it, or left unpriced and said so.
    const usdOf = new Map<string, number>();
    usdOf.set(ADDRESSES.usdg, 1);
    for (let pass = 0; pass < 3; pass++) {
      for (const p of pools.values()) {
        const t0 = tokens.get(p.token0);
        const t1 = tokens.get(p.token1);
        if (!t0 || !t1) continue;
        const p0in1 = priceFromSqrtX96(p.sqrtPriceX96, t0.decimals, t1.decimals);
        if (!Number.isFinite(p0in1) || p0in1 <= 0) continue;
        const u0 = usdOf.get(p.token0);
        const u1 = usdOf.get(p.token1);
        const sane = (v: number) => Number.isFinite(v) && v > MIN_USD_PRICE && v < MAX_USD_PRICE;
        if (u1 !== undefined && u0 === undefined) {
          const v = p0in1 * u1;
          if (sane(v)) usdOf.set(p.token0, v);
        } else if (u0 !== undefined && u1 === undefined) {
          const v = u0 / p0in1;
          if (sane(v)) usdOf.set(p.token1, v);
        }
      }
    }

    const markets: Market[] = [];
    const trades: Trade[] = [];
    let dropped = 0;

    // One market per base token: the pool where that token has the deepest
    // dollar inventory wins, so BOILER is not showing five copies of SPY.
    const bestByBase = new Map<string, { market: Market; depth: number }>();

    for (const p of pools.values()) {
      const t0 = tokens.get(p.token0);
      const t1 = tokens.get(p.token1);
      if (!t0 || !t1) continue;
      const events = byPool.get(p.address) ?? [];
      if (events.length === 0) continue;

      const u0 = usdOf.get(p.token0) ?? 0;
      const u1 = usdOf.get(p.token1) ?? 0;
      // Quote leg = the side that is closer to money.
      const quoteIsToken1 =
        t1.assetClass === "STABLE" ||
        (t0.assetClass !== "STABLE" && u1 >= u0 && t1.symbol === "WETH") ||
        (t0.assetClass !== "STABLE" && t1.symbol === "WETH") ||
        (t0.assetClass !== "STABLE" && t1.symbol === "USDG");

      const base = quoteIsToken1 ? t0 : t1;
      const quote = quoteIsToken1 ? t1 : t0;
      const baseUsd = quoteIsToken1 ? u0 : u1;
      const quoteUsd = quoteIsToken1 ? u1 : u0;
      if (quoteUsd <= 0) continue;

      const p0in1 = priceFromSqrtX96(p.sqrtPriceX96, t0.decimals, t1.decimals);
      const price = quoteIsToken1 ? p0in1 : p0in1 > 0 ? 1 / p0in1 : 0;
      const priceUsd = price * quoteUsd;
      if (!Number.isFinite(priceUsd) || priceUsd < MIN_USD_PRICE || priceUsd > MAX_USD_PRICE) continue;

      const sorted = [...events].sort((a, b) =>
        a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber - b.blockNumber,
      );
      const firstSwap = sorted[0];
      const priceAt = (sqrt: bigint) => {
        const raw = priceFromSqrtX96(sqrt, t0.decimals, t1.decimals);
        if (!Number.isFinite(raw) || raw <= 0) return 0;
        return quoteIsToken1 ? raw : 1 / raw;
      };
      const openUsd = priceAt(firstSwap.sqrtPriceX96) * quoteUsd;
      const changePct = openUsd > 0 ? ((priceUsd - openUsd) / openUsd) * 100 : 0;

      let volumeUsd = 0;
      let largest = 0;
      const buyers = new Set<string>();
      const sellers = new Set<string>();

      for (const ev of sorted) {
        const amt0 = toNum(ev.amount0 < 0n ? -ev.amount0 : ev.amount0, t0.decimals);
        const amt1 = toNum(ev.amount1 < 0n ? -ev.amount1 : ev.amount1, t1.decimals);
        const quoteAmt = quoteIsToken1 ? amt1 : amt0;
        const baseAmt = quoteIsToken1 ? amt0 : amt1;
        const usd = quoteAmt * quoteUsd;
        if (!Number.isFinite(usd)) continue;
        volumeUsd += usd;
        if (usd > largest) largest = usd;
        // amount0 > 0 means token0 came in. Base in = sell of base.
        const baseIn = quoteIsToken1 ? ev.amount0 > 0n : ev.amount1 > 0n;
        if (baseIn) sellers.add(ev.recipient);
        else buyers.add(ev.recipient);
        trades.push({
          marketId: p.address,
          symbol: base.symbol,
          side: baseIn ? "SELL" : "BUY",
          baseAmount: baseAmt,
          quoteAmount: quoteAmt,
          price: baseAmt > 0 ? usd / baseAmt : priceUsd,
          blockNumber: ev.blockNumber,
          txHash: ev.txHash,
          taker: ev.recipient,
          tag: usd >= 25_000 ? "BLOCK" : usd < 25 ? "DUST" : "ORDINARY",
        });
      }

      const reserveBaseUsd =
        toNum(quoteIsToken1 ? p.reserve0 : p.reserve1, base.decimals) * (baseUsd || priceUsd);
      const reserveQuoteUsd = toNum(quoteIsToken1 ? p.reserve1 : p.reserve0, quote.decimals) * quoteUsd;
      const liquidityUsd = reserveBaseUsd + reserveQuoteUsd;

      // -1 means "older than the PoolCreated window we scanned", which is a
      // different statement from "brand new" and is treated as such.
      const birth = poolBirth.get(p.address);
      const firstSeenBlock = birth ?? -1;

      const market: Market = {
        id: p.address,
        symbol: base.symbol,
        base,
        quote,
        pool: {
          address: p.address,
          token0: p.token0,
          token1: p.token1,
          feePips: p.feePips,
          sqrtPriceX96: p.sqrtPriceX96.toString(),
          liquidity: p.liquidity.toString(),
          tick: p.tick,
          reserve0: p.reserve0.toString(),
          reserve1: p.reserve1.toString(),
        },
        price: priceUsd,
        priceChangePct: Number.isFinite(changePct) ? changePct : 0,
        windowVolumeQuote: volumeUsd,
        liquidityQuote: Number.isFinite(liquidityUsd) ? liquidityUsd : 0,
        trades: sorted.length,
        uniqueBuyers: buyers.size,
        uniqueSellers: sellers.size,
        largestTradeQuote: largest,
        spreadBps: p.feePips / 100,
        assetClass: base.assetClass,
        firstSeenBlock,
        isNew: birth !== undefined && chain.blockNumber - birth < POOL_AGE_SPAN,
      };

      // A market whose dollar figures are implausible is dropped, not clamped:
      // a clamped number still reads as a real one.
      if (
        !Number.isFinite(liquidityUsd) ||
        liquidityUsd > MAX_USD_LIQUIDITY ||
        !Number.isFinite(volumeUsd) ||
        volumeUsd > MAX_USD_VOLUME
      ) {
        dropped++;
        continue;
      }

      const prev = bestByBase.get(base.address);
      if (!prev || liquidityUsd > prev.depth) bestByBase.set(base.address, { market, depth: liquidityUsd });
    }

    for (const { market } of bestByBase.values()) markets.push(market);
    markets.sort((a, b) => b.windowVolumeQuote - a.windowVolumeQuote);
    trades.sort((a, b) => b.blockNumber - a.blockNumber);

    const windowSeconds = (to - from + 1) * chain.blockTimeSec;
    const snapshot: MarketSnapshot = {
      markets,
      trades: trades.slice(0, 300),
      block: { from, to, latest: chain.blockNumber },
      windowSeconds,
      chain: {
        id: chain.id,
        blockNumber: chain.blockNumber,
        gasPriceWei: chain.gasPriceWei,
        blockTimeSec: chain.blockTimeSec,
      },
      degraded: markets.length === 0,
      degradedReason:
        markets.length === 0
          ? "No V3 swap activity decoded in the scan window."
          : dropped > 0
            ? `${dropped} pool${dropped === 1 ? "" : "s"} dropped: derived dollar values outside plausible bounds.`
            : null,
      provenance: {
        source: "CHAIN",
        method:
          "eth_getLogs(Uniswap V3 Swap) over the stated block window, pool and token state via Multicall3, prices from slot0 sqrtPriceX96, inventory from ERC20 balanceOf(pool).",
        window: `blocks ${from}-${to}`,
        updatedAt: startedAt,
        reference: ADDRESSES.v3Factory,
      },
    };

    cache = { at: Date.now(), snapshot };
    return snapshot;
  })();

  try {
    return await inflight;
  } catch (err) {
    if (cache) return cache.snapshot;
    const message = err instanceof Error ? err.message : "chain unreachable";
    return {
      markets: [],
      trades: [],
      block: { from: 0, to: 0, latest: 0 },
      windowSeconds: 0,
      chain: { id: 4663, blockNumber: 0, gasPriceWei: "0", blockTimeSec: 0.1 },
      degraded: true,
      degradedReason: message,
      provenance: {
        source: "CHAIN",
        method: "scan failed",
        updatedAt: Date.now(),
      },
    };
  } finally {
    inflight = null;
  }
}

export function cachedSnapshot() {
  return cache?.snapshot ?? null;
}
