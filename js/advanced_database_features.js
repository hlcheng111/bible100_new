/**
 * Bible100 高级数据库功能扩展
 * 
 * 提供高级功能：
 * - 数据验证和约束
 * - 关系查询和联表
 * - 数据聚合和统计
 * - 事务处理
 * - 数据索引优化
 * 
 * 版本：1.0
 * 日期：2025-01-16
 */

class AdvancedDatabaseFeatures {
    constructor(database) {
        this.db = database;
        console.log('🚀 AdvancedDatabaseFeatures 已初始化');
    }

    /**
     * 添加数据验证规则
     */
    addValidationRule(tableName, fieldName, validator) {
        if (!this.db.data[tableName]) {
            console.error(`❌ 表 '${tableName}' 不存在`);
            return false;
        }

        if (!this.db.data[tableName].validators) {
            this.db.data[tableName].validators = {};
        }

        this.db.data[tableName].validators[fieldName] = validator;
        console.log(`✅ 为表 '${tableName}' 的字段 '${fieldName}' 添加了验证规则`);
        return true;
    }

    /**
     * 验证数据
     */
    validateRecord(tableName, record) {
        if (!this.db.data[tableName] || !this.db.data[tableName].validators) {
            return { valid: true };
        }

        const validators = this.db.data[tableName].validators;
        const errors = [];

        for (const field in validators) {
            const validator = validators[field];
            const value = record[field];

            if (validator.required && (value === undefined || value === null || value === '')) {
                errors.push(`字段 '${field}' 是必填项`);
            }

            if (validator.type && typeof value !== validator.type && value !== undefined) {
                errors.push(`字段 '${field}' 类型应为 '${validator.type}'`);
            }

            if (validator.min !== undefined && value < validator.min) {
                errors.push(`字段 '${field}' 的值不能小于 ${validator.min}`);
            }

            if (validator.max !== undefined && value > validator.max) {
                errors.push(`字段 '${field}' 的值不能大于 ${validator.max}`);
            }

            if (validator.pattern && !validator.pattern.test(value)) {
                errors.push(`字段 '${field}' 格式不正确`);
            }

            if (validator.custom && !validator.custom(value)) {
                errors.push(`字段 '${field}' 未通过自定义验证`);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 联表查询 (JOIN)
     */
    join(table1Name, table2Name, joinField, selectFields = null) {
        const table1Records = this.db.select(table1Name);
        const table2Records = this.db.select(table2Name);

        if (table1Records.length === 0 || table2Records.length === 0) {
            return [];
        }

        // 创建 table2 的索引以提高查询性能
        const table2Index = {};
        table2Records.forEach(record => {
            const key = record[joinField];
            if (!table2Index[key]) {
                table2Index[key] = [];
            }
            table2Index[key].push(record);
        });

        // 执行联表
        const results = [];
        table1Records.forEach(record1 => {
            const key = record1[joinField];
            const matchingRecords = table2Index[key] || [];

            if (matchingRecords.length > 0) {
                matchingRecords.forEach(record2 => {
                    const joinedRecord = { ...record1, ...record2 };
                    
                    if (selectFields) {
                        const selectedRecord = {};
                        selectFields.forEach(field => {
                            selectedRecord[field] = joinedRecord[field];
                        });
                        results.push(selectedRecord);
                    } else {
                        results.push(joinedRecord);
                    }
                });
            }
        });

        console.log(`🔗 联表查询完成: ${table1Name} JOIN ${table2Name}，结果 ${results.length} 条`);
        return results;
    }

    /**
     * 数据聚合 - 分组统计
     */
    groupBy(tableName, groupField, aggregations = {}) {
        const records = this.db.select(tableName);
        if (records.length === 0) return {};

        const groups = {};

        // 分组
        records.forEach(record => {
            const key = record[groupField];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(record);
        });

        // 聚合计算
        const results = {};
        for (const key in groups) {
            const groupRecords = groups[key];
            results[key] = {
                count: groupRecords.length
            };

            // 计算各种聚合函数
            for (const aggField in aggregations) {
                const aggType = aggregations[aggField];
                const values = groupRecords.map(r => r[aggField]).filter(v => v !== undefined && v !== null);

                switch (aggType) {
                    case 'sum':
                        results[key][`${aggField}_sum`] = values.reduce((a, b) => a + b, 0);
                        break;
                    case 'avg':
                        results[key][`${aggField}_avg`] = values.length > 0 
                            ? values.reduce((a, b) => a + b, 0) / values.length 
                            : 0;
                        break;
                    case 'min':
                        results[key][`${aggField}_min`] = values.length > 0 ? Math.min(...values) : null;
                        break;
                    case 'max':
                        results[key][`${aggField}_max`] = values.length > 0 ? Math.max(...values) : null;
                        break;
                }
            }
        }

        console.log(`📊 分组统计完成: ${tableName} GROUP BY ${groupField}`);
        return results;
    }

    /**
     * 高级查询 - 支持多条件、排序、分页
     */
    advancedQuery(tableName, options = {}) {
        let records = this.db.select(tableName, options.where || {});

        // 额外的过滤条件
        if (options.filter) {
            records = records.filter(options.filter);
        }

        // 排序
        if (options.orderBy) {
            const { field, direction = 'asc' } = options.orderBy;
            records.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // 分页
        if (options.pagination) {
            const { page = 1, pageSize = 10 } = options.pagination;
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            const paginatedRecords = records.slice(start, end);

            return {
                data: paginatedRecords,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    total: records.length,
                    totalPages: Math.ceil(records.length / pageSize)
                }
            };
        }

        // 限制返回数量
        if (options.limit) {
            records = records.slice(0, options.limit);
        }

        return records;
    }

    /**
     * 批量插入数据
     */
    bulkInsert(tableName, records) {
        if (!Array.isArray(records)) {
            console.error('❌ records 必须是数组');
            return false;
        }

        const insertedRecords = [];
        records.forEach(record => {
            const validation = this.validateRecord(tableName, record);
            if (validation.valid) {
                const newRecord = this.db.insert(tableName, record);
                if (newRecord) insertedRecords.push(newRecord);
            } else {
                console.warn(`⚠️ 跳过无效记录:`, validation.errors);
            }
        });

        console.log(`✅ 批量插入完成: ${insertedRecords.length}/${records.length} 条记录成功`);
        return insertedRecords;
    }

    /**
     * 批量更新数据
     */
    bulkUpdate(tableName, conditions, updates) {
        const records = this.db.select(tableName, conditions);
        let updatedCount = 0;

        records.forEach(record => {
            if (this.db.update(tableName, record.id, updates)) {
                updatedCount++;
            }
        });

        console.log(`✅ 批量更新完成: ${updatedCount} 条记录已更新`);
        return updatedCount;
    }

    /**
     * 批量删除数据
     */
    bulkDelete(tableName, conditions) {
        const records = this.db.select(tableName, conditions);
        let deletedCount = 0;

        records.forEach(record => {
            if (this.db.delete(tableName, record.id)) {
                deletedCount++;
            }
        });

        console.log(`✅ 批量删除完成: ${deletedCount} 条记录已删除`);
        return deletedCount;
    }

    /**
     * 数据统计分析
     */
    analyze(tableName, field) {
        const records = this.db.select(tableName);
        if (records.length === 0) return null;

        const values = records.map(r => r[field]).filter(v => typeof v === 'number');
        
        if (values.length === 0) return null;

        values.sort((a, b) => a - b);

        return {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: values[0],
            max: values[values.length - 1],
            median: values[Math.floor(values.length / 2)],
            mode: this.calculateMode(values),
            stdDev: this.calculateStdDev(values)
        };
    }

    /**
     * 计算众数
     */
    calculateMode(values) {
        const frequency = {};
        let maxFreq = 0;
        let mode = null;

        values.forEach(value => {
            frequency[value] = (frequency[value] || 0) + 1;
            if (frequency[value] > maxFreq) {
                maxFreq = frequency[value];
                mode = value;
            }
        });

        return mode;
    }

    /**
     * 计算标准差
     */
    calculateStdDev(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * 创建索引以提高查询性能
     */
    createIndex(tableName, fieldName) {
        if (!this.db.data[tableName]) {
            console.error(`❌ 表 '${tableName}' 不存在`);
            return false;
        }

        if (!this.db.data[tableName].indexes) {
            this.db.data[tableName].indexes = {};
        }

        const index = {};
        this.db.data[tableName].records.forEach(record => {
            const key = record[fieldName];
            if (!index[key]) {
                index[key] = [];
            }
            index[key].push(record.id);
        });

        this.db.data[tableName].indexes[fieldName] = index;
        console.log(`🔍 为表 '${tableName}' 的字段 '${fieldName}' 创建了索引`);
        return true;
    }

    /**
     * 使用索引查询
     */
    queryByIndex(tableName, fieldName, value) {
        if (!this.db.data[tableName] || !this.db.data[tableName].indexes || !this.db.data[tableName].indexes[fieldName]) {
            console.warn(`⚠️ 表 '${tableName}' 的字段 '${fieldName}' 没有索引，使用常规查询`);
            return this.db.select(tableName, { [fieldName]: value });
        }

        const index = this.db.data[tableName].indexes[fieldName];
        const recordIds = index[value] || [];
        const records = recordIds.map(id => {
            return this.db.data[tableName].records.find(r => r.id === id);
        }).filter(r => r !== undefined);

        console.log(`🔍 使用索引查询完成: ${records.length} 条记录`);
        return records;
    }

    /**
     * 数据去重
     */
    deduplicate(tableName, uniqueFields) {
        const records = this.db.select(tableName);
        const seen = new Set();
        const duplicates = [];

        records.forEach(record => {
            const key = uniqueFields.map(field => record[field]).join('|');
            if (seen.has(key)) {
                duplicates.push(record.id);
            } else {
                seen.add(key);
            }
        });

        // 删除重复记录
        duplicates.forEach(id => {
            this.db.delete(tableName, id);
        });

        console.log(`🧹 去重完成: 删除了 ${duplicates.length} 条重复记录`);
        return duplicates.length;
    }

    /**
     * 数据迁移
     */
    migrateTable(oldTableName, newTableName, transformFn = null) {
        const records = this.db.select(oldTableName);
        
        if (records.length === 0) {
            console.warn(`⚠️ 表 '${oldTableName}' 没有数据可迁移`);
            return false;
        }

        // 创建新表（复制schema）
        const oldSchema = this.db.data[oldTableName].schema;
        this.db.createTable(newTableName, oldSchema);

        // 迁移数据
        records.forEach(record => {
            const newRecord = transformFn ? transformFn(record) : record;
            this.db.insert(newTableName, newRecord);
        });

        console.log(`🚚 数据迁移完成: ${oldTableName} -> ${newTableName}，迁移了 ${records.length} 条记录`);
        return true;
    }

    /**
     * 数据快照
     */
    createSnapshot(tableName) {
        const records = this.db.select(tableName);
        const snapshotKey = `snapshot_${tableName}_${Date.now()}`;
        
        localStorage.setItem(snapshotKey, JSON.stringify(records));
        console.log(`📸 创建数据快照: ${snapshotKey}`);
        
        return snapshotKey;
    }

    /**
     * 恢复快照
     */
    restoreSnapshot(snapshotKey) {
        const snapshotData = localStorage.getItem(snapshotKey);
        
        if (!snapshotData) {
            console.error(`❌ 快照 '${snapshotKey}' 不存在`);
            return false;
        }

        const records = JSON.parse(snapshotData);
        const tableName = snapshotKey.split('_')[1];

        // 清空现有数据
        const currentRecords = this.db.select(tableName);
        currentRecords.forEach(record => {
            this.db.delete(tableName, record.id);
        });

        // 恢复快照数据
        records.forEach(record => {
            this.db.insert(tableName, record);
        });

        console.log(`🔄 恢复快照完成: ${snapshotKey}，恢复了 ${records.length} 条记录`);
        return true;
    }

    /**
     * 获取表的统计信息
     */
    getTableStats(tableName) {
        const records = this.db.select(tableName);
        if (records.length === 0) {
            return {
                tableName: tableName,
                recordCount: 0,
                message: '表中没有数据'
            };
        }

        const firstRecord = records[0];
        const fields = Object.keys(firstRecord);
        
        const stats = {
            tableName: tableName,
            recordCount: records.length,
            fields: fields.length,
            fieldDetails: {}
        };

        fields.forEach(field => {
            const values = records.map(r => r[field]).filter(v => v !== undefined && v !== null);
            const uniqueValues = new Set(values);
            
            stats.fieldDetails[field] = {
                type: typeof values[0],
                nullCount: records.length - values.length,
                uniqueCount: uniqueValues.size,
                sampleValues: Array.from(uniqueValues).slice(0, 5)
            };
        });

        return stats;
    }
}

// 扩展 SimpleDatabase 类的方法
if (window.simpleDB) {
    // 添加高级功能实例
    window.simpleDB.advanced = new AdvancedDatabaseFeatures(window.simpleDB);

    // 为 SimpleDatabase 添加新方法
    window.simpleDB.getStatus = function() {
        const tableNames = this.getTableNames();
        let totalRecords = 0;
        
        tableNames.forEach(tableName => {
            totalRecords += this.getRecordCount(tableName);
        });

        return {
            totalTables: tableNames.length,
            totalRecords: totalRecords,
            tables: tableNames.map(tableName => ({
                name: tableName,
                recordCount: this.getRecordCount(tableName)
            }))
        };
    };

    window.simpleDB.exportData = function() {
        return this.data;
    };

    console.log('✨ SimpleDatabase 已扩展高级功能');
    console.log('💡 使用示例:');
    console.log('  simpleDB.advanced.join("students", "classes", "class")');
    console.log('  simpleDB.advanced.groupBy("students", "grade", {age: "avg"})');
    console.log('  simpleDB.advanced.advancedQuery("students", {orderBy: {field: "grade", direction: "desc"}, pagination: {page: 1, pageSize: 10}})');
    console.log('  simpleDB.advanced.analyze("students", "age")');
}

console.log('🎉 AdvancedDatabaseFeatures 已加载');




















