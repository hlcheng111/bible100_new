# 聖經譯本授權清單

Phase 1 使用之譯本與授權狀態。部署前須由教會法務確認。

---

## Phase 1（MVP）

| ID | 譯本 | 語言 | 來源 | 授權狀態 | 備註 |
|----|------|------|------|----------|------|
| `kjv` | King James Version | 英文 | 公版 / 本機 `data/bibles/clean/KJV.json` | **公版可用** | 預設英文譯本 |
| `cuv_trust` | 信望愛(和合本) | 繁中 | 本機 `data/bibles/clean/信望爱(和合本).json` | **需確認** | 含 Strong；聯繫信望愛平台 |
| `luzhen` | 呂振中譯本 | 繁中 | 本機 `data/bibles/clean/吕振中.json` | **需授權** | Phase 1 可選，預設關閉 |

---

## Phase 2+

| ID | 譯本 | 語言 | 授權方 | 狀態 |
|----|------|------|--------|------|
| `niv` | NIV | 英文 | Biblica | 需商業授權 |
| `cuv` | 和合本修訂版 | 繁中 | 香港聖經公會 | 需授權 |
| `bpt` | Kinh Thánh BPT | 越南文 | 越南聖經公會 | Phase 3 |
| `tb` | Terjemahan Baru | 印尼文 | LAI | Phase 3 |

---

## 使用原則

1. **App 內嵌經文**僅打包已獲授權或公版譯本。
2. 未授權譯本改為 **外部連結**（Bible Gateway、YouVersion）而非內嵌。
3. 發布至 App Store / Google Play 時在「版權聲明」頁列出所有譯本與授權聲明。
4. 從 Bible100 `data/bibles/clean/` 匯出時，`data/` 不進 Git；CI 使用樣本經文測試。

---

## 樣本資料

開發與 CI 使用 [`../packages/core/data/sample_bible.json`](../packages/core/data/sample_bible.json)（創世記 1–3 章 + 約翰福音 1 章），無授權疑慮。
