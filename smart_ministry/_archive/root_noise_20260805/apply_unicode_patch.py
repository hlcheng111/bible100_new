# -*- coding: utf-8 -*-
from pathlib import Path

base = Path(__file__).resolve().parent
html_path = base / "talent_ministry_matching.html"
t = html_path.read_text(encoding="utf-8")

T1 = "\u96e2\u958b\u672c\u9801\uff08\u6574\u9801\u958b\u555f\uff09\uff1a\u6574\u7406\u6069\u8cdc\uff0f\u6280\u80fd\u8207\u4eba\u624d\u4e3b\u6a94"
T2 = "\u96e2\u958b\u672c\u9801\uff08\u6574\u9801\u958b\u555f\uff09\uff1a\u8499\u53ec\u670d\u4e8b\u8def\u7dda\u5716"
T3 = "\u96e2\u958b\u672c\u9801\uff08\u6574\u9801\u958b\u555f\uff09\uff1a\u9818\u8896\u5100\u8868\u677f"

old_top = (base / "old_top.txt").read_text(encoding="utf-8")
new_top = (
    "        <div class=\"topbar-actions\">\n"
    f"            <a href=\"talent_skill_unified.html\" target=\"_top\" title=\"{T1}\">\U0001f517 \u4eba\u624d\u8207\u6280\u80fd</a>\n"
    f"            <a href=\"landing.html#journey\" target=\"_top\" title=\"{T2}\">\U0001f5fa\ufe0f \u8def\u7dda\u5716</a>\n"
    f"            <a href=\"dashboard.html\" target=\"_top\" title=\"{T3}\">\U0001f3e0 \u8fd4\u56de</a>\n"
    "        </div>\n"
)
if old_top not in t:
    raise SystemExit("old_top not in html")
t = t.replace(old_top, new_top, 1)

# Toolbar: replace span + 4 buttons (exact old from file)
old_tools = """        <span style="opacity:.85;">\u5de5\u5177\uff08\u9032\u968e\uff0f\u532f\u51fa\uff09</span>
        <details id="toolsMenuDetails">
            <summary>\u958b\u555f\u5de5\u5177\u9078\u55ae \u25be</summary>
            <div class="tools-menu-inner" onclick="event.stopPropagation()">
                <button type="button" onclick="closeToolsMenu(); aiMatch();">\U0001f916 AI \u914d\u5c0d\uff08\u898f\u5247\uff09</button>
                <button type="button" onclick="closeToolsMenu(); batchMatch();">\U0001f4cb \u6279\u91cf\u914d\u5c0d</button>
                <button type="button" onclick="closeToolsMenu(); exportMatching();">\U0001f4e4 \u532f\u51fa JSON\uff08canonical\uff09</button>
                <button type="button" onclick="closeToolsMenu(); exportMatchingExcel();">\U0001f4ca \u532f\u51fa Excel\uff08CSV\uff09</button>
            </div>
        </details>"""
