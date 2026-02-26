# ai-frontier — Developer Instructions

## Overview
Research intelligence plugin for Claude Code. Gives Claude and agents access to latest scientific research, SOTA discovery, and architecture evaluation via 4 data sources and 4 synthesis agents.

**Version:** 1.1.0
**Repository:** https://github.com/flight505/ai-frontier

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Router Skill (using-ai-frontier)                        │
│  Decision tree → agent OR direct skill invocation        │
├──────────────┬───────────────────────────────────────────┤
│  Agents      │  Retrieval Skills                         │
│  (subagents) │  (Node.js scripts, unified JSON envelope) │
│              │                                           │
│  literature- │  arxiv-search ──▶ arXiv Atom API (free)   │
│   reviewer   │  semantic-scholar-search ──▶ S2 API (free)│
│  method-     │  hf-papers-search ──▶ HF Papers API (free│
│   analyst    │  perplexity-search ──▶ OpenRouter ($0.003)│
│  implementa- │                                           │
│   tion-guide │  Agents call these via bash:               │
│  architectu- │  node "$SCRIPT" "<query>" N               │
│   re-evaluat-│                                           │
│   or         │                                           │
├──────────────┴───────────────────────────────────────────┤
│  Hooks (auto-discovered via hooks/hooks.json)            │
│  PostToolUse:Bash → validate-research-output.py          │
│  SubagentStop → validate-synthesis-output.py             │
└──────────────────────────────────────────────────────────┘
```

## File Structure
```
ai-frontier/
├── .claude-plugin/plugin.json    — manifest (version, skills, agents)
├── CLAUDE.md                     — this file
├── skills/
│   ├── using-ai-frontier/        — router skill (decision tree)
│   ├── arxiv-search/             — SKILL.md + scripts/search.mjs + scripts/search
│   ├── semantic-scholar-search/  — SKILL.md + scripts/search.mjs + scripts/search
│   ├── hf-papers-search/        — SKILL.md + scripts/search.mjs + scripts/search
│   └── perplexity-search/       — SKILL.md + scripts/search.mjs + scripts/search
├── agents/
│   ├── literature-reviewer.md    — field survey with SOTA-aware ranking
│   ├── method-analyst.md         — head-to-head method comparison
│   ├── implementation-guide.md   — paper → actionable code guidance
│   └── architecture-evaluator.md — codebase vs SOTA gap analysis
└── hooks/
    ├── hooks.json                — event bindings (auto-discovered)
    ├── validate-research-output.py  — PostToolUse:Bash validator
    └── validate-synthesis-output.py — SubagentStop validator
```

## Key Rules

- **Academic APIs are free** — arXiv, Semantic Scholar, HF Papers need no API key
- **Perplexity requires OPENROUTER_API_KEY** — optional, ~$0.003/query for web-grounded SOTA validation
- **hooks/hooks.json is auto-discovered** — NEVER add `"hooks"` to plugin.json
- **Scripts use Node 18+ built-in fetch()** — zero npm dependencies
- **Output follows unified JSON envelope** — `{success, query, source, result_count, results[], meta}`

## Data Sources

| Source | API Key | Returns | Cost |
|--------|---------|---------|------|
| arXiv | None | Preprints, categories, dates, PDF links | Free |
| Semantic Scholar | None (optional S2_API_KEY) | Citations, TLDRs, impact scores, venues | Free |
| HF Papers | None | AI summaries, upvotes, code repos, trending | Free |
| Perplexity | OPENROUTER_API_KEY | Web-grounded SOTA status, recent developments | ~$0.003/query |

## Agent Specs (v2 — all agents share these patterns)

All 4 agents follow a consistent structure:

1. **Step 1 — Locate scripts** via `find ~/.claude/plugins -path "*/ai-frontier/skills/..."`
2. **Step 2 — Search all 3 academic sources** with multiple queries per source
3. **Step 3 — Perplexity SOTA validation** (REQUIRED when `$PPX` is not empty)
4. **Step 4+ — Merge, rank, synthesize** with SOTA awareness

### Required output sections (hook-enforced)

| Agent | Hook-enforced sections |
|-------|----------------------|
| literature-reviewer | DATA SOURCES, CONSENSUS, FRONTIER, KEY PAPERS |
| method-analyst | DATA SOURCES, COMPARISON MATRIX, RECOMMENDATION |
| implementation-guide | DATA SOURCES, CORE ALGORITHM, REFERENCE IMPLEMENTATIONS |
| architecture-evaluator | DATA SOURCES, CURRENT ARCHITECTURE, GAP ANALYSIS, RECOMMENDATIONS |

DATA SOURCES is required for ALL agents — it reports which APIs succeeded/failed.

### SOTA status labels (required on papers/methods)

- `CURRENT SOTA` — best known approach as of now
- `foundational` — seminal but outperformed by newer methods
- `superseded by [X]` — explicitly name replacement
- `emerging` — last 3 months, not yet widely validated

### Key principle: citation count ≠ SOTA

High citations indicate influence, not currency. A 2022 paper with 5000 citations may be foundational but superseded. Agents use:
- **Perplexity SOTA context** (highest signal)
- **Citation velocity** (citations/year, not raw count)
- **Recency** (papers < 6 months boosted, > 2 years need justification)
- **Adoption signals** (GitHub stars, HF upvotes, framework integrations)

## Hooks

### validate-research-output.py (PostToolUse:Bash)
- Fires on every Bash tool call
- **Exit 0** = pass-through (non-research output) OR valid research JSON
- **Exit 2** = malformed research output (blocks, Claude sees error)
- Checks: valid JSON, is a dict, has `success` field, source is one of `[arxiv, semantic_scholar, hf_papers, perplexity]`
- Important: ALL non-research output exits 0 (not 1) — any non-zero exit triggers hook errors

### validate-synthesis-output.py (SubagentStop)
- Fires when any ai-frontier agent tries to stop
- Strips plugin prefix (`ai-frontier:literature-reviewer` → `literature-reviewer`)
- Checks required sections at `##`, `###`, or `####` heading levels
- Has `stop_hook_active` guard to prevent infinite retry loops
- **Exit 0** = all required sections present
- **Exit 2** = missing sections (blocks stop, agent retries)

## Testing

### Quick manual tests
```bash
# Academic retrieval
node skills/arxiv-search/scripts/search.mjs "test query" 3
node skills/semantic-scholar-search/scripts/search.mjs "test query" 3
node skills/hf-papers-search/scripts/search.mjs "test query" 3

# Perplexity (requires OPENROUTER_API_KEY)
node skills/perplexity-search/scripts/search.mjs --sota "transformer architecture"
node skills/perplexity-search/scripts/search.mjs --recent "LLM agents" --days=7

# Hook validators
echo '{"tool_result": "{\"success\": true, \"source\": \"arxiv\", \"results\": []}"}' | python3 hooks/validate-research-output.py; echo "exit: $?"
```

### Automated test suite (147 tests)
```bash
# From marketplace root:
bash test-results/ai-frontier/run-tests.sh          # run all tests
bash test-results/ai-frontier/run-tests.sh --save    # run + save to test-history.jsonl
```

Test suite covers: file structure, manifest validation, hooks config, API retrieval, JSON envelope schema, hook validator logic, agent spec quality, skill quality, special features (category filter, sort, trending, --sota, --recent).

## Cache Sync

The plugin runs from TWO cached paths (not the source):
- `~/.claude/plugins/cache/flight505-plugins/ai-frontier/<version>/`
- `~/.claude/plugins/marketplaces/flight505-plugins/ai-frontier/`

**After editing source files, BOTH caches must be synced** for changes to take effect in the current session. A version bump + push triggers a proper cache refresh for all users.

```bash
# Manual cache sync (development only):
SOURCE="$(pwd)"
MKT="$HOME/.claude/plugins/marketplaces/flight505-plugins/ai-frontier"
CACHE="$HOME/.claude/plugins/cache/flight505-plugins/ai-frontier/$(jq -r .version .claude-plugin/plugin.json)"

for DEST in "$MKT" "$CACHE"; do
  cp "$SOURCE/hooks/"*.py "$DEST/hooks/"
  cp "$SOURCE/agents/"*.md "$DEST/agents/"
  cp -r "$SOURCE/skills/" "$DEST/skills/"
done
```

## Versioning
- Bump version in `.claude-plugin/plugin.json`
- Push to main — webhook auto-updates marketplace within ~30 seconds
- Version bump refreshes user caches (proper fix for cache drift)
