/**
 * Store.
 *
 * The target is PostgreSQL (schema in db/schema.sql). Until a database is
 * provisioned this is an in-process implementation behind the same interface,
 * so nothing above it has to know, and so no page pretends to have persistence
 * it does not have.
 */

export type CallAnchor = {
  id: string;
  symbol: string;
  entryReference: number;
  entryBlock: number;
  anchoredAt: number;
};

export interface BoilerStore {
  readonly kind: "memory" | "postgres";
  getAnchor(id: string): Promise<CallAnchor | null>;
  putAnchor(anchor: CallAnchor): Promise<void>;
  allAnchors(): Promise<CallAnchor[]>;
  recordVolumeSample(sample: { at: number; volumeUsd: number; trades: number }): Promise<void>;
  volumeSamples(): Promise<{ at: number; volumeUsd: number; trades: number }[]>;
  startedAt(): number;
}

class MemoryStore implements BoilerStore {
  readonly kind = "memory" as const;
  private anchors = new Map<string, CallAnchor>();
  private samples: { at: number; volumeUsd: number; trades: number }[] = [];
  private boot = Date.now();

  async getAnchor(id: string) {
    return this.anchors.get(id) ?? null;
  }
  async putAnchor(anchor: CallAnchor) {
    if (!this.anchors.has(anchor.id)) this.anchors.set(anchor.id, anchor);
  }
  async allAnchors() {
    return [...this.anchors.values()];
  }
  async recordVolumeSample(sample: { at: number; volumeUsd: number; trades: number }) {
    this.samples.push(sample);
    // Keep a bounded rolling series. Serverless instances are short lived; this
    // is a cache of observations, never the source of truth.
    if (this.samples.length > 2000) this.samples = this.samples.slice(-2000);
  }
  async volumeSamples() {
    return this.samples;
  }
  startedAt() {
    return this.boot;
  }
}

const globalStore = globalThis as unknown as { __boilerStore?: BoilerStore };

export function getStore(): BoilerStore {
  if (!globalStore.__boilerStore) globalStore.__boilerStore = new MemoryStore();
  return globalStore.__boilerStore;
}

export const STORE_NOTE =
  process.env.DATABASE_URL
    ? "DATABASE_URL is set but the Postgres driver is not wired in this build. Running on the in-process store."
    : "No DATABASE_URL configured. Running on the in-process store: anchors and rolling samples live for the lifetime of a server instance and are not shared between them.";
