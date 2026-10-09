#!/usr/bin/env python3
"""
Voice Roots — Census of India 2011 Table C-16 Inspector
Source: DDW-C16-STMT-MDDS-0000.xlsx (PC11_C16-00)
Office of the Registrar General & Census Commissioner, India
"""

import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

XLSX_PATH = Path("backend/data/raw/DDW-C16-STMT-MDDS-0000.xlsx")

def inspect_c16():
    print("=" * 60)
    print("VOICE ROOTS — OFFICIAL CENSUS C-16 DATASET INSPECTION")
    print("=" * 60)

    if not XLSX_PATH.exists():
        print(f"❌ File not found: {XLSX_PATH}")
        sys.exit(1)

    print(f"✓ Raw File: {XLSX_PATH} ({XLSX_PATH.stat().st_size:,} bytes)")

    with zipfile.ZipFile(XLSX_PATH, 'r') as z:
        # 1. Inspect Workbook and Sheets
        wb_xml = z.read("xl/workbook.xml")
        wb_root = ET.fromstring(wb_xml)
        ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        sheets = []
        for s in wb_root.findall('.//main:sheet', ns):
            sheets.append({
                'name': s.attrib.get('name'),
                'sheetId': s.attrib.get('sheetId'),
                'id': s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            })
        print(f"✓ Workbook Sheets ({len(sheets)}):")
        for s in sheets:
            print(f"   - Sheet Name: '{s['name']}' (ID: {s['sheetId']})")

        # 2. Extract Shared Strings (dictionary of cell strings)
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            ss_xml = z.read("xl/sharedStrings.xml")
            ss_root = ET.fromstring(ss_xml)
            for si in ss_root.findall('.//main:si', ns):
                text_elems = si.findall('.//main:t', ns)
                text = "".join(t.text or "" for t in text_elems)
                shared_strings.append(text)
            print(f"✓ Shared Strings Count: {len(shared_strings):,}")

        # 3. Inspect Sheet 1 Rows
        sheet1_xml = z.read("xl/worksheets/sheet1.xml")
        s1_root = ET.fromstring(sheet1_xml)
        
        rows = s1_root.findall('.//main:row', ns)
        print(f"✓ Total Rows in Sheet 1: {len(rows):,}")

        # Helper to get cell value
        def get_cell_value(cell):
            cell_type = cell.attrib.get('t')
            val_elem = cell.find('main:v', ns)
            if val_elem is None or val_elem.text is None:
                # Check inline string
                is_elem = cell.find('.//main:t', ns)
                return is_elem.text if is_elem is not None else ""
            val = val_elem.text
            if cell_type == 's':
                idx = int(val)
                return shared_strings[idx] if idx < len(shared_strings) else val
            return val

        # Print first 10 rows
        print("\n--- SAMPLE ROWS (First 12 Rows) ---")
        for i, row in enumerate(rows[:12]):
            cells = row.findall('main:c', ns)
            row_vals = [get_cell_value(c) for c in cells]
            # print compact row
            clean_vals = [v.strip().replace('\n', ' ') for v in row_vals if v.strip()]
            print(f"Row {i+1}: {clean_vals[:12]}")

if __name__ == "__main__":
    inspect_c16()
