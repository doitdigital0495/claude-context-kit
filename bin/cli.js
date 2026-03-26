#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ── Colors (ANSI) ───────────────────────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

const MARKER = "<!-- claude-context-kit -->";

// ── Paths ───────────────────────────────────────────────────────────────────
const templatesDir = path.join(__dirname, "..", "templates");
const projectDir = process.cwd();
const projectRulesDir = path.join(projectDir, ".claude", "rules");
const projectSkillDir = path.join(projectDir, ".claude", "skills", "context-audit");

// ── Helpers ─────────────────────────────────────────────────────────────────
function logo() {
  console.log();
  console.log(`${c.cyan}${c.bold}  claude-context-kit${c.reset}`);
  console.log(`${c.dim}  Stop burning through your Claude Code usage limits${c.reset}`);
  console.log();
}

function ok(msg) { console.log(`  ${c.green}+${c.reset} ${msg}`); }
function skip(msg) { console.log(`  ${c.yellow}-${c.reset} ${c.dim}${msg}${c.reset}`); }
function info(msg) { console.log(`  ${c.blue}i${c.reset} ${msg}`); }
function warn(msg) { console.log(`  ${c.yellow}!${c.reset} ${msg}`); }
function err(msg) { console.log(`  ${c.red}x${c.reset} ${msg}`); }

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readTemplate(name) {
  return fs.readFileSync(path.join(templatesDir, name), "utf-8");
}

function fileExists(p) {
  return fs.existsSync(p);
}

/**
 * Detect where CLAUDE.md lives in this project.
 * Returns the path to the existing file, or the best default location.
 */
function detectClaudeMdPath() {
  const rootPath = path.join(projectDir, "CLAUDE.md");
  const dotClaudePath = path.join(projectDir, ".claude", "CLAUDE.md");

  // Prefer whichever already exists
  if (fileExists(dotClaudePath)) return dotClaudePath;
  if (fileExists(rootPath)) return rootPath;

  // Default: project root (most common convention)
  return rootPath;
}

// ── Interactive prompt ──────────────────────────────────────────────────────
function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function confirm(rl, question) {
  const answer = await ask(rl, `  ${c.cyan}?${c.reset} ${question} ${c.dim}(Y/n)${c.reset} `);
  return answer === "" || answer.toLowerCase().startsWith("y");
}

// ── Install functions ───────────────────────────────────────────────────────
function installClaudeignore() {
  const dest = path.join(projectDir, ".claudeignore");
  if (fileExists(dest)) {
    skip(".claudeignore already exists — skipping (won't overwrite)");
    return false;
  }
  fs.writeFileSync(dest, readTemplate("claudeignore"));
  ok(".claudeignore created — build artifacts, binaries, and lock files now excluded");
  return true;
}

function installClaudeMdSnippet() {
  const dest = detectClaudeMdPath();
  const snippet = readTemplate("claude-md-snippet.md");
  const relativeDest = path.relative(projectDir, dest);

  if (fileExists(dest)) {
    const existing = fs.readFileSync(dest, "utf-8");
    if (existing.includes("## Context Management") || existing.includes(MARKER)) {
      skip(`${relativeDest} already has context management section — skipping`);
      return false;
    }
    fs.writeFileSync(dest, existing + "\n\n" + MARKER + "\n" + snippet);
    ok(`Context management rules appended to existing ${relativeDest}`);
  } else {
    ensureDir(path.dirname(dest));
    fs.writeFileSync(dest, MARKER + "\n" + snippet);
    ok(`${relativeDest} created with context management rules`);
  }
  return true;
}

function installRules() {
  ensureDir(projectRulesDir);
  const dest = path.join(projectRulesDir, "context-discipline.md");
  if (fileExists(dest)) {
    skip(".claude/rules/context-discipline.md already exists — skipping");
    return false;
  }
  fs.writeFileSync(dest, readTemplate(path.join("rules", "context-discipline.md")));
  ok("Rules installed at .claude/rules/context-discipline.md");
  return true;
}

function installSkill() {
  ensureDir(projectSkillDir);
  const skillDest = path.join(projectSkillDir, "SKILL.md");
  const workflowDest = path.join(projectSkillDir, "workflow.md");

  if (fileExists(skillDest)) {
    skip(".claude/skills/context-audit/ already exists — skipping");
    return false;
  }
  fs.writeFileSync(skillDest, readTemplate(path.join("skill", "SKILL.md")));
  fs.writeFileSync(workflowDest, readTemplate(path.join("skill", "workflow.md")));
  ok("Context-audit skill installed at .claude/skills/context-audit/");
  return true;
}

