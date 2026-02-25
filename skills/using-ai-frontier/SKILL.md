---
name: using-ai-frontier
description: AI frontier plugin — gives Claude and agents access to latest scientific research and architecture evaluation. Use when needing SOTA methods, research consensus, implementation guidance, or evaluating whether a codebase uses optimal patterns and architectures.
keywords: [research, papers, SOTA, literature-review, methods, AI, machine-learning, foundation-models, architecture, evaluation]
---

# AI Frontier

You have access to deep research intelligence via three data sources and four synthesis agents. No API keys required.

## Decision Tree

When you encounter these situations, use the appropriate tool:

### Need to evaluate architecture against SOTA
**Agent:** `architecture-evaluator`
**Triggers:** "Is this the right architecture?", "Evaluate my approach", "Are there better patterns for X?", "Review this against SOTA", "Is my architecture optimal?", "What patterns should I use for X?"
**Returns:** SCOPE, CURRENT ARCHITECTURE (with ASCII diagram), SOTA ALTERNATIVES, GAP ANALYSIS, RECOMMENDATIONS, REFERENCES

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
