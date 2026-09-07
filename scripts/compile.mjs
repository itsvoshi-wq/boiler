#!/usr/bin/env node
/**
 * Compiles the BOILER contracts and writes the artifacts the admin page ships.
 *
 * The admin page deploys from the browser, so it needs bytecode at build time.
 * There is no in-browser compiler and no hidden build step: run this, commit
 * the result, and what gets deployed is exactly what is in the repo.
 *
 *   npm run contracts:build
 */
import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root = process.cwd();
const contractsDir = path.join(root, "contracts");
const outFile = path.join(root, "src/lib/contracts/artifacts.ts");

const TARGETS = [
  "BoilerRegistry.sol",
  "BoilerFeeController.sol",
  "BoilerRevenueRouter.sol",
  "BoilerRouter.sol",
  "BoilStaking.sol",
];

function readSources() {
  const sources = {};
  const walk = (dir, prefix = "") => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p, `${prefix}${entry.name}/`);
      else if (entry.name.endsWith(".sol")) {
        sources[`${prefix}${entry.name}`] = { content: fs.readFileSync(p, "utf8") };
      }
    }
  };
  walk(contractsDir);
  return sources;
}

function findImport(importPath) {
  if (importPath.startsWith("@openzeppelin/")) {
    const p = path.join(root, "node_modules", importPath);
    if (fs.existsSync(p)) return { contents: fs.readFileSync(p, "utf8") };
    return { error: `not found: ${importPath}` };
  }
  const p = path.join(contractsDir, importPath.replace(/^\.\//, ""));
  if (fs.existsSync(p)) return { contents: fs.readFileSync(p, "utf8") };
  return { error: `not found: ${importPath}` };
}

const input = {
  language: "Solidity",
  sources: readSources(),
  settings: {
    optimizer: { enabled: true, runs: 200 },
    // BoilerRouter emits an eleven field event; without the IR pipeline solc
    // runs out of stack slots and the fix would be to make the event less
    // informative. The event wins.
    viaIR: true,
    evmVersion: "paris",
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));

const errors = (output.errors ?? []).filter((e) => e.severity === "error");
const warnings = (output.errors ?? []).filter((e) => e.severity === "warning");
for (const w of warnings) console.warn("warning:", w.formattedMessage.split("\n")[0]);
if (errors.length) {
  for (const e of errors) console.error(e.formattedMessage);
  process.exit(1);
}

const artifacts = {};
for (const file of TARGETS) {
  const name = file.replace(/\.sol$/, "");
  const c = output.contracts?.[file]?.[name];
  if (!c) {
    console.error(`missing compiled output for ${name}`);
    process.exit(1);
  }
  const bytecode = "0x" + c.evm.bytecode.object;
  artifacts[name] = { abi: c.abi, bytecode, deployedSize: c.evm.deployedBytecode.object.length / 2 };
  console.log(`${name.padEnd(24)} ${(bytecode.length / 2 - 1).toLocaleString()} bytes init, ${artifacts[name].deployedSize.toLocaleString()} bytes deployed`);
}

const header = `/**
 * GENERATED FILE. Do not edit by hand.
 *
 * Produced by scripts/compile.mjs from the Solidity in contracts/ with
 * solc ${solc.version()}, optimizer on, 200 runs, viaIR, evmVersion paris.
 * Regenerate with: npm run contracts:build
 */

export const SOLC_VERSION = ${JSON.stringify(solc.version())};

`;

const body =
  `export const ARTIFACTS = ${JSON.stringify(artifacts, null, 2)} as const;\n\n` +
  `export type ArtifactName = keyof typeof ARTIFACTS;\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, header + body);
console.log(`\nwrote ${path.relative(root, outFile)}`);