// ── Summary ─────────────────────────────────────────────────────────────────
function summary(installed) {
  console.log();
  console.log(`${c.bold}  What was installed:${c.reset}`);
  console.log();

  if (installed.claudeignore)
    console.log(`  ${c.green}1.${c.reset} ${c.bold}.claudeignore${c.reset} — excludes junk files from context scanning`);
  if (installed.claudemd)
    console.log(`  ${c.green}2.${c.reset} ${c.bold}CLAUDE.md rules${c.reset} — enforces file read discipline, compaction triggers, model selection`);
  if (installed.rules)
    console.log(`  ${c.green}3.${c.reset} ${c.bold}Project rules${c.reset} — context discipline loaded in sessions for this project`);
  if (installed.skill)
    console.log(`  ${c.green}4.${c.reset} ${c.bold}context-audit skill${c.reset} — run /context-audit to diagnose token bloat`);

  const count = Object.values(installed).filter(Boolean).length;
  if (count === 0) {
    console.log(`  ${c.dim}Nothing new installed — everything was already in place.${c.reset}`);
  }

  console.log();
  console.log(`${c.bold}  Quick wins you can do right now:${c.reset}`);
  console.log();
  console.log(`  ${c.cyan}1.${c.reset} Run ${c.bold}/compact${c.reset} to free up context in your current session`);
  console.log(`  ${c.cyan}2.${c.reset} Run ${c.bold}/context${c.reset} to see your context usage`);
  console.log(`  ${c.cyan}3.${c.reset} Disable unused MCP servers with ${c.bold}/mcp${c.reset}`);
  console.log();
  console.log(`${c.dim}  All files installed inside this project — nothing touches ~/.claude${c.reset}`);
  console.log(`${c.dim}  Docs: https://github.com/doitdigital0495/claude-context-kit${c.reset}`);
  console.log();
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  logo();

  const isAllFlag = process.argv.includes("--all") || process.argv.includes("-a");
  const isYesFlag = process.argv.includes("--yes") || process.argv.includes("-y");
  const nonInteractive = isAllFlag || isYesFlag;

  // Detect project
  const hasGit = fileExists(path.join(projectDir, ".git"));
  const hasPkg = fileExists(path.join(projectDir, "package.json"));
  const hasClaudeMdRoot = fileExists(path.join(projectDir, "CLAUDE.md"));
  const hasClaudeMdDot = fileExists(path.join(projectDir, ".claude", "CLAUDE.md"));

  if (!hasGit && !hasPkg && !hasClaudeMdRoot && !hasClaudeMdDot) {
    warn("No .git, package.json, or CLAUDE.md found in current directory.");
    warn("Are you in a project root?");
    console.log();

    if (!nonInteractive) {
      const rl = createRL();
      const proceed = await confirm(rl, "Continue anyway?");
      rl.close();
      if (!proceed) {
        console.log(`  ${c.dim}Run this command from your project root.${c.reset}`);
        console.log();
        process.exit(0);
      }
    }
  } else {
    info(`Project detected: ${c.bold}${path.basename(projectDir)}${c.reset}`);
    if (hasClaudeMdDot) {
      info(`CLAUDE.md location: ${c.bold}.claude/CLAUDE.md${c.reset}`);
    }
  }

  console.log();

  const installed = {
    claudeignore: false,
    claudemd: false,
    rules: false,
    skill: false,
  };

  if (nonInteractive) {
    // Non-interactive: install everything
    console.log(`${c.bold}  Installing all components...${c.reset}`);
    console.log();
    installed.claudeignore = installClaudeignore();
    installed.claudemd = installClaudeMdSnippet();
    installed.rules = installRules();
    installed.skill = installSkill();
  } else {
    // Interactive: ask for each component
    const rl = createRL();

    console.log(`${c.bold}  Select components to install:${c.reset}`);
    console.log();

    if (await confirm(rl, `${c.bold}.claudeignore${c.reset} — block junk files from context scanning?`))
      installed.claudeignore = installClaudeignore();
    else skip(".claudeignore — skipped by user");

    if (await confirm(rl, `${c.bold}CLAUDE.md rules${c.reset} — add context management instructions?`))
      installed.claudemd = installClaudeMdSnippet();
    else skip("CLAUDE.md rules — skipped by user");

    if (await confirm(rl, `${c.bold}Project rules${c.reset} — add context discipline to .claude/rules/?`))
      installed.rules = installRules();
    else skip("Project rules — skipped by user");

    if (await confirm(rl, `${c.bold}context-audit skill${c.reset} — add /context-audit diagnostic skill?`))
      installed.skill = installSkill();
    else skip("context-audit skill — skipped by user");

    rl.close();
  }

  summary(installed);
}

main().catch((e) => {
  err(e.message);
  process.exit(1);
});
