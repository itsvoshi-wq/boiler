import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

const SECTIONS: [string, string][] = [
  [
    "WHAT THIS IS",
    "BOILER is an interface to public smart contracts on Robinhood Chain. It is not a broker, not an exchange, not a custodian and not an investment adviser. It routes orders you sign yourself to Uniswap V3 contracts it did not deploy.",
  ],
  [
    "NO CUSTODY",
    "BOILER never holds your assets and never holds a key. It will never ask for a seed phrase or a private key, and any page that does is not BOILER.",
  ],
  [
    "NO ADVICE",
    "Nothing on this site is investment advice, a recommendation, or a solicitation. Calls published by desks are the opinions of whoever published them. A track record is a description of what already happened and predicts nothing.",
  ],
  [
    "TOKENIZED EQUITY EXPOSURE",
    "Tokens whose names reference a company or an ETF are instruments issued by a third party. Holding one is not legal share ownership, does not confer shareholder rights, and does not entitle the holder to dividends unless the issuer states otherwise. BOILER labels these tokens on every surface where they appear.",
  ],
  [
    "SPECULATIVE MARKETS",
    "Many markets shown here are thin, new, concentrated in a small number of wallets, or all three. BOILER surfaces those conditions rather than hiding them, but surfacing a risk does not remove it. You can lose the entire amount you put in.",
  ],
  [
    "FEES",
    "Fee configuration is published in The Books and itemised on every order ticket before signature. Protocol fees are not currently being collected because no BOILER contract is deployed.",
  ],
  [
    "$BOIL",
    "No $BOIL contract exists. Nothing on this site is an offer to sell a token, and any account or page offering to sell you one is not affiliated with BOILER.",
  ],
  [
    "DATA",
    "Market data is read from a public RPC endpoint over a short, stated block window and can be incomplete, delayed or wrong. BOILER shows the window and the source so you can check it yourself.",
  ],
  [
    "AVAILABILITY",
    "The interface may be unavailable, degraded, or wrong at any time. The contracts it talks to are not operated by BOILER.",
  ],
];

export default function TermsPage() {
  return (
    <div className="px-4 py-8">
      <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">TERMS.</h1>
      <p className="mt-2 max-w-3xl mono-tight text-[11px] leading-relaxed text-steel">
        Short, because a long one is usually hiding something.
      </p>
      <div className="mt-6 max-w-3xl space-y-5">
        {SECTIONS.map(([h, b], i) => (
          <section key={h} className="border-b border-ash2/60 pb-4">
            <h2 className="cond text-xl text-cream">
              <span className="mr-2 text-ox2">{String(i + 1).padStart(2, "0")}</span>
              {h}
            </h2>
            <p className="mt-1 mono-tight text-[11px] leading-relaxed text-cream2">{b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
