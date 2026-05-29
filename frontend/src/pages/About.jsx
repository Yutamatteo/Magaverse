import React from "react";
import { Link } from "react-router-dom";
import { Users, Heart, Sparkles, ArrowRight } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

const GALLERY_1 = "https://images.unsplash.com/photo-1534250617995-d16425086b91?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwYmVhY2glMjB1bWJyZWxsYXMlMjBBbWFsZml8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";
const GALLERY_2 = "https://images.pexels.com/photos/13738205/pexels-photo-13738205.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const HERO_IMG = "https://images.unsplash.com/photo-1723380775952-28ea1a7a330a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxpdGFsaWFuJTIwYmVhY2glMjB1bWJyZWxsYXMlMjBBbWFsZml8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";

const icons = [Users, Sparkles, Heart];

export default function About() {
  const { t } = useLang();
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.about.kicker}</span>
        <h1 className="mt-3 font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl whitespace-pre-line">
          {t.about.title}
        </h1>
        <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">{t.about.intro}</p>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
        <div className="md:col-span-2 rounded-3xl overflow-hidden border border-border">
          <img src={HERO_IMG} alt="Nello Ocean Beach" className="w-full h-[460px] object-cover" />
        </div>
        <div className="grid gap-3 sm:gap-5">
          <div className="rounded-3xl overflow-hidden border border-border">
            <img src={GALLERY_1} alt="" className="w-full h-[220px] object-cover" />
          </div>
          <div className="rounded-3xl overflow-hidden border border-border">
            <img src={GALLERY_2} alt="" className="w-full h-[220px] object-cover" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.about.values.map((v, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                data-testid={`about-value-${i}`}
                className="rounded-3xl bg-white border border-border p-7 hover:-translate-y-1 transition-transform"
              >
                <Icon className="w-7 h-7 text-primary" />
                <h3 className="mt-4 font-serif-display text-2xl">{v.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[hsl(var(--muted))] py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl leading-tight whitespace-pre-line">
            {t.about.storyTitle}
          </h2>
          <p className="mt-6 text-muted-foreground text-base sm:text-lg leading-relaxed">{t.about.storyText}</p>
          <Link
            to="/booking"
            data-testid="about-cta"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium hover:-translate-y-0.5 transition-all"
          >
            {t.misc.bookNow} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
