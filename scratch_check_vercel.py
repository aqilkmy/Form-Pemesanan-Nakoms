import urllib.request
import re

url = "https://rismed-order.vercel.app/monitoring"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req).read().decode("utf-8", errors="ignore")
chunks = re.findall(r'src="(/_next/static/chunks/[^"]+)"', html)
print(f"Monitoring chunks: {len(chunks)}")
for c in chunks:
    try:
        content = urllib.request.urlopen(urllib.request.Request("https://rismed-order.vercel.app" + c, headers=headers)).read().decode("utf-8", errors="ignore")
        if "api/" in content or "prisma" in content or "supabase" in content:
            print(f"Match in {c}:")
            matches = re.findall(r'["\'](?:https?://[^"\']+|/[^"\']+)["\']', content)
            apis = [m for m in matches if "/api" in m or "supabase" in m]
            print("   APIs:", apis[:5])
    except Exception as e:
        pass


