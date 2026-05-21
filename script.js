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
  // Flow modal (Welcome Flow on the Work section)
  // ============================================
  const flowModal = document.getElementById('flowModal');
  const flowTriggers = document.querySelectorAll('[data-flow]');
  let lastFocusedTrigger = null;

  function openFlow(trigger) {
    if (!flowModal) return;
    lastFocusedTrigger = trigger || document.activeElement;
    flowModal.removeAttribute('hidden');
    document.body.classList.add('flow-open');
    // Focus the close button so esc/tab works immediately
    const close = flowModal.querySelector('.flow-modal-close');
    if (close) close.focus();
  }

  function closeFlow() {
    if (!flowModal) return;
    flowModal.setAttribute('hidden', '');
    document.body.classList.remove('flow-open');
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
  }

  flowTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => openFlow(trigger));
  });

  if (flowModal) {
    flowModal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', (e) => {
        // For anchor-tagged close (e.g. Book A Discovery Call), let nav proceed first
        const isAnchor = el.tagName === 'A' && el.getAttribute('href');
        if (isAnchor) {
          // Close, then let the default scroll happen
          closeFlow();
        } else {
          e.preventDefault();
          closeFlow();
        }
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && flowModal && !flowModal.hasAttribute('hidden')) {
      closeFlow();
    }
  });

})();
