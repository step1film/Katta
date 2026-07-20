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
  const MAX = 24;
  window.addEventListener("mousemove", (e) => {
    pts.push({ x: e.clientX, y: e.clientY });
    if (pts.length > MAX) pts.shift();
  });

  let hue = 0;
  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const t = i / pts.length;
      ctx.strokeStyle = "hsla(" + ((hue + i * 14) % 360) + ", 95%, 55%, " + (t * 0.9) + ")";
      ctx.lineWidth = t * 7 + 1;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    hue = (hue + 3) % 360;
    // shorten the tail when the mouse is still
    if (pts.length && Math.random() < 0.35) pts.shift();
    requestAnimationFrame(draw);
  }
  draw();
})();
