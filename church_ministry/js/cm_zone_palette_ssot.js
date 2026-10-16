/**
 * CM A–H · 區級色譜 SSOT（側欄 L1–L4 + landing 同譜）
 * 刻意拉開色相，避免全藍難分。
 */
(function (global) {
  "use strict";

  var PALETTES = {
    gateway: {
      id: "gateway",
      name: "總羅盤",
      en: "Compass",
      ink: "#0f172a",
      head: "#334155",
      mid: "#64748b",
      soft: "#f1f5f9",
      accent: "#c4a35a",
      hero1: "#0f172a",
      hero2: "#334155",
    },
    a: {
      id: "a",
      name: "崇拜",
      en: "Worship",
      ink: "#0c1e33",
      head: "#1e4d7b",
      mid: "#3b82c4",
      soft: "#e8f1fa",
      accent: "#d4a017",
      hero1: "#0c1e33",
      hero2: "#1e4d7b",
    },
    b: {
      id: "b",
      name: "牧養",
      en: "Care",
      ink: "#14281a",
      head: "#2f6b3c",
      mid: "#4ade80",
      soft: "#e8f5ec",
      accent: "#b45309",
      hero1: "#14281a",
      hero2: "#2f6b3c",
    },
    c: {
      id: "c",
      name: "教育",
      en: "Teach",
      ink: "#1e1b4b",
      head: "#4338ca",
      mid: "#818cf8",
      soft: "#eef2ff",
      accent: "#0d9488",
      hero1: "#1e1b4b",
      hero2: "#4338ca",
    },
    d: {
      id: "d",
      name: "外展",
      en: "Outreach",
      ink: "#431407",
      head: "#c2410c",
      mid: "#fb923c",
      soft: "#fff7ed",
      accent: "#0f766e",
      hero1: "#431407",
      hero2: "#c2410c",
    },
    e: {
      id: "e",
      name: "社關",
      en: "Social",
      ink: "#4c0519",
      head: "#9f1239",
      mid: "#fb7185",
      soft: "#fff1f2",
      accent: "#a16207",
      hero1: "#4c0519",
      hero2: "#9f1239",
    },
    f: {
      id: "f",
      name: "聖詩",
      en: "Hymns",
      ink: "#3a2814",
      head: "#8b5a2b",
      mid: "#d4a574",
      soft: "#f5efe3",
      accent: "#c9892d",
      hero1: "#3a2814",
      hero2: "#8b5a2b",
    },
    g: {
      id: "g",
      name: "規劃",
      en: "Plan",
      ink: "#1a221c",
      head: "#3f6212",
      mid: "#a3e635",
      soft: "#f7fee7",
      accent: "#65a30d",
      hero1: "#1a221c",
      hero2: "#3f6212",
    },
    h: {
      id: "h",
      name: "出席",
      en: "Attend",
      ink: "#042f2e",
      head: "#0f766e",
      mid: "#2dd4bf",
      soft: "#f0fdfa",
      accent: "#0369a1",
      hero1: "#042f2e",
      hero2: "#0f766e",
    },
  };

  function get(id) {
    return PALETTES[String(id || "").toLowerCase()] || null;
  }

  function applyToElement(el, id) {
    if (!el) return;
    var p = get(id);
    if (!p) return;
    el.setAttribute("data-cm-zone", p.id);
    el.style.setProperty("--cm-ink", p.ink);
    el.style.setProperty("--cm-head", p.head);
    el.style.setProperty("--cm-mid", p.mid);
    el.style.setProperty("--cm-soft", p.soft);
    el.style.setProperty("--cm-accent", p.accent);
    el.style.setProperty("--cm-hero-1", p.hero1);
    el.style.setProperty("--cm-hero-2", p.hero2);
    el.style.setProperty("--cm-glow", p.head + "55");
  }

  global.CmZonePalette = {
    PALETTES: PALETTES,
    get: get,
    applyToElement: applyToElement,
  };
})(typeof window !== "undefined" ? window : globalThis);
