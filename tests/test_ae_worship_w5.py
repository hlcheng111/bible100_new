#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""W5 Sunday worship planning pipeline."""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CM = REPO / "church_ministry"


def main() -> int:
    errors: list[str] = []
    for j in ["js/ae_worship_sunday_plan.js", "js/ae_worship_plan_pipeline.js"]:
        fp = CM / j
        if not fp.is_file():
            errors.append("missing " + j)
            continue
        t = fp.read_text(encoding="utf-8", errors="replace")
        if "worship_sunday_plan_v1" not in t:
            errors.append(j + " missing plan key")
        if j.endswith("plan_pipeline.js") and "w5-pipeline" not in t:
            errors.append("pipeline UI missing")

    integrated = CM / "modules/worship/worship-integrated.html"
    if integrated.is_file():
        ti = integrated.read_text(encoding="utf-8", errors="replace")
        for needle in [
            "tab-plan",
            "worship-sunday-plan-host",
            "ae_worship_sunday_plan.js",
            "ae_worship_plan_pipeline.js",
            "主日策划",
        ]:
            if needle not in ti:
                errors.append("integrated missing " + needle)
    else:
        errors.append("missing worship-integrated.html")

    css = CM / "css/ae_worship_six_section.css"
    if css.is_file() and ".w5-pipeline" not in css.read_text(encoding="utf-8"):
        errors.append("css missing w5 pipeline styles")

    if errors:
        for e in errors:
            print("FAIL:", e)
        return 1
    print("OK: W5 sunday worship planning pipeline wired.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
