/**
 * Tab ④ 優先序決策桌 · Q2 守門模板
 */
(function (global) {
  "use strict";

  var Q2_BANNER =
    '<div id="urgency-q2-banner" class="urgency-q2-banner hidden" role="alert">' +
    "<h3>Q2 重要不緊急 · 時段失守（已觸發）</h3>" +
    "<p>靈修、門訓、家庭與長期規劃被 Q1 救火與 Q3 瑣事挤掉。本會決定：本季優先<strong>固定 Q2 時段</strong>，" +
    "暫緩非核心新承諾，並把要守住的 Q2 寫進 SMART 試行。</p></div>";

  var DESK_BODY =
    '<article id="urgency-desk-body">' +
    "<h3>一、開會前禱告</h3><p>主啊，幫助我們誠實看見精力花在哪，不是比誰更會管理時間。阿們。</p>" +
    "<h3>二、宣讀四象限</h3><p>宣讀 Q1–Q4 百分比與 Tab ③ 行動建議。靜默十秒。</p>" +
    "<h3>三、Eisenhower 教會化守則</h3><ul><li>Q2 是防過勞的命脈，不是「有空再做」。</li>" +
    "<li>Q1 高不代表敬虔，可能是界線失守。</li><li>Q3 高要練習 RACI 說不。</li></ul>" +
    "<h3>四、【Q2 偏低】照讀模板</h3>" +
    '<blockquote class="urgency-quote urgency-quote--red" id="urgency-q2-read">' +
    "「Q2 僅 <span id=\"urgency-desk-q2-val\">18</span>%，表示重要但不急的深度事工被挤掉。" +
    "決議：下月起每週鎖定 __ 小時 Q2，會議不得占用；並連結 " +
    '<a href="Church_Governance_SMART_goals.html">SMART 快評</a> 寫成可守住目標。」</blockquote>' +
    "<h3>五、與 SMART / RACI 銜接</h3><p>Q2 項目 → SMART；Q3 過多 → RACI 釐清主責。</p>" +
    "<h3>六、90 分鐘議程</h3><ol><li>禱告 10 分</li><li>宣讀象限 20 分</li>" +
    "<li>選一象限行動 30 分</li><li>若 Q2 偏低照讀 15 分</li><li>決議 15 分</li></ol>" +
    "<h3>七、常見誤區</h3><ul><li>把矩陣當考核排名</li><li>只追 Q1 救火</li></ul>" +
    "<p class=\"text-xs text-slate-500 mt-4\">HITL：AI 草稿須審核。</p></article>";

  function applyDeskState(run) {
    var q2Low = run && run.risk_flags && run.risk_flags.indexOf("Q2_BELOW_TARGET") >= 0;
    var banner = document.getElementById("urgency-q2-banner");
    var status = document.getElementById("urgency-desk-status");
    if (banner) banner.classList.toggle("hidden", !q2Low);
    if (status) {
      status.innerHTML = q2Low
        ? "<p class=\"text-rose-800 font-bold\">【警報】Q2 偏低 · 請宣讀固定時段模板。</p>"
        : "<p>Q2 在可管理範圍，仍建議每季檢視。</p>";
    }
    var el = document.getElementById("urgency-desk-q2-val");
    if (el && run && run.derived) el.textContent = String(run.derived.q2_pct || "—");
  }

  function mountStaticDesk() {
    var host = document.getElementById("urgency-tab-methodology-content");
    if (!host || host.querySelector("#urgency-desk-body")) return;
    host.innerHTML =
      '<div class="acs-card"><h2 class="font-black text-amber-900 mb-2">4. 優先序決策桌</h2>' +
      Q2_BANNER +
      '<div id="urgency-desk-status"></div>' +
      DESK_BODY +
      "</div>";
  }

  global.UrgencyPastoralDesk = { mountStaticDesk: mountStaticDesk, applyDeskState: applyDeskState };
})(typeof window !== "undefined" ? window : global);
