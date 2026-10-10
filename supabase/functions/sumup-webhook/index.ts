// Supabase Edge Function — endpoint pubblico chiamato da SumUp
// (return_url del checkout) quando lo stato di un pagamento cambia.
// Il payload di SumUp NON va fidato: contiene solo {event_type, id}.
// Verifichiamo sempre lo stato reale interrogando l'API SumUp, e solo
// se è PAID aggiorniamo la richiesta corrispondente in halloween_richieste.
//
// Deploy:
//   supabase functions deploy sumup-webhook --no-verify-jwt
//
// Va impostata come return_url nella creazione del checkout
// (fatto in crea-pagamento-sumup).

// deno-lint-ignore-file no-explicit-any

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUMUP_API_KEY = Deno.env.get("SUMUP_API_KEY")!;

Deno.serve(async (req: Request) => {
  // Rispondiamo sempre 2xx velocemente: SumUp ritenta (1, 5, 20 min, 2h)
  // se non riceve una risposta 2xx pronta, quindi evitiamo di far
  // fallire la risposta per errori interni non recuperabili.
  try {
    if (req.method !== "POST") {
      return new Response("ok", { status: 200 });
    }

    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return new Response("ok", { status: 200 });
    }

    const checkoutId = payload?.id;
    if (!checkoutId) {
      return new Response("ok", { status: 200 });
    }

    // Verifica SEMPRE lo stato reale via API SumUp — non fidarsi del payload.
    const checkoutRes = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${SUMUP_API_KEY}` },
    });
    if (!checkoutRes.ok) {
      console.error("sumup checkout fetch error", checkoutRes.status, await checkoutRes.text());
      return new Response("ok", { status: 200 });
    }
    const checkout = await checkoutRes.json();

    if (checkout.status !== "PAID") {
      // PENDING, FAILED, EXPIRED: niente da fare.
      return new Response("ok", { status: 200 });
    }

    // Aggiorna la richiesta collegata a questo checkout. Non sovrascrive
    // una richiesta già annullata dallo staff; va bene invece se è già
    // stata contattata (il pagamento la confirma comunque).
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/halloween_richieste?sumup_checkout_id=eq.${checkoutId}&stato=neq.annullata`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ stato: "confermata", pagato_il: new Date().toISOString() }),
      }
    );

    if (!patchRes.ok) {
      console.error("supabase patch error", patchRes.status, await patchRes.text());
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("sumup-webhook error", err?.message || err);
    return new Response("ok", { status: 200 });
  }
});
