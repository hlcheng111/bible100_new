# index_v5 总壳 · file:// 终验 v1

> 在 18 工具单页签收完成后，做总壳回归。路径：`file:///C:/Users/hlche/.cursor/bible100_new/index_v5.html`

## 必检项

### 顶栏 1（大模块）

- [ ] 教会规划 / 各模块入口可点  
- [ ] 切换模块时左栏 `sidebarFrame` + 右栏 `contentFrame` 正确  

### 教会规划 Hub

- [ ] 右栏**不**载入带内层 `contentFrame` 的模块壳（无壳中壳）  
- [ ] `church_planning` 侧栏 18 工具链接可达  
- [ ] Phase 1/2/3 旅程文案与 `planning_phase_config.js` 一致  

### 代表链（5 分钟）

1. index_v5 → 教会规划 → NCD（或 spiritual）  
2. 侧栏换 SWOT → 右栏换页、左栏仍为规划侧栏  
3. 教會規劃 → RACI（T4）→ 五步法可开 `#why`  
4. 窄屏 ☰ 左栏可收起  

### 禁止项（UNIFIED_NAVIGATION）

- [ ] 侧栏无 `href="#"` 主导航  
- [ ] 跨模块用 `data-b100-nav="module"` 或顶栏，非 silent 换他模侧栏  

## 自动化

```powershell
python tests/test_index_v5_shell.py
python tests/test_church_nav_ui_contract.py
python tests/test_all_live_tools_smoke.py
```

## 终签

| 日期 | file:// index_v5 | 教会规划链 | 备注 |
|------|------------------|------------|------|
| | ☐ | ☐ | 上云后用户终验 |
