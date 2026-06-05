# 测试与演示文件组织规范

## 📁 文件夹结构

### `demos/` - 演示页面
存放各种功能演示页面，用于展示特定功能的工作原理。

#### `demos/database/` - 数据库演示
- `bible_database_demo.html` - 圣经数据库演示
- `database_demo.html` - 基础数据库演示
- `database_file_loader_test.html` - 文件加载器测试
- `database_manager.html` - 数据库管理器
- `database_test.html` - 数据库测试
- `enhanced_database_demo.html` - 增强版数据库演示
- `ms_access_style_database.html` - MS Access 风格数据库界面
- `QUICK_TEST_快速测试.html` - 快速测试页
- `SIMPLE_GUIDE_简单指南.html` - 简单指南
- `unified_database_management.html` - 统一数据库管理
- `working_database_system.html` - 工作数据库系统

### `tests/` - 测试文件
存放单元测试和集成测试文件。

### `docs/` - 文档
存放项目文档、报告和指南。

#### `docs/guides/` - 操作指南
- 数据库使用指南
- 故障排查指南
- 快速参考手册
- 图片优化指南

#### `docs/reports/` - 项目报告
- 完成报告
- 功能验证报告
- 集成报告
- 部署报告

#### `docs/plans/` - 计划文档
- 开发计划
- 功能规划

---

## 🚨 重要规则

### 1. **禁止在根目录创建测试文件**
所有测试、演示、临时文件必须放在以下目录：
- `demos/` - 演示页面
- `tests/` - 测试文件
- `docs/` - 文档和指南

### 2. **根目录只保留**
- `index.html` - 主入口页面
- `index_mobile.html` - 移动端入口
- `sitemap.html` - 网站地图
- `rule.md` - Cursor AI 工作规则
- `.cursorrules` - Cursor 配置
- `.editorconfig` - 编辑器配置

### 3. **命名规范**
- 测试文件：`*_test.html` 或 `test_*.html`
- 演示文件：`*_demo.html` 或 `demo_*.html`
- 临时文件：`temp_*.html` 或 `*_temp.html`

### 4. **定期清理**
- 每完成一个功能测试后，将测试文件移到 `demos/` 或 `tests/`
- 过时的测试文件移到 `archive/` 或删除

---

## 📝 更新日志

**2025-10-29**
- 创建文档组织规范
- 移动11个数据库测试页到 `demos/database/`
- 移动8个指南文档到 `docs/guides/`
- 移动7个报告文件到 `docs/reports/`
- 删除 `index2.html` (InfinityFree 默认页)
- 移动 `图片优化操作指南.html` 到 `docs/guides/`

---

**维护此规范以保持根目录简洁！**







