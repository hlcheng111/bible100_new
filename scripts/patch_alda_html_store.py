#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Wire ALDA HTML to alda_pack.js + AssessmentRunStore."""
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
HTML = REPO / "church_planning" / "12 Apostles Leadership Assessment.html"
text = HTML.read_text(encoding="utf-8")

# Remove inline questions array; use pack SSOT
start = text.index("        const questions = [")
end = text.index("        ];", start) + len("        ];")
replacement = """        const questions = (window.AldaPack && AldaPack.QUESTIONS && AldaPack.QUESTIONS.length)
            ? AldaPack.QUESTIONS
            : (window.ALDA_QUESTIONS || []);"""
text = text[:start] + replacement + text[end:]

# Insert pack scripts before core JS block
marker = "    <!-- ==================== CORE JAVASCRIPT SYSTEM ==================== -->"
scripts = """    <script src="js/assessment_run_store.js"></script>
    <script src="js/tool_packs/alda_questions.js"></script>
    <script src="js/tool_packs/alda_pack.js"></script>
"""
if marker in text and "alda_pack.js" not in text:
    text = text.replace(marker, scripts + marker)

# calculateAndSubmit: use AldaPack scoring
old_scoring = """            let clusterScores = { C: 0, O: 0, S: 0, F: 0 };
            let apostleScores = {
                "彼得": 0, "雅各": 0, "約翰": 0, "安得烈": 0, "腓力": 0, "巴多羅買": 0,
                "多馬": 0, "馬太": 0, "小雅各": 0, "達太": 0, "西門": 0, "猶大": 0
            };

            let sdSelections = 0; 
            const maxSD = 3; 
            let inconsistentScoring = 0; 

            questions.forEach(q => {
                const ans = currentAnswers[q.id];
                const mostOpt = q.options.find(o => o.id === ans.most);
                const leastOpt = q.options.find(o => o.id === ans.least);

                clusterScores[mostOpt.group] += 2;
                if (apostleScores[mostOpt.apostle] !== undefined) {
                    apostleScores[mostOpt.apostle] += 2;
                }

                clusterScores[leastOpt.group] -= 1;
                if (apostleScores[leastOpt.apostle] !== undefined) {
                    apostleScores[leastOpt.apostle] -= 1;
                }

                if (mostOpt.isSD) {
                    sdSelections++;
                }
            });

            const ansQ5 = currentAnswers[5];
            const ansQ7 = currentAnswers[7];
            if (ansQ5 && ansQ7) {
                if ((ansQ5.most === 'B' && ansQ7.least === 'A') || (ansQ5.least === 'B' && ansQ7.most === 'A')) {
                    inconsistentScoring += 3; 
                }
            }
            const ansQ10 = currentAnswers[10];
            const ansQ15 = currentAnswers[15];
            if (ansQ10 && ansQ15) {
                if (ansQ10.most === 'B' && ansQ15.least === 'A') {
                    inconsistentScoring += 2;
                }
            }

            let sincerityPercent = Math.max(0, Math.round(((maxSD - sdSelections) / maxSD) * 100));
            let consistencyPercent = Math.max(0, Math.round(((10 - inconsistentScoring) / 10) * 100));

            let normalizedClusters = {
                C: Math.min(24, Math.max(0, clusterScores.C + 10)),
                O: Math.min(24, Math.max(0, clusterScores.O + 10)),
                S: Math.min(24, Math.max(0, clusterScores.S + 10)),
                F: Math.min(24, Math.max(0, clusterScores.F + 10))
            };

            let sortedApostles = Object.keys(apostleScores).map(key => {
                return { name: key, score: apostleScores[key] };
            }).sort((a, b) => b.score - a.score);

            let primaryApostle = sortedApostles[0].name;
            let secondaryApostle = sortedApostles[1].name;

            const selectedExps = [];
            document.querySelectorAll('input[name="user-exp"]:checked').forEach(cb => {
                selectedExps.push(cb.value);
            });
            const customExp = document.getElementById('user-exp-custom').value.trim();
            if (customExp) selectedExps.push(customExp);

            const resultsPayload = {
                profile: {
                    name,
                    role: roleString,
                    branch: document.getElementById('user-branch').value,
                    years: document.getElementById('user-years').value,
                    exp: selectedExps.join(", ") || "無紀錄"
                },
                vectors: normalizedClusters,
                sincerity: sincerityPercent,
                consistency: consistencyPercent,
                primary: primaryApostle,
                secondary: secondaryApostle,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('alda_test_results', JSON.stringify(resultsPayload));
            renderResults(resultsPayload);
            if (window.__CTAOS_refresh) window.__CTAOS_refresh();
            switchTab('results');"""

