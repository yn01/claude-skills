# yn01/claude-skills

Custom Claude Code skills by yn01.

## Install

```
/plugin marketplace add yn01/claude-skills
```

## Skills

| Skill | Description |
|-------|-------------|
| [context-first-audit](skills/context-first-audit/SKILL.md) | Audit prompts, CLAUDE.md files, and agent harness configurations to evaluate whether they follow context-first principles — prioritizing rich context over prescriptive step-by-step instructions |
| [mcp-debug](skills/mcp-debug/SKILL.md) | MCP server troubleshooting — connection issues, missing tools, transport-specific logs, `claude mcp` commands |
| [mcp-for-agents](skills/mcp-for-agents/SKILL.md) | MCP tool usage for agents — CLAUDE.md/SKILL.md patterns, Orchestrator/Subagent role separation, tool selection control, Generator/Evaluator loop design |
| [mcp-server-builder](skills/mcp-server-builder/SKILL.md) | MCP server scaffolding — TypeScript/Python setup, stdio/SSE transport, tool/resource/prompt templates, settings.json wiring, manifest.json for plugin directory |
| [mcp-tool-design](skills/mcp-tool-design/SKILL.md) | MCP tool design best practices — Tool/Resource/Prompt selection, description writing, input schema, error handling, agent-facing patterns |

## Adding a New Skill

1. Copy `template/SKILL.md` to `skills/<skill-name>/SKILL.md`
2. Fill in the frontmatter (`name`, `description`) and body
3. Submit a PR or push to `main`
