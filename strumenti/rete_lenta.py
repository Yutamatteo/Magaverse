"""Misura una pagina come da telefono con rete lenta (mediana su più giri).

Uso:  py strumenti/rete_lenta.py <pagina> [porta] [--giri 3]
      (server già avviato: py -m http.server <porta>; porta predefinita 8765)
Esempio: py strumenti/rete_lenta.py index.html 8765 --giri 5

Emula 390x844 densità 3, latenza 150 ms, 200 KB/s, CPU rallentata 4x.
Stampa mediana di LCP (con l'elemento), FCP, evento load, KB trasferiti per tipo
e numero di richieste. Variabile BLK="*.js,..." per bloccare risorse (prove "senza X").
"""
import os, sys, statistics
from playwright.sync_api import sync_playwright

args = [a for a in sys.argv[1:]]
giri = 3
if "--giri" in args:
    i = args.index("--giri"); giri = int(args[i + 1]); del args[i:i + 2]
if not args:
    sys.exit(__doc__)
pagina = args[0].lstrip("/")
porta = args[1] if len(args) > 1 else "8765"
url = f"http://localhost:{porta}/{pagina}"

OSSERVA = ("window.__l=0;window.__e='';new PerformanceObserver(l=>{for(const e of l.getEntries())"
           "{__l=e.startTime;__e=e.element?(e.element.tagName+' '+(e.url||e.element.className)):''}})"
           ".observe({type:'largest-contentful-paint',buffered:true})")
LEGGI = r"""()=>{const t={};const n=performance.getEntriesByType('resource');
n.forEach(e=>{const m=e.name.match(/\.(\w+)(\?|$)/);const k=(m||[])[1]||'altro';t[k]=(t[k]||0)+e.transferSize});
const nav=performance.getEntriesByType('navigation')[0];
const fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime||0;
return {lcp:__l,el:__e,fcp,load:nav.loadEventEnd,t,n:n.length+1}}"""
TIPI = {"webp": "img", "png": "img", "jpg": "img", "jpeg": "img", "svg": "img", "avif": "img",
        "js": "js", "woff2": "font", "woff": "font", "css": "css"}

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle"])
    res = []
    for _ in range(giri):
        c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3,
                          is_mobile=True, has_touch=True)
        pg = c.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        cd = c.new_cdp_session(pg)
        cd.send("Network.enable")
        cd.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150,
                "downloadThroughput": 200 * 1024, "uploadThroughput": 100 * 1024})
        cd.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        pg.add_init_script(OSSERVA)
        for x in os.environ.get("BLK", "").split(","):
            if x: pg.route(x, lambda r: r.abort())
        pg.goto(url, wait_until="load"); pg.wait_for_timeout(2500)
        r = pg.evaluate(LEGGI); r["errs"] = errs; res.append(r); c.close()
    b.close()

res.sort(key=lambda r: r["lcp"]); m = res[len(res) // 2]
med = lambda k: round(statistics.median(r[k] for r in res))
print(url, f"({giri} giri, 390x844 x3, 150 ms, 200 KB/s, CPU 4x)")
print("LCP", med("lcp"), "ms (giri:", [round(r["lcp"]) for r in res], ")", m["el"])
print("FCP", med("fcp"), "ms  load", med("load"), "ms")
tot = {}
for k, v in m["t"].items():
    tot[TIPI.get(k, "altro")] = tot.get(TIPI.get(k, "altro"), 0) + v
print("KB per tipo:", {k: round(v / 1024) for k, v in sorted(tot.items())},
      "totale", round(sum(tot.values()) / 1024), "| richieste", m["n"])
if m["errs"]: print("ERRORI JS:", m["errs"])
