# Rules Scoping Guide

## The Problem

Files in `~/.claude/rules/` are loaded on **every turn** in **every project**. A 4,500-token rules file costs 4,500 tokens x every message x every session x every project. Over a day of work (200 turns), that's 900,000 tokens of repeated context — most of it irrelevant to the current task.

## The Fix: Scope Rules by Project

### 1. Audit your global rules

```bash
ls ~/.claude/rules/
```

For each file, ask: "Does this apply to ALL my projects, or just one?"

### 2. Move project-specific rules to project-level

Claude Code supports project-level rules at `.claude/rules/` within each repo.

**Before (global, loaded everywhere):**
```
~/.claude/rules/ca-errors.md    <- 34 entries from 6 different projects
```

**After (scoped, loaded only where relevant):**
```
~/.claude/rules/ca-errors.md               <- Only cross-project lessons (5-10 entries)
~/project-a/.claude/rules/ca-errors.md     <- Project A-specific errors
~/project-b/.claude/rules/ca-errors.md     <- Project B-specific errors
```

### 3. Use path-scoped rules (advanced)

Rules support YAML frontmatter with a `paths` field:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/middleware/**/*.ts"
---

# API-Specific Rules
- Always validate request bodies with zod schemas
- Use the shared error handler from src/lib/errors.ts
```

This rule only loads when Claude touches API files — not when editing frontend components.

### 4. Keep global rules lean

Global rules should contain ONLY:
- Cross-project workflow preferences
- Universal coding standards
- Tool usage corrections that apply everywhere

**Target: <50 lines / <1,000 tokens for global rules.**

### 5. Periodic cleanup

Review rules quarterly:
- Is this entry still true?
- Has this lesson been internalized?
- Is this duplicated in the project's CLAUDE.md?

### Token Impact Math

| Scenario | Tokens/Turn | 200 Turns/Day | Monthly (22 days) |
|----------|------------|---------------|-------------------|
| 4,500 token global rules | 4,500 | 900,000 | 19,800,000 |
| 1,000 token global rules | 1,000 | 200,000 | 4,400,000 |
| **Savings** | **3,500** | **700,000** | **15,400,000** |

At Sonnet pricing ($3/M input, 90% cached): ~$4.60/month saved.
At Opus pricing ($5/M input): ~$7.70/month saved.
Small per-turn, but it compounds.
