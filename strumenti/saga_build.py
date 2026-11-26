"""Genera la stagione come un'unica parete di foto che scende con la pagina (scorrimento
nativo, nessun calcolo durante lo scroll). uso: saga_build.py [pagina] [id,da,saltare]"""
import re, json, os, sys, glob
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(os.path.dirname(__file__), 'saga.json'), encoding='utf-8'))
TARGET = sys.argv[1] if len(sys.argv) > 1 else 'magaparty/index.html'  # l'hub (index.html) non ha più la parete
SALTA = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else set()
CFG = [c for c in CFG if c['id'] not in SALTA]
N = 9  # tasselli per serata, tutti diversi (il telefono ne mostra 6)

sezioni = []
for i, s in enumerate(CFG):
    t = s['tinta']
    link = ''.join(f'<a class="cap-btn{" cap-btn-vuoto" if k else ""}" href="{h}">{l}</a>' for k, (l, h) in enumerate(s['link']))
    testo = f'''<div class="notte-testo">
                    <p class="notte-quando">{s["quando"]}</p>
                    <h2 id="notte-{s["id"]}"{' class="gala-nome"' if s["tipo"]=="gala" else ''}>{s["titolo"]}</h2>
                    <p class="notte-frase">{s["frase"]}</p>{s.get("extra","")}
                    <div class="cap-link">{link}</div>
                </div>'''
    if s['tipo'] == 'gala':
        sezioni.append(f'''<section class="notte notte-gala cap-gala" style="--tinta:{t}" aria-labelledby="notte-{s["id"]}">
                <div class="cap-luce" aria-hidden="true"></div><canvas class="polvere" aria-hidden="true"></canvas>
                <div class="telo telo-sx" aria-hidden="true"></div><div class="telo telo-dx" aria-hidden="true"></div><div class="mantovana" aria-hidden="true"></div>
                {testo}
            </section>''')
        continue
    tiles = sorted(glob.glob(f"{R}/assets/img/parete/{s['parete']}-*.webp"))
    from PIL import Image
    imgs = ''
    for k in range(min(N, len(tiles))):
        w, h = Image.open(tiles[k]).size
        src = tiles[k].replace(R, "").replace(chr(92), "/")  # percorsi con la barra normale anche su Windows
        imgs += f'<img src="{src}" alt="" width="{w}" height="{h}" loading="lazy" decoding="async">'
    loc = ' notte-locandine' if s['parete'] == 'format' else ''
    sezioni.append(f'''<section class="notte{loc}" style="--tinta:{t}" aria-labelledby="notte-{s["id"]}">
                <div class="notte-muro" aria-hidden="true">{imgs}</div>
                {testo}
            </section>''')

blocco = f'''<!-- SAGA:INIZIO · la stagione come un'unica parete di foto che scende con la pagina -->
        <div class="stagione-muro" data-saga>
            {"".join(sezioni)}
        </div>
        <!-- SAGA:FINE -->'''
if TARGET == 'index.html': sys.exit('index.html (hub) non contiene più la parete: usa magaparty/index.html')
idx = open(f'{R}/{TARGET}', encoding='utf-8').read()
idx = re.sub(r'<!-- SAGA:INIZIO.*?<!-- SAGA:FINE -->', lambda m: blocco, idx, flags=re.S)
open(f'{R}/{TARGET}', 'w', encoding='utf-8', newline='').write(idx)
print('ok', TARGET, len(CFG), 'serate')
