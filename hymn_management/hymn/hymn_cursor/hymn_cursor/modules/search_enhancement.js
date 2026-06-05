/**
 * 聖詩搜索增強系統
 * 提供智能搜索、過濾和歷史記錄功能
 */

class HymnSearchEnhancement {
    constructor() {
        this.hymnData = [];
        this.searchHistory = [];
        this.currentFilters = {
            language: 'all',
            hymnal: 'all',
            numberRange: { min: 0, max: 9999 }
        };
        this.init();
    }

    init() {
        this.extractHymnData();
        this.createSearchInterface();
        this.loadSearchHistory();
        this.bindEvents();
    }

    // 從現有 HTML 提取聖詩數據
    extractHymnData() {
        const links = document.querySelectorAll('a[href*=".htm"]');
        links.forEach(link => {
            const text = link.textContent.trim();
            if (text && /^\d{4}$/.test(text)) { // 4位數字編號
                const hymnInfo = this.parseHymnInfo(link);
                if (hymnInfo) {
                    this.hymnData.push(hymnInfo);
                }
            }
        });
        console.log(`提取到 ${this.hymnData.length} 首聖詩數據`);
    }

    // 解析聖詩信息
    parseHymnInfo(link) {
        const number = link.textContent.trim();
        const title = this.findHymnTitle(link);
        const language = this.detectLanguage(title);
        const hymnal = this.detectHymnal(link);
        
        return {
            number: number,
            title: title || `聖詩 ${number}`,
            language: language,
            hymnal: hymnal,
            url: link.href,
            element: link
        };
    }

    // 查找聖詩標題
    findHymnTitle(link) {
        // 在鏈接附近查找標題
        let current = link.nextSibling;
        let title = '';
        let count = 0;
        
        while (current && count < 3) {
            if (current.textContent && current.textContent.trim()) {
                const text = current.textContent.trim();
                if (text.length > 2 && text.length < 50) {
                    title = text;
                    break;
                }
            }
            current = current.nextSibling;
            count++;
        }
        
        return title;
    }

    // 檢測語言
    detectLanguage(text) {
        if (!text) return 'unknown';
        const chineseRegex = /[\u4e00-\u9fff]/;
        const englishRegex = /[a-zA-Z]/;
        
        if (chineseRegex.test(text)) return 'chinese';
        if (englishRegex.test(text)) return 'english';
        return 'mixed';
    }

    // 檢測詩集
    detectHymnal(link) {
        const href = link.href.toLowerCase();
        if (href.includes('century')) return '世紀頌讚';
        if (href.includes('evangel')) return '頌主新歌';
        if (href.includes('new')) return '新編讚美詩';
        return '未知詩集';
    }

    // 創建搜索界面
    createSearchInterface() {
        const searchContainer = document.createElement('div');
        searchContainer.id = 'hymn-search-container';
        searchContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            min-width: 300px;
            display: none;
        `;

        searchContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4CAF50; font-size: 16px;">🔍 智能搜索</h3>
                <button id="close-search" style="background: #f44336; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">✕</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <input type="text" id="search-input" placeholder="輸入聖詩編號、標題或關鍵詞..." 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <select id="language-filter" style="width: 48%; padding: 8px; margin-right: 2%; border: 1px solid #ddd; border-radius: 5px;">
                    <option value="all">所有語言</option>
                    <option value="chinese">中文</option>
                    <option value="english">英文</option>
                </select>
                <select id="hymnal-filter" style="width: 48%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    <option value="all">所有詩集</option>
                    <option value="世紀頌讚">世紀頌讚</option>
                    <option value="頌主新歌">頌主新歌</option>
                    <option value="新編讚美詩">新編讚美詩</option>
                </select>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="font-size: 12px; color: #666;">編號範圍:</label>
                <input type="number" id="min-number" placeholder="最小" style="width: 45%; padding: 5px; margin-right: 2%; border: 1px solid #ddd; border-radius: 3px;">
                <input type="number" id="max-number" placeholder="最大" style="width: 45%; padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
            </div>
            
            <div id="search-results" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; border-radius: 5px; padding: 10px; background: #f9f9f9; display: none;">
                <div style="text-align: center; color: #666;">搜索結果將顯示在這裡</div>
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                <button id="search-btn" style="background: #4CAF50; color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; width: 100%;">搜索</button>
            </div>
            
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                <div>📚 共 ${this.hymnData.length} 首聖詩</div>
                <div>🔍 快捷鍵: Ctrl+S 打開搜索</div>
            </div>
        `;

        document.body.appendChild(searchContainer);
    }

