/**
 * @deprecated M5（2026-07）起 **不上線**。
 * 正式 CRM 側欄 SSOT＝`church_ministry/sidebar_crm_journey.html`（靜態 HTML）。
 * 本檔保留供歷史／測試字串對照（如 C 區 isC + cZoneShellLinks）；
 * **禁止** 在 sidebar_crm_journey.html 或 index_v5 再 script 載入本檔。
 * 見 `church_ministry/docs/CRM_SIDEBAR_SSOT_M5.md`。
 *
 * CRM 旅程側欄 · registry 驅動（歷史實作）
 * 連結下方只用使用者向 blurb（registry），不顯示左欄/右欄/path 工程字。
 */
(function (global, doc) {
  "use strict";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function escJs(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function navAttr(mode, path, focus) {
    if (mode === "ae-layout") {
      return (
        ' href="#" onclick="return crmOpenAeLayout(event,\'' +
        escJs(focus || "") +
        "','" +
        escJs(path) +
        '\');"'
      );
    }
    if (mode === "shell") {
      var parts = String(path).split("|");
      return (
        ' href="#" onclick="return crmShellGo(event,\'' +
        escJs(parts[0] || "") +
        "','" +
        escJs(parts[1] || "") +
        '\');"'
      );
    }
    return ' href="#" onclick="return crmOpenContent(event,\'' + escJs(path) + '\');"';
  }

  function linkRow(opts) {
    var cls = "cm-sidebar__link" + (opts.landing ? " cm-sidebar__link--landing" : "");
    if (opts.muted) cls += " cm-sidebar__link--muted";
    if (opts.hub) cls += " cm-sidebar__link--hub";
    if (opts.ai) cls += " cm-sidebar__link--ai";
    if (opts.layout) cls += " cm-sidebar__link--layout";
    var blurb = opts.blurb ? "<small>" + esc(opts.blurb) + "</small>" : "";
    return (
      "<a" +
      navAttr(opts.mode, opts.path, opts.focus) +
      ' class="' +
      cls +
      '">' +
      esc(opts.label) +
      blurb +
      "</a>"
    );
  }

  function pinRow(text) {
    return '<p class="cm-sidebar__pin">' + esc(text) + "</p>";
  }

  function render(hostId) {
    var host = doc.getElementById(hostId || "crm-sidebar-host");
    var reg = global.CrmJourneyRegistry;
    if (!host || !reg) {
      if (host) {
        host.innerHTML =
          '<p class="cm-sidebar__role-note">側欄載入失敗，請重新整理頁面。</p>';
      }
      return;
    }

    var html = "";

    /* 5F：只開右欄 iframe（左欄保持 CRM 側欄） */
    html += pinRow("🧭 回規劃層（5F）");
    html += linkRow({
      mode: "crm",
      path: reg.planningHref(reg.planningIndex || "index_plan.html"),
      label: "🧭 回教會規劃 · 長執決策",
      blurb: "五年計劃與長執決策入口",
      landing: true,
      hub: true
    });
    (reg.planningShortcuts || []).forEach(function (item) {
      html += linkRow({
        mode: "crm",
        path: reg.planningHref(item.path),
        label: item.label,
        blurb: item.blurb,
        landing: !!item.landing
      });
    });

    html += pinRow("📍 旅程中樞");
    html += linkRow({
      mode: "crm",
      path: reg.hubJourney,
      label: "🙋 我的事奉旅程",
      blurb: "四頁籤：理念 · 旅程 · 牧者 · 媒合",
      landing: true,
      hub: true
    });

    html += pinRow("👤 為誰而來");
    html +=
      '<p class="cm-sidebar__role-lead">自動化幫您<strong>少填表、少追訊息</strong>；派工與存檔仍由人決定。</p>';
    reg.roles.forEach(function (role) {
      html += linkRow({
        mode: "crm",
        path: role.hubUrl,
        label: role.emoji + " " + role.label,
        blurb: role.forWhom
      });
    });

    /* A–E：C 區用 shell 雙欄；其餘區導覽／主桌只開右欄 */
    html += pinRow("🎼 日常手活 A–E");
    reg.aeZones.forEach(function (zone) {
      var p = zone.primary;
      var land = zone.landing;
      var isC = zone.id === "c";
      html += '<p class="cm-sidebar__zone-head">' + esc(zone.emoji + " " + zone.label) + "</p>";

      if (isC && reg.cZoneShellLinks && reg.cZoneShellLinks.length) {
        reg.cZoneShellLinks.forEach(function (item) {
          html += linkRow({
            mode: "shell",
            path: item.sidebarUrl + "|" + item.contentUrl,
            label: item.label,
            blurb: item.blurb,
            landing: item.label.indexOf("導覽") >= 0,
            muted: item.label.indexOf("AI") >= 0 || item.label.indexOf("聖經") >= 0
          });
        });
        return;
      }

      if (
        land &&
        land.path &&
        reg.normPathKey(land.path) !== reg.normPathKey(p.path)
      ) {
        html += linkRow({
          mode: "crm",
          path: reg.toolHref(land.path, p.role, p.step, "sidebar"),
          label: land.label,
          blurb: land.blurb,
          landing: true
        });
      }

      var primaryHref = reg.toolHref(p.path, p.role, p.step, "sidebar");
      html += linkRow({
        mode: "crm",
        path: primaryHref,
        label: p.label,
        blurb: "本區主工作桌"
      });

      html += linkRow({
        mode: "ae-layout",
        path: primaryHref,
        focus: zone.focus,
        label: "📂 " + zone.label + " 完整側欄",
        blurb: "展開本區全部工具目錄",
        layout: true,
        muted: true
      });

      var subpages = reg.subpagesByZone[zone.id] || [];
      var subCount = 0;
      subpages.forEach(function (pg) {
        if (pg.primary || subCount >= 4) return;
        subCount += 1;
        html += linkRow({
          mode: "crm",
          path: reg.toolHref(
            pg.path,
            pg.role || p.role,
            pg.step != null ? pg.step : p.step,
            "sidebar"
          ),
          label: pg.label,
          blurb: pg.blurb,
          muted: true
        });
      });
    });

    html += pinRow("🚀 初體驗與 AI");
    reg.utils.forEach(function (u) {
      if (u.shell && u.sidebarUrl) {
        var sb = u.sidebarUrl.replace(/^\.\.\//, "");
        var cf = u.contentUrl.replace(/^\.\.\//, "");
        html += linkRow({
          mode: "shell",
          path: sb + "|" + cf,
          label: u.label,
          blurb: u.blurb,
          ai: true
        });
      } else {
        html += linkRow({
          mode: "crm",
          path: u.path,
          label: u.label,
          blurb: u.blurb
        });
      }
    });

    html += linkRow({
      mode: "shell",
      path: "tools/tools-overview-sidebar.html|help/interconnect-roadmap.html",
      label: "📖 全站游客手冊",
      blurb: "大楼导览与互联体检"
    });
    html += linkRow({
      mode: "shell",
      path: "tools/tools-overview-sidebar.html|help/site-navigation-guide.html",
      label: "🧭 導覽憲法",
      blurb: "4F/5F 楼层说明"
    });

    host.innerHTML = html;
  }

  function init() {
    render("crm-sidebar-host");
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.CrmSidebarRender = { render: render };
})(window, document);
