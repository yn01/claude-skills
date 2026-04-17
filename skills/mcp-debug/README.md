# mcp-debug

> Systematic debugging guide for MCP servers in Claude Code — connection failures, missing tools, and transport-specific errors.

## Overview

`mcp-debug` is a Claude skill that provides a structured debugging workflow for MCP (Model Context Protocol) servers. It covers settings.json configuration, `claude mcp` command reference, log locations, and a catalog of common error patterns mapped to concrete fixes.

Trigger this skill when:
- An MCP server is not connecting or tools are missing from the list
- Tool calls return errors or unexpected results
- You need help configuring `mcpServers` in `.claude/settings.json`
- You're debugging stdio vs SSE transport issues

## Installation

Place the `mcp-debug/` folder in your Claude skills directory:

```
skills/
└── mcp-debug/
    └── SKILL.md
```

## What it covers

### Debug Flow

A step-by-step diagnostic sequence — from verifying settings.json syntax to matching error output against known patterns.

### Settings Reference

Configuration examples for:
- Project-level and user-level config locations
- Minimal stdio server setup
- SSE transport setup
- Environment variable injection
- `bypassPermissions` configuration

### `claude mcp` Command Reference

| Command | What it does |
|---------|-------------|
| `claude mcp list` | Show all registered MCP servers |
| `claude mcp get <name>` | Show config for a specific server |
| `claude mcp test <name>` | Connect and list available tools |
| `claude mcp add <name> <cmd>` | Register a stdio server |
| `claude mcp add --sse <name> <url>` | Register an SSE server |
| `claude mcp remove <name>` | Remove a server |

### Log Locations

Where to find stderr output for stdio and SSE transports, including Claude Code's own MCP logs.

### Common Error Patterns

| Error | Cause |
|-------|-------|
| Tools not appearing | Missing rebuild, relative paths, wrong registration order |
| "Tool execution failed" | Unhandled rejections, schema mismatch, CORS (SSE) |
| "spawn ENOENT" | Command not on PATH |
| "Connection refused" | SSE server not running |
| Settings not picked up | Claude Code not restarted after edit |

### Quick Diagnostic Script

Shell snippet to verify a stdio server starts without crashing and passes a protocol-level smoke test.

## Changelog

### v1.0.0 — 2026-04-14
- Initial release
