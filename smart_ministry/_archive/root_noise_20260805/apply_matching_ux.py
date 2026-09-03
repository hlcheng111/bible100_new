# -*- coding: utf-8 -*-
"""Apply UX copy + navigation fixes to talent_ministry_matching.html."""
from pathlib import Path

p = Path(__file__).resolve().parent / "talent_ministry_matching.html"
t = p.read_text(encoding="utf-8")

# --- center-score block (replace mojibake, clarify for beginners)
a, b = '<div class="center-score" id="scoreDisplay"', '<div class="match-details" id="matchDetails"'
i0, i1 = t.index(a), t.index(b)
new_score = """                <div class="center-score" id="scoreDisplay" style="display:none;">
                    <div class="score-num" id="matchScore">0</div>
                    <div class="score-label">建議分（0–100，��分）</div>
                    <div class="score-pair-line" id="scorePairLabel"></div>
                    <p class="score-pair-line" id="scoreMeaning" style="font-weight:400;opacity:.9;margin-top:6px;font-size:9px;">
                        此分數依技能、、性格等規，是<strong>考用</strong>，不是考。右上角��／短��明「接下來可以怎��做」。
                    </p>
                </div>

                """
t = t[:i0] + new_score + t[i1:]

# --- topbar: target="_top" for index_v5 / iframe shells
old_top = """        <div class="topbar-actions">
            <button type="button" onclick="location.href='talent_skill_unified.html'" title="管理技能映射">🔗技能</button>
            <button type="button" onclick="location.href='landing.html#journey'" title="蒙召服事">���️�</button>
            <button type="button" onclick="location.href='dashboard.html'">�� 返回</button>
        </div>"""
new_top = """        <div class="topbar-actions">
            <a href="talent_skill_unified.html" target="_top" title="離開開��）：整理">�技能</a>
            <a href="landing.html#journey" target="_top" title="離開本��（）：蒙召服">���️�</a>
            <a href="dashboard.html" target="_top" title="離開本��（整表板">�� 返回</a>
        </div>"""
if old_top not in t:
    raise SystemExit("topbar block not found")
t = t.replace(old_top, new_top, 1)

# --- toolbar: clarify + per-item blurbs
old_tools = """        <span style="opacity:.85;">工具出）</span>
        <details id="toolsMenuDetails ��</summary>
            <div class="tools-menu-inner" onclick="event.stopPropagation()">
                <button type="button" onclick="closeTools AI 配對）</button>
                <button type="button" onclick="closeToolsMenu(); batchMatch();">�� 批量配對</button>
                <button type="button" onclick="closeToolsMenu(); exportMatching();">�出 JSON（canonical）</button>
                <button type="button" onclick="closeToolsMenu(); exportMatching ��出 Excel（CSV）</button>
            </div>
        </details>"""
new_tools = """        <span style="opacity:.9;"><strong</strong>（四項皆已 �� 展開；批次配�出報表用）</span>
        <details id="toolsMenuDetails">
            <summary>開��工具�</summary>
            <div class="tools-menu-inner" onclick="event.stopPropagation()">
                <button type="button" onclick="closeToolsMenu(); aiMatch();">
                    �� AI 配對（規��）
                    <span class="tool-desc">為每個��位各配一位候選（分數≥60），��入「建議 proposed您���跟進。</span>
                </button>
                <button type="button" onclick="closeToolsMenu(); batchMatch(); 批量配對
                    <span class="tool-desc">一次�位試配（可搭配左側「批量選取」）；策略見下方「批量配對策略」。</span>
                </button>
                <button type="button" onclick="closeToolsMenu(); exportMatching();">
                    �� ��出 JSON（canonical）
                    <span class="tool-desc">備份整包 Smart Ministry 結進���用。</span>
                </button>
                <button type="button" onclick="closeToolsMenu(); exportMatchingExcel(); ��出 Excel（CSV）
                    <span class="tool-desc">下載「姓名／��位／分數／��態。</span>
                </button>
            </div>
        </details>"""