    // 綁定事件
    bindEvents() {
        // 搜索按鈕點擊
        document.getElementById('search-btn').addEventListener('click', () => {
            this.performSearch();
        });

        // 搜索輸入框
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // 關閉按鈕
        document.getElementById('close-search').addEventListener('click', () => {
            this.hideSearchInterface();
        });

        // 過濾器變化
        document.getElementById('language-filter').addEventListener('change', () => {
            this.currentFilters.language = document.getElementById('language-filter').value;
        });

        document.getElementById('hymnal-filter').addEventListener('change', () => {
            this.currentFilters.hymnal = document.getElementById('hymnal-filter').value;
        });

        // 編號範圍
        document.getElementById('min-number').addEventListener('input', (e) => {
            this.currentFilters.numberRange.min = parseInt(e.target.value) || 0;
        });

        document.getElementById('max-number').addEventListener('input', (e) => {
            this.currentFilters.numberRange.max = parseInt(e.target.value) || 9999;
        });

        // 快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.toggleSearchInterface();
            }
        });
    }

    // 處理搜索輸入
    handleSearchInput(value) {
        if (value.length < 2) {
            this.hideSearchResults();
            return;
        }

        const suggestions = this.getSearchSuggestions(value);
        this.displaySearchSuggestions(suggestions);
    }

    // 獲取搜索建議
    getSearchSuggestions(query) {
        const lowerQuery = query.toLowerCase();
        return this.hymnData.filter(hymn => 
            hymn.number.includes(query) ||
            hymn.title.toLowerCase().includes(lowerQuery) ||
            hymn.language.toLowerCase().includes(lowerQuery) ||
            hymn.hymnal.toLowerCase().includes(lowerQuery)
        ).slice(0, 10);
    }

    // 顯示搜索建議
    displaySearchSuggestions(suggestions) {
        const resultsContainer = document.getElementById('search-results');
        
        if (suggestions.length === 0) {
            resultsContainer.innerHTML = '<div style="text-align: center; color: #666;">沒有找到匹配的結果</div>';
            resultsContainer.style.display = 'block';
            return;
        }

        const resultsHTML = suggestions.map(hymn => `
            <div style="padding: 8px; border-bottom: 1px solid #eee; cursor: pointer; hover: background: #f0f0f0;" 
                 onclick="window.open('${hymn.url}', '_blank')">
                <div style="font-weight: bold; color: #4CAF50;">${hymn.number}</div>
                <div style="font-size: 12px; color: #333;">${hymn.title}</div>
                <div style="font-size: 11px; color: #666;">${hymn.hymnal} | ${hymn.language}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';
    }

    // 執行搜索
    performSearch() {
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;

        const results = this.searchHymns(query);
        this.displaySearchResults(results);
        this.addToSearchHistory(query);
    }

    // 搜索聖詩
    searchHymns(query) {
        const lowerQuery = query.toLowerCase();
        
        return this.hymnData.filter(hymn => {
            // 基本搜索
            const basicMatch = hymn.number.includes(query) ||
                              hymn.title.toLowerCase().includes(lowerQuery);
            
            if (!basicMatch) return false;
            
            // 應用過濾器
            if (this.currentFilters.language !== 'all' && 
                hymn.language !== this.currentFilters.language) return false;
            
            if (this.currentFilters.hymnal !== 'all' && 
                hymn.hymnal !== this.currentFilters.hymnal) return false;
            
            const number = parseInt(hymn.number);
            if (number < this.currentFilters.numberRange.min || 
                number > this.currentFilters.numberRange.max) return false;
            
            return true;
        });
    }

    // 顯示搜索結果
    displaySearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div style="text-align: center; color: #666;">沒有找到匹配的結果</div>';
            resultsContainer.style.display = 'block';
            return;
        }

        const resultsHTML = results.map(hymn => `
            <div style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer;" 
                 onclick="window.open('${hymn.url}', '_blank')">
                <div style="font-weight: bold; color: #4CAF50; font-size: 14px;">${hymn.number}</div>
                <div style="font-size: 13px; color: #333; margin: 5px 0;">${hymn.title}</div>
                <div style="font-size: 11px; color: #666;">${hymn.hymnal} | ${hymn.language}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = `
            <div style="padding: 8px; background: #e8f5e8; border-radius: 3px; margin-bottom: 10px; font-size: 12px; color: #2e7d32;">
                找到 ${results.length} 個結果
            </div>
            ${resultsHTML}
        `;
        
        resultsContainer.style.display = 'block';
    }

    // 隱藏搜索結果
    hideSearchResults() {
        document.getElementById('search-results').style.display = 'none';
    }

    // 顯示搜索界面
    showSearchInterface() {
        document.getElementById('hymn-search-container').style.display = 'block';
        document.getElementById('search-input').focus();
    }

    // 隱藏搜索界面
    hideSearchInterface() {
        document.getElementById('hymn-search-container').style.display = 'none';
        this.hideSearchResults();
    }

    // 切換搜索界面
    toggleSearchInterface() {
        const container = document.getElementById('hymn-search-container');
        if (container.style.display === 'block') {
            this.hideSearchInterface();
        } else {
            this.showSearchInterface();
        }
    }

    // 添加到搜索歷史
    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // 保留最近10個
            this.saveSearchHistory();
        }
    }

    // 保存搜索歷史
    saveSearchHistory() {
        localStorage.setItem('hymnSearchHistory', JSON.stringify(this.searchHistory));
    }

    // 加載搜索歷史
    loadSearchHistory() {
        const saved = localStorage.getItem('hymnSearchHistory');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
        }
    }

    // 獲取搜索歷史
    getSearchHistory() {
        return this.searchHistory;
    }
}

// 創建搜索增強實例
window.hymnSearchEnhancement = new HymnSearchEnhancement();
