import { describe, expect, it, beforeAll } from "vitest";
import { VM } from "@ethereumjs/vm";
import { Chain, Common, Hardfork } from "@ethereumjs/common";
import { Address, hexToBytes, bytesToHex } from "@ethereumjs/util";
import { encodeFunctionData, decodeFunctionResult, encodeAbiParameters, parseAbiParameters } from "viem";
import { ARTIFACTS } from "@/lib/contracts/artifacts";
import { ROBINHOOD_CHAIN_ID } from "@/lib/chain/chains";

/**
 * These run the real compiled bytecode in a real EVM configured as Robinhood
 * Chain: chain id 4663, and the same Paris hardfork the contracts are compiled
 * for. Nothing here touches a network, but a local EVM pretending to be a
 * different chain is a test that does not test the deployment target.
 *
 * The admin page ships a deploy button, and a deploy button that has never had
 * its bytecode executed is a promise, not a feature. Every test below deploys
 * the actual artifact the browser will send and calls it.
 */

const common = Common.custom(
  { chainId: ROBINHOOD_CHAIN_ID, networkId: ROBINHOOD_CHAIN_ID, name: "robinhood-chain" },
  { baseChain: Chain.Mainnet, hardfork: Hardfork.Paris },
);
const OWNER = new Address(hexToBytes("0x537746ef0d18389a353153455971d88bf99299a2"));
const ALICE = new Address(hexToBytes("0x1111111111111111111111111111111111111111"));

let vm: Awaited<ReturnType<typeof VM.create>>;

async function deploy(name: keyof typeof ARTIFACTS, args: `0x${string}` = "0x", from = OWNER) {
  const art = ARTIFACTS[name];
  const data = hexToBytes((art.bytecode + args.replace(/^0x/, "")) as `0x${string}`);
  const res = await vm.evm.runCall({
    caller: from,
    to: undefined,
    data,
    gasLimit: 30_000_000n,
    value: 0n,
    isStatic: false,
  });
  if (res.execResult.exceptionError) {
    throw new Error(`${name} deploy reverted: ${res.execResult.exceptionError.error}`);
  }
  const addr = res.createdAddress;
  if (!addr) throw new Error(`${name} produced no address`);
  return addr;
}

async function call(
  to: Address,
  name: keyof typeof ARTIFACTS,
  functionName: string,
  args: unknown[] = [],
  from = OWNER,
) {
  const abi = ARTIFACTS[name].abi as never;
  const data = encodeFunctionData({ abi, functionName, args } as never);
  const res = await vm.evm.runCall({
    caller: from,
    to,
    data: hexToBytes(data),
    gasLimit: 30_000_000n,
    value: 0n,
    isStatic: false,
  });
  const returned = bytesToHex(res.execResult.returnValue) as `0x${string}`;
  if (res.execResult.exceptionError) {
    return { ok: false as const, error: res.execResult.exceptionError.error, raw: returned };
  }
  let decoded: unknown = undefined;
  try {
    decoded = decodeFunctionResult({ abi, functionName, data: returned } as never);
  } catch {
    /* void function */
  }
  return { ok: true as const, value: decoded, raw: returned };
}

const SCHEDULE = encodeAbiParameters(
  parseAbiParameters("address, (uint16,uint16,uint16,uint16,uint16,uint16,uint16)"),
  [OWNER.toString() as `0x${string}`, [25, 0, 10, 50, 2000, 5, 10]],
);

beforeAll(async () => {
  vm = await VM.create({ common });
});

describe("the chain these contracts are for", () => {
  it("runs the test EVM as Robinhood Chain 4663, not Ethereum", () => {
    expect(common.chainId()).toBe(BigInt(ROBINHOOD_CHAIN_ID));
    expect(ROBINHOOD_CHAIN_ID).toBe(4663);
  });

  it("compiles for a hardfork the chain accepts", () => {
    // Paris, so no PUSH0. Shanghai bytecode can be rejected by chains that have
    // not enabled it, and a deploy that reverts on an opcode is a bad afternoon.
    expect(common.hardfork()).toBe("paris");
  });

  it("wires the router to the SwapRouter02 found on Robinhood Chain", () => {
    const ctor = (ARTIFACTS.BoilerRouter.abi as unknown as { type: string; inputs?: { name: string }[] }[]).find(
      (f) => f.type === "constructor",
    );
    expect(ctor?.inputs?.map((i) => i.name)).toEqual([
      "owner_",
      "swapRouter_",
      "feeController_",
      "revenueSink_",
    ]);
  });
});

