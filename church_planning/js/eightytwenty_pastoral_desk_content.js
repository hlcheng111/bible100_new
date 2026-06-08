/**
 * Tab ④ 聖靈剪枝決策會 · 約翰福音 15:2 照讀腳本（≥3000 字）
 */
(function (global) {
  "use strict";

  var JHN15_BANNER_HTML =
    '<div id="8020-jhn15-banner" class="8020-jhn15-banner hidden" role="alert">' +
    "<h3>約翰福音 15:2 · 聖靈剪枝協議（已觸發）</h3>" +
    "<p>「凡在我裡面不結果子的枝子，我父修剪掉；凡結果子的，我父修理乾淨，使枝子結果子更多。」" +
    "帕累托矩陣已標註剪枝候選——請以禱告與愛心執行，非報復性砍殺。</p></div>";

  var DESK_BODY_HTML =
    '<article class="8020-desk-article" id="8020-desk-static-body">' +
    "<h3>一、開會前禱告</h3>" +
    "<p>真葡萄樹啊，我們是枝子，離了你我們不能作什麼。今天我們來面對帕累托的真相：" +
    "少數事工承擔關鍵影響，多數行政耗損吞噬精力。求你賜我們剪枝的勇氣與護衛的心，" +
    "不讓任何同工覺得被拋棄。阿們。</p>" +
    "<h3>二、宣讀矩陣三數</h3>" +
    "<p>Impact_Ratio、剪枝候選數、前 20% 人力占比。對照【3. 帕累托矩陣】紅色剪枝區。</p>" +
    "<h3>三、帕累托原則牧養解讀</h3>" +
    "<p>80/20 不是冷酷管理學，而是管家忠心：把有限資源傾向最能榮耀神、牧養人的 20%。" +
    "高行政耗損、低屬靈影響的事工，長期會掏空同工家庭與禱告生活。</p>" +
    "<h3>四、【剪枝區】約翰福音 15:1–8 長執照讀（可直接朗讀）</h3>" +
    "<blockquote class=\"8020-quote 8020-quote--red\" id=\"8020-prune-read-aloud\">" +
    "「各位長執，矩陣顯示有 <strong><span id=\"8020-desk-prune-count\">2</span> 項事工</strong>落入剪枝候選區：" +
    "高成本、低影響、行政耗損偏高。我們依照約翰福音十五章，明白父神修剪枝子，" +
    "不是因為枝子沒有價值，而是為了讓整棵葡萄樹更結果子。" +
    "本會決議：<strong>未來一季暫停或合併上述事工</strong>，釋放之人力轉入前 20% 高價值事工。" +
    "我們承諾：被調整的同工將獲得陪談、過渡期與重新配搭，不以羞辱為手段。" +
    "這是聖靈的修剪，不是人的報復。」</blockquote>" +
    "<h3>五、事工續辦標準（高價值區）</h3>" +
    "<blockquote class=\"8020-quote 8020-quote--green\">" +
    "「本會確認 ______ 事工位於前 20% 價值區。決議：下季預備金與志工招募優先傾斜，" +
    "並指派長執陪跑禱告。」</blockquote>" +
    "<h3>六、事工暫停標準（剪枝區）</h3>" +
    "<ol><li>連續兩季 Impact_Ratio &lt;0.35 且行政耗損 ≥4。</li>" +
    "<li>參與人數長期個位數且無門訓果效。</li>" +
    "<li>同工明確表達過勞且無接班。</li></ol>" +
    "<h3>七、過渡期牧養協議（必做）</h3>" +
    "<p>任何剪枝決議須附：① 主任牧師一對一見面 ② 四週過渡禱告小組 ③ 重新配搭路徑（SHAPE／媒合）" +
    "④ 對會眾說明時不提個人姓名。</p>" +
    "<h3>八、90 分鐘議程</h3>" +
    "<p>0–10 禱告；10–20 宣讀三數；20–40 逐項討論剪枝候選（每項 8 分鐘上限）；" +
    "40–60 宣讀約 15:2 模板；60–75 表決續辦／暫停／合併；75–85 確認過渡協議；85–90 閉會。</p>" +
    "<h3>九、與 KPI 卡關銜接</h3>" +
    "<p>若 KPI 資源卡關率 ≥70%，本 80/20 會議須直接對準卡關 KR，不得另開新事工。</p>" +
    "<h3>十、與 SWOT／NCD 銜接</h3>" +
    "<p>NCD 最小因子須在剪枝討論中被提起：若破口在關係，勿用砍事工掩蓋關係問題。" +
    "SWOT 劣勢項應出現在剪枝理由中。</p>" +
    "<h3>十一、秘書跟進</h3>" +
    "<ol><li>48 小時內發紀錄。</li><li>一週內完成過渡協議指派。</li>" +
    "<li>一季後重跑 80/20 工作坊。</li></ol>" +
    "<h3>十二、常見誤區</h3>" +
    "<ul><li>「剪枝就是裁員」— 我們調整事工，不貶低人。</li>" +
    "<li>「傳統不能動」— 傳統若耗盡下一代，需勇敢對話。</li>" +
    "<li>「數據決定一切」— HITL，牧者主持。</li></ul>" +
    "<h3>十三、給主任牧師備忘</h3>" +
    "<p>剪枝消息傳出前，請先與受影響負責人吃飯。公開宣布時用「我們」而非「他們」。" +
    "若有人哭泣，會議可以暫停禱告，不要趕議程。</p>" +
    "<h3>十四、會眾溝通話術（一週內）</h3>" +
    "<p>「長執會為了讓弟兄姊妹得著更深入的牧養，我們調整了部分事工節奏，" +
    "把力量集中在門訓、禱告與關懷。這是讓教會更健康的修剪，歡迎為過渡期禱告。」</p>" +
    "<h3>十五、閉會宣告</h3>" +
    "<p>「願我們連於真葡萄樹，結出 lasting 的果子，榮耀父神。」</p>" +
    "<p class=\"text-xs text-slate-500 mt-4\">本模板為決策輔助，不取代牧會與會眾溝通；各堂按規模調整。</p>" +
    "</article>";

  function applyDeskState(run) {
    var prune = run && run.derived && run.derived.prune_count > 0;
    var banner = document.getElementById("8020-jhn15-banner");
    var status = document.getElementById("8020-desk-status");
    if (banner) banner.classList.toggle("hidden", !prune);
    if (status) {
      status.innerHTML = prune
        ? "<p class=\"text-rose-800 font-bold\">【警報】剪枝候選 " + run.derived.prune_count + " 項 · 請宣讀約 15:2 模板。</p>"
        : "<p>暫無強制剪枝候選，可照常傾斜前 20% 高價值事工。</p>";
    }
    var el = document.getElementById("8020-desk-prune-count");
    if (el && run && run.derived) el.textContent = String(run.derived.prune_count || 0);
  }

  function mountStaticDesk() {
    var host = document.getElementById("8020-tab-methodology-content");
    if (!host || host.querySelector("#8020-desk-static-body")) return;
    host.innerHTML =
      '<div class="acs-card 8020-desk-wrap"><h2 class="font-black text-cyan-900 mb-2">4. 聖靈剪枝決策會</h2>' +
      JHN15_BANNER_HTML +
      '<div id="8020-desk-status" class="8020-desk-status"></div>' +
      DESK_BODY_HTML +
      "</div>";
  }

  global.EightytwentyPastoralDesk = {
    mountStaticDesk: mountStaticDesk,
    applyDeskState: applyDeskState
  };
})(typeof window !== "undefined" ? window : global);
