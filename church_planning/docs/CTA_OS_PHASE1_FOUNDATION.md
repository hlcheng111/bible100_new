# CTA-OS Phase 1 共同底座（v1）

本文件定義教會人才測評 OS 的 Phase 1 基礎規格，目標是讓所有工具頁只需要「接資料 + 套 UI」即可互聯。

## 1) CTV 官方語義（Canonical）

- 版本：`ctv-semantic-v1.0.0`
- 定義檔：`src/ctv/semantics.ts`
- 六維：
  - `P` 牧養關懷（Pastoral / Shepherding）
  - `S` 屬靈生命（Spiritual / Maturity）
  - `G` 治理與宣教（Governance + Gospel）
  - `C` 能力與傳遞（Competency + Communication）
  - `R` 團隊關係（Relationship / Teamwork）
  - `F` 成形與果效（Formation + Fruit）

同時維持 alias 解析，兼容既有文件中的舊命名（例如 governance / gospel、culture / communication、faith / future）。

## 2) 統一題庫資料結構

- 定義檔：`src/os/itemBank.ts`
- 關鍵欄位：
  - `itemId`, `instrumentId`, `instrumentVersion`
  - `scale`, `reverseScored`, `projection`
  - `itemWeight`, `validityTags`
- 保障規則：
  - 每題 `projection` 權重總和必須等於 `1.0`
  - `itemId` 唯一
  - 量表信任等級 `A/B/C` 可轉換為全域權重

## 3) 統一計分與向量化引擎

- 定義檔：`src/os/scoringEngine.ts`
- 入口：`buildUnifiedCtvFromSubmission(...)`
- 核心做法：
  - 題目先依 scale 正規化到 `0-100`
  - 反向題自動反轉
  - 題目投影到 CTV 六維
  - 以量表信任等級與全域權重做加權聚合
  - 回傳統一 `CtvVector` 與 `instrumentSummaries`

## 4) 統一配對引擎（Role / Team / RACI）

- 定義檔：`src/os/matchEngine.ts`
- 入口：
  - `recommendRoleMatches(...)`
  - `recommendRoleCandidates(...)`
  - `summarizeTeamComposition(...)`
  - `recommendRaciRoleByVector(...)`

以上封裝既有 `matchingEngine`，形成單一路徑供 UI 調用。

## 5) 統一報告引擎

- 定義檔：`src/os/reportEngine.ts`
- 入口：
  - `buildPastoralReport(...)`
  - `toPastoralPlainText(...)`
- 內建風險模板：
  - 高產出低靈命
  - 治理強但團隊弱
  - 作答品質需覆核

## 6) 測試覆蓋

- `src/os/scoringEngine.test.ts`
- `src/os/matchEngine.test.ts`
- `src/os/reportEngine.test.ts`

Phase 1 驗收標準：`npm test` 全綠。
