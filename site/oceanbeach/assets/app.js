/* =========================================================
   NELLO OCEAN BEACH — i18n + UI logic (vanilla JS)
   ========================================================= */

// WhatsApp Business number (extracted from Magaparty)
const WHATSAPP_NUMBER = "393454237269"; // +39 345 423 7269

// ---------- TRANSLATIONS ----------
const i18n = {
    it: {
        "nav.home": "Home",
        "nav.about": "Chi Siamo",
        "nav.services": "Servizi",
        "nav.pricing": "Listino",
        "nav.booking": "Prenota",
        "nav.contact": "Contatti",
        "nav.cta": "Prenota su WhatsApp",
        "nav.back": "← MAGAVERSE",

        // Home
        "home.kicker": "Stabilimento balneare · Magazzeno, Salerno",
        "home.title": "La tua oasi di relax\nsulla costa del Tirreno.",
        "home.sub": "Al Nello Ocean Beach celebriamo l'estate. Ombrelloni eleganti, bar accogliente, canoe pronte all'avventura — l'atmosfera perfetta per famiglie, giovani e coppie.",
        "home.cta1": "Prenota su WhatsApp",
        "home.cta2": "Scopri i servizi",
        "home.stat1k": "500m", "home.stat1v": "di spiaggia dorata",
        "home.stat2k": "4★", "home.stat2v": "valutazione clienti",
        "home.stat3k": "12h", "home.stat3v": "di sole al giorno",

        "home.about.kicker": "Chi siamo",
        "home.about.title": "Una spiaggia rinnovata\nche profuma di mare.",
        "home.about.text": "Beige, marrone caldo, bianco panna: il Nello Ocean Beach si presenta in una veste moderna che si fonde con i toni della sabbia e del legno. Un luogo curato, pensato per chi cerca relax di qualità senza rinunciare al carattere autentico della costa campana.",
        "home.about.cta": "Leggi la nostra storia →",

        "home.svc.kicker": "I nostri servizi",
        "home.svc.title": "Tutto ciò che serve\nper una giornata perfetta.",
        "home.svc.cta": "Scopri di più →",

        "svc.umbrella.t": "Ombrelloni & Lettini",
        "svc.umbrella.d": "File ordinate, ombra generosa, lettini imbottiti. La quiete della spiaggia, come la immagini.",
        "svc.canoe.t": "Noleggio Canoe",
        "svc.canoe.d": "Pagaia leggera, vista sulla costa: il modo migliore per vivere il mare attivamente.",
        "svc.bar.t": "Beach Bar",
        "svc.bar.d": "Aperitivi, caffè, granite e snack freschi serviti direttamente sotto l'ombrellone.",
        "svc.showers.t": "Docce Calde & Fredde",
        "svc.showers.d": "Acqua calda dopo il bagno, fredda nelle ore più assolate. Sempre pulite, sempre disponibili.",
        "svc.wifi.t": "Wi-Fi su richiesta",
        "svc.wifi.d": "Connessione veloce per chi vuole restare in contatto, senza disturbare il relax.",
        "svc.cabins.t": "Bagni & Cabine",
        "svc.cabins.d": "Servizi igienici sempre puliti e cabine private per cambiarsi con comodità.",

        "home.gallery.title": "Vivilo con i tuoi occhi",
        "home.gallery.sub": "Sabbia, ombrelloni allineati, il rumore delle onde. Dai un'occhiata all'atmosfera che ti aspetta.",

        "home.final.kicker": "Prenota ora",
        "home.final.title": "L'estate non aspetta.\nFatti trovare in prima fila.",
        "home.final.text": "Scrivici su WhatsApp e ricevi conferma immediata. È il modo più rapido per assicurarti il posto migliore.",
        "home.final.cta1": "Prenota ora →",
        "home.final.cta2": "WhatsApp",

        // About
        "about.kicker": "Chi siamo",
        "about.title": "Nello Ocean Beach,\nil tuo pezzo di Mediterraneo.",
        "about.intro": "Siamo uno stabilimento balneare familiare lungo la costa di Magazzeno, a pochi chilometri da Salerno. Tra le scogliere del Tirreno e la vivacità della Campania, offriamo una giornata di mare semplice, curata e autentica.",
        "about.fam.t": "Famiglie",
        "about.fam.d": "Spazi sicuri, file di ombrelloni in piano e personale sempre disponibile per le piccole esigenze.",
        "about.young.t": "Giovani",
        "about.young.d": "Beach bar, musica leggera nelle ore di sole, canoe e sport per le giornate più dinamiche.",
        "about.couples.t": "Coppie",
        "about.couples.d": "Postazioni più appartate, tramonti memorabili, un'atmosfera ideale per due.",
        "about.story.title": "Una struttura nuova,\nun'accoglienza di sempre.",
        "about.story.text": "Quest'anno abbiamo rinfrescato lo stabilimento: nuove tinte beige, marrone e bianco, materiali curati e un layout pensato per ridurre il chiasso e amplificare il relax. Ma lo spirito è lo stesso: ospitalità autentica, attenzione ai dettagli, mare protagonista.",
        "about.cta": "Prenota ora →",

        // Services
        "services.kicker": "Servizi",
        "services.title": "Comfort e mare,\nin perfetto equilibrio.",
        "services.sub": "Ogni dettaglio del Nello Ocean Beach è pensato per farti sentire a casa. Ecco cosa trovi quando arrivi da noi.",
        "services.long.canoe.t": "Noleggio Canoe",
        "services.long.canoe.d": "Canoe singole e doppie disponibili a ore. Ideali per esplorare la costa, prendere il largo e tornare con qualche fotografia in più. Briefing di sicurezza incluso.",
        "services.long.bar.t": "Beach Bar",
        "services.long.bar.d": "Aperitivi, caffetteria, granite, panini, frutta fresca. Servizio al tavolo direttamente sotto l'ombrellone — chiedi al nostro staff.",
        "services.long.showers.t": "Docce Calde e Fredde",
        "services.long.showers.d": "Docce esterne calde e fredde a disposizione di tutti gli ospiti. Pulizia frequente durante la giornata.",
        "services.long.cabins.t": "Bagni & Cabine",
        "services.long.cabins.d": "Servizi igienici curati e cabine private dove cambiarsi senza fretta. Manutenzione costante.",
        "services.long.wifi.t": "Wi-Fi su Richiesta",
        "services.long.wifi.d": "Connessione disponibile su richiesta presso il bancone bar — pensata per chi serve davvero.",
        "services.long.staff.t": "Personale Cordiale",
        "services.long.staff.d": "Il nostro team è qui per accoglierti, consigliarti e rendere la tua giornata di mare più semplice.",

        // Pricing
        "pricing.kicker": "Listino prezzi",
        "pricing.title": "Tariffe chiare,\nnessuna sorpresa.",
        "pricing.sub": "I prezzi indicati sono stagionali. Per pacchetti settimanali o mensili contattaci direttamente su WhatsApp.",
        "pricing.note": "I prezzi visualizzati sono indicativi. Per la stagione in corso, contattaci.",
        "pricing.umb.title": "Ombrelloni & Lettini",
        "pricing.umb.r1": "Prima fila — Giornaliero",
        "pricing.umb.r2": "Seconda fila — Giornaliero",
        "pricing.umb.r3": "Terza fila — Giornaliero",
        "pricing.umb.r4": "Mezza giornata (pomeriggio)",
        "pricing.umb.r5": "Settimanale — su richiesta",
        "pricing.canoe.title": "Noleggio Canoe",
        "pricing.canoe.r1": "Canoa singola — 1 ora",
        "pricing.canoe.r2": "Canoa doppia — 1 ora",
        "pricing.canoe.r3": "Canoa singola — Mezza giornata",
        "pricing.canoe.r4": "Canoa doppia — Mezza giornata",
        "pricing.add.title": "Servizi Aggiuntivi",
        "pricing.add.r1": "Cabina giornaliera",
        "pricing.add.r2": "Wi-Fi su richiesta",
        "pricing.add.r3": "Docce calde / fredde",
        "pricing.add.r2v": "Incluso",
        "pricing.add.r3v": "Incluso",

        // Booking
        "booking.kicker": "Prenotazione",
        "booking.title": "Prenota in 30 secondi.\nRiceverai conferma su WhatsApp.",
        "booking.sub": "Compila il modulo: il messaggio viene precompilato e inviato al nostro WhatsApp Business. Niente attese, niente email perse.",
        "booking.form.name": "Nome e cognome",
        "booking.form.phone": "Telefono",
        "booking.form.date": "Data",
        "booking.form.guests": "Persone",
        "booking.form.service": "Servizio",
        "booking.form.notes": "Note (opzionale)",
        "booking.form.notes.ph": "Preferenze, fila, accessori...",
        "booking.form.svc.umbrella": "Ombrellone + lettini",
        "booking.form.svc.canoe": "Noleggio canoa",
        "booking.form.svc.info": "Informazioni",
        "booking.form.submit": "Invia su WhatsApp",
        "booking.form.success": "Messaggio pronto! Si aprirà WhatsApp con il testo precompilato.",
        "booking.form.error": "Compila i campi obbligatori (nome, telefono, data).",
        "booking.perks.title": "WhatsApp",
        "booking.perks.sub": "La tua prenotazione arriva direttamente nella nostra chat WhatsApp Business, con tutti i dettagli precompilati.",
        "booking.perks.1": "Risposta in tempo reale durante gli orari di apertura",
        "booking.perks.2": "Nessuna registrazione richiesta",
        "booking.perks.3": "Modifica o cancella la prenotazione scrivendo in chat",
        "booking.wa.intro": "Ciao Nello Ocean Beach! Vorrei prenotare:",
        "booking.wa.closing": "Grazie!",

        // Contact
        "contact.kicker": "Contatti",
        "contact.title": "Dove trovarci.",
        "contact.sub": "Sulla costa di Magazzeno, a un passo dal mare.",
        "contact.address": "Indirizzo",
        "contact.hours": "Orari",
        "contact.hours.v": "Tutti i giorni · 08:30 – 19:30 (Giugno – Settembre)",
        "contact.wa": "WhatsApp",
        "contact.email": "Email",
        "contact.directions": "Apri in Google Maps",
        "contact.cta.title": "Scrivici su WhatsApp.",
        "contact.cta.sub": "È il modo più rapido per ricevere una risposta in giornata.",

        // Footer
        "footer.tag": "Lido balneare sulla costa del Tirreno.",
        "footer.pages": "Pagine",
        "footer.contact": "Contatti",
        "footer.rights": "Tutti i diritti riservati.",
        "footer.crafted": "Sito realizzato con cura sulla costa del Tirreno.",
        "sticky.wa": "Prenota WhatsApp"
    },
    en: {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.services": "Services",
        "nav.pricing": "Pricing",
        "nav.booking": "Book",
        "nav.contact": "Contact",
        "nav.cta": "Book on WhatsApp",
        "nav.back": "← MAGAVERSE",

        "home.kicker": "Beach club · Magazzeno, Salerno",
        "home.title": "Your relaxing oasis\non the Tyrrhenian coast.",
        "home.sub": "At Nello Ocean Beach we celebrate summer. Elegant umbrellas, a cozy bar, canoes ready for adventure — the perfect atmosphere for families, friends and couples.",
        "home.cta1": "Book on WhatsApp",
        "home.cta2": "Discover services",
        "home.stat1k": "500m", "home.stat1v": "of golden sand",
        "home.stat2k": "4★", "home.stat2v": "guest rating",
        "home.stat3k": "12h", "home.stat3v": "of sun a day",

        "home.about.kicker": "About us",
        "home.about.title": "A renewed beach\nthat smells of the sea.",
        "home.about.text": "Beige, warm brown, ivory white: Nello Ocean Beach now wears a modern outfit that blends with sand and wood. A carefully designed space for those who seek quality relaxation without losing the authentic charm of the Campanian coast.",
        "home.about.cta": "Read our story →",

        "home.svc.kicker": "Our services",
        "home.svc.title": "Everything you need\nfor a perfect day.",
        "home.svc.cta": "Read more →",

        "svc.umbrella.t": "Umbrellas & Sunbeds",
        "svc.umbrella.d": "Tidy rows, generous shade, padded sunbeds. The quiet beach experience as you imagine it.",
        "svc.canoe.t": "Canoe Rental",
        "svc.canoe.d": "Lightweight paddles, coast views: the best way to enjoy the sea actively.",
        "svc.bar.t": "Beach Bar",
        "svc.bar.d": "Drinks, coffee, slushies and fresh snacks served right under your umbrella.",
        "svc.showers.t": "Hot & Cold Showers",
        "svc.showers.d": "Hot water after a swim, cold under the noon sun. Always clean, always available.",
        "svc.wifi.t": "Wi-Fi on request",
        "svc.wifi.d": "Fast connection for those who really need it, without disturbing the calm.",
        "svc.cabins.t": "Toilets & Changing Cabins",
        "svc.cabins.d": "Clean restrooms and private cabins to change comfortably.",

        "home.gallery.title": "See it with your own eyes",
        "home.gallery.sub": "Sand, aligned umbrellas, the sound of the waves. Have a look at what awaits you.",

        "home.final.kicker": "Book now",
        "home.final.title": "Summer won't wait.\nSecure your front-row spot.",
        "home.final.text": "Message us on WhatsApp and get instant confirmation. The fastest way to get the best place.",
        "home.final.cta1": "Book now →",
        "home.final.cta2": "WhatsApp",

        "about.kicker": "About us",
        "about.title": "Nello Ocean Beach,\nyour slice of Mediterranean.",
        "about.intro": "We are a family-run beach club on the Magazzeno coast, a few kilometres from Salerno. Between Tyrrhenian cliffs and lively Campania, we offer a beach day that's simple, neat and authentic.",
        "about.fam.t": "Families",
        "about.fam.d": "Safe spaces, flat umbrella rows and staff always available for the little needs.",
        "about.young.t": "Friends",
        "about.young.d": "Beach bar, light music in the sunny hours, canoes and sports for active days.",
        "about.couples.t": "Couples",
        "about.couples.d": "More secluded spots, unforgettable sunsets, the perfect atmosphere for two.",
        "about.story.title": "A new venue,\nthe hospitality of always.",
        "about.story.text": "This year we refreshed the venue: new beige, brown and white tones, refined materials and a layout designed to reduce noise and amplify relaxation. But the spirit is the same: genuine hospitality, attention to detail, the sea as the star.",
        "about.cta": "Book now →",

        "services.kicker": "Services",
        "services.title": "Comfort and sea,\nperfectly balanced.",
        "services.sub": "Every detail at Nello Ocean Beach is designed to make you feel at home. Here's what awaits you.",
        "services.long.canoe.t": "Canoe Rental",
        "services.long.canoe.d": "Single and double canoes available by the hour. Perfect to explore the coast and take home extra memories. Safety briefing included.",
        "services.long.bar.t": "Beach Bar",
        "services.long.bar.d": "Drinks, coffee, slushies, sandwiches, fresh fruit. Table service directly under your umbrella — just ask our team.",
        "services.long.showers.t": "Hot & Cold Showers",
        "services.long.showers.d": "Outdoor hot and cold showers available to all guests. Cleaned regularly throughout the day.",
        "services.long.cabins.t": "Toilets & Cabins",
        "services.long.cabins.d": "Well-kept restrooms and private cabins to change unhurried. Constant maintenance.",
        "services.long.wifi.t": "Wi-Fi on Request",
        "services.long.wifi.d": "Connection available on request at the bar — designed for those who actually need it.",
        "services.long.staff.t": "Friendly Staff",
        "services.long.staff.d": "Our team is here to welcome you, advise you and make your beach day easier.",

        "pricing.kicker": "Pricing",
        "pricing.title": "Clear rates,\nno surprises.",
        "pricing.sub": "Prices are seasonal. For weekly or monthly packages, message us directly on WhatsApp.",
        "pricing.note": "Prices shown are indicative. For the current season, please contact us.",
        "pricing.umb.title": "Umbrellas & Sunbeds",
        "pricing.umb.r1": "First row — Daily",
        "pricing.umb.r2": "Second row — Daily",
        "pricing.umb.r3": "Third row — Daily",
        "pricing.umb.r4": "Half day (afternoon)",
        "pricing.umb.r5": "Weekly — on request",
        "pricing.canoe.title": "Canoe Rental",
        "pricing.canoe.r1": "Single canoe — 1 hour",
        "pricing.canoe.r2": "Double canoe — 1 hour",
        "pricing.canoe.r3": "Single canoe — Half day",
        "pricing.canoe.r4": "Double canoe — Half day",
        "pricing.add.title": "Add-on Services",
        "pricing.add.r1": "Daily cabin",
        "pricing.add.r2": "Wi-Fi on request",
        "pricing.add.r3": "Hot / cold showers",
        "pricing.add.r2v": "Included",
        "pricing.add.r3v": "Included",

        "booking.kicker": "Booking",
        "booking.title": "Book in 30 seconds.\nWe'll confirm on WhatsApp.",
        "booking.sub": "Fill in the form: the message is pre-filled and sent to our WhatsApp Business. No waiting, no missed emails.",
        "booking.form.name": "Full name",
        "booking.form.phone": "Phone",
        "booking.form.date": "Date",
        "booking.form.guests": "Guests",
        "booking.form.service": "Service",
        "booking.form.notes": "Notes (optional)",
        "booking.form.notes.ph": "Preferences, row, accessories...",
        "booking.form.svc.umbrella": "Umbrella + sunbeds",
        "booking.form.svc.canoe": "Canoe rental",
        "booking.form.svc.info": "Information",
        "booking.form.submit": "Send via WhatsApp",
        "booking.form.success": "Message ready! WhatsApp will open with the pre-filled text.",
        "booking.form.error": "Please fill in name, phone and date.",
        "booking.perks.title": "WhatsApp",
        "booking.perks.sub": "Your booking arrives directly in our WhatsApp Business chat, with all details pre-filled.",
        "booking.perks.1": "Real-time reply during opening hours",
        "booking.perks.2": "No registration required",
        "booking.perks.3": "Edit or cancel by replying in chat",
        "booking.wa.intro": "Hello Nello Ocean Beach! I would like to book:",
        "booking.wa.closing": "Thank you!",

        "contact.kicker": "Contact",
        "contact.title": "Where to find us.",
        "contact.sub": "On the Magazzeno coast, just steps from the sea.",
        "contact.address": "Address",
        "contact.hours": "Opening hours",
        "contact.hours.v": "Every day · 08:30 – 19:30 (June – September)",
        "contact.wa": "WhatsApp",
        "contact.email": "Email",
        "contact.directions": "Open in Google Maps",
        "contact.cta.title": "Message us on WhatsApp.",
        "contact.cta.sub": "It's the fastest way to get a same-day reply.",

        "footer.tag": "Beach club on the Tyrrhenian coast.",
        "footer.pages": "Pages",
        "footer.contact": "Contact",
        "footer.rights": "All rights reserved.",
        "footer.crafted": "Crafted with care on the Tyrrhenian coast.",
        "sticky.wa": "Book WhatsApp"
    }
};

