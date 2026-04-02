#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
});

// --- Tools ---

server.tool(
  "to_uppercase",
  "Converts input text to uppercase. Use when the user asks to uppercase, capitalize, or convert text to all caps.",
  {
    text: z.string().describe("The text to convert to uppercase."),
  },
  async ({ text }) => {
    return {
      content: [
        {
          type: "text",
          text: text.toUpperCase(),
        },
      ],
    };
  }
);

// --- Start server ---

const transport = new StdioServerTransport();
await server.connect(transport);