new_tools = """        <span style="opacity:.9;"><strong>\u5de5\u5177\u9078\u55ae</strong>\uff08\u56db\u9805\u7686\u5df2\u63a5\u597d\uff0c\u9ede \u25be \u5c55\u958b\uff1b\u6279\u6b21\u914d\u5c0d\u8207\u532f\u51fa\u5831\u8868\u7528\uff09</span>
        <details id="toolsMenuDetails">
            <summary>\u958b\u555f\u5de5\u5177\u9078\u55ae \u25be</summary>
            <div class="tools-menu-inner" onclick="event.stopPropagation()">
                <button type="button" onclick="closeToolsMenu(); aiMatch();">
                    \U0001f916 AI \u914d\u5c0d\uff08\u898f\u5247\uff09
                    <span class="tool-desc">\u4f9d\u898f\u5247\u70ba\u6bcf\u500b\u5d17\u4f4d\u5404\u914d\u4e00\u4f4d\u5019\u9078\uff08\u5206\u6578\u226560\uff09\uff0c\u5beb\u5165\u300c\u5efa\u8b70 proposed\u300d\uff1b\u4ecd\u9808\u60a8\u5be6\u969b\u9080\u8acb\u8207\u8ddf\u9032\u3002</span>
                </button>
                <button type="button" onclick="closeToolsMenu(); batchMatch();">
                    \U0001f4cb \u6279\u91cf\u914d\u5c0d
                    <span class="tool-desc">\u4e00\u6b21\u70ba\u591a\u500b\u5d17\u4f4d\u8a66\u914d\uff08\u53ef\u642d\u914d\u5de6\u5074\u300c\u6279\u91cf\u9078\u53d6\u300d\uff09\uff1b\u7b56\u7565\u898b\u4e0b\u65b9\u300c\u6279\u91cf\u914d\u5c0d\u7b56\u7565\u300d\u3002</span>
                </button>
                <button type="button" onclick="closeToolsMenu(); exportMatching();">
                    \U0001f4e4 \u532f\u51fa JSON\uff08canonical\uff09
                    <span class="tool-desc">\u5099\u4efd\u6574\u5305 Smart Ministry \u7d50\u69cb\u5316\u8cc7\u6599\uff0c\u4f9b\u9032\u968e\u540c\u5de5\u6216\u642c\u6a5f\u9084\u539f\u7528\u3002</span>
                </button>
                <button type="button" onclick="closeToolsMenu(); exportMatchingExcel();">
                    \U0001f4ca \u532f\u51fa Excel\uff08CSV\uff09
                    <span class="tool-desc">\u4e0b\u8f09\u300c\u59d3\u540d\uff0f\u5d17\u4f4d\uff0f\u5206\u6578\uff0f\u72c0\u614b\u300d\u8868\uff0c\u5e36\u53bb\u540c\u5de5\u6703\u8b70\u6700\u76f4\u89bd\u3002</span>
                </button>
            </div>
        </details>"""
if old_tools not in t:
    raise SystemExit("old_tools not found")
t = t.replace(old_tools, new_tools, 1)

# Journey strip before howto
needle = "    </div>\n\n    <div class=\"howto-box\" role=\"region\" aria-label=\"\u5982\u4f55\u4f7f\u7528\u914d\u5c0d\u5de5\u4f5c\u53f0\">"
journey = """
    <div class="journey-strip" role="region" aria-label="\u672c\u9801\u4e0a\u4e0b\u6587">
        <strong>\u5c0f\u767d\u5148\u770b\uff1a\u9019\u9801\u5728\u4e0a\u3001\u4e0b\u6587\u4e2d\u505a\u4ec0\u9ebc\uff1f</strong>
        <ul>
            <li><em>\u5f9e\u54ea\u4f86</em> \u6703\u53cb\uff0f\u4eba\u624d\u8cc7\u6599\u4f86\u81ea<strong>\u8a3b\u518a\u3001\u554f\u5377\u3001\u300c\u4eba\u624d\u8207\u6280\u80fd\u300d</strong>\uff0c\u5b58\u5728\u60a8\u9019\u53f0\u96fb\u8166\u7684\u672c\u6a5f\uff08\u4e0d\u662f\u96f2\u7aef\u81ea\u52d5\u540c\u6b65\uff09\u3002</li>
            <li><em>\u5728\u9019\u505a\u4ec0\u9ebc</em> \u628a<strong>\u4e00\u4f4d\u4eba</strong>\u8207<strong>\u4e00\u500b\u4e8b\u5de5\u5d17\u4f4d</strong>\u653e\u4e00\u8d77\uff0c\u6309<strong>\u8a08\u7b97\u5339\u914d\u5ea6</strong>\u770b\u898f\u5247\u5efa\u8b70\u5206\uff1b\u5408\u610f\u518d\u6309<strong>\u78ba\u8a8d\u8a18\u9304\u9080\u8acb</strong>\u7559\u4e0b\u7d00\u9304\uff08\u4ecd\u8981\u5be6\u969b\u9080\u8acb\u8207\u79b1\u544a\u5206\u8fa8\uff09\u3002</li>
            <li><em>\u5230\u54ea\u53bb</em> \u7528\u5de5\u5177\u9078\u55ae<strong>\u532f\u51fa CSV\uff0fJSON</strong>\u958b\u6703\u6216\u5099\u4efd\uff1b<strong>\u8fd4\u56de</strong>\u770b\u9818\u8896\u5100\u8868\u677f\uff1b\u4e3b\u7dda\u4e0b\u4e00\u7ad9\u53ef\u958b<strong>\u4eba\u624d\u767c\u5c55\u8ffd\u8e64</strong>\u770b\u6642\u9593\u7dda\u3002</li>
        </ul>
    </div>
"""
if needle not in t:
    raise SystemExit("howto needle not found")
