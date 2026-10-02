import { NextResponse } from "next/server";
import { NetworkSchema } from "@x402/core/schemas";

export function GET(request: Request) {
  const networks = ["eip155:57073", "eip155:763373"].map((network) => NetworkSchema.parse(network));
  const origin = new URL(request.url).origin;
  const inputSchema = {
    type: "object",
    properties: {
      chainId: { type: "integer", default: 763373 },
      asset: { type: "string", enum: ["ETH", "USDC", "USDCE"] },
      recipients: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 50 },
      amounts: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 50 },
      nativePerRecipient: { type: "string" },
    },
    required: ["asset", "recipients", "amounts"],
  };

  return NextResponse.json({
    x402Version: 2,
    notice:
      "Tentacle exposes x402-style discovery metadata. Paid x402 settlement is intentionally disabled until an Ink-compatible facilitator or reviewed self-facilitator is configured.",
    items: [
      {
        resource: `${origin}/api/mcp`,
        type: "mcp",
        x402Version: 2,
        accepts: [],
        extensions: {
          bazaar: {
            info: {
              input: {
                type: "mcp",
                toolName: "tentacle_prepare_batch",
                transport: "streamable-http",
                description: "Prepare an unsigned atomic batch-payment transaction for Ink.",
                inputSchema,
                example: {
                  chainId: 763373,
                  asset: "ETH",
                  recipients: ["0x1111111111111111111111111111111111111111"],
                  amounts: ["0.000001"],
                },
              },
              output: { type: "json" },
            },
          },
          tentacle: {
            settlementNetworks: networks,
            paidSettlementEnabled: false,
          },
        },
        lastUpdated: new Date().toISOString(),
      },
    ],
  });
}
