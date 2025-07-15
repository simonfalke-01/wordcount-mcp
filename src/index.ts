#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TextAnalyzer } from "./analyzer/TextAnalyzer.js";
import { registerWordCountTools } from "./tools/wordcount-tools.js";

/**
 * Main entry point for the wordcount-mcp server
 * Starts an MCP server with stdio transport for text analysis capabilities
 */
async function main() {
  try {
    // Log startup to stderr (not stdout to avoid interfering with MCP stdio)
    console.error("Starting wordcount-mcp server...");

    // Create MCP server with metadata
    const server = new McpServer({
      name: "wordcount-mcp",
      version: "1.0.0",
    });

    // Register all word count tools
    registerWordCountTools(server);

    // Create stdio transport for communication
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    await server.connect(transport);

    console.error("wordcount-mcp server started successfully");

    // Set up graceful shutdown handlers
    const shutdown = async () => {
      try {
        console.error("Shutting down wordcount-mcp server...");
        await server.close();
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
      }
    };

    // Handle graceful shutdown on SIGINT (Ctrl+C) and SIGTERM
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
      shutdown();
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled rejection at:", promise, "reason:", reason);
      shutdown();
    });

  } catch (error) {
    console.error("Failed to start wordcount-mcp server:", error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});