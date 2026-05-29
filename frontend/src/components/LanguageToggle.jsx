import React from "react";
import { useLang } from "../contexts/LanguageContext";

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language selector"
      data-testid="language-toggle"
      className={`inline-flex items-center rounded-full border border-border bg-white/70 backdrop-blur-sm p-0.5 text-xs font-medium ${
        compact ? "" : "shadow-sm"
      }`}
    >
      <button
        type="button"
        data-testid="lang-it-btn"
        onClick={() => setLang("it")}
        className={`px-3 py-1.5 rounded-full transition-colors ${
          lang === "it"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        IT
      </button>
      <button
        type="button"
        data-testid="lang-en-btn"
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-full transition-colors ${
          lang === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
