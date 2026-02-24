#!/usr/bin/env python3
"""
SubagentStop hook: validates synthesis agent structured output.
Exit 0 = all required sections present
Exit 2 = missing sections (blocks stop, agent retries)
"""

import json
import sys

REQUIRED_SECTIONS = {
    "literature-reviewer": ["CONSENSUS", "FRONTIER", "KEY PAPERS"],
    "method-analyst": ["COMPARISON MATRIX", "RECOMMENDATION"],
    "implementation-guide": ["CORE ALGORITHM", "REFERENCE IMPLEMENTATIONS"],
}


def main():
    try:
        hook_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    agent_name = hook_input.get("agent_name", "")
    agent_output = hook_input.get("tool_output", "") or hook_input.get("output", "")

    if agent_name not in REQUIRED_SECTIONS:
        sys.exit(0)

    required = REQUIRED_SECTIONS[agent_name]
    missing = [section for section in required if f"## {section}" not in agent_output]

    if missing:
        msg = f"Agent '{agent_name}' output missing required sections: {', '.join(missing)}. Please include all required sections."
        print(msg, file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
