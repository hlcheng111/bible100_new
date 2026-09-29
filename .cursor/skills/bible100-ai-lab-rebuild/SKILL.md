---
name: bible100-ai-lab-rebuild
description: >-
  Rebuilds AI Lab (ai_tools): scenario-first workbench, B100PromptGuardrails,
  presets localStorage, ministry bridge, 4-tab integrated shell. Use when
  restructuring AI Lab IA, prompt workbench, or CM cross-import.
---

# Bible100 · AI Lab 重構 Skill

## 何时启用

- 整理 `ai_tools/` IA、工作台、护栏、跨模块汇入
- 情境一句話入口、复制→外站 AI→人审→汇入事工桌

## 核心哲学

1. **小白**：首屏情境按钮，不懂 A–E 也能开始
2. **专家**：常用范本 localStorage、模板、深链外站 AI
3. **无 API key**：站内只生成 Prompt + `B100PromptGuardrails`
4. **HITL**：`AiMinistryBridge` 只预填/交接，不自动写业务表
5. **file://**：`js/ai_prompt_templates_embedded.js`（跑 `generate_ai_prompt_embedded.js`）

## 主路径 SSOT

| 入口 | 路径 |
|------|------|
| Hub 顶栏2 工作台 | `ai_tools/tools/ai_workbench_integrated.html#tab-prompt` |
| 情境 | `js/ai_scenario_ssot.js` |
| 护栏 | `js/b100_prompt_guardrails.js` |
| 范本 | `js/ai_prompt_presets_store.js` |
| 汇入 CM | `js/ai_ministry_bridge.js` |
| 导航 | `js/ai_zone_nav_ssot.js` |

## 4 Tab 壳

`tools/ai_workbench_integrated.html` — Prompt / 导读 / 测验 / 事工CRM

## 禁止

- ❌ 改 `bible_prompts.json` 后不跑 embedded 生成
- ❌ 外站 AI 劫持 contentFrame（用新分页 + 自动复制）
- ❌ 未人审直接写 CRM / 探访正式表

## 测试

```powershell
node scripts/generate_ai_prompt_embedded.js
node scripts/generate_config_embedded.js
python ai_tools/tests/test_ai_lab_w0_w6.py
python tests/test_index_v5_shell.py
```

## 验收（file://）

1. AI 辅助 → 首屏情境 → 1 点击进工作台
2. 复制 → 去 ChatGPT/Gemini 按钮
3. 一键汇入 → CM 工作桌有横幅/预填
4. 390px 情境按钮可点（≥44px）
