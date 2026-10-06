/* 外部詩集索引 · 只存書目與 Hymnary 連結。沒有歌詞、沒有樂譜。file:// 可讀。 */
function phHymnaryRow(hymnalId, hymnalTitle, year, number, title, tune, author) {
  return {
    instanceId: "hymnary-" + String(hymnalId).toLowerCase() + "-" + number,
    provider: "hymnary",
    hymnalId: hymnalId,
    hymnalTitle: hymnalTitle,
    hymnalYear: year,
    hymnNumber: String(number),
    titleZh: title,
    titleRaw: title,
    tuneName: tune,
    author: author || "",
    lyricist: author || "",
    composer: "",
    sourceUrl: "https://hymnary.org/hymn/" + hymnalId + "/" + number,
    hymnalUrl: "https://hymnary.org/hymnal/" + hymnalId,
    rightsStatus: "link_only",
    reviewStatus: "imported",
    sourceDataStatus: "external_unverified"
  };
}
function holc(n, title, tune, author) {
  return phHymnaryRow("HOLC1986", "生命聖詩", 1986, n, title, tune, author);
}
function hym(n, title, tune, author) {
  return phHymnaryRow("Hymn1984", "聖徒詩歌", 1984, n, title, tune, author);
}
window.PH_HYMNARY_INDEX = {
  checkedAt: "2026-10-06",
  rights: "link_only",
  note: "資料來自 Hymnary.org，本站未逐首核對紙本。點出去看詞與譜。",
  hymnals: [
    {
      hymnalId: "HOLC1986",
      provider: "hymnary",
      titleZh: "生命聖詩",
      titleEn: "Hymns of Life",
      year: 1986,
      language: "zh",
      sourceUrl: "https://hymnary.org/hymnal/HOLC1986",
      catalogNote: "Hymnary 詩目可能不完整。"
    },
    {
      hymnalId: "Hymn1984",
      provider: "hymnary",
      titleZh: "聖徒詩歌",
      titleEn: "Sheng tu shi ge",
      year: 1984,
      language: "zh",
      sourceUrl: "https://hymnary.org/hymnal/Hymn1984",
      catalogNote: "編號請當文字。本樣板只收 1–25。"
    }
  ],
  catalogLinks: [
    { hymnalId: "HOLC1986", titleZh: "生命聖詩", titleEn: "Hymns of Life", year: 1986, sourceUrl: "https://hymnary.org/hymnal/HOLC1986", catalog: "已有目錄", hymns: "第 1–25 首", score: "未註明", next: "下一刀補其餘歌號，只存歌名和連結" },
    { hymnalId: "Hymn1984", titleZh: "聖徒詩歌", titleEn: "Sheng tu shi ge", year: 1984, sourceUrl: "https://hymnary.org/hymnal/Hymn1984", catalog: "已有目錄", hymns: "第 1–25 首", score: "未註明", next: "生命聖詩補完後，再補這本其餘歌號" },
    { hymnalId: "CNH1985", titleZh: "讚美詩（新編）", titleEn: "Chinese New Hymnal", year: 1985, sourceUrl: "https://hymnary.org/hymnal/CNH1985", catalog: "已有目錄", hymns: "未收逐首", score: "未註明", next: "先對目錄，再收第一批歌名" },
    { hymnalId: "NSP1973", titleZh: "頌主新歌", titleEn: "New Songs of Praise", year: 1973, sourceUrl: "https://hymnary.org/hymnal/NSP1973", catalog: "已有目錄", hymns: "未收逐首", score: "沒有中文樂譜", next: "只收歌名連結，不指望譜" },
    { hymnalId: "HUP1936", titleZh: "普天頌讚", titleEn: "Hymns of Universal Praise", year: 1936, sourceUrl: "https://hymnary.org/hymnal/HUP1936", catalog: "已有目錄", hymns: "未收逐首", score: "有中文樂譜", next: "目錄核對後再收歌名，譜留在 Hymnary" },
    { hymnalId: "CEL1997", titleZh: "The Celebration Hymnal", titleEn: "songs and hymns for worship", year: 1997, sourceUrl: "https://hymnary.org/hymnal/CEL1997", catalog: "已有目錄", hymns: "未收逐首", score: "部份有英文樂譜", next: "要收時再逐首抄歌名，不下載譜" },
    { hymnalId: "GG2013", titleZh: "Glory to God", titleEn: "the Presbyterian Hymnal", year: 2013, sourceUrl: "https://hymnary.org/hymnal/GG2013", catalog: "已有目錄", hymns: "未收逐首", score: "部份有英文樂譜", next: "要收時再逐首抄歌名，不下載譜" },
    { hymnalId: "LUYH2013", titleZh: "Lift Up Your Hearts", titleEn: "psalms, hymns, and spiritual songs", year: 2013, sourceUrl: "https://hymnary.org/hymnal/LUYH2013", catalog: "已有目錄", hymns: "未收逐首", score: "部份有英文樂譜", next: "要收時再逐首抄歌名，不下載譜" },
    { hymnalId: "MSC1934", titleZh: "晨星短歌", titleEn: "Morning Star Choruses", year: 1934, sourceUrl: "https://hymnary.org/hymnal/MSC1934", catalog: "已有目錄", hymns: "未收逐首", score: "未註明", next: "稍後再收" },
    { hymnalId: "HySS1972", titleZh: "HySS1972", titleEn: "", year: 1972, sourceUrl: "https://hymnary.org/hymnal/HySS1972", catalog: "已有目錄", hymns: "未收逐首", score: "未註明", next: "中文名對上再收" },
    { hymnalId: "SOG1991", titleZh: "SOG1991", titleEn: "", year: 1991, sourceUrl: "https://hymnary.org/hymnal/SOG1991", catalog: "已有目錄", hymns: "未收逐首", score: "未註明", next: "中文名對上再收" }
  ],
  instances: [
    /* HOLC1986 1–25 */
    holc(1, "榮耀都歸與聖父， (Glory be to the Father)", "GLORIA PATRI (GREATOREX)", ""),
    holc(2, "榮耀都歸與聖父， (Glory be to the Father)", "MIENEKE", ""),
    holc(3, "求大君王來臨， (Come, Thou Almighty King)", "MOSCOW", ""),
    holc(4, "榮耀歸與至尊聖父， (Glory be to God)", "REGENT SQUARE", ""),
    holc(5, "聖哉，聖哉，聖哉，", "NICEA", ""),
    holc(6, "天上父親，慈愛淵深， (Father of Heaven)", "HESPERUS (QUEBEC)", ""),
    holc(7, "永遠讚美聖父， (We give immortal praise)", "CHRISTCHURCH", ""),
    holc(8, "榮耀歸於真神， (To God be the Glory)", "[To God be the Glory]", ""),
    holc(9, "擁戴我主為王", "DIADEMATA", ""),
    holc(10, "屬主眾僕人， (Ye servants of God)", "LYONS", ""),
    holc(11, "我眾虔誠聚集， (We gather together)", "KREMSER", ""),
    holc(12, "主阿！我神，我每逢舉目觀看， (How great Thou art!)", "O STORE GUD", ""),
    holc(13, "讓我心靈稱頌上主， (Bless the Lord, O my soul)", "MARTYRDOM/AVON", ""),
    holc(14, "信徒讚美至高真神， (God of Gods, we sound His praises)", "STROVER", ""),
    holc(15, "我靈，我心，宣揚我主為大， (Tell out, my soul, the greatness of the Lord)", "WOODLANDS", ""),
    holc(16, "日月所照萬國萬方， (Jesus shall reign where'er the sun)", "DUKE STREET", ""),
    holc(17, "當世界還未曾創造， (Of the Father's love begotten)", "CORDE NATUS (DIVINUM MYSTERIUM)", ""),
    holc(18, "你的信實廣大， (Great is Thy faithfulness)", "FAITHFULNESS", ""),
    holc(19, "亞伯拉罕的神， (The God of Abraham praise)", "LEONI", ""),
    holc(20, "真神所造萬象生靈， (All creatures of our God and King)", "LASST UNS ERFREUEN", ""),
    holc(21, "讚美我天父， (Praise to the Father)", "CHRISTE SANCTORIUM", ""),
    holc(22, "快樂，快樂，我們祟拜， (Joyful, joyful, we adore Thee)", "HYMN TO JOY", ""),
    holc(23, "今齊來感謝神， (Now thank we all our God)", "NUN DANKET", ""),
    holc(24, "神在殿中，信徒崇敬， (God is here; as we His people meet)", "SZE LING", ""),
    holc(25, "上主選召之民， (Stand up, and bless the Lord)", "CARLISLE", ""),
    /* Hymn1984 1–25 */
    hym(1, "榮耀歸與至高神！榮耀歸神！榮耀歸神 (Glory to God in the highest)", "[Glory to God in the highest]", "B. E. Warren"),
    hym(2, "聖哉，聖哉，聖哉，全能的主神", "[Holy, holy, holy, Lord God almighty]", "Reginald Heber"),
    hym(3, "讚美真神，萬福源頭，天下萬有讚祂不休", "[Praise God from whom all blessings flow]", "Thomas Ken"),
    hym(4, "當讚美聖父，讓每顆心向祂謝恩!", "[Praise ye the Father]", ""),
    hym(5, "全能君王降臨", "[Come Thou Almighty King]", "Charles Wesley"),
    hym(6, "主阿，你的名在全地何其美", "[How Excellent is Thy Name]", ""),
    hym(7, "偉大的神，我每逢靜念默思，你手所創這偉大的世界", "[O Lord my God, when I in awesome wonder]", "Stuart K. Hine"),
    hym(8, "讚美我主，全能主神，受造萬有君王，", "[Praise to the Lord, the Almighty, the King of creation]", "Joachim Neander"),
    hym(9, "快樂，快樂，我們敬拜榮耀之主愛之神", "[Joyful, joyful, we adore Thee]", "Henry Van Dyke"),
    hym(10, "主手所造萬象生靈，同發聲音讚美真神，", "[All creatures of our God and King]", "St. Francis of Assisi"),
    hym(11, "仰看穹蒼，浩大無窮，蔚藍、深邃，沒有止境", "[The spacious firmament on high]", "Joseph Addison"),
    hym(12, "這是天父世界，我們側耳要聽", "[This is my Father's world]", "Maltbie D. Babcock"),
    hym(13, "主耶和華，我的力量，我心如何愛你", "[Lord Jehovah, my strength]", "Newman Sze"),
    hym(14, "不能朽，不能見，獨一的真神", "[Immortal, invisible, God only wise]", "Walter C. Smith"),
    hym(15, "神阿，你是何等奇妙", "[My God, how wonderful thou art]", "Frederick W. Faber"),
    hym(16, "頌讚與尊貴並榮耀歸主，願榮耀歸主，願榮耀歸主", "[Blessing and honor]", ""),
    hym(17, "我們不會疲倦不唱這首舊詩章", "[We are never, never weary]", "Fanny J. Crosby"),
    hym(18, "神聖之愛，遠超眾愛，天上之樂臨地上", "[Love divine, all loves excelling]", "Charles Wesley"),
    hym(19, "世上罪人，為何徬徨、遁走、驚懼如迷羊？", "[Souls of men, why will ye scatter]", "Frederick W. Faber"),
    hym(20, "真神之愛，偉大無窮，口舌筆墨，難以形容", "[The love of God]", "Frederick M. Lehman"),
    hym(21, "父阿，久在創世之前，你選我們愛無限", "[Father, 'twas Thy love that knew us]", "James G. Deck"),
    hym(22, "我要唱耶和華的大慈愛到永遠，我要唱，我要唱", "[I will sing of the mercies of the Lord]", ""),
    hym(23, "神阿，你為何故", "[What was it, blessed God]", "Ann T. Gilbert"),
    hym(24, "神哪，你在聖所之內，", "[O God within the holy place]", ""),
    hym(25, "沒有血，沒有壇，禁祀已成過去", "[No blood, no altar now]", "Horatius Bonar")
  ]
};
