import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeAggregate3, encodeAggregate3 } from "@/lib/chain/multicall";
import { decodeSlot0, decodeString, decodeSwapLog, decodeUint, tickerFrom } from "@/lib/chain/abi";
import { priceFromSqrtX96, quoteExactInputSingleTick } from "@/lib/chain/uniswapV3";
import { buildSwap, minOutFor } from "@/lib/chain/swap";
import { classifyAsset, wrapperDisclosure } from "@/lib/domain/classify";

describe("multicall codec", () => {
  it("encodes aggregate3 with the right selector, count and word alignment", () => {
    const data = encodeAggregate3([
      { target: "0x117cc2133c37b721f49de2a7a74833232b3b4c0c", data: "0x95d89b41" },
      { target: "0x5fc5360d0400a0fd4f2af552add042d716f1d168", data: "0x313ce567" },
    ]);
    expect(data.startsWith("0x82ad56cb")).toBe(true);
    expect((data.length - 10) % 64).toBe(0);
    expect(data).toContain("117cc2133c37b721f49de2a7a74833232b3b4c0c");
  });

  it("round trips a two call response", () => {
    // Shape produced by the live endpoint: offset, length 2, two offsets, two tuples.
    const word = (h: string) => h.padStart(64, "0");
    const tuple = (ok: boolean, payload: string) =>
      word(ok ? "1" : "0") + word("40") + word((payload.length / 2).toString(16)) + payload.padEnd(64, "0");
    const t1 = tuple(true, "00".repeat(32));
    const t2 = tuple(true, "01".repeat(32));
    const body =
      word("20") + word("2") + word((64).toString(16)) + word((64 + t1.length / 2).toString(16)) + t1 + t2;
    const out = decodeAggregate3("0x" + body, 2);
    expect(out).toHaveLength(2);
    expect(out[0].success).toBe(true);
  });

  it("pads a short response instead of throwing", () => {
    expect(decodeAggregate3("0x" + "0".repeat(128), 3)).toHaveLength(3);
  });
});

describe("abi decoders", () => {
  it("decodes a dynamic string symbol", () => {
    const hex =
      "0x" +
      "20".padStart(64, "0") +
      "3".padStart(64, "0") +
      Buffer.from("SPY").toString("hex").padEnd(64, "0");
    expect(decodeString(hex)).toBe("SPY");
  });

  it("decodes a bytes32 style symbol", () => {
    expect(decodeString("0x" + Buffer.from("GME").toString("hex").padEnd(64, "0"))).toBe("GME");
  });

  it("returns empty rather than crashing on garbage", () => {
    expect(decodeString("0x")).toBe("");
    expect(decodeString(null)).toBe("");
    expect(decodeUint(null)).toBe(0n);
  });

  it("strips control characters and bidi overrides out of a hostile symbol", () => {
    const hostile = "S‮P​Y";
    const hex =
      "0x" +
      "20".padStart(64, "0") +
      Buffer.from(hostile).length.toString(16).padStart(64, "0") +
      Buffer.from(hostile).toString("hex").padEnd(64, "0");
    expect(decodeString(hex)).toBe("SPY");
  });

  it("falls back to the address when a symbol has nothing usable in it", () => {
    expect(tickerFrom("", "0xdeadbeefcafebabe0000000000000000000000ff")).toBe("DEADBEEF");
    expect(tickerFrom("A B/C", "0xdead")).toBe("ABC");
    expect(tickerFrom("VERYLONGTICKERNAMEHERE", "0xdead")).toHaveLength(14);
  });

  it("decodes a negative int24 tick from slot0", () => {
    const negOne = (1n << 256n) - 1n;
    const hex = "0x" + "1".padStart(64, "0") + negOne.toString(16).padStart(64, "0") + "0".repeat(64 * 5);
    const s = decodeSlot0(hex);
    expect(s?.tick).toBe(-1);
  });

  it("decodes a swap log with a signed amount0", () => {
    const negTen = ((1n << 256n) - 10n).toString(16).padStart(64, "0");
    const log = {
      address: "0xPOOL",
      topics: [
        "0xtopic",
        "0x" + "0".repeat(24) + "aa".repeat(20),
        "0x" + "0".repeat(24) + "bb".repeat(20),
      ],
      data: "0x" + negTen + "5".padStart(64, "0") + "1".padStart(64, "0") + "2".padStart(64, "0") + "0".padStart(64, "0"),
      blockNumber: "0x10",
      transactionHash: "0xhash",
      logIndex: "0x1",
    };
    const s = decodeSwapLog(log);
    expect(s?.amount0).toBe(-10n);
    expect(s?.amount1).toBe(5n);
    expect(s?.blockNumber).toBe(16);
  });
});

