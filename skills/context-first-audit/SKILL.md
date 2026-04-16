---
name: context-first-audit
description: Audit prompts, CLAUDE.md files, agent instructions, and harness configurations to evaluate whether they follow context-first principles — prioritizing rich context about who you are, what you're doing, and what good looks like, over prescriptive step-by-step instructions. Use this skill whenever the user wants to review or improve a prompt, system prompt, CLAUDE.md, agent instruction set, or any AI harness configuration. Trigger when users say things like "review my prompt", "audit my CLAUDE.md", "is my harness good?", "check my agent instructions", or "improve my system prompt". Also trigger when a user pastes a prompt or instruction block and asks for feedback.
---

> Inspired by Daniel Miessler's "Bitter Lesson Engineering" and Richard Sutton's "The Bitter Lesson" (2019).

# Context-First Audit

A skill for auditing AI prompts, system prompts, CLAUDE.md files, and agent harnesses to ensure they follow **context-first principles** — providing rich context about identity, goals, and standards rather than micromanaging execution steps.

---

## Core Principle

The fundamental question is:

> **Does this instruction tell the AI *who you are and what you want*, or does it tell the AI *exactly how to do it*?**

The former ages well as models improve. The latter becomes a liability.

---

## Audit Dimensions

Evaluate the input across these five dimensions:

### 1. Identity & Context Richness
Does the prompt establish:
- Who the author/user is (role, background, expertise level)?
- What project or domain this relates to?
- What tools, systems, or constraints are relevant?

**Good**: "I'm a marketing engineer at an enterprise SaaS company working on Adobe Experience Manager integrations."  
**Bad**: No identity context at all, or only a job title with no substance.

### 2. Goal Clarity vs. Procedure Prescription
Is the *desired outcome* clearly stated, without over-specifying the path to get there?

**Good**: "I want clean, minimal UI with generous whitespace and readable typography."  
**Bad**: "First open the file, then read lines 1-10, then check if X exists, then if yes do Y, otherwise do Z."

### 3. Quality Standards (What Good Looks Like)
Does the prompt describe what success looks like?
- Examples of ideal outputs
- Past work or reference projects
- Explicit "I like / I don't like" statements

**Good**: "Here are three examples of reports I've written that I'm proud of."  
**Bad**: Only negative constraints ("don't do X") with no positive vision.

### 4. Prescriptive Instruction Density
Count the number of imperative step-by-step instructions. High density is a red flag.

Look for patterns like:
- Numbered lists of sequential actions
- "First... then... then... finally..."
- Conditional logic written out for the AI ("if X, do Y, else do Z")
- File paths, variable names, or process details that the AI should discover itself

### 5. Future-Proofing
Would this prompt become *worse* as the model gets smarter?

Signs of poor future-proofing:
- Instructions that assume limited AI capability (e.g., "remember to check for errors")
- Workarounds for specific model weaknesses baked into the prompt
- Over-specified formatting instructions the model can infer from context

---

## Audit Output Format

Produce a structured report:

```
## Context-First Audit Report

### Overall Score: [Poor / Needs Work / Good / Excellent]

### Strengths
- [What the prompt does well]

### Issues Found
- [PRESCRIPTIVE] Description of the problem + line/section reference
- [MISSING CONTEXT] Description of what's absent
- [FUTURE-PROOFING] Description of what will age poorly

### Recommended Revisions
Before:
> [original text]

After:
> [revised text]

### Summary
One paragraph on the overall orientation of the prompt and the most impactful change to make.
```

---

## Scoring Guide

| Score | Description |
|-------|-------------|
| **Poor** | Mostly step-by-step procedures, little to no identity/goal context |
| **Needs Work** | Some context present but significant prescriptive sections remain |
| **Good** | Context-first overall, minor prescriptive remnants |
| **Excellent** | Rich identity, clear goals, quality standards — AI has room to work |

---

## Common Anti-Patterns to Flag

- **The Recipe**: A numbered list of exact steps masquerading as a prompt
- **The Micromanager**: Specifying file names, variable names, or implementation details
- **The Workaround**: Instructions compensating for specific model weaknesses (now baked in forever)
- **The Vacuum**: No identity context — could have been written by anyone for anyone
- **The Negative-Only**: Only "don't do X" rules, no positive vision of good output

---

## Tips for Revision

When suggesting improvements:

1. **Replace procedures with goals** — "Do A then B then C" → "Achieve outcome X"
2. **Add identity layers** — Who is the user? What's their background? What do they care about?
3. **Anchor to examples** — "Here's something I made that I liked / didn't like"
4. **State the standard, not the method** — "I value clean, well-commented code" not "always add a comment above every function"
5. **Trust the model** — If the AI can reasonably infer something from context, remove the explicit instruction
