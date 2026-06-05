/**
 * RACI 教會反思 — 分頁版、即時小燈、可選不儲存
 * chp2026-raci-diagnostic-v1
 */
(function () {
  "use strict";

  var STORAGE_KEY = "chp2026-raci-diagnostic-v1";
  var TAB_IDS = ["why", "pain", "survey", "theology", "tools"];

  var QUESTIONS = {
    team: {
      A: [
        "團隊中有人常在未經授權下就做會影響他人的決定。",
        "義工或同工常跳過部門負責人，直接找牧師或更高層。",
        "常有人以「我覺得這樣比較好」為由，而不依既定流程。",
        "部門負責人或領袖常感到決策被架空或繞過。",
      ],
      B: [
        "需要拍板時，負責領袖經常猶豫或拖延。",
        "明顯的問題已拖了數週，仍沒有人出面處理。",
        "常聽到「這不關我的事」或類似推卸。",
        "牧者或部門長常以「你們自己看著辦」結束討論，沒有清楚 A。",
      ],
      C: [
        "有人常公開挑戰負責同工的決定或權柄。",
        "有人試圖單方面主導流程或資源分配。",
        "聽到「為什麼不是我負責」這類比較或爭位。",
        "團隊出現明顯派系、小圈子對立。",
      ],
      D: [
        "少數人承擔了大部分執行工作。",
        "常聽到「沒有人幫我」或類似孤立感。",
        "同工看起來焦慮、長期疲乏與過載。",
        "某項事工高度依賴單一人，換人即停擺。",
      ],
    },
    self: {
      A: [
        "我常在未與授權同工確認下，就做會影響他人的決定。",
        "我習慣略過部門流程，直接找牧師或更高層。",
        "我傾向依自己判斷行事，較少先核對既定流程。",
        "與我配搭的領袖曾流露「被繞過」的感受（或我有此擔心）。",
      ],
      B: [
        "該我拍板時我常猶豫、拖延或交回給「大家」。",
        "我明知有漏洞或衝突，卻遲遲未跟進。",
        "我容易說「這不關我的事」或把責任推回群體。",
        "我常說「你們看著辦」，而沒有指明誰是 A、下一步是什麼。",
      ],
      C: [
        "我內心常質疑負責同工的決定或權柄。",
        "我想擴大自己的話語權或掌控範圍。",
        "我會與人比較服事位置或「誰說了算」。",
        "我身處或感受到對立的小圈子張力。",
      ],
      D: [
        "我承擔了遠超過自己該做的執行量。",
        "我常覺得沒有人分擔，或只能靠自己。",
        "服事已明顯影響情緒、休息或家庭節奏。",
        "別人習慣把執行責任都堆到我身上。",
      ],
    },
  };

  var TYPE_META = {
    A: {
      id: "A",
      short: "越權（掃羅型）",
      questionGroupHint: "A 組：決策與當責是否過度集中在少數人身上？",
      labelPastoral: "🟦 越權（掃羅型）：急著自己拍板，繞過應被尊重的流程與同工。",
      labelTechnical: "技術描述（給帶領者）：執行（R）與當責（A）混淆，或既定流程容易被跳過、架空。",
      color: "blue",
      bible: "撒上 13",
      cardClass: "raci-t-A",
      people: "急於行動、界線與期待未對齊、個人或群體較以自我步調為中心。",
      process: "回報路徑與決策門檻未寫清楚。",
      structure: "當責者（A）未公開或未承認；誰能拍板未落地。",
      weights: { people: 2, process: 2, structure: 3 },
    },
    B: {
      id: "B",
      short: "缺位（亞倫型）",
      questionGroupHint: "B 組：是否常出現「很多人在做、卻沒有人真正當責」的感覺？",
      labelPastoral: "🟧 缺位（亞倫型）：需要有人拍板時，常感覺沒有人真正站出來承擔。",
      labelTechnical: "技術描述（給帶領者）：當責者（A）未承擔，「大家一起負責」變成沒有人負責。",
      color: "orange",
      bible: "出 32",
      cardClass: "raci-t-B",
      people: "領袖迴避衝突、害怕承擔或過度放手。",
      process: "沒有「到期必決」節奏；議而不決。",
      structure: "沒有唯一 A；「大家都有責任」等於沒人負責。",
      weights: { people: 2, process: 2, structure: 3 },
    },
    C: {
      id: "C",
      short: "奪權（可拉型）",
      questionGroupHint: "C 組：是否有人名義上當責，實際上卻難以行使權責、常被架空？",
      labelPastoral: "🟥 奪權（可拉型）：對安排感到不快，容易用影響力拉派系、左右決策，較少走正式溝通。",
      labelTechnical: "技術描述（給帶領者）：當責者（A）不被尊重，或試圖改寫既定權責分工。",
      color: "red",
      bible: "民 16",
      cardClass: "raci-t-C",
      people: "不滿、比較、派系；服事中出現較多張力與競逐感。",
      process: "缺乏正式申訴／對話渠道。",
      structure: "權責與溝通節點未說清楚；多頭馬車。",
      weights: { people: 3, process: 1, structure: 2 },
    },
    D: {
      id: "D",
      short: "過勞（馬大型）",
      questionGroupHint: "D 組：是否有人像「萬用救火隊」，執行量與休息明顯不成比例？",
      labelPastoral: "🟩 過勞（馬大型）：少數人扛起大部分執行，缺少分擔與替補。",
      labelTechnical: "技術描述（給帶領者）：執行者（R）負擔過重，缺排班、交接與分層授權。",
      color: "green",
      bible: "路 10",
      cardClass: "raci-t-D",
      people: "難以說不、罪疚或取悅驅動的「全包」。",
      process: "缺 WBS／排班／交接。",
      structure: "人力未盤點；缺支援與分層授權。",
      weights: { people: 2, process: 3, structure: 2 },
    },
  };

  var ROLE_GUIDE = {
    R: {
      title: "R（執行者）— 你可以這樣避免誤判",
      swot: "易把「執行摩擦」寫成 W／T：先問是否其實是 A 不清。威脅項若其實是內部權責，應回到治理面談。",
      smart: "每個目標問：誰是 A、誰與我雙向諮詢（C）？避免 SMART 裡默認「我全部扛」。",
      pdca: "Check：決策是否過度集中，或執行負擔壓在少數人身上？Act：拆執行、補支援，而非只加活動。",
    },
    A: {
      title: "A（當責者）— 你可以這樣避免誤判",
      swot: "易把「部屬不力」寫成 W：先檢查是否自己缺位、未授權。",
      smart: "每個目標只能一個 A；把「大家負責」改寫成可指名的當責。",
      pdca: "Check：是否不敢拍板？Act：定決策日、補 C、對 I 發短摘要。",
    },
    C: {
      title: "C（諮詢者）— 你可以這樣避免誤判",
      swot: "把「未被諮詢的不滿」誤寫成 O／T：區分外在環境 vs 內部溝通節點。",
      smart: "在計畫裡標「須先諮詢誰」，避免事後才發現 C 斷線。",
      pdca: "Check：C 太多拖慢決策？Act：區分必諮詢 vs 僅知會。",
    },
    I: {
      title: "I（知會者）— 你可以這樣避免誤判",
      swot: "把「資訊不透明」全寫成外部威脅前，先檢查 I 的節奏是否建立。",
      smart: "目標公布時寫清「誰只需被知會」，減少會議膨脹。",
      pdca: "Act 後用一段話對 I 同步，降低黑箱與重複問答。",
    },
    "": {
      title: "角色未選／多重角色",
      swot: "先與團隊對齊「誰是此議題的 A」，再寫 SWOT。",
      smart: "先為每個 SMART 標定單一 A，再進衡量與行動拆解。",
      pdca: "Check 時分別問：缺人、缺流程還是缺結構？",
    },
  };

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function loadHealthHint() {
    try {
      var raw = localStorage.getItem("chp2026-health-result");
      if (!raw) return null;
      var o = JSON.parse(raw);
      var res = o && o.result != null ? o.result : o;
      if (!res || typeof res !== "object") return null;
      var parts = [];
      var ws = res.weakest;
      if (Array.isArray(ws) && ws.length) {
        if (ws.indexOf("leadership") >= 0 || ws.indexOf("led") >= 0) {
          parts.push("「領導／治理」維度較弱：寫 SWOT 的 T 時多問是否其實是「A 不清或缺位」。");
        }
        if (ws.indexOf("community") >= 0 || ws.indexOf("fel") >= 0) {
          parts.push("「團契／社群」較弱：寫 W／T 時留意是否把「人的張力」全推給環境。");
        }
      }
      var hs = res.healthScores;
      if (hs && typeof hs === "object") {
        var ld = Number(hs.leadership);
        if (isFinite(ld) && ld < 2.5) parts.push("領導力分數偏低：優先檢視「是否只有一個 A」。");
      }
      if (!parts.length) parts.push("已有健康診斷紀錄：寫策略時建議對照八維，避免單一敘事誤導。");
      return parts.join(" ");
    } catch (e) {
      return null;
    }
  }

  function fsClass(axis) {
    return "raci-fieldset raci-fs-" + axis;
  }

  function renderQuestions(lens, checksFlat) {
    var host = el("raci-q-host");
    if (!host) return;
    var qset = QUESTIONS[lens] || QUESTIONS.team;
    var keys = ["A", "B", "C", "D"];
    var html = "";
    var flatIdx = 0;
    keys.forEach(function (k) {
      var meta = TYPE_META[k];
      html += '<fieldset class="' + fsClass(k) + '"><legend>' + escapeHtml(meta.labelPastoral) + "</legend>";
      html +=
        '<details class="raci-axis-tech"><summary>技術說明（選讀）</summary><p>' +
        escapeHtml(meta.labelTechnical) +
        "</p></details>";
      if (meta.questionGroupHint) {
        html +=
          '<p class="raci-qgroup-hint" style="margin:0 0 10px;font-size:12px;color:#475569;line-height:1.5;font-weight:600;">' +
          escapeHtml(meta.questionGroupHint) +
          "</p>";
      }
      html +=
        '<div class="raci-lamp-row" data-axis-lamp="' +
        k +
        '"><span class="raci-lamp-label">本輪勾選累積（小燈）</span><div class="raci-lamp-dots">';
      for (var d = 0; d < 4; d++) {
        html += '<span class="raci-lamp-dot" aria-hidden="true"></span>';
      }
      html += "</div></div>";
      qset[k].forEach(function (text, idx) {
        var id = "q-" + lens + "-" + k + "-" + idx;
        var checked =
          Array.isArray(checksFlat) && checksFlat.length > flatIdx && checksFlat[flatIdx] ? " checked" : "";
        flatIdx++;
        html +=
          '<div class="raci-q"><label for="' +
          id +
          '"><input type="checkbox" id="' +
          id +
          '" data-axis="' +
          k +
          '"' +
          checked +
          " /> " +
          escapeHtml(text) +
          "</label></div>";
      });
      html += "</fieldset>";
    });
    host.innerHTML = html;
    host.onchange = function (ev) {
      if (ev.target && ev.target.matches && ev.target.matches('input[type="checkbox"]')) updateAxisLamps();
    };
    updateAxisLamps();
  }

  function countAxis(axis) {
    return document.querySelectorAll('#raci-q-host input[type="checkbox"][data-axis="' + axis + '"]:checked').length;
  }

  function updateAxisLamps() {
    ["A", "B", "C", "D"].forEach(function (axis) {
      var n = countAxis(axis);
      var row = document.querySelector('[data-axis-lamp="' + axis + '"]');
      if (!row) return;
      var dots = row.querySelectorAll(".raci-lamp-dot");
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-on", i < n);
      });
    });
  }

  function collectChecksFlat(lens) {
    var qset = QUESTIONS[lens] || QUESTIONS.team;
    var out = [];
    ["A", "B", "C", "D"].forEach(function (k) {
      qset[k].forEach(function (_, idx) {
        var node = document.getElementById("q-" + lens + "-" + k + "-" + idx);
        out.push(!!(node && node.checked));
      });
    });
    return out;
  }

  function readHashTab() {
    var h = (location.hash || "").replace(/^#/, "").trim();
    if (TAB_IDS.indexOf(h) >= 0) return h;
    return "why";
  }

  function syncFlowSteps(activeId) {
    document.querySelectorAll(".raci-flow-step[data-flow]").forEach(function (node) {
      var tid = node.getAttribute("data-flow");
      var on = tid === activeId;
      node.classList.toggle("is-current", on);
      if (on) node.setAttribute("aria-current", "step");
      else node.removeAttribute("aria-current");
    });
  }

  function gotoTab(id) {
    if (TAB_IDS.indexOf(id) < 0) id = "why";
    TAB_IDS.forEach(function (tid) {
      var p = el("raci-tab-" + tid);
      var btn = el("raci-tabbtn-" + tid);
      if (p) p.hidden = tid !== id;
      if (btn) {
        btn.setAttribute("aria-selected", tid === id ? "true" : "false");
        btn.classList.toggle("is-active", tid === id);
      }
    });
    syncFlowSteps(id);
    try {
      if (history.replaceState) {
        var path = location.pathname + location.search;
        history.replaceState(null, "", path + "#" + id);
      } else {
        location.hash = "#" + id;
      }
    } catch (e2) {}
    var strip = document.querySelector(".raci-tabstrip");
    if (strip) {
      try {
        strip.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (e3) {}
    }
  }

  function scrollToResult() {
    var r = el("raci-result");
    if (!r) return;
    setTimeout(function () {
      try {
        r.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e4) {}
    }, 80);
  }

  function noSaveChecked() {
    var c = el("raci-privacy-no-store");
    return !!(c && c.checked);
  }

  function analyze() {
    var lens = el("raci-lens").value;
    var role = el("raci-role").value;
    var ministry = (el("raci-ministry") && el("raci-ministry").value) || "";
    var counts = { A: countAxis("A"), B: countAxis("B"), C: countAxis("C"), D: countAxis("D") };
    var triggered = [];
    ["A", "B", "C", "D"].forEach(function (k) {
      if (counts[k] >= 2) triggered.push(k);
    });
    var maxN = Math.max(counts.A, counts.B, counts.C, counts.D);
    var priority = null;
    if (maxN >= 2) {
      ["A", "B", "C", "D"].forEach(function (k) {
        if (counts[k] === maxN && !priority) priority = k;
      });
    }
    var peopleScore = 0;
    var processScore = 0;
    var structureScore = 0;
    triggered.forEach(function (k) {
      var w = TYPE_META[k].weights || { people: 1, process: 1, structure: 1 };
      var mult = counts[k];
      peopleScore += (w.people || 0) * mult;
      processScore += (w.process || 0) * mult;
      structureScore += (w.structure || 0) * mult;
    });
    var healthHint = loadHealthHint();
    var rg = ROLE_GUIDE[role] || ROLE_GUIDE[""];

    var dom = el("raci-result");
    if (!dom) return;

    var html = "";
    html += '<p class="raci-result-hero">本輪整理（先讀這段）</p>';

    html += '<div class="raci-lamp-cards">';
    ["A", "B", "C", "D"].forEach(function (k) {
      var m = TYPE_META[k];
      var lit = counts[k] >= 2;
      var pri = priority === k && lit;
      html +=
        '<div class="raci-result-card ' +
        m.cardClass +
        (lit ? " is-lit" : "") +
        (pri ? " is-priority" : "") +
        '"><strong>' +
        escapeHtml(m.short) +
        "</strong> · 勾選 " +
        counts[k] +
        "／4";
      if (pri) html += " · <span style=\"color:#b45309;\">建議優先留意</span>";
      if (lit) {
        html +=
          "<br><span class=\"raci-muted\" style=\"font-size:14px;\">本輪這方面勾選較多（≥2），代表團隊在這裡有較多共同感受，可帶去會議一起談，不是替任何人貼標籤。</span>";
      } else {
        html +=
          "<br><span class=\"raci-muted\" style=\"font-size:14px;\">尚未達本工具設定的「一起留意」門檻（≥2 題）。</span>";
      }
      html += "</div>";
    });
    html += "</div>";

    if (healthHint) {
      html +=
        '<div style="margin:14px 0;padding:14px;border-radius:14px;background:#ecfeff;border:2px solid #22d3ee;color:#0e7490;font-size:15px;"><strong>與健康診斷並讀（提示，非判定）：</strong> ' +
        escapeHtml(healthHint) +
        "</div>";
    }

    if (!triggered.length) {
      html +=
        '<p style="font-size:17px;font-weight:800;color:#166534;margin:12px 0;">目前四軸都還未達「一起留意」門檻（每軸 &lt;2 題勾選）：代表<strong>尚未累積到明顯的共同訊號</strong>。你仍可把「唯一 A」帶進下一次會議。</p>';
    } else {
      html +=
        "<p style=\"font-size:17px;font-weight:800;color:#1e1b4b;margin:12px 0;\">本輪較想一起留意的面向：<strong>" +
        triggered.map(function (k) { return TYPE_META[k].short; }).join("、") +
        "</strong></p>";
      html += "<ul style=\"margin:0 0 12px;padding-left:1.2rem;line-height:1.65;\">";
      triggered.forEach(function (k) {
        var m = TYPE_META[k];
        html +=
          "<li><strong>" +
          escapeHtml(m.labelPastoral) +
          "</strong>（" +
          counts[k] +
          "／4）— 聖經參考：" +
          escapeHtml(m.bible) +
          "<br><span class=\"raci-muted\" style=\"font-size:13px;\">" +
          escapeHtml(m.labelTechnical) +
          "</span><br><em>人：</em>" +
          escapeHtml(m.people) +
          " <em>事／流程：</em>" +
          escapeHtml(m.process) +
          " <em>結構：</em>" +
          escapeHtml(m.structure) +
          "</li>";
      });
      html += "</ul>";
      var maxDim = Math.max(peopleScore, processScore, structureScore);
      var domRead =
        maxDim <= 0
          ? "請併讀各軸敘述。"
          : peopleScore >= processScore && peopleScore >= structureScore
            ? "「人」加權較高—可先安排對話與期待對齊，再改流程。"
            : processScore >= peopleScore && processScore >= structureScore
              ? "「事／流程」加權較高—先補 SOP、回報日、會議紀要。"
              : "「結構／權責」加權較高—可先釐清<strong>誰是唯一當責（A）</strong>與決策通道。";
      html +=
        "<h3 style=\"margin:18px 0 8px;color:#312e81;\">人 vs 事 vs 結構（加權摘要）</h3>" +
        "<p style=\"font-size:14px;color:#475569;margin:0 0 10px;line-height:1.6;\">這一段主要給<strong>帶領者</strong>判斷下一步要從「關係、流程還是權責設計」哪裡談起；一般同工若覺得抽象，可只看上面各軸的牧養描述。接著可把結論寫進 PDCA 的 <strong>Check／Act</strong>，當作「結構假設」再驗證。</p>";
      html += "<p style=\"font-weight:800;color:#0f172a;\">主軸判讀：" + domRead + "</p>";
      html +=
        "<ul style=\"line-height:1.65;\"><li><strong>人</strong>（分 " +
        peopleScore +
        "）</li><li><strong>事／流程</strong>（分 " +
        processScore +
        "）</li><li><strong>結構／權責</strong>（分 " +
        structureScore +
        "）</li></ul>";
      html += "<h3 style=\"margin:18px 0 8px;color:#312e81;\">本週可以試的一件事（擇一）</h3><ol style=\"line-height:1.65;font-weight:700;\">";
      html += "<li>把某一項事工的<strong>A 名字</strong>寫在白板或群組公告上（只寫一個）。</li>";
      html += "<li>為一條流程加上<strong>回報日</strong>（例如每週五中午前）。</li>";
      html += "<li>邀請一位<strong>C</strong>在重大決定前用 15 分鐘提供意見。</li>";
      html += "</ol>";
      html += "<h3 style=\"margin:18px 0 8px;color:#312e81;\">帶去 PDCA · Check／Act（可貼上）</h3><ol style=\"line-height:1.65;\">";
      html +=
        "<li><strong>Check：</strong>這次延遲或張力，與「" +
        triggered.map(function (k) { return TYPE_META[k].short; }).join("、") +
        "」何者最相關？</li>";
      html +=
        "<li><strong>Act：</strong>擇一—重整唯一 A／補書面流程／拆分 R 並加支援／安排衝突對話與禱告。</li>";
      html += "<li><strong>下次檢核：</strong>是否已對 I 做一次短摘要，降低誤會？</li>";
      html += "</ol>";
    }

    html += "<h3 style=\"margin:22px 0 8px;color:#312e81;\">依你選的角色：減少 SWOT／SMART 誤判</h3>";
    html += "<p style=\"font-weight:800;\">" + escapeHtml(rg.title) + "</p><ul style=\"line-height:1.65;\">";
    html += "<li><strong>SWOT：</strong>" + escapeHtml(rg.swot) + "</li>";
    html += "<li><strong>SMART：</strong>" + escapeHtml(rg.smart) + "</li>";
    html += "<li><strong>PDCA：</strong>" + escapeHtml(rg.pdca) + "</li></ul>";

    dom.innerHTML = html;

    var checksFlat = collectChecksFlat(lens);
    var payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      lens: lens,
      roleRaci: role,
      ministry: ministry,
      counts: counts,
      triggered: triggered,
      priority: priority,
      healthHintShown: !!healthHint,
      checksFlat: checksFlat,
      dimPeople: peopleScore,
      dimProcess: processScore,
      dimStructure: structureScore,
      noSave: noSaveChecked(),
    };

    if (!noSaveChecked()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
    }

    if (typeof window.__CTAOS_refresh === "function") {
      try {
        window.__CTAOS_refresh();
      } catch (e2) {}
    }

    window.__raciLastReport = buildPlainReport(payload, triggered, counts, priority, rg, healthHint);
    gotoTab("survey");
    scrollToResult();
  }

  function buildPlainReport(payload, triggered, counts, priority, rg, healthHint) {
    var lines = [];
    lines.push("【RACI 教會反思 · 本輪整理】時間 " + payload.savedAt);
    lines.push("視角：" + (payload.lens === "self" ? "我自己的服事" : "我觀察到的團隊"));
    lines.push("角色：" + (payload.roleRaci || "未選") + " · 事工：" + (payload.ministry || "未填"));
    lines.push("儲存模式：" + (payload.noSave ? "本輪不儲存" : "已寫入本機（若未勾不儲存）"));
    lines.push("");
    lines.push("勾選：A=" + counts.A + " B=" + counts.B + " C=" + counts.C + " D=" + counts.D);
    if (triggered.length && payload.dimPeople != null) {
      lines.push("加權：人=" + payload.dimPeople + " 事=" + payload.dimProcess + " 結構=" + payload.dimStructure);
    }
    if (healthHint) {
      lines.push("");
      lines.push("健康並讀：" + healthHint);
    }
    lines.push("");
    if (!triggered.length) lines.push("本輪較多勾選的軸：無（每軸未達 ≥2）");
    else {
      lines.push("本輪較多勾選的軸：" + triggered.map(function (k) { return TYPE_META[k].short; }).join("、"));
      if (priority) lines.push("建議優先留意：" + TYPE_META[priority].labelPastoral);
      if (priority) lines.push("技術參照：" + TYPE_META[priority].labelTechnical);
    }
    lines.push("");
    lines.push("【依角色提醒】");
    lines.push("SWOT：" + rg.swot);
    lines.push("SMART：" + rg.smart);
    lines.push("PDCA：" + rg.pdca);
    lines.push("");
    lines.push("— 自助反思工具，非心理諮商或正式申訴渠道。");
    return lines.join("\n");
  }

  function copyReport() {
    var t = window.__raciLastReport;
    if (!t) {
      analyze();
      t = window.__raciLastReport;
    }
    var st = el("raci-copy-status");
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      var ta = el("raci-copy-fallback");
      if (ta) {
        ta.value = t || "";
        ta.style.display = "block";
        ta.select();
        try {
          document.execCommand("copy");
        } catch (e) {}
      }
      if (st) st.textContent = "已嘗試複製（若失敗請手動選取下方文字區）";
      return;
    }
    navigator.clipboard.writeText(t || "").then(
      function () {
        if (st) {
          st.textContent = "已複製到剪貼簿，可貼到 PDCA 或文件";
          setTimeout(function () {
            st.textContent = "";
          }, 2800);
        }
      },
      function () {
        if (st) st.textContent = "複製失敗，請改用「手動複製區」";
      }
    );
  }

  function tryRestoreBanner() {
    var banner = el("raci-restore-banner");
    if (!banner) return;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (!o || o.version !== 1) return;
      banner.style.display = "block";
      banner.innerHTML =
        '偵測到本機有上次紀錄（' +
        escapeHtml((o.savedAt || "").slice(0, 10)) +
        '）。<button type="button" id="raci-restore-yes">繼續上次勾選</button><button type="button" id="raci-restore-no" style="background:#fff;color:#92400e;border:2px solid #b45309;">清除並從頭</button>';
      el("raci-restore-yes").onclick = function () {
        if (el("raci-lens") && o.lens) el("raci-lens").value = o.lens;
        if (el("raci-role") && o.roleRaci != null) el("raci-role").value = o.roleRaci;
        if (el("raci-ministry") && o.ministry != null) el("raci-ministry").value = o.ministry;
        var lens = el("raci-lens").value;
        var flat =
          o.checksFlat && Array.isArray(o.checksFlat) && o.checksFlat.length === 16 && o.lens === lens
            ? o.checksFlat
            : null;
        renderQuestions(lens, flat);
        banner.style.display = "none";
        gotoTab("survey");
      };
      el("raci-restore-no").onclick = function () {
        localStorage.removeItem(STORAGE_KEY);
        banner.style.display = "none";
      };
    } catch (e) {}
  }

  function init() {
    TAB_IDS.forEach(function (tid) {
      var btn = el("raci-tabbtn-" + tid);
      if (btn) {
        btn.addEventListener("click", function () {
          gotoTab(tid);
        });
      }
    });
    document.querySelectorAll(".raci-flow-step[data-flow]").forEach(function (node) {
      node.addEventListener("click", function () {
        var fid = node.getAttribute("data-flow");
        if (fid) gotoTab(fid);
      });
    });
    window.addEventListener("hashchange", function () {
      gotoTab(readHashTab());
    });

    var toPain = el("raci-from-why-to-pain");
    if (toPain) toPain.onclick = function () { gotoTab("pain"); };
    var toSurveyFromWhy = el("raci-from-why-to-survey");
    if (toSurveyFromWhy) toSurveyFromWhy.onclick = function () { gotoTab("survey"); };

    var toTheology = el("raci-from-pain-to-theology");
    if (toTheology) toTheology.onclick = function () { gotoTab("theology"); };

    el("raci-go-step2").onclick = function () {
      gotoTab("survey");
    };
    el("raci-back-step1").onclick = function () {
      gotoTab("pain");
    };
    el("raci-back-step2").onclick = function () {
      gotoTab("survey");
      var qh = el("raci-q-host");
      if (qh) {
        setTimeout(function () {
          try {
            qh.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch (e5) {}
        }, 60);
      }
    };
    el("raci-restart").onclick = function () {
      gotoTab("why");
      renderQuestions(el("raci-lens").value, null);
      if (el("raci-result")) {
        el("raci-result").innerHTML =
          '<p class="raci-muted">尚無結果。完成上方勾選後按「產生我的結果卡」。</p>';
      }
      window.__raciLastReport = "";
    };

    el("raci-analyze-btn").onclick = analyze;
    el("raci-copy-btn").onclick = copyReport;

    el("raci-lens").addEventListener("change", function () {
      renderQuestions(el("raci-lens").value, null);
    });

    renderQuestions(el("raci-lens").value, null);
    tryRestoreBanner();
    gotoTab(readHashTab());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
