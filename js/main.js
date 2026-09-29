/* ==========================================================================
   TAKI — Web Design / Website Production — main.js
   ヘッダー / モバイルメニュー / 固定CTA / 連絡先リンク / GSAP ScrollTrigger演出
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * サイト設定
   * ----------------------------------------------------------------
   * Instagram / LINEは確定済みのURLをここで一元管理する。値を空にする
   * (nullに戻す)と、対象リンク(class="js-instagram-link" "js-line-link")
   * はクリックしても遷移せず、「準備中です」の案内を表示する状態に自動で戻る。
   * Emailは未確定のため、これまで通りclass="js-email-link"がpendingのまま。
   * ---------------------------------------------------------------- */
  var SITE_CONFIG = {
    INSTAGRAM_URL: "https://www.instagram.com/_zayemon_/",
    LINE_URL: "https://lin.ee/uHcNxwo",
    EMAIL: null
  };

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
   * ヘッダー：スクロールで背景付与 / モバイルメニュー
   * ---------------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mobileNav");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        document.body.style.overflow = isOpen ? "hidden" : "";
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ------------------------------------------------------------------
   * 連絡先リンク：Instagram / LINE / Email / 相談するCTA
   * ---------------------------------------------------------------- */
  function initContactLinks() {
    // Instagram/LINEは外部SNS・トークアプリへの遷移のため、新しいタブで開く
    // (target="_blank" + rel="noopener noreferrer")。Emailはmailto:なので対象外。
    function bindPending(selector, url, external) {
      document.querySelectorAll(selector).forEach(function (link) {
        if (url) {
          link.setAttribute("href", url);
          link.removeAttribute("aria-disabled");
          link.removeAttribute("title");
          if (external) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
          }
          return;
        }
        link.setAttribute("href", "#");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("title", "準備中です");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.addEventListener("click", function (e) {
          e.preventDefault();
        });
      });
    }

    bindPending(".js-instagram-link", SITE_CONFIG.INSTAGRAM_URL, true);
    bindPending(".js-line-link", SITE_CONFIG.LINE_URL, true);
    bindPending(".js-email-link", SITE_CONFIG.EMAIL ? "mailto:" + SITE_CONFIG.EMAIL : null, false);
  }

  /* ------------------------------------------------------------------
   * スマホ固定CTA：CONTACTセクションに入ったら隠す
   * ---------------------------------------------------------------- */
  function initMobileFixedCta() {
    var cta = document.getElementById("mobileFixedCta");
    var contact = document.getElementById("contact");
    if (!cta || !contact || typeof IntersectionObserver === "undefined") return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          cta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.08 }
    );
    observer.observe(contact);
  }

  /* ------------------------------------------------------------------
   * ABOUT：キャラクターの待機アニメーション
   * ----------------------------------------------------------------
   * 浮遊 + 数秒おきの挨拶の揺れは1本のCSS @keyframes（charIdle）に
   * まとめてあるため、JS側はABOUTセクションが画面内にあるかどうかを
   * IntersectionObserverで監視し、"in-view"クラスの付け外しで
   * animation-play-stateを切り替えるだけでよい（毎フレームのJS処理なし）。
   * prefers-reduced-motionはCSS側の@mediaで無効化される。
   * ---------------------------------------------------------------- */
  function initCharacterAnimation() {
    var visual = document.getElementById("aboutVisual");
    if (!visual || prefersReducedMotion || typeof IntersectionObserver === "undefined") return;

    function setup() {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visual.classList.toggle("in-view", entry.isIntersecting);
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(visual);
    }

    // 初回ペイント前にobserverを登録すると環境によっては最初の交差判定が
    // 取りこぼされることがあるため、次フレーム以降にobserveする。
    if (window.requestAnimationFrame) {
      requestAnimationFrame(function () { requestAnimationFrame(setup); });
    } else {
      setup();
    }
  }

  /* ------------------------------------------------------------------
   * GSAP ScrollTrigger 演出
   * ---------------------------------------------------------------- */
  function initScrollAnimations() {
    if (typeof gsap === "undefined") return;
    if (prefersReducedMotion) return; // CSS側で最初から表示済みのため何もしない

    var hasScrollTrigger = typeof ScrollTrigger !== "undefined";
    if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /* ---- HERO：ロード時の登場演出 ---- */
    var heroImg = document.querySelector('[data-anim="hero-img"]');
    var heroTexts = document.querySelectorAll('[data-anim="hero-text"]');

    var heroTl = gsap.timeline({ delay: 0.15 });
    if (heroImg) {
      heroTl.fromTo(
        heroImg,
        { scale: 1.22, opacity: 0 },
        { scale: 1.08, opacity: 1, duration: 1.4, ease: "power3.out" },
        0
      );
    }
    heroTexts.forEach(function (el, i) {
      heroTl.fromTo(
        el,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.35 + i * 0.1
      );
    });

    if (!hasScrollTrigger) return;

    /* ---- HERO：スクロールで写真がゆっくり縮小 ---- */
    var heroSection = document.querySelector(".hero");
    if (heroImg && heroSection) {
      gsap.to(heroImg, {
        scale: 1,
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: 1 }
      });
    }

    /* ---- 汎用フェードアップ：eyebrow / section-title / 本文など ---- */
    gsap.utils.toArray('[data-anim="fade-up"]').forEach(function (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" }
        }
      );
    });

    /* ---- スタッガー項目：MESSAGE 01-03 / PRICEカード ---- */
    var staggerGroups = {};
    gsap.utils.toArray('[data-anim="stagger-item"]').forEach(function (el) {
      var parent = el.parentElement;
      var groupKey = parent ? parent.className : "default";
      (staggerGroups[groupKey] = staggerGroups[groupKey] || []).push(el);
    });
    Object.keys(staggerGroups).forEach(function (key) {
      var items = staggerGroups[key];
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: items[0].parentElement, start: "top 82%" }
        }
      );
    });

    /* ---- WORKS：画像scale + 情報フェード ---- */
    gsap.utils.toArray('[data-anim="work-reveal"]').forEach(function (item) {
      var media = item.querySelector(".work-media");
      var info = item.querySelector(".work-info");
      var tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 78%" } });
      if (media) tl.fromTo(media, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, 0);
      if (info) tl.fromTo(info, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.15);
    });

    /* ---- SERVICE：スクロールで現在のSTEP番号を強調 ---- */
    gsap.utils.toArray('[data-anim="service-item"]').forEach(function (item) {
      gsap.fromTo(
        item,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 85%" }
        }
      );
      ScrollTrigger.create({
        trigger: item,
        start: "top center",
        end: "bottom center",
        toggleClass: { targets: item, className: "is-active" }
      });
    });

    /* ---- PROCESS：ラインが伸びる + 現在のSTEPを強調 ---- */
    var timelineFill = document.getElementById("timelineFill");
    var timelineWrap = document.querySelector(".process-timeline");
    if (timelineFill && timelineWrap) {
      gsap.to(timelineFill, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timelineWrap,
          start: "top 60%",
          end: "bottom 60%",
          scrub: 0.4
        }
      });
    }
    gsap.utils.toArray('[data-anim="process-step"]').forEach(function (step) {
      gsap.fromTo(
        step,
        { opacity: 0, y: 22 },
        {
          opacity: 1, y: 0, duration: 0.65, ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 85%" }
        }
      );
      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        end: "bottom 60%",
        toggleClass: { targets: step, className: "is-active" }
      });
    });

    /* ---- ABOUT：画像とテキストが違う方向から表示 ---- */
    var aboutVisual = document.querySelector('[data-anim="about-visual"]');
    var aboutText = document.querySelector('[data-anim="about-text"]');
    if (aboutVisual) {
      gsap.fromTo(
        aboutVisual,
        { opacity: 0, x: -36 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: aboutVisual, start: "top 80%" }
        }
      );
    }
    if (aboutText) {
      gsap.fromTo(
        aboutText,
        { opacity: 0, x: 36 },
        {
          opacity: 1, x: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: aboutText, start: "top 80%" }
        }
      );
    }
  }

  /* ------------------------------------------------------------------
   * 初期化
   * ---------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initContactLinks();
    initMobileFixedCta();
    initCharacterAnimation();
    initScrollAnimations();
  });
})();
