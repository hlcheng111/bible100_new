#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""kpi_pack.js + kpi-okr-alignment.html 烟测。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RUNTIME = REPO / "church_planning" / "js" / "cta_os_runtime.js"
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "kpi_pack.js"
HTML = REPO / "church_planning" / "Church_Governance_KPI_alignment.html"

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
load('church_planning/js/cta_os_runtime.js');
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/kpi_pack.js');
const Pack = sandbox.KpiPack;
const Store = sandbox.AssessmentRunStore;
if (!Pack || Pack.QUESTIONS.length !== 12) { console.error('FAIL questions'); process.exit(1); }
const answers = {};
Pack.QUESTIONS.forEach(function(q, i) { answers[q.id] = 2 + (i % 3); });
const built = Pack.buildRun(answers, { focus_label: 'test' });
if (!built.ok) { console.error('FAIL build', built.errors); process.exit(1); }
if (built.run.derived.pillar_health_score == null) { console.error('FAIL health'); process.exit(1); }
const saved = Store.saveRun(built.run);
if (!saved.ok) { console.error('FAIL save'); process.exit(1); }
const latest = Store.loadLatest('kpiokr');
if (!latest || latest.tool_id !== 'kpiokr') { console.error('FAIL latest'); process.exit(1); }
if (built.run.derived.resource_stuck_rate == null) { console.error('FAIL stuck'); process.exit(1); }
const chain = Pack.loadUpstreamChain();
if (!chain || typeof chain.ok !== 'boolean') { console.error('FAIL chain'); process.exit(1); }
const demo = Pack.buildDemoRun();
if (!demo.ok || demo.run.derived.resource_stuck_rate < 70) { console.error('FAIL demo stuck'); process.exit(1); }
console.log(JSON.stringify({ ok: true, health: built.run.derived.pillar_health_score, stuck: demo.run.derived.resource_stuck_rate }));
"""


def main() -> int:
    reg = (REPO / "church_planning" / "js" / "planning_tool_registry.js").read_text(encoding="utf-8")
    if '"KPI/OKR 對齊"' not in reg or "神國標竿" in reg:
        print("FAIL registry kpiokr label", file=sys.stderr)
        return 1
    html = HTML.read_text(encoding="utf-8")
    for needle in ("kpi_acs_shell.js", "kpi_funnel_viz.js", "loadDemoReport", "acs-pastoral-hero", "strategic_acs_unified_boot.js"):
        if needle not in html:
            print("FAIL missing in html:", needle, file=sys.stderr)
            return 1
    for forbidden in ("神國標竿", "堂會 DNA", "CTA-OS"):
        if forbidden in html:
            print("FAIL forbidden label in kpi html:", forbidden, file=sys.stderr)
            return 1
    old = (REPO / "church_planning" / "kpi-okr-alignment.html").read_text(encoding="utf-8")
    if "Church_Governance_KPI_alignment.html" not in old:
        print("FAIL kpi redirect", file=sys.stderr)
        return 1
    proc = subprocess.run(["node", "-e", TEST_SCRIPT, str(REPO)], cwd=str(REPO), capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK kpi_pack", proc.stdout.strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
