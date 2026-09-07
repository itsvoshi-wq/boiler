import { ADDRESSES, DEFAULT_RPC } from "./chains";

export { ADDRESSES };

/**
 * The RPC endpoint, safe to render on a public page.
 *
 * This string is printed in the chain strip on every page and in The Books, so
 * it must never carry a credential. API keys live in the path (Alchemy:
 * /v2/<key>), in the query string, and occasionally in a subdomain, and an
 * earlier version of this function tried to decide when a path was "long
 * enough" to be a secret. That heuristic was wrong and shipped a key to a live
 * page. So: the host, and never anything after it.
 */
export function rpcUrlPublic(): string {
  const url = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC;
  try {
    const u = new URL(url);
    const hasPath = u.pathname.replace(/\/+$/, "") !== "" || u.search !== "" || u.username !== "";
    return hasPath ? `${u.host}/…` : u.host;
  } catch {
    return "configured";
  }
}
