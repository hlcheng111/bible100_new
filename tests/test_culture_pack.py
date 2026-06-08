#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""culture_pack.js 烟测。"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "culture-alignment-assessment.html"

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
Store.saveRun(built.run);
console.log(JSON.stringify({ ok: true, flags: built.run.risk_flags }));
"""


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    if "堂會 DNA 共鳴" not in html or "culture_pack.js" not in html:
        print("FAIL culture html", file=sys.stderr)
        return 1
    proc = subprocess.run(["node", "-e", TEST_SCRIPT, str(REPO)], cwd=str(REPO), capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK culture_pack", proc.stdout.strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
