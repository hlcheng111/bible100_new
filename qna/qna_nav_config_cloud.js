/**
 * 雲端版：sidebar 使用 qna_contents_default.html（輕量），因 qna_list_auto.htm 約 4.3MB 可能超出主機限制。
 * 若已成功上傳 qna_list_auto.htm，可改用 qna_nav_config.js。
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
    {"id": "all", "label": "全部來源", "category": "A", "sidebar": "qna_contents_default.html", "landing": "about:blank"},
    {"id": "equiptoserve", "label": "以斯拉百科網", "category": "A", "sidebar": "qna_list_equiptoserve.htm", "landing": "http://www.equiptoserve.org/etspedia/", "lang": ["zh"]},
    {"id": "chineseapologetics", "label": "華人護教", "category": "A", "sidebar": "qna_list_chineseapologetics.htm", "landing": "https://www.chineseapologetics.net/", "lang": ["zh"]},
    {"id": "defendinginerrancy", "label": "Solutions To Bible Errors", "category": "A", "sidebar": "qna_contents_default.html", "landing": "https://defendinginerrancy.com/bible-difficulties/", "lang": ["en"]},
    {"id": "gotquestions", "label": "GotQuestions.org", "category": "A", "sidebar": "qna_contents_default.html", "landing": "https://www.gotquestions.org/content.html", "lang": ["en","zh"], "zh_url": "https://www.gotquestions.org/Chinese/Chinese-good-news.html"},
    {"id": "christiananswers", "label": "Christian Answers", "category": "A", "sidebar": "qna_contents_default.html", "landing": "https://christiananswers.net/", "lang": ["en","zh"], "zh_url": "https://christiananswers.net/chinese/"},
    {"id": "wellsofgrace", "label": "恩泉－陳終道等", "category": "A", "sidebar": "qna_contents_default.html", "landing": "https://wellsofgrace.com/messages/chen/bible_qna/xu1.htm", "lang": ["zh"]},
    {"id": "all_B", "label": "全部來源", "category": "B", "sidebar": "qna_contents_default.html", "landing": "about:blank"},
    {"id": "equiptoserve_apologetics", "label": "以斯拉百科－辯道護教", "category": "B", "sidebar": "qna_contents_default.html", "landing": "http://www.equiptoserve.org/etspedia/", "lang": ["zh"]},
    {"id": "reformedanswers", "label": "Reformed Answers", "category": "B", "sidebar": "qna_contents_default.html", "landing": "https://reformedanswers.org/", "lang": ["en"]},
    {"id": "all_C", "label": "全部來源", "category": "C", "sidebar": "qna_contents_default.html", "landing": "about:blank"},
    {"id": "billygraham", "label": "葛培理福音協會", "category": "C", "sidebar": "qna_contents_default.html", "landing": "https://billygraham.org/answers", "lang": ["en"]},
    {"id": "logosbaptist", "label": "證道浸信會", "category": "C", "sidebar": "qna_contents_default.html", "landing": "https://www.logosbaptist.org/", "lang": ["zh"]}
  ]
};
