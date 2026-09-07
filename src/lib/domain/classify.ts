import type { AssetClass } from "./types";

const STABLES = new Set(["USDG", "USDC", "USDT", "DAI", "PYUSD", "USDS", "FRAX", "RLUSD"]);
const MAJORS = new Set(["WETH", "ETH", "WBTC", "BTC", "SOL", "XMR", "TAO", "LINK", "AVAX", "DOGE"]);

/**
 * Robinhood Chain names its tokenized equities "<Company> - Robinhood Token".
 * That naming is the classifier, not a hardcoded ticker list, so a stock listed
 * ten minutes from now classifies correctly with no code change.
 */
const EQUITY_MARKERS = [
  "robinhood token",
  "etf trust",
  "american depositary",
  "depositary shares",
];

export function classifyAsset(symbol: string, name: string): AssetClass {
  const s = symbol.toUpperCase().trim();
  const n = name.toLowerCase();
  if (STABLES.has(s)) return "STABLE";
  if (EQUITY_MARKERS.some((m) => n.includes(m))) return "TOKENIZED_EQUITY";
  if (MAJORS.has(s)) return "CRYPTO";
  if (!s) return "UNKNOWN";
  const memeish =
    /(cat|dog|inu|pepe|wojak|chan|moon|meme|frog|elon|baby|floki|shib)/i.test(`${s} ${n}`) ||
    s.length > 8;
  if (memeish) return "MEME";
  return "ALTCOIN";
}

export function wrapperDisclosure(symbol: string, name: string): string | null {
  if (classifyAsset(symbol, name) !== "TOKENIZED_EQUITY") return null;
  return "Tokenized exposure issued on Robinhood Chain. This is a token, not a legal share, not a shareholder right, and not a claim on a dividend unless the issuer says so.";
}

export const ASSET_CLASS_LABEL: Record<AssetClass, string> = {
  TOKENIZED_EQUITY: "EQUITY",
  CRYPTO: "CRYPTO",
  ALTCOIN: "ALT",
  MEME: "MEME",
  STABLE: "STABLE",
  UNKNOWN: "UNCLASSIFIED",
};
