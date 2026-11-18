"""Font Awesome 6.4.0 ridotto alle sole icone usate dal sito (assets/fa/).

uso:
  py strumenti/fa_subset.py --controlla [file ...]   controllo statico, non scrive nulla
  py strumenti/fa_subset.py                          rigenera assets/fa/*.woff2 e fa.css

Dipendenze (solo per rigenerare): py -m pip install fonttools brotli
Ogni classe fa-<nome> trovata in .html/.js del repository (escluse anteprima/ e test/) deve avere una
regola in assets/fa/fa.css. Lo stile (solid/regular/brands) si ricava dalle coppie "fa-regular fa-x" /
"fa-brands fa-x"; tutto il resto e' solid. Icone: CC BY 4.0, font: SIL OFL 1.1, codice: MIT.
I file scaricati da cdnjs sono verificati con SRI (sha384) prima di essere usati.
"""
import base64, hashlib, os, re, subprocess, sys, urllib.request

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FA_DIR = os.path.join(RADICE, "assets", "fa")
BASE = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/"
# Il woff2 di regular e brands non si apre con fonttools: si parte dal ttf e si salva in woff2.
SORGENTI = {
    "css/all.min.css": "sha384-iw3OoTErCYJJB9mCa8LNS2hbsQ7M3C0EpIsO/H5+EGAkPGc6rk+V8i04oW/K5xq0",
    "webfonts/fa-solid-900.woff2": "sha384-JtHMcbwFK+S5WYliXJYzBoASDLTpVrtok44OrbDd8U2VhZIuoYbT6fgtNq8ph8qq",
    "webfonts/fa-regular-400.ttf": "sha384-EMKVTT8qczt0iiiSe6OrygwYLieq4ok9HwayZeRfxwBwnw6GiJmn00FOhDniXQN7",
    "webfonts/fa-brands-400.ttf": "sha384-fKOYuAEoNctp5sgUieMLWmhLs5ybUVdGVQesDxohYVwluJ0KI5Apt5lwzQqjLXlC",
}
NON_ICONE = {"solid", "regular", "brands", "spin"}  # classi di stile/animazione, non icone


def file_del_sito():
    """.html e .js tracciati, esclusi anteprima/ e test/ (copie)."""
    out = subprocess.check_output(["git", "-C", RADICE, "ls-files"], text=True).splitlines()
    return [os.path.join(RADICE, f) for f in out
            if f.endswith((".html", ".js")) and not f.startswith(("anteprima/", "test/"))]


def usi(files):
    """-> (set di nomi icona, {stile: set}) ; stile da coppie 'fa-<stile> fa-<nome>'."""
    nomi, stile = set(), {"regular": set(), "brands": set()}
    for f in files:
        try:
            t = open(f, encoding="utf8", errors="ignore").read()
        except OSError:
            continue
        for m in re.finditer(r"(?<![\w-])fa-([a-z0-9]+(?:-[a-z0-9]+)*)", t):
            if m.group(1) not in NON_ICONE:
                nomi.add(m.group(1))
        for s, n in re.findall(r"fa-(regular|brands) fa-([a-z0-9-]+)", t):
            stile[s].add(n)
    return nomi, stile


def controlla(extra=()):
    css = open(os.path.join(FA_DIR, "fa.css"), encoding="utf8").read()
    presenti = set(re.findall(r"\.fa-([a-z0-9-]+):before", css))
    nomi, _ = usi(list(file_del_sito()) + [os.path.abspath(e) for e in extra])
    err = sorted(nomi - presenti)
    for n in err:
        print(f"ERRORE icona fa-{n} mancante: rigenera con strumenti/fa_subset.py")
    if not err:
        print(f"OK icone Font Awesome: {len(nomi)} usate, tutte in assets/fa/fa.css")
    return 1 if err else 0


def scarica(rel):
    dati = urllib.request.urlopen(BASE + rel, timeout=60).read()
    sri = "sha384-" + base64.b64encode(hashlib.sha384(dati).digest()).decode()
    if sri != SORGENTI[rel]:
        sys.exit(f"SRI diverso per {rel}: {sri}")
    return dati


def genera():
    import io
    from fontTools import subset
    from fontTools.ttLib import TTFont
    css_src = scarica("css/all.min.css").decode("utf8")
    cp = {}
    for sel, code in re.findall(r'((?:\.fa-[a-z0-9-]+:before,?)+)\{content:"\\([0-9a-f]+)"\}', css_src):
        for n in re.findall(r"\.fa-([a-z0-9-]+):before", sel):
            cp[n] = int(code, 16)
    nomi, stile = usi(file_del_sito())
    liste = {"solid": sorted(nomi - stile["regular"] - stile["brands"]),
             "regular": sorted(stile["regular"]), "brands": sorted(stile["brands"])}
    mancanti = [n for n in nomi if n not in cp]
    if mancanti:
        sys.exit(f"icone inesistenti in Font Awesome 6.4.0 Free: {mancanti}")
    os.makedirs(FA_DIR, exist_ok=True)
    for stile_, rel, out in (("solid", "webfonts/fa-solid-900.woff2", "fa-solid-900.woff2"),
                             ("regular", "webfonts/fa-regular-400.ttf", "fa-regular-400.woff2"),
                             ("brands", "webfonts/fa-brands-400.ttf", "fa-brands-400.woff2")):
        o = subset.Options(); o.flavor = "woff2"; o.layout_features = []; o.name_IDs = []; o.notdef_outline = True
        f = TTFont(io.BytesIO(scarica(rel)))
        s = subset.Subsetter(o); s.populate(unicodes=[cp[n] for n in liste[stile_]]); s.subset(f)
        f.flavor = "woff2"; f.save(os.path.join(FA_DIR, out))
        print(out, os.path.getsize(os.path.join(FA_DIR, out)), "byte")
    tutte = sorted(set(sum(liste.values(), [])))
    c = '''/*! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com
 * Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT. Copyright 2023 Fonticons, Inc.
 * Sottoinsieme: solo le icone usate dal sito (webfont ridotti in assets/fa/). */
.fa-brands,.fa-regular,.fa-solid{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}
.fa-regular,.fa-solid{font-family:"Font Awesome 6 Free"}
.fa-brands{font-family:"Font Awesome 6 Brands";font-weight:400}
.fa-regular{font-weight:400}
.fa-solid{font-weight:900}
.fa-spin{animation:fa-spin 2s linear infinite}
@media (prefers-reduced-motion:reduce){.fa-spin{animation-delay:-1ms;animation-duration:1ms;animation-iteration-count:1}}
@keyframes fa-spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}
@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:block;src:url(fa-brands-400.woff2) format("woff2")}
@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:block;src:url(fa-regular-400.woff2) format("woff2")}
@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:block;src:url(fa-solid-900.woff2) format("woff2")}
'''
    c += "\n".join('.fa-%s:before{content:"\\%x"}' % (n, cp[n]) for n in tutte) + "\n"
    open(os.path.join(FA_DIR, "fa.css"), "w", encoding="utf8", newline="\n").write(c)
    print("fa.css:", len(tutte), "icone")


if __name__ == "__main__":
    if "--controlla" in sys.argv:
        sys.exit(controlla([a for a in sys.argv[1:] if a != "--controlla"]))
    genera()
