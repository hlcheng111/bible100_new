// 智能鏈接修復腳本
// 檢查實際文件存在性，並嘗試找到正確的文件路徑

const fs = require('fs');
const path = require('path');

// 配置
const ORIGINAL_FILE = 'default_simple_sort_fixed.html';
const OUTPUT_FILE = 'default_simple_sort_fixed_SMART_REPAIRED.html';

// 檢查文件是否存在（支持多種變體）
function checkFileExists(filePath) {
    const variations = [
        filePath,
        decodeURIComponent(filePath),
        filePath.replace(/%20/g, ' '),
        filePath.replace(/%2C/g, ','),
        filePath.replace(/%28/g, '('),
        filePath.replace(/%29/g, ')'),
        filePath.replace(/%2E/g, '.'),
        filePath.replace(/%2D/g, '-'),
        filePath.replace(/%27/g, "'"),
        filePath.replace(/%22/g, '"'),
    ];
    
    for (const variation of variations) {
        try {
            if (fs.existsSync(variation)) {
                return variation;
            }
        } catch (error) {
            // 忽略錯誤，繼續嘗試下一個變體
        }
    }
    
    return null;
}

// 搜索可能的文件路徑
function findPossiblePaths(brokenLink) {
    const possiblePaths = [];
    
    // 基本變體
    const baseVariations = [
        brokenLink,
        decodeURIComponent(brokenLink),
        brokenLink.replace(/%20/g, ' '),
        brokenLink.replace(/%2C/g, ','),
        brokenLink.replace(/%28/g, '('),
        brokenLink.replace(/%29/g, ')'),
        brokenLink.replace(/%2E/g, '.'),
        brokenLink.replace(/%2D/g, '-'),
        brokenLink.replace(/%27/g, "'"),
        brokenLink.replace(/%22/g, '"'),
    ];
    
    // 檢查每個變體
    for (const variation of baseVariations) {
        if (fs.existsSync(variation)) {
            possiblePaths.push(variation);
        }
    }
    
    // 如果沒有找到，嘗試模糊搜索
    if (possiblePaths.length === 0) {
        const fileName = path.basename(brokenLink);
        const dirName = path.dirname(brokenLink);
        
        // 搜索目錄中的相似文件
        try {
            if (fs.existsSync(dirName)) {
                const files = fs.readdirSync(dirName);
                const similarFiles = files.filter(file => 
                    file.includes(fileName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '')) ||
                    fileName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '').includes(file.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, ''))
                );
                
                for (const file of similarFiles) {
                    possiblePaths.push(path.join(dirName, file));
                }
            }
        } catch (error) {
            // 忽略錯誤
        }
    }
    
    return possiblePaths;
}

