/**
 * Bible100 报表生成器
 * 
 * 基于Church Ministry成功模式
 * 特点：
 * 1. 自动生成各种报表
 * 2. 支持图表显示
 * 3. 数据导出功能
 * 4. 零依赖，纯JavaScript
 * 
 * 版本：1.0
 * 日期：2025-01-16
 */

class ReportGenerator {
    constructor(database) {
        this.db = database;
        this.charts = new Map();
    }

    /**
     * 生成概览报表
     */
    generateOverviewReport(tableName) {
        const data = this.db.select(tableName);
        const report = this.db.generateReport(tableName);
        
        return {
            title: `${tableName} 概览报表`,
            generatedAt: new Date().toISOString(),
            summary: {
                totalRecords: data.length,
                dateRange: this.getDateRange(data),
                categories: this.getCategoryStats(data)
            },
            charts: {
                timeline: this.generateTimelineChart(data),
                category: this.generateCategoryChart(data)
            },
            tables: {
                recent: data.slice(-10),
                top: this.getTopRecords(data)
            }
        };
    }

    /**
     * 生成统计报表
     */
    generateStatisticsReport(tableName, groupBy) {
        const data = this.db.select(tableName);
        const grouped = this.groupBy(data, groupBy);
        
        const stats = Object.entries(grouped).map(([key, records]) => ({
            category: key,
            count: records.length,
            percentage: ((records.length / data.length) * 100).toFixed(1)
        }));

        return {
            title: `${tableName} 统计报表 - 按${groupBy}分组`,
            generatedAt: new Date().toISOString(),
            totalRecords: data.length,
            statistics: stats,
            chart: this.generateStatisticsChart(stats)
        };
    }

    /**
     * 生成趋势报表
     */
    generateTrendReport(tableName, dateField = 'createdAt') {
        const data = this.db.select(tableName);
        const timeline = this.generateTimelineData(data, dateField);
        
        return {
            title: `${tableName} 趋势报表`,
            generatedAt: new Date().toISOString(),
            timeline: timeline,
            chart: this.generateTrendChart(timeline),
            insights: this.generateInsights(timeline)
        };
    }

    /**
     * 生成对比报表
     */
    generateComparisonReport(tableName, compareField, compareValues) {
        const data = this.db.select(tableName);
        const comparison = {};
        
        compareValues.forEach(value => {
            comparison[value] = data.filter(record => record[compareField] === value);
        });

        return {
            title: `${tableName} 对比报表`,
            generatedAt: new Date().toISOString(),
            comparison: comparison,
            chart: this.generateComparisonChart(comparison),
            summary: this.generateComparisonSummary(comparison)
        };
    }

    /**
     * 生成详细报表
     */
    generateDetailedReport(tableName, filters = {}) {
        const data = this.db.select(tableName, filters);
        
        return {
            title: `${tableName} 详细报表`,
            generatedAt: new Date().toISOString(),
            filters: filters,
            totalRecords: data.length,
            data: data,
            exportable: true
        };
    }

    /**
     * 导出报表为CSV
     */
    exportToCSV(report) {
        if (!report.data || !Array.isArray(report.data)) {
            return null;
        }

        const headers = Object.keys(report.data[0] || {});
        const csvContent = [
            headers.join(','),
            ...report.data.map(record => 
                headers.map(header => `"${record[header] || ''}"`).join(',')
            )
        ].join('\n');

        return csvContent;
    }

    /**
     * 导出报表为JSON
     */
    exportToJSON(report) {
        return JSON.stringify(report, null, 2);
    }

