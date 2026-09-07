import type { Metadata } from "next";
import { HEAT_METHOD } from "@/lib/domain/heat";
import { PINK_SECTIONS } from "@/lib/domain/pinksheets";
import { RANK_METHOD } from "@/lib/domain/ranking";
import { TRACK_RECORD_METHOD } from "@/lib/domain/performance";
import { SOURCE_COPY } from "@/lib/domain/provenance";
import { Panel } from "@/components/ui/Panel";

export const metadata: Metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <div className="px-4 py-8">
      <header className="max-w-3xl">
        <h1 className="headline text-[clamp(2rem,6vw,4rem)] text-cream">HOW EVERY NUMBER IS MADE.</h1>
        <p className="mt-2 mono-tight text-[11px] leading-relaxed text-steel">
          If a figure appears anywhere in BOILER, its rule is on this page. That is the deal: the aesthetic is savage,
          the mechanics are inspectable.
        </p>
      </header>

      <div className="mt-6 grid max-w-5xl gap-4">
        <Panel label="SOURCE LABELS">
          <ul className="space-y-2">
            {Object.entries(SOURCE_COPY).map(([k, v]) => (
              <li key={k} className="border-b border-ash2/40 pb-2">
                <span className="cond text-[15px] text-cream">{v.label}</span>
                <p className="mono-tight text-[11px] leading-relaxed text-steel">{v.blurb}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel label="MARKET DISCOVERY">
          <p className="mono-tight text-[11px] leading-relaxed text-cream2">
            BOILER does not keep a hardcoded token list. It decodes Uniswap V3 Swap events over a stated block window,
            ranks the pools by how much they actually traded, then reads token0, token1, fee, slot0 and liquidity for
            each of them through Multicall3. Token symbol, name and decimals come from the contracts themselves. Pool
            inventory is ERC20 balanceOf on the pool address. Prices are computed from sqrtPriceX96. A dollar basis is
            built by walking outward from USDG, so a token with no path to a dollar is left unpriced rather than
            guessed. One market survives per base token: the pool with the deepest inventory.
          </p>
        </Panel>

        <Panel label="ASSET CLASSIFICATION">
          <p className="mono-tight text-[11px] leading-relaxed text-cream2">
            Tokenized equities are identified by the naming convention the issuer uses onchain, so a stock listed after
            this page was written classifies correctly with no code change. Stables and majors come from a short
            explicit list. Everything else is split between ALT and MEME on symbol and name shape. Classification is a
            label, never a safety rating.
          </p>
        </Panel>

        <Panel label="HEAT">
          <p className="mono-tight text-[11px] leading-relaxed text-cream2">{HEAT_METHOD}</p>
        </Panel>

        <Panel label="PINK SHEET SECTIONS">
          <ul className="space-y-1">
            {PINK_SECTIONS.map((s) => (
              <li key={s.key} className="flex flex-col gap-0.5 border-b border-ash2/40 py-1.5 sm:flex-row sm:gap-4">
                <span className="w-48 shrink-0 cond text-[14px] text-cream">{s.title}</span>
                <span className="mono-tight text-[10px] leading-relaxed text-steel">{s.rule}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel label="TRACK RECORDS">
          <p className="mono-tight text-[11px] leading-relaxed text-cream2">{TRACK_RECORD_METHOD}</p>
        </Panel>

        <Panel label="LEADERBOARD SCORE">
          <p className="mono-tight text-[11px] leading-relaxed text-cream2">{RANK_METHOD}</p>
        </Panel>

        <Panel label="WHAT BOILER WILL NOT DO">
          <ul className="space-y-1 mono-tight text-[11px] leading-relaxed text-cream2">
            <li>No wash trading, self-trading, or any tooling that manufactures volume.</li>
            <li>No synthetic holder counts, no fabricated liquidity, no invented protocol revenue.</li>
            <li>No paid placement dressed as a ranking. Every board prints its rule.</li>
            <li>No language model writing market events. The Street Feed is templated from decoded logs.</li>
            <li>No hidden fees. Pool fee, protocol fee and desk fee are itemised before every signature.</li>
            <li>No unlimited token approvals by default.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
