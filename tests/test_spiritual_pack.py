#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""spiritual_pack.js + assessment_run_store 烟测。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCORING = REPO / "church_planning" / "js" / "spiritual_health_scoring.js"
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "spiritual_pack.js"
SPIRITUAL_HTML = REPO / "church_planning" / "Church_Governance_spiritual_health.html"
REDIRECT = REPO / "church_planning" / "信徒靈性生命健康自我審查.html"

TEST_SCRIPT = r"""
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const repo = process.argv[1];
const sandbox = { console, Math, Date, JSON, localStorage: { _m: {}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; } } };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox); }
load('church_planning/js/spiritual_health_scoring.js');
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/spiritual_pack.js');
const Pack = sandbox.SpiritualPack;
const Store = sandbox.AssessmentRunStore;
if (!Pack || !Store) { console.error('FAIL: missing pack/store'); process.exit(1); }
if (!Pack.QUESTIONS || Pack.QUESTIONS.length !== 13) { console.error('FAIL QUESTIONS'); process.exit(1); }
const answers = { q1:2,q2:2,q3:2,q4:3,q5:3,q6:3,q7:4,q8:4,q9:4,q10:3,q11:3,q12:2,q13:2 };
const built = Pack.buildRun(answers, { age_range: '26-35' });
if (!built.ok) { console.error('FAIL buildRun', built.errors); process.exit(1); }
const run = built.run;
if (!run.feature_vector || run.derived.overall_score == null) { console.error('FAIL derived'); process.exit(1); }
const saved = Store.saveRun(run);
if (!saved.ok) { console.error('FAIL save'); process.exit(1); }
const latest = Store.loadLatest('spiritual');
if (!latest || latest.tool_id !== 'spiritual') { console.error('FAIL latest'); process.exit(1); }
const demo = Pack.buildDemoRun();
if (!demo.ok || !demo.run.is_demo) { console.error('FAIL demo'); process.exit(1); }
console.log(JSON.stringify({ ok: true, overall: run.derived.overall_score, level: run.derived.overall_level, flags: run.risk_flags }));
"""


def main() -> int:
    errors = []
    for p in (SCORING, STORE, PACK, SPIRITUAL_HTML, REDIRECT):
        if not p.is_file():
            errors.append(f"missing {p.relative_to(REPO)}")
    html = SPIRITUAL_HTML.read_text(encoding="utf-8") if SPIRITUAL_HTML.is_file() else ""
    if "spiritual_acs_shell.js" not in html:
        errors.append("spiritual governance html must load spiritual_acs_shell.js")
    if "strategic_acs_unified_boot.js" not in html:
        errors.append("spiritual governance html must load unified boot")
    if "Church_Governance_spiritual_health.html" not in (REDIRECT.read_text(encoding="utf-8") if REDIRECT.is_file() else ""):
        errors.append("legacy spiritual page must redirect")
    if "spiritual_pack.js" not in html:
        errors.append("spiritual html must load spiritual_pack.js")
    if "tab-btn-methodology" in html or "renderSpiritualMethodology" in html:
        errors.append("spiritual html should use strategic acs shell not legacy tabs")
    if "QUESTIONS" not in (PACK.read_text(encoding="utf-8") if PACK.is_file() else ""):
        errors.append("spiritual_pack must export QUESTIONS")
    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1
    proc = subprocess.run(
        ["node", "-e", TEST_SCRIPT, str(REPO)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        timeout=30,
    )
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    payload = json.loads(proc.stdout.strip().splitlines()[-1])
    print("OK: spiritual pack (overall=%s level=%s flags=%s)." % (payload.get("overall"), payload.get("level"), payload.get("flags")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
