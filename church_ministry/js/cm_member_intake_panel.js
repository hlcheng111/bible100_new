/**
 * 表單回覆 → 會友草稿 面板（P5）
 * 依賴：CmMemberIntake、ChurchDataBridge（寫入會友的唯一路徑 saveMemberSystemData）、CmGoogleLinks（選用）
 * 草稿存在本機 localStorage（含個資，處理完請清空）；原始貼上內容在整理後立即清掉，不存檔。
 */
(function (global) {
  "use strict";

  var doc = global.document;
  var KEY = "bible100_cm_member_drafts_v1";
  var SCHEMA = 1;
  var state = { drafts: [], ignored: [] };

  var STATUS_LABEL = { ready: "可加入", check: "請確認", duplicate: "疑似重複", invalid: "無法建立" };

  function $(id) {
    return doc.getElementById(id);
  }

  function I() {
    return global.CmMemberIntake || null;
  }

  function bridge() {
    return global.ChurchDataBridge || null;
  }

  function setStatus(msg, kind) {
    var el = $("mi-status");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
    el.className = "mi-status" + (kind ? " mi-status--" + kind : "");
  }

  function save() {
    try {
      if (!state.drafts.length) {
        global.localStorage.removeItem(KEY);
        return;
      }
      global.localStorage.setItem(
        KEY,
        JSON.stringify({ schema_version: SCHEMA, saved_at: new Date().toISOString(), drafts: state.drafts, ignored: state.ignored })
      );
    } catch (e) {}
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && o.schema_version === SCHEMA && Array.isArray(o.drafts)) {
        state.drafts = o.drafts;
        state.ignored = Array.isArray(o.ignored) ? o.ignored : [];
      }
    } catch (e) {}
  }

  function existingMembers() {
    var B = bridge();
    if (!B || !B.getMemberSystemData) return null;
    try {
      return (B.getMemberSystemData() || {}).members || [];
    } catch (e) {
      return null;
    }
  }

  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderIgnored() {
    var host = $("mi-ignored");
    if (!host) return;
    host.innerHTML = "";
    if (!state.ignored.length) {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.appendChild(el("strong", "", "這些欄位沒有匯入（原表單仍保留，請勿複製到這裡）："));
    var ul = el("ul", "mi-list");
    state.ignored.forEach(function (g) {
      ul.appendChild(el("li", "", "「" + g.header + "」— " + g.reason));
    });
    host.appendChild(ul);
  }

  function fieldLine(label, value) {
    return value ? label + "：" + value : "";
  }

  function renderDrafts() {
    var host = $("mi-drafts");
    if (!host) return;
    host.innerHTML = "";
    var count = $("mi-count");
    var ready = state.drafts.filter(function (d) {
      return d.status === "ready";
    });
    if (count) count.textContent = state.drafts.length ? "共 " + state.drafts.length + " 筆草稿，其中 " + ready.length + " 筆可直接加入" : "目前沒有草稿";
    var bulk = $("mi-add-ready");
    if (bulk) {
      bulk.disabled = !ready.length;
      bulk.textContent = "把「可加入」的 " + ready.length + " 筆一次加入名冊";
    }
    var clear = $("mi-clear-all");
    if (clear) clear.disabled = !state.drafts.length;
    if (!state.drafts.length) {
      host.appendChild(el("p", "mi-muted", "還沒有草稿。先在上面貼上表單回覆，再按「整理成草稿」。"));
      return;
    }
    state.drafts.forEach(function (d) {
      var card = el("div", "mi-card mi-card--" + d.status);
      var head = el("div", "mi-head");
      head.appendChild(el("span", "mi-tag mi-tag--" + d.status, STATUS_LABEL[d.status] || d.status));
      head.appendChild(el("strong", "", d.name || "（沒有姓名）"));
      head.appendChild(el("span", "mi-muted", "　表單第 " + d.row_no + " 列"));
      card.appendChild(head);
      var line = [
        fieldLine("電話", d.phone),
        fieldLine("電郵", d.email),
        fieldLine("性別", d.gender),
        d.age !== "" ? "年齡：" + d.age : "",
        fieldLine("初來日期", d.first_visit_date),
        fieldLine("地址", d.address),
        fieldLine("備註", d.notes)
      ]
        .filter(Boolean)
        .join("　·　");
      if (line) card.appendChild(el("p", "mi-line", line));
      if (d.duplicates && d.duplicates.length) {
        card.appendChild(el("p", "mi-dup", "⚠ " + I().describeDuplicates(d)));
      }
      (d.warnings || []).forEach(function (w) {
        card.appendChild(el("p", "mi-warn", "・" + w));
      });
      var acts = el("div", "mi-acts");
      if (d.status !== "invalid") {
        var add = el("button", "mi-btn mi-btn--primary", d.status === "duplicate" ? "我確認不是同一人，仍要加入" : "加入會友名冊");
        add.type = "button";
        add.onclick = function () {
          addOne(d.draft_id);
        };
        acts.appendChild(add);
      }
      var skip = el("button", "mi-btn", "略過（不加入）");
      skip.type = "button";
      skip.onclick = function () {
        removeDraft(d.draft_id);
        setStatus("已略過「" + (d.name || "無姓名草稿") + "」，沒有寫入名冊。", "ok");
      };
      acts.appendChild(skip);
      card.appendChild(acts);
      host.appendChild(card);
    });
  }

  function removeDraft(id) {
    state.drafts = state.drafts.filter(function (d) {
      return d.draft_id !== id;
    });
    save();
    renderDrafts();
  }

  function selectedStage() {
    var s = $("mi-stage");
    return (s && s.value) || "seeker";
  }

  /** 寫入一筆（唯一寫入路徑：ChurchDataBridge.saveMemberSystemData）。回傳 {ok, msg} */
  function writeOne(d, force) {
    var B = bridge();
    var C = I();
    if (!B || !B.getMemberSystemData || !B.saveMemberSystemData) {
      return { ok: false, msg: "找不到會友資料底座，無法加入；請從教會事工入口開啟本頁。" };
    }
    if (d.status === "invalid" || !d.name) return { ok: false, msg: "沒有姓名，無法建立會友。" };
    var ms = B.getMemberSystemData() || {};
    var members = Array.isArray(ms.members) ? ms.members : [];
    var dups = C.duplicatesAgainst(d, members);
    var strong = dups.some(function (x) {
      return x.strong;
    });
    if (strong && !force) {
      return { ok: false, msg: "名冊裡已有電話或電郵相同的人（" + dups[0].who + "），為避免重複沒有加入。" };
    }
    var rec = C.toMemberRecord(d, members, { stage: selectedStage() });
    ms.members = members.concat([rec]);
    try {
      B.saveMemberSystemData(ms);
    } catch (e) {
      if (e && e.code === "RBAC_DENIED") return { ok: false, msg: "你的角色沒有「新增會友」的權限，請請行政或牧者協助。" };
      return { ok: false, msg: "寫入失敗：" + ((e && e.message) || e) };
    }
    return { ok: true, id: rec.memberId };
  }

  function addOne(id) {
    var d = state.drafts.filter(function (x) {
      return x.draft_id === id;
    })[0];
    if (!d) return;
    var force = false;
    if (d.status === "duplicate") {
      if (!global.confirm("系統發現「" + d.name + "」可能已在名冊（" + I().describeDuplicates(d) + "）。\n\n確定不是同一個人，仍要新增一位會友嗎？")) return;
      force = true;
    } else if (d.status === "check") {
      var tips = (d.warnings || []).concat(d.duplicates.length ? [I().describeDuplicates(d)] : []);
      if (!global.confirm("這筆有需要留意的地方：\n・" + tips.join("\n・") + "\n\n仍要加入名冊嗎？")) return;
    }
    var r = writeOne(d, force);
    if (!r.ok) {
      setStatus(r.msg, "warn");
      return;
    }
    removeDraft(id);
    setStatus("已加入「" + d.name + "」（會友編號 " + r.id + "）。可到「會友檔案」查看。", "ok");
  }

  function addAllReady() {
    var ready = state.drafts.filter(function (d) {
      return d.status === "ready";
    });
    if (!ready.length) return;
    if (!global.confirm("要把 " + ready.length + " 筆「可加入」的草稿一次加入會友名冊嗎？\n（有警告或疑似重複的不會被加入）")) return;
    var added = 0;
    var failMsg = "";
    for (var i = 0; i < ready.length; i++) {
      var r = writeOne(ready[i], false);
      if (!r.ok) {
        failMsg = r.msg;
        break;
      }
      state.drafts = state.drafts.filter(function (d) {
        return d.draft_id !== ready[i].draft_id;
      });
      added++;
    }
    save();
    renderDrafts();
    setStatus("已加入 " + added + " 位會友。" + (failMsg ? "之後停止：" + failMsg : ""), failMsg ? "warn" : "ok");
  }

  function clearAll() {
    if (!state.drafts.length) return;
    if (!global.confirm("要清空全部 " + state.drafts.length + " 筆草稿嗎？\n（只刪草稿，不影響已在名冊的會友）")) return;
    state.drafts = [];
    state.ignored = [];
    save();
    renderIgnored();
    renderDrafts();
    setStatus("草稿已全部清空。", "ok");
  }

  function build() {
    var C = I();
    var ta = $("mi-paste");
    if (!C || !ta) return;
    var text = ta.value;
    if (!String(text).trim()) {
      setStatus("請先貼上表單回覆（要包含第一列標題）。", "warn");
      return;
    }
    var members = existingMembers();
    if (members === null) {
      setStatus("找不到會友資料底座，無法查重；請從教會事工入口開啟本頁。", "warn");
      return;
    }
    var table = C.parseTable(text);
    if (!table.headers.length || !table.rows.length) {
      setStatus("看不到資料列。請連第一列標題一起複製，至少要有一筆回覆。", "warn");
      return;
    }
    var res = C.buildDrafts(table, members);
    if (!res.has_name_column) {
      state.ignored = res.ignored;
      renderIgnored();
      setStatus("找不到「姓名」欄。請確認複製了第一列標題；表單的姓名問題標題請含「姓名」或「名字」。", "warn");
      return;
    }
    state.drafts = state.drafts.concat(res.drafts);
    state.ignored = res.ignored;
    ta.value = ""; // 原始貼上內容（可能含敏感欄位）立即清掉，不存檔
    save();
    renderIgnored();
    renderDrafts();
    setStatus(
      "已整理 " + res.drafts.length + " 筆草稿" + (res.truncated ? "（超過 " + C.MAX_ROWS + " 筆，只處理前 " + C.MAX_ROWS + " 筆）" : "") +
        "。草稿還不是會友，請逐筆確認。貼上的原始內容已清除。",
      "ok"
    );
  }

  function init() {
    if (!$("mi-paste")) return;
    load();
    var G = global.CmGoogleLinks;
    if (G && G.renderRows) G.renderRows($("mi-links"), ["newcomer_form"], doc);
    $("mi-build").onclick = build;
    $("mi-clear-paste").onclick = function () {
      $("mi-paste").value = "";
    };
    $("mi-add-ready").onclick = addAllReady;
    $("mi-clear-all").onclick = clearAll;
    if (!existingMembers()) {
      setStatus("找不到會友資料底座；請從教會事工入口開啟本頁（仍可預覽草稿，但無法加入）。", "warn");
    }
    renderIgnored();
    renderDrafts();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();

  global.CmMemberIntakePanel = { init: init, build: build, addOne: addOne, addAllReady: addAllReady, clearAll: clearAll, state: state };
})(typeof window !== "undefined" ? window : this);
