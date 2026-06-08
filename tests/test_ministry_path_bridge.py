#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ministry_path_bridge.js + johari_pack + shape_pack 煙霧測試。"""
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
const sandbox = { console, Math, Date, JSON, localStorage: { _m: {}, getItem(k){ return this._m[k]||null; }, setItem(k,v){ this._m[k]=v; }, removeItem(k){ delete this._m[k]; } } };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

function load(rel) {
  vm.runInContext(fs.readFileSync(path.join(repo, rel), 'utf8'), sandbox);
}

load('church_planning/js/cta_os_runtime.js');
load('church_planning/js/assessment_run_store.js');
load('smart_ministry/matching_demo.js');
load('church_planning/js/matchmaker_urgent_jobs.js');
load('church_planning/js/ministry_path_bridge.js');
load('church_planning/js/tool_packs/shape_pack.js');
load('church_planning/js/tool_packs/johari_pack.js');
load('church_planning/js/tool_packs/disc_pack.js');
load('church_planning/js/tool_packs/mbti_pack.js');
load('church_planning/js/tool_packs/alda_questions.js');
load('church_planning/js/tool_packs/alda_pack.js');
load('church_planning/js/tool_packs/competency_pack.js');
load('church_planning/js/tool_packs/ncd_pack.js');

const Bridge = sandbox.MinistryPathBridge;
const Shape = sandbox.ShapePack;
const Johari = sandbox.JohariPack;
const Disc = sandbox.DiscPack;
const Mbti = sandbox.MbtiPack;
const Alda = sandbox.AldaPack;
const Competency = sandbox.CompetencyPack;
const Ncd = sandbox.NcdPack;
const Store = sandbox.AssessmentRunStore;

if (!Bridge || !Shape || !Johari || !Disc || !Mbti || !Alda || !Competency || !Ncd) {
  console.error('FAIL: missing modules');
  process.exit(1);
}

const shapeAns = {};
Shape.QUESTIONS.forEach(q => { shapeAns[q.id] = 4; });
shapeAns.h03 = 5;
shapeAns.s02 = 5;
const shapeBuilt = Shape.buildRun(shapeAns, { name: '測試', role: '同工' });
if (!shapeBuilt.ok) {
  console.error('FAIL: shape buildRun', shapeBuilt.errors);
  process.exit(1);
}
Store.saveRun(shapeBuilt.run);

const jAns = {};
Johari.QUESTIONS.forEach(q => { jAns[q.id] = q.quadrant === 'open' ? 4 : 3; });
const jBuilt = Johari.buildRun(jAns, { name: '測試', role: '同工' });
if (!jBuilt.ok) {
  console.error('FAIL: johari buildRun', jBuilt.errors);
  process.exit(1);
}
if (!jBuilt.run.path_cards || jBuilt.run.path_cards.length < 2) {
  console.error('FAIL: johari missing path_cards', jBuilt.run.path_cards);
  process.exit(1);
}
const tiers = jBuilt.run.path_cards.map(c => c.tier);
if (tiers.indexOf('seed') < 0 && tiers.indexOf('explore') < 0 && tiers.indexOf('employ') < 0) {
  console.error('FAIL: no valid tier', tiers);
  process.exit(1);
}

const cards = Bridge.buildPathCards({ store: Store });
if (!cards.path_cards || cards.path_cards.length < 2) {
  console.error('FAIL: bridge path_cards');
  process.exit(1);
}
const withOpen = cards.path_cards.filter(c => c.open_role && c.open_role.name_zh);
if (withOpen.length < 1) {
  console.error('FAIL: C0 open_role missing on path_cards', JSON.stringify(cards.path_cards[0]));
  process.exit(1);
}

const dAns = {};
Disc.QUESTIONS.forEach(q => { dAns[q.id] = q.style === 'S' ? 5 : 3; });
const dBuilt = Disc.buildRun(dAns, { name: '測試', role: '同工' });
if (!dBuilt.ok || !dBuilt.run.path_cards) {
  console.error('FAIL: disc buildRun');
  process.exit(1);
}
Store.saveRun(dBuilt.run);

const mAns = {};
Mbti.QUESTIONS.forEach(q => { mAns[q.id] = 4; });
const mBuilt = Mbti.buildRun(mAns, { name: '測試', role: '同工' });
if (!mBuilt.ok || !mBuilt.run.derived.code) {
  console.error('FAIL: mbti buildRun');
  process.exit(1);
}

