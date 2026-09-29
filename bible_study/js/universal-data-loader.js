/**
 * @deprecated BS-W1：請改載入 bible_version_registry.js + BibleEngine.js。
 * 本檔保留給舊頁相容；若 BibleEngine 已存在則不重複初始化。
 */
(function (global) {
    'use strict';
    if (global.BibleEngine && global.universalDataLoader && global.universalDataLoader.initialize) {
        console.log('✅ universal-data-loader.js → BibleEngine（已合併）');
        return;
    }
    console.warn('⚠️ 請在 universal-data-loader.js 之前載入 js/bible_version_registry.js 與 js/BibleEngine.js');
})(typeof window !== 'undefined' ? window : this);
