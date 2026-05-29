# Nello Ocean Beach — Product Requirements

## Original Problem Statement
Sito web per stabilimento balneare "Nello Ocean Beach" a Magazzeno (Salerno), Via Mar Ionio 22.
Target: giovani, coppie, famiglie. Servizi: bagni, docce calde/fredde, bar, wifi su richiesta, noleggio canoe.
Stile: moderno, colori beige/marrone/bianco. Bilingue IT/EN.
Sistema prenotazione → apre WhatsApp Business con messaggio precompilato. Listino prezzi con placeholder (prezzi inseriti dal proprietario).

## User Personas
- Famiglie in cerca di una giornata di mare semplice e curata
- Coppie giovani per relax e tramonti
- Gruppi di amici / sportivi interessati alle canoe

## Architecture
- Frontend: React 19 + React Router 7 + Tailwind CSS (palette earthy beige/marrone)
- Backend: FastAPI + MongoDB (lead di prenotazione)
- i18n: Context-based custom (IT/EN), persistenza localStorage `nob_lang`
- WhatsApp: deep link `https://wa.me/<num>?text=<encoded>` con messaggio bilingue

## Implemented (Dec 2025)
- 6 pagine: Home, Chi Siamo, Servizi, Listino, Prenota, Contatti
- Hero immersivo + bento grid servizi + galleria + final CTA
- Navbar fisso + selettore lingua IT/EN + sticky WhatsApp CTA
- Booking form (nome, telefono, data, n. persone, servizio, note) → salva su MongoDB + apre WhatsApp con messaggio precompilato
- Listino con categorie e prezzi placeholder "€ —" (modificabili da `pricing.categories` in `/app/frontend/src/i18n/translations.js`)
- Mappa Google embed + meta SEO IT/EN
- Tutti gli elementi interattivi hanno `data-testid` kebab-case
- Backend endpoint: GET /api/health, GET /api/, POST /api/bookings, GET /api/bookings

## Configuration to update by owner
- `/app/frontend/src/lib/constants.js` → `WHATSAPP_NUMBER` (formato internazionale senza +, es. "393331234567")
- `/app/frontend/src/lib/constants.js` → `BUSINESS.email`
- `/app/frontend/src/i18n/translations.js` → sostituire `€ —` con prezzi reali nelle categorie Pricing

## Backlog (P1/P2)
- P1: Galleria foto multipla con lightbox (immagini reali del lido)
- P1: Sezione recensioni Google Reviews
- P2: Calendar component con date bloccate (high-season)
- P2: Multilingua aggiuntivo (DE, FR)
- P2: Newsletter capture (stagione successiva)
- P2: Dashboard admin per consultare prenotazioni salvate

## Testing
- Backend: 6/6 pytest passing
- Frontend: Playwright e2e tutti i flussi (lang toggle, nav, booking, mappa, sticky CTA)
