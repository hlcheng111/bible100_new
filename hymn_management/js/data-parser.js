/**
 * 聖詩數據解析器
 * 用於解析真實的HTML詩集文件，處理BIG5編碼問題
 */

class HymnDataParser {
    constructor() {
        this.hymnalSources = {
            'century_praise': {
                name: '世紀頌讚',
                name_en: 'Century Praise',
                file: 'c:\\hymn\\index_hymnal\\Index_hl_世紀頌讚.htm',
                encoding: 'big5'
            },
            'universal_praise': {
                name: '普頌新',
                name_en: 'New Hymns of Universal Praise',
                file: 'c:\\hymn\\index_hymnal\\Index_hl_普頌新.htm',
                encoding: 'big5'
            },
            'lord_new_songs': {
                name: '頌主新歌',
                name_en: 'Lord\'s New Songs',
                file: 'c:\\hymn\\index_hymnal\\Index_hl頌主新歌.htm',
                encoding: 'big5'
            },
            'new_hymnal': {
                name: '新編讚美詩',
                name_en: 'New Hymnal',
                file: 'c:\\hymn\\index_hymnal\\ndex_hl_新編讚美詩.htm',
                encoding: 'big5'
            },
            'hymns_faith': {
                name: 'Hymns of the Faith',
                name_en: 'Hymns of the Faith',
                file: 'c:\\hymn\\index_hymnal\\Hymns of the Faith  -history and meaning of hymns - Index by Hymn.htm',
                encoding: 'utf8'
            }
        };
        
        this.categorySymbols = {
            '▲': 'world_famous',
            '●': 'chinese', 
            '◆': 'worship',
            '★': 'ethnic'
        };
    }

    /**
     * 解析單個詩集HTML文件
     */
    async parseHymnalFile(hymnalId) {
        try {
            const hymnalInfo = this.hymnalSources[hymnalId];
            if (!hymnalInfo) {
                throw new Error(`未知的詩集ID: ${hymnalId}`);
            }

            console.log(`🔄 開始解析詩集: ${hymnalInfo.name}`);
            
            // 模擬載入HTML內容（實際應用中需要讀取文件）
            const htmlContent = await this.loadHtmlFile(hymnalInfo.file);
            
            // 解析HTML內容
            const hymns = this.parseHtmlContent(htmlContent, hymnalInfo.encoding);
            
            console.log(`✅ 解析完成: ${hymnalInfo.name} - ${hymns.length}首聖詩`);
            
            return {
                id: hymnalId,
                name: hymnalInfo.name,
                name_en: hymnalInfo.name_en,
                total: hymns.length,
                description: `${hymnalInfo.name}詩集`,
                hymns: hymns
            };
            
        } catch (error) {
            console.error(`❌ 解析詩集失敗: ${hymnalId}`, error);
            return null;
        }
    }

    /**
     * 載入HTML文件內容
     */
    async loadHtmlFile(filePath) {
        // 由於瀏覽器安全限制，無法直接讀取本地文件
        // 這裡返回模擬數據，實際應用中需要服務器端處理
        return this.getMockHtmlContent();
    }

