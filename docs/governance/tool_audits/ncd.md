# NCD 教会健康 · 深研验收卡

tool_id: **ncd** | 类型: T2 | 日期: 2026-08-03 | 成熟度: **Silver**

## 0. 一句话定位

八维木桶 · 最小因子决定本年度唯一攻坚；24 题快评 + 十步深度精灵。

## 1. 专业对标

| 项目 | SSOT |
|------|------|
| 八维 | `ncd_pack.js` `INTL_DIMS` ×8，每维 3 题 |
| 最小因子 | `computeMinimumFactor()` 最低维均分 |
| 双轨存储 | 快评 → RunStore `ncd`；Vue → `chp2026-health-result` → 迁移双写 |

## 5. PATCH

| 优先 | 项 |
|------|-----|
| P1 | 顶栏补 `🔍 先看示範報告`（现 Tab①/② 有） |
| P1 | Vue 完成必触发 `saveFromHealthResult` |
| P2 | file:// CDN 签收 |
| ✅ | report-heart `mountAfterSummary(ncd)` |

## 7. 链路

- 上游：可独立（spiritual 为全站建议序，非 RunStore 强制）
- 下游：SWOT Wi 锁、SMART/PDCA prefill、媒合（Tab① 链）

## 8. 结论

**Silver** · 架构混合度高 · UX 待上云
