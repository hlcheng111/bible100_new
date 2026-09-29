# Hub Base 底座 V1（Phase 1 · Wave 1）

> 2026-08-19 · 與 `SITE_GOVERNANCE.md`、`bible100-cross-module-data.mdc` 並列  
> **一句話**：全站 facade + 審計 + USB 匯出；**不取代**各域 canonical 寫入權。

---

## 1. 定位

| 層 | 路徑 | 職責 |
|----|------|------|
| **Hub Base（本波新增）** | `js/hub_base/` | Schema 契約、審計日誌、匯入匯出、角色模擬 API |
| **Canonical 會友** | `js/central_member_db.js` | `memberSystemData` 唯一寫入 |
| **Canonical 事奉** | `js/smart_ministry_canonical_store.js` | `bible100_smart_ministry_main` |
| **Canonical 量表** | `church_planning/js/assessment_run_store.js` | `bible100_assessment_runs` |
| **Hub 殼** | `index_v5.html` | 導航、iframe；Wave 1 不改業務邏輯 |

**鐵律**：`HubBase.write*` 僅**委派**上述 canonical API，並附 `logAudit()`；業務頁不得繞過 canonical 直寫 localStorage。

---

## 2. 五域 Schema 對照

| Hub Base 域 | Canonical 鍵 | API |
|-------------|--------------|-----|
| `member_crm` | `memberSystemData` | `CentralMemberDB` |
| `ministry_catalog` | `…main.ministries` | `SmartMinistryCanonical` |
| `talent_pool` | `…main.talents` | `SmartMinistryCanonical` |
| `audit_log` | `bible100_audit_log` | `HubBase.logAudit`（新增） |
| `pdca_run` | `bible100_assessment_runs` | `AssessmentRunStore` |

`spaceId` 對外統一；對內映射 `churchId` / `church_id`（離線預設 `default`；URL `?church_id=` 可覆寫）。

---

## 3. 載入順序（Standalone / demo）

```html
<script src="js/hub_base/hub_base_constant.js"></script>
<script src="js/hub_base/hub_base_schema.js"></script>
<script src="js/hub_base/hub_base_utils.js"></script>
<!-- 可選：先載 canonical 後用 facade -->
<script src="js/central_member_db.js"></script>
<script src="js/smart_ministry_canonical_store.js"></script>
<script src="church_planning/js/assessment_run_store.js"></script>
```

Console 自測：

```javascript
HubBase.setSimulatedRole('admin');
HubBase.logAudit({ domain: 'hub_base', action: 'self_test' });
HubBase.exportBundle();
```

---

## 4. 波次對齊（module_manifest cleanupWaves）

| 波次 | 本底座 |
|------|--------|
| **Wave 1** 壳与 config | ✅ Phase 1：三檔 + 本文件 + 煙測 |
| **Wave 3** church_ministry | 階段二：配對閉環經 `HubBase` 審計（不換 canonical） |
| **Phase 2a** | ✅ `demand-form` + `gateway` + `talent_ministry_matching` 接入 |
| **Phase 3** | ✅ `pdca_hub_bridge` + PDCA/靈命健康聚合 + 三模側欄會友主路 |
| **Phase 3b** | ✅ `hub-audit-viewer.html` + `hub-data-health.html` + `hub_base_ops.js` + Demo 隔離 + 異常流程 |
| **Wave 4+** | 各模組 `// TODO V2: 遷移至 hub_base` 漸進接入 |

---

## 5. Phase 1 驗收

- [ ] `js/hub_base/hub_base_{constant,schema,utils}.js` 存在
- [ ] 五域 schema 含 `spaceId` / `churchId` 對照
- [ ] `logAudit` → `bible100_audit_log`
- [ ] `exportBundle` / `importBundle` 打包 canonical keys
- [ ] **零**既有業務頁強制改引用（過渡期並存）
- [ ] `python tests/test_hub_base_phase1.py` 綠

---

## 7. Phase 3b 驗收（異常／工具）

- [ ] `hub-audit-viewer.html` — 按 member_id／domain／時間篩選審計；可匯出 JSON
- [ ] `hub-data-health.html` — 必要欄位健康檢查；**不自動修復**
- [ ] `js/hub_base/hub_base_ops.js` — `rejectAssignment` · `pauseTalentService` · `proposeTalentTagImport`
- [ ] Demo 頁 `data-b100-page-tier="demo"` + 主導航隱藏（landing `#demo-hub` 僅 `?dev=1`）
- [ ] 配對歷史可「標記拒絕」（保留紀錄 + 審計）
- [ ] `python tests/test_hub_base_phase3b.py` 綠

---

## 6. 相關文件

- `smart_ministry/docs/SMART_MINISTRY_DATA_RULES.md`
- `docs/governance/MINISTRY_LIVING_MAP_V1.md`
- `docs/governance/MINISTRY_PIPELINE_MATURITY.md`
