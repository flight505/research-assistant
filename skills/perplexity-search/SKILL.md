---
name: perplexity-search
description: Web-grounded SOTA discovery using Perplexity Sonar models via OpenRouter. Use when academic APIs return foundational papers but you need to know what's CURRENT — what has superseded older methods, what practitioners actually use today, and what was released in the last weeks/months.
user-invocable: false
---

## When to Use This vs Academic Skills

| Need | Use |
|------|-----|
| Structured paper metadata (citations, abstracts, code repos) | arxiv-search, semantic-scholar-search, hf-papers-search |
| What's **current SOTA** — what replaced older methods | **perplexity-search --sota** |
| What happened in the **last N days** | **perplexity-search --recent** |
| Practitioner adoption, blog posts, framework releases | **perplexity-search** |
| Whether a 2022 paper is still relevant or superseded | **perplexity-search --sota** |

**Key insight:** Citation count measures influence, not currency. A paper with 5000 citations from 2022 may be foundational but no longer SOTA. Perplexity provides the web-grounded context to distinguish "seminal" from "current best".

## Setup

Requires `OPENROUTER_API_KEY` environment variable. Get one at https://openrouter.ai/keys (pay-as-you-go, ~$0.002-0.005 per query with sonar-pro).

```bash
export OPENROUTER_API_KEY='sk-or-v1-...'
```

## Usage

```bash
# Locate the script
PPX=$(find ~/.claude/plugins -path "*/ai-frontier/skills/perplexity-search/scripts/search.mjs" 2>/dev/null | head -1)

# SOTA discovery — what's current best for a topic
node "$PPX" --sota "LLM agent reasoning frameworks beyond ReAct"

# Recent developments — what happened in last N days
node "$PPX" --recent "retrieval augmented generation" --days=30

# General web-grounded search
node "$PPX" "comparison of Tree-of-Thoughts vs ReAct vs LATS for agent planning"

# Use reasoning model for complex analysis
node "$PPX" --sota "efficient attention mechanisms" --model=sonar-reasoning-pro
```

## Models

| Model | Cost/query | Best for |
|-------|-----------|----------|
| `sonar` | ~$0.001 | Quick fact checks |
| `sonar-pro` (default) | ~$0.003 | SOTA discovery, general research |
| `sonar-reasoning` | ~$0.007 | Complex comparisons, tradeoff analysis |
| `sonar-reasoning-pro` | ~$0.010 | Deep technical analysis |

## Output

Returns unified JSON envelope compatible with other ai-frontier skills:

```json
{
  "success": true,
  "query": "...",
  "source": "perplexity",
  "result_count": 1,
  "results": [{
    "answer": "Synthesized web-grounded answer with dates and sources...",
    "citations": ["https://arxiv.org/...", "https://github.com/..."],
    "model": "sonar-pro"
  }],
  "meta": {
    "timestamp": "...",
    "api_version": "openrouter-perplexity-v1",
    "tokens_used": { "prompt_tokens": N, "completion_tokens": N }
  }
}
```

## Integration with Agents

Agents should use Perplexity **after** academic search, not instead of it:

1. Search arXiv + S2 + HF Papers → get papers with structured metadata
2. Call Perplexity `--sota` → get current SOTA context and supersession info
3. Merge: use Perplexity to annotate which papers are "foundational but superseded" vs "current SOTA"

The `--sota` mode automatically asks Perplexity to:
- Focus on the last 6 months
- Name what has superseded older approaches
- Include arxiv IDs and publication dates
- Distinguish "widely adopted" from "just published"

## Graceful Degradation

If `OPENROUTER_API_KEY` is not set, the script returns:
```json
{ "success": false, "error": "OPENROUTER_API_KEY not set...", "source": "perplexity" }
```

Agents should check `success` and continue with academic-only data if Perplexity is unavailable. This keeps the plugin functional without an API key.
