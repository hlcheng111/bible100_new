// 聖詩鏈接分析腳本
// 用於分析 default_simple_sort_fixed.html 中的斷鏈

const fs = require('fs');
const path = require('path');

// 配置
const SOURCE_FILE = 'default_simple_sort_fixed.html';
const OUTPUT_FILE = 'broken_links_report.html';

// 讀取源文件
function readSourceFile() {
    try {
        const content = fs.readFileSync(SOURCE_FILE, 'utf8');
        console.log(`✅ 成功讀取源文件: ${SOURCE_FILE}`);
        return content;
    } catch (error) {
        console.error(`❌ 讀取文件失敗: ${error.message}`);
        return null;
    }
}

// 檢查文件是否存在
function checkFileExists(filePath) {
    try {
        // 首先檢查原始路徑
        if (fs.existsSync(filePath)) {
            return true;
        }
        
        // 如果原始路徑不存在，嘗試解碼URL編碼
        const decodedPath = decodeURIComponent(filePath);
        if (fs.existsSync(decodedPath)) {
            return true;
        }
        
        // 嘗試其他可能的變體
        const variations = [
            filePath.replace(/%20/g, ' '),  // 空格
            filePath.replace(/%2C/g, ','),  // 逗號
            filePath.replace(/%28/g, '('),  // 左括號
            filePath.replace(/%29/g, ')'),  // 右括號
            filePath.replace(/%2E/g, '.'),  // 點
            filePath.replace(/%2D/g, '-'),  // 連字符
            filePath.replace(/%27/g, "'"),  // 單引號
            filePath.replace(/%22/g, '"'),  // 雙引號
        ];
        
        for (const variation of variations) {
            if (fs.existsSync(variation)) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

// 提取鏈接信息
function extractLinks(htmlContent) {
    const links = [];
    
    // 使用正則表達式提取表格行中的鏈接
    const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/g;
    
    let rowMatch;
    let rowIndex = 0;
    
    while ((rowMatch = tableRowRegex.exec(htmlContent)) !== null) {
        rowIndex++;
        const rowContent = rowMatch[1];
        
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
                    rowIndex: rowIndex,
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
    
    console.log(`📊 提取到 ${links.length} 個聖詩條目`);
    return links;
}

// 檢查鏈接狀態
function checkLinkStatus(links) {
    const results = {
        total: links.length,
        working: 0,
        broken: 0,
        unknown: 0,
        brokenLinks: []
    };
    
    console.log('🔍 開始檢查鏈接狀態...');
    
    links.forEach((item, index) => {
        if (index % 100 === 0) {
            console.log(`檢查進度: ${index + 1}/${links.length}`);
        }
        
        const primaryLink = item.primaryLink;
        if (primaryLink) {
            const fileExists = checkFileExists(primaryLink.href);
            
            if (fileExists) {
                results.working++;
            } else {
                results.broken++;
                results.brokenLinks.push({
                    ...item,
                    status: 'broken',
                    brokenLink: primaryLink.href
                });
            }
        } else {
            results.unknown++;
        }
    });
    
    return results;
}

// 生成HTML報告
function generateHTMLReport(results) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>聖詩斷鏈報告</title>
    <style>
        body {
            font-family: "Microsoft YaHei", Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
            font-size: 14px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: #dc3545;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
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
        .stat-number.working { color: #28a745; }
        .stat-number.broken { color: #dc3545; }
        .stat-number.unknown { color: #ffc107; }
        
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
            position: sticky;
            top: 0;
        }
        
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tr:hover {
            background: #e3f2fd;
        }
        
        .hymn-number {
            font-weight: bold;
            color: #0b5fa5;
        }
        
        .broken-link {
            color: #dc3545;
            font-weight: bold;
            font-family: monospace;
            font-size: 11px;
        }
        
        .chinese-title {
            color: #666;
            font-style: italic;
        }
        
        .note {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .note h4 {
            margin-top: 0;
            color: #0b5fa5;
        }
        
        .note ul {
            margin-bottom: 0;
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
            <h1>❌ 聖詩斷鏈分析報告</h1>
            <p>分析 default_simple_sort_fixed.html 中的鏈接狀態</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number total">${results.total}</div>
                <div class="stat-label">總聖詩數</div>
            </div>
            <div class="stat-item">
                <div class="stat-number working">${results.working}</div>
                <div class="stat-label">正常鏈接</div>
            </div>
            <div class="stat-item">
                <div class="stat-number broken">${results.broken}</div>
                <div class="stat-label">斷鏈</div>
            </div>
            <div class="stat-item">
                <div class="stat-number unknown">${results.unknown}</div>
                <div class="stat-label">未知狀態</div>
            </div>
        </div>
        
        <div class="results">
            <div class="note">
                <h4>📋 分析說明</h4>
                <ul>
                    <li><strong>總聖詩數：</strong>在 default_simple_sort_fixed.html 中找到的聖詩條目總數</li>
                    <li><strong>正常鏈接：</strong>鏈接指向的文件存在且可訪問</li>
                    <li><strong>斷鏈：</strong>鏈接指向的文件不存在</li>
                    <li><strong>未知狀態：</strong>無法確定鏈接狀態的條目</li>
                </ul>
            </div>
            
            ${results.broken > 0 ? `
            <h3>🔍 斷鏈詳細列表 (${results.broken} 個)</h3>
            <table>
                <thead>
                    <tr>
                        <th>行號</th>
                        <th>聖詩編號</th>
                        <th>完整標題</th>
                        <th>中文標題</th>
                        <th>斷鏈路徑</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.brokenLinks.map(item => `
                    <tr>
                        <td>${item.rowIndex}</td>
                        <td class="hymn-number">${item.hymnNumber}</td>
                        <td>${item.fullTitle}</td>
                        <td class="chinese-title">${item.chineseTitle}</td>
                        <td class="broken-link">${item.brokenLink}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="note">
                <h4>🎉 好消息！</h4>
                <p>沒有發現斷鏈，所有聖詩鏈接都指向存在的文件。</p>
            </div>
            `}
            
            <div class="note">
                <h4>🔧 修復建議</h4>
                <ul>
                    <li><strong>檢查文件路徑：</strong>確認文件是否移動到其他位置</li>
                    <li><strong>文件名檢查：</strong>確認文件名大小寫和特殊字符是否正確</li>
                    <li><strong>重新創建：</strong>如果文件確實缺失，考慮重新創建</li>
                    <li><strong>批量修復：</strong>可以根據此報告批量修復鏈接</li>
                </ul>
            </div>
        </div>
        
        <div class="timestamp">
            報告生成時間: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    return html;
}

// 主函數
function main() {
    console.log('🚀 開始聖詩鏈接分析...');
    
    // 1. 讀取源文件
    const htmlContent = readSourceFile();
    if (!htmlContent) {
        return;
    }
    
    // 2. 提取鏈接
    const links = extractLinks(htmlContent);
    if (links.length === 0) {
        console.log('❌ 沒有找到任何鏈接');
        return;
    }
    
    // 3. 檢查鏈接狀態
    const results = checkLinkStatus(links);
    
    // 4. 生成報告
    const reportHTML = generateHTMLReport(results);
    
    // 5. 保存報告
    try {
        fs.writeFileSync(OUTPUT_FILE, reportHTML, 'utf8');
        console.log(`✅ 報告已生成: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`❌ 保存報告失敗: ${error.message}`);
        return;
    }
    
    // 6. 顯示結果摘要
    console.log('\n📊 分析結果摘要:');
    console.log(`   總聖詩數: ${results.total}`);
    console.log(`   正常鏈接: ${results.working}`);
    console.log(`   斷鏈: ${results.broken}`);
    console.log(`   未知狀態: ${results.unknown}`);
    
    if (results.broken > 0) {
        console.log(`\n❌ 發現 ${results.broken} 個斷鏈，詳細信息請查看 ${OUTPUT_FILE}`);
    } else {
        console.log('\n🎉 所有鏈接都正常！');
    }
}

// 執行主函數
if (require.main === module) {
    main();
}

module.exports = { main, extractLinks, checkLinkStatus, generateHTMLReport };
