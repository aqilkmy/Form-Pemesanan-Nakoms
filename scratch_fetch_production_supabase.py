import urllib.request
import json
import ssl

SUPABASE_URL = "https://uncuqjqjojtcfvqeilqq.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuY3VxanFqb2p0Y2Z2cWVpbHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODA5MzIsImV4cCI6MjEwMzU1NjkzMn0.M2OL21sPM8lHbDz8kBS9Faxb2-COXaOmSwnct_Z353Y"

headers = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Range-Unit": "items"
}

ctx = ssl.create_default_context()

def fetch_all_orders():
    print(f"Connecting to {SUPABASE_URL}...")
    
    # 1. Get exact count using HEAD with count=exact
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/orders?select=id",
        headers={**headers, "Prefer": "count=exact", "Range": "0-0"},
        method="HEAD"
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            content_range = resp.headers.get("Content-Range")
            print("Content-Range header:", content_range)
    except Exception as e:
        print("HEAD count error:", e)

    # 2. Fetch all orders with pagination
    all_orders = []
    page_size = 1000
    offset = 0

    while True:
        url = f"{SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&offset={offset}&limit={page_size}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, context=ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if not data:
                    break
                all_orders.extend(data)
                print(f"Fetched {len(data)} orders (Total so far: {len(all_orders)})")
                if len(data) < page_size:
                    break
                offset += page_size
        except Exception as e:
            print(f"Error fetching at offset {offset}:", e)
            break

    print(f"\nSUCCESS: Fetched a total of {len(all_orders)} orders!")
    
    if all_orders:
        created_ats = [o.get("created_at") for o in all_orders if o.get("created_at")]
        print("Min created_at:", min(created_ats))
        print("Max created_at:", max(created_ats))
        
        # Check September orders
        sep_orders = [o for o in all_orders if o.get("created_at", "") >= "2026-08-30"]
        print(f"\nTotal orders created >= 2026-08-30: {len(sep_orders)}")
        for o in sep_orders[:15]:
            print(f"  {o.get('created_at')[:19]} | {o.get('nama')} | {o.get('kementerian')} | {o.get('judul_desain') or o.get('nama_kegiatan') or o.get('tujuan_pemesanan')}")

        # Search for BBM / SSR
        bbm = [o for o in all_orders if "BBM" in str(o) or "SSR" in str(o)]
        print(f"\nBBM / SSR matches found: {len(bbm)}")
        for o in bbm:
            print(f"  MATCH: {o.get('created_at')} | {o.get('nama')} | {o.get('judul_desain')}")

        # Save to disk
        output_file = "BackupDB/production_orders_recovered.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_orders, f, ensure_ascii=False, indent=2)
        print(f"\nSaved all orders to {output_file}")

if __name__ == "__main__":
    fetch_all_orders()
