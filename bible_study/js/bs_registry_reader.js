/**
 * BS-H4：詞典／串珠等工具頁 · registry + BibleEngine 載入助手
 */
(function (global) {
    'use strict';

    var EMBED_MAP = {
        bibles: { faith: 'BIBLE_DATA_faith', niv: 'BIBLE_DATA_niv' },
        crossrefs: { faith_crossref: 'CROSSREF_DATA_faith_crossref', cuv_crossref: 'CROSSREF_DATA_cuv_crossref' },
        dictionaries: { bible_dict: 'DICTIONARY_DATA_bible_dict' }
    };

    function registerEmbedded(category, key) {
        var BE = global.BibleEngine;
        if (!BE) return false;
        var gname = EMBED_MAP[category] && EMBED_MAP[category][key];
        if (!gname || !global[gname]) return false;
        var payload = global[gname];
        BE.db[category] = BE.db[category] || {};
        BE.db[category][key] = {
            data: payload,
            name: key,
            format: 'json',
            loaded: true,
            resolvedPath: 'embedded:' + gname
        };
        if (category === 'bibles' && BE._jsonRowsCache) {
            var rows = BE._extractBibleRows ? BE._extractBibleRows(payload) : payload;
            if (Array.isArray(rows) && rows.length) BE._jsonRowsCache[key] = rows;
        }
        return true;
    }

    global.BS_hydrateEmbeddedToolData = function () {
        Object.keys(EMBED_MAP).forEach(function (cat) {
            Object.keys(EMBED_MAP[cat]).forEach(function (key) {
                registerEmbedded(cat, key);
            });
        });
    };

    global.BS_initReaderEngine = async function () {
        var BE = global.BibleEngine;
        if (!BE) throw new Error('BibleEngine required');
        global.BS_hydrateEmbeddedToolData();
        if (!BE.SQL) await BE.checkSQLAvailability();
        return true;
    };

    global.BS_loadRegistryResource = async function (category, key) {
        var BE = global.BibleEngine;
        if (!BE) throw new Error('BibleEngine required');
        await global.BS_initReaderEngine();

        if (registerEmbedded(category, key)) {
            return BE.db[category][key].data;
        }

        var entry = global.BS_getRegistryEntry
            ? global.BS_getRegistryEntry(category, key)
            : ((global.BS_DATA_REGISTRY || {})[category] || []).find(function (e) { return e.key === key; });
        if (!entry) throw new Error('registry missing: ' + category + '/' + key);

        var bucket = BE.db[category] || {};
        if (bucket[key] && bucket[key].loaded) return bucket[key].data;

        var st = await BE.loadEntry(category, entry);
        if (st.status !== 'ok') throw new Error('load failed: ' + key + ' (' + category + ')');
        return BE.db[category][key].data;
    };

    global.BS_readerLoadHint = function () {
        if (typeof global.bible100IsFileProtocol === 'function' && global.bible100IsFileProtocol()) {
            return '若載入失敗：請確認本機 data/ 資料夾存在；file:// 下 SQLite／JSON 需瀏覽器允許讀取本機檔。亦可改用本機 HTTP（專案根執行 python -m http.server 8765）。';
        }
        return '請確認 data/ 內對應 JSON 或 .db 已就緒，並以本機 HTTP 或含 data 的部署環境開啟。';
    };

})(typeof window !== 'undefined' ? window : this);
