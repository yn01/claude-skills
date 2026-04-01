---
name: mcp-debug
description: >
  Use this skill when an MCP server is not connecting, tools are missing from the list,
  tool calls return errors, or the user is unsure how to configure mcpServers in
  .claude/settings.json. Also trigger when the user asks about `claude mcp` commands,
  stdio vs SSE transport debugging, or anything related to MCP server troubleshooting
  in Claude Code. When in doubt, trigger — MCP issues are easy to misdiagnose.
---

# mcp-debug

Systematic debugging guide for MCP servers in Claude Code.

---

## Debug Flow

Follow this order before jumping to specific errors:

```
1. Verify settings.json syntax and location
2. Confirm the server process can start independently
3. Run `claude mcp list` to check registration
4. Run `claude mcp test <name>` — lists tools if connection succeeds  ← start here
5. Restart Claude Code after any settings.json change
6. Inspect logs for the transport type in use
7. Match error output to the patterns below
```

---

## Settings Reference

### Project-level config (recommended)
```
.claude/settings.json   ← applies to this project only
```

### User-level config
```
~/.claude/settings.json ← applies to all projects
```

### Minimal stdio example
```json
{
  "mcpServers": {
    "my-tool": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"]
    }
  }
}
```

### With environment variables
```json
{
  "mcpServers": {
    "my-tool": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        "API_KEY": "your-key",
        "DEBUG": "true"
      }
    }
  }
}
```

### SSE transport
```json
{
  "mcpServers": {
    "my-tool": {
      "type": "sse",
      "url": "http://localhost:3000/sse"
    }
  }
}
```

### bypassPermissions (project-level only)
```json
{
  "mcpServers": { ... },
  "bypassPermissions": ["mcp__my-tool__*"]
}
```

---

## `claude mcp` Command Reference

| Command | What it does |
|---------|-------------|
| `claude mcp list` | Show all registered MCP servers |
| `claude mcp get <name>` | Show config for a specific server |
| `claude mcp test <name>` | Connect and list available tools |
| `claude mcp add <name> <cmd> [args...]` | Register a stdio server |
| `claude mcp add --sse <name> <url>` | Register an SSE server |
| `claude mcp remove <name>` | Remove a server |

> `claude mcp test` is the fastest way to verify a server is working without starting a full Claude Code session.

---

## Log Locations

### stdio transport
Logs go to stderr of the server process. Capture them by running the server manually:
```bash
node /path/to/build/index.js 2>mcp-debug.log
```
Or redirect in the shell that launches Claude Code:
```bash
claude 2>claude-stderr.log
```

### SSE transport
- Server logs: wherever your HTTP server writes them (stdout/stderr of that process)
- Claude Code side: `~/.claude/logs/` (if log file exists) or stderr when launching `claude`

### Viewing Claude Code's own MCP logs
```bash
# macOS — check Console.app or:
tail -f ~/Library/Logs/Claude/claude.log 2>/dev/null
```

---

## Common Error Patterns

### Tools not appearing in Claude Code

**Symptoms:** Server shows in `claude mcp list` but no tools visible in session.

**Checklist:**
1. Did you rebuild after code changes? (`npm run build` / `tsc`)
2. Is the path in `args` absolute? Relative paths often fail.
3. Run `claude mcp test <name>` — does it list tools?
4. Check that `server.tool(...)` calls are registered before `server.connect()`.

---

### "Tool execution failed" / unexpected return value

**Symptoms:** Tool is called but returns an error or wrong result.

**Steps:**
1. Run the server manually and call the tool via stdin (stdio) or HTTP (SSE) to isolate the issue from Claude Code.
2. Check for unhandled promise rejections in server stderr.
3. Verify the tool's input schema matches what Claude is sending — add a `console.error(JSON.stringify(input))` at the top of the handler.
4. For SSE: check CORS headers if the server is on a different port.

---

### "spawn ENOENT" / process not found

**Cause:** `command` in settings.json not found on PATH.

**Fix:** Use the full path to the executable:
```json
{
  "command": "/usr/local/bin/node",
  "args": ["/absolute/path/index.js"]
}
```
Find the full path with:
```bash
which node   # or: which python3, which npx
```

---

### "Connection refused" (SSE)

**Cause:** SSE server is not running or listening on the wrong port.

**Fix:**
```bash
curl http://localhost:3000/sse   # should hang open (SSE stream)
```
If it errors, start the server first. If it returns immediately, check your `/sse` endpoint implementation.

---

### Settings not picked up after edit

**Cause:** Claude Code caches settings at startup.

**Fix:** Restart Claude Code after any `settings.json` change.

---

### stdio vs SSE: Key Differences

| | stdio | SSE |
|-|-------|-----|
| Transport | stdin/stdout | HTTP + Server-Sent Events |
| Process lifetime | Managed by Claude Code | External (you start it) |
| Logs | stderr of spawned process | Your server's stdout/stderr |
| Config key | `command` + `args` | `type: "sse"` + `url` |
| Best for | Local tools, CLIs | Long-running services, remote |
| Debug command | `node index.js` directly | `curl <url>/sse` |

---

## Quick Diagnostic Script

Run this to verify a stdio server can start and respond:

```bash
# 1. Does the process start without crashing?
node /path/to/build/index.js &
SERVER_PID=$!
sleep 1
kill $SERVER_PID 2>/dev/null && echo "OK: process started" || echo "FAIL: crashed on startup"

# 2. Faster: just check for syntax/import errors
node --check /path/to/build/index.js && echo "OK: no syntax errors"

# 3. For full protocol test, use:
claude mcp test <name>
```

