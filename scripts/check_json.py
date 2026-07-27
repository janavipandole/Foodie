import sys
import json
from pathlib import Path

def check_json_file(file_path: Path) -> bool:
    if not file_path.exists():
        print(f"ERROR: File not found -> {file_path}")
        return False
    
    try:
        text = file_path.read_text(encoding='utf-8')
        json.loads(text)
        print(f"OK: {file_path}")
        return True
    except json.JSONDecodeError as e:
        print(f"ERROR: Malformed JSON in {file_path} -> {e}")
        start = max(0, e.pos - 60)
        end = min(len(text), e.pos + 60)
        print(f"Context:\n{text[start:end]}")
        return False
    except Exception as e:
        print(f"ERROR: Could not read {file_path} -> {e}")
        return False

def main():
    # Target either specific files passed via args or scan the locales directory
    if len(sys.argv) > 1:
        paths = [Path(p) for p in sys.argv[1:]]
    else:
        # Default fallback or check all json files under locales/
        locales_dir = Path('locales')
        if locales_dir.exists():
            paths = list(locales_dir.glob('*.json'))
        else:
            paths = [Path('locales/mr.json')]

    success = True
    for path in paths:
        if not check_json_file(path):
            success = False

    if not success:
        sys.exit(1)

if __name__ == '__main__':
    main()
