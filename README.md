# yn01/claude-skills

Custom Claude Code skills by yn01.

## Install

```
/plugin marketplace add yn01/claude-skills
```

## Skills

| Skill | Description |
|-------|-------------|
| [mcp-debug](skills/mcp-debug/SKILL.md) | MCP server troubleshooting — connection issues, missing tools, transport-specific logs, `claude mcp` commands |
| [mcp-tool-design](skills/mcp-tool-design/SKILL.md) | MCP tool design best practices — Tool/Resource/Prompt selection, description writing, input schema, error handling, agent-facing patterns |

## Adding a New Skill

1. Copy `template/SKILL.md` to `skills/<skill-name>/SKILL.md`
2. Fill in the frontmatter (`name`, `description`) and body
3. Submit a PR or push to `main`