new_scoring = """            const selectedExps = [];
            document.querySelectorAll('input[name="user-exp"]:checked').forEach(cb => {
                selectedExps.push(cb.value);
            });
            const customExp = document.getElementById('user-exp-custom').value.trim();
            if (customExp) selectedExps.push(customExp);

            const profilePayload = {
                name,
                role: roleString,
                branch: document.getElementById('user-branch').value,
                years: document.getElementById('user-years').value,
                exp: selectedExps.join(", ") || "無紀錄"
            };

            if (!window.AldaPack || typeof AldaPack.buildRun !== 'function') {
                showCustomModal("⚠️ 模組未載入", "無法載入 alda_pack.js，請以 HTTP 開啟本頁。", "❌");
                return;
            }
            const built = AldaPack.buildRun(currentAnswers, profilePayload);
            if (!built.ok) {
                showCustomModal("⚠️ 無法提交", (built.errors || []).join("\\n"), "❌");
                return;
            }
            if (window.AssessmentRunStore) AssessmentRunStore.saveRun(built.run);
            const resultsPayload = AldaPack.legacyPayloadFromRun(built.run);

            try { localStorage.setItem('alda_test_results', JSON.stringify(resultsPayload)); } catch (e) {}
            renderResults(resultsPayload);
            if (window.__CTAOS_refresh) window.__CTAOS_refresh();
            switchTab('results');"""

if old_scoring in text:
    text = text.replace(old_scoring, new_scoring)

# Remove duplicate save patch if present from earlier version
text = text.replace(
    """            if (window.AldaPack && window.AssessmentRunStore) {
                const built = AldaPack.buildRun(currentAnswers, resultsPayload.profile);
                if (built.ok && built.run) {
                    AssessmentRunStore.saveRun(built.run);
                    resultsPayload = AldaPack.legacyPayloadFromRun(built.run);
                }
            }
            try { localStorage.setItem('alda_test_results', JSON.stringify(resultsPayload)); } catch (e) {}
            renderResults(resultsPayload);
            if (window.__CTAOS_refresh) window.__CTAOS_refresh();
            switchTab('results');""",
    ""
)

# loadDemoReport
old_demo = """        function loadDemoReport() {
            const demoData = {
                profile: {
                    name: "張建信 Timothy (測試執事)",
                    role: "關懷/牧養, 財務/審計, 事工拓展委員, 雙語崇拜主責",
                    branch: "海外植堂",
                    years: "11-20年",
                    exp: "曾任本堂同工"
                },
                vectors: { C: 18, O: 13, S: 19, F: 11 },
                sincerity: 88,
                consistency: 90,
                primary: "多馬",
                secondary: "約翰",
                timestamp: new Date().toISOString()
            };
            renderResults(demoData);
            switchTab('results');
        }"""
new_demo = """        function loadDemoReport() {
            let demoData;
            if (window.AldaPack && typeof AldaPack.buildDemoRun === 'function') {
                const demo = AldaPack.buildDemoRun();
                if (demo.ok && demo.run) demoData = AldaPack.legacyPayloadFromRun(demo.run);
            }
            if (!demoData) {
                demoData = {
                    profile: { name: "張建信 Timothy (測試執事)", role: "關懷/牧養", branch: "海外植堂", years: "11-20年", exp: "曾任同工" },
                    vectors: { C: 18, O: 13, S: 19, F: 11 }, sincerity: 88, consistency: 90,
                    primary: "多馬", secondary: "約翰", timestamp: new Date().toISOString()
                };
            }
            renderResults(demoData);
            switchTab('results');
        }"""
if old_demo in text:
    text = text.replace(old_demo, new_demo)

# reset clears store
old_reset = "                localStorage.removeItem('alda_test_results');"
new_reset = """                localStorage.removeItem('alda_test_results');
                if (window.AssessmentRunStore) AssessmentRunStore.clearLatest('alda');"""
if old_reset in text and "clearLatest('alda')" not in text:
    text = text.replace(old_reset, new_reset, 1)

# onload migration
old_onload_tail = """            } else {
                // Otherwise read regular localstorage
                const storedResults = localStorage.getItem('alda_test_results');
                if (storedResults) {
                    try {
                        renderResults(JSON.parse(storedResults));
                    } catch(e) {}
                }
            }"""
new_onload_tail = """            } else {
                if (window.AldaPack && typeof AldaPack.migrateLegacyToStore === 'function') {
                    AldaPack.migrateLegacyToStore();
                }
                let payload = null;
                if (window.AssessmentRunStore) {
                    const run = AssessmentRunStore.loadLatest('alda');
                    if (run && !run.is_demo && window.AldaPack) {
                        payload = AldaPack.legacyPayloadFromRun(run);
                    }
                }
                if (!payload) {
                    const storedResults = localStorage.getItem('alda_test_results');
                    if (storedResults) {
                        try { payload = JSON.parse(storedResults); } catch(e) {}
                    }
                }
                if (payload) renderResults(payload);
            }"""
if old_onload_tail in text:
    text = text.replace(old_onload_tail, new_onload_tail)

# bridge watchStorage
old_watch = "    watchStorage: ['alda_test_results'],"
new_watch = "    watchStorage: ['alda_test_results', 'bible100_assessment_latest_alda'],"
if old_watch in text:
    text = text.replace(old_watch, new_watch)

HTML.write_text(text, encoding="utf-8")
print("Patched", HTML)
