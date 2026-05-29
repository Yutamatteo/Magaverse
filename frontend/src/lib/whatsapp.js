import { WHATSAPP_NUMBER } from "./constants";

const labels = {
  it: {
    intro: "Ciao Nello Ocean Beach! Vorrei prenotare:",
    name: "Nome",
    phone: "Telefono",
    date: "Data",
    guests: "Persone",
    service: "Servizio",
    notes: "Note",
    services: {
      umbrella: "Ombrellone + lettini",
      canoe: "Noleggio canoa",
      info: "Richiesta informazioni",
    },
    closing: "Grazie!",
  },
  en: {
    intro: "Hello Nello Ocean Beach! I would like to book:",
    name: "Name",
    phone: "Phone",
    date: "Date",
    guests: "Guests",
    service: "Service",
    notes: "Notes",
    services: {
      umbrella: "Umbrella + sunbeds",
      canoe: "Canoe rental",
      info: "Information request",
    },
    closing: "Thank you!",
  },
};

export function buildWhatsappMessage({ name, phone, date, guests, service, notes }, lang = "it") {
  const t = labels[lang] || labels.it;
  const lines = [
    t.intro,
    "",
    `• ${t.name}: ${name || "-"}`,
    `• ${t.phone}: ${phone || "-"}`,
    `• ${t.date}: ${date || "-"}`,
    `• ${t.guests}: ${guests || "-"}`,
    `• ${t.service}: ${t.services[service] || service}`,
  ];
  if (notes && notes.trim()) lines.push(`• ${t.notes}: ${notes.trim()}`);
  lines.push("", t.closing);
  return lines.join("\n");
}

export function buildWhatsappUrl(payload, lang = "it") {
  const text = encodeURIComponent(buildWhatsappMessage(payload, lang));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function quickWhatsappUrl(lang = "it") {
  const text = encodeURIComponent(
    lang === "en"
      ? "Hello Nello Ocean Beach! I'd like some information."
      : "Ciao Nello Ocean Beach! Vorrei alcune informazioni."
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