if old_tools not in t:
    raise SystemExit("toolbar block not found")
t = t.replace(old_tools, new_tools, 1)

# --- journey context strip
journey = """
    <div class="journey-strip" role="region" aria-label="本��上下文">
        <strong>小白先看：這��在上、下文��做什��？</strong>
        <ul>
            <li><em>��哪來</em> 會友／人才資料來自<strong、問卷、「</strong>，存在您這台電��的本機（不是��端自動同步）。</li>
            <li><em>在這做什��</em> 把<strong>一位人</strong>��<strong>一個事位</strong>放一起，按<strong>計算匹配度</strong建議分；��意再按<strong>確認記��邀請</�）。</li>
            <li><em>到哪去</em> 用工具選��<strong>��出 CSV／JSON</strong>開會或備份；<strong>返回</strong�；主線下一站可開<strong</strong>看時間線。</li>
        </ul>
    </div>
"""
needle = "    </div>\n\n    <div class=\"howto-box\" role=\"region\" aria-label=\"如何使用配對工作台\">"
if needle not in t:
    raise SystemExit("howto needle not found")
t = t.replace(needle, "    </div>" + journey + "\n    <div class=\"howto-box\" role=\"region\" aria-label=\"如何使用配對工作台\">", 1)

# --- history dropdown labels
old_hist = """                <select id="historySourceFilter" onchange="renderHistory()">
                    <option value="">來源（全部）</option>
                    <option value="manual_confirm">manual_confirm</option>
                    <option value="ai_auto">ai_auto</option>
                    <option value="batch_rules">batch_rules</option>
                </select>
                <select id="historyStatusFilter" onchange="renderHistory()態（全部）</option>
                    <option value="invited">invited</option>
                    <option value="proposed">proposed</option>
                </select>"""
new_hist = """                <select id="historySourceFilter" onchange="renderHistory()" title="生的">
                    <option value="">來源（全部）</option>
                    <option value="manual_confirm">同工手動確認（manual_confirm）</option>
                    <option value="ai_auto">工具·AI 規��批次（ai_auto）</option>
                    <option value="batch_rules">工具·批量規��（batch_rules）</option>
                </select>
                <select id="historyStatusFilter" onchange="renderHistory()" title="邀請進度標��">
                    <option value="">��態（全部）</option>
                    <option value="invited">已發邀請（invited）</option>
                    <option value="pro�建議（proposed）</option>
                </select>"""
if old_hist not in t:
    raise SystemExit("history block not found")
t = t.replace(old_hist, new_hist, 1)

# --- doc links
t = t.replace(
    '<a href="talent_skill_unified.html" style="color:#4338ca;font-weight:600;">',
    '<a href="talent_skill_unified.html" target="_top" style="color:#4338ca;font-weight:600;">',
    1,
)
t = t.replace(
    '<a href="../docs/CLOUD_BAAS_AND_CROSS_MODULE.md" style="color:#4338ca;">',
    '<a href="../docs/CLOUD_BAAS_AND_CROSS_MODULE.md" target="_top" style="color:#4338ca;">',
    1,
)

# --- center action buttons + help
old_ca = """                <div class="center-actions">
                    <button type="button" onclick="calculate 计算匹配度</button>
                    <button type="button" onclick="assignMinistry()">���邀請</button>
                    <button type="button" onclick 查看历史</button>
                </div>"""
new_ca = """                <div class="center-actions">
                    <div class="action-wrap">
                        <button type="button" onclick="calculateMatch()">��� 计算匹配度</button>
                        <p class="action-help"><strong>用途�</strong>「目前這組人×��」在規��下的分數，<strong>不會存��</strong>。可換�反覆試�意再按邀請」。</p>
                    </div>
                    <div class="action-wrap">
                        <button type="button" onclick="assignMinistry()">�� 確認記��邀請</button>
                        <p class="action-help"><strong>用途：</strong>把這組配對<strong入本機</態：邀請 invited），方便開會追��；<strong>不會</strong>自動通知對方，仍靠您息邀請。</p>
                    </div>
                    <div class="action-wrap">
                        <button type="button" onclick="view 查看历史</button>
                        <p class="action-help"><strong>用途：</strong>打�動<strong>報表</strong>，依態��選、出 CSV</strong配對。</p>
                    </div>
                </div>"""
