import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProjectsServer } from "./index.js";

async function main() {
  const transport = new StdioServerTransport();
  await ProjectsServer.connect(transport);
  console.error("Projects MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});