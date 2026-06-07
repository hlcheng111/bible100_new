#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""pastoral-spiritual-survey-pro.html P1：交叉風險規則與 Tab ③ UX 煙霧測試。"""
from __future__ import annotations

import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "pastoral-spiritual-survey-pro.html"


def avg(vals: list[float]) -> float:
    return sum(vals) / len(vals)


def risk_hits(closed: dict[str, int]) -> list[str]:
    """Mirror riskRuleHit + RISK_PRIORITY in HTML (keep in sync manually)."""
    cats = {
        "A": ["A1", "A2", "A3", "A4", "A5"],
        "B": ["B1", "B2", "B3", "B4", "B5"],
        "C": ["C1", "C2", "C3", "C4", "C5"],
        "D": ["D1", "D2", "D3", "D4", "D5"],
        "E": ["E1", "E2", "E3", "E4", "E5"],
        "F": ["F1", "F2", "F3", "F4", "F5"],
    }
    avgs = {k: avg([closed[q] for q in qs]) for k, qs in cats.items()}
    e3 = closed.get("E3")
    d4 = closed.get("D4")
    d1 = closed.get("D1")

    def hit(rid: str) -> bool:
        if rid == "burnout":
            return avgs["C"] < 2.8 and avgs["B"] < 2.8
        if rid == "performance":
            return avgs["E"] < 3.0 and e3 is not None and e3 >= 4
        if rid == "power":
            return avgs["F"] < 3.0 and d4 is not None and d4 <= 2
        if rid == "family":
            return d1 is not None and d1 <= 2 and avgs["C"] >= 3.5
        if rid == "numbness":
            return avgs["A"] < 3.0 and avgs["B"] < 3.0
        if rid == "spiritual_stagnation":
            return avgs["A"] >= 3.5 and avgs["D"] < 2.8
        return False

    priority = [
        "burnout",
        "power",
        "spiritual_stagnation",
        "family",
        "performance",
        "numbness",
    ]
    out: list[str] = []
    for rid in priority:
        if hit(rid):
            out.append(rid)
        if len(out) >= 4:
            break
    return out


def main() -> int:
    errors: list[str] = []
    if not HTML.is_file():
        print("FAIL: missing", HTML, file=sys.stderr)
        return 1

    text = HTML.read_text(encoding="utf-8")
    required = [
        "spiritual_stagnation",
        "RISK_PRIORITY",
        "RISK_MAX_CARDS = 4",
        "BALANCE_INSIGHT_RULES",
        "renderBalanceInsights",
        "renderIdealizationFlags",
        "pastoral-score-read",
        "pastoral-balance-host",
        "pastoral-compact-warn",
        "data-pastoral-demo",
        "loadPastoralDemoReport",
    ]
    for token in required:
        if token not in text:
            errors.append(f"HTML missing: {token}")

    # Demo closed scores (PASTORAL_DEMO_FORM_DATA)
    demo = {
        "A1": 5, "A2": 2, "A3": 4, "A4": 3, "A5": 4,
        "B1": 2, "B2": 2, "B3": 2, "B4": 2, "B5": 2,
        "C1": 2, "C2": 2, "C3": 2, "C4": 2, "C5": 2,
        "D1": 3, "D2": 2, "D3": 3, "D4": 2, "D5": 3,
        "E1": 2, "E2": 2, "E3": 5, "E4": 2, "E5": 2,
        "F1": 2, "F2": 2, "F3": 2, "F4": 2, "F5": 2,
    }
    hits = risk_hits(demo)
    if "burnout" not in hits:
        errors.append("demo should trigger burnout")
    if "power" not in hits:
        errors.append("demo should trigger power")
    if "spiritual_stagnation" not in hits:
        errors.append("demo should trigger spiritual_stagnation (A>=3.5, D<2.8)")
    if "performance" not in hits:
        errors.append("demo should trigger performance")

    avgs = {
        "A": avg([demo["A1"], demo["A2"], demo["A3"], demo["A4"], demo["A5"]]),
        "D": avg([demo["D1"], demo["D2"], demo["D3"], demo["D4"], demo["D5"]]),
    }
    if avgs["A"] < 3.5 or avgs["D"] >= 2.8:
        errors.append(f"demo A/D avgs unexpected: A={avgs['A']}, D={avgs['D']}")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print("OK: pastoral risk rules P1 (demo hits=%s)." % hits)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
