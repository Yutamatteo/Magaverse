"""Costruisce /anteprima/redesign nel worktree di main a partire dal branch redesign-grafica (working tree).
- riscrive i percorsi assoluti sotto /anteprima/redesign
- aggiunge noindex, blocco delle scritture verso Supabase e l'etichetta "Anteprima"
"""
import os, re, shutil, subprocess, sys
SRC=os.environ.get('MV_SORGENTE', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT=os.environ.get('MV_MAIN', os.path.join(os.path.dirname(SRC), 'magaverse-main')); DST=ROOT+'/anteprima/redesign'
P='/anteprima/redesign'
files=subprocess.check_output(['git','-C',SRC,'ls-files'],text=True).splitlines()
skip=re.compile(r'^(\.claude|anteprima|test|supabase|tools|strumenti)/|^(CNAME|skills-lock\.json)$|\.md$|\.sql$|\.mp4$|staff/|ARCHIVO-OFL')
guard=f'''<meta name="robots" content="noindex, nofollow">
<script>/* ANTEPRIMA: blocca le scritture verso Supabase */(function(){{var f=window.fetch;window.fetch=function(u,o){{var s=String(u&&u.url||u);if(/supabase\\.co/.test(s)&&o&&o.method&&o.method!=='GET'){{console.warn('Anteprima: invio bloccato',s);return Promise.reject(new Error('Anteprima: invio disattivato'))}}return f.apply(this,arguments)}}}})();</script>'''
banner='<div style="position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:99999;background:#FFC23D;color:#0E1224;font:600 12px/1.3 system-ui,sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.35);white-space:nowrap;pointer-events:none;opacity:.92">Anteprima · i form non inviano dati</div>'
if os.path.isdir(DST): shutil.rmtree(DST)
n=0
for f in files:
    if skip.search(f): continue
    s=os.path.join(SRC,f); d=os.path.join(DST,f)
    if not os.path.exists(s): continue
    os.makedirs(os.path.dirname(d),exist_ok=True)
    if f.endswith(('.html','.css','.js','.webmanifest')):
        t=open(s,encoding='utf-8').read()
        t=re.sub(r'''(["'(])/(assets|magaparty|magacard|oceanbeach|index\.html|favicon|site\.webmanifest)''', lambda m: m.group(1)+P+'/'+m.group(2), t)
        t=re.sub(r'''href="/"''', f'href="{P}/"', t)
        if f.endswith('.webmanifest'):  # l'app installata dall'anteprima deve aprire l'anteprima, non il sito vero
            t=re.sub(r'("start_url"\s*:\s*)"/"', lambda m: m.group(1)+f'"{P}/"', t)
            t=re.sub(r'("scope"\s*:\s*)"/"', lambda m: m.group(1)+f'"{P}/"', t)
        if f.endswith('.html'):
            t=re.sub(r'''<meta[^>]*name=["']robots["'][^>]*>\s*''','',t,flags=re.I)  # in anteprima vale solo il robots della guardia (sempre noindex)
            t=t.replace('<head>','<head>\n'+guard,1)
            t=re.sub(r'(<meta property="og:url" content="https://www\.magaverse\.it)/', lambda m: m.group(1)+P+'/', t)  # le condivisioni dell'anteprima puntano all'anteprima
            t=re.sub(r'(<body[^>]*>)', lambda m: m.group(1)+banner, t, count=1)
            t=re.sub(r'<link rel="canonical"[^>]*>\s*','',t)
        open(d,'w',encoding='utf-8').write(t)
    else:
        shutil.copy2(s,d)
    n+=1
print('file copiati:',n)
