/* =====================================================================
   Ακρόαση μέσα στη σελίδα ανάγνωσης (κοινό για όλα τα βιβλία)
   - Κάθε σελίδα ανάγνωσης ορίζει πριν από αυτό το αρχείο:
       window.READER_TRACKS = [ { title, src, page, x, y, h, sync }, … ]
     page = σελίδα του PDF (από 1), x/y/h = θέση του τίτλου σε % της σελίδας
     (για το κουμπί ▶), sync = (προαιρετικό) αρχείο .json με τους χρόνους
     των προτάσεων για την επισήμανση του κειμένου.
   - Η σειρά της λίστας = σειρά αναπαραγωγής· στο τέλος ενός κομματιού
     ξεκινά αυτόματα το επόμενο.
   ===================================================================== */
(function () {
  var T = window.READER_TRACKS || [];
  if (!T.length) return;
  var EN = /lang=en/.test(location.search);
  var reader = document.getElementById('reader');

  // ---- Μπάρα αναπαραγωγής, σταθερή στο κάτω μέρος της οθόνης ----
  var bar = document.createElement('div');
  bar.className = 'reader-player'; bar.hidden = true;
  bar.innerHTML = '<span class="rp-title"></span><audio controls preload="none"></audio>' +
    '<button type="button" class="rp-close" aria-label="' + (EN ? 'Close' : 'Κλείσιμο') + '">×</button>';
  document.body.appendChild(bar);
  var au = bar.querySelector('audio'), titleEl = bar.querySelector('.rp-title');
  if (window.noesSpeed) noesSpeed(au, bar.insertBefore(document.createElement('div'), bar.querySelector('.rp-close'))).parentNode.className = 'rp-speed';
  bar.querySelector('.rp-close').onclick = function () { au.pause(); bar.hidden = true; clearHL(); };

  var cur = -1, sync = null, hl = [], lastS = -1;

  function pageDiv(n) { return reader.children[n - 1]; }
  function clearHL() { hl.forEach(function (e) { e.remove(); }); hl = []; lastS = -1; }

  function play(i) {
    if (i < 0 || i >= T.length) { bar.hidden = true; clearHL(); return; }
    cur = i; sync = null; clearHL();
    au.src = T[i].src; titleEl.textContent = (i + 1) + '. ' + T[i].title;
    bar.hidden = false; au.play();
    if (T[i].sync) fetch(T[i].sync).then(function (r) { return r.json(); }).then(function (d) { if (cur === i) sync = d; });
    else { var d = pageDiv(T[i].page); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  au.addEventListener('ended', function () { play(cur + 1); });

  // ---- Επισήμανση της πρότασης που ακούγεται (αν υπάρχει αρχείο sync) ----
  au.addEventListener('timeupdate', function () {
    if (!sync) return;
    var t = au.currentTime, s = -1;
    for (var k = 0; k < sync.length; k++) { if (sync[k].s <= t) s = k; else break; }
    if (s === lastS) return;
    clearHL(); lastS = s; if (s < 0) return;
    sync[s].rr.forEach(function (r, j) {               // r = [x, y, πλάτος, ύψος, σελίδα(από 0)]
      var div = pageDiv(r[4] + 1); if (!div) return;
      var e = document.createElement('div'); e.className = 'reader-hl';
      e.style.left = r[0] + '%'; e.style.top = r[1] + '%'; e.style.width = r[2] + '%'; e.style.height = r[3] + '%';
      div.appendChild(e); hl.push(e);
      if (j === 0) {                                     // κράτα την πρόταση μέσα στην οθόνη
        var b = e.getBoundingClientRect();
        if (b.top < 90 || b.bottom > innerHeight - 110) window.scrollTo({ top: scrollY + b.top - innerHeight / 3, behavior: 'smooth' });
      }
    });
  });

  // ---- Κουμπιά ▶ δίπλα στον τίτλο κάθε κεφαλαίου ----
  // (οι σελίδες δημιουργούνται αφού φορτώσει το PDF, γι' αυτό περιμένουμε να εμφανιστούν)
  function addButtons() {
  T.forEach(function (tr, i) {
    var div = pageDiv(tr.page); if (!div) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'reader-play';
    b.title = (EN ? 'Listen: ' : 'Άκουσε: ') + tr.title;
    b.setAttribute('aria-label', b.title);
    b.textContent = '▶';
    b.style.left = Math.max(1, tr.x - 6) + '%'; b.style.top = (tr.y + tr.h / 2) + '%';
    b.onclick = function () { play(i); };
    div.appendChild(b);
  });
  }
  if (reader.children.length) addButtons();
  else new MutationObserver(function (m, obs) {
    if (reader.children.length) { obs.disconnect(); setTimeout(addButtons, 0); }
  }).observe(reader, { childList: true });
})();
