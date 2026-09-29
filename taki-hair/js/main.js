(function () {
  "use strict";

  /* Loader */
  window.addEventListener("load", function () {
    var loader = document.querySelector(".loader");
    if (!loader) return;
    setTimeout(function () {
      loader.classList.add("is-hidden");
    }, 250);
  });

  /* Sticky header */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* Scroll fade-up animations */
  var animatedEls = document.querySelectorAll("[data-anim]");
  if ("IntersectionObserver" in window && animatedEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    animatedEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    animatedEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Fixed CTA: fade in once the hero (first view) has been scrolled past */
  var floatingCta = document.getElementById("floating-cta");
  var heroSection = document.getElementById("hero");
  if (floatingCta && heroSection) {
    if ("IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            floatingCta.classList.toggle("is-visible", !entry.isIntersecting);
          });
        },
        { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
      );
      heroObserver.observe(heroSection);
    } else {
      floatingCta.classList.add("is-visible");
    }
  }

  /* Smooth-scroll offset for fixed header on in-page links */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerHeight = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });
})();
