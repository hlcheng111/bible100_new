// 🎵 聖詩智能分解引擎 v3.0 - 多數據庫分類版
// 功能：智能判斷數據類型，自動分類到合適的數據庫模組

class EnhancedSmartDecompositionEngine {
    constructor() {
        this.database = null;
        this.parsingRules = this.initializeParsingRules();
        this.classificationRules = this.initializeClassificationRules();
        this.mediaTypes = ['youtube_video', 'mp3', 'score', 'image', 'article', 'hymnal'];
        this.importanceLevels = ['▲▲', '▲', '★', '●', '◆'];
    }

    // 初始化解析規則
    initializeParsingRules() {
        return {
            // 編號模式：4位數字開頭
            numberPattern: /^(\d{4})/,
            
            // 詩集編號模式：世紀002, 頌讚001等
            hymnalNumberPattern: /(世紀|頌讚|讚美|新編|生命|青年|兒童)(\d{3})/,
            
            // 英文標題：大寫字母開頭，可能包含空格和標點
            englishTitlePattern: /([A-Z][A-Za-z\s\-\'\"\.]+?)(?=\s*[_\-\()]|\s*$)/,
            
            // 作者：括號內或下劃線後
            authorPattern: /[_\-\()]([A-Za-z\s]+?)[\)]?/,
            
            // 中文標題：中文字符
            chineseTitlePattern: /[\u4e00-\u9fff]+/g,
            
            // 分類代碼：H開頭後跟數字和連字符
            categoryPattern: /H\d{2}-\d{2}/,
            
            // 重要性標記
            importancePattern: /[▲★●◆]+/g,
            
            // 時間戳模式：0:00:00
            timestampPattern: /(\d+:\d+:\d+)/,
            
            // 曲調名稱
            tunePattern: /([A-Z][A-Za-z\s]+)(?=\s*$|\s*[_\-\()])/
        };
    }

    // 初始化分類規則
    initializeClassificationRules() {
        return {
            // 詩集識別關鍵詞
            hymnalKeywords: ['世紀', '頌讚', '讚美', '新編', '生命', '青年', '兒童', '詩集', '歌本'],
            
            // 曲譜識別關鍵詞
            scoreKeywords: ['曲譜', '樂譜', '五線譜', '簡譜', '鋼琴譜', '吉他譜'],
            
            // 音頻識別關鍵詞
            audioKeywords: ['MP3', 'WAV', 'FLAC', '音頻', '錄音', '演唱'],
            
            // 視頻識別關鍵詞
            videoKeywords: ['視頻', '錄像', '演唱會', 'MV', 'YouTube', '播放列表'],
            
            // 書籍識別關鍵詞
            bookKeywords: ['書本', '書籍', '教材', '教程', '手冊', '指南']
        };
    }

    // 設置數據庫連接
    setDatabase(database) {
        this.database = database;
        console.log('✅ 增強版智能分解引擎已連接到數據庫');
    }

    // 智能分類判斷
    classifyData(data, context = '') {
        const classification = {
            primaryTable: null,
            secondaryTables: [],
            confidence: 0,
            reasoning: []
        };

        // 1. 判斷是否為詩集目錄
        if (this.isHymnalCatalog(data, context)) {
            classification.primaryTable = 'hymnals';
            classification.secondaryTables = ['hymns', 'media'];
            classification.confidence = 0.9;
            classification.reasoning.push('檢測到詩集目錄格式');
        }
        
        // 2. 判斷是否為曲譜
        else if (this.isScore(data, context)) {
            classification.primaryTable = 'media';
            classification.secondaryTables = ['hymns', 'tunes'];
            classification.confidence = 0.8;
            classification.reasoning.push('檢測到曲譜信息');
        }
        
        // 3. 判斷是否為音頻/視頻
        else if (this.isAudioVideo(data, context)) {
            classification.primaryTable = 'media';
            classification.secondaryTables = ['hymns'];
            classification.confidence = 0.8;
            classification.reasoning.push('檢測到音頻/視頻信息');
        }
        
        // 4. 判斷是否為書籍
        else if (this.isBook(data, context)) {
            classification.primaryTable = 'media';
            classification.secondaryTables = ['hymns'];
            classification.confidence = 0.7;
            classification.reasoning.push('檢測到書籍信息');
        }
        
        // 5. 默認為詩歌主表
        else {
            classification.primaryTable = 'hymns';
            classification.secondaryTables = ['media', 'people'];
            classification.confidence = 0.6;
            classification.reasoning.push('默認分類為詩歌主表');
        }

        return classification;
    }

    // 判斷是否為詩集目錄
    isHymnalCatalog(data, context) {
        const text = (data.text || data.original_text || '').toLowerCase();
        const contextLower = context.toLowerCase();
        
        // 檢查詩集關鍵詞
        const hasHymnalKeywords = this.classificationRules.hymnalKeywords.some(keyword => 
            text.includes(keyword) || contextLower.includes(keyword)
        );
        
        // 檢查詩集編號格式
        const hasHymnalNumber = this.parsingRules.hymnalNumberPattern.test(data.text || '');
        
        return hasHymnalKeywords || hasHymnalNumber;
    }

    // 判斷是否為曲譜
    isScore(data, context) {
        const text = (data.text || data.original_text || '').toLowerCase();
        const contextLower = context.toLowerCase();
        
        return this.classificationRules.scoreKeywords.some(keyword => 
            text.includes(keyword) || contextLower.includes(keyword)
        );
    }

    // 判斷是否為音頻/視頻
    isAudioVideo(data, context) {
        const text = (data.text || data.original_text || '').toLowerCase();
        const contextLower = context.toLowerCase();
        
        const hasAudioKeywords = this.classificationRules.audioKeywords.some(keyword => 
            text.includes(keyword) || contextLower.includes(keyword)
        );
        
        const hasVideoKeywords = this.classificationRules.videoKeywords.some(keyword => 
            text.includes(keyword) || contextLower.includes(keyword)
        );
        
        return hasAudioKeywords || hasVideoKeywords;
    }

    // 判斷是否為書籍
    isBook(data, context) {
        const text = (data.text || data.original_text || '').toLowerCase();
        const contextLower = context.toLowerCase();
        
        return this.classificationRules.bookKeywords.some(keyword => 
            text.includes(keyword) || contextLower.includes(keyword)
        );
    }

    // 智能分解單首聖詩
    decomposeHymn(hymnText, originalLink = '', context = '') {
        try {
            const decomposition = {
                original_text: hymnText,
                original_link: originalLink,
                context: context,
                parsed: false,
                errors: [],
                data: {},
                classification: null
            };

            // 1. 智能分類判斷
            decomposition.classification = this.classifyData({ text: hymnText }, context);

            // 2. 提取編號
            const numberMatch = hymnText.match(this.parsingRules.numberPattern);
            if (numberMatch) {
                decomposition.data.number = numberMatch[1];
            }

            // 3. 提取詩集編號
            const hymnalNumberMatch = hymnText.match(this.parsingRules.hymnalNumberPattern);
            if (hymnalNumberMatch) {
                decomposition.data.hymnal_number = hymnalNumberMatch[0];
                decomposition.data.hymnal_type = hymnalNumberMatch[1];
                decomposition.data.hymnal_sequence = hymnalNumberMatch[2];
            }

            // 4. 提取英文標題
            const englishMatch = hymnText.match(this.parsingRules.englishTitlePattern);
            if (englishMatch) {
                decomposition.data.title_en = englishMatch[1].trim();
            }

            // 5. 提取中文標題
            const chineseMatches = hymnText.match(this.parsingRules.chineseTitlePattern);
            if (chineseMatches && chineseMatches.length > 0) {
                decomposition.data.title_cn = chineseMatches.join(' ');
            }

            // 6. 提取作者信息
            const authorMatch = hymnText.match(this.parsingRules.authorPattern);
            if (authorMatch) {
                decomposition.data.author = authorMatch[1].trim();
            }

            // 7. 提取分類代碼
            const categoryMatch = hymnText.match(this.parsingRules.categoryPattern);
            if (categoryMatch) {
                decomposition.data.category_code = categoryMatch[0];
            }

            // 8. 提取重要性標記
            const importanceMatch = hymnText.match(this.parsingRules.importancePattern);
            if (importanceMatch) {
                decomposition.data.importance = importanceMatch.join('');
            }

            // 9. 提取時間戳
            const timestampMatch = hymnText.match(this.parsingRules.timestampPattern);
            if (timestampMatch) {
                decomposition.data.timestamp = timestampMatch[1];
            }

            // 10. 提取曲調名稱
            const tuneMatch = hymnText.match(this.parsingRules.tunePattern);
            if (tuneMatch) {
                decomposition.data.tune_name = tuneMatch[1];
            }

            // 11. 解析路徑信息
            if (originalLink) {
                const pathInfo = this.parsePathFromLink(originalLink);
                decomposition.data.directory_path = pathInfo.directory;
                decomposition.data.file_name = pathInfo.filename;
            }

            decomposition.parsed = true;
            return decomposition;

        } catch (error) {
            return {
                original_text: hymnText,
                original_link: originalLink,
                context: context,
                parsed: false,
                errors: [error.message],
                data: {},
                classification: null
            };
        }
    }

    // 從鏈接解析路徑信息
    parsePathFromLink(link) {
        try {
            const url = new URL(link);
            const pathParts = url.pathname.split('/').filter(part => part);
            
            if (pathParts.length >= 2) {
                return {
                    directory: pathParts.slice(0, -1).join('/'),
                    filename: pathParts[pathParts.length - 1]
                };
            }
            
            return { directory: '', filename: '' };
        } catch {
            // 如果不是有效URL，嘗試解析本地路徑
            const pathParts = link.split('\\').filter(part => part);
            if (pathParts.length >= 2) {
                return {
                    directory: pathParts.slice(0, -1).join('\\'),
                    filename: pathParts[pathParts.length - 1]
                };
            }
            return { directory: '', filename: '' };
        }
    }

    // 批量解析聖詩表格
    async batchDecomposeHymns(tableElement, context = '') {
        if (!this.database) {
            throw new Error('數據庫未連接');
        }

        const results = {
            total: 0,
            success: 0,
            failed: 0,
            details: [],
            classification_summary: {},
            processing_time: 0
        };

        const startTime = Date.now();

        // 獲取表格行
        const rows = tableElement.querySelectorAll('tr');
        results.total = rows.length - 1; // 減去標題行

        console.log(`🔄 開始批量解析 ${results.total} 首聖詩...`);

        // 初始化分類統計
        results.classification_summary = {
            hymns: 0,
            hymnals: 0,
            media: 0,
            scores: 0,
            audio_video: 0,
            books: 0
        };

        for (let i = 1; i < rows.length; i++) { // 跳過標題行
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            
            if (cells.length === 0) continue;

            try {
                // 提取行文本和鏈接
                const rowText = row.textContent.trim();
                const linkElement = row.querySelector('a');
                const originalLink = linkElement ? linkElement.href : '';

                // 智能分解
                const decomposition = this.decomposeHymn(rowText, originalLink, context);

                if (decomposition.parsed) {
                    // 更新分類統計
                    if (decomposition.classification) {
                        const primaryTable = decomposition.classification.primaryTable;
                        if (results.classification_summary[primaryTable] !== undefined) {
                            results.classification_summary[primaryTable]++;
                        }
                    }

                    // 導入到數據庫
                    const hymnId = await this.importToDatabase(decomposition);
                    
                    results.success++;
                    results.details.push({
                        row: i,
                        hymn_id: hymnId,
                        status: 'success',
                        data: decomposition.data,
                        classification: decomposition.classification
                    });

                    // 更新進度
                    if (i % 100 === 0) {
                        console.log(`📊 已處理 ${i}/${results.total} 首聖詩...`);
                    }
                } else {
                    results.failed++;
                    results.details.push({
                        row: i,
                        status: 'failed',
                        errors: decomposition.errors,
                        data: decomposition.data,
                        classification: decomposition.classification
                    });
                }

            } catch (error) {
                results.failed++;
                results.details.push({
                    row: i,
                    status: 'error',
                    errors: [error.message],
                    classification: null
                });
            }
        }

        results.processing_time = Date.now() - startTime;

        console.log(`✅ 批量解析完成！成功: ${results.success}, 失敗: ${results.failed}`);
        console.log(`📊 分類統計:`, results.classification_summary);
        console.log(`⏱️ 處理時間: ${results.processing_time}ms`);

        return results;
    }

    // 導入到數據庫
    async importToDatabase(decomposition) {
        try {
            // 根據分類決定導入策略
            if (decomposition.classification && decomposition.classification.primaryTable === 'hymnals') {
                return await this.importToHymnals(decomposition);
            } else if (decomposition.classification && decomposition.classification.primaryTable === 'media') {
                return await this.importToMedia(decomposition);
            } else {
                // 默認導入到詩歌主表
                return await this.importToHymns(decomposition);
            }
        } catch (error) {
            console.error('導入數據庫失敗:', error);
            throw error;
        }
    }

    // 導入到詩歌主表
    async importToHymns(decomposition) {
        // 檢查是否已存在
        const existingHymn = this.findExistingHymn(decomposition.data);
        
        if (existingHymn) {
            // 更新現有記錄
            return await this.updateExistingHymn(existingHymn.id, decomposition);
        } else {
            // 創建新記錄
            return await this.createNewHymn(decomposition);
        }
    }

    // 導入到歌集表
    async importToHymnals(decomposition) {
        const hymnalData = {
            name: decomposition.data.hymnal_type || '未知詩集',
            name_cn: decomposition.data.hymnal_type || '未知詩集',
            sequence_number: decomposition.data.hymnal_sequence || '',
            total_hymns: 0,
            notes: `從${decomposition.original_link}導入`
        };

        return await this.database.addHymnal(hymnalData);
    }

    // 導入到媒體表
    async importToMedia(decomposition) {
        // 先確保詩歌存在
        let hymnId = null;
        if (decomposition.data.title_en || decomposition.data.title_cn) {
            const existingHymn = this.findExistingHymn(decomposition.data);
            if (existingHymn) {
                hymnId = existingHymn.id;
            } else {
                // 創建新的詩歌記錄
                hymnId = await this.createNewHymn(decomposition);
            }
        }

        const mediaData = {
            hymn_id: hymnId,
            media_type: this.determineMediaType(decomposition),
            media_title: decomposition.data.title_en || decomposition.data.title_cn || '未知標題',
            media_url: decomposition.original_link || '',
            timestamp: decomposition.data.timestamp || '',
            notes: `智能分類導入: ${decomposition.classification?.reasoning?.join(', ')}`
        };

        return await this.database.addMedia(mediaData);
    }

    // 確定媒體類型
    determineMediaType(decomposition) {
        if (decomposition.data.timestamp) return 'youtube_video';
        if (decomposition.data.hymnal_number) return 'hymnal';
        if (decomposition.classification?.primaryTable === 'media') return 'score';
        return 'unknown';
    }

    // 查找現有聖詩
    findExistingHymn(data) {
        if (!this.database || !this.database.databases) return null;

        const hymns = this.database.databases.hymns;
        
        // 按編號查找
        if (data.number) {
            const byNumber = hymns.find(h => h.number === data.number);
            if (byNumber) return byNumber;
        }

        // 按標題查找
        if (data.title_en) {
            const byTitle = hymns.find(h => 
                h.title_en && h.title_en.toLowerCase() === data.title_en.toLowerCase()
            );
            if (byTitle) return byTitle;
        }

        // 按中文標題查找
        if (data.title_cn) {
            const byChineseTitle = hymns.find(h => 
                h.title_cn && h.title_cn.includes(data.title_cn)
            );
            if (byChineseTitle) return byChineseTitle;
        }

        return null;
    }

    // 創建新聖詩記錄
    async createNewHymn(decomposition) {
        const hymnData = {
            number: decomposition.data.number || '',
            title_en: decomposition.data.title_en || '',
            title_cn: decomposition.data.title_cn || '',
            author: decomposition.data.author || '',
            category_code: decomposition.data.category_code || '',
            importance: decomposition.data.importance || '',
            directory_path: decomposition.data.directory_path || '',
            file_name: decomposition.data.file_name || '',
            original_link: decomposition.original_link || '',
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
        };

        return await this.database.addHymn(hymnData);
    }

    // 更新現有聖詩記錄
    async updateExistingHymn(hymnId, decomposition) {
        const updateData = {
            updated_date: new Date().toISOString()
        };

        // 只更新空白的字段
        if (!this.database.databases.hymns[hymnId - 1].title_en && decomposition.data.title_en) {
            updateData.title_en = decomposition.data.title_en;
        }
        if (!this.database.databases.hymns[hymnId - 1].title_cn && decomposition.data.title_cn) {
            updateData.title_cn = decomposition.data.title_cn;
        }
        if (!this.database.databases.hymns[hymnId - 1].author && decomposition.data.author) {
            updateData.author = decomposition.data.author;
        }

        // 更新記錄
        Object.assign(this.database.databases.hymns[hymnId - 1], updateData);
        this.database.saveToStorage();

        return hymnId;
    }

    // 生成導入報告
    generateImportReport(results) {
        let report = `# 📊 聖詩數據智能分解報告\n\n`;
        report += `**總計**: ${results.total} 首聖詩\n`;
        report += `**成功**: ${results.success} 首\n`;
        report += `**失敗**: ${results.failed} 首\n`;
        report += `**成功率**: ${((results.success / results.total) * 100).toFixed(1)}%\n`;
        report += `**處理時間**: ${results.processing_time}ms\n\n`;

        // 分類統計
        report += `## 🏷️ 分類統計\n\n`;
        Object.entries(results.classification_summary).forEach(([category, count]) => {
            if (count > 0) {
                report += `- **${category}**: ${count} 條記錄\n`;
            }
        });

        if (results.failed > 0) {
            report += `\n## ❌ 失敗記錄\n\n`;
            results.details.filter(d => d.status === 'failed').forEach(detail => {
                report += `- 第${detail.row}行: ${detail.errors.join(', ')}\n`;
            });
        }

        return report;
    }
}

// 創建全局實例
window.enhancedSmartDecompositionEngine = new EnhancedSmartDecompositionEngine();
console.log('🎵 增強版智能分解引擎 v3.0 已初始化');