    /**
     * 打印报表
     */
    printReport(report) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generatePrintHTML(report));
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * 生成打印HTML
     */
    generatePrintHTML(report) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${report.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .footer { text-align: center; margin-top: 30px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${report.title}</h1>
                    <p>生成时间: ${report.generatedAt}</p>
                </div>
                <div class="summary">
                    <h3>汇总信息</h3>
                    <p>总记录数: ${report.totalRecords || report.summary?.totalRecords || 0}</p>
                </div>
                ${report.data ? this.generateTableHTML(report.data) : ''}
                <div class="footer">
                    <p>由 Bible100 系统生成</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * 生成表格HTML
     */
    generateTableHTML(data) {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const rows = data.map(record => 
            headers.map(header => record[header] || '').join('</td><td>')
        );

        return `
            <table>
                <thead>
                    <tr><th>${headers.join('</th><th>')}</th></tr>
                </thead>
                <tbody>
                    ${rows.map(row => `<tr><td>${row}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * 辅助方法：按字段分组
     */
    groupBy(data, field) {
        return data.reduce((groups, record) => {
            const key = record[field] || '未知';
            if (!groups[key]) groups[key] = [];
            groups[key].push(record);
            return groups;
        }, {});
    }

    /**
     * 辅助方法：获取日期范围
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
     * 辅助方法：获取分类统计
     */
    getCategoryStats(data) {
        const categories = {};
        data.forEach(record => {
            Object.keys(record).forEach(key => {
                if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
                    const value = record[key];
                    if (!categories[key]) categories[key] = {};
                    categories[key][value] = (categories[key][value] || 0) + 1;
                }
            });
        });
        return categories;
    }

    /**
     * 辅助方法：获取前几条记录
     */
    getTopRecords(data, limit = 5) {
        return data.slice(0, limit);
    }

    /**
     * 生成时间线数据
     */
    generateTimelineData(data, dateField) {
        const timeline = {};
        data.forEach(record => {
            const date = record[dateField];
            if (date) {
                const day = date.split('T')[0]; // 获取日期部分
                timeline[day] = (timeline[day] || 0) + 1;
            }
        });

        return Object.entries(timeline)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
    }

    /**
     * 生成洞察
     */
    generateInsights(timeline) {
        if (timeline.length === 0) return [];

        const insights = [];
        const counts = timeline.map(t => t.count);
        const max = Math.max(...counts);
        const min = Math.min(...counts);
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

        if (max > avg * 1.5) {
            const peakDay = timeline.find(t => t.count === max);
            insights.push(`峰值出现在 ${peakDay.date}，共 ${max} 条记录`);
        }

        if (min < avg * 0.5) {
            const lowDay = timeline.find(t => t.count === min);
            insights.push(`最低点在 ${lowDay.date}，仅 ${min} 条记录`);
        }

        insights.push(`平均每日 ${avg.toFixed(1)} 条记录`);

        return insights;
    }

    /**
     * 生成图表数据（简化版，实际使用时可以集成Chart.js）
     */
    generateTimelineChart(data) {
        const timeline = this.generateTimelineData(data);
        return {
            type: 'line',
            data: timeline,
            title: '时间趋势'
        };
    }

    generateCategoryChart(data) {
        const categories = this.getCategoryStats(data);
        const chartData = Object.entries(categories).map(([field, values]) => ({
            field,
            values: Object.entries(values).map(([key, count]) => ({ key, count }))
        }));

        return {
            type: 'pie',
            data: chartData,
            title: '分类分布'
        };
    }

    generateStatisticsChart(stats) {
        return {
            type: 'bar',
            data: stats,
            title: '统计对比'
        };
    }

    generateTrendChart(timeline) {
        return {
            type: 'line',
            data: timeline,
            title: '趋势分析'
        };
    }

    generateComparisonChart(comparison) {
        const data = Object.entries(comparison).map(([key, records]) => ({
            category: key,
            count: records.length
        }));

        return {
            type: 'bar',
            data: data,
            title: '对比分析'
        };
    }

    generateComparisonSummary(comparison) {
        const summary = {};
        Object.entries(comparison).forEach(([key, records]) => {
            summary[key] = {
                count: records.length,
                percentage: ((records.length / Object.values(comparison).reduce((sum, arr) => sum + arr.length, 0)) * 100).toFixed(1)
            };
        });
        return summary;
    }
}

// 创建全局实例
window.reportGenerator = new ReportGenerator(window.simpleDB);

console.log('📊 ReportGenerator 已加载');
console.log('💡 使用示例:');
console.log('  reportGenerator.generateOverviewReport("users")');
console.log('  reportGenerator.generateStatisticsReport("users", "category")');
console.log('  reportGenerator.exportToCSV(report)');



















