# mcp-tool-design

> Best practices for designing MCP server tools that Claude selects reliably — covering Tool/Resource/Prompt primitives, description writing, input schema design, error handling, and agent-facing patterns.

## Overview

`mcp-tool-design` is a Claude skill that covers the design layer of MCP server development: how to structure tools so Claude chooses them correctly, passes valid parameters, and recovers gracefully from errors. It applies equally to tools used by humans and tools used inside multi-agent systems.

Trigger this skill when:
- Designing or reviewing MCP server tools
- Choosing between Tool, Resource, and Prompt primitives
- Writing tool descriptions that Claude will reliably select
- Designing input schemas
- Handling errors in agent-friendly ways
- Thinking through idempotency and side effects
- Building tools for use in Orchestrator/Subagent or Generator/Evaluator architectures

## Installation

Place the `mcp-tool-design/` folder in your Claude skills directory:

```
skills/
└── mcp-tool-design/
    └── SKILL.md
```

## What it covers

### Tool vs Resource vs Prompt — Decision Tree

A decision tree for choosing the right primitive, with a summary table comparing triggered-by, side effects, argument handling, and best-fit use cases.

### Writing Tool Descriptions

**Name field:** `verb_noun` snake_case, specific over generic.

**Description field structure:**
```
[What it does] + [When to use it] + [Key constraints or side effects]
```

**Parameter description field:** focus on format and constraints, not just the parameter name.

### Input Schema Design

Do's and don'ts for JSON Schema design — `required`, `enum`, `default`, `additionalProperties: false`, and a table of anti-patterns with fixes.

### Error Handling Design

Return structured errors instead of throwing. Key error fields that help agents recover:

| Field | Purpose |
|-------|---------|
| `error` | Machine-readable code (`NOT_FOUND`, `RATE_LIMITED`) |
| `message` | Human-readable explanation |
| `retryable` | Whether retrying may succeed |
| `suggestion` | What to try next |

### Idempotency and Side Effects

- Mark side effects explicitly in the description
- Design for idempotency using `idempotency_key`
- Separate read tools from write tools

### Agent-Facing vs Human-Facing Design

Comparison table covering output verbosity, error messages, parameter flexibility, pagination, and idempotency requirements.

### Generator/Evaluator Loop Design

Five design rules for tools used in multi-agent loops: structured output, `request_id` / `generation_id`, dedicated feedback tools, observable failure modes, and avoiding multi-turn clarification.

## Changelog

### v1.0.0 — 2026-04-01
- Initial release
