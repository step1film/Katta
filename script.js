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
