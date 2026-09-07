import { defineChain } from "viem";

/**
 * Robinhood Chain. Arbitrum Orbit, EVM equivalent, settles to Ethereum.
 * Chain ID verified live against the public RPC: eth_chainId -> 0x1237 (4663).
 */
export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;

export const DEFAULT_RPC = "https://rpc.mainnet.chain.robinhood.com";

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" },
  },
  contracts: {
    multicall3: { address: "0xca11bde05977b3631167028862be2a173976ca11" },
  },
});

/**
 * Contract addresses discovered on chain, not copied from a docs page.
 * factory()  on pool 0xa7bb...9167 -> 0x1f7d7550b1b028f7571e69a784071f0205fd2efa
 * factory()  on router             -> same factory (so the router is canonical for this factory)
 * WETH9()    on router             -> 0x0bd7d308f8e1639fab988df18a8011f41eacad73
 */
export const ADDRESSES = {
  multicall3: "0xca11bde05977b3631167028862be2a173976ca11",
  v3Factory: "0x1f7d7550b1b028f7571e69a784071f0205fd2efa",
  swapRouter02: "0xcaf681a66d020601342297493863e78c959e5cb2",
  universalRouter: "0x8876789976decbfcbbbe364623c63652db8c0904",
  permit2: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  weth9: "0x0bd7d308f8e1639fab988df18a8011f41eacad73",
  usdg: "0x5fc5360d0400a0fd4f2af552add042d716f1d168",
} as const;

export const EXPLORER = {
  tx: (hash: string) => `https://robinhoodchain.blockscout.com/tx/${hash}`,
  address: (addr: string) => `https://robinhoodchain.blockscout.com/address/${addr}`,
  token: (addr: string) => `https://robinhoodchain.blockscout.com/token/${addr}`,
  block: (n: number | string) => `https://robinhoodchain.blockscout.com/block/${n}`,
};
