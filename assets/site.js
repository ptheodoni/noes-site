/* =====================================================================
   Νόες — κοινή κεφαλίδα, μενού και υποσέλιδο για ΟΛΕΣ τις σελίδες.
   Για να προσθέσεις/αλλάξεις ένα στοιχείο του μενού, άλλαξε ΜΟΝΟ τις
   λίστες MENU πιο κάτω· δεν χρειάζεται να πειράξεις τις σελίδες.
   ===================================================================== */
(function () {
  "use strict";

  // Κάθε σελίδα λέει στο <html> πού είναι η ρίζα του site (data-root),
  // π.χ. "../" για μια σελίδα σε φάκελο. Έτσι οι σύνδεσμοι δουλεύουν παντού.
  var html = document.documentElement;
  var ROOT = html.getAttribute("data-root") || "";
  var LANG = html.lang === "en" ? "en" : "el";
  var HERE = html.getAttribute("data-page") || "";   // ποια σελίδα είναι (για να φωτίζεται στο μενού)

  // --- Το μενού. "id" = ίδιο με το data-page της σελίδας. "sub" = υπομενού. ---
  var MENU = {
    el: [
      { id: "ekdoseis", label: "Εκδόσεις", href: "ekdoseis/" },
      { id: "seminaria", label: "Σεμινάρια", href: "seminaria/", sub: [
        { id: "seminaria", label: "Όλα τα σεμινάρια", href: "seminaria/" },
        { id: "artemis", label: "Open-air Seminar on Artemis", href: "seminaria/artemis/" },
        { id: "anoia", label: "Κατανοώντας την Άνοια", href: "seminaria/anoia/" }
      ] },
      { id: "ereuna", label: "Έρευνα", href: "ereuna/" },
      { id: "symvouleftiki", label: "Συμβουλευτική", href: "symvouleftiki/" },
      { id: "dimiourgies", label: "Δημιουργίες", href: "dimiourgies/" },
      { id: "sxetika", label: "Σχετικά", href: "sxetika/" }
    ],
    en: [
      { id: "publications", label: "Publications", href: "en/publications/" },
      { id: "seminars", label: "Seminars", href: "en/seminars/", sub: [
        { id: "seminars", label: "All seminars", href: "en/seminars/" },
        { id: "artemis", label: "Open-air Seminar on Artemis", href: "en/seminars/artemis/" },
        { id: "dementia", label: "Understanding Dementia", href: "en/seminars/dementia/" }
      ] },
      { id: "research", label: "Research", href: "en/research/" },
      { id: "consulting", label: "Consulting", href: "en/consulting/" },
      { id: "creations", label: "Creations", href: "en/creations/" },
      { id: "about", label: "About", href: "en/about/" }
    ]
  };

  // --- Στοιχεία υποσέλιδου ---
  var FOOTER = {
    el: "© " + new Date().getFullYear() + " Νόες · Επιστήμη και φιλοσοφία για όλους · info@noes.gr",
    en: "© " + new Date().getFullYear() + " Noes · Science and philosophy for everyone · info@noes.gr"
  };

  // Η αντίστοιχη σελίδα στην άλλη γλώσσα: <meta name="alt-lang" content="en/about/">
  var altMeta = document.querySelector('meta[name="alt-lang"]');
  var ALT = altMeta ? altMeta.getAttribute("content") : (LANG === "el" ? "en/" : "");

  function link(item) {
    var cur = item.id === HERE ? ' aria-current="page"' : "";
    return '<a href="' + ROOT + item.href + '"' + cur + ">" + item.label + "</a>";
  }
  // Ανάμεσα στα στοιχεία του μενού μπαίνει τελεία «•»· πριν από το τελευταίο
  // (Σχετικά / About) μπαίνει κάθετη γραμμή «|», όπως στο παλιό site.
  function menuHTML() {
    var items = MENU[LANG];
    return items.map(function (item, i) {
      var sep = i === 0 ? "" : '<span class="sep" aria-hidden="true">' + (i === items.length - 1 ? "|" : "•") + "</span>";
      if (!item.sub) return sep + link(item);
      return sep + "<details><summary>" + item.label + '</summary><div class="sub">' + item.sub.map(link).join("") + "</div></details>";
    }).join("");
  }
  // «ελ / en» πάνω δεξιά· η τρέχουσα γλώσσα είναι έντονη, η άλλη είναι σύνδεσμος
  function langHTML() {
    var other = '<a href="' + ROOT + ALT + '" lang="' + (LANG === "el" ? "en" : "el") + '">' + (LANG === "el" ? "en" : "ελ") + "</a>";
    var cur = "<b>" + (LANG === "el" ? "ελ" : "en") + "</b>";
    return LANG === "el" ? cur + " / " + other : other + " / " + cur;
  }

  var head = document.getElementById("site-header");
  if (head) {
    head.className = "site-header";
    // Το λογότυπο είναι η χειρόγραφη υπογραφή images/noes-signature.png
    head.innerHTML = '<div class="wrap"><a class="logo" href="' + ROOT + (LANG === "en" ? "en/" : "") + '">' +
      '<img src="' + ROOT + 'images/noes-signature.png" alt="' + (LANG === "el" ? "Νόες" : "Noes") + '" width="130" height="58"></a>' +
      '<nav class="nav" aria-label="' + (LANG === "el" ? "Κύριο μενού" : "Main menu") + '">' + menuHTML() + "</nav>" +
      '<div class="lang">' + langHTML() + "</div></div>";
  }
  var foot = document.getElementById("site-footer");
  if (foot) { foot.className = "site-footer"; foot.innerHTML = '<div class="wrap"><span>' + FOOTER[LANG] + "</span></div>"; }

  // Κλείνει το υπομενού όταν πατάς έξω από αυτό
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".nav details[open]").forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute("open"); });
  });

  // --- Παλιές διευθύνσεις του WordPress (?page_id=…) → νέες σελίδες ---
  // Αν κάποιος έχει αποθηκευμένο παλιό σύνδεσμο, πηγαίνει στη σωστή νέα σελίδα.
  var OLD = { "167": "ekdoseis/", "157": "seminaria/", "163": "seminaria/artemis/", "159": "seminaria/anoia/",
              "161": "en/seminars/dementia/", "168": "ereuna/", "169": "symvouleftiki/", "393": "sxetika/" };
  var m = location.search.match(/[?&]page_id=(\d+)/);
  if (m && OLD[m[1]]) location.replace(ROOT + OLD[m[1]]);
})();
