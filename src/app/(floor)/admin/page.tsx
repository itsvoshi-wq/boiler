import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { SOLC_VERSION, ARTIFACTS } from "@/lib/contracts/artifacts";
import { ADMIN_ADDRESS, REGISTRY_ADDRESS } from "@/lib/contracts/deployment";
import { num } from "@/lib/format";

export const metadata: Metadata = { title: "The Back Office", robots: { index: false, follow: false } };

export default function AdminPage() {
  const total = Object.values(ARTIFACTS).reduce((a, x) => a + x.deployedSize, 0);

  return (
    <div className="px-4 py-8">
      <header className="max-w-4xl">
        <p className="label">BACK OFFICE</p>
        <h1 className="headline text-[clamp(2rem,6vw,4.2rem)] leading-none text-cream">OPEN THE SAFE.</h1>
        <p className="mt-3 mono-tight text-[11px] leading-relaxed text-steel">
          This is where BOILER stops being a specification. Deploying these contracts is what turns the fee schedule
          from arithmetic on The Books into money that actually moves, so nothing here is a draft: it is the bytecode
          compiled from the Solidity in this repository, and the address that presses the buttons owns what comes out.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-px border border-ash2 bg-ash2 md:grid-cols-4">
          {[
            ["COMPILER", SOLC_VERSION.split("+")[0]],
            ["CONTRACTS", String(Object.keys(ARTIFACTS).length)],
            ["DEPLOYED BYTECODE", `${num(total)} bytes`],
            ["REGISTRY IN ENV", REGISTRY_ADDRESS ? "SET" : "NOT SET"],
          ].map(([k, v]) => (
            <div key={k} className="bg-char px-3 py-2.5">
              <dt className="mono-tight text-[9px] tracking-[0.16em] text-steel2">{k}</dt>
              <dd className="mt-0.5 cond text-lg tabular text-cream">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 mono-tight text-[10px] leading-relaxed text-brass">
          NOT AUDITED. Five contracts, unaudited, deployed by one address. They have unit tests that run the real
          bytecode in a real EVM, and that is not the same thing as an audit. Route size through them only after
          someone independent has read them.
        </p>
        <p className="mt-1 mono-tight text-[10px] leading-relaxed text-steel2">
          Admin address: {ADMIN_ADDRESS}
        </p>
      </header>

      <div className="mt-8 max-w-4xl">
        <AdminConsole />
      </div>
    </div>
  );
}
