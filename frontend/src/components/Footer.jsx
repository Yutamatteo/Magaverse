import React from "react";
import { Link } from "react-router-dom";
import { Waves, MapPin, Mail, Phone } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { BUSINESS, WHATSAPP_NUMBER } from "../lib/constants";

export default function Footer() {
  const { t, lang } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer
      data-testid="site-footer"
      className="bg-[hsl(var(--muted))] border-t border-border mt-24"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </span>
            <span className="font-serif-display text-xl font-semibold">
              Nello Ocean Beach
            </span>
          </Link>
          <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
            {t.footer.tagline}
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80 mb-4">
            {t.footer.pages}
          </h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link data-testid="footer-link-home" to="/" className="hover:text-primary">{t.nav.home}</Link></li>
            <li><Link data-testid="footer-link-about" to="/about" className="hover:text-primary">{t.nav.about}</Link></li>
            <li><Link data-testid="footer-link-services" to="/services" className="hover:text-primary">{t.nav.services}</Link></li>
            <li><Link data-testid="footer-link-pricing" to="/pricing" className="hover:text-primary">{t.nav.pricing}</Link></li>
            <li><Link data-testid="footer-link-booking" to="/booking" className="hover:text-primary">{t.nav.booking}</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/80 mb-4">
            {t.footer.contact}
          </h4>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <MapPin className="w-4 h-4 mt-1 text-primary shrink-0" />
              <a
                href={BUSINESS.maps}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="footer-address"
                className="hover:text-primary"
              >
                {BUSINESS.address}
              </a>
            </li>
            <li className="flex gap-3">
              <Phone className="w-4 h-4 mt-1 text-primary shrink-0" />
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="footer-whatsapp"
                className="hover:text-primary"
              >
                WhatsApp Business
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="w-4 h-4 mt-1 text-primary shrink-0" />
              <a
                href={`mailto:${BUSINESS.email}`}
                data-testid="footer-email"
                className="hover:text-primary"
              >
                {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>© {year} Nello Ocean Beach · {t.footer.rights}</span>
          <span className="opacity-75">
            {lang === "it"
              ? "Sito realizzato con cura sulla costa del Tirreno."
              : "Crafted with care on the Tyrrhenian coast."}
          </span>
        </div>
      </div>
    </footer>
  );
}
