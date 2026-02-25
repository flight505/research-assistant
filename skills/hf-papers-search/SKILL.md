---
name: hf-papers-search
description: Search Hugging Face Papers for AI/ML research with AI-generated summaries, keywords, community upvotes, and trending papers. Use when Claude needs community-curated research, AI-generated paper summaries, or trending ML papers.
keywords: [huggingface, papers, research, trending, ai-summary, ai-keywords, machine-learning, community]
---

# Hugging Face Papers Search

Search HF Papers for AI/ML research with AI-generated summaries and keywords. No API key required.

Three modes:
1. **Search** — find papers by query
2. **Trending** — get today's trending papers from HF Daily Papers
3. **Detail** — get full info on a specific paper by arXiv ID

## Usage

```bash
SCRIPT=$(find ~/.claude/plugins -path "*/ai-frontier/skills/hf-papers-search/scripts/search.mjs" 2>/dev/null | head -1)

# Search mode
node "$SCRIPT" "your query" [maxResults]

# Trending papers
node "$SCRIPT" --trending [maxResults]

# Paper detail by arXiv ID
node "$SCRIPT" --detail=<arxivId>
```

## When to Use

- Finding papers with AI-generated summaries (tldr) and keywords
- Browsing trending ML papers (community-curated via upvotes)
- Getting AI-extracted keywords for a paper (maps to key methods)
- Discovering papers from specific organizations (Google, Meta, etc.)
- Finding papers that have associated GitHub repos

## Key Fields

- `results[].tldr` — AI-generated one-sentence summary (from HF)
- `results[].key_methods` — AI-extracted keywords/methods
- `results[].source_specific.upvotes` — community upvote count
- `results[].code_repos` — GitHub repos when available
- `results[].source_specific.organization` — authoring organization

## Examples

```bash
# Search for papers on LoRA
node "$SCRIPT" "low-rank adaptation LoRA" 10

# Get today's trending papers
node "$SCRIPT" --trending 15

# Get details on a specific paper
node "$SCRIPT" --detail=2106.09685
```
