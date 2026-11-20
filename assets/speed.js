/* =====================================================================
   Ταχύτητα ακρόασης: ένα κουμπί που δείχνει την τρέχουσα ταχύτητα (π.χ. «1×»).
   Με κλικ ανοίγει μικρό μενού με τις επιλογές 0,75× 1× 1,25× 1,5× 2×.
   Χρήση: noesSpeed(audioElement, στοιχείοΌπουΜπαίνειΤοΚουμπί)
   Η επιλογή θυμάται στον browser του αναγνώστη (αν επιτρέπεται).
   ===================================================================== */
window.noesSpeed = function (au, where) {
  var RATES = [0.75, 1, 1.25, 1.5, 2], KEY = 'noes-speed', r = 1;
  var EN = document.documentElement.lang === 'en';
  try { r = parseFloat(localStorage.getItem(KEY)) || 1; } catch (e) {}
  var fmt = function (v) { return String(v).replace('.', EN ? '.' : ',') + '×'; };

  var box = document.createElement('div'); box.className = 'speed';
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'speed-btn';
  btn.title = EN ? 'Playback speed' : 'Ταχύτητα';
  btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false');
  var menu = document.createElement('div'); menu.className = 'speed-menu'; menu.hidden = true;
  box.appendChild(btn); box.appendChild(menu);

  function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  function apply(v) {
    r = v; au.defaultPlaybackRate = v; au.playbackRate = v;
    try { localStorage.setItem(KEY, v); } catch (e) {}
    btn.textContent = fmt(v);
    Array.prototype.forEach.call(menu.children, function (b) { b.classList.toggle('on', +b.dataset.r === v); });
  }
  RATES.forEach(function (v) {
    var b = document.createElement('button'); b.type = 'button'; b.dataset.r = v; b.textContent = fmt(v);
    b.onclick = function () { apply(v); close(); };
    menu.appendChild(b);
  });
  btn.onclick = function (e) {
    e.stopPropagation();
    menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden));
  };
  document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });

  // όταν αλλάζει κομμάτι, ο browser ξαναβάζει 1× — το ξαναεφαρμόζουμε
  au.addEventListener('loadedmetadata', function () { au.playbackRate = r; });
  au.addEventListener('play', function () { if (au.playbackRate !== r) au.playbackRate = r; });
  where.appendChild(box); apply(r);
  return box;
};
