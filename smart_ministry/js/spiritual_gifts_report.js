/**
 * 屬靈恩賜測驗：僅負責結果區 DOM／HTML 渲染。
 * 計分與 localStorage 仍由 spiritual_gifts.html 主程式處理。
 */
(function (global) {
  "use strict";

  var MAX_PER_GIFT = 25;

  var GIFT_NAMES = {
    teaching: "教導",
    evangelism: "傳福音",
    exhortation: "勸勉",
    mercy: "憐憫",
    serving: "服事",
    administration: "治理",
    giving: "施捨",
    prophecy: "先知"
  };

  var GIFT_DESCRIPTIONS = {
    teaching: "能清楚傳遞神話語，讓人明白真理並應用在生活中。",
    evangelism: "熱心帶領人認識基督，充滿傳福音的熱情。",
    exhortation: "善於鼓勵、安慰、堅固他人信心。",
    mercy: "充滿同情心，樂意安慰與幫助有需要的人。",
    serving: "喜歡在幕後以實際行動支持事工。",
    administration: "擅長組織、規劃與協調，讓事工有效運行。",
    giving: "慷慨奉獻金錢、時間與資源給神的事工。",
    prophecy: "能領受並傳遞神的信息，指出方向與真理。"
  };

  var GIFT_MINISTRY = {
    teaching: "查經帶領、兒童主日學、講道預備",
    evangelism: "佈道隊、接待新人、短宣",
    exhortation: "小組帶領、輔導、鼓勵團隊",
    mercy: "關懷探訪、醫院事工、哀傷輔導",
    serving: "接待、後勤、活動佈置",
    administration: "行政協調、事工策劃、財務管理",
    giving: "奉獻事工、資源供應、助學計劃",
    prophecy: "禱告事工、先知性分享、屬靈引導"
  };

  var GIFT_CAUTIONS = {
    teaching: "多用愛心與謙卑，避免只注重知識。",
    evangelism: "注意跟進新信徒，避免只播種不栽培。",
    exhortation: "平衡真理與恩典，避免過度樂觀。",
    mercy: "也要設定界限，避免過度承擔他人問題。",
    serving: "學習表達需要，避免默默受委屈。",
    administration: "多與人溝通，避免過度控制。",
    giving: "記得奉獻是給神，不是給人看。",
    prophecy: "需經長老印證，避免主觀判斷。"
  };

  function strengthLevel(score) {
    var r = score / MAX_PER_GIFT;
    if (r >= 0.72) return { label: "優勢區", cls: "sg-strength-high" };
    if (r >= 0.44) return { label: "中等／發展中", cls: "sg-strength-mid" };
    return { label: "可培植", cls: "sg-strength-low" };
  }

  function sortedGiftKeys(giftScores) {
    return Object.keys(giftScores).sort(function (a, b) {
      return giftScores[b] - giftScores[a];
    });
  }

  /**
   * @param {HTMLElement} container
   * @param {Object} opts
   * @param {Object<string, number>} opts.giftScores
   * @param {boolean} opts.provisional
   * @param {number} opts.missingCount
   * @param {number} [opts.topN=3]
   */
  function renderSpiritualGiftsReport(container, opts) {
    if (!container) return;
    var giftScores = opts.giftScores || {};
    var provisional = !!opts.provisional;
    var missingCount = opts.missingCount || 0;
    var topN = opts.topN != null ? opts.topN : 3;
    var order = sortedGiftKeys(giftScores);
    var topKeys = order.slice(0, topN);

    var wrap = document.createElement("div");
    wrap.className = "sg-report";

    var h1 = document.createElement("h2");
    h1.className = "sg-report-title";
    h1.textContent = provisional ? "目前暫時恩賜趨勢" : "屬靈恩賜結果報告";
    wrap.appendChild(h1);

    if (provisional) {
      var warn = document.createElement("div");
      warn.className = "sg-report-provisional";
      warn.innerHTML =
        "這是<strong>暫時結果</strong>：尚有 <strong>" +
        missingCount +
        "</strong> 題未填。請補完後再參考完整分析；下列分數可能隨補答而改變。";
      wrap.appendChild(warn);
    }

    var overview = document.createElement("div");
    overview.className = "sg-report-section";
    var oh = document.createElement("h3");
    oh.className = "sg-report-h3";
    oh.textContent = "整體概覽";
    overview.appendChild(oh);

    var topNames = topKeys.map(function (k) {
      return GIFT_NAMES[k] || k;
    });
    var p1 = document.createElement("p");
    p1.className = "sg-report-lead";
    p1.textContent =
      "依目前作答，相對較突出的恩賜向度為：" +
      topNames.join("、") +
      "。恩賜是聖靈分賜、為建造教會；以下分項協助你與牧者／小組長對話分辨，並非定論。";
    overview.appendChild(p1);

    var p2 = document.createElement("p");
    p2.className = "sg-report-meta";
    p2.textContent =
      "每一向度滿分為 " +
      MAX_PER_GIFT +
      " 分（五題 × 5 分）。相對強度僅供與自己其他向度對照。";
    overview.appendChild(p2);
    wrap.appendChild(overview);

    var tableSec = document.createElement("div");
    tableSec.className = "sg-report-section";
    var th3 = document.createElement("h3");
    th3.className = "sg-report-h3";
    th3.textContent = "各恩賜向度一覽";
    tableSec.appendChild(th3);

    var table = document.createElement("table");
    table.className = "sg-report-table";
    table.innerHTML =
      "<thead><tr>" +
      "<th>恩賜範疇</th>" +
      "<th>得分／滿分</th>" +
      "<th>相對強度</th>" +
      "<th>簡短描述</th>" +
      "<th>建議服事方向</th>" +
      "</tr></thead>";
    var tb = document.createElement("tbody");
    order.forEach(function (key) {
      var sc = giftScores[key] || 0;
      var lev = strengthLevel(sc);
      var tr = document.createElement("tr");
      if (topKeys.indexOf(key) !== -1) tr.className = "sg-row-top";
      tr.innerHTML =
        "<td><strong>" +
        (GIFT_NAMES[key] || key) +
        "</strong></td>" +
        "<td>" +
        sc +
        "／" +
        MAX_PER_GIFT +
        "</td>" +
        '<td><span class="' +
        lev.cls +
        '">' +
        lev.label +
        "</span></td>" +
        "<td>" +
        (GIFT_DESCRIPTIONS[key] || "") +
        "</td>" +
        "<td>" +
        (GIFT_MINISTRY[key] || "") +
        "</td>";
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    tableSec.appendChild(table);
    wrap.appendChild(tableSec);

    var redSec = document.createElement("div");
    redSec.className = "sg-report-section";
    var rh = document.createElement("h3");
    rh.className = "sg-report-h3";
    rh.textContent = "值得多留意的向度（相對較低分）";
    redSec.appendChild(rh);
    var bottom3 = order.slice(-3).reverse();
    var ul = document.createElement("ul");
    ul.className = "sg-report-list";
    bottom3.forEach(function (k) {
      var li = document.createElement("li");
      li.innerHTML =
        "<strong>" +
        (GIFT_NAMES[k] || k) +
        "：</strong>" +
        (GIFT_DESCRIPTIONS[k] || "") +
        " <em>提醒：</em>" +
        (GIFT_CAUTIONS[k] || "");
      ul.appendChild(li);
    });
    redSec.appendChild(ul);
    wrap.appendChild(redSec);

    var greenSec = document.createElement("div");
    greenSec.className = "sg-report-section";
    var gh = document.createElement("h3");
    gh.className = "sg-report-h3";
    gh.textContent = "可優先發展與感恩的向度（前三名）";
    greenSec.appendChild(gh);
    var ul2 = document.createElement("ul");
    ul2.className = "sg-report-list";
    topKeys.forEach(function (k) {
      var li = document.createElement("li");
      li.innerHTML =
        "<strong>" +
        (GIFT_NAMES[k] || k) +
        "（" +
        (giftScores[k] || 0) +
        "／" +
        MAX_PER_GIFT +
        "）：</strong>" +
        (GIFT_DESCRIPTIONS[k] || "") +
        " <em>服事：</em>" +
        (GIFT_MINISTRY[k] || "") +
        " <em>提醒：</em>" +
        (GIFT_CAUTIONS[k] || "");
      ul2.appendChild(li);
    });
    greenSec.appendChild(ul2);
    wrap.appendChild(greenSec);

    var safe = document.createElement("div");
    safe.className = "sg-report-safeguard";
    var sh = document.createElement("h3");
    sh.className = "sg-report-h3";
    sh.textContent = "保護與牧養聲明";
    safe.appendChild(sh);
    var sp = document.createElement("p");
    sp.textContent =
      "本測驗協助自我認識與同工對話，不是標籤、不是屬靈排名，更不能取代教會權柄與肢體印證。請與牧者／小組長一起禱告分辨，並依教會實際需要與季節調整服事；若對結果感到困惑或壓力，請主動尋求牧者協助。";
    safe.appendChild(sp);

    var foot = document.createElement("p");
    foot.className = "sg-report-foot";
    foot.textContent = "結果已寫入本機瀏覽器，可至「恩賜與技能統整」檢視摘要。";
    safe.appendChild(foot);
    wrap.appendChild(safe);

    var actions = document.createElement("div");
    actions.className = "sg-report-actions";
    actions.innerHTML =
      '<button type="button" class="btn btn-primary" id="sgBtnRetest">重新測驗</button>' +
      '<button type="button" class="btn btn-secondary" id="sgBtnExportJson">複製結果 JSON</button>' +
      '<a href="talent_ministry_matching.html" target="contentFrame" class="btn btn-primary sg-report-linkbtn">事奉配對工作台</a>' +
      '<a href="talent_skill_unified.html" target="contentFrame" class="btn btn-secondary sg-report-linkbtn">回統整頁</a>';
    wrap.appendChild(actions);

    container.innerHTML = "";
    container.appendChild(wrap);

    var retest = document.getElementById("sgBtnRetest");
    if (retest) retest.addEventListener("click", function () { location.reload(); });

    var exportBtn = document.getElementById("sgBtnExportJson");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var payload = {
          type: "spiritual_gifts_summary",
          topGifts: topKeys.slice(),
          scores: Object.assign({}, giftScores),
          provisional: provisional,
          missingCount: missingCount,
          exportedAt: new Date().toISOString()
        };
        var txt = JSON.stringify(payload, null, 2);
        if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
          global.navigator.clipboard.writeText(txt).catch(function () {
            global.prompt("請手動複製", txt);
          });
        } else {
          global.prompt("請手動複製", txt);
        }
      });
    }
  }

  global.SpiritualGiftsReport = {
    renderSpiritualGiftsReport: renderSpiritualGiftsReport,
    GIFT_NAMES: GIFT_NAMES,
    MAX_PER_GIFT: MAX_PER_GIFT
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
