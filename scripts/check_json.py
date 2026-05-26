import json
from pathlib import Path
path = Path('locales/mr.json')
text = path.read_text(encoding='utf-8')
try:
    json.loads(text)
    print('OK')
except json.JSONDecodeError as e:
    print('ERROR', e)
    start = max(0, e.pos - 60)
    end = min(len(text), e.pos + 60)
    print(text[start:end])
