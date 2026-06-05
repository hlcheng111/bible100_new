---
name: 统一中文侧边栏字体视觉大小
overview: 通过CSS transform scale微调中文版侧边栏，使其视觉大小与其他语言版本一致，同时保持字体族不变以确保中文显示效果。
todos: []
---

# 统

一中文侧边栏字体视觉大小修复方案

## 问题分析

**根本原因**：

- 中文版 (`languages/index_cn.html`) 使用 `font-family: "Microsoft YaHei", ...`
- 其他语言版本（EN, VI, ID）使用 `font-family: "Segoe UI", ...`
- 即使 `font-size` 相同（12px），微软雅黑字体在视觉上比 Segoe UI 大 8-10%

**为什么之前修改无效**：

- 只修改了 `font-size`，但字体族差异导致的视觉大小差异仍然存在
- 需要同时处理字体渲染的视觉差异

## 解决方案

采用 **CSS `transform: scale()`** 方法，这是最精确且万无一失的方案：

1. **精确控制**：可以精确调整到 0.92-0.93 倍，补偿视觉差异
2. **不影响布局**：使用 `transform-origin: top left` 确保缩放不影响布局
3. **保持字体族**：不需要移除 Microsoft YaHei，保持中文显示效果
4. **浏览器兼容**：所有现代浏览器都支持

## 实施步骤

### 修改文件

- `languages/index_cn.html`

### 具体修改

在 `body, html` 样式中添加 `transform: scale(0.92)` 和 `transform-origin: top left`：

```css
body, html { 
  margin:0; 
  padding:0; 
  height:100%; 
  font-family: "Microsoft YaHei", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; 
  background: #eef6ff; 
  color: #333; 
  font-size: 12px;
  transform: scale(0.92);  /* 缩小8%以匹配其他语言版本的视觉大小 */
  transform-origin: top left;  /* 从左上角开始缩放，不影响布局 */
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

**注意**：由于使用了 `transform: scale()`，需要调整容器宽度以补偿缩放：

```css
#container { 
  height: 100%; 
  overflow-y: auto; 
  padding: 3px 5px;
  width: 108.7%;  /* 100% / 0.92 ≈ 108.7%，补偿缩放 */
}

nav#sidebar { 
  width: 100%; 
  background: #eef6ff; 
  overflow-y: auto; 
  padding: 3px 5px;
  width: 108.7%;  /* 100% / 0.92 ≈ 108.7%，补偿缩放 */
}
```



## 备选方案（如果scale方案有问题）

如果 `transform: scale()` 导致布局问题，可以使用：**方案B：调整字体大小**

- 将中文版的 `font-size` 从 12px 改为 11px
- 将 h3 的 `font-size` 从 0.9rem 改为 0.85rem
- 将链接的 `font-size` 从 10px 改为 9px

**方案C：移除 Microsoft YaHei**

- 将字体族改为与其他语言一致：`"Segoe UI", Tahoma, Geneva, Verdana, sans-serif`
- 但可能影响中文显示效果

## 测试验证

修改后需要：

1. 在浏览器中对比中文版和英文版侧边栏
2. 确认视觉大小一致