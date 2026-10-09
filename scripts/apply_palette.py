import os
from pathlib import Path

REPLACEMENTS = [
    # Primary accent / CTA: Heritage Gold -> Terracotta / Ochre
    ("#D6A84F", "#E58A4E"),
    ("#d6a84f", "#e58a4e"),
    ("#E0B763", "#ED9C66"),
    ("#e0b763", "#ed9c66"),
    ("#B88A38", "#C46F38"),
    ("#966C24", "#A65625"),

    # AI accent: Electric Violet -> Warm Copper / Sunset Amber
    ("#7C5CFF", "#D4A373"),
    ("#7c5cff", "#d4a373"),
    ("#8F73FF", "#DFB388"),
    ("#8f73ff", "#dfb388"),

    # Translation / Verification: Heritage Teal -> River Jade
    ("#35C9B0", "#4E9F76"),
    ("#35c9b0", "#4e9f76"),
    ("#47D6BE", "#5DBF8E"),
    ("#47d6be", "#5dbf8e"),

    # Backgrounds: Deep Obsidian -> Deep Umber, Royal Indigo -> Terracotta Slate
    ("#090A12", "#0C0908"),
    ("#090a12", "#0c0908"),
    ("#171B3A", "#1C1512"),
    ("#171b3a", "#1c1512"),
    ("#101328", "#140E0C"),
    ("#101426", "#140E0C"),

    # Typography: Warm Ivory -> Warm Linen, Soft Lavender -> Muted Sand
    ("#F5F0E6", "#F7F3EE"),
    ("#f5f0e6", "#f7f3ee"),
    ("#B9B3D6", "#C4B5A5"),
    ("#b9b3d6", "#c4b5a5"),

    # RGB strings
    ("214, 168, 79", "229, 138, 78"),
    ("214,168,79", "229,138,78"),
    ("124, 92, 255", "212, 163, 115"),
    ("124,92,255", "212,163,115"),
    ("53, 201, 176", "78, 159, 118"),
    ("53,201,176", "78,159,118"),
]

def main():
    web_src = Path("web/src")
    modified_files = 0
    total_replacements = 0

    for path in web_src.rglob("*"):
        if path.is_file() and path.suffix in [".tsx", ".ts", ".css", ".jsx", ".js"]:
            content = path.read_text(encoding="utf-8")
            original_content = content
            file_reps = 0

            for old, new in REPLACEMENTS:
                if old in content:
                    count = content.count(old)
                    content = content.replace(old, new)
                    file_reps += count

            if content != original_content:
                path.write_text(content, encoding="utf-8")
                modified_files += 1
                total_replacements += file_reps
                print(f"Updated {path}: {file_reps} replacements")

    print(f"\nDone! Modified {modified_files} files with {total_replacements} total replacements.")

if __name__ == "__main__":
    main()