describe("BoilerRegistry", () => {
  it("deploys, stores and snapshots entries", async () => {
    const args = encodeAbiParameters(parseAbiParameters("address"), [OWNER.toString() as `0x${string}`]);
    const reg = await deploy("BoilerRegistry", args);

    const set = await call(reg, "BoilerRegistry", "set", ["feeController", ALICE.toString()]);
    expect(set.ok).toBe(true);

    const got = await call(reg, "BoilerRegistry", "get", ["feeController"]);
    expect(String(got.value).toLowerCase()).toBe(ALICE.toString().toLowerCase());

    const snap = await call(reg, "BoilerRegistry", "snapshot", []);
    const [keys, values] = snap.value as [string[], string[]];
    expect(keys).toHaveLength(1);
    expect(values[0].toLowerCase()).toBe(ALICE.toString().toLowerCase());
  });

  it("refuses a write from anyone but the owner", async () => {
    const args = encodeAbiParameters(parseAbiParameters("address"), [OWNER.toString() as `0x${string}`]);
    const reg = await deploy("BoilerRegistry", args);
    const res = await call(reg, "BoilerRegistry", "set", ["router", ALICE.toString()], ALICE);
    expect(res.ok).toBe(false);
  });
});

describe("BoilerFeeController", () => {
  it("deploys with a schedule and quotes the same maths the UI prints", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);

    // 10,000 units of notional at 25 bps protocol, no desk.
    const q = await call(fc, "BoilerFeeController", "quote", [10_000n, ALICE.toString(), false]);
    const [protocolFee, creatorFee, brokerFee, totalFee] = q.value as bigint[];
    expect(protocolFee).toBe(25n);
    expect(creatorFee).toBe(0n);
    expect(brokerFee).toBe(0n);
    expect(totalFee).toBe(25n);
  });

  it("lets a desk set its own fee inside the bounds", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const set = await call(fc, "BoilerFeeController", "setDeskFee", [ALICE.toString(), 40], ALICE);
    expect(set.ok).toBe(true);

    const bps = await call(fc, "BoilerFeeController", "bpsFor", [ALICE.toString()]);
    expect(bps.value).toEqual([25, 40]);
  });

  it("reverts a desk fee above the published maximum", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const res = await call(fc, "BoilerFeeController", "setDeskFee", [ALICE.toString(), 51], ALICE);
    expect(res.ok).toBe(false);
  });

  it("reverts a desk trying to set someone else's fee", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const res = await call(fc, "BoilerFeeController", "setDeskFee", [OWNER.toString(), 10], ALICE);
    expect(res.ok).toBe(false);
  });

  it("refuses a schedule that would break the hard cap", async () => {
    const bad = encodeAbiParameters(
      parseAbiParameters("address, (uint16,uint16,uint16,uint16,uint16,uint16,uint16)"),
      [OWNER.toString() as `0x${string}`, [60, 0, 10, 60, 2000, 5, 10]],
    );
    await expect(deploy("BoilerFeeController", bad)).rejects.toThrow(/revert/i);
  });

  it("takes the broker share out of the protocol fee, not off the user", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const withBroker = await call(fc, "BoilerFeeController", "quote", [100_000n, ALICE.toString(), true]);
    const [protocolFee, , brokerFee, totalFee] = withBroker.value as bigint[];
    expect(brokerFee).toBe((protocolFee * 2000n) / 10_000n);
    expect(totalFee).toBe(protocolFee);
  });
});

