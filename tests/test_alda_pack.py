#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""alda_pack.js + AssessmentRunStore 烟测。"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
STORE = REPO / "church_planning" / "js" / "assessment_run_store.js"
QJS = REPO / "church_planning" / "js" / "tool_packs" / "alda_questions.js"
PACK = REPO / "church_planning" / "js" / "tool_packs" / "alda_pack.js"
HTML = REPO / "church_planning" / "12 Apostles Leadership Assessment.html"

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
load('church_planning/js/tool_packs/alda_questions.js');
load('church_planning/js/tool_packs/alda_pack.js');
const Pack = sandbox.AldaPack;
const Store = sandbox.AssessmentRunStore;
if (!Pack || !Store) { console.error('FAIL missing'); process.exit(1); }
if (!Pack.QUESTIONS || Pack.QUESTIONS.length !== 16) { console.error('FAIL q len', Pack.QUESTIONS && Pack.QUESTIONS.length); process.exit(1); }
const answers = {};
Pack.QUESTIONS.forEach(function(q, i) {
  var opts = q.options || [];
  answers[String(q.id)] = { most: opts[i % 4].id, least: opts[(i + 1) % 4].id };
});
const built = Pack.buildRun(answers, { name: '測試執事', role: '關懷', branch: '母堂', years: '5-10年', exp: '—' });
if (!built.ok) { console.error('FAIL buildRun', built.errors); process.exit(1); }
const run = built.run;
if (run.tool_id !== 'alda' || !run.feature_vector || !run.derived.primary) { console.error('FAIL run shape'); process.exit(1); }
const saved = Store.saveRun(run);
if (!saved.ok) { console.error('FAIL save'); process.exit(1); }
const latest = Store.loadLatest('alda');
if (!latest || latest.tool_id !== 'alda') { console.error('FAIL latest'); process.exit(1); }
const legacy = Pack.legacyPayloadFromRun(run);
if (!legacy.vectors || legacy.primary !== run.derived.primary) { console.error('FAIL legacy'); process.exit(1); }
console.log(JSON.stringify({ ok: true, primary: run.derived.primary, sincerity: run.derived.sincerity }));
"""


def main() -> int:
    errors = []
    for p in (STORE, QJS, PACK, HTML):
        if not p.is_file():
            errors.append(f"missing {p.relative_to(REPO)}")
    html = HTML.read_text(encoding="utf-8") if HTML.is_file() else ""
    if "alda_pack.js" not in html:
        errors.append("ALDA html must load alda_pack.js")
    if "assessment_run_store.js" not in html:
        errors.append("ALDA html must load assessment_run_store.js")
    if "const questions = [" in html:
        errors.append("ALDA html should not keep inline questions array")
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
    data = json.loads(proc.stdout.strip().splitlines()[-1])
    print("OK: alda pack (primary=%s sincerity=%s)." % (data.get("primary"), data.get("sincerity")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
