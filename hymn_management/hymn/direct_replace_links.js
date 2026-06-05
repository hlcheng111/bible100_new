// 直接替換鏈接腳本
// 只要編號和歌名相同就替換，不管文件是否存在

const fs = require('fs');
const path = require('path');

// 配置
const ORIGINAL_FILE = 'default_simple_sort_fixed.html';
const ANCHORED_FILE = 'default_simple_sort_fixed_with_anchors.html';
const OUTPUT_FILE = 'default_simple_sort_fixed_DIRECT_REPAIRED.html';

// 提取鏈接信息
function extractLinksFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const links = [];
        
        // 檢查是否有錨點
        const hasAnchors = content.includes('id="row-');
        
        // 使用不同的正則表達式提取表格行中的鏈接
        const tableRowRegex = hasAnchors 
            ? /<tr[^>]*id="row-(\d+)"[^>]*>([\s\S]*?)<\/tr>/g
            : /<tr[^>]*>([\s\S]*?)<\/tr>/g;
        const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/g;
        
        let rowMatch;
        
        while ((rowMatch = tableRowRegex.exec(content)) !== null) {
            const rowIndex = hasAnchors ? rowMatch[1] : null;
            const rowContent = hasAnchors ? rowMatch[2] : rowMatch[1];
            
            // 提取這一行的所有鏈接
            let linkMatch;
            const rowLinks = [];
            
            while ((linkMatch = linkRegex.exec(rowContent)) !== null) {
                const href = linkMatch[1];
                const text = linkMatch[2].trim();
                
                // 只處理本地HTML文件鏈接
                if (href.includes('.htm') && !href.startsWith('http')) {
                    rowLinks.push({
                        href: href,
                        text: text
                    });
                }
            }
            
            // 如果這行有鏈接，提取其他信息
            if (rowLinks.length > 0) {
                // 提取表格單元格內容
                const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
                const cells = [];
                let cellMatch;
                
                while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                    // 移除HTML標籤，只保留文本
                    const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim();
                    cells.push(cellText);
                }
                
                // 根據表格結構提取信息
                if (cells.length >= 4) {
                    const hymnNumber = cells[0] || '';
                    const fullTitle = cells[1] || '';
                    const englishTitle = cells[2] || '';
                    const chineseTitle = cells[3] || '';
                    
                    links.push({
                        rowIndex: rowIndex ? parseInt(rowIndex) : links.length + 1,
                        hymnNumber: hymnNumber,
                        fullTitle: fullTitle,
                        englishTitle: englishTitle,
                        chineseTitle: chineseTitle,
                        links: rowLinks,
                        primaryLink: rowLinks[0] // 假設第一個鏈接是主要鏈接
                    });
                }
            }
        }
        
        console.log(`📊 從 ${filePath} 提取到 ${links.length} 個聖詩條目`);
        return links;
        
    } catch (error) {
        console.error(`❌ 讀取文件失敗 ${filePath}: ${error.message}`);
        return [];
    }
}

// 直接替換鏈接
function directReplaceLinks(originalContent, originalLinks, anchoredLinks) {
    console.log('🔧 開始直接替換鏈接...');
    
    // 創建錨點版本的查找映射
    const anchoredMap = new Map();
    anchoredLinks.forEach(item => {
        // 使用編號作為主要鍵
        if (item.hymnNumber) {
            anchoredMap.set(item.hymnNumber, item);
        }
    });
    
    let replaceCount = 0;
    const replacements = [];
    
    // 遍歷原始鏈接
    originalLinks.forEach(originalItem => {
        const hymnNumber = originalItem.hymnNumber;
        
        // 查找對應的錨點版本
        const anchoredItem = anchoredMap.get(hymnNumber);
        
        if (anchoredItem && anchoredItem.primaryLink) {
            const originalHref = originalItem.primaryLink.href;
            const newHref = anchoredItem.primaryLink.href;
            
            // 如果鏈接不同，進行替換
            if (originalHref !== newHref) {
                // 使用更精確的正則表達式替換
                const escapedOriginal = originalHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const linkRegex = new RegExp(`(<a[^>]*href=["'])${escapedOriginal}(["'][^>]*>)`, 'g');
                
                const beforeReplace = originalContent;
                originalContent = originalContent.replace(linkRegex, `$1${newHref}$2`);
                
                // 檢查是否真的進行了替換
                if (originalContent !== beforeReplace) {
                    replaceCount++;
                    replacements.push({
                        hymnNumber: hymnNumber,
                        chineseTitle: originalItem.chineseTitle,
                        originalLink: originalHref,
                        newLink: newHref
                    });
                    
                    if (replaceCount % 100 === 0) {
                        console.log(`替換進度: ${replaceCount}`);
                    }
                }
            }
        }
    });
    
    console.log(`✅ 直接替換了 ${replaceCount} 個鏈接`);
    return { replaceCount, replacements, content: originalContent };
}

