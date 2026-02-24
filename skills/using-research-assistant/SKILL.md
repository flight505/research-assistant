---
name: using-research-assistant
description: Research assistant plugin — gives Claude and agents access to latest scientific research across arXiv, Semantic Scholar, and Hugging Face Papers. Use when needing SOTA methods, research consensus, or implementation guidance from academic literature.
keywords: [research, papers, SOTA, literature-review, methods, AI, machine-learning, foundation-models]
---

# Research Assistant

You have access to deep research intelligence via three data sources and three synthesis agents. No API keys required.

## Decision Tree

When you encounter these situations, use the appropriate tool:

### Need to understand what the field knows
**Agent:** `literature-reviewer`
**Triggers:** "What's the SOTA for X?", "Survey of approaches to X", "What does the research say about X?"
**Returns:** CONSENSUS, FRONTIER, OPEN QUESTIONS, KEY PAPERS, METHOD TAXONOMY

### Need to choose between approaches
**Agent:** `method-analyst`
**Triggers:** "Should I use X or Y?", "Compare methods for Z", "Tradeoffs between approaches"
**Returns:** COMPARISON MATRIX, RECOMMENDATION, IMPLEMENTATION NOTES

### Need to implement a research method
**Agent:** `implementation-guide`
**Triggers:** "How to implement X from paper Y?", "Code for method Z", "Architecture of approach X"
**Returns:** CORE ALGORITHM, ARCHITECTURE, REFERENCE IMPLEMENTATIONS, ADAPTATION GUIDE

### Quick lookups (skip agents, use skills directly)

| Need | Skill | Example |
|------|-------|---------|
| Bleeding-edge preprints | `arxiv-search` | Latest papers on speculative decoding |
| Citations + TLDRs + impact | `semantic-scholar-search` | How influential is paper X? |
| AI summaries + trending | `hf-papers-search` | Trending papers, AI-extracted keywords |

## When NOT to Use

- API docs, library usage, tutorials — use web search or documentation skills
- Common engineering knowledge — not a research question
- Debugging errors — use debugging tools
- Recent news or announcements — use perplexity

## How Skills Return Data

All retrieval skills return a unified JSON envelope with:
- `results[].title`, `authors`, `year`, `abstract`, `tldr`
- `results[].pdf_url`, `url`, `citations`
- `results[].code_repos` — GitHub repos with stars and framework
- `results[].key_methods` — extracted method names

Agents return structured markdown sections optimized for reasoning.
