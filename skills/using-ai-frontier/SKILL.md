---
name: using-ai-frontier
description: AI frontier plugin — gives Claude and agents access to latest scientific research, SOTA discovery, and architecture evaluation. Use when needing SOTA methods, research consensus, implementation guidance, or evaluating whether a codebase uses optimal patterns and architectures.
keywords: [research, papers, SOTA, literature-review, methods, AI, machine-learning, foundation-models, architecture, evaluation, perplexity]
---

# AI Frontier

You have access to deep research intelligence via four data sources and four synthesis agents.

## Critical: Distinguishing Foundational from Current SOTA

Citation count measures influence, **not currency**. A paper with 5000 citations from 2022 may be foundational but no longer SOTA. Always consider:
- **Publication date** — papers < 6 months old are current; > 2 years old need SOTA validation
- **Supersession** — has a newer method replaced this? (e.g., ReAct 2022 → superseded by ToT, LATS, ReWOO)
- **Adoption signal** — GitHub stars, HF upvotes, framework integrations indicate real-world use

When unsure whether a method is still SOTA, use `perplexity-search --sota` to get web-grounded current status.

## Decision Tree

When you encounter these situations, use the appropriate tool:

### Need to evaluate architecture against SOTA
**Agent:** `architecture-evaluator`
**Triggers:** "Is this the right architecture?", "Evaluate my approach", "Are there better patterns for X?", "Review this against SOTA", "Is my architecture optimal?", "What patterns should I use for X?"
**Returns:** SCOPE, CURRENT ARCHITECTURE (with ASCII diagram), SOTA ALTERNATIVES, GAP ANALYSIS, RECOMMENDATIONS, REFERENCES

### Need to understand what the field knows
**Agent:** `literature-reviewer`
**Triggers:** "What's the SOTA for X?", "Survey of approaches to X", "What does the research say about X?"
**Returns:** DATA SOURCES, CONSENSUS, FRONTIER, OPEN QUESTIONS, KEY PAPERS, METHOD TAXONOMY, APPLICABILITY

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
| **Current SOTA / what replaced X** | `perplexity-search --sota` | **What replaced ReAct for agent reasoning?** |
| **Last N days developments** | `perplexity-search --recent` | **New RAG frameworks this month** |
| **Web-grounded fact check** | `perplexity-search` | **Is paper X still considered SOTA?** |

## When NOT to Use

- API docs, library usage, tutorials — use web search or documentation skills
- Common engineering knowledge — not a research question
- Debugging errors — use debugging tools

## Data Sources

### Free (no API key)
- **arXiv** — preprints with categories, dates, PDF links
- **Semantic Scholar** — citations, TLDRs, impact scores, venue info
- **HF Papers** — AI summaries, community upvotes, code repos, trending

### Requires OPENROUTER_API_KEY (~$0.003/query)
- **Perplexity** — web-grounded SOTA discovery, recent developments, practitioner adoption

All retrieval skills return a unified JSON envelope. Agents return structured markdown sections.

## Recommended Workflow for Research Questions

1. **Academic search** (arXiv + S2 + HF) → structured paper metadata
2. **SOTA validation** (Perplexity `--sota`) → what's current, what's superseded
3. **Synthesis** (agent) → merged analysis with both academic rigor and SOTA awareness

If Perplexity is unavailable (no API key), agents still work with academic data only — results will have citation-based ranking without web-grounded SOTA validation.
