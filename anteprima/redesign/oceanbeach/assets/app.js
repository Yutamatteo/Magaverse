/* =========================================================
   NELLO OCEAN BEACH — UI logic (solo italiano)
   ========================================================= */

const WHATSAPP_NUMBER = "393454237269"; // +39 345 423 7269

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

    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
        toggle.addEventListener("click", () => menu.classList.toggle("open"));
    }

    const page = document.body.dataset.page || "";
    document.querySelectorAll("[data-nav]").forEach((a) => {
        if (a.dataset.nav === page) a.classList.add("active");
    });
}

// ---------- BOOKING FORM ----------
function setupBookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;

    const picks = form.querySelectorAll(".service-pick label");
    form.querySelectorAll(".service-pick input").forEach((input) => {
        input.addEventListener("change", () => {
            picks.forEach((p) => p.classList.remove("active"));
            input.closest("label").classList.add("active");
        });
    });
    const checked = form.querySelector(".service-pick input:checked");
    if (checked) checked.closest("label").classList.add("active");

    const dateInput = form.querySelector('[name="date"]');
    if (dateInput) {
        const today = new Date().toISOString().slice(0, 10);
        dateInput.min = today;
        if (!dateInput.value) dateInput.value = today;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
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
            alert("Compila i campi obbligatori (nome, telefono, data).");
            return;
        }

        const svcLabels = {
            umbrella: "Ombrellone + lettini",
            canoe: "Noleggio canoa",
            info: "Informazioni"
        };
        const svcLabel = svcLabels[data.service] || data.service;

        const lines = [
            "Ciao Nello Ocean Beach! Vorrei prenotare:",
            "",
            "• Nome: " + data.name,
            "• Telefono: " + data.phone,
            "• Data: " + data.date,
            "• Persone: " + data.guests,
            "• Servizio: " + svcLabel
        ];
        if (data.notes) lines.push("• Note: " + data.notes);
        lines.push("", "Grazie!");

        const text = encodeURIComponent(lines.join("\n"));
        const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;

        const success = document.querySelector(".success");
        if (success) success.classList.add("show");

        window.open(url, "_blank", "noopener,noreferrer");
    });
}

// ---------- WHATSAPP LINKS ----------
function setupWhatsappLinks() {
    const text = encodeURIComponent("Ciao Nello Ocean Beach! Vorrei alcune informazioni.");
    document.querySelectorAll("[data-wa-quick]").forEach((el) => {
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
    setupNav();
    setupBookingForm();
    setupWhatsappLinks();
    setupYear();
});
