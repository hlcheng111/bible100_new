/**
 * CSV导入工具
 * 支持从CSV文件导入数据到数据库
 * 自动处理中文编码问题
 */

class CSVImportTool {
    constructor(database) {
        this.db = database;
        console.log('📥 CSV导入工具已初始化');
    }

    /**
     * 解析CSV内容（支持中文）
     */
    parseCSV(csvContent, hasHeader = true) {
        // 按行分割
        const lines = csvContent.trim().split(/\r?\n/);
        
        if (lines.length === 0) {
            throw new Error('CSV文件为空');
        }

        const headers = hasHeader ? this.parseCSVLine(lines[0]) : null;
        const dataLines = hasHeader ? lines.slice(1) : lines;
        
        const records = dataLines.map((line, index) => {
            const values = this.parseCSVLine(line);
            
            if (hasHeader) {
                const record = {};
                headers.forEach((header, i) => {
                    record[header] = values[i] || '';
                });
                return record;
            } else {
                return values;
            }
        });

        return {
            headers: headers,
            records: records,
            totalRows: records.length
        };
    }

    /**
     * 解析CSV行（处理引号和逗号）
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // 双引号转义
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * 从CSV导入数据到指定表
     */
    importToTable(csvContent, tableName, options = {}) {
        const {
            hasHeader = true,
            fieldMapping = null,
            transformFn = null,
            clearExisting = false
        } = options;

        try {
            // 解析CSV
            const parsed = this.parseCSV(csvContent, hasHeader);
            console.log(`📊 解析完成: ${parsed.totalRows} 条记录`);

            // 清空现有数据（如果需要）
            if (clearExisting) {
                const existing = this.db.select(tableName);
                existing.forEach(record => this.db.delete(tableName, record.id));
                console.log(`🗑️ 已清空表 '${tableName}' 的现有数据`);
            }

            // 导入数据
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            parsed.records.forEach((record, index) => {
                try {
                    // 字段映射
                    let mappedRecord = record;
                    if (fieldMapping) {
                        mappedRecord = {};
                        for (const [csvField, dbField] of Object.entries(fieldMapping)) {
                            mappedRecord[dbField] = record[csvField];
                        }
                    }

                    // 数据转换
                    if (transformFn) {
                        mappedRecord = transformFn(mappedRecord, index);
                    }

                    // 插入数据库
                    this.db.insert(tableName, mappedRecord);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push({
                        row: index + 1,
                        error: error.message,
                        data: record
                    });
                }
            });

            const result = {
                success: true,
                totalRows: parsed.totalRows,
                successCount: successCount,
                errorCount: errorCount,
                errors: errors
            };

            console.log(`✅ 导入完成: 成功 ${successCount}/${parsed.totalRows} 条`);
            if (errorCount > 0) {
                console.warn(`⚠️ ${errorCount} 条记录导入失败`, errors);
            }

            return result;

        } catch (error) {
            console.error('❌ CSV导入失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 导出数据为CSV（支持中文）
     */
    exportTableToCSV(tableName, fields = null) {
        const records = this.db.select(tableName);
        
        if (records.length === 0) {
            throw new Error('表中没有数据可导出');
        }

        // 确定要导出的字段
        const exportFields = fields || Object.keys(records[0]);

        // 生成CSV内容
        let csv = '\uFEFF'; // UTF-8 BOM，解决Excel中文乱码
        
        // 表头
        csv += exportFields.join(',') + '\n';

        // 数据行
        records.forEach(record => {
            const row = exportFields.map(field => {
                let value = record[field] || '';
                // 处理包含逗号、引号、换行的值
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv += row.join(',') + '\n';
        });

        return csv;
    }

    /**
     * 下载CSV文件
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    /**
     * 创建文件选择器并导入
     */
    createImportDialog(tableName, options = {}) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject(new Error('未选择文件'));
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const csvContent = event.target.result;
                        const result = this.importToTable(csvContent, tableName, options);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                };

                reader.onerror = () => {
                    reject(new Error('文件读取失败'));
                };

                // 使用UTF-8读取
                reader.readAsText(file, 'UTF-8');
            };

            input.click();
        });
    }
}

// 创建全局实例
if (window.simpleDB) {
    window.csvImporter = new CSVImportTool(window.simpleDB);
    console.log('✨ CSV导入工具已加载');
    console.log('💡 使用示例:');
    console.log('  csvImporter.createImportDialog("members")  // 导入会友数据');
    console.log('  csvImporter.exportTableToCSV("members")    // 导出会友数据');
}




















