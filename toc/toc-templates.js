/**
 * Bible100 TOC系統模板引擎
 * 提供可重用的HTML模板，支持自定義和國際化
 */

class TOCTemplates {
    constructor(config) {
        this.config = config || {};
        this.templates = this.initializeTemplates();
    }

    /**
     * 初始化所有模板
     */
    initializeTemplates() {
        return {
            // 主目錄模板
            mainTOC: this.getMainTOCTemplate(),
            
            // 模組目錄模板
            moduleTOC: this.getModuleTOCTemplate(),
            
            // 語言目錄模板
            languageTOC: this.getLanguageTOCTemplate(),
            
            // 搜索結果模板
            searchResults: this.getSearchResultsTemplate(),
            
            // 導航卡片模板
            navigationCard: this.getNavigationCardTemplate(),
            
            // 文件列表模板
            fileList: this.getFileListTemplate()
        };
    }

    /**
     * 主目錄頁面模板
     */
    getMainTOCTemplate() {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{siteName}} - 站點目錄</title>
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
        .quick-nav {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .quick-nav h2 {
            margin-top: 0;
            color: #2c3e50;
        }
        .quick-nav-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .quick-nav-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            text-decoration: none;
            color: #333;
            border: 1px solid #e0e0e0;
            transition: all 0.3s ease;
        }
        .quick-nav-item:hover {
            background: #e3f2fd;
            border-color: #2196f3;
        }
    </style>
</head>
<body>
    <div class="main-toc">
        <header>
            <h1>{{siteName}}</h1>
            <p>智能目錄系統 - 最後更新: {{lastUpdate}}</p>
        </header>

        <!-- 快速導航 -->
        <div class="quick-nav">
            <h2>🚀 快速導航</h2>
            <div class="quick-nav-grid">
                <a href="../index.html" class="quick-nav-item">🏠 主頁</a>
                <a href="../default.html" class="quick-nav-item">📱 移動版</a>
                <a href="../search/index.html" class="quick-nav-item">🔍 搜索</a>
                <a href="../sitemap_navigation.html" class="quick-nav-item">🗺️ 導航中心</a>
            </div>
        </div>

        <div class="toc-grid">
            {{moduleCards}}
            {{languageCards}}
        </div>
    </div>

    <script src="../toc/toc-generator.js"></script>
</body>
</html>`;
    }

    /**
     * 模組目錄模板
     */
    getModuleTOCTemplate() {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{moduleTitle}} - 模組目錄</title>
    <link rel="stylesheet" href="../../toc/toc-styles.css">
    <style>
        .module-toc {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        .module-header {
            background: linear-gradient(135deg, {{moduleColor}} 0%, {{moduleColorSecondary}} 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        .module-header h1 {
            font-size: 2.5em;
            margin: 0 0 10px 0;
            font-weight: 300;
        }
        .module-header p {
            font-size: 1.2em;
            opacity: 0.9;
            margin: 0;
        }
        .file-list {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .file-link {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            margin: 10px 0;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
        }
        .file-link:hover {
            background: #e3f2fd;
            border-color: #2196f3;
            transform: translateX(5px);
            text-decoration: none;
            color: #1976d2;
        }
        .file-icon {
            font-size: 1.5em;
            min-width: 30px;
        }
        .file-info {
            flex: 1;
        }
        .file-name {
            font-weight: 600;
            font-size: 1.1em;
            margin-bottom: 5px;
        }
        .file-description {
            color: #666;
            font-size: 0.9em;
        }
        .file-path {
            font-size: 0.8em;
            color: #999;
            font-family: monospace;
        }
        .breadcrumb {
            margin-bottom: 20px;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .breadcrumb a {
            color: #2196f3;
            text-decoration: none;
        }
        .breadcrumb a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="module-toc">
        <div class="breadcrumb">
            <a href="../../toc/generated/site-map.html">🗺️ 站點目錄</a> > 
            <a href="../../toc/generated/site-map.html">📚 模組</a> > 
            {{moduleTitle}}
        </div>

        <div class="module-header">
            <h1>{{moduleIcon}} {{moduleTitle}}</h1>
            <p>{{moduleDescription}}</p>
        </div>
        
        <div class="file-list">
            <h3>📁 模組文件</h3>
            {{fileList}}
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 語言目錄模板
     */
    getLanguageTOCTemplate() {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{languageName}} - 語言目錄</title>
    <link rel="stylesheet" href="../../toc/toc-styles.css">
    <style>
        .language-toc {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        .language-header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }
        .language-header h1 {
            font-size: 2.5em;
            margin: 0 0 10px 0;
            font-weight: 300;
        }
        .language-header p {
            font-size: 1.2em;
            opacity: 0.9;
            margin: 0;
        }
        .content-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .content-section {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .content-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .file-link {
            display: block;
            padding: 12px 16px;
            margin: 8px 0;
            background: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
        }
        .file-link:hover {
            background: #e3f2fd;
            border-color: #2196f3;
            transform: translateX(5px);
            text-decoration: none;
            color: #1976d2;
        }
    </style>
</head>
<body>
    <div class="language-toc">
        <div class="breadcrumb">
            <a href="../../toc/generated/site-map.html">🗺️ 站點目錄</a> > 
            <a href="../../toc/generated/site-map.html">🌐 語言版本</a> > 
            {{languageName}}
        </div>

        <div class="language-header">
            <h1>{{languageFlag}} {{languageName}}</h1>
            <p>語言目錄 - {{lastUpdate}}</p>
        </div>
        
        <div class="content-sections">
            {{contentSections}}
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 搜索結果模板
     */
    getSearchResultsTemplate() {
        return `
<div class="search-results">
    <div class="search-header">
        <h3>🔍 搜索結果 ({{resultCount}} 個結果)</h3>
        <p>搜索關鍵詞: "{{searchQuery}}"</p>
    </div>
    
