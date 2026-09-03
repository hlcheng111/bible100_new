/**
 * Bible100 AI 本地規則引擎（Local Rules Engine）
 * 當無網絡或未配置 API 時，使用本地規則替代外部 LLM
 * 對齊 IMPLEMENTATION_SUPPLEMENT_V1.md 規格
 */
(function (global) {
  "use strict";

  var BOOK_NAMES = {
    1: { zh: "創世記", en: "Genesis" },
    2: { zh: "出埃及記", en: "Exodus" },
    3: { zh: "利未記", en: "Leviticus" },
    4: { zh: "民數記", en: "Numbers" },
    5: { zh: "申命記", en: "Deuteronomy" },
    6: { zh: "約書亞記", en: "Joshua" },
    7: { zh: "士師記", en: "Judges" },
    8: { zh: "路得記", en: "Ruth" },
    9: { zh: "撒母耳記上", en: "1 Samuel" },
    10: { zh: "撒母耳記下", en: "2 Samuel" },
    11: { zh: "列王紀上", en: "1 Kings" },
    12: { zh: "列王紀下", en: "2 Kings" },
    13: { zh: "歷代志上", en: "1 Chronicles" },
    14: { zh: "歷代志下", en: "2 Chronicles" },
    15: { zh: "以斯拉記", en: "Ezra" },
    16: { zh: "尼希米記", en: "Nehemiah" },
    17: { zh: "以斯帖記", en: "Esther" },
    18: { zh: "約伯記", en: "Job" },
    19: { zh: "詩篇", en: "Psalms" },
    20: { zh: "箴言", en: "Proverbs" },
    21: { zh: "傳道書", en: "Ecclesiastes" },
    22: { zh: "雅歌", en: "Song of Solomon" },
    23: { zh: "以賽亞書", en: "Isaiah" },
    24: { zh: "耶利米書", en: "Jeremiah" },
    25: { zh: "耶利米哀歌", en: "Lamentations" },
    26: { zh: "以西結書", en: "Ezekiel" },
    27: { zh: "但以理書", en: "Daniel" },
    28: { zh: "何西阿書", en: "Hosea" },
    29: { zh: "約珥書", en: "Joel" },
    30: { zh: "阿摩司書", en: "Amos" },
    31: { zh: "俄巴底亞書", en: "Obadiah" },
    32: { zh: "約拿書", en: "Jonah" },
    33: { zh: "彌迦書", en: "Micah" },
    34: { zh: "那鴻書", en: "Nahum" },
    35: { zh: "哈巴谷書", en: "Habakkuk" },
    36: { zh: "西番雅書", en: "Zephaniah" },
    37: { zh: "哈该书", en: "Haggai" },
    38: { zh: "撒迦利亞書", en: "Zechariah" },
    39: { zh: "瑪拉基書", en: "Malachi" },
    40: { zh: "馬太福音", en: "Matthew" },
    41: { zh: "馬可福音", en: "Mark" },
    42: { zh: "路加福音", en: "Luke" },
    43: { zh: "約翰福音", en: "John" },
    44: { zh: "使徒行傳", en: "Acts" },
    45: { zh: "羅馬書", en: "Romans" },
    46: { zh: "哥林多前書", en: "1 Corinthians" },
    47: { zh: "哥林多後書", en: "2 Corinthians" },
    48: { zh: "加拉太書", en: "Galatians" },
    49: { zh: "以弗所書", en: "Ephesians" },
    50: { zh: "腓立比書", en: "Philippians" },
    51: { zh: "歌羅西書", en: "Colossians" },
    52: { zh: "帖撒羅尼迦前書", en: "1 Thessalonians" },
    53: { zh: "帖撒羅尼迦後書", en: "2 Thessalonians" },
    54: { zh: "提摩太前書", en: "1 Timothy" },
    55: { zh: "提摩太後書", en: "2 Timothy" },
    56: { zh: "提多書", en: "Titus" },
    57: { zh: "腓利門書", en: "Philemon" },
    58: { zh: "希伯來書", en: "Hebrews" },
    59: { zh: "雅各書", en: "James" },
    60: { zh: "彼得前書", en: "1 Peter" },
    61: { zh: "彼得後書", en: "2 Peter" },
    62: { zh: "約翰一書", en: "1 John" },
    63: { zh: "約翰二書", en: "2 John" },
    64: { zh: "約翰三書", en: "3 John" },
    65: { zh: "猶大書", en: "Jude" },
    66: { zh: "啟示錄", en: "Revelation" }
  };

  var RulePacks = {
    lesson_prep: {
      name: "備課規則包",
      rules: [
        {
          id: "LP-01",
          condition: function(input) { return true; },
          action: function(input, output) {
            output.disclaimer = "此為 AI 草稿，須經牧者／同工禱告分辨後才可寫入正式紀錄";
            output.text = (output.text || "") + "\n\n【聲明】AI 草稿，需牧者審核；不可編造經文";
          }
        },
        {
          id: "LP-02",
          condition: function(input) { return input.persona === "child" || input.persona === "kids"; },
          action: function(input, output) {
            output.text = (output.text || "") + "\n\n【兒童模式】用故事語氣、建議插圖、家長陪讀提示";
          }
        },
        {
          id: "LP-03",
          condition: function(input) { return input.persona === "seeker"; },
          action: function(input, output) {
            output.text = (output.text || "") + "\n\n【慕道模式】避免術語堆砌、強調生活應用";
          }
        },
        {
          id: "LP-04",
          condition: function(input) { return input.bookId && BOOK_NAMES[input.bookId]; },
          action: function(input, output) {
            var book = BOOK_NAMES[input.bookId];
            output.bookName = book.zh + " (" + book.en + ")";
            output.text = (output.text || "").replace("{書卷名}", book.zh);
          }
        },
        {
          id: "LP-05",
          condition: function(input) { return input.outputType === "ppt"; },
          action: function(input, output) {
            output.text = "【PPT 大綱模板】\n1. 標題：[請填入標題]\n2. 經文：[請填入經文]\n3. 要點：\n   - 要點一\n   - 要點二\n   - 要點三\n4. 應用：[請填入生活應用]\n\n（此為模板，需人工填入具體內容）";
          }
        },
        {
          id: "LP-06",
          condition: function(input) { return !input.chapter; },
          action: function(input, output) {
            output.confidence = "low";
            output.text = (output.text || "") + "\n\n【注意】未指定章節，降級為全書導讀框架";
          }
        }
      ]
    },
    pastoral_followup: {
      name: "牧養跟進規則包",
      rules: [
        {
          id: "PF-01",
          condition: function(input) { return true; },
          action: function(input, output) {
            output.text = "【牧養跟進模板】\n1. 關懷重點：[請填入關懷重點]\n2. 經文方向：[請填入建議經文]\n3. 跟進行動：[請填入具體行動]\n\n（此為模板，需同工填入具體內容）";
          }
        },
        {
          id: "PF-02",
          condition: function(input) { return input.spiritualStage === "new_believer"; },
          action: function(input, output) {
            output.text = (output.text || "") + "\n\n【新信徒建議】建議跟進：探訪 + 基要真理教材連結";
          }
        },
        {
          id: "PF-03",
          condition: function(input) { return input.spiritualStage === "crisis"; },
          action: function(input, output) {
            output.text = "【危機處理】請聯繫牧者／關懷同工\n\n代禱框架：\n- 求神賜下平安\n- 求神賜下智慧\n- 求神賜下力量\n\n（不給具體建議，需專業牧養介入）";
            output.confidence = "low";
          }
        },
        {
          id: "PF-04",
          condition: function(input) { return input.member_id; },
          action: function(input, output) {
            if (global.CentralMemberDB && typeof global.CentralMemberDB.getMember === "function") {
              try {
                var member = global.CentralMemberDB.getMember(input.member_id);
                if (member) {
                  output.memberContext = {
                    gifts: member.gifts || [],
                    skills: member.skills || []
                  };
                  output.text = (output.text || "") + "\n\n【會員背景】恩賜：" + (member.gifts || []).join("、") + "；技能：" + (member.skills || []).join("、");
                }
              } catch (e) {}
            }
          }
        },
        {
          id: "PF-05",
          condition: function(input) { return input.requestScripture; },
          action: function(input, output) {
            var scriptureDirections = {
              "關懷": "約翰福音 3 章",
              "安慰": "詩篇 23 篇",
              "指引": "箴言 3 章",
              "盼望": "羅馬書 8 章"
            };
            var direction = scriptureDirections[input.topic] || "詩篇";
            output.text = (output.text || "") + "\n\n【經文建議】" + direction + "（方向，請查閱具體經文）";
          }
        }
      ]
    },
    qna_triage: {
      name: "Q&A 分類規則包",
      rules: [
        {
          id: "QT-01",
          condition: function(input) { return /救恩|因信稱義|三位一體/.test(input.query); },
          action: function(input, output) {
            output.category = "core_doctrine";
            output.text = "【核心教義問題】此問題涉及核心教義，建議查閱 Q&A 對應大類：\n- 救恩論\n- 因信稱義\n- 三位一體\n\n請人工查證後回答";
          }
        },
        {
          id: "QT-02",
          condition: function(input) { return /預言|日期|末世/.test(input.query); },
          action: function(input, output) {
            output.category = "eschatology";
            output.text = "【末世論警示】此問題涉及末世論爭議，需教會教導。\n\n建議：\n1. 查閱正統末世論資料\n2. 咨詢牧者\n3. 避免個人揣測";
          }
        },
        {
          id: "QT-03",
          condition: function(input) { return true; },
          action: function(input, output) {
            output.category = "general";
            output.text = "【提問清單】請補充以下信息以便更準確回答：\n1. 相關經文是什麼？\n2. 具體情境是什麼？\n3. 您的疑問點是什麼？\n\n（此為結構化提問引導）";
          }
        }
      ]
    },
    scripture_lookup: {
      name: "經文查詢規則包",
      rules: [
        {
          id: "SL-01",
          condition: function(input) { return hasDataAccess(); },
          action: function(input, output) {
            output.text = "【經文查詢】data/ 目錄可用，請使用綜合解讀釋經工具查詢具體經文";
            output.hasData = true;
          }
        },
        {
          id: "SL-02",
          condition: function(input) { return true; },
          action: function(input, output) {
            if (!output.hasData) {
              output.text = "【經文查詢】data/ 目錄不可用\n\n解決方案：\n1. 使用 HTTP 開啟（啟動 tools/start_http_bible100.ps1）\n2. 或還原 data/ 目錄（運行 run_backup_data.bat）\n\n書卷目錄：請參考 bible_study 模組";
              output.confidence = "low";
            }
          }
        }
      ]
    }
  };

  function hasDataAccess() {
    try {
      if (typeof global.Bible100Shell !== "undefined" && global.Bible100Shell.config) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function runPack(packId, input) {
    var pack = RulePacks[packId];
    if (!pack) {
      return {
        ok: false,
        error: "Unknown pack: " + packId,
        meta: {
          source: "local_rules",
          pack: packId,
          confidence: "none"
        }
      };
    }

    var output = {
      text: "",
      citations: [],
      nextActions: [],
      confidence: "medium"
    };

    pack.rules.forEach(function(rule) {
      try {
        if (rule.condition(input)) {
          rule.action(input, output);
        }
      } catch (e) {
        console.warn("Rule execution error:", rule.id, e);
      }
    });

    return {
      ok: true,
      source: "local_rules",
      pack: packId,
      confidence: output.confidence || "medium",
      text: output.text,
      citations: output.citations || [],
      nextActions: output.nextActions || [],
      meta: {
        source: "local_rules",
        pack: packId,
        confidence: output.confidence || "medium",
        trust_badge: "offline_template",
        human_review_required: true
      }
    };
  }

  global.AiLocalRules = {
    run: runPack,
    packs: Object.keys(RulePacks),
    BOOK_NAMES: BOOK_NAMES
  };
})(typeof window !== "undefined" ? window : this);
