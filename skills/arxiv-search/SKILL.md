---
name: arxiv-search
description: Search arXiv for latest AI/ML preprints. Use when Claude needs bleeding-edge research not yet in peer-reviewed journals — newest methods, architectures, training techniques, benchmarks.
keywords: [arxiv, preprints, papers, research, machine-learning, deep-learning, AI, foundation-models]
---

# arXiv Search

Search arXiv preprints across AI/ML categories: cs.AI, cs.LG, cs.CL, cs.CV, stat.ML, cs.MA.

No API key required. Uses arXiv public API directly.

## Usage

Find the script path, then execute:

```bash
SCRIPT=$(find ~/.claude/plugins -path "*/ai-frontier/skills/arxiv-search/scripts/search.mjs" 2>/dev/null | head -1)
node "$SCRIPT" "your query" [maxResults] [--sort=date|relevance] [--cats=cs.AI,cs.LG]
```

## Arguments

| Arg | Default | Description |
|-----|---------|-------------|
| query | (required) | Natural language search query |
| maxResults | 10 | Number of results (1-100) |
| --sort=date | relevance | Sort by submission date or relevance |
| --cats=cs.AI,cs.LG | all 6 defaults | Comma-separated arXiv categories |

## When to Use

- Finding the newest preprints on a topic (use `--sort=date`)
- Searching for specific methods or architectures
- Getting abstracts and PDF links for deeper reading
- Checking if new work exists in a specific arXiv category

## Output Format

Returns JSON with unified envelope:
- `results[].title` — paper title
- `results[].authors` — author list
- `results[].abstract` — first 500 chars of abstract
- `results[].pdf_url` — direct PDF link
- `results[].source_specific.arxiv_id` — arXiv identifier
- `results[].source_specific.categories` — arXiv categories
- `results[].source_specific.published` — publication date

## Examples

```bash
# Latest papers on chain-of-thought reasoning
node "$SCRIPT" "chain-of-thought reasoning" 10 --sort=date

# Search specific category
node "$SCRIPT" "diffusion models" 5 --cats=cs.CV

# Broad AI safety search
node "$SCRIPT" "AI alignment safety" 20
```
