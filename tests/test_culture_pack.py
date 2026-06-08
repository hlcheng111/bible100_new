#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""culture_pack.js 烟测。"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "Church_Governance_Culture_radar.html"

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
load('church_planning/js/tool_packs/culture_pack.js');
const Pack = sandbox.CulturePack;
const Store = sandbox.AssessmentRunStore;
if (!Pack || Pack.QUESTIONS.length !== 24) { console.error('FAIL len'); process.exit(1); }
const answers = {};
Pack.QUESTIONS.forEach(function(q, i) { answers[q.id] = 2 + (i % 2); });
answers.cul_r1 = answers.cul_r2 = answers.cul_r3 = 2;
const built = Pack.buildRun(answers, { church_label: 't' });
if (!built.ok) { console.error('FAIL build'); process.exit(1); }
if (built.run.risk_flags.indexOf('TRUST_BREACH') < 0) { console.error('FAIL trust flag'); process.exit(1); }
if (built.run.derived.cvam_scores == null || built.run.derived.culture_deviation_cv == null) { console.error('FAIL cvam'); process.exit(1); }
const chain = Pack.loadUpstreamChain();
if (!chain || typeof chain.ok !== 'boolean') { console.error('FAIL chain'); process.exit(1); }
Store.saveRun(built.run);
console.log(JSON.stringify({ ok: true, flags: built.run.risk_flags, cv: built.run.derived.culture_deviation_cv }));
"""


def main() -> int:
    reg = (REPO / "church_planning" / "js" / "planning_tool_registry.js").read_text(encoding="utf-8")
    if '"文化契合度"' not in reg or "堂會 DNA" in reg:
        print("FAIL registry culture label", file=sys.stderr)
        return 1
    html = HTML.read_text(encoding="utf-8")
    if "文化契合度" not in html or "culture_pack.js" not in html:
        print("FAIL culture html", file=sys.stderr)
        return 1
    for needle in ("culture_acs_shell.js", "culture_radar_viz.js", "loadDemoReport", "acs-pastoral-hero", "strategic_acs_unified_boot.js"):
        if needle not in html:
            print("FAIL missing in culture html:", needle, file=sys.stderr)
            return 1
    for forbidden in ("神國標竿", "堂會 DNA", "DNA 共鳴", "CTA-OS"):
        if forbidden in html:
            print("FAIL forbidden label in culture html:", forbidden, file=sys.stderr)
            return 1
    old = (REPO / "church_planning" / "culture-alignment-assessment.html").read_text(encoding="utf-8")
    if "Church_Governance_Culture_radar.html" not in old:
        print("FAIL culture redirect", file=sys.stderr)
        return 1
    proc = subprocess.run(["node", "-e", TEST_SCRIPT, str(REPO)], cwd=str(REPO), capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK culture_pack", proc.stdout.strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
