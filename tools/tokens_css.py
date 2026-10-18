"""tokens.json -> CSS custom properties (test harness; the live app does the same job)."""
import json,re,sys
def esc(n): return n.replace('.','\\.')
def val(v): return re.sub(r'\{([a-z0-9.-]+)\}', lambda m:f'var(--{esc(m.group(1))})', v)
def emit(path):
    d=json.load(open(path)); out=[]
    light=[];dark=[];common=[]
    for t in d['color']['tokens']:
        v=t['value']
        if isinstance(v,dict): light.append(f"--{esc(t['name'])}: {val(v['light'])};"); dark.append(f"--{esc(t['name'])}: {val(v['dark'])};")
        else: common.append(f"--{esc(t['name'])}: {val(v)};")
    for fam in ('spacing','radius','size'):
        for t in d[fam]['tokens']: common.append(f"--{esc(t['name'])}: {t['value']};")
    for t in d['shadow']['tokens']:
        v=t['value']; light.append(f"--{esc(t['name'])}: {v['light']};"); dark.append(f"--{esc(t['name'])}: {v['dark']};")
    for k,v in d['type']['families'].items(): common.append(f"--font-{k}: {v};")
    return ':root,[data-theme="light"]{'+''.join(common+light)+'}\n[data-theme="dark"]{'+''.join(dark)+'}\n'
if __name__=='__main__': print(emit(sys.argv[1]))
