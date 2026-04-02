---
name: mcp-server-builder
description: >
  Use this skill when creating a new MCP server from scratch — choosing TypeScript vs Python,
  initializing the project, implementing tools/resources/prompts, selecting stdio vs SSE transport,
  writing manifest.json for the Anthropic plugin directory, or wiring up the server in Claude Code
  settings.json. Also trigger when the user wants to scaffold a working MCP server quickly, port
  an existing script into an MCP server, or publish an MCP server as a Claude Code plugin.
  When in doubt, trigger early — getting the project structure wrong causes painful rewrites.
---

# mcp-server-builder

Zero-to-working guide for building MCP servers. Follow the relevant path for your language and transport.

---

## Step 0: TypeScript vs Python?

| | TypeScript | Python |
|-|-----------|--------|
| Prefer when | Existing JS/TS codebase; npm ecosystem; targeting Node.js | Existing Python codebase; data/ML tools; prototyping fast |
| SDK | `@modelcontextprotocol/sdk` | `mcp` (PyPI) |
| Min runtime | Node 18+ | Python 3.10+ |
| Build step | Yes (`tsc`) | No |
| Startup time | ~100ms | ~200-400ms |
| Package file | `package.json` | `pyproject.toml` |

**Default:** TypeScript if you have no preference — better tooling, faster startup, more examples available.

---

## Path A: TypeScript + stdio

### 1. Initialize project

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
npx tsc --init --target ES2022 --module Node16 --moduleResolution Node16 \
  --outDir build --rootDir src --strict true
mkdir src
```

### 2. Update `package.json`

Key fields to add/change:

```json
{
  "type": "module",
  "bin": {
    "my-mcp-server": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "files": ["build"]
}
```

See full template: [`templates/ts-stdio/package.json`](templates/ts-stdio/package.json)

### 3. Write `src/index.ts`

Minimal server with one tool (`to_uppercase`):

See full template: [`templates/ts-stdio/src/index.ts`](templates/ts-stdio/src/index.ts)

Key structure:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool(
  "to_uppercase",
  "Converts input text to uppercase. Use when the user asks to uppercase or capitalize text.",
  { text: z.string().describe("The text to convert to uppercase.") },
  async ({ text }) => ({
    content: [{ type: "text", text: text.toUpperCase() }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4. Build and verify

```bash
npm run build

# Quick smoke test — sends initialize then tools/list via stdin
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}' \
  | node build/index.js
```

Or use Claude Code's built-in test command (after registering in settings.json):

```bash
claude mcp test my-server
```

---

## Path B: Python + stdio

### 1. Initialize project

```bash
mkdir my-mcp-server && cd my-mcp-server
python3 -m venv .venv && source .venv/bin/activate
pip install mcp
```

### 2. Create `pyproject.toml`

See full template: [`templates/py-stdio/pyproject.toml`](templates/py-stdio/pyproject.toml)

Minimal:

```toml
[project]
name = "my-mcp-server"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["mcp>=1.0"]

[project.scripts]
my-mcp-server = "server:main"
```

### 3. Write `server.py`

See full template: [`templates/py-stdio/server.py`](templates/py-stdio/server.py)

Key structure:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def to_uppercase(text: str) -> str:
    """Converts input text to uppercase. Use when asked to uppercase or capitalize text."""
    return text.upper()

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### 4. Verify

```bash
python server.py  # should hang waiting for stdin — Ctrl+C to exit
```

---

## Transport Selection: stdio vs SSE

| | stdio | SSE |
|-|-------|-----|
| Use when | Local tool, runs on same machine | Long-running service, remote server, multiple clients |
| Process management | Claude Code spawns/kills it | You run it separately |
| Configuration | `command` + `args` in settings.json | `type: "sse"` + `url` in settings.json |
| Debugging | `node index.js 2>err.log` | `curl http://localhost:PORT/sse` |
| Stateful between calls? | No (process exits between sessions) | Yes (keeps running) |

**Default: stdio.** Use SSE only when you need persistence, a remote server, or multiple simultaneous clients.

### SSE server additions (TypeScript)

```typescript
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

const app = express();
let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  await transport.handlePostMessage(req, res);
});

app.listen(3000);
```

---

## Register in Claude Code settings.json

### stdio (TypeScript)

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/my-mcp-server/build/index.js"]
    }
  }
}
```

### stdio (Python)

```json
{
  "mcpServers": {
    "my-server": {
      "command": "/absolute/path/to/my-mcp-server/.venv/bin/python",
      "args": ["/absolute/path/to/my-mcp-server/server.py"]
    }
  }
}
```

### SSE

```json
{
  "mcpServers": {
    "my-server": {
      "type": "sse",
      "url": "http://localhost:3000/sse"
    }
  }
}
```

> Always use absolute paths. Relative paths fail silently.

After editing `settings.json`, restart Claude Code.

---

## Tool / Resource / Prompt Templates

### Tool (TypeScript)

```typescript
server.tool(
  "tool_name",                           // snake_case verb_noun
  "What it does. When to use it. Side effects if any.",
  {
    param1: z.string().describe("Format and constraints. Not just the name."),
    param2: z.number().int().min(1).max(100).optional().describe("Default 10."),
  },
  async ({ param1, param2 = 10 }) => {
    try {
      const result = await doWork(param1, param2);
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: false, error: "FAILED", message: String(err) }),
        }],
      };
    }
  }
);
```

### Resource (TypeScript)

```typescript
server.resource(
  "config://app",
  "Current application configuration",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify({ key: "value" }),
    }],
  })
);
```

### Prompt (TypeScript)

```typescript
server.prompt(
  "review-code",
  "Code review template",
  { language: z.string().describe("Programming language of the code to review.") },
  ({ language }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Review the following ${language} code for bugs, style, and performance.` },
    }],
  })
);
```

---

## manifest.json (Anthropic Plugin Directory)

Place at `.claude-plugin/manifest.json` in your repo root.

### Minimal example

```json
{
  "name": "my-mcp-server",
  "displayName": "My MCP Server",
  "description": "One-line description for the plugin directory listing.",
  "version": "1.0.0",
  "author": "your-github-username",
  "repository": "https://github.com/your-github-username/my-mcp-server",
  "mcpServer": {
    "transport": "stdio",
    "command": "npx",
    "args": ["-y", "my-mcp-server-package-name"]
  },
  "tags": ["tools", "productivity"]
}
```

### SSE variant

```json
{
  "mcpServer": {
    "transport": "sse",
    "url": "https://my-server.example.com/sse"
  }
}
```

### Required fields

| Field | Purpose |
|-------|---------|
| `name` | Unique identifier (kebab-case) |
| `displayName` | Human-readable name shown in directory |
| `description` | Shown in search results — be specific |
| `version` | semver |
| `repository` | GitHub URL |
| `mcpServer.transport` | `"stdio"` or `"sse"` |
| `mcpServer.command` + `args` | How to run (stdio only) |
| `mcpServer.url` | SSE endpoint URL (SSE only) |

> For stdio plugins distributed via npm, use `"command": "npx", "args": ["-y", "your-package"]` so users don't need a global install.

---

## End-to-End Checklist

```
[ ] Project initialized (npm/pip)
[ ] SDK installed
[ ] At least one tool registered before server.connect()
[ ] Build passes (TypeScript: npm run build)
[ ] Server runs without crashing: node build/index.js (or python server.py)
[ ] Registered in .claude/settings.json with absolute paths
[ ] Claude Code restarted
[ ] claude mcp test <name> lists your tool
[ ] Tool works in a Claude Code session
[ ] (optional) manifest.json added for plugin directory
```
