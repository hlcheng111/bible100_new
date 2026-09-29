/**
 * CM A–G · 区域 SSOT 注册表（波2：逐区接入 Kit）
 * status: kit = 已接 B100SidebarRender；legacy = 仍用 HTML 硬编码
 */
(function (global) {
  "use strict";

  var REGISTRY_BUILD = "20260805d";

  /** @type {Array<object>} */
  var ZONES = [
    {
      id: "a",
      label: "A 敬拜音樂",
      en: "Worship & Music",
      status: "kit",
      ssot: "js/cm_a_menu_ssot.js",
      render: "js/cm_sidebar_zone_render.js",
      hostId: "sb-zone-a"
    },
    {
      id: "b",
      label: "B 牧養小組",
      en: "Pastoral & Groups",
      status: "kit",
      ssot: "js/cm_b_menu_ssot.js",
      render: "js/cm_sidebar_zone_render.js",
      hostId: "sb-zone-b"
    },
    {
      id: "c",
      label: "C 聖經門訓",
      en: "Bible & Discipleship",
      status: "kit",
      ssot: "js/cm_c_menu_ssot.js",
      render: "js/cm_sidebar_zone_render.js",
      hostId: "sb-zone-c"
    },
    {
      id: "d",
      label: "D 外展差傳",
      en: "Outreach & Mission",
      status: "kit",
      ssot: "js/cm_d_menu_ssot.js",
      render: "js/cm_sidebar_zone_render.js",
      hostId: "sb-zone-d"
    },
    {
      id: "e",
      label: "E 社會服務",
      en: "Social Service",
      status: "kit",
      ssot: "js/cm_e_menu_ssot.js",
      render: "js/cm_sidebar_zone_render.js",
      hostId: "sb-zone-e"
    },
    {
      id: "f",
      label: "F 詩歌應用",
      en: "Hymns",
      status: "kit",
      ssot: "js/cm_f_menu_ssot.js",
      render: "js/cm_sidebar_zone_render.js",
      hostId: "sb-zone-f"
    },
    {
      id: "g",
      label: "G 規劃行政",
      en: "Plan & Admin",
      status: "kit",
      ssot: "js/g_do_admin_menu_ssot.js",
      render: "church_planning/js/planning_sidebar_g_menu.js",
      sidebar: "church_planning/sidebar_plan_v5_preview.html",
      note: "独立侧栏；CM 主栏仅路牌"
    }
  ];

  function zoneById(id) {
    for (var i = 0; i < ZONES.length; i++) {
      if (ZONES[i].id === id) return ZONES[i];
    }
    return null;
  }

  function kitZones() {
    return ZONES.filter(function (z) {
      return z.status === "kit";
    });
  }

  global.CmAGMenuRegistry = {
    REGISTRY_BUILD: REGISTRY_BUILD,
    ZONES: ZONES,
    zoneById: zoneById,
    kitZones: kitZones
  };
})(typeof window !== "undefined" ? window : this);
