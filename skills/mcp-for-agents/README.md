# mcp-for-agents

> Patterns for making agents reliably discover, select, and sequence MCP tools — covering CLAUDE.md authoring, Orchestrator/Subagent role separation, and Generator/Evaluator loop design.

## Overview

`mcp-for-agents` is a Claude skill that addresses the most common failure mode in multi-agent systems: agents ignoring, misselecting, or missequencing MCP tools. It provides concrete patterns for writing `CLAUDE.md` and `SKILL.md` instructions that guide agents to the right tool at the right time.

Trigger this skill when:
- An agent is ignoring MCP tools or answering from training data instead
- An agent is choosing the wrong tool or calling tools in the wrong order
- You're writing `CLAUDE.md` or `SKILL.md` instructions that reference MCP tools
- You're designing Orchestrator/Subagent role separation around tool usage
- You're implementing Generator/Evaluator loops that rely on MCP tools

## Installation

Place the `mcp-for-agents/` folder in your Claude skills directory:

```
skills/
└── mcp-for-agents/
    └── SKILL.md
```

## What it covers

### Pattern 1: Writing CLAUDE.md / SKILL.md for Tool Discovery

Templates for tool entries with trigger conditions, exclusion conditions, parameter guidance, and return value descriptions. Includes the minimum viable pattern and the full pattern with all fields.

### Pattern 2: Orchestrator vs Subagent Role Separation

Ready-to-use `CLAUDE.md` patterns for:
- **Orchestrators**: plan, delegate, and synthesize — do not call domain tools directly
- **Subagents**: execute specific tasks using their assigned tool set
- **Task messages**: how Orchestrators encode tool expectations when delegating

### Pattern 3: Controlling Tool Selection When Multiple Tools Apply

Disambiguation strategies by input type, intent, and execution order. Includes explicit "skip" conditions to prevent agents from over-calling tools.

### Pattern 4: Generator/Evaluator Loop Design

Loop structure, `CLAUDE.md` patterns for Generator and Evaluator roles, and how to use `generation_id` for stateless loop control without relying on conversation context.

### Pattern 5: Common Failure Patterns

| Failure | Fix |
|---------|-----|
| Agent ignores tool entirely | Add explicit prohibition + consequence framing |
| Tool called with wrong parameters | Add parameter guidance note in CLAUDE.md |
| Tools called in wrong order | Add gate condition ("call X before Y") |
| Orchestrator calls domain tools directly | Add hard delegation boundary |
| Loop runs forever or exits early | Put termination logic on the Evaluator |

### Quick Reference: CLAUDE.md Tool Entry Template

Minimum required fields and optional fields that reduce parameter errors and ordering mistakes.

## Changelog

### v1.0.0 — 2026-04-08
- Initial release
