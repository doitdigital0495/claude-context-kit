# Why Claude Code Usage Limits Spike — 5-Why Root Cause Analysis

**Date:** March 2026
**Problem:** Claude Code usage limits drain in 1-2 hours instead of 5+ hours.

---

## The Analysis

```
PROBLEM: Claude Code usage limits drain abnormally fast — sessions that previously
lasted 5+ hours exhaust limits in 1-2 hours.

WHY 1: Every conversation turn re-sends the entire conversation history as input tokens.
       A 20-turn session processes ~50x the tokens of a single message, not 20x.
       → Evidence: Official docs (stateless API model); DEV Community token tracing
         shows 98% of tokens in turn 100+ are re-sent cached history.

WHY 2: Context grows unchecked — large file reads, verbose tool output, and stale
       history accumulate without limits. Prompt caching helps (90% discount on cached
       content) but new content per turn is full price, and the base context is ~40-50K
       tokens of fixed overhead (system prompt + tools + rules + skills metadata).
       → Evidence: System prompt analysis shows 30K base + 10K skills metadata + rules.

WHY 3: No guardrails prevent context bloat. Most projects have no .claudeignore (so
       Claude reads build artifacts and lock files), global rules load unconditionally
       across all projects, and subagents multiply the problem (7-15x overhead per team).
       → Evidence: Community reports agent teams = 887K tokens/minute in worst cases.

WHY 4: Auto-compact triggers too late (~95% capacity), producing poor-quality summaries
       under pressure. By then, most of the token budget has already been consumed by
       stale context that should have been compacted earlier.
       → Evidence: Community consensus — compact at 60% for quality summaries.

WHY 5: No deliberate context management architecture exists in most setups. Claude Code
       ships no built-in instructions for file read limits, compaction cadence, model
       selection, or subagent spawn discipline.
       → Evidence: Default CLAUDE.md contains no context management instructions.
```

## Root Cause

The absence of a context management architecture — no file exclusions, no proactive compaction, no read discipline, and no subagent cost awareness — causes exponential token waste that compounds across every conversation turn.

## How This Toolkit Fixes It

| Root Cause Layer | Fix | File |
|---|---|---|
| Junk files scanned | `.claudeignore` excludes build artifacts, binaries, locks | `templates/claudeignore` |
| No read discipline | CLAUDE.md rules enforce offset+limit on large files | `templates/claude-md-snippet.md` |
| Late compaction | Rules enforce compact at 60%, not 95% | `templates/rules/context-discipline.md` |
| Subagent cost ignorance | Rules enforce model selection + spawn discipline | `templates/rules/context-discipline.md` |
| No diagnostic tool | context-audit skill for on-demand diagnosis | `templates/skill/` |

## Token Cost Reference

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

## Sources

- [Manage costs effectively — Claude Code Docs](https://code.claude.com/docs/en/costs)
- [Prompt caching — Anthropic Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Where Do Your Claude Code Tokens Actually Go? — DEV Community](https://dev.to/slima4/where-do-your-claude-code-tokens-actually-go-423e)
- [Claude Code Sub Agents: Burn Out Your Tokens — DEV Community](https://dev.to/onlineeric/claude-code-sub-agents-burn-out-your-tokens-4cd8)
- [Stop Wasting Tokens: How to Optimize Claude Code Context by 60% — Medium](https://medium.com/@jpranav97/stop-wasting-tokens-how-to-optimize-claude-code-context-by-60-bfad6fd477e5)
- [MCP Server Token Costs in Claude Code — JD Hodges](https://www.jdhodges.com/blog/claude-code-mcp-server-token-costs/)
