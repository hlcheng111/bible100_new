#!/usr/bin/env python3
"""Create minimal PNG placeholders for Expo assets."""
import struct
import zlib
from pathlib import Path

ASSETS = Path(__file__).resolve().parent.parent / "app" / "assets"


def png_rgb(width: int, height: int, r: int, g: int, b: int) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b""
    row = bytes([r, g, b]) * width
    for _ in range(height):
        raw += b"\x00" + row
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    color = (30, 58, 95)
    for name, w, h in [
        ("icon.png", 1024, 1024),
        ("splash.png", 1284, 2778),
        ("adaptive-icon.png", 1024, 1024),
        ("favicon.png", 48, 48),
        ("notification-icon.png", 96, 96),
    ]:
        (ASSETS / name).write_bytes(png_rgb(w, h, *color))
        print(f"Wrote {ASSETS / name}")


if __name__ == "__main__":
    main()
