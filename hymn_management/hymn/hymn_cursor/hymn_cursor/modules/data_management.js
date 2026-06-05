/**
 * 聖詩數據管理系統
 * 提供數據統計、分析和導出功能
 */

class HymnDataManagement {
    constructor() {
        this.hymnData = [];
        this.statistics = {};
        this.settings = {
            autoBackup: true,
            backupInterval: 24, // 小時
            exportFormat: 'csv'
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.createDataManagementInterface();
        this.bindEvents();
        this.updateStatistics();
    }

    // 創建數據管理界面
    createDataManagementInterface() {
        const container = document.createElement('div');
        container.id = 'hymn-data-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            background: white;
            border: 2px solid #2196F3;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            min-width: 350px;
            display: none;
        `;

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #2196F3; font-size: 16px;">📊 數據管理</h3>
                <button id="close-data" style="background: #f44336; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">✕</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">📈 數據統計</h4>
                <div id="data-stats" style="background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">
                    <div>總聖詩數量: <span id="total-count">計算中...</span></div>
                    <div>語言分布: <span id="language-dist">計算中...</span></div>
                    <div>編號範圍: <span id="number-range">計算中...</span></div>
                    <div>標題長度: <span id="title-length">計算中...</span></div>
                    <div>主要作者: <span id="top-authors">計算中...</span></div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">🔍 數據分析</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button id="analyze-language" style="background: #4CAF50; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">語言分析</button>
                    <button id="analyze-numbers" style="background: #FF9800; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">編號分析</button>
                    <button id="analyze-titles" style="background: #9C27B0; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">標題分析</button>
                    <button id="analyze-authors" style="background: #607D8B; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">作者分析</button>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">💾 數據導出</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button id="export-csv" style="background: #4CAF50; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">CSV格式</button>
                    <button id="export-json" style="background: #FF9800; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">JSON格式</button>
                    <button id="export-stats" style="background: #9C27B0; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">統計報告</button>
                    <button id="export-backup" style="background: #607D8B; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">完整備份</button>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">🔧 數據維護</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button id="validate-data" style="background: #FF5722; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">數據驗證</button>
                    <button id="clean-data" style="background: #795548; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">數據清理</button>
                    <button id="backup-settings" style="background: #607D8B; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">備份設置</button>
                    <button id="restore-settings" style="background: #009688; color: white; border: none; border-radius: 5px; padding: 8px; cursor: pointer; font-size: 12px;">恢復設置</button>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
                    <div>⚙️ 快捷鍵: Ctrl+D 打開數據管理</div>
                    <div>🔄 自動備份: <span id="backup-status">${this.settings.autoBackup ? '已啟用' : '已禁用'}</span></div>
                </div>
            </div>
        `;

        document.body.appendChild(container);
    }

    // 綁定事件
    bindEvents() {
        // 關閉按鈕
        document.getElementById('close-data').addEventListener('click', () => {
            this.hideDataManagementInterface();
        });

        // 數據分析按鈕
        document.getElementById('analyze-language').addEventListener('click', () => {
            this.analyzeLanguageDistribution();
        });

        document.getElementById('analyze-numbers').addEventListener('click', () => {
            this.analyzeNumberDistribution();
        });

        document.getElementById('analyze-titles').addEventListener('click', () => {
            this.analyzeTitleLength();
        });

        document.getElementById('analyze-authors').addEventListener('click', () => {
            this.analyzeAuthorStats();
        });

        // 數據導出按鈕
        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.exportToJSON();
        });

        document.getElementById('export-stats').addEventListener('click', () => {
            this.exportStatistics();
        });

        document.getElementById('export-backup').addEventListener('click', () => {
            this.exportFullBackup();
        });

        // 數據維護按鈕
        document.getElementById('validate-data').addEventListener('click', () => {
            this.validateData();
        });

        document.getElementById('clean-data').addEventListener('click', () => {
            this.cleanData();
        });

        document.getElementById('backup-settings').addEventListener('click', () => {
            this.backupSettings();
        });

        document.getElementById('restore-settings').addEventListener('click', () => {
            this.restoreSettings();
        });