const aAns = {};
Alda.QUESTIONS.forEach((q, i) => {
  const opts = q.options || [];
  if (opts.length < 2) return;
  aAns[String(q.id)] = { most: opts[i % opts.length].id, least: opts[(i + 1) % opts.length].id };
});
const aBuilt = Alda.buildRun(aAns, { name: '測試執事', role: '長執' });
if (!aBuilt.ok || !aBuilt.run.path_cards || !aBuilt.run.path_cards.length) {
  console.error('FAIL: alda buildRun path_cards', aBuilt.errors);
  process.exit(1);
}
const aldaNote = aBuilt.run.path_cards[0].fit_note || '';
if (aldaNote.indexOf('ALDA') < 0) {
  console.error('FAIL: alda leadership note missing in fit_note');
  process.exit(1);
}
Store.saveRun(aBuilt.run);

const compAns = {};
Competency.QUESTIONS.forEach(q => { compAns[q.id] = 4; });
['c01','c02','c03','c04'].forEach(id => { compAns[id] = 2; });
const compBuilt = Competency.buildRun(compAns, { name: '測試', role: '主日學' });
if (!compBuilt.ok || !compBuilt.run.path_cards || !compBuilt.run.path_cards.length) {
  console.error('FAIL: competency buildRun', compBuilt.errors);
  process.exit(1);
}
const compNote = (compBuilt.run.path_cards[0].fit_note || '');
if (compNote.indexOf('事奉能力') < 0) {
  console.error('FAIL: competency gap note missing', compNote);
  process.exit(1);
}
Store.saveRun(compBuilt.run);

const compKsa = Competency.buildRun({ a01:4,a02:4,a03:4,a04:4,l01:4,l02:4,l03:4,l04:4,c01:4,c02:4,c03:4,c04:4,t01:4,t02:2,t03:4,t04:4,m01:4,m02:4,m03:4,m04:4,r01:4,r02:4,r03:4,r04:4 }, { name:'KSA測試' });
if (!compKsa.ok || !compKsa.run.derived.ksa_overall) {
  console.error('FAIL: competency KSA scores');
  process.exit(1);
}

const pAns = {};
Johari.PEER_QUESTIONS.forEach(q => { pAns[q.id] = 4; });
const pBuilt = Johari.buildPeerRun(pAns, { subject_name: '測試', observer_name: '導師' });
if (!pBuilt.ok) {
  console.error('FAIL: johari peer', pBuilt.errors);
  process.exit(1);
}
Store.savePeerRun(pBuilt.run);

const ncdDemo = Ncd.buildDemoRun();
if (!ncdDemo.ok || !ncdDemo.run.feature_vector) {
  console.error('FAIL: ncd buildDemoRun', ncdDemo.errors);
  process.exit(1);
}
Store.saveRun(ncdDemo.run);
const ncdLatest = Store.loadLatest('ncd');
if (!ncdLatest || !ncdLatest.feature_vector || ncdLatest.tool_id !== 'ncd') {
  console.error('FAIL: ncd assessment_run save/load');
  process.exit(1);
}
const ncdFlags = ncdLatest.risk_flags || [];
if (ncdFlags.indexOf('NCD_MIN_FACTOR') < 0 && ncdFlags.indexOf('NCD_WEAK_DIM') < 0) {
  console.error('FAIL: ncd expected NCD_MIN_FACTOR or NCD_WEAK_DIM', ncdFlags);
  process.exit(1);
}
if (!ncdLatest.strategy_cards || !ncdLatest.strategy_cards.length) {
  console.error('FAIL: ncd missing strategy_cards');
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, cards: cards.path_cards.length, shape_anchor: cards.shape_anchor, open_roles: withOpen.length, johari_q: Johari.QUESTIONS.length, peer_q: Johari.PEER_QUESTIONS.length, disc: dBuilt.run.derived.primary, mbti: mBuilt.run.derived.code, alda: aBuilt.run.derived.primary, competency: compBuilt.run.derived.weakest_label, ncd_worst: ncdLatest.derived.worstCat }));
"""


def main() -> int:
    try:
        proc = subprocess.run(
            ["node", "-e", TEST_SCRIPT, str(REPO)],
            cwd=str(REPO),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            check=False,
        )
    except FileNotFoundError:
        print("SKIP: node not installed")
        return 0
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        return 1
    payload = json.loads(proc.stdout.strip().splitlines()[-1])
    if not payload.get("ok"):
        return 1
    print("OK: MinistryPathBridge path_cards=%s shape_anchor=%s" % (payload.get("cards"), payload.get("shape_anchor")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
