// Supabase Edge Function — scattata non appena una riga viene inserita in
// pagamenti_contanti (form "paga in contanti", condiviso manualmente in
// chat, non linkato sul sito). Invia UNA sola email, al cliente: il QR
// d'ingresso, con l'avviso che non è ancora attivo finché lo staff non
// conferma il pagamento in contanti.
// Il QR è identico a quello usato per Marea/Battigia/ecc. (qrserver.com),
// ma diventa scansionabile solo quando lo staff conferma il pagamento dal
// pannello (vedi valida_ingresso_contanti lato database).
//
// Nota: niente più email di notifica allo staff ad ogni richiesta (per
// risparmiare quota Resend) — le nuove richieste si vedono dal pannello
// staff, scheda "Biglietti in contanti".
//
// Deploy:
//   supabase functions deploy invia-email-pagamento-contanti --no-verify-jwt
//
// Poi crea un Database Webhook (Database > Webhooks) su:
//   tabella: pagamenti_contanti
//   evento: Insert
//   tipo: HTTP Request -> URL della funzione deployata
//   header custom: x-webhook-secret = <lo stesso valore di WEBHOOK_SECRET>

// deno-lint-ignore-file no-explicit-any

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const FROM_EMAIL = "Magaparty <noreply@magaverse.it>"; // dominio verificato su Resend

async function inviaEmail(to: string, subject: string, html: string) {
  return await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
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

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&color=241009&bgcolor=ffffff&data=${encodeURIComponent(row.qr_token)}`;

  // Email cliente: QR + avviso che non è ancora attivo.
  const htmlCliente = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#17101F;color:#ECE6DD;padding:32px 24px;border-radius:20px">
    <p style="text-transform:uppercase;letter-spacing:3px;font-size:11px;color:#D8B66B;margin:0 0 6px">Halloween in Villa · Pagamento in contanti</p>
    <h1 style="font-size:22px;margin:0 0 18px;color:#fff">Il tuo QR d'ingresso</h1>

    <p style="font-size:14px;line-height:1.6;margin:0 0 20px">
      Ciao <strong>${row.nome}</strong>, abbiamo ricevuto la tua richiesta. Ecco il QR che dovrai mostrare
      all'ingresso: <strong>non è ancora attivo</strong> — lo staff lo abiliterà non appena
      completerai il pagamento in contanti con noi. Ti ricontattiamo a breve per definire l'importo e le modalità.
    </p>

    <div style="background:#1F1730;border:1px solid rgba(255,255,255,0.09);border-radius:16px;padding:20px;text-align:center">
      <img src="${qrImageUrl}" width="220" height="220" alt="QR ingresso" style="display:block;margin:0 auto 16px;border-radius:8px" />
      <p style="font-size:11px;color:#9A91A8;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Richiesta</p>
      <p style="font-size:15px;color:#fff;font-weight:bold;margin:0">${row.nome} ${row.cognome}</p>
    </div>

    <p style="font-size:11px;color:#9A91A8;line-height:1.6;margin:20px 0 0">
      Questo QR è legato a questa richiesta e valido una sola volta: non condividerlo. Conservalo, ti servirà
      per entrare una volta che il pagamento sarà confermato.
    </p>
  </div>`;

  const resCliente = await inviaEmail(
    row.email,
    "Il tuo QR per Halloween in Villa (pagamento in contanti)",
    htmlCliente,
  );
  if (!resCliente.ok) {
    const errText = await resCliente.text();
    return new Response(`resend error (cliente): ${errText}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
});
