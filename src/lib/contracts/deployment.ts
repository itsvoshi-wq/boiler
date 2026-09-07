import { encodeAbiParameters, parseAbiParameters, type Address, type Hex } from "viem";
import { ARTIFACTS, type ArtifactName } from "./artifacts";
import { ADDRESSES } from "../chain/chains";
import { DEFAULT_FEES } from "../domain/fees";
import { TIERS } from "../domain/staking";

/**
 * The deployment, described once.
 *
 * The admin page walks this list. Nothing about the order, the constructor
 * arguments or the wiring lives in a component, so what gets deployed is
 * readable here rather than spread across a form.
 */

export const ADMIN_ADDRESS = (
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x537746eF0d18389a353153455971D88bF99299a2"
).toLowerCase() as Address;

/** Set after the registry is deployed. Everything else is read from the registry. */
export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "").toLowerCase();

export const REGISTRY_KEYS = [
  "feeController",
  "revenueRouter",
  "router",
  "staking",
  "treasury",
  "boil",
] as const;
export type RegistryKey = (typeof REGISTRY_KEYS)[number];

export type DeployedAddresses = Partial<Record<RegistryKey | "registry", Address>>;

/* --------------------------------------------------------------- defaults */

export const DEFAULT_SCHEDULE = {
  protocolSwapBps: DEFAULT_FEES.protocolSwapBps,
  creatorMinBps: DEFAULT_FEES.creatorSwapBps.min,
  creatorDefaultBps: DEFAULT_FEES.creatorSwapBps.default,
  creatorMaxBps: DEFAULT_FEES.creatorSwapBps.max,
  brokerShareOfProtocolBps: DEFAULT_FEES.brokerShareOfProtocolBps,
  automationActionBps: DEFAULT_FEES.automationActionBps,
  strategyExecutionBps: DEFAULT_FEES.strategyExecutionBps,
} as const;

/** $BOIL is 18 decimals by assumption until the token exists and says otherwise. */
export const STAKE_TIER_THRESHOLDS = TIERS.map((t) => BigInt(t.minStake) * 10n ** 18n) as unknown as [
  bigint,
  bigint,
  bigint,
  bigint,
];
export const STAKE_TIER_DISCOUNTS = TIERS.map((t) => t.swapFeeDiscountBps) as unknown as [
  number,
  number,
  number,
  number,
];

/* ------------------------------------------------------------------ steps */

export type DeployStep = {
  key: RegistryKey | "registry";
  artifact: ArtifactName;
  title: string;
  why: string;
  /** Which earlier steps must already have an address. */
  needs: (RegistryKey | "registry")[];
  encodeArgs: (ctx: { owner: Address; addresses: DeployedAddresses }) => Hex;
  /** Human readable constructor arguments, printed before the button is pressed. */
  describeArgs: (ctx: { owner: Address; addresses: DeployedAddresses }) => [string, string][];
};

const z = "0x0000000000000000000000000000000000000000" as Address;
const need = (a: DeployedAddresses, k: RegistryKey | "registry"): Address => (a[k] ?? z) as Address;

export const DEPLOY_STEPS: DeployStep[] = [
  {
    key: "registry",
    artifact: "BoilerRegistry",
    title: "REGISTRY",
    why: "One address the front end has to know. Every other contract is discoverable from here, on chain, so the deployment is not a secret held in a config file.",
    needs: [],
    encodeArgs: ({ owner }) => encodeAbiParameters(parseAbiParameters("address"), [owner]),
    describeArgs: ({ owner }) => [["owner", owner]],
  },
  {
    key: "feeController",
    artifact: "BoilerFeeController",
    title: "FEE CONTROLLER",
    why: "The only place a BOILER fee can be decided. Bounds are enforced on write, so a desk cannot set 20% and quietly be charged 1%: the transaction reverts.",
    needs: ["registry"],
    encodeArgs: ({ owner }) =>
      encodeAbiParameters(parseAbiParameters("address, (uint16,uint16,uint16,uint16,uint16,uint16,uint16)"), [
        owner,
        [
          DEFAULT_SCHEDULE.protocolSwapBps,
          DEFAULT_SCHEDULE.creatorMinBps,
          DEFAULT_SCHEDULE.creatorDefaultBps,
          DEFAULT_SCHEDULE.creatorMaxBps,
          DEFAULT_SCHEDULE.brokerShareOfProtocolBps,
          DEFAULT_SCHEDULE.automationActionBps,
          DEFAULT_SCHEDULE.strategyExecutionBps,
        ],
      ]),
    describeArgs: ({ owner }) => [
      ["owner", owner],
      ["protocol swap fee", `${DEFAULT_SCHEDULE.protocolSwapBps} bps`],
      ["desk fee min / default / max", `${DEFAULT_SCHEDULE.creatorMinBps} / ${DEFAULT_SCHEDULE.creatorDefaultBps} / ${DEFAULT_SCHEDULE.creatorMaxBps} bps`],
      ["broker share of protocol fee", `${DEFAULT_SCHEDULE.brokerShareOfProtocolBps / 100}%`],
      ["hard cap, enforced in the contract", "100 bps"],
    ],
  },
  {
    key: "revenueRouter",
    artifact: "BoilerRevenueRouter",
    title: "REVENUE ROUTER",
    why: "Splits collected revenue across the published allocation. It refuses any allocation that does not total 10,000 bps, and refuses staker distribution until that is enabled with an on chain legal reference.",
    needs: ["registry"],
    encodeArgs: ({ owner }) => encodeAbiParameters(parseAbiParameters("address, address"), [owner, owner]),
    describeArgs: ({ owner }) => [
      ["owner", owner],
      ["treasury sink", owner],
      ["default allocation", "buyback 30, burn 10, POL 15, creators 20, brokers 10, treasury 15"],
    ],
  },
  {
    key: "router",
    artifact: "BoilerRouter",
    title: "SWAP ROUTER",
    why: "The contract that makes the fees real instead of modelled. It takes the protocol and desk fee out of the input token, then swaps the remainder through Uniswap V3 with you as recipient.",
    needs: ["feeController", "revenueRouter"],
    encodeArgs: ({ owner, addresses }) =>
      encodeAbiParameters(parseAbiParameters("address, address, address, address"), [
        owner,
        ADDRESSES.swapRouter02 as Address,
        need(addresses, "feeController"),
        need(addresses, "revenueRouter"),
      ]),
    describeArgs: ({ owner, addresses }) => [
      ["owner", owner],
      ["uniswap SwapRouter02", ADDRESSES.swapRouter02],
      ["fee controller", need(addresses, "feeController")],
      ["revenue sink", need(addresses, "revenueRouter")],
    ],
  },
  {
    key: "staking",
    artifact: "BoilStaking",
    title: "STAKING",
    why: "Stake $BOIL for capability. No emissions, no APR, no rewards accrual. The token address is set once, later, and then frozen.",
    needs: ["registry"],
    encodeArgs: ({ owner }) =>
      encodeAbiParameters(parseAbiParameters("address, uint256[4], uint16[4]"), [
        owner,
        STAKE_TIER_THRESHOLDS,
        STAKE_TIER_DISCOUNTS,
      ]),
    describeArgs: ({ owner }) => [
      ["owner", owner],
      ["tiers", TIERS.map((t) => `${t.key} ${t.minStake.toLocaleString()}`).join(", ")],
      ["fee discounts", TIERS.map((t) => `${t.swapFeeDiscountBps} bps`).join(", ")],
      ["token", "not set at deploy, frozen after it is"],
    ],
  },
];

