"""Publish the existing student site and new home, not authoring/control files."""
from pathlib import Path
import shutil
import subprocess
ROOT=Path(__file__).resolve().parents[1]
STUDENT_TRANSCRIPTS={
    f'sprints/redesign-the-feed/teaching-decks/{deck}-transcript.md'
    for deck in ('01-algorithms','02-dilemmas','03-big-data','04-business-labour')
}
destination=ROOT/'_site'
if destination.exists():shutil.rmtree(destination)
destination.mkdir()
files=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
for name in filter(None,files):
    p=Path(name)
    if p.parts[0] in {'.github','tools'}:continue
    if p.suffix in {'.md','.json','.yml','.py'} and name not in STUDENT_TRANSCRIPTS:continue
    src=ROOT/p
    if src.is_symlink():raise ValueError('Do not publish symlinks')
    target=destination/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target)
(destination/'.nojekyll').touch()
revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
(destination/'site-revision.txt').write_text(revision+'\n')
print('Packaged site revision '+revision)
