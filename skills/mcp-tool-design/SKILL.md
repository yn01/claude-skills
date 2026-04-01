---
name: mcp-tool-design
description: >
  Use this skill when designing or reviewing MCP server tools — choosing between Tool,
  Resource, and Prompt primitives; writing tool descriptions that Claude will reliably
  select; designing input schemas; handling errors in agent-friendly ways; or thinking
  through idempotency and side effects. Also trigger when the user is building MCP tools
  intended for use by agents (orchestrators, subagents, Generator/Evaluator loops) rather
  than direct human interaction. When in doubt, trigger early — design mistakes are
  expensive to fix after integration.
---

# mcp-tool-design

Best practices for designing MCP server tools that work reliably with Claude.

---

## Tool vs Resource vs Prompt — Decision Tree

```
Does the operation have side effects or require arguments to execute?
│
├─ YES → Use a Tool
│         Examples: create_file, send_message, run_query, generate_report
│
└─ NO → Is it a reusable instruction template that guides Claude's behavior?
         │
         ├─ YES → Use a Prompt
         │         Examples: code-review-template, summarize-document, debug-session
         │
         └─ NO → Is it static or semi-static content Claude should read?
                  │
                  ├─ YES → Use a Resource
                  │         Examples: config file, schema definition, reference doc
                  │
                  └─ UNCLEAR → Default to Tool (more flexible, always available)
```

### Key distinctions

| | Tool | Resource | Prompt |
|-|------|----------|--------|
| Triggered by | Claude deciding to call it | Claude or user reading it | User invoking a template |
| Has side effects | Yes (or may) | No | No |
| Takes arguments | Yes (input schema) | URI only | Optional arguments |
| Best for | Actions, lookups, computation | Reference content | Reusable workflows |

**The `get_document` question:** If fetching a document is a pure read with a known URI,
use a Resource. If it requires query parameters, auth, filtering, or the content changes
per-request, use a Tool.

**When in doubt, use a Tool.** Tools are always available for Claude to call; Resources
require explicit read steps. A Tool that only reads is fine — the cost is minimal.

---

## Writing Tool Descriptions

Tool descriptions are how Claude decides *which* tool to call and *when*.
A bad description leads to missed invocations or wrong tool selection.

### For the `name` field
- Use `verb_noun` snake_case: `create_issue`, `search_documents`, `send_notification`
- Be specific: `get_user_by_email` beats `get_user`
- Avoid generic names: `run`, `execute`, `process`

### For the `description` field

**Structure to follow:**
```
[What it does] + [When to use it] + [Key constraints or side effects]
```

**Good examples:**
```
"Searches the document store by keyword and returns matching titles and excerpts.
Use when the user asks to find, look up, or retrieve documents by topic or content.
Returns up to 20 results. Does not modify any data."

"Creates a new GitHub issue in the specified repository. Use when the user explicitly
asks to file, create, or open an issue. Requires repo write access. Irreversible."
```

**Bad examples:**
```
"Gets documents"              ← too vague, no trigger signal
"This tool searches things"   ← passive, no context
"Use this to do stuff"        ← useless
```

### For input parameter `description` fields

**Different goal:** Tool description controls *when* Claude calls the tool.
Parameter description controls *what Claude passes in*. Focus on **format and constraints**:
```json
{
  "query": {
    "type": "string",
    "description": "Search keywords. Use natural language or exact phrases. Max 200 chars."
  },
  "limit": {
    "type": "integer",
    "description": "Max results to return. Default 10, max 50."
  }
}
```

Do not just repeat the parameter name: `"query": "the query"` is useless.

---

## Input Schema Design

### Do

