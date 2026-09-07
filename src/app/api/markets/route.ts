import { NextResponse } from "next/server";
import { scanMarkets } from "@/lib/chain/scanner";
import { computeHeat } from "@/lib/domain/heat";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snap = await scanMarkets();
  return NextResponse.json(
    {
      ...snap,
      markets: snap.markets.map((m) => ({ ...m, heat: computeHeat(m, snap.windowSeconds) })),
    },
    { headers: { "cache-control": "public, s-maxage=15, stale-while-revalidate=45" } },
  );
}
