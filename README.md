# BOILER

**The speculative market floor of Robinhood Chain.**

Wall Street attitude. Onchain accountability.

The aesthetic is a 1989 boiler room. The mechanics are the opposite of one: every
number in this product states where it came from, every ranking prints the rule
it sorts by, every fee is itemised before a signature, and the page that shows
protocol revenue shows zero because zero is the truth.

---

## What is real

This is not a mock. BOILER reads Robinhood Chain (chain ID `4663`) directly over
JSON-RPC, with no vendor feed and no hardcoded token list.

| Surface | Source |
| --- | --- |
| Market list, prices, volume, liquidity, trade counts, unique takers | Uniswap V3 `Swap` logs decoded over a stated block window, pool and token state via Multicall3, prices from `slot0`, inventory from `balanceOf(pool)` |
| The tape / order flow | Real decoded swaps with tx hashes, linked to the explorer |
| New Issues | `PoolCreated` events off the V3 factory `0x1f7d…2efa` |
| Chain status, block time, gas | `eth_chainId`, `eth_blockNumber`, `eth_getBlockByNumber`, `eth_gasPrice` |
| Portfolio | One multicall of `balanceOf` against the connected wallet |
| Execution | `exactInputSingle` on Uniswap V3 SwapRouter02 `0xcaf6…5cb2`, simulated with `eth_call` before signature |
| Heat, Pink Sheet ranks, track records, desk scores | Derived from the above by formulas printed on `/methodology` |

Contract addresses were discovered on chain, not copied from a docs page:
`factory()` on a live pool resolves to the V3 factory, `factory()` and `WETH9()`
on the router resolve to the same factory and to WETH.

## What is seeded

Desks, their historical closed calls, and strategies. There are no real BOILER
creators yet, so this content exists to make the creator layer inspectable. It is
labelled `SEEDED` / `DEMO HISTORY` on every surface where it appears.

The important part is what is **not** faked. Live calls anchor their entry
reference to the first price this deployment observed for that symbol, and the
anchor is written once, so the return shown is real market movement since a real
timestamp. Historical calls use fixed entry and close references that are never
recomputed, so they cannot drift into looking better than they were.

## What is off

Feature flags for anything whose economics or legal shape is not final. The
Books renders the flag object verbatim.

- `$BOIL` token: no contract, no price, no way to buy one from this site.
- Staking: the tier table is a specification.
- Staker revenue distribution: off pending legal review, and the allocation
  validator rejects any config that sets it above zero while the flag is off.
- Buyback module, broker payouts, automation execution, strategy replication.

## What it will not do

No wash trading, no synthetic volume, no fabricated holder counts, no invented
protocol revenue, no paid placement dressed as a ranking, no language model
writing market events, no hidden fees, no unlimited token approvals by default.

---

## Stack

Next.js 16 App Router · TypeScript strict · Tailwind CSS v4 · TanStack Query ·
wagmi + viem · Zod · Vitest.

Chain access is deliberately hand rolled at the RPC layer: the public endpoint
rate limits hard and caps `eth_getLogs` at 10,000 matches, so backoff, chunking
and Multicall3 batching live in one place (`src/lib/chain/`) rather than being
scattered through components.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run build       # production build
npm run scan        # standalone chain recon, prints the pools BOILER reads
```

## Deploy

```bash
vercel --prod
```

No environment variables are required: the public RPC is the default. Set
`RPC_URL` to a dedicated endpoint before any real traffic, because the public one
will rate limit under load and the app will degrade to a stale snapshot and say
so rather than showing you numbers it did not read.

## Layout

```
src/
  app/
    page.tsx                  marketing floor, cinematic open
    (floor)/                  the application shell
      floor/                  live markets, stats, the book
      pinks/                  Pink Sheets, ranked by published rules
      market/[symbol]/        market page, tape, pool state, order ticket
      desks/, desks/[slug]/   creator desks and track records
      calls/                  verified calls, live and pink slipped
      books/                  the ledger: real, modelled, config, flags
      new-issues/             PoolCreated off the factory
      leaderboards/           six boards, six published rules
      strategies/, automation/, portfolio/, orders/, brokers/, boil/
      methodology/, terms/
    api/                      markets, tape, street, chain, quote
  lib/
    chain/                    rpc, abi, multicall, uniswapV3, scanner, swap
    domain/                   fees, heat, pinksheets, performance, ranking,
                              revenue, staking, risk, street, provenance
    data/                     seeded desks, store interface
  components/                 brand, shell, floor, marketing, ui
contracts/                    FeeController, RevenueRouter, BoilStaking (specs)
db/schema.sql                 PostgreSQL target schema
tests/                        vitest
```

## Honest limitations

- **The window is minutes, not a day.** Blocks land every ~0.1s and the public
  RPC caps a log query at 10,000 matches, so a real 24h scan is not possible from
  this endpoint on demand. BOILER prints the window it actually read instead of
  extrapolating one it did not. `db/schema.sql` has a `volume_samples` table for
  building longer horizons up honestly over time.
- **Quotes are indicative until simulated.** The in-app quote uses constant
  liquidity inside the current tick. The number you sign against comes from an
  `eth_call` simulation of the router with your address and approvals.
- **The store is in-process.** No `DATABASE_URL` is provisioned, so call anchors
  and rolling samples live for the lifetime of a server instance. The Books says
  so.
- **No audits.** No BOILER contract exists, so there is nothing to audit yet. The
  Solidity in `contracts/` is interface-level specification.
