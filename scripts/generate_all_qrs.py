#!/usr/bin/env python3
"""Generate crisp, high-resolution QR codes for all Voice Roots portals."""

from pathlib import Path
import qrcode
from PIL import Image

PUBLIC_BASE = "https://learned-fairly-qualifying-notifications.trycloudflare.com"
WIFI_BASE = "http://10.178.28.108:3000"

ROOT_DIR = Path(__file__).resolve().parent.parent
WEB_PUBLIC = ROOT_DIR / "web" / "public"
ARTIFACT_DIR = Path("/Users/harsha/.gemini/antigravity/brain/f32ce525-af9c-417a-bcee-66efc1dd0ebc")

TARGETS = {
    "qr_website.png": PUBLIC_BASE,
    "qr_passport_vr106.png": f"{PUBLIC_BASE}/passport/vr-106",
    "qr_mobile_app.png": f"{PUBLIC_BASE}/app",
    "qr_translate.png": f"{PUBLIC_BASE}/translate",
    "qr_upload.png": f"{PUBLIC_BASE}/upload",
    "qr_record.png": f"{PUBLIC_BASE}/record",
    "qr_wifi_website.png": WIFI_BASE,
    "qr_wifi_passport.png": f"{WIFI_BASE}/passport/vr-106",
    "qr_wifi_app.png": f"{WIFI_BASE}/app",
    "voice_roots_website_qr.png": PUBLIC_BASE,
    "voice_roots_public_qr.png": PUBLIC_BASE,
    "qr_story_vr106.png": f"{PUBLIC_BASE}/recordings/vr-106",
    "qr_app.png": f"{PUBLIC_BASE}/app",
}

def make_qr(url: str) -> Image.Image:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0b1329", back_color="#ffffff").convert("RGBA")
    return img

def main():
    WEB_PUBLIC.mkdir(parents=True, exist_ok=True)
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Generating QR codes...")
    print(f"Public Base: {PUBLIC_BASE}")
    print(f"Wi-Fi Base:  {WIFI_BASE}")

    for filename, url in TARGETS.items():
        img = make_qr(url)
        dest1 = WEB_PUBLIC / filename
        dest2 = ARTIFACT_DIR / filename
        img.save(dest1, format="PNG")
        img.save(dest2, format="PNG")
        print(f"  [OK] {filename:<28} -> {url}")

if __name__ == "__main__":
    main()

