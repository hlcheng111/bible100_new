# Assessment Run 数据契约（v1）

> 教會規劃量表 · 统一本机写入格式。战情室（`cta_os_bridge.js`）优先读取此结构，不再依赖各页硬编码 demo 数据。

## 存储键

| 键 | 用途 |
|----|------|
| `bible100_assessment_latest_{tool_id}` | 该工具最近一次提交（Bridge 快速读取） |
| `bible100_assessment_runs` | 历史数组（最多保留 200 笔，按时间追加） |

实现：`church_planning/js/assessment_run_store.js` → `AssessmentRunStore`

## 必填字段

```json
{
  "schema_version": 1,
  "tool_id": "urgent",
  "timestamp": 1775544000000,
  "member_id": null,
  "profile": {
    "name": "",
    "role": "",
    "church_size": "micro"
  },
  "authenticity_score": 0.85,
  "feature_vector": {
    "P": 62.5,
    "S": 58.0,
    "G": 71.0,
    "C": 65.0,
    "R": 55.0,
    "F": 60.0
  },
  "raw_answers": [
    { "q": "u01", "value": 4 }
  ],
  "risk_flags": ["Q2_BELOW_TARGET"]
}
```

## 可选字段

| 字段 | 说明 |
|------|------|
| `derived` | 工具特有派生值，如 urgent 的四象限 `%` |
| `coaching` | 报告页渲染用结构化辅导文案 |
| `source_note` | Bridge 显示的数据来源说明 |

### urgent 示例 derived

```json
"derived": {
  "q1_pct": 38,
  "q2_pct": 22,
  "q3_pct": 28,
  "q4_pct": 12
}
```

## risk_flags 命名约定

- 全大写 + 下划线
- 示例：`Q2_BELOW_TARGET`、`OVERLOAD_Q1`、`LOW_AUTHENTICITY`、`DISTRACTION_Q3`

## 工具包（Pack）

每工具一文件：`church_planning/js/tool_packs/{tool_id}_pack.js`

- 题目 JSON、计分、防伪、risk_flags、AI prompt 模板
- 提交时调用 `Pack.buildRun(answers, profile)` → 经 `AssessmentRunStore.saveRun()` 写入

## 隐私

- 默认仅存本机 localStorage
- 含 PII 的 profile.name 不得上传 Sheets / 公开 API（v1 离线优先）

## 相关

- 模范页 UX：ALDA（三 Tab + 辅导 + AI prompt）
- Bridge：`church_planning/js/cta_os_bridge.js`
- 试点 Pack：`church_planning/js/tool_packs/urgency_pack.js`
