import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Waves } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLang } from "../contexts/LanguageContext";
import { quickWhatsappUrl } from "../lib/whatsapp";

const links = (t) => [
  { to: "/", label: t.nav.home, key: "home" },
  { to: "/about", label: t.nav.about, key: "about" },
  { to: "/services", label: t.nav.services, key: "services" },
  { to: "/pricing", label: t.nav.pricing, key: "pricing" },
  { to: "/booking", label: t.nav.booking, key: "booking" },
  { to: "/contact", label: t.nav.contact, key: "contact" },
];

export default function Navbar() {
  const { t, lang } = useLang();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link
          to="/"
          data-testid="logo-link"
          className="flex items-center gap-2 group"
        >
          <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Waves className="w-4 h-4" />
          </span>
          <span className="font-serif-display text-lg sm:text-xl font-semibold text-foreground tracking-tight">
            Nello <span className="text-primary">Ocean</span> Beach
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links(t).map((l) => (
            <NavLink
              key={l.key}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-${l.key}`}
              className={({ isActive }) =>
                `px-3 py-2 rounded-full text-sm transition-colors ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-foreground/80 hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle />
          <a
            href={quickWhatsappUrl(lang)}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="nav-whatsapp-cta"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground text-sm font-medium shadow-sm hover:bg-[hsl(var(--primary)/0.92)] hover:-translate-y-0.5 transition-all"
          >
            {t.nav.bookCta}
          </a>
        </div>

        <button
          type="button"
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-white/80 backdrop-blur"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div
          data-testid="mobile-menu"
          className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-border"
        >
          <div className="px-5 py-4 flex flex-col gap-1">
            {links(t).map((l) => (
              <NavLink
                key={l.key}
                to={l.to}
                end={l.to === "/"}
                data-testid={`mobile-nav-${l.key}`}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-xl text-base ${
                    isActive
                      ? "bg-muted text-primary font-medium"
                      : "text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <LanguageToggle compact />
              <a
                href={quickWhatsappUrl(lang)}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="mobile-nav-whatsapp-cta"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground text-sm font-medium"
              >
                {t.nav.bookCta}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
