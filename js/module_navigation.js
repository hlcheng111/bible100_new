/**
 * Bible100 模組間導航系統
 * 
 * 用途：提供統一的模組間跳轉、返回主頁、側邊欄切換等功能
 * 版本：1.0
 * 日期：2025-10-09
 */

class ModuleNavigation {
    constructor() {
        this.modules = {
            'home': {
                name: '主頁',
                name_en: 'Home',
                path: 'index.html',
                icon: '🏠'
            },
            'bible_study': {
                name: '聖經研讀',
                name_en: 'Bible Study',
                path: 'bible_study/dashboard.html',
                icon: '📚'
            },
            'church_ministry': {
                name: '教會事工',
                name_en: 'Church Ministry',
                path: 'church_ministry/index.html',
                icon: '⛪'
            },
            'school_management': {
                name: '學校管理',
                name_en: 'School Management',
                path: 'school_management/index.html',
                icon: '🏫'
            },
            'smart_ministry': {
                name: '智慧事奉',
                name_en: 'Smart Ministry',
                path: 'smart_ministry/index.html',
                icon: '🤖'
            },
            'ai_tools': {
                name: 'AI工具',
                name_en: 'AI Tools',
                path: 'ai_tools/index.html',
                icon: '🔧'
            }
        };
        
        this.currentModule = this.detectCurrentModule();
        console.log(`✅ 模組導航系統已初始化，當前模組：${this.currentModule}`);
    }

    /**
     * 檢測當前模組
     */
    detectCurrentModule() {
        const path = window.location.pathname;
        
        if (path.includes('/bible_study/')) return 'bible_study';
        if (path.includes('/church_ministry/')) return 'church_ministry';
        if (path.includes('/school_management/')) return 'school_management';
        if (path.includes('/smart_ministry/')) return 'smart_ministry';
        if (path.includes('/ai_tools/')) return 'ai_tools';
        
        return 'home';
    }

    /**
     * 計算相對路徑深度
     */
    getPathDepth() {
        const path = window.location.pathname;
        const parts = path.split('/').filter(part => part && part !== 'bible100_new');
        
        // 移除文件名
        if (parts.length > 0 && parts[parts.length - 1].includes('.html')) {
            parts.pop();
        }
        
        return parts.length;
    }

    /**
     * 生成返回路徑前綴
     */
    getBackPrefix() {
        const depth = this.getPathDepth();
        return depth > 0 ? '../'.repeat(depth) : '';
    }

    /**
     * 跳轉到其他模組
     * @param {string} moduleKey - 模組鍵名
     */
    navigateTo(moduleKey) {
        const module = this.modules[moduleKey];
        if (!module) {
            console.error(`❌ 模組不存在：${moduleKey}`);
            return;
        }
        
        const backPrefix = this.getBackPrefix();
        const targetPath = backPrefix + module.path;
        
        console.log(`🚀 跳轉到：${module.name} (${targetPath})`);
        
        // 如果在 iframe 中，更新父頁面
        if (window.parent && window.parent !== window) {
            window.parent.location.href = targetPath;
        } else {
            window.location.href = targetPath;
        }
    }

    /**
     * 返回主頁
     */
    goHome() {
        this.navigateTo('home');
    }

    /**
     * 返回當前模組主頁
     */
    goModuleHome() {
        if (this.currentModule === 'home') {
            return;
        }
        
        const module = this.modules[this.currentModule];
        const backPrefix = this.getBackPrefix();
        const targetPath = backPrefix + module.path;
        
        console.log(`🏠 返回模組主頁：${module.name}`);
        window.location.href = targetPath;
    }

    /**
     * 在主框架中載入內容（用於 iframe 架構）
     * @param {string} contentPath - 內容頁面路徑
     */
    loadContent(contentPath) {
        if (window.parent && window.parent !== window) {
            // 在 iframe 中，通知父頁面
            const contentFrame = window.parent.document.getElementById('contentFrame');
            if (contentFrame) {
                contentFrame.src = contentPath;
                console.log(`📄 載入內容：${contentPath}`);
            }
        } else {
            // 不在 iframe 中，直接跳轉
            window.location.href = contentPath;
        }
    }

    /**
     * 切換側邊欄（用於 iframe 架構）
     * @param {string} sidebarPath - 側邊欄頁面路徑
     */
    loadSidebar(sidebarPath) {
        if (window.parent && window.parent !== window) {
            const sidebarFrame = window.parent.document.getElementById('sidebarFrame');
            if (sidebarFrame) {
                sidebarFrame.src = sidebarPath;
                console.log(`📑 切換側邊欄：${sidebarPath}`);
            }
        }
    }

    /**
     * 生成快速導航 HTML
     * @param {Array} moduleKeys - 要顯示的模組鍵名陣列
     * @returns {string} HTML 字符串
     */
    generateQuickNav(moduleKeys = ['home']) {
        const backPrefix = this.getBackPrefix();
        
        let html = '<div class="quick-nav" style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin: 10px 0;">';
        html += '<strong>🔗 快速導航：</strong> ';
        
        moduleKeys.forEach((key, index) => {
            const module = this.modules[key];
            if (module) {
                const path = backPrefix + module.path;
                html += `<a href="${path}" style="margin: 0 8px; text-decoration: none; color: #007bff;">${module.icon} ${module.name}</a>`;
                if (index < moduleKeys.length - 1) {
                    html += ' | ';
                }
            }
        });
        
        html += '</div>';
        return html;
    }

    /**
     * 生成麵包屑導航
     * @param {Array} breadcrumbs - 麵包屑陣列 [{name: '名稱', path: '路徑'}]
     * @returns {string} HTML 字符串
     */
    generateBreadcrumb(breadcrumbs) {
        const backPrefix = this.getBackPrefix();
        
        let html = '<div class="breadcrumb" style="padding: 10px; color: #666; font-size: 13px;">';
        
        // 添加主頁
        html += `<a href="${backPrefix}index.html" style="color: #007bff; text-decoration: none;">🏠 主頁</a>`;
        
        breadcrumbs.forEach(crumb => {
            html += ' > ';
            if (crumb.path) {
                html += `<a href="${crumb.path}" style="color: #007bff; text-decoration: none;">${crumb.name}</a>`;
            } else {
                html += `<span style="color: #333; font-weight: bold;">${crumb.name}</span>`;
            }
        });
        
        html += '</div>';
        return html;
    }

    /**
     * 生成返回按鈕
     * @param {string} targetPath - 返回目標路徑
     * @param {string} label - 按鈕文字
     * @returns {string} HTML 字符串
     */
    generateBackButton(targetPath, label = '← 返回') {
        return `<button onclick="window.location.href='${targetPath}'" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 10px 0;">${label}</button>`;
    }
}

// 創建全局實例
if (typeof window !== 'undefined') {
    window.moduleNav = new ModuleNavigation();
    
    // 提供便捷函數
    window.goHome = () => window.moduleNav.goHome();
    window.goModuleHome = () => window.moduleNav.goModuleHome();
    window.navigateTo = (module) => window.moduleNav.navigateTo(module);
    window.loadContent = (path) => window.moduleNav.loadContent(path);
    
    console.log('✅ 模組導航系統已就緒');
    console.log('📚 可用函數：goHome(), goModuleHome(), navigateTo(module), loadContent(path)');
}

// 匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleNavigation;
}

