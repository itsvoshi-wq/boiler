import { ADDRESSES } from "./chains";
import { SELECTORS } from "./abi";
import { rpc } from "./rpc";

export type Call = { target: string; data: string };
export type CallResult = { success: boolean; data: string | null };

/**
 * Minimal Multicall3.aggregate3 encoder/decoder.
 *
 * Multicall3 is deployed at the canonical address on Robinhood Chain (verified
 * by eth_call, not assumed), which is the difference between one RPC round trip
 * and three hundred.
 */
export function encodeAggregate3(calls: Call[]): string {
  const count = calls.length;
  const tuples: string[] = [];
  const offsets: string[] = [];
  let cursor = count * 32;

  for (const call of calls) {
    const data = call.data.replace(/^0x/, "");
    const byteLen = data.length / 2;
    const padLen = (32 - (byteLen % 32)) % 32;
    const padded = data + "0".repeat(padLen * 2);
    const tuple =
      "000000000000000000000000" +
      call.target.replace(/^0x/, "").toLowerCase() +
      "0000000000000000000000000000000000000000000000000000000000000001" + // allowFailure
      "0000000000000000000000000000000000000000000000000000000000000060" + // bytes offset
      byteLen.toString(16).padStart(64, "0") +
      padded;
    offsets.push(cursor.toString(16).padStart(64, "0"));
    cursor += tuple.length / 2;
    tuples.push(tuple);
  }

  return (
    "0x" +
    SELECTORS.aggregate3.slice(2) +
    "0000000000000000000000000000000000000000000000000000000000000020" +
    count.toString(16).padStart(64, "0") +
    offsets.join("") +
    tuples.join("")
  );
}

export function decodeAggregate3(hex: string, count: number): CallResult[] {
  const body = hex.replace(/^0x/, "");
  const arrStart = 64; // skip head offset word
  const len = Number(BigInt("0x" + body.slice(arrStart, arrStart + 64)));
  const base = arrStart + 64;
  const out: CallResult[] = [];
  for (let i = 0; i < Math.min(len, count); i++) {
    const off = Number(BigInt("0x" + body.slice(base + i * 64, base + i * 64 + 64))) * 2;
    const p = base + off;
    const success = BigInt("0x" + body.slice(p, p + 64)) === 1n;
    const dataOff = Number(BigInt("0x" + body.slice(p + 64, p + 128))) * 2;
    const dp = p + dataOff;
    const dataLen = Number(BigInt("0x" + body.slice(dp, dp + 64)));
    const data = body.slice(dp + 64, dp + 64 + dataLen * 2);
    out.push({ success, data: data ? "0x" + data : null });
  }
  while (out.length < count) out.push({ success: false, data: null });
  return out;
}

/** Runs calls through Multicall3, chunked so a single eth_call never gets huge. */
export async function multicall(calls: Call[], chunkSize = 120): Promise<CallResult[]> {
  const out: CallResult[] = [];
  for (let i = 0; i < calls.length; i += chunkSize) {
    const chunk = calls.slice(i, i + chunkSize);
    try {
      const res = await rpc<string>("eth_call", [
        { to: ADDRESSES.multicall3, data: encodeAggregate3(chunk) },
        "latest",
      ]);
      out.push(...decodeAggregate3(res, chunk.length));
    } catch {
      out.push(...chunk.map(() => ({ success: false, data: null })));
    }
  }
  return out;
}
