#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""matchmaker_core.js 煙測。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CORE = REPO / "church_planning" / "js" / "matchmaker_core.js"
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
HTML = REPO / "church_planning" / "ministry-position-matchmaker.html"

TEST_SCRIPT = r"""
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const repo = process.argv[1];
const sandbox = { console, Math, Date, JSON, localStorage: { _m: {}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; } } };
sandbox.window = sandbox; sandbox.global = sandbox;
vm.createContext(sandbox);
function load(rel) { vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox); }
load('church_planning/js/assessment_run_store.js');
load('church_planning/js/matchmaker_core.js');
const Core = sandbox.MatchmakerCore;
if (!Core || !Core.buildDemoTalentBundle) { console.error('FAIL core'); process.exit(1); }
var bundle = Core.buildDemoTalentBundle();
if (!bundle || !bundle.person) { console.error('FAIL demo bundle'); process.exit(1); }
var fit = Core.analyzeFit('elder', bundle.person);
if (!fit || fit.overall_pct == null) { console.error('FAIL fit'); process.exit(1); }
var contract = Core.buildMatchContract(bundle, fit);
if (!contract.hitl_note) { console.error('FAIL contract'); process.exit(1); }
console.log(JSON.stringify({ ok: true, pct: fit.overall_pct, role: fit.role_id }));
"""


def main() -> int:
    if not CORE.is_file() or not HTML.is_file():
        print("FAIL missing matchmaker files", file=sys.stderr)
        return 1
    html = HTML.read_text(encoding="utf-8")
    if "matchmaker_core.js" not in html:
        print("FAIL html must load matchmaker_core.js", file=sys.stderr)
        return 1
    proc = subprocess.run(["node", "-e", TEST_SCRIPT, str(REPO)], cwd=str(REPO), capture_output=True, text=True, timeout=30)
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    data = json.loads(proc.stdout.strip().splitlines()[-1])
    print("OK: matchmaker core (role=%s pct=%s)." % (data.get("role"), data.get("pct")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
