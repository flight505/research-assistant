# CONTEXT: ai-frontier

## Architecture
Skills-first plugin. No MCP server (avoids 5k+ idle context tokens).

### Retrieval Layer
| Skill | API | Key Feature |
|-------|-----|-------------|
| arxiv-search | arXiv Atom API | Bleeding-edge preprints, sort by date |
| semantic-scholar-search | S2 Graph API | TLDRs, citation graphs, influence |
| hf-papers-search | HF Papers API | AI summaries, keywords, trending |

All return unified JSON envelope. Zero API keys.

### Synthesis Layer
| Agent | Trigger | Output |
|-------|---------|--------|
| architecture-evaluator | "Is this optimal?" | CURRENT ARCHITECTURE, GAP ANALYSIS, RECOMMENDATIONS |
| literature-reviewer | "What's the SOTA?" | CONSENSUS, FRONTIER, KEY PAPERS |
| method-analyst | "Which method?" | COMPARISON MATRIX, RECOMMENDATION |
| implementation-guide | "How to implement?" | CORE ALGORITHM, REFERENCE IMPLEMENTATIONS |

### Validation Layer
- PostToolUse hook validates research JSON from Bash
- SubagentStop hook ensures agents produce required sections

## Data Flow
```
User/Agent question
    |
using-ai-frontier (routing skill)
    | routes to
Agent OR direct skill invocation
    |
Agent runs retrieval skills via Bash
    |
PostToolUse hook validates JSON
    |
Agent synthesizes structured output
    |
SubagentStop hook validates sections
    |
Structured knowledge returned to caller
```

## Design Decisions
1. **Skills over MCP** — context efficiency, Anthropic's recommended approach
2. **Unified JSON envelope** — agents consume any source interchangeably
3. **Agent synthesis** — the value is understanding, not just search
4. **LLM-optimized output** — structured sections, not prose
5. **Free APIs only** — zero friction, no setup required
