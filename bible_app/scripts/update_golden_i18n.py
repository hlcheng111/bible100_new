#!/usr/bin/env python3
"""Add refVi/refId/tagVi/tagId to golden_verses_100.json from books.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GOLDEN = ROOT / "shell" / "data" / "golden_verses_100.json"
BOOKS = ROOT / "shell" / "data" / "books.json"

TAG_I18N = {
    "創造": ("Sáng tạo", "Penciptaan"),
    "按神形象": ("Theo ảnh Đức Chúa", "Gambar Allah"),
    "救恩應許": ("Hứa cứu rỗi", "Janji keselamatan"),
    "萬族之福": ("Phước các dân", "Berkat bangsa"),
    "除我以外": ("Ngoài Ta", "Selain Aku"),
    "慈悲憐憫": ("Thương xót", "Kasih sayang"),
    "壯膽": ("Mạnh dạn", "Berani"),
    "言語心思": ("Lời và lòng", "Lời và lòng"),
    "好牧者": ("Mục tốt", "Gembala baik"),
    "避難所": ("Nơi nương náu", "Tempat perlindungan"),
    "清潔的心": ("Lòng trong sạch", "Hati yang suci"),
    "腳前的燈": ("Đèn chân", "Pelita kaki"),
    "專心仰賴": ("Tin cậy Chúa", "Percaya kepada-Nya"),
    "認識祂": ("Nhận biết Ngài", "Mengenal Dia"),
    "重新得力": ("Đổi sức mới", "Kuat baru"),
    "因他受鞭傷": ("Vì Ngài bị đánh", "Karena dia disesah"),
    "向你们懷的意念": ("Ý định về các ngươi", "Rencana bagi kamu"),
    "先求祂的國": ("Tìm nước Ngài", "Kejar kerajaan-Nya"),
    "到我這裡來": ("Đến với Ta", "Datang kepada-Ku"),
    "大使命": ("Đại mệnh", "Amanat besar"),
    "太初有道": ("Ban đầu có Lời", "Pada mulanya Firman"),
    "道成肉身": ("Lời nhập thể", "Firman menjadi manusia"),
    "神愛世人": ("Chúa yêu thế gian", "Allah mengasihi dunia"),
    "世界的光": ("Ánh sáng thế gian", "Terang dunia"),
    "豐盛的生命": ("Sự sống dồi dào", "Hidup berkelimpahan"),
    "道路真理生命": ("Đường chân lý sự sống", "Jalan kebenaran hidup"),
    "枝子與葡萄樹": ("Nhánh và nho", "Ranting dan pokok anggur"),
    "世人都犯了罪": ("Mọi người phạm tội", "Semua berdosa"),
    "神愛我們": ("Chúa yêu chúng ta", "Allah mengasihi kita"),
    "萬事互相效力": ("Mọi sự đồng công", "Segala sesuatu bekerja sama"),
    "不能隔絕的愛": ("Tình yêu không tách", "Kasih yang tak terpisahkan"),
    "愛是恆久忍耐": ("Yêu nhịn nhục", "Kasih sabar"),
    "新造的人": ("Người mới", "Ciptaan baru"),
    "不再是我": ("Không còn là tôi", "Bukan aku lagi"),
    "本乎恩": ("Bởi ân điển", "Karena kasih karunia"),
    "靠著加力量": ("Gắng sức trong Ngài", "Kuat di dalam Dia"),
    "一切所需": ("Mọi sự cần", "Segala keperluan"),
    "為主而作": ("Làm vì Chúa", "Kerjakan untuk Tuhan"),
    "信是實底": ("Đức tin là căn cứ", "Iman adalah dasar"),
    "求智慧": ("Xin khôn ngoan", "Mintalah hikmat"),
}


def main() -> int:
    books_data = json.loads(BOOKS.read_text(encoding="utf-8"))
    by_id = {b["id"]: b for b in books_data.get("books", [])}
    data = json.loads(GOLDEN.read_text(encoding="utf-8"))
    errors = []
    for v in data.get("verses", []):
        b = by_id.get(v.get("bookId"))
        if not b:
            errors.append(f"missing book {v.get('bookId')}")
            continue
        ch, vs = v.get("chapter"), v.get("verse")
        v["refVi"] = f"{b.get('nameVi', b['nameEn'])} {ch}:{vs}"
        v["refId"] = f"{b.get('nameId', b['nameEn'])} {ch}:{vs}"
        tag = v.get("tagZh", "")
        vi_id = TAG_I18N.get(tag)
        if vi_id:
            v["tagVi"], v["tagId"] = vi_id
        else:
            v["tagVi"] = v["tagVi"] if v.get("tagVi") else tag
            v["tagId"] = v["tagId"] if v.get("tagId") else tag
            errors.append(f"no tag i18n: {tag}")
    data["nameVi"] = "40 câu vàng"
    data["nameId"] = "40 ayat emas"
    GOLDEN.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if errors:
        print("WARN:", errors)
    print(f"OK updated {len(data.get('verses', []))} golden verses")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