t = t.replace(needle, "    </div>" + journey + "\n    <div class=\"howto-box\" role=\"region\" aria-label=\"\u5982\u4f55\u4f7f\u7528\u914d\u5c0d\u5de5\u4f5c\u53f0\">", 1)

# Score block: by markers
a, b = '<div class="center-score" id="scoreDisplay"', '<div class="match-details" id="matchDetails"'
i0, i1 = t.index(a), t.index(b)
new_score = """                <div class="center-score" id="scoreDisplay" style="display:none;">
                    <div class="score-num" id="matchScore">0</div>
                    <div class="score-label">\u898f\u5247\u5efa\u8b70\u5206\uff080\u2013100\uff0c\u6eff\u5206\uff09</div>
                    <div class="score-pair-line" id="scorePairLabel"></div>
                    <p class="score-pair-line" id="scoreMeaning" style="font-weight:400;opacity:.9;margin-top:6px;font-size:9px;">
                        \u6b64\u5206\u6578\u4f9d\u6280\u80fd\u3001\u6069\u8cdc\u3001\u6027\u683c\u7b49\u898f\u5247\u52a0\u7e3d\uff0c\u662f<strong>\u540c\u5de5\u53c3\u8003\u7528</strong>\uff0c\u4e0d\u662f\u8003\u8a66\u6210\u7e3c\u3002\u53f3\u4e0a\u89d2\u7da0\uff0f\u7d05\u5feb\u986f\u6703\u7c21\u77ed\u8aaa\u660e\u300c\u63a5\u4e0b\u4f86\u53ef\u4ee5\u600e\u9ebc\u505a\u300d\u3002
                    </p>
                </div>

                """
t = t[:i0] + new_score + t[i1:]

# History selects
old_hist = """                <select id="historySourceFilter" onchange="renderHistory()">
                    <option value="">\u4f86\u6e90\uff08\u5168\u90e8\uff09</option>
                    <option value="manual_confirm">manual_confirm</option>
                    <option value="ai_auto">ai_auto</option>
                    <option value="batch_rules">batch_rules</option>
                </select>
                <select id="historyStatusFilter" onchange="renderHistory()">
                    <option value="">\u72c0\u614b\uff08\u5168\u90e8\uff09</option>
                    <option value="invited">invited</option>
                    <option value="proposed">proposed</option>
                </select>"""
new_hist = """                <select id="historySourceFilter" onchange="renderHistory()" title="\u9019\u4e9b\u7d00\u9304\u600e\u9ebc\u7522\u751f\u7684">
                    <option value="">\u4f86\u6e90\uff08\u5168\u90e8\uff09</option>
                    <option value="manual_confirm">\u540c\u5de5\u624b\u52d5\u78ba\u8a8d\uff08manual_confirm\uff09</option>
                    <option value="ai_auto">\u5de5\u5177\u00b7AI \u898f\u5247\u6279\u6b21\uff08ai_auto\uff09</option>
                    <option value="batch_rules">\u5de5\u5177\u00b7\u6279\u91cf\u898f\u5247\uff08batch_rules\uff09</option>
                </select>
                <select id="historyStatusFilter" onchange="renderHistory()" title="\u9080\u8acb\u9032\u5ea6\u6a19\u7c64">
                    <option value="">\u72c0\u614b\uff08\u5168\u90e8\uff09</option>
                    <option value="invited">\u5df2\u767c\u9080\u8acb\uff08invited\uff09</option>
                    <option value="proposed">\u50c5\u5efa\u8b70\uff08proposed\uff09</option>
                </select>"""
if old_hist not in t:
    raise SystemExit("history not found")
t = t.replace(old_hist, new_hist, 1)

# Yellow box links
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

# Center actions
old_ca = """                <div class="center-actions">
                    <button type="button" onclick="calculateMatch()">\U0001f3af \u8ba1\u7b97\u5339\u914d\u5ea6</button>
                    <button type="button" onclick="assignMinistry()">\u2705 \u78ba\u8a8d\u8a18\u9304\u9080\u8acb</button>
                    <button type="button" onclick="viewHistory()">\U0001f4dc \u67e5\u770b\u5386\u53f2</button>
                </div>"""
