/**
 * Tab ④ 靈命陪伴決策桌
 */
(function (global) {
  "use strict";

  var DESK =
    '<article id="spiritual-desk-body"><h3>一、禱告</h3><p>主啊，幫助我們用愛心陪伴，不用分數定罪。阿們。</p>' +
    "<h3>二、宣讀五維報告</h3><p>宣讀整體指數與最低維度。靜默十秒。</p>" +
    "<h3>三、帶領三問</h3><ol><li>哪一維最需要一個小步？</li><li>誰可以同行？</li><li>四週後怎樣算有進展？</li></ol>" +
    '<h3>四、銜接 urgent → SMART</h3><p>連結 <a href="Church_Governance_urgent_matrix.html">四象限</a> 與 <a href="Church_Governance_SMART_goals.html">SMART</a>。</p>' +
    "<h3>五、邊界</h3><p>勿公開排名 · 非考核 · HITL 審核 AI 草稿。</p></article>";

  function applyDeskState(run) {
    var low = run && run.risk_flags && run.risk_flags.indexOf("INNER_LIFE_LOW") >= 0;
    var st = document.getElementById("spiritual-desk-status");
    if (st) st.innerHTML = low ? "<p class=\"text-rose-800 font-bold\">靈命整體偏低 · 優先恢復讀經禱告與聚會。</p>" : "<p>可照常小組檢視。</p>";
  }

  function mountStaticDesk() {
    var host = document.getElementById("spiritual-tab-methodology-content");
    if (!host || host.querySelector("#spiritual-desk-body")) return;
    host.innerHTML =
      '<div class="acs-card"><h2 class="font-black text-rose-900 mb-2">4. 靈命陪伴決策桌</h2><div id="spiritual-desk-status"></div>' +
      DESK +
      "</div>";
  }

  global.SpiritualPastoralDesk = { mountStaticDesk: mountStaticDesk, applyDeskState: applyDeskState };
})(typeof window !== "undefined" ? window : global);
