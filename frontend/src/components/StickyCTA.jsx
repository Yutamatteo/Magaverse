import React from "react";
import { MessageCircle } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { quickWhatsappUrl } from "../lib/whatsapp";

export default function StickyCTA() {
  const { t, lang } = useLang();
  return (
    <a
      href={quickWhatsappUrl(lang)}
      target="_blank"
      rel="noreferrer noopener"
      data-testid="sticky-whatsapp-cta"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/0.92)] transition-all text-sm font-medium"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">{t.misc.whatsappFloating}</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}
