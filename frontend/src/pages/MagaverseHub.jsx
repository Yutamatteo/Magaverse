import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles, Moon, Sun, Waves } from "lucide-react";

const HERO_NELLO = "https://images.unsplash.com/photo-1723380775952-28ea1a7a330a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxpdGFsaWFuJTIwYmVhY2glMjB1bWJyZWxsYXMlMjBBbWFsZml8ZW58MHx8fHwxNzgwMDY2MTMwfDA&ixlib=rb-4.1.0&q=85";

export default function MagaverseHub() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="magaverse-hub" data-testid="magaverse-hub">
      {/* Cosmic background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="magaverse-stars" />
        <div className="magaverse-stars-2" />
        <div className="magaverse-stars-3" />
        <div className="magaverse-glow-orange animate-float-slow" style={{ top: "-15%", left: "-10%" }} />
        <div className="magaverse-glow-teal animate-float-slow" style={{ bottom: "-20%", right: "-15%", animationDelay: "3s" }} />
        <div className="magaverse-glow-purple animate-float-slow" style={{ top: "40%", left: "50%", animationDelay: "6s" }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B1A] via-[#FFD54F] to-[#2ABFB0] blur-md opacity-60" />
            <div className="relative w-9 h-9 rounded-full bg-[#0a0a18] border border-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">MAGAVERSE</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-white/50 uppercase tracking-[0.2em] font-mono">
          <span>Magazzeno · SA</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span data-testid="hub-clock">
            {time.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-20 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur text-xs uppercase tracking-[0.2em] text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ABFB0] animate-pulse" />
          Network di esperienze · Salerno
        </div>

        <h1
          data-testid="magaverse-title"
          className="mt-7 font-display font-bold text-[15vw] sm:text-[12vw] lg:text-[10vw] leading-[0.9] tracking-tighter"
        >
          <span className="block">Esplora il</span>
          <span className="block bg-gradient-to-r from-[#FF6B1A] via-[#FFD54F] to-[#2ABFB0] bg-clip-text text-transparent">
            Magaverse.
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-base sm:text-lg text-white/70 leading-relaxed">
          Un solo brand, infiniti mondi. Spiagge, party, esperienze sotto il sole della
          Costa del Tirreno. Scegli dove portarti questa estate.
        </p>
      </section>

      {/* Cards */}
      <section className="relative z-10 px-6 sm:px-10 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Nello Ocean Beach */}
          <ProjectCard
            href="/oceanbeach"
            internal
            testId="hub-card-nello"
            colSpan="md:col-span-7"
            label="Stabilimento balneare"
            title="Nello Ocean Beach"
            subtitle="L'oasi di relax sulla costa del Tirreno"
            color="#FAF7F2"
            tint="rgba(139,90,43,0.35)"
            image={HERO_NELLO}
            icon={Sun}
            tags={["Ombrelloni", "Canoe", "Bar", "Famiglie"]}
          />

          {/* Magaparty */}
          <ProjectCard
            href="/magaparty/index.html"
            external
            testId="hub-card-magaparty"
            colSpan="md:col-span-5"
            label="Evento · Sunset Party"
            title="MAGA Republic"
            subtitle="Un tramonto dedicato alla musica · 2 Giugno 2026"
            color="#FFD54F"
            tint="rgba(255,107,26,0.45)"
            image={null}
            icon={Moon}
            tags={["Lineup DJ", "Cocktail", "Sunset"]}
            gradient="linear-gradient(135deg, #FF6B1A 0%, #FFA726 40%, #FFD54F 100%)"
          />

          {/* Coming soon */}
          <ComingSoonCard
            testId="hub-coming-1"
            colSpan="md:col-span-4"
            title="Prossimamente"
            subtitle="Una nuova esperienza in arrivo"
          />
          <ComingSoonCard
            testId="hub-coming-2"
            colSpan="md:col-span-4"
            title="Top secret"
            subtitle="Stay tuned"
          />
          <ComingSoonCard
            testId="hub-coming-3"
            colSpan="md:col-span-4"
            title="In sviluppo"
            subtitle="Coming 2026"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-10 py-10 border-t border-white/10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-3">
            <Waves className="w-4 h-4" />
            <span>© {new Date().getFullYear()} Magaverse · Magazzeno (SA)</span>
          </div>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.18em]">
            <Link to="/oceanbeach" data-testid="footer-link-nello" className="hover:text-white transition-colors">Ocean Beach</Link>
            <a href="/magaparty/index.html" data-testid="footer-link-magaparty" className="hover:text-white transition-colors">Magaparty</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProjectCard({
  href,
  internal,
  external,
  testId,
  colSpan,
  label,
  title,
  subtitle,
  color,
  tint,
  image,
  icon: Icon,
  tags = [],
  gradient,
}) {
  const Wrapper = ({ children, className }) =>
    internal ? (
      <Link to={href} className={className} data-testid={testId}>
        {children}
      </Link>
    ) : (
      <a
        href={href}
        className={className}
        data-testid={testId}
        {...(external ? {} : {})}
      >
        {children}
      </a>
    );

  return (
    <div className={`${colSpan} group`}>
      <Wrapper className="block relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm aspect-[5/4] md:aspect-[4/5] lg:aspect-[5/4] transition-all hover:border-white/30 hover:-translate-y-1 duration-300">
        {/* Background */}
        {image ? (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[2000ms] opacity-85"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} />
        )}

        {/* Tint overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${tint} 60%, rgba(5,5,16,0.9) 100%)`,
          }}
        />

        {/* Top icon + label */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur border border-white/20 inline-flex items-center justify-center">
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] font-mono opacity-80">
              {label}
            </span>
          </div>
          <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur border border-white/20 inline-flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 text-white">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-[0.95] tracking-tight" style={{ color }}>
            {title}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/80 max-w-md">{subtitle}</p>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/25 bg-white/5 text-white/85"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
}

function ComingSoonCard({ testId, colSpan, title, subtitle }) {
  return (
    <div
      data-testid={testId}
      className={`${colSpan} relative rounded-3xl border border-dashed border-white/15 bg-white/[0.02] backdrop-blur-sm aspect-[5/4] md:aspect-square overflow-hidden flex flex-col justify-end p-6 group`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-px magaverse-shine" />
      </div>
      <div className="absolute top-5 left-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-mono text-white/40">
        <span className="w-1.5 h-1.5 rounded-full bg-white/30" /> coming soon
      </div>
      <h3 className="relative font-display text-2xl font-bold text-white/70">{title}</h3>
      <p className="relative mt-1 text-sm text-white/40">{subtitle}</p>
    </div>
  );
}
