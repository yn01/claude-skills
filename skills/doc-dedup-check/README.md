# doc-dedup-check

A Claude skill for preventing documentation duplication when creating or expanding `.md` files in a project.

---

## What it does

Before creating a new documentation file, scans the entire project tree for overlapping content — especially `README.md` — and designates a single source of truth. Instead of duplicating content, the secondary file links to the primary.

## Why it matters

Duplicated documentation always diverges. One copy gets updated while the other becomes stale, leading to inconsistent information. The fix is to own content in one place and reference it everywhere else.

## Usage

Trigger this skill when:

- Creating new `.md` files such as `features.md`, `setup.md`, `architecture.md`, or similar
- Adding a new section to an existing doc that might already exist elsewhere
- Reorganizing documentation structure across a project

Example prompts:

- "Create a setup.md for this project"
- "Add an architecture doc"
- "Set up a features page"

## Output

- A list of overlapping sections found across existing files
- A designated source of truth for each section
- The new file using reference links instead of duplicated content

## Installation

Place the `doc-dedup-check/` folder in your Claude skills directory (`skills/` in your skills repo).

---

Part of the [`yn01/claude-skills`](https://github.com/yn01/claude-skills) collection.

## Changelog

### v1.0.0 — 2026-04-23
- Initial release
