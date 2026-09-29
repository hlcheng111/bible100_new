/**
 * MinistryPathBridge · SHAPE 主軸 + 協作風格修飾 → 事奉出路卡（path_cards）
 * 禁止空狀態「無合適職位」；至少產出 employ / explore / seed 層級建議。
 * HITL：僅供輔導員／牧者分辨，不自動寫入 ministry_assignment。
 */
(function (global) {
  "use strict";

  var PATH_TIER_COPY = {
    disclaimer:
      "本配對旨在腦力激盪「誰適合哪類服事」。無論教會目前有沒有成立該部門，您的特質都是神國度的重要資產。" +
      "部署（Deploy）必經牧者關懷與本人尋求，系統不會自動 CRM 派工。",
    employ:
      "🎯 現有編制／空缺：與本會事工目錄或示範崗位高度契合，可自薦或由輔導員約談推薦。",
    explore:
      "🔍 試任探索：尚無正式編制或需陪跑，建議 6–12 週 shadow／協助再評估。",
    seed:
      "🚀 拓荒種子：教會尚未成立此方向，但您的輪廓適合預備；已列為戰略人才儲備（去識別化彙整）。",
    affirmation:
      "天生我才必有用——差別在於現在是「就位、試任、還是預備拓荒」，是時間與機會問題，不是有無價值問題。"
  };

  var MINISTRY_TYPES = [
    {
      id: "care",
      label: "關懷探訪",
      emoji: "💗",
      gifts: { shepherding: 0.45, encouragement: 0.35, serving: 0.2 },
      hearts: ["長者", "病弱", "家庭"],
      steady: true
    },
    {
      id: "teaching",
      label: "教學門訓",
      emoji: "📖",
      gifts: { teaching: 0.5, shepherding: 0.3, discernment: 0.2 },
      hearts: ["兒少", "門訓", "基礎真理"],
      steady: false
    },
    {
      id: "worship",
      label: "敬拜事奉",
      emoji: "🎵",
      gifts: { worship: 0.55, encouragement: 0.25, serving: 0.2 },
      hearts: ["敬拜", "崇拜"],
      steady: true
    },
    {
      id: "hospitality",
      label: "接待歡迎",
      emoji: "🤝",
      gifts: { hospitality: 0.45, evangelism: 0.3, serving: 0.25 },
      hearts: ["新人", "外展", "首次來訪"],
      steady: true
    },
    {
      id: "admin",
      label: "行政支援",
      emoji: "📋",
      gifts: { administration: 0.5, serving: 0.35, discernment: 0.15 },
      hearts: ["行政", "流程"],
      steady: true
    },
    {
      id: "outreach",
      label: "外展開拓",
      emoji: "🌍",
      gifts: { evangelism: 0.45, teaching: 0.2, hospitality: 0.2, encouragement: 0.15 },
      hearts: ["外展", "職場", "社區"],
      steady: false
    },
    {
      id: "media",
      label: "媒體／創新",
      emoji: "📱",
      gifts: { serving: 0.3, administration: 0.25, teaching: 0.25, discernment: 0.2 },
      hearts: ["媒體", "數位", "創新"],
      steady: false
    }
  ];

  function loadRun(store, toolId) {
    if (!store || typeof store.loadLatest !== "function") return null;
    var run = store.loadLatest(toolId);
    if (!run || run.is_demo) return null;
    return run;
  }

  function giftScoresFromShapeRun(shapeRun) {
    var d = (shapeRun && shapeRun.derived) || {};
    if (d.gift_scores && typeof d.gift_scores === "object") {
      return d.gift_scores;
    }
    if (shapeRun && shapeRun.feature_vector && global.matchPersonToRoles) {
      var fv = shapeRun.feature_vector;
      function to15(v) {
        return Math.max(1, Math.min(5, 1 + (Number(v) || 0) / 25));
      }
      return {
        teaching: to15(fv.C),
        shepherding: to15(fv.P),
        worship: to15(fv.S),
        administration: to15(fv.G),
        evangelism: to15((fv.G + fv.F) / 2),
        encouragement: to15(fv.R),
        serving: to15((fv.C + fv.R) / 2),
        hospitality: to15(fv.R),
        discernment: to15(fv.F)
      };
    }
    return {
      teaching: 3,
      shepherding: 3,
      serving: 3,
      encouragement: 3,
      hospitality: 3
    };
  }

  function styleProfileFromRuns(johariRun, discRun, mbtiRun, aldaRun) {
    var style = {
      drive: "balanced",
      collaboration: "open",
      pace: "steady",
      labels: [],
      leadership: null
    };
    var j = johariRun && johariRun.derived;
    if (j && j.dominant) {
      style.labels.push("Johari·" + j.dominant);
      if (j.dominant === "hidden" || j.hidden_pct >= 28) {
        style.collaboration = "backstage";
        style.pace = "steady";
      } else if (j.dominant === "blind" || j.blind_pct >= 28) {
        style.collaboration = "feedback";
      } else if (j.dominant === "unknown" || j.unknown_pct >= 25) {
        style.drive = "pioneer";
      } else if (j.dominant === "open") {
        style.collaboration = "open";
      }
    }
    var disc = discRun && discRun.derived;
    if (disc && disc.primary) {
      style.labels.push("DISC·" + disc.primary);
      if (disc.primary === "D") style.drive = "pioneer";
      if (disc.primary === "I") style.collaboration = "open";
      if (disc.primary === "S") style.pace = "steady";
      if (disc.primary === "C") style.pace = "precise";
    }
    var mbti = mbtiRun && mbtiRun.derived;
    if (mbti && mbti.code) {
      style.labels.push("MBTI·" + mbti.code);
      if (/NT/i.test(mbti.code)) style.drive = style.drive === "steady" ? "strategic" : style.drive;
      if (/SF/i.test(mbti.code)) style.pace = "steady";
    }
    var alda = aldaRun && aldaRun.derived;
    if (alda && alda.primary) {
      style.labels.push("ALDA·" + alda.primary);
      style.leadership = alda.primary;
      var vecs = alda.vectors || {};
      if (Number(vecs.F) >= Number(vecs.C) && Number(vecs.F) >= Number(vecs.O)) {
        style.drive = style.drive === "balanced" ? "executor" : style.drive;
      }
      if (Number(vecs.C) >= 14) style.drive = "decision";
      if (alda.primary === "約翰" || alda.primary === "小雅各") style.collaboration = "relational";
      if (alda.primary === "多馬" || alda.primary === "馬太") style.pace = "precise";
      if (alda.primary === "彼得" || alda.primary === "雅各" || alda.primary === "西門") {
        style.drive = "pioneer";
      }
    }
    return style;
  }

  var ALDA_LEADERSHIP_SUFFIX = {
    彼得: "決策推進",
    雅各: "變革推進",
    約翰: "關係凝聚",
    安得烈: "資源鏈結",
    腓力: "精細運營",
    巴多羅買: "制度守護",
    多馬: "風控稽核",
    馬太: "數據系統",
    小雅各: "默默支持",
    達太: "務實落地",
    西門: "異象先鋒",
    猶大: "財務把關"
  };

  function aldaLeadershipNote(aldaRun) {
    if (!aldaRun || !aldaRun.derived) return "";
    var d = aldaRun.derived;
    var parts = [];
    parts.push(
      "ALDA 帶領輪廓：主使徒「" +
        (d.primary || "—") +
        "」／副使徒「" +
        (d.secondary || "—") +
        "」— 修飾 P 軸帶領節奏，須與 SHAPE 主軸一併分辨。"
    );
    var flags = aldaRun.risk_flags || [];
    if (flags.indexOf("LOW_SINCERITY") >= 0) {
      parts.push(aldaFlagNote("LOW_SINCERITY"));
    }
    if (flags.indexOf("LOW_CONSISTENCY") >= 0) {
      parts.push("邏輯一致度偏低 — 建議隔週重填或與導師面談後再談主責帶領。");
    }
    if (flags.indexOf("CLUSTER_GAP") >= 0) {
      parts.push("四大領導叢集有明顯弱勢 — 宜找互補同工組隊，不宜單打獨鬥帶領。");
    }
    return parts.join(" ");
  }

  function aldaFlagNote(flag) {
    if (global.AldaPack && AldaPack.FLAG_DESCRIPTIONS && AldaPack.FLAG_DESCRIPTIONS[flag]) {
      return AldaPack.FLAG_DESCRIPTIONS[flag];
    }
    return flag;
  }

  function scoreMinistryType(type, giftScores, heartTag) {
    var gw = type.gifts || {};
    var raw = 0;
    var max = 0;
    Object.keys(gw).forEach(function (g) {
      var w = gw[g];
      var s = Number(giftScores[g]) || 0;
      raw += w * s;
      max += w * 5;
    });
    var base = max > 0 ? (raw / max) * 100 : 50;
    if (heartTag && type.hearts && type.hearts.indexOf(heartTag) >= 0) {
      base = Math.min(100, base + 12);
    }
    return Math.round(base);
  }

  function pickPrimaryMinistry(giftScores, heartTag) {
    var ranked = MINISTRY_TYPES.map(function (t) {
      return { type: t, score: scoreMinistryType(t, giftScores, heartTag) };
    }).sort(function (a, b) {
      return b.score - a.score;
    });
    return ranked[0] || { type: MINISTRY_TYPES[0], score: 50 };
  }

  function roleLabelFor(type, style) {
    var base = type.label;
    var leadSuffix =
      style.leadership && ALDA_LEADERSHIP_SUFFIX[style.leadership]
        ? "·" + ALDA_LEADERSHIP_SUFFIX[style.leadership] + "型帶領"
        : "";
    if (style.drive === "pioneer" && (type.id === "outreach" || type.id === "media")) {
      return type.emoji + " " + base + "·開拓先鋒" + leadSuffix;
    }
    if (style.pace === "steady" && type.steady) {
      return type.emoji + " " + base + "·深度陪伴同工" + leadSuffix;
    }
    if (style.collaboration === "backstage") {
      return type.emoji + " " + base + "·幕後支援／一對一" + leadSuffix;
    }
    if (style.collaboration === "feedback") {
      return type.emoji + " " + base + "·導師陪跑後再帶領" + leadSuffix;
    }
    if (leadSuffix) {
      return type.emoji + " " + base + "同工" + leadSuffix;
    }
    return type.emoji + " " + base + "同工";
  }

  function johariBlindNote(johariRun) {
    if (!johariRun || !johariRun.derived) return "";
    var d = johariRun.derived;
    if (d.blended && d.blended.suggested_dominant === "blind") {
      return (
        "Johari 360：" +
        (d.blended.note || "他評比自評更看見 Blind 盲點區") +
        " — 宜先 360 回饋與導師陪跑，再談主責帶領。"
      );
    }
    if (d.blind_pct >= 28) {
      return "Johari 自評 Blind 偏高 — 宜安排同儕回饋再確認崗位節奏。";
    }
    if (
      d.peer_overlay &&
      d.peer_overlay.blind_pct >= 28 &&
      d.peer_overlay.blind_pct > d.blind_pct + 5
    ) {
      return (
        "Johari 他評（" +
        d.peer_overlay.peer_count +
        " 份）Blind 高於自評 — 宜面談時溫柔指出他人看見的恩賜。"
      );
    }
    return "";
  }

  var MINISTRY_COMPETENCY_DOMAINS = {
    care: ["care_practice", "team_collab"],
    teaching: ["teach_design", "lead_comm"],
    worship: ["crisis_resp", "team_collab"],
    hospitality: ["care_practice", "team_collab"],
    admin: ["admin_ops", "team_collab"],
    outreach: ["lead_comm", "crisis_resp"],
    media: ["teach_design", "admin_ops"]
  };

  var COMPETENCY_THRESHOLD = 3;

  function competencyDomainsForMinistry(ministryId) {
    return MINISTRY_COMPETENCY_DOMAINS[ministryId] || ["team_collab"];
  }

  function competencyGapForMinistry(competencyRun, ministryId) {
    if (!competencyRun || !competencyRun.derived) return null;
    var scores = competencyRun.derived.domain_scores || {};
    var domains = competencyDomainsForMinistry(ministryId);
    var threshold =
      competencyRun.derived.threshold != null ? competencyRun.derived.threshold : COMPETENCY_THRESHOLD;
    var weak = [];
    domains.forEach(function (d) {
      if ((Number(scores[d]) || 0) < threshold) weak.push(d);
    });
    if (!weak.length) return null;
    var labels = global.CompetencyPack && CompetencyPack.DOMAIN_LABELS ? CompetencyPack.DOMAIN_LABELS : {};
    return {
      domains: weak,
      labels: weak.map(function (d) {
        return labels[d] || d;
      })
    };
  }

  function shouldDowngradeEmployFromCompetency(competencyRun, ministryId) {
    return !!competencyGapForMinistry(competencyRun, ministryId);
  }

  function competencyGapNote(competencyRun, ministryId) {
    var gap = competencyGapForMinistry(competencyRun, ministryId);
    if (!gap) return "";
    return (
      "事奉能力：與「" +
      gap.labels.join("、") +
      "」相關熟練度尚低於門檻（" +
      COMPETENCY_THRESHOLD +
      "）— 具備恩賜熱情，建議 90 天導師陪跑後再談正式派任，不作單次淘汰。"
    );
  }

  function shouldDowngradeEmploy(johariRun, aldaRun, competencyRun, ministryId) {
    if (!johariRun || !johariRun.derived) {
      /* continue */
    } else {
      var d = johariRun.derived;
      if (d.blended && d.blended.suggested_dominant === "blind") return true;
      if (d.blind_pct >= 30) return true;
      if (d.peer_overlay && d.peer_overlay.blind_pct >= 30 && d.peer_overlay.blind_pct > d.blind_pct + 6) {
        return true;
      }
    }
    if (aldaRun && aldaRun.risk_flags) {
      var flags = aldaRun.risk_flags;
      if (flags.indexOf("LOW_SINCERITY") >= 0) return true;
      if (flags.indexOf("LOW_CONSISTENCY") >= 0) return true;
    }
    if (shouldDowngradeEmployFromCompetency(competencyRun, ministryId)) return true;
    return false;
  }

  function fitNote(type, style, tier, shapeRun, johariRun, aldaRun, competencyRun) {
    var heart = (shapeRun && shapeRun.derived && shapeRun.derived.top_heart) || "服事";
    var parts = [];
    parts.push("SHAPE 顯示您對「" + heart + "」類服事有負擔，恩賜輪廓偏向「" + type.label + "」。");
    if (style.labels.length) {
      parts.push("協作風格（" + style.labels.join("、") + "）修飾了崗位節奏與團隊情境。");
    }
    var jNote = johariBlindNote(johariRun);
    if (jNote) parts.push(jNote);
    var aNote = aldaLeadershipNote(aldaRun);
    if (aNote) parts.push(aNote);
    var cNote = competencyGapNote(competencyRun, type.id);
    if (cNote) parts.push(cNote);
    if (tier === "employ") {
      parts.push("與本會目錄或示範崗位契合度較高，可向輔導員自薦或約談。");
    } else if (tier === "explore") {
      parts.push("建議先以 6–12 週試任或 shadow 確認恩賜與節奏，再談正式編制。");
    } else {
      parts.push("本會目錄中暫無完全對位編制；此卡作拓荒種子，供長執未來擴展時參考。");
    }
    return parts.join(" ");
  }

  function matchCatalogRoles(giftScores, catalog) {
    if (!global.matchPersonToRoles || !catalog || !catalog.length) return [];
    return global.matchPersonToRoles({ scores: giftScores }, catalog);
  }

  function loadMinistryCatalog() {
    if (global.SmartMinistryCanonical && typeof global.SmartMinistryCanonical.listMinistriesCatalog === "function") {
      var list = global.SmartMinistryCanonical.listMinistriesCatalog().slice(0, 16);
      return list
        .map(function (m) {
          var mid = m.ministry_id || m.id || "min";
          return {
            roleId: "sm_" + mid,
            name: m.name || m.title || m.ministry_name || "事工崗位",
            weights: {
              gifts: {
                teaching: 0.2,
                shepherding: 0.25,
                serving: 0.25,
                administration: 0.15,
                encouragement: 0.15
              }
            }
          };
        })
        .filter(Boolean);
    }
    if (global.DEMO_ROLE_DEFINITIONS) return global.DEMO_ROLE_DEFINITIONS;
    return [];
  }

  function buildPathCards(options) {
    options = options || {};
    var store = options.store || global.AssessmentRunStore;
    var shapeRun = options.shapeRun || loadRun(store, "shape");
    var johariRun =
      options.johariRun ||
      (options.sourceTool === "johari" ? options.sourceRun : loadRun(store, "johari"));
    var discRun = options.discRun || loadRun(store, "disc");
    var mbtiRun = options.mbtiRun || loadRun(store, "mbti");
    var aldaRun =
      options.aldaRun ||
      (options.sourceTool === "alda" ? options.sourceRun : loadRun(store, "alda"));
    var competencyRun =
      options.competencyRun ||
      (options.sourceTool === "competency" ? options.sourceRun : loadRun(store, "competency"));

    if (options.sourceTool === "shape" && options.sourceRun) {
      shapeRun = options.sourceRun;
    }

    var giftScores = giftScoresFromShapeRun(shapeRun);
    var heartTag =
      (shapeRun && shapeRun.derived && shapeRun.derived.top_heart) ||
      options.heartTag ||
      null;
    var style = styleProfileFromRuns(johariRun, discRun, mbtiRun, aldaRun);
    var primary = pickPrimaryMinistry(giftScores, heartTag);
    var catalog = loadMinistryCatalog();
    var matched = matchCatalogRoles(giftScores, catalog);
    var topMatch = matched[0];
    var cards = [];

    function pushCard(tier, type, score, roleLabel, extra) {
      var adjTier =
        tier === "employ" && shouldDowngradeEmploy(johariRun, aldaRun, competencyRun, type.id)
          ? "explore"
          : tier;
      cards.push({
        tier: adjTier,
        ministry_type: type.label,
        ministry_id: type.id,
        role_label: roleLabel || roleLabelFor(type, style),
        fit_score: score,
        fit_note: fitNote(type, style, adjTier, shapeRun, johariRun, aldaRun, competencyRun),
        affirmation: PATH_TIER_COPY.affirmation,
        next_step:
          adjTier === "employ"
            ? "與輔導員／部門負責人約談，或前往事奉媒合中心正式登記試任。"
            : adjTier === "explore"
              ? "與小組長或牧者談 6–12 週試任計畫，每季回顧。"
              : "與牧者分享此報告，列入教會未來事工擴展的禱告與規劃。",
        links: [
          { label: "事奉媒合中心", path: "church_ministry/guide_crm_journey_hub.html?tab=matchmaker", kind: "root" },
          { label: "SHAPE 恩賜量表", path: "shape-gifts-assessment.html", kind: "content" },
          { label: "RACI 權責反思", path: "planning/raci-reflection.html", kind: "content" }
        ],
        extra: extra || null
      });
    }

    if (topMatch && topMatch.score >= 70) {
      pushCard(
        "employ",
        primary.type,
        topMatch.score,
        "🎯 " + topMatch.name,
        { catalogRoleId: topMatch.roleId }
      );
    } else if (topMatch && topMatch.score >= 55) {
      pushCard("explore", primary.type, topMatch.score, roleLabelFor(primary.type, style), {
        catalogRoleId: topMatch.roleId
      });
    } else {
      pushCard("seed", primary.type, primary.score, roleLabelFor(primary.type, style), null);
    }

    var secondary = MINISTRY_TYPES.filter(function (t) {
      return t.id !== primary.type.id;
    })
      .map(function (t) {
        return { type: t, score: scoreMinistryType(t, giftScores, heartTag) };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })[0];

    if (secondary) {
      var secTier =
        style.drive === "pioneer" && !secondary.type.steady ? "seed" : "explore";
      pushCard(secTier, secondary.type, secondary.score, roleLabelFor(secondary.type, style), null);
    }

    if (cards.length < 2) {
      pushCard("explore", primary.type, primary.score, roleLabelFor(primary.type, style), null);
    }

    attachOpenRolesToCards(cards);

    return {
      path_cards: cards.slice(0, 3),
      shape_anchor: !!shapeRun,
      style_labels: style.labels,
      disclaimer: PATH_TIER_COPY.disclaimer,
      gift_scores: giftScores
    };
  }

  function attachPathCards(run, options) {
    if (!run) return run;
    options = Object.assign({ sourceRun: run, sourceTool: run.tool_id }, options || {});
    var built = buildPathCards(options);
    run.path_cards = built.path_cards;
    run.path_meta = {
      shape_anchor: built.shape_anchor,
      style_labels: built.style_labels,
      disclaimer: built.disclaimer
    };
    return run;
  }

  function attachOpenRolesToCards(cards) {
    if (!global.MatchmakerUrgentJobs || typeof MatchmakerUrgentJobs.matchOpenRoleForCard !== "function") {
      return cards;
    }
    cards.forEach(function (c) {
      var open = MatchmakerUrgentJobs.matchOpenRoleForCard(c);
      if (open) c.open_role = open;
    });
    return cards;
  }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function pastoralSanitizeText(s) {
    return String(s || "")
      .replace(/\bSHAPE\b/g, "恩賜問卷")
      .replace(/\bJohari\b/g, "肢體回饋")
      .replace(/\bALDA\b/g, "帶領風格")
      .replace(/\bpath_cards\b/g, "成長地圖")
      .replace(/\bHITL\b/g, "您親自確認")
      .replace(/\bCRM\b/g, "")
      .replace(/P 軸/g, "帶領節奏")
      .replace(/\bshadow\b/gi, "陪同見習")
      .replace(/事奉媒合中心/g, "服事登記頁")
      .replace(/輔導員/g, "牧者");
  }

  function renderOpenRoleBlock(c, cardIndex) {
    if (!c || !c.open_role) return "";
    var o = c.open_role;
    return (
      '<div class="mpb-open-role">' +
      '<p class="mpb-open-role__lead">💡 <strong>本會急缺</strong>：「' +
      escHtml(o.dept_title) +
      "」目前正急需 <strong>" +
      o.gap +
      "</strong> 名【" +
      escHtml(o.name_zh) +
      "】！您的恩賜輪廓與此方向高度相關，仍須牧者面談後再登記試任。</p>" +
      '<button type="button" class="acs-btn acs-btn--primary mpb-open-role__btn" data-acs-open-role-launch="1" ' +
      'data-dept="' +
      escHtml(o.dept_key) +
      '" data-job="' +
      escHtml(o.name_zh) +
      '" data-card-index="' +
      cardIndex +
      '">📋 第三步：雙方同意後，前往服事登記</button>' +
      '<p class="acs-step-hint mpb-hitl-hint">請先完成約談、達成共識，再按此鈕。全程本機私密，不會自動派工。</p></div>'
    );
  }

  function renderPathCardsHtml(cards, options) {
    options = options || {};
    if (!cards || !cards.length) {
      return (
        '<p class="text-sm text-slate-600">' +
        (options.pastoralMode
          ? "請先完成恩賜問卷，再與牧者一同看見事奉方向。"
          : PATH_TIER_COPY.affirmation + " 請先完成 SHAPE 恩賜量表，再與輔導員一同看見事奉方向。") +
        "</p>"
      );
    }
    var pastoral = !!options.pastoralMode;
    var tierTitle = options.plainLanguage || pastoral
      ? {
          employ: "🎯 可能適合現有崗位（仍須您面談確認）",
          explore: "🔍 建議先 6–12 週試任陪跑",
          seed: "🚀 拓荒預備（教會尚未有對位編制）"
        }
      : { employ: PATH_TIER_COPY.employ, explore: PATH_TIER_COPY.explore, seed: PATH_TIER_COPY.seed };
    return cards
      .map(function (c, i) {
        var fitNote = pastoral ? pastoralSanitizeText(c.fit_note) : c.fit_note || "";
        var nextStep = pastoral ? pastoralSanitizeText(c.next_step) : c.next_step || "";
        var scoreHtml = pastoral
          ? c.fit_score != null
            ? '<span class="text-xs text-amber-800">（參考吻合度 ' + c.fit_score + "）</span>"
            : ""
          : ' <span class="text-xs font-mono text-slate-500">(' +
            (c.fit_score != null ? c.fit_score : "—") +
            ")</span>";
        return (
          '<div class="rounded-xl border border-orange-200 bg-orange-50/40 p-4 mb-3 mpb-path-card" data-card-index="' +
          i +
          '">' +
          '<p class="text-xs font-bold text-orange-900 mb-1">' +
          (tierTitle[c.tier] || c.tier) +
          "</p>" +
          "<p class=\"font-black text-slate-800\">" +
          (c.role_label || c.ministry_type) +
          scoreHtml +
          "</p>" +
          '<p class="text-xs text-slate-600 mt-2 leading-relaxed">' +
          fitNote +
          "</p>" +
          renderOpenRoleBlock(c, i) +
          '<p class="text-xs text-emerald-800 mt-2">' +
          (pastoral ? pastoralSanitizeText(c.affirmation || PATH_TIER_COPY.affirmation) : c.affirmation || PATH_TIER_COPY.affirmation) +
          "</p>" +
          '<p class="text-xs text-slate-500 mt-1"><strong>下一步：</strong>' +
          nextStep +
          "</p></div>"
        );
      })
      .join("");
  }

  function bindOpenRoleButtons(root, toolId, run) {
    if (!root) return;
    root.querySelectorAll("[data-acs-open-role-launch]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        var dept = btn.getAttribute("data-dept");
        var jobName = btn.getAttribute("data-job");
        var cardIndex = Number(btn.getAttribute("data-card-index"));
        var card =
          run && run.path_cards && run.path_cards[cardIndex] != null ? run.path_cards[cardIndex] : null;
        var extra = { dept: dept, open_role: (card && card.open_role) || { dept_key: dept, name_zh: jobName } };
        if (global.MatchmakerPrefill && typeof MatchmakerPrefill.launch === "function") {
          MatchmakerPrefill.launch("talent_seek_job", toolId, run, ev, extra);
        }
      });
    });
  }

  global.MinistryPathBridge = {
    PATH_TIER_COPY: PATH_TIER_COPY,
    MINISTRY_TYPES: MINISTRY_TYPES,
    buildPathCards: buildPathCards,
    attachPathCards: attachPathCards,
    attachOpenRolesToCards: attachOpenRolesToCards,
    renderPathCardsHtml: renderPathCardsHtml,
    bindOpenRoleButtons: bindOpenRoleButtons,
    giftScoresFromShapeRun: giftScoresFromShapeRun,
    styleProfileFromRuns: styleProfileFromRuns
  };
})(typeof window !== "undefined" ? window : global);