    <div class="search-results-list">
        {{searchResults}}
    </div>
</div>`;
    }

    /**
     * 導航卡片模板
     */
    getNavigationCardTemplate() {
        return `
<div class="nav-card">
    <div class="nav-card-header">
        <h3>{{cardTitle}}</h3>
        <span class="nav-card-icon">{{cardIcon}}</span>
    </div>
    <div class="nav-card-content">
        {{cardContent}}
    </div>
</div>`;
    }

    /**
     * 文件列表模板
     */
    getFileListTemplate() {
        return `
<div class="file-list-item">
    <a href="{{fileUrl}}" class="file-link" target="_blank">
        <span class="file-icon">{{fileIcon}}</span>
        <div class="file-info">
            <div class="file-name">{{fileName}}</div>
            <div class="file-description">{{fileDescription}}</div>
        </div>
        <span class="file-path">{{filePath}}</span>
    </a>
</div>`;
    }

    /**
     * 渲染模板
     */
    render(templateName, data) {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        let rendered = template;
        
        // 替換變量
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            rendered = rendered.replace(regex, value);
        }

        return rendered;
    }

    /**
     * 渲染模組卡片
     */
    renderModuleCards(modules) {
        let html = '<div class="toc-card"><h3>📚 主要模組</h3>';
        
        modules.forEach(module => {
            html += `<div class="module-section">`;
            html += `<h4>${module.icon} ${module.title}</h4>`;
            
            if (module.files && module.files.length > 0) {
                module.files.forEach(file => {
                    const fileIcon = this.getFileIcon(file.type);
                    html += `<a href="../${module.name}/${file.name}" class="toc-item" target="_blank">
                        ${fileIcon} ${file.title}
                    </a>`;
                });
            } else {
                html += `<div class="toc-item" style="color: #999;">
                    📄 暫無文件
                </div>`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * 渲染語言卡片
     */
    renderLanguageCards(languages) {
        let html = '<div class="toc-card"><h3>🌐 語言版本</h3>';
        
        languages.forEach(lang => {
            html += `<div class="language-section">`;
            html += `<h4>${lang.flag} ${lang.name}</h4>`;
            
            if (lang.files && lang.files.length > 0) {
                lang.files.forEach(file => {
                    const fileIcon = this.getFileIcon(file.type);
                    html += `<a href="../languages/${lang.code}/${file.name}" class="toc-item" target="_blank">
                        ${fileIcon} ${file.title}
                    </a>`;
                });
            } else {
                html += `<div class="toc-item" style="color: #999;">
                    📄 暫無文件
                </div>`;
            }
            
            html += `</div>`;
        });
        
        html += '</div>';
        return html;
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
            'landing': '🚀',
            'content': '📄'
        };
        return icons[type] || '📄';
    }

    /**
     * 添加自定義模板
     */
    addTemplate(name, template) {
        this.templates[name] = template;
    }

    /**
     * 獲取所有模板名稱
     */
    getTemplateNames() {
        return Object.keys(this.templates);
    }
}

// 導出模板類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TOCTemplates;
} else if (typeof window !== 'undefined') {
    window.TOCTemplates = TOCTemplates;
}

