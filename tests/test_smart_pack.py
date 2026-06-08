#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""smart_pack.js v2 + Church_Governance_SMART_goals.html 烟测。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RUNTIME = REPO / "church_planning" / "js" / "cta_os_runtime.js"
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "smart_pack.js"
SMART_HTML = REPO / "church_planning" / "Church_Governance_SMART_goals.html"
REDIRECT = REPO / "church_planning" / "smart-assessment.html"
VIZ = REPO / "church_planning" / "js" / "smart_funnel_viz.js"

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
load('church_planning/js/tool_packs/smart_pack.js');
load('church_planning/js/smart_funnel_viz.js');
const Pack = sandbox.SmartPack;
const Store = sandbox.AssessmentRunStore;
const Viz = sandbox.SmartFunnelViz;
if (!Pack || !Store || !Viz) { console.error('FAIL: missing pack/store/viz'); process.exit(1); }
if (!Pack.QUESTIONS || Pack.QUESTIONS.length !== 15) { console.error('FAIL QUESTIONS len', Pack.QUESTIONS && Pack.QUESTIONS.length); process.exit(1); }
if (typeof Pack.loadUpstreamChain !== 'function') { console.error('FAIL loadUpstreamChain'); process.exit(1); }
const chain = Pack.loadUpstreamChain();
if (!chain || typeof chain.ok !== 'boolean') { console.error('FAIL chain'); process.exit(1); }
const answers = {};
Pack.QUESTIONS.forEach(function(q, i) { answers[q.id] = 2 + (i % 3); });
const partial = Pack.buildRun({ smart_s1: 3, smart_s2: 3 });
if (partial.ok) { console.error('FAIL partial should reject'); process.exit(1); }
const built = Pack.buildRun(answers, { plan_name: '探訪試行', season_label: '2026 Q2' });
if (!built.ok) { console.error('FAIL buildRun', built.errors); process.exit(1); }
const run = built.run;
if (run.schema_version !== 2) { console.error('FAIL schema'); process.exit(1); }
if (!run.feature_vector || run.derived.alignment_score == null || !run.derived.metric_bridge) { console.error('FAIL derived'); process.exit(1); }
if (!run.derived.pdca_guide || !run.derived.pdca_guide.items || run.derived.pdca_guide.items.length !== 4) { console.error('FAIL pdca_guide'); process.exit(1); }
if (run.derived.pdca_guide.items[0].pastoral.length < 10) { console.error('FAIL pdca pastoral empty'); process.exit(1); }
const html = Viz.renderDashboardBlock(run, { animate: true });
if (html.indexOf('smart-funnel-root') < 0 || html.indexOf('pdca-gears-root') < 0) { console.error('FAIL viz html'); process.exit(1); }
const saved = Store.saveRun(run);
if (!saved.ok) { console.error('FAIL save'); process.exit(1); }
const latest = Store.loadLatest('smart');
if (!latest || latest.tool_id !== 'smart') { console.error('FAIL latest'); process.exit(1); }
const demo = Pack.buildDemoRun();
if (!demo.ok || !demo.run.is_demo) { console.error('FAIL demo'); process.exit(1); }
console.log(JSON.stringify({ ok: true, align: run.derived.alignment_score, load: run.derived.load_cost_score, flags: run.risk_flags, q: Pack.QUESTIONS.length }));
"""


def main() -> int:
    errors = []
    for p in (RUNTIME, STORE, PACK, SMART_HTML, REDIRECT, VIZ):
        if not p.is_file():
            errors.append(f"missing {p.relative_to(REPO)}")
    html = SMART_HTML.read_text(encoding="utf-8") if SMART_HTML.is_file() else ""
    redir = REDIRECT.read_text(encoding="utf-8") if REDIRECT.is_file() else ""
    reg = (REPO / "church_planning" / "js" / "planning_tool_registry.js").read_text(encoding="utf-8")
    if "Church_Governance_SMART_goals.html" not in reg:
        errors.append("registry must point to Church_Governance_SMART_goals.html")
    for needle in (
        "smart_acs_shell.js",
        "smart_funnel_viz.js",
        "smart_pastoral_desk_content.js",
        "loadDemoReport",
        "acs-pastoral-hero",
        "strategic_acs_unified_boot.js",
        "smart-report-viz",
    ):
        if needle not in html:
            errors.append(f"missing {needle} in SMART html")
    if "Church_Governance_SMART_goals.html" not in redir:
        errors.append("smart-assessment.html must redirect to new page")
    for forbidden in ("Church OS 5F", "CTA-OS"):
        if forbidden in html:
            errors.append(f"forbidden label in smart html: {forbidden}")
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
    print(
        "OK: smart pack v2 (q=%s align=%s load=%s flags=%s)."
        % (payload.get("q"), payload.get("align"), payload.get("load"), payload.get("flags"))
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
