#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SWOT 20題題庫 · Weihrich calculateMatrix · 四 Tab 硬化契約。"""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "Church_Governance_SWOT_matrix.html"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "swot_pack.js"
SHELL = REPO / "church_planning" / "js" / "swot_acs_shell.js"
INTRO_MIN_CHARS = 2800

QUESTION_IDS = ["S1", "S2", "S3", "S4", "S5", "W1", "W2", "W3", "W4", "W5", "O1", "O2", "O3", "O4", "O5", "T1", "T2", "T3", "T4", "T5"]

REQUIRED_KEYWORDS = [
    "Weihrich",
    "Delta_Variance",
    "calculateMatrix",
    "雙軌戰略平衡",
    "SMART-compliant",
    "swot_contract",
    "conflict_SO_WO",
    "路加",
    "20題",
    "靈性塌陷",
]

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
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/tool_packs/ncd_pack.js');
load('church_planning/js/tool_packs/swot_pack.js');
load('church_planning/js/swot_matrix_viz.js');
const Pack = sandbox.SwotPack;
if (!Pack || !Pack.QUESTIONS || Pack.QUESTIONS.length !== 20) { console.error('FAIL 20 questions'); process.exit(1); }
const ids = Pack.QUESTIONS.map(q => q.id).sort().join(',');
if (ids.indexOf('S1') < 0 || ids.indexOf('W1') < 0 || ids.indexOf('O1') < 0 || ids.indexOf('T1') < 0) {
  console.error('FAIL question ids', ids); process.exit(1);
}
const matrix = Pack.calculateMatrix({ ncd_dim_scores: { functional: 4.8, passion: 2.0 }, ncd_minimum: { id: 'passion', score: 2.0 } });
if (matrix.Delta_Variance < 2.5) { console.error('FAIL Delta', matrix.Delta_Variance); process.exit(1); }
if (matrix.primary_strategy !== 'WO') { console.error('FAIL override', matrix.primary_strategy); process.exit(1); }
if (!matrix.pastoral_override || matrix.pastoral_override.indexOf('事工機器') < 0) { console.error('FAIL pastoral msg'); process.exit(1); }
const answers = {};
Pack.QUESTIONS.forEach(q => { answers[q.id] = q.quad === 'W' ? 4 : 3; });
answers.W1 = 5;
const quiz = Pack.buildRunFromQuiz(answers, { church_name: 'Test' });
if (!quiz.ok) { console.error('FAIL quiz build', quiz.errors); process.exit(1); }
const demo = Pack.buildDemoRun();
const html = sandbox.SwotMatrixViz.renderMatrixBlock(demo.run.derived, 'WO');
if (html.indexOf('swot-matrix-svg') < 0) { console.error('FAIL svg'); process.exit(1); }
if (html.indexOf('事工機器') < 0) { console.error('FAIL override in viz'); process.exit(1); }
console.log(JSON.stringify({ ok: true, Delta: matrix.Delta_Variance }));
"""


def main() -> int:
    if not HTML.is_file():
        sys.exit("FAIL: Church_Governance_SWOT_matrix.html missing")
    html = HTML.read_text(encoding="utf-8")
    pack = PACK.read_text(encoding="utf-8")

    if 'data-strategic-default="intro"' not in html:
        sys.exit("FAIL: default tab must be intro")
    if "swot-quick-survey-wrap" not in html or "swot-track-quick" not in html:
        sys.exit("FAIL: Tab② dual-track quick survey missing")
    for qid in QUESTION_IDS:
        if qid not in pack:
            sys.exit(f"FAIL: missing question {qid} in swot_pack.js")
    for kw in REQUIRED_KEYWORDS:
        if kw not in html and kw not in pack:
            sys.exit(f"FAIL: missing keyword {kw}")
    if len(re.search(r'id="swot-tab-intro-content"[^>]*data-acs-hardcoded="true"[^>]*>(.*?)</div>\s*</section>', html, re.S).group(1)) < INTRO_MIN_CHARS:
        sys.exit("FAIL: Tab① whitepaper too short")
    shell = SHELL.read_text(encoding="utf-8")
    if "submitQuick" not in shell or "swot-quick-form" not in shell:
        sys.exit("FAIL: quick survey submit not wired in swot_acs_shell.js")
    if "SwotAcsShell.submitQuick" not in html and "swot-quick-survey-wrap" not in html:
        sys.exit("FAIL: quick survey host missing in HTML")

    proc = subprocess.run(
        ["node", "-e", TEST_SCRIPT, str(REPO)],
        cwd=str(REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
    )
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK: SWOT 20-question bank + Weihrich matrix + pastoral WO override")
    return 0


if __name__ == "__main__":
    sys.exit(main())
