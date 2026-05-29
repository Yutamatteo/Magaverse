import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Umbrella, Waves, Coffee, Droplets, Wifi, DoorOpen, MapPin, ChevronRight } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { quickWhatsappUrl } from "../lib/whatsapp";

const HERO_IMG = "https://images.unsplash.com/photo-1723380775952-28ea1a7a330a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxpdGFsaWFuJTIwYmVhY2glMjB1bWJyZWxsYXMlMjBBbWFsZml8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";
const CANOES_IMG = "https://images.unsplash.com/photo-1617083001984-9bced23d3086?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxjYW5vZSUyMGtheWFrJTIwYmVhY2h8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";
const BAR_IMG = "https://images.pexels.com/photos/30344044/pexels-photo-30344044.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const GALLERY_1 = "https://images.unsplash.com/photo-1534250617995-d16425086b91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwYmVhY2glMjB1bWJyZWxsYXMlMjBBbWFsZml8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";
const GALLERY_2 = "https://images.pexels.com/photos/13738205/pexels-photo-13738205.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const icons = [Umbrella, Waves, Coffee, Droplets, Wifi, DoorOpen];

export default function Home() {
  const { t, lang } = useLang();

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Nello Ocean Beach hero"
            className="w-full h-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/70 via-[#3E2723]/30 to-[#3E2723]/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24 w-full">
          <div className="max-w-3xl animate-fade-up">
            <span
              data-testid="hero-kicker"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white/90 text-xs uppercase tracking-[0.18em] border border-white/20"
            >
              <MapPin className="w-3 h-3" /> {t.home.kicker}
            </span>
            <h1
              data-testid="hero-title"
              className="mt-6 font-serif-display font-semibold text-white text-4xl sm:text-5xl lg:text-7xl leading-[1.05] whitespace-pre-line"
            >
              {t.home.title}
            </h1>
            <p className="mt-6 text-white/85 text-base sm:text-lg max-w-xl leading-relaxed">
              {t.home.subtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/oceanbeach/booking"
                data-testid="hero-cta-primary"
                className="inline-flex items-center gap-2 rounded-full bg-white text-foreground px-6 py-3.5 font-medium shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {t.home.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/oceanbeach/services"
                data-testid="hero-cta-secondary"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white px-6 py-3.5 font-medium backdrop-blur border border-white/25"
              >
                {t.home.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl">
            {t.home.stats.map((s, i) => (
              <div
                key={i}
                data-testid={`hero-stat-${i}`}
                className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3 text-white"
              >
                <div className="font-serif-display text-2xl sm:text-3xl">{s.k}</div>
                <div className="text-xs sm:text-sm text-white/80">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TEASER */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden border border-border">
              <img
                src={GALLERY_1}
                alt="Italian beach umbrellas"
                className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-[1500ms]"
              />
            </div>
            <div className="hidden lg:block absolute -bottom-6 -right-6 w-44 h-44 rounded-2xl overflow-hidden border-8 border-background shadow-lg">
              <img src={GALLERY_2} alt="" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-10">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.about.kicker}</span>
            <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-tight whitespace-pre-line">
              {t.home.aboutTitle}
            </h2>
            <p className="mt-5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
              {t.home.aboutText}
            </p>
            <Link
              to="/oceanbeach/about"
              data-testid="home-about-cta"
              className="mt-7 inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              {t.home.aboutCta} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES BENTO */}
      <section className="bg-[hsl(var(--muted))] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.home.servicesKicker}</span>
              <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-tight whitespace-pre-line">
                {t.home.servicesTitle}
              </h2>
            </div>
            <Link
              to="/oceanbeach/services"
              data-testid="home-services-cta"
              className="inline-flex items-center gap-2 text-primary font-medium self-start lg:self-end"
            >
              {t.misc.readMore} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            {/* Large image card */}
            <div className="md:col-span-7 row-span-2 rounded-3xl overflow-hidden border border-border bg-white relative min-h-[320px]">
              <img src={CANOES_IMG} alt="Canoe" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-[1500ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/85 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <Waves className="w-6 h-6 mb-3" />
                <h3 className="font-serif-display text-2xl">{t.home.services[1].title}</h3>
                <p className="mt-1.5 text-sm text-white/85 max-w-md">{t.home.services[1].desc}</p>
              </div>
            </div>

            {/* Right small cards */}
            {[0, 2].map((idx) => {
              const Icon = icons[idx];
              return (
                <div
                  key={idx}
                  data-testid={`home-service-card-${idx}`}
                  className="md:col-span-5 rounded-3xl bg-white border border-border p-6 sm:p-7 hover:-translate-y-1 transition-transform"
                >
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-serif-display text-xl">{t.home.services[idx].title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.home.services[idx].desc}</p>
                </div>
              );
            })}

            {/* Bottom row: 3 cards */}
            {[3, 4, 5].map((idx) => {
              const Icon = icons[idx];
              return (
                <div
                  key={idx}
                  data-testid={`home-service-card-${idx}`}
                  className="md:col-span-4 rounded-3xl bg-white border border-border p-6 hover:-translate-y-1 transition-transform"
                >
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-serif-display text-lg">{t.home.services[idx].title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.home.services[idx].desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl">{t.home.gallery}</h2>
          <p className="mt-4 text-muted-foreground">{t.home.gallerySub}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[HERO_IMG, BAR_IMG, GALLERY_2, GALLERY_1].map((src, i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden border border-border ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : ""}`}
              data-testid={`home-gallery-${i}`}
            >
              <img src={src} alt={`gallery ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-[1200ms] min-h-[180px]" />
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-primary-foreground">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-[0.2em] opacity-80">{t.home.finalKicker}</span>
            <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl lg:text-6xl leading-tight whitespace-pre-line">
              {t.home.finalTitle}
            </h2>
            <p className="mt-5 text-primary-foreground/85 text-base sm:text-lg max-w-xl leading-relaxed">
              {t.home.finalText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/oceanbeach/booking"
                data-testid="home-final-cta-booking"
                className="inline-flex items-center gap-2 rounded-full bg-white text-foreground px-6 py-3.5 font-medium hover:-translate-y-0.5 transition-all"
              >
                {t.misc.bookNow} <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={quickWhatsappUrl(lang)}
                target="_blank"
                rel="noreferrer noopener"
                data-testid="home-final-cta-whatsapp"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 font-medium hover:bg-white/10"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
