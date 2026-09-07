import { encodeFunctionData, decodeFunctionResult, keccak256, toBytes, type Address, type Hex } from "viem";
import { ARTIFACTS } from "./artifacts";
import { REGISTRY_ADDRESS, REGISTRY_KEYS, type RegistryKey } from "./deployment";
import { ADDRESSES } from "../chain/chains";
import { ethCall } from "../chain/rpc";

/**
 * Reads the deployed BOILER contracts, when there are any.
 *
 * The Books renders whatever this returns. Before deployment it returns
 * deployed:false and the page says the numbers are zero because nothing is
 * collecting. After deployment the same page shows what the contracts actually
 * hold, read from the chain, with no second code path that could disagree.
 */

export type ProtocolState = {
  deployed: boolean;
  registry: Address | null;
  addresses: Partial<Record<RegistryKey, Address>>;
  paused: boolean | null;
  /** Cumulative routed revenue, per token, in raw units. */
  routed: { token: Address; symbol: string; decimals: number; amount: bigint }[];
  /** Sitting in the revenue router, not yet split. */
  pending: { token: Address; symbol: string; decimals: number; amount: bigint }[];
  readAt: number;
  error: string | null;
};

const EMPTY: ProtocolState = {
  deployed: false,
  registry: null,
  addresses: {},
  paused: null,
  routed: [],
  pending: [],
  readAt: 0,
  error: null,
};

/** The tokens fees are most likely to arrive in on this chain. */
const WATCHED = [
  { token: ADDRESSES.usdg as Address, symbol: "USDG", decimals: 6 },
  { token: ADDRESSES.weth9 as Address, symbol: "WETH", decimals: 18 },
];

const ZERO = "0x0000000000000000000000000000000000000000";

async function read<T>(to: Address, artifact: keyof typeof ARTIFACTS, functionName: string, args: unknown[] = []) {
  const data = encodeFunctionData({ abi: ARTIFACTS[artifact].abi, functionName, args } as never) as Hex;
  const raw = await ethCall(to, data);
  if (!raw || raw === "0x") return null;
  try {
    return decodeFunctionResult({
      abi: ARTIFACTS[artifact].abi,
      functionName,
      data: raw as Hex,
    } as never) as T;
  } catch {
    return null;
  }
}

let cache: { at: number; state: ProtocolState } | null = null;
const TTL = 30_000;

export async function readProtocolState(): Promise<ProtocolState> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(REGISTRY_ADDRESS)) return { ...EMPTY, readAt: Date.now() };
  if (cache && Date.now() - cache.at < TTL) return cache.state;

  const registry = REGISTRY_ADDRESS as Address;
  const state: ProtocolState = { ...EMPTY, registry, readAt: Date.now() };

  try {
    const snap = await read<[Hex[], Address[]]>(registry, "BoilerRegistry", "snapshot");
    if (!snap) {
      state.error = "Registry did not answer. The address in the environment may be wrong.";
      cache = { at: Date.now(), state };
      return state;
    }
    const [keys, values] = snap;
    const byHash = new Map(REGISTRY_KEYS.map((k) => [keccak256(toBytes(k)), k] as const));
    keys.forEach((k, i) => {
      const name = byHash.get(k);
      const v = values[i];
      if (name && v && v.toLowerCase() !== ZERO) state.addresses[name] = v;
    });
    state.deployed = Object.keys(state.addresses).length > 0;

    if (state.addresses.router) {
      const paused = await read<boolean>(state.addresses.router, "BoilerRouter", "paused");
      state.paused = paused ?? null;
    }

    if (state.addresses.revenueRouter) {
      const rr = state.addresses.revenueRouter;
      for (const w of WATCHED) {
        const routed = await read<bigint>(rr, "BoilerRevenueRouter", "totalRouted", [w.token]);
        if (routed && routed > 0n) state.routed.push({ ...w, amount: routed });
      }
    }
  } catch (err) {
    state.error = err instanceof Error ? err.message.split("\n")[0] : "read failed";
  }

  cache = { at: Date.now(), state };
  return state;
}

export const PROTOCOL_NOT_DEPLOYED_NOTE =
  "No BOILER contract is deployed on Robinhood Chain. Realised protocol revenue is zero and every figure below that is not zero is explicitly MODELLED from observed market activity.";

export const PROTOCOL_DEPLOYED_NOTE =
  "The BOILER contracts are deployed. The figures below are read from them, and the allocation that splits them is the one published in the RevenueRouter.";
