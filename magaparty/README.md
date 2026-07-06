# JUNGLE NIGHT – Magaparty (Sito statico multi-pagina)

Sito statico pensato per essere servito da `https://magaverse.it/magaparty/` su GitHub Pages (o qualsiasi web server statico).

## Struttura

```
magaparty/
├── index.html          ← Info (home)
├── lineup.html         ← Line-up DJ
├── orari.html          ← Timeline orari
├── menu-day.html       ← Bar Menu 16–18 (aperitivo)
├── menu-night.html     ← Bar Menu 18–00 (serata)
├── galleria.html       ← Upload foto/video (Cloudinary)
├── tickets.html        ← Tariffe e tickets
├── social.html         ← Instagram / TikTok / Telegram
├── logo_maga.jpg       ← Logo (DA AGGIUNGERE — vedi sotto)
└── assets/
    ├── styles.css      ← Stili condivisi
    └── app.js          ← Nav, modal, countdown, Cloudinary, share, calendar
```

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
    { id: 'info',       href: 'index.html',      icon: 'fa-circle-info',  label: 'INFO' },
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
- Countdown attivo solo su `index.html` (target: 8 Luglio 2026 ore 16:00 Europe/Rome).
- Modale "Mettiti in lista" + bottom CTA (mobile) iniettati automaticamente in ogni pagina.
- Lista navigazione automaticamente evidenziata in base a `body[data-page]`.
