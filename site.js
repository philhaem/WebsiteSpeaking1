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
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    frames.forEach(function (f) {
      var r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var pic = f.querySelector("picture");
      if (!pic) return;
      var shift;
      if (f.classList.contains("hero")) {
        shift = -r.top * 0.45;            // hero photo lags behind the page
      } else {
        var progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        shift = progress * r.height * 0.1;
      }
      pic.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
    });
    if (heroText) {
      var y = Math.min(window.scrollY, vh);
      heroText.style.transform = "translate3d(0," + (-y * 0.15).toFixed(1) + "px,0)";
      heroText.style.opacity = String(Math.max(0, 1 - y / (vh * 0.8)));
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

// Text and photos ease in as they scroll into view
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var els = document.querySelectorAll("main .label, main h2, main h3, main p, .places li, .gallery figure, .about-grid figure");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
})();

// Pull lines: words start spread apart and glide into place as the line scrolls up
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".fill-words"));
  if (!blocks.length) return;
  var SPREAD = 0.45;   // how far apart the words start (share of their distance from the centre)
  var sets = blocks.map(function (el) {
    el.classList.remove("reveal");
    var words = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var span = document.createElement("span");
        span.className = "w";
        span.textContent = part;
        frag.appendChild(span);
        words.push({ el: span, dx: 0 });
      });
      el.replaceChild(frag, node);
    });
    return { el: el, words: words, slow: el.hasAttribute("data-slow") };
  });
  function measure() {
    sets.forEach(function (s) {
      var box = s.el.getBoundingClientRect();
      var mid = box.left + box.width / 2;
      s.words.forEach(function (w) {
        w.el.style.transform = "none";
        var r = w.el.getBoundingClientRect();
        w.dx = (r.left + r.width / 2) - mid;
      });
    });
  }
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    sets.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      // 0 as the line enters at the bottom, 1 once it is just above the middle
      var p = (vh - r.top) / (vh * (s.slow ? 0.85 : 0.55));   // slow lines take longer to come together
      p = Math.max(0, Math.min(1, p));
      var e = 1 - Math.pow(1 - p, 3);   // ease out
      var k = (1 - e) * SPREAD;
      s.words.forEach(function (w) {
        w.el.style.transform = "translate3d(" + (w.dx * k).toFixed(1) + "px,0,0)";
      });
      s.el.style.opacity = (0.35 + 0.65 * e).toFixed(2);
    });
  }
  function relayout() { measure(); update(); }
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

// Gallery lightbox: click a photo to see it large and uncropped
(function () {
  var figs = Array.prototype.slice.call(document.querySelectorAll(".gallery-wide figure"));
  if (!figs.length) return;
  function bigSrc(img) {
    var set = img.getAttribute("srcset");
    if (!set) return img.getAttribute("src");
    var parts = set.split(",").map(function (s) { return s.trim().split(/\s+/)[0]; });
    return parts[parts.length - 1];
  }
  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-next" type="button" aria-label="Next"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>';
  document.body.appendChild(box);
  var img = box.querySelector("img"), cap = box.querySelector("figcaption");
  var current = 0, lastFocus = null;
  function show(i) {
    current = (i + figs.length) % figs.length;
    var f = figs[current], src = f.querySelector("img");
    img.src = bigSrc(src);
    var fc = f.querySelector("figcaption");
    cap.innerHTML = fc ? fc.innerHTML : "";
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.documentElement.classList.add("lb-open");
    box.querySelector(".lb-close").focus();
  }
  function close() {
    box.hidden = true;
    document.documentElement.classList.remove("lb-open");
    if (lastFocus) lastFocus.focus();
  }
  figs.forEach(function (f, i) {
    var pic = f.querySelector("picture");
    pic.setAttribute("tabindex", "0");
    pic.setAttribute("role", "button");
    pic.setAttribute("aria-label", "Open photo");
    pic.addEventListener("click", function () { open(i); });
    pic.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
  });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(current - 1); });
  box.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(current + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  });
  // Swipe on phones
  var x0 = null;
  box.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
})();
