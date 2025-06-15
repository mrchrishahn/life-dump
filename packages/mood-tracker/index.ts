import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./src";

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Mood-tracker MCP Server running on stdio");
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });