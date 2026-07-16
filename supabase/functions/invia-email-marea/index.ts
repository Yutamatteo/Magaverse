// Supabase Edge Function — invia l'email di conferma prenotazione MAREA
// con il QR d'ingresso monouso, non appena una riga viene inserita in
// marea_prenotazioni.
//
// Deploy:
//   supabase functions deploy invia-email-marea --no-verify-jwt
//
// Poi crea un Database Webhook (Database > Webhooks) su:
//   tabella: marea_prenotazioni
//   evento: Insert
//   tipo: HTTP Request -> URL della funzione deployata
//   header custom: x-webhook-secret = <lo stesso valore di WEBHOOK_SECRET>

// deno-lint-ignore-file no-explicit-any

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const FROM_EMAIL = "Magaparty <marea@magaverse.it>"; // dominio verificato su Resend

const OPZIONE_LABEL: Record<string, string> = {
  promo: "🔥 Promo Magaparty — 10€ (Lettino + Drink, salta fila)",
  lettino: "☀️ Solo Lettino — 6€",
  base: "🎟️ Ingresso Base — Gratuito",
};

function formatDataEvento(dataIso: string): string {
  const d = new Date(dataIso + "T12:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

Deno.serve(async (req: Request) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const row = payload.record;
  if (!row || !row.email || !row.qr_token) {
    return new Response("missing fields", { status: 400 });
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(row.qr_token)}`;
  const dataLabel = formatDataEvento(row.data_evento);
  const opzioneLabel = OPZIONE_LABEL[row.opzione] || row.opzione;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#0A1F0E;color:#F0FFE8;padding:32px 24px;border-radius:20px">
    <p style="text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#9AD82F;margin:0 0 6px">La Domenica di Magaparty</p>
    <h1 style="font-size:26px;margin:0 0 4px;color:#fff">MAREA · Happy Hour</h1>
    <p style="font-size:13px;color:#C6E86B;margin:0 0 24px">Nello Ocean Beach · ${dataLabel} · dalle 17:00</p>

    <p style="font-size:14px;line-height:1.5;margin:0 0 20px">
      Ciao <strong>${row.nome_capogruppo}</strong>, la tua richiesta è confermata.
      Mostra questo QR in cassa: senza, la sicurezza non potrà farti accedere all'area evento.
    </p>

    <div style="background:#12301A;border:1px solid #1C4022;border-radius:16px;padding:20px;text-align:center">
      <img src="${qrImageUrl}" width="220" height="220" alt="QR ingresso" style="display:block;margin:0 auto 16px;border-radius:8px" />
      <p style="font-size:11px;color:#8A7B6E;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Prenotazione</p>
      <p style="font-size:15px;color:#fff;font-weight:bold;margin:0 0 12px">${opzioneLabel}</p>
      <p style="font-size:11px;color:#8A7B6E;margin:0">Gruppo: ${row.composizione}</p>
    </div>

    <p style="font-size:11px;color:#8A7B6E;line-height:1.6;margin:20px 0 0">
      Questo QR è valido una sola volta ed è legato a questa prenotazione: non condividerlo,
      chi arriva per primo con il QR valido entra. Ci vediamo domenica dalle 17:00 su
      Nello Ocean Beach, Magazzeno.
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
      to: row.email,
      subject: `Il tuo accesso a MAREA (${dataLabel}) — QR in allegato`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return new Response(`resend error: ${errText}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
