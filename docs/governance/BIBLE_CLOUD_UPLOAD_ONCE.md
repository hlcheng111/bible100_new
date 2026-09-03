# Bible100 cloud upload — one-shot checklist (2026-08-08)

## Do NOT upload entire `bible_app/`

The folder contains Expo/React Native (`bible_app/app/` ~100MB+). Cloud only needs:

- `bible_app/index.html`
- `bible_app/shell/` (HTML, JS, **vendor/sqljs/**)
- `bible_app/app/assets/bible/` (manifest + part001..005)

## Build the final ZIP

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_ftp_bible_cloud_final.ps1
```

Output: `bible100_new_2\_ftp_outbox\FTP_CLOUD_FINAL_*.zip`

## FileZilla

1. Unzip → merge `htdocs/` into remote `/htdocs/`
2. Concurrent transfers = **1**
3. After 421 timeout: reconnect and **check file sizes** on server

## Verify (browser)

| URL | Expected |
|-----|----------|
| `/` | redirects to `index_v5.html` |
| `/data/bibles/clean/niv.json` | download ~6 MB |
| `/bible_app/app/assets/bible/bible_reader.db.part001` | download ~9 MB |
| `/bible_app/shell/vendor/sqljs/sql-wasm.js` | 200 OK |
| `/bible_app/shell/index.html` | full track, not demo |
| `/bible_study/parallel_mode_v3.html` | scripture visible |

## Local file:// vs cloud

| Open | Bible track |
|------|-------------|
| `file:///…/index_v5.html` | Hub OK; shell iframe = **preview** (by design) |
| `http://127.0.0.1:3000/bible_app/` (bat) | **Full DB** on PC |

`file://…/bible_app/shell/index.html` alone is not the supported entry; use index_v5 or bat.
