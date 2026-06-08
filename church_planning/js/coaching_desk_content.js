/**
 * 五工具族 · 教牧化文案（Tab ①③④）+ 圖表 + 職位矩陣
 */
(function (global) {
  "use strict";

  var RELATION_PLAIN =
    "① SHAPE 答「做什麼事」→ ② Johari 照「團隊鏡子」→ ③ DISC/MBTI 答「怎麼溝通與決策」→ ④ ALDA（長執帶領基準）修飾 P 軸 → ⑤ 合成出路卡 → 牧者約談與正式配對";

  var PASTORAL_DISCLAIMER =
    "本頁專為牧者／輔導員設計。系統<strong>不會自動幫您排班或登記事奉</strong>；一切試任與正式崗位，須經禱告、面談與本人尋求後，在「事奉媒合中心」由人工確認。";

  var JOHARI_DUAL_PLAIN =
    '<div class="acs-pastoral-box">' +
    '<h3 class="acs-pastoral-box__title">為什麼只有這個工具需要填兩份？（自評 vs 邀請他評）</h3>' +
    "<p>生命常有自己看不見的死角。本量表分為 <strong>【我的內省（自評 24 題）】</strong> 與 <strong>【肢體的眼光（他評 24 題）】</strong>，像一面鏡子，照出「屬靈盲點」與「隱藏恩賜」。</p>" +
    '<ul class="acs-pastoral-list"><li><strong>我可以填幾份？</strong> 您自己填一次自評；再邀請 <strong>2–3 位</strong>熟悉您的同工填他評。</li>' +
    "<li><strong>會有兩份報告嗎？</strong> 不會。系統把您的想法與同工的想法<strong>融合成一張 360 度立體報告</strong>，在 Tab ③ 呈現。</li></ul></div>";

  var OTHER_SINGLE_PLAIN =
    '<p class="acs-pastoral-note"><strong>為什麼 DISC / MBTI 只有一份自評？</strong> 它們測量的是您<strong>天生的資訊處理與決策節奏</strong>（出廠設定），這通常只有您內心最清楚；不需要別人打分，而是幫您看見服事引擎如何運轉。</p>';

  var DISC_JOB_MATRIX = [
    { type: "D", label: "高 D（推進型）", roles: "拓荒小組長、外展策劃、危機應變專案、突圍型帶領" },
    { type: "I", label: "高 I（互動型）", roles: "新朋友接待主領、大型聚會主持、關懷小組長、團隊激勵" },
    { type: "S", label: "高 S（穩定型）", roles: "長者探訪、後勤代禱、常態牧養陪伴、小組穩定同工" },
    { type: "C", label: "高 C（謹慎型）", roles: "主日週報校對、財務稽核、影音資訊控管、流程品質把關" }
  ];

  var MBTI_JOB_MATRIX = [
    { code: "E", label: "偏外向 E", roles: "公開帶領、接待團隊、外展連結、大型聚會統籌" },
    { code: "I", label: "偏內向 I", roles: "深度陪輔、一對一牧養、禱告守望、幕後策劃" },
    { code: "S", label: "偏實感 S", roles: "行政落地、探訪實務、主日運作、細節執行" },
    { code: "N", label: "偏直覺 N", roles: "異象策劃、講道預備協作、創新事工、長期藍圖" },
    { code: "T", label: "偏思考 T", roles: "制度設計、長執會決策支援、真理釐清、流程稽核" },
    { code: "F", label: "偏情感 F", roles: "關係修復、小組安全感、衝突調解、關懷統籌" },
    { code: "J", label: "偏判斷 J", roles: "年度計畫、事工排程、專案結案、品質截止管理" },
    { code: "P", label: "偏感知 P", roles: "彈性關懷、突發服事、創意發想、試驗性事工" }
  ];

  var SHAPE_JOB_MATRIX = [
    { dim: "S 恩賜", roles: "教導→主日學；牧養→小組長；勸慰→探訪；治理→長執支援" },
    { dim: "H 熱情", roles: "新人→接待；長者→關懷；兒少→主日學；外展→社區／職場" },
    { dim: "A 才能", roles: "行政→週報流程；媒體→敬拜投影；關懷→實務探訪" },
    { dim: "E 經歷", roles: "恩典故事→見證陪輔；風暴走過→同路人關懷、哀傷支持" }
  ];

  var ALDA_JOB_MATRIX = [
    { apostle: "彼得", label: "彼得 · 推進決策", roles: "危機應變、開拓小組、長執會破冰帶領" },
    { apostle: "約翰", label: "約翰 · 關係凝聚", roles: "小組文化、衝突調解、靈修陪伴型帶領" },
    { apostle: "雅各", label: "雅各 · 變革推進", roles: "異象更新、架構重整、差傳拓展" },
    { apostle: "多馬", label: "多馬 · 風控稽核", roles: "制度稽核、數據把關、風險評估委員" },
    { apostle: "馬太", label: "馬太 · 系統優化", roles: "Church OS／流程數位化、效率優化" },
    { apostle: "猶大", label: "猶大 · 財務把關", roles: "預算審計、ROI 評估、財務委員會" },
    { apostle: "巴多羅買", label: "巴多羅買 · 制度守護", roles: "章程合規、聯簽流程、治理守門" },
    { apostle: "安得烈", label: "安得烈 · 資源鏈結", roles: "跨部門協調、外部資源對接、AB 角制度" }
  ];

  var GOVERNANCE = {
    johari: {
      purpose: "減少堂會內耗與私下耳語。Hidden 過高＝對團隊缺乏信任，牧者應建立安全感，而非考核績效。Blind 過高＝宜 360 回饋後再談帶領。",
      logic: "24 題自評描繪四象限；2–3 份他評與自評交叉後，系統在 Tab ③ 提示盲點與隱藏區差異，修飾出路卡的協作建議（fit_note）。"
    },
    shape: {
      purpose: "決定「做什麼事」的主軸，避免只憑性格標籤派工。S/H/A/E 交叉，才不會單一指標綁架呼召。",
      logic: "13 題 Likert 匯入恩賜輪廓與熱情主軸 → MinistryPathBridge 產出 2–3 張出路卡（就位／試任／拓荒）。"
    },
    disc: {
      purpose: "修飾同工節奏與溝通，不決定事奉大類。高 D 與高 S 同工需節奏互補，避免事工張力變衝突。",
      logic: "16 題量表加總 D/I/S/C → 主型修飾 role_label；與 SHAPE 熱情主軸合成最終出路建議。"
    },
    mbti: {
      purpose: "補足 SHAPE 的 P 軸：服事得久、得喜樂。辨識堂會文化下的隱形壓力（如 NT 在過度情緒導向環境）。",
      logic: "16 題堂會治理情境題 → E/I S/N T/F J/P 四軸 → 修飾 path_cards 的節奏與 fit_note。非 MBTI® 官方，不作臨床診斷。"
    },
    alda: {
      purpose: "長執／核心同工的帶領動力學基準。真實度或一致度偏低時，宜私下面談後再解讀；不可作任免或考核唯一依據。",
      logic: "16 題迫選（最像／最不像）→ C/O/S/F 四叢集 + 十二使徒 rollup → 映射戰情室 P 軸，修飾 path_cards 的 role_label 與 fit_note（仍 HITL）。"
    },
    competency: {
      purpose: "回答「會不會做」— 恩賜（SHAPE）是神給的，能力（KSA）可培育。不作單次淘汰；熱情高、能力低時，牧者應安排陪跑試任。",
      logic: "24 題六域 × KSA（知識／技能／態度）→ 對照 SHAPE 事奉大類；低於 3.0 時出路卡降 explore，Tab ④ 對應微課程或 shadow 陪跑（仍 HITL）。"
    },
    ncd: {
      purpose: "全教會身體檢查，不是給牧長打考績。最小因子（木桶短板）應成為年度 PDCA 與五年計劃攻堅主軸，避免同時開多條戰線。",
      logic: "國際 NCD 八維（24 題快評或十步精靈深度診斷）→ 最小因子法則鎖定破口 → 堂會戰略策略卡 → Tab ④ 一鍵連動 SWOT／SMART／戰情室。"
    }
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function quickStartHtml(toolId) {
    return (
      '<div class="acs-quickstart">' +
      "<h3>⏱️ 3 分鐘入門（給第一次來的朋友）</h3>" +
      "<ol><li>讀完本頁理念 → 點 <strong>Tab ②</strong> 開始填寫（快評約 10 分鐘）</li>" +
      "<li>填完到 <strong>Tab ③</strong> 看八維雷達與最小因子破口</li>" +
      "<li>長執請到 <strong>Tab ④</strong> 開會草案與 SWOT／SMART 傳送門" +
      (toolId === "ncd" ? "（非個人輔導桌）" : "、約談問題草稿") +
      "</li>" +
      (toolId === "shape"
        ? "<li>建議順序：先 SHAPE → 再 Johari → 再 DISC + MBTI（六步路線可點擊跳轉）</li>"
        : "<li>若還沒填 SHAPE，請先完成恩賜引擎，出路卡才會最準</li>") +
      "</ol></div>"
    );
  }

  function jobMatrixHtml(toolId, run) {
    var rows = "";
    var title = "🏛️ 神國職位推薦矩陣";
    if (toolId === "disc") {
      var p = (run && run.derived && run.derived.primary) || "";
      rows = DISC_JOB_MATRIX.map(function (r) {
        var hi = p === r.type ? ' class="acs-matrix-row--highlight"' : "";
        return "<tr" + hi + "><td><strong>" + esc(r.label) + "</strong></td><td>" + esc(r.roles) + "</td></tr>";
      }).join("");
    } else if (toolId === "mbti") {
      var code = (run && run.derived && run.derived.code) || "";
      rows = MBTI_JOB_MATRIX.map(function (r) {
        var hi = code.indexOf(r.code) >= 0 ? ' class="acs-matrix-row--highlight"' : "";
        return "<tr" + hi + "><td><strong>" + esc(r.label) + "</strong></td><td>" + esc(r.roles) + "</td></tr>";
      }).join("");
    } else if (toolId === "shape") {
      rows = SHAPE_JOB_MATRIX.map(function (r) {
        return "<tr><td><strong>" + esc(r.dim) + "</strong></td><td>" + esc(r.roles) + "</td></tr>";
      }).join("");
    } else if (toolId === "johari") {
      rows =
        "<tr><td><strong>Open 高</strong></td><td>跨組協作、公開帶領、團隊文化建設</td></tr>" +
        "<tr><td><strong>Blind 高</strong></td><td>360 回饋、導師陪跑、再評估帶領時機</td></tr>" +
        "<tr><td><strong>Hidden 高</strong></td><td>小組安全感、一對一牧養、幕後服事先試</td></tr>" +
        "<tr><td><strong>Unknown 高</strong></td><td>短期試任、影子學習、探索恩賜</td></tr>";
    } else if (toolId === "alda") {
      var primary = (run && run.derived && run.derived.primary) || "";
      rows = ALDA_JOB_MATRIX.map(function (r) {
        var hi = primary === r.apostle ? ' class="acs-matrix-row--highlight"' : "";
        return "<tr" + hi + "><td><strong>" + esc(r.label) + "</strong></td><td>" + esc(r.roles) + "</td></tr>";
      }).join("");
    } else if (toolId === "competency") {
      var scores = (run && run.derived && run.derived.domain_scores) || {};
      var labels =
        (global.CompetencyPack && CompetencyPack.DOMAIN_LABELS) ||
        {
          admin_ops: "行政落地",
          lead_comm: "帶領溝通",
          care_practice: "關懷實務",
          teach_design: "教學設計",
          team_collab: "團隊協作",
          crisis_resp: "危機應變"
        };
      rows = Object.keys(labels)
        .map(function (k) {
          var v = scores[k];
          var hi = v != null && v < 3 ? ' class="acs-matrix-row--highlight"' : "";
          return (
            "<tr" +
            hi +
            "><td><strong>" +
            esc(labels[k]) +
            "</strong></td><td>" +
            (v != null ? esc(String(v)) + " · " : "") +
            "對照 SHAPE 主軸所需能力域</td></tr>"
          );
        })
        .join("");
    }
    return (
      '<div class="acs-report-block acs-job-matrix">' +
      "<h3>" +
      title +
      "</h3>" +
      '<p class="acs-matrix-lead">以下為<strong>參考方向</strong>，須與 SHAPE 主軸及牧者分辨一併使用；不是任免命令。</p>' +
      '<table class="acs-table"><thead><tr><th>輪廓</th><th>常見適配事奉方向</th></tr></thead><tbody>' +
      rows +
      "</tbody></table></div>"
    );
  }

  function johariMatrixHtml(d) {
    d = d || {};
    var o = Number(d.open_pct) || 0;
    var b = Number(d.blind_pct) || 0;
    var h = Number(d.hidden_pct) || 0;
    var u = Number(d.unknown_pct) || 0;
    return (
      '<div class="acs-report-block">' +
      "<h3>🪟 周哈里窗四宮格（一眼看懂）</h3>" +
      '<div class="acs-johari-grid">' +
      '<div class="acs-johari-cell acs-johari-cell--open" style="flex-grow:' +
      Math.max(o, 8) +
      '"><span class="acs-johari-label">開放區 Open</span><span class="acs-johari-pct">' +
      o +
      '%</span><span class="acs-johari-hint">互知、敢透明</span></div>' +
      '<div class="acs-johari-cell acs-johari-cell--blind" style="flex-grow:' +
      Math.max(b, 8) +
      '"><span class="acs-johari-label">盲點區 Blind</span><span class="acs-johari-pct">' +
      b +
      '%</span><span class="acs-johari-hint">別人看得多</span></div>' +
      '<div class="acs-johari-cell acs-johari-cell--hidden" style="flex-grow:' +
      Math.max(h, 8) +
      '"><span class="acs-johari-label">隱藏區 Hidden</span><span class="acs-johari-pct">' +
      h +
      '%</span><span class="acs-johari-hint">尚未說出的需要</span></div>' +
      '<div class="acs-johari-cell acs-johari-cell--unknown" style="flex-grow:' +
      Math.max(u, 8) +
      '"><span class="acs-johari-label">未知區 Unknown</span><span class="acs-johari-pct">' +
      u +
      '%</span><span class="acs-johari-hint">尚未試出的恩賜</span></div>' +
      "</div></div>"
    );
  }

  function discBarsHtml(d) {
    var s = (d && d.scores) || { D: 0, I: 0, S: 0, C: 0 };
    var max = Math.max(s.D, s.I, s.S, s.C, 1);
    var items = [
      { k: "D", label: "D 推進", color: "#dc2626", v: s.D },
      { k: "I", label: "I 互動", color: "#d97706", v: s.I },
      { k: "S", label: "S 穩定", color: "#059669", v: s.S },
      { k: "C", label: "C 謹慎", color: "#0284c7", v: s.C }
    ];
    return (
      '<div class="acs-report-block"><h3>📊 DISC 四色能量條</h3>' +
      items
        .map(function (it) {
          var pct = Math.round((it.v / max) * 100);
          return (
            '<div class="acs-bar-row"><span class="acs-bar-label">' +
            esc(it.label) +
            '</span><div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
            pct +
            "%;background:" +
            it.color +
            '"></div></div><span class="acs-bar-val">' +
            esc(String(it.v)) +
            "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function mbtiBarsHtml(d) {
    var code = (d && d.code) || "????";
    var axes = [
      { a: "E", b: "I", label: "外向 E ↔ 內向 I" },
      { a: "S", b: "N", label: "實感 S ↔ 直覺 N" },
      { a: "T", b: "F", label: "思考 T ↔ 情感 F" },
      { a: "J", b: "P", label: "判斷 J ↔ 感知 P" }
    ];
    return (
      '<div class="acs-report-block"><h3>📊 四軸傾向（簡化類型：' +
      esc(code) +
      "）</h3>" +
      axes
        .map(function (ax) {
          var left = code.indexOf(ax.a) >= 0 ? 72 : 28;
          return (
            '<div class="acs-bar-row"><span class="acs-bar-label">' +
            esc(ax.label) +
            '</span><div class="acs-bar-track acs-bar-track--split"><div class="acs-bar-fill acs-bar-fill--left" style="width:' +
            left +
            '%"></div></div><span class="acs-bar-val">' +
            (left >= 50 ? ax.a : ax.b) +
            "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function aldaBarsHtml(d) {
    var v = (d && d.vectors) || { C: 0, O: 0, S: 0, F: 0 };
    var labels = { C: "C 核心決策", O: "O 運營合規", S: "S 專業風控", F: "F 一線執行" };
    var colors = { C: "#4338ca", O: "#0284c7", S: "#059669", F: "#d97706" };
    var max = Math.max(v.C, v.O, v.S, v.F, 1);
    return (
      '<div class="acs-report-block"><h3>📊 ALDA 四叢集（映射戰情室 P 軸）</h3>' +
      ["C", "O", "S", "F"]
        .map(function (k) {
          var val = Number(v[k]) || 0;
          var pct = Math.round((val / max) * 100);
          return (
            '<div class="acs-bar-row"><span class="acs-bar-label">' +
            esc(labels[k]) +
            '</span><div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
            pct +
            "%;background:" +
            colors[k] +
            '"></div></div><span class="acs-bar-val">' +
            esc(String(val)) +
            "</span></div>"
          );
        })
        .join("") +
      '<p class="text-xs text-slate-500 mt-2">F 叢集偏高 → 戰情室 P 軸（車頭健康／一線執行壓力）權重較高。</p></div>'
    );
  }

  function competencyBarsHtml(d) {
    var scores = (d && d.domain_scores) || {};
    var labels =
      (global.CompetencyPack && CompetencyPack.DOMAIN_LABELS) ||
      {
        admin_ops: "行政落地",
        lead_comm: "帶領溝通",
        care_practice: "關懷實務",
        teach_design: "教學設計",
        team_collab: "團隊協作",
        crisis_resp: "危機應變"
      };
    var keys = Object.keys(labels);
    var max = 5;
    return (
      '<div class="acs-report-block"><h3>📊 六域能力雷達（門檻 3.0）</h3>' +
      keys
        .map(function (k) {
          var val = Number(scores[k]) || 0;
          var pct = Math.round((val / max) * 100);
          var color = val < 3 ? "#d97706" : "#059669";
          return (
            '<div class="acs-bar-row"><span class="acs-bar-label">' +
            esc(labels[k]) +
            '</span><div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
            pct +
            "%;background:" +
            color +
            '"></div></div><span class="acs-bar-val">' +
            esc(String(val)) +
            "</span></div>"
          );
        })
        .join("") +
      '<p class="text-xs text-slate-500 mt-2">低於 3.0 的域若與 SHAPE 推薦事奉相關，出路卡會建議試任陪跑，不會自動取消服事資格。</p></div>'
    );
  }

  function competencyKsaBarsHtml(d) {
    var ksa = (d && d.ksa_overall) || {};
    var labels = { K: "知識 K", S: "技能 S", A: "態度 A" };
    var colors = { K: "#4338ca", S: "#0284c7", A: "#059669" };
    return (
      '<div class="acs-report-block"><h3>📊 KSA 整體矩陣（PDCA 培訓依據）</h3>' +
      ["K", "S", "A"]
        .map(function (k) {
          var val = Number(ksa[k]) || 0;
          var pct = Math.round((val / 5) * 100);
          var color = val < 3 ? "#d97706" : colors[k];
          return (
            '<div class="acs-bar-row"><span class="acs-bar-label">' +
            esc(labels[k]) +
            '</span><div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
            pct +
            "%;background:" +
            color +
            '"></div></div><span class="acs-bar-val">' +
            esc(String(val)) +
            "</span></div>"
          );
        })
        .join("") +
      '<p class="text-xs text-slate-500 mt-2">最弱 KSA：' +
      esc((d && d.weakest_ksa) || "—") +
      " — " +
      esc((d && d.training_hint) || "") +
      "</p></div>"
    );
  }

  function ncdDimBarsHtml(d) {
    var scores = (d && d.dim_scores) || {};
    var min = (d && d.minimum_factor) || {};
    var dims = (global.NcdPack && NcdPack.INTL_DIMS) || [];
    return (
      '<div class="acs-report-block"><h3>📊 八維得分（最小因子：' +
      esc(min.label || "—") +
      "）</h3>" +
      dims
        .map(function (dim) {
          var val = Number(scores[dim.id]) || 0;
          var pct = Math.round((val / 5) * 100);
          var isMin = dim.id === min.id;
          return (
            '<div class="acs-bar-row' +
            (isMin ? " acs-matrix-row--highlight" : "") +
            '"><span class="acs-bar-label">' +
            esc(dim.label) +
            '</span><div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
            pct +
            "%;background:" +
            (isMin ? "#dc2626" : "#4338ca") +
            '"></div></div><span class="acs-bar-val">' +
            esc(String(val)) +
            (isMin ? " ⚠" : "") +
            "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderChartsHtml(toolId, run) {
    if (!run || !run.derived) return "";
    var d = run.derived;
    if (toolId === "johari") {
      if (global.JohariMatrixViz) return JohariMatrixViz.renderFullMatrix(d);
      return johariMatrixHtml(d);
    }
    if (toolId === "disc") {
      if (global.DiscBarsViz) return DiscBarsViz.renderCompareBlock(d);
      return discBarsHtml(d);
    }
    if (toolId === "mbti") {
      if (global.MbtiAxesViz) return MbtiAxesViz.renderAxesBlock(d);
      return mbtiBarsHtml(d);
    }
    if (toolId === "alda") {
      if (global.AldaLifecycleViz) return AldaLifecycleViz.renderLifecycleBlock(d);
      return aldaBarsHtml(d);
    }
    if (toolId === "competency") {
      if (global.KsaMatrixViz) return KsaMatrixViz.renderMatrixBlock(d);
      return competencyBarsHtml(d) + competencyKsaBarsHtml(d);
    }
    if (toolId === "ncd") return ncdDimBarsHtml(d);
    if (toolId === "shape" && global.ShapeRadarSvg) {
      return ShapeRadarSvg.renderRadarBlock(d.gift_scores || {});
    }
    return "";
  }

  var INTRO = {
    shape: function () {
      return (
        quickStartHtml("shape") +
        '<div class="acs-hero">' +
        '<span class="acs-role-badge">核心引擎 · 答「做什麼事」</span>' +
        '<h2 class="serif-title">SHAPE 恩賜整合 — 呼召與事奉大類</h2>' +
        "<p>採 Rick Warren 五向度（S/H/A/P/E），對齊林前 12「肢體互補」：<strong>沒有廢肢，只有尚未對位的恩賜。</strong></p>" +
        '<p class="acs-relation-plain">' +
        esc(RELATION_PLAIN) +
        "</p>" +
        OTHER_SINGLE_PLAIN +
        "</div>" +
        jobMatrixHtml("shape", null)
      );
    },
    johari: function () {
      return (
        quickStartHtml("johari") +
        '<div class="acs-hero">' +
        '<span class="acs-role-badge">團隊鏡子 · 自評 + 他評</span>' +
        '<h2 class="serif-title">Johari 周哈里窗 — 心理安全感與盲點</h2>' +
        "<p>幫您看見：在長執會、事工張力中，能否透明發言、減少耳語與內耗。<strong>不修飾「做什麼事」</strong>（那是 SHAPE）；修飾團隊節奏與協作建議。</p>" +
        JOHARI_DUAL_PLAIN +
        '<div class="acs-cards">' +
        '<div class="acs-card"><h3>Open 開放區</h3><p>互知、敢透明</p></div>' +
        '<div class="acs-card"><h3>Blind 盲點區</h3><p>別人看得多 → 需他評</p></div>' +
        '<div class="acs-card"><h3>Hidden 隱藏區</h3><p>安全感不足而藏起</p></div>' +
        '<div class="acs-card"><h3>Unknown 未知區</h3><p>尚未試出 → 宜試任</p></div>' +
        "</div></div>"
      );
    },
    disc: function () {
      return quickStartHtml("disc") + INTRO.discBody();
    },
    mbti: function () {
      return quickStartHtml("mbti") + INTRO.mbtiBody();
    },
    alda: function () {
      return quickStartHtml("alda") + INTRO.aldaBody();
    },
    competency: function () {
      return quickStartHtml("competency") + INTRO.competencyBody();
    },
    ncd: function () {
      return quickStartHtml("ncd") + INTRO.ncdBody();
    }
  };
  INTRO.discBody = function () {
    return (
      '<div class="acs-hero">' +
      '<span class="acs-role-badge">溝通節奏 · 個人自評</span>' +
      '<h2 class="serif-title">DISC — 同工溝通與推進風格</h2>' +
      "<p>測量您<strong>怎麼溝通、怎麼推進</strong>；不能取代 SHAPE 決定事奉大類。</p>" +
      OTHER_SINGLE_PLAIN +
      "</div>" +
      jobMatrixHtml("disc", null)
    );
  };
  INTRO.mbtiBody = function () {
    return (
      '<div class="acs-hero">' +
      '<span class="acs-role-badge">決策節奏 · 堂會治理版</span>' +
      '<h2 class="serif-title">性格傾向 — 服事得久、得喜樂</h2>' +
      "<p>16 題圍繞長執會決策、講道吸收、突發牧養等<strong>堂會實境</strong>，補足 SHAPE 的 P 軸。</p>" +
      '<p class="acs-pastoral-note"><strong>免責：</strong>教會專用自覺工具，非 MBTI® 官方；不作臨床診斷或任免依據。</p>' +
      OTHER_SINGLE_PLAIN +
      "</div>" +
      jobMatrixHtml("mbti", null)
    );
  };
  INTRO.competencyBody = function () {
    return (
      '<div class="acs-hero">' +
      '<span class="acs-role-badge">恩賜與事奉鐵三角 · 會不會做</span>' +
      '<h2 class="serif-title">事奉能力模型 — KSA 陪跑基準</h2>' +
      "<p>SHAPE 說「做什麼事」；本量表答<strong>「我會不會做」</strong>。每域含 <strong>K 知識、S 技能、A 態度</strong>，缺口直接對應培訓課程（PDCA 的 Action）。</p>" +
      '<p class="acs-pastoral-note"><strong>鐵三角：</strong> SHAPE 恩賜 ➔ <strong>事奉能力 KSA</strong> ➔ ALDA 帶領（長執）。熱情高、技能低 → 試任陪跑，不作淘汰。</p>' +
      '<p class="acs-pastoral-note"><strong>免責：</strong>能力可培育；供牧者約談與梯隊規劃，不作任免唯一依據。</p>' +
      "</div>" +
      jobMatrixHtml("competency", null)
    );
  };
  INTRO.ncdBody = function () {
    var eight =
      (global.NcdPack && NcdPack.INTL_DIMS
        ? NcdPack.INTL_DIMS.map(function (d) {
            return "<li><strong>" + esc(d.label) + "</strong> <span class=\"text-slate-500\">(" + esc(d.en) + ")</span></li>";
          }).join("")
        : "") ||
      "<li>恩賜服事 · 權能領導 · 熱情靈性 · 結構組織 · 喜樂崇拜 · 全人小組 · 全面佈道 · 相愛關係</li>";
    return (
      '<div class="acs-hero">' +
      '<span class="acs-role-badge">Natural Church Development · 全堂診斷</span>' +
      '<h2 class="serif-title">國際 NCD 教會健康 — 身體檢查，不是考績</h2>' +
      "<p>源自 Christian Schwarz 等推動的 <strong>自然教會發展（NCD）</strong>：健康教會的成長不是硬推 KPI，而是像<strong>湧泉</strong>——當八條「健康河道」暢通，活水自然匯流、滋養全地（約 7:38）。</p>" +
      '<div class="acs-pastoral-box"><h3 class="acs-pastoral-box__title">湧泉理論 × 最小因子（Law of the Minimum）</h3>' +
      "<p>決定湧泉流量的，不是最寬的河道，而是<strong>最窄的那一條</strong>。同理，決定教會今年能走多遠的，往往是<strong>得分最低的那一個健康維度</strong>——系統稱之為「最小因子」。</p>" +
      "<p>五年計劃與年度 PDCA 不該靠長執拍腦袋，而應以最小因子為<strong>唯一攻堅主軸</strong>（本季只推一個可檢核的小改變）。</p></div>" +
      '<p class="acs-pastoral-note"><strong>三大象限目標：</strong></p>' +
      '<ul class="acs-pastoral-list">' +
      "<li><strong>屬靈動能</strong>：充滿熱情的靈性、齊心投入的小組</li>" +
      "<li><strong>組織架構</strong>：結構功能的組織、全面兼顧的佈道</li>" +
      "<li><strong>牧養陪伴</strong>：恩賜導向服事、權能領導、喜樂崇拜、相親相愛關係</li>" +
      "</ul>" +
      "<h3 class=\"font-black text-indigo-900 mt-4 mb-2\">國際標準八維（本系統對齊）</h3>" +
      '<ol class="acs-pastoral-list text-sm">' +
      eight +
      "</ol>" +
      '<p class="acs-pastoral-note"><strong>兩條測評路徑：</strong> Tab ② 上方 <strong>24 題脈動快評</strong>（長執會 10 分鐘體檢）＋ 下方 <strong>十步深度精靈</strong>（年度大會完整版）。</p>' +
      '<p class="acs-pastoral-note"><strong>Tab ④ 不是個人輔導：</strong>而是<strong>長執決策工作桌</strong>——退修會草案、SWOT／SMART 傳送門、戰情室追蹤。</p>' +
      "</div>"
    );
  };
  INTRO.aldaBody = function () {
    return (
      '<div class="acs-hero">' +
      '<span class="acs-role-badge">長執／帶領基準 · 五工具族第 5 塊</span>' +
      '<h2 class="serif-title">ALDA — 十二使徒領導力動力學</h2>' +
      "<p>專給<strong>執事、小組長、長執會核心同工</strong>：在危機、決策、財務、團隊張力情境中，看見您的帶領動力輪廓。</p>" +
      '<p class="acs-relation-plain">' +
      esc(RELATION_PLAIN) +
      "</p>" +
      '<p class="acs-pastoral-note"><strong>迫選說明：</strong>每題選一個「最像」與一個「最不像」— 不是 Likert 打分。真實度／一致度偏低時，系統會提示宜私下面談後再解讀。</p>' +
      '<p class="acs-pastoral-note"><strong>免責：</strong>不作人事考核或任免唯一依據；部署仍須牧者 HITL 確認。</p>' +
      "</div>" +
      jobMatrixHtml("alda", null)
    );
  };

  function surveyIntroHtml(toolId) {
    if (toolId === "johari") {
      return (
        '<div class="acs-survey-banner no-print">' +
        '<button type="button" class="acs-btn acs-btn--demo" onclick="loadDemoReport()">🔍 先看大師級示範報告，了解本工具如何運作</button>' +
        "</div>" +
        JOHARI_DUAL_PLAIN
      );
    }
    if (toolId === "alda") {
      return (
        '<div class="acs-survey-banner no-print">' +
        '<button type="button" class="acs-btn acs-btn--demo" onclick="loadDemoReport()">🔍 先看示範報告</button>' +
        '<p class="acs-survey-tip">填寫約 15–20 分鐘 · 每題選 <strong>最像</strong> 與 <strong>最不像</strong> 各一項（不可相同）</p></div>'
      );
    }
    if (toolId === "ncd") {
      return (
        '<div class="acs-survey-banner no-print">' +
        '<button type="button" class="acs-btn acs-btn--demo" onclick="NcdAcsShell.loadDemoReport()">🔍 先看示範報告</button>' +
        '<p class="acs-survey-tip">可先填上方 <strong>24 題快評</strong>（約 10 分鐘），或捲動至下方 <strong>十步深度精靈</strong>。</p></div>'
      );
    }
    return (
      '<div class="acs-survey-banner no-print">' +
      '<button type="button" class="acs-btn acs-btn--demo" onclick="loadDemoReport()">🔍 先看大師級示範報告，了解本工具如何運作</button>' +
      '<p class="acs-survey-tip">填寫約 10–15 分鐘 · 1＝非常不同意 · 5＝非常同意</p></div>'
    );
  }

  function reportExtrasHtml(toolId, run) {
    run = run || {};
    var d = run.derived || {};
    var html = renderChartsHtml(toolId, run) + jobMatrixHtml(toolId, run);
    if (toolId === "shape") {
      html +=
        '<div class="acs-report-block"><h3>📊 您的恩賜特寫</h3><p>心志熱情主軸：<strong>' +
        esc(d.top_heart || "—") +
        "</strong>。請與牧者交叉五向度，勿單一數字綁架。</p></div>";
    }
    if (toolId === "johari") {
      html +=
        '<div class="acs-report-block"><h3>🔍 360 肢體眼光</h3><p>' +
        esc(
          (d.blended && d.blended.note) ||
            (d.peer_overlay
              ? "已收 " + d.peer_overlay.peer_count + " 份他評，請看上方四宮格與下方出路卡。"
              : "尚未收他評。邀請 2–3 位同工填 Tab ②「他評」，報告會更立體。")
        ) +
        "</p></div>";
    }
    if (toolId === "disc" && d.primary) {
      html +=
        '<div class="acs-report-block"><h3>🤝 同工相處小提醒</h3><p>主型 ' +
        esc(d.primary_label || d.primary) +
        " — 記住：DISC 修飾節奏，<strong>SHAPE 決定事奉大類</strong>。</p></div>";
    }
    if (toolId === "alda" && d.primary) {
      html +=
        '<div class="acs-report-block"><h3>🛡️ 帶領修飾提示</h3><p>主使徒「' +
        esc(d.primary) +
        "」／副使徒「" +
        esc(d.secondary || "—") +
        "」— 已寫入出路卡 fit_note；真實度 " +
        esc(String(d.sincerity != null ? d.sincerity : "—")) +
        "% · 一致度 " +
        esc(String(d.consistency != null ? d.consistency : "—")) +
        "%。</p></div>";
    }
    if (toolId === "competency" && d.domain_scores) {
      html +=
        '<div class="acs-report-block"><h3>🎓 KSA 陪跑提示</h3><p>強項「' +
        esc(d.primary_label || "—") +
        "」／待補「" +
        esc(d.weakest_label || "—") +
        "」· 最弱 KSA：<strong>" +
        esc(d.weakest_ksa || "—") +
        "</strong> — " +
        esc(d.training_hint || "") +
        "。低於 3.0 時出路卡建議 <strong>explore 試任</strong>。</p></div>";
    }
    if (toolId === "ncd" && d.minimum_factor) {
      html +=
        '<div class="acs-report-block"><h3>🎯 五年計劃錨點</h3><p>本會當前戰略破口：<strong>' +
        esc(d.minimum_factor.label) +
        "</strong>（" +
        esc(String(d.minimum_factor.score)) +
        " 分）。請至 Tab ④ 啟動 SWOT → SMART → 戰情室追蹤。</p></div>";
    }
    return html;
  }

  function interviewQuestions(toolId, run) {
    var d = (run && run.derived) || {};
    if (toolId === "johari") {
      return [
        "您希望同工幫您看見的一個盲點是什麼？",
        "在團隊中，何時您感到最安全能分享軟弱？",
        "若有還沒說出的需要，您希望誰先傾聽？"
      ];
    }
    if (toolId === "shape") {
      return [
        "在恩賜、熱情、才能、經歷中，哪一項最像神目前的負擔？",
        "您的生命經歷如何成為安慰同路人的禮物？",
        "若出路卡出現「拓荒種子」，您願意與牧者如何禱告分辨？"
      ];
    }
    if (toolId === "disc") {
      return [
        "您的 " + (d.primary_label || "風格") + " 在事奉中最大的恩賜是什麼？",
        "與不同風格同工衝突時，您通常如何反應？",
        "哪些崗位節奏讓您服事最健康？"
      ];
    }
    if (toolId === "mbti") {
      return [
        "您的 " + (d.code || "類型") + " 傾向在服事中如何被善用？",
        "哪些堂會情境讓您感到隱形壓力？",
        "您需要牧者如何幫您調整服事節奏？"
      ];
    }
    if (toolId === "alda") {
      return [
        "主使徒「" + (d.primary || "—") + "」輪廓中，哪一項是神目前最使用的帶領恩賜？",
        "若真實度或一致度偏低，您願意與誰做私下面談、重新對齊？",
        "四大叢集（C/O/S/F）中，您最需要哪類同工互補？"
      ];
    }
    if (toolId === "competency") {
      return [
        "恩賜（SHAPE）與能力（本表）落差最大的是哪一項？您感受如何？",
        "若建議試任陪跑，您願意與哪位導師 shadow 學習 90 天？",
        "哪些具體場景（主日學、探訪、行政）最能安全地操練待補強能力？"
      ];
    }
    return ["您最近在哪類服事中感到最活潑？", "若尚無對位編制，願意試任哪個方向？"];
  }

  function buildPastoralInvite(toolId, run) {
    run = run || {};
    var d = run.derived || {};
    var name = (run.profile && run.profile.name) || "這位同工";
    var shape = global.AssessmentRunStore ? global.AssessmentRunStore.loadLatest("shape") : null;
    var shapeNote =
      shape && shape.derived ? "SHAPE 熱情「" + (shape.derived.top_heart || "—") + "」" : "（建議先完成 SHAPE）";
    var lines = [
      "【給牧者的約談邀請信草稿 · 請審核後使用】",
      "",
      "對象：" + name,
      "本頁工具：" +
        ({
          shape: "SHAPE 恩賜",
          johari: "Johari 周哈里窗",
          disc: "DISC 溝通",
          mbti: "性格傾向",
          alda: "ALDA 十二使徒領導力",
          competency: "事奉能力模型"
        }[toolId] || toolId),
      shapeNote,
      ""
    ];
    if (toolId === "shape") {
      lines.push("請撰寫溫暖邀請：①肯定恩賜 ②說明出路卡是可能性非命令 ③邀請談試任");
    } else if (toolId === "johari") {
      lines.push("四象限：Open " + (d.open_pct || "?") + "%；請強調這不是考核，而是建立安全感。");
    } else if (toolId === "disc") {
      lines.push("主型 " + (d.primary_label || d.primary) + "；請結合 " + shapeNote + " 談節奏與崗位。");
    } else if (toolId === "mbti") {
      lines.push("類型 " + (d.code || "—") + "；談服事耐久與壓力，避免標籤化。");
    } else if (toolId === "alda") {
      lines.push(
        "主使徒 " +
          (d.primary || "—") +
          "／副使徒 " +
          (d.secondary || "—") +
          "；真實度 " +
          (d.sincerity != null ? d.sincerity : "?") +
          "% — 強調這是帶領節奏參考，不是考核。"
      );
    } else if (toolId === "competency") {
      lines.push(
        "能力強項「" +
          (d.primary_label || "—") +
          "」／待補「" +
          (d.weakest_label || "—") +
          "」— 請談陪跑試任，不作淘汰。"
      );
    }
    if (run.path_cards && run.path_cards.length) {
      lines.push("", "出路卡摘要：");
      run.path_cards.slice(0, 3).forEach(function (c, i) {
        lines.push((i + 1) + ". " + (c.role_label || c.ministry_type) + "（" + c.tier + "）");
      });
    }
    lines.push("", "勿編造經文。正式派任須在「事奉媒合中心」經人工確認。");
    return lines.join("\n");
  }

  function buildAiInstruction(toolId, run) {
    var hasRun = !!(run && run.derived);
    var memo = "";
    if (hasRun) {
      if (toolId === "shape")
        memo = "熱情主軸「" + (run.derived.top_heart || "—") + "」· " + (run.derived.personality_note || "");
      else if (toolId === "johari")
        memo =
          "開放區 " +
          (run.derived.open_pct || "?") +
          "% · 盲點區 " +
          (run.derived.blind_pct || "?") +
          "% · 主區「" +
          (run.derived.dominant || "—") +
          "」";
      else if (toolId === "disc") memo = "溝通主型：" + (run.derived.primary_label || run.derived.primary);
      else if (toolId === "mbti") memo = "類型傾向：" + (run.derived.code || "—");
      else if (toolId === "alda")
        memo =
          "主使徒「" +
          (run.derived.primary || "—") +
          "」· 真實度 " +
          (run.derived.sincerity != null ? run.derived.sincerity : "?") +
          "%";
      else if (toolId === "competency")
        memo =
          "強項「" +
          (run.derived.primary_label || "—") +
          "」· 待補「" +
          (run.derived.weakest_label || "—") +
          "」(" +
          (run.derived.weakest_score != null ? run.derived.weakest_score : "?") +
          ")";
    }
    return [
      "你現在是這間教會的牧者。面前的會友完成了「" +
        ({
          shape: "SHAPE",
          johari: "Johari",
          disc: "DISC",
          mbti: "性格傾向",
          alda: "ALDA 十二使徒領導力",
          competency: "事奉能力模型"
        }[toolId] || toolId) +
        "」測評。",
      hasRun ? "重點摘要：" + memo : "（請先請會友完成 Tab ②，或參考示範報告）",
      "請撰寫：①溫暖肯定 ②一項具體事奉方向建議 ③邀請面談時間",
      "語氣像牧養，不像人事考核。不確定處請明說需查證。"
    ].join("\n");
  }

  function ncdCoachingDeskHtml(run) {
    var gov = GOVERNANCE.ncd;
    var hasRun = !!(run && run.derived);
    var min = hasRun && run.derived.minimum_factor ? run.derived.minimum_factor : null;
    var card = run && run.strategy_cards && run.strategy_cards[0];
    var swotNote = global.NcdPack ? NcdPack.prefillSwotNote(run) : "";
    var smartDraft = global.NcdPack ? NcdPack.prefillSmartDraft(run) : "";
    var retreatDraft =
      "【長執會年度退修會開會草案 · 由 NCD 最小因子自動草擬】\n\n" +
      "一、感謝與肯定：先數算過去一季神保守的恩典（勿跳過）。\n\n" +
      "二、身體檢查摘要：全堂 NCD 診斷顯示當前戰略破口為「" +
      (min ? min.label : "（請先完成 Tab ② 測評）") +
      "」" +
      (min && min.score != null ? "（" + min.score + " 分）" : "") +
      "。\n" +
      (min && min.diagnosis ? "診斷：" + min.diagnosis + "\n" : "") +
      "\n三、本季只推一個改變（6–8 週可檢核）：\n" +
      (card && card.plan ? card.plan : "（完成測評後自動帶入）") +
      "\n\n四、禱告與決議：請長執禱告後，決議是否將此破口寫入 SMART 目標與 PDCA 檢核表。\n\n" +
      "五、下次檢核日：________（建議 6–8 週後）";
    var visionLine =
      "【主任牧師異象傳遞指令草稿】\n弟兄姊妹，我們不是工廠，是基督的身體。今年我們不追求更多活動，而是聚焦「" +
      (min ? min.label : "健康破口") +
      "」的補強，讓每一根枝子都連於真葡萄樹。";

    return (
      '<div class="acs-coaching-desk">' +
      "<h2>④ 長執決策工作桌 · PDCA 戰略中控台</h2>" +
      '<p class="acs-coaching-lead">給長執／牧者：以下文字<strong>沒有 IT 術語</strong>，可直接貼進退修會議程或家書草稿。系統不會自動改寫教會目標，一切決議仍須禱告與表決。</p>' +
      '<div class="acs-coaching-section acs-governance"><h3>📖 治理學理</h3><p><strong>目的：</strong>' +
      esc(gov.purpose) +
      "</p><p><strong>怎麼算出來：</strong>" +
      esc(gov.logic) +
      "</p></div>" +
      (hasRun
        ? '<div class="acs-coaching-section"><h3>🎯 最小因子鎖定（演算法結果）</h3><p class="acs-memo"><strong>' +
          esc(min.label) +
          "</strong>（" +
          esc(String(min.score)) +
          " 分）— " +
          esc(min.diagnosis || "") +
          "</p>" +
          (global.NcdPack && NcdPack.buildAlgorithmSummary
            ? '<div class="mt-2">' + NcdPack.buildAlgorithmSummary(run) + "</div>"
            : "") +
          "</div>"
        : '<div class="acs-coaching-section"><p class="acs-memo acs-memo--empty">請先在 Tab ② 完成 24 題快評或十步精靈，再回此處開會。可先點 Tab ③「示範報告」預覽流程。</p></div>') +
      '<div class="acs-coaching-section"><h3>💬 長執會議問題包（照問即可）</h3><ul class="acs-pastoral-list">' +
      ((global.NcdPack && NcdPack.ELDER_SESSION_QUESTIONS) || [])
        .map(function (q) {
          return "<li>" + esc(q) + "</li>";
        })
        .join("") +
      "</ul></div>" +
      '<div class="acs-coaching-section"><h3>📋 長執會退修會開會草案</h3><pre class="acs-prompt-box" id="acs-ncd-retreat">' +
      esc(retreatDraft) +
      '</pre><button type="button" class="acs-btn acs-btn--primary" data-acs-copy-ncd-retreat>複製退修會草案</button></div>' +
      '<div class="acs-coaching-section"><h3>📣 主任牧師異象傳遞指令</h3><pre class="acs-prompt-box" id="acs-ncd-vision">' +
      esc(visionLine) +
      '</pre><button type="button" class="acs-btn" data-acs-copy-ncd-vision>複製異象草稿</button></div>' +
      '<div class="acs-coaching-section acs-action-portal"><h3>🚀 PDCA 戰略傳送門</h3>' +
      '<p class="acs-step-hint"><strong>P (Plan)</strong> — 將破口帶入 SWOT，分析內部劣勢與外部威脅。</p>' +
      '<pre class="acs-prompt-box text-xs">' +
      esc(swotNote || "（完成測評後顯示 SWOT 預填摘要）") +
      "</pre>" +
      '<button type="button" class="acs-btn acs-btn--primary" data-acs-ncd-swot>➔ 啟動 SWOT 分析（帶入破口）</button>' +
      '<p class="acs-step-hint mt-3"><strong>D (Do)</strong> — 產生 SMART 目標草稿。</p>' +
      '<pre class="acs-prompt-box text-xs">' +
      esc(smartDraft || "（完成測評後顯示 SMART 草稿）") +
      "</pre>" +
      '<button type="button" class="acs-btn acs-btn--primary" data-acs-ncd-smart>➔ 產生 SMART 目標草稿</button>' +
      '<p class="acs-step-hint mt-3"><strong>C/A (Check/Act)</strong> — 釘選戰情室追蹤。</p>' +
      '<a class="acs-btn acs-btn--action" href="#" onclick="return planningOpenContent(event,\'cta-os-war-room.html\');">📡 健康雷達戰情室</a>' +
      '<a class="acs-btn" href="#" onclick="return planningOpenContent(event,\'Church_Governance_PDCA_cycle.html\');">🔄 PDCA 循環日誌</a>' +
      "</div></div>"
    );
  }

  function coachingDeskHtml(toolId, run) {
    if (toolId === "ncd") return ncdCoachingDeskHtml(run);
    var gov = GOVERNANCE[toolId] || GOVERNANCE.shape;
    var hasRun = !!(run && run.derived);
    var memo = "";
    if (hasRun) {
      if (toolId === "shape")
        memo = "熱情主軸「" + (run.derived.top_heart || "—") + "」· " + (run.derived.personality_note || "");
      else if (toolId === "johari")
        memo =
          "開放區 " +
          (run.derived.open_pct || "?") +
          "% · 盲點區 " +
          (run.derived.blind_pct || "?") +
          "% · 主區「" +
          (run.derived.dominant || "—") +
          "」" +
          (run.derived.blended && run.derived.blended.note
            ? " · 360：" + run.derived.blended.note.slice(0, 48) + "…"
            : run.derived.peer_overlay
              ? " · 他評 " + run.derived.peer_overlay.peer_count + " 份"
              : "");
      else if (toolId === "disc") memo = "溝通主型：" + (run.derived.primary_label || run.derived.primary);
      else if (toolId === "mbti") memo = "類型傾向：" + (run.derived.code || "—");
      else if (toolId === "alda")
        memo =
          "主使徒「" +
          (run.derived.primary || "—") +
          "」· 真實度 " +
          (run.derived.sincerity != null ? run.derived.sincerity : "?") +
          "% · 一致度 " +
          (run.derived.consistency != null ? run.derived.consistency : "?") +
          "%";
      else if (toolId === "competency")
        memo =
          "強項「" +
          (run.derived.primary_label || "—") +
          "」· 待補「" +
          (run.derived.weakest_label || "—") +
          "」(" +
          (run.derived.weakest_score != null ? run.derived.weakest_score : "?") +
          ")";
    }
    var qs = interviewQuestions(toolId, run);
    var invite = buildPastoralInvite(toolId, run);
    var aiLines = buildAiInstruction(toolId, run);

    return (
      '<div class="acs-coaching-desk">' +
      "<h2>④ 教牧輔導與約談工作桌</h2>" +
      '<p class="acs-coaching-lead">' +
      esc(PASTORAL_DISCLAIMER) +
      "</p>" +
      '<div class="acs-coaching-section acs-governance">' +
      "<h3>📖 工具治理學理（輔導員請讀）</h3>" +
      "<p><strong>目的：</strong>" +
      esc(gov.purpose) +
      "</p><p><strong>怎麼算出來：</strong>" +
      esc(gov.logic) +
      "</p></div>" +
      '<div class="acs-coaching-section">' +
      "<h3>📋 生命特寫備忘錄</h3>" +
      (hasRun
        ? '<p class="acs-memo">' + esc(memo) + "</p>"
        : '<p class="acs-memo acs-memo--empty">💡 當會友在 Tab ② 完成評測後，這裡會自動出現「生命特寫」。目前請先參閱下方約談指南，或請會友點 Tab ② 頂部「示範報告」。</p>') +
      "</div>" +
      '<div class="acs-coaching-section">' +
      '<h3>💬 一對一約談問題包（可直接照問）</h3><ul class="acs-pastoral-list">' +
      qs.map(function (q) {
        return "<li>" + esc(q) + "</li>";
      }).join("") +
      "</ul></div>" +
      '<div class="acs-coaching-section">' +
      "<h3>✉️ 第一步：啟動愛心約談（牧者邀請信草稿）</h3>" +
      '<pre class="acs-prompt-box" id="acs-invite-draft">' +
      esc(invite) +
      "</pre>" +
      '<button type="button" class="acs-btn acs-btn--primary" data-acs-copy-invite>複製邀請信草稿</button>' +
      "</div>" +
      '<div class="acs-coaching-section">' +
      "<h3>🤖 第二步：AI 靈性同工（可貼到 ChatGPT / Kimi 等）</h3>" +
      '<p class="acs-step-hint">按「複製 AI 指令」→ 貼到您使用的 AI → <strong>牧者務必審核</strong>後再發給會友。</p>' +
      '<pre class="acs-prompt-box" id="acs-ai-instruction">' +
      esc(aiLines) +
      "</pre>" +
      '<button type="button" class="acs-btn" data-acs-copy-ai>複製 AI 指令</button>' +
      "</div>" +
      '<div class="acs-coaching-section acs-action-portal">' +
      "<h3>🚪 下一步：事奉媒合</h3>" +
      '<div class="acs-action-btns">' +
      '<button type="button" class="acs-btn acs-btn--action acs-btn--primary" data-acs-matchmaker="talent_seek_job">⚡ 直接送事奉媒合中心（本機一鍵傳送）</button>' +
      '<button type="button" class="acs-btn acs-btn--action" data-acs-scroll-export>📦 匯出資料帶回家登記（JSON / QR）</button>' +
      '<a class="acs-btn" href="#" onclick="return planningOpenContent(event,\'cta-os-war-room.html\');">📡 健康雷達戰情室（長執總覽）</a>' +
      "</div>" +
      '<p class="acs-step-hint"><strong>本機一鍵</strong>：同一瀏覽器當場約談後立刻送媒合中心（仍須人工確認）。<strong>帶回家</strong>：跨裝置或稍後用 JSON／QR 匯入。</p>' +
      '<p class="acs-step-hint"><button type="button" class="acs-linkish" data-acs-matchmaker="job_seek_talent">牧者／部門負責：先看急缺（工找人）</button></p>' +
      "</div>" +
      '<div class="acs-coaching-section acs-prefill-export" id="acs-prefill-export-panel">' +
      "<h3>📦 回家登記試任（匯出／QR／匯入）</h3>" +
      '<p class="acs-step-hint">當場約談後可把預填包帶回家：下載 JSON、顯示 QR，或貼上匯入碼再進媒合中心 — 仍須人工確認。</p>' +
      '<div class="acs-btn-row">' +
      '<button type="button" class="acs-btn" data-acs-export-json>⬇ 下載預填包 JSON</button>' +
      '<button type="button" class="acs-btn" data-acs-show-qr>📱 顯示 QR（掃碼開媒合中心）</button>' +
      "</div>" +
      '<div id="acs-prefill-qr" class="acs-prefill-qr hidden"></div>' +
      '<label class="acs-import-label">匯入預填包（貼 JSON 或選檔案）</label>' +
      '<textarea class="acs-import-ta" id="acs-prefill-import-text" rows="3" placeholder="貼上 JSON…"></textarea>' +
      '<input type="file" id="acs-prefill-import-file" accept=".json,.txt,application/json" hidden />' +
      '<div class="acs-btn-row">' +
      '<button type="button" class="acs-btn" data-acs-pick-import-file>📂 選擇 JSON 檔</button>' +
      '<button type="button" class="acs-btn acs-btn--primary" data-acs-import-launch>📥 匯入並前往媒合中心</button>' +
      "</div>" +
      "</div></div>"
    );
  }

  global.CoachingDeskContent = {
    RELATION_PLAIN: RELATION_PLAIN,
    introHtml: function (toolId) {
      var fn = INTRO[toolId];
      return fn ? fn() : "";
    },
    surveyIntroHtml: surveyIntroHtml,
    reportExtrasHtml: reportExtrasHtml,
    renderChartsHtml: renderChartsHtml,
    jobMatrixHtml: jobMatrixHtml,
    coachingDeskHtml: coachingDeskHtml,
    buildPastoralInvite: buildPastoralInvite,
    buildAiInstruction: buildAiInstruction,
    buildHitlPrompt: buildPastoralInvite,
    interviewQuestions: interviewQuestions
  };
})(typeof window !== "undefined" ? window : global);
