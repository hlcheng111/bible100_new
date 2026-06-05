// 報表生成器 - 生成千多首詩歌的完整報表
class HymnReportGenerator {
    constructor() {
        this.reports = {};
    }
    
    // 生成總覽報表
    generateOverviewReport() {
        const stats = window.hymnDatabase.getStatistics();
        const categoryStats = window.hymnDatabase.getCategoryStats();
        
        return {
            title: '聖詩數據庫總覽報表',
            generated_date: new Date().toLocaleString(),
            statistics: stats,
            category_distribution: categoryStats,
            summary: this.generateSummary(stats, categoryStats)
        };
    }
    
    // 生成詩歌列表報表
    generateHymnListReport(filters = {}) {
        let hymns = window.hymnDatabase.databases.hymns;
        
        // 應用過濾器
        if (filters.category_id) {
            hymns = hymns.filter(h => h.category_id === filters.category_id);
        }
        
        if (filters.search_term) {
            hymns = hymns.filter(h => 
                h.title_en.toLowerCase().includes(filters.search_term.toLowerCase()) ||
                h.title_cn.toLowerCase().includes(filters.search_term.toLowerCase())
            );
        }
        
        return {
            title: '詩歌列表報表',
            generated_date: new Date().toLocaleString(),
            total_count: hymns.length,
            filters: filters,
            hymns: hymns.map(h => ({
                id: h.id,
                title_en: h.title_en,
                title_cn: h.title_cn,
                category: this.getCategoryName(h.category_id),
                author: this.getPersonName(h.author_id),
                composer: this.getPersonName(h.composer_id),
                directory: h.directory_path,
                file: h.file_name,
                created_date: h.created_date
            }))
        };
    }
    
