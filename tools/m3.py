import sys,json,re,math
sys.path.insert(0,'.')
from cc import parse,over,lum,enc,dec
t=json.load(open(sys.argv[1] if len(sys.argv)>1 else '../design-system/tokens.json'))
TK={x['name']:x['value'] for x in t['color']['tokens']}
def get(name,th):
    v=TK[name]; v=v if isinstance(v,str) else v.get(th,v['light'])
    m=re.fullmatch(r'\{(.+)\}',v)
    return get(m.group(1),th) if m else v
def lin(c,bg=None):
    f,a=parse(c)
    if a<1:
        b=lin(bg) if bg else [1,1,1]
        f=over(f,a,b)
    return f
def mix(c,pct,bgname,th):  # c at pct over bg -> solid linear
    f,_=parse(c); b=lin(get(bgname,th)); return over(f,pct,b)
def hexl(l): return '#'+''.join('%02X'%round(enc(x)*255) for x in l)
def cr(a,b):
    la,lb=lum(a),lum(b); return (max(la,lb)+.05)/(min(la,lb)+.05)
R={}
for th in ['light','dark']:
    bg=lin(get('background',th))
    g=lambda n: lin(get(n,th),get('background',th))
    S={}
    S['primary']=g('link')
    S['onPrimary']=g('primary-foreground') if th=='light' else g('sidebar-primary-foreground')
    S['primaryContainer']=mix(get('primary','light'),0.12,'background',th) if th=='light' else g('primary')
    S['onPrimaryContainer']=lin(get('primary','dark')) if th=='light' else g('primary-foreground')
    S['inversePrimary']=lin(get('link','dark')) if th=='light' else lin(get('primary','light'))
    S['secondary']=g('muted-foreground'); S['onSecondary']=g('background')
    S['secondaryContainer']=g('secondary'); S['onSecondaryContainer']=g('secondary-foreground')
    S['tertiary']=g('info'); S['onTertiary']=g('info-foreground')
    S['tertiaryContainer']=mix(get('info',th),0.12 if th=='light' else 0.24,'background',th); S['onTertiaryContainer']=g('info')
    S['error']=g('destructive'); S['onError']=lin('oklch(0.985 0 0)') if th=='light' else g('background')
    S['errorContainer']=mix(get('destructive',th),0.12 if th=='light' else 0.24,'background',th); S['onErrorContainer']=g('destructive')
    S['background']=bg; S['onBackground']=g('foreground')
    S['surface']=bg; S['onSurface']=g('foreground')
    S['surfaceVariant']=g('muted'); S['onSurfaceVariant']=g('muted-foreground')
    S['surfaceTint']=bg
    S['inverseSurface']=g('foreground'); S['inverseOnSurface']=g('background')
    S['outline']=g('ring'); S['outlineVariant']=lin(get('border',th),get('background',th))
    S['scrim']=[0,0,0]
    if th=='light':
        S['surfaceContainerLowest']=bg; S['surfaceContainerLow']=g('sidebar'); S['surfaceContainer']=g('muted')
        S['surfaceContainerHigh']=lin('oklch(0.956 0.003 205)'); S['surfaceContainerHighest']=lin('oklch(0.948 0.004 212)')
        S['surfaceDim']=g('border'); S['surfaceBright']=bg
    else:
        S['surfaceContainerLowest']=bg; S['surfaceContainerLow']=lin('oklch(0.183 0.006 226)'); S['surfaceContainer']=g('card')
        S['surfaceContainerHigh']=lin('oklch(0.245 0.009 220)'); S['surfaceContainerHighest']=g('muted')
        S['surfaceDim']=bg; S['surfaceBright']=g('muted')
    R[th]=S
# contrast checks
pairs=[('onPrimary','primary'),('onPrimaryContainer','primaryContainer'),('primary','surface'),('primary','surfaceContainer'),('onSecondaryContainer','secondaryContainer'),('onTertiary','tertiary'),('onTertiaryContainer','tertiaryContainer'),('onError','error'),('onErrorContainer','errorContainer'),('error','surface'),('onSurface','surface'),('onSurfaceVariant','surfaceVariant'),('onSurfaceVariant','surfaceContainerHighest'),('inverseOnSurface','inverseSurface'),('inversePrimary','inverseSurface'),('outline','surface'),('outline','surfaceContainerHighest')]
for th in R:
    for a,b in pairs:
        v=cr(R[th][a],R[th][b]); need=3 if a in('outline',) else 4.5
        print(th,f'{a}/{b}',round(v,2),'' if v>=need else 'FAIL')
out={th:{k:hexl(v) for k,v in R[th].items()} for th in R}
json.dump(out,open('m3.json','w'),indent=1)