- Use `required` to list every parameter Claude must provide
- Add `default` values for optional parameters
- Use `enum` for finite sets of values — Claude will pick correctly
- Keep schemas flat; avoid deeply nested objects unless necessary
- Use `additionalProperties: false` to prevent Claude from hallucinating extra fields

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["open", "closed", "pending"],
      "description": "Filter by issue status."
    },
    "limit": {
      "type": "integer",
      "default": 10,
      "description": "Number of results. Default 10, max 100."
    }
  },
  "required": ["status"],
  "additionalProperties": false
}
```

### Avoid

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| `"type": "any"` or no type | Claude may pass wrong type | Always specify type |
| Deeply nested objects | Claude tends to hallucinate keys | Flatten or use separate tools |
| Overloaded tools (10+ params) | Claude fills wrong fields | Split into focused tools |
| Boolean flags as strings | `"true"` ≠ `true` | Use `"type": "boolean"` |
| Ambiguous optional params | Claude skips or misuses | Add clear default + description |

---

## Error Handling Design

### Return structured errors, not exceptions

Tools should return a result object, not throw. Claude reads the content field and
decides what to do next.

**Good pattern (MCP SDK):**
```typescript
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      success: false,
      error: "NOT_FOUND",
      message: "Document 'abc' does not exist.",
      retryable: false
    })
  }]
};
```

**Bad pattern:**
```typescript
throw new Error("not found");  // Claude sees a tool failure, not a structured result
```

### Error fields that help agents recover

| Field | Purpose |
|-------|---------|
| `error` | Machine-readable error code (`NOT_FOUND`, `RATE_LIMITED`, `INVALID_INPUT`) |
| `message` | Human-readable explanation |
| `retryable` | `true` if retrying with same input may succeed (e.g., transient failures) |
| `suggestion` | What to try next (`"Try searching with fewer keywords"`) |

### Retryable vs non-retryable

- **Retryable:** rate limits, timeouts, temporary unavailability → include `retryable: true` + suggested wait
- **Non-retryable:** invalid input, not found, permission denied → include `retryable: false` + `suggestion` for correction

---

## Idempotency and Side Effects

### Mark side effects clearly in the description

```
"Deletes the specified file permanently. This action cannot be undone."
"Sends an email to the recipient. Each call sends one email."
"Increments the counter by 1. Not idempotent — calling twice increments twice."
```

### Design for idempotency where possible

Use an `idempotency_key` parameter for operations that must not be duplicated:
```json
{
  "idempotency_key": {
    "type": "string",
    "description": "Optional. If provided, duplicate calls with the same key are no-ops."
  }
}
```

### Separate read and write tools

Avoid tools that both read and mutate in one call. Prefer:
- `get_order` (read, safe to call anytime)
- `update_order_status` (write, explicit intent)

This lets agents call the read version freely for planning, and the write version only when ready to commit.

---

## Agent-Facing vs Human-Facing Design

| Concern | Human-facing | Agent-facing |
|---------|-------------|--------------|
| Output verbosity | Rich, formatted text | Structured JSON, minimal prose |
| Error messages | Friendly, explanatory | Machine-readable codes + `retryable` |
| Parameter flexibility | Forgiving (accept variations) | Strict schema, `additionalProperties: false` |
| Confirmation prompts | Acceptable | Avoid — agents can't respond interactively |
| Pagination | Optional | Essential — agents loop; avoid truncated results |
| Idempotency | Nice to have | Required for any write operation |

### Generator/Evaluator loop design

When tools are used in multi-agent loops (Generator produces → Evaluator scores → repeat):

1. **Return structured evaluation-friendly output**
   ```json
   {
     "result": "...",
     "metadata": {
       "token_count": 312,
       "sources": ["doc-a", "doc-b"],
       "confidence": 0.87
     }
   }
   ```
   Evaluator agents need signals beyond the raw result to score quality.

2. **Include a `request_id` or `generation_id` in responses**
   Links Generator output to Evaluator feedback without relying on conversation context.

3. **Design feedback tools explicitly**
   If the Evaluator needs to pass feedback back, create a dedicated tool:
   ```
   submit_evaluation(generation_id, score, feedback, approved)
   ```
   rather than encoding feedback in a generic parameter.

4. **Make failure modes observable**
   Return partial results with `partial: true` rather than failing silently.
   Evaluator agents can score partial output and decide whether to retry.

5. **Avoid tools that require multi-turn clarification**
   In agent loops, a tool that asks "did you mean X or Y?" will deadlock the loop.
   Use strict schemas + return an error with `suggestion` instead.
