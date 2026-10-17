/* =====================================================================
   ΤΑΜΕΙΟ ΕΡΕΥΝΑΣ — ΤΑ ΝΟΥΜΕΡΑ ΑΛΛΑΖΟΥΝ ΜΟΝΟ ΕΔΩ
   Όταν μπαίνουν χρήματα στο ταμείο, άλλαξε το «raised» (και την ημερομηνία).
   Η μπάρα στις σελίδες Έρευνα και στο έργο του Logoplex ενημερώνεται μόνη της.
   ===================================================================== */
window.NOES_FUND = {
  goal: 5000,          // στόχος σε € (π.χ. μία υποτροφία)
  raised: 0,           // πόσα έχουν μαζευτεί μέχρι σήμερα, σε €
  share: 10,           // τι ποσοστό (%) των εσόδων από καθοδήγηση & προγράμματα πηγαίνει στο ταμείο
  updated: "2026-10-17"
};

(function () {
  var F = window.NOES_FUND, el = document.documentElement.lang !== "en";
  var fmt = function (n) { return n.toLocaleString(el ? "el-GR" : "en-GB") + " €"; };
  var pct = Math.max(0, Math.min(100, Math.round(F.raised / F.goal * 100)));
  document.querySelectorAll('[data-fund="share"]').forEach(function (e) { e.textContent = F.share + "%"; });
  document.querySelectorAll(".fund-bar").forEach(function (box) {
    box.innerHTML =
      '<div class="fund-track" role="progressbar" aria-valuemin="0" aria-valuemax="' + F.goal + '" aria-valuenow="' + F.raised + '">' +
        '<div class="fund-fill" style="width:' + Math.max(pct, 1.5) + '%"></div></div>' +
      '<div class="fund-nums"><span><b>' + fmt(F.raised) + "</b> " + (el ? "από" : "of") + " " + fmt(F.goal) + "</span>" +
      "<span>" + pct + "% · " + (el ? "ενημέρωση" : "updated") + " " + F.updated.split("-").reverse().join("/") + "</span></div>";
  });
})();
