"""Verify release behavior, canonical IDs and local assets, including JS-disabled delivery."""
import copy
import json
from html.parser import HTMLParser
from pathlib import Path
from build_home import ROOT, build
from set_release import update

config = json.loads((ROOT/'course-release.json').read_text())
for entry in config['sections']:
    for visibility in ('show', 'hide'):
        candidate = update(copy.deepcopy(config), entry['id'], visibility)
        output = build(candidate)
        assert (f'id="{entry["id"]}"' in output) == (visibility == 'show')
        assert (f'href="#{entry["id"]}"' in output) == (visibility == 'show')
try:
    update(copy.deepcopy(config), 'unknown-course', 'show')
    raise RuntimeError('Unknown section accepted')
except AssertionError:
    pass
class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.anchors=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids; self.ids.add(a['id'])
        for key in ('href','src'):
            value=a.get(key,'')
            if value.startswith('#'): self.anchors.append(value[1:])
            elif value and not value.startswith('https://'):
                path=ROOT/value
                assert path.is_file() or (path/'index.html').is_file(), value
all_on=copy.deepcopy(config)
for x in all_on['sections']:x['visible']=True
parser=Links();parser.feed(build(all_on));assert all(a in parser.ids for a in parser.anchors)
assert 'teacher/answer-key' not in build() and 'teacher-guide' not in build()
assert '<script' not in build(), 'Home release visibility should not depend on JavaScript'
assert len([x for x in config['sections'] if x['id'].startswith('ibds-26-s')])==16
print('PASS: 40 visibility states, invalid ID, anchors/assets, 16 canonical sprint IDs, no student-home teacher links.')
