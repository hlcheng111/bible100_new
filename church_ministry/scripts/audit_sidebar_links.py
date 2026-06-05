# -*- coding: utf-8 -*-
"""Analyze sidebar.html linked pages for maturity signals."""
import re
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
sidebar = (ROOT / "sidebar.html").read_text(encoding="utf-8")
links = re.findall(r'href="([^"#?]+\.html[^"]*)"', sidebar)
seen = []
for h in links:
    h = h.split("?")[0]
    if h not in seen:
        seen.append(h)


def analyze(rel: str) -> dict:
    p = ROOT / rel.replace("/", "\\")
    if not p.exists():
        return {"exists": False}
    t = p.read_text(encoding="utf-8", errors="replace")
    flags = []
    if "ChurchDataBridge" in t or "church_data_bridge.js" in t:
        flags.append("Bridge")
    if "simple_database_system" in t or "new SimpleDatabase" in t:
        flags.append("simpleDB")
    if re.search(r"function\s+loadDemo", t):
        flags.append("loadDemo")
    if "localStorage.setItem" in t:
        flags.append("localStorage")
    if re.search(r"示意|規劃中|placeholder|尚未接|demo 用|僅為範例", t, re.I):
        flags.append("demoText")
    if "cm_research_snapshot" in t or "getDashboardKpiSummary" in t:
        flags.append("KPI")
    crud = sum(
        1
        for x in [
            "addMember",
            "saveData",
            "createRecord",
            "insert",
            "delete",
            "update",
            "renderTable",
            "renderList",
        ]
        if x in t
    )
    if "Bridge" in flags and "localStorage" in flags and "loadDemo" not in flags and crud >= 3:
        mat = "FULL-ish"
    elif ("Bridge" in flags or "localStorage" in flags) and "loadDemo" in flags and crud >= 2:
        mat = "PARTIAL"
    elif "loadDemo" in flags or "simpleDB" in flags:
        mat = "DEMO+CRUD"
    elif "demoText" in flags and crud < 2:
        mat = "STATIC"
    elif crud >= 2:
        mat = "PARTIAL"
    else:
        mat = "STATIC"
    return {"exists": True, "flags": flags, "crud": crud, "mat": mat}


rows = [(rel, analyze(rel)) for rel in seen]
c = Counter(r[1]["mat"] for r in rows if r[1].get("exists"))
print("Sidebar unique links:", len(seen))
missing = [r[0] for r in rows if not r[1].get("exists")]
print("Missing:", missing or "none")
print("Maturity counts:", dict(c))
print()
for rel, a in rows:
    if not a.get("exists"):
        continue
    sig = "+".join(a["flags"]) or "-"
    print(f"{a['mat']:10} {rel:52} {sig}")