new_ca = """                <div class="center-actions">
                    <div class="action-wrap">
                        <button type="button" onclick="calculateMatch()">\U0001f3af \u8ba1\u7b97\u5339\u914d\u5ea6</button>
                        <p class="action-help"><strong>\u7528\u9014\uff1a</strong>\u53ea<strong>\u9810\u89bd</strong>\u300c\u76ee\u524d\u9019\u7d44\u4eba\u00d7\u5d17\u300d\u5728\u898f\u5247\u4e0b\u7684\u5206\u6578\uff0c<strong>\u4e0d\u6703\u5b58\u6a94</strong>\u3002\u53ef\u63db\u4eba\u3001\u63db\u5d17\u53cd\u8907\u8a66\uff0c\u5408\u610f\u518d\u6309\u300c\u78ba\u8a8d\u8a18\u9304\u9080\u8acb\u300d\u3002</p>
                    </div>
                    <div class="action-wrap">
                        <button type="button" onclick="assignMinistry()">\u2705 \u78ba\u8a8d\u8a18\u9304\u9080\u8acb</button>
                        <p class="action-help"><strong>\u7528\u9014\uff1a</strong>\u628a\u9019\u7d44\u914d\u5c0d<strong>\u5beb\u5165\u672c\u6a5f</strong>\uff08\u72c0\u614b\uff1a\u9080\u8acb invited\uff09\uff0c\u65b9\u4fbf\u958b\u6703\u8ffd\u8e64\uff1b<strong>\u4e0d\u6703</strong>\u81ea\u52d5\u901a\u77e5\u5c0d\u65b9\uff0c\u4ecd\u9760\u60a8\u53e3\u982d\uff0f\u8a0a\u606f\u9080\u8acb\u3002</p>
                    </div>
                    <div class="action-wrap">
                        <button type="button" onclick="viewHistory()">\U0001f4dc \u67e5\u770b\u5386\u53f2</button>
                        <p class="action-help"><strong>\u7528\u9014\uff1a</strong>\u6253\u958b\u53ef\u6372\u52d5<strong>\u5831\u8868</strong>\uff0c\u4f9d\u4f86\u6e90\uff0f\u72c0\u614b\u7be9\u9078\u3001<strong>\u532f\u51fa CSV</strong>\uff1b\u300c\u56de\u6efe\u300d\u53ef\u64a4\u92b7\u55ae\u7b46\u914d\u5c0d\u3002</p>
                    </div>
                </div>"""
if old_ca not in t:
    raise SystemExit("center-actions not found")
t = t.replace(old_ca, new_ca, 1)

# Footer
old_f = """        <a href="../docs/CLOUD_BAAS_AND_CROSS_MODULE.md">CLOUD_BAAS_AND_CROSS_MODULE.md</a>。
        \u5efa\u8b70\u4e0b\u4e00\u8f2a\u985e\u4f3c UX \u6539\u826f\uff1a<code>talent_skill_unified.html</code>\u3001<code>talent_tracking.html</code>\u3002"""
new_f = """        <a href="../docs/CLOUD_BAAS_AND_CROSS_MODULE.md" target="_top">CLOUD_BAAS_AND_CROSS_MODULE.md</a>。
        \u4e3b\u7dda\u4e0b\u4e00\u7ad9\uff1a<a href="talent_tracking.html" target="_top"><code>talent_tracking.html</code> \u00b7 \u4eba\u624d\u767c\u5c55\u8ffd\u8e64</a>\u3002"""
if old_f not in t:
    raise SystemExit("footer not found")
t = t.replace(old_f, new_f, 1)

