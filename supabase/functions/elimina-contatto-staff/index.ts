// Supabase Edge Function — elimina una o più righe da staff_contatti_log,
// per correggere un "letto" segnato per errore (es. click sbagliato su
// WhatsApp/Instagram nella scheda Richieste del pannello staff), riportando
// la richiesta allo stato "da leggere".
//
// staff_contatti_log non ha una policy RLS di DELETE (solo INSERT per lo
// staff e SELECT per il superadmin), quindi la cancellazione passa da qui
// con la service role key. Due modi per autorizzarsi:
//  1) header "x-admin-secret" == STAFF_PROVISION_SECRET (uso diretto/admin)
//  2) header "Authorization: Bearer <access_token>" di un utente con
//     ruolo "superadmin" in app_metadata (per un futuro pulsante nel pannello Registro).
//     Dal 26/11/2026 il ruolo si legge da app_metadata, che l'utente non può modificare
//     (prima da user_metadata, modificabile da chiunque abbia un account).
//
// Deploy:
//   supabase functions deploy elimina-contatto-staff --no-verify-jwt

// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const STAFF_PROVISION_SECRET = Deno.env.get("STAFF_PROVISION_SECRET")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVENTI_VALIDI = ["tardeo", "marea", "battigia", "ultima_onda", "halloween"];

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function chiamanteAutorizzato(req: Request): Promise<boolean> {
  const adminSecret = req.headers.get("x-admin-secret");
  if (STAFF_PROVISION_SECRET && adminSecret === STAFF_PROVISION_SECRET) {
    return true;
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: SUPABASE_ANON_KEY },
    });
    if (!res.ok) return false;
    const user = await res.json();
    return user?.app_metadata?.ruolo === "superadmin";
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  if (!(await chiamanteAutorizzato(req))) {
    return json({ error: "non autorizzato" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const evento = (body.evento || "").trim();
  const richiestaId = (body.richiesta_id || "").trim();
  if (!EVENTI_VALIDI.includes(evento) || !richiestaId) {
    return json({ error: "evento o richiesta_id non validi" }, 400);
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/staff_contatti_log?evento=eq.${encodeURIComponent(evento)}&richiesta_id=eq.${encodeURIComponent(richiestaId)}`,
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
  return json({ ok: true, eliminati: eliminati.length });
});
