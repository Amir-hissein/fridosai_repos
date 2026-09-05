// Fridos AI Website — Core Interactive Logic & Dynamic Language Switcher

(function () {
  'use strict';

  // 1. Language Manager & Automatic Device Language Detection
  function detectDeviceLanguage() {
    try {
      const saved = localStorage.getItem("fridos_lang");
      if (saved && ["tr", "fr", "en"].includes(saved)) {
        return saved;
      }

      const candidates = [];
      if (Array.isArray(navigator.languages)) {
        candidates.push(...navigator.languages);
      }
      if (navigator.language) {
        candidates.push(navigator.language);
      }
      if (navigator.userLanguage) {
        candidates.push(navigator.userLanguage);
      }

      for (const raw of candidates) {
        if (!raw || typeof raw !== "string") continue;
        const code = raw.toLowerCase().split("-")[0].split("_")[0].trim();
        if (code === "fr") return "fr";
        if (code === "tr") return "tr";
        if (code === "en") return "en";
      }
    } catch (e) {}

    // Universal international fallback
    return "en";
  }

  let currentLang = window.__FRIDOS_INITIAL_LANG__ || detectDeviceLanguage();

  function setLanguage(lang) {
    if (!window.FRIDOS_TRANSLATIONS || !window.FRIDOS_TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('fridos_lang', lang);
    document.documentElement.lang = lang;

    // Update active class on language buttons
    document.querySelectorAll('.lang-btn, .footer-lang-btn, .breadcrumb-lang-btn').forEach((btn) => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update DOM text elements with data-i18n
    const dict = window.FRIDOS_TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const path = el.getAttribute('data-i18n').split('.');
      let val = dict;
      for (const key of path) {
        if (val && val[key] !== undefined) {
          val = val[key];
        } else {
          val = null;
          break;
        }
      }
      if (typeof val === 'string') {
        if (el.getAttribute('data-i18n-html') === 'true') {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Update dynamic document title if specified
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const path = titleEl.getAttribute('data-i18n').split('.');
      let titleVal = dict;
      for (const key of path) {
        if (titleVal && titleVal[key] !== undefined) titleVal = titleVal[key];
        else { titleVal = null; break; }
      }
      if (typeof titleVal === 'string') document.title = titleVal;
    }
  }

  window.setFridosLanguage = setLanguage;

  // 2. Interactive Recipe Swapper (Section 02)
  window.swapRecipeCards = function () {
    const cardBg = document.querySelector('.card-bg-blur');
    const cardFg = document.querySelector('.card-fg-active');
    if (!cardBg || !cardFg) return;

    if (cardFg.classList.contains('card-fg-active')) {
      cardFg.classList.remove('card-fg-active');
      cardFg.classList.add('card-bg-blur');

      cardBg.classList.remove('card-bg-blur');
      cardBg.classList.add('card-fg-active');
    }
  };

  // 3. Mobile Drawer Controller
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileOverlay) {
      mobileOverlay.classList.add('is-open');
      mobileOverlay.setAttribute('aria-hidden', 'false');
    }
    if (hamburgerBtn) {
      hamburgerBtn.classList.add('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileOverlay) {
      mobileOverlay.classList.remove('is-open');
      mobileOverlay.setAttribute('aria-hidden', 'true');
    }
    if (hamburgerBtn) {
      hamburgerBtn.classList.remove('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    document.body.classList.remove('drawer-open');
  }

  // Keep legacy toggleMenu for legal pages that still use it
  window.toggleMenu = function () {
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  // 4. Init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Hamburger button
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        mobileDrawer && mobileDrawer.classList.contains('is-open')
          ? closeDrawer()
          : openDrawer();
      });
    }

    // Drawer close button
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeDrawer);
    }

    // Overlay click closes drawer
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', closeDrawer);
    }

    // Escape key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    // Drawer anchor links: close on navigate
    if (mobileDrawer) {
      mobileDrawer.querySelectorAll('a[href]').forEach((link) => {
        link.addEventListener('click', () => {
          setTimeout(closeDrawer, 80);
        });
      });
    }

    // Bind language buttons
    document.querySelectorAll('.lang-btn, .footer-lang-btn, .breadcrumb-lang-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        if (lang) setLanguage(lang);
      });
    });

    // Bind recipe swapper button
    const swapBtn = document.querySelector('.swap-arrow-pill');
    if (swapBtn) {
      swapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.swapRecipeCards();
      });
    }

    // Apply initial language
    setLanguage(currentLang);

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ── CINEMATIC SCROLL ENGINE ─────────────────────────────────
    const header = document.querySelector('.site-header');

    // 1. Scroll Progress Bar
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    document.body.prepend(progressBar);

    // 2. Hero parallax orbs
    const heroSection = document.querySelector('.hero-wrap');
    if (heroSection) {
      const orb1 = document.createElement('div');
      orb1.className = 'hero-orb hero-orb-1';
      const orb2 = document.createElement('div');
      orb2.className = 'hero-orb hero-orb-2';
      heroSection.style.position = 'relative';
      heroSection.prepend(orb1, orb2);
    }

    // 3. Active nav section tracking
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"], .drawer-nav-link[href^="#"]');

    function getActiveSection() {
      const scrollY = window.scrollY + 120;
      let active = null;
      sections.forEach(sec => {
        if (sec.offsetTop <= scrollY) active = sec.id;
      });
      return active;
    }

    // 4. High-performance scroll driver (rAF-throttled)
    let lastScrollY = 0;
    let ticking = false;
    let prevScrollY = 0;
    let headerVisible = true;

    function onScrollTick() {
      const scrollY = window.scrollY;
      const docH   = document.documentElement.scrollHeight - window.innerHeight;
      const pct    = docH > 0 ? (scrollY / docH) * 100 : 0;

      // — Progress bar
      progressBar.style.width = pct + '%';

      // — Header: scroll state + hide-on-scroll-down
      if (header) {
        if (scrollY > 30) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
          header.classList.remove('is-hidden');
        }
        // Hide header on scroll down, reveal on scroll up
        const delta = scrollY - prevScrollY;
        if (scrollY > 250) {
          if (delta > 4 && headerVisible) {
            header.classList.add('is-hidden');
            headerVisible = false;
          } else if (delta < -4 && !headerVisible) {
            header.classList.remove('is-hidden');
            headerVisible = true;
          }
        }
        prevScrollY = scrollY;
      }

      // — Hero orb parallax
      if (heroSection) {
        const pxInHero = Math.min(scrollY, heroSection.offsetHeight);
        const orb1El = heroSection.querySelector('.hero-orb-1');
        const orb2El = heroSection.querySelector('.hero-orb-2');
        if (orb1El) orb1El.style.transform = `translateY(${pxInHero * 0.12}px) scale(${1 + pxInHero * 0.0002})`;
        if (orb2El) orb2El.style.transform = `translateY(${pxInHero * -0.08}px)`;
      }

      // — Active nav highlight
      const active = getActiveSection();
      navLinks.forEach(link => {
        const target = link.getAttribute('href').slice(1);
        link.classList.toggle('is-active', target === active);
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(onScrollTick);
        ticking = true;
      }
    }, { passive: true });

    // Run once on load
    onScrollTick();

    // ── SCROLL REVEAL ENGINE ──────────────────────────────────
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '100px 0px 40px 0px' }
    );

    // Auto-apply data-reveal to stagger-children and observe all
    document.querySelectorAll('[data-stagger-children]').forEach((group) => {
      revealObserver.observe(group);
      Array.from(group.children).forEach((child) => {
        if (!child.hasAttribute('data-reveal')) {
          child.setAttribute('data-reveal', 'fade-up');
        }
        revealObserver.observe(child);
      });
    });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      revealObserver.observe(el);
    });

    // Failsafe: Ensure visible on initial load
    setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150) {
          el.classList.add('is-visible');
        }
      });
    }, 300);

    // ── MEAL SCANNER REALTIME COUNTER ENGINE ─────────────────
    function initMealScannerCounters() {
      const viewfinder = document.querySelector('.hud-viewfinder');
      if (!viewfinder) return;

      const counterElements = viewfinder.querySelectorAll('.counter-val');
      const chips = viewfinder.querySelectorAll('.ai-chip');
      let isAnimating = false;

      function runScanCounterAnimation() {
        if (isAnimating) return;
        isAnimating = true;

        // Staggered highlight on chips as laser sweeps past them
        chips.forEach((chip, index) => {
          setTimeout(() => {
            chip.classList.add('is-detecting');
            setTimeout(() => chip.classList.remove('is-detecting'), 1400);
          }, index * 350);
        });

        counterElements.forEach((el, index) => {
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const duration = 1600;
          const startTime = performance.now();
          const startVal = 0;

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease Out Cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(startVal + (target - startVal) * easeOut);
            el.textContent = currentVal;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = target;
            }
          }

          setTimeout(() => {
            requestAnimationFrame(updateCount);
          }, index * 140);
        });

        setTimeout(() => {
          isAnimating = false;
        }, 2600);
      }

      // Trigger on viewport enter
      const scanObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runScanCounterAnimation();
          }
        });
      }, { threshold: 0.25 });

      scanObserver.observe(viewfinder);

      // Periodic refresh count synchronized with laser sweep (every 7 seconds)
      setInterval(() => {
        const rect = viewfinder.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
          runScanCounterAnimation();
        }
      }, 7000);
    }

    initMealScannerCounters();
    // ─────────────────────────────────────────────────────────
  });
})();
