"""
生成 parallel_mode_v3 用的「嵌入式資料包」(JS 檔)，
讓對照模式 v3 可以在 file:// 環境下運作（不依賴 fetch/HTTP server）。

用法（在專案根目錄 bible100_new 下執行）：

    cd <你的>/bible100_new
    python bible_study/tools/gen_parallel_v3_data.py

生成的檔案：
    data/bibles/bible_data_faith.js         -> window.BIBLE_DATA_faith
    data/bibles/bible_data_niv.js           -> window.BIBLE_DATA_niv
    data/cj/commentary_data_meiriyan.js     -> window.COMMENTARY_DATA_meiriyan
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]  # bible100_new


def export_bible_json_to_js(json_path: Path, js_path: Path, var_name: str) -> None:
    """將聖經 JSON 轉成 JS 陣列，掛在 window.{var_name} 上。"""
    text = json_path.read_text(encoding="utf-8")
    data = json.loads(text)

    # 目前聖經 JSON 的格式為：
    # {
    #   "Bible": {
    #     "columns": ["id","Book","Chapter","Verse","Scripture"],
    #     "data": [ { ... }, ... ]
    #   }
    # }
    if "Bible" not in data or "data" not in data["Bible"]:
        raise ValueError(f"{json_path} 格式不符合預期（缺少 Bible.data）")

    rows = data["Bible"]["data"]

    simplified = [
        {
            "Book": row.get("Book"),
            "Chapter": row.get("Chapter"),
            "Verse": row.get("Verse"),
            "Text": row.get("Scripture", ""),
        }
        for row in rows
    ]

    # Comment must stay ASCII-only so Chrome never mis-parses the whole script on file://
    js_code = "// bible100 parallel v3 bible payload (ASCII \\uXXXX only)\n"
    js_code += f"window.{var_name} = {json.dumps(simplified, ensure_ascii=True)};\n"
    js_path.write_text(js_code, encoding="utf-8")
    # Windows cp1252 console cannot print some CJK filenames
    print("[OK] Bible -> JS:", str(js_path.relative_to(ROOT)), "var", var_name)


def export_commentary_json_to_js(json_path: Path, js_path: Path, var_name: str) -> None:
    """將註釋 JSON 轉成 JS 陣列，掛在 window.{var_name} 上。"""
    text = json_path.read_text(encoding="utf-8")
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        # 少數匯出檔把換行寫成字面「\\n」兩字元，先嘗試還原
        data = json.loads(text.replace("\\n", "\n"))

    # 採用「commentary.data」結構：
    # {
    #   "commentary": {
    #     "columns": ["id","Book","Chapter","FromVerse","ToVerse","Data"],
    #     "data": [ { ... }, ... ]
    #   }
    # }
    if "commentary" not in data or "data" not in data["commentary"]:
        raise ValueError(f"{json_path} 格式不符合預期（缺少 commentary.data）")

    rows = data["commentary"]["data"]

    simplified = [
        {
            "Book": row.get("Book"),
            "Chapter": row.get("Chapter"),
            "FromVerse": row.get("FromVerse"),
            "ToVerse": row.get("ToVerse"),
            "Content": row.get("Data", ""),
        }
        for row in rows
    ]

    js_code = "// bible100 parallel v3 commentary payload (ASCII \\uXXXX only)\n"
    js_code += f"window.{var_name} = {json.dumps(simplified, ensure_ascii=True)};\n"
    js_path.write_text(js_code, encoding="utf-8")
    print("[OK] Commentary -> JS:", str(js_path.relative_to(ROOT)), "var", var_name)


def main() -> None:
    bibles_dir = ROOT / "data" / "bibles"
    cj_dir = ROOT / "data" / "cj"

    # 1) 聖經版本：信望愛(和合本)、NIV（不含和合本修訂版）
    export_bible_json_to_js(
        json_path=bibles_dir / "信望愛(和合本).json",
        js_path=bibles_dir / "bible_data_faith.js",
        var_name="BIBLE_DATA_faith",
    )
    niv_src = bibles_dir / "NIV.json"
    if not niv_src.is_file():
        niv_src = bibles_dir / "niv.json"
    export_bible_json_to_js(
        json_path=niv_src,
        js_path=bibles_dir / "bible_data_niv.js",
        var_name="BIBLE_DATA_niv",
    )

    # 2) 註釋：每日研經叢書（損毀的 JSON 可略過；對照頁仍以聖經經文為主）
    try:
        export_commentary_json_to_js(
            json_path=cj_dir / "每日研经丛书.json",
            js_path=cj_dir / "commentary_data_meiriyan.js",
            var_name="COMMENTARY_DATA_meiriyan",
        )
    except (json.JSONDecodeError, OSError, ValueError) as ex:
        print("[WARN] Commentary export skipped:", type(ex).__name__, str(ex)[:120])


if __name__ == "__main__":
    main()

