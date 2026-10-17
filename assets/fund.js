/* =====================================================================
   ΤΑΜΕΙΟ ΕΡΕΥΝΑΣ — ΤΑ ΝΟΥΜΕΡΑ ΑΛΛΑΖΟΥΝ ΜΟΝΟ ΕΔΩ
   Όταν μπαίνουν χρήματα στο ταμείο, άλλαξε το «raised» (και την ημερομηνία).
   Η μπάρα στις σελίδες Έρευνα και στο έργο του Logoplex ενημερώνεται μόνη της.
   ===================================================================== */
window.NOES_FUND = {
  goal: 5000,          // στόχος σε € (π.χ. μία υποτροφία)
  raised: 0,           // ΕΠΙΠΛΕΟΝ ποσά εκτός Stripe (π.χ. μετρητά, τράπεζα), σε €· τα υπόλοιπα έρχονται αυτόματα
  share: 10,           // τι ποσοστό (%) των εσόδων από καθοδήγηση & προγράμματα πηγαίνει στο ταμείο
  updated: "2026-10-17",
  // Stripe Payment Link για δωρεές (με «Let customers choose what to pay»).
  // Επικόλλησε εδώ τον σύνδεσμο (https://buy.stripe.com/...). Όσο είναι κενός, τα κουμπιά ανοίγουν email.
  donateLink: "https://buy.stripe.com/4gM3co8ftb0F4ge6pXdjO02",
  // Η διεύθυνση που δίνει τα σύνολα στήριξης (το Worker του logoplex.app, διαδρομή /api/fund).
  // Όσο είναι κενή, η μπάρα δείχνει μόνο το «raised» πιο πάνω.
  endpoint: "https://logoplex.app/api/fund",
  // Ορόσημα ανά έργο (προαιρετικά). Παράδειγμα:
  // "logoplex-benchmark": [ { at: 1000, el: "Δημόσιο benchmark ελληνικής σύνταξης", en: "Public Greek syntax benchmark" } ]
  milestones: {}
};

(function () {
  var F = window.NOES_FUND, el = document.documentElement.lang !== "en";
  var fmt = function (n) { return Math.round(n).toLocaleString(el ? "el-GR" : "en-GB") + " €"; };

  // Κουμπιά στήριξης: αν υπάρχει Stripe link, το κουμπί πηγαίνει εκεί.
  // Το data-donate="…" μπαίνει ως client_reference_id, ώστε στο Stripe να φαίνεται για ποιο έργο ήταν η πληρωμή.
  if (F.donateLink) document.querySelectorAll("[data-donate]").forEach(function (a) {
    a.href = F.donateLink + (F.donateLink.indexOf("?") < 0 ? "?" : "&") + "client_reference_id=" + encodeURIComponent(a.getAttribute("data-donate")) +
      "&locale=" + (el ? "el" : "en");
    a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll('[data-fund="share"]').forEach(function (e) { e.textContent = F.share + "%"; });

  // Η μπάρα του Ταμείου Έρευνας
  function draw(raised, updated) {
    var pct = Math.max(0, Math.min(100, Math.round(raised / F.goal * 100)));
    document.querySelectorAll(".fund-bar").forEach(function (box) {
      box.innerHTML =
        '<div class="fund-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + F.goal + '" aria-valuenow="' + raised + '">' +
          '<div class="fund-fill" style="width:' + Math.max(pct, 1.5) + '%"></div></div>' +
        '<div class="fund-nums"><span><b>' + fmt(raised) + "</b> " + (el ? "από" : "of") + " " + fmt(F.goal) + "</span>" +
        "<span>" + pct + "% · " + (el ? "ενημέρωση" : "updated") + " " + updated.split("-").reverse().join("/") + "</span></div>";
    });
  }
  draw(F.raised, F.updated);

  // Από το Worker: πόσα μαζεύτηκαν ανά έργο και ποιοι υποστηρικτές θέλουν να φαίνονται
  if (!F.endpoint) {   // χωρίς Worker: κρύβουμε το κουτί «Στήριξη αυτού του έργου»
    document.querySelectorAll("[data-project]").forEach(function (b) { b.hidden = true; var l = b.previousElementSibling; if (l && l.classList.contains("fund-label")) l.hidden = true; });
    return;
  }
  fetch(F.endpoint).then(function (r) { return r.json(); }).then(function (d) {
    var t = d.totals || {};
    // d.pool = 10% όλων των εσόδων (αυτόματα από το Stripe) + η στήριξη προς το Ταμείο· το «raised» πιο πάνω προστίθεται (π.χ. μετρητά)
    draw(F.raised + (d.pool != null ? d.pool : (t["research-pool"] || 0)), d.updated || F.updated);
    document.querySelectorAll("[data-project]").forEach(function (box) {
      var p = box.getAttribute("data-project"), sum = t[p] || 0, n = (d.counts || {})[p] || 0, names = (d.supporters || {})[p] || [];
      var h = '<p class="proj-sum"><b>' + fmt(sum) + "</b> " + (el ? "από " + n + (n === 1 ? " υποστηρικτή" : " υποστηρικτές") : "from " + n + (n === 1 ? " supporter" : " supporters")) + "</p>";
      var ms = F.milestones[p] || [];
      if (ms.length) h += '<ul class="milestones">' + ms.map(function (m) {
        return '<li class="' + (sum >= m.at ? "done" : "") + '"><b>' + fmt(m.at) + "</b> " + (el ? m.el : m.en) + "</li>"; }).join("") + "</ul>";
      h += names.length
        ? '<p class="names"><span>' + (el ? "Ευχαριστούμε:" : "Thank you:") + "</span> " + names.map(function (x) { return x.replace(/[<>&"]/g, ""); }).join(" · ") + "</p>"
        : '<p class="names">' + (el ? "Γίνε η πρώτη ή ο πρώτος υποστηρικτής!" : "Be the first supporter!") + "</p>";
      box.innerHTML = h;
    });
  }).catch(function () {});
})();
