// 從 broken_hymns_page.html 提取正確的鏈接
// 並用這些鏈接替換 default_simple_sort_fixed_with_anchors.html 中的對應鏈接

const fs = require('fs');
const path = require('path');

// 配置
const BROKEN_PAGE_FILE = 'broken_hymns_page.html';
const ANCHORED_FILE = 'default_simple_sort_fixed_with_anchors.html';
const OUTPUT_FILE = 'default_simple_sort_fixed_with_anchors_CORRECTED.html';

// 從斷鏈頁面提取正確的鏈接信息
function extractCorrectLinksFromBrokenPage() {
    try {
        const content = fs.readFileSync(BROKEN_PAGE_FILE, 'utf8');
        const correctLinks = [];
        
        // 提取表格行中的鏈接信息
        const rowRegex = /<tr data-index="(\d+)">[\s\S]*?<td class="broken-link">[\s\S]*?href="([^"]+)"[\s\S]*?>([^<]+)<\/a>/g;
        
        let match;
        while ((match = rowRegex.exec(content)) !== null) {
            const index = match[1];
            const correctLink = match[2];
            const brokenLinkText = match[3];
            
            correctLinks.push({
                index: parseInt(index),
                correctLink: correctLink,
                brokenLinkText: brokenLinkText
            });
        }
        
        console.log(`📊 從斷鏈頁面提取到 ${correctLinks.length} 個正確鏈接`);
        return correctLinks;
        
    } catch (error) {
        console.error(`❌ 讀取斷鏈頁面失敗: ${error.message}`);
        return [];
    }
}

// 從錨點文件提取需要替換的鏈接
function extractLinksFromAnchoredFile() {
    try {
        const content = fs.readFileSync(ANCHORED_FILE, 'utf8');
        const links = [];
        
        // 提取表格行中的鏈接
        const rowRegex = /<tr[^>]*id="row-(\d+)"[^>]*>([\s\S]*?)<\/tr>/g;
        const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/g;
        
        let rowMatch;
        while ((rowMatch = rowRegex.exec(content)) !== null) {
            const rowIndex = parseInt(rowMatch[1]);
            const rowContent = rowMatch[2];
            
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
            
            if (rowLinks.length > 0) {
                // 提取表格單元格內容
                const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
                const cells = [];
                let cellMatch;
                
                while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                    const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim();
                    cells.push(cellText);
                }
                
                if (cells.length >= 4) {
                    const hymnNumber = cells[0] || '';
                    const fullTitle = cells[1] || '';
                    const englishTitle = cells[2] || '';
                    const chineseTitle = cells[3] || '';
                    
                    links.push({
                        rowIndex: rowIndex,
                        hymnNumber: hymnNumber,
                        fullTitle: fullTitle,
                        englishTitle: englishTitle,
                        chineseTitle: chineseTitle,
                        primaryLink: rowLinks[0]
                    });
                }
            }
        }
        
        console.log(`📊 從錨點文件提取到 ${links.length} 個鏈接`);
        return links;
        
    } catch (error) {
        console.error(`❌ 讀取錨點文件失敗: ${error.message}`);
        return [];
    }
}

// 替換鏈接
function replaceLinksWithCorrectOnes(anchoredContent, correctLinks, anchoredLinks) {
    console.log('🔧 開始替換鏈接...');
    
    // 創建正確鏈接的映射
    const correctLinkMap = new Map();
    correctLinks.forEach(item => {
        correctLinkMap.set(item.index, item.correctLink);
    });
    
    let replaceCount = 0;
    const replacements = [];
    
    // 遍歷錨點文件中的鏈接
    anchoredLinks.forEach(anchoredItem => {
        const correctLink = correctLinkMap.get(anchoredItem.rowIndex);
        
        if (correctLink) {
            const originalHref = anchoredItem.primaryLink.href;
            
            // 如果鏈接不同，進行替換
            if (originalHref !== correctLink) {
                // 使用更精確的正則表達式替換
                const escapedOriginal = originalHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const linkRegex = new RegExp(`(<a[^>]*href=["'])${escapedOriginal}(["'][^>]*>)`, 'g');
                
                const beforeReplace = anchoredContent;
                anchoredContent = anchoredContent.replace(linkRegex, `$1${correctLink}$2`);
                
                // 檢查是否真的進行了替換
                if (anchoredContent !== beforeReplace) {
                    replaceCount++;
                    replacements.push({
                        rowIndex: anchoredItem.rowIndex,
                        hymnNumber: anchoredItem.hymnNumber,
                        chineseTitle: anchoredItem.chineseTitle,
                        originalLink: originalHref,
                        newLink: correctLink
                    });
                    
                    if (replaceCount % 100 === 0) {
                        console.log(`替換進度: ${replaceCount}`);
                    }
                }
            }
        }
    });
    
    console.log(`✅ 替換了 ${replaceCount} 個鏈接`);
    return { replaceCount, replacements, content: anchoredContent };
}

