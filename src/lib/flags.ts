/**
 * Feature flags.
 *
 * Anything whose economics or legal shape is not finalised ships off. The flags
 * are read here and nowhere else, and The Books renders this object verbatim so
 * a user can see exactly what is switched on.
 */
const on = (v: string | undefined, dflt = false) =>
  v === undefined ? dflt : v === "1" || v.toLowerCase() === "true";

export const FLAGS = {
  /** Live swap submission through SwapRouter02. Reads are always on. */
  liveExecution: on(process.env.NEXT_PUBLIC_FLAG_LIVE_EXECUTION, true),
  /** $BOIL contract does not exist yet. Staking UI is a specification. */
  boilToken: on(process.env.NEXT_PUBLIC_FLAG_BOIL_TOKEN, false),
  staking: on(process.env.NEXT_PUBLIC_FLAG_STAKING, false),
  /** Requires legal review. Do not enable to make a chart look better. */
  stakerRevenueDistribution: on(process.env.NEXT_PUBLIC_FLAG_STAKER_DISTRIBUTION, false),
  buybackModule: on(process.env.NEXT_PUBLIC_FLAG_BUYBACK, false),
  brokerPayouts: on(process.env.NEXT_PUBLIC_FLAG_BROKER_PAYOUTS, false),
  automationExecution: on(process.env.NEXT_PUBLIC_FLAG_AUTOMATION, false),
  strategyReplication: on(process.env.NEXT_PUBLIC_FLAG_STRATEGY_REPLICATION, false),
  /** Desks and calls are seeded until there are real creators. */
  seededCreators: on(process.env.NEXT_PUBLIC_FLAG_SEEDED_CREATORS, true),
  ambientAudio: on(process.env.NEXT_PUBLIC_FLAG_AUDIO, false),
} as const;

export type FlagKey = keyof typeof FLAGS;

export const FLAG_NOTES: Record<FlagKey, string> = {
  liveExecution: "Swap building, simulation and submission against Uniswap V3 SwapRouter02 on Robinhood Chain.",
  boilToken: "No $BOIL contract is deployed. Everything on the token page is a specification.",
  staking: "Staking contract not deployed. Tiers are the published design, not a live balance.",
  stakerRevenueDistribution: "Off pending legal review. Never enable to improve a chart.",
  buybackModule: "RevenueRouter buyback executor not deployed.",
  brokerPayouts: "Broker accounting is modelled. No fees have been collected or paid.",
  automationExecution: "Automation rules can be written and inspected. Nothing submits transactions yet.",
  strategyReplication: "Strategies are publishable and forkable. Automated replication is not live.",
  seededCreators: "Desks and calls are seeded content so the surface is inspectable. Market maths under them is real.",
  ambientAudio: "Floor ambience. Muted by default, always.",
};
