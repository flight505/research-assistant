# ai-frontier — Developer Instructions

## Overview
Research intelligence plugin for Claude Code. Skills-first architecture with 3 free APIs, 4 synthesis agents, 2 validation hooks.

## Structure
- `skills/` — 5 skills (1 router + 3 academic retrieval + 1 web-grounded SOTA discovery)
- `agents/` — 4 synthesis agents (literature-reviewer, method-analyst, implementation-guide, architecture-evaluator)
- `hooks/` — hooks.json auto-discovered, 2 Python validators

## Key Rules
- **Academic APIs are free** — arXiv, Semantic Scholar, HF Papers need no API key
- **Perplexity requires OPENROUTER_API_KEY** — optional, ~$0.003/query for SOTA validation
- **hooks/hooks.json is auto-discovered** — never add "hooks" to plugin.json
- **Scripts use Node 18+ built-in fetch()** — zero npm dependencies
- **Output follows unified JSON envelope** — see design doc for schema

## Testing
```bash
# Test academic retrieval skills
node skills/arxiv-search/scripts/search.mjs "test query" 3
node skills/semantic-scholar-search/scripts/search.mjs "test query" 3
node skills/hf-papers-search/scripts/search.mjs "test query" 3

# Test Perplexity SOTA discovery (requires OPENROUTER_API_KEY)
node skills/perplexity-search/scripts/search.mjs --sota "transformer architecture"
node skills/perplexity-search/scripts/search.mjs --recent "LLM agents" --days=7

# Test hooks
echo '{"tool_result": "{\"success\": true, \"source\": \"arxiv\", \"results\": []}"}' | python3 hooks/validate-research-output.py
```

## Versioning
- Bump version in `.claude-plugin/plugin.json`
- Push to main — webhook auto-updates marketplace
