import { createPublicClient, fallback, http } from "viem";
import { publicActionsL2 } from "viem/op-stack";
import { ink, inkSepolia } from "./chains";

/**
 * Public clients with OP Stack L2 actions so estimateL1Fee is available (spec §21).
 * V1 uses Ink's public RPCs; paid keys would be visible in NEXT_PUBLIC_* and are avoided.
 */
export function makePublicClient(chainId: number) {
  const isMainnet = chainId === ink.id;
  const chain = isMainnet ? ink : inkSepolia;
  const primary = isMainnet
    ? (process.env.NEXT_PUBLIC_INK_RPC_URL ?? "https://rpc-gel.inkonchain.com")
    : (process.env.NEXT_PUBLIC_INK_SEPOLIA_RPC_URL ?? "https://rpc-gel-sepolia.inkonchain.com");
  const fallbackUrl = isMainnet
    ? (process.env.NEXT_PUBLIC_INK_RPC_FALLBACK_URL ?? "https://rpc-qnd.inkonchain.com")
    : (process.env.NEXT_PUBLIC_INK_SEPOLIA_RPC_FALLBACK_URL ??
      "https://rpc-qnd-sepolia.inkonchain.com");

  return createPublicClient({
    chain,
    transport: fallback([http(primary), http(fallbackUrl)]),
  }).extend(publicActionsL2());
}
