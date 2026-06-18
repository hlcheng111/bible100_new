# Bible100 App · 譯本與資料來源（W1）

## 決策摘要（2026-06）

| 語言 | 採用譯本 | DB 鍵 | 章節數 | 理由 |
|------|----------|-------|--------|------|
| 繁中 | 信望愛和合本 | `cuv_trust` | 31103 | 既有本機庫 |
| English | KJV | `kjv` | 31102 | 公有領域、對照標準 |
| **越文** | **Kinh Thánh 1934** | `vi_1934` | 31102 | 與 [FHL 越南聖經](https://bible.fhl.net/) 逐節一致；**公有領域**（ebible vie1934） |
| **印尼文** | **Alkitab Yang Terbuka (AYT)** | `id_ayt` | 31102 | helloao 上唯一 66 卷全本印尼文；CC BY-ND 非商業可再散布 |

### 未採用（需授權）

| 譯本 | 說明 |
|------|------|
| **NVB**（YouVersion [Kinh Thánh Bản Dịch Mới](https://www.bible.com/zh-TW/bible/449/GEN.1.NVB)） | VBI ©1986–至今，不可未授權打包進離線庫 |
| **TB**（Terjemahan Baru，FHL `VERSION84=baru`） | 印尼聖經公會版權；helloao 無免費全本 TB |
| **ind_ags** | 僅 27 卷（新約） |

日後若取得 NVB / TB 正式授權，可新增 `nvb`、`id_tb` 版本鍵，不影響現有 schema。

## 資料管線

```
helloao API (complete.json)
  → bible_app/scripts/fetch_helloao_bible.py
  → data/bibles/clean/越南聖經1934.json、印尼AYT.json
  → bible_app/scripts/import_helloao_to_db.py
  → bible_app/app/assets/bible/bible_reader.db
```

重建全庫（含和合/KJV，若本機有 clean JSON）：

```powershell
python bible_app\scripts\json_to_sqlite.py
python bible_app\scripts\import_helloao_to_db.py
```

僅更新書卷越/印名稱：

```powershell
python bible_app\scripts\update_books_i18n.py
```

## 讀經器雙欄（依 locale）

| locale | 左欄 | 右欄 |
|--------|------|------|
| zh-Hant | 和合本 | KJV |
| en | KJV | 和合本 |
| vi | 越文 1934 | KJV |
| id | 印尼 AYT | KJV |

## 授權連結

- 越文 1934：https://ebible.org/Scriptures/details.php?id=vie1934（Public Domain）
- 印尼 AYT：https://ebible.org/Scriptures/details.php?id=indayt（CC BY-ND 4.0，非商業）
- API 來源：https://bible.helloao.org/（Free Use Bible API / MIT）

## 本機 `data/bibles/`

目前 **無** 預先附帶的越/印原始檔；首次執行 `fetch_helloao_bible.py` 會從網路下載並寫入 `data/bibles/clean/`（不進 Git，依 `.gitignore` 慣例）。
