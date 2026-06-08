/**
 * Tab ④ SMART 守門決策桌 · 箴言 16:3 / 路加 14:28–30 試行神學模板
 */
(function (global) {
  "use strict";

  var LOAD_BANNER_HTML =
    '<div id="smart-load-banner" class="smart-load-banner hidden" role="alert">' +
    "<h3>箴言 16:3 · 負載守門（已觸發）</h3>" +
    "<p>「你所作的，要交託耶和華，你所謀的，就必成立。」我們不是用 SMART 把同工壓垮，" +
    "而是在加一項事工之前，誠實數算代價、預留綠洲，必要時暫緩擴張。</p></div>";

  var DESK_BODY_HTML =
    '<article class="smart-desk-article" id="smart-desk-static-body">' +
    "<h3>一、開會前禱告</h3>" +
    "<p>主啊，感謝你讓我們可以為一個具體計畫禱告、數算，而不是用口號催促彼此。求你保守我們：" +
    "不要把 SMART 變成 KPI 考核，不要用分數公開排名，不要讓最認真的同工最先枯乾。阿們。</p>" +
    "<h3>二、宣讀漏斗三指標</h3>" +
    "<p>宣讀：對齊度、負載分、可行度，以及 Tab ③ 四齒輪 P/D/C/A 診斷標題。靜默十秒。</p>" +
    "<h3>三、SMART 教會化守則（非 KPI 化）</h3>" +
    "<ul><li><strong>S 具體</strong>：說清「誰受益」，不是「全教會都要更屬靈」。</li>" +
    "<li><strong>M 可衡量</strong>：用可觀察記號，不是冷冰冰排名表。</li>" +
    "<li><strong>A/T 可行與節奏</strong>：對齊教會節期，預留縮小或暫停機制。</li>" +
    "<li><strong>R 貼合</strong>：呼應 SWOT／NCD 主線，禁止另起爐灶。</li>" +
    "<li><strong>Care 牧養負載</strong>：先問「誰會最累」，再問「誰會被祝福」。</li></ul>" +
    "<h3>四、路加 14:28–30 · 試行前先算代價</h3>" +
    "<blockquote class=\"smart-quote smart-quote--green\">" +
    "「哪一個人蓋樓不先坐下計算費用，能不能蓋成呢？」我們用 15 題快評，不是為了蓋羞恥感，" +
    "而是為了在試行前誠實問：人力、時間、預算、情緒儲備是否足夠？若不夠，縮小首期比硬撐更榮耀神。</blockquote>" +
    "<h3>五、【負載偏高】加一砍一照讀（LOAD_HIGH 觸發）</h3>" +
    "<blockquote class=\"smart-quote smart-quote--red\" id=\"smart-load-read-aloud\">" +
    "「各位同工，漏斗顯示本計畫<strong>負載分已達 <span id=\"smart-desk-load-val\">65</span> 以上</strong>。" +
    "這多半不是你不夠愛主，而是節奏與界線沒對齊。本會決定：<strong>暫緩擴張</strong>，" +
    "在新增任何 SMART 行動之前，先寫下「要減掉哪一件事」、誰輪休、誰替補。" +
    "我們要對主交帳，不是對會議室交帳——數字是為彼此扶持，不是淘汰。」</blockquote>" +
    "<h3>六、P · Plan（對齊迷霧）長執問句</h3>" +
    "<p>若對齊度偏低：「若暫停預算兩週，我們能否用一句話說清：誰受益、三個月後怎樣算有進展？」" +
    "請只選<strong>一項</strong>行動寫入會議紀錄，避免一次改十件事。</p>" +
    "<h3>七、D · Do（執行紅燈）長執問句</h3>" +
    "<p>若執行分偏低：「首期最小可交付是什麼？誰有時間、誰有資源？能否把試行從三個月縮成六週？」" +
    "必要時連結 <a href=\"guides/guide_step2_raci.html\">RACI 權責反思</a> 釐清 Responsible / Accountable。</p>" +
    "<h3>八、C · Check（枯乾預警）長執問句</h3>" +
    "<p>若 Care 向度偏低：「要加這件事，我們願意減掉哪一件？同工有沒有主日後的綠洲？誰敢說暫停而不被視為失敗？」</p>" +
    "<h3>九、A · Act（永續與梯隊）長執問句</h3>" +
    "<p>若永續分偏低：「試行結束條件是什麼？誰是下一棒接班人？若六週後仍無進展，停損點在哪？」</p>" +
    "<h3>十、與 KPI / 80/20 的邊界</h3>" +
    "<p>SMART 守「一個計畫能否守住」；KPI 守「本季 KR 是否對齊異象」。若 KPI 資源卡關率 ≥70%，" +
    "請先開 <a href=\"Church_Governance_8020_focus.html\">80/20 資源聚焦儀</a>，再回來縮小 SMART 試行範圍。" +
    "兩者不可混為「考績表」。</p>" +
    "<h3>十一、與 urgent 矩陣銜接</h3>" +
    "<p>Q2（重要不緊急）偏低的項目，優先寫成 SMART 試行；Q3（緊急不重要）項目不得直接變 SMART，" +
    "須先經長執取捨。連結 <a href=\"important-urgent-matrix.html\">重要 vs 緊急</a>。</p>" +
    "<h3>十二、與 PDCA 銜接</h3>" +
    "<p>選一項 Tab ③ 白卡行動寫入 <a href=\"Church_Governance_PDCA_cycle.html\">PDCA 快評</a> 的 season_focus，" +
    "八週後對照 Δ 是否下降。PDCA 讀取本頁 upstream_snapshot 中的 SWOT 主軸與 NCD 破口。</p>" +
    "<h3>十三、90 分鐘議程（固定）</h3>" +
    "<ol><li>0–10 分鐘：開會禱告</li><li>10–25 分鐘：宣讀漏斗三指標 + 四齒輪</li>" +
    "<li>25–45 分鐘：P/D/C/A 各選一問句討論</li><li>45–60 分鐘：若 LOAD_HIGH，宣讀加一砍一模板</li>" +
    "<li>60–80 分鐘：決議試行節奏與停損點</li><li>80–90 分鐘：閉會宣告</li></ol>" +
    "<h3>十四、秘書跟進</h3>" +
    "<ol><li>48 小時內發會議紀錄（含唯一行動項）。</li><li>一週內更新計畫白話摘要牆。</li>" +
    "<li>季末學習式檢視，不做公開排名。</li></ol>" +
    "<h3>十五、常見誤區</h3>" +
    "<ul><li>「SMART = 把事工 KPI 化」— 本堂明訂非考核。</li>" +
    "<li>「分數低 = 同工不夠努力」— 先查節奏、資源、界線。</li>" +
    "<li>「一次評整間教會」— 本頁一次一計畫。</li></ul>" +
    "<h3>十六、給主任牧師備忘</h3>" +
    "<p>若同工因計畫壓力落淚或失眠，請主動降低可見度，改為牧者私下陪談；必要時暫停 SMART 試行，" +
    "先處理 Care 向度。牧養大於方法論。</p>" +
    "<h3>十七、15 題矩陣速查</h3>" +
    "<p>S×3 · M×3 · A+T×3 · R×3 · Care×3。每向度 rollup 為算術平均；對齊 = avg(S,M,R,T)；" +
    "負載 = f(Care,R)；可行 = avg(A,Care)。詳見 Tab ③ 方法說明或 pack 註解。</p>" +
    "<h3>十八、風險旗標對照（勿當人事檔案）</h3>" +
    "<p>LOW_COMPLETION · LOAD_HIGH · ALIGN_LOW · CARE_LOW · FEAS_LOW · R_DRIFT — 亮起時對照 Tab ③ 白卡，" +
    "由長執會診，不寫入考核、不公開排名。</p>" +
    "<h3>十九、AI 草稿邊界</h3>" +
    "<p>Tab ③ 可複製 AI 決策草稿，但必須 HITL 審核；不可當神學權威或自動派工依據。</p>" +
    "<h3>二十、閉會宣告</h3>" +
    "<p>「願我們所謀的交託耶和華，在小事上忠心，直到主再來。」</p>" +
    "<p class=\"text-xs text-slate-500 mt-4\">本模板不取代牧者判斷；HITL：AI 草稿須審核。</p>" +
    "</article>";

  function applyDeskState(run) {
    var loadHigh = run && run.risk_flags && run.risk_flags.indexOf("LOAD_HIGH") >= 0;
    var banner = document.getElementById("smart-load-banner");
    var status = document.getElementById("smart-desk-status");
    if (banner) banner.classList.toggle("hidden", !loadHigh);
    if (status) {
      status.innerHTML = loadHigh
        ? "<p class=\"text-rose-800 font-bold\">【警報】負載偏高 · 請宣讀加一砍一模板並檢視 Care 向度。</p>"
        : "<p>負載在可管理範圍，可照常試行檢視。</p>";
    }
    var el = document.getElementById("smart-desk-load-val");
    if (el && run && run.derived && run.derived.load_cost_score != null) {
      el.textContent = String(run.derived.load_cost_score);
    }
  }

  function mountStaticDesk() {
    var host = document.getElementById("smart-tab-methodology-content");
    if (!host || host.querySelector("#smart-desk-static-body")) return;
    host.innerHTML =
      '<div class="acs-card smart-desk-wrap"><h2 class="font-black text-emerald-900 mb-2">4. SMART 守門決策桌</h2>' +
      LOAD_BANNER_HTML +
      '<div id="smart-desk-status" class="smart-desk-status"></div>' +
      DESK_BODY_HTML +
      "</div>";
  }

  global.SmartPastoralDesk = {
    mountStaticDesk: mountStaticDesk,
    applyDeskState: applyDeskState
  };
})(typeof window !== "undefined" ? window : global);
