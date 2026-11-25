/**
 * Decision Pack v0 · HITL（本機 localStorage）
 * 禁止寫入會友／CRM 主檔；僅決策包與部門切片。
 */
(function (global) {
  "use strict";

  var PACK_KEY = "bible100_decision_pack_v0";
  var SLICES_KEY = "bible100_dept_slices";
  var SIZE_KEY = "b100_planning_preview_size";
  var MIGRATE_C9_KEY = "bible100_dept_slices_migrated_c9";
  var DEPT_ALLOW = "ABCDEFG";

  function lsGet(key) {
    try {
      return global.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function lsSet(key, val) {
    try {
      global.localStorage.setItem(key, val);
    } catch (e2) { /* ignore */ }
  }

  function readJson(key, fallback) {
    try {
      var raw = lsGet(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e3) {
      return fallback;
    }
  }

  function writeJson(key, obj) {
    lsSet(key, JSON.stringify(obj));
  }

  function churchSize() {
    return lsGet(SIZE_KEY) || "micro";
  }

  function emptyPack() {
    return {
      updatedAt: null,
      churchSize: churchSize(),
      items: []
    };
  }

  function loadPack() {
    var p = readJson(PACK_KEY, null);
    if (!p || typeof p !== "object") return emptyPack();
    if (!Array.isArray(p.items)) p.items = [];
    return p;
  }

  function savePack(pack) {
    pack.updatedAt = new Date().toISOString();
    pack.churchSize = churchSize();
    writeJson(PACK_KEY, pack);
    return pack;
  }

  function loadSlices() {
    var s = readJson(SLICES_KEY, null);
    return s && typeof s === "object" ? s : {};
  }

  function saveSlices(slices) {
    writeJson(SLICES_KEY, slices);
  }

  /**
   * C9：舊工作臺把「行政」寫在 slices.E；地圖 E＝社會、G＝行政。
   * 一次性：E 目標搬到 G，清空 E；pack 內 demo_admin／含「行政」的項改為 G。
   */
  function migrateC9LetterEG() {
    if (lsGet(MIGRATE_C9_KEY) === "1") return { skipped: true };
    var slices = loadSlices();
    var moved = 0;
    if (slices.E && Array.isArray(slices.E.goals) && slices.E.goals.length) {
      if (!slices.G) slices.G = { dept: "G", goals: [], updatedAt: null };
      var gGoals = slices.G.goals || [];
      var seen = {};
      gGoals.forEach(function (g) {
        if (g.decisionId) seen[g.decisionId] = 1;
      });
      slices.E.goals.forEach(function (g) {
        if (g.decisionId && seen[g.decisionId]) return;
        gGoals.unshift(g);
        moved++;
        if (g.decisionId) seen[g.decisionId] = 1;
      });
      slices.G.goals = gGoals.slice(0, 20);
      slices.G.updatedAt = new Date().toISOString();
      slices.G.migratedFromE_at = slices.G.updatedAt;
      slices.E = {
        dept: "E",
        goals: [],
        updatedAt: new Date().toISOString(),
        note: "C9 cleared after admin→G migrate"
      };
      saveSlices(slices);
    }
    var pack = loadPack();
    var retarget = 0;
    (pack.items || []).forEach(function (it) {
      if (it.targetDept !== "E") return;
      var tool = String(it.sourceTool || "");
      var title = String(it.title || "") + String(it.summary || "");
      if (tool === "demo_admin" || /行政/.test(title)) {
        it.targetDept = "G";
        retarget++;
      }
    });
    if (retarget) savePack(pack);
    lsSet(MIGRATE_C9_KEY, "1");
    return { skipped: false, movedGoals: moved, retargetItems: retarget };
  }

  function getDeptSlice(dept) {
    migrateC9LetterEG();
    var all = loadSlices();
    var d = String(dept || "B").toUpperCase();
    return all[d] || { dept: d, goals: [], updatedAt: null };
  }

  function uid() {
    return "dp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function itemFromRun(row) {
    var title = (row.tool_id || "assessment") + " · 規劃結果";
    var summary =
      "工具：" +
      (row.tool_id || "—") +
      "；時間：" +
      (row.timestamp ? new Date(row.timestamp).toLocaleString() : "—");
    if (row.derived && typeof row.derived === "object") {
      try {
        var snip = JSON.stringify(row.derived).slice(0, 160);
        summary += "；摘要片段：" + snip;
      } catch (e) { /* ignore */ }
    }
    if (row.risk_flags && row.risk_flags.length) {
      summary += "；風險旗標：" + row.risk_flags.slice(0, 3).join(", ");
    }
    return {
      id: uid(),
      sourceTool: row.tool_id || "assessment_run",
      title: title,
      summary: summary,
      status: "pending",
      targetDept: "B",
      sourceTimestamp: row.timestamp || null
    };
  }

  /** 從 AssessmentRun 索引匯入（最多 n 筆）；無資料回傳 0 */
  function importFromAssessmentRuns(n) {
    n = n || 5;
    var pack = loadPack();
    var added = 0;
    var rows = [];
    if (global.AssessmentRunStore && typeof global.AssessmentRunStore.listRuns === "function") {
      rows = global.AssessmentRunStore.listRuns(null, n) || [];
    } else {
      var idx = readJson("bible100_assessment_runs", []);
      if (Array.isArray(idx)) {
        rows = idx
          .slice()
          .sort(function (a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
          })
          .slice(0, n);
      }
    }
    var existingKeys = {};
    pack.items.forEach(function (it) {
      if (it.sourceTool && it.sourceTimestamp) {
        existingKeys[it.sourceTool + ":" + it.sourceTimestamp] = 1;
      }
    });
    rows.forEach(function (row) {
      var k = (row.tool_id || "") + ":" + (row.timestamp || "");
      if (existingKeys[k]) return;
      pack.items.unshift(itemFromRun(row));
      added++;
    });
    if (added) savePack(pack);
    return { added: added, total: pack.items.length, pack: pack };
  }

  function seedDemo() {
    var pack = loadPack();
    var now = Date.now();
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_smart",
      title: "示範：本季牧養關懷目標",
      summary:
        "示範決策包（非真實量表）。建議 B 區本季聚焦：缺席預警→探訪佇列閉環；小組長每月一次關懷日誌。",
      status: "pending",
      targetDept: "B",
      sourceTimestamp: now
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_match",
      title: "示範：小組長配對缺口",
      summary: "示範：兩組缺副組長候選人；請長執確認後再進媒合／培訓，勿自動改會友檔。",
      status: "pending",
      targetDept: "B",
      sourceTimestamp: now + 1
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_worship",
      title: "示範：主日敬拜流程簡化",
      summary: "示範：A 區本季統一主日流程卡＋排班提醒；勿自動改會友或奉獻資料。",
      status: "pending",
      targetDept: "A",
      sourceTimestamp: now + 2
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_edu",
      title: "示範：門訓季主題與名冊對齊",
      summary: "示範：C 區選定一季門訓主題，並核對主日學名冊出席；勿自動改 CRM。",
      status: "pending",
      targetDept: "C",
      sourceTimestamp: now + 3
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_outreach",
      title: "示範：社區外展一日活動",
      summary: "示範：D 區本季辦一場社區外展＋探訪交接閉環；勿自動改會友檔。",
      status: "pending",
      targetDept: "D",
      sourceTimestamp: now + 4
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_admin",
      title: "示範：行政戰情週報節奏",
      summary: "示範：G 行政支援固定每週更新戰情／財務摘要給長執；勿自動改 CRM。",
      status: "pending",
      targetDept: "G",
      sourceTimestamp: now + 5
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_hymns",
      title: "示範：本季主日詩歌主題庫",
      summary: "示範：F 區整理一季主日選歌主題＋曲譜表常用清單；勿自動改會友或奉獻資料。",
      status: "pending",
      targetDept: "F",
      sourceTimestamp: now + 6
    });
    pack.items.unshift({
      id: uid(),
      sourceTool: "demo_social",
      title: "示範：義工排班空缺補齊",
      summary: "示範：E 社會服務本月排班空缺與調班流程；勿自動改會友檔。",
      status: "pending",
      targetDept: "E",
      sourceTimestamp: now + 7
    });
    savePack(pack);
    return pack;
  }

  function setItemTargetDept(id, dept) {
    var pack = loadPack();
    var d = String(dept || "B").toUpperCase();
    if (DEPT_ALLOW.indexOf(d) < 0) d = "B";
    pack.items.forEach(function (it) {
      if (it.id === id && it.status === "pending") {
        it.targetDept = d;
      }
    });
    savePack(pack);
    return loadPack();
  }

  function setItemStatus(id, status) {
    var pack = loadPack();
    var found = null;
    pack.items.forEach(function (it) {
      if (it.id === id) {
        it.status = status;
        found = it;
      }
    });
    savePack(pack);
    if (found && status === "accepted") {
      acceptToDept(found);
    }
    return found;
  }

  function acceptToDept(item) {
    var dept = String(item.targetDept || "B").toUpperCase();
    var slices = loadSlices();
    if (!slices[dept]) {
      slices[dept] = { dept: dept, goals: [], updatedAt: null };
    }
    var goals = slices[dept].goals || [];
    var exists = goals.some(function (g) {
      return g.decisionId === item.id;
    });
    if (!exists) {
      goals.unshift({
        decisionId: item.id,
        title: item.title,
        summary: item.summary,
        sourceTool: item.sourceTool,
        acceptedAt: new Date().toISOString()
      });
    }
    slices[dept].goals = goals.slice(0, 20);
    slices[dept].updatedAt = new Date().toISOString();
    saveSlices(slices);
    return slices[dept];
  }

  global.DecisionPackV0 = {
    PACK_KEY: PACK_KEY,
    SLICES_KEY: SLICES_KEY,
    SIZE_KEY: SIZE_KEY,
    MIGRATE_C9_KEY: MIGRATE_C9_KEY,
    DEPT_ALLOW: DEPT_ALLOW,
    churchSize: churchSize,
    loadPack: loadPack,
    savePack: savePack,
    loadSlices: loadSlices,
    getDeptSlice: getDeptSlice,
    importFromAssessmentRuns: importFromAssessmentRuns,
    seedDemo: seedDemo,
    setItemStatus: setItemStatus,
    setItemTargetDept: setItemTargetDept,
    acceptToDept: acceptToDept,
    migrateC9LetterEG: migrateC9LetterEG
  };
})(typeof window !== "undefined" ? window : this);
