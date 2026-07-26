/**
 * BS 頁面細編號（對照 PAGE_MATURITY_BS.md）
 */
(function (global) {
    'use strict';

    global.BS_PAGE_REGISTRY = {
        'index.html': { id: 'BS-L0-01', label: 'Standalone 殼' },
        'reader.html': { id: 'BS-04', label: '雙欄閱讀' },
        'comprehensive_exegesis_reader.html': { id: 'BS-01', label: '釋經參讀' },
        'parallel_mode_v3.html': { id: 'BS-02', label: '譯本對照' },
        'search_reader.html': { id: 'BS-03', label: '全文搜尋' },
        'data_sources.html': { id: 'BS-09', label: '資料綠燈' },
        '_landing/tools.html': { id: 'BS-07', label: '功能地圖' }
    };

    global.BS_getPageMeta = function (fileName) {
        var base = String(fileName || '').split('/').pop().split('?')[0];
        return global.BS_PAGE_REGISTRY[base] || null;
    };
})(typeof window !== 'undefined' ? window : this);
