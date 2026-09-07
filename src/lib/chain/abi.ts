/**
 * Hand rolled selectors and decoders.
 *
 * Deliberate: every market read goes through Multicall3 as one eth_call, so we
 * need raw calldata anyway, and the public RPC punishes anything chattier.
 */

export const SELECTORS = {
  // ERC20
  symbol: "0x95d89b41",
  name: "0x06fdde03",
  decimals: "0x313ce567",
  totalSupply: "0x18160ddd",
  balanceOf: "0x70a08231",
  allowance: "0xdd62ed3e",
  approve: "0x095ea7b3",
  // Uniswap V3 pool
  token0: "0x0dfe1681",
  token1: "0xd21220a7",
  fee: "0xddca3f43",
  slot0: "0x3850c7bd",
  liquidity: "0x1a686502",
  factory: "0xc45a0155",
  // Uniswap V3 factory
  getPool: "0x1698ee82",
  // SwapRouter02
  exactInputSingle: "0x04e45aaf",
  // Multicall3
  aggregate3: "0x82ad56cb",
} as const;

export const TOPICS = {
  transfer: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  v3Swap: "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
  v2Sync: "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1",
  v3PoolCreated: "0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118",
} as const;

export const pad32 = (hex: string) => hex.replace(/^0x/, "").padStart(64, "0");
export const addrArg = (addr: string) => pad32(addr.toLowerCase());
export const uintArg = (n: bigint | number) => pad32(BigInt(n).toString(16));

export function encodeCall(selector: string, args: string[] = []): string {
  return selector + args.join("");
}

export function decodeAddress(word: string | null): string | null {
  if (!word || word.length < 66) return null;
  return "0x" + word.slice(26, 66).toLowerCase();
}

export function decodeUint(word: string | null): bigint {
  if (!word || word === "0x") return 0n;
  return BigInt(word.length > 66 ? word.slice(0, 66) : word);
}

/**
 * Anyone can deploy a token whose symbol is control characters, right-to-left
 * overrides, or two hundred bytes of zero-width space. A ticker on this floor is
 * printable ASCII-ish and short, or it is dropped.
 */
function sanitize(raw: string, max: number): string {
  return raw
    // C0/C1 controls, zero width joiners, bidi overrides, BOM, replacement char
    .replace(
      /[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff\ufffd]/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** A ticker has to survive being put in a URL and a table cell. */
export function tickerFrom(symbol: string, address: string): string {
  const cleaned = symbol.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 14);
  return cleaned.length >= 1 ? cleaned : address.slice(2, 10).toUpperCase();
}

/** Handles both bytes32-style and string-style symbol()/name() returns. */
export function decodeString(hex: string | null, max = 64): string {
  if (!hex || hex === "0x") return "";
  const body = hex.slice(2);
  if (body.length <= 64) {
    return sanitize(Buffer.from(body, "hex").toString("utf8"), max);
  }
  try {
    const len = Number(BigInt("0x" + body.slice(64, 128)));
    if (!Number.isFinite(len) || len <= 0 || len > 512) return "";
    return sanitize(Buffer.from(body.slice(128, 128 + len * 2), "hex").toString("utf8"), max);
  } catch {
    return "";
  }
}

export type Slot0 = { sqrtPriceX96: bigint; tick: number; unlocked: boolean };

export function decodeSlot0(hex: string | null): Slot0 | null {
  if (!hex || hex.length < 2 + 64 * 2) return null;
  const body = hex.slice(2);
  const sqrt = BigInt("0x" + body.slice(0, 64));
  const rawTick = BigInt("0x" + body.slice(64, 128));
  // int24 stored in a 256 bit word, two's complement
  const tick = rawTick >= 1n << 255n ? Number(rawTick - (1n << 256n)) : Number(rawTick);
  return { sqrtPriceX96: sqrt, tick, unlocked: true };
}

/** V3 Swap(address,address,int256,int256,uint160,uint128,int24) */
export type SwapEvent = {
  pool: string;
  sender: string;
  recipient: string;
  amount0: bigint;
  amount1: bigint;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
  blockNumber: number;
  txHash: string;
  logIndex: number;
};

function toSigned(word: string): bigint {
  const v = BigInt("0x" + word);
  return v >= 1n << 255n ? v - (1n << 256n) : v;
}

export function decodeSwapLog(log: {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
}): SwapEvent | null {
  const body = log.data.slice(2);
  if (body.length < 64 * 5) return null;
  const sender = "0x" + (log.topics[1] ?? "").slice(26);
  const recipient = "0x" + (log.topics[2] ?? "").slice(26);
  const amount0 = toSigned(body.slice(0, 64));
  const amount1 = toSigned(body.slice(64, 128));
  const sqrtPriceX96 = BigInt("0x" + body.slice(128, 192));
  const liquidity = BigInt("0x" + body.slice(192, 256));
  const rawTick = BigInt("0x" + body.slice(256, 320));
  const tick = rawTick >= 1n << 255n ? Number(rawTick - (1n << 256n)) : Number(rawTick);
  return {
    pool: log.address.toLowerCase(),
    sender: sender.toLowerCase(),
    recipient: recipient.toLowerCase(),
    amount0,
    amount1,
    sqrtPriceX96,
    liquidity,
    tick,
    blockNumber: Number(BigInt(log.blockNumber)),
    txHash: log.transactionHash,
    logIndex: Number(BigInt(log.logIndex)),
  };
}
