#!/usr/bin/env python3
"""Create the presentation QR only after a public HTTPS deployment is configured."""

from __future__ import annotations

import os
import urllib.parse
import urllib.request
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_PUBLIC_DIR = ROOT_DIR / "web" / "public"


def public_url() -> str:
    raw_url = os.environ.get("VOICE_ROOTS_PUBLIC_URL", "").strip()
    parsed = urllib.parse.urlparse(raw_url)
    if parsed.scheme != "https" or not parsed.netloc:
        raise SystemExit(
            "Set VOICE_ROOTS_PUBLIC_URL to the deployed HTTPS site before generating the presentation QR."
        )
    return f"https://{parsed.netloc}{parsed.path.rstrip('/')}/"


def generate_qr() -> Path:
    url = public_url()
    encoded_url = urllib.parse.quote(url, safe="")
    qr_api = (
        "https://api.qrserver.com/v1/create-qr-code/?size=450x450&"
        f"data={encoded_url}&margin=15&bgcolor=255-255-255&color=0-0-0"
    )
    request = urllib.request.Request(qr_api, headers={"User-Agent": "VoiceRootsQR/1.0"})
    with urllib.request.urlopen(request, timeout=15) as response:
        image = response.read()
        if response.status != 200 or not image.startswith(b"\x89PNG\r\n\x1a\n"):
            raise RuntimeError("QR service did not return a valid PNG image.")

    WEB_PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    output = WEB_PUBLIC_DIR / "qr_website.png"
    output.write_bytes(image)
    print(f"Created {output.relative_to(ROOT_DIR)} for {url}")
    return output


if __name__ == "__main__":
    generate_qr()
