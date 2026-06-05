/**
 * Bible100 简单数据库系统
 * 
 * 基于Church Ministry成功模式
 * 特点：
 * 1. 使用localStorage作为数据库
 * 2. JSON格式存储，易于导出
 * 3. 完整的CRUD操作
 * 4. 内置报表生成功能
 * 5. 零依赖，纯JavaScript
 * 
 * 版本：1.0
 * 日期：2025-01-16
 */

class SimpleDatabaseSystem {
    constructor(databaseName = 'bible100_db') {
        this.dbName = databaseName;
        this.tables = new Map();
        this.init();
    }

    /**
     * 初始化数据库
     */
    init() {
        this.loadFromStorage();
        console.log(`✅ 数据库系统初始化完成: ${this.dbName}`);
    }

    /**
     * 从localStorage加载数据
     */
    loadFromStorage() {
        try {
            const storedData = localStorage.getItem(this.dbName);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.tables = new Map(Object.entries(data));
                console.log(`📦 从存储加载 ${this.tables.size} 个表`);
            } else {
                console.log('📝 创建新数据库');
            }
        } catch (error) {
            console.error('❌ 加载数据库失败:', error);
            this.tables = new Map();
        }
    }

    /**
     * 保存到localStorage
     */
    saveToStorage() {
        try {
            const data = Object.fromEntries(this.tables);
            localStorage.setItem(this.dbName, JSON.stringify(data));
            console.log('💾 数据库已保存');
        } catch (error) {
            console.error('❌ 保存数据库失败:', error);
        }
    }

    /**
     * 创建表
     */
    createTable(tableName, schema = {}) {
        if (!this.tables.has(tableName)) {
            this.tables.set(tableName, {
                schema: schema,
                data: [],
                nextId: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            this.saveToStorage();
            console.log(`✅ 创建表: ${tableName}`);
            return true;
        }
        console.log(`⚠️ 表已存在: ${tableName}`);
        return false;
    }

    /**
     * 插入数据
     */
    insert(tableName, record) {
        if (!this.tables.has(tableName)) {
            this.createTable(tableName);
        }

        const table = this.tables.get(tableName);
        const newRecord = {
            id: table.nextId++,
            ...record,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        table.data.push(newRecord);
        table.updatedAt = new Date().toISOString();
        this.saveToStorage();

        console.log(`✅ 插入记录到 ${tableName}: ID ${newRecord.id}`);
        return newRecord;
    }

    /**
     * 查询数据
     */
    select(tableName, conditions = {}) {
        if (!this.tables.has(tableName)) {
            console.log(`❌ 表不存在: ${tableName}`);
            return [];
        }

        const table = this.tables.get(tableName);
        let results = table.data;

        // 应用过滤条件
        if (Object.keys(conditions).length > 0) {
            results = results.filter(record => {
                return Object.entries(conditions).every(([key, value]) => {
                    if (typeof value === 'string') {
                        return record[key] && record[key].toString().toLowerCase().includes(value.toLowerCase());
                    }
                    return record[key] === value;
                });
            });
        }

        console.log(`🔍 查询 ${tableName}: 找到 ${results.length} 条记录`);
        return results;
    }

    /**
     * 更新数据
     */
    update(tableName, id, updates) {
        if (!this.tables.has(tableName)) {
            console.log(`❌ 表不存在: ${tableName}`);
            return false;
        }

        const table = this.tables.get(tableName);
        const recordIndex = table.data.findIndex(record => record.id === id);

        if (recordIndex === -1) {
            console.log(`❌ 记录不存在: ID ${id}`);
            return false;
        }

        // 更新记录
        table.data[recordIndex] = {
            ...table.data[recordIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        table.updatedAt = new Date().toISOString();
        this.saveToStorage();

        console.log(`✅ 更新记录: ${tableName} ID ${id}`);
        return true;
    }

    /**
     * 删除数据
     */
    delete(tableName, id) {
        if (!this.tables.has(tableName)) {
            console.log(`❌ 表不存在: ${tableName}`);
            return false;
        }

        const table = this.tables.get(tableName);
        const recordIndex = table.data.findIndex(record => record.id === id);

        if (recordIndex === -1) {
            console.log(`❌ 记录不存在: ID ${id}`);
            return false;
        }

        table.data.splice(recordIndex, 1);
        table.updatedAt = new Date().toISOString();
        this.saveToStorage();

        console.log(`✅ 删除记录: ${tableName} ID ${id}`);
        return true;
    }

    /**
     * 获取表信息
     */
    getTableInfo(tableName) {
        if (!this.tables.has(tableName)) {
            return null;
        }

        const table = this.tables.get(tableName);
        return {
            name: tableName,
            recordCount: table.data.length,
            schema: table.schema,
            createdAt: table.createdAt,
            updatedAt: table.updatedAt
        };
    }

    /**
     * 获取所有表
     */
    getAllTables() {
        const tables = [];
        for (const [name, table] of this.tables) {
            tables.push({
                name: name,
                recordCount: table.data.length,
                createdAt: table.createdAt,
                updatedAt: table.updatedAt
            });
        }
        return tables;
    }

    /**
     * 清空表
     */
    truncateTable(tableName) {
        if (!this.tables.has(tableName)) {
            console.log(`❌ 表不存在: ${tableName}`);
            return false;
        }

        const table = this.tables.get(tableName);
        table.data = [];
        table.nextId = 1;
        table.updatedAt = new Date().toISOString();
        this.saveToStorage();

        console.log(`🗑️ 清空表: ${tableName}`);
        return true;
    }

    /**
     * 删除表
     */
    dropTable(tableName) {
        if (this.tables.has(tableName)) {
            this.tables.delete(tableName);
            this.saveToStorage();
            console.log(`🗑️ 删除表: ${tableName}`);
            return true;
        }
        console.log(`❌ 表不存在: ${tableName}`);
        return false;
    }

    /**
     * 导出数据
     */
    exportData(tableName = null) {
        let data;
        if (tableName) {
            if (!this.tables.has(tableName)) {
                console.log(`❌ 表不存在: ${tableName}`);
                return null;
            }
            data = {
                [tableName]: this.tables.get(tableName)
            };
        } else {
            data = Object.fromEntries(this.tables);
        }

        const exportData = {
            database: this.dbName,
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: data
        };

        console.log(`📤 导出数据: ${tableName || '所有表'}`);
        return exportData;
    }

    /**
     * 导入数据
     */
    importData(importData) {
        try {
            if (importData.data) {
                for (const [tableName, tableData] of Object.entries(importData.data)) {
                    this.tables.set(tableName, tableData);
                }
                this.saveToStorage();
                console.log(`📥 导入数据成功: ${Object.keys(importData.data).length} 个表`);
                return true;
            }
        } catch (error) {
            console.error('❌ 导入数据失败:', error);
            return false;
        }
    }

    /**
     * 生成报表数据
     */
    generateReport(tableName, options = {}) {
        const data = this.select(tableName, options.conditions || {});
        
        const report = {
            tableName: tableName,
            generatedAt: new Date().toISOString(),
            totalRecords: data.length,
            summary: this.calculateSummary(data, options.groupBy),
            data: data
        };

        console.log(`📊 生成报表: ${tableName} - ${data.length} 条记录`);
        return report;
    }

    /**
     * 计算汇总数据
     */
    calculateSummary(data, groupBy = null) {
        if (data.length === 0) return {};

        const summary = {
            total: data.length,
            dateRange: this.getDateRange(data),
            categories: {}
        };

        // 按字段分组统计
        if (groupBy && data.length > 0) {
            const groupField = groupBy;
            data.forEach(record => {
                const value = record[groupField] || '未知';
                summary.categories[value] = (summary.categories[value] || 0) + 1;
            });
        }

        return summary;
    }

    /**
     * 获取日期范围
     */
    getDateRange(data) {
        if (data.length === 0) return null;

        const dates = data
            .map(record => record.createdAt || record.date)
            .filter(date => date)
            .sort();

        return {
            start: dates[0],
            end: dates[dates.length - 1]
        };
    }

    /**
     * 备份数据库
     */
    backup() {
        const backup = this.exportData();
        const backupKey = `${this.dbName}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backup));
        console.log(`💾 数据库已备份: ${backupKey}`);
        return backupKey;
    }

    /**
     * 恢复数据库
     */
    restore(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (backupData) {
                const parsed = JSON.parse(backupData);
                return this.importData(parsed);
            }
        } catch (error) {
            console.error('❌ 恢复数据库失败:', error);
            return false;
        }
    }

    /**
     * 获取数据库状态
     */
    getStatus() {
        return {
            databaseName: this.dbName,
            totalTables: this.tables.size,
            totalRecords: Array.from(this.tables.values()).reduce((sum, table) => sum + table.data.length, 0),
            tables: this.getAllTables(),
            lastBackup: this.getLastBackup()
        };
    }

    /**
     * 获取最后一次备份
     */
    getLastBackup() {
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith(`${this.dbName}_backup_`))
            .sort()
            .reverse();

        return backupKeys.length > 0 ? backupKeys[0] : null;
    }
}

// 创建全局实例
window.simpleDB = new SimpleDatabaseSystem('bible100_main');

// 示例用法
console.log('📚 SimpleDatabaseSystem 已加载');
console.log('💡 使用示例:');
console.log('  simpleDB.createTable("users", {name: "string", email: "string"})');
console.log('  simpleDB.insert("users", {name: "张三", email: "zhang@example.com"})');
console.log('  simpleDB.select("users")');
console.log('  simpleDB.generateReport("users", {groupBy: "name"})');



















