#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P2 · 殼/config 驗收 + planning hub data-b100-module 標記。

Run: python tests/test_p2_shell_and_tags.py
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "config" / "module_manifest.json"

SHELL_SUBTESTS = (
    "tests/test_index_v5_shell.py",
    "tests/test_config_embedded_sync.py",
    "tests/test_module_manifest_p0.py",
)

CP_HUB_PAGES: tuple[tuple[str, str], ...] = (
    ("church_planning/index_plan.html", 'data-b100-module="church_planning"'),
    ("church_planning/dashboard.html", 'data-b100-module="church_planning"'),
    ("church_planning/assessment-os-hub.html", 'data-b100-module="church_planning"'),
    ("church_planning/cta-os-war-room.html", 'data-b100-module="church_planning"'),
    ("church_planning/cta-os-tool-report.html", 'data-b100-module="church_planning"'),
)

P2_DOCS = (
    "docs/governance/MODULE_ROOT_DISCIPLINE.md",
    "docs/modules/shell/README.md",
    ".cursor/rules/bible100-module-root-discipline.mdc",
)


def run_py(rel: str) -> tuple[bool, str]:
    proc = subprocess.run(
        [sys.executable, str(REPO / rel)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode == 0:
        line = (proc.stdout or "").strip().splitlines()
        return True, line[-1] if line else "OK"
    err = (proc.stderr or proc.stdout or "").strip()
    return False, err.splitlines()[-1] if err else "fail"


def main() -> int:
    errors: list[str] = []

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    waves = {w.get("wave"): w for w in data.get("cleanupWaves", [])}
    w1 = waves.get(1)
    if not w1:
        errors.append("cleanupWaves missing wave 1 (shell/config)")
    elif w1.get("status") != "completed":
        errors.append(f"cleanupWaves[1] should be completed for P2, got {w1.get('status')!r}")

    shell_doc = REPO / "docs" / "modules" / "shell" / "README.md"
    if not shell_doc.is_file():
        errors.append("missing docs/modules/shell/README.md")

    for rel in P2_DOCS:
        if not (REPO / rel).is_file():
            errors.append(f"missing P2 doc/rule: {rel}")

    cp = next((m for m in data.get("modules", []) if m.get("id") == "church_planning"), None)
    if cp:
        forbidden = (cp.get("rootLayout") or {}).get("forbiddenRootDirs") or []
        if not forbidden:
            errors.append("church_planning.rootLayout.forbiddenRootDirs missing")
        tests = cp.get("tests") or []
        if "tests/test_module_root_discipline.py" not in tests:
            errors.append("church_planning.tests must include test_module_root_discipline.py")

    for rel, needle in CP_HUB_PAGES:
        p = REPO / rel
        if not p.is_file():
            errors.append(f"missing hub page {rel}")
            continue
        if needle not in p.read_text(encoding="utf-8"):
            errors.append(f"{rel} missing {needle}")

    for rel in SHELL_SUBTESTS:
        ok, detail = run_py(rel)
        if not ok:
            errors.append(f"{rel}: {detail}")

    ok, detail = run_py("tests/test_module_root_discipline.py")
    if not ok:
        errors.append(f"module root discipline: {detail}")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        print(f"FAIL: P2 shell and tags ({len(errors)} issues)", file=sys.stderr)
        return 1

    print("OK: P2 — shell/config tests green, hub data-b100-module tagged, root discipline OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
