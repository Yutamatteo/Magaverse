// Supabase Edge Function — crea un nuovo account staff (Supabase Auth) usando
// la service role key (Auth Admin API). Serve per provisionare account del
// gestionale staff (magacard/staff/) senza avere accesso diretto alla
// service role key lato client.
//
// Protetta da un secret dedicato (header "x-admin-secret"), diverso dalla
// anon key, da impostare manualmente su:
//   https://supabase.com/dashboard/project/dkzzmxsreaegjagqbdnh/functions/secrets
// come STAFF_PROVISION_SECRET.
//
// Deploy:
//   supabase functions deploy crea-utente-staff --no-verify-jwt
//
// Body JSON atteso:
//   { "email": "...", "password": "...", "ruolo": "ingresso", "nome": "..." }
// ruolo valido: bar | ingresso | admin | superadmin
// Il ruolo viene scritto in app_metadata (autorizzazioni) e duplicato in
// user_metadata (solo visualizzazione nei pannelli staff).

// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STAFF_PROVISION_SECRET = Deno.env.get("STAFF_PROVISION_SECRET")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RUOLI_VALIDI = ["bar", "ingresso", "admin", "superadmin"];

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

  const providedSecret = req.headers.get("x-admin-secret");
  if (!STAFF_PROVISION_SECRET || providedSecret !== STAFF_PROVISION_SECRET) {
    return json({ error: "non autorizzato" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const ruolo = (body.ruolo || "").trim();
  const nome = (body.nome || "").trim();

  if (!email || !password || !ruolo) {
    return json({ error: "campi obbligatori mancanti (email, password, ruolo)" }, 400);
  }
  if (!RUOLI_VALIDI.includes(ruolo)) {
    return json({ error: `ruolo non valido, deve essere uno tra: ${RUOLI_VALIDI.join(", ")}` }, 400);
  }
  if (password.length < 8) {
    return json({ error: "password troppo corta (minimo 8 caratteri)" }, 400);
  }

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      // Il ruolo che conta per le autorizzazioni (ruolo_utente() e RLS) sta in
      // app_metadata, che l'utente non può modificare. Resta copiato anche in
      // user_metadata solo perché i pannelli staff lo leggono lato client per
      // decidere cosa mostrare: non va mai usato per autorizzare.
      app_metadata: { ruolo },
      user_metadata: { ruolo, nome: nome || undefined },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return json({ error: data?.msg || data?.error_description || JSON.stringify(data) }, res.status);
  }

  return json({ ok: true, user_id: data.id, email: data.email });
});
