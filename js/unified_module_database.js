/**
 * Bible100 統一模組資料庫加載器
 * 
 * 用途：為 Church Ministry, School Management, Smart Ministry 提供統一的資料庫訪問接口
 * 特點：支援 SQLite 和 JSON 雙重模式，自動錯誤處理和備用方案
 * 版本：1.0
 * 日期：2025-10-09
 */

class UnifiedModuleDatabase {
    /**
     * 建構函數
     * @param {string} moduleName - 模組名稱 ('church', 'school', 'smart_ministry')
     */
    constructor(moduleName) {
        this.moduleName = moduleName;
        // 智能路徑檢測
        this.basePath = this.detectBasePath(moduleName);
        this.storagePrefix = `bible100_${moduleName}_`;
        this.db = null;
        this.useJSON = false; // 是否使用 JSON 模式
        
        console.log(`✅ UnifiedModuleDatabase 初始化：${moduleName}，路徑：${this.basePath}`);
    }

    /**
     * 智能檢測基礎路徑
     */
    detectBasePath(moduleName) {
        // 獲取當前頁面的路徑
        const currentPath = window.location.pathname;
        
        // 計算相對於 bible100_new 根目錄的深度
        const pathParts = currentPath.split('/').filter(part => part && part !== 'bible100_new');
        
        // 移除文件名，只保留目錄部分
        if (pathParts.length > 0 && pathParts[pathParts.length - 1].includes('.html')) {
            pathParts.pop();
        }
        
        // 根據深度決定路徑
        let prefix = '';
        if (pathParts.length === 0) {
            // 在根目錄
            prefix = '';
        } else if (pathParts.length === 1) {
            // 在一級目錄（如 school_management/）
            prefix = '../';
        } else if (pathParts.length === 2) {
            // 在二級目錄（如 school_management/students/）
            prefix = '../../';
        } else {
            // 更深的目錄
            prefix = '../'.repeat(pathParts.length);
        }
        
        const finalPath = `${prefix}data/${moduleName}/`;
        console.log(`📍 路徑檢測：當前=${currentPath}, 深度=${pathParts.length}, 基礎路徑=${finalPath}`);
        
        return finalPath;
    }

    /**
     * 載入資料庫（SQLite 優先，JSON 備用）
     * @param {string} dbName - 資料庫文件名（如 'students.db'）
     * @param {string} jsonFallback - JSON 備用文件名（如 'students.json'）
     */
    async loadDatabase(dbName, jsonFallback = null) {
        try {
            // 嘗試載入 SQLite
            const dbPath = this.basePath + dbName;
            this.db = await this.loadSQLite(dbPath);
            this.useJSON = false;
            console.log(`✅ SQLite 載入成功：${dbPath}`);
            return { success: true, type: 'sqlite', db: this.db };
        } catch (error) {
            console.warn(`⚠️ SQLite 載入失敗，嘗試 JSON 備用：${error.message}`);
            
            // 使用 JSON 備用
            if (jsonFallback) {
                try {
                    const jsonPath = this.basePath + jsonFallback;
                    const data = await this.loadJSON(jsonPath);
                    this.db = data;
                    this.useJSON = true;
                    console.log(`✅ JSON 載入成功：${jsonPath}`);
                    return { success: true, type: 'json', data: data };
                } catch (jsonError) {
                    console.error(`❌ JSON 載入也失敗：${jsonError.message}`);
                }
            }
            
            // 都失敗，使用 localStorage
            console.log(`📦 使用 localStorage 作為最終備用`);
            this.useJSON = true;
            return { success: true, type: 'localStorage' };
        }
    }

