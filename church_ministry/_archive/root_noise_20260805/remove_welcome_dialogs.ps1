# 批量去掉所有新系统的confirm欢迎词
# 改为自动载入示例数据

$files = @(
    "modules/members/member-integrated.html",
    "modules/worship/worship-integrated.html", 
    "modules/fellowship/small-groups-integrated.html",
    "modules/volunteer/volunteer-integrated.html",
    "modules/education/education-integrated.html",
    "modules/finance/finance-integrated.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "处理文件: $file"
        
        # 读取文件内容
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # 替换confirm弹窗为自动载入
        $content = $content -replace 'if \(confirm\([^)]+\)\) \{', '// 自动载入示例数据'
        $content = $content -replace 'loadDemo\(\);', 'loadDemo(); // 自动执行'
        
        # 保存文件
        Set-Content $file -Value $content -Encoding UTF8
        Write-Host "✅ 已处理: $file"
    } else {
        Write-Host "❌ 文件不存在: $file"
    }
}

Write-Host "🎉 批量处理完成！"
















