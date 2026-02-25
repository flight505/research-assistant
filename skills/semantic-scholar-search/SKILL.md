---
name: semantic-scholar-search
description: Search Semantic Scholar for papers with rich metadata — citation counts, AI-generated TLDRs, influence scores, citation graphs. Use for finding established research, tracing citation chains, understanding paper impact and field structure.
keywords: [semantic-scholar, citations, papers, research, tldr, impact, academic, literature]
---

# Semantic Scholar Search

Search 200M+ papers with rich metadata. No API key required (100 req/sec).

Two modes:
1. **Search** — find papers by query
2. **Detail** — get deep info on a specific paper (references, citations)

## Usage

```bash
SCRIPT=$(find ~/.claude/plugins -path "*/ai-frontier/skills/semantic-scholar-search/scripts/search.mjs" 2>/dev/null | head -1)

# Search mode
node "$SCRIPT" "your query" [maxResults] [--year=2024] [--open-access]

# Detail mode (get paper + citations + references)
node "$SCRIPT" --detail=<s2PaperId|DOI|ArXiv:id>
```

## Arguments

| Arg | Default | Description |
|-----|---------|-------------|
| query | (required) | Natural language search query |
| maxResults | 10 | Number of results (1-100) |
| --year=YYYY | none | Only papers from YYYY onward |
| --open-access | false | Only papers with free PDF |
| --detail=ID | n/a | Get full details for a specific paper |

## When to Use

- Finding papers with citation context (how influential, who cites it)
- Getting AI-generated TLDRs for quick understanding
- Tracing citation chains (what a paper builds on, what builds on it)
- Filtering by year to find recent work
- Finding open access PDFs for deeper reading

## Key Fields

- `results[].tldr` — AI-generated one-sentence summary (from S2)
- `results[].citations` — total citation count
- `results[].source_specific.influential_citations` — citations from influential papers
- `results[].source_specific.fields_of_study` — e.g., ["Computer Science", "Mathematics"]
- Detail mode: `paper.top_references` and `paper.recent_citations` for citation graph

## Examples

```bash
# Find influential papers on RLHF
node "$SCRIPT" "reinforcement learning from human feedback" 10

# Recent papers only (2025+)
node "$SCRIPT" "mixture of experts scaling" 15 --year=2025

# Get details + citation graph for a specific paper
node "$SCRIPT" --detail=ArXiv:2210.11416
```
