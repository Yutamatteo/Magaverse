"""Controllo rapido delle pagine, da telefono e da PC, in un solo comando.

uso:  py strumenti/controlla.py magaparty/magagala.html index.html [--foto CARTELLA] [--solo-telefono]

Per ogni pagina e per ogni schermo (telefono 390x844 densità 3, PC 1280x800) stampa una riga:
  OK / ERRORE  pagina  schermo  errori-js  scorrimento-orizzontale
Con --foto salva uno screenshot per pagina e schermo nella cartella indicata (mai nel repository).
Avvia da solo il server locale sulla porta 8765 se non risponde. Esce con codice 1 se c'è un errore.
"""
import asyncio, os, subprocess, sys, time, urllib.request
from playwright.async_api import async_playwright

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTA = 8765
GPU = ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"]


def server_attivo():
    try:
        urllib.request.urlopen(f"http://localhost:{PORTA}/", timeout=2)
        return True
    except Exception:
        return False


def avvia_server():
    if server_attivo():
        return
    subprocess.Popen([sys.executable, "-m", "http.server", str(PORTA)], cwd=RADICE,
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(20):
        if server_attivo():
            return
        time.sleep(0.25)
    sys.exit("ERRORE: server locale non partito")


async def main(pagine, foto, solo_tel):
    schermi = [("telefono", dict(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True))]
    if not solo_tel:
        schermi.append(("pc", dict(viewport={"width": 1280, "height": 800})))
    errori_tot = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=GPU)
        for nome, opz in schermi:
            ctx = await b.new_context(**opz)
            for pag in pagine:
                pg = await ctx.new_page()
                errs = []
                pg.on("pageerror", lambda e, errs=errs: errs.append(str(e)[:120]))
                pg.on("console", lambda m, errs=errs: errs.append(m.text[:120]) if m.type == "error" else None)
                await pg.goto(f"http://localhost:{PORTA}/{pag}", wait_until="networkidle")
                await pg.wait_for_timeout(800)
                sw = await pg.evaluate("[document.documentElement.scrollWidth, innerWidth]")
                largo = sw[0] > sw[1]
                ok = not errs and not largo
                errori_tot += 0 if ok else 1
                print(f"{'OK    ' if ok else 'ERRORE'} {pag or 'hub'}  {nome}  js:{len(errs)}  scorrimento:{'SI ' + str(sw[0]) + '>' + str(sw[1]) if largo else 'no'}"
                      + (("  -> " + " | ".join(errs[:3])) if errs else ""))
                if foto:
                    os.makedirs(foto, exist_ok=True)
                    f = os.path.join(foto, f"{(pag or 'hub').replace('/', '_').replace('.html', '')}_{nome}.png")
                    await pg.screenshot(path=f)
                await pg.close()
            await ctx.close()
        await b.close()
    sys.exit(1 if errori_tot else 0)


if __name__ == "__main__":
    args = sys.argv[1:]
    foto = None
    if "--foto" in args:
        i = args.index("--foto"); foto = args[i + 1]; del args[i:i + 2]
    solo_tel = "--solo-telefono" in args
    args = [a for a in args if a != "--solo-telefono"]
    if not args:
        sys.exit(__doc__)
    avvia_server()
    asyncio.run(main(args, foto, solo_tel))
