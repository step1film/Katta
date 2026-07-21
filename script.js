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
  const LIFE = 600;  // ms each point stays alive -> trail works at any speed
  const STEP = 3;    // interpolate a point every few px -> dense, smooth line
  let last = null;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    const x = e.clientX, y = e.clientY;
    if (last) {
      const dx = x - last.x, dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist > STEP) {
        const n = Math.floor(dist / STEP);
        for (let i = 1; i <= n; i++) {
          pts.push({ x: last.x + (dx * i) / n, y: last.y + (dy * i) / n, t: now });
        }
      }
    }
    pts.push({ x, y, t: now });
    last = { x, y };
  });

  let hue = 0;
  function draw() {
    const now = performance.now();
    while (pts.length && now - pts[0].t > LIFE) pts.shift(); // age out old points
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const n = pts.length;
    if (n > 2) {
      // Build ONE tapered ribbon polygon, so a single fill can't stack into dots.
      const left = [], right = [];
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        const life = Math.max(0, 1 - (now - p.t) / LIFE);
        const w = life * 1.6 + 0.25;                  // half-width: thin, tapered
        const a = pts[i > 0 ? i - 1 : 0];
        const b = pts[i < n - 1 ? i + 1 : n - 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;          // unit normal
        left.push([p.x + nx * w, p.y + ny * w]);
        right.push([p.x - nx * w, p.y - ny * w]);
      }
      ctx.beginPath();
      ctx.moveTo(left[0][0], left[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
      ctx.closePath();
      // Rainbow gradient along the trail that also fades toward the tail.
      const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[n - 1].x, pts[n - 1].y);
      for (let s = 0; s <= 8; s++) {
        const f = s / 8;                              // 0 = tail, 1 = head
        g.addColorStop(f, "hsla(" + ((hue + f * 320) % 360) + ", 60%, 62%, " + (0.15 + f * 0.55) + ")");
      }
      ctx.fillStyle = g;
      ctx.fill();
    }
    hue = (hue + 1.5) % 360;
    requestAnimationFrame(draw);
  }
  draw();
})();