// 提取鏈接信息
function extractLinksWithStatus(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const links = [];
        
        // 使用正則表達式提取表格行中的鏈接
        const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
        const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/g;
        
        let rowMatch;
        let rowIndex = 0;
        
        while ((rowMatch = tableRowRegex.exec(content)) !== null) {
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
                    const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim();
                    cells.push(cellText);
                }
                
                if (cells.length >= 4) {
                    const hymnNumber = cells[0] || '';
                    const fullTitle = cells[1] || '';
                    const englishTitle = cells[2] || '';
                    const chineseTitle = cells[3] || '';
                    
                    // 檢查主要鏈接的狀態
                    const primaryLink = rowLinks[0];
                    const actualFile = checkFileExists(primaryLink.href);
                    const possiblePaths = findPossiblePaths(primaryLink.href);
                    
                    links.push({
                        rowIndex: rowIndex,
                        hymnNumber: hymnNumber,
                        fullTitle: fullTitle,
                        englishTitle: englishTitle,
                        chineseTitle: chineseTitle,
                        links: rowLinks,
                        primaryLink: primaryLink,
                        isWorking: actualFile !== null,
                        actualFile: actualFile,
                        possiblePaths: possiblePaths
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

// 修復鏈接
function repairBrokenLinks(content, links) {
    console.log('🔧 開始修復斷鏈...');
    
    let repairCount = 0;
    const repairs = [];
    
    links.forEach(link => {
        if (!link.isWorking && link.possiblePaths.length > 0) {
            const originalHref = link.primaryLink.href;
            const newHref = link.possiblePaths[0]; // 使用第一個找到的路徑
            
            // 替換鏈接
            const linkRegex = new RegExp(`(<a[^>]*href=["'])${originalHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'][^>]*>)`, 'g');
            content = content.replace(linkRegex, `$1${newHref}$2`);
            
            repairCount++;
            repairs.push({
                hymnNumber: link.hymnNumber,
                chineseTitle: link.chineseTitle,
                originalLink: originalHref,
                newLink: newHref
            });
            
            if (repairCount % 100 === 0) {
                console.log(`修復進度: ${repairCount}`);
            }
        }
    });
    
    console.log(`✅ 修復了 ${repairCount} 個斷鏈`);
    return { repairCount, repairs, content };
}

// 生成修復報告
function generateSmartRepairReport(repairCount, repairs, totalLinks) {
    const reportHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能鏈接修復報告</title>
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
            background: linear-gradient(135deg, #17a2b8, #138496);
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
            <h1>🧠 智能鏈接修復報告</h1>
            <p>通過文件系統掃描自動修復了斷鏈問題</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number total">${totalLinks}</div>
                <div class="stat-label">總聖詩數</div>
            </div>
            <div class="stat-item">
                <div class="stat-number repaired">${repairCount}</div>
                <div class="stat-label">已修復</div>
            </div>
            <div class="stat-item">
                <div class="stat-number working">${totalLinks - repairCount}</div>
                <div class="stat-label">原本正常</div>
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
                    ${repairs.map(repair => `
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
    console.log('🚀 開始智能鏈接修復流程...');
    
    // 1. 讀取原始文件
    let originalContent;
    try {
        originalContent = fs.readFileSync(ORIGINAL_FILE, 'utf8');
        console.log(`✅ 成功讀取原始文件: ${ORIGINAL_FILE}`);
    } catch (error) {
        console.error(`❌ 讀取原始文件失敗: ${error.message}`);
        return;
    }
    
    // 2. 提取鏈接並檢查狀態
    const links = extractLinksWithStatus(ORIGINAL_FILE);
    if (links.length === 0) {
        console.log('❌ 沒有找到鏈接');
        return;
    }
    
    // 3. 統計狀態
    const workingCount = links.filter(link => link.isWorking).length;
    const brokenCount = links.filter(link => !link.isWorking).length;
    
    console.log(`📊 鏈接狀態統計:`);
    console.log(`   總數: ${links.length}`);
    console.log(`   正常: ${workingCount}`);
    console.log(`   斷鏈: ${brokenCount}`);
    
    // 4. 修復斷鏈
    const repairResult = repairBrokenLinks(originalContent, links);
    
    if (repairResult.repairCount === 0) {
        console.log('ℹ️ 沒有需要修復的鏈接');
        return;
    }
    
    // 5. 保存修復後的文件
    try {
        fs.writeFileSync(OUTPUT_FILE, repairResult.content, 'utf8');
        console.log(`✅ 修復後的文件已保存: ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`❌ 保存修復文件失敗: ${error.message}`);
        return;
    }
    
    // 6. 生成修復報告
    const reportHTML = generateSmartRepairReport(repairResult.repairCount, repairResult.repairs, links.length);
    try {
        fs.writeFileSync('smart_repair_report.html', reportHTML, 'utf8');
        console.log('✅ 智能修復報告已生成: smart_repair_report.html');
    } catch (error) {
        console.error(`❌ 保存修復報告失敗: ${error.message}`);
    }
    
    // 7. 顯示結果摘要
    console.log('\\n📊 修復結果摘要:');
    console.log(`   總聖詩數: ${links.length}`);
    console.log(`   已修復: ${repairResult.repairCount}`);
    console.log(`   原本正常: ${workingCount}`);
    
    console.log(`\\n🎉 智能修復完成！`);
    console.log(`   修復後文件: ${OUTPUT_FILE}`);
    console.log(`   修復報告: smart_repair_report.html`);
}

// 執行主函數
if (require.main === module) {
    main();
}

module.exports = { main, extractLinksWithStatus, repairBrokenLinks };


























