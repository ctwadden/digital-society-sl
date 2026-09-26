"""Persist one teacher-selected visibility change; strict inputs, no arbitrary paths."""
from pathlib import Path
import json
import sys

def update(config, section, visibility):
    assert visibility in ('show', 'hide'), 'Choose show or hide'
    matches = [s for s in config['sections'] if s['id'] == section]
    assert len(matches) == 1, 'Unknown section'
    matches[0]['visible'] = visibility == 'show'
    return config

if __name__ == '__main__':
    path = Path(__file__).resolve().parents[1] / 'course-release.json'
    path.write_text(json.dumps(update(json.loads(path.read_text()), *sys.argv[1:]), indent=2)+'\n')
