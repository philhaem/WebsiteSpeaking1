(function () {
  var root = document.documentElement;
  var titles = {
    de: root.getAttribute("data-title-de") || document.title,
    en: root.getAttribute("data-title-en") || document.title
  };
  function setLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.title = titles[lang];
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  var fromUrl = new URLSearchParams(location.search).get("lang");
  var browser = (navigator.language || "de").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  var initial = fromUrl === "de" || fromUrl === "en" ? fromUrl : (saved === "de" || saved === "en" ? saved : browser);
  setLang(initial);
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); });
  });
})();

// Parallax: photos move slower than the text
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var frames = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  var heroText = document.querySelector(".hero .wrap");
  var ticking = false;
  // Each line follows its scroll target with a soft lag, so the motion stays fluid
  // even with notchy mouse wheels.
  function target(s, vh) {
    var r = s.el.getBoundingClientRect();
    // starts as the line is well onto the screen, settles a little above the middle
    var p = (vh * 0.9 - r.top) / (vh * 0.525);
    return Math.max(0, Math.min(1, p));
  }
  function apply(s) {
    var p = s.cur;
    var e = p * p * p * (p * (p * 6 - 15) + 10);   // smootherstep: soft start, soft finish
    var k = (1 - e) * SPREAD;
    s.words.forEach(function (w) {
      w.el.style.transform = "translate3d(" + (w.dx * k).toFixed(2) + "px,0,0)";
    });
    s.el.style.opacity = (0.35 + 0.65 * e).toFixed(3);
  }
  function update() {
    ticking = false;
    var vh = window.innerHeight, moving = false;
    sets.forEach(function (s) {
      var t = target(s, vh);
      if (s.cur === undefined) s.cur = t;
      var d = t - s.cur;
      if (Math.abs(d) > 0.001) { s.cur += d * 0.12; moving = true; } else { s.cur = t; }
      apply(s);
    });
    if (moving) { ticking = true; requestAnimationFrame(update); }
  }
  function relayout() { measure(); sets.forEach(function (s) { s.cur = undefined; }); update(); }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  document.querySelectorAll("[data-set-lang]").forEach(function (b) { b.addEventListener("click", function () { setTimeout(relayout, 0); }); });
  relayout();
})();

// "Get in touch" opens the contact form
document.querySelectorAll("[data-open-form]").forEach(function (b) {
  b.addEventListener("click", function () {
    var f = document.getElementById(b.getAttribute("data-open-form"));
    if (!f) return;
    f.hidden = false;
    b.parentNode.hidden = true;
    var first = f.querySelector("input:not([type=hidden]):not([name=bot-field])");
    if (first) first.focus();
  });
});
