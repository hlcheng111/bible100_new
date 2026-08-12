/**
 * KSA 事奉能力 · 四象限九宮格 + K/S/A 橫條（Tab ③ 金標）
 * X = (K+S)/2 能力軸 · Y = A 態度軸 · 門檻 3.0
 */
(function (global) {
  "use strict";

  var THRESH = 3.0;
  var QUADS = [
    {
      id: "passionate_rookie",
      pos: "tl",
      title: "高心志 · 技能成長中",
      subtitle: "熱心成長區",
      color: "#f59e0b",
      hint: "宜 90 天 shadow 陪跑，不作淘汰"
    },
    {
      id: "leader_core",
      pos: "tr",
      title: "領袖核心區",
      subtitle: "K+S 與 A 均達標",
      color: "#10b981",
      hint: "談授權、接班人與進深裝備"
    },
    {
      id: "developing",
      pos: "bl",
      title: "均衡發展區",
      subtitle: "陪跑試任區",
      color: "#64748b",
      hint: "持續培育六域，小步試任"
    },
    {
      id: "skilled_burnout",
      pos: "br",
      title: "高技能 · 心志需更新",
      subtitle: "節奏調整區",
      color: "#ef4444",
      hint: "先 Renewal 與節奏調整，再加任"
    }
  ];

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;");
  }

  function badge(level, label) {
    if (global.AcsReportGold && AcsReportGold.renderStatusBadge) {
      return AcsReportGold.renderStatusBadge(level, label);
    }
    return esc(label || "");
  }

  function ksaLevel(v) {
    v = Number(v) || 0;
    if (v >= THRESH) return { level: "ok", label: "穩定" };
    if (v >= 2.5) return { level: "mid", label: "成長中" };
    return { level: "low", label: "陪跑中" };
  }

  function renderQuadGrid(mp) {
    mp = mp || {};
    var active = mp.profile_type || "developing";
    var grid = QUADS.map(function (q) {
      var isHere = active === q.id;
      return (
        '<div class="acs-quad-cell acs-quad-cell--' +
        q.pos +
        (isHere ? " acs-quad-cell--active" : "") +
        '" style="border-color:' +
        q.color +
        '">' +
        '<div class="acs-quad-cell__head"><strong>' +
        esc(q.title) +
        "</strong> " +
        (isHere ? badge("warn", "您的落點") : "") +
        "</div>" +
        '<p class="acs-quad-cell__harm">' +
        esc(q.subtitle) +
        "</p>" +
        '<p class="acs-quad-cell__action"><strong>牧養提示：</strong>' +
        esc(q.hint) +
        "</p></div>"
      );
    }).join("");
    return (
      '<div class="acs-quad-grid" aria-label="KSA 九宮格四象限">' +
      '<p class="acs-quad-grid__hint">橫軸 = 能力 (K+S)/2（' +
      (mp.capability_axis != null ? mp.capability_axis : "—") +
      "）· 縱軸 = 態度 A（" +
      (mp.attitude != null ? mp.attitude : "—") +
      "）· 門檻 " +
      THRESH +
      "。輪廓：<strong>" +
      esc(mp.profile_label || "—") +
      "</strong></p>" +
      grid +
      "</div>"
    );
  }

  function renderKsaBars(ksa, weakestKsa, trainingHint) {
    ksa = ksa || {};
    var labels = { K: "知識 K", S: "技能 S", A: "態度 A" };
    var colors = { K: "#4338ca", S: "#0284c7", A: "#059669" };
    var bars = ["K", "S", "A"]
      .map(function (k) {
        var val = Number(ksa[k]) || 0;
        var pct = Math.round((val / 5) * 100);
        var st = ksaLevel(val);
        var isWeak = weakestKsa === k;
        return (
          '<div class="acs-bar-row' +
          (isWeak ? " acs-matrix-row--highlight" : "") +
          '"><span class="acs-bar-label">' +
          esc(labels[k]) +
          "</span>" +
          badge(st.level, st.label) +
          '<div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
          pct +
          "%;background:" +
          colors[k] +
          '"></div></div><span class="acs-bar-val">' +
          esc(String(val)) +
          "</span></div>"
        );
      })
      .join("");
    return (
      '<div class="acs-report-block"><h3 class="acs-report-block__title">📊 KSA 成長輪廓（陪跑參考）</h3>' +
      bars +
      '<p class="text-xs text-slate-500 mt-2">最弱 KSA：<strong>' +
      esc(weakestKsa || "—") +
      "</strong>" +
      (trainingHint ? " — " + esc(trainingHint) : "") +
      "</p></div>"
    );
  }

  function renderDomainBars(domainScores) {
    domainScores = domainScores || {};
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
    var bars = keys
      .map(function (k) {
        var val = Number(domainScores[k]) || 0;
        var pct = Math.round((val / 5) * 100);
        var st = ksaLevel(val);
        return (
          '<div class="acs-bar-row"><span class="acs-bar-label">' +
          esc(labels[k]) +
          "</span>" +
          badge(st.level, st.label) +
          '<div class="acs-bar-track"><div class="acs-bar-fill" style="width:' +
          pct +
          "%;background:" +
          (val < THRESH ? "#d97706" : "#059669") +
          '"></div></div><span class="acs-bar-val">' +
          esc(String(val)) +
          "</span></div>"
        );
      })
      .join("");
    return (
      '<div class="acs-report-block"><h3 class="acs-report-block__title">📊 六域服事經驗（自我覺察）</h3>' +
      bars +
      '<p class="text-xs text-slate-500 mt-2">低於門檻且與 SHAPE 推薦事奉相關時，出路卡會建議 explore 陪跑。</p></div>'
    );
  }

  function renderMatrixBlock(run) {
    if (!run || !run.derived) return "";
    var d = run.derived;
    var mp = d.matrix_position || {};
    var ksa = d.ksa_overall || {};
    return (
      '<div class="ksa-matrix-wrap">' +
      renderQuadGrid(mp) +
      renderKsaBars(ksa, d.weakest_ksa, d.training_hint) +
      renderDomainBars(d.domain_scores) +
      "</div>"
    );
  }

  global.KsaMatrixViz = {
    renderMatrixBlock: renderMatrixBlock,
    renderQuadGrid: renderQuadGrid
  };
})(typeof window !== "undefined" ? window : global);
