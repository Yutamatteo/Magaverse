// Supabase Edge Function — avvisa lo staff via email non appena una
// riga viene inserita in halloween_richieste (biglietti, saltafila,
// navetta, alloggi). A differenza di invia-email-marea, qui il
// destinatario è lo STAFF (non il cliente): è un lead da ricontattare
// a mano, non una conferma con QR.
//
// Deploy:
//   supabase functions deploy invia-email-halloween --no-verify-jwt
//
// Poi crea un Database Webhook (Database > Webhooks) su:
//   tabella: halloween_richieste
//   evento: Insert
//   tipo: HTTP Request -> URL della funzione deployata
//   header custom: x-webhook-secret = <lo stesso valore di WEBHOOK_SECRET>

// deno-lint-ignore-file no-explicit-any

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const FROM_EMAIL = "Magaparty <noreply@magaverse.it>"; // dominio verificato su Resend
const STAFF_EMAIL = "matteo.finizio@magaverse.it";

const TIPO_LABEL: Record<string, string> = {
  community: "Biglietto Community (€40)",
  prima: "Biglietto Prima Release (€45)",
  seconda: "Biglietto Seconda Release (€50)",
  terza: "Biglietto Terza Release (€55)",
  saltafila: "Bracciale saltafila",
  navetta: "Navetta + Ingresso omaggio",
  "appartamenti-vip": "Appartamenti VIP (dentro la villa)",
  "villa-belvedere": "Villa Belvedere (hotel, bagno privato)",
  "lido-azzurro": "Lido Azzurro (camere doppie)",
};

function formatData(dataIso: string): string {
  const d = new Date(dataIso + "T12:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

Deno.serve(async (req: Request) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const row = payload.record;
  if (!row || !row.nome || !row.telefono) {
    return new Response("missing fields", { status: 400 });
  }

  const tipoLabel = TIPO_LABEL[row.tipo] || row.tipo;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#17101F;color:#ECE6DD;padding:32px 24px;border-radius:20px">
    <p style="text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#D8B66B;margin:0 0 6px">Halloween in Villa · Nuova richiesta</p>
    <h1 style="font-size:22px;margin:0 0 18px;color:#fff">${tipoLabel}</h1>

    <div style="background:#1F1730;border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:18px 20px">
      <p style="font-size:14px;margin:0 0 8px"><strong>${row.nome} ${row.cognome}</strong></p>
      <p style="font-size:13px;margin:0 0 4px;color:#9A91A8">Email: <span style="color:#ECE6DD">${row.email}</span></p>
      <p style="font-size:13px;margin:0 0 4px;color:#9A91A8">Telefono: <span style="color:#ECE6DD">${row.telefono}</span></p>
      <p style="font-size:13px;margin:0 0 4px;color:#9A91A8">Data di nascita: <span style="color:#ECE6DD">${formatData(row.data_nascita)}</span></p>
      ${row.instagram ? `<p style="font-size:13px;margin:0 0 4px;color:#9A91A8">Instagram: <span style="color:#ECE6DD">${row.instagram}</span></p>` : ""}
      ${row.invitato_da ? `<p style="font-size:13px;margin:0;color:#9A91A8">Invitato da: <span style="color:#ECE6DD">${row.invitato_da}</span></p>` : ""}
    </div>

    <p style="font-size:11px;color:#9A91A8;line-height:1.6;margin:20px 0 0">
      Richiesta registrata su halloween_richieste. Ricontatta il cliente su WhatsApp/telefono
      per confermare${row.tipo === "prima" || row.tipo === "seconda" || row.tipo === "terza" ? " e inviare il link Posto Riservato" : ""}.
    </p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: STAFF_EMAIL,
      subject: `Nuova richiesta Halloween — ${tipoLabel} — ${row.nome} ${row.cognome}`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return new Response(`resend error: ${errText}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
