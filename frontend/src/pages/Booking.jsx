import React, { useState } from "react";
import axios from "axios";
import { CheckCircle2, Send, Umbrella, Waves, Info as InfoIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useLang } from "../contexts/LanguageContext";
import { buildWhatsappUrl } from "../lib/whatsapp";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_OPTIONS = [
  { key: "umbrella", icon: Umbrella },
  { key: "canoe", icon: Waves },
  { key: "info", icon: InfoIcon },
];

export default function Booking() {
  const { t, lang } = useLang();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: today,
    guests: 2,
    service: "umbrella",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.date) {
      toast.error(t.booking.form.errorTitle);
      return;
    }
    setSubmitting(true);

    // 1. Save lead to backend (best effort)
    try {
      await axios.post(`${API}/bookings`, { ...form, language: lang });
    } catch (err) {
      // Non-blocking - still open WhatsApp
      console.warn("Failed to save booking:", err?.message);
    }

    // 2. Open WhatsApp with prefilled message
    const url = buildWhatsappUrl(form, lang);
    setDone(true);
    toast.success(t.booking.form.successTitle, { description: t.booking.form.successDesc });

    // Slight delay so toast renders, then open
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setSubmitting(false);
    }, 300);
  };

  return (
    <div data-testid="booking-page">
      <Toaster position="top-center" richColors />
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.booking.kicker}</span>
        <h1 className="mt-3 font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl whitespace-pre-line">
          {t.booking.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">{t.booking.subtitle}</p>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* FORM */}
        <form
          onSubmit={onSubmit}
          data-testid="booking-form"
          className="lg:col-span-3 rounded-3xl bg-white border border-border p-6 sm:p-10 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t.booking.form.name} htmlFor="name">
              <input
                id="name"
                type="text"
                required
                data-testid="booking-name-input"
                placeholder={t.booking.form.namePh}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </Field>
            <Field label={t.booking.form.phone} htmlFor="phone">
              <input
                id="phone"
                type="tel"
                required
                data-testid="booking-phone-input"
                placeholder={t.booking.form.phonePh}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t.booking.form.date} htmlFor="date">
              <input
                id="date"
                type="date"
                required
                data-testid="booking-date-input"
                min={today}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </Field>
            <Field label={t.booking.form.guests} htmlFor="guests">
              <input
                id="guests"
                type="number"
                min={1}
                max={50}
                required
                data-testid="booking-guests-input"
                value={form.guests}
                onChange={(e) => update("guests", parseInt(e.target.value || "1", 10))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </Field>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.booking.form.service}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SERVICE_OPTIONS.map(({ key, icon: Icon }) => {
                const active = form.service === key;
                return (
                  <button
                    key={key}
                    type="button"
                    data-testid={`booking-service-${key}`}
                    onClick={() => update("service", key)}
                    className={`text-left rounded-xl border px-4 py-4 transition-all ${
                      active
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-white hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>
                      {t.booking.form.services[key]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Field label={t.booking.form.notes} htmlFor="notes">
            <textarea
              id="notes"
              rows={3}
              data-testid="booking-notes-input"
              placeholder={t.booking.form.notesPh}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            data-testid="booking-submit-btn"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-4 font-medium hover:bg-[hsl(var(--primary)/0.92)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
          >
            {submitting ? (
              <>{t.booking.form.sending}</>
            ) : (
              <>
                <Send className="w-4 h-4" /> {t.booking.form.submit}
              </>
            )}
          </button>

          {done && (
            <div
              data-testid="booking-success"
              className="rounded-xl bg-[hsl(var(--muted))] border border-border p-4 flex items-start gap-3 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{t.booking.form.successTitle}</p>
                <p className="text-muted-foreground">{t.booking.form.successDesc}</p>
              </div>
            </div>
          )}
        </form>

        {/* PERKS SIDEBAR */}
        <aside className="lg:col-span-2 rounded-3xl bg-[hsl(var(--muted))] border border-border p-7 sm:p-9">
          <h3 className="font-serif-display text-2xl">WhatsApp</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            {lang === "it"
              ? "La tua prenotazione arriva direttamente nella nostra chat WhatsApp Business, con tutti i dettagli precompilati."
              : "Your booking arrives directly in our WhatsApp Business chat, with all details pre-filled."}
          </p>
          <ul className="mt-6 space-y-3">
            {t.booking.perks.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="text-foreground/85">{p}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
