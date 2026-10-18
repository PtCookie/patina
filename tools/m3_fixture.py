"""Write tests/fixtures/m3.json from the Python reference (m3.py).

The fixture holds the full-precision contrast of every Material 3 pair and the hex value of every
role. The TypeScript port (src/m3.ts) is tested against it. Regenerate it only when the tokens or
the role mapping change on purpose:

    python3 tools/m3_fixture.py
"""
import contextlib
import io
import json
import os
import runpy
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TOKENS = os.path.join(ROOT, 'design-system', 'tokens.json')
OUT = os.path.join(ROOT, 'tests', 'fixtures', 'm3.json')

sys.path.insert(0, HERE)
cwd = os.getcwd()
with tempfile.TemporaryDirectory() as tmp:  # m3.py writes m3.json into the working directory
    os.chdir(tmp)
    sys.argv = ['m3.py', TOKENS]
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            ref = runpy.run_path(os.path.join(HERE, 'm3.py'))
    finally:
        os.chdir(cwd)

R, pairs, cr, hexl = ref['R'], ref['pairs'], ref['cr'], ref['hexl']
with open(os.path.join(ROOT, 'design-system', 'VERSION')) as f:
    snapshot = f.read().strip()

fixture = {
    'source': 'tools/m3.py',
    'snapshot': snapshot,
    'contrast': {
        th: [
            {'foreground': a, 'background': b, 'min': 3 if a == 'outline' else 4.5, 'ratio': cr(R[th][a], R[th][b])}
            for a, b in pairs
        ]
        for th in R
    },
    'colors': {th: {role: hexl(rgb) for role, rgb in R[th].items()} for th in R},
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w') as f:
    json.dump(fixture, f, indent=4)
    f.write('\n')
print(f'wrote {os.path.relpath(OUT, ROOT)}')