# JS: calculateMatch clarity
old_js = """            document.getElementById('matchScore').textContent = totalScore;
            document.getElementById('scoreDisplay').style.display = 'block';

            document.getElementById('matchReasons').innerHTML =
                '<div class="match-item"><span>\u6280\u80fd\u5339\u914d</span><span>' + skillScore + '\u5206</span></div>' +
                '<div class="match-item"><span>\u6069\u8d50\u5951\u5408</span><span>' + giftScore + '\u5206</span></div>' +
                '<div class="match-item"><span>\u6027\u683c\u9002\u914d</span><span>' + mbtiScore + '\u5206</span></div>';
            document.getElementById('matchDetails').style.display = 'block';

            if (totalScore >= 80) msg('\u6781\u529b\u63a8\u8350\uff01\u5339\u914d\u5ea6\uff1a' + totalScore + '\u5206');
            else if (totalScore >= 60) msg('\u63a8\u8350\u914d\u5bf9\uff0c\u5339\u914d\u5ea6\uff1a' + totalScore + '\u5206');
            else msg('\u5339\u914d\u5ea6\u8f83\u4f4e\uff1a' + totalScore + '\u5206\uff0c\u5efa\u8bae\u91cd\u65b0\u8003\u8651', 'error');
"""
new_js = """            document.getElementById('matchScore').textContent = totalScore;
            document.getElementById('scoreDisplay').style.display = 'block';
            var pairEl = document.getElementById('scorePairLabel');
            if (pairEl) {
                pairEl.textContent = (selectedTalent.name || '') + ' \u00d7 ' + (selectedMinistry.name || '') + ' \u00b7 \u672c\u6b21\u898f\u5247\u5efa\u8b70\u5206\uff08\u8ab0\u914d\u54ea\u5d17\uff09';
            }

            document.getElementById('matchReasons').innerHTML =
                '<div class="match-item"><span>\u6280\u80fd\u5339\u914d</span><span>' + skillScore + '\u5206</span></div>' +
                '<div class="match-item"><span>\u6069\u8d50\u5951\u5408</span><span>' + giftScore + '\u5206</span></div>' +
                '<div class="match-item"><span>\u6027\u683c\u9002\u914d</span><span>' + mbtiScore + '\u5206</span></div>';
            document.getElementById('matchDetails').style.display = 'block';

            var tn = selectedTalent.name || '';
            var mn = selectedMinistry.name || '';
            if (totalScore >= 80) {
                msg('\u898f\u5247\u5206 ' + totalScore + '\uff08\u504f\u9ad8\uff09\u3002\\n\u9019\u662f\u300c' + tn + '\u300d\u914d\u300c' + mn + '\u300d\u7684\u53c3\u8003\u5206\uff1b\u53ef\u6309\u300c\u78ba\u8a8d\u8a18\u9304\u9080\u8acb\u300d\u5b58\u6a94\uff0c\u6216\u63db\u4eba\u518d\u7b97\u3002');
            } else if (totalScore >= 60) {
                msg('\u898f\u5247\u5206 ' + totalScore + '\uff08\u4e2d\u7b49\uff09\u3002\\n\u53ef\u4f5c\u540c\u5de5\u53c3\u8003\uff1b\u82e5\u8981\u7559\u4e0b\u7d00\u9304\u8acb\u8207\u79b1\u544a\u5206\u8fa8\u3002');
            } else {
                msg('\u898f\u5247\u5206 ' + totalScore + '\uff08\u504f\u4f4e\uff09\u3002\\n\u5efa\u8b70\u63db\u4eba\u6216\u88dc\u6599\u6599\uff1b\u82e5\u4ecd\u8981\u8a18\u9304\uff0c\u6309\u300c\u78ba\u8a8d\u8a18\u9304\u9080\u8acb\u300d\u524d\u6703\u518d\u8acb\u60a8\u78ba\u8a8d\u3002', 'error');
            }
"""
if old_js not in t:
    raise SystemExit("calculateMatch js not found")
t = t.replace(old_js, new_js, 1)

t = t.replace(
    "            msg('\u5206\u914d\u6210\u529f\uff01\u5339\u914d\u5ea6\uff1a' + score + '\u5206');",
    "            msg('\u5df2\u8a18\u9304\uff1a' + (selectedTalent.name || '') + ' \u2192 ' + (selectedMinistry.name || '') + '\uff08\u5206\u6578 ' + score + '\uff0c\u72c0\u614b\u300c\u9080\u8acb\u300d\uff09\u3002\\n\u8acb\u5be6\u969b\u806f\u7d61\u5c0d\u65b9\uff1b\u82e5\u8981\u6e05\u55ae\u53ef\u6309\u300c\u67e5\u770b\u6b77\u53f2\u300d\u6216\u532f\u51fa CSV\u3002');",
    1,
)

html_path.write_text(t, encoding="utf-8")
print("OK")