// ---------- LANG STATE ----------
let currentLang = localStorage.getItem("nob_lang") || "it";

function setLang(lang) {
    if (lang !== "it" && lang !== "en") lang = "it";
    currentLang = lang;
    localStorage.setItem("nob_lang", lang);
    document.documentElement.lang = lang;
    applyTranslations();
    updateLangToggle();
}

function applyTranslations() {
    const dict = i18n[currentLang] || i18n.it;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });
}

function updateLangToggle() {
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
        if (btn.dataset.lang === currentLang) btn.classList.add("active");
        else btn.classList.remove("active");
    });
}

// ---------- NAVBAR ----------
function setupNav() {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const onScroll = () => {
        if (window.scrollY > 16) nav.classList.add("scrolled");
        else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Mobile menu toggle
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
        toggle.addEventListener("click", () => menu.classList.toggle("open"));
    }

    // Highlight active link
    const page = document.body.dataset.page || "";
    document.querySelectorAll("[data-nav]").forEach((a) => {
        if (a.dataset.nav === page) a.classList.add("active");
    });
}

function setupLangButtons() {
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
        btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
}

// ---------- BOOKING FORM ----------
function setupBookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;

    // Service picker visual state
    const picks = form.querySelectorAll(".service-pick label");
    form.querySelectorAll(".service-pick input").forEach((input) => {
        input.addEventListener("change", () => {
            picks.forEach((p) => p.classList.remove("active"));
            input.closest("label").classList.add("active");
        });
    });
    // initial active
    const checked = form.querySelector(".service-pick input:checked");
    if (checked) checked.closest("label").classList.add("active");

    // Min date = today
    const dateInput = form.querySelector('[name="date"]');
    if (dateInput) {
        const today = new Date().toISOString().slice(0, 10);
        dateInput.min = today;
        if (!dateInput.value) dateInput.value = today;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const dict = i18n[currentLang] || i18n.it;
        const fd = new FormData(form);
        const data = {
            name: (fd.get("name") || "").trim(),
            phone: (fd.get("phone") || "").trim(),
            date: fd.get("date") || "",
            guests: fd.get("guests") || "1",
            service: fd.get("service") || "umbrella",
            notes: (fd.get("notes") || "").trim()
        };

        if (!data.name || !data.phone || !data.date) {
            alert(dict["booking.form.error"]);
            return;
        }

        const svcLabel = dict["booking.form.svc." + data.service] || data.service;
        const lines = [
            dict["booking.wa.intro"],
            "",
            "• " + dict["booking.form.name"] + ": " + data.name,
            "• " + dict["booking.form.phone"] + ": " + data.phone,
            "• " + dict["booking.form.date"] + ": " + data.date,
            "• " + dict["booking.form.guests"] + ": " + data.guests,
            "• " + dict["booking.form.service"] + ": " + svcLabel
        ];
        if (data.notes) lines.push("• " + dict["booking.form.notes"] + ": " + data.notes);
        lines.push("", dict["booking.wa.closing"]);

        const text = encodeURIComponent(lines.join("\n"));
        const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

        const success = document.querySelector(".success");
        if (success) success.classList.add("show");

        window.open(url, "_blank", "noopener,noreferrer");
    });
}

// ---------- QUICK WHATSAPP LINKS ----------
function setupWhatsappLinks() {
    document.querySelectorAll("[data-wa-quick]").forEach((el) => {
        const text = encodeURIComponent(
            currentLang === "en"
                ? "Hello Nello Ocean Beach! I'd like some information."
                : "Ciao Nello Ocean Beach! Vorrei alcune informazioni."
        );
        el.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
    });
}

// ---------- FOOTER YEAR ----------
function setupYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", () => {
    setLang(currentLang);
    setupNav();
    setupLangButtons();
    setupBookingForm();
    setupYear();
    // re-bind whatsapp quick links when lang changes
    setupWhatsappLinks();
    document.addEventListener("click", (e) => {
        if (e.target.closest(".lang-toggle button")) {
            setTimeout(setupWhatsappLinks, 50);
        }
    });
});
