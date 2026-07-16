# MAGAPARTY – Sito statico multi-pagina

Sito statico pensato per essere servito da `https://magaverse.it/magaparty/` su GitHub Pages (o qualsiasi web server statico).

## Struttura

```
magaparty/
├── index.html          ← Home del brand MAGAPARTY: presenta i 3 format
├── marea.html           ← MAREA (domenica) — landing + form prenotazione + QR monouso
├── evento.html          ← Archivio: JUNGLE NIGHT, l'evento passato (Info, Line-up, Orari, Tickets, Social)
├── bar.html              ← Bar Menu (Jungle Night)
├── galleria.html          ← Upload foto/video (Cloudinary, Jungle Night)
├── chi-siamo.html         ← Storia del brand
├── logo_maga.jpg          ← Logo
├── docs/
│   ├── marea-schema.sql   ← Schema Supabase di Marea (prenotazioni, QR monouso)
│   └── README-marea.md    ← Documentazione completa del sistema Marea
└── assets/
    ├── styles.css      ← Stili condivisi (usati anche da index.html e marea.html)
    └── app.js          ← Nav/modal/countdown ecc., usati dalle pagine "archivio" Jungle Night
```

`index.html` è oggi l'hub del brand **MAGAPARTY**: presenta i 3 format che
compongono l'universo degli eventi —
**Battigia** (mercoledì, work in progress),
**Marea** (domenica, live — porta a `marea.html`) e
**Drink Another Night** (venerdì 31 Luglio e 7 Agosto, work in progress).

`evento.html`, `bar.html` e `galleria.html` restano online come archivio
del format **Jungle Night** (l'evento dell'8 Luglio 2026): non sono più
raggiungibili dalla home, ma i link diretti continuano a funzionare.
`marea.html` è invece una pagina indipendente, con il proprio form e la
propria logica di prenotazione — vedi `docs/README-marea.md` per il setup
completo (Supabase, email).

Lo staff usa un **unico accesso** per tutti i format: `/magacard/staff/`
(niente pagine di login separate per Marea o futuri eventi). Chi ha il
ruolo `ingresso` scansiona sia le MagaCard (timbri) sia i QR d'ingresso
di Marea dalla stessa schermata; il ruolo `bar` continua a occuparsi solo
dei punti MagaCard.

## Pubblicazione

1. Copia l'intera cartella `magaparty/` nel tuo repo GitHub Pages.
2. Aggiungi il file **`logo_maga.jpg`** nella cartella `magaparty/` (lo stesso usato nella versione singola pagina). Se manca, il sito mostra automaticamente un placeholder "MAGA".
3. Carica/commit/push → il sito sarà online su `magaverse.it/magaparty/`.

> Tutti i link interni sono **relativi**, quindi il sito funziona ovunque (root, sotto-cartella, locale).

## Aggiornare i prezzi del menu aperitivo (16–18)

Apri `menu-day.html` e cambia i prezzi/voci direttamente nei blocchi `<div class="flex justify-between …">`.

Esempio:
```html
<div class="flex justify-between items-center px-4 py-3">
    <span class="text-xs">Aperol Spritz</span>
    <span class="brutalist text-lg" style="color:var(--sunset-orange)">5€</span>
</div>
```

## Aggiungere/rimuovere una pagina dalla navigazione

Modifica l'array `NAV` in `assets/app.js` (in alto al file):

```js
const NAV = [
    { id: 'home',       href: 'index.html',        icon: 'fa-house',        label: 'HOME' },
    { id: 'info',       href: 'evento.html#info',  icon: 'fa-circle-info',  label: 'INFO' },
    // ...
];
```

L'`id` deve coincidere con l'attributo `data-page` del `<body>` della pagina.

## Cloudinary

Il preset è già configurato in `assets/app.js`:
- `CLOUD_NAME = 'dthvzhohr'`
- `UPLOAD_PRESET = 'ml_MagaRepublic'`

Cambialo se serve.

## Note tecniche

- Tailwind via CDN, Font Awesome 6, Google Fonts (Archivo Black + Space Grotesk).
- Countdown attivo solo su `evento.html` (target: 8 Luglio 2026 ore 16:00 Europe/Rome).
- Modale "Mettiti in lista" + bottom CTA (mobile) iniettati automaticamente in ogni pagina.
- Lista navigazione automaticamente evidenziata in base a `body[data-page]`.
