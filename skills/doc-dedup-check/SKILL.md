---
name: doc-dedup-check
description: Check for documentation duplication before creating or expanding .md files. Scans the project for overlapping content with existing files (especially README.md) and designates a single source of truth. Trigger when users create new docs like features.md, setup.md, architecture.md, or add large sections to existing docs.
---

# Doc Dedup Check — Prevent Documentation Duplication

## Overview

Before creating a new documentation file or adding a major section to existing docs, scan the project for overlapping content. Duplicated content leads to one copy becoming stale — this skill prevents that by designating a single source of truth and using links instead of copies.

## Usage

When triggered, follow these steps:

1. **Scan the project** — use Glob to find all `.md` files in the entire project tree, not just the current folder
2. **Identify overlap** — compare headings, topic areas, and content (e.g., feature lists, setup instructions, command references) between the target file and existing files
3. **Check README.md specifically** — it is the most common source of duplication
4. **Designate a single source of truth** — decide which file owns each overlapping section
5. **Link, don't duplicate** — in the secondary file, replace duplicated content with a reference link:
   ```markdown
   See [Installation in README.md](../README.md#installation).
   ```
6. **Report findings** — list which sections overlap, which file owns them, and what changes were made or recommended

## When to Use

- Creating new `.md` files such as `features.md`, `setup.md`, `architecture.md`, or similar
- Adding a new section to an existing doc that might already exist elsewhere
- Reorganizing documentation structure across a project

## Example

> User: "Create a setup.md for this project."
>
> Claude: [invokes this skill, scans for existing setup/installation content, finds an `## Installation` section in README.md, creates setup.md with a link instead of duplicating the content]

```markdown
## Setup

See [Installation in README.md](../README.md#installation).
```
