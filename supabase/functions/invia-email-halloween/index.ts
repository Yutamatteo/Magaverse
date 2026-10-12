// Supabase Edge Function — in origine avvisava lo staff via email non
// appena una riga veniva inserita in halloween_richieste (biglietti,
// saltafila, navetta, alloggi): un lead da ricontattare a mano, non una
// conferma con QR (halloween_richieste non ha QR).
//
// DISATTIVATA per risparmiare quota Resend: non essendoci un QR da
// inviare al cliente in questo flusso, la funzione ora non manda più
// nessuna email — risponde subito "ok" senza chiamare Resend. Le nuove
// richieste restano comunque visibili dal pannello staff, scheda
// Richieste → Halloween. Il webhook DB resta configurato (la funzione
// continua a essere invocata ad ogni insert) ma non fa più nulla.
//
// Deploy:
//   supabase functions deploy invia-email-halloween --no-verify-jwt

Deno.serve(async (_req: Request) => {
  return new Response("ok (email disattivata)", { status: 200 });
});
