import sys, json
from collections import Counter

path = sys.argv[1] if len(sys.argv) > 1 else "/Users/abi01932/Downloads/grpc-history-1757473393264.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

codes = []
for si in (data.get("parsed", {}).get("searchItems") or []):
    var = si.get("variation") if isinstance(si, dict) else None
    if not var: continue
    for it in (var.get("items") or []):
        ik = it.get("itemKey") or {}
        code = ik.get("catalogItemCode")
        if code is not None:
            codes.append(str(code))

cnt = Counter(codes)
dups = {k:v for k,v in cnt.items() if v>1}

if not dups:
    print("중복 없음")
else:
    print("중복된 catalogItemCode (값 : 중복횟수):")
    for k,v in sorted(dups.items(), key=lambda x:-x[1]):
        print(f"{k} : {v}")
    print(f"\n총 아이템: {len(codes)}, 유니크: {len(cnt)}, 중복 종류: {len(dups)}")