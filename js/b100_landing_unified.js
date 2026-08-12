/**
 * B100 · 全站 Landing 统一块 SSOT
 * 宗旨：教材百步为主 · 学生→老师→领袖→教牧 · 敢用/愿用/要用/常用
 * 挂载：<div data-b100-landing-unified></div> 或 body[data-b100-unified-mode]
 */
(function (global, doc) {
  "use strict";

  var BUILD = "20260810h";

  var GROWTH = [
    { key: "student", label: "學生", sub: "百步四寶 · 初信" },
    { key: "teacher", label: "老師", sub: "備課 · 教經" },
    { key: "leader", label: "領袖", sub: "事奉 · 規劃" },
    { key: "shepherd", label: "教牧", sub: "牧養 · 門訓" },
  ];

  var FOUR_LABELS = [
    { key: "dare", zh: "敢用", en: "Dare" },
    { key: "want", zh: "願用", en: "Want" },
    { key: "need", zh: "要用", en: "Need" },
    { key: "habit", zh: "常用", en: "Habit" },
  ];

  var MODULES = {
    material: {
      growthFocus: "student",
      missionFull: true,
      sitePos:
        "全站<strong>預設開站入口</strong>（頂欄「首頁」→ 本頁）。六大模組以百步四寶為軸：先學經、再教經，然後才深讀、事奉、校務與 AI 草稿。",
      lite: {
        title: "🌱 我是初學者",
        hint: "從中文百步第一課或信仰四寶開始，每天一小步。",
        nav: { sidebarUrl: "languages/index_cn.html", contentUrl: "languages/cn/OT/chapters/chapter1.html" },
      },
      pro: {
        title: "📚 我要備課出教材",
        hint: "百步总论手册 · 门训动力站 · 进阶 ad 版。",
        nav: { sidebarUrl: "languages/index_cn.html", contentUrl: "help/bible100_curriculum_manual.html" },
      },
      four: [
        { zh: "白話引導、語言軌清楚", hint: "敢用" },
        { zh: "雙資訊圖 + 路線圖", hint: "願用" },
        { zh: "OT/NT/T4 · 門訓動力", hint: "要用" },
        { zh: "頂欄第二列語言、W5 備課劇本", hint: "常用" },
      ],
      links: [
        { label: "→ 深讀研讀", why: "教完要查考", nav: { mode: "study" } },
        { label: "→ 教會事工", why: "學生長大要事奉", nav: { mode: "church" } },
        { label: "→ AI 備課", why: "出教材草稿", nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/tools/bible_prompt_generator.html" } },
      ],
    },
    study: {
      growthFocus: "teacher",
      missionFull: false,
      sitePos:
        "隸屬<strong>② 聖經研讀</strong>。百步學經後在此<strong>深讀、對照、釋經</strong>；第 5 站「聖經跑道」給每日輕量打卡（小白），綜合解讀給備課深度（專家）。",
      lite: {
        title: "🦁 今日跑道 · 約 5 分鐘",
        hint: "斷更也沒關係，回來就好。",
        nav: { sidebarUrl: "bible_study/sidebar.html", contentUrl: "bible_app/shell/index.html" },
      },
      pro: {
        title: "📖 譯本對照 · 綜合解讀",
        hint: "多語並排 · 釋經參讀（命脈功能）。",
        nav: { sidebarUrl: "bible_study/sidebar.html", contentUrl: "bible_study/comprehensive_exegesis_reader.html?book=創世記&chapter=1" },
      },
      four: [
        { zh: "跑道 landing 零门槛", hint: "敢用" },
        { zh: "研讀四階資訊圖", hint: "願用" },
        { zh: "对照 / 工具 / 释经", hint: "要用" },
        { zh: "頂欄2 路線·跑道·工具", hint: "常用" },
      ],
      links: [
        { label: "← 回百步四寶", why: "教材是主軸", nav: { mode: "material" } },
        { label: "→ 聖經難題", why: "查題備答", nav: { mode: "qna" } },
        { label: "→ AI 導讀", why: "草稿須人審", nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/pages/guide_reading_hub.html" } },
      ],
    },
    qna: {
      growthFocus: "teacher",
      missionFull: false,
      sitePos:
        "隸屬<strong>③ 聖經難題</strong>。預設進 Q&amp;A 工作台（全寬）；本 landing 說明四層查題。<strong>例外：</strong>無左欄側欄，與六模式雙欄略不同。",
      lite: {
        title: "❓ 瀏覽難題分類",
        hint: "先选大类 A/B/C，再选来源。",
        nav: { contentUrl: "qna/index.html?cat=A" },
      },
      pro: {
        title: "🔍 Q&A 工作台",
        hint: "原站 iframe · 備課素材鏈 AI。",
        nav: { contentUrl: "qna/index.html" },
      },
      four: [
        { zh: "四層圖 + 白話 lead", hint: "敢用" },
        { zh: "大類 → 來源 → 題目", hint: "願用" },
        { zh: "查題 + 證道素材", hint: "要用" },
        { zh: "與 AI 備課鏈動", hint: "常用" },
      ],
      links: [
        { label: "← 百步教材", why: "先學經再答難", nav: { mode: "material" } },
        { label: "→ 研讀釋經", why: "深度查考", nav: { mode: "study" } },
        { label: "→ AI 問答草稿", why: "須老師審核", nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/pages/ai_qa_system.html" } },
      ],
    },
    church: {
      growthFocus: "leader",
      missionFull: false,
      sitePos:
        "隸屬<strong>④ 教會事工</strong>。頂欄第二列 = <strong>A–G 正式名</strong>；本頁路線圖與會友主檔分頁。百步出來的學生在此<strong>事奉、牧養、規劃</strong>（G 區）。",
      lite: {
        title: "🏠 A–G 路線首頁",
        hint: "點下方路線圖任一站；上方 Tab 進會友總覽。",
        nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html", contentUrl: "church_ministry/_landing/gateway.html" },
      },
      pro: {
        title: "👤 會友主檔 · G 規劃",
        hint: "member_id 主鍵 · 規劃量表 · 數據儀表。",
        nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html", contentUrl: "church_ministry/modules/members/member-integrated.html#tab=overview" },
      },
      four: [
        { zh: "gateway 白話 + A–G Tab", hint: "敢用" },
        { zh: "資訊圖 + 路線圖", hint: "願用" },
        { zh: "A–G 工作桌 · 會友 6 Tab", hint: "要用" },
        { zh: "頂欄2 切區 · 側欄 focus", hint: "常用" },
      ],
      links: [
        { label: "← 百步門訓", why: "門訓動力站", nav: { sidebarUrl: "disciple_dynamics/sidebar.html", contentUrl: "disciple_dynamics/dashboard.html" } },
        { label: "→ 學校學籍", why: "主日學→學籍", nav: { mode: "school" } },
        { label: "→ 智慧事奉", why: "配對須 HITL", nav: { sidebarUrl: "smart_ministry/sidebar.html", contentUrl: "smart_ministry/landing.html" } },
      ],
    },
    school: {
      growthFocus: "leader",
      missionFull: false,
      sitePos:
        "隸屬<strong>⑤ 學校管理</strong>。收生→畢業校務線；<strong>與教會 C 區主日學</strong>共用 member_id。百步教師也可在此管班級點名。",
      lite: {
        title: "🎯 今天點名 / 審核",
        hint: "三大情境 · ≤3 步闭环。",
        nav: { sidebarUrl: "school_management/sidebar.html", contentUrl: "school_management/manage/academic_integrated.html" },
      },
      pro: {
        title: "📋 學籍 · 課程註冊",
        hint: "A–E 部門 · 與 CM 橋接。",
        nav: { sidebarUrl: "school_management/sidebar.html", contentUrl: "school_management/course_completion.html" },
      },
      four: [
        { zh: "三大情境卡片", hint: "敢用" },
        { zh: "校園 hub 圖 + 原則卡", hint: "願用" },
        { zh: "教务 4 Tab · A–E", hint: "要用" },
        { zh: "JSON 備份 · 頂欄2 工作台", hint: "常用" },
      ],
      links: [
        { label: "← 教會 C 門訓", why: "同一批學生", nav: { sidebarUrl: "church_ministry/sidebar_church_layout_v1.html?focus=c", contentUrl: "church_ministry/modules/education/education-integrated.html" } },
        { label: "→ 百步教材", why: "課程出處", nav: { mode: "material" } },
        { label: "→ AI 教務草稿", why: "須人審", nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/tools/ai_workbench_integrated.html" } },
      ],
    },
    ai: {
      growthFocus: "teacher",
      missionFull: false,
      sitePos:
        "隸屬<strong>⑥ AI 輔助</strong>。A–E 任務主線：<strong>無 API key</strong>，站內生成 Prompt → 複製到 ChatGPT/Kimi → <strong>人審</strong>。服務百步備課與教會事工，非神學權威。",
      lite: {
        title: "✨ 一句話任務入口",
        hint: "選情境 → 4 Tab 工作台 → 複製 Prompt。",
        nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/tools/ai_workbench_integrated.html?crm_from=hub_workbench#tab-prompt" },
      },
      pro: {
        title: "🧩 Lab 工作台 · 事工应用",
        hint: "Prompt 生成 · 规划落地 · 口述预填。",
        nav: { sidebarUrl: "ai_tools/sidebar_lab.html", contentUrl: "ai_tools/tools/bible_prompt_generator.html" },
      },
      four: [
        { zh: "情境一句話 + 雙 CTA", hint: "敢用" },
        { zh: "A–E 圖 + 路線圖", hint: "願用" },
        { zh: "4 Tab 工作台 · 跨模鏈", hint: "要用" },
        { zh: "頂欄2 備課/事工/Plan", hint: "常用" },
      ],
      links: [
        { label: "← 百步我要教", why: "S4 備課鏈", nav: { sidebarUrl: "help/sidebar_help.html", contentUrl: "help/bible100_curriculum_manual.html" } },
        { label: "→ 研讀釋經", why: "查經 Prompt", nav: { mode: "study" } },
        { label: "→ 教會 G 規劃", why: "量表摘要", nav: { sidebarUrl: "church_planning/sidebar_plan.html", contentUrl: "church_planning/index_plan.html" } },
      ],
    },
    site: {
      growthFocus: "student",
      missionFull: true,
      sitePos:
        "<strong>全站地圖（進階 L0）</strong>。日常開站請用頂欄「聖經百步四寶」→ 教材 landing；本頁供<strong>六大模組總覽</strong>與迷路時對照。",
      lite: {
        title: "📚 百步四寶開站",
        hint: "全站預設入口 · 教材與培訓。",
        nav: { mode: "material" },
      },
      pro: {
        title: "🗺️ 六模組路線圖",
        hint: "點下方任一站進入模組。",
        nav: { action: "siteHome" },
      },
      four: [
        { zh: "頂欄首頁 = 百步", hint: "敢用" },
        { zh: "六模組資訊圖（待補）", hint: "願用" },
        { zh: "程式路線圖 SSOT", hint: "要用" },
        { zh: "W5 愛用劇本 · 導航憲法", hint: "常用" },
      ],
      links: [
        { label: "→ 教材百步", why: "主軸", nav: { mode: "material" } },
        { label: "→ 導航憲法", why: "迷路必讀", nav: { sidebarUrl: "help/sidebar_help.html", contentUrl: "help/site-navigation-guide.html" } },
        { label: "→ W5 劇本", why: "常用任務", nav: { sidebarUrl: "help/sidebar_help.html", contentUrl: "help/user_playbooks_w5.html" } },
      ],
    },
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function resolveMode(el) {
    if (el && el.getAttribute("data-b100-unified-mode")) {
      return el.getAttribute("data-b100-unified-mode");
    }
    var body = doc.body;
    if (!body) return "material";
    var mode = body.getAttribute("data-b100-unified-mode") || body.getAttribute("data-b100-module-mode");
    if (mode && MODULES[mode]) return mode;
    var mod = body.getAttribute("data-b100-module");
    if (mod === "languages") return "material";
    if (mod === "bible_study") return "study";
    if (mod === "qna") return "qna";
    if (mod === "school" || mod === "school_management") return "school";
    if (mod === "ai_tools") return "ai";
    if (mod === "shell") return "site";
    if (mod === "church_ministry") return "church";
    return "material";
  }

  function sq(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function navAttrs(nav) {
    if (!nav) return { href: "#", onclick: "" };
    if (global.B100_navLinkAttrs) return global.B100_navLinkAttrs(nav);
    var cf = nav.contentUrl || "";
    var sb = nav.sidebarUrl || "";
    if (nav.mode && global.B100_resolveNav) {
      var r = global.B100_resolveNav({ mode: nav.mode });
      cf = r.contentUrl || cf;
      sb = r.sidebarUrl || sb;
    }
    var onclick = "";
    if (sb && cf) {
      onclick = "return bible100ShellNav(event,{sidebarUrl:'" + sq(sb) + "',contentUrl:'" + sq(cf) + "'})";
    } else if (cf) {
      onclick = "return bible100ShellNav(event,{contentUrl:'" + sq(cf) + "'})";
    } else if (nav.mode) {
      onclick = "return b100ShellRouteNav({mode:'" + sq(nav.mode) + "'},event)";
    } else if (nav.action === "siteHome") {
      onclick = "return b100ShellRouteNav({action:'siteHome'},event)";
    }
    return { href: cf || "#", onclick: onclick };
  }

  function renderCta(card, cls) {
    var lk = navAttrs(card.nav);
    var oc = lk.onclick ? ' onclick="' + esc(lk.onclick) + '"' : "";
    return (
      '<a class="b100-dual-cta__card ' +
      cls +
      '" href="' +
      esc(lk.href) +
      '"' +
      oc +
      ">" +
      '<div class="b100-dual-cta__who">' +
      (cls.indexOf("lite") >= 0 ? "聖經小白 · 初信 / 慕道" : "聖經專家 · 同工 / 牧者") +
      "</div>" +
      '<div class="b100-dual-cta__title">' +
      esc(card.title) +
      "</div>" +
      '<p class="b100-dual-cta__hint">' +
      esc(card.hint) +
      '</p><span class="b100-dual-cta__go">進入 →</span></a>'
    );
  }

  function render(cfg) {
    var focus = cfg.growthFocus || "student";
    var growthHtml = GROWTH.map(function (g) {
      var on = g.key === focus ? " b100-growth__step--on" : "";
      return (
        '<div class="b100-growth__step' +
        on +
        '"><strong>' +
        esc(g.label) +
        "</strong>" +
        esc(g.sub) +
        "</div>"
      );
    }).join("");

    var fourHtml = (cfg.four || []).map(function (f, i) {
      var lab = FOUR_LABELS[i] || FOUR_LABELS[0];
      return (
        '<div class="b100-four__cell"><strong>' +
        esc(lab.zh) +
        "</strong><em>" +
        esc(lab.en) +
        '</em>' +
        esc(f.zh) +
        "</div>"
      );
    }).join("");

    var linksHtml = (cfg.links || [])
      .map(function (L) {
        var lk = navAttrs(L.nav);
        var oc = lk.onclick ? ' onclick="' + esc(lk.onclick) + '"' : "";
        return (
          '<a href="' +
          esc(lk.href) +
          '"' +
          oc +
          ">" +
          esc(L.label) +
          '<span class="b100-link-out__why">' +
          esc(L.why) +
          "</span></a>"
        );
      })
      .join("");

    var missionCls = cfg.missionFull ? "b100-mission" : "b100-mission b100-mission--compact";
    var missionInner = cfg.missionFull
      ? '<p class="b100-mission__tag">全站宗旨 · 教材百步四寶</p>' +
        '<p class="b100-mission__title">教導聖經 · 出教材 · 學生成長</p>' +
        '<p class="b100-mission__text">學生透過百步四寶學經 → 成長為<strong>老師</strong>（備課出教材）→ <strong>領袖</strong>（事奉規劃）→ <strong>教牧</strong>（牧養門訓）。六大模組圍繞此軸互聯，不取代您的聖經權威。</p>'
      : '<p class="b100-mission__tag">百步四寶為主軸</p>' +
        '<p class="b100-mission__text">本區服務成長鏈的一環；<strong>開站與日常預設</strong>請從頂欄「教材與培訓 / 聖經百步四寶」進入。</p>';

    return (
      '<section class="b100-unified" data-b100-unified-build="' +
      BUILD +
      '">' +
      '<div class="' +
      missionCls +
      '">' +
      missionInner +
      "</div>" +
      '<div class="b100-growth" aria-label="成長階梯">' +
      growthHtml +
      "</div>" +
      '<div class="b100-site-pos">' +
      cfg.sitePos +
      "</div>" +
      '<div class="b100-dual-cta">' +
      renderCta(cfg.lite, "b100-dual-cta__card--lite") +
      renderCta(cfg.pro, "b100-dual-cta__card--pro") +
      "</div>" +
      '<div class="b100-four"><p class="b100-four__title">敢用 → 願用 → 要用 → 常用</p><div class="b100-four__grid">' +
      fourHtml +
      "</div></div>" +
      '<div class="b100-link-out"><p class="b100-link-out__title">🔗 與別模組為何連在一起</p>' +
      linksHtml +
      "</div></section>"
    );
  }

  function injectRouteSectionTitles() {
    doc.querySelectorAll("[data-b100-route-map]").forEach(function (host) {
      var sib = host.previousElementSibling;
      if (sib && (sib.classList.contains("b100-route-section-title") || sib.classList.contains("b100-route-section-hint"))) {
        return;
      }
      if (sib && sib.classList.contains("b100-section-title")) {
        if (!sib.nextElementSibling || !sib.nextElementSibling.classList.contains("b100-route-section-hint")) {
          var hintOnly = doc.createElement("p");
          hintOnly.className = "b100-route-section-hint";
          hintOnly.textContent =
            "主線站點可點擊；有分線的站請展開「▸ 分支」，與左欄目錄同色同源（js/b100_nav_ssot.js）。";
          host.parentNode.insertBefore(hintOnly, host);
        }
        return;
      }
      var hint = doc.createElement("p");
      hint.className = "b100-route-section-hint";
      hint.textContent = "主線站點可點擊；有分線的站請展開「▸ 分支」，與左欄目錄同色同源（js/b100_nav_ssot.js）。";
      var title = doc.createElement("h2");
      title.className = "b100-route-section-title";
      title.textContent = "🗺️ 模組路線圖";
      host.parentNode.insertBefore(hint, host);
      host.parentNode.insertBefore(title, hint);
    });
  }

  function openRouteBranchesOnLanding() {
    doc.querySelectorAll(".b100-route-branch-pack").forEach(function (det, idx) {
      if (idx < 2) det.setAttribute("open", "open");
    });
  }

  function boot() {
    var mounts = doc.querySelectorAll("[data-b100-landing-unified]");
    if (!mounts.length && doc.body && doc.body.getAttribute("data-b100-landing-unified") !== "off") {
      var auto = doc.createElement("div");
      auto.setAttribute("data-b100-landing-unified", "1");
      var page = doc.querySelector(".b100-page");
      var anchor = page && page.querySelector(".b100-lead");
      if (page) {
        if (anchor && anchor.nextElementSibling) {
          page.insertBefore(auto, anchor.nextElementSibling);
        } else if (anchor) {
          anchor.parentNode.insertBefore(auto, anchor.nextSibling);
        } else {
          var h1 = page.querySelector("h1");
          if (h1) h1.parentNode.insertBefore(auto, h1.nextSibling);
          else page.insertBefore(auto, page.firstChild);
        }
        mounts = doc.querySelectorAll("[data-b100-landing-unified]");
      }
    }
    mounts.forEach(function (el) {
      var mode = resolveMode(el);
      var cfg = MODULES[mode] || MODULES.material;
      el.innerHTML = render(cfg);
      el.classList.add("b100-unified-mount");
    });
    injectRouteSectionTitles();
    global.setTimeout(openRouteBranchesOnLanding, 80);
  }

  global.B100LandingUnified = { MODULES: MODULES, render: render, boot: boot, BUILD: BUILD };

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : this, document);