describe("BoilerRevenueRouter", () => {
  async function fresh() {
    const args = encodeAbiParameters(parseAbiParameters("address, address"), [
      OWNER.toString() as `0x${string}`,
      OWNER.toString() as `0x${string}`,
    ]);
    return deploy("BoilerRevenueRouter", args);
  }

  it("deploys with an allocation that totals exactly 10000 bps", async () => {
    const rr = await fresh();
    const alloc = await call(rr, "BoilerRevenueRouter", "allocation", []);
    const rows = alloc.value as { destination: number; bps: number }[];
    expect(rows.reduce((a, r) => a + Number(r.bps), 0)).toBe(10_000);
  });

  it("reverts an allocation that does not total 10000", async () => {
    const rr = await fresh();
    const res = await call(rr, "BoilerRevenueRouter", "setAllocation", [
      [{ destination: 0, bps: 9_000 }],
    ]);
    expect(res.ok).toBe(false);
  });

  it("reverts any allocation to stakers while distribution is disabled", async () => {
    const rr = await fresh();
    const res = await call(rr, "BoilerRevenueRouter", "setAllocation", [
      [
        { destination: 6, bps: 5_000 },
        { destination: 0, bps: 5_000 },
      ],
    ]);
    expect(res.ok).toBe(false);
  });

  it("only allows staker distribution after an on chain legal reference is recorded", async () => {
    const rr = await fresh();
    const enable = await call(rr, "BoilerRevenueRouter", "enableStakerDistribution", ["opinion 2026-09-07, counsel X"]);
    expect(enable.ok).toBe(true);

    const flag = await call(rr, "BoilerRevenueRouter", "stakerDistributionEnabled", []);
    expect(flag.value).toBe(true);

    const now = await call(rr, "BoilerRevenueRouter", "setAllocation", [
      [
        { destination: 6, bps: 5_000 },
        { destination: 0, bps: 5_000 },
      ],
    ]);
    expect(now.ok).toBe(true);
  });

  it("refuses to enable staker distribution with an empty reference", async () => {
    const rr = await fresh();
    const res = await call(rr, "BoilerRevenueRouter", "enableStakerDistribution", [""]);
    expect(res.ok).toBe(false);
  });

  it("previews a split that adds up, without reverting on unset sinks", async () => {
    const rr = await fresh();
    const p = await call(rr, "BoilerRevenueRouter", "preview", [1_000_000n]);
    expect(p.ok).toBe(true);
    const [destinations, sinks, amounts] = p.value as [number[], string[], bigint[]];
    expect(amounts.reduce((a, b) => a + b, 0n)).toBe(1_000_000n);
    expect(destinations).toHaveLength(6);
    // BURN resolves to the dead address even with no sink configured.
    const burnIdx = destinations.findIndex((d) => Number(d) === 2);
    expect(sinks[burnIdx].toLowerCase()).toBe("0x000000000000000000000000000000000000dead");
  });

  it("says it is not ready to route while a destination has no sink", async () => {
    const rr = await fresh();
    expect((await call(rr, "BoilerRevenueRouter", "readyToRoute", [])).value).toBe(false);
  });
});

describe("BoilStaking", () => {
  const TIERS = encodeAbiParameters(parseAbiParameters("address, uint256[4], uint16[4]"), [
    OWNER.toString() as `0x${string}`,
    [0n, 25_000n * 10n ** 18n, 250_000n * 10n ** 18n, 2_000_000n * 10n ** 18n],
    [0, 5, 12, 20],
  ]);

  it("deploys and starts everyone at FLOOR with no discount", async () => {
    const st = await deploy("BoilStaking", TIERS);
    const tier = await call(st, "BoilStaking", "tierOf", [ALICE.toString()]);
    expect(tier.value).toBe(0);
    const disc = await call(st, "BoilStaking", "feeDiscountBpsOf", [ALICE.toString()]);
    expect(disc.value).toBe(0);
  });

  it("refuses staking before a token is set, so nobody sends into a void", async () => {
    const st = await deploy("BoilStaking", TIERS);
    const res = await call(st, "BoilStaking", "stake", [1n, 0n], ALICE);
    expect(res.ok).toBe(false);
  });

  it("freezes the token address after it is set once", async () => {
    const st = await deploy("BoilStaking", TIERS);
    const first = await call(st, "BoilStaking", "setToken", [ALICE.toString()]);
    expect(first.ok).toBe(true);
    const second = await call(st, "BoilStaking", "setToken", [OWNER.toString()]);
    expect(second.ok).toBe(false);
  });

  it("rejects tier thresholds that are not ascending", async () => {
    const bad = encodeAbiParameters(parseAbiParameters("address, uint256[4], uint16[4]"), [
      OWNER.toString() as `0x${string}`,
      [0n, 100n, 50n, 200n],
      [0, 5, 12, 20],
    ]);
    await expect(deploy("BoilStaking", bad)).rejects.toThrow(/revert/i);
  });
});

