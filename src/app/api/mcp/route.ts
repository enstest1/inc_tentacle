import { createMcpHandler } from "@modelcontextprotocol/server";
import { createTentacleMcpServer } from "@/lib/mcpFactory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler(createTentacleMcpServer);

export { handler as GET, handler as POST, handler as DELETE };