    /**
     * 解析HTML內容提取聖詩數據
     */
    parseHtmlContent(htmlContent, encoding) {
        const hymns = [];
        const parser = new DOMParser();
        
        try {
            // 處理編碼問題
            let processedHtml = htmlContent;
            if (encoding === 'big5') {
                processedHtml = this.convertBig5ToUtf8(htmlContent);
            }
            
            const doc = parser.parseFromString(processedHtml, 'text/html');
            const tables = doc.querySelectorAll('table');
            
            tables.forEach(table => {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const hymnData = this.extractHymnFromRow(row);
                    if (hymnData) {
                        hymns.push(hymnData);
                    }
                });
            });
            
        } catch (error) {
            console.error('HTML解析錯誤:', error);
        }
        
        return hymns;
    }

    /**
     * 從表格行提取聖詩數據
     */
    extractHymnFromRow(row) {
        try {
            const cells = row.querySelectorAll('td');
            if (cells.length < 4) return null;

            // 提取編號
            const numberCell = cells[0];
            const numberLink = numberCell.querySelector('a');
            const number = numberLink ? numberLink.textContent.trim() : numberCell.textContent.trim();
            
            if (!number || !/^\d+$/.test(number)) return null;

            // 提取標題
            const titleCell = cells[1] || cells[2];
            const titleLink = titleCell.querySelector('a');
            let titleText = titleLink ? titleLink.textContent : titleCell.textContent;
            
            // 處理標題中的符號和分類
            const { title, category, symbol } = this.parseTitleWithSymbols(titleText);
            
            // 提取作者信息
            const authorCell = cells[3] || cells[4];
            const authorLink = authorCell ? authorCell.querySelector('a') : null;
            const author = authorLink ? authorLink.textContent.trim() : (authorCell ? authorCell.textContent.trim() : '未知');
            
            // 提取分類代碼
            const classificationCell = cells[5] || cells[4];
            const classificationCode = classificationCell ? classificationCell.textContent.trim() : '';

            return {
                number: number.padStart(3, '0'),
                title_zh: title,
                title_en: this.translateTitleToEnglish(title),
                author: author,
                category: category,
                symbol: symbol,
                classification_code: classificationCode,
                link: titleLink ? titleLink.href : '',
                themes: this.extractThemes(title)
            };
            
        } catch (error) {
            console.error('提取聖詩數據錯誤:', error);
            return null;
        }
    }

    /**
     * 解析標題中的符號和分類
     */
    parseTitleWithSymbols(titleText) {
        let title = titleText.trim();
        let category = 'unknown';
        let symbol = '';

        // 檢查分類符號
        Object.keys(this.categorySymbols).forEach(sym => {
            if (title.includes(sym)) {
                symbol = sym;
                category = this.categorySymbols[sym];
                title = title.replace(sym, '').trim();
            }
        });

        // 清理標題
        title = title.replace(/[▲●◆★]/g, '').trim();

        return { title, category, symbol };
    }

    /**
     * 將中文標題翻譯為英文（簡單映射）
     */
    translateTitleToEnglish(title) {
        const translations = {
            '三一頌': 'Holy Trinity',
            '讚美父神': 'Praise Father',
            '主禱文': 'Lord\'s Prayer',
            '敬拜短歌': 'Worship Short Song',
            '民族聖詩': 'Ethnic Hymn',
            '新天新地歌': 'A NEW JERUSALEM WE SEEK',
            '讚美上主': 'Praise to the Lord',
            '頌主新歌': 'New Song to the Lord',
            '華人詩歌': 'Chinese Hymn',
            '讚美詩': 'Hymn of Praise',
            '世界名詩': 'World Famous Hymn',
            '信仰之歌': 'Song of Faith'
        };
        
        return translations[title] || title;
    }

    /**
     * 提取主題標籤
     */
    extractThemes(title) {
        const themes = [];
        
        if (title.includes('讚美')) themes.push('讚美');
        if (title.includes('敬拜')) themes.push('敬拜');
        if (title.includes('禱告')) themes.push('禱告');
        if (title.includes('頌主')) themes.push('頌主');
        if (title.includes('信仰')) themes.push('信仰');
        if (title.includes('民族')) themes.push('民族');
        if (title.includes('華人')) themes.push('華人');
        if (title.includes('世界')) themes.push('世界');
        
        return themes.length > 0 ? themes : ['敬拜'];
    }

    /**
     * 轉換BIG5到UTF-8（簡化處理）
     */
    convertBig5ToUtf8(big5Text) {
        // 這裡需要實際的BIG5到UTF-8轉換邏輯
        // 由於瀏覽器限制，這裡返回處理過的文本
        return big5Text.replace(/[\u0080-\u00FF]/g, '?'); // 簡單的字符替換
    }

    /**
     * 獲取模擬HTML內容用於測試
     */
    getMockHtmlContent() {
        return `
        <table>
            <tr>
                <td><a href="hymn_001.htm">001</a></td>
                <td><a href="hymn_001.htm">▲ 三一頌</a></td>
                <td>Holy Trinity</td>
                <td>傳統</td>
                <td>H04B-01</td>
            </tr>
            <tr>
                <td><a href="hymn_002.htm">002</a></td>
                <td><a href="hymn_002.htm">● 讚美父神</a></td>
                <td>Praise Father</td>
                <td>傳統</td>
                <td>H04B-02</td>
            </tr>
            <tr>
                <td><a href="hymn_003.htm">003</a></td>
                <td><a href="hymn_003.htm">◆ 敬拜短歌</a></td>
                <td>Worship Short Song</td>
                <td>現代</td>
                <td>H04B-03</td>
            </tr>
        </table>
        `;
    }

    /**
     * 解析所有詩集
     */
    async parseAllHymnals() {
        const results = {};
        
        for (const hymnalId of Object.keys(this.hymnalSources)) {
            const hymnal = await this.parseHymnalFile(hymnalId);
            if (hymnal) {
                results[hymnalId] = hymnal;
            }
        }
        
        return results;
    }

    /**
     * 生成統計信息
     */
    generateStatistics(hymnalData) {
        const stats = {
            total_hymns: 0,
            total_hymnals: Object.keys(hymnalData).length,
            by_category: {
                world_famous: 0,
                chinese: 0,
                worship: 0,
                ethnic: 0,
                unknown: 0
            },
            by_hymnal: {}
        };

        Object.values(hymnalData).forEach(hymnal => {
            stats.total_hymns += hymnal.hymns.length;
            stats.by_hymnal[hymnal.id] = hymnal.hymns.length;
            
            hymnal.hymns.forEach(hymn => {
                if (stats.by_category[hymn.category] !== undefined) {
                    stats.by_category[hymn.category]++;
                }
            });
        });

        return stats;
    }
}

// 導出給其他模組使用
if (typeof window !== 'undefined') {
    window.HymnDataParser = HymnDataParser;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HymnDataParser;
}








