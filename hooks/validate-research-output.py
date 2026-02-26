#!/usr/bin/env python3
"""
PostToolUse hook: validates ai-frontier research JSON output from Bash calls.
Exit 0 = valid research output OR not research output (pass-through)
Exit 2 = malformed research output (blocks, Claude sees error)
"""

import json
import sys


def main():
    try:
        hook_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tool_output = hook_input.get("tool_result", "")
    if not tool_output:
        sys.exit(0)

    if '"source"' not in tool_output:
        sys.exit(0)

    valid_sources = ["arxiv", "semantic_scholar", "hf_papers", "perplexity"]
    is_research = False
    for src in valid_sources:
        if f'"source": "{src}"' in tool_output or f'"source":"{src}"' in tool_output:
            is_research = True
            break

    if not is_research:
        sys.exit(0)

    try:
        data = json.loads(tool_output)
    except json.JSONDecodeError:
        print("Research output is malformed JSON", file=sys.stderr)
        sys.exit(2)

    if not isinstance(data, dict):
        print("Research output must be a JSON object", file=sys.stderr)
        sys.exit(2)

    if "success" not in data:
        print("Research output missing 'success' field", file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
