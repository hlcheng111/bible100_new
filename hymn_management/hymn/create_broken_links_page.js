// 創建斷鏈聖詩頁面
// 從分析結果中提取真正的斷鏈並生成一個新的HTML頁面

const fs = require('fs');
const path = require('path');

// 讀取分析結果
function readAnalysisResults() {
    try {
        const content = fs.readFileSync('broken_links_report.html', 'utf8');
        return content;
    } catch (error) {
        console.error(`❌ 讀取報告失敗: ${error.message}`);
        return null;
    }
}

// 生成實際文件鏈接
function generateActualFileLink(brokenLink) {
    const fs = require('fs');
    
    try {
        // 嘗試不同的路徑變體
        const variations = [
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
        
        // 檢查哪個變體存在
        for (const variation of variations) {
            if (fs.existsSync(variation)) {
                return variation;
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

// 從HTML報告中提取斷鏈數據
function extractBrokenLinksFromReport(htmlContent) {
    const brokenLinks = [];
    
    // 使用正則表達式提取表格行數據
    const rowRegex = /<tr>\s*<td>(\d+)<\/td>\s*<td class="hymn-number">([^<]+)<\/td>\s*<td>([^<]+)<\/td>\s*<td class="chinese-title">([^<]+)<\/td>\s*<td class="broken-link">([^<]+)<\/td>\s*<\/tr>/g;
    
    let match;
    while ((match = rowRegex.exec(htmlContent)) !== null) {
        brokenLinks.push({
            rowIndex: match[1],
            hymnNumber: match[2],
            fullTitle: match[3],
            chineseTitle: match[4],
            brokenLink: match[5]
        });
    }
    
    console.log(`📊 從報告中提取到 ${brokenLinks.length} 個斷鏈`);
    return brokenLinks;
}

// 生成斷鏈聖詩頁面
function generateBrokenLinksPage(brokenLinks) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>斷鏈聖詩列表 - 需要修復的鏈接</title>
    <style>
        body {
            font-family: "Microsoft YaHei", Arial, sans-serif;
            margin: 20px;
            background: #f5f5f5;
            font-size: 14px;
            line-height: 1.6;
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
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
        }
        
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .stats {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
            text-align: center;
        }
        
        .stats h3 {
            margin: 0 0 10px 0;
            color: #856404;
            font-size: 20px;
        }
        
        .stats p {
            margin: 5px 0;
            color: #856404;
            font-size: 16px;
        }
        
        .note {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 20px;
            border-radius: 4px;
        }
        
        .note h4 {
            margin-top: 0;
            color: #0b5fa5;
            font-size: 18px;
        }
        
        .note ul {
            margin-bottom: 0;
        }
        
        .note li {
            margin-bottom: 8px;
        }
        
        .results {
            padding: 20px;
        }
        
        .search-box {
            width: 100%;
            padding: 12px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
        }
        
        .search-box:focus {
            outline: none;
            border-color: #0b5fa5;
            box-shadow: 0 0 0 3px rgba(11, 95, 165, 0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        th {
            background: #0b5fa5;
            color: white;
            padding: 15px 10px;
            text-align: left;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .sortable {
            cursor: pointer;
            user-select: none;
            position: relative;
            transition: background-color 0.3s ease;
        }
        
        .sortable:hover {
            background: #0a4d8a;
        }
        
        .sort-arrow {
            font-size: 12px;
            margin-left: 5px;
            opacity: 0.7;
        }
        
        .sort-asc .sort-arrow::after {
            content: "↑";
            color: #ffd700;
        }
        
        .sort-desc .sort-arrow::after {
            content: "↓";
            color: #ffd700;
        }
        
        td {
            padding: 12px 10px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
        }
        
        tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tr:hover {
            background: #e3f2fd;
            transform: scale(1.001);
            transition: all 0.2s ease;
        }
        
        .hymn-number {
            font-weight: bold;
            color: #0b5fa5;
            font-size: 14px;
            text-align: center;
            min-width: 80px;
        }
        
        .hymn-number a {
            color: #0b5fa5;
            text-decoration: none;
        }
        
        .hymn-number a:hover {
            color: #0a4d8a;
            text-decoration: underline;
        }
        
        .full-title {
            color: #333;
            font-weight: 500;
        }
        
        .full-title a {
            color: #333;
            text-decoration: none;
        }
        
        .full-title a:hover {
            color: #0b5fa5;
            text-decoration: underline;
        }
        
        .chinese-title {
            color: #666;
            font-style: italic;
            font-weight: 500;
        }
        
        .chinese-title a {
            color: #666;
            text-decoration: none;
        }
        
        .chinese-title a:hover {
            color: #0b5fa5;
            text-decoration: underline;
        }
        
        .broken-link {
            color: #dc3545;
            font-weight: bold;
            font-family: monospace;
            font-size: 11px;
            word-break: break-all;
            background: #f8d7da;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
        }
        
        .broken-link a {
            color: #dc3545;
            text-decoration: none;
        }
        
        .broken-link a:hover {
            color: #a71e2c;
            text-decoration: underline;
        }
        
        .action-buttons {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
        }
        
        .btn {
            padding: 10px 20px;
            margin: 0 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: #0b5fa5;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0a4d8a;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
        }
        
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
        }
        
        .no-results {
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 16px;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 0;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            table {
                font-size: 11px;
            }
            
            th, td {
                padding: 8px 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ 斷鏈聖詩列表</h1>
            <p>這些聖詩在索引中顯示，但鏈接指向不存在的文件</p>
        </div>
        
        <div class="stats">
            <h3>📊 統計信息</h3>
            <p><strong>總斷鏈數：</strong>${brokenLinks.length}</p>
            <p><strong>生成時間：</strong>${new Date().toLocaleString('zh-CN')}</p>
            <p><strong>來源文件：</strong>default_simple_sort_fixed.html</p>
        </div>
        
        <div class="note">
            <h4>🔧 修復建議</h4>
            <ul>
                <li><strong>檢查文件路徑：</strong>確認文件是否已移動到其他位置</li>
                <li><strong>文件名檢查：</strong>確認文件名大小寫和特殊字符是否正確</li>
                <li><strong>URL編碼問題：</strong>檢查鏈接中的特殊字符編碼</li>
                <li><strong>重新創建：</strong>如果文件確實缺失，考慮重新創建</li>
                <li><strong>批量修復：</strong>可以根據此列表批量修復鏈接</li>
            </ul>
        </div>
        
        <div class="results">
            <input type="text" class="search-box" id="searchInput" 
                   placeholder="搜索聖詩編號、標題或中文標題..." 
                   onkeyup="filterTable()">
            
            <table id="resultsTable">
                <thead>
                    <tr>
                        <th style="width: 80px;" onclick="sortTable(0)" class="sortable">
                            編號 <span class="sort-arrow">↕</span>
                        </th>
                        <th style="width: 25%;" onclick="sortTable(1)" class="sortable">
                            完整標題 <span class="sort-arrow">↕</span>
                        </th>
                        <th style="width: 20%;" onclick="sortTable(2)" class="sortable">
                            中文標題 <span class="sort-arrow">↕</span>
                        </th>
                        <th style="width: 45%;" onclick="sortTable(3)" class="sortable">
                            斷鏈路徑 <span class="sort-arrow">↕</span>
                        </th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    ${brokenLinks.map((item, index) => {
                        // 生成源文件鏈接（指向帶錨點的文件中對應的行）
                        const sourceLink = `default_simple_sort_fixed_with_anchors.html#row-${item.rowIndex}`;
                        
                        // 嘗試生成實際文件鏈接（如果文件存在）
                        const actualFileLink = generateActualFileLink(item.brokenLink);
                        
                        return `
                    <tr data-index="${index}">
                        <td class="hymn-number">
                            <a href="${sourceLink}" target="_blank" title="查看源文件中的位置">
                                ${item.hymnNumber}
                            </a>
                        </td>
                        <td class="full-title">
                            <a href="${sourceLink}" target="_blank" title="查看源文件中的位置">
                                ${item.fullTitle}
                            </a>
                        </td>
                        <td class="chinese-title">
                            <a href="${sourceLink}" target="_blank" title="查看源文件中的位置">
                                ${item.chineseTitle}
                            </a>
                        </td>
                        <td class="broken-link">
                            <a href="${sourceLink}" target="_blank" title="查看源文件中的原始鏈接">
                                ${item.brokenLink}
                            </a>
                            ${actualFileLink ? `<br><small><a href="${actualFileLink}" target="_blank" style="color: #28a745;">🔗 嘗試實際文件</a></small>` : ''}
                        </td>
                    </tr>
                    `;
                    }).join('')}
                </tbody>
            </table>
            
            <div id="noResults" class="no-results" style="display: none;">
                沒有找到匹配的結果
            </div>
        </div>
        
        <div class="action-buttons">
            <button class="btn btn-primary" onclick="exportToCSV()">💾 導出為CSV</button>
            <button class="btn btn-secondary" onclick="printPage()">🖨️ 打印頁面</button>
        </div>
        
        <div class="timestamp">
            頁面生成時間: ${new Date().toLocaleString('zh-CN')} | 
            總共 ${brokenLinks.length} 個斷鏈需要修復
        </div>
    </div>

    <script>
        let currentSortColumn = -1;
        let currentSortDirection = 'asc';
        
        // 排序功能
        function sortTable(columnIndex) {
            const table = document.getElementById('resultsTable');
            const tbody = document.getElementById('tableBody');
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            
            // 移除其他列的排序標記
            const headers = table.getElementsByTagName('th');
            for (let i = 0; i < headers.length; i++) {
                headers[i].classList.remove('sort-asc', 'sort-desc');
            }
            
            // 確定排序方向
            if (currentSortColumn === columnIndex) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortDirection = 'asc';
                currentSortColumn = columnIndex;
            }
            
            // 添加排序標記
            headers[columnIndex].classList.add(currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            
            // 排序行
            rows.sort((a, b) => {
                let aText = a.cells[columnIndex].textContent.trim();
                let bText = b.cells[columnIndex].textContent.trim();
                
                // 對於編號列，進行數字排序
                if (columnIndex === 0) {
                    const aNum = parseInt(aText) || 0;
                    const bNum = parseInt(bText) || 0;
                    return currentSortDirection === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                // 對於文本列，進行字母排序
                if (currentSortDirection === 'asc') {
                    return aText.localeCompare(bText, 'zh-CN');
                } else {
                    return bText.localeCompare(aText, 'zh-CN');
                }
            });
            
            // 重新排列表格行
            rows.forEach(row => tbody.appendChild(row));
            
            console.log(\`按第\${columnIndex + 1}列\${currentSortDirection === 'asc' ? '升序' : '降序'}排序\`);
        }
        
        // 搜索過濾功能
        function filterTable() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const table = document.getElementById('resultsTable');
            const rows = table.getElementsByTagName('tr');
            const noResults = document.getElementById('noResults');
            
            let visibleCount = 0;
            
            for (let i = 1; i < rows.length; i++) { // 跳過表頭
                const row = rows[i];
                const hymnNumber = row.cells[0].textContent.toLowerCase();
                const fullTitle = row.cells[1].textContent.toLowerCase();
                const chineseTitle = row.cells[2].textContent.toLowerCase();
                
                if (hymnNumber.includes(filter) || 
                    fullTitle.includes(filter) || 
                    chineseTitle.includes(filter)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            }
            
            // 顯示/隱藏"沒有結果"消息
            if (visibleCount === 0 && filter !== '') {
                noResults.style.display = 'block';
                table.style.display = 'none';
            } else {
                noResults.style.display = 'none';
                table.style.display = 'table';
            }
        }
        
        // 導出為CSV
        function exportToCSV() {
            const table = document.getElementById('resultsTable');
            const rows = table.getElementsByTagName('tr');
            
            let csvContent = '編號,完整標題,中文標題,斷鏈路徑\\n';
            
            for (let i = 1; i < rows.length; i++) { // 跳過表頭
                const row = rows[i];
                if (row.style.display !== 'none') {
                    const hymnNumber = row.cells[0].textContent;
                    const fullTitle = '"' + row.cells[1].textContent.replace(/"/g, '""') + '"';
                    const chineseTitle = '"' + row.cells[2].textContent.replace(/"/g, '""') + '"';
                    const brokenLink = '"' + row.cells[3].textContent.replace(/"/g, '""') + '"';
                    
                    csvContent += hymnNumber + ',' + fullTitle + ',' + chineseTitle + ',' + brokenLink + '\\n';
                }
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = '斷鏈聖詩列表_' + new Date().toISOString().slice(0, 10) + '.csv';
            link.click();
        }
        
        // 打印頁面
        function printPage() {
            window.print();
        }
        
        // 頁面加載完成後的初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('斷鏈聖詩頁面已加載，共 ' + ${brokenLinks.length} + ' 個斷鏈');
        });
    </script>
</body>
</html>`;

    return html;
}

// 主函數
function main() {
    console.log('🚀 開始創建斷鏈聖詩頁面...');
    
    // 1. 讀取分析結果
    const htmlContent = readAnalysisResults();
    if (!htmlContent) {
        return;
    }
    
    // 2. 提取斷鏈數據
    const brokenLinks = extractBrokenLinksFromReport(htmlContent);
    if (brokenLinks.length === 0) {
        console.log('❌ 沒有找到斷鏈數據');
        return;
    }
    
    // 3. 生成頁面
    const pageHTML = generateBrokenLinksPage(brokenLinks);
    
    // 4. 保存頁面
    const outputFile = 'broken_hymns_page.html';
    try {
        fs.writeFileSync(outputFile, pageHTML, 'utf8');
        console.log(`✅ 斷鏈聖詩頁面已生成: ${outputFile}`);
        console.log(`📊 包含 ${brokenLinks.length} 個斷鏈聖詩`);
    } catch (error) {
        console.error(`❌ 保存頁面失敗: ${error.message}`);
        return;
    }
    
    console.log('\\n🎉 完成！您現在可以打開 broken_hymns_page.html 查看斷鏈列表');
}

// 執行主函數
if (require.main === module) {
    main();
}

module.exports = { main, extractBrokenLinksFromReport, generateBrokenLinksPage };
