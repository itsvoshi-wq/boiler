import { NextResponse } from "next/server";
import { getChainStatus } from "@/lib/chain/scanner";
import { ADDRESSES, rpcUrlPublic } from "@/lib/chain/public";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getChainStatus();
    return NextResponse.json({
      ok: true,
      ...status,
      rpc: rpcUrlPublic(),
      contracts: ADDRESSES,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "chain unreachable" },
      { status: 503 },
    );
  }
}
