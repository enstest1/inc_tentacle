import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { prepareBatch } from "./agent";
import { getAgentStats } from "./agentStats";
import { loadDeployments } from "./deployments";

function text(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

export function createTentacleMcpServer() {
  const server = new McpServer(
    { name: "tentacle-ink", version: "1.1.0" },
    { capabilities: { tools: {} } },
  );

  server.registerTool(
    "tentacle_prepare_batch",
    {
      description: "Prepare an unsigned atomic Tentacle batch payment on Ink or Ink Sepolia.",
      inputSchema: z.object({
        chainId: z.number().int().default(763373),
        asset: z.enum(["ETH", "USDC", "USDCE"]),
        recipients: z.array(z.string()).min(1).max(50),
        amounts: z.array(z.string()).min(1).max(50),
        nativePerRecipient: z.string().optional(),
      }),
    },    async (input) => {
      try {
        return text(prepareBatch(input));
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: error instanceof Error ? error.message : "Unable to prepare batch",
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    "tentacle_contract_info",
    {
      description: "Return configured Tentacle deployment metadata for Ink or Ink Sepolia.",
      inputSchema: z.object({ chainId: z.number().int().default(763373) }),
    },
    async ({ chainId }) => text(loadDeployments(chainId)),
  );

  server.registerTool(
    "tentacle_get_stats",
    {
      description: "Read reviewer-verifiable BatchExecuted statistics from an Ink public RPC.",
      inputSchema: z.object({ chainId: z.union([z.literal(57073), z.literal(763373)]).default(763373) }),
    },    async ({ chainId }) => {
      try {
        return text(await getAgentStats(chainId));
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: error instanceof Error ? error.message : "Stats unavailable",
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    "tentacle_x402_info",
    {
      description: "Return x402 interoperability metadata for Tentacle's agent interfaces.",
      inputSchema: z.object({}),
    },
    async () =>
      text({
        protocol: "x402-v2",
        networks: ["eip155:57073", "eip155:763373"],
        discoveryPath: "/api/x402/discovery",
        settlementStatus:
          "Discovery is live. Production x402 paid settlement is not enabled until an Ink-compatible facilitator/self-facilitator is configured.",
      }),
  );

  return server;
}
