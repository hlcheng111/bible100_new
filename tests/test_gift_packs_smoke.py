#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""恩賜六件 pack 煙測（shape/competency/johari/disc/mbti + alda registry）。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

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
load('church_planning/js/tool_packs/shape_pack.js');
load('church_planning/js/tool_packs/competency_pack.js');
load('church_planning/js/tool_packs/johari_pack.js');
load('church_planning/js/tool_packs/disc_pack.js');
load('church_planning/js/tool_packs/mbti_pack.js');
const Store = sandbox.AssessmentRunStore;
function smoke(name, Pack, buildFn) {
  if (!Pack) { console.error('FAIL missing', name); process.exit(1); }
  var built = buildFn(Pack);
  if (!built.ok) { console.error('FAIL', name, built.errors); process.exit(1); }
  var saved = Store.saveRun(built.run);
  if (!saved.ok) { console.error('FAIL save', name); process.exit(1); }
  var latest = Store.loadLatest(built.run.tool_id);
  if (!latest) { console.error('FAIL latest', name); process.exit(1); }
}
var shapeAns = {}; sandbox.ShapePack.QUESTIONS.forEach(function(q,i){ shapeAns[q.id] = 2 + (i % 3); });
smoke('shape', sandbox.ShapePack, function(P){ return P.buildRun(shapeAns, {}); });
var compAns = {}; sandbox.CompetencyPack.QUESTIONS.forEach(function(q,i){ compAns[q.id] = 2 + (i % 3); });
smoke('competency', sandbox.CompetencyPack, function(P){ return P.buildRun(compAns, {}); });
smoke('johari', sandbox.JohariPack, function(P){ return P.buildDemoRun(); });
var discAns = {}; sandbox.DiscPack.QUESTIONS.forEach(function(q,i){ discAns[q.id] = 2 + (i % 3); });
smoke('disc', sandbox.DiscPack, function(P){ return P.buildRun(discAns, {}); });
var mbtiAns = {}; sandbox.MbtiPack.QUESTIONS.forEach(function(q,i){ mbtiAns[q.id] = 2 + (i % 3); });
smoke('mbti', sandbox.MbtiPack, function(P){ return P.buildRun(mbtiAns, {}); });
console.log(JSON.stringify({ ok: true, tools: ['shape','competency','johari','disc','mbti'] }));
"""

PAGES = [
    "shape-gifts-assessment.html",
    "ministry-competency-assessment.html",
    "johari-window-assessment.html",
    "disc-profile-assessment.html",
    "mbti-self-awareness.html",
    "alda-leadership-assessment.html",
]


def main() -> int:
    for name in PAGES:
        p = REPO / "church_planning" / name
        if not p.is_file():
            print("FAIL missing page", name, file=sys.stderr)
            return 1
        html = p.read_text(encoding="utf-8")
        if "data-acs-hardcoded" not in html and "assessment_coaching_shell" not in html:
            print("FAIL page not on coaching shell:", name, file=sys.stderr)
            return 1
    proc = subprocess.run(["node", "-e", TEST_SCRIPT, str(REPO)], cwd=str(REPO), capture_output=True, text=True, timeout=60)
    if proc.returncode != 0:
        print("FAIL:", proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    print("OK: gift six packs smoke", proc.stdout.strip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