export function initCode(step: DeployStep, ctx: { owner: Address; addresses: DeployedAddresses }): Hex {
  const bytecode = ARTIFACTS[step.artifact].bytecode;
  return (bytecode + step.encodeArgs(ctx).replace(/^0x/, "")) as Hex;
}

/* ---------------------------------------------------------------- wiring */

export type WireStep = {
  id: string;
  title: string;
  why: string;
  target: RegistryKey | "registry";
  artifact: ArtifactName;
  functionName: string;
  buildArgs: (a: DeployedAddresses) => unknown[];
  ready: (a: DeployedAddresses) => boolean;
};

export const WIRE_STEPS: WireStep[] = [
  {
    id: "registry-entries",
    title: "PUBLISH THE ADDRESSES",
    why: "Writes every deployed address into the registry so the front end and anyone else can read the deployment from one place.",
    target: "registry",
    artifact: "BoilerRegistry",
    functionName: "setMany",
    buildArgs: (a) => {
      const names: string[] = [];
      const values: Address[] = [];
      for (const k of REGISTRY_KEYS) {
        if (a[k]) {
          names.push(k);
          values.push(a[k] as Address);
        }
      }
      return [names, values];
    },
    ready: (a) => Boolean(a.registry) && REGISTRY_KEYS.some((k) => a[k]),
  },
  {
    id: "controller-staking",
    title: "POINT FEES AT STAKING",
    why: "Lets the fee controller read a staker's tier and apply the discount to the protocol fee. Never to the pool fee, which is not ours to discount.",
    target: "feeController",
    artifact: "BoilerFeeController",
    functionName: "setStaking",
    buildArgs: (a) => [need(a, "staking")],
    ready: (a) => Boolean(a.feeController && a.staking),
  },
  {
    id: "sink-buyback",
    title: "SET BUYBACK SINK",
    why: "Where the buyback share goes until a buyback executor exists. Treasury by default, and visible in The Books either way.",
    target: "revenueRouter",
    artifact: "BoilerRevenueRouter",
    functionName: "setSink",
    buildArgs: (a) => [1, need(a, "treasury")],
    ready: (a) => Boolean(a.revenueRouter && a.treasury),
  },
  {
    id: "sink-pol",
    title: "SET PROTOCOL OWNED LIQUIDITY SINK",
    why: "Where the POL share accumulates before it is deployed as liquidity.",
    target: "revenueRouter",
    artifact: "BoilerRevenueRouter",
    functionName: "setSink",
    buildArgs: (a) => [3, need(a, "treasury")],
    ready: (a) => Boolean(a.revenueRouter && a.treasury),
  },
  {
    id: "sink-creators",
    title: "SET CREATOR ECOSYSTEM SINK",
    why: "The pool desks are paid from, on top of their direct desk fees.",
    target: "revenueRouter",
    artifact: "BoilerRevenueRouter",
    functionName: "setSink",
    buildArgs: (a) => [4, need(a, "treasury")],
    ready: (a) => Boolean(a.revenueRouter && a.treasury),
  },
  {
    id: "sink-brokers",
    title: "SET BROKER PAYOUT SINK",
    why: "Brokers are also paid per trade by the swap router. This is the pooled remainder.",
    target: "revenueRouter",
    artifact: "BoilerRevenueRouter",
    functionName: "setSink",
    buildArgs: (a) => [5, need(a, "treasury")],
    ready: (a) => Boolean(a.revenueRouter && a.treasury),
  },
];

/* ------------------------------------------------------------------- env */

export function envBlock(a: DeployedAddresses): string {
  const lines = [`NEXT_PUBLIC_REGISTRY_ADDRESS=${a.registry ?? ""}`];
  if (a.router) lines.push(`NEXT_PUBLIC_BOILER_ROUTER=${a.router}`);
  lines.push(`NEXT_PUBLIC_ADMIN_ADDRESS=${ADMIN_ADDRESS}`);
  return lines.join("\n");
}
