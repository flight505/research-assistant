#!/usr/bin/env python3
"""
SubagentStop hook: validates synthesis agent structured output.
Exit 0 = all required sections present
Exit 2 = missing sections (blocks stop, agent retries)
"""

import json
import sys

REQUIRED_SECTIONS = {
    "literature-reviewer": ["DATA SOURCES", "CONSENSUS", "FRONTIER", "KEY PAPERS"],
    "method-analyst": ["COMPARISON MATRIX", "RECOMMENDATION"],
    "implementation-guide": ["CORE ALGORITHM", "REFERENCE IMPLEMENTATIONS"],
    "architecture-evaluator": ["CURRENT ARCHITECTURE", "GAP ANALYSIS", "RECOMMENDATIONS"],
}


def section_present(section_name, text):
    """Check for section heading at any markdown heading level (##, ###, ####)."""
    return f"## {section_name}" in text or f"### {section_name}" in text or f"#### {section_name}" in text


def main():
    try:
        hook_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    # Prevent infinite retry loops when hook is already active
    if hook_input.get("stop_hook_active", False):
        sys.exit(0)

    raw_agent_name = hook_input.get("agent_type", "")
    # Strip plugin prefix (e.g., "ai-frontier:literature-reviewer" → "literature-reviewer")
    agent_name = raw_agent_name.split(":")[-1] if ":" in raw_agent_name else raw_agent_name
    agent_output = hook_input.get("last_assistant_message", "")

    if agent_name not in REQUIRED_SECTIONS:
        sys.exit(0)

    required = REQUIRED_SECTIONS[agent_name]
    missing = [section for section in required if not section_present(section, agent_output)]

    if missing:
        msg = f"Agent '{agent_name}' output missing required sections: {', '.join(missing)}. Please include all required sections."
        print(msg, file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
