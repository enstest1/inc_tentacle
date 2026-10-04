import { createMcpHandler } from "@modelcontextprotocol/server";
import { createTentacleMcpServer } from "@/lib/mcpFactory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler(createTentacleMcpServer);

export async function GET(request: Request): Promise<Response> {
  return handler.fetch(request);
}

export async function POST(request: Request): Promise<Response> {
  return handler.fetch(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handler.fetch(request);
}
