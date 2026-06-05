/**
 * =============================================================================
 * 上雲開關 — 小白請先看說明文件（不要只改 true／false 就以為能上雲）
 *   church_ministry/docs/CLOUD_小白上雲.md
 * 後續工程計劃：church_ministry/docs/CLOUD_ROADMAP.md
 * =============================================================================
 *
 * 載入順序建議：
 *   1. cloud_config.js（本檔）
 *   2. cloud_api.js（可選，給工程師接 fetch）
 *   3. church_mock_cloud_provider.js（僅當 USE_MOCK_CLOUD === true）
 *   4. church_data_bridge.js
 */
(function (global) {
    'use strict';

    global.CHURCH_CLOUD_CONFIG = {
        /**
         * false = 本機示範：資料在瀏覽器 localStorage（離線可開、無後端也能用）
         * true  = 必須已有後端 API，且 church_data_bridge.js 已改為會呼叫 fetch
         * ⚠ 沒有後端前請保持 false，否則可能錯誤
         */
        USE_API: false,

        /**
         * 後端 API 根網址，例如 https://你的網域/api/v1
         * 本機 demo：node scripts/church_api_local_server.js → http://127.0.0.1:8787
         */
        API_BASE_URL: '',

        /** true 時要求 ChurchAuth 登入（可與 USE_API 並用） */
        REQUIRE_AUTH: false,

        /**
         * Google Sheets v2 SSOT（需部署 church_ministry/apps_script/CrmSheetsSsot.gs）
         * 與本機快取雙寫：讀取優先 Sheets，寫入同步 append／batch
         */
        USE_SHEETS_SSOT: false,

        /** Apps Script Web App 部署網址（?action=…&format=json） */
        SHEETS_WEB_APP_URL: '',

        /** 除錯：在 Console 印出即將送出的 API 路徑（勿在正式環境長期開啟） */
        DEBUG: false,

        /**
         * true = 使用 Mock 雲端 Persistence（延遲 + 記憶體權威 + 雙寫 localStorage 複本）
         * 須在 church_data_bridge.js 之前載入：church_mock_cloud_provider.js
         * 演示頁：church_ministry/cloud_mock_sync_demo.html
         */
        USE_MOCK_CLOUD: false,

        /** Mock 雲端每次 async 讀寫的模擬延遲（毫秒） */
        MOCK_CLOUD_LATENCY_MS: 450,

        /**
         * 回傳 Bearer token 字串（不要含 "Bearer " 前綴也可，cloud_api.js 會處理）
         * 正式環境多從登入流程寫入 session／cookie 後再讀取
         */
        getAuthHeader: function () {
            if (global.ChurchAuth && typeof global.ChurchAuth.getToken === 'function') {
                return global.ChurchAuth.getToken();
            }
            return null;
        }
    };
})(typeof window !== 'undefined' ? window : this);
