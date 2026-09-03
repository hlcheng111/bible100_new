/**
 * 4層導航：大類 → 來源 → 側欄（結構化 tree 或 iframe）→ 右欄 iframe
 * 與 SOURCES_PLAN.md、tools/build_sidebar_bundle.mjs 同步。
 * sidebar：相對路徑 .htm 備援；若以 http(s):// 開頭，V2 左欄 iframe 直載該目錄頁。
 * use_full_main：為 true 且 landing 為相對路徑時，V2 隱藏左欄、將整頁導覽（如 qna_ca_*_index.htm）交給右欄 main，避免巢狀雙側欄。
 * 若來源使用 `categories`（字串陣列）而非單一 `category`，則該來源會出現在多個大類下；
 * 篩選條件為「目前選中的大類 id 等於陣列中的某一項」，不沿用 A/A_OT/A_NT 的合併展開。
 */
var QNA_NAV_CONFIG = {
  "layer1_categories": [
    {"id": "A", "label": "聖經書卷難題", "desc": "經文疑難、矛盾、背景等"},
    {"id": "A_OT", "label": "舊約難題", "desc": "創世記～瑪拉基書"},
    {"id": "A_NT", "label": "新約難題", "desc": "馬太～啟示錄"},
    {"id": "B", "label": "神學教義難題", "desc": "辯道、護教、神學問答"},
    {"id": "C", "label": "信徒教會難題", "desc": "信仰、生活、教會實務"}
  ],
  "sources": [
    {"id": "all", "label": "全部來源（大表）", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "about:blank"},
    {"id": "chineseapologetics", "label": "華人護教", "category": "A", "sidebar": "qna_list_chineseapologetics.htm", "landing": "https://www.chineseapologetics.net/Bible-defense/Bible-diff/main.htm", "lang": ["zh"]},
    {"id": "equiptoserve_etspedia", "label": "以斯拉百科（etspedia）", "categories": ["A", "A_OT", "A_NT", "B"], "sidebar": "qna_list_equiptoserve.htm", "landing": "https://www.equiptoserve.org/etspedia", "lang": ["zh"]},
    {"id": "defendinginerrancy", "label": "Defending Inerrancy", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://defendinginerrancy.com/bible-difficulties/", "lang": ["en"]},
    {"id": "biblequestions", "label": "Bible Questions!", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://www.biblequestions.org/", "lang": ["en"]},
    {"id": "gotquestions", "label": "GotQuestions.org", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://www.gotquestions.org/content.html", "lang": ["en", "zh"], "zh_url": "https://www.gotquestions.org/Chinese/Chinese-good-news.html"},
    {"id": "christiananswers", "label": "Christian Answers（英）", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://christiananswers.net/", "lang": ["en", "zh"], "zh_url": "https://christiananswers.net/chinese/trad/home.html"},
    {"id": "christiananswers_zh_trad", "label": "CA 繁中首頁", "category": "A", "sidebar": "qna_ca_zh_index.htm", "landing": "qna_ca_zh_index.htm", "lang": ["zh"], "use_full_main": true},
    {"id": "christiananswers_id", "label": "CA Bahasa Indonesia", "category": "A", "sidebar": "qna_ca_id_index.htm", "landing": "qna_ca_id_index.htm", "lang": ["id"], "use_full_main": true},
    {"id": "wellsofgrace", "label": "恩泉·陳終道（聖經問答）", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/xu1.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_archer", "label": "恩泉·Archer 彙編", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/bible/qna/bible_wenti/archer/index.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_chen_book", "label": "恩泉·《圣经问题解答》", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/xu1.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_chen_ot", "label": "陈终道·旧约", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/index1.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_chen_nt", "label": "陈终道·新约", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/index2.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_su_nt", "label": "恩泉·蘇佐揚·新約難題", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/bible/qna/nanti-su/index.html", "lang": ["zh"]},
    {"id": "wellsofgrace_su_reading", "label": "恩泉·蘇佐揚·讀經深思", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/bible/qna/su-index.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_li_ot", "label": "恩泉·李道生·舊約難題", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/bible/qna/old2-li/index.html", "lang": ["zh"]},
    {"id": "wellsofgrace_lv", "label": "恩泉·呂鴻基", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/bible/qna/bible_wenti/wenti3/index.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_wenti2", "label": "恩泉·難題（卷二）", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/bible/qna/bible_wenti/wenti2/index.htm", "lang": ["zh"]},
    {"id": "ccbiblestudy", "label": "華人查經網 ccbiblestudy", "category": "A", "sidebar": "qna_list_auto.htm", "landing": "https://www.ccbiblestudy.org/", "lang": ["zh"]},
    {"id": "all_B", "label": "全部來源（大表）", "category": "B", "sidebar": "qna_list_auto.htm", "landing": "about:blank"},
    {"id": "reformedanswers", "label": "Reformed Answers", "category": "B", "sidebar": "qna_list_auto.htm", "landing": "https://reformedanswers.org/", "lang": ["en"]},
    {"id": "wellsofgrace_chen_theology", "label": "陳終道·神學問題", "category": "B", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/index4.htm", "lang": ["zh"]},
    {"id": "all_C", "label": "全部來源（大表）", "category": "C", "sidebar": "qna_list_auto.htm", "landing": "about:blank"},
    {"id": "billygraham", "label": "葛培理 Answers", "category": "C", "sidebar": "qna_list_auto.htm", "landing": "https://billygraham.org/answers", "lang": ["en"]},
    {"id": "logosbaptist", "label": "證道浸信會", "category": "C", "sidebar": "qna_list_auto.htm", "landing": "https://www.logosbaptist.org/", "lang": ["zh"]},
    {"id": "wellsofgrace_chen_life", "label": "陳終道·生活問題", "category": "C", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/index3.htm", "lang": ["zh"]},
    {"id": "wellsofgrace_chen_church", "label": "陳終道·教會問題", "category": "C", "sidebar": "qna_list_auto.htm", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/index5.htm", "lang": ["zh"]}
  ]
};
