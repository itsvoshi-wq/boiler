import { ADDRESSES, DEFAULT_RPC } from "./chains";

export { ADDRESSES };

/** Never leak an API keyed RPC into a public response. */
export function rpcUrlPublic() {
  const url = process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC;
  try {
    const u = new URL(url);
    if (u.search || u.pathname.split("/").filter(Boolean).length > 2) {
      return `${u.protocol}//${u.host}/…`;
    }
    return url;
  } catch {
    return "configured";
  }
}
