/**
 * Bible Study 研讀狀態中心 - State.js
 * 記錄 book, chapter, verse, mode，支援聯動、Deep Linking
 * 版本：1.0 | 信徒研習桌核心
 */
(function(global) {
    'use strict';

    var state = {
        book: 1,
        chapter: 1,
        verse: 1,
        mode: 'read',      // 'read' | 'study' | 'compare'
        searchQuery: '',
        bookName: '創世記'  // 中文名，供顯示
    };

    var listeners = [];

    // 書卷 ID → 中文名對照（簡版，完整版可用 BookResolver）
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

    /**
     * 更新狀態並通知所有監聽者
     * @param {Object} updates - { book?, chapter?, verse?, mode?, searchQuery?, bookName? }
     */
    function change(updates) {
        var changed = false;
        if (updates.book !== undefined && updates.book !== state.book) {
            state.book = updates.book;
            state.bookName = BOOK_NAMES[updates.book] || state.bookName;
            changed = true;
        }
        if (updates.chapter !== undefined && updates.chapter !== state.chapter) {
            state.chapter = updates.chapter;
            changed = true;
        }
        if (updates.verse !== undefined && updates.verse !== state.verse) {
            state.verse = updates.verse;
            changed = true;
        }
        if (updates.mode !== undefined && updates.mode !== state.mode) {
            state.mode = updates.mode;
            changed = true;
        }
        if (updates.searchQuery !== undefined) {
            state.searchQuery = updates.searchQuery;
            changed = true;
        }
        if (updates.bookName !== undefined) {
            state.bookName = updates.bookName;
            changed = true;
        }
        if (changed) {
            emit();
        }
    }

    /**
     * 從書名設定書卷（支援 BookResolver 或手動對照）
     */
    function setBookByName(name) {
        var id = null;
        if (global.BookResolver && global.BookResolver.normalizeBookName) {
            id = global.BookResolver.normalizeBookName(name);
        }
        if (id == null) {
            var rev = {};
            Object.keys(BOOK_NAMES).forEach(function(k) {
                rev[BOOK_NAMES[k]] = parseInt(k, 10);
            });
            id = rev[name];
        }
        if (id != null) {
            change({ book: id, bookName: BOOK_NAMES[id] || name });
            return id;
        }
        return null;
    }

    function emit() {
        var payload = {
            action: 'stateChange',
            state: { book: state.book, chapter: state.chapter, verse: state.verse, mode: state.mode, bookName: state.bookName, searchQuery: state.searchQuery }
        };
        listeners.forEach(function(fn) { fn(payload); });
        return state;
    }

    /**
     * 訂閱狀態變更
     * @param {Function} fn - (payload) => {}
     */
    function subscribe(fn) {
        if (typeof fn === 'function') listeners.push(fn);
    }

    /**
     * 取得當前狀態（副本）
     */
    function get() {
        return { book: state.book, chapter: state.chapter, verse: state.verse, mode: state.mode, bookName: state.bookName, searchQuery: state.searchQuery };
    }

    /**
     * 從 URL 參數解析狀態
     */
    function parseFromUrl() {
        var params = new URLSearchParams(location.search);
        var book = parseInt(params.get('book'), 10);
        var chapter = parseInt(params.get('ch') || params.get('chapter'), 10);
        var verse = parseInt(params.get('v') || params.get('verse'), 10);
        var mode = params.get('mode') || 'read';
        var q = params.get('q') || params.get('search') || '';
        if (!isNaN(book) && book >= 1 && book <= 66) change({ book: book });
        if (!isNaN(chapter) && chapter >= 1) change({ chapter: chapter });
        if (!isNaN(verse) && verse >= 1) change({ verse: verse });
        if (mode) change({ mode: mode });
        if (q) change({ searchQuery: q });
    }

    /**
     * 更新瀏覽器 URL（不重新載入）
     */
    function pushUrl() {
        var s = get();
        var params = new URLSearchParams();
        if (s.book) params.set('book', s.book);
        if (s.chapter) params.set('ch', s.chapter);
        if (s.verse) params.set('v', s.verse);
        if (s.mode) params.set('mode', s.mode);
        if (s.searchQuery) params.set('q', s.searchQuery);
        var qs = params.toString();
        var url = qs ? (location.pathname + '?' + qs) : location.pathname;
        if (history.replaceState) history.replaceState({}, '', url);
    }

    var StudyState = {
        change: change,
        setBookByName: setBookByName,
        subscribe: subscribe,
        get: get,
        parseFromUrl: parseFromUrl,
        pushUrl: pushUrl,
        BOOK_NAMES: BOOK_NAMES
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = StudyState;
    } else {
        global.StudyState = StudyState;
    }
})(typeof window !== 'undefined' ? window : this);
