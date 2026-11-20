/* =====================================================================
   Ταχύτητα ακρόασης: κουμπιά 0.75× 1× 1.25× 1.5× 2× δίπλα σε έναν player.
   Χρήση: noesSpeed(audioElement, στοιχείοΌπουΜπαίνουνΤαΚουμπιά)
   Η επιλογή θυμάται στον browser του αναγνώστη (αν επιτρέπεται).
   ===================================================================== */
window.noesSpeed = function (au, where) {
  var RATES = [0.75, 1, 1.25, 1.5, 2], KEY = 'noes-speed', r = 1;
  try { r = parseFloat(localStorage.getItem(KEY)) || 1; } catch (e) {}
  var box = document.createElement('div');
  box.className = 'speed'; box.setAttribute('role', 'group');
  box.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Playback speed' : 'Ταχύτητα');
  function apply(v) {
    r = v; au.defaultPlaybackRate = v; au.playbackRate = v;
    try { localStorage.setItem(KEY, v); } catch (e) {}
    Array.prototype.forEach.call(box.children, function (b) { b.classList.toggle('on', +b.dataset.r === v); });
  }
  RATES.forEach(function (v) {
    var b = document.createElement('button'); b.type = 'button'; b.dataset.r = v;
    b.textContent = String(v).replace('.', ',') + '×';
    b.onclick = function () { apply(v); };
    box.appendChild(b);
  });
  // όταν αλλάζει κομμάτι, ο browser ξαναβάζει 1× — το ξαναεφαρμόζουμε
  au.addEventListener('loadedmetadata', function () { au.playbackRate = r; });
  au.addEventListener('play', function () { if (au.playbackRate !== r) au.playbackRate = r; });
  where.appendChild(box); apply(r);
  return box;
};