    /**
     * 載入 SQLite 資料庫
     * @param {string} dbPath - 資料庫路徑
     */
    async loadSQLite(dbPath) {
        // 檢查是否有 sql.js
        if (typeof initSqlJs === 'undefined') {
            throw new Error('sql.js 未載入');
        }

        const SQL = await initSqlJs({
            locateFile: file => `../bible_study/js/${file}`
        });

        const response = await fetch(dbPath);
        if (!response.ok) {
            throw new Error(`無法載入資料庫：${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const db = new SQL.Database(new Uint8Array(buffer));
        
        return db;
    }

    /**
     * 載入 JSON 文件
     * @param {string} jsonPath - JSON 文件路徑
     */
    async loadJSON(jsonPath) {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`無法載入 JSON：${response.status}`);
        }
        return await response.json();
    }

    /**
     * 查詢資料
     * @param {string} table - 表名
     * @param {Object} conditions - 查詢條件
     * @param {Object} options - 查詢選項
     */
    async queryData(table, conditions = {}, options = {}) {
        if (this.useJSON) {
            return this.queryFromJSON(table, conditions, options);
        } else {
            return this.queryFromSQLite(table, conditions, options);
        }
    }

    /**
     * 從 SQLite 查詢
     */
    queryFromSQLite(table, conditions, options) {
        if (!this.db) {
            throw new Error('資料庫未載入');
        }

        let sql = `SELECT * FROM ${table}`;
        const params = [];

        // 添加條件
        if (Object.keys(conditions).length > 0) {
            const whereClauses = [];
            for (const [key, value] of Object.entries(conditions)) {
                whereClauses.push(`${key} = ?`);
                params.push(value);
            }
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        // 添加排序
        if (options.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
        }

        // 添加限制
        if (options.limit) {
            sql += ` LIMIT ${options.limit}`;
            if (options.offset) {
                sql += ` OFFSET ${options.offset}`;
            }
        }

        try {
            const stmt = this.db.prepare(sql);
            stmt.bind(params);
            
            const results = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            
            return results;
        } catch (error) {
            console.error('SQL 查詢失敗:', error);
            return [];
        }
    }

    /**
     * 從 JSON 或 localStorage 查詢
     */
    queryFromJSON(table, conditions, options) {
        let data = [];

        // 從 localStorage 或 JSON 數據獲取
        if (this.db && this.db[table]) {
            data = Array.isArray(this.db[table]) ? this.db[table] : [this.db[table]];
        } else {
            // 從 localStorage 獲取
            const stored = localStorage.getItem(`${this.storagePrefix}${table}`);
            if (stored) {
                data = JSON.parse(stored);
            }
        }

        // 應用條件過濾
        if (Object.keys(conditions).length > 0) {
            data = data.filter(item => {
                return Object.entries(conditions).every(([key, value]) => {
                    return item[key] === value;
                });
            });
        }

        // 應用排序
        if (options.orderBy) {
            const [field, direction = 'ASC'] = options.orderBy.split(' ');
            data.sort((a, b) => {
                if (direction.toUpperCase() === 'DESC') {
                    return b[field] > a[field] ? 1 : -1;
                }
                return a[field] > b[field] ? 1 : -1;
            });
        }

        // 應用限制
        if (options.limit) {
            const offset = options.offset || 0;
            data = data.slice(offset, offset + options.limit);
        }

        return data;
    }

    /**
     * 保存資料
     * @param {string} table - 表名
     * @param {Object} data - 要保存的資料
     */
    async saveData(table, data) {
        if (this.useJSON) {
            return this.saveToLocalStorage(table, data);
        } else {
            console.warn('SQLite 模式不支援寫入，自動切換到 localStorage');
            return this.saveToLocalStorage(table, data);
        }
    }

    /**
     * 保存到 localStorage
     */
    saveToLocalStorage(table, data) {
        try {
            // 獲取現有資料
            const existing = this.queryFromJSON(table, {}, {});
            
            // 生成 ID
            if (!data.id) {
                data.id = this.generateID();
            }
            
            // 添加時間戳
            data.created_at = data.created_at || new Date().toISOString();
            data.updated_at = new Date().toISOString();
            
            // 檢查是否已存在
            const index = existing.findIndex(item => item.id === data.id);
            if (index !== -1) {
                // 更新現有記錄
                existing[index] = { ...existing[index], ...data };
            } else {
                // 添加新記錄
                existing.push(data);
            }
            
            // 保存到 localStorage
            localStorage.setItem(`${this.storagePrefix}${table}`, JSON.stringify(existing));
            
            console.log(`✅ 資料已保存：${table} - ID: ${data.id}`);
            return { success: true, id: data.id };
        } catch (error) {
            console.error('保存資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 刪除資料
     * @param {string} table - 表名
     * @param {string} id - 記錄 ID
     */
    async deleteData(table, id) {
        try {
            const existing = this.queryFromJSON(table, {}, {});
            const filtered = existing.filter(item => item.id !== id);
            
            localStorage.setItem(`${this.storagePrefix}${table}`, JSON.stringify(filtered));
            
            console.log(`✅ 資料已刪除：${table} - ID: ${id}`);
            return { success: true };
        } catch (error) {
            console.error('刪除資料失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 生成唯一 ID
     */
    generateID() {
        return `${this.moduleName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 獲取統計資訊
     * @param {string} table - 表名
     */
    async getStatistics(table) {
        const data = await this.queryData(table, {}, {});
        return {
            total: data.length,
            table: table,
            module: this.moduleName
        };
    }

    /**
     * 備份資料
     */
    async backupData() {
        const backup = {
            module: this.moduleName,
            timestamp: new Date().toISOString(),
            data: {}
        };

        // 獲取所有表的資料
        const tables = this.getStoredTables();
        for (const table of tables) {
            backup.data[table] = await this.queryData(table, {}, {});
        }

        return backup;
    }

    /**
     * 恢復資料
     */
    async restoreData(backupData) {
        try {
            for (const [table, records] of Object.entries(backupData.data)) {
                localStorage.setItem(`${this.storagePrefix}${table}`, JSON.stringify(records));
            }
            console.log(`✅ 資料恢復成功：${this.moduleName}`);
            return { success: true };
        } catch (error) {
            console.error('資料恢復失敗:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 獲取所有已存儲的表
     */
    getStoredTables() {
        const tables = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                const tableName = key.replace(this.storagePrefix, '');
                tables.push(tableName);
            }
        }
        return tables;
    }

    /**
     * 清空表
     */
    async clearTable(table) {
        localStorage.removeItem(`${this.storagePrefix}${table}`);
        console.log(`✅ 表已清空：${table}`);
        return { success: true };
    }
}

// 匯出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedModuleDatabase;
} else {
    window.UnifiedModuleDatabase = UnifiedModuleDatabase;
}

// 創建全局實例（方便使用）
if (typeof window !== 'undefined') {
    // 延遲創建全局實例，確保 DOM 已載入
    function initGlobalInstances() {
        window.churchDB = new UnifiedModuleDatabase('church');
        window.schoolDB = new UnifiedModuleDatabase('school');
        window.smartMinistryDB = new UnifiedModuleDatabase('smart_ministry');
        
        console.log('✅ 統一模組資料庫系統已初始化');
        console.log('📚 可用實例：churchDB, schoolDB, smartMinistryDB');
    }
    
    // 立即執行或等待 DOM 載入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalInstances);
    } else {
        initGlobalInstances();
    }
}

