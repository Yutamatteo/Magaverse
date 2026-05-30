# Magaverse — Network di esperienze a Magazzeno (Salerno)

Sito statico (HTML + CSS + JS, **niente backend, niente database**) che ospita
tre brand sotto un unico dominio:

- **`/`** → Magaverse hub (galaxy theme)
- **`/oceanbeach/`** → Nello Ocean Beach (sito bilingue IT/EN)
- **`/magaparty/`** → MAGA Republic / Magaparty (sito originale)

Le prenotazioni arrivano direttamente sul **WhatsApp Business** del lido tramite
un link `wa.me` con messaggio precompilato (nome, telefono, data, persone,
servizio, note).

---

## 📁 Struttura del repository

```
.
├── README.md
├── .gitignore
├── frontend/
│   └── package.json         ← script di preview locale (Python http.server)
└── site/                    ← 👉 LA CARTELLA DA UPLOADARE SU ARUBA
    ├── .htaccess            ← regole Apache (URL pulite, gzip, cache)
    ├── index.html           ← Magaverse hub (homepage)
    ├── assets/
    │   ├── magaverse.css
    │   └── img/
    │       └── nello-sunset.jpg   ← foto del tramonto (sostituibile)
    ├── oceanbeach/
    │   ├── index.html       ← Home
    │   ├── about.html       ← Chi Siamo
    │   ├── services.html    ← Servizi
    │   ├── pricing.html     ← Listino (prezzi vuoti da compilare)
    │   ├── booking.html     ← Modulo prenotazione → WhatsApp
    │   ├── contact.html     ← Contatti + Google Maps
    │   └── assets/
    │       ├── styles.css
    │       └── app.js       ← i18n IT/EN + form WhatsApp
    └── magaparty/           ← MAGA Republic (single-page + 2 sotto-pagine)
        ├── index.html       ← INFO + LINE-UP + ORARI + TICKETS + SOCIAL (consolidato)
        ├── bar.html         ← Menu bar con tab Aperitivo / Serata
        ├── galleria.html    ← Upload foto evento
        ├── logo_maga.jpg    ← 👉 AGGIUNGI QUI IL LOGO (vedi sezione Personalizzazioni)
        └── assets/
```

---

## 🚀 Deploy su Aruba

### Cosa caricare
**Carica solo il contenuto della cartella `site/`** (non la cartella stessa)
nella root del tuo hosting Aruba (di solito `httpdocs/` o `public_html/`).

### Step-by-step con FTP
1. **Recupera i dati FTP** dal pannello Aruba → "Gestione Hosting" → "FTP Account".
2. **Scarica FileZilla** (gratis): https://filezilla-project.org/
3. **Connettiti** al server FTP Aruba con le credenziali.
4. Naviga in `/httpdocs/` sul server e **svuotala** dai file di default (es. `index.html` placeholder Aruba).
5. **Trascina dentro tutto il contenuto** della cartella `site/` di questo repo.
   La struttura sul server deve risultare:
   ```
   httpdocs/
   ├── .htaccess
   ├── index.html
   ├── assets/
   ├── oceanbeach/
   └── magaparty/
   ```
6. **Verifica** aprendo il browser:
   - `magaverse.it/` → hub Magaverse
   - `magaverse.it/oceanbeach/` → home Nello
   - `magaverse.it/oceanbeach/booking.html` → modulo prenotazione
   - `magaverse.it/magaparty/` → Magaparty

### Configurazione lato Aruba

