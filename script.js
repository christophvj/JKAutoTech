// ==========================================================================
// JK AUTO TECH — Interactions
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------
     Nav fade + hero parallax + page scroll progress
  --------------------------------------------------- */
  const nav = document.querySelector('.navbar');
  const navLogoImg = document.querySelector('.logo img');
  const hero = document.getElementById('hero');
  const heroImage = document.querySelector('.hero-image');
  const progressBar = document.querySelector('.scroll-progress-bar');

  let ticking = false;

  function updateOnScroll() {
    const y = window.scrollY;

    // Navbar background fade
    if (nav) nav.classList.toggle('scrolled', y > 60);
    if (navLogoImg) {
      const wantScrolled = y > 60;
      const wantsSrc = wantScrolled ? 'images/logo_scrolled.png' : 'images/logo_top.png';
      if (!navLogoImg.src.endsWith(wantsSrc)) navLogoImg.src = wantsSrc;
    }

    // Hero "car coming towards you" parallax zoom
    if (heroImage && hero) {
      const heroHeight = hero.offsetHeight || window.innerHeight;
      const progress = Math.min(Math.max(y / heroHeight, 0), 1);
      heroImage.style.transform = `scale(${1 + progress * 0.22})`;
    }

    // Whole-page scroll progress bar
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? y / docHeight : 0;
      progressBar.style.transform = `scaleX(${pct})`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  updateOnScroll();

  /* ---------------------------------------------------
     Scroll-triggered section reveals
  --------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------------------------------------------------
     Services slider: arrows, circle links, autoplay
  --------------------------------------------------- */
  const slider = document.querySelector('.service-slider');
  const slides = slider ? Array.from(slider.querySelectorAll('.active-service')) : [];
  const circles = Array.from(document.querySelectorAll('.service[data-index]'));
  const serviceProgressBar = document.querySelector('.service-progress-bar');
  const btnLeft = document.getElementById('btnArrowLeft');
  const btnRight = document.getElementById('btnArrowRight');

  const AUTOPLAY_MS = 5000;
  let current = 0;
  let autoTimer = null;
  let isSyncingFromScroll = false;

  function syncActiveState(index) {
    circles.forEach((c) => c.classList.toggle('active', Number(c.dataset.index) === index));
    if (serviceProgressBar && slides.length) {
      serviceProgressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
    }
  }

  function goTo(index) {
    if (!slider || !slides.length) return;
    current = (index + slides.length) % slides.length;
    isSyncingFromScroll = true;
    slider.scrollTo({ left: current * slider.clientWidth, behavior: 'smooth' });
    syncActiveState(current);
    window.setTimeout(() => { isSyncingFromScroll = false; }, 500);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function restartAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTOPLAY_MS);
  }

  if (slider && slides.length) {
    btnRight?.addEventListener('click', () => { next(); restartAutoplay(); });
    btnLeft?.addEventListener('click', () => { prev(); restartAutoplay(); });

    circles.forEach((circle) => {
      circle.addEventListener('click', () => {
        goTo(Number(circle.dataset.index));
        restartAutoplay();
      });
    });

    // Keep circles/progress in sync if the user swipes the slider manually
    let scrollDebounce;
    slider.addEventListener('scroll', () => {
      if (isSyncingFromScroll) return;
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        const idx = Math.round(slider.scrollLeft / slider.clientWidth);
        if (idx !== current && idx >= 0 && idx < slides.length) {
          current = idx;
          syncActiveState(current);
        }
      }, 120);
    }, { passive: true });

    window.addEventListener('resize', () => {
      slider.scrollTo({ left: current * slider.clientWidth });
    });

    syncActiveState(current);
    restartAutoplay();
  }
});
