"""Pytest root configuration and environment fixtures for Voice Roots."""

import os
import sys

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRATCH_BIN = os.path.join(ROOT_DIR, "scratch", "bin")
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

# Ensure scratch/bin (macOS CoreAudio ffmpeg wrapper) is on PATH
if os.path.exists(SCRATCH_BIN) and SCRATCH_BIN not in os.environ.get("PATH", ""):
    os.environ["PATH"] = f"{SCRATCH_BIN}:{os.environ.get('PATH', '')}"

# Ensure backend directory is in sys.path
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

