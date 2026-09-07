import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { DEFAULT_RPC, robinhoodChain } from "./chains";

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [robinhoodChain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || DEFAULT_RPC),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
