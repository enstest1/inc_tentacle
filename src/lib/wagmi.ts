import { http, createConfig, fallback, mock } from "wagmi";
import { injected } from "wagmi/connectors";
import { anvil, ink, inkSepolia, isAnvilEnabled } from "./chains";

/**
 * Anvil account #0 is Foundry's public test fixture (fake ETH only).
 * Used so the local UI can send without MetaMask. Never a production key.
 */
const ANVIL_TEST_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;

const injectedConnector = injected({ shimDisconnect: true });

const inkTransports = {
  [ink.id]: fallback([
    http(process.env.NEXT_PUBLIC_INK_RPC_URL ?? "https://rpc-gel.inkonchain.com"),
    http(process.env.NEXT_PUBLIC_INK_RPC_FALLBACK_URL ?? "https://rpc-qnd.inkonchain.com"),
  ]),
  [inkSepolia.id]: fallback([
    http(
      process.env.NEXT_PUBLIC_INK_SEPOLIA_RPC_URL ?? "https://rpc-gel-sepolia.inkonchain.com",
    ),
    http(
      process.env.NEXT_PUBLIC_INK_SEPOLIA_RPC_FALLBACK_URL ??
        "https://rpc-qnd-sepolia.inkonchain.com",
    ),
  ]),
} as const;

/**
 * Injected wallets only in V1 (MetaMask, Kraken Wallet, Rainbow-compatible).
 * WalletConnect/Reown is V1.1. Anvil mock is a local-dev extra, not a product chain.
 */
export const wagmiConfig = isAnvilEnabled()
  ? createConfig({
      // Anvil first so the mock connector's default chain is 31337.
      chains: [anvil, inkSepolia, ink],
      connectors: [
        mock({
          accounts: [ANVIL_TEST_ACCOUNT],
          features: { reconnect: true },
        }),
        injectedConnector,
      ],
      ssr: true,
      transports: {
        [anvil.id]: http("http://127.0.0.1:8545"),
        ...inkTransports,
      },
    })
  : createConfig({
      chains: [ink, inkSepolia],
      connectors: [injectedConnector],
      ssr: true,
      transports: inkTransports,
    });
