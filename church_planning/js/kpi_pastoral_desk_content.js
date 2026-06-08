/**
 * Tab ④ 忠心管家決策桌 · 馬太 25 託付神學模板
 */
(function (global) {
  "use strict";

  var MATT25_BANNER_HTML =
    '<div id="kpi-matt25-banner" class="kpi-matt25-banner hidden" role="alert">' +
    "<h3>馬太福音 25:14–30 · 資源重新配置（已觸發）</h3>" +
    "<p>資源卡關率 ≥70%：主人在遠方，交託各樣才幹。我們須誠實數算五千、二千、一千兩銀子的用法，" +
    "而非用 KPI 製造罪咎或比較。</p></div>";

  var DESK_BODY_HTML =
    '<article class="kpi-desk-article" id="kpi-desk-static-body">' +
    "<h3>一、開會前禱告</h3>" +
    "<p>天父，感謝你託付我們各樣恩賜與資源。今天我們不是來追問誰沒達標，而是來問：" +
    "我們是否忠心地運用你所交託的，使更多人認識基督、得著牧養？" +
    "求你保守我們不用數字傷害弟兄姊妹的心。阿們。</p>" +
    "<h3>二、宣讀漏斗數據</h3>" +
    "<p>宣讀：聖工健康度、異象對齊%、資源卡關率、四支柱分數。靜默十秒。</p>" +
    "<h3>三、德魯克 MBO 教會化原則</h3>" +
    "<ul><li><strong>目標</strong>必須回答「誰的生命被改變」。</li>" +
    "<li><strong>衡量</strong>必須可觀察、可討論，不是活動清單。</li>" +
    "<li><strong>回顧</strong>以學習為主，不以追責為主。</li></ul>" +
    "<h3>四、OKR 與牧養平衡</h3>" +
    "<p>KR 向度偏低時，請把「探訪次數」改寫為「被探訪者感到被記念的比例」。" +
    "生命向度偏低時，請主任牧師否決任何會製造罪咎感的指標。</p>" +
    "<h3>五、【資源卡關】馬太 25 忠心管家照讀（卡關率 ≥70%）</h3>" +
    "<blockquote class=\"kpi-quote kpi-quote--red\" id=\"kpi-stuck-read-aloud\">" +
    "「各位同工，漏斗顯示我們的<strong>資源卡關率已達 <span id=\"kpi-desk-stuck-val\">70</span>%</strong>。" +
    "這多半不是你不夠努力，而是目標、節奏與後勤沒對齊。" +
    "本會依照馬太福音 25 章託付比喻的精神，決定：<strong>暫緩新增 KR</strong>，" +
    "啟動 <a href=\"Church_Governance_8020_focus.html\">80/20 資源聚焦儀</a>，" +
    "把人力從低影響、高耗損事工轉向本季唯一主線。" +
    "我們要對主交帳，不是對會議室交帳——數字是為彼此扶持，不是淘汰。」</blockquote>" +
    "<h3>六、資源傾斜決議模板</h3>" +
    "<blockquote class=\"kpi-quote kpi-quote--green\">" +
    "「本會確認 ______ 事工 KR 本季健康度達標。決議：下季預備金傾斜 ____%，" +
    "並每季以學習式檢視取代排名。」</blockquote>" +
    "<h3>七、季度回顧三問（固定）</h3>" +
    "<ol><li>我們是在量神的收成，還是量我們有多忙？</li>" +
    "<li>誰會因這組指標最累？我們願意調整嗎？</li>" +
    "<li>下一季要先慶祝什麼、再調整什麼？</li></ol>" +
    "<h3>八、90 分鐘議程</h3>" +
    "<p>0–10 禱告；10–25 宣讀漏斗；25–45 討論三問；45–65 若卡關≥70% 宣讀馬太 25 模板；" +
    "65–80 決議資源傾斜；80–90 閉會。</p>" +
    "<h3>九、與 SWOT／NCD 銜接</h3>" +
    "<p>若 SWOT 主軸已鎖定，本年度 KR 不得另起爐灶。若 NCD 破口未處理，請下調 KR 數量，先守一條主線。</p>" +
    "<h3>十、與 PDCA 銜接</h3>" +
    "<p>選一項 KR 寫入下季 PDCA 快評的 season_focus，八週後對照 Δ 是否下降。</p>" +
    "<h3>十一、秘書跟進</h3>" +
    "<ol><li>48 小時內發紀錄。</li><li>一週內更新 KR 白話摘要牆。</li><li>季末學習式檢視。</li></ol>" +
    "<h3>十二、常見誤區</h3>" +
    "<ul><li>「KPI 就是考績」— 本堂明訂非考核。</li>" +
    "<li>「數字好看就繼續衝」— 須同時看生命向度。</li></ul>" +
    "<h3>十三、給主任牧師備忘</h3>" +
    "<p>若同工因指標焦慮，請主動降低可見度，改為牧者私下陪談，避免公開排名。</p>" +
    "<h3>十四、閉會宣告</h3>" +
    "<p>「願我們在小事上忠心，直到主再來。」</p>" +
    "<p class=\"text-xs text-slate-500 mt-4\">本模板不取代牧者判斷；HITL：AI 草稿須審核。</p>" +
    "</article>";

  function applyDeskState(run) {
    var stuck =
      run &&
      run.derived &&
      run.derived.resource_stuck_rate != null &&
      run.derived.resource_stuck_rate >= 70;
    var banner = document.getElementById("kpi-matt25-banner");
    var status = document.getElementById("kpi-desk-status");
    if (banner) banner.classList.toggle("hidden", !stuck);
    if (status) {
      status.innerHTML = stuck
        ? "<p class=\"text-rose-800 font-bold\">【警報】資源卡關 ≥70% · 請宣讀馬太 25 模板並啟動 80/20。</p>"
        : "<p>卡關率在可管理範圍，可照常季度檢視。</p>";
    }
    var el = document.getElementById("kpi-desk-stuck-val");
    if (el && run && run.derived) el.textContent = String(run.derived.resource_stuck_rate || 70);
  }

  function mountStaticDesk() {
    var host = document.getElementById("kpi-tab-methodology-content");
    if (!host || host.querySelector("#kpi-desk-static-body")) return;
    host.innerHTML =
      '<div class="acs-card kpi-desk-wrap"><h2 class="font-black text-indigo-900 mb-2">4. 忠心管家決策桌</h2>' +
      MATT25_BANNER_HTML +
      '<div id="kpi-desk-status" class="kpi-desk-status"></div>' +
      DESK_BODY_HTML +
      "</div>";
  }

  global.KpiPastoralDesk = {
    mountStaticDesk: mountStaticDesk,
    applyDeskState: applyDeskState
  };
})(typeof window !== "undefined" ? window : global);
