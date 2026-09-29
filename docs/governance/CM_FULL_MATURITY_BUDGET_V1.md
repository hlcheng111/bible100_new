# 教會事工（CM）全熟階段預算表 V1

> **日期**：2026-07-29  
> **用途**：SITE 阶段 0–4 **结案后**，CM 模块单独追到「选单 SSOT 全熟」的**理想进度预算**（非承诺工期，供排程与验收）。  
> **对齐：** [`CHURCH_MODULE_MATURITY_AUDIT_V2.md`](../../church_ministry/docs/CHURCH_MODULE_MATURITY_AUDIT_V2.md) · [`PAGE_MATURITY_INVENTORY_0AF.md`](../../church_ministry/docs/PAGE_MATURITY_INVENTORY_0AF.md) · [`SITE_PHASE_5PLUS_MODULE_WAVES_V1.md`](./SITE_PHASE_5PLUS_MODULE_WAVES_V1.md)

---

## 1. 「全熟」定义（CM 专用，不可与全站混用）

| 层级 | 含义 | 验收谁看 |
|------|------|----------|
| **选单 SSOT 全熟** | `sidebar_church_layout_v1` + 顶栏 A–G + 规划步 1–7 **出现在矩阵里的每一项**，总评 ≥ **✅** 或 intentional **📄**（Landing） | 牧长／同工地图 |
| **基本四页全熟** | 会友／探访／排班／财务：四维 **F+D+B+E 皆 ✅**（非仅 🔹 基本档） | 行政同工 |
| **主路三区全熟** | A 主日一桌、B 小组工作桌、D 外展 3 Tab：**🟡 → ✅** | 区负责同工 |
| **明确不做全熟** | A 区 **7× DEMO**、F 区部分资产 DEMO 岛 — **永久折叠或合并**，不升格为 ✅（与 SITE 0–4 决议一致） | 产品宪法 |

**不含：** `church_planning/` 内 18 量表（属 **PLAN** 波次，见 SITE-5b）。  
**不含：** 换模块出口（SMART/SCH/BS/DD）— 边界已在阶段 3 锁定。

---

## 2. 起点快照（阶段 0–4 完成后 · 2026-07-29）

来源：`CHURCH_MODULE_MATURITY_AUDIT_V2` §9

| 分区 | ✅ | 🔹 | 🟡 | ⏳ | 📄 | ❌ |
|------|-----|-----|-----|-----|-----|-----|
| 顶栏 A–G | 3 | 1 | 3 | 0 | 1 | 0 |
| 日常侧栏 | ~12 | **4** | ~25 | 0 | ~8 | ~2 CRM |
| 规划侧栏（CM 视角） | 18+ | 4 | 0 | **3** | 3 | 0 |

**已落地（0–4）：** Bridge 四页写入、A/B/D 主路接线、C-03 壳契约、W5 四剧本、SMART canonical 优先。

**仍欠（全熟前必清）：** P2 占位 3 项、四页 D/B、A/B/D 🟡 主路、~25 侧栏 🟡 决议、CRM 退役、孤儿页 diff。

---

## 3. CM 全熟子阶段预算（CM-F1～F6）

> **节奏假设：** 1 人主力 + AI 辅助；每子阶段约 **1–2 周**有效开发（含静态测试 + file:// 抽验）。  
> **合计理想工期：约 8–12 周**（可与 SITE-5 并行 PLAN 项）。

| 子阶段 | 名称 | 范围（对齐审计 §8 P0–P3） | 页/项约数 | 理想工期 | 产出 | 验收（file://） |
|--------|------|---------------------------|-----------|----------|------|----------------|
| **CM-F1** | 规划↔行政闭环 | cross-risk 真表或侧栏暂藏结案；leave-swap → `volunteer_shift` Tab；步 6 进行政带 church context；matchmaker ↔ SMART | 3 ⏳ + 4 链 | **1–2 周** | PLAN 侧栏无误导 placeholder；步 6 链 live | G→步6→事奉媒合非占位；E 排班见请假 Tab | **🔄 2026-07-29 首版落地** |
| **CM-F2** | 基本四页 🔹→✅ | 会友/探访/排班/财务：D 维全接 `member_id`/Bridge；B 维 dashboard KPI 一致；财务 alias 收敛 | **4 页** | **2 周** | `test_cm_four_pages_bridge.py` 扩展 | 四页 save → dashboard 数字变；无直写 drift | **🔄 2026-07-29 路線圖橫幅 + 靜態測** |
| **CM-F3** | 顶栏主路 🟡→✅ | **A** 主日一桌 polish；**B** `small-groups-integrated` 阶段 3 四维；**D** `outreach-integrated` 三 Tab 数据链 | **3 顶栏区** | **2 周** | `test_cm_phase2_wave.py` 加强 | A/B/D 顶栏进主桌可完成核心任务 |
| **CM-F4** | 侧栏 🟡 批量决议 | ~25 项逐项：**做满 / 合并 / 下架 / 保持 DEMO 折叠**（写入 0AF 议决栏） | **~25 项** | **2–3 周** | 更新 V2 矩阵；减 🟡 至 ≤8 | 侧栏无「点了不知能干嘛」的 🟡 主链 |
| **CM-F5** | 清道夫 | CRM ❌ 退役 redirect；孤儿页 diff 脚本；desks/mission 并入选单或 archive | **~10 文件** | **1 周** | `audit_sidebar_orphans.py`；redirect 测试 | 旧 CRM hub 跳步 6；无死链主链 |
| **CM-F6** | P3 增强（可选全熟+） | gateway「今天只做一件事」；dashboard 本周 widget；C roster↔会友只读加强 | **4 页增强** | **1–2 周** | 体验 polish，非阻塞 | 仪表板见探访 overdue + 排班缺口 |

