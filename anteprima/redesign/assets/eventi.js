/* Appuntamenti mostrati in home.
   - Il primo con data futura diventa "Prossimo appuntamento".
   - L'ultimo passato da meno di 45 giorni compare come "Appena passato".
   data: "AAAA-MM-GG" · img: percorso assoluto (facoltativo) · url: pagina
   presto: true = "coming soon", senza dettagli ancora decisi */
window.MAGAVERSE_EVENTI = [
  { nome: "Halloween in Villa", data: "2026-10-31", quando: "Sabato 31 ottobre",
    img: "/anteprima/redesign/assets/img/halloween-locandina.webp", url: "/anteprima/redesign/magaparty/index.html#hw-titolo",
    testo: "14 costumi in gara, 460 voti: guarda com'è andata." },
  { nome: "Maga Gala", data: "2026-12-31", quando: "Capodanno · coming soon", presto: true,
    url: "/anteprima/redesign/magaparty/magagala.html",
    testo: "Dietro il sipario si prepara il Capodanno. Data e luogo ancora segreti." }
];