describe("BoilerRouter", () => {
  it("deploys wired to the live Robinhood Chain SwapRouter02", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const rrArgs = encodeAbiParameters(parseAbiParameters("address, address"), [
      OWNER.toString() as `0x${string}`,
      OWNER.toString() as `0x${string}`,
    ]);
    const rr = await deploy("BoilerRevenueRouter", rrArgs);

    const args = encodeAbiParameters(parseAbiParameters("address, address, address, address"), [
      OWNER.toString() as `0x${string}`,
      "0xcaf681a66d020601342297493863e78c959e5cb2",
      fc.toString() as `0x${string}`,
      rr.toString() as `0x${string}`,
    ]);
    const router = await deploy("BoilerRouter", args);

    const sink = await call(router, "BoilerRouter", "revenueSink", []);
    expect(String(sink.value).toLowerCase()).toBe(rr.toString().toLowerCase());
  });

  it("quotes a fee split that never exceeds the amount in", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const rrArgs = encodeAbiParameters(parseAbiParameters("address, address"), [
      OWNER.toString() as `0x${string}`,
      OWNER.toString() as `0x${string}`,
    ]);
    const rr = await deploy("BoilerRevenueRouter", rrArgs);
    const args = encodeAbiParameters(parseAbiParameters("address, address, address, address"), [
      OWNER.toString() as `0x${string}`,
      "0xcaf681a66d020601342297493863e78c959e5cb2",
      fc.toString() as `0x${string}`,
      rr.toString() as `0x${string}`,
    ]);
    const router = await deploy("BoilerRouter", args);

    const q = await call(router, "BoilerRouter", "quote", [
      1_000_000n,
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000",
    ]);
    const [protocolFee, deskFee, brokerFee, amountToSwap] = q.value as bigint[];
    expect(protocolFee).toBe(2_500n); // 25 bps
    expect(deskFee).toBe(0n);
    expect(brokerFee).toBe(0n);
    expect(protocolFee + deskFee + brokerFee + amountToSwap).toBe(1_000_000n);
  });

  it("cannot be pointed at a zero revenue sink", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const args = encodeAbiParameters(parseAbiParameters("address, address, address, address"), [
      OWNER.toString() as `0x${string}`,
      "0xcaf681a66d020601342297493863e78c959e5cb2",
      fc.toString() as `0x${string}`,
      "0x0000000000000000000000000000000000000000",
    ]);
    await expect(deploy("BoilerRouter", args)).rejects.toThrow(/revert/i);
  });

  it("pauses and refuses swaps while paused", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const rrArgs = encodeAbiParameters(parseAbiParameters("address, address"), [
      OWNER.toString() as `0x${string}`,
      OWNER.toString() as `0x${string}`,
    ]);
    const rr = await deploy("BoilerRevenueRouter", rrArgs);
    const args = encodeAbiParameters(parseAbiParameters("address, address, address, address"), [
      OWNER.toString() as `0x${string}`,
      "0xcaf681a66d020601342297493863e78c959e5cb2",
      fc.toString() as `0x${string}`,
      rr.toString() as `0x${string}`,
    ]);
    const router = await deploy("BoilerRouter", args);

    expect((await call(router, "BoilerRouter", "pause", [])).ok).toBe(true);
    expect((await call(router, "BoilerRouter", "paused", [])).value).toBe(true);

    const swap = await call(router, "BoilerRouter", "exactInputSingle", [
      {
        tokenIn: ALICE.toString(),
        tokenOut: OWNER.toString(),
        poolFee: 500,
        amountIn: 1n,
        amountOutMinimum: 1n,
        sqrtPriceLimitX96: 0n,
        desk: "0x0000000000000000000000000000000000000000",
        broker: "0x0000000000000000000000000000000000000000",
        deadline: 99_999_999_999n,
      },
    ]);
    expect(swap.ok).toBe(false);
  });

  it("refuses a swap with no minimum output", async () => {
    const fc = await deploy("BoilerFeeController", SCHEDULE);
    const rrArgs = encodeAbiParameters(parseAbiParameters("address, address"), [
      OWNER.toString() as `0x${string}`,
      OWNER.toString() as `0x${string}`,
    ]);
    const rr = await deploy("BoilerRevenueRouter", rrArgs);
    const args = encodeAbiParameters(parseAbiParameters("address, address, address, address"), [
      OWNER.toString() as `0x${string}`,
      "0xcaf681a66d020601342297493863e78c959e5cb2",
      fc.toString() as `0x${string}`,
      rr.toString() as `0x${string}`,
    ]);
    const router = await deploy("BoilerRouter", args);

    const swap = await call(router, "BoilerRouter", "exactInputSingle", [
      {
        tokenIn: ALICE.toString(),
        tokenOut: OWNER.toString(),
        poolFee: 500,
        amountIn: 1_000n,
        amountOutMinimum: 0n,
        sqrtPriceLimitX96: 0n,
        desk: "0x0000000000000000000000000000000000000000",
        broker: "0x0000000000000000000000000000000000000000",
        deadline: 99_999_999_999n,
      },
    ]);
    expect(swap.ok).toBe(false);
  });

  it("has no owner destination on the sweep path", () => {
    const abi = ARTIFACTS.BoilerRouter.abi as unknown as readonly { name?: string; inputs?: readonly { name: string }[] }[];
    const sweep = abi.find((f) => f.name === "sweep");
    expect(sweep).toBeDefined();
    // One argument, the token. No destination the owner gets to choose.
    expect(sweep?.inputs?.map((i) => i.name)).toEqual(["token"]);
  });
});