| Cosa | Stato richiesto |
|---|---|
| Hosting Linux attivo | ✅ Obbligatorio (qualsiasi piano "Hosting Linux") |
| `mod_rewrite` attivo | ✅ Attivo di default su Aruba Linux |
| Estensioni PHP | ❌ Non servono (il sito è 100% HTML/JS) |
| Database MySQL | ❌ Non serve |
| Email Aruba | ✅ Resta funzionante (record MX separati) |
| SSL / HTTPS | ⚠️ Da attivare nel pannello "Sicurezza" (Let's Encrypt gratis) |

**Importante**: se il dominio `magaverse.it` è già registrato su Aruba e
**hai il pacchetto hosting Aruba attivo**, NON serve toccare i DNS. Basta
caricare i file in `httpdocs/`. Il dominio punta già al tuo hosting Aruba.

**Se invece hai solo il dominio Aruba ma vuoi hostare altrove** (es. Vercel,
Netlify), allora dovresti cambiare i record DNS dal pannello Aruba per puntare
al nuovo hosting.

### SSL (HTTPS)
1. Pannello Aruba → "Servizi Hosting" → "Sicurezza" → "Certificato SSL" → attiva (gratis con Let's Encrypt).
2. Dopo l'attivazione, decommenta le righe `RewriteCond %{HTTPS}...` nel file
   `site/.htaccess` per forzare HTTPS, poi ri-uploada il file.

---

## ✏️ Modifiche frequenti

### 1. Numero WhatsApp Business
File: **`site/oceanbeach/assets/app.js`** — riga 5:
```js
const WHATSAPP_NUMBER = "393454237269";  // +39 345 423 7269
```
Cambia il numero (formato internazionale senza `+` e senza spazi).
Attualmente è il numero principale del Magaparty: **+39 345 423 7269**.

### 2. Prezzi del listino
File: **`site/oceanbeach/pricing.html`** — cerca `&euro; &mdash;` e sostituisci
con i prezzi reali, es. `&euro; 25`.

### 3. Testi (italiano + inglese)
File: **`site/oceanbeach/assets/app.js`** — sezione `i18n` in alto contiene
tutti i testi italiani e inglesi. Modifica direttamente i valori.

### 4. Foto della home
Sostituisci `site/assets/img/nello-sunset.jpg` con altre foto del lido. Per
aggiungere più foto in galleria, copiale nella stessa cartella e modifica i
riferimenti in `site/oceanbeach/index.html` (sezione "GALLERY").

### 5. Indirizzo email (placeholder)
Cerca `info@nellooceanbeach.it` nei file `.html` e sostituiscilo.

### 6. 🌟 Logo Magaparty
Trascina il tuo file logo nominato esattamente **`logo_maga.jpg`** dentro la
cartella **`site/magaparty/`**. Apparirà automaticamente al posto del
placeholder tratteggiato in alto a sinistra. Dimensioni consigliate:
quadrate, almeno 400×400 px.

### 7. Apertura sotto-siti dall'hub Magaverse
I link dall'hub principale ai sotto-siti (`Nello Ocean Beach`, `Magaparty`)
si aprono in **una nuova scheda del browser**. Per cambiare comportamento,
rimuovi `target="_blank"` dai link in `site/index.html`.

---

## 🛠 Stack tecnico

- **Frontend**: HTML5 + CSS3 + JavaScript vanilla (zero framework, zero build)
- **i18n**: data-attributes (`data-i18n="key"`) + dizionario JS, lingua persistita in `localStorage`
- **WhatsApp**: deep link `wa.me/<numero>?text=<messaggio>` (apre la chat con testo precompilato)
- **Tipografia**:
  - Nello Ocean Beach: Playfair Display + Outfit
  - Magaverse: Syne + Space Grotesk
  - Magaparty: Archivo Black + Space Grotesk (originale)
- **Hosting compatibile**: qualsiasi server HTTP statico
  - ✅ Aruba Linux Hosting
  - ✅ Netlify / Vercel / Cloudflare Pages
  - ✅ GitHub Pages
  - ✅ Apache / Nginx self-hosted

---

## 📦 Come funzionano le URL

| URL pubblico | File servito |
|---|---|
| `magaverse.it/` | `site/index.html` |
| `magaverse.it/oceanbeach/` | `site/oceanbeach/index.html` |
| `magaverse.it/oceanbeach/booking.html` | `site/oceanbeach/booking.html` |
| `magaverse.it/oceanbeach/booking` *(senza estensione)* | `site/oceanbeach/booking.html` (via `.htaccess`) |
| `magaverse.it/magaparty/` | `site/magaparty/index.html` (single-page con sezioni) |
| `magaverse.it/magaparty/bar.html` | `site/magaparty/bar.html` (menu Day/Night) |
| `magaverse.it/magaparty/galleria.html` | `site/magaparty/galleria.html` (upload foto) |
| `magaverse.it/magaparty/#lineup` | scroll alla sezione LINE-UP in `index.html` |
| `magaverse.it/magaparty/#tickets` | scroll alla sezione TICKETS in `index.html` |

---

## 📞 Contatti

- **WhatsApp Business**: +39 345 423 7269
- **Indirizzo**: Via Mar Ionio, 22, 84098 Magazzeno (SA)

© 2026 Magaverse · Magazzeno (SA)
