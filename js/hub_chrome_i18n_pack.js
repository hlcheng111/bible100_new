/**
 * 總站 index_v5 · Chrome 四語（頂欄模式／教會第二列／品牌）
 * VI/ID 主標用本語，細字附英文（與 .t-en 一致）
 */
(function (global) {
  'use strict';

  function row(zh, en, vi, id) {
    return { 'zh-Hant': zh, en: en, vi: vi, id: id };
  }

  var P = {
    'hub.brand': row('聖經百步四寶', 'Bible100', 'Bible100 · Kinh Thánh', 'Bible100 · Alkitab'),
    'hub.tools': row('工具總覽', 'Tools', 'Tổng quan công cụ', 'Ikhtisar alat'),
    'hub.crm_auto': row('口述預填', 'Prefill', 'Điền trước AI', 'Isi otomatis'),
    'hub.sync': row('⚡ 同步紀錄', '⚡ Sync log', '⚡ Nhật ký đồng bộ', '⚡ Log sinkron'),
    'hub.lang': row('介面', 'UI', 'Giao diện', 'Antarmuka'),
    'hub.search_ph': row('搜入口／課名…', 'Search menus / lessons…', 'Tìm mục lục / bài…', 'Cari menu / pelajaran…'),
    'hub.loading': row('載入中…', 'Loading…', 'Đang tải…', 'Memuat…'),
    'hub.forms.note': row(
      '工作區表單多為中文；頂欄已翻譯方便認路。',
      'Most forms stay Chinese; top bar is translated for wayfinding.',
      'Biểu mẫu chủ yếu tiếng Trung; thanh trên đã dịch để định hướng.',
      'Formulir umumnya Cina; bilah atas diterjemahkan untuk navigasi.'
    ),

    'hub.mode.material': row('教材與培訓', 'Materials & Training', 'Giáo trình & đào tạo', 'Materi & pelatihan'),
    'hub.mode.study': row('聖經研讀', 'Bible Study', 'Nghiên cứu Kinh Thánh', 'Studi Alkitab'),
    'hub.mode.qna': row('聖經難題 Q&A', 'Bible Q&A', 'Hỏi đáp Kinh Thánh', 'Tanya jawab Alkitab'),
    'hub.mode.church': row('教會事工', 'Church Ministry', 'Sự vụ Hội thánh', 'Pelayanan Gereja'),
    'hub.mode.school': row('學校管理', 'School Management', 'Quản lý trường', 'Manajemen sekolah'),
    'hub.mode.ai': row('AI 輔助', 'AI Lab', 'AI hỗ trợ', 'Lab AI'),

    'hub.church.group.brain': row('🧭 規劃', '🧭 Planning', '🧭 Quy hoạch', '🧭 Perencanaan'),
    'hub.church.group.admin': row('🟩 行政', '🟩 Admin', '🟩 Hành chính', '🟩 Administrasi'),
    'hub.church.group.desks': row('事工 A–G', 'Desks A–G', 'Bàn A–G', 'Meja A–G'),
    'hub.church.group.meta': row('全站導覽', 'Site nav', 'Điều hướng site', 'Navigasi situs'),

    'hub.sec.home': row('首頁', 'Home', 'Trang chủ', 'Beranda'),
    'hub.multilang': row('多语查经', 'Multilingual Bible', 'Đa ngôn ngữ', 'Multibahasa'),
    'hub.sec.plan': row('🧭 規劃', 'Planning', 'Quy hoạch', 'Perencanaan'),
    'hub.sec.admin': row('🟩 行政', 'Admin', 'Hành chính', 'Administrasi'),
    'hub.sec.a': row('A 敬拜音樂', 'A Worship & Music', 'A Thờ phượng', 'A Ibadah & Musik'),
    'hub.sec.b': row('B 牧養小組', 'B Pastoral & Groups', 'B Chăm sóc & Nhóm', 'B Penggembalaan'),
    'hub.sec.c': row('C 聖經門訓', 'C Bible & Discipleship', 'C Kinh Thánh & Môn đồ', 'C Alkitab & Pemuridan'),
    'hub.sec.d': row('D 外展差傳', 'D Outreach & Mission', 'D Truyền giáo', 'D Penginjilan'),
    'hub.sec.e': row('E 社會服務', 'E Social Service', 'E Phục vụ xã hội', 'E Pelayanan sosial'),
    'hub.sec.f': row('F 詩歌應用', 'F Hymns', 'F Thánh ca', 'F Pujian'),
    'hub.sec.g': row('G 規劃行政', 'G Plan & Admin', 'G Quy hoạch & Hành chính', 'G Rencana & Admin'),
    'hub.sec.knowledge': row('📚 文集', '📚 Knowledge', '📚 Tri thức', '📚 Pengetahuan'),
    'hub.sec.guide': row('❓ 導覽憲法', '❓ Site Guide', '❓ Hiến pháp điều hướng', '❓ Panduan situs'),

    'hub.sec.versions': row('多语查经', 'Multilingual', 'Đa ngôn ngữ', 'Multibahasa'),
    'hub.sec.tools': row('核心捷徑', 'Tools', 'Lối tắt', 'Pintasan'),
    'hub.sec.route': row('路線圖', 'Route map', 'Lộ trình', 'Peta rute'),
    'hub.sec.commentary': row('釋經參讀', 'Commentary', 'Chú giải', 'Tafsir'),
    'hub.sec.geo': row('地理歷史', 'Geo. Hist.', 'Địa lý · sử', 'Geo. sejarah'),
    'hub.sec.school': row('學校管理', 'School', 'Quản lý trường', 'Sekolah'),
    'hub.sec.course': row('課程註冊', 'Course Reg.', 'Đăng ký khóa', 'Daftar kursus'),
    'hub.sec.lab': row('聖經 AI 學習', 'Lab', 'Học AI Kinh Thánh', 'Lab AI Alkitab'),
    'hub.sec.crm': row('口述預填', 'Prefill', 'Điền trước AI', 'Isi otomatis'),
    'hub.sec.smart': row('智慧事奉', 'Smart', 'Phục vụ thông minh', 'Pelayanan pintar'),
    'hub.sec.prefill': row('📝 口述預填', '📝 Prefill', '📝 Điền trước', '📝 Prefill'),

    'hub.sec.ai.workbench': row('備課創作', 'Workbench', 'Soạn giảng & sáng tạo', 'Workbench'),
    'hub.sec.ai.ministry': row('事工應用', 'Ministry AI', 'AI phục vụ', 'AI pelayanan'),
    'hub.sec.ai.plan': row('規劃落地', 'Plan', 'Quy hoạch', 'Perencanaan'),

    'hub.lang.material': row('語言教材', 'Language tracks', 'Giáo trình ngôn ngữ', 'Materi bahasa'),
  };

  /** path（無 query）或 action → pack key */
  var PATH_KEY = {
    'church_planning/index_plan.html': 'hub.sec.g',
    'hymn_management/dashboard.html': 'hub.sec.f',
    'hymn_management/index.html': 'hub.sec.f',
    'church_ministry/dashboard.html': 'hub.sec.g',
    'church_ministry/_landing/worship.html': 'hub.sec.a',
    'church_ministry/modules/fellowship/small-groups-integrated.html': 'hub.sec.b',
    'church_ministry/modules/education/education-integrated.html': 'hub.sec.c',
    'church_ministry/modules/expansion/outreach-integrated.html': 'hub.sec.d',
    'church_ministry/modules/expansion/outreach-strategy.html': 'hub.sec.d',
    'church_ministry/tools/volunteer_shift/index.html': 'hub.sec.e',
    'knowledge/index.html': 'hub.sec.knowledge',
    'help/site-navigation-guide.html': 'hub.sec.guide',
    'bible_study/_landing/versions.html': 'hub.sec.versions',
    'bible_app/shell/pages/reader-multilang.html': 'hub.sec.versions',
    'bible_study/parallel_mode_v3.html': 'hub.sec.versions',
    'bible_study/_landing/home.html': 'hub.sec.route',
    'bible_study/_landing/tools.html': 'hub.sec.tools',
    'bible_study/comprehensive_exegesis_reader.html': 'hub.sec.commentary',
    'bible_study/_landing/geography_history.html': 'hub.sec.geo',
    'school_management/course_completion.html': 'hub.sec.course',
    'ai_tools/ai_lab_landing.html': 'hub.sec.lab',
    'ai_tools/_landing/home.html': 'hub.sec.route',
    'ai_tools/pages/guide_reading_hub.html': 'hub.sec.ai.workbench',
    'ai_tools/tools/ai_workbench_integrated.html': 'hub.sec.ai.workbench',
    'ai_tools/tools/bible_prompt_generator.html': 'hub.sec.ai.workbench',
    'ai_tools/tools/creative_tools_landing.html': 'hub.sec.ai.workbench',
    'ai_tools/pages/crm_automation_console.html': 'hub.sec.ai.ministry',
    'smart_ministry/console.html': 'hub.sec.ai.ministry',
    'smart_ministry/landing.html': 'hub.sec.ai.ministry',
    'church_planning/index_plan.html': 'hub.sec.ai.plan',
    'church_planning/Church_Governance_SWOT_matrix.html': 'hub.sec.ai.plan',
    'smart_ministry/landing.html': 'hub.sec.smart',
    'ai_tools/dashboard.html': 'hub.sec.lab',
  };

  function pathKey(path) {
    if (!path) return '';
    var p = String(path).split('?')[0].split('#')[0];
    return PATH_KEY[p] || '';
  }

  global.HubChromeI18nPack = P;
  global.HubChromeI18nMap = { PATH_KEY: PATH_KEY, pathKey: pathKey };
})(typeof window !== 'undefined' ? window : global);
