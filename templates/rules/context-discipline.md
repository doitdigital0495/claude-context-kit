# Context Discipline Rules
# Installed by claude-context-kit — https://github.com/doitdigital0495/claude-context-kit

## File Read Discipline
- When reading files >200 lines, ALWAYS specify `offset` and `limit` to read only the relevant section.
- Before reading a file, use Grep to locate the specific function, class, or section you need.
- NEVER read lock files, build output, or generated type declarations.

## Proactive Compaction
- After completing a subtask (feature, fix, investigation), run `/compact` with a preservation note.
- After 15+ implementation turns, compact before continuing.
- Use `/clear` when switching to an unrelated task — stale context costs tokens every turn.

## Subagent Cost Awareness
- Each subagent spawns a full context window. Prefer single agents over teams.
- Delegate verbose operations (test suites, log analysis, broad searches) to subagents to keep main context lean.
- Use `model: "haiku"` for subagent tasks that don't need deep reasoning.
- NEVER spawn parallel agents for tasks that could be done sequentially with one agent.

## Output Discipline
- When tool output is large (>100 lines), summarize the key findings in your response rather than quoting verbatim.
- When running tests, capture only failures — don't include passing test output in your reasoning.
