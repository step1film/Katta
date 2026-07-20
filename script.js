(function () {
  const pages = document.querySelectorAll(".page");
  const links = document.querySelectorAll("[data-nav]");

  function show(id) {
    if (!document.getElementById(id)) id = "home";

    pages.forEach((p) => p.classList.toggle("is-active", p.id === id));

    document.querySelectorAll(".menu a").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === id);
    });

    if (history.replaceState) {
      history.replaceState(null, "", "#" + id);
    }
  }

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      show(link.dataset.nav);
      // scroll to top on small screens where pages stack
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  window.addEventListener("hashchange", () => {
    show(location.hash.replace("#", "") || "home");
  });

  show(location.hash.replace("#", "") || "home");
})();

/* Image slideshows */
(function () {
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".slider").forEach((slider) => {
    const track = slider.querySelector(".slides");
    const slides = Array.from(track.children);
    if (slides.length < 2) return;

    const dotsWrap = slider.querySelector(".dots");
    let idx = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "dot";
      d.type = "button";
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => go(i));
      dotsWrap.appendChild(d);
    });
    const dots = Array.from(dotsWrap.children);

    function update() {
      track.style.transform = "translateX(" + -idx * 100 + "%)";
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    }
    function go(i) {
      idx = (i + slides.length) % slides.length;
      update();
      restart();
    }
    function restart() {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(() => go(idx + 1), 3000);
    }

    slider.querySelector(".s-prev").addEventListener("click", () => go(idx - 1));
    slider.querySelector(".s-next").addEventListener("click", () => go(idx + 1));
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restart);

    let x0 = null;
    slider.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    update();
    restart();
  });
})();

/* Rainbow trail that follows the prism cursor */
(function () {
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Skip on touch-only devices (no cursor to trail)
  if (reduce || !window.matchMedia("(hover: hover)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "rainbow-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const pts = [];
  const MAX = 190;   // trail length in points
  const STEP = 4;    // interpolate a point every few px -> dense, smooth line
  let last = null;
  window.addEventListener("mousemove", (e) => {
    const x = e.clientX, y = e.clientY;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist > STEP) {
        const n = Math.floor(dist / STEP);
        for (let i = 1; i <= n; i++) {
          pts.push({ x: last.x + (dx * i) / n, y: last.y + (dy * i) / n });
        }
      }
    }
    pts.push({ x, y });
    last = { x, y };
    while (pts.length > MAX) pts.shift();
  });

  let hue = 0;
  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const n = pts.length;
    for (let i = 1; i < n; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const t = i / n;                       // 0 = tail, 1 = head (cursor)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      ctx.strokeStyle = "hsla(" + ((hue + i * 2.6) % 360) + ", 95%, 56%, " + (0.12 + t * 0.88) + ")";
      ctx.lineWidth = t * t * 7 + 0.6;       // thin tail tapering to a thick head
      ctx.beginPath();
      if (i > 1) {
        const prev = pts[i - 2];
        ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
        ctx.quadraticCurveTo(a.x, a.y, mid.x, mid.y); // smooth through each point
      } else {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mid.x, mid.y);
      }
      ctx.stroke();
    }
    hue = (hue + 2) % 360;
    // let the tail recede smoothly when the mouse rests
    for (let k = 0; k < 3 && pts.length; k++) pts.shift();
    requestAnimationFrame(draw);
  }
  draw();
})();
