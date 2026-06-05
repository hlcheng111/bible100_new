# Bible100 同步建議記錄

## 📋 **index.html 與 default.html 同步建議**

### 🔍 **對比分析結果**

| 項目 | index.html | default.html | 同步狀態 | 優先級 |
|------|-----------|--------------|----------|--------|
| **HTML標準** | `<!DOCTYPE html>` | `<!DOCTYPE HTML PUBLIC...>` | ❌ 保持不同 | 低 |
| **標題** | "Bible 100 Steps Four Treasures - 中文版" | "聖經百步四寶 - 移动版" | ❌ 保持不同 | 低 |
| **語言鏈接** | `href="languages/index_cn.html"` | `href="#"` | ❌ 保持不同 | 低 |
| **模組按鈕** | 完整路徑 | `href="#"` | ❌ 保持不同 | 低 |
| **hover效果** | `filter:brightness(1.1)` + `transform` | 只有 `background` 變化 | ⏳ **建議同步** | 中 |
| **搜索功能** | ✅ 有 `openGlobalSearch()` | ❌ 沒有 | ⏳ **建議同步** | 中 |
| **iframe通信類名** | `MainFrameManager` | `DefaultFrameManager` | ⏳ **建議同步** | 高 |
| **openSchoolManagement()** | ✅ 已修復 | ✅ 已修復 | ✅ **已完成** | 高 |

---

## 🎯 **建議同步的項目**

### **🔴 高優先級（站大修時優先處理）**

#### 1. **統一iframe通信類名**
```javascript
// 建議：default.html 改用 MainFrameManager
class MainFrameManager {  // 改為與 index.html 相同的名稱
  constructor() {
    this.init();
  }
  // ... 保持功能不變
}
```

### **🟡 中優先級（站大修時考慮）**

#### 2. **統一hover效果**
```css
/* 從 index.html 同步到 default.html */
.lang a:hover {
  filter:brightness(1.1);      /* 新增 */
  transform: translateY(-1px);  /* 新增 */
}
```

#### 3. **添加搜索功能**
```css
/* 添加搜索鏈接樣式到 default.html */
.search-link {
  display: inline-block;
  margin: 0 5px;
  padding: 6px 12px;
  background: #e67e22;
  color: #fff;
  text-decoration: none;
  border-radius: 15px;
  font-weight: bold;
  font-size: 10px;
}
```

```javascript
/* 添加搜索函數到 default.html */
function openGlobalSearch() {
  document.getElementById('sidebarFrame').src = 'nav_hub/search/sidebar.html';
  document.getElementById('contentFrame').src = 'nav_hub/search/dashboard.html';
}
```

### **🟢 低優先級（可選）**

#### 4. **優化initPage()邏輯**
- 統一兩個文件的初始化邏輯
- 清理重複的函數調用

---

## ❌ **不需要同步的項目**

1. **HTML標準** - default.html 保持 HTML4（兼容性考慮）
2. **標題文字** - 區分桌面版/移動版
3. **語言鏈接方式** - default.html 用 `#` + `onclick`（簡化版）
4. **initTopbar()函數** - default.html 不需要（已用內聯事件）

---

## 📝 **站大修時執行計劃**

### **Phase 1: 高優先級同步**
- [ ] 統一iframe通信類名 `MainFrameManager`
- [ ] 測試兩個版本的導航一致性

### **Phase 2: 中優先級同步**
- [ ] 添加hover動畫效果到 default.html
- [ ] 添加搜索功能到 default.html
- [ ] 測試所有模組導航功能

### **Phase 3: 低優先級優化**
- [ ] 優化initPage()邏輯
- [ ] 清理重複代碼
- [ ] 統一註釋風格

---

## ⚠️ **注意事項**

1. **避免"顧此失彼"** - 每次修改後立即測試所有功能
2. **保持版本區別** - 不要讓兩個文件完全相同
3. **漸進式修改** - 一次只改一個功能，測試後再繼續
4. **備份策略** - 修改前備份當前工作版本

---

**創建日期**: 2025-01-16  
**狀態**: 待站大修時執行  
**記錄者**: AI Assistant

