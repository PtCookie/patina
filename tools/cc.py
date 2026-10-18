import math,re,sys
def oklch_to_srgb(L,C,H):
    a=C*math.cos(math.radians(H)); b=C*math.sin(math.radians(H))
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r=4.0767416621*l-3.3077115913*m+0.2309699292*s
    g=-1.2684380046*l+2.6097574011*m-0.3413193965*s
    bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return [min(1,max(0,x)) for x in (r,g,bb)]  # linear
def parse(v):
    m=re.match(r'oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: / (\d+)%)?\)',v)
    L,C,H=map(float,m.groups()[:3]); a=float(m.group(4))/100 if m.group(4) else 1
    return oklch_to_srgb(L,C,H),a
def lum(lin): return 0.2126*lin[0]+0.7152*lin[1]+0.0722*lin[2]
def enc(x): return 12.92*x if x<=0.0031308 else 1.055*x**(1/2.4)-0.055
def dec(x): return x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4
def over(fg,a,bg):  # composite in sRGB gamma space
    return [dec(enc(f)*a+enc(b)*(1-a)) for f,b in zip(fg,bg)]
def cr(fg,bg):
    f,fa=parse(fg); b,_=parse(bg)
    if fa<1: f=over(f,fa,b)
    L1,L2=sorted([lum(f),lum(b)],reverse=True); return (L1+0.05)/(L2+0.05)
def hexof(v):
    f,_=parse(v); return '#'+''.join('%02x'%round(enc(x)*255) for x in f)
if __name__=='__main__':
    print(cr(sys.argv[1],sys.argv[2]))
