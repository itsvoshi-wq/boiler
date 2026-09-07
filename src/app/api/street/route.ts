import { NextResponse } from "next/server";
import { fetchNewPools, scanMarkets } from "@/lib/chain/scanner";
import { buildStreet } from "@/lib/domain/street";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await scanMarkets();
  const newPools = await fetchNewPools().catch(() => []);
  return NextResponse.json(
    { events: buildStreet(snap, newPools), provenance: snap.provenance },
    { headers: { "cache-control": "public, s-maxage=15, stale-while-revalidate=45" } },
  );
}