        // 快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDataManagementInterface();
            }
        });
    }

    // 更新統計數據
    updateStatistics() {
        if (window.hymnSearchEnhancement && window.hymnSearchEnhancement.hymnData) {
            this.hymnData = window.hymnSearchEnhancement.hymnData;
            this.calculateStatistics();
            this.updateStatsDisplay();
        }
    }

    // 計算統計數據
    calculateStatistics() {
        if (this.hymnData.length === 0) return;

        // 總數量
        this.statistics.totalCount = this.hymnData.length;

        // 語言分布
        this.statistics.languageDistribution = {};
        this.hymnData.forEach(hymn => {
            const lang = hymn.language || 'unknown';
            this.statistics.languageDistribution[lang] = (this.statistics.languageDistribution[lang] || 0) + 1;
        });

        // 編號範圍
        const numbers = this.hymnData.map(h => parseInt(h.number)).filter(n => !isNaN(n));
        this.statistics.numberRange = {
            min: Math.min(...numbers),
            max: Math.max(...numbers),
            average: Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
        };

        // 標題長度
        const titleLengths = this.hymnData.map(h => h.title.length).filter(l => l > 0);
        this.statistics.titleLength = {
            min: Math.min(...titleLengths),
            max: Math.max(...titleLengths),
            average: Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length)
        };

        // 作者統計（從標題中提取）
        this.statistics.authorStats = this.extractAuthorStats();
    }

    // 提取作者統計
    extractAuthorStats() {
        const authorCounts = {};
        this.hymnData.forEach(hymn => {
            // 簡單的作者提取邏輯
            const title = hymn.title;
            if (title.includes('(') && title.includes(')')) {
                const match = title.match(/\(([^)]+)\)/);
                if (match) {
                    const author = match[1].trim();
                    authorCounts[author] = (authorCounts[author] || 0) + 1;
                }
            }
        });

        // 排序並取前5名
        return Object.entries(authorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([author, count]) => ({ author, count }));
    }

    // 更新統計顯示
    updateStatsDisplay() {
        if (!this.statistics.totalCount) return;

        document.getElementById('total-count').textContent = this.statistics.totalCount;
        document.getElementById('language-dist').textContent = Object.entries(this.statistics.languageDistribution)
            .map(([lang, count]) => `${lang}:${count}`).join(', ');
        document.getElementById('number-range').textContent = `${this.statistics.numberRange.min}-${this.statistics.numberRange.max}`;
        document.getElementById('title-length').textContent = `${this.statistics.titleLength.min}-${this.statistics.titleLength.max}字`;
        document.getElementById('top-authors').textContent = this.statistics.authorStats
            .slice(0, 3).map(a => `${a.author}(${a.count})`).join(', ');
    }

    // 語言分布分析
    analyzeLanguageDistribution() {
        if (!this.statistics.languageDistribution) return;

        const data = Object.entries(this.statistics.languageDistribution);
        const message = data.map(([lang, count]) => 
            `${lang}: ${count}首 (${Math.round(count/this.statistics.totalCount*100)}%)`
        ).join('\n');

        alert(`語言分布分析:\n\n${message}`);
    }

    // 編號分布分析
    analyzeNumberDistribution() {
        if (!this.statistics.numberRange) return;

        const { min, max, average } = this.statistics.numberRange;
        const message = `編號分布分析:\n\n` +
                       `最小編號: ${min}\n` +
                       `最大編號: ${max}\n` +
                       `平均編號: ${average}\n` +
                       `編號跨度: ${max - min + 1}`;

        alert(message);
    }

    // 標題長度分析
    analyzeTitleLength() {
        if (!this.statistics.titleLength) return;

        const { min, max, average } = this.statistics.titleLength;
        const message = `標題長度分析:\n\n` +
                       `最短標題: ${min}字\n` +
                       `最長標題: ${max}字\n` +
                       `平均長度: ${average}字`;

        alert(message);
    }

    // 作者統計分析
    analyzeAuthorStats() {
        if (!this.statistics.authorStats || this.statistics.authorStats.length === 0) {
            alert('未找到作者信息');
            return;
        }

        const message = `作者統計分析:\n\n` +
                       this.statistics.authorStats.map(a => 
                           `${a.author}: ${a.count}首`
                       ).join('\n');

        alert(message);
    }

    // 導出為CSV
    exportToCSV() {
        if (this.hymnData.length === 0) {
            alert('沒有數據可導出');
            return;
        }

        const headers = ['編號', '標題', '語言', '詩集', 'URL'];
        const csvContent = [
            headers.join(','),
            ...this.hymnData.map(hymn => 
                [hymn.number, `"${hymn.title}"`, hymn.language, hymn.hymnal, hymn.url].join(',')
            )
        ].join('\n');

        this.downloadFile(csvContent, 'hymn_data.csv', 'text/csv');
    }

    // 導出為JSON
    exportToJSON() {
        if (this.hymnData.length === 0) {
            alert('沒有數據可導出');
            return;
        }

        const jsonContent = JSON.stringify(this.hymnData, null, 2);
        this.downloadFile(jsonContent, 'hymn_data.json', 'application/json');
    }

    // 導出統計報告
    exportStatistics() {
        if (!this.statistics.totalCount) {
            alert('沒有統計數據可導出');
            return;
        }

        const report = `聖詩數據統計報告\n` +
                      `生成時間: ${new Date().toLocaleString()}\n` +
                      `總聖詩數量: ${this.statistics.totalCount}\n\n` +
                      `語言分布:\n${Object.entries(this.statistics.languageDistribution)
                          .map(([lang, count]) => `  ${lang}: ${count}首`)
                          .join('\n')}\n\n` +
                      `編號範圍: ${this.statistics.numberRange.min}-${this.statistics.numberRange.max}\n` +
                      `標題長度: ${this.statistics.titleLength.min}-${this.statistics.titleLength.max}字\n\n` +
                      `主要作者:\n${this.statistics.authorStats
                          .map(a => `  ${a.author}: ${a.count}首`)
                          .join('\n')}`;

        this.downloadFile(report, 'hymn_statistics.txt', 'text/plain');
    }

    // 導出完整備份
    exportFullBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            hymnData: this.hymnData,
            statistics: this.statistics,
            settings: this.settings
        };

        const jsonContent = JSON.stringify(backup, null, 2);
        this.downloadFile(jsonContent, `hymn_backup_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
    }

    // 下載文件
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 數據驗證
    validateData() {
        if (this.hymnData.length === 0) {
            alert('沒有數據可驗證');
            return;
        }

        const issues = [];
        this.hymnData.forEach((hymn, index) => {
            if (!hymn.number || !/^\d{4}$/.test(hymn.number)) {
                issues.push(`第${index + 1}條: 編號格式錯誤 (${hymn.number})`);
            }
            if (!hymn.title || hymn.title.length < 2) {
                issues.push(`第${index + 1}條: 標題過短 (${hymn.title})`);
            }
            if (!hymn.url) {
                issues.push(`第${index + 1}條: 缺少URL`);
            }
        });

        if (issues.length === 0) {
            alert('數據驗證通過！所有數據格式正確。');
        } else {
            alert(`數據驗證發現 ${issues.length} 個問題:\n\n${issues.join('\n')}`);
        }
    }

    // 數據清理
    cleanData() {
        if (this.hymnData.length === 0) {
            alert('沒有數據可清理');
            return;
        }

        const originalCount = this.hymnData.length;
        this.hymnData = this.hymnData.filter(hymn => 
            hymn.number && /^\d{4}$/.test(hymn.number) &&
            hymn.title && hymn.title.length >= 2 &&
            hymn.url
        );

        const cleanedCount = originalCount - this.hymnData.length;
        alert(`數據清理完成！\n清理前: ${originalCount} 條\n清理後: ${this.hymnData.length} 條\n清理掉: ${cleanedCount} 條無效數據`);

        this.updateStatistics();
    }

    // 備份設置
    backupSettings() {
        const settingsBackup = JSON.stringify(this.settings, null, 2);
        this.downloadFile(settingsBackup, 'hymn_settings_backup.json', 'application/json');
    }

    // 恢復設置
    restoreSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target.result);
                        this.settings = { ...this.settings, ...settings };
                        this.saveSettings();
                        alert('設置恢復成功！');
                    } catch (error) {
                        alert('設置文件格式錯誤！');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // 保存設置
    saveSettings() {
        localStorage.setItem('hymnDataSettings', JSON.stringify(this.settings));
    }

    // 加載設置
    loadSettings() {
        const saved = localStorage.getItem('hymnDataSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (error) {
                console.error('加載設置失敗:', error);
            }
        }
    }

    // 顯示數據管理界面
    showDataManagementInterface() {
        document.getElementById('hymn-data-container').style.display = 'block';
        this.updateStatistics();
    }

    // 隱藏數據管理界面
    hideDataManagementInterface() {
        document.getElementById('hymn-data-container').style.display = 'none';
    }

    // 切換數據管理界面
    toggleDataManagementInterface() {
        const container = document.getElementById('hymn-data-container');
        if (container.style.display === 'block') {
            this.hideDataManagementInterface();
        } else {
            this.showDataManagementInterface();
        }
    }
}

// 創建數據管理實例
window.hymnDataManagement = new HymnDataManagement();
