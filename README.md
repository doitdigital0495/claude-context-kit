# claude-context-kit

**Stop burning through your Claude Code usage limits.**

One command to add context management to any project — `.claudeignore`, `CLAUDE.md` rules, global discipline rules, and a diagnostic skill.

## Why?

Every Claude Code conversation turn **re-sends your entire history**. A 20-turn session costs ~50x a single message. Without guardrails, context fills up with junk files, stale history, and verbose tool output — draining your usage limit fast.

This kit fixes that at every layer:

| Problem | Fix | Impact |
|---|---|---|
| Claude scans `node_modules`, lock files, build output | `.claudeignore` blocks them | **40-70% less context per turn** |
| Claude reads entire 1000-line files | CLAUDE.md rules enforce targeted reads | **60% fewer wasted tokens** |
| Auto-compact triggers at 95% (too late) | Rules enforce compaction at 60% | **Better summaries, longer sessions** |
| Subagents spawn full context windows (7-15x) | Discipline rules for model selection + spawn limits | **Prevents runaway agent costs** |
| No way to diagnose what's eating tokens | `/context-audit` skill | **On-demand diagnostic** |

## Install

### Option 1: npx (recommended)

```bash
cd your-project
npx claude-context-kit
```

Interactive prompts let you pick which components to install. Or install everything at once:

```bash
npx claude-context-kit --all
```

### Option 2: curl (no Node required)

```bash
cd your-project
bash <(curl -fsSL https://raw.githubusercontent.com/doitdigital0495/claude-context-kit/main/install.sh)
```

### Option 3: Manual

Copy the files yourself from [`templates/`](./templates):

| File | Destination |
|---|---|
| `templates/claudeignore` | `.claudeignore` (project root) |
| `templates/claude-md-snippet.md` | Append to `CLAUDE.md` (project root) |
| `templates/rules/context-discipline.md` | `~/.claude/rules/context-discipline.md` |
| `templates/skill/` | `.claude/skills/context-audit/` |

## What Gets Installed

### 1. `.claudeignore`

Blocks Claude from scanning files that waste tokens:

- `node_modules/`, `vendor/`, `.venv/` (dependencies)
- `package-lock.json`, `yarn.lock` (lock files)
- `.next/`, `dist/`, `build/` (build output)
- `*.png`, `*.jpg`, `*.woff` (binaries)
- `*.csv`, `*.sqlite` (large data)
- IDE files, OS files, test coverage

Includes commented-out sections for stack-specific exclusions (Next.js, Python, Rust, Go, Java, Convex).

### 2. CLAUDE.md Context Management Rules

Appended to your project's `CLAUDE.md`. Teaches Claude to:

- **Read files with `offset` + `limit`** — never read >200 lines at once
- **Compact after subtasks** — not at 95% when it's too late
- **Use `/clear` between topics** — don't carry dead context
- **Select the right model** — Haiku for simple tasks, Sonnet for standard work, Opus for architecture
- **Delegate verbose work** to subagents instead of bloating main context

### 3. Global Rules (`~/.claude/rules/context-discipline.md`)

Loaded in every Claude Code session across all projects. Enforces:

- File read discipline (Grep before Read, always use offset+limit)
- Proactive compaction (after subtasks, after 15+ turns)
- Subagent cost awareness (prefer single agents, use Haiku for simple work)
- Output discipline (summarize large outputs, skip passing test output)

### 4. Context-Audit Skill

A diagnostic skill you can invoke with `/context-audit`. It:

1. Measures current context usage and session cost
2. Identifies bloat sources (large file reads, verbose output, stale history, agent overhead)
3. Takes corrective action (compact, model switch, effort adjustment)
4. Sets a compaction plan for the remaining session

Includes token cost cheat sheet and compaction templates.

## Quick Wins After Installing

```
/compact          — Free up context right now
/context          — See your context usage (fuel gauge)
/model sonnet     — Switch to Sonnet if you're on Opus for routine work
/effort low       — Reduce thinking tokens for simple tasks
/mcp              — Disable unused MCP servers
/context-audit    — Full diagnostic of what's eating tokens
```

## Additional Reading

- [Why usage limits spike — 5-Why Analysis](./docs/five-why-analysis.md) — root cause investigation
- [Rules scoping guide](./docs/rules-scoping-guide.md) — organize your `~/.claude/rules/` to stop wasting tokens
- [Manage costs effectively](https://code.claude.com/docs/en/costs) — official Anthropic docs
- [Best practices](https://code.claude.com/docs/en/best-practices) — official Anthropic docs

## Non-Destructive

The installer never overwrites your existing work:

- **`.claudeignore`** — if it already exists → skipped (your custom ignores are preserved)
- **`CLAUDE.md`** — if it exists, the context management section is **appended** below your existing content. If it already contains `## Context Management` → skipped (no duplicates)
- **`~/.claude/rules/context-discipline.md`** — if it already exists → skipped
- **`.claude/skills/context-audit/`** — if it already exists → skipped

Safe to run multiple times.

## Uninstall

Remove any files you don't want:

```bash
rm .claudeignore
rm ~/.claude/rules/context-discipline.md
rm -rf .claude/skills/context-audit/
# Edit CLAUDE.md to remove the "## Context Management" section
```

## Contributing

PRs welcome. If you've found a technique that measurably reduces token usage, open an issue or PR.

## License

MIT
