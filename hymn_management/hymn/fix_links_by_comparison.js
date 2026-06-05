// 通過對比兩個文件來修復鏈接
// 用 default_simple_sort_fixed_with_anchors.html 中正確的鏈接替換 default_simple_sort_fixed.html 中錯誤的鏈接

const fs = require('fs');
const path = require('path');

// 配置
const ORIGINAL_FILE = 'default_simple_sort_fixed.html';
const ANCHORED_FILE = 'default_simple_sort_fixed_with_anchors.html';
const OUTPUT_FILE = 'default_simple_sort_fixed_REPAIRED.html';

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

// 修復鏈接
function repairLinks(originalLinks, anchoredLinks) {
    console.log('🔧 開始修復鏈接...');
    
    const repairResults = {
        total: originalLinks.length,
        repaired: 0,
        notFound: 0,
        alreadyWorking: 0,
        repairs: []
    };
    
    // 創建錨點版本的查找映射
    const anchoredMap = new Map();
    anchoredLinks.forEach(item => {
        // 使用編號作為主要鍵
        if (item.hymnNumber) {
            anchoredMap.set(item.hymnNumber, item);
        }
        // 也可以使用中文標題作為備用鍵
        if (item.chineseTitle) {
            anchoredMap.set(item.chineseTitle, item);
        }
    });
    
    originalLinks.forEach(originalItem => {
        const hymnNumber = originalItem.hymnNumber;
        const chineseTitle = originalItem.chineseTitle;
        
        // 查找對應的錨點版本
        let anchoredItem = anchoredMap.get(hymnNumber) || anchoredMap.get(chineseTitle);
        
        if (anchoredItem && anchoredItem.primaryLink) {
            // 檢查原始鏈接是否已經工作
            const originalExists = checkFileExists(originalItem.primaryLink.href);
            const anchoredExists = checkFileExists(anchoredItem.primaryLink.href);
            
            if (!originalExists && anchoredExists) {
                // 需要修復
                repairResults.repaired++;
                repairResults.repairs.push({
                    hymnNumber: hymnNumber,
                    originalLink: originalItem.primaryLink.href,
                    newLink: anchoredItem.primaryLink.href,
                    chineseTitle: chineseTitle
                });
            } else if (originalExists) {
                repairResults.alreadyWorking++;
            } else {
                repairResults.notFound++;
            }
        } else {
            repairResults.notFound++;
        }
    });
    
    console.log(`✅ 修復統計: 總數 ${repairResults.total}, 已修復 ${repairResults.repaired}, 已正常 ${repairResults.alreadyWorking}, 未找到 ${repairResults.notFound}`);
    
    return repairResults;
}

// 生成修復後的HTML
function generateRepairedHTML(originalFilePath, repairResults) {
    try {
        let content = fs.readFileSync(originalFilePath, 'utf8');
        
        console.log('🔨 開始替換鏈接...');
        
        repairResults.repairs.forEach((repair, index) => {
            if (index % 100 === 0) {
                console.log(`修復進度: ${index + 1}/${repairResults.repairs.length}`);
            }
            
            // 替換鏈接
            const originalHref = repair.originalLink;
            const newHref = repair.newLink;
            
            // 使用更精確的正則表達式替換
            const linkRegex = new RegExp(`(<a[^>]*href=["'])${originalHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'][^>]*>)`, 'g');
            content = content.replace(linkRegex, `$1${newHref}$2`);
        });
        
        console.log('✅ 鏈接替換完成');
        return content;
        
    } catch (error) {
        console.error(`❌ 生成修復HTML失敗: ${error.message}`);
        return null;
    }
}

// 生成修復報告
function generateRepairReport(repairResults) {
    const reportHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>鏈接修復報告</title>
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
        .stat-number.repaired { color: #28a745; }
        .stat-number.working { color: #17a2b8; }
        .stat-number.notfound { color: #ffc107; }
        
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
            <h1>🔧 鏈接修復報告</h1>
            <p>通過對比兩個文件修復了斷鏈問題</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number total">${repairResults.total}</div>
                <div class="stat-label">總聖詩數</div>
            </div>
            <div class="stat-item">
                <div class="stat-number repaired">${repairResults.repaired}</div>
                <div class="stat-label">已修復</div>
            </div>
            <div class="stat-item">
                <div class="stat-number working">${repairResults.alreadyWorking}</div>
                <div class="stat-label">原本正常</div>
            </div>
            <div class="stat-item">
                <div class="stat-number notfound">${repairResults.notFound}</div>
                <div class="stat-label">未找到對應</div>
            </div>
        </div>
        
        <div class="results">
            <h3>🔍 修復詳細列表</h3>
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
                    ${repairResults.repairs.map(repair => `
                    <tr>
                        <td><strong>${repair.hymnNumber}</strong></td>
                        <td>${repair.chineseTitle}</td>
                        <td class="old-link">${repair.originalLink}</td>
                        <td class="new-link">${repair.newLink}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="timestamp">
            修復報告生成時間: ${new Date().toLocaleString('zh-CN')}
        </div>
    </div>
</body>
</html>`;

    return reportHTML;
}

// 主函數
function main() {
    console.log('🚀 開始鏈接修復流程...');
    
    // 1. 提取兩個文件的鏈接信息
    console.log('📖 讀取原始文件...');
    const originalLinks = extractLinksFromFile(ORIGINAL_FILE);
    
    console.log('📖 讀取錨點文件...');
    const anchoredLinks = extractLinksFromFile(ANCHORED_FILE);
    
    if (originalLinks.length === 0 || anchoredLinks.length === 0) {
        console.log('❌ 無法讀取文件或沒有找到鏈接');
        return;
    }
    
    // 2. 分析並修復鏈接
    const repairResults = repairLinks(originalLinks, anchoredLinks);
    
    if (repairResults.repaired === 0) {
        console.log('ℹ️ 沒有需要修復的鏈接');
        return;
    }
    
    // 3. 生成修復後的HTML
    console.log('🔨 生成修復後的HTML...');
    const repairedContent = generateRepairedHTML(ORIGINAL_FILE, repairResults);
    
    if (!repairedContent) {
        console.log('❌ 生成修復HTML失敗');
        return;
    }
    
    // 4. 保存修復後的文件
    try {
        fs.writeFileSync(OUTPUT_FILE, repairedContent, 'utf8');
        console.log(`✅ 修復後的文件已保存: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`❌ 保存修復文件失敗: ${error.message}`);
        return;
    }
    
    // 5. 生成修復報告
    const reportHTML = generateRepairReport(repairResults);
    try {
        fs.writeFileSync('link_repair_report.html', reportHTML, 'utf8');
        console.log('✅ 修復報告已生成: link_repair_report.html');
    } catch (error) {
        console.error(`❌ 保存修復報告失敗: ${error.message}`);
    }
    
    // 6. 顯示結果摘要
    console.log('\\n📊 修復結果摘要:');
    console.log(`   總聖詩數: ${repairResults.total}`);
    console.log(`   已修復: ${repairResults.repaired}`);
    console.log(`   原本正常: ${repairResults.alreadyWorking}`);
    console.log(`   未找到對應: ${repairResults.notFound}`);
    
    console.log(`\\n🎉 修復完成！`);
    console.log(`   修復後文件: ${OUTPUT_FILE}`);
    console.log(`   修復報告: link_repair_report.html`);
}

// 執行主函數
if (require.main === module) {
    main();
}

module.exports = { main, extractLinksFromFile, repairLinks, generateRepairedHTML };
