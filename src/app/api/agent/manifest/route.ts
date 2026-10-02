import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/publicOrigin";

export function GET(request: Request) {
  const origin = getPublicOrigin(request);
  return NextResponse.json({
    name: "Tentacle",
    description: "Agent-native atomic batch payments on Ink",
    version: "1.1.0-agent",
    networks: [
      { name: "Ink", chainId: 57073, caip2: "eip155:57073", status: "mainnet-pending" },
      { name: "Ink Sepolia", chainId: 763373, caip2: "eip155:763373", status: "live-testnet" },
    ],
    capabilities: ["prepare_batch", "contract_info", "stats", "x402_discovery"],
    endpoints: {
      prepareBatch: `${origin}/api/agent/prepare`,
      stats: `${origin}/stats?network=sepolia`,
      x402Discovery: `${origin}/api/x402/discovery`,
      agentDocs: `${origin}/agents`,
    },
    signing: "Tentacle never holds keys. Prepared transactions must be signed by the caller wallet.",
  });
}