### 3.1 子阶段依赖

```
CM-F1 ──► CM-F2（四页 D 维依赖 Bridge 稳定）
CM-F2 ──► CM-F3（主路引用会友/排班数据）
CM-F4 可与 CM-F2/F3 并行（不同文件）
CM-F5 建议在 CM-F4 议决后（知道保留谁）
CM-F6 任意时刻 optional
```

### 3.2 全熟终点数字（目标）

| 指标 | 现况 | CM-F1～F5 后目标 | CM-F6 后 |
|------|------|------------------|----------|
| 日常侧栏 ✅ | ~12 | **≥28** | ≥30 |
| 日常侧栏 🔹 | 4 | **0** | 0 |
| 日常侧栏 🟡（主链） | ~25 | **≤8**（仅折叠 DEMO） | ≤8 |
| 顶栏 A–G ✅ | 3 | **6**（A/B/D/E 升档） | 6 |
| 规划侧栏 ⏳ | 3 | **0** | 0 |
| CRM ❌ 待退 | ~2 | **0** | 0 |

---

## 4. 与 PAGE_MATURITY 四阶段（0–3）对照

| CM 子阶段 | 对应 0AF 施工意义 |
|-----------|-------------------|
| CM-F2 | 四页从「阶段 2 串通」→ **阶段 3 报告/仪表可见** 且 V2 升为 ✅ |
| CM-F3 | A-04 / B-04 / D-01 等主路编号 **阶段 3 做满** |
| CM-F4 | W5b–W5d 余页 **议决落地**（非仅报告入口） |
| CM-F5 | 0-07～0-11 等 **合併/下架** 收尾 |

---

## 5. 测试与文档（每子阶段最小集合）

| 子阶段 | 必跑测试 | 必更新文档 |
|--------|----------|------------|
| CM-F1 | `test_strategic_chain_integrity.py`（若有）· PLAN 侧栏静态 · **`test_cm_site5a_wave.py`** | `CHURCH_MODULE_MATURITY_AUDIT_V2` §5.3 |
| CM-F2 | `test_cm_four_pages_bridge.py` · **`test_cm_site5a_wave.py`** | `CROSS_MODULE_DATA_CONTRACT_V1` |
| CM-F3 | `test_cm_phase2_wave.py` · `test_pastoral_data_hub.py` | V2 §3 顶栏表 |
| CM-F4 | `test_church_nav_ui_contract.py` | `PAGE_MATURITY_INVENTORY_0AF` 议决栏 |
| CM-F5 | `test_unified_navigation.py` · orphan 脚本 | V2 §7 |
| CM-F6 | `test_user_playbooks_w5.py` 回归 | `USER_PLAYBOOKS_W5_V1` 增补 |

---

## 6. file:// 全熟验收清单（CM-F1～F5 全完成后）

1. `index_v5.html` → **教會事工** → 顶栏 A–G 任一项：右栏非 L0 壳，主任务可完成。  
2. **F 行政** → 四页：CRUD + KPI 回仪表板。  
3. **G 步 6** → 行政：无「尚在准备」占位（matchmaker / cross-risk / leave-swap 已结案）。  
4. 侧栏 **7× DEMO** 仍在 `<details>` 且默认关 — **不算失败**。  
5. W5 四剧本仍全过 — **回归**。

---

## 7. 风险与范围冻结

| 风险 | 缓解 |
|------|------|
| CM-F4 25 页逐一做满 scope creep | 强制「三选一」议决（0AF §2）；DEMO 默认合并 |
| 与 PLAN/SMART 双改 | CM-F1 matchmaker 只读 SMART；规划量表不在 CM-F 改 |
| file:// 与 HTTP 不一致 | 以 file:// 为准修（项目规则） |

---

*维护：CM-F 子阶段启动/完成时更新 §2 快照与 §3 状态列；全站优先级见 `SITE_PHASE_5PLUS_MODULE_WAVES_V1.md`。*
