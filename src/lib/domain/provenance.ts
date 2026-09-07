/**
 * Provenance.
 *
 * BOILER's whole pitch is that the books are open, so every number the product
 * shows has to be able to answer three questions: where did you get me, how did
 * you compute me, and how old am I. Anything that cannot answer is labelled
 * DEMO and never dressed up as live.
 */

export type SourceKind =
  | "CHAIN" //   read directly from Robinhood Chain RPC
  | "DERIVED" // computed from CHAIN reads by a published formula
  | "MODELLED" // what the configured economics WOULD produce on observed activity
  | "DEMO" //    seeded local content, no economic reality behind it
  | "CONFIG"; //  a value an operator set, shown as set

export type Provenance = {
  source: SourceKind;
  method: string;
  /** Block window or time window the value covers. */
  window?: string;
  updatedAt: number;
  reference?: string;
};

export type Sourced<T> = { value: T; provenance: Provenance };

export function sourced<T>(value: T, provenance: Provenance): Sourced<T> {
  return { value, provenance };
}

export const SOURCE_COPY: Record<SourceKind, { label: string; blurb: string }> = {
  CHAIN: { label: "ONCHAIN", blurb: "Read straight off Robinhood Chain over JSON-RPC." },
  DERIVED: { label: "DERIVED", blurb: "Computed from onchain reads by a formula printed on this page." },
  MODELLED: {
    label: "MODELLED",
    blurb: "What the configured fee model would produce on observed activity. Not collected. Not revenue.",
  },
  DEMO: { label: "DEMO", blurb: "Seeded content so the surface is not empty. No economic reality behind it." },
  CONFIG: { label: "CONFIG", blurb: "An operator setting, shown exactly as configured." },
};
