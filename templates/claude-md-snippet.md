## Context Management

Every conversation turn re-sends the full history. Follow these rules to prevent usage limit spikes.

### File Reading
- ALWAYS use `offset` + `limit` when reading files >200 lines. Read only the section you need.
- NEVER read an entire file "to get an overview" — use Grep to find the relevant section first.
- When debugging, read the specific function/area, not the whole file.
- Prefer Grep over Read for locating code. Grep returns only matching lines; Read returns everything.

### Context Hygiene
- Run `/compact` after completing any major subtask (feature implemented, bug fixed, research done).
- When a conversation exceeds ~15 turns on implementation work, compact before continuing.
- Use `/clear` when switching to an unrelated topic — don't carry dead context.
- After long debugging sessions, compact with: `/compact Preserve: the fix applied, root cause found, files changed. Drop: failed attempts and stack traces.`

### Subagent Discipline
- Delegate verbose work to subagents: test runs, log analysis, large file searches, documentation fetching.
- Keep subagent prompts focused and specific — vague prompts cause agents to explore broadly (expensive).
- Prefer single agents over agent teams unless tasks are truly independent and concurrent.
- Use `model: "haiku"` for subagent tasks that don't require deep reasoning (file searches, simple transforms).

### Model Selection
- Use Haiku for: simple renames, typo fixes, file searches, formatting.
- Use Sonnet for: standard feature implementation, bug fixes, code review.
- Use Opus for: complex architecture decisions, multi-file refactors, subtle bugs.
- Switch with `/model` mid-session when task complexity changes.

### What NOT to Put in Context
- Don't paste entire error logs — extract the relevant error message and stack trace.
- Don't read documentation files unless you need a specific section.
- Don't read test files to "understand the codebase" — read the source code directly.
- Don't read generated files (lock files, build output, type declarations).
