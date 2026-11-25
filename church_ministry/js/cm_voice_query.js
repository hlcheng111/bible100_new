/**
 * CM · 口語查詢（P5）：把一句話「對應到已有的快速查詢鈕」，只回名單。
 *
 * 規則（不可偏）：
 *  1. 只對應到既有篩選（CHIP 清單），不自創新篩選、不自己算分數、不連網、不呼叫 AI。
 *  2. 只回名單：看到「通知／發訊息／派／刪除…」這類動作字眼，不會執行，只提醒。
 *  3. 聽不懂就老實說，並列出可按的快速查詢鈕，不亂猜。
 *  4. 涉及自傷、家暴、虐待、性侵、人身安全：不列名單，請立即找牧者。
 *  5. 輸入的句子不存檔、不外送。
 *
 * 給小白：下面 INTENTS 的 words 可以用記事本增減，存檔後重新整理即可。
 * 規格：church_ministry/docs/MRM_ENGINEERING_PLAN_V1.md §5.6
 */
(function (global) {
  "use strict";

  /** 與 cm_ai_care_helper.js 的快速查詢鈕、pastoral_trial_pack.js 的 queryQuickFilter 同一套 */
  var INTENTS = [
    {
      filter: "absence_streak_ge_2",
      label: "缺席≥2 次",
      words: ["缺席", "沒來", "沒有來", "沒出席", "未來", "冇來", "冇嚟", "唔嚟", "缺課", "缺課", "沒來", "沒有來", "沒出席"]
    },
    {
      filter: "lifecycle_at_risk",
      label: "流失預警",
      words: ["流失", "淡出", "快要離開", "快要離開"]
    },
    {
      filter: "no_group",
      label: "未入小組",
      words: [
        "未入小組", "未入組", "沒入組", "沒入小組", "沒有入小組", "沒有入組", "沒有小組", "沒有組", "冇小組", "無小組", "未分組", "未歸組", "沒有歸屬",
        "未參加小組", "沒有參加小組", "未入小組", "沒有小組", "沒入組", "未參加小組"
      ]
    },
    {
      filter: "lifecycle_newcomer",
      label: "新朋友",
      words: ["新朋友", "新人", "初來", "第一次來", "新來", "慕道", "初來", "第一次來", "新來"]
    },
    {
      filter: "handover_pending",
      label: "待推送探訪",
      words: [
        "待探訪", "要探訪", "需要探訪", "待推送", "待處理探訪", "探訪名單", "關心名單", "待跟進",
        "待探訪", "要探訪", "需要探訪", "探訪名單", "關心名單", "待處理探訪"
      ]
    }
  ];

  /** 看到這些字，代表使用者想「做事」；本工具只列名單，不做事 */
  var ACTION_WORDS = [
    "發訊息", "發短訊", "傳訊息", "發送", "寄出", "通知", "打電話", "致電", "派給", "指派", "分配",
    "刪除", "修改", "更改", "標記為", "新增", "自動",
    "發訊息", "發短信", "發送", "打電話", "指派", "刪除", "修改", "標記為"
  ];

  /** 危機字眼：不列名單，請人處理 */
  var SAFETY_WORDS = [
    "自殺", "自殺", "想死", "不想活", "自傷", "自傷", "割腕", "家暴", "被打", "虐待", "性侵", "性騷擾", "性騷擾",
    "強暴", "強暴", "人身安全", "有人要殺", "有人要殺"
  ];

  /** 提到時間，但快速查詢不分日期（列的是現況）→ 要老實說 */
  var TIME_WORDS = ["這個月", "本月", "上個月", "上月", "這週", "本週", "這周", "本週", "上週", "上週", "昨天", "今天", "最近", "這個月", "本月", "上個月"];
  var TIME_NOTE_ZH = "快速查詢不依日期篩選，列的是目前的狀況，不是特定日期範圍。";
  var ACTION_NOTE_ZH = "這裡只會列名單，不會代你發訊息、通知、派工或修改資料；要跟進請按名單旁的「去處理」，由你自己決定。";
  var SAFETY_NOTE_ZH =
    "這類情況不能靠查名單處理。請立即聯絡牧者或教會指定的關懷負責人；若有人身危險，請聯絡當地緊急服務。細節請當面或電話說明，不要寫在訊息裡。";
  var NONE_NOTE_ZH = "我沒聽懂這句話。請改用下面的快速查詢鈕，或換個說法，例如「這個月誰沒來」「還沒入小組的人」。";
  var EMPTY_NOTE_ZH = "請先輸入一句話，例如「誰連續沒來」，或直接按下面的快速查詢鈕。";
  var NUMBER_NOTE_ZH = "目前只提供固定的「缺席≥2 次」這一個篩選，不會依你說的次數另算；其他次數請到缺席預警頁看。";

  /* 口語輸入可能是簡體：先轉成繁體，再比對關鍵詞（關鍵詞表只寫繁體） */
  var SIMP = "并乱来个传伤两删则创动务参单围图执实写对属几强后应怀换扰数时会标机档归杀决没况减为无状现当发节范筛细组络给网紧续联听与处里规讯记访词询话语说谁课请读负责资输这连周进选还钮长开间关险离电页预类骚";
  var TRAD = "並亂來個傳傷兩刪則創動務參單圍圖執實寫對屬幾強後應懷換擾數時會標機檔歸殺決沒況減為無狀現當發節範篩細組絡給網緊續聯聽與處裡規訊記訪詞詢話語說誰課請讀負責資輸這連週進選還鈕長開間關險離電頁預類騷";
  function toTrad(s) {
    return s.replace(/[\u4e00-\u9fff]/g, function (c) {
      var i = SIMP.indexOf(c);
      return i >= 0 ? TRAD.charAt(i) : c;
    });
  }

  function normalize(text) {
    return toTrad(String(text == null ? "" : text))
      .toLowerCase()
      .replace(/[\s\u3000,，.。!！?？、;；:：「」『』"'()（）\[\]【】]/g, "");
  }

  function containsAny(s, words) {
    for (var i = 0; i < words.length; i++) {
      if (s.indexOf(words[i]) >= 0) return words[i];
    }
    return "";
  }

  /** 回傳每個意圖的命中分數（命中字詞的最長長度；同一意圖只取最長一個） */
  function scoreIntents(s) {
    return INTENTS.map(function (it) {
      var best = 0;
      var hit = "";
      it.words.forEach(function (w) {
        if (s.indexOf(w) >= 0 && w.length > best) {
          best = w.length;
          hit = w;
        }
      });
      return { filter: it.filter, label: it.label, score: best, hit: hit };
    }).filter(function (r) {
      return r.score > 0;
    });
  }

  /** 提到「幾次／幾週」且不是 2 → 提醒目前只有固定篩選 */
  function hasOtherCountThanTwo(raw) {
    var s = String(raw || "");
    var m = s.match(/([0-9一二兩三四五六七八九十]+)\s*(次|週|周|星期)/);
    if (!m) return false;
    var map = { 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
    var n = /^[0-9]+$/.test(m[1]) ? Number(m[1]) : map[m[1]];
    return n !== undefined && n !== 2;
  }

  /**
   * 解讀一句話。
   * @returns {{state:'empty'|'safety'|'matched'|'ambiguous'|'none', filter:string, label:string,
   *            candidates:Array, notes:string[], message:string}}
   */
  function interpret(text) {
    var out = { state: "none", filter: "", label: "", candidates: [], notes: [], message: "" };
    var s = normalize(text);
    if (!s) {
      out.state = "empty";
      out.message = EMPTY_NOTE_ZH;
      return out;
    }
    if (containsAny(s, SAFETY_WORDS)) {
      out.state = "safety";
      out.message = SAFETY_NOTE_ZH;
      return out;
    }
    var hasAction = !!containsAny(s, ACTION_WORDS);
    var scored = scoreIntents(s).sort(function (a, b) {
      return b.score - a.score;
    });
    if (!scored.length) {
      out.state = "none";
      out.message = NONE_NOTE_ZH;
      if (hasAction) out.notes.push(ACTION_NOTE_ZH);
      return out;
    }
    out.candidates = scored.map(function (r) {
      return { filter: r.filter, label: r.label };
    });
    if (scored.length > 1) {
      /* 同時像好幾個查詢：不替使用者猜，請他自己按鈕 */
      out.state = "ambiguous";
      out.message =
        "這句話同時像：" +
        scored
          .map(function (r) {
            return "「" + r.label + "」";
          })
          .join("、") +
        "。請按下面對應的快速查詢鈕，我不替你猜。";
      if (hasAction) out.notes.push(ACTION_NOTE_ZH);
      return out;
    }
    out.state = "matched";
    out.filter = scored[0].filter;
    out.label = scored[0].label;
    out.message = "已對應到快速查詢「" + out.label + "」（只列名單）。";
    if (out.filter === "absence_streak_ge_2" && hasOtherCountThanTwo(text)) out.notes.push(NUMBER_NOTE_ZH);
    if (containsAny(s, TIME_WORDS)) out.notes.push(TIME_NOTE_ZH);
    if (hasAction) out.notes.push(ACTION_NOTE_ZH);
    return out;
  }

  var api = {
    INTENTS: INTENTS,
    ACTION_WORDS: ACTION_WORDS,
    SAFETY_WORDS: SAFETY_WORDS,
    interpret: interpret,
    normalize: normalize,
    NONE_NOTE_ZH: NONE_NOTE_ZH
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    global.CmVoiceQuery = api;
  }
})(typeof window !== "undefined" ? window : this);
