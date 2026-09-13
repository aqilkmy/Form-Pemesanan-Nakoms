import re

def search_bbm(filepath):
    txt = open(filepath, 'r', encoding='utf-8', errors='ignore').read()
    matches = re.findall(r"\('[0-9a-f\-]+',\s*'[^']+',\s*'[^']*',\s*'[^']*',[^)]+\)", txt)
    print(f"File: {filepath} -> Total tuples parsed: {len(matches)}")
    for m in matches:
        if 'BBM' in m or 'Belajar Bersama' in m or 'SSR' in m:
            print("FOUND:", m[:160])

search_bbm('orders_rows.sql')

