"""Controllo rapido delle pagine, da telefono e da PC, in un solo comando.

uso:  py strumenti/controlla.py magaparty/magagala.html index.html [--foto CARTELLA] [--solo-telefono] [--veloce]

Per ogni pagina e per ogni schermo stampa una riga. Schermi: telefono 390x844 (densità 3), tablet
verticale 820x1180, telefono in "sito desktop" 980x2120, PC 1280x800 (--veloce: solo telefono e PC;
--solo-telefono: solo il telefono). I due formati "larghi ma verticali" esistono perché il 17/11 un
bug si vedeva solo lì (parete di foto tagliata).
Ogni riga:
  OK / ERRORE  pagina  schermo  errori-js  scorrimento-orizzontale
Con --foto salva uno screenshot per pagina e schermo nella cartella indicata (mai nel repository).
Avvia da solo il server locale sulla porta 8765 se non risponde. Esce con codice 1 se c'è un errore.
"""
import asyncio, os, subprocess, sys, time, urllib.request
from playwright.async_api import async_playwright

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTA = 8765
GPU = ["--enable-gpu", "--use-angle=d3d11", "--ignore-gpu-blocklist"]


CTRL_PASSATA = """() => {
  const b = document.body;
  const passata = b.hasAttribute('data-passata') || b.classList.contains('serata-conclusa');
  const fine = !!document.querySelector('.racconto') && !!document.querySelector('.fine-stagione');
  if (!passata && !fine) return [];
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0; };
  const out = [];
  for (const sez of document.querySelectorAll('#prezzi, #form')) {
    // elementi foglia con testo proprio, visibili (anche i genitori devono esserlo)
    for (const el of sez.querySelectorAll('*')) {
      const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
      const m = /mettiti in lista/i.test(own) ? 'Mettiti in lista' : (passata && own.includes('€') ? '€' : '');
      if (!m) continue;
      let ok = true;
      for (let e = el; e && e !== document.body; e = e.parentElement) if (!vis(e)) { ok = false; break; }
      if (ok) out.push('#' + sez.id + ' "' + m + '"');
    }
  }
  return out;
}"""


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


async def main(pagine, foto, solo_tel, veloce):
    schermi = [("telefono", dict(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True))]
    if not solo_tel:
        if not veloce:
            schermi.append(("tablet", dict(viewport={"width": 820, "height": 1180}, device_scale_factor=2, has_touch=True)))
            schermi.append(("sito-desktop", dict(viewport={"width": 980, "height": 2120}, device_scale_factor=1)))
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
                # Serate passate: niente inviti a iscriversi né prezzi visibili in #prezzi/#form.
                # "€" si controlla dove c'è body[data-passata] (Tardeo, Ultima Onda) o body.serata-conclusa (Halloween):
                # niente importi nemmeno lì; "Vendite chiuse" resta voluto.
                # (la regola vale per #prezzi e #form).
                inviti = await pg.evaluate(CTRL_PASSATA)
                if inviti:
                    errs.append("serata passata con inviti visibili: " + "; ".join(inviti[:3]))
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
    veloce = "--veloce" in args
    args = [a for a in args if a not in ("--solo-telefono", "--veloce")]
    if not args:
        sys.exit(__doc__)
    import fa_subset  # controllo statico: ogni icona fa-* usata ha la sua regola in assets/fa/fa.css
    fa_errore = fa_subset.controlla()
    avvia_server()
    try:
        asyncio.run(main(args, foto, solo_tel, veloce))
    except SystemExit as e:
        sys.exit(1 if fa_errore else e.code)
