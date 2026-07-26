/**
 * BS-H4：詞典／串珠等工具頁 · registry + BibleEngine 載入助手
 */
(function (global) {
    'use strict';

    global.BS_loadRegistryResource = async function (category, key) {
        var BE = global.BibleEngine;
        if (!BE) throw new Error('BibleEngine required');
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

})(typeof window !== 'undefined' ? window : this);