// 生成替換報告
function generateCorrectionReport(replaceCount, replacements, totalLinks) {
    const reportHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>鏈接修正報告</title>
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
            background: linear-gradient(135deg, #28a745, #20c997);
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
        .stat-number.corrected { color: #28a745; }
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
            <h1>✅ 鏈接修正報告</h1>
            <p>使用斷鏈頁面中的正確鏈接修正了錨點文件</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number total">${totalLinks}</div>
                <div class="stat-label">總聖詩數</div>
            </div>
            <div class="stat-item">
                <div class="stat-number corrected">${replaceCount}</div>
                <div class="stat-label">已修正</div>
            </div>
            <div class="stat-item">
                <div class="stat-number unchanged">${totalLinks - replaceCount}</div>
                <div class="stat-label">未變更</div>
            </div>
        </div>
        
        <div class="results">
            <h3>🔍 修正詳細列表</h3>
            <table>
                <thead>
                    <tr>
                        <th>行號</th>
                        <th>聖詩編號</th>
                        <th>中文標題</th>
                        <th>原鏈接</th>
                        <th>新鏈接</th>
                    </tr>
                </thead>
                <tbody>
                    ${replacements.map(replacement => `
                    <tr>
                        <td><strong>${replacement.rowIndex}</strong></td>
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
            修正報告生成時間: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    return reportHTML;
}

// 主函數
function main() {
    console.log('🚀 開始鏈接修正流程...');
    
    // 1. 從斷鏈頁面提取正確的鏈接
    console.log('📖 讀取斷鏈頁面...');
    const correctLinks = extractCorrectLinksFromBrokenPage();
    
    if (correctLinks.length === 0) {
        console.log('❌ 沒有找到正確的鏈接');
        return;
    }
    
    // 2. 從錨點文件提取需要替換的鏈接
    console.log('📖 讀取錨點文件...');
    const anchoredLinks = extractLinksFromAnchoredFile();
    
    if (anchoredLinks.length === 0) {
        console.log('❌ 沒有找到需要替換的鏈接');
        return;
    }
    
    // 3. 讀取錨點文件內容
    let anchoredContent;
    try {
        anchoredContent = fs.readFileSync(ANCHORED_FILE, 'utf8');
        console.log(`✅ 成功讀取錨點文件內容`);
    } catch (error) {
        console.error(`❌ 讀取錨點文件失敗: ${error.message}`);
        return;
    }
    
    // 4. 替換鏈接
    const replaceResult = replaceLinksWithCorrectOnes(anchoredContent, correctLinks, anchoredLinks);
    
    if (replaceResult.replaceCount === 0) {
        console.log('ℹ️ 沒有需要替換的鏈接');
        return;
    }
    
    // 5. 保存修正後的文件
    try {
        fs.writeFileSync(OUTPUT_FILE, replaceResult.content, 'utf8');
        console.log(`✅ 修正後的文件已保存: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`❌ 保存修正文件失敗: ${error.message}`);
        return;
    }
    
    // 6. 生成修正報告
    const reportHTML = generateCorrectionReport(replaceResult.replaceCount, replaceResult.replacements, anchoredLinks.length);
    try {
        fs.writeFileSync('link_correction_report.html', reportHTML, 'utf8');
        console.log('✅ 修正報告已生成: link_correction_report.html');
    } catch (error) {
        console.error(`❌ 保存修正報告失敗: ${error.message}`);
    }
    
    // 7. 顯示結果摘要
    console.log('\\n📊 修正結果摘要:');
    console.log(`   總聖詩數: ${anchoredLinks.length}`);
    console.log(`   已修正: ${replaceResult.replaceCount}`);
    console.log(`   未變更: ${anchoredLinks.length - replaceResult.replaceCount}`);
    
    console.log(`\\n🎉 鏈接修正完成！`);
    console.log(`   修正後文件: ${OUTPUT_FILE}`);
    console.log(`   修正報告: link_correction_report.html`);
}

// 執行主函數
if (require.main === module) {
    main();
}

module.exports = { main, extractCorrectLinksFromBrokenPage, extractLinksFromAnchoredFile };


























