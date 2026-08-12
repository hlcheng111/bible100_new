/**
 * Bible100 智慧事奉 - 数据库管理模块
 * 遵循统一标准的数据库访问方式
 */

// 统一的存储前缀
const STORAGE_PREFIX = 'bible100_smart_ministry_';

/**
 * 智慧事奉数据库管理类
 * 支持本地存储和未来的SQLite扩展
 */
class SmartMinistryDatabase {
    constructor() {
        this.dbName = 'smart_ministry.db';
        this.version = '1.0';
        this.initialized = false;
        this.tables = this.initTableSchemas();
        
        // 初始化数据库
        this.initDatabase();
    }

    /**
     * 初始化表结构定义
     */
    initTableSchemas() {
        return {
            // 用户档案表
            user_profiles: {
                name: 'user_profiles',
                columns: [
                    { name: 'id', type: 'TEXT PRIMARY KEY' },
                    { name: 'name', type: 'TEXT NOT NULL' },
                    { name: 'age', type: 'TEXT' },
                    { name: 'faith_years', type: 'TEXT' },
                    { name: 'current_service', type: 'INTEGER' },
                    { name: 'spiritual_gifts', type: 'TEXT' }, // JSON字符串
                    { name: 'ministry_burden', type: 'TEXT' },
                    { name: 'skills', type: 'TEXT' }, // JSON字符串
                    { name: 'communication', type: 'INTEGER' },
                    { name: 'time_commitment', type: 'TEXT' },
                    { name: 'available_times', type: 'TEXT' }, // JSON字符串
                    { name: 'service_style', type: 'TEXT' },
                    { name: 'service_goals', type: 'TEXT' },
                    { name: 'additional_info', type: 'TEXT' },
                    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
                ]
            },
            
            // 配对结果表
            match_results: {
                name: 'match_results',
                columns: [
                    { name: 'id', type: 'TEXT PRIMARY KEY' },
                    { name: 'user_id', type: 'TEXT NOT NULL' },
                    { name: 'position_id', type: 'TEXT NOT NULL' },
                    { name: 'position_name', type: 'TEXT NOT NULL' },
                    { name: 'match_score', type: 'REAL NOT NULL' },
                    { name: 'match_reasons', type: 'TEXT' }, // JSON字符串
                    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
                ]
            },
            
            // 事奉岗位表
            ministry_positions: {
                name: 'ministry_positions',
                columns: [
                    { name: 'id', type: 'TEXT PRIMARY KEY' },
                    { name: 'name', type: 'TEXT NOT NULL' },
                    { name: 'category', type: 'TEXT NOT NULL' },
                    { name: 'description', type: 'TEXT' },
                    { name: 'requirements', type: 'TEXT' }, // JSON字符串
                    { name: 'weights', type: 'TEXT' }, // JSON字符串
                    { name: 'active', type: 'BOOLEAN DEFAULT 1' },
                    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
                ]
            },
            
            // 用户事奉历史表
            service_history: {
                name: 'service_history',
                columns: [
                    { name: 'id', type: 'TEXT PRIMARY KEY' },
                    { name: 'user_id', type: 'TEXT NOT NULL' },
                    { name: 'position_id', type: 'TEXT NOT NULL' },
                    { name: 'position_name', type: 'TEXT NOT NULL' },
                    { name: 'start_date', type: 'DATE' },
                    { name: 'end_date', type: 'DATE' },
                    { name: 'status', type: 'TEXT DEFAULT "active"' }, // active, completed, paused
                    { name: 'performance_rating', type: 'INTEGER' }, // 1-5
                    { name: 'notes', type: 'TEXT' },
                    { name: 'created_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
                ]
            },
            
            // 系统配置表
            system_config: {
                name: 'system_config',
                columns: [
                    { name: 'key', type: 'TEXT PRIMARY KEY' },
                    { name: 'value', type: 'TEXT' },
                    { name: 'description', type: 'TEXT' },
                    { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
                ]
            }
        };
    }

    /**
     * 初始化数据库
     */
    async initDatabase() {
        try {
            // 检查是否已初始化
            const initFlag = localStorage.getItem(`${STORAGE_PREFIX}db_initialized`);
            if (initFlag === this.version) {
                this.initialized = true;
                return true;
            }

            // 创建表结构（使用localStorage模拟）
            await this.createTables();
            
            // 初始化基础数据
            await this.seedInitialData();
            
            // 设置初始化标记
            localStorage.setItem(`${STORAGE_PREFIX}db_initialized`, this.version);
            this.initialized = true;
            
            console.log('智慧事奉数据库初始化完成');
            return true;
        } catch (error) {
            console.error('数据库初始化失败:', error);
            return false;
        }
    }

    /**
     * 创建表结构
     */
    async createTables() {
        // 在localStorage中创建表的索引
        const tableList = Object.keys(this.tables);
        localStorage.setItem(`${STORAGE_PREFIX}tables`, JSON.stringify(tableList));
        
        // 为每个表创建索引
        for (const tableName of tableList) {
            localStorage.setItem(`${STORAGE_PREFIX}table_${tableName}_records`, JSON.stringify([]));
        }
    }

    /**
     * 初始化基础数据
     */
    async seedInitialData() {
        // 插入默认系统配置
        const defaultConfigs = [
            { key: 'version', value: this.version, description: '数据库版本' },
            { key: 'match_threshold', value: '0.1', description: '最低匹配阈值' },
            { key: 'max_results', value: '8', description: '最大返回结果数' },
            { key: 'auto_save', value: 'true', description: '自动保存配置' }
        ];

        for (const config of defaultConfigs) {
            await this.insertRecord('system_config', config);
        }
    }

    /**
     * 插入记录
     * @param {string} tableName 表名
     * @param {Object} data 数据对象
     * @returns {Promise<string>} 记录ID
     */
    async insertRecord(tableName, data) {
        try {
            if (!this.tables[tableName]) {
                throw new Error(`表 ${tableName} 不存在`);
            }

            // 生成唯一ID
            const id = data.id || this.generateId();
            const timestamp = new Date().toISOString();
            
            // 准备数据
            const record = {
                ...data,
                id: id,
                created_at: data.created_at || timestamp,
                updated_at: timestamp
            };

            // 获取现有记录
            const records = this.getTableRecords(tableName);
            
            // 检查ID是否已存在
            const existingIndex = records.findIndex(r => r.id === id);
            if (existingIndex !== -1) {
                throw new Error(`记录ID ${id} 已存在`);
            }

            // 添加新记录
            records.push(record);
            
            // 保存到localStorage
            localStorage.setItem(`${STORAGE_PREFIX}table_${tableName}_records`, JSON.stringify(records));
            
            return id;
        } catch (error) {
            console.error('插入记录失败:', error);
            throw error;
        }
    }

    /**
     * 更新记录
     * @param {string} tableName 表名
     * @param {string} id 记录ID
     * @param {Object} data 更新数据
     * @returns {Promise<boolean>} 是否成功
     */
    async updateRecord(tableName, id, data) {
        try {
            if (!this.tables[tableName]) {
                throw new Error(`表 ${tableName} 不存在`);
            }

            const records = this.getTableRecords(tableName);
            const index = records.findIndex(r => r.id === id);
            
            if (index === -1) {
                throw new Error(`记录ID ${id} 不存在`);
            }

            // 更新记录
            records[index] = {
                ...records[index],
                ...data,
                updated_at: new Date().toISOString()
            };

            // 保存到localStorage
            localStorage.setItem(`${STORAGE_PREFIX}table_${tableName}_records`, JSON.stringify(records));
            
            return true;
        } catch (error) {
            console.error('更新记录失败:', error);
            throw error;
        }
    }

    /**
     * 查询记录
     * @param {string} tableName 表名
     * @param {Object} conditions 查询条件
     * @param {Object} options 查询选项
     * @returns {Array} 查询结果
     */
    queryRecords(tableName, conditions = {}, options = {}) {
        try {
            if (!this.tables[tableName]) {
                throw new Error(`表 ${tableName} 不存在`);
            }

            let records = this.getTableRecords(tableName);

            // 应用查询条件
            if (Object.keys(conditions).length > 0) {
                records = records.filter(record => {
                    return Object.entries(conditions).every(([key, value]) => {
                        if (Array.isArray(value)) {
                            return value.includes(record[key]);
                        }
                        return record[key] === value;
                    });
                });
            }

            // 应用排序
            if (options.orderBy) {
                const [field, direction = 'ASC'] = options.orderBy.split(' ');
                records.sort((a, b) => {
                    const aVal = a[field];
                    const bVal = b[field];
                    
                    if (direction.toLowerCase() === 'desc') {
                        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                    }
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                });
            }

            // 应用限制
            if (options.limit) {
                const offset = options.offset || 0;
                records = records.slice(offset, offset + options.limit);
            }

            return records;
        } catch (error) {
            console.error('查询记录失败:', error);
            return [];
        }
    }

    /**
     * 删除记录
     * @param {string} tableName 表名
     * @param {string} id 记录ID
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteRecord(tableName, id) {
        try {
            if (!this.tables[tableName]) {
                throw new Error(`表 ${tableName} 不存在`);
            }

            const records = this.getTableRecords(tableName);
            const index = records.findIndex(r => r.id === id);
            
            if (index === -1) {
                return false; // 记录不存在
            }

            // 删除记录
            records.splice(index, 1);
            
            // 保存到localStorage
            localStorage.setItem(`${STORAGE_PREFIX}table_${tableName}_records`, JSON.stringify(records));
            
            return true;
        } catch (error) {
            console.error('删除记录失败:', error);
            throw error;
        }
    }

    /**
     * 获取表的所有记录
     * @param {string} tableName 表名
     * @returns {Array} 记录数组
     */
    getTableRecords(tableName) {
        try {
            const data = localStorage.getItem(`${STORAGE_PREFIX}table_${tableName}_records`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`获取表 ${tableName} 记录失败:`, error);
            return [];
        }
    }

    /**
     * 保存用户档案
     * @param {Object} profileData 用户档案数据
     * @returns {Promise<string>} 用户ID
     */
    async saveUserProfile(profileData) {
        try {
            // 处理数组字段
            const processedData = {
                ...profileData,
                spiritual_gifts: JSON.stringify(profileData.spiritual_gifts || []),
                skills: JSON.stringify(profileData.skills || []),
                available_times: JSON.stringify(profileData.available_times || [])
            };

            // 检查是否已存在
            const existingProfiles = this.queryRecords('user_profiles', { name: profileData.name });
            
            if (existingProfiles.length > 0) {
                // 更新现有记录
                const userId = existingProfiles[0].id;
                await this.updateRecord('user_profiles', userId, processedData);
                return userId;
            } else {
                // 插入新记录
                const userId = this.generateId();
                await this.insertRecord('user_profiles', { ...processedData, id: userId });
                return userId;
            }
        } catch (error) {
            console.error('保存用户档案失败:', error);
            throw error;
        }
    }

    /**
     * 保存配对结果
     * @param {string} userId 用户ID
     * @param {Array} matches 配对结果
     * @returns {Promise<boolean>} 是否成功
     */
    async saveMatchResults(userId, matches) {
        try {
            const timestamp = new Date().toISOString();
            
            for (const match of matches) {
                const resultId = this.generateId();
                await this.insertRecord('match_results', {
                    id: resultId,
                    user_id: userId,
                    position_id: match.position.id,
                    position_name: match.position.name,
                    match_score: match.score,
                    match_reasons: JSON.stringify(match.reasons),
                    created_at: timestamp
                });
            }
            
            return true;
        } catch (error) {
            console.error('保存配对结果失败:', error);
            return false;
        }
    }

    /**
     * 获取用户配对历史
     * @param {string} userId 用户ID
     * @param {number} limit 限制数量
     * @returns {Array} 配对历史
     */
    getUserMatchHistory(userId, limit = 10) {
        try {
            const results = this.queryRecords('match_results', 
                { user_id: userId }, 
                { orderBy: 'created_at DESC', limit: limit }
            );

            // 按时间分组
            const groupedResults = {};
            results.forEach(result => {
                const date = result.created_at.split('T')[0]; // 获取日期部分
                if (!groupedResults[date]) {
                    groupedResults[date] = [];
                }
                
                // 解析JSON字段
                result.match_reasons = JSON.parse(result.match_reasons || '[]');
                groupedResults[date].push(result);
            });

            // 转换为数组格式
            return Object.entries(groupedResults).map(([date, matches]) => ({
                date: date,
                timestamp: matches[0].created_at,
                matches: matches
            }));
        } catch (error) {
            console.error('获取配对历史失败:', error);
            return [];
        }
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计数据
     */
    getStatistics() {
        try {
            const stats = {
                total_users: this.queryRecords('user_profiles').length,
                total_matches: this.queryRecords('match_results').length,
                active_positions: this.queryRecords('ministry_positions', { active: true }).length,
                recent_matches: 0
            };

            // 计算最近7天的配对数量
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recentMatches = this.queryRecords('match_results').filter(
                result => new Date(result.created_at) >= weekAgo
            );
            stats.recent_matches = recentMatches.length;

            return stats;
        } catch (error) {
            console.error('获取统计信息失败:', error);
            return {};
        }
    }

    /**
     * 备份数据
     * @returns {Object} 备份数据
     */
    backupData() {
        try {
            const backup = {
                version: this.version,
                timestamp: new Date().toISOString(),
                tables: {}
            };

            // 备份所有表数据
            Object.keys(this.tables).forEach(tableName => {
                backup.tables[tableName] = this.getTableRecords(tableName);
            });

            return backup;
        } catch (error) {
            console.error('备份数据失败:', error);
            return null;
        }
    }

    /**
     * 恢复数据
     * @param {Object} backupData 备份数据
     * @returns {Promise<boolean>} 是否成功
     */
    async restoreData(backupData) {
        try {
            if (!backupData || !backupData.tables) {
                throw new Error('无效的备份数据');
            }

            // 恢复表数据
            for (const [tableName, records] of Object.entries(backupData.tables)) {
                if (this.tables[tableName]) {
                    localStorage.setItem(
                        `${STORAGE_PREFIX}table_${tableName}_records`, 
                        JSON.stringify(records)
                    );
                }
            }

            return true;
        } catch (error) {
            console.error('恢复数据失败:', error);
            return false;
        }
    }

    /**
     * 清空表数据
     * @param {string} tableName 表名
     * @returns {Promise<boolean>} 是否成功
     */
    async clearTable(tableName) {
        try {
            if (!this.tables[tableName]) {
                throw new Error(`表 ${tableName} 不存在`);
            }

            localStorage.setItem(`${STORAGE_PREFIX}table_${tableName}_records`, JSON.stringify([]));
            return true;
        } catch (error) {
            console.error('清空表失败:', error);
            return false;
        }
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 检查数据库是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * 获取数据库信息
     * @returns {Object} 数据库信息
     */
    getDatabaseInfo() {
        return {
            name: this.dbName,
            version: this.version,
            initialized: this.initialized,
            tables: Object.keys(this.tables),
            storage_type: 'localStorage'
        };
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartMinistryDatabase;
} else {
    window.SmartMinistryDatabase = SmartMinistryDatabase;
}

// 创建全局数据库实例
if (typeof window !== 'undefined') {
    window.smartMinistryDB = new SmartMinistryDatabase();
}