    // 生成分類統計報表
    generateCategoryReport() {
        const categories = window.hymnDatabase.databases.categories;
        const hymns = window.hymnDatabase.databases.hymns;
        
        const report = {
            title: '詩歌分類統計報表',
            generated_date: new Date().toLocaleString(),
            categories: []
        };
        
        categories.forEach(cat => {
            const hymnCount = hymns.filter(h => h.category_id === cat.id).length;
            const subCategories = categories.filter(c => c.parent_id === cat.id);
            
            report.categories.push({
                id: cat.id,
                name: cat.name,
                type: cat.type,
                hymn_count: hymnCount,
                sub_categories: subCategories.map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    hymn_count: hymns.filter(h => h.category_id === sub.id).length
                }))
            });
        });
        
        return report;
    }
    
    // 生成作者統計報表
    generateAuthorReport() {
        const people = window.hymnDatabase.databases.people;
        const hymns = window.hymnDatabase.databases.hymns;
        
        const report = {
            title: '作者統計報表',
            generated_date: new Date().toLocaleString(),
            authors: []
        };
        
        people.forEach(person => {
            const authorCount = hymns.filter(h => h.author_id === person.id).length;
            const composerCount = hymns.filter(h => h.composer_id === person.id).length;
            
            report.authors.push({
                id: person.id,
                name: person.full_name,
                nation: person.nation,
                as_author: authorCount,
                as_composer: composerCount,
                total_works: authorCount + composerCount
            });
        });
        
        return report;
    }
    
    // 生成目錄結構報表
    generateDirectoryReport() {
        const hymns = window.hymnDatabase.databases.hymns;
        const directories = {};
        
        hymns.forEach(hymn => {
            const dir = hymn.directory_path || '未分類';
            if (!directories[dir]) {
                directories[dir] = {
                    name: dir,
                    hymn_count: 0,
                    hymns: []
                };
            }
            
            directories[dir].hymn_count++;
            directories[dir].hymns.push({
                id: hymn.id,
                title_en: hymn.title_en,
                title_cn: hymn.title_cn,
                file_name: hymn.file_name
            });
        });
        
        return {
            title: '目錄結構報表',
            generated_date: new Date().toLocaleString(),
            total_directories: Object.keys(directories).length,
            directories: Object.values(directories).sort((a, b) => b.hymn_count - a.hymn_count)
        };
    }
    
    // 生成媒體關聯報表
    generateMediaReport() {
        const hymns = window.hymnDatabase.databases.hymns;
        const media = window.hymnDatabase.databases.media;
        
        const report = {
            title: '媒體關聯報表',
            generated_date: new Date().toLocaleString(),
            total_hymns_with_media: 0,
            media_types: {},
            hymns_with_media: []
        };
        
        // 統計媒體類型
        media.forEach(m => {
            if (!report.media_types[m.media_type]) {
                report.media_types[m.media_type] = 0;
            }
            report.media_types[m.media_type]++;
        });
        
        // 找出有媒體的詩歌
        hymns.forEach(hymn => {
            const hymnMedia = media.filter(m => m.hymn_id === hymn.id);
            if (hymnMedia.length > 0) {
                report.total_hymns_with_media++;
                report.hymns_with_media.push({
                    hymn_id: hymn.id,
                    title_en: hymn.title_en,
                    title_cn: hymn.title_cn,
                    media_count: hymnMedia.length,
                    media: hymnMedia
                });
            }
        });
        
        return report;
    }
    
    // 生成HTML格式報表
    generateHTMLReport(reportData) {
        let html = `
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <title>${reportData.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                    .header { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                    .section { margin-bottom: 30px; }
                    .section h3 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
                    th { background: #007bff; color: white; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
                    .stat-card { background: #e3f2fd; padding: 15px; border-radius: 5px; text-align: center; }
                    .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
                    .stat-label { color: #666; margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${reportData.title}</h1>
                    <p>生成時間：${reportData.generated_date}</p>
                </div>
        `;
        
        // 根據報表類型生成內容
        if (reportData.statistics) {
            html += this.generateStatisticsHTML(reportData);
        }
        
        if (reportData.hymns) {
            html += this.generateHymnListHTML(reportData);
        }
        
        if (reportData.categories) {
            html += this.generateCategoryHTML(reportData);
        }
        
        if (reportData.directories) {
            html += this.generateDirectoryHTML(reportData);
        }
        
        html += `
            </body>
            </html>
        `;
        
        return html;
    }
    
    // 生成統計數據HTML
    generateStatisticsHTML(reportData) {
        const stats = reportData.statistics;
        const categoryStats = reportData.category_distribution;
        
        let html = `
            <div class="section">
                <h3>📊 數據統計</h3>
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">${stats.total_hymns}</div>
                        <div class="stat-label">詩歌總數</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.total_categories}</div>
                        <div class="stat-label">分類總數</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.total_people}</div>
                        <div class="stat-label">作者總數</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.total_media}</div>
                        <div class="stat-label">媒體總數</div>
                    </div>
                </div>
            </div>
        `;
        
        if (categoryStats) {
            html += `
                <div class="section">
                    <h3>📂 分類分布</h3>
                    <table>
                        <thead>
                            <tr><th>分類名稱</th><th>詩歌數量</th></tr>
                        </thead>
                        <tbody>
            `;
            
            Object.entries(categoryStats).forEach(([name, count]) => {
                html += `<tr><td>${name}</td><td>${count}</td></tr>`;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        return html;
    }
    
    // 生成詩歌列表HTML
    generateHymnListHTML(reportData) {
        let html = `
            <div class="section">
                <h3>📝 詩歌列表 (共${reportData.total_count}首)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>英文歌名</th>
                            <th>中文歌名</th>
                            <th>分類</th>
                            <th>作者</th>
                            <th>作曲者</th>
                            <th>目錄</th>
                            <th>文件名</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        reportData.hymns.forEach(hymn => {
            html += `
                <tr>
                    <td>${hymn.id}</td>
                    <td>${hymn.title_en || '-'}</td>
                    <td>${hymn.title_cn || '-'}</td>
                    <td>${hymn.category || '-'}</td>
                    <td>${hymn.author || '-'}</td>
                    <td>${hymn.composer || '-'}</td>
                    <td>${hymn.directory || '-'}</td>
                    <td>${hymn.file || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }
    
    // 生成分類HTML
    generateCategoryHTML(reportData) {
        let html = `
            <div class="section">
                <h3>📂 分類統計</h3>
                <table>
                    <thead>
                        <tr>
                            <th>分類ID</th>
                            <th>分類名稱</th>
                            <th>類型</th>
                            <th>詩歌數量</th>
                            <th>子分類</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        reportData.categories.forEach(cat => {
            const subCatInfo = cat.sub_categories.map(sub => 
                `${sub.name}(${sub.hymn_count})`
            ).join(', ');
            
            html += `
                <tr>
                    <td>${cat.id}</td>
                    <td>${cat.name}</td>
                    <td>${cat.type}</td>
                    <td>${cat.hymn_count}</td>
                    <td>${subCatInfo || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }
    
    // 生成目錄HTML
    generateDirectoryHTML(reportData) {
        let html = `
            <div class="section">
                <h3>📁 目錄結構 (共${reportData.total_directories}個目錄)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>目錄名稱</th>
                            <th>詩歌數量</th>
                            <th>詩歌列表</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        reportData.directories.forEach(dir => {
            const hymnList = dir.hymns.map(h => 
                `${h.title_en || h.title_cn || h.file_name}`
            ).join(', ');
            
            html += `
                <tr>
                    <td>${dir.name}</td>
                    <td>${dir.hymn_count}</td>
                    <td>${hymnList}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }
    
    // 輔助方法
    getCategoryName(categoryId) {
        const category = window.hymnDatabase.databases.categories.find(c => c.id === categoryId);
        return category ? category.name : '未分類';
    }
    
    getPersonName(personId) {
        if (!personId) return '-';
        const person = window.hymnDatabase.databases.people.find(p => p.id === personId);
        return person ? person.full_name : '未知';
    }
    
    generateSummary(stats, categoryStats) {
        const totalHymns = stats.total_hymns;
        const topCategory = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)[0];
        
        return {
            total_hymns: totalHymns,
            top_category: topCategory ? `${topCategory[0]} (${topCategory[1]}首)` : '無',
            coverage_rate: totalHymns > 0 ? '100%' : '0%'
        };
    }
}

// 創建全局實例
window.reportGenerator = new HymnReportGenerator();
console.log('報表生成器初始化完成');




