/**
 * CTA-OS Phase 3 戰情室：多工具 CTV 聚合、跨工具風險、角色配對建議。
 */
(function (global) {
  "use strict";

  var RT = global.CTAOSRuntime;
  var Bridge = global.CTAOSBridge;
  if (!RT || !Bridge) return;

  var TOOL_LINKS = {
    johari: "johari-window-assessment.html",
    shape: "shape-gifts-assessment.html",
    competency: "ministry-competency-assessment.html",
    kpiokr: "kpi-okr-alignment.html",
    urgent: "important-urgent-matrix.html",
    smart: "smart-planning.html",
    swot: "swot-planning.html",
    pdca: "pdca-planning.html",
    ministry8020: "ministry-8020-planning.html",
    spiritual: "信徒靈性生命健康自我審查.html",
    pastoral: "pastoral-spiritual-survey-pro.html",
    alda: "12 Apostles Leadership Assessment.html",
    raci: "planning/raci-reflection.html",
    ncd: "Church_Health_NCD_planning.html"
  };

  function ctvToGiftScores(vector) {
    function to15(v) {
      return Math.max(1, Math.min(5, 1 + (Number(v) || 0) / 25));
    }
    return {
      teaching: to15(vector.C),
      shepherding: to15(vector.P),
      worship: to15(vector.S),
      administration: to15(vector.G),
      evangelism: to15((vector.G + vector.F) / 2),
      encouragement: to15(vector.R),
      serving: to15((vector.C + vector.R) / 2),
      hospitality: to15(vector.R),
      discernment: to15(vector.F)
    };
  }

  function loadSmRoleDefinitions() {
    var roles = [];
    if (global.DEMO_ROLE_DEFINITIONS && global.DEMO_ROLE_DEFINITIONS.length) {
      roles = roles.concat(global.DEMO_ROLE_DEFINITIONS);
    }
    if (global.SmartMinistryCanonical && typeof global.SmartMinistryCanonical.listMinistriesCatalog === "function") {
      global.SmartMinistryCanonical.listMinistriesCatalog().slice(0, 12).forEach(function (m) {
        var mid = m.ministry_id || m.id || "min";
        var name = m.name || m.title || m.ministry_name || "事工崗位";
        roles.push({
          roleId: "sm_" + mid,
          name: name,
          weights: {
            gifts: {
              teaching: 0.2,
              shepherding: 0.25,
              serving: 0.25,
              administration: 0.15,
              encouragement: 0.15
            }
          }
        });
      });
    }
    if (!roles.length) {
      roles = DEMO_ROLES.map(function (r) {
        return {
          roleId: r.roleId,
          name: r.roleName,
          weights: {
            gifts: {
              teaching: r.required.C / 100,
              shepherding: r.required.P / 100,
              administration: r.required.G / 100,
              serving: r.required.C / 100,
              encouragement: r.required.R / 100,
              evangelism: r.required.G / 100
            }
          }
        };
      });
    }
    return roles;
  }

  var DEMO_ROLES = [
    {
      roleId: "shepherd_coordinator",
      roleName: "牧養協調／小組長",
      required: { P: 72, S: 65, G: 50, C: 55, R: 70, F: 60 }
    },
    {
      roleId: "ministry_admin",
      roleName: "事工行政統籌",
      required: { P: 45, S: 50, G: 75, C: 78, R: 62, F: 65 }
    },
    {
      roleId: "worship_lead",
      roleName: "敬拜主責",
      required: { P: 55, S: 68, G: 48, C: 72, R: 65, F: 70 }
    },
    {
      roleId: "discipleship_trainer",
      roleName: "門訓講師",
      required: { P: 60, S: 70, G: 52, C: 75, R: 58, F: 68 }
    },
    {
      roleId: "missions_catalyst",
      roleName: "差傳推動",
      required: { P: 50, S: 62, G: 78, C: 60, R: 55, F: 72 }
    }
  ];

  function vecArray(v) {
    return RT.dimensions.map(function (d) {
      return v[d] || 0;
    });
  }

  function cosine(a, b) {
    if (!a.length || a.length !== b.length) return 0;
    var dot = 0;
    var na = 0;
    var nb = 0;
    for (var i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    if (!na || !nb) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
  }

  function getToolVector(toolEntry) {
    return toolEntry && toolEntry.report && toolEntry.report.vector;
  }

  function avgDim(toolEntries, dim) {
    var sum = 0;
    var n = 0;
    toolEntries.forEach(function (entry) {
      var v = getToolVector(entry);
      if (v && isFinite(v[dim])) {
        sum += v[dim];
        n += 1;
      }
    });
    return n ? sum / n : null;
  }

  function detectCrossToolRisks(registry) {
    var risks = [];
    var tools = registry.tools || {};
    function v(id) {
      var e = tools[id];
      return e ? getToolVector(e) : null;
    }

    var spiritual = v("spiritual");
    var pastoral = v("pastoral");
    var smart = v("smart");
    var pdca = v("pdca");
    var kpi = v("kpiokr");
    var raci = v("raci");
    var m8020 = v("ministry8020");
    var alda = v("alda");

    function innerLife() {
      var vals = [];
      if (spiritual) vals.push((spiritual.S + spiritual.F) / 2);
      if (pastoral) vals.push((pastoral.S + pastoral.P) / 2);
      if (alda) vals.push((alda.S + alda.F) / 2);
      if (!vals.length) return null;
      return vals.reduce(function (a, b) {
        return a + b;
      }, 0) / vals.length;
    }

    function outputDrive() {
      var vals = [];
      if (smart) vals.push((smart.C + smart.G) / 2);
      if (pdca) vals.push((pdca.C + pdca.G) / 2);
      if (kpi) vals.push((kpi.C + kpi.G) / 2);
      if (!vals.length) return null;
      return vals.reduce(function (a, b) {
        return a + b;
      }, 0) / vals.length;
    }

    var inner = innerLife();
    var output = outputDrive();
    if (inner != null && output != null && output >= 72 && inner <= 48) {
      risks.push({
        level: "critical",
        message:
          "跨工具警示：規劃／執行面向（SMART·PDCA·KPI）偏強，但靈命／牧養面向偏弱——先調整節奏與安息，再推新目標。"
      });
    }

    if (raci && m8020) {
      if (raci.R < 52 && m8020.C >= 68) {
        risks.push({
          level: "warning",
          message:
            "RACI 顯示團隊連結／權責張力，80/20 又顯示執行集中——建議拆分 R 與加支援，避免馬大式過勞。"
        });
      }
    }

    if (spiritual && smart && spiritual.S <= 50 && smart.G >= 70) {
      risks.push({
        level: "warning",
        message: "信徒靈命自評偏低，但 SMART 治理目標偏高——避免用事工產出掩蓋靈命空洞。"
      });
    }

    var sSpread = [];
    Object.keys(tools).forEach(function (id) {
      var vec = v(id);
      if (vec && isFinite(vec.S)) sSpread.push(vec.S);
    });
    if (sSpread.length >= 2) {
      var minS = Math.min.apply(null, sSpread);
      var maxS = Math.max.apply(null, sSpread);
      if (maxS - minS >= 28) {
        risks.push({
          level: "info",
          message:
            "各工具在「屬靈 S」維度落差超過 28 分——可能反映不同對象或不同情境，建議牧者對齊解讀脈絡。"
        });
      }
    }

    var entries = Object.keys(tools).map(function (k) {
      return tools[k];
    });
    var composite = buildCompositeVector(registry);
    var compositeRisks = RT.detectRisks(composite);
    compositeRisks.forEach(function (msg) {
      risks.push({ level: "warning", message: "合成向量：" + msg });
    });

    return risks;
  }

  function buildCompositeVector(registry) {
    var vectors = [];
    Object.keys(registry.tools || {}).forEach(function (id) {
      var vec = getToolVector(registry.tools[id]);
      if (vec) vectors.push(vec);
    });
    return RT.averageVectors(vectors);
  }

  function rankRoles(composite) {
    if (global.matchPersonToRoles) {
      var giftScores = ctvToGiftScores(composite);
      var smRoles = loadSmRoleDefinitions();
      var matched = global.matchPersonToRoles({ scores: giftScores }, smRoles);
      return matched.map(function (m) {
        var score = Number(m.score) || 0;
        var level =
          score >= 82 ? "trial" : score >= 70 ? "pastoral_review" : score >= 58 ? "explore" : "defer";
        return {
          roleId: m.roleId,
          roleName: m.name,
          score: score,
          level: level,
          source: m.roleId.indexOf("sm_") === 0 ? "Smart Ministry" : "示範崗位"
        };
      });
    }
    var cv = vecArray(composite);
    return DEMO_ROLES.map(function (role) {
      var rv = vecArray(role.required);
      var sim = cosine(cv, rv);
      var score = Math.round(sim * 1000) / 10;
      var level =
        score >= 82 ? "trial" : score >= 70 ? "pastoral_review" : score >= 58 ? "explore" : "defer";
      return {
        roleId: role.roleId,
        roleName: role.roleName,
        score: score,
        level: level,
        source: "CTV 示範"
      };
    }).sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function buildWarRoomState() {
    var registry = RT.readRegistry();
    var toolIds = Object.keys(registry.tools || {});
    var composite = buildCompositeVector(registry);
    var tb = {};
    RT.dimensions.slice()
      .sort(function (a, b) {
        return composite[b] - composite[a];
      })
      .forEach(function (d, i) {
        if (i < 2) tb.top = (tb.top || []).concat([d]);
        if (i >= RT.dimensions.length - 2) tb.bottom = (tb.bottom || []).concat([d]);
      });
    return {
      registry: registry,
      toolCount: toolIds.length,
      composite: composite,
      compositeLine: RT.formatVectorLine(composite),
      risks: detectCrossToolRisks(registry),
      roles: rankRoles(composite),
      tools: toolIds
        .map(function (id) {
          var entry = registry.tools[id];
          var rep = entry && entry.report;
          return {
            toolId: id,
            name: (rep && rep.toolName) || (Bridge.TOOL_META[id] && Bridge.TOOL_META[id].name) || id,
            vector: rep && rep.vector,
            vectorLine: rep && rep.vectorLine,
            syncedAt: entry.syncedAt,
            sourceNote: rep && rep.sourceNote,
            href: TOOL_LINKS[id] || "#"
          };
        })
        .sort(function (a, b) {
          return (b.syncedAt || "").localeCompare(a.syncedAt || "");
        })
    };
  }

  function buildPlainSummary(state) {
    var lines = [
      "【CTA-OS 戰情室摘要】",
      "已同步工具數：" + state.toolCount,
      "合成 CTV：" + state.compositeLine,
      ""
    ];
    if (state.tools.length) {
      lines.push("各工具快照：");
      state.tools.forEach(function (t) {
        lines.push(
          "- " +
            t.name +
            "：" +
            (t.vectorLine || "—") +
            "（" +
            (t.syncedAt ? new Date(t.syncedAt).toLocaleString() : "—") +
            "）"
        );
      });
      lines.push("");
    }
    if (state.risks.length) {
      lines.push("跨工具風險：");
      state.risks.forEach(function (r) {
        lines.push("- [" + r.level + "] " + r.message);
      });
      lines.push("");
    }
    lines.push("角色配對（合成向量）：");
    state.roles.slice(0, 3).forEach(function (r) {
      lines.push("- " + r.roleName + "：" + r.score + " 分（" + r.level + "）");
    });
    lines.push("");
    lines.push("— 本摘要僅供團隊禱告與對話，不作人事任免依據。");
    return lines.join("\n");
  }

  function renderRadar(canvas, vector) {
    if (!canvas || !global.Chart) return null;
    var labels = RT.dimensions.map(function (d) {
      return d + " " + RT.dimensionLabels[d];
    });
    var data = RT.dimensions.map(function (d) {
      return vector[d] || 0;
    });
    if (canvas._ctaChart) {
      canvas._ctaChart.destroy();
    }
    canvas._ctaChart = new Chart(canvas.getContext("2d"), {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "合成 CTV",
            data: data,
            backgroundColor: "rgba(67, 56, 202, 0.2)",
            borderColor: "#4338ca",
            pointBackgroundColor: "#4338ca"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { stepSize: 20 }
          }
        }
      }
    });
    return canvas._ctaChart;
  }

  function mountWarRoom(root) {
    if (!root) return;
    var state = buildWarRoomState();

    var toolRows = state.tools
      .map(function (t) {
        var stale =
          t.syncedAt && Date.now() - new Date(t.syncedAt).getTime() > 1000 * 60 * 60 * 24 * 90;
        return (
          "<tr>" +
          '<td><a class="wr-link" href="' +
          t.href +
          '" target="contentFrame">' +
          t.name +
          "</a></td>" +
          "<td class=\"wr-mono\">" +
          (t.vectorLine || "—") +
          "</td>" +
          "<td>" +
          (t.syncedAt ? new Date(t.syncedAt).toLocaleString() : "—") +
          (stale ? ' <span class="wr-badge wr-badge-warn">建議更新</span>' : "") +
          "</td>" +
          '<td class="wr-note">' +
          (t.sourceNote || "") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    var riskHtml = state.risks.length
      ? state.risks
          .map(function (r) {
            return (
              '<li class="wr-risk wr-risk-' +
              r.level +
              '">' +
              r.message +
              "</li>"
            );
          })
          .join("")
      : '<li class="wr-risk wr-risk-ok">目前無跨工具重大風險旗標。</li>';

    var roleHtml = state.roles
      .map(function (r) {
        return (
          "<tr><td>" +
          r.roleName +
          '<br><span class="wr-note">' +
          (r.source || "") +
          "</span></td><td class=\"wr-mono\">" +
          r.score +
          "</td><td>" +
          r.level +
          "</td></tr>"
        );
      })
      .join("");

    root.innerHTML =
      '<section class="wr-section">' +
      '<div class="wr-actions">' +
      '<button type="button" class="wr-btn wr-btn-primary" id="wr-scan">🔍 掃描本機各工具分數</button>' +
      '<button type="button" class="wr-btn" id="wr-copy">💬 複製戰情摘要</button>' +
      '<button type="button" class="wr-btn" onclick="window.print()">🖨️ 打印</button>' +
      '<a class="wr-btn" href="assessment-os-hub.html" target="contentFrame">分層選用中心</a>' +
      "</div>" +
      '<p class="wr-meta">已同步 <strong id="wr-tool-count">' +
      state.toolCount +
      "</strong> 個工具 · 更新 " +
      (state.registry.updatedAt
        ? new Date(state.registry.updatedAt).toLocaleString()
        : "—") +
      "</p>" +
      "</section>" +
      '<div class="wr-grid">' +
      '<section class="wr-card wr-span2">' +
      "<h2>合成 CTV 雷達</h2>" +
      '<p class="wr-line">' +
      state.compositeLine +
      "</p>" +
      '<canvas id="wr-radar" height="260"></canvas>' +
      "</section>" +
      '<section class="wr-card">' +
      "<h2>跨工具風險</h2>" +
      '<ul class="wr-risk-list">' +
      riskHtml +
      "</ul>" +
      "</section>" +
      '<section class="wr-card">' +
      "<h2>角色配對建議</h2>" +
      '<p class="wr-note">依合成 CTV 轉恩賜分數，對照 Smart Ministry 事工目錄與示範崗位（matching_demo）。</p>' +
      '<table class="wr-table"><thead><tr><th>崗位</th><th>匹配</th><th>建議</th></tr></thead><tbody>' +
      roleHtml +
      "</tbody></table>" +
      "</section>" +
      "</div>" +
      '<section class="wr-card wr-span-all">' +
      "<h2>各工具 CTV 快照</h2>" +
      (toolRows
        ? '<table class="wr-table"><thead><tr><th>工具</th><th>CTV</th><th>同步時間</th><th>來源</th></tr></thead><tbody>' +
          toolRows +
          "</tbody></table>"
        : '<p class="wr-note">尚無資料。請先到各工具頁完成測評，或按上方「掃描本機」。</p>') +
      "</section>";

    var scanBtn = root.querySelector("#wr-scan");
    if (scanBtn) {
      scanBtn.addEventListener("click", function () {
        var synced = Bridge.scanAllToolsFromStorage();
        scanBtn.textContent = "已掃描 " + synced.length + " 個工具，重新載入…";
        mountWarRoom(root);
      });
    }
    var copyBtn = root.querySelector("#wr-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var s = buildWarRoomState();
        if (navigator.clipboard) navigator.clipboard.writeText(buildPlainSummary(s));
      });
    }

    var canvas = root.querySelector("#wr-radar");
    if (state.toolCount > 0) renderRadar(canvas, state.composite);
  }

  global.CTAOSWarRoom = {
    buildWarRoomState: buildWarRoomState,
    buildPlainSummary: buildPlainSummary,
    mountWarRoom: mountWarRoom,
    scanAndMount: function (root) {
      Bridge.scanAllToolsFromStorage();
      mountWarRoom(root);
    }
  };
})(window);
