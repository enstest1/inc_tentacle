import {defineChain} from "viem";

/**
 * Ink mainnet and Sepolia.
 * viem 2.23 ships neither chain, so we define them here and record that choice
 * in docs/ARCHITECTURE.md. Fallback RPCs are included (spec §16).
 */
export const ink = defineChain({
  id: 57073,
  name: "Ink",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-gel.inkonchain.com", "https://rpc-qnd.inkonchain.com"],
    },
  },
  blockExplorers: {
    default: { name: "Ink Explorer", url: "https://explorer.inkonchain.com" },
  },
  sourceId: 1,
});

export const inkSepolia = defineChain({
  id: 763373,
  name: "Ink Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://rpc-gel-sepolia.inkonchain.com",
        "https://rpc-qnd-sepolia.inkonchain.com",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Ink Sepolia Explorer", url: "https://explorer-sepolia.inkonchain.com" },
  },
  testnet: true,
  sourceId: 11155111,
});

/**
 * Local Anvil (Foundry). Only treated as a sendable chain when
 * NEXT_PUBLIC_ENABLE_ANVIL=true — never a production Tentacle network.
 */
export const anvil = defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
});

export const SUPPORTED_CHAIN_IDS = [ink.id, inkSepolia.id] as const;

/** Dev-only flag. Production builds must leave this unset. */
export function isAnvilEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ANVIL === "true";
}

/** Chains Tentacle is allowed to send on in this build. */
export function isSupportedChain(id: number): boolean {
  if (id === ink.id || id === inkSepolia.id) return true;
  return isAnvilEnabled() && id === anvil.id;
}

export function chainById(id: number) {
  if (id === ink.id) return ink;
  if (id === inkSepolia.id) return inkSepolia;
  if (id === anvil.id) return anvil;
  return undefined;
}

export const EXPLORERS: Record<number, string> = {
  57073: "https://explorer.inkonchain.com",
  763373: "https://explorer-sepolia.inkonchain.com",
};

/** Explorer URLs are built from config only — never from user input. */
export function txUrl(chainId: number, hash: `0x${string}`): string | undefined {
  const base = EXPLORERS[chainId];
  if (!base) return undefined;
  return `${base}/tx/${hash}`;
}

export function addressUrl(chainId: number, address: `0x${string}`): string | undefined {
  const base = EXPLORERS[chainId];
  if (!base) return undefined;
  return `${base}/address/${address}`;
}
