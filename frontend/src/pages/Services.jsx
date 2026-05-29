import React from "react";
import { Link } from "react-router-dom";
import { Waves, Coffee, Droplets, DoorOpen, Wifi, HandHeart, ArrowRight } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

const CANOES_IMG = "https://images.unsplash.com/photo-1617083001984-9bced23d3086?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxjYW5vZSUyMGtheWFrJTIwYmVhY2h8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";
const BAR_IMG = "https://images.pexels.com/photos/30344044/pexels-photo-30344044.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const icons = [Waves, Coffee, Droplets, DoorOpen, Wifi, HandHeart];

export default function Services() {
  const { t } = useLang();
  return (
    <div data-testid="services-page">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.services.kicker}</span>
        <h1 className="mt-3 font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl whitespace-pre-line">
          {t.services.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">{t.services.subtitle}</p>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        <div className="md:col-span-7 rounded-3xl overflow-hidden border border-border relative min-h-[300px]">
          <img src={CANOES_IMG} alt="Canoes" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="md:col-span-5 rounded-3xl overflow-hidden border border-border relative min-h-[300px]">
          <img src={BAR_IMG} alt="Beach bar" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.services.list.map((s, i) => {
            const Icon = icons[i] || HandHeart;
            return (
              <div
                key={i}
                data-testid={`service-card-${i}`}
                className="rounded-3xl bg-white border border-border p-7 hover:-translate-y-1 transition-transform"
              >
                <Icon className="w-8 h-8 text-primary" />
                <h3 className="mt-4 font-serif-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/booking"
            data-testid="services-cta"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium hover:-translate-y-0.5 transition-all"
          >
            {t.misc.bookNow} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
