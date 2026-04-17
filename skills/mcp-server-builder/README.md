# mcp-server-builder

> Zero-to-working guide for building MCP servers — TypeScript or Python, stdio or SSE, from scaffold to Claude Code registration.

## Overview

`mcp-server-builder` is a Claude skill that walks you through building a complete MCP (Model Context Protocol) server from scratch. It covers language and transport selection, project initialization, tool/resource/prompt implementation, Claude Code registration, and publishing as a plugin.

Trigger this skill when:
- Creating a new MCP server from scratch
- Choosing between TypeScript and Python
- Selecting stdio vs SSE transport
- Scaffolding a working server quickly
- Porting an existing script into an MCP server
- Writing `manifest.json` for the Anthropic plugin directory

## Installation

Place the `mcp-server-builder/` folder in your Claude skills directory:

```
skills/
└── mcp-server-builder/
    ├── SKILL.md
    └── templates/
        ├── ts-stdio/
        │   ├── package.json
        │   └── src/index.ts
        └── py-stdio/
            ├── pyproject.toml
            └── server.py
```

## What it covers

### Language Selection

| | TypeScript | Python |
|-|-----------|--------|
| Prefer when | JS/TS codebase, npm ecosystem | Python codebase, data/ML tools |
| Build step | Yes (`tsc`) | No |
| Min runtime | Node 18+ | Python 3.10+ |

Default: TypeScript — better tooling, faster startup, more examples available.

### Path A: TypeScript + stdio

Step-by-step: `npm init`, SDK installation, `package.json` configuration, minimal `src/index.ts` with one tool, build, and smoke test.

### Path B: Python + stdio

Step-by-step: virtual environment setup, `pip install mcp`, `pyproject.toml`, and a minimal `server.py` using FastMCP.

### Transport Selection: stdio vs SSE

| | stdio | SSE |
|-|-------|-----|
| Use when | Local tool, same machine | Long-running service, remote, multiple clients |
| Process management | Claude Code manages | You run it separately |

Default: stdio. Use SSE only when you need persistence, a remote server, or multiple simultaneous clients.

### Claude Code Registration

`settings.json` snippets for stdio (TypeScript), stdio (Python), and SSE transports. Includes the reminder to always use absolute paths.

### Tool / Resource / Prompt Templates

TypeScript code templates for all three MCP primitives, with error handling patterns included.

### manifest.json

Required fields and examples for publishing to the Anthropic plugin directory, including the `npx -y` pattern for npm-distributed plugins.

### End-to-End Checklist

Checklist from project init to verified tool execution in a Claude Code session.

## Changelog

### v1.0.0 — 2026-04-05
- Initial release
