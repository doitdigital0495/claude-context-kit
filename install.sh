#!/usr/bin/env bash
# claude-context-kit — bash installer
# Usage: bash <(curl -fsSL https://raw.githubusercontent.com/doitdigital0495/claude-context-kit/main/install.sh)
set -euo pipefail

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

ok()   { echo -e "  ${GREEN}+${RESET} $1"; }
skip() { echo -e "  ${YELLOW}-${RESET} ${DIM}$1${RESET}"; }
info() { echo -e "  ${BLUE}i${RESET} $1"; }

BASE_URL="https://raw.githubusercontent.com/doitdigital0495/claude-context-kit/main/templates"
MARKER="<!-- claude-context-kit -->"
GLOBAL_RULES_DIR="$HOME/.claude/rules"

# ── Header ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}  claude-context-kit${RESET}"
echo -e "${DIM}  Stop burning through your Claude Code usage limits${RESET}"
echo ""

# ── Detect project ───────────────────────────────────────────────────────────
if [ ! -d ".git" ] && [ ! -f "package.json" ] && [ ! -f "CLAUDE.md" ]; then
  echo -e "  ${YELLOW}!${RESET} No .git, package.json, or CLAUDE.md found."
  echo -e "  ${YELLOW}!${RESET} Are you in a project root?"
  echo ""
  read -p "  Continue anyway? (Y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "  ${DIM}Run this from your project root.${RESET}"
    exit 0
  fi
else
  info "Project detected: ${BOLD}$(basename "$(pwd)")${RESET}"
fi

echo ""
echo -e "${BOLD}  Installing all components...${RESET}"
echo ""

# ── Fetch helper ─────────────────────────────────────────────────────────────
fetch() {
  if command -v curl &>/dev/null; then
    curl -fsSL "$1"
  elif command -v wget &>/dev/null; then
    wget -qO- "$1"
  else
    echo "Error: curl or wget required" >&2
    exit 1
  fi
}

# ── 1. .claudeignore ────────────────────────────────────────────────────────
if [ -f ".claudeignore" ]; then
  skip ".claudeignore already exists — skipping"
else
  fetch "$BASE_URL/claudeignore" > .claudeignore
  ok ".claudeignore created — junk files now excluded from context"
fi

# ── 2. CLAUDE.md snippet ───────────────────────────────────────────────────
SNIPPET=$(fetch "$BASE_URL/claude-md-snippet.md")
if [ -f "CLAUDE.md" ]; then
  if grep -q "## Context Management" CLAUDE.md 2>/dev/null || grep -q "$MARKER" CLAUDE.md 2>/dev/null; then
    skip "CLAUDE.md already has context management section — skipping"
  else
    printf "\n\n%s\n%s" "$MARKER" "$SNIPPET" >> CLAUDE.md
    ok "Context management rules appended to existing CLAUDE.md"
  fi
else
  printf "%s\n%s" "$MARKER" "$SNIPPET" > CLAUDE.md
  ok "CLAUDE.md created with context management rules"
fi

# ── 3. Global rules ─────────────────────────────────────────────────────────
mkdir -p "$GLOBAL_RULES_DIR"
if [ -f "$GLOBAL_RULES_DIR/context-discipline.md" ]; then
  skip "~/.claude/rules/context-discipline.md already exists — skipping"
else
  fetch "$BASE_URL/rules/context-discipline.md" > "$GLOBAL_RULES_DIR/context-discipline.md"
  ok "Global rules installed at ~/.claude/rules/context-discipline.md"
fi

# ── 4. context-audit skill ──────────────────────────────────────────────────
SKILL_DIR=".claude/skills/context-audit"
if [ -f "$SKILL_DIR/SKILL.md" ]; then
  skip ".claude/skills/context-audit/ already exists — skipping"
else
  mkdir -p "$SKILL_DIR"
  fetch "$BASE_URL/skill/SKILL.md" > "$SKILL_DIR/SKILL.md"
  fetch "$BASE_URL/skill/workflow.md" > "$SKILL_DIR/workflow.md"
  ok "context-audit skill installed at .claude/skills/context-audit/"
fi

# ── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}  Quick wins you can do right now:${RESET}"
echo ""
echo -e "  ${CYAN}1.${RESET} Run ${BOLD}/compact${RESET} to free up context in your current session"
echo -e "  ${CYAN}2.${RESET} Run ${BOLD}/context${RESET} to see your context usage"
echo -e "  ${CYAN}3.${RESET} Review ${BOLD}~/.claude/rules/${RESET} and move project-specific rules to project-level"
echo -e "  ${CYAN}4.${RESET} Disable unused MCP servers with ${BOLD}/mcp${RESET}"
echo ""
echo -e "${DIM}  Docs: https://github.com/doitdigital0495/claude-context-kit${RESET}"
echo ""
