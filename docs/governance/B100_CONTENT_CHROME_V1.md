# B100 内容页 Chrome 契约 V1

## 三档

| 档位 | 条件 | 显示 |
|------|------|------|
| **hub-hidden** | 在 Hub/模块壳 `contentFrame` 内 | 隐藏 ae 顶条、crm 安全绳（非 planning）、`.top-nav`、`.anchor-nav`、landing 重复语系行 |
| **minimal** | Standalone 右栏 / 直接开功能页 | 一行：← 回区 landing + 语系（可选） |
| **full** | 无父壳、`data-b100-chrome="full"` | minimal + 搜索/回总站（landing） |

## body 属性

```html
<body data-b100-module="church_ministry"
      data-b100-chrome="hub-hidden|minimal|full"
      data-b100-ae-chrome="minimal|full|off">
```

- 未写 `data-b100-chrome` 时由 `B100HubEmbed.resolveChromeMode()` 推断。
- `data-b100-ae-chrome="off"` → ae_subpage_shell 不注入。

## 实现

- `js/b100_hub_embed.js` — 检测 + `body.b100-hub-embedded`
- `church_ministry/js/ae_subpage_shell.js` — Hub 内跳过 injectTopStrip
- `church_ministry/js/crm_context_bar.js` — Hub 内跳过 renderBar（planning 除外）

## 验收

`tests/test_b100_shell_unified_contract.py`
