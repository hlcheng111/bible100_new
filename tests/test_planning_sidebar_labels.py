"""SSOT: planning_sidebar_labels.js covers all 18 canonical tools."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABELS_JS = ROOT / "church_planning" / "js" / "planning_sidebar_labels.js"
REGISTRY_JS = ROOT / "church_planning" / "js" / "planning_tool_registry.js"


def canonical_ids(registry_text: str) -> list[str]:
    ids: list[str] = []
    for m in re.finditer(r'\{\s*id:\s*"([^"]+)"', registry_text):
        ids.append(m.group(1))
    # stop at EXTENDED block
    ext = registry_text.find("var EXTENDED")
    if ext > 0:
        ids = [i for i in ids if registry_text.find(f'id: "{i}"') < ext]
    return ids


def sidebar_keys(labels_text: str) -> set[str]:
    block = labels_text.split("var SIDEBAR = {", 1)[-1].split("};", 1)[0]
    return set(re.findall(r"\n\s+(\w+):\s*\{", block))


def main() -> int:
    errors: list[str] = []
    reg = REGISTRY_JS.read_text(encoding="utf-8")
    lab = LABELS_JS.read_text(encoding="utf-8")
    ids = canonical_ids(reg)
    keys = sidebar_keys(lab)
    for tid in ids:
        if tid not in keys:
            errors.append(f"missing SIDEBAR entry: {tid}")
    for tid in keys:
        if tid not in ids:
            errors.append(f"orphan SIDEBAR entry: {tid}")
    if "main:" not in lab or "en:" not in lab:
        errors.append("SIDEBAR must use main + en fields")
    if errors:
        print("FAIL planning sidebar labels:")
        for e in errors:
            print(" ", e)
        return 1
    print(f"OK planning sidebar labels: {len(ids)} canonical tools")
    return 0


if __name__ == "__main__":
    sys.exit(main())
