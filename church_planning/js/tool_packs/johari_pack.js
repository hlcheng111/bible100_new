/**
 * Johari 盲點 · 工具包（johari）
 * 24 題自評 + 24 題他評 → Open/Blind/Hidden/Unknown + CTV R 軸 + path_cards（SHAPE 主軸）
 */
(function (global) {
  "use strict";

  var TOOL_ID = "johari";
  var TOOL_LABEL = "Johari 盲點工作桌";

  var QUADRANT_LABELS = {
    open: "Open 開放區",
    blind: "Blind 盲點區",
    hidden: "Hidden 隱藏區",
    unknown: "Unknown 未知區"
  };

  var QUADRANT_AFFIRMATION = {
    open:
      "Open 高不是驕傲，代表您與團隊互知、敢於透明——適合跨組協作與帶領回饋文化。天生我才必有用，時機到了就能公開服事。",
    blind:
      "Blind 高代表潛力大、他人看見的比您自己多——宜安排 360 回饋與導師陪跑，再談帶領。這是預備，不是否定。",
    hidden:
      "Hidden 高常因安全感不足而藏起真實需要——宜在小組／一對一先服事，恩賜可能在幕後。時間與信任會讓 Hidden 變 Open。",
    unknown:
      "Unknown 高代表尚未被試出來的恩賜——宜短期試任探索。沒有廢區，只有「還沒被看見」的肢體。"
  };

  var QUESTIONS = [
    { id: "j01", quadrant: "open", label: "我會主動邀請同工指出我看不見的盲點。", projection: { P: 0.1, S: 0.1, G: 0, C: 0.1, R: 0.6, F: 0.1 } },
    { id: "j02", quadrant: "open", label: "團隊成員大致知道我的強項與限制。", projection: { P: 0.1, S: 0.05, G: 0, C: 0.1, R: 0.65, F: 0.1 } },
    { id: "j03", quadrant: "open", label: "我願意在適當場合分享真實的需要與軟弱。", projection: { P: 0.15, S: 0.15, G: 0, C: 0, R: 0.55, F: 0.15 } },
    { id: "j04", quadrant: "blind", label: "長執會或同工會後，別人常說我「沒意識到」某些習慣或影響。", projection: { P: 0.2, S: 0.1, G: 0, C: 0.05, R: 0.55, F: 0.1 } },
    { id: "j05", quadrant: "blind", label: "服事後收到回饋時，我有時感到意外：「原來我給人這種印象」。", projection: { P: 0.15, S: 0.05, G: 0, C: 0.1, R: 0.6, F: 0.1 } },
    { id: "j06", quadrant: "blind", label: "我較少主動詢問「我哪裡需要改進」。", projection: { P: 0.1, S: 0, G: 0, C: 0.15, R: 0.55, F: 0.2 } },
    { id: "j07", quadrant: "hidden", label: "服事後情緒流露時，我傾向隱藏負面感受，避免影響團隊。", projection: { P: 0.1, S: 0.05, G: 0, C: 0.15, R: 0.5, F: 0.2 } },
    { id: "j08", quadrant: "hidden", label: "我有能力或想法，但很少在長執會或公開場合提出。", projection: { P: 0.05, S: 0.1, G: 0.05, C: 0.2, R: 0.5, F: 0.1 } },
    { id: "j09", quadrant: "hidden", label: "我擔心若太真實，會被誤解或失去事奉上的尊重。", projection: { P: 0.15, S: 0.1, G: 0, C: 0.05, R: 0.55, F: 0.15 } },
    { id: "j10", quadrant: "unknown", label: "我還不確定自己在教會團隊中「最適合扮演什麼角色」。", projection: { P: 0.05, S: 0.1, G: 0.05, C: 0.15, R: 0.45, F: 0.2 } },
    { id: "j11", quadrant: "unknown", label: "有些服事方向我從未試過，不確定是否適合。", projection: { P: 0.05, S: 0.05, G: 0.1, C: 0.2, R: 0.4, F: 0.2 } },
    { id: "j12", quadrant: "unknown", label: "我期待牧者或導師給我短期試任，探索恩賜。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.4, F: 0.2 } },
    { id: "j13", quadrant: "open", label: "同事／同工知道我在哪些事上需要支援。", projection: { P: 0.1, S: 0.1, G: 0, C: 0.05, R: 0.65, F: 0.1 } },
    { id: "j14", quadrant: "open", label: "我能坦然討論自己的成長目標。", projection: { P: 0.1, S: 0.15, G: 0, C: 0.1, R: 0.6, F: 0.05 } },
    { id: "j15", quadrant: "blind", label: "別人看到的我的優點，有時超出我自己的認知。", projection: { P: 0.15, S: 0.1, G: 0, C: 0.1, R: 0.55, F: 0.1 } },
    { id: "j16", quadrant: "blind", label: "我較少主動請人描述「我給人的第一印象」。", projection: { P: 0.1, S: 0, G: 0, C: 0.1, R: 0.55, F: 0.25 } },
    { id: "j17", quadrant: "hidden", label: "我會把某些恩賜或想法先藏起來，等「時機成熟」。", projection: { P: 0.05, S: 0.1, G: 0.05, C: 0.15, R: 0.5, F: 0.15 } },
    { id: "j18", quadrant: "hidden", label: "在權威面前我較難表達真實不同意見。", projection: { P: 0.15, S: 0.05, G: 0, C: 0.1, R: 0.55, F: 0.15 } },
    { id: "j19", quadrant: "unknown", label: "我不確定若換一個事工環境，我會否更發揮。", projection: { P: 0.05, S: 0.05, G: 0.1, C: 0.2, R: 0.4, F: 0.2 } },
    { id: "j20", quadrant: "unknown", label: "有些恩賜我只在腦海想像過，尚未在教會試過。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.4, F: 0.2 } },
    { id: "j21", quadrant: "open", label: "團隊危機時，我願意讓人知道我的限制與需要。", projection: { P: 0.15, S: 0.15, G: 0, C: 0, R: 0.55, F: 0.15 } },
    { id: "j22", quadrant: "open", label: "我會主動分享學習心得，幫助他人了解我如何成長。", projection: { P: 0.05, S: 0.15, G: 0.05, C: 0.25, R: 0.45, F: 0.05 } },
    { id: "j23", quadrant: "blind", label: "別人對我的評價，偶爾與自我印象差距很大。", projection: { P: 0.15, S: 0.05, G: 0, C: 0.05, R: 0.6, F: 0.15 } },
    { id: "j24", quadrant: "hidden", label: "我擔心若展現全部真實，會影響事奉機會。", projection: { P: 0.1, S: 0.1, G: 0, C: 0.05, R: 0.5, F: 0.25 } }
  ];

  /** 他評 24 題 · 觀察者評估對象（與自評四象限對照） */
  var PEER_QUESTIONS = [
    { id: "p01", quadrant: "open", label: "我觀察到此人願意與團隊 openly 分享強項與限制。", projection: { P: 0.1, S: 0.05, G: 0, C: 0.05, R: 0.65, F: 0.15 } },
    { id: "p02", quadrant: "open", label: "團隊大致知道此人擅長什麼、不擅長什麼。", projection: { P: 0.05, S: 0.05, G: 0, C: 0.1, R: 0.7, F: 0.1 } },
    { id: "p03", quadrant: "open", label: "此人會在適當時候讓人看見真實需要。", projection: { P: 0.15, S: 0.1, G: 0, C: 0, R: 0.6, F: 0.15 } },
    { id: "p04", quadrant: "open", label: "此人與同工互動時透明度讓人感到可信任。", projection: { P: 0.1, S: 0.1, G: 0, C: 0.05, R: 0.65, F: 0.1 } },
    { id: "p05", quadrant: "open", label: "我覺得對此人的了解，與本人自認大致一致。", projection: { P: 0.05, S: 0.05, G: 0, C: 0.1, R: 0.65, F: 0.15 } },
    { id: "p06", quadrant: "open", label: "此人危機時願意讓團隊知道限制並尋求支援。", projection: { P: 0.15, S: 0.1, G: 0, C: 0, R: 0.6, F: 0.15 } },
    { id: "p07", quadrant: "blind", label: "此人有些優點，似乎本人尚未完全意识到。", projection: { P: 0.15, S: 0.1, G: 0, C: 0.1, R: 0.55, F: 0.1 } },
    { id: "p08", quadrant: "blind", label: "此人對團隊的正面影響，可能大於本人想象。", projection: { P: 0.1, S: 0.05, G: 0.05, C: 0.1, R: 0.6, F: 0.1 } },
    { id: "p09", quadrant: "blind", label: "回饋給此人時，偶爾會有「原来如此」的驚喜。", projection: { P: 0.1, S: 0.05, G: 0, C: 0.1, R: 0.6, F: 0.15 } },
    { id: "p10", quadrant: "blind", label: "此人較少主動詢問他人對自己的觀察。", projection: { P: 0.1, S: 0, G: 0, C: 0.15, R: 0.55, F: 0.2 } },
    { id: "p11", quadrant: "blind", label: "我看到的此人習慣，本人可能不自覺。", projection: { P: 0.2, S: 0.05, G: 0, C: 0.05, R: 0.55, F: 0.15 } },
    { id: "p12", quadrant: "blind", label: "此人給人的第一印象，與深交後可能不同。", projection: { P: 0.1, S: 0.05, G: 0, C: 0.1, R: 0.6, F: 0.15 } },
    { id: "p13", quadrant: "hidden", label: "我感覺此人有些能力尚未在公開場合發揮。", projection: { P: 0.05, S: 0.1, G: 0.05, C: 0.2, R: 0.5, F: 0.1 } },
    { id: "p14", quadrant: "hidden", label: "此人似乎隱藏部分真實需要或軟弱。", projection: { P: 0.15, S: 0.1, G: 0, C: 0.05, R: 0.5, F: 0.2 } },
    { id: "p15", quadrant: "hidden", label: "在權威或公開場合，此人較難表達全部想法。", projection: { P: 0.1, S: 0.05, G: 0, C: 0.1, R: 0.55, F: 0.2 } },
    { id: "p16", quadrant: "hidden", label: "我懷疑此人還有恩賜未讓團隊看見。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.45, F: 0.15 } },
    { id: "p17", quadrant: "hidden", label: "此人情緒或壓力，可能比表面看來更大。", projection: { P: 0.2, S: 0.1, G: 0, C: 0.05, R: 0.5, F: 0.15 } },
    { id: "p18", quadrant: "hidden", label: "若安全感足夠，此人可能會貢獻更多。", projection: { P: 0.1, S: 0.15, G: 0.05, C: 0.1, R: 0.5, F: 0.1 } },
    { id: "p19", quadrant: "unknown", label: "我不確定此人若換崗位，會否更發揮。", projection: { P: 0.05, S: 0.05, G: 0.1, C: 0.2, R: 0.4, F: 0.2 } },
    { id: "p20", quadrant: "unknown", label: "有些服事方向，此人似乎從未試過。", projection: { P: 0.05, S: 0.05, G: 0.1, C: 0.2, R: 0.4, F: 0.2 } },
    { id: "p21", quadrant: "unknown", label: "我期待給此人短期试任，看見更多潜能。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.4, F: 0.2 } },
    { id: "p22", quadrant: "unknown", label: "此人在团队中「最適合角色」仍待探索。", projection: { P: 0.05, S: 0.1, G: 0.05, C: 0.15, R: 0.45, F: 0.2 } },
    { id: "p23", quadrant: "unknown", label: "我看到的潜力，本人可能尚未确认。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.45, F: 0.15 } },
    { id: "p24", quadrant: "unknown", label: "若有人陪跑试任，此人可能有意外惊喜。", projection: { P: 0.05, S: 0.1, G: 0.1, C: 0.15, R: 0.4, F: 0.2 } }
  ];

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function validate(answers, questionSet) {
    questionSet = questionSet || QUESTIONS;
    var map = {};
    var errors = [];
    if (!answers || typeof answers !== "object") {
      return { ok: false, errors: ["缺少 answers"] };
    }
    questionSet.forEach(function (q) {
      var v = Number(answers[q.id]);
      if (!isFinite(v) || v < 1 || v > 5) {
        errors.push("題 " + q.id + " 須為 1–5");
      } else {
        map[q.id] = v;
      }
    });
    return errors.length ? { ok: false, errors: errors } : { ok: true, answers: map };
  }

  function computeQuadrantPercents(map) {
    var sums = { open: 0, blind: 0, hidden: 0, unknown: 0 };
    var counts = { open: 0, blind: 0, hidden: 0, unknown: 0 };
    QUESTIONS.forEach(function (q) {
      var v = map[q.id];
      if (!q.quadrant) return;
      sums[q.quadrant] += v;
      counts[q.quadrant] += 1;
    });
    var total = 0;
    Object.keys(sums).forEach(function (k) {
      total += sums[k];
    });
    if (!total) total = 1;
    var out = {};
    Object.keys(sums).forEach(function (k) {
      out[k + "_pct"] = Math.round((sums[k] / total) * 100);
    });
    var dom = "open";
    var domVal = -1;
    ["open", "blind", "hidden", "unknown"].forEach(function (k) {
      if (out[k + "_pct"] > domVal) {
        domVal = out[k + "_pct"];
        dom = k;
      }
    });
    out.dominant = dom;
    return out;
  }

  function computeFeatureVector(map, questionSet) {
    questionSet = questionSet || QUESTIONS;
    var RT = global.CTAOSRuntime;
    var items = [];
    questionSet.forEach(function (q) {
      var v = map[q.id];
      if (v >= 1 && v <= 5) items.push({ value: v, projection: q.projection });
    });
    if (RT && RT.scoreByProjection) return RT.scoreByProjection(items);
    return { P: 50, S: 50, G: 50, C: 50, R: 55, F: 50 };
  }

  function computeRiskFlags(derived) {
    var flags = [];
    if (derived.hidden_pct >= 30) flags.push("HIGH_HIDDEN");
    if (derived.blind_pct >= 30) flags.push("HIGH_BLIND");
    if (derived.unknown_pct >= 28) flags.push("HIGH_UNKNOWN");
    if (derived.open_pct >= 35 && derived.hidden_pct >= 25) flags.push("MIXED_OPEN_HIDDEN");
    return flags;
  }

  var FLAG_DESCRIPTIONS = {
    HIGH_HIDDEN: "Hidden 偏高：宜先強化安全感與一對一服事，再推公開帶領。",
    HIGH_BLIND: "Blind 偏高：宜安排 360 回饋與導師陪談，再談主責崗位。",
    HIGH_UNKNOWN: "Unknown 偏高：宜短期試任探索恩賜，勿因「不确定」而否定价值。",
    MIXED_OPEN_HIDDEN: "Open 与 Hidden 并存：公开面强但仍有未说出的需要，宜 trusted 同伴定期 check-in。"
  };

  function buildCoaching(derived) {
    var dom = derived.dominant || "open";
    return {
      dominant_note: QUADRANT_AFFIRMATION[dom] || "",
      peer_questions: [
        "我最需要你們幫我看見的盲點是什麼？",
        "在團隊中，我什麼時候让你觉得最有帮助／最需改进？"
      ],
      mentor_questions: [
        "依 Johari 四象限，我該先修復「透明度」還是「试任探索」？",
        "与 SHAPE 恩賜結果交叉，我适合哪种事奉节奏？"
      ]
    };
  }

  function buildAiPrompt(run) {
    var d = run.derived || {};
    return (
      "【Johari 盲點 · 輔導草稿】\n" +
      "Open " + d.open_pct + "% / Blind " + d.blind_pct + "% / Hidden " + d.hidden_pct + "% / Unknown " + d.unknown_pct + "%\n" +
      "主區：" + (d.dominant || "—") + "\n" +
      "請協助輔導員：① 肯定「天生我才必有用」② 提出 2 条事奉出路（须 HITL）③ 引用经文化建议，勿编造经文。\n" +
      "勿編造經文；不宣稱屬靈權威；不確定處請明說需牧者查證。"
    );
  }

  function buildRun(answers, profile, opts) {
    opts = opts || {};
    var check = validate(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    var map = check.answers;
    var derived = computeQuadrantPercents(map);
    var run = {
      schema_version: 1,
      tool_id: TOOL_ID,
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: Object.assign({ name: "", role: "" }, profile || {}),
      authenticity_score: 1,
      feature_vector: computeFeatureVector(map),
      derived: derived,
      raw_answers: QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id] };
      }),
      risk_flags: computeRiskFlags(derived),
      coaching: buildCoaching(derived),
      source_note: "johari_pack v1 · " + QUESTIONS.length + " 題自評"
    };
    run.mode = "self";
    var peerAgg = aggregatePeerRunsForSubject(
      (profile && profile.name) || "",
      global.AssessmentRunStore
    );
    if (peerAgg) {
      run.derived.peer_overlay = peerAgg;
      run.derived.blended = blendSelfPeer(derived, peerAgg);
    }
    run.ai_prompt = buildAiPrompt(run);
    if (global.MinistryPathBridge && MinistryPathBridge.attachPathCards) {
      MinistryPathBridge.attachPathCards(run, { sourceTool: "johari", sourceRun: run, store: global.AssessmentRunStore });
    }
    return { ok: true, run: run };
  }

  function buildDemoRun() {
    var answers = {};
    QUESTIONS.forEach(function (q) {
      answers[q.id] = q.quadrant === "open" ? 4 : q.quadrant === "hidden" ? 4 : 3;
    });
    var built = buildRun(answers, { name: "示範同工", role: "小組長" });
    if (built.ok && built.run) {
      built.run.is_demo = true;
      var sd = built.run.derived || {};
      var mockPeer = {
        peer_count: 2,
        open_pct: Math.max(0, (sd.open_pct || 0) - 6),
        blind_pct: Math.min(100, (sd.blind_pct || 0) + 12),
        hidden_pct: Math.max(0, (sd.hidden_pct || 0) - 4),
        unknown_pct: sd.unknown_pct || 0,
        dominant: "blind"
      };
      built.run.derived.peer_overlay = mockPeer;
      built.run.derived.blended = blendSelfPeer(sd, mockPeer);
    }
    return built;
  }

  function computeQuadrantFromSet(map, questionSet) {
    var sums = { open: 0, blind: 0, hidden: 0, unknown: 0 };
    var counts = { open: 0, blind: 0, hidden: 0, unknown: 0 };
    questionSet.forEach(function (q) {
      var v = map[q.id];
      if (!q.quadrant || v == null) return;
      sums[q.quadrant] += v;
      counts[q.quadrant] += 1;
    });
    var total = 0;
    Object.keys(sums).forEach(function (k) {
      total += sums[k];
    });
    if (!total) total = 1;
    var out = {};
    Object.keys(sums).forEach(function (k) {
      out[k + "_pct"] = Math.round((sums[k] / total) * 100);
    });
    var dom = "open";
    var domVal = -1;
    ["open", "blind", "hidden", "unknown"].forEach(function (k) {
      if (out[k + "_pct"] > domVal) {
        domVal = out[k + "_pct"];
        dom = k;
      }
    });
    out.dominant = dom;
    return out;
  }

  function validatePeer(answers) {
    return validate(answers, PEER_QUESTIONS);
  }

  function buildPeerRun(answers, profile, opts) {
    opts = opts || {};
    var check = validatePeer(answers);
    if (!check.ok) return { ok: false, errors: check.errors };
    if (!profile || !profile.subject_name) {
      return { ok: false, errors: ["他評須填寫被評者姓名 subject_name"] };
    }
    var map = check.answers;
    var derived = computeQuadrantFromSet(map, PEER_QUESTIONS);
    var run = {
      schema_version: 1,
      tool_id: "johari_peer",
      mode: "peer",
      timestamp: opts.timestamp || Date.now(),
      member_id: opts.member_id != null ? opts.member_id : null,
      profile: {
        subject_name: profile.subject_name,
        observer_name: profile.observer_name || "",
        relationship: profile.relationship || ""
      },
      authenticity_score: 1,
      feature_vector: computeFeatureVector(map, PEER_QUESTIONS),
      derived: derived,
      raw_answers: PEER_QUESTIONS.map(function (q) {
        return { q: q.id, value: map[q.id] };
      }),
      risk_flags: computeRiskFlags(derived),
      source_note: "johari_pack peer · " + PEER_QUESTIONS.length + " 題他評"
    };
    return { ok: true, run: run };
  }

  function aggregatePeerRunsForSubject(subjectName, store) {
    if (!store || !store.listPeerRuns || !subjectName) return null;
    var peers = store.listPeerRuns(subjectName);
    if (!peers.length) return null;
    var acc = { open: 0, blind: 0, hidden: 0, unknown: 0, n: 0 };
    peers.forEach(function (pr) {
      var d = pr.derived || {};
      ["open", "blind", "hidden", "unknown"].forEach(function (k) {
        acc[k] += Number(d[k + "_pct"]) || 0;
      });
      acc.n += 1;
    });
    if (!acc.n) return null;
    var out = {
      peer_count: acc.n,
      open_pct: Math.round(acc.open / acc.n),
      blind_pct: Math.round(acc.blind / acc.n),
      hidden_pct: Math.round(acc.hidden / acc.n),
      unknown_pct: Math.round(acc.unknown / acc.n)
    };
    var dom = "open";
    var domVal = -1;
    ["open", "blind", "hidden", "unknown"].forEach(function (k) {
      if (out[k + "_pct"] > domVal) {
        domVal = out[k + "_pct"];
        dom = k;
      }
    });
    out.dominant = dom;
    return out;
  }

  function blendSelfPeer(selfDerived, peerAgg) {
    if (!peerAgg) return null;
    var blindBoost = Math.max(0, peerAgg.blind_pct - selfDerived.blind_pct);
    return {
      note:
        "他評 " +
        peerAgg.peer_count +
        " 份：Blind 觀察比自評高 " +
        blindBoost +
        " 百分點 → 宜安排 360 回饋再談帶領。Open 他評 " +
        peerAgg.open_pct +
        "% vs 自評 " +
        selfDerived.open_pct +
        "%。",
      suggested_dominant: peerAgg.blind_pct > selfDerived.blind_pct + 8 ? "blind" : selfDerived.dominant
    };
  }

  function answersMapFromRaw(rawAnswers, questionSet) {
    var map = {};
    questionSet = questionSet || QUESTIONS;
    (rawAnswers || []).forEach(function (row) {
      if (row && row.q != null) map[row.q] = row.value;
    });
    return map;
  }

  function rebuildSelfRunWithPeers(selfRun, store) {
    if (!selfRun || selfRun.tool_id !== TOOL_ID) return { ok: false, errors: ["須為 johari 自評 run"] };
    var map = answersMapFromRaw(selfRun.raw_answers, QUESTIONS);
    var missing = QUESTIONS.filter(function (q) {
      return map[q.id] == null;
    });
    if (missing.length) return { ok: false, errors: ["自評答案不完整，無法合流他評"] };
    return buildRun(map, selfRun.profile, { member_id: selfRun.member_id, timestamp: Date.now() });
  }

  global.JohariPack = {
    TOOL_ID: TOOL_ID,
    TOOL_LABEL: TOOL_LABEL,
    QUESTIONS: QUESTIONS,
    PEER_QUESTIONS: PEER_QUESTIONS,
    QUADRANT_LABELS: QUADRANT_LABELS,
    QUADRANT_AFFIRMATION: QUADRANT_AFFIRMATION,
    FLAG_DESCRIPTIONS: FLAG_DESCRIPTIONS,
    validate: validate,
    validatePeer: validatePeer,
    buildRun: buildRun,
    buildPeerRun: buildPeerRun,
    buildDemoRun: buildDemoRun,
    aggregatePeerRunsForSubject: aggregatePeerRunsForSubject,
    blendSelfPeer: blendSelfPeer,
    answersMapFromRaw: answersMapFromRaw,
    rebuildSelfRunWithPeers: rebuildSelfRunWithPeers
  };
})(typeof window !== "undefined" ? window : global);