// 生成替換報告
function generateReplaceReport(replaceCount, replacements, totalLinks) {
    const reportHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>直接鏈接替換報告</title>
    <style>
        body {
            font-family: "Microsoft YaHei", Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
            font-size: 14px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #6f42c1, #5a32a3);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        
        .stats {
            display: flex;
            gap: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        
        .stat-item {
            flex: 1;
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-number.total { color: #0b5fa5; }
        .stat-number.replaced { color: #6f42c1; }
        .stat-number.unchanged { color: #17a2b8; }
        
        .stat-label {
            font-size: 14px;
            color: #666;
        }
        
        .results {
            padding: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 20px;
        }
        
        th {
            background: #0b5fa5;
            color: white;
            padding: 12px 8px;
            text-align: left;
        }
        
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .old-link {
            color: #dc3545;
            font-family: monospace;
            font-size: 11px;
            word-break: break-all;
        }
        
        .new-link {
            color: #28a745;
            font-family: monospace;
            font-size: 11px;
            word-break: break-all;
        }
        
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 直接鏈接替換報告</h1>
            <p>根據編號和歌名匹配直接替換鏈接</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number total">${totalLinks}</div>
                <div class="stat-label">總聖詩數</div>
            </div>
            <div class="stat-item">
                <div class="stat-number replaced">${replaceCount}</div>
                <div class="stat-label">已替換</div>
            </div>
            <div class="stat-item">
                <div class="stat-number unchanged">${totalLinks - replaceCount}</div>
                <div class="stat-label">未變更</div>
            </div>
        </div>
        
        <div class="results">
            <h3>🔍 替換詳細列表</h3>
            <table>
                <thead>
                    <tr>
                        <th>聖詩編號</th>
                        <th>中文標題</th>
                        <th>原鏈接</th>
                        <th>新鏈接</th>
                    </tr>
                </thead>
                <tbody>
                    ${replacements.map(replacement => `
                    <tr>
                        <td><strong>${replacement.hymnNumber}</strong></td>
                        <td>${replacement.chineseTitle}</td>
                        <td class="old-link">${replacement.originalLink}</td>
                        <td class="new-link">${replacement.newLink}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="timestamp">
            替換報告生成時間: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    return reportHTML;
}

// 主函數
function main() {
    console.log('🚀 開始直接鏈接替換流程...');
    
    // 1. 提取兩個文件的鏈接信息
    console.log('📖 讀取原始文件...');
    const originalLinks = extractLinksFromFile(ORIGINAL_FILE);
    
    console.log('📖 讀取錨點文件...');
    const anchoredLinks = extractLinksFromFile(ANCHORED_FILE);
    
    if (originalLinks.length === 0 || anchoredLinks.length === 0) {
        console.log('❌ 無法讀取文件或沒有找到鏈接');
        return;
    }
    
    // 2. 讀取原始文件內容
    let originalContent;
    try {
        originalContent = fs.readFileSync(ORIGINAL_FILE, 'utf8');
        console.log(`✅ 成功讀取原始文件內容`);
    } catch (error) {
        console.error(`❌ 讀取原始文件失敗: ${error.message}`);
        return;
    }
    
    // 3. 直接替換鏈接
    const replaceResult = directReplaceLinks(originalContent, originalLinks, anchoredLinks);
    
    if (replaceResult.replaceCount === 0) {
        console.log('ℹ️ 沒有需要替換的鏈接');
        return;
    }
    
    // 4. 保存替換後的文件
    try {
        fs.writeFileSync(OUTPUT_FILE, replaceResult.content, 'utf8');
        console.log(`✅ 替換後的文件已保存: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`❌ 保存替換文件失敗: ${error.message}`);
        return;
    }
    
    // 5. 生成替換報告
    const reportHTML = generateReplaceReport(replaceResult.replaceCount, replaceResult.replacements, originalLinks.length);
    try {
        fs.writeFileSync('direct_replace_report.html', reportHTML, 'utf8');
        console.log('✅ 替換報告已生成: direct_replace_report.html');
    } catch (error) {
        console.error(`❌ 保存替換報告失敗: ${error.message}`);
    }
    
    // 6. 顯示結果摘要
    console.log('\\n📊 替換結果摘要:');
    console.log(`   總聖詩數: ${originalLinks.length}`);
    console.log(`   已替換: ${replaceResult.replaceCount}`);
    console.log(`   未變更: ${originalLinks.length - replaceResult.replaceCount}`);
    
    console.log(`\\n🎉 直接替換完成！`);
    console.log(`   替換後文件: ${OUTPUT_FILE}`);
    console.log(`   替換報告: direct_replace_report.html`);
}

// 執行主函數
if (require.main === module) {
    main();
}

module.exports = { main, extractLinksFromFile, directReplaceLinks };


























