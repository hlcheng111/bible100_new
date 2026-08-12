# 云端镜像工作流 V1（2026-08-07）

## 目标

- **开发唯一源**：`C:\Users\hlche\.cursor\bible100_new`
- **FTP 包**：`C:\Users\hlche\.cursor\bible100_new_2`
- **线上**：https://bible100.lovestoblog.com/（`index.html` → `index_v5.html`）

本机 `file://` 所见 = 产品真相；云端须通过 sync + FTP 追平。

## 一键同步

```bat
run_sync_cloud_mirror.bat
```

或 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\sync_cloud_pack_to_mirror.ps1
powershell -ExecutionPolicy Bypass -File scripts\audit_cloud_mirror.ps1
```

同步完成后：

1. 解压 **`bible100_new_2\_ftp_outbox\FTP_yyyyMMdd_HHmm.zip`** 到远程 `htdocs/`（保留内层路径）
2. 或打开 ZIP 内文件，按 **`PATHS.txt`** 路径拖到 FileZilla
3. 勿删整个 htdocs；冲突选「跳过相同、覆盖较新」

增量包：`scripts/build_ftp_upload_delta.ps1`（**仅变更的单文件**，非整夹）

## 体积策略

见 `CLOUD_PACK_4P8_FULL_V1.md`：约 ≤4.8GB，含诗歌图库、CN/VI/ID 课、对照译本 clean JSON；**不含** `data/cj/` 综合解读大库。

## 改 config 后

```powershell
node scripts/generate_config_embedded.js
run_sync_cloud_mirror.bat
```

## 已知云端差异修复（2026-08-07）

| 问题 | 处理 |
|------|------|
| kh/lo 404 | 新增 landP / index / chapter 占位页（籌備中） |
| 诗歌 Big5 乱码 | `hymn_management/hymn/.htaccess` AddCharset Big5 |
| 旧 QNA / smart_ministry 顶栏 | sync 后 mirror 不应含 `qna_index_4layer*.htm` 等 |
| vi/id chapter 404 | include 清单含 `languages/vi/`、`languages/id/` 整树 |

## Agent 汇报模板

完成任务时若动到站点壳／模块／config：

1. 已跑 `generate_config_embedded.js`（若适用）
2. 已 sync → `bible100_new_2`
3. audit 结果 PASS/FAIL
4. 请用户 FileZilla 上传并强刷 `index_v5.html?v=日期`
