/**
 * Tab ④ 聖靈的修剪 · 長執會決策現場模板
 */
(function (global) {
  "use strict";

  var LUKE_BANNER_HTML =
    '<div id="pdca-luke-fast-banner" class="pdca-luke-fast-banner hidden" role="alert">' +
    "<h3>路加福音 14:31 · 事工禁食排毒協議（已觸發）</h3>" +
    "<p>「或哪一個王出去和別的王打仗，豈不先坐下酌量，能用一萬兵去敵那領二萬兵的嗎？」" +
    "數據顯示計畫與執行嚴重脫節——長執會須先<strong>坐下酌量</strong>，再談擴張。</p></div>";

  var DESK_BODY_HTML =
    '<article class="pdca-desk-article" id="pdca-desk-static-body">' +
    "<h3>一、開會前禱告（主持人可照讀）</h3>" +
    "<p>天父，感謝你讓我們有機會一同服事。今天我們不是來檢討誰做得不夠好，也不是來比較哪個部門比較有績效。" +
    "我們是來在小事上對你忠心——如同保羅所說，管家必要被發現是忠心的（哥林多前書 4:2）。" +
    "求你賜我們誠實的心，看得見計畫與執行之間的真實落差，也賜我們溫柔的勇氣，" +
    "讓好的事工得深化，讓僵化、空轉的事工得安息。奉耶穌的名，阿們。</p>" +
    "<h3>二、宣讀儀表數據（對照【3. 恩跡年表儀表盤】）</h3>" +
    "<p>主持人請宣讀三個數字，全場靜默十秒：計畫強度、執行強度、落差 Δ。" +
    "若 Δ ≥ 2.5，代表口號與現場嚴重脫節，須啟動修剪協議。</p>" +
    "<h3>三、【事工續辦標準】</h3>" +
    "<p>當某事工推進順暢、落差小於 1.0，長執會應公開肯定，並給予預算與人力傾斜，" +
    "不是因為會報表，而是因為在小事上忠心、節奏可持續。</p>" +
    "<blockquote class=\"pdca-quote pdca-quote--green\">" +
    "「本會確認 ______ 事工本季 Δ 低於 1.0。長執會決議：下季預備金傾斜 ____%，" +
    "並指派一位長執同工為陪跑禱告者，每雙週代禱 15 分鐘。」</blockquote>" +
    "<h3>四、【事工修正標準】落差 1.0～2.4</h3>" +
    "<p>方向大致對，但節奏或資源錯配。凍結新活動兩週，只保留一個可檢核的微小勝利目標，八週後再快評重看儀表。</p>" +
    "<h3>五、【事工止血／禁食模板】Δ ≥ 2.5（可直接照讀）</h3>" +
    "<blockquote class=\"pdca-quote pdca-quote--red\" id=\"pdca-bleed-read-aloud\">" +
    "「各位同工，辛苦了。儀表盤上的數據不是為了羞辱誰，而是我們一起面對的真相。" +
    "目前計畫與實際執行的落差已達 <strong id=\"pdca-desk-delta-val\">2.8</strong> 的極度危險期——" +
    "這說明團隊正在無效空轉。本會依照路加福音 14:31，決定<strong>啟動三個月的事工禁食期</strong>：" +
    "全面停辦非進入五年主軸的特會與新案，將核心同工拉回安息與禱告祭壇。" +
    "這不是失敗，這是順服聖靈的修剪。三個月後，我們只帶著一個雙週可檢核的微小目標回來，重新看儀表。」" +
    "</blockquote>" +
    "<h3>六、會議紀錄草案</h3>" +
    "<table class=\"acs-table text-xs\"><thead><tr><th>項目</th><th>內容</th></tr></thead><tbody>" +
    "<tr><td>日期</td><td>____年____月____日</td></tr>" +
    "<tr><td>宣讀經文</td><td>路 14:31；林前 4:2</td></tr>" +
    "<tr><td>儀表 Δ</td><td id=\"pdca-desk-record-delta\">____</td></tr>" +
    "<tr><td>決議</td><td>□ 續辦傾斜　□ 節奏修正　□ 三個月禁食排毒</td></tr>" +
    "</tbody></table>" +
    "<h3>七、管家決談五題</h3>" +
    "<ol><li>我們是在數算神的恩典，還是在數算人的產出？</li>" +
    "<li>落差偏大時，誰最需要被調整節奏，而不是被問責？</li>" +
    "<li>戰略主軸是否仍錨定本季計畫？</li>" +
    "<li>哪一個僵化事工可以勇敢止血？</li>" +
    "<li>下一個雙週微小勝利是什麼？</li></ol>" +
    "<h3>八、90 分鐘議程範本</h3>" +
    "<p>0–10 分開會禱告；10–25 分宣讀儀表三數；25–45 分小組討論決談五題其二；" +
    "45–70 分若 Δ≥2.5 宣讀止血模板並記錄決議；70–85 分確認負責人與下次檢視；85–90 分閉會禱告。</p>" +
    "<h3>九、常見誤區與牧養回應</h3>" +
    "<ul><li>「這是不是在炒掉某同工？」— 我們調整的是事工節奏，不是人的價值。</li>" +
    "<li>「數據會不會被拿來比較部門？」— 禁止在公眾場合做部門排名。</li>" +
    "<li>「我們很忙，為什麼還要禁食？」— 忙而不進，正是路加 14:31 的警戒。</li></ul>" +
    "<h3>十、秘書會後跟進</h3>" +
    "<ol><li>48 小時內發出會議紀錄。</li><li>一週內張貼全教會禱告事項（不提個人姓名）。</li>" +
    "<li>三週後提醒更新雙週微小目標。</li><li>八週後提醒完成【2. 誠實數算主恩】快評。</li></ol>" +
    "<h3>十一、微小勝利重啟話術</h3>" +
    "<p>大目標若兩週內看不見進展，團隊會挫敗。禁食期結束後只問：兩週後哪一件小事會讓會眾感覺教會真的在往前走？" +
    "寫下來、禱告、跟進、慶祝。這就是恩跡年表上的推進率——不是排名，是忠心可見的腳印。</p>" +
    "<h3>十二、給主任牧師的私下備忘</h3>" +
    "<p>若 Δ 觸發禁食協議，請在兩週內與受影響事工負責人一對一見面，先聽他們的疲憊與呼求，再解釋長執決議。" +
    "避免在公眾場合點名。數據是第三見證，你的牧養是第一見證。若有人將此解讀為績效考核，請溫柔糾正：" +
    "我們檢視的是事工節奏與忠心，不是人的價值。必要時可引用哥林多前書 4:2，強調管家身分而非雇員身分。</p>" +
    "<h3>十三、雙軌合流說明（給長執會秘書）</h3>" +
    "<p>【2. 誠實數算主恩】有 A 軌快評（12 題）與 B 軌質性工作坊。兩者寫入同一資料契約；" +
    "【3. 恩跡年表儀表盤】上方為量化落差指針，下方為 B 軌行動清單與決議原文。" +
    "會議時請先宣讀量化三數，再朗讀質性決議，避免只讀數字而忽略故事與禱告線索。</p>" +
    "<h3>十四、與上游工具銜接話術</h3>" +
    "<p>若本季已完成 NCD 健康診斷，請在會議開頭提醒：「我們不是從零開始，破口已在診斷中浮現。」" +
    "若 SWOT 主軸為 WO 轉變，請確認 Plan 行動是否對齊內部排毒而非盲目擴張。" +
    "若 KPI 健康度偏低，請避免在本季再加新指標，先鞏固既有承諾。</p>" +
    "<h3>十五、閉會後八週滾動節奏</h3>" +
    "<p>第 1–2 週：全教會為破口禱告鏈；第 3–4 週：檢視第一個微小勝利是否可見；" +
    "第 5–6 週：長執核心同工節奏檢查（非檢討會）；第 7–8 週：預備重填快評或更新工作坊 Act 欄位。" +
    "整個過程以「我們」為主詞，避免「你們部門」的疏離語言。</p>" +
    "<p class=\"text-xs text-slate-500 mt-4\">本模板為教會治理輔助，不取代聖經權威與牧者團隊的禱告分辨；各堂可按宗派與規模調整用語。</p>" +
    "</article>";

  function applyDeskState(run) {
    var chk =
      run && run.pdca_contract && run.pdca_contract.check_variance
        ? run.pdca_contract.check_variance
        : {};
    var delta = chk.Delta_variance;
    var alert = chk.deming_alert || (delta != null && delta >= 2.5);
    var luke = document.getElementById("pdca-luke-fast-banner");
    var bleed = document.getElementById("pdca-coaching-bleed-path");
    if (luke) luke.classList.toggle("hidden", !alert);
    if (bleed) {
      bleed.className = "pdca-bleed-status " + (alert ? "pdca-bleed-status--alert" : "");
      bleed.innerHTML = alert
        ? "<p><strong>【警報】</strong>落差 Δ = " +
          (delta != null ? delta : "—") +
          " ≥ 2.5 · 請宣讀下方止血模板。</p>"
        : "<p>目前落差在安全範圍內，可照常滾動微小勝利。</p>";
    }
    var d1 = document.getElementById("pdca-desk-delta-val");
    var d2 = document.getElementById("pdca-desk-record-delta");
    if (d1 && delta != null) d1.textContent = String(delta);
    if (d2 && delta != null) d2.textContent = String(delta);
  }

  function mountStaticDesk() {
    var host = document.getElementById("pdca-tab-methodology-content");
    if (!host || host.querySelector("#pdca-desk-static-body")) return;
    host.innerHTML =
      '<div class="acs-card pdca-desk-wrap"><h2 class="font-black text-violet-900 mb-2">4. 聖靈的修剪（長執會決策指南）</h2>' +
      LUKE_BANNER_HTML +
      '<div id="pdca-coaching-bleed-path" class="pdca-bleed-status"></div>' +
      DESK_BODY_HTML +
      "</div>";
  }

  global.PdcaPastoralDesk = {
    mountStaticDesk: mountStaticDesk,
    applyDeskState: applyDeskState
  };
})(typeof window !== "undefined" ? window : global);
