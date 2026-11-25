/**
 * CM · Google 表單／試算表連結設定檔（P4）
 *
 * 給小白：
 *  1. 到 Google 表單／試算表按「分享」，複製連結。
 *  2. 用記事本打開本檔，把連結貼在下方 LINKS 對應項目的 url 引號裡（以 https:// 開頭）。
 *  3. 存檔、重新整理頁面。沒貼的項目會顯示「尚未設定」，不會壞掉。
 *
 * 規則（MRM 工程計畫 V1 §5.5）：
 *  - 只接受 https:// 且網域在 ALLOWED_HOSTS 內（避免貼錯、貼到釣魚連結）。
 *  - 本系統只「打開連結」，不會把本機的會友資料送到 Google；
 *    表單若會收集會友個資，是否使用由牧者決定。
 *  - 本檔不連網、不呼叫 AI。
 */
(function (global) {
  "use strict";

  /** 小白只改 url（引號內）；id 請勿改 */
  var LINKS = {
    volunteer_schedule_sheet: { label_zh: "義工排班試算表", url: "" },
    volunteer_availability_form: { label_zh: "義工可服事時段表單", url: "" },
    apprentice_feedback_form: { label_zh: "見習回饋表單", url: "" },
    newcomer_form: { label_zh: "新人登記表單", url: "" }
  };

  /** 允許的網域（需要再加，請由維護同工確認安全後再改） */
  var ALLOWED_HOSTS = ["docs.google.com", "forms.gle", "forms.google.com", "drive.google.com", "sheets.google.com"];

  var NOT_SET_ZH = "尚未設定";

  /**
   * 檢查單一連結字串。
   * @returns {{state:'unset'|'invalid'|'ok', url:string, reason:string}}
   */
  function check(raw) {
    var s = raw == null ? "" : String(raw).trim();
    if (!s) return { state: "unset", url: "", reason: "" };
    if (/[\s\u0000-\u001f]/.test(s)) return { state: "invalid", url: "", reason: "連結中間有空白或換行，請重新複製" };
    if (!/^https:\/\//i.test(s)) return { state: "invalid", url: "", reason: "連結必須以 https:// 開頭" };
    var u;
    try {
      u = new URL(s);
    } catch (e) {
      return { state: "invalid", url: "", reason: "連結格式不對" };
    }
    if (u.protocol !== "https:") return { state: "invalid", url: "", reason: "連結必須以 https:// 開頭" };
    if (u.username || u.password) return { state: "invalid", url: "", reason: "連結不可包含帳號或密碼" };
    if (ALLOWED_HOSTS.indexOf(u.hostname.toLowerCase()) < 0) {
      return { state: "invalid", url: "", reason: "網域 " + u.hostname + " 不在允許清單（只接受 Google 表單／試算表）" };
    }
    return { state: "ok", url: u.href, reason: "" };
  }

  /**
   * 依 id 取得連結狀態。overrides 供測試或其他設定來源覆蓋（可省略）。
   */
  function resolve(id, overrides) {
    var src = (overrides && overrides[id]) || LINKS[id];
    if (!src) return { id: id, label: String(id || ""), state: "unset", url: "", reason: "" };
    var r = check(src.url);
    r.id = id;
    r.label = src.label_zh || id;
    return r;
  }

  function resolveAll(ids, overrides) {
    return (ids || Object.keys(LINKS)).map(function (id) {
      return resolve(id, overrides);
    });
  }

  /**
   * 在頁面上畫出連結列。host 為元素；ids 為要顯示的項目。
   * 缺少設定或格式不對時降級顯示文字，不丟錯。
   */
  function renderRows(host, ids, doc) {
    doc = doc || (typeof document !== "undefined" ? document : null);
    if (!host || !doc) return;
    host.innerHTML = "";
    var ul = doc.createElement("ul");
    ul.className = "cm-glinks";
    ul.style.cssText = "list-style:none;padding:0;margin:6px 0;line-height:2;";
    resolveAll(ids).forEach(function (r) {
      var li = doc.createElement("li");
      var name = doc.createElement("strong");
      name.textContent = r.label + "：";
      li.appendChild(name);
      if (r.state === "ok") {
        var a = doc.createElement("a");
        a.href = r.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "開啟（新分頁）";
        li.appendChild(a);
      } else if (r.state === "invalid") {
        var bad = doc.createElement("span");
        bad.style.color = "#b45309";
        bad.textContent = "連結有問題 — " + r.reason;
        li.appendChild(bad);
      } else {
        var none = doc.createElement("span");
        none.style.color = "#64748b";
        none.textContent = NOT_SET_ZH + "（請在 js/cm_google_links_config.js 貼上 https:// 連結）";
        li.appendChild(none);
      }
      ul.appendChild(li);
    });
    host.appendChild(ul);
    var note = doc.createElement("p");
    note.style.cssText = "margin:4px 0 0;font-size:11px;color:#64748b;";
    note.textContent = "只會開啟連結，不會把這臺電腦的會友資料送到 Google。表單若收集個資，請由牧者決定是否使用。";
    host.appendChild(note);
  }

  var api = {
    LINKS: LINKS,
    ALLOWED_HOSTS: ALLOWED_HOSTS,
    NOT_SET_ZH: NOT_SET_ZH,
    check: check,
    resolve: resolve,
    resolveAll: resolveAll,
    renderRows: renderRows
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmGoogleLinks = api;
  }
})(typeof window !== "undefined" ? window : this);
