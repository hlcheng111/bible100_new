/** iframe 內頁：讀 ?locale= 並更新 [data-L] 文案 */
(function (global) {
  var PAGE_STRINGS = {
    'zh-Hant': {
      home_title: '🦁 聖經跑道 · 歡迎',
      home_lead: '上方選語言、對象、賽道；中間切 A–E 區；底部看理念與讀經法。',
      home_tip1: 'C 區：66 卷四語並排經文',
      home_tip2: '兒少主線：選「兒少」→ B 今日 / A 同跑隊',
      home_tip3: '100 金句、30 日：底部「讀經法」',
      col_zh: '繁中（和合）',
      col_en: 'English (KJV)',
      col_vi: '越文（1934 聖經）',
      col_id: '印尼文（AYT 開放譯本）',
      col_vi_note: 'Kinh Thánh 1934 · 公有領域',
      col_id_note: 'Alkitab Yang Terbuka · CC BY-ND',
      bible_hint_zh: '六十六卷 · 和合本 + KJV',
      bible_hint_en: '66 books · KJV + Chinese Union',
      bible_hint_vi: '66 sách · Kinh Thánh 1934 + KJV',
      bible_hint_id: '66 kitab · AYT + KJV',
      bible_title: '六十六卷 · 對照讀經',
      bible_loading: '正在打開經庫，請稍等…',
      bible_full: '六十六卷全書已就緒',
      bible_empty: '這一章沒有內容，請換一章',
      bible_sample: '示範模式：只有樣本章',
      bible_single_hint: '單語對照關閉',
      col_lu: '呂振中',
      col_bridge: '越印備用',
      col_lu_note: '暫用英文',
      col_bridge_note: '英文底稿，越文印尼文待校',
      ot: '舊約',
      nt: '新約',
      all: '全部',
      ch: '章',
      pacing_title: 'A · 你跑我追',
      pacing_lead: '同跑隊即時步調（示範資料，正式版接 QR 邀請）',
      today_title: 'B · 本日主題',
      today_lead: '重擔通通放下來 🪵 — 依對象顯示今日關卡（兒少接關卡頁）',
      qna_title: 'D · AI 智慧牧理 Q&A',
      qna_lead: '提問草稿 → 老師/牧者審核（Phase 2 接 Prompt 工作流）',
      ai_title: 'E · 神學導師 & 代禱伴侶',
      ai_lead: '引用經文、不取代牧者；Phase 2 接 AI 工具列',
    },
    en: {
      home_title: '🦁 Bible Journey · Welcome',
      home_lead: 'Pick language, persona, track above; A–E zones in the middle; guides at the bottom.',
      home_tip1: 'Zone C: 66 books, 4-language parallel text',
      home_tip2: 'Kids: choose Kids → B Today / A Squad',
      home_tip3: '100 verses & 30-day: footer Methods',
      col_zh: 'Chinese (Union)',
      col_en: 'English (KJV)',
      col_vi: 'Vietnamese (1934 Bible)',
      col_id: 'Indonesian (AYT Open Bible)',
      col_vi_note: 'Kinh Thánh 1934 · public domain',
      col_id_note: 'Alkitab Yang Terbuka · CC BY-ND',
      bible_hint_zh: '66 books · Union + KJV',
      bible_hint_en: '66 books · KJV + Chinese Union',
      bible_hint_vi: '66 books · Vietnamese 1934 + KJV',
      bible_hint_id: '66 books · AYT + KJV',
      bible_title: '66 Books · parallel reader',
      bible_loading: 'Loading Bible pack (~25MB)…',
      bible_full: 'Full 66 books · Union · KJV · Lu Zhenzhong',
      bible_empty: 'No verses in this chapter',
      bible_sample: 'Demo: sample chapters only',
      bible_single_hint: 'Single-language view',
      col_lu: 'Lu ZZ',
      col_bridge: 'VI/ID bridge',
      col_lu_note: 'EN fallback',
      col_bridge_note: 'EN draft for VI/ID review',
      ot: 'OT',
      nt: 'NT',
      all: 'All',
      ch: 'Ch',
      pacing_title: 'A · Pacing lane',
      pacing_lead: 'Squad sync (demo data; QR invite in Phase 2)',
      today_title: 'B · Today\'s theme',
      today_lead: 'Daily unit by persona (kids → story levels)',
      qna_title: 'D · Pastoral Q&A',
      qna_lead: 'Draft answers → pastor review (Phase 2)',
      ai_title: 'E · Theology tutor & prayer',
      ai_lead: 'Cite Scripture; not a substitute for pastors',
    },
    vi: {
      home_title: '🦁 Hành trình Kinh Thánh',
      home_lead: 'Chọn ngôn ngữ, đối tượng, lộ trình; khu A–E; hướng dẫn ở dưới.',
      home_tip1: 'Khu C: 66 sách · Kinh Thánh 1934 + KJV',
      home_tip2: 'Thiếu nhi: chọn Thiếu nhi → B Hôm nay',
      home_tip3: '100 câu & 30 ngày: mục Phương pháp',
      col_zh: 'Trung (Hợp và)',
      col_en: 'English (KJV)',
      col_vi: 'Tiếng Việt (1934)',
      col_id: 'Indonesia (AYT)',
      col_vi_note: 'Kinh Thánh 1934 · phạm vi công cộng',
      col_id_note: 'Alkitab Yang Terbuka · CC BY-ND',
      bible_hint_vi: '66 sách · Kinh Thánh 1934 + KJV',
      bible_title: '66 Sách · đối chiếu',
      bible_empty: 'Chương này chưa có nội dung',
      bible_sample: 'Chế độ mẫu: chỉ vài chương',
      bible_single_hint: 'Chỉ một ngôn ngữ',
      ot: 'Cũ',
      nt: 'Mới',
      all: 'Tất',
      ch: 'Ch',
      pacing_title: 'A · Nhịp độ',
      pacing_lead: 'Đồng bộ nhóm (demo)',
      today_title: 'B · Hôm nay',
      today_lead: 'Chủ đề theo đối tượng',
      qna_title: 'D · Hỏi đáp',
      qna_lead: 'Bản nháp → duyệt',
      ai_title: 'E · AI',
      ai_lead: 'Trích Kinh văn',
    },
    id: {
      home_title: '🦁 Perjalanan Alkitab',
      home_lead: 'Pilih bahasa, peran, jalur; area A–E; panduan di bawah.',
      home_tip1: 'Area C: 66 kitab · AYT + KJV',
      home_tip2: 'Anak: pilih Anak → B Hari ini',
      home_tip3: '100 ayat & 30 hari: Metode',
      col_zh: 'Tionghoa (Union)',
      col_en: 'English (KJV)',
      col_vi: 'Vietnam (1934)',
      col_id: 'Indonesia (AYT)',
      col_vi_note: 'Kinh Thánh 1934',
      col_id_note: 'Alkitab Yang Terbuka · CC BY-ND',
      bible_hint_id: '66 kitab · AYT + KJV',
      bible_title: '66 Kitab · paralel',
      bible_empty: 'Tidak ada ayat di pasal ini',
      bible_sample: 'Mode demo: hanya sampel',
      bible_single_hint: 'Satu bahasa saja',
      ot: 'PL',
      nt: 'PB',
      all: 'Semua',
      ch: 'Pas',
      pacing_title: 'A · Langkah',
      pacing_lead: 'Sinkron kelompok (demo)',
      today_title: 'B · Hari ini',
      today_lead: 'Tema harian',
      qna_title: 'D · Tanya jawab',
      qna_lead: 'Draf → tinjau',
      ai_title: 'E · AI',
      ai_lead: 'Kutip Alkitab',
    },
  };

  function getLocale() {
    var q = new URLSearchParams(location.search);
    return q.get('locale') || 'zh-Hant';
  }

  function L(key) {
    var loc = getLocale();
    var pack = PAGE_STRINGS[loc] || PAGE_STRINGS.en;
    return pack[key] || PAGE_STRINGS.en[key] || key;
  }

  function applyPageLocale() {
    var loc = getLocale();
    document.documentElement.lang = loc === 'zh-Hant' ? 'zh-Hant' : loc;
    document.querySelectorAll('[data-L]').forEach(function (el) {
      el.textContent = L(el.getAttribute('data-L'));
    });
  }

  global.PageLocale = { getLocale: getLocale, L: L, applyPageLocale: applyPageLocale, PAGE_STRINGS: PAGE_STRINGS };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPageLocale);
  } else {
    applyPageLocale();
  }
})(window);
