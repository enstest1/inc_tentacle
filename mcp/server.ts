import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createTentacleMcpServer } from "../src/lib/mcpFactory";

void serveStdio(createTentacleMcpServer);
console.error("Tentacle MCP server ready on stdio");
