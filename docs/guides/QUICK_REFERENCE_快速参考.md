# 📌 Bible100 数据库系统 - 快速参考卡

---

## 🚀 **快速启动**

### **1. 数据库管理器（推荐）**
```
file:///C:/Users/hlche/.cursor/bible100_new/database_manager.html
```
**功能：** 统一管理所有数据表、导入导出、批量操作

---

### **2. 模块页面**

| 模块 | 路径 | 数据表 |
|------|------|--------|
| 🎓 学校管理 | `school_management/database_integration.html` | students, teachers, courses, classes |
| ⛪ 教会事工 | `church_ministry/database_integration.html` | members, volunteers, activities, donations |
| 📖 圣经研读 | `bible_study/database_integration.html` | bible_study_records, bible_notes, bible_progress |

---

## 💻 **常用操作速查**

### **添加数据**
```javascript
// 按F12打开控制台
simpleDB.insert('表名', {
    字段1: '值1',
    字段2: '值2'
});
```

### **查询数据**
```javascript
// 查询所有
simpleDB.select('表名');

// 条件查询
simpleDB.select('表名', { 字段: '值' });
```

### **更新数据**
```javascript
simpleDB.update('表名', 记录ID, {
    字段: '新值'
});
```

### **删除数据**
```javascript
simpleDB.delete('表名', 记录ID);
```

---

## 📤 **导入导出**

### **导出CSV（Excel可用）**
```
1. 打开 database_manager.html
2. 点击"导出到CSV"
3. 选择数据表
4. 下载文件
5. 直接用Excel打开（不会乱码）
```

### **导入CSV**
```
1. Excel另存为 "CSV UTF-8"
2. 打开 database_manager.html
3. 点击"从CSV导入"
4. 选择表和文件
5. 导入完成
```

---

## 🔧 **高级功能**

### **批量操作**
```javascript
// 批量更新
simpleDB.advanced.bulkUpdate('表名', 
    { 条件字段: '值' },
    { 更新字段: '新值' }
);

// 批量删除
simpleDB.advanced.bulkDelete('表名', 
    { 条件字段: '值' }
);
```

### **联表查询**
```javascript
simpleDB.advanced.join('表1', '表2', '关联字段');
```

### **数据统计**
```javascript
simpleDB.advanced.groupBy('表名', '分组字段', {
    数值字段: 'sum'  // 或 'avg', 'min', 'max'
});
```

---

## 📊 **生成报表**

### **方法1：使用演示页面**
```
enhanced_database_demo.html
-> 生成示例数据
-> 点击报表按钮
-> 导出CSV/JSON
```

### **方法2：使用模块页面**
```
church_ministry/database_integration.html
-> 报表中心
-> 查看图表
-> 导出数据
```

---

## 🆘 **常见问题**

### **Q: Excel打开CSV乱码？**
**A:** 使用 database_manager.html 导出，自动解决乱码。

### **Q: 数据存在哪里？**
**A:** 浏览器localStorage，路径：
```
C:\Users\hlche\AppData\Local\Microsoft\Edge\
User Data\Default\Local Storage
```

### **Q: 如何备份？**
**A:** 
```
任意模块页面 -> 数据库管理 -> 备份数据库
或
database_manager.html -> 备份数据库
```

### **Q: 不同浏览器数据共享吗？**
**A:** 不共享。需要导出/导入。

---

## 🎯 **最佳实践**

### **数据安全**
- ✅ 每周备份一次
- ✅ 重要操作前先备份
- ✅ 保留最近3个备份文件

### **性能优化**
- ✅ 单表记录控制在10,000以内
- ✅ 定期清理历史数据
- ✅ 使用索引加速查询

### **团队协作**
- ✅ 统一使用UTF-8编码
- ✅ 约定数据表结构
- ✅ 定期同步数据备份

---

## 📞 **技术支持文档**

| 文档 | 说明 |
|------|------|
| `DATABASE_USER_GUIDE_使用指南.md` | 完整使用指南 |
| `DATABASE_INTEGRATION_COMPLETE.md` | 集成完成报告 |
| `QUICK_REFERENCE_快速参考.md` | 本文档 |

---

## 🔗 **相关文件**

```
js/simple_database_system.js      - 核心数据库系统
js/advanced_database_features.js  - 高级功能
js/report_generator.js             - 报表生成器
js/csv_import_tool.js              - CSV导入导出
js/sample_data_generator.js       - 示例数据生成器
```

---

## 💡 **快捷键**

| 快捷键 | 功能 |
|--------|------|
| `F12` | 打开浏览器控制台 |
| `Ctrl+Shift+I` | 打开开发者工具 |
| `F5` | 刷新页面 |
| `Ctrl+S` | 保存（浏览器中无效） |

---

## 📝 **控制台快捷命令**

```javascript
// 查看所有数据表
simpleDB.getTableNames()

// 查看数据库状态
simpleDB.getStatus()

// 查看某表记录数
simpleDB.getRecordCount('表名')

// 备份数据库
simpleDB.backup()

// 导出完整数据
simpleDB.exportData()
```

---

**版本：** 1.0  
**更新日期：** 2025-01-16  
**打印建议：** A4纸，双面打印，随时参考














