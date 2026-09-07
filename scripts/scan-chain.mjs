#!/usr/bin/env node
/**
 * Chain recon, standalone.
 *
 * Same discovery the app runs, in a script you can point at any RPC to check
 * that BOILER is reading what it claims to read. No arguments needed.
 *
 *   npm run scan
 *   RPC_URL=... SCAN_BLOCKS=1500 npm run scan
 */
const RPC = process.env.RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const SPAN = Number(process.env.SCAN_BLOCKS || 600);
const CHUNK = 150;
const V3_SWAP = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";
const MULTICALL3 = "0xca11bde05977b3631167028862be2a173976ca11";

let id = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function rpc(method, params, attempt = 0) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  const json = await res.json();
  if (json.error) {
    if ((json.error.code === 429 || json.error.code === -32000) && attempt < 5) {
      await sleep(500 * (attempt + 1) ** 2);
      return rpc(method, params, attempt + 1);
    }
    throw new Error(`${method}: ${json.error.message}`);
  }
  return json.result;
}

const word = (h) => h.replace(/^0x/, "").padStart(64, "0");

function encodeAggregate3(calls) {
  const offsets = [];
  const tuples = [];
  let cursor = calls.length * 32;
  for (const c of calls) {
    const data = c.data.replace(/^0x/, "");
    const len = data.length / 2;
    const padded = data + "0".repeat(((32 - (len % 32)) % 32) * 2);
    const tuple =
      "000000000000000000000000" + c.target.replace(/^0x/, "") + word("1") + word("60") + word(len.toString(16)) + padded;
    offsets.push(word(cursor.toString(16)));
    cursor += tuple.length / 2;
    tuples.push(tuple);
  }
  return "0x82ad56cb" + word("20") + word(calls.length.toString(16)) + offsets.join("") + tuples.join("");
}

function decodeAggregate3(hex, count) {
  const body = hex.replace(/^0x/, "");
  const base = 128;
  const out = [];
  for (let i = 0; i < count; i++) {
    const off = Number(BigInt("0x" + body.slice(base + i * 64, base + i * 64 + 64))) * 2;
    const p = base + off;
    const ok = BigInt("0x" + body.slice(p, p + 64)) === 1n;
    const dOff = Number(BigInt("0x" + body.slice(p + 64, p + 128))) * 2;
    const dp = p + dOff;
    const dLen = Number(BigInt("0x" + body.slice(dp, dp + 64)));
    out.push({ ok, data: "0x" + body.slice(dp + 64, dp + 64 + dLen * 2) });
  }
  return out;
}

function decodeString(hex) {
  if (!hex || hex === "0x") return "";
  const b = hex.slice(2);
  if (b.length <= 64) return Buffer.from(b, "hex").toString("utf8").replace(/\0/g, "").trim();
  const len = Number(BigInt("0x" + b.slice(64, 128)));
  return Buffer.from(b.slice(128, 128 + len * 2), "hex").toString("utf8").trim();
}

const main = async () => {
  const chainId = Number(BigInt(await rpc("eth_chainId", [])));
  const latest = Number(BigInt(await rpc("eth_blockNumber", [])));
  const a = await rpc("eth_getBlockByNumber", ["0x" + latest.toString(16), false]);
  const b = await rpc("eth_getBlockByNumber", ["0x" + (latest - 1000).toString(16), false]);
  const blockTime = (Number(BigInt(a.timestamp)) - Number(BigInt(b.timestamp))) / 1000;

  console.log(`chain ${chainId} · block ${latest.toLocaleString()} · ${blockTime.toFixed(3)}s per block`);
  console.log(`scanning ${SPAN} blocks (~${((SPAN * blockTime) / 60).toFixed(1)} min)\n`);

  const counts = {};
  for (let hi = latest; hi > latest - SPAN; hi -= CHUNK) {
    const lo = Math.max(hi - CHUNK + 1, latest - SPAN + 1);
    const logs = await rpc("eth_getLogs", [
      { fromBlock: "0x" + lo.toString(16), toBlock: "0x" + hi.toString(16), topics: [V3_SWAP] },
    ]);
    for (const l of logs) counts[l.address] = (counts[l.address] || 0) + 1;
    await sleep(250);
  }

  const pools = Object.entries(counts)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 30);
  console.log(`${Object.keys(counts).length} pools traded, showing top ${pools.length}\n`);

  const calls = pools.flatMap(([p]) => [
    { target: p, data: "0x0dfe1681" },
    { target: p, data: "0xd21220a7" },
    { target: p, data: "0xddca3f43" },
    { target: p, data: "0x3850c7bd" },
  ]);
  const res = decodeAggregate3(await rpc("eth_call", [{ to: MULTICALL3, data: encodeAggregate3(calls) }, "latest"]), calls.length);

  const rows = [];
  const tokens = new Set();
  pools.forEach(([p, n], i) => {
    const [t0, t1, fee, slot0] = res.slice(i * 4, i * 4 + 4);
    if (!t0.ok || !t1.ok) return;
    const a0 = "0x" + t0.data.slice(26, 66);
    const a1 = "0x" + t1.data.slice(26, 66);
    tokens.add(a0);
    tokens.add(a1);
    rows.push({ pool: p, n, a0, a1, fee: Number(BigInt(fee.data || "0x0")), sqrt: BigInt("0x" + (slot0.data || "0x0").slice(2, 66) || "0") });
  });

  const tList = [...tokens];
  const tCalls = tList.flatMap((t) => [
    { target: t, data: "0x95d89b41" },
    { target: t, data: "0x313ce567" },
    { target: t, data: "0x06fdde03" },
  ]);
  const tRes = decodeAggregate3(await rpc("eth_call", [{ to: MULTICALL3, data: encodeAggregate3(tCalls) }, "latest"]), tCalls.length);
  const meta = {};
  tList.forEach((t, i) => {
    const [s, d, n] = tRes.slice(i * 3, i * 3 + 3);
    meta[t] = { symbol: decodeString(s.data), decimals: Number(BigInt(d.data || "0x12")), name: decodeString(n.data) };
  });

  console.log("SWAPS  PAIR                       FEE      PRICE(t1/t0)     POOL");
  for (const r of rows) {
    const m0 = meta[r.a0] || {};
    const m1 = meta[r.a1] || {};
    const price = r.sqrt > 0n ? (Number(r.sqrt) / 2 ** 96) ** 2 * 10 ** ((m0.decimals ?? 18) - (m1.decimals ?? 18)) : 0;
    console.log(
      String(r.n).padStart(5),
      `${m0.symbol ?? "?"}/${m1.symbol ?? "?"}`.padEnd(26),
      `${(r.fee / 10000).toFixed(2)}%`.padStart(7),
      price.toPrecision(8).padStart(16),
      " ",
      r.pool,
    );
  }
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