describe("uniswap v3 maths", () => {
  it("applies the decimal adjustment for an 18/6 pair", () => {
    // ratio 1 in raw units is 10^(18-6) once decimals are accounted for.
    expect(priceFromSqrtX96(2n ** 96n, 18, 6)).toBeCloseTo(1e12, 0);
    expect(priceFromSqrtX96(2n ** 96n, 18, 18)).toBeCloseTo(1, 9);
  });

  it("recovers a live SPY/USDG price from its sqrtPriceX96", () => {
    // Chosen so the decimal-adjusted price lands on the ~$773 observed on chain.
    const target = 773;
    const ratio = Math.sqrt(target / 10 ** (18 - 6));
    const sqrt = BigInt(Math.floor(ratio * 2 ** 96));
    expect(priceFromSqrtX96(sqrt, 18, 6)).toBeCloseTo(target, 0);
  });

  it("returns zero for an uninitialised pool", () => {
    expect(priceFromSqrtX96(0n, 18, 6)).toBe(0);
  });

  it("charges the pool fee on the way in", () => {
    const liquidity = 10n ** 21n;
    const sqrt = 2n ** 96n;
    const cheap = quoteExactInputSingleTick({ sqrtPriceX96: sqrt, liquidity, feePips: 100, zeroForOne: true, amountIn: 10n ** 18n });
    const dear = quoteExactInputSingleTick({ sqrtPriceX96: sqrt, liquidity, feePips: 10_000, zeroForOne: true, amountIn: 10n ** 18n });
    expect(cheap.amountOut).toBeGreaterThan(dear.amountOut);
  });

  it("gives a worse average price for a larger order", () => {
    const liquidity = 10n ** 20n;
    const sqrt = 2n ** 96n;
    const small = quoteExactInputSingleTick({ sqrtPriceX96: sqrt, liquidity, feePips: 500, zeroForOne: true, amountIn: 10n ** 16n });
    const big = quoteExactInputSingleTick({ sqrtPriceX96: sqrt, liquidity, feePips: 500, zeroForOne: true, amountIn: 10n ** 19n });
    const smallAvg = Number(small.amountOut) / 1e16;
    const bigAvg = Number(big.amountOut) / 1e19;
    expect(bigAvg).toBeLessThan(smallAvg);
  });

  it("returns nothing for zero liquidity instead of dividing by zero", () => {
    const q = quoteExactInputSingleTick({ sqrtPriceX96: 2n ** 96n, liquidity: 0n, feePips: 500, zeroForOne: true, amountIn: 1n });
    expect(q.amountOut).toBe(0n);
  });
});

describe("swap building", () => {
  const args = {
    tokenIn: "0x117cc2133c37b721f49de2a7a74833232b3b4c0c" as `0x${string}`,
    tokenOut: "0x5fc5360d0400a0fd4f2af552add042d716f1d168" as `0x${string}`,
    feePips: 500,
    amountIn: 10n ** 18n,
    amountOutMinimum: 1n,
    recipient: "0x1111111111111111111111111111111111111111" as `0x${string}`,
  };

  it("encodes exactInputSingle", () => {
    expect(buildSwap(args).data.startsWith("0x04e45aaf")).toBe(true);
  });

  it("refuses an order with no slippage guard", () => {
    expect(() => buildSwap({ ...args, amountOutMinimum: 0n })).toThrow(/minimum output/i);
  });

  it("refuses a zero size order", () => {
    expect(() => buildSwap({ ...args, amountIn: 0n })).toThrow(/zero size/i);
  });

  it("computes a minimum output below the quote", () => {
    expect(minOutFor(1000n, 50)).toBe(995n);
    expect(minOutFor(1000n, 10_000)).toBe(800n); // clamped to 2000 bps
  });
});

describe("asset classification", () => {
  it("reads tokenized equities off the onchain naming convention", () => {
    expect(classifyAsset("NVDA", "NVIDIA • Robinhood Token")).toBe("TOKENIZED_EQUITY");
    expect(classifyAsset("SPY", "SPDR S&P 500 ETF Trust • Robinhood Token")).toBe("TOKENIZED_EQUITY");
    expect(classifyAsset("SKHY", "SK hynix Inc. American Depositary Shares • Robinhood Token")).toBe("TOKENIZED_EQUITY");
  });

  it("does not call a dollar an altcoin", () => {
    expect(classifyAsset("USDG", "Global Dollar")).toBe("STABLE");
    expect(classifyAsset("WETH", "WETH")).toBe("CRYPTO");
  });

  it("flags memes without pretending it is a safety rating", () => {
    expect(classifyAsset("MCAT", "MoneroCat")).toBe("MEME");
    expect(classifyAsset("PONS", "Pons")).toBe("ALTCOIN");
  });

  it("always attaches the wrapper disclosure to equity exposure", () => {
    expect(wrapperDisclosure("TSLA", "Tesla • Robinhood Token")).toMatch(/not a legal share/i);
    expect(wrapperDisclosure("WETH", "WETH")).toBeNull();
  });
});

describe("public RPC string", () => {
  const original = process.env.RPC_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.RPC_URL;
    else process.env.RPC_URL = original;
    vi.resetModules();
  });

  async function publicUrl(value: string) {
    process.env.RPC_URL = value;
    vi.resetModules();
    const mod = await import("@/lib/chain/public");
    return mod.rpcUrlPublic();
  }

  it("never prints an API key that lives in the path", async () => {
    const out = await publicUrl("https://robinhood-mainnet.g.alchemy.com/v2/alch_SUPERSECRETKEY");
    expect(out).not.toContain("alch_SUPERSECRETKEY");
    expect(out).toBe("robinhood-mainnet.g.alchemy.com/…");
  });

  it("never prints an API key that lives in the query string", async () => {
    const out = await publicUrl("https://rpc.example.com/?apikey=SECRET123");
    expect(out).not.toContain("SECRET123");
  });

  it("never prints basic auth credentials", async () => {
    const out = await publicUrl("https://user:hunter2@rpc.example.com/");
    expect(out).not.toContain("hunter2");
    expect(out).not.toContain("user");
  });

  it("prints a bare public endpoint in full", async () => {
    expect(await publicUrl("https://rpc.mainnet.chain.robinhood.com")).toBe("rpc.mainnet.chain.robinhood.com");
  });
});
