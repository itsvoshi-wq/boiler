import { describe, expect, it } from "vitest";
import { ROBINHOOD_CHAIN_ID, DEFAULT_RPC, ADDRESSES, EXPLORER, robinhoodChain } from "@/lib/chain/chains";
import { wagmiConfig } from "@/lib/chain/wagmi";

/**
 * BOILER is a Robinhood Chain product. These assertions exist so that pointing
 * any part of it at another chain fails the build rather than shipping.
 */
describe("BOILER targets Robinhood Chain and nothing else", () => {
  it("uses chain id 4663", () => {
    expect(ROBINHOOD_CHAIN_ID).toBe(4663);
    expect(robinhoodChain.id).toBe(4663);
    expect(robinhoodChain.name).toBe("Robinhood Chain");
  });

  it("defaults to the Robinhood Chain RPC", () => {
    expect(new URL(DEFAULT_RPC).host).toBe("rpc.mainnet.chain.robinhood.com");
    expect(new URL(robinhoodChain.rpcUrls.default.http[0]).host).toMatch(/robinhood/);
  });

  it("offers the wallet exactly one chain, and it is 4663", () => {
    expect(wagmiConfig.chains.map((c) => c.id)).toEqual([4663]);
  });

  it("points the explorer at the Robinhood Chain explorer", () => {
    expect(new URL(EXPLORER.tx("0x0")).host).toMatch(/robinhoodchain/);
    expect(new URL(EXPLORER.address("0x0")).host).toMatch(/robinhoodchain/);
  });

  it("uses the contracts discovered on Robinhood Chain, not Ethereum deployments", () => {
    // Read off chain: factory() on a live pool, then factory()/WETH9() on the router.
    expect(ADDRESSES.v3Factory).toBe("0x1f7d7550b1b028f7571e69a784071f0205fd2efa");
    expect(ADDRESSES.swapRouter02).toBe("0xcaf681a66d020601342297493863e78c959e5cb2");
    expect(ADDRESSES.weth9).toBe("0x0bd7d308f8e1639fab988df18a8011f41eacad73");
    expect(ADDRESSES.usdg).toBe("0x5fc5360d0400a0fd4f2af552add042d716f1d168");
    // Multicall3 is at its canonical address here too, verified by eth_call.
    expect(ADDRESSES.multicall3).toBe("0xca11bde05977b3631167028862be2a173976ca11");
  });

  it("does not carry an Ethereum mainnet RPC anywhere in the chain config", () => {
    const blob = JSON.stringify({ DEFAULT_RPC, robinhoodChain, ADDRESSES });
    expect(blob).not.toMatch(/mainnet\.infura|eth-mainnet|cloudflare-eth|ethereum\.publicnode/i);
  });
});
