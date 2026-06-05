/**
 * 智能聖詩掃描器
 * 自動掃描所有目錄，識別不同編號系統
 */

class HymnSmartScanner {
    constructor() {
        this.hymnData = [];
        this.scanResults = {
            totalFiles: 0,
            processedFiles: 0,
            errors: [],
            statistics: {}
        };
    }

    /**
     * 掃描所有聖詩目錄
     */
    async scanAllDirectories() {
        console.log('🔍 開始智能掃描聖詩文件...');
        
        const directories = [
            'hymn_chi',           // 中文聖詩
            'hymn_author',        // 作者資料
            'Hymnology',          // 聖詩學
            'hymn_hymnal_index',  // 聖詩集索引
            '00webpage_temp',     // 臨時網頁
            'hy_textbook',        // 聖詩教材
            'hymn_00',            // 聖詩00系列
            'hymn_22',            // 聖詩22系列
            'hymn_23',            // 聖詩23系列
            'hymn_new',           // 新聖詩
            'hymn_most',          // 最受歡迎聖詩
            'hymn_world'          // 世界聖詩
        ];

        for (const dir of directories) {
            await this.scanDirectory(dir);
        }

        // 生成統計信息
        this.generateStatistics();
        
        console.log('✅ 掃描完成！');
        console.log(`📊 總文件數: ${this.scanResults.totalFiles}`);
        console.log(`✅ 處理成功: ${this.scanResults.processedFiles}`);
        console.log(`❌ 處理錯誤: ${this.scanResults.errors.length}`);
        
        return this.hymnData;
    }

    /**
     * 掃描單個目錄
     */
    async scanDirectory(directory) {
        const dirPath = `C:/hymn/${directory}`;
        
        try {
            // 模擬文件掃描（實際需要文件系統API）
            const files = this.getMockFiles(directory);
            
            for (const file of files) {
                this.scanResults.totalFiles++;
                
                try {
                    const hymnInfo = this.extractHymnInfo(file, directory);
                    if (hymnInfo) {
                        this.hymnData.push(hymnInfo);
                        this.scanResults.processedFiles++;
                    }
                } catch (error) {
                    this.scanResults.errors.push({
                        file: file.path,
                        error: error.message,
                        directory: directory
                    });
                }
            }
            
            console.log(`📁 ${directory}: 掃描 ${files.length} 個文件`);
            
        } catch (error) {
            console.warn(`⚠️ 無法掃描目錄 ${directory}:`, error.message);
        }
    }

    /**
     * 提取聖詩信息
     */
    extractHymnInfo(file, directory) {
        const fileName = file.name;
        const filePath = file.path;
        
        // 智能識別聖詩編號
        const hymnNumber = this.extractHymnNumber(fileName);
        
        // 提取標題和作者
        const titleInfo = this.extractTitleAndAuthor(fileName);
        
        // 識別聖詩集來源
        const source = this.identifyHymnSource(fileName, directory);
        
        // 提取語言信息
        const language = this.extractLanguage(fileName);
        
        // 提取主題標籤
        const themes = this.extractThemes(fileName, titleInfo.title);
        
        // 提取調名信息
        const tune = this.extractTune(fileName);
        
        return {
            id: this.generateUniqueId(filePath),
            hymnNumber: hymnNumber,
            title: titleInfo.title,
            englishTitle: titleInfo.englishTitle,
            author: titleInfo.author,
            composer: titleInfo.composer,
            source: source,
            language: language,
            themes: themes,
            tune: tune,
            directory: directory,
            fileName: fileName,
            filePath: filePath,
            category: this.categorizeHymn(hymnNumber, themes),
            displayOrder: this.calculateDisplayOrder(hymnNumber, source)
        };
    }

    /**
     * 智能提取聖詩編號
     */
    extractHymnNumber(fileName) {
        // 1. 標準編號（4位數字開頭）
        let match = fileName.match(/^(\d{4})/);
        if (match) {
            return {
                primary: match[1],
                type: 'standard',
                display: match[1]
            };
        }

        // 2. 世紀頌讚編號（SS開頭）
        match = fileName.match(/SS(\d{3})/i);
        if (match) {
            return {
                primary: `SS${match[1]}`,
                type: 'century_praise',
                display: `SS${match[1]}`,
                original: match[1]
            };
        }

        // 3. 新編讚美詩編號
        match = fileName.match(/^(\d{3,4})/);
        if (match) {
            return {
                primary: match[1],
                type: 'new_hymnal',
                display: match[1]
            };
        }

        // 4. LX系列編號
        match = fileName.match(/LX(\d{4})/i);
        if (match) {
            return {
                primary: `LX${match[1]}`,
                type: 'lx_series',
                display: `LX${match[1]}`,
                original: match[1]
            };
        }

        // 5. 其他特殊編號
        match = fileName.match(/(\d{3,4})/);
        if (match) {
            return {
                primary: match[1],
                type: 'other',
                display: match[1]
            };
        }

        // 6. 如果沒有數字編號，使用文件名前部分
        const namePart = fileName.split(' ')[0];
        return {
            primary: namePart,
            type: 'filename',
            display: namePart
        };
    }

