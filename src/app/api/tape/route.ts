import { NextResponse } from "next/server";
import { scanMarkets } from "@/lib/chain/scanner";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");
  const limit = Math.min(200, Number(url.searchParams.get("limit") || 60));
  const snap = await scanMarkets();
  const trades = symbol
    ? snap.trades.filter((t) => t.symbol.toUpperCase() === symbol.toUpperCase())
    : snap.trades;
  return NextResponse.json(
    {
      trades: trades.slice(0, limit),
      block: snap.block,
      windowSeconds: snap.windowSeconds,
      provenance: snap.provenance,
    },
    { headers: { "cache-control": "public, s-maxage=10, stale-while-revalidate=30" } },
  );
}
