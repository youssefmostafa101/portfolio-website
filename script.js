(() => {
  'use strict';

  // ============================================
  // Header scroll state
  // ============================================
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============================================
  // Mobile menu toggle
  // ============================================
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.hasAttribute('hidden');
      if (isOpen) {
        mobileMenu.setAttribute('hidden', '');
        menuToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.removeAttribute('hidden');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.setAttribute('hidden', '');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================
  // FAQ accordion
  // ============================================
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const answerId = button.getAttribute('aria-controls');
      const answer = document.getElementById(answerId);
      if (!answer) return;

      button.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        answer.setAttribute('hidden', '');
      } else {
        answer.removeAttribute('hidden');
      }
    });
  });

  // ============================================
  // Subtle fade-in on scroll
  // ============================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.section, .hero-section');
    targets.forEach(el => el.classList.add('fade-in'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  // ============================================
  // Lightbox — zoom + pan email previews
  // ============================================
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = document.getElementById('lbImg');
    const lbCaption = document.getElementById('lbCaption');
    const lbStage = document.getElementById('lbStage');

    let scale = 1;
    let tx = 0;
    let ty = 0;
    let lastTrigger = null;
    const MIN = 1;
    const MAX = 5;

    function apply(smooth) {
      lbImg.classList.toggle('smooth', !!smooth);
      lbImg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    function resetTransform() {
      scale = 1; tx = 0; ty = 0;
      apply(true);
    }

    function openLightbox(src, caption, trigger) {
      lastTrigger = trigger || null;
      lbImg.src = src;
      lbImg.alt = caption || 'Email preview';
      lbCaption.textContent = caption || '';
      resetTransform();
      lightbox.removeAttribute('hidden');
      document.body.classList.add('lb-open');
      // fade in
      lightbox.classList.add('opening');
      requestAnimationFrame(() => lightbox.classList.remove('opening'));
    }

    function closeLightbox() {
      lightbox.classList.add('closing');
      const done = () => {
        lightbox.setAttribute('hidden', '');
        lightbox.classList.remove('closing');
        document.body.classList.remove('lb-open');
        lbImg.src = '';
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
        lightbox.removeEventListener('transitionend', done);
      };
      lightbox.addEventListener('transitionend', done);
      // Fallback if transitionend doesn't fire
      setTimeout(() => { if (!lightbox.hasAttribute('hidden')) done(); }, 260);
    }

    function setZoom(next, originX, originY) {
      const prev = scale;
      scale = Math.min(MAX, Math.max(MIN, next));
      if (scale === MIN) { tx = 0; ty = 0; }
      else if (typeof originX === 'number') {
        // zoom toward cursor position within stage
        const rect = lbStage.getBoundingClientRect();
        const cx = originX - rect.left - rect.width / 2;
        const cy = originY - rect.top - rect.height / 2;
        const ratio = scale / prev;
        tx = cx - (cx - tx) * ratio;
        ty = cy - (cy - ty) * ratio;
      }
      apply(true);
    }

    // Triggers
    document.querySelectorAll('[data-lightbox]').forEach(btn => {
      btn.addEventListener('click', () => {
        openLightbox(btn.getAttribute('data-src'), btn.getAttribute('data-caption'), btn);
      });
    });

    // Close controls
    lightbox.querySelectorAll('[data-lb-close]').forEach(el => {
      el.addEventListener('click', closeLightbox);
    });
    lightbox.querySelector('[data-lb-zoom-in]').addEventListener('click', () => setZoom(scale + 0.5));
    lightbox.querySelector('[data-lb-zoom-out]').addEventListener('click', () => setZoom(scale - 0.5));
    lightbox.querySelector('[data-lb-zoom-reset]').addEventListener('click', resetTransform);

    // Wheel zoom
    lbStage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.3 : -0.3;
      setZoom(scale + delta, e.clientX, e.clientY);
    }, { passive: false });

    // Drag to pan
    let dragging = false;
    let startX = 0, startY = 0, startTx = 0, startTy = 0;
    lbImg.addEventListener('pointerdown', (e) => {
      if (scale <= MIN) return;
      dragging = true;
      lbImg.classList.add('dragging');
      startX = e.clientX; startY = e.clientY; startTx = tx; startTy = ty;
      lbImg.setPointerCapture(e.pointerId);
    });
    lbImg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      tx = startTx + (e.clientX - startX);
      ty = startTy + (e.clientY - startY);
      apply(false);
    });
    function endDrag() { dragging = false; lbImg.classList.remove('dragging'); }
    lbImg.addEventListener('pointerup', endDrag);
    lbImg.addEventListener('pointercancel', endDrag);

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) closeLightbox();
    });
  }

  // ============================================
  // Lead magnet — floating button + auto-pop modal
  // ============================================
  const leadModal = document.getElementById('leadModal');
  const leadFab = document.getElementById('leadFab');
  if (leadModal) {
    const SS_KEY = 'yusef_leadmagnet_shown';
    let leadLastFocus = null;
    let fabClicked = false;
    let autoTimer = null;

    function openLead(trigger) {
      leadLastFocus = trigger || document.activeElement;
      leadModal.removeAttribute('hidden');
      requestAnimationFrame(() => leadModal.classList.add('visible'));
      document.body.classList.add('lb-open');
      const dl = document.getElementById('leadDownload');
      if (dl) dl.focus();
    }

    function closeLead(setFlag) {
      leadModal.classList.remove('visible');
      if (setFlag) {
        try { sessionStorage.setItem(SS_KEY, '1'); } catch (e) {}
      }
      const done = () => {
        leadModal.setAttribute('hidden', '');
        document.body.classList.remove('lb-open');
        if (leadLastFocus && typeof leadLastFocus.focus === 'function') leadLastFocus.focus();
        leadModal.removeEventListener('transitionend', done);
      };
      leadModal.addEventListener('transitionend', done);
      setTimeout(() => { if (!leadModal.hasAttribute('hidden') && !leadModal.classList.contains('visible')) done(); }, 220);
    }

    function alreadyShown() {
      try { return sessionStorage.getItem(SS_KEY) === '1'; } catch (e) { return false; }
    }

    // Side button
    if (leadFab) {
      leadFab.addEventListener('click', () => {
        fabClicked = true;
        if (autoTimer) clearTimeout(autoTimer);
        openLead(leadFab);
      });
    }

    // Close controls
    leadModal.querySelectorAll('[data-lead-close]').forEach(el => {
      el.addEventListener('click', () => closeLead(true));
    });

    // Download: let the browser download (anchor has download attr),
    // also open in a new tab as a fallback, then close + flag.
    const leadDownload = document.getElementById('leadDownload');
    if (leadDownload) {
      leadDownload.addEventListener('click', () => {
        window.open(leadDownload.href, '_blank', 'noopener');
        try { sessionStorage.setItem(SS_KEY, '1'); } catch (e) {}
        closeLead(true);
      });
    }

    // Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !leadModal.hasAttribute('hidden')) closeLead(true);
    });

    // Auto-trigger after 20s, once per session
    function contactInView() {
      const contact = document.getElementById('contact');
      if (!contact) return false;
      const r = contact.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }

    if (!alreadyShown()) {
      autoTimer = setTimeout(() => {
        if (fabClicked || alreadyShown()) return;
        if (contactInView()) return; // user already at the contact section
        openLead(null);
        try { sessionStorage.setItem(SS_KEY, '1'); } catch (e) {}
      }, 20000);
    }
  }

})();
