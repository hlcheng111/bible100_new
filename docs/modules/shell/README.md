# 总站壳 · config（P2 / cleanupWaves[1]）

**SSOT：** `index_v5.html` · `config/modes.json` · `config/modules.json` · `js/config-embedded.js`

## 双 iframe 结构

| 区域 | 默认 |
|------|------|
| 侧栏 | `languages/index_cn.html`（随 modes 切换） |
| 内容 | `languages/landing_new_cn.html` |
| 顶栏 | `config/modes.json` → 嵌入 `config-embedded.js` |

## 改 modes 后必跑

```bash
node scripts/generate_config_embedded.js
python tests/test_config_embedded_sync.py
python tests/test_index_v5_shell.py
```

## P2 验收

```bash
python tests/test_p2_shell_and_tags.py
```

含：壳静态契约 · config 同步 · manifest P0 · 模組根紀律 · planning hub `data-b100-module` 标记。
