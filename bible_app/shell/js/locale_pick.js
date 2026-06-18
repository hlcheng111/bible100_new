/** 依 ?locale= 從資料列選欄位（titleZh / titleEn …） */
(function (global) {
  var SUFFIX = { 'zh-Hant': 'Zh', en: 'En', vi: 'Vi', id: 'Id' };

  function getLocale() {
    var q = new URLSearchParams(location.search);
    if (q.get('locale')) return q.get('locale');
    if (global.PageLocale && global.PageLocale.getLocale) return global.PageLocale.getLocale();
    return 'zh-Hant';
  }

  function pick(row, base) {
    if (!row) return '';
    var loc = getLocale();
    var suf = SUFFIX[loc] || 'Zh';
    return row[base + suf] || row[base + 'Zh'] || row[base + 'En'] || '';
  }

  function books() {
    if (global.B100_DATA && global.B100_DATA.books && global.B100_DATA.books.books) {
      return global.B100_DATA.books.books;
    }
    return [];
  }

  function bookById(id) {
    var n = parseInt(id, 10);
    return books().find(function (b) { return b.id === n; }) || null;
  }

  function bookName(bookId, loc) {
    var b = typeof bookId === 'object' ? bookId : bookById(bookId);
    if (!b) return '';
    loc = loc || getLocale();
    if (loc === 'vi' && b.nameVi) return b.nameVi;
    if (loc === 'id' && b.nameId) return b.nameId;
    if (loc === 'en' && b.nameEn) return b.nameEn;
    return b.nameZh || b.nameEn || '';
  }

  function bookChapterRef(bookId, chapter, loc) {
    var name = bookName(bookId, loc);
    var ch = parseInt(chapter, 10) || 1;
    loc = loc || getLocale();
    if (loc === 'en') return name + ' ' + ch;
    if (loc === 'vi' || loc === 'id') return name + ' ' + ch;
    return name + ' ' + ch + ' 章';
  }

  function pickRef(row) {
    var loc = getLocale();
    if (loc === 'en' && row.refEn) return row.refEn;
    if (loc === 'vi' && row.refVi) return row.refVi;
    if (loc === 'id' && row.refId) return row.refId;
    return row.refZh || row.refEn || '';
  }

  global.B100LocalePick = {
    getLocale: getLocale,
    pick: pick,
    pickRef: pickRef,
    bookName: bookName,
    bookChapterRef: bookChapterRef,
    bookById: bookById,
  };
})(window);
