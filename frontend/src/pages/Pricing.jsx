import React from "react";
import { Link } from "react-router-dom";
import { Info, ArrowRight } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

export default function Pricing() {
  const { t } = useLang();
  return (
    <div data-testid="pricing-page">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-primary">{t.pricing.kicker}</span>
        <h1 className="mt-3 font-serif-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] max-w-3xl whitespace-pre-line">
          {t.pricing.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-base sm:text-lg max-w-2xl leading-relaxed">
          {t.pricing.subtitle}
        </p>

        <div className="mt-6 inline-flex items-start gap-2 rounded-2xl bg-[hsl(var(--muted))] border border-border px-4 py-3 text-sm text-muted-foreground max-w-xl">
          <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
          <span>{t.pricing.note}</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.pricing.categories.map((cat, i) => (
            <div
              key={i}
              data-testid={`pricing-category-${i}`}
              className="rounded-3xl bg-white border border-border p-7 flex flex-col"
            >
              <h3 className="font-serif-display text-2xl text-foreground">{cat.title}</h3>
              <ul className="mt-5 divide-y divide-border">
                {cat.rows.map((row, j) => (
                  <li
                    key={j}
                    data-testid={`pricing-row-${i}-${j}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="text-sm text-foreground/85">{row.label}</span>
                    <span className="text-sm font-medium text-primary tabular-nums">{row.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h3 className="font-serif-display text-2xl sm:text-3xl">
              {t.misc.bookNow}
            </h3>
            <p className="mt-2 text-primary-foreground/85 max-w-md">
              {t.pricing.subtitle}
            </p>
          </div>
          <Link
            to="/booking"
            data-testid="pricing-cta"
            className="inline-flex items-center gap-2 rounded-full bg-white text-foreground px-6 py-3.5 font-medium hover:-translate-y-0.5 transition-all"
          >
            {t.misc.bookNow} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
