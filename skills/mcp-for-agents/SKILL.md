---
name: mcp-for-agents
description: >
  Use this skill when an agent is ignoring MCP tools, choosing the wrong tool, calling tools in
  the wrong order, or using tools in unexpected ways. Also trigger when writing CLAUDE.md or
  SKILL.md instructions that need to guide agents to use specific MCP tools, when designing
  Orchestrator/Subagent role separation around tool usage, or when implementing
  Generator/Evaluator loops that rely on MCP tools. Trigger early — prompt design mistakes
  are invisible until an agent silently does the wrong thing.
---

# mcp-for-agents

Patterns for making agents reliably discover, select, and sequence MCP tools.

---

## Why Agents Miss or Misuse Tools

Agents do not "see" tools the way humans read a list. Claude selects tools by matching the
task context to tool descriptions. If nothing in the prompt or conversation signals "use a
tool for this," the agent defaults to reasoning from its own knowledge.

Three root causes:

1. **No trigger signal** — the instructions don't describe the situation where a tool should fire
2. **Ambiguous selection** — multiple tools could apply; none wins clearly
3. **Wrong scope** — the instructions tell the wrong agent (Orchestrator instead of Subagent)

---

## Pattern 1: Writing CLAUDE.md / SKILL.md for Tool Discovery

### Minimum viable tool entry

A tool name alone is not enough. Claude needs a trigger condition:

```markdown
## Available Tools

**`search_documents`** — Use this tool whenever you need to look up information
from the knowledge base. Do NOT answer from memory if a search could return
relevant results.
```

### Full pattern

```markdown
## Available Tools

**`tool_name`**
- Use when: [concrete situation — be specific about the trigger]
- Do not use when: [situations where the agent might mistakenly reach for it]
- Always use before: [downstream tools or steps that depend on this output]
- Returns: [what the output looks like — helps agent know what to do next]

Example trigger phrases: "look up", "find", "retrieve", "get the current value of"
```

### Writing the trigger condition

Trigger conditions work best when they mirror how tasks arrive in practice:

| Instead of | Write |
|-----------|-------|
| "Use for searching" | "Use when the task requires current data not available in context" |
| "Call to create records" | "Use when the user or Orchestrator asks to persist, save, or create" |
| "Use for analysis" | "Use when you have raw data and need a structured score or classification" |

### Explicit prohibition pattern

When an agent tends to skip a tool and handle things itself, add a hard prohibition:

```markdown
**`fetch_latest_prices`** — Retrieves live pricing data.
Do NOT estimate, approximate, or recall prices from training data.
Always call this tool before quoting any price, even if you believe you know the answer.
```

---

## Pattern 2: Orchestrator vs Subagent Role Separation

### Core principle

Orchestrators plan and delegate. Subagents execute and use tools.
Mixing these in one agent's instructions causes confusion about when to act vs. when to route.

### Orchestrator CLAUDE.md pattern

```markdown
## Role: Orchestrator

You coordinate tasks. You do NOT call MCP tools directly unless explicitly listed below.

Your job:
1. Analyze the incoming request
2. Break it into subtasks
3. Delegate each subtask to the appropriate subagent with a clear instruction
4. Collect and synthesize results

## Tools You May Use
- `send_task` — Use to dispatch a subtask to a subagent. Always include: task description,
  required output format, and which MCP tools the subagent should use.
- `get_task_result` — Use to retrieve a completed subagent result before synthesizing.

## Tools You Must NOT Use
All domain tools (e.g., `search_documents`, `run_query`, `generate_report`) are reserved
for subagents. If you find yourself about to call one, delegate instead.
```

### Subagent CLAUDE.md pattern

```markdown
## Role: Subagent — [Domain Name]

You execute a specific task. You do NOT plan, delegate, or modify the task scope.

## Your Tools
**`search_documents`** — Use for every information lookup. Do not answer from memory.
**`run_query`** — Use when the task involves structured data retrieval.
**`write_result`** — Use to persist your output when done. Always call this last.

## Execution Contract
- Accept the task as given. If the task is unclear, return an error result — do not guess.
- Call tools in the order specified in the task instruction when provided.
- Write your result via `write_result` before returning control.
```

### Encoding delegation in a task message

When the Orchestrator sends a task, make the tool expectations explicit:

```
Task: Summarize the Q3 sales data for the EMEA region.
Required tools: search_documents (to retrieve the data), generate_report (to format output).
Output format: JSON with fields: region, period, summary, key_metrics.
Write result to: results/q3-emea-summary.json
```

This removes ambiguity — the subagent doesn't have to decide which tools apply.

---

## Pattern 3: Controlling Tool Selection When Multiple Tools Apply

### Disambiguation by input type

```markdown
## Tools

**`search_documents`** — Use for unstructured text lookups (articles, notes, emails).
**`run_query`** — Use for structured data (tables, databases, CSV). If you have a table
name or field name, use `run_query`. If you only have keywords, use `search_documents`.
```

### Disambiguation by intent

```markdown
**`draft_message`** — Use when the user wants a new message created.
**`edit_message`** — Use when the user provides existing text to revise. Never call
`draft_message` if the user supplies a draft — always use `edit_message`.
```

### Priority ordering

When tools form a pipeline, state the order explicitly:

```markdown
## Tool Execution Order

For any research task, follow this sequence:
1. `fetch_context` — always first; loads relevant background
2. `search_documents` — run after context is loaded
3. `synthesize` — only after search returns results; never skip step 2

Do not skip steps or reorder them even if the task seems simple enough to shortcut.
```

