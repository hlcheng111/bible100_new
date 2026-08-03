/**
 * Tab ③ 金標 · report-heart + 達標燈（urgent / spiritual / 可擴展）
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  /** @param {{situation:string,risk:string,step:string,demo?:boolean}} o */
  function renderReportHeart(o) {
    o = o || {};
    var demo = o.demo
      ? '<span class="acs-report-heart__demo">示範報告</span>'
      : "";
    return (
      '<div class="acs-report-heart" role="region" aria-label="報告摘要">' +
      demo +
      '<p class="acs-report-heart__line"><span class="acs-report-heart__k">現況</span>' +
      esc(o.situation || "—") +
      "</p>" +
      '<p class="acs-report-heart__line"><span class="acs-report-heart__k">最大風險</span>' +
      esc(o.risk || "—") +
      "</p>" +
      '<p class="acs-report-heart__line acs-report-heart__line--step"><span class="acs-report-heart__k">本週一小步</span>' +
      esc(o.step || "—") +
      "</p></div>"
    );
  }

  /** ALDA 專用 · 牧者語標籤 */
  function renderAldaReportHeart(o) {
    o = o || {};
    var demo = o.demo
      ? '<span class="acs-report-heart__demo acs-demo-banner--inline">示範報告（假資料）</span>'
      : "";
    return (
      '<div class="acs-report-heart acs-report-heart--alda" role="region" aria-label="帶領力摘要">' +
      demo +
      '<p class="acs-report-heart__line"><span class="acs-report-heart__k">現況</span>' +
      esc(o.situation || "—") +
      "</p>" +
      '<p class="acs-report-heart__line"><span class="acs-report-heart__k">牧養提醒</span>' +
      esc(o.risk || "—") +
      "</p>" +
      '<p class="acs-report-heart__line acs-report-heart__line--step"><span class="acs-report-heart__k">本週您可以這樣做</span>' +
      esc(o.step || "—") +
      "</p></div>"
    );
  }

  /** 媒合中心專用 · 牧者語標籤 */
  function renderMatchmakerReportHeart(o) {
    o = o || {};
    var demo = o.demo
      ? '<span class="acs-report-heart__demo acs-demo-banner--inline">示範備忘（假資料）</span>'
      : "";
    return (
      '<div class="acs-report-heart acs-report-heart--matchmaker" role="region" aria-label="配搭摘要">' +
      demo +
      '<p class="acs-report-heart__line"><span class="acs-report-heart__k">現況</span>' +
      esc(o.situation || "—") +
      "</p>" +
      '<p class="acs-report-heart__line"><span class="acs-report-heart__k">牧養提醒</span>' +
      esc(o.risk || "—") +
      "</p>" +
      '<p class="acs-report-heart__line acs-report-heart__line--step"><span class="acs-report-heart__k">本週您可以這樣做</span>' +
      esc(o.step || "—") +
      "</p></div>"
    );
  }

  /**
   * level: ok | mid | low | high | warn
   * label: 良好 / 尚可 / 不足 / 偏高
   */
  function renderStatusBadge(level, label) {
    var cls = "acs-status-badge acs-status-badge--" + (level || "mid");
    return (
      '<span class="' +
      cls +
      '" title="達標參考">' +
      esc(label || "—") +
      "</span>"
    );
  }

  function buildUrgentReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請先完成 Tab ② 快評或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var flags = run.risk_flags || [];
    var interp = run.interpretation || {};
    var q2 = interp.q2 || {};
    var q1 = interp.q1 || {};
    var situation =
      "精力分布：Q1 救火 " +
      d.q1_pct +
      "% · Q2 深度 " +
      d.q2_pct +
      "% · Q3 打發 " +
      d.q3_pct +
      "% · Q4 逃避 " +
      d.q4_pct +
      "%。";
    var risk =
      flags.indexOf("Q2_BELOW_TARGET") >= 0 && flags.indexOf("OVERLOAD_Q1") >= 0
        ? "Q1 高且 Q2 低：過勞與深度事工被挤掉。"
        : flags.indexOf("Q2_BELOW_TARGET") >= 0
          ? q2.harm || "Q2 重要不緊急時段偏低。"
          : flags.indexOf("OVERLOAD_Q1") >= 0
            ? q1.harm || "Q1 救火比例偏高。"
            : (run.coaching && run.coaching.redflag) || "目前無重大象限失衡，仍建議每季重測。";
    var step =
      (q2.action && flags.indexOf("Q2_BELOW_TARGET") >= 0 ? q2.action : null) ||
      (run.coaching && run.coaching.growth) ||
      "每週先鎖一個 90 分鐘 Q2 時段（靈修、門訓或家庭），寫進日曆。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildSpiritualReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請先完成 Tab ② 或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var flags = run.risk_flags || [];
    var coaching = run.coaching || {};
    var labels = global.SpiritualPack && SpiritualPack.DIM_LABELS ? SpiritualPack.DIM_LABELS : {};
    var dimScores = d.dim_scores || {};
    var weakest = null;
    var weakestScore = 99;
    Object.keys(dimScores).forEach(function (dim) {
      if (dimScores[dim] < weakestScore) {
        weakestScore = dimScores[dim];
        weakest = dim;
      }
    });
    var situation =
      weakest != null
        ? "您的「" +
          (labels[weakest] || weakest) +
          "」相對需要留意（" +
          weakestScore +
          "/5）；整體 " +
          (d.overall_score != null ? d.overall_score : "—") +
          "/5—這是自我覺察的起點，不是評判。"
        : "整體靈命 " +
          (d.overall_score != null ? d.overall_score : "—") +
          "/5（" +
          (d.overall_level || "—") +
          "）。";
    var risk =
      flags.indexOf("INNER_LIFE_LOW") >= 0
        ? coaching.redflag || "整體指數偏低，先恢復讀經禱告與穩定聚會。"
        : flags.indexOf("DIM_CRITICAL") >= 0
          ? "有範疇落在紅色門檻，建議與牧者或小組長面談。"
          : coaching.redflag || "若長期無助或安全受威脅，請尋求專業支援。";
    var step = coaching.micro_step || coaching.growth || "本週只選一個 10 分鐘的小步（讀經或禱告），寫進日曆。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildShapeReportHeart(run) {
    if (!run || !run.derived) {
      return {
        situation: "尚無資料",
        risk: "—",
        step: "請先完成 Tab ② 或點「🔍 先看示範報告」",
        demo: !!run && run.is_demo
      };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var contract = d.shape_engine_contract || run.shape_engine_contract || {};
    var topGift = d.top_gift || contract.top_gift || "—";
    var giftZh =
      global.ShapePack && ShapePack.giftLabelZh
        ? ShapePack.giftLabelZh(topGift)
        : topGift;
    var situation =
      "您對「" +
      (d.top_heart || "—") +
      "」最有心志；恩賜輪廓較活潑的是「" +
      giftZh +
      "」——這是探索起點，不是貼標籤或任免依據。";
    var risk =
      coaching.redflag ||
      "勿用單一恩賜分數綁架呼召；出路卡是可能性，須經牧者面談確認（HITL）。";
    var step =
      coaching.micro_step ||
      coaching.next_tools ||
      "本週與牧者約 15 分鐘，談一張出路卡是否適合試任。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildAldaReportHeart(run) {
    if (!run || !run.derived) {
      return {
        situation: "尚無資料",
        risk: "—",
        step: "請先完成 Tab ② 迫選或點示範報告",
        demo: !!run && run.is_demo
      };
    }
    var d = run.derived;
    var lp = d.lifecycle_position || {};
    var lc = d.lifecycle || {};
    var flags = run.risk_flags || [];
    var coaching = run.coaching || {};
    var plain = function (k) {
      if (global.AldaPack && AldaPack.LIFECYCLE_PLAIN) return AldaPack.LIFECYCLE_PLAIN[k] || k;
      return k;
    };
    var situation =
      (lp.profile_label || "生命週期輪廓") +
      " · 帶領節奏參考：" +
      (d.primary || "—") +
      "／" +
      (d.secondary || "—") +
      " 型 · " +
      plain("A") +
      " " +
      (lc.A != null ? lc.A : "?") +
      " · " +
      plain("L") +
      " " +
      (lc.L != null ? lc.L : "?") +
      " · " +
      plain("D") +
      " " +
      (lc.D != null ? lc.D : "?") +
      " · " +
      plain("Ag") +
      " " +
      (lc.Ag != null ? lc.Ag : "?");
    var risk =
      flags.indexOf("LOW_SINCERITY") >= 0 || flags.indexOf("LOW_CONSISTENCY") >= 0
        ? (global.AldaPack && AldaPack.FLAG_SCENE_COPY
            ? [flags.indexOf("LOW_SINCERITY") >= 0 ? AldaPack.FLAG_SCENE_COPY.LOW_SINCERITY : "", flags.indexOf("LOW_CONSISTENCY") >= 0 ? AldaPack.FLAG_SCENE_COPY.LOW_CONSISTENCY : ""].filter(Boolean).join(" ")
            : "填答參考度偏低—宜私下面談後再解讀，不作任免或考核。")
        : flags.indexOf("CLUSTER_GAP") >= 0
          ? (global.AldaPack && AldaPack.FLAG_SCENE_COPY ? AldaPack.FLAG_SCENE_COPY.CLUSTER_GAP : d.lifecycle_note || "先陪跑最弱維度，不作淘汰。")
          : coaching.growth_accompaniment ||
            coaching.leadership_note ||
            coaching.redflag ||
            "帶領力是流動的；本報告修飾節奏，不是考核。";
    var step =
      coaching.micro_step ||
      coaching.growth ||
      "本週與牧者約 15 分鐘，談一個生命週期小突破。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildCompetencyReportHeart(run) {
    if (!run || !run.derived) {
      return {
        situation: "尚無資料",
        risk: "—",
        step: "請先完成 Tab ② 或點示範報告",
        demo: !!run && run.is_demo
      };
    }
    var d = run.derived;
    var mp = d.matrix_position || {};
    var coaching = run.coaching || {};
    var situation =
      coaching.growth_accompaniment ||
      mp.growth_label ||
      "您的服事輪廓是自我覺察起點，不是評等或任免依據。";
    var risk =
      coaching.redflag ||
      "熱情高、技能仍在長成時，牧者應安排 shadow，不作單次淘汰。";
    var step =
      coaching.micro_step ||
      (d.training_hint ? "本季聚焦：" + d.training_hint : "") ||
      "本週與牧者約 15 分鐘，談一項可 shadow 的成長小步。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildRaciReportHeart(payload) {
    payload = payload || {};
    return {
      situation: payload.situation || "尚無結果",
      risk: payload.risk || "—",
      step: payload.step || "本週試一件事：把某一事工的 A 名字寫在白板（只寫一個）。",
      demo: !!payload.demo
    };
  }

  function buildDiscReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請先完成 Tab ② 或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var stressNote =
      d.stress_primary && d.stress_primary !== d.primary
        ? " · 壓力修飾「" + (d.stress_primary_label || d.stress_primary) + "」"
        : "";
    var situation =
      "主型「" +
      (d.primary_label || d.primary || "—") +
      "」／副型「" +
      (d.secondary || "—") +
      "」" +
      stressNote +
      " — DISC 修飾溝通節奏，不修飾事奉大類。";
    var risk =
      coaching.redflag ||
      d.stress_note ||
      "若壓力修飾與自評落差大，宜談事工張力是否迫使「扮演」非自然節奏。";
    var step =
      coaching.growth ||
      "對照下方四象限與雙柱圖，與牧者談一項節奏互補或減壓小步。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildSwotReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請點「先看示範報告」或完成 Tab ② 20 題", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var m = d.matrix_result || {};
    var coaching = run.coaching || {};
    var situation =
      (d.summary_line || "—") +
      " · 主軸 " +
      (d.focus_strategy || m.primary_strategy || "—") +
      "（P=" +
      (m.cross_scores && m.cross_scores[m.primary_strategy] != null ? m.cross_scores[m.primary_strategy] : "—") +
      "/100）";
    var risk =
      m.pastoral_override ||
      coaching.redflag ||
      (run.risk_flags && run.risk_flags.indexOf("SO_WO_ROUTE_CONFLICT") >= 0
        ? "SO 擴張與 WO 修補路線衝突—宜先數算代價再表決。"
        : "Delta_Variance 過大時，先修補靈性破口再談擴張。");
    var step =
      coaching.growth ||
      "點擊 TOWS 矩陣四格查看 SO/ST/WO/WT 策略卡，再到 Tab ④ 走雙軌平衡五步。";
    return { situation: situation, risk: risk, step: step, demo: !!(run.is_demo || run.is_preview) };
  }

  function build8020ReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請點示範報告或完成 Tab ② 工作坊", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var analysis = d.analysis || {};
    var situation =
      "Impact_Ratio " +
      (d.impact_ratio != null ? d.impact_ratio : "—") +
      " · 剪枝候選 " +
      (d.prune_count != null ? d.prune_count : 0) +
      " 項 · 前 20% 事工占人力 " +
      (analysis.effort_top20_pct != null ? analysis.effort_top20_pct : "—") +
      "%";
    var risk =
      coaching.redflag ||
      (d.impact_ratio != null && d.impact_ratio < 1.2
        ? "效益比偏低：團隊可能在瑣事上耗盡關鍵影響力。"
        : "剪枝須牧者主持禱告，本儀表不作自動裁決。");
    var step =
      coaching.growth ||
      "對照帕累托曲線與聚焦四格，到 Tab ④ 走「聖靈剪枝決策會」15:2 腳本。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildPastoralReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請先完成 Tab ② 或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var flags = run.risk_flags || [];
    var coaching = run.coaching || {};
    var labels = global.PastoralPack && PastoralPack.DIM_LABELS ? PastoralPack.DIM_LABELS : {};
    var scene = global.PastoralPack && PastoralPack.FLAG_SCENE_COPY ? PastoralPack.FLAG_SCENE_COPY : {};
    var dimScores = d.dim_scores || {};
    var weakest = null;
    var weakestScore = 99;
    Object.keys(dimScores).forEach(function (dim) {
      if (dimScores[dim] < weakestScore) {
        weakestScore = dimScores[dim];
        weakest = dim;
      }
    });
    var situation =
      weakest != null
        ? "「" +
          (labels[weakest] || weakest) +
          "」相對吃緊（" +
          weakestScore +
          "/5）；整體 " +
          (d.overall_score != null ? d.overall_score : "—") +
          "/5—這是煙霧探測，不是考核判決。"
        : "整體 " + (d.overall_score != null ? d.overall_score : "—") + "/5。";
    var risk =
      flags.indexOf("BURNOUT") >= 0
        ? scene.BURNOUT || coaching.collaboration || "負荷高、休息少—先談減負與安息。"
        : flags.length
          ? scene[flags[0]] || coaching.redflag || "有警訊值得與同行牧者面談。"
          : coaching.collaboration || "若長期無助或安全受威脅，請尋求專業支援。";
    var step = coaching.micro_step || coaching.growth || "本週排半天離線安息，並取消一項非緊急會議。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildMatchmakerReportHeart(run) {
    if (!run || !run.derived) {
      return {
        situation: "尚無資料",
        risk: "—",
        step: "請先在 Tab ② 帶入記錄並分析，或點示範報告",
        demo: !!run && run.is_demo
      };
    }
    var d = run.derived;
    var fit = d.fit || {};
    var coaching = run.coaching || {};
    var name = (run.profile && run.profile.name) || "同工";
    if (run.is_demo) name = "示範同工（教學用假資料）";
    var situation =
      "職位「" +
      (fit.role_label || d.role_label || "—") +
      "」· 私下參考合拍度 " +
      (fit.overall_pct != null ? fit.overall_pct : d.overall_pct || "—") +
      "% · " +
      name;
    var risk =
      coaching.growth_accompaniment ||
      (fit.role_note || "凹下去的地方 = 陪跑區，不是「他不行」。");
    var step =
      coaching.micro_step ||
      "本週找這位同工約 20 分鐘喝咖啡：談是否願意試跑 6–12 週，隨時可調整節奏。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildCultureReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成 Tab ② 24 題或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var flags = run.risk_flags || [];
    var coaching = run.coaching || {};
    var ts = d.dim_scores && d.dim_scores.team_trust;
    var situation =
      "文化共鳴 " +
      (d.culture_resonance_score != null ? d.culture_resonance_score : "—") +
      "/100 · 四向度均分反映長執日常決策是否同心。";
    var risk =
      flags.indexOf("TRUST_BREACH") >= 0
        ? "團隊信任 <3.0：宜先 NCD「相親相愛的關係」，再推大型擴建。"
        : coaching.redflag || "低分是群體健康信號，不作人事篩選。";
    var step =
      coaching.collaboration ||
      "Tab ④ 文化重建長執會：只選一項 6–8 週可檢核的小改變。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildSmartReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成 Tab ② 15 題或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var flags = run.risk_flags || [];
    var situation =
      "對齊 " +
      (d.alignment_score != null ? d.alignment_score : "—") +
      " · 負載 " +
      (d.load_cost_score != null ? d.load_cost_score : "—") +
      " · 可行 " +
      (d.feasibility_score != null ? d.feasibility_score : "—") +
      "（SMART+Care 漏斗，非 KPI 考核）。";
    var risk =
      flags.indexOf("LOAD_HIGH") >= 0 || flags.indexOf("CARE_LOW") >= 0
        ? coaching.collaboration || "Care 向度亮紅：先縮小試行或加替補。"
        : coaching.redflag || "若長期無共識，請牧者 facilitation。";
    var step = coaching.growth || "鎖定 12 週試行，每兩週用 M 向度記號檢核一次。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildKpiReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成 Tab ② 12 題或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var flags = run.risk_flags || [];
    var situation =
      "聖工健康度 " +
      (d.pillar_health_score != null ? d.pillar_health_score : "—") +
      "/100 · 資源卡關率 " +
      (d.resource_stuck_rate != null ? d.resource_stuck_rate : 0) +
      "%。";
    var risk =
      flags.indexOf("RESOURCE_STUCK") >= 0
        ? coaching.redflag || "卡關多半是資源/後勤，不是同工不努力。"
        : flags.indexOf("PASTORAL_BLIND") >= 0
          ? "生命向度偏低：避免指標製造罪咎感。"
          : coaching.redflag || "數字為彼此扶持，不是淘汰。";
    var step =
      coaching.growth ||
      (flags.indexOf("RESOURCE_STUCK") >= 0
        ? "本週長執桌：啟動 80/20 資源聚焦儀，暫緩新增 KR。"
        : "建立季度「學習式檢視」— 先問神教會我們什麼。");
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildPdcaReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成 Tab ② 快評或 B 軌工作坊", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var flags = run.risk_flags || [];
    var situation =
      (d.summary_line || "PDCA 恩跡年表") +
      " · 永續 " +
      (d.sustain_index != null ? d.sustain_index : "—") +
      "/100。";
    var risk =
      flags.indexOf("DEMING_ALERT") >= 0
        ? coaching.redflag || "戴明警示：先 Check 負載再 Act 擴張。"
        : coaching.redflag || "PDCA 不能取代關係與禱告。";
    var step = coaching.growth || "下一個雙月會：只追蹤一項 Small Win 是否 realistic。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildNcdReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成 Tab ② 24 題或十步精靈", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var min = d.minimum_factor || {};
    var situation =
      (d.healthLabel || "—") +
      " · 均分 " +
      (d.overallNormalized != null ? d.overallNormalized : "—") +
      "/5 · 最小因子「" +
      (min.label || "—") +
      "」" +
      (min.score != null ? " " + min.score + " 分" : "") +
      "。";
    var risk = min.diagnosis || (run.coaching && run.coaching.governance_line) || "本季只推一個可檢核小改變，避免多線開挖。";
    var step =
      (run.strategy_cards && run.strategy_cards[0] && run.strategy_cards[0].plan) ||
      min.plan ||
      "Tab ④ 退修會草案 → 写进 SMART/PDCA。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildJohariReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成自評＋他評或點示範", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var situation =
      "Johari 四象限輪廓已更新；「未知區」擴大時宜私下面談，不作公開排名。";
    var risk = coaching.redflag || "他評僅供對話，須 HITL 解讀。";
    var step = coaching.growth || "與信任同工分享一項「盲点区」題目，10 分鐘即可。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  function buildMbtiReportHeart(run) {
    if (!run || !run.derived) {
      return { situation: "尚無資料", risk: "—", step: "請完成 Tab ② 或點示範報告", demo: !!run && run.is_demo };
    }
    var d = run.derived;
    var coaching = run.coaching || {};
    var situation =
      "簡化 MBTI 參考：" +
      (d.mbti_code || "—") +
      " · 軸向 % 僅輔助溝通，不作神學定論或任免。";
    var risk = coaching.redflag || "勿用類型標籤綁架事奉呼召。";
    var step = coaching.growth || "與牧者談一項「互补同工」合作小步。";
    return { situation: situation, risk: risk, step: step, demo: !!run.is_demo };
  }

  var HEART_BUILDERS = {
    urgent: buildUrgentReportHeart,
    spiritual: buildSpiritualReportHeart,
    pastoral: buildPastoralReportHeart,
    shape: buildShapeReportHeart,
    alda: buildAldaReportHeart,
    competency: buildCompetencyReportHeart,
    disc: buildDiscReportHeart,
    swot: buildSwotReportHeart,
    ministry8020: build8020ReportHeart,
    matchmaker: buildMatchmakerReportHeart,
    culture: buildCultureReportHeart,
    smart: buildSmartReportHeart,
    kpiokr: buildKpiReportHeart,
    kpi: buildKpiReportHeart,
    pdca: buildPdcaReportHeart,
    ncd: buildNcdReportHeart,
    johari: buildJohariReportHeart,
    mbti: buildMbtiReportHeart
  };

  /** 在 summary 元素後掛載 report-heart（不修改 HTML 檔） */
  function mountAfterSummary(summaryEl, run, toolId) {
    if (!summaryEl || !run || !toolId) return;
    var builder = HEART_BUILDERS[toolId];
    if (!builder) return;
    var mountId = "acs-report-heart-" + toolId;
    var host = document.getElementById(mountId);
    if (!host) {
      host = document.createElement("div");
      host.id = mountId;
      host.className = "acs-card acs-report-heart-wrap mt-2";
      if (summaryEl.nextSibling) summaryEl.parentNode.insertBefore(host, summaryEl.nextSibling);
      else summaryEl.parentNode.appendChild(host);
    }
    var heart = builder(run);
    host.innerHTML = renderReportHeart(heart);
  }

  global.AcsReportGold = {
    esc: esc,
    renderReportHeart: renderReportHeart,
    renderAldaReportHeart: renderAldaReportHeart,
    renderMatchmakerReportHeart: renderMatchmakerReportHeart,
    renderStatusBadge: renderStatusBadge,
    buildUrgentReportHeart: buildUrgentReportHeart,
    buildSpiritualReportHeart: buildSpiritualReportHeart,
    buildPastoralReportHeart: buildPastoralReportHeart,
    buildShapeReportHeart: buildShapeReportHeart,
    buildAldaReportHeart: buildAldaReportHeart,
    buildCompetencyReportHeart: buildCompetencyReportHeart,
    buildRaciReportHeart: buildRaciReportHeart,
    buildDiscReportHeart: buildDiscReportHeart,
    buildSwotReportHeart: buildSwotReportHeart,
    build8020ReportHeart: build8020ReportHeart,
    buildMatchmakerReportHeart: buildMatchmakerReportHeart,
    buildCultureReportHeart: buildCultureReportHeart,
    buildSmartReportHeart: buildSmartReportHeart,
    buildKpiReportHeart: buildKpiReportHeart,
    buildPdcaReportHeart: buildPdcaReportHeart,
    buildNcdReportHeart: buildNcdReportHeart,
    buildJohariReportHeart: buildJohariReportHeart,
    buildMbtiReportHeart: buildMbtiReportHeart,
    mountAfterSummary: mountAfterSummary,
    HEART_BUILDERS: HEART_BUILDERS
  };
})(typeof window !== "undefined" ? window : global);
