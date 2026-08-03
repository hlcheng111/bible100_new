# 教會規劃工具 · 深研驗收存檔

> SSOT 索引：`PLANNING_TOOL_AUDIT_CHARTER_V1.md` · 成熟度 Gold/Silver/Bronze  
> 上雲前工程验收以 **自动化守门** + **file:// 清单** 为主；**用户 UX 实测** 留待上云后（见 `UX_PRACTICAL_TEST_PLAYBOOK_V1.md`）。

## 文件一览

| 文件 | 用途 |
|------|------|
| [TOOL_STATUS_MATRIX.md](./TOOL_STATUS_MATRIX.md) | 18 live 工具成熟度、P0/P1、RunStore id |
| [FILE_PROTOCOL_ACCEPTANCE_CHECKLIST.md](./FILE_PROTOCOL_ACCEPTANCE_CHECKLIST.md) | file:// 逐页签收表（Ctrl+F5） |
| [UX_PRACTICAL_TEST_PLAYBOOK_V1.md](./UX_PRACTICAL_TEST_PLAYBOOK_V1.md) | 上云后用户实测批次剧本 |
| [SHELL_FILE_PROTOCOL_FINAL_V1.md](./SHELL_FILE_PROTOCOL_FINAL_V1.md) | index_v5 总壳终验 |
| [ALGORITHM_SSOT_V1.md](./ALGORITHM_SSOT_V1.md) | 算法文档=代码 SSOT |
| [_TEMPLATE_TOOL_AUDIT.md](./_TEMPLATE_TOOL_AUDIT.md) | 单工具深研模板 |
| `{tool_id}.md` | 各工具持久化 audit（代码核对版） |

## 自动化守门

```powershell
python tests/test_planning_tool_acs_gate.py
python tests/test_all_live_tools_smoke.py
python tests/test_strategic_chain_integrity.py
```

## 改页后

1. 更新对应 `{tool_id}.md` 与 `TOOL_STATUS_MATRIX.md` 一行  
2. 跑守门测试  
3. 上云后按 UX 剧本补用户签收
