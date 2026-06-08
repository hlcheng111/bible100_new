#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""urgency_pack.js + assessment_run_store.js 契約與計分煙霧測試（Node vm）。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
RUNTIME = REPO / "church_planning" / "js" / "cta_os_runtime.js"
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "urgency_pack.js"
SCHEMA_DOC = REPO / "church_planning" / "docs" / "ASSESSMENT_RUN_SCHEMA.md"

TEST_SCRIPT = r"""
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const repo = process.argv[1];
const sandbox = { console, Math, Date, JSON, localStorage: { _m: {}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; }, removeItem(k){ delete this._m[k]; } } };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox);
}

load('church_planning/js/cta_os_runtime.js');
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/urgency_pack.js');

const Pack = sandbox.UrgencyPack;
const Store = sandbox.AssessmentRunStore;

if (!Pack || !Store) {
  console.error('FAIL: missing UrgencyPack or AssessmentRunStore');
  process.exit(1);
}

if (Pack.QUESTIONS.length !== 14) {
  console.error('FAIL: expected 14 questions, got', Pack.QUESTIONS.length);
  process.exit(1);
}

// High Q1 / low Q2 pattern
const answers = {};
Pack.QUESTIONS.forEach(q => {
  if (q.quadrant === 'Q1') answers[q.id] = 5;
  else if (q.quadrant === 'Q2') answers[q.id] = 1;
  else if (q.quadrant === 'Q3') answers[q.id] = 3;
  else if (q.quadrant === 'Q4') answers[q.id] = 2;
  else if (q.reverse) answers[q.id] = 2;
});

const built = Pack.buildRun(answers, { name: '測試同工', role: '小組長' });
if (!built.ok) {
  console.error('FAIL: buildRun', built.errors);
  process.exit(1);
}

const run = built.run;
const sumPct = run.derived.q1_pct + run.derived.q2_pct + run.derived.q3_pct + run.derived.q4_pct;
if (sumPct < 99 || sumPct > 101) {
  console.error('FAIL: quadrant pct sum', sumPct);
  process.exit(1);
}

if (run.derived.q1_pct <= run.derived.q2_pct) {
  console.error('FAIL: expected Q1 > Q2 for test answers', run.derived);
  process.exit(1);
}

if (run.risk_flags.indexOf('Q2_BELOW_TARGET') < 0 || run.risk_flags.indexOf('OVERLOAD_Q1') < 0) {
  console.error('FAIL: expected risk flags', run.risk_flags);
  process.exit(1);
}

if (!run.feature_vector || typeof run.feature_vector.G !== 'number') {
  console.error('FAIL: missing feature_vector');
  process.exit(1);
}

if (!run.ai_prompt || run.ai_prompt.indexOf('勿編造經文') < 0) {
  console.error('FAIL: ai_prompt missing disclaimer');
  process.exit(1);
}

const saved = Store.saveRun(run);
if (!saved.ok) {
  console.error('FAIL: saveRun', saved.errors);
  process.exit(1);
}

const latest = Store.loadLatest('urgent');
if (!latest || latest.tool_id !== 'urgent') {
  console.error('FAIL: loadLatest urgent');
  process.exit(1);
}

if (typeof Pack.loadUpstreamChain !== 'function') { console.error('FAIL loadUpstreamChain'); process.exit(1); }
const bad = Pack.buildRun({ u01: 3 }, {});
if (bad.ok) {
  console.error('FAIL: incomplete answers should fail validation');
  process.exit(1);
}

const demo = Pack.buildDemoRun();
if (!demo.ok || !demo.run.is_demo) {
  console.error('FAIL: buildDemoRun');
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  q1: run.derived.q1_pct,
  q2: run.derived.q2_pct,
  flags: run.risk_flags,
  authenticity: run.authenticity_score
}));
"""


def main() -> int:
    errors: list[str] = []

    for p in (RUNTIME, STORE, PACK, SCHEMA_DOC):
        if not p.is_file():
            errors.append(f"missing file: {p.relative_to(REPO)}")

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    text = SCHEMA_DOC.read_text(encoding="utf-8")
    html = (REPO / "church_planning" / "Church_Governance_urgent_matrix.html").read_text(encoding="utf-8")
    redir = (REPO / "church_planning" / "important-urgent-matrix.html").read_text(encoding="utf-8")
    if "bible100_assessment_latest_" not in text:
        errors.append("schema doc missing latest key pattern")
    if "urgency_pack" not in text:
        errors.append("schema doc should reference urgency_pack")
    if "urgency_acs_shell.js" not in html:
        errors.append("urgent governance html must load urgency_acs_shell.js")
    if "strategic_acs_unified_boot.js" not in html:
        errors.append("urgent governance html must load unified boot")
    if "Church_Governance_urgent_matrix.html" not in redir:
        errors.append("important-urgent-matrix.html must redirect")
    if "Q1 45%" in html or "45% / Q2 18%" in html:
        errors.append("urgent html still has hardcoded demo percentages")
    if "示範報告" not in html:
        errors.append("urgent html should offer demo report (ALDA pattern)")
    if "loadDemoReport" not in html:
        errors.append("urgent html missing loadDemoReport")

    try:
        proc = subprocess.run(
            ["node", "-e", TEST_SCRIPT, str(REPO)],
            cwd=str(REPO),
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
    except FileNotFoundError:
        print("SKIP: node not installed; file checks only", file=sys.stderr)
        if errors:
            for e in errors:
                print(" ", e, file=sys.stderr)
            return 1
        print("OK: urgency pack files present (node tests skipped).")
        return 0

    if proc.returncode != 0:
        print("FAIL: node urgency pack test", file=sys.stderr)
        if proc.stdout:
            print(proc.stdout, file=sys.stderr)
        if proc.stderr:
            print(proc.stderr, file=sys.stderr)
        return 1

    try:
        payload = json.loads(proc.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        print("FAIL: could not parse node output:", proc.stdout, file=sys.stderr)
        return 1

    if not payload.get("ok"):
        print("FAIL: node reported not ok", file=sys.stderr)
        return 1

    if errors:
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print(
        "OK: urgency pack (Q1=%s Q2=%s flags=%s auth=%s)."
        % (payload.get("q1"), payload.get("q2"), payload.get("flags"), payload.get("authenticity"))
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
