"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { encodeFunctionData, keccak256, toBytes, type Address, type Hex } from "viem";
import { useAccount, useChainId, useConnect, usePublicClient, useSendTransaction, useSwitchChain } from "wagmi";
import { ARTIFACTS } from "@/lib/contracts/artifacts";
import {
  ADMIN_ADDRESS,
  DEPLOY_STEPS,
  REGISTRY_ADDRESS,
  REGISTRY_KEYS,
  WIRE_STEPS,
  envBlock,
  initCode,
  type DeployedAddresses,
  type RegistryKey,
} from "@/lib/contracts/deployment";
import { ROBINHOOD_CHAIN_ID, EXPLORER, ADDRESSES } from "@/lib/chain/chains";
import { cn } from "@/lib/cn";
import { addr } from "@/lib/format";

const STORAGE_KEY = "boiler.deployment.v1";

type Log = { at: number; text: string; tone: "info" | "ok" | "bad"; href?: string };

function loadLocal(): DeployedAddresses {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DeployedAddresses) : {};
  } catch {
    return {};
  }
}

function saveLocal(a: DeployedAddresses) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    /* private window, nothing to do */
  }
}

export function AdminConsole() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const [addresses, setAddresses] = useState<DeployedAddresses>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<Log[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const isAdmin = Boolean(address && address.toLowerCase() === ADMIN_ADDRESS);
  const wrongChain = isConnected && chainId !== ROBINHOOD_CHAIN_ID;

  const push = useCallback((text: string, tone: Log["tone"] = "info", href?: string) => {
    setLog((l) => [{ at: Date.now(), text, tone, href }, ...l].slice(0, 60));
  }, []);

  const update = useCallback((patch: DeployedAddresses) => {
    setAddresses((prev) => {
      const next = { ...prev, ...patch };
      saveLocal(next);
      return next;
    });
  }, []);

  // Local cache first so a refresh does not lose the run, then the chain.
  useEffect(() => {
    const t = setTimeout(() => {
      const local = loadLocal();
      const seeded: DeployedAddresses = REGISTRY_ADDRESS
        ? { ...local, registry: REGISTRY_ADDRESS as Address }
        : local;
      setAddresses(seeded);
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const refreshFromChain = useCallback(async () => {
    const registry = addresses.registry;
    if (!registry || !publicClient) return;
    try {
      const [keys, values] = (await publicClient.readContract({
        address: registry,
        abi: ARTIFACTS.BoilerRegistry.abi,
        functionName: "snapshot",
      })) as [Hex[], Address[]];

      const byHash = new Map(REGISTRY_KEYS.map((k) => [keccak256(toBytes(k)), k] as const));
      const found: DeployedAddresses = {};
      keys.forEach((k, i) => {
        const name = byHash.get(k);
        const v = values[i];
        if (name && v && v !== "0x0000000000000000000000000000000000000000") found[name] = v;
      });
      update(found);
      push(`Read ${Object.keys(found).length} entries from the registry.`, "ok");
    } catch (err) {
      push(`Registry read failed: ${err instanceof Error ? err.message.split("\n")[0] : "unknown"}`, "bad");
    }
  }, [addresses.registry, publicClient, push, update]);

  // Read the registry once it is known. Deferred to a task rather than run in
  // the effect body so the read never turns into a cascading render.
  useEffect(() => {
    if (!addresses.registry || !publicClient) return;
    const t = setTimeout(() => void refreshFromChain(), 0);
    return () => clearTimeout(t);
    // Only when the registry address itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.registry, publicClient]);

  const send = useCallback(
    async (id: string, tx: { to?: Address; data: Hex }, label: string) => {
      if (!publicClient || !address) return null;
      setBusy(id);
      try {
        push(`${label}: sending…`);
        const hash = await sendTransactionAsync(tx.to ? { to: tx.to, data: tx.data } : { data: tx.data });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success") {
          push(`${label}: reverted on chain.`, "bad", EXPLORER.tx(hash));
          return null;
        }
        push(`${label}: confirmed in block ${receipt.blockNumber}.`, "ok", EXPLORER.tx(hash));
        return receipt;
      } catch (err) {
        push(`${label}: ${err instanceof Error ? err.message.split("\n")[0] : "failed"}`, "bad");
        return null;
      } finally {
        setBusy(null);
      }
    },
    [publicClient, address, sendTransactionAsync, push],
  );

  const deploy = useCallback(
    async (stepKey: string) => {
      const step = DEPLOY_STEPS.find((s) => s.key === stepKey);
      if (!step || !address) return;
      const data = initCode(step, { owner: address, addresses });
      const receipt = await send(`deploy:${step.key}`, { data }, `Deploy ${step.title}`);
      if (receipt?.contractAddress) {
        update({ [step.key]: receipt.contractAddress.toLowerCase() as Address });
        push(`${step.title} live at ${receipt.contractAddress}`, "ok", EXPLORER.address(receipt.contractAddress));
      }
    },
    [address, addresses, send, update, push],
  );

  const wire = useCallback(
    async (id: string) => {
      const step = WIRE_STEPS.find((s) => s.id === id);
      if (!step) return;
      const to = addresses[step.target];
      if (!to) return;
      const data = encodeFunctionData({
        abi: ARTIFACTS[step.artifact].abi,
        functionName: step.functionName,
        args: step.buildArgs(addresses),
      } as never);
      await send(`wire:${id}`, { to, data }, step.title);
      if (id === "registry-entries") await refreshFromChain();
    },
    [addresses, send, refreshFromChain],
  );

  const deployedCount = DEPLOY_STEPS.filter((s) => addresses[s.key]).length;

  /* ----------------------------------------------------------- gating UI */

  if (!hydrated) {
    return <p className="mono-tight text-[11px] text-steel2">OPENING THE SAFE…</p>;
  }

  if (!isConnected) {
    return (
      <div className="border border-ash2 bg-char p-6">
        <p className="cond text-3xl text-cream">LOCKED.</p>
        <p className="mt-1 mono-tight text-[11px] leading-relaxed text-steel">
          This console deploys contracts that take fees. It opens for one address and nobody else:{" "}
          <span className="text-cream2">{ADMIN_ADDRESS}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {connectors.length === 0 && (
            <span className="mono-tight text-[11px] text-steel2">No injected wallet in this browser.</span>
          )}
          {connectors.map((c) => (
            <button
              key={c.uid}
              onClick={() => connect({ connector: c })}
              className="border border-cream bg-cream px-4 py-2.5 cond text-[13px] text-pitch hover:border-term hover:bg-term"
            >
              CONNECT {c.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="border-2 border-ox2 bg-ox/20 p-6">
        <p className="headline text-4xl text-cream">WRONG DESK.</p>
        <p className="mt-2 mono-tight text-[11px] leading-relaxed text-cream2">
          Connected as <span className="text-red">{address}</span>. This console answers to{" "}
          <span className="text-cream">{ADMIN_ADDRESS}</span> only. Nothing here is hidden from you, the contracts
          are public and every parameter is readable by anyone. You just cannot press the buttons.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {wrongChain && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-red bg-ox/30 px-4 py-3">
          <p className="mono-tight text-[11px] text-cream">
            Wrong chain. This deploys to Robinhood Chain 4663, you are on {chainId}.
          </p>
          <button
            onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}
            className="border border-cream px-3 py-1.5 cond text-[12px] text-cream hover:bg-cream hover:text-pitch"
          >
            SWITCH TO 4663
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border border-term2 bg-money/40 px-4 py-2.5">
        <p className="mono-tight text-[11px] text-term">
          ADMIN ON THE FLOOR · {addr(address ?? "", 6)} · {deployedCount}/{DEPLOY_STEPS.length} CONTRACTS DEPLOYED
        </p>
        <button
          onClick={() => void refreshFromChain()}
          disabled={!addresses.registry}
          className="border border-ash2 px-3 py-1.5 mono-tight text-[10px] tracking-[0.14em] text-steel hover:border-cream hover:text-cream disabled:opacity-40"
        >
          RE-READ REGISTRY
        </button>
      </div>

      {/* ------------------------------------------------------ deploy */}
      <section>
        <h2 className="cond text-2xl text-cream">01 · DEPLOY</h2>
        <p className="mb-3 mono-tight text-[10px] leading-relaxed text-steel">
          Bytecode compiled from the Solidity in this repo with solc 0.8.28, optimizer on, and committed as an
          artifact. There is no hidden build step. These contracts are unaudited: read them before you route size.
        </p>
        <div className="space-y-2">
          {DEPLOY_STEPS.map((step) => {
            const at = addresses[step.key];
            const blocked = step.needs.some((n) => !addresses[n]);
            const args = address ? step.describeArgs({ owner: address, addresses }) : [];
            return (
              <article
                key={step.key}
                className={cn("border bg-char", at ? "border-term2" : blocked ? "border-ash2/50" : "border-ash2")}
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ash2 px-3 py-2">
                  <div className="flex items-baseline gap-3">
                    <span className="cond text-xl text-cream">{step.title}</span>
                    <span className="mono-tight text-[10px] text-steel2">{step.artifact}</span>
                  </div>
                  {at ? (
                    <a
                      href={EXPLORER.address(at)}
                      target="_blank"
                      rel="noreferrer"
                      className="mono-tight text-[10px] text-term hover:underline"
                    >
                      {at}
                    </a>
                  ) : (
                    <button
                      onClick={() => void deploy(step.key)}
                      disabled={blocked || busy !== null || wrongChain}
                      className="border border-cream bg-cream px-4 py-2 cond text-[13px] text-pitch hover:border-term hover:bg-term disabled:opacity-40"
                    >
                      {busy === `deploy:${step.key}` ? "DEPLOYING…" : blocked ? "NEEDS EARLIER STEPS" : "DEPLOY"}
                    </button>
                  )}
                </header>
                <div className="space-y-2 p-3">
                  <p className="mono-tight text-[10px] leading-relaxed text-cream2">{step.why}</p>
                  <dl className="space-y-0.5">
                    {args.map(([k, v]) => (
                      <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-ash2/40 py-0.5">
                        <dt className="mono-tight text-[10px] tracking-[0.12em] text-steel2">{k}</dt>
                        <dd className="mono-tight text-[10px] break-all text-cream2">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------- wire */}
      <section>
        <h2 className="cond text-2xl text-cream">02 · WIRE</h2>
        <p className="mb-3 mono-tight text-[10px] leading-relaxed text-steel">
          Deployed is not connected. These calls publish the addresses and point the contracts at each other.
        </p>
        <div className="space-y-2">
          {WIRE_STEPS.map((step) => {
            const ready = step.ready(addresses);
            return (
              <div
                key={step.id}
                className="flex flex-wrap items-center justify-between gap-3 border border-ash2 bg-char px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="cond text-[15px] text-cream">{step.title}</p>
                  <p className="mono-tight text-[10px] leading-relaxed text-steel">{step.why}</p>
                </div>
                <button
                  onClick={() => void wire(step.id)}
                  disabled={!ready || busy !== null || wrongChain}
                  className="shrink-0 border border-ash2 px-4 py-2 cond text-[13px] text-cream hover:border-term hover:text-term disabled:opacity-40"
                >
                  {busy === `wire:${step.id}` ? "SENDING…" : ready ? "RUN" : "NOT READY"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <AdminOperations
        addresses={addresses}
        busy={busy}
        wrongChain={wrongChain}
        onSend={send}
        onRefresh={refreshFromChain}
      />

      {/* --------------------------------------------------------- env */}
      <section>
        <h2 className="cond text-2xl text-cream">04 · PUT THIS IN VERCEL</h2>
        <p className="mb-2 mono-tight text-[10px] leading-relaxed text-steel">
          Until the registry address is in the environment, this console is the only thing that knows where the
          deployment lives. Paste this into the project environment and redeploy, then the whole site reads the
          contracts.
        </p>
        <pre className="overflow-x-auto border border-ash2 bg-pitch p-3 mono-tight text-[11px] text-term">
          {envBlock(addresses)}
        </pre>
      </section>

      {/* --------------------------------------------------------- log */}
      <section>
        <h2 className="cond text-2xl text-cream">TRANSACTION LOG</h2>
        <div className="mt-2 border border-ash2 bg-char">
          {log.length === 0 ? (
            <p className="px-3 py-4 mono-tight text-[11px] text-steel2">NOTHING SENT YET.</p>
          ) : (
            <ul>
              {log.map((l) => (
                <li
                  key={`${l.at}-${l.text}`}
                  className={cn(
                    "flex items-baseline justify-between gap-3 border-b border-ash2/50 px-3 py-1.5 mono-tight text-[11px] last:border-0",
                    l.tone === "ok" ? "text-term" : l.tone === "bad" ? "text-red" : "text-cream2",
                  )}
                >
                  <span className="break-all">{l.text}</span>
                  {l.href && (
                    <a href={l.href} target="_blank" rel="noreferrer" className="shrink-0 text-steel2 hover:text-cream">
                      TX →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="mono-tight text-[10px] leading-relaxed text-steel2">
        Uniswap SwapRouter02 on this chain: {ADDRESSES.swapRouter02}. BOILER never becomes the counterparty to your
        trade, it takes a published fee and forwards the rest.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ operations */

function AdminOperations({
  addresses,
  busy,
  wrongChain,
  onSend,
  onRefresh,
}: {
  addresses: DeployedAddresses;
  busy: string | null;
  wrongChain: boolean;
  onSend: (id: string, tx: { to?: Address; data: Hex }, label: string) => Promise<unknown>;
  onRefresh: () => Promise<void>;
}) {
  const [boilToken, setBoilToken] = useState("");
  const [sweepToken, setSweepToken] = useState("");
  const [legalRef, setLegalRef] = useState("");

  const call = useCallback(
    (id: string, key: RegistryKey, artifact: keyof typeof ARTIFACTS, functionName: string, args: unknown[], label: string) => {
      const to = addresses[key];
      if (!to) return;
      const data = encodeFunctionData({ abi: ARTIFACTS[artifact].abi, functionName, args } as never);
      void onSend(id, { to, data }, label);
    },
    [addresses, onSend],
  );

  const has = useMemo(
    () => ({
      controller: Boolean(addresses.feeController),
      router: Boolean(addresses.router),
      revenue: Boolean(addresses.revenueRouter),
      staking: Boolean(addresses.staking),
    }),
    [addresses],
  );

  const disabled = busy !== null || wrongChain;

  return (
    <section>
      <h2 className="cond text-2xl text-cream">03 · OPERATE</h2>
      <p className="mb-3 mono-tight text-[10px] leading-relaxed text-steel">
        Everything here is a public transaction with an event. There is no private switch.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title="TRADING" note="The swap router can be stopped without touching anyone's balance. Positions are in wallets, not here.">
          <div className="flex gap-2">
            <button
              onClick={() => call("op:pause", "router", "BoilerRouter", "pause", [], "Pause router")}
              disabled={!has.router || disabled}
              className="flex-1 border border-red px-3 py-2 cond text-[13px] text-red hover:bg-red hover:text-pitch disabled:opacity-40"
            >
              PAUSE
            </button>
            <button
              onClick={() => call("op:unpause", "router", "BoilerRouter", "unpause", [], "Unpause router")}
              disabled={!has.router || disabled}
              className="flex-1 border border-term2 px-3 py-2 cond text-[13px] text-term hover:bg-term hover:text-pitch disabled:opacity-40"
            >
              UNPAUSE
            </button>
          </div>
        </Card>

        <Card title="$BOIL TOKEN" note="Set once, then frozen. Do this after the launch on PONS, with the token address the launch produced.">
          <input
            value={boilToken}
            onChange={(e) => setBoilToken(e.target.value.trim())}
            placeholder="0x…"
            className="w-full border border-ash2 bg-pitch px-3 py-2 mono-tight text-[12px] text-cream focus:border-term focus:outline-none"
          />
          <button
            onClick={() => {
              if (!/^0x[0-9a-fA-F]{40}$/.test(boilToken)) return;
              call("op:token", "staking", "BoilStaking", "setToken", [boilToken as Address], "Set $BOIL token");
            }}
            disabled={!has.staking || disabled || !/^0x[0-9a-fA-F]{40}$/.test(boilToken)}
            className="mt-2 w-full border border-cream bg-cream px-3 py-2 cond text-[13px] text-pitch hover:border-term hover:bg-term disabled:opacity-40"
          >
            SET TOKEN, PERMANENTLY
          </button>
        </Card>

        <Card title="ROUTE REVENUE" note="Splits whatever the revenue router holds of one token across the published allocation. Anyone can call it, which is the point.">
          <input
            value={sweepToken}
            onChange={(e) => setSweepToken(e.target.value.trim())}
            placeholder="token address to route, 0x…"
            className="w-full border border-ash2 bg-pitch px-3 py-2 mono-tight text-[12px] text-cream focus:border-term focus:outline-none"
          />
          <button
            onClick={() => {
              if (!/^0x[0-9a-fA-F]{40}$/.test(sweepToken)) return;
              call("op:route", "revenueRouter", "BoilerRevenueRouter", "route", [sweepToken as Address], "Route revenue");
            }}
            disabled={!has.revenue || disabled || !/^0x[0-9a-fA-F]{40}$/.test(sweepToken)}
            className="mt-2 w-full border border-ash2 px-3 py-2 cond text-[13px] text-cream hover:border-term hover:text-term disabled:opacity-40"
          >
            ROUTE
          </button>
        </Card>

        <Card
          title="STAKER DISTRIBUTION"
          note="Off, and the contract refuses to allocate to it while off. Turning it on records your legal reference on chain. Do not do this to make a chart look better."
        >
          <input
            value={legalRef}
            onChange={(e) => setLegalRef(e.target.value)}
            placeholder="legal opinion reference, stored on chain"
            className="w-full border border-ash2 bg-pitch px-3 py-2 mono-tight text-[12px] text-cream focus:border-term focus:outline-none"
          />
          <button
            onClick={() =>
              call(
                "op:staker",
                "revenueRouter",
                "BoilerRevenueRouter",
                "enableStakerDistribution",
                [legalRef],
                "Enable staker distribution",
              )
            }
            disabled={!has.revenue || disabled || legalRef.trim().length < 8}
            className="mt-2 w-full border border-brass px-3 py-2 cond text-[13px] text-brass hover:bg-brass hover:text-pitch disabled:opacity-40"
          >
            ENABLE, WITH THE REFERENCE ON RECORD
          </button>
        </Card>
      </div>

      <button
        onClick={() => void onRefresh()}
        disabled={!addresses.registry}
        className="mt-3 border border-ash2 px-3 py-1.5 mono-tight text-[10px] tracking-[0.14em] text-steel hover:border-cream hover:text-cream disabled:opacity-40"
      >
        RELOAD STATE FROM CHAIN
      </button>
    </section>
  );
}

function Card({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="border border-ash2 bg-char">
      <header className="border-b border-ash2 px-3 py-2">
        <p className="cond text-[15px] text-cream">{title}</p>
        <p className="mono-tight text-[10px] leading-relaxed text-steel">{note}</p>
      </header>
      <div className="p-3">{children}</div>
    </div>
  );
}
