#!/usr/bin/env python3
import qrcode
from pathlib import Path
import shutil

ARTIFACT_DIR = Path("/Users/harsha/.gemini/antigravity/brain/f32ce525-af9c-417a-bcee-66efc1dd0ebc")
PUBLIC_DIR = Path("web/public")

BASE_URL = "https://learned-fairly-qualifying-notifications.trycloudflare.com"

QR_TARGETS = [
    {
        "filename": "qr_website.png",
        "url": f"{BASE_URL}/",
        "title": "Voice Roots Website (Home)",
    },
    {
        "filename": "qr_app.png",
        "url": f"{BASE_URL}/app",
        "title": "Voice Roots Mobile Companion App",
    },
    {
        "filename": "qr_links.png",
        "url": f"{BASE_URL}/links",
        "title": "Voice Roots Central Link Hub",
    },
    {
        "filename": "qr_record.png",
        "url": f"{BASE_URL}/record",
        "title": "Voice Roots Recording Studio",
    },
    {
        "filename": "qr_upload.png",
        "url": f"{BASE_URL}/upload",
        "title": "Voice Roots Audio Upload Studio",
    },
    {
        "filename": "qr_translate.png",
        "url": f"{BASE_URL}/translate",
        "title": "Voice Roots Indic Translator",
    },
    {
        "filename": "qr_passport.png",
        "url": f"{BASE_URL}/passport/vr-106",
        "title": "Voice Roots Heritage Passport (VR-106)",
    },
]

def generate():
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    for item in QR_TARGETS:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=12,
            border=4,
        )
        qr.add_data(item["url"])
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Save to web/public
        pub_path = PUBLIC_DIR / item["filename"]
        img.save(pub_path)

        # Save to Artifact Directory
        art_path = ARTIFACT_DIR / item["filename"]
        img.save(art_path)

        print(f"Generated {item['filename']} -> {item['url']}")

if __name__ == "__main__":
    generate()

