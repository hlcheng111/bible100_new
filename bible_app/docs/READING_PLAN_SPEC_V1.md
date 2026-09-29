# 读经计划规格 V1（一年 / 三年）

## 数据文件

| 文件 | 赛道 ID | 进度前缀 | 天数 |
|------|---------|----------|------|
| `shell/data/one_year_plan.json` | `plan1y` | `1y:` | 365 |
| `shell/data/three_year_plan.json` | `plan3y` | `3y:` | 1095 |

生成：`python bible_app/scripts/build_reading_plans.py`  
嵌入 file://：`python bible_app/scripts/build_data_bundle.py`

## 每日段落

1. **诗篇** 1 篇（150 篇循环）
2. **旧约**（律法 / 历史 / 诗歌 / 大先知 / 小先知）— 按章序分配
3. **新约**（福音 / 使徒 / 保罗 / 普通书信 / 启示）— 按章序分配

章节总数在计划期内均匀分配（一年约 3 段/天，三年约 1 段/天）。

## 进度与鼓励

- **金星**：`read-done.html` 首次打卡 `1y:{day}` / `3y:{day}` → +1
- **连续天**：`read_progress.js` 日历连续有打卡
- **月历**：绿=已完成、黄=今天、灰=未到；每 30 天里程碑 🏆

## UI 页面

- `pages/track-plan1y.html` + `js/track_plan.js`
- `pages/track-plan3y.html`（`B100_PLAN_KEY=plan3y`）
- 壳默认：`landing.html`；🏠 回欢迎页
- 快捷「今日关卡」→ `track-plan1y.html`

## 与六十六卷关系

- **六十六卷** = 自由探索地图
- **一年/三年** = 有引导的全本计划（推荐新手读完全本）
