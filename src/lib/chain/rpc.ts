import { DEFAULT_RPC } from "./chains";

export type RpcError = { code: number; message: string };

export class RpcFailure extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = "RpcFailure";
  }
}

/**
 * RPCAdapter.
 *
 * The public Robinhood Chain endpoint rate limits hard (-32000 / 429) and caps
 * eth_getLogs at 10,000 matches per query. Every read in BOILER goes through
 * here so backoff, batching and the log cap live in exactly one place instead of
 * being scattered through components.
 */
const RPC_URL = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC;

let nextId = 1;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type JsonRpcResponse = { id: number; result?: unknown; error?: RpcError };

async function post(body: unknown, timeoutMs = 15_000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok && res.status !== 200) {
      if (res.status === 429) throw new RpcFailure(429, "rate limited");
      throw new RpcFailure(res.status, `http ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function isRetryable(code: number) {
  return code === 429 || code === -32000 || code === -32005 || code === 503 || code === 502;
}

export async function rpc<T = unknown>(
  method: string,
  params: unknown[],
  opts: { retries?: number; timeoutMs?: number } = {},
): Promise<T> {
  const retries = opts.retries ?? 4;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const json = (await post(
        { jsonrpc: "2.0", id: nextId++, method, params },
        opts.timeoutMs,
      )) as JsonRpcResponse;
      if (json.error) {
        if (isRetryable(json.error.code) && attempt < retries) {
          await sleep(400 * (attempt + 1) ** 2);
          continue;
        }
        throw new RpcFailure(json.error.code, json.error.message);
      }
      return json.result as T;
    } catch (err) {
      lastErr = err;
      const code = err instanceof RpcFailure ? err.code : 0;
      if (attempt < retries && (code === 0 || isRetryable(code))) {
        await sleep(400 * (attempt + 1) ** 2);
        continue;
      }
      throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("rpc failed");
}

export async function ethCall(to: string, data: string, block: string = "latest"): Promise<string | null> {
  try {
    return await rpc<string>("eth_call", [{ to, data }, block]);
  } catch {
    // A revert is information, not a crash: some "pools" in the log stream are
    // not Uniswap V3 pools at all. Callers decide what a null means.
    return null;
  }
}

export const rpcUrl = RPC_URL;
