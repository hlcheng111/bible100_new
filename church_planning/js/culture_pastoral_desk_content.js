/**
 * Tab ④ 文化重建長執會 · 使徒行傳 6:3 照讀腳本
 */
(function (global) {
  "use strict";

  var ACTS_BANNER_HTML =
    '<div id="culture-acts-banner" class="culture-acts-banner hidden" role="alert">' +
    "<h3>使徒行傳 6:3 · 文化重建協議（已觸發）</h3>" +
    "<p>「弟兄們，當從你們中間選出七個有好名聲、被聖靈充滿、智慧充足的人，我們派他們管理飯食。」" +
    "信任破口已亮紅——請先修復關係與治理節奏，再推大型擴建。</p></div>";

  var DESK_BODY_HTML =
    '<article class="culture-desk-article" id="culture-desk-static-body">' +
    "<h3>一、開會前禱告（主持人可照讀）</h3>" +
    "<p>主啊，感謝你讓我們同有一個異象。今天我們不是來審判誰不夠屬靈，也不是用問卷給人貼標籤。" +
    "我們是來誠實面對：這群你所託付的僕人，是否在異象、生命、真理與信任上同心同工？" +
    "求你賜我們溫柔的勇氣，讓破口被光照，讓和好有路徑。奉耶穌的名，阿們。</p>" +
    "<h3>二、宣讀雷達數據（對照【3. 文化雷達儀表】）</h3>" +
    "<p>主持人請宣讀四項：文化共鳴分、偏離係數 Cv、信任破口值、CVAM 四象限最高與最低象限。" +
    "全場靜默十五秒，為最低象限與信任向度禱告。</p>" +
    "<h3>三、CVAM 四象限牧養解讀（Cameron & Quinn 教會語境）</h3>" +
    "<table class=\"acs-table text-xs\"><thead><tr><th>象限</th><th>健康訊號</th><th>失衡警訊</th></tr></thead><tbody>" +
    "<tr><td>Clan 家庭牧養</td><td>同工敢說不、衝突可修復</td><td>過度和諧、不敢面對罪</td></tr>" +
    "<tr><td>Adhocracy 先知外展</td><td>異象帶來新事、仍守福音</td><td>只追新事、輕視傳統與紀律</td></tr>" +
    "<tr><td>Market 使徒推動力</td><td>異象驅動、資源敢取捨</td><td>績效壓力、比較心態</td></tr>" +
    "<tr><td>Hierarchy 長執治理</td><td>真理在決策中被提起</td><td>官僚、形式大於生命</td></tr></tbody></table>" +
    "<h3>四、【信任破口】使徒行傳 6:1–7 文化重建照讀（可直接朗讀）</h3>" +
    "<blockquote class=\"culture-quote culture-quote--red\" id=\"culture-trust-read-aloud\">" +
    "「各位長執同工，問卷顯示我們在<strong>團隊信任</strong>上出現破口（均分低於 3.0）。" +
    "這不是誰的失敗，而是我們一起面對的現實：當信任稀薄，再大的五年藍圖也會在執行中撕裂。" +
    "本會依照使徒行傳第六章的精神，決定<strong>未來六週優先處理關係與治理節奏</strong>：" +
    "（一）暫緩非緊急的新擴建表決；（二）啟動跨部門聆聽小組；（三）由主任牧師與長執主席帶領和好禱告退修。" +
    "我們要選出『有好名聲、被聖靈充滿、智慧充足』的同工，把行政與關懷分工清楚，讓使徒能專心祈禱、傳道。" +
    "這不是退縮，這是讓福音事工走得長遠的忠心。」</blockquote>" +
    "<h3>五、異象認同偏弱時的退修話術</h3>" +
    "<p>若異象向度偏低，請勿急著修訂五年計劃文字。先問：我們能否用兩句話向會眾說清楚「我們為何存在」？" +
    "長執退修只產出兩句異象白話與三個核心價值故事，不產出十頁文件。</p>" +
    "<h3>六、僕人生命偏弱時的節奏調整</h3>" +
    "<p>帶領文化若偏控制或過勞驅動，請公開承認：我們需要學習說不。" +
    "下季會議議程前十分鐘固定為「同工安息代禱」，禁止在該時段討論 KPI。</p>" +
    "<h3>七、真理實踐偏弱時的查經路徑</h3>" +
    "<p>安排六週長執查經：使徒行傳 6–7 章、約翰福音 13 章洗腳、腓立比書 2 章同心。" +
    "每次查經後只問一題：這段經文如何修正我們上週的一個決定？</p>" +
    "<h3>八、90 分鐘議程範本</h3>" +
    "<p>0–10 分禱告；10–20 分宣讀雷達四數；20–40 分小組討論「信任破口在我們堂會長什麼樣子」；" +
    "40–60 分若觸發 TRUST_BREACH 宣讀使徒行傳 6:3 模板；60–75 分決議三項具體行動與負責人；" +
    "75–85 分確認與 NCD 關係維的銜接；85–90 分閉會禱告。</p>" +
    "<h3>九、與五年計劃的銜接（禁止跳過）</h3>" +
    "<ol><li>信任破口未修復 → 五年計劃首期預算縮減 30%，轉入關係修復與領袖陪談。</li>" +
    "<li>文化共鳴 ≥70 且信任安全 → 可進入 SWOT 與 KPI 對齊會。</li>" +
    "<li>每季重測一次本工具，對照 Cv 是否下降。</li></ol>" +
    "<h3>十、秘書會後跟進</h3>" +
    "<ol><li>48 小時內發出會議紀錄（不提個人姓名）。</li>" +
    "<li>一週內公布全教會禱告鏈三項。</li><li>六週後檢視聆聽小組報告。</li>" +
    "<li>八週後提醒重填 24 題快評。</li></ol>" +
    "<h3>十一、常見誤區</h3>" +
    "<ul><li>「這是不是文化考核？」— 不是，是群體健康信號。</li>" +
    "<li>「低分要不要換長執？」— 本工具不篩選人，請牧者 facilitation。</li>" +
    "<li>「我們很有愛為什麼信任低？」— 愛心與信任是不同維度，需分開討論。</li></ul>" +
    "<h3>十二、給主任牧師的私下備忘</h3>" +
    "<p>若 TRUST_BREACH 觸發，請在兩週內與每位長執一對一喝咖啡聆聽，不帶問卷，只問：" +
    "「你覺得我們信任彼此嗎？哪一件事讓你最難開口？」數據是第三見證，你的同在是第一見證。</p>" +
    "<h3>十三、upstream 銜接話術</h3>" +
    "<p>若 NCD 最小因子為「相親相愛的關係」，請在會議開頭宣讀：" +
    "「健康診斷與文化雷達互相印證，我們不是從零開始找破口。」" +
    "若 SWOT 主軸為 WO，請確認文化重建聚焦內部排毒而非對外擴張。</p>" +
    "<h3>十四、閉會宣告（可照讀）</h3>" +
    "<p>「我們今日所做的，是為了讓福音事工走得長遠。願主照顧我們的腳步，使我們在異象上一心一意，在信任上彼此恩待。」</p>" +
    "<p class=\"text-xs text-slate-500 mt-4\">本模板為教會治理輔助，不取代聖經權威與牧者分辨；各堂可按宗派調整。</p>" +
    "</article>";

  function applyDeskState(run) {
    var breach =
      run &&
      ((run.risk_flags || []).indexOf("TRUST_BREACH") >= 0 ||
        (run.derived && run.derived.trust_breach_score >= 50));
    var banner = document.getElementById("culture-acts-banner");
    var status = document.getElementById("culture-desk-status");
    if (banner) banner.classList.toggle("hidden", !breach);
    if (status) {
      status.innerHTML = breach
        ? "<p class=\"text-rose-800 font-bold\">【警報】信任破口已觸發 · 請宣讀使徒行傳 6:3 模板。</p>"
        : "<p>目前信任向度在安全範圍，可照常推進五年計劃對齊。</p>";
    }
  }

  function mountStaticDesk() {
    var host = document.getElementById("culture-tab-methodology-content");
    if (!host || host.querySelector("#culture-desk-static-body")) return;
    host.innerHTML =
      '<div class="acs-card culture-desk-wrap"><h2 class="font-black text-violet-900 mb-2">4. 文化重建長執會（決策指南）</h2>' +
      ACTS_BANNER_HTML +
      '<div id="culture-desk-status" class="culture-desk-status"></div>' +
      DESK_BODY_HTML +
      "</div>";
  }

  global.CulturePastoralDesk = {
    mountStaticDesk: mountStaticDesk,
    applyDeskState: applyDeskState
  };
})(typeof window !== "undefined" ? window : global);
