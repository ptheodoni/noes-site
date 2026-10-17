/* =====================================================================
   noes-fund — Cloudflare Worker (το επικολλάς ΟΛΟ στο Cloudflare → Workers)
   Διαβάζει από το Stripe (μόνο ανάγνωση) τις πληρωμές στήριξης και δίνει
   στο noes.gr: πόσα μαζεύτηκαν ανά έργο + τα ονόματα όσων δέχτηκαν να φαίνονται.
   Χρειάζεται ένα Secret με όνομα STRIPE_KEY (το restricted key rk_live_...).
   Ενημερώνεται το πολύ κάθε 10 λεπτά (cache).
   ===================================================================== */
const PROJECTS = ["research-pool", "logoplex-benchmark"];   // νέο έργο; πρόσθεσέ το εδώ και στο assets/fund.js

export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;
    const key = new Request(new URL(request.url).origin + "/fund.json");
    const hit = await cache.match(key);
    if (hit) return hit;

    const totals = {}, counts = {}, supporters = {};
    let after = null;
    for (let page = 0; page < 30; page++) {
      const url = "https://api.stripe.com/v1/checkout/sessions?limit=100&status=complete" + (after ? "&starting_after=" + after : "");
      const r = await fetch(url, { headers: { Authorization: "Bearer " + env.STRIPE_KEY } });
      const j = await r.json();
      if (!r.ok) return json({ error: (j.error && j.error.message) || "stripe error" }, 502);
      for (const s of j.data) {
        const p = s.client_reference_id;
        if (s.mode !== "payment" || s.payment_status !== "paid" || !PROJECTS.includes(p)) continue;
        totals[p] = (totals[p] || 0) + (s.amount_total || 0) / 100;
        counts[p] = (counts[p] || 0) + 1;
        // Το προαιρετικό πεδίο ονόματος στο Payment Link: μόνο όσοι το συμπλήρωσαν εμφανίζονται
        const f = (s.custom_fields || []).find(x => x.type === "text" && x.text && x.text.value);
        if (f) (supporters[p] = supporters[p] || []).push(f.text.value.trim().slice(0, 60));
      }
      if (!j.has_more || !j.data.length) break;
      after = j.data[j.data.length - 1].id;
    }
    const res = json({ totals, counts, supporters, updated: new Date().toISOString().slice(0, 10) });
    res.headers.set("Cache-Control", "public, max-age=600");
    ctx.waitUntil(cache.put(key, res.clone()));
    return res;
  }
};

function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
}
