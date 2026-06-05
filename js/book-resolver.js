/**
 * 寬容書名解析器 - Bible100
 * 將各種書名輸入（簡稱、別名、錯字、中英）統一解析為 BookID (1-66)
 * 版本：1.0 | 用途：搜尋、跳轉、Context Sync
 */
(function(global) {
    'use strict';

    // 完整 66 卷對照：中文名 → BookID
    const BOOK_NAME_TO_ID = {
        '創世記': 1, '出埃及記': 2, '利未記': 3, '民數記': 4, '申命記': 5,
        '約書亞記': 6, '士師記': 7, '路得記': 8, '撒母耳記上': 9, '撒母耳記下': 10,
        '列王紀上': 11, '列王紀下': 12, '歷代志上': 13, '歷代志下': 14, '以斯拉記': 15,
        '尼希米記': 16, '以斯帖記': 17, '約伯記': 18, '詩篇': 19, '箴言': 20,
        '傳道書': 21, '雅歌': 22, '以賽亞書': 23, '耶利米書': 24, '耶利米哀歌': 25,
        '以西結書': 26, '但以理書': 27, '何西阿書': 28, '約珥書': 29, '阿摩司書': 30,
        '俄巴底亞書': 31, '約拿書': 32, '彌迦書': 33, '那鴻書': 34, '哈巴谷書': 35,
        '西番雅書': 36, '哈該書': 37, '撒迦利亞書': 38, '瑪拉基書': 39,
        '馬太福音': 40, '馬可福音': 41, '路加福音': 42, '約翰福音': 43, '使徒行傳': 44,
        '羅馬書': 45, '哥林多前書': 46, '哥林多後書': 47, '加拉太書': 48, '以弗所書': 49,
        '腓立比書': 50, '歌羅西書': 51, '帖撒羅尼迦前書': 52, '帖撒羅尼迦後書': 53,
        '提摩太前書': 54, '提摩太後書': 55, '提多書': 56, '腓利門書': 57,
        '希伯來書': 58, '雅各書': 59, '彼得前書': 60, '彼得後書': 61,
        '約翰一書': 62, '約翰二書': 63, '約翰三書': 64, '猶大書': 65, '啟示錄': 66
    };

    // 錯字 / 別名 → 正確 BookID（自動修正）
    const TYPO_AND_ALIAS = {
        '俯巴底亞書': 31,  '創': 1, '創世記': 1, 'Genesis': 1, 'Gen': 1,
        '獻大書': 65,       '出': 2, '出埃及記': 2, 'Exodus': 2, 'Ex': 2,
        '利': 3, '利未記': 3, 'Leviticus': 3, 'Lev': 3,
        '民': 4, '民數記': 4, 'Numbers': 4, 'Num': 4,
        '申': 5, '申命記': 5, 'Deuteronomy': 5, 'Deut': 5,
        '俄': 31, '俄巴底亞書': 31, 'Obadiah': 31, 'Obad': 31,
        '猶': 65, '猶大書': 65, 'Jude': 65, 'Jud': 65,
        '啟': 66, '啟示錄': 66, 'Revelation': 66, 'Rev': 66
    };

    // BookID → 中文正式名稱（反向查詢）
    const ID_TO_NAME = {};
    Object.keys(BOOK_NAME_TO_ID).forEach(function(name) {
        ID_TO_NAME[BOOK_NAME_TO_ID[name]] = name;
    });

    /**
     * 將任意書名輸入解析為 BookID (1-66)
     * @param {string} input - 書名、簡稱、英文、錯字等
     * @returns {number|null} BookID 或 null
     */
    function normalizeBookName(input) {
        if (input == null || input === '') return null;
        var s = String(input).trim();
        if (TYPO_AND_ALIAS[s] !== undefined) return TYPO_AND_ALIAS[s];
        if (BOOK_NAME_TO_ID[s] !== undefined) return BOOK_NAME_TO_ID[s];
        return null;
    }

    /**
     * 取得 BookID 對應的中文正式書名
     * @param {number} bookId
     * @returns {string|null}
     */
    function getBookNameById(bookId) {
        return ID_TO_NAME[bookId] || null;
    }

    /**
     * 取得完整的書卷對照表（供 getBookId 等 legacy 相容）
     * @returns {Object} 書名 → BookID
     */
    function getBookNameToIdMap() {
        var map = {};
        Object.keys(BOOK_NAME_TO_ID).forEach(function(k) {
            map[k] = BOOK_NAME_TO_ID[k];
        });
        Object.keys(TYPO_AND_ALIAS).forEach(function(k) {
            if (!map[k]) map[k] = TYPO_AND_ALIAS[k];
        });
        return map;
    }

    // 導出
    var BookResolver = {
        normalizeBookName: normalizeBookName,
        getBookNameById: getBookNameById,
        getBookNameToIdMap: getBookNameToIdMap,
        BOOK_NAME_TO_ID: BOOK_NAME_TO_ID,
        ID_TO_NAME: ID_TO_NAME
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BookResolver;
    } else {
        global.BookResolver = BookResolver;
    }
})(typeof window !== 'undefined' ? window : this);
