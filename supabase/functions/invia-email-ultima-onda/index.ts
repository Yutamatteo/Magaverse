// Supabase Edge Function — invia l'email di conferma prenotazione
// ULTIMA ONDA con il QR d'ingresso monouso, non appena una riga
// viene inserita in ultima_onda_prenotazioni.
//
// Se la prenotazione ha interesse_sup = true, invia anche una seconda
// email di notifica a matteo.finizio@magaverse.it con il riepilogo
// delle scelte effettuate, così può essere ricontattato/passato ad
// Adventure Lab & Next.
//
// Deploy:
//   supabase functions deploy invia-email-ultima-onda --no-verify-jwt
//
// Poi crea un Database Webhook (Database > Webhooks) su:
//   tabella: ultima_onda_prenotazioni
//   evento: Insert
//   tipo: HTTP Request -> URL della funzione deployata
//   header custom: x-webhook-secret = <lo stesso valore di WEBHOOK_SECRET>

// deno-lint-ignore-file no-explicit-any

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const FROM_EMAIL = "Magaparty <noreply@magaverse.it>"; // dominio verificato su Resend
const ADMIN_NOTIFY_EMAIL = "matteo.finizio@magaverse.it";

const SESSO_LABEL: Record<string, string> = { uomo: "Uomo", donna: "Donna", altro: "Altro" };

function formatDataEvento(dataIso: string): string {
  const d = new Date(dataIso + "T12:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

async function inviaEmailSup(row: any, dataLabel: string): Promise<void> {
  const sessoLabel = row.sesso === "altro" && row.sesso_altro
    ? `Altro (${row.sesso_altro})`
    : (SESSO_LABEL[row.sesso] || row.sesso || "—");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#140A05;color:#F0E4D8;padding:32px 24px;border-radius:20px">
    <p style="text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#F5E6C8;margin:0 0 6px">Ultima Onda · richiesta SUP</p>
    <h1 style="font-size:22px;margin:0 0 4px;color:#fff">🏄 Nuova richiesta info SUP</h1>
    <p style="font-size:13px;color:#C2660E;margin:0 0 24px">${dataLabel} · dalle 08:00, con Adventure Lab &amp; Next</p>

    <div style="background:#201209;border:1px solid #3A2210;border-radius:16px;padding:20px">
      <p style="font-size:13px;margin:0 0 10px"><strong>Nome e Cognome:</strong> ${row.nome_capogruppo}</p>
      <p style="font-size:13px;margin:0 0 10px"><strong>Cellulare:</strong> ${row.telefono}</p>
      <p style="font-size:13px;margin:0 0 10px"><strong>Email:</strong> ${row.email}</p>
      <p style="font-size:13px;margin:0 0 10px"><strong>Instagram:</strong> ${row.instagram || "—"}</p>
      <p style="font-size:13px;margin:0 0 10px"><strong>Chi ti ha invitato:</strong> ${row.chi_ti_ha_invitato}</p>
      <p style="font-size:13px;margin:0 0 10px"><strong>Sesso:</strong> ${sessoLabel}</p>
      <p style="font-size:13px;margin:0"><strong>Interesse SUP:</strong> Sì — lezione o noleggio, dalle 08:00 con Adventure Lab &amp; Next</p>
    </div>

    <p style="font-size:11px;color:#C9A878;line-height:1.6;margin:20px 0 0">
      Riepilogo automatico generato alla prenotazione. Prenotazione per ${dataLabel} su Nello Ocean Beach.
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
      to: ADMIN_NOTIFY_EMAIL,
      subject: `🏄 Richiesta SUP — ${row.nome_capogruppo}`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    // Non blocchiamo la risposta principale per un errore su questa email
    // secondaria: lo logghiamo soltanto.
    console.error("Errore invio email notifica SUP:", errText);
  }
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

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&color=2B1206&bgcolor=ffffff&data=${encodeURIComponent(row.qr_token)}`;
  const dataLabel = formatDataEvento(row.data_evento);

  const supNote = row.interesse_sup
    ? `<p style="font-size:12px;color:#F5E6C8;margin:14px 0 0;padding:12px;border:1px solid rgba(245,230,200,0.25);border-radius:10px;background:rgba(245,230,200,0.06)">
         🏄 Ci hai chiesto info per la lezione/noleggio SUP (dalle 08:00, con Adventure Lab &amp; Next):
         ti ricontattiamo noi, oppure scrivici su Instagram <strong>@_magaparty</strong> per bloccare subito il posto.
       </p>`
    : "";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#140A05;color:#F0E4D8;padding:32px 24px;border-radius:20px">
    <p style="text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#F5E6C8;margin:0 0 6px">L'ultimo format dell'estate</p>
    <h1 style="font-size:26px;margin:0 0 4px;color:#fff">ULTIMA ONDA</h1>
    <p style="font-size:13px;color:#C2660E;margin:0 0 24px">Nello Ocean Beach · ${dataLabel} · dalle 18:00</p>

    <p style="font-size:14px;line-height:1.5;margin:0 0 20px">
      Ciao <strong>${row.nome_capogruppo}</strong>, la tua richiesta è confermata.
      Mostra questo QR in cassa: senza, la sicurezza non potrà farti accedere all'area evento.
    </p>

    <div style="background:#201209;border:1px solid #3A2210;border-radius:16px;padding:20px;text-align:center">
      <img src="${qrImageUrl}" width="220" height="220" alt="QR ingresso" style="display:block;margin:0 auto 16px;border-radius:8px" />
      <p style="font-size:11px;color:#C9A878;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Prenotazione</p>
      <p style="font-size:15px;color:#fff;font-weight:bold;margin:0 0 12px">🌅 Ingresso + drink omaggio — 10€</p>
      <p style="font-size:11px;color:#C9A878;margin:0">Invitato da: ${row.chi_ti_ha_invitato}</p>
    </div>

    ${supNote}

    <p style="font-size:11px;color:#C9A878;line-height:1.6;margin:20px 0 0">
      Questo QR è valido una sola volta ed è legato a questa prenotazione: non condividerlo,
      chi arriva per primo con il QR valido entra. Ci vediamo ${dataLabel} dalle 18:00 su
      Nello Ocean Beach, Magazzeno — 08:00 SUP School, 19:30 Indieficio, 21:30 DJ Set Adolfo Citro.
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
      subject: `Il tuo accesso a ULTIMA ONDA (${dataLabel}) — QR in allegato`,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return new Response(`resend error: ${errText}`, { status: 500 });
  }

  if (row.interesse_sup) {
    await inviaEmailSup(row, dataLabel);
  }

  return new Response("ok", { status: 200 });
});
