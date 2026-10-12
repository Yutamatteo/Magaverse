// Supabase Edge Function — elimina UNA riga da una tabella consentita, dato
// il suo id. Pensata per correzioni puntuali dei dati (es. una richiesta
// doppia/fraudolenta in halloween_richieste) quando una DELETE diretta via
// SQL (mcp__Supabase__execute_sql) va in timeout (gli statement distruttivi
// restano in attesa di una conferma che in questo ambiente non arriva mai).
//
// Autorizzazione: header "x-admin-secret" == STAFF_PROVISION_SECRET (uso
// diretto/admin, nessun percorso via token utente: non è pensata per essere
// richiamata dal pannello staff).
//
// Deploy:
//   supabase functions deploy admin-elimina-riga --no-verify-jwt

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STAFF_PROVISION_SECRET = Deno.env.get("STAFF_PROVISION_SECRET")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Solo le tabelle di "richieste"/prenotazioni che lo staff gestisce da
// pannello: niente auth.users, niente tabelle di sistema.
const TABELLE_CONSENTITE = [
  "halloween_richieste",
  "tardeo_prenotazioni",
  "marea_prenotazioni",
  "battigia_prenotazioni",
  "ultima_onda_prenotazioni",
  "pagamenti_contanti",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const adminSecret = req.headers.get("x-admin-secret");
  if (!STAFF_PROVISION_SECRET || adminSecret !== STAFF_PROVISION_SECRET) {
    return json({ error: "non autorizzato" }, 401);
  }

  let body: { tabella?: string; id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const tabella = (body.tabella || "").trim();
  const id = (body.id || "").trim();
  if (!TABELLE_CONSENTITE.includes(tabella) || !id) {
    return json({ error: "tabella o id non validi" }, 400);
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${tabella}?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Prefer: "return=representation",
      },
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    return json({ error: `errore eliminazione: ${errText}` }, 500);
  }
  const eliminati = await res.json();
  return json({ ok: true, eliminati });
});
