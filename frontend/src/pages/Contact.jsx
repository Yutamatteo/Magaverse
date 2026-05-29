import React from "react";
import { MapPin, Clock, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { BUSINESS, WHATSAPP_NUMBER } from "../lib/constants";
import { quickWhatsappUrl } from "../lib/whatsapp";

export default function Contact() {
  const { t, lang } = useLang();

  const items = [
    {
      icon: MapPin,
      label: t.contact.addressLabel,
      value: BUSINESS.address,
      action: {
        href: BUSINESS.maps,
        label: t.contact.directions,
        external: true,
      },
      testid: "contact-address",
    },
    {
      icon: Clock,
      label: t.contact.hoursLabel,
      value: lang === "it" ? BUSINESS.hours.it : BUSINESS.hours.en,
      testid: "contact-hours",
    },
    {
      icon: MessageCircle,
      label: t.contact.whatsappLabel,
      value: "WhatsApp Business",
      action: { href: quickWhatsappUrl(lang), label: "WhatsApp", external: true },
      testid: "contact-whatsapp",
    },
    {
      icon: Mail,
      label: t.contact.emailLabel,
      value: BUSINESS.email,
      action: { href: `mailto:${BUSINESS.email}`, label: "Email", external: false },
      testid: "contact-email",
    },
  ];

  return (
    <div data-testid="contact-page">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.contact.kicker}</span>
        <h1 className="mt-3 font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
          {t.contact.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">{t.contact.subtitle}</p>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <div
                key={i}
                data-testid={it.testid}
                className="rounded-3xl bg-white border border-border p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</div>
                    <div className="mt-1 text-foreground break-words">{it.value}</div>
                    {it.action && (
                      <a
                        href={it.action.href}
                        target={it.action.external ? "_blank" : undefined}
                        rel={it.action.external ? "noreferrer noopener" : undefined}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:gap-2 transition-all"
                      >
                        {it.action.label} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-border min-h-[480px]">
          <iframe
            data-testid="contact-map"
            title="Nello Ocean Beach map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.address)}&output=embed`}
            width="100%"
            height="100%"
            style={{ minHeight: 480, border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="font-serif-display text-2xl sm:text-4xl">
              {lang === "it" ? "Scrivici su WhatsApp." : "Message us on WhatsApp."}
            </h2>
            <p className="mt-2 text-primary-foreground/85 max-w-lg">
              {lang === "it"
                ? "È il modo più rapido per ricevere una risposta in giornata."
                : "It's the fastest way to get a same-day reply."}
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="contact-cta-whatsapp"
            className="inline-flex items-center gap-2 rounded-full bg-white text-foreground px-6 py-3.5 font-medium hover:-translate-y-0.5 transition-all"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
