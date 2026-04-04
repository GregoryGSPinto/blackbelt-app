import sys, json

d = json.load(sys.stdin)
tables = [k.lstrip('/') for k in d.get('paths', {}).keys() if k != '/']
for t in sorted(tables):
    print(t)
