#!/usr/bin/env python3
"""
Generate and synchronize camera-scannable QR codes for Website, App, and Day-to-Day Translator.
Saves to web/public and artifact directory for instant phone scanning.
"""

import os
import urllib.request
import urllib.parse

ARTIFACT_DIR = "/Users/harsha/.gemini/antigravity/brain/ddc98306-e71b-4347-b008-63d25c0a86fb"
WEB_PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../web/public"))

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(WEB_PUBLIC_DIR, exist_ok=True)

TARGETS = [
    ("qr_website.png", "https://dee-arabia-gathered-drove.trycloudflare.com"),
    ("qr_app.png", "https://dee-arabia-gathered-drove.trycloudflare.com/app"),
    ("qr_translate.png", "https://dee-arabia-gathered-drove.trycloudflare.com/translate"),
    ("qr_wifi.png", "http://192.168.1.3:3000"),
]

def generate_qrs():
    print("Generating high-resolution camera-scannable QR codes...")
    for filename, url in TARGETS:
        # Generate with white background and black modules for 100% instant phone camera detection
        encoded_url = urllib.parse.quote(url)
        qr_api = f"https://api.qrserver.com/v1/create-qr-code/?size=450x450&data={encoded_url}&margin=15&bgcolor=255-255-255&color=0-0-0"
        
        target_artifact = os.path.join(ARTIFACT_DIR, filename)
        target_web = os.path.join(WEB_PUBLIC_DIR, filename)
        
        try:
            req = urllib.request.Request(qr_api, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = response.read()
                with open(target_artifact, 'wb') as f:
                    f.write(data)
                with open(target_web, 'wb') as f:
                    f.write(data)
            print(f"✓ Generated {filename} for {url} ({len(data)} bytes)")
        except Exception as e:
            print(f"Failed to generate {filename}: {e}")

if __name__ == "__main__":
    generate_qrs()
