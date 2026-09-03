/**
 * BS-W3：聖經研讀 ↔ 難題 Q&A 同章深連
 */
(function (global) {
    'use strict';

    var BOOK_NAMES = {
        1: '創世記', 2: '出埃及記', 3: '利未記', 4: '民數記', 5: '申命記',
        6: '約書亞記', 7: '士師記', 8: '路得記', 9: '撒母耳記上', 10: '撒母耳記下',
        11: '列王紀上', 12: '列王紀下', 13: '歷代志上', 14: '歷代志下',
        15: '以斯拉記', 16: '尼希米記', 17: '以斯帖記', 18: '約伯記',
        19: '詩篇', 20: '箴言', 21: '傳道書', 22: '雅歌',
        23: '以賽亞書', 24: '耶利米書', 25: '耶利米哀歌', 26: '以西結書', 27: '但以理書',
        28: '何西阿書', 29: '約珥書', 30: '阿摩司書', 31: '俄巴底亞書', 32: '約拿書',
        33: '彌迦書', 34: '那鴻書', 35: '哈巴谷書', 36: '西番雅書', 37: '哈該書',
        38: '撒迦利亞書', 39: '瑪拉基書',
        40: '馬太福音', 41: '馬可福音', 42: '路加福音', 43: '約翰福音', 44: '使徒行傳',
        45: '羅馬書', 46: '哥林多前書', 47: '哥林多後書', 48: '加拉太書', 49: '以弗所書',
        50: '腓立比書', 51: '歌羅西書', 52: '帖撒羅尼迦前書', 53: '帖撒羅尼迦後書',
        54: '提摩太前書', 55: '提摩太後書', 56: '提多書', 57: '腓利門書',
        58: '希伯來書', 59: '雅各書', 60: '彼得前書', 61: '彼得後書',
        62: '約翰一書', 63: '約翰二書', 64: '約翰三書', 65: '猶大書', 66: '啟示錄'
    };

    function bookName(bookId, fallback) {
        if (fallback) return fallback;
        if (global.StudyState && global.StudyState.BOOK_NAMES && global.StudyState.BOOK_NAMES[bookId]) {
            return global.StudyState.BOOK_NAMES[bookId];
        }
        return BOOK_NAMES[bookId] || ('書卷' + bookId);
    }

    /**
     * @param {number} bookId 1–66
     * @param {number} chapter
     * @param {object} opts { bookName, src, cat, base }
     */
    function buildQnaUrl(bookId, chapter, opts) {
        opts = opts || {};
        var id = parseInt(bookId, 10) || 1;
        var ch = parseInt(chapter, 10) || 1;
        var name = bookName(id, opts.bookName);
        var cat = opts.cat || (id >= 40 ? 'A_NT' : 'A_OT');
        var src = opts.src || (id >= 40 ? 'wellsofgrace_chen_nt' : 'wellsofgrace_chen_ot');
        var q = name + ' ' + ch;
        var base = opts.base || '../qna/index.html';
        var params = new URLSearchParams();
        params.set('cat', cat);
        params.set('src', src);
        params.set('book', name);
        params.set('chapter', String(ch));
        params.set('q', q);
        return base + '?' + params.toString();
    }

    function resolveFromPage() {
        var params = new URLSearchParams(location.search);
        var bookNameParam = params.get('book');
        var chapter = parseInt(params.get('chapter') || params.get('ch'), 10) || 1;
        var bookId = null;
        if (bookNameParam && global.StudyState && global.StudyState.setBookByName) {
            bookId = global.StudyState.setBookByName(decodeURIComponent(bookNameParam));
        }
        if (bookId == null && global.StudyState) {
            var s = global.StudyState.get();
            bookId = s.book;
            chapter = s.chapter || chapter;
            bookNameParam = s.bookName;
        }
        if (bookId == null) bookId = 1;
        return { bookId: bookId, chapter: chapter, bookName: bookNameParam || bookName(bookId) };
    }

    global.BS_QnaBridge = {
        buildQnaUrl: buildQnaUrl,
        resolveFromPage: resolveFromPage,
        BOOK_NAMES: BOOK_NAMES
    };
})(typeof window !== 'undefined' ? window : this);
