/**
 * Bible100 智能目錄系統 (TOC)
 * 功能：掃描所有模組和語言版本，生成統一的站點目錄
 * 特點：手動觸發、平板優化、模組分類、語言版本支持
 */

class TOCGenerator {
    constructor() {
        this.config = {
            siteName: "Bible100 Steps Four Treasures",
            modules: [
                { name: "bible_study", title: "聖經研讀", icon: "📚" },
                { name: "ai_tools", title: "AI 工具", icon: "🤖" },
                { name: "church_ministry", title: "教會事工", icon: "⛪" },
                { name: "school_management", title: "學校管理", icon: "🏫" },
                { name: "smart_ministry", title: "智慧事奉", icon: "💡" }
            ],
            languages: [
                { code: "cn", name: "中文", flag: "🇨🇳" },
                { code: "en", name: "English", flag: "🇺🇸" },
                { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
                { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
                { code: "ch", name: "Children's", flag: "👶" },
                { code: "ad", name: "Advanced", flag: "🎓" }
            ],
            excludePaths: ["archive/", "backup/", "temp/", "test/", "node_modules/", ".git/"],
            excludeFiles: ["*.tmp", "*.log", "*.bak", "*複製*", "*copy*"]
        };
        
        this.scannedFiles = [];
        this.tocData = {};
        this.isGenerating = false;
    }

    /**
     * 主要生成函數 - 手動觸發
     */
    async generateTOC() {
        if (this.isGenerating) {
            this.updateStatus("⚠️ 正在生成中，請稍候...");
            return;
        }

        this.isGenerating = true;
        this.updateStatus("🔄 開始掃描文件...");

        try {
            // 步驟1：掃描所有模組
            await this.scanModules();
            
            // 步驟2：掃描語言版本
            await this.scanLanguages();
            
            // 步驟3：生成主目錄
            await this.generateMainTOC();
            
            // 步驟4：生成各模組目錄
            await this.generateModuleTOCs();
            
            // 步驟5：生成語言目錄
            await this.generateLanguageTOCs();
            
            this.updateStatus("✅ 目錄生成完成！");
            
        } catch (error) {
            console.error("TOC生成錯誤:", error);
            this.updateStatus("❌ 生成失敗: " + error.message);
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * 掃描模組文件
     */
    async scanModules() {
        this.updateStatus("📁 掃描模組文件...");
        
        for (const module of this.config.modules) {
            this.tocData[module.name] = {
                title: module.title,
                icon: module.icon,
                files: [],
                submodules: []
            };

            // 模擬掃描模組文件（實際實現需要服務器支持）
            const moduleFiles = await this.simulateModuleScan(module.name);
            this.tocData[module.name].files = moduleFiles;
            
            // 更新進度
            this.updateProgress(`掃描 ${module.title}...`);
        }
    }

    /**
     * 掃描語言版本
     */
    async scanLanguages() {
        this.updateStatus("🌐 掃描語言版本...");
        
        for (const lang of this.config.languages) {
            if (!this.tocData.languages) {
                this.tocData.languages = {};
            }
            
            this.tocData.languages[lang.code] = {
                name: lang.name,
                flag: lang.flag,
                files: []
            };

            // 模擬掃描語言文件
            const langFiles = await this.simulateLanguageScan(lang.code);
            this.tocData.languages[lang.code].files = langFiles;
            
            this.updateProgress(`掃描 ${lang.name}...`);
        }
    }

    /**
     * 模擬模組掃描（實際實現需要文件系統API）
     */
    async simulateModuleScan(moduleName) {
        // 模擬掃描結果
        const commonFiles = [
            { name: "index.html", title: "主頁", type: "main" },
            { name: "dashboard.html", title: "儀表板", type: "dashboard" },
            { name: "sidebar.html", title: "側邊欄", type: "navigation" }
        ];

        // 根據模組添加特定文件
        const specificFiles = {
            bible_study: [
                { name: "multi_version_reader_embedded.html", title: "多版本閱讀器", type: "feature" },
                { name: "parallel_mode.html", title: "並行模式", type: "feature" },
                { name: "comprehensive_exegesis_reader.html", title: "綜合釋經閱讀器", type: "feature" },
                { name: "simple-exegesis-reader.html", title: "簡易釋經閱讀器", type: "feature" }
            ],
            ai_tools: [
                { name: "dashboard.html", title: "AI工具儀表板", type: "feature" },
                { name: "ai_core.html", title: "AI核心功能", type: "feature" }
            ]
        };

        return [...commonFiles, ...(specificFiles[moduleName] || [])];
    }

    /**
     * 模擬語言掃描
     */
    async simulateLanguageScan(langCode) {
        const commonFiles = [
            { name: `index_${langCode}.html`, title: "主頁", type: "main" },
            { name: `sidebar_${langCode}.html`, title: "側邊欄", type: "navigation" },
            { name: `landP_${langCode}.html`, title: "登陸頁", type: "landing" }
        ];

        // 添加語言特定的內容文件
        const contentFiles = [
            { name: "NT/", title: "新約", type: "directory" },
            { name: "OT/", title: "舊約", type: "directory" },
            { name: "T4/", title: "T4課程", type: "directory" }
        ];

        return [...commonFiles, ...contentFiles];
    }

    /**
     * 生成主目錄
     */
    async generateMainTOC() {
        this.updateStatus("📝 生成主目錄...");
        
        const mainTOC = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.siteName} - 站點目錄</title>
    <link rel="stylesheet" href="../toc/toc-styles.css">
    <style>
        .main-toc {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .toc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .toc-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .toc-card h3 {
            color: #2e7d32;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .toc-item {
            display: block;
            padding: 8px 12px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 4px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
        }
        .toc-item:hover {
            background: #e3f2fd;
            transform: translateX(5px);
        }
    </style>
</head>
<body>
    <div class="main-toc">
        <header>
            <h1>${this.config.siteName}</h1>
            <p>智能目錄系統 - 最後更新: ${new Date().toLocaleString()}</p>
        </header>

        <div class="toc-grid">
            ${this.generateModuleTOCCards()}
            ${this.generateLanguageTOCCards()}
        </div>
    </div>

    <script src="../toc/toc-generator.js"></script>
</body>
</html>`;

        // 保存主目錄文件
        await this.saveTOCFile('generated/site-map.html', mainTOC);
    }

    /**
     * 生成模組TOC卡片
     */
    generateModuleTOCCards() {
        let html = '<div class="toc-card"><h3>📚 主要模組</h3>';
        
        for (const module of this.config.modules) {
            const moduleData = this.tocData[module.name];
            if (moduleData && moduleData.files.length > 0) {
                html += `<div class="module-section">`;
                html += `<h4>${module.icon} ${module.title}</h4>`;
                
                moduleData.files.forEach(file => {
                    const fileType = file.type === 'main' ? '🏠' : 
                                   file.type === 'dashboard' ? '📊' : 
                                   file.type === 'feature' ? '⚡' : '📄';
                    
                    html += `<a href="../${module.name}/${file.name}" class="toc-item" target="_blank">
                        ${fileType} ${file.title}
                    </a>`;
                });
                
                html += `</div>`;
            }
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 生成語言TOC卡片
     */
    generateLanguageTOCCards() {
        let html = '<div class="toc-card"><h3>🌐 語言版本</h3>';
        
        if (this.tocData.languages) {
            for (const lang of this.config.languages) {
                const langData = this.tocData.languages[lang.code];
                if (langData && langData.files.length > 0) {
                    html += `<div class="language-section">`;
                    html += `<h4>${lang.flag} ${lang.name}</h4>`;
                    
                    langData.files.forEach(file => {
                        const fileIcon = file.type === 'main' ? '🏠' : 
                                       file.type === 'directory' ? '📁' : '📄';
                        
                        html += `<a href="../languages/${lang.code}/${file.name}" class="toc-item" target="_blank">
                            ${fileIcon} ${file.title}
                        </a>`;
                    });
                    
                    html += `</div>`;
                }
            }
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 生成各模組目錄
     */
    async generateModuleTOCs() {
        this.updateStatus("📂 生成模組目錄...");
        
        for (const module of this.config.modules) {
            const moduleData = this.tocData[module.name];
            if (moduleData) {
                const moduleTOC = this.generateModuleTOCPage(module, moduleData);
                await this.saveTOCFile(`generated/modules/${module.name}-toc.html`, moduleTOC);
            }
        }
    }

    /**
     * 生成語言目錄
     */
    async generateLanguageTOCs() {
        this.updateStatus("🌍 生成語言目錄...");
        
        if (this.tocData.languages) {
            for (const lang of this.config.languages) {
                const langData = this.tocData.languages[lang.code];
                if (langData) {
                    const langTOC = this.generateLanguageTOCPage(lang, langData);
                    await this.saveTOCFile(`generated/languages/${lang.code}-toc.html`, langTOC);
                }
            }
        }
    }

    /**
     * 生成模組目錄頁面
     */
    generateModuleTOCPage(module, moduleData) {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${module.title} - 模組目錄</title>
    <link rel="stylesheet" href="../../toc/toc-styles.css">
</head>
<body>
    <div class="module-toc">
        <header>
            <h1>${module.icon} ${module.title}</h1>
            <p>模組目錄 - ${new Date().toLocaleString()}</p>
        </header>
        
        <div class="file-list">
            ${moduleData.files.map(file => `
                <a href="../../${module.name}/${file.name}" class="file-link" target="_blank">
                    <span class="file-icon">${this.getFileIcon(file.type)}</span>
                    <span class="file-name">${file.title}</span>
                    <span class="file-path">${file.name}</span>
                </a>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 生成語言目錄頁面
     */
    generateLanguageTOCPage(lang, langData) {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lang.name} - 語言目錄</title>
    <link rel="stylesheet" href="../../toc/toc-styles.css">
</head>
<body>
    <div class="language-toc">
        <header>
            <h1>${lang.flag} ${lang.name}</h1>
            <p>語言目錄 - ${new Date().toLocaleString()}</p>
        </header>
        
        <div class="file-list">
            ${langData.files.map(file => `
                <a href="../../languages/${lang.code}/${file.name}" class="file-link" target="_blank">
                    <span class="file-icon">${this.getFileIcon(file.type)}</span>
                    <span class="file-name">${file.title}</span>
                    <span class="file-path">${file.name}</span>
                </a>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 獲取文件圖標
     */
    getFileIcon(type) {
        const icons = {
            'main': '🏠',
            'dashboard': '📊',
            'navigation': '🧭',
            'feature': '⚡',
            'directory': '📁',
            'landing': '🚀'
        };
        return icons[type] || '📄';
    }

    /**
     * 保存TOC文件
     */
    async saveTOCFile(path, content) {
        // 模擬保存文件（實際實現需要服務器支持）
        console.log(`保存TOC文件: ${path}`);
        
        // 在瀏覽器環境中，我們可以創建下載鏈接
        if (typeof window !== 'undefined') {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // 創建臨時下載鏈接
            const a = document.createElement('a');
            a.href = url;
            a.download = path.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    /**
     * 更新狀態顯示
     */
    updateStatus(message) {
        console.log(message);
        
        // 如果頁面上有狀態顯示元素
        const statusEl = document.getElementById('toc-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    /**
     * 更新進度顯示
     */
    updateProgress(message) {
        console.log(message);
        
        // 如果頁面上有進度顯示元素
        const progressEl = document.getElementById('toc-progress');
        if (progressEl) {
            progressEl.textContent = message;
        }
    }
}

// 全局實例
window.tocGenerator = new TOCGenerator();

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果頁面上有生成按鈕，綁定事件
    const generateBtn = document.getElementById('generate-toc-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            window.tocGenerator.generateTOC();
        });
    }
});