### When NOT to use tools

Agents over-call tools when instructions are only positive. Add explicit "skip" conditions:

```markdown
**`fetch_user_profile`** — Retrieves user account data.
Skip if: the user profile is already present in the task context.
Skip if: the task does not reference user-specific data.
```

---

## Pattern 4: Generator/Evaluator Loop Design

### Loop structure

```
Generator → [tool: produce output] → Evaluator → [tool: score output]
                ↑                                        |
                └──── if score < threshold: retry ───────┘
```

### Generator CLAUDE.md pattern

```markdown
## Role: Generator

You produce outputs using MCP tools. You do not evaluate your own output.

## Tools
**`generate_content`** — Call this to produce the requested output. Pass all task
parameters received from the Orchestrator unchanged.
**`submit_for_evaluation`** — Call this immediately after `generate_content` with:
  - generation_id: a unique ID you assign (format: gen-YYYYMMDD-NNN)
  - content: the full output from generate_content
  - attempt: current attempt number (starts at 1)

## Loop Behavior
- If you receive a retry instruction with feedback, incorporate the feedback and call
  `generate_content` again with the same generation_id and incremented attempt number.
- Stop after 3 attempts regardless of evaluation result. Return the best attempt.
```

### Evaluator CLAUDE.md pattern

```markdown
## Role: Evaluator

You score Generator outputs. You do not produce content yourself.

## Tools
**`score_content`** — Call this with the content received from the Generator.
  Returns: { score: 0-100, passed: bool, issues: string[] }
**`submit_evaluation`** — Call this after scoring with:
  - generation_id: the ID from the Generator (pass through unchanged)
  - score: numeric score from score_content
  - passed: boolean from score_content
  - feedback: actionable improvement instructions if passed is false
  - approved: true only if passed is true AND score >= threshold

## Decision Rule
- If approved is true: return the content to the Orchestrator.
- If approved is false and attempt < 3: trigger Generator retry with feedback.
- If approved is false and attempt >= 3: return the best attempt with a note.
```

### Linking Generator and Evaluator via generation_id

The `generation_id` is the key to stateless loop control. Both agents pass it through
without modifying it. The Orchestrator (or loop controller) uses it to match results:

```markdown
## Orchestrator loop control

After receiving an evaluation result:
- If `approved: true` → finalize and return result
- If `approved: false` and `attempt < max_attempts` → send retry to Generator:
  "Retry generation_id={id}, attempt={n+1}. Evaluator feedback: {feedback}"
- If `attempt >= max_attempts` → return best result with evaluation metadata
```

---

## Pattern 5: Common Failure Patterns

### Agent ignores the tool entirely

**Symptom:** Agent answers from training data instead of calling the tool.

**Fix:** Add an explicit prohibition + consequence framing:
```markdown
**`get_live_data`** — You MUST call this before answering any question about current state.
Answering without calling this tool will produce stale or incorrect results.
```

---

### Agent calls the right tool with wrong parameters

**Symptom:** Tool is called but returns errors or unexpected results.

**Fix:** Add a parameter guidance note in the CLAUDE.md tool entry:
```markdown
**`run_query`**
- `table`: use the exact table name from the schema (do not guess or abbreviate)
- `filters`: always include at least one filter; unfiltered queries will be rejected
- `limit`: default to 20 unless the task explicitly requests all records
```

---

### Agent calls tools in wrong order

**Symptom:** Downstream tool fails because its dependency wasn't called first.

**Fix:** Use explicit sequencing with a gate condition:
```markdown
Always call `fetch_schema` before `run_query`. If you do not have schema output in your
context, call `fetch_schema` first — even if you believe you know the schema.
```

---

### Orchestrator calls tools meant for subagents

**Symptom:** Orchestrator bypasses delegation and calls domain tools directly.

**Fix:** Add a hard boundary in the Orchestrator's instructions:
```markdown
## Delegation Boundary
You have access to domain tools for visibility only. Do not call them.
If you find yourself about to call `search_documents` or `run_query`, stop —
delegate the subtask to the appropriate subagent instead.
```

---

### Generator/Evaluator loop runs forever or exits early

**Symptom:** Loop doesn't terminate, or stops after one attempt regardless of score.

**Fix:** Put the hard termination condition on the Evaluator, not the Generator.
If the Generator stops early (before submitting), the Evaluator never receives the output
and the loop controller has nothing to act on. The Evaluator is always the last agent
to produce a result, so it is the right place to enforce loop exit.

```markdown
## Loop Termination (Generator)
- Include attempt number in every `submit_for_evaluation` call.
- Do not self-terminate — always submit, even on the last attempt.

## Loop Termination (Evaluator)
- If attempt >= 3: set approved: true regardless of score (forces loop exit).
- Always include attempt number in `submit_evaluation` response.
```

---

## Quick Reference: CLAUDE.md Tool Entry Template

```markdown
**`tool_name`**
- Use when: [specific trigger condition]
- Do not use when: [exclusion condition]
- Parameters: [key params and their expected values/formats]
- Returns: [what the output looks like]
- Always call before: [dependent tools, if any]
- Always call after: [prerequisite tools, if any]
```

Minimum required fields: **Use when** and (if over-calling is a risk) **Do not use when**.
The rest are optional but reduce parameter errors and ordering mistakes.
