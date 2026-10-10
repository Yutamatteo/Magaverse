// Supabase Edge Function — crea una richiesta "halloween_richieste" e un
// checkout SumUp collegato, per i tier a pagamento online (navetta e le
// 3 soluzioni "Dove dormire"). Il client chiama questa funzione invece di
// inserire direttamente su Supabase; la funzione usa la service role key
// (bypassa RLS) per creare la riga con stato "nuova", poi crea un
// hosted checkout SumUp e torna l'URL su cui redirigere il browser.
//
// Deploy:
//   supabase functions deploy crea-pagamento-sumup --no-verify-jwt

// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUMUP_API_KEY = Deno.env.get("SUMUP_API_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Evento: 31 ottobre 2026. L'età minima si valuta a questa data.
const EVENT_DATE = new Date("2026-10-31T23:59:59");
// Prezzi: dal 22 ottobre 2026 scatta la fascia alta.
const CUTOFF_DATE = new Date("2026-10-22T00:00:00");

type PrezzoTier = {
  perPersona: boolean;
  prima: number;
  dopo: number;
  minPersone?: number;
  label: string;
};

const PREZZI: Record<string, PrezzoTier> = {
  navetta: { perPersona: false, prima: 60, dopo: 70, label: "Navetta + Ingresso omaggio" },
  "appartamenti-vip": { perPersona: true, prima: 90, dopo: 100, minPersone: 4, label: "Appartamenti VIP" },
  "villa-belvedere": { perPersona: true, prima: 80, dopo: 90, minPersone: 2, label: "Villa Belvedere" },
  "lido-azzurro": { perPersona: true, prima: 70, dopo: 80, minPersone: 2, label: "Lido Azzurro" },
};

function computeAge(dobStr: string, atDate: Date): number {
  const dob = new Date(dobStr + "T00:00:00");
  if (isNaN(dob.getTime())) return -1;
  let age = atDate.getFullYear() - dob.getFullYear();
  const m = atDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && atDate.getDate() < dob.getDate())) age--;
  return age;
}

let cachedMerchantCode: string | null = null;
async function getMerchantCode(): Promise<string> {
  if (cachedMerchantCode) return cachedMerchantCode;
  const res = await fetch("https://api.sumup.com/v0.1/me/merchant-profile", {
    headers: { Authorization: `Bearer ${SUMUP_API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`merchant-profile error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  cachedMerchantCode = data.merchant_code;
  return cachedMerchantCode!;
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const tipo = body.tipo;
  const prezzo = PREZZI[tipo];
  if (!prezzo) {
    return json({ error: "tipo non valido per il pagamento online" }, 400);
  }

  const nome = (body.nome || "").trim();
  const cognome = (body.cognome || "").trim();
  const email = (body.email || "").trim();
  const telefono = (body.telefono || "").trim();
  const dataNascita = (body.data_nascita || "").trim();
  const instagram = body.instagram ? String(body.instagram).trim() : null;
  const invitatoDa = body.invitato_da ? String(body.invitato_da).trim() : null;
  const terminiAccettati = body.termini_accettati === true;

  if (!nome || !cognome || !email || !telefono || !dataNascita || !terminiAccettati) {
    return json({ error: "campi obbligatori mancanti" }, 400);
  }

  const age = computeAge(dataNascita, EVENT_DATE);
  if (age < 0 || age < 18) {
    return json({ error: "età minima 18 anni alla data dell'evento" }, 400);
  }

  let numeroPersone: number | null = null;
  if (prezzo.perPersona) {
    numeroPersone = parseInt(body.numero_persone, 10);
    if (!numeroPersone || isNaN(numeroPersone) || numeroPersone < 1) {
      return json({ error: "numero persone non valido" }, 400);
    }
    if (prezzo.minPersone && numeroPersone < prezzo.minPersone) {
      return json({ error: `minimo ${prezzo.minPersone} persone per questa soluzione` }, 400);
    }
  }

  const now = new Date();
  const unitPrice = now >= CUTOFF_DATE ? prezzo.dopo : prezzo.prima;
  const totalAmount = prezzo.perPersona ? unitPrice * (numeroPersone as number) : unitPrice;

  // 1. Crea la riga halloween_richieste con service role (bypassa RLS).
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/halloween_richieste`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      tipo,
      nome,
      cognome,
      email,
      telefono,
      data_nascita: dataNascita,
      instagram,
      invitato_da: invitatoDa,
      termini_accettati: true,
      numero_persone: numeroPersone,
      stato: "nuova",
    }),
  });

  if (!insertRes.ok) {
    const errText = await insertRes.text();
    return json({ error: `errore creazione richiesta: ${errText}` }, 500);
  }
  const inserted = await insertRes.json();
  const richiesta = inserted[0];
  if (!richiesta || !richiesta.id) {
    return json({ error: "errore creazione richiesta: riga non trovata" }, 500);
  }

  // 2. Crea il checkout SumUp collegato a questa richiesta.
  try {
    const merchantCode = await getMerchantCode();
    const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUMUP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        checkout_reference: richiesta.id,
        amount: Math.round(totalAmount * 100) / 100,
        currency: "EUR",
        merchant_code: merchantCode,
        description: `${prezzo.label} — Halloween in Villa — ${nome} ${cognome}`,
        return_url: `${SUPABASE_URL}/functions/v1/sumup-webhook`,
        redirect_url: `https://www.magaverse.it/magaparty/halloween.html?pagamento=ok&richiesta=${richiesta.id}#prezzi`,
        hosted_checkout: { enabled: true },
      }),
    });

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text();
      // la richiesta esiste già in halloween_richieste; segnaliamo l'errore
      // di pagamento ma non la cancelliamo, cosi' lo staff la vede comunque.
      return json({ error: `errore creazione checkout: ${errText}` }, 500);
    }
    const checkout = await checkoutRes.json();

    // 3. Collega il checkout_id alla riga.
    await fetch(`${SUPABASE_URL}/rest/v1/halloween_richieste?id=eq.${richiesta.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sumup_checkout_id: checkout.id }),
    });

    return json({
      richiesta_id: richiesta.id,
      hosted_checkout_url: checkout.hosted_checkout_url,
    });
  } catch (err: any) {
    return json({ error: `errore pagamento: ${err.message || err}` }, 500);
  }
});
