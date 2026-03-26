# Context Audit Skill

**Goal:** Diagnose what is consuming context in the current session and take corrective action to maximize remaining capacity and prevent usage limit spikes.

**When to use:**
- Usage limits are draining faster than expected
- Session feels sluggish or responses are slower than usual
- Before starting a long implementation task (preventive audit)
- After auto-compact triggers (indicates you were at 95% — need to understand why)

---

## EXECUTION

### Step 1: Measure Current State

Run these commands and record the results:

1. **Check context usage**: Run `/context` — note the percentage filled and color
2. **Check session cost**: Run `/cost` (API users) or `/stats` (subscribers)
3. **Count conversation turns**: Estimate how many turns have elapsed since last `/compact` or `/clear`

Present findings:
```
## Context Audit

**Context used:** [X]%
**Turns since last compact:** [N]
**Session cost so far:** [amount or N/A]
```

### Step 2: Identify Bloat Sources

Check each category and flag issues:

#### A. Large File Reads
- Were any files >200 lines read in full? (Check recent tool calls)
- Were lock files, generated files, or build artifacts read?
- **Fix:** Future reads should use `offset` + `limit`. Note specific files to avoid.

#### B. Verbose Tool Output
- Did any Bash commands produce large output (test suites, build logs)?
- Did any Grep searches return excessive results?
- **Fix:** Delegate verbose operations to subagents. Pipe output through `head` or `tail`.

#### C. Stale Conversation Context
- Is the conversation carrying context from completed/abandoned subtasks?
- Are there multiple debugging attempts where only the final fix matters?
- **Fix:** Run `/compact` with a preservation note targeting what's still relevant.

#### D. Subagent Overhead
- How many subagents were spawned this session?
- Were agent teams used? (7-15x token multiplier)
- Were subagents given vague prompts causing broad exploration?
- **Fix:** Consolidate to fewer, more focused agents. Use `model: "haiku"` for simple work.

#### E. Configuration Overhead
- Is the project's `.claudeignore` present and comprehensive?
- Are global rules files large? (Check `~/.claude/rules/`)
- Are there MCP servers configured that aren't being used?
- **Fix:** Create/update `.claudeignore`. Scope rules to projects. Disable idle MCP servers.

### Step 3: Take Corrective Action

Based on findings, apply the highest-impact fixes immediately:

**Priority 1 — Immediate relief:**
- Run `/compact [preservation note]` if context >60%
- Run `/clear` if carrying context from unrelated work

**Priority 2 — Session discipline:**
- Switch to appropriate model for remaining work (`/model`)
- Set effort level if deep reasoning isn't needed (`/effort low` or `/effort medium`)

**Priority 3 — Configuration (one-time):**
- Create/update `.claudeignore` if missing or incomplete
- Move project-specific rules out of global `~/.claude/rules/`
- Disable unused MCP servers via `/mcp`

### Step 4: Set Compaction Plan

Estimate remaining work and set checkpoints:

```
## Action Plan

**Compacted:** [yes/no, with preservation note]
**Model:** [current model, with recommendation]
**Effort:** [current level]
**Next compact:** After [specific milestone]
**Estimated remaining turns:** [N]
```

---

## REFERENCE: Token Cost Cheat Sheet

| Action | Approximate Token Cost |
|--------|----------------------|
| System prompt + tools (base) | ~30,000 tokens |
| Skills metadata (100 skills) | ~10,000 tokens |
| CLAUDE.md (per 100 lines) | ~1,500 tokens |
| Rules files (per 100 lines) | ~1,500 tokens |
| MCP server (per server) | ~2,000-10,000 tokens |
| Full file read (500 lines) | ~5,000-8,000 tokens |
| Subagent spawn | Full context copy + task |
| Agent team (3 agents) | ~7x single session |
| Each conversation turn | Re-sends ALL of the above |

## REFERENCE: Compaction Templates

Use these as `/compact` arguments for common scenarios:

**After implementing a feature:**
```
/compact Preserve: files changed, architecture decisions made, current feature state. Drop: exploration attempts, file contents already committed, debugging traces.
```

**After debugging:**
```
/compact Preserve: root cause found, fix applied, files modified. Drop: failed hypotheses, stack traces, intermediate test runs.
```

**After research/exploration:**
```
/compact Preserve: key findings, decisions made, files identified for modification. Drop: file contents read during exploration, search results.
```

**Mid-session preventive:**
```
/compact Preserve: current task context, plan, files being modified. Drop: completed subtasks, tool output from finished work.
```

---

## ANTI-PATTERNS

| Symptom | Wrong Response | Right Response |
|---------|---------------|----------------|
| Context at 90% | Keep working, auto-compact will handle it | Compact NOW with targeted preservation |
| Need to read a 1000-line file | `Read` the whole file | Grep for the function, then Read with offset+limit |
| Test suite output needed | Run tests in main context | Delegate to subagent, get summary back |
| Switching topics | Continue in same conversation | `/clear` and start fresh |
| Simple rename task | Use Opus with high effort | `/model haiku` + `/effort low` |
| 3 independent tasks | Spawn 3 parallel agent teams | Run sequentially, or spawn 3 simple agents |
