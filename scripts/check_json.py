import sys
import json
from pathlib import Path

def main():
    locales_dir = Path('locales')
    
    if not locales_dir.exists():
        print(f"ERROR: Locales directory not found at {locales_dir}")
        sys.exit(1)

    json_files = sorted(list(locales_dir.glob('*.json')))
    
    if not json_files:
        print(f"WARNING: No JSON locale files found in {locales_dir}")
        sys.exit(0)

    success = True
    
    for file_path in json_files:
        try:
            text = file_path.read_text(encoding='utf-8')
            json.loads(text)
            print(f"SUCCESS: Validated {file_path}")
        except json.JSONDecodeError as e:
            print(f"ERROR: Malformed JSON in {file_path} -> {e}")
            start = max(0, e.pos - 60)
            end = min(len(text), e.pos + 60)
            print(f"Context:\n{text[start:end]}")
            success = False
        except Exception as e:
            print(f"ERROR: Could not read {file_path} -> {e}")
            success = False

    if not success:
        sys.exit(1)

if __name__ == '__main__':
    main()