if old_ca not in t:
    raise SystemExit("center-actions not found")
t = t.replace(old_ca, new_ca, 1)

# --- footer
old_f = """        <a href="../docs/CLOUD_BAAS_AND_CROSS_MODULE.md">CLOUD_BAAS_AND_CROSS_MODULE.md</a>。
        類似 UX 改良：<code>talent_skill_unified.html</code>、<code>talent_tracking.html</code>。"""
new_f = """        <a href="../docs/CLOUD_BAAS_AND_CROSS_MODULE.md" target="_top">CLOUD_BAAS_AND_CROSS_MODULE.md</a>。
        主線下一站：<a href="talent_tracking.html" target="_top"><code>talent_tracking.html</code> · 人才發展追��</a>。"""
if old_f not in t:
    raise SystemExit("footer not found")
t = t.replace(old_f, new_f, 1)

# --- calculateMatch: fill scorePairLabel + clearer toasts
old_calc = """            document.getElementById('matchScore').textContent = totalScore;
            document.getElementById('scoreDisplay').style.display = 'block';

            document.getElementById('matchReasons').innerHTML =
 '<div class="match-item"><span>技能匹配</span><span>' + skillScore + '分</span></div>' +
                '<div class="match-item"><span>恩赐契合</span><span>' + giftScore + '分</span></div>' +
                '<div class="match-item"><span>性格适配</span><span>' + mbtiScore + '分</span></div>';
            document.getElementById('matchDetails').style.display = 'block';

            if (totalScore >= 80) msg('极力推荐！匹配度：' + totalScore + '分');
            else if (totalScore >= 60) msg('推荐配对，匹配度：' + totalScore + '分');
            else msg('匹配度较低：' + totalScore + '分，建议重新考虑', 'error');
"""
new_calc = """            document.getElementById('matchScore').textContent = totalScore;
            document.getElementById('scoreDisplay').style.display = 'block';
            var pairEl = document.getElementById('scorePairLabel');
            if (pairEl) {
                pairEl.textContent = (selectedTalent.name || '') + ' × ' + (selectedMinistry.name || '') + ' ·建議分（看�配）';
            }

            document.getElementById('matchReasons').innerHTML =
                '<div class="match-item"><span>技能匹配</span><span>' + skillScore + '分</span></div>' +
                '<div class="match-item"><span>恩赐契合</span><span>' + giftScore + '分</span></div>' +
                '<div class="match-item"><span>性格适配</span><span>' + mbtiScore + '分</span></div>';
            document.getElementById('matchDetails').style.display = 'block';

            if (totalScore >= 80) {
                msg('規分 ' + totalScore + '（偏高）。\\n這只是「' + (selectedTalent.name || '') + '」配「' + (selectedMinistry.name || '') + '」考；可按邀請」存，或換人再算。');
            } else if (totalScore >= 60) {
                msg分 ' + totalScore + '（中等）。\\n考；若要留按再�告分辨。');
            } else {
                msg('規��分 ' + totalScore + '（偏低）。\\n建議換�位或再料；若仍要會您確認。', 'error');
            }
"""
if old_calc not in t:
    raise SystemExit("calculateMatch snippet not found")
t = t.replace(old_calc, new_calc, 1)

old_assign_msg = "            msg('分配成功！匹配度：' + score + '分');"
new_assign_msg = "            msg('已記��：' + (selectedTalent.name || '') + ' → ' + (selectedMinistry.name || '') + '（分數 ' + score + '）�態為「邀請」；請���對方。可按「查看��史」或��出 CSV開會。');"
if old_assign_msg not in t:
    raise SystemExit("assign msg not found")
t = t.replace(old_assign_msg, new_assign_msg, 1)

p.write_text(t, encoding="utf-8")
print("done")
