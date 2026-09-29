/** Prompt 護欄 SSOT — 無 API key，複製到外部 AI */
(function (global) {
  var GUARD_ZH =
    '【請遵守】必引用經文、不編造經文、不宣稱屬靈權威、不取代牧者/老師、不確定時明說需查證。';
  var GUARD_EN =
    '【Rules】Cite Scripture, do not invent verses, no spiritual authority claims, do not replace pastors/teachers; say when unsure.';
  var GUARD_VI =
    '【Quy tắc】Trích Kinh Thánh, không bịa câu, không tự xưng quyền thuộc linh, không thay mục sư; nói rõ khi chưa chắc.';
  var GUARD_ID =
    '【Aturan】Kutip Alkitab, jangan mengarang ayat, jangan klaim otoritas rohani, jangan ganti gembala; akui ketidakpastian.';

  function guard(locale) {
    var map = { 'zh-Hant': GUARD_ZH, en: GUARD_EN, vi: GUARD_VI, id: GUARD_ID };
    return map[locale] || GUARD_ZH;
  }

  function generateQnaPrompt(opts) {
    opts = opts || {};
    var loc = opts.locale || 'zh-Hant';
    var ref = opts.ref || '';
    var question = opts.question || '';
    var persona = opts.persona || 'adult';
    var lines = [
      guard(loc),
      '',
      loc === 'zh-Hant' ? '【牧養問答草稿】' : '【Pastoral Q&A draft】',
      (loc === 'zh-Hant' ? '經文：' : 'Passage: ') + ref,
      (loc === 'zh-Hant' ? '對象：' : 'Audience: ') + persona,
      (loc === 'zh-Hant' ? '問題：' : 'Question: ') + question,
      '',
      loc === 'zh-Hant'
        ? '請用白話回答：①經文摘要 ②背景 ③常見誤解 ④生活應用 ⑤需牧者覆核事項'
        : 'Answer plainly: summary, background, misconceptions, application, items for pastor review.',
    ];
    return lines.join('\n');
  }

  function generatePrayerPrompt(opts) {
    opts = opts || {};
    var loc = opts.locale || 'zh-Hant';
    var ref = opts.ref || '';
    var situation = opts.situation || '';
    return [
      guard(loc),
      '',
      loc === 'zh-Hant' ? '【代禱伴侶草稿】' : '【Prayer companion draft】',
      (loc === 'zh-Hant' ? '經文：' : 'Passage: ') + ref,
      (loc === 'zh-Hant' ? '處境：' : 'Situation: ') + situation,
      '',
      loc === 'zh-Hant'
        ? '請產出 30 秒禱告大綱（敬拜、認罪、代求、交託）。禁止假裝「神對你說」。'
        : 'Give a 30-second prayer outline. Do not claim God spoke directly to the user.',
    ].join('\n');
  }

  global.B100PromptGuardrails = {
    guard: guard,
    generateQnaPrompt: generateQnaPrompt,
    generatePrayerPrompt: generatePrayerPrompt,
  };
})(typeof window !== 'undefined' ? window : global);
