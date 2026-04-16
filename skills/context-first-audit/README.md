# context-first-audit

A Claude skill for auditing AI prompts, system prompts, `CLAUDE.md` files, and agent harness configurations to ensure they follow **context-first principles**.

> Inspired by Daniel Miessler's "Bitter Lesson Engineering" framework and Richard Sutton's seminal essay "The Bitter Lesson" (2019).

---

## What it does

Evaluates whether your prompts and harness instructions are built around:

- **Who you are** — identity, role, background, goals
- **What good looks like** — examples, standards, preferences
- **What you're trying to accomplish** — outcomes over procedures

...rather than micromanaging *how* the AI should do things step by step.

## Why it matters

Prescriptive instructions age poorly. As models improve, overly specific step-by-step prompts become constraints rather than guides — and can actively make AI responses worse. Context-first prompts remain valuable (or become *more* valuable) as models get smarter.

## Usage

Point it at any prompt, instruction block, `CLAUDE.md`, or agent configuration and ask for an audit:

- "Audit this CLAUDE.md"
- "Review my system prompt — is it context-first?"
- "Check my agent instructions"
- "Is my harness good?"

## Output

A structured report covering:
- Overall score (Poor / Needs Work / Good / Excellent)
- Specific issues flagged with category labels
- Before/after revision suggestions
- Summary with the most impactful change to make

## Installation

Place the `context-first-audit/` folder in your Claude skills directory (`skills/` in your skills repo).

---

Part of the [`yn01/claude-skills`](https://github.com/yn01/claude-skills) collection.