    /**
     * 提取標題和作者
     */
    extractTitleAndAuthor(fileName) {
        // 移除文件擴展名
        const nameWithoutExt = fileName.replace(/\.(htm|html)$/i, '');
        
        // 分離編號和內容
        const parts = nameWithoutExt.split(' ');
        
        let title = '';
        let englishTitle = '';
        let author = '';
        let composer = '';
        
        // 查找中文標題
        const chineseMatch = nameWithoutExt.match(/[\u4e00-\u9fa5]+/);
        if (chineseMatch) {
            title = chineseMatch[0];
        }
        
        // 查找英文標題
        const englishMatch = nameWithoutExt.match(/[A-Z][a-zA-Z\s]+/);
        if (englishMatch) {
            englishTitle = englishMatch[0].trim();
        }
        
        // 查找作者（括號內）
        const authorMatch = nameWithoutExt.match(/\(([^)]+)\)/);
        if (authorMatch) {
            const authorText = authorMatch[1];
            // 分離作詞和作曲
            if (authorText.includes(' ')) {
                const authorParts = authorText.split(' ');
                author = authorParts[0];
                composer = authorParts[1];
            } else {
                author = authorText;
            }
        }
        
        return {
            title: title || nameWithoutExt,
            englishTitle: englishTitle,
            author: author,
            composer: composer
        };
    }

    /**
     * 識別聖詩集來源
     */
    identifyHymnSource(fileName, directory) {
        const sources = {
            'hymn_chi': '中文聖詩',
            'hymn_author': '作者資料',
            'Hymnology': '聖詩學',
            'hymn_hymnal_index': '聖詩集索引',
            'hymn_new': '新聖詩',
            'hymn_most': '熱門聖詩',
            'hymn_world': '世界聖詩'
        };

        // 根據目錄確定來源
        let source = sources[directory] || directory;

        // 根據文件名進一步識別
        if (fileName.includes('世紀頌讚') || fileName.includes('SS')) {
            source = '世紀頌讚';
        } else if (fileName.includes('新編') || fileName.includes('新譯')) {
            source = '新編讚美詩';
        } else if (fileName.includes('頌主新歌')) {
            source = '頌主新歌';
        } else if (fileName.includes('LX')) {
            source = 'LX系列';
        }

        return source;
    }

    /**
     * 提取語言信息
     */
    extractLanguage(fileName) {
        if (fileName.includes('[華]') || fileName.includes('中文')) {
            return 'chinese';
        } else if (fileName.includes('[英]') || fileName.includes('English')) {
            return 'english';
        } else if (fileName.includes('[台]') || fileName.includes('台語')) {
            return 'taiwanese';
        } else if (fileName.match(/[\u4e00-\u9fa5]/)) {
            return 'chinese';
        } else if (fileName.match(/[A-Za-z]/)) {
            return 'english';
        }
        return 'mixed';
    }

    /**
     * 提取主題標籤
     */
    extractThemes(fileName, title) {
        const searchText = `${fileName} ${title}`.toLowerCase();
        const themes = [];
        
        const themeKeywords = {
            '讚美': ['讚美', '讚頌', '榮耀', '哈利路亞', 'praise', 'glory'],
            '敬拜': ['敬拜', '崇拜', '禮拜', '獻上', 'worship', 'adore'],
            '救恩': ['救恩', '拯救', '贖罪', '十字架', 'salvation', 'cross'],
            '愛': ['愛', '慈愛', '恩典', '憐憫', 'love', 'grace'],
            '希望': ['希望', '盼望', '安慰', '平安', 'hope', 'peace'],
            '聖誕': ['聖誕', '耶穌降生', '馬槽', '東方博士', 'christmas', 'nativity'],
            '復活': ['復活', '復活節', '主復活', '得勝', 'resurrection', 'easter'],
            '聖靈': ['聖靈', '聖神', '靈火', '復興', 'spirit', 'revival'],
            '宣教': ['宣教', '傳道', '福音', '差傳', 'mission', 'evangelism'],
            '家庭': ['家庭', '婚姻', '親子', '孝順', 'family', 'marriage']
        };

        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            for (const keyword of keywords) {
                if (searchText.includes(keyword.toLowerCase())) {
                    themes.push(theme);
                    break;
                }
            }
        }

        return [...new Set(themes)];
    }

    /**
     * 提取調名
     */
    extractTune(fileName) {
        // 查找調名（通常是大寫字母組合）
        const tuneMatch = fileName.match(/([A-Z]{2,6})\s/);
        if (tuneMatch) {
            return tuneMatch[1];
        }
        return null;
    }

    /**
     * 生成唯一ID
     */
    generateUniqueId(filePath) {
        return filePath.replace(/[^a-zA-Z0-9]/g, '_');
    }

    /**
     * 分類聖詩
     */
    categorizeHymn(hymnNumber, themes) {
        // 根據編號類型分類
        if (hymnNumber.type === 'century_praise') {
            return '世紀頌讚';
        } else if (hymnNumber.type === 'lx_series') {
            return 'LX系列';
        } else if (hymnNumber.primary && parseInt(hymnNumber.primary) <= 1000) {
            return '經典聖詩';
        } else if (themes.includes('聖誕')) {
            return '聖誕節';
        } else if (themes.includes('復活')) {
            return '復活節';
        }
        return '一般聖詩';
    }

    /**
     * 計算顯示順序
     */
    calculateDisplayOrder(hymnNumber, source) {
        let order = 0;
        
        // 標準編號優先
        if (hymnNumber.type === 'standard') {
            order = parseInt(hymnNumber.primary) || 9999;
        } else if (hymnNumber.type === 'century_praise') {
            order = 10000 + parseInt(hymnNumber.original) || 19999;
        } else if (hymnNumber.type === 'lx_series') {
            order = 20000 + parseInt(hymnNumber.original) || 29999;
        } else {
            order = 50000;
        }
        
        return order;
    }

    /**
     * 獲取模擬文件數據
     */
    getMockFiles(directory) {
        // 基於實際觀察到的文件結構生成模擬數據
        const mockFiles = {
            'hymn_chi': [
                { name: '0920 大秦景教三威蒙度讚 [華].htm', path: 'hymn_chi/0920 大秦景教三威蒙度讚 [華].htm' },
                { name: '0952 Lamb of God 神的羔羊 _Twila Paris (4) ● .htm', path: 'hymn_chi/0952 Lamb of God 神的羔羊 _Twila Paris (4) ● .htm' },
                { name: '1261 The Mountain Shall Depart _蘇佐揚 大山可以挪开 [華].htm', path: 'hymn_chi/1261 The Mountain Shall Depart _蘇佐揚 大山可以挪开 [華].htm' },
                { name: '1387 願那靈火復興我 Holy Spirit Revive Me (楊伯倫) [華].htm', path: 'hymn_chi/1387 願那靈火復興我 Holy Spirit Revive Me (楊伯倫) [華].htm' },
                { name: '1392 324 歸家喜樂 (張逢源) Joy of Coming to the Father\'s Home [華].htm', path: 'hymn_chi/1392 324 歸家喜樂 (張逢源) Joy of Coming to the Father\'s Home [華].htm' },
                { name: 'LX1291 Another Year Is Gone 595又是一年过去 [華].htm', path: 'hymn_chi/LX1291 Another Year Is Gone 595又是一年过去 [華].htm' },
                { name: 'SS001 Heilig, heilig, heilig 聖哉，聖哉，聖哉 (Schubert，1797－1828).htm', path: 'hymn_chi/SS001 Heilig, heilig, heilig 聖哉，聖哉，聖哉 (Schubert，1797－1828).htm' }
            ],
            'hymn_author': [
                { name: 'Author_Composer_Index 聖詩作詞作曲者.htm', path: 'hymn_author/Author_Composer_Index 聖詩作詞作曲者.htm' },
                { name: 'Wesley, Charles 查理衛斯理 (1707-1788） [H04B_01 英國].htm', path: 'hymn_author/Wesley, Charles 查理衛斯理 (1707-1788） [H04B_01 英國].htm' },
                { name: 'Watts, Isaac (1674-1748) 以撒华滋 [H03_01 英國].htm', path: 'hymn_author/Watts, Isaac (1674-1748) 以撒华滋 [H03_01 英國].htm' }
            ],
            'Hymnology': [
                { name: '《圣诗在崇拜音乐中的功能》.htm', path: 'Hymnology/《圣诗在崇拜音乐中的功能》.htm' },
                { name: '250 Most Popular Hymn (hymnary.htm', path: 'Hymnology/250 Most Popular Hymn (hymnary.htm' }
            ]
        };

        return mockFiles[directory] || [];
    }

    /**
     * 生成統計信息
     */
    generateStatistics() {
        const stats = {
            totalHymns: this.hymnData.length,
            byLanguage: {},
            bySource: {},
            byTheme: {},
            byCategory: {},
            byNumberType: {}
        };

        for (const hymn of this.hymnData) {
            // 語言統計
            stats.byLanguage[hymn.language] = (stats.byLanguage[hymn.language] || 0) + 1;
            
            // 來源統計
            stats.bySource[hymn.source] = (stats.bySource[hymn.source] || 0) + 1;
            
            // 分類統計
            stats.byCategory[hymn.category] = (stats.byCategory[hymn.category] || 0) + 1;
            
            // 編號類型統計
            stats.byNumberType[hymn.hymnNumber.type] = (stats.byNumberType[hymn.hymnNumber.type] || 0) + 1;
            
            // 主題統計
            for (const theme of hymn.themes) {
                stats.byTheme[theme] = (stats.byTheme[theme] || 0) + 1;
            }
        }

        this.scanResults.statistics = stats;
        return stats;
    }

    /**
     * 導出數據
     */
    exportData() {
        const exportData = {
            hymns: this.hymnData,
            statistics: this.scanResults.statistics,
            scanResults: this.scanResults,
            exportTime: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }
}

// 使用示例
const scanner = new HymnSmartScanner();
scanner.scanAllDirectories().then(data => {
    console.log('掃描結果:', data);
    console.log('統計信息:', scanner.scanResults.statistics);
});

module.exports = HymnSmartScanner;










