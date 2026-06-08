#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""pastoral_pack.js + assessment_run_store 烟测（P2 戰情室串聯）。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCORING = REPO / "church_planning" / "js" / "spiritual_health_scoring.js"
PASTORAL_JS = REPO / "church_planning" / "js" / "pastoral_spiritual_health.js"
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "pastoral_pack.js"
PASTORAL_HTML = REPO / "church_planning" / "Church_Governance_pastoral_health.html"

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
load('church_planning/js/pastoral_spiritual_health.js');
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/cta_os_runtime.js');
load('church_planning/js/tool_packs/pastoral_pack.js');
const Pack = sandbox.PastoralPack;
const Store = sandbox.AssessmentRunStore;
if (!Pack || !Store) { console.error('FAIL: missing pack/store'); process.exit(1); }
if (!Pack.QUESTIONS || Pack.QUESTIONS.length !== 30) { console.error('FAIL QUESTIONS len', Pack.QUESTIONS && Pack.QUESTIONS.length); process.exit(1); }
if (typeof Pack.loadUpstreamChain !== 'function') { console.error('FAIL loadUpstreamChain'); process.exit(1); }
const demo = Pack.buildDemoRun();
if (!demo.ok || !demo.run.is_demo) { console.error('FAIL demo'); process.exit(1); }
const flags = demo.run.risk_flags || [];
['BURNOUT','POWER','SPIRITUAL_STAGNATION','PERFORMANCE'].forEach(function(f){
  if (flags.indexOf(f) < 0) { console.error('FAIL demo missing flag', f, flags); process.exit(1); }
});
if (!demo.run.is_demo) { console.error('FAIL demo flag'); process.exit(1); }
const answers = demo.run.raw_answers.reduce(function(m, row){ if (row.value != null) m[row.q]=row.value; return m; }, {});
const built = Pack.buildRun(answers, { p_church_size: '81-250', label: '測試牧者' });
if (!built.ok) { console.error('FAIL buildRun', built.errors); process.exit(1); }
const run = built.run;
if (!run.feature_vector || run.derived.overall_score == null) { console.error('FAIL derived'); process.exit(1); }
if (run.profile && run.profile.p_recent_note) { console.error('FAIL open text in profile'); process.exit(1); }
const okSave = Store.saveRun(run);
if (!okSave.ok) { console.error('FAIL save', okSave.errors); process.exit(1); }
const latest = Store.loadLatest('pastoral');
if (!latest || latest.tool_id !== 'pastoral') { console.error('FAIL latest'); process.exit(1); }
console.log(JSON.stringify({ ok: true, overall: run.derived.overall_score, flags: run.risk_flags, fvP: run.feature_vector.P }));
"""


def main() -> int:
    errors: list[str] = []
    for p in (SCORING, PASTORAL_JS, STORE, PACK, PASTORAL_HTML):
        if not p.is_file():
            errors.append(f"missing {p.relative_to(REPO)}")
    html = PASTORAL_HTML.read_text(encoding="utf-8") if PASTORAL_HTML.is_file() else ""
    for token in (
        "pastoral_pack.js",
        "assessment_run_store.js",
        "pastoral_acs_shell.js",
        "strategic_acs_unified_boot.js",
    ):
        if token not in html:
            errors.append(f"HTML missing: {token}")
    pack_text = PACK.read_text(encoding="utf-8") if PACK.is_file() else ""
    if "HITL_DISCLAIMER" not in pack_text:
        errors.append("pastoral_pack must export HITL_DISCLAIMER")
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
        "OK: pastoral pack P2 (overall=%s flags=%s CTV.P=%s)."
        % (payload.get("overall"), payload.get("flags"), payload.get("fvP"))
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
