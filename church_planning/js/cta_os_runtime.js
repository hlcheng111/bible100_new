(function (global) {
  "use strict";

  var DIMENSIONS = ["P", "S", "G", "C", "R", "F"];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  function normalizeLikert1To5(value) {
    var v = clamp(Number(value) || 1, 1, 5);
    return ((v - 1) / 4) * 100;
  }

  function emptyVector() {
    return { P: 0, S: 0, G: 0, C: 0, R: 0, F: 0 };
  }

  function scoreByProjection(items) {
    var sums = emptyVector();
    var weights = emptyVector();
    items.forEach(function (item) {
      var normalized = normalizeLikert1To5(item.value);
      DIMENSIONS.forEach(function (dim) {
        var w = (item.projection && item.projection[dim]) || 0;
        if (w <= 0) return;
        sums[dim] += normalized * w;
        weights[dim] += w;
      });
    });
    var out = {};
    DIMENSIONS.forEach(function (dim) {
      out[dim] = weights[dim] > 0 ? round1(sums[dim] / weights[dim]) : 0;
    });
    return out;
  }

  function detectRisks(vector) {
    var risks = [];
    var output = (vector.C + vector.G) / 2;
    var innerLife = (vector.S + vector.F) / 2;
    if (output >= 75 && innerLife <= 45) {
      risks.push("高產出低靈命：先調整節奏與安息。");
    }
    if (vector.G >= 70 && vector.R < 50) {
      risks.push("治理推進強但團隊連結偏弱：建議補回饋與協作流程。");
    }
    return risks;
  }

  var DIMENSION_LABELS = {
    P: "牧養",
    S: "屬靈",
    G: "治理/宣教",
    C: "能力/傳遞",
    R: "團隊",
    F: "成形/果效"
  };

  var LAST_REPORT_KEY = "cta-os-last-report-v1";
  var REGISTRY_KEY = "cta-os-registry-v1";

  function formatVectorLine(vector) {
    return DIMENSIONS.map(function (dim) {
      return dim + " " + DIMENSION_LABELS[dim] + " " + vector[dim];
    }).join(" / ");
  }

  function topBottomDims(vector) {
    var sorted = DIMENSIONS.slice().sort(function (a, b) {
      return vector[b] - vector[a];
    });
    return {
      top: sorted.slice(0, 2),
      bottom: sorted.slice().reverse().slice(0, 2)
    };
  }

  function buildPastoralText(name, vector, toolName) {
    var tb = topBottomDims(vector);
    var risks = detectRisks(vector);
    var lines = [
      "【" + toolName + "】CTA-OS 摘要",
      "對象：" + (name || "未具名同工"),
      "CTV：" + formatVectorLine(vector),
      "優勢維度：" + tb.top.map(function (d) { return d + "(" + DIMENSION_LABELS[d] + ")"; }).join("、"),
      "成長焦點：" + tb.bottom.map(function (d) { return d + "(" + DIMENSION_LABELS[d] + ")"; }).join("、"),
      "30天建議：",
      "- 安排一次牧者/導師對談，確認角色界線與負擔。",
      "- 聚焦一項可量測微行動，每週回顧。",
      "- 保留固定安息時段，避免過載。"
    ];
    if (risks.length) {
      lines.push("風險提示：");
      risks.forEach(function (risk) { lines.push("- " + risk); });
    }
    return lines.join("\n");
  }

  function buildUnifiedReport(opts) {
    var vector = opts.vector || emptyVector();
    var tb = topBottomDims(vector);
    var risks = detectRisks(vector);
    var toolName = opts.toolName || "CTA-OS 工具";
    var subjectName = opts.subjectName || "未具名同工";
    var plainText = buildPastoralText(subjectName, vector, toolName);
    return {
      toolId: opts.toolId || "generic",
      toolName: toolName,
      subjectName: subjectName,
      generatedAt: opts.generatedAt || new Date().toISOString(),
      sourceCount: opts.sourceCount || 0,
      sourceNote: opts.sourceNote || "",
      vector: vector,
      vectorLine: formatVectorLine(vector),
      strengths: tb.top.map(function (d) { return d + "（" + DIMENSION_LABELS[d] + "）"; }).join("、"),
      growth: tb.bottom.map(function (d) { return d + "（" + DIMENSION_LABELS[d] + "）"; }).join("、"),
      risks: risks,
      plainText: plainText
    };
  }

  function persistLastReport(report) {
    try {
      localStorage.setItem(LAST_REPORT_KEY, JSON.stringify(report));
    } catch (e) {}
  }

  function readLastReport() {
    try {
      var raw = localStorage.getItem(LAST_REPORT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function readRegistry() {
    try {
      var raw = localStorage.getItem(REGISTRY_KEY);
      if (!raw) return { version: 1, updatedAt: null, tools: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return { version: 1, updatedAt: null, tools: {} };
      if (!parsed.tools || typeof parsed.tools !== "object") parsed.tools = {};
      return parsed;
    } catch (e) {
      return { version: 1, updatedAt: null, tools: {} };
    }
  }

  function persistToolReport(toolId, report) {
    if (!toolId || !report) return;
    var reg = readRegistry();
    reg.tools[toolId] = {
      report: report,
      syncedAt: report.generatedAt || new Date().toISOString()
    };
    reg.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
    } catch (e) {}
  }

  function averageVectors(vectors) {
    var out = emptyVector();
    if (!vectors || !vectors.length) return out;
    DIMENSIONS.forEach(function (dim) {
      var sum = 0;
      var n = 0;
      vectors.forEach(function (v) {
        if (v && isFinite(v[dim])) {
          sum += v[dim];
          n += 1;
        }
      });
      out[dim] = n > 0 ? round1(sum / n) : 0;
    });
    return out;
  }

  global.CTAOSRuntime = {
    dimensions: DIMENSIONS,
    dimensionLabels: DIMENSION_LABELS,
    LAST_REPORT_KEY: LAST_REPORT_KEY,
    REGISTRY_KEY: REGISTRY_KEY,
    normalizeLikert: normalizeLikert1To5,
    scoreByProjection: scoreByProjection,
    detectRisks: detectRisks,
    buildPastoralText: buildPastoralText,
    buildUnifiedReport: buildUnifiedReport,
    persistLastReport: persistLastReport,
    readLastReport: readLastReport,
    readRegistry: readRegistry,
    persistToolReport: persistToolReport,
    averageVectors: averageVectors,
    formatVectorLine: formatVectorLine
  };
})(window);
