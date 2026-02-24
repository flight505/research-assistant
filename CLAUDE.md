# research-assistant — Developer Instructions

## Overview
Research intelligence plugin for Claude Code. Skills-first architecture with 3 free APIs, 3 synthesis agents, 2 validation hooks.

## Structure
- `skills/` — 4 skills (1 router + 3 retrieval with Node.js scripts)
- `agents/` — 3 synthesis agents (literature-reviewer, method-analyst, implementation-guide)
- `hooks/` — hooks.json auto-discovered, 2 Python validators

## Key Rules
- **No API keys required** — all APIs are free
- **hooks/hooks.json is auto-discovered** — never add "hooks" to plugin.json
- **Scripts use Node 18+ built-in fetch()** — zero dependencies
- **Output follows unified JSON envelope** — see design doc for schema

## Testing
```bash
# Test retrieval skills
node skills/arxiv-search/scripts/search.mjs "test query" 3
node skills/semantic-scholar-search/scripts/search.mjs "test query" 3
node skills/hf-papers-search/scripts/search.mjs "test query" 3

# Test hooks
echo '{"tool_output": "{\"success\": true, \"source\": \"arxiv\", \"results\": []}"}' | python3 hooks/validate-research-output.py
```

## Versioning
- Bump version in `.claude-plugin/plugin.json`
- Push to main — webhook auto-updates marketplace
