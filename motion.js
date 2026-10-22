'use strict';
(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.reading-progress');
  const navLinks = [...document.querySelectorAll('#main-nav a[href^="#"]')];
  const easeOut = 'cubic-bezier(.22,.7,.2,1)';
  const runningAnimations = new Set();
  const animationsByElement = new WeakMap();
  const revealed = new WeakSet();
  let revealObserver;
  let frame = 0;
  let measurePending = true;
  let scrollExtent = 0;
  let headerHeight = 0;
  let sectionPositions = [];
  let currentNavId = null;
  let lastScrolled = false;
  let languageRevision = 0;
  let activeTransition = null;
  let pendingLanguageUpdate = null;
  let languageUpdatePending = false;
  let languageAnchor = null;
  let scrollIntentRevision = 0;
  let previousOverflowAnchor = null;

  function finishAnimations() {
    [...runningAnimations].forEach(animation => {
      try { animation.finish(); } catch { /* A cancelled animation is already settled. */ }
      animation.cancel();
    });
    runningAnimations.clear();
  }

  function animateIn(element, {distance = 16, duration = 480, delay = 0} = {}) {
    if (!element || reducedMotion.matches || typeof element.animate !== 'function' || element.hidden) return;
    animationsByElement.get(element)?.cancel();
    const animation = element.animate([
      {opacity: 0, transform: 'translateY(' + distance + 'px)'},
      {opacity: 1, transform: 'translateY(0)'}
    ], {duration, delay, easing: easeOut, fill: 'both'});
    animationsByElement.set(element, animation);
    runningAnimations.add(animation);
    const cleanUp = () => {
      runningAnimations.delete(animation);
      if (animationsByElement.get(element) === animation) animationsByElement.delete(element);
      animation.cancel();
    };
    animation.finished.then(cleanUp, cleanUp);
  }

  function reveal(element) {
    if (revealed.has(element)) return;
    revealed.add(element);
    revealObserver?.unobserve(element);
    if (element.matches('.research-grid, .archive-grid')) {
      [...element.children].forEach((child, index) => animateIn(child, {delay: index * 42}));
    } else animateIn(element);
  }

  function prepareReveals() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, {threshold: 0, rootMargin: '0px 0px 36px 0px'});
    document.querySelectorAll('.section-heading, .research-grid, .paper, .experience-grid, .software-project, .about-copy, .archive-grid, .contact-inner').forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight - 20) {
        // A restored scroll position should open immediately at its existing content.
        revealed.add(element);
      } else revealObserver.observe(element);
    });
  }

  function enterHero() {
    if (reducedMotion.matches || window.scrollY > 140 || (location.hash && location.hash !== '#home')) return;
    const sequence = [
      ['.hero-eyebrow', 0], ['.hero-role', 35], ['#hero-title', 65],
      ['.hero-intro', 100], ['.hero-actions', 135], ['.hero-bottom', 160], ['.hero-portrait', 85]
    ];
    sequence.forEach(([selector, delay]) => {
      const element = document.querySelector(selector);
      if (element && element.getBoundingClientRect().top < window.innerHeight) {
        animateIn(element, {delay, distance: selector === '.hero-portrait' ? 12 : 16, duration: 520});
      }
    });
  }

  function renderScrollState() {
    frame = 0;
    if (measurePending) {
      scrollExtent = Math.max(0, root.scrollHeight - window.innerHeight);
      headerHeight = header?.getBoundingClientRect().height || 0;
      const scroll = window.scrollY;
      sectionPositions = [...document.querySelectorAll('main section[id]')].map(element => ({
        id: element.id, top: element.getBoundingClientRect().top + scroll
      }));
      measurePending = false;
    }
    const scroll = window.scrollY;
    const ratio = scrollExtent > 0 ? Math.max(0, Math.min(1, scroll / scrollExtent)) : 0;
    if (progress) progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    updateActiveNavigation(scroll);
    const scrolled = scroll > 18;
    if (scrolled !== lastScrolled) {
      header?.classList.toggle('is-scrolled', scrolled);
      lastScrolled = scrolled;
    }
  }

  function updateActiveNavigation(scroll) {
    const activationPoint = scroll + headerHeight + 48;
    let current = null;
    sectionPositions.forEach(section => {
      if (section.top <= activationPoint) current = section;
    });
    const last = sectionPositions[sectionPositions.length - 1];
    const anchorAtReadingLine = current && location.hash === '#' + current.id && Math.abs(current.top - activationPoint) < 96;
    // A short final section can never reach the reading line at maximum scroll.
    // Only select it when it is high in the viewport, never over a freshly reached anchor.
    if (!anchorAtReadingLine && last && scrollExtent > 0 && scroll >= scrollExtent - 2 &&
        last.top <= scroll + headerHeight + (window.innerHeight - headerHeight) * .5) current = last;
    const id = current?.id || '';
    if (id === currentNavId) return;
    currentNavId = id;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function refresh(remeasure = true) {
    if (remeasure) measurePending = true;
    if (!frame) frame = window.requestAnimationFrame(renderScrollState);
  }

  function readingAnchor() {
    if (window.scrollY < 24) return null;
    const readingLine = (header?.getBoundingClientRect().bottom || 80) + 48;
    const sections = [...document.querySelectorAll('main section[id]')];
    let currentSection = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= readingLine) currentSection = section;
    });
    if (!currentSection) return null;
    const candidates = [...currentSection.querySelectorAll('.section-heading, .paper:not([hidden]), .about-copy>p, .software-copy, .archive-card, .contact-inner')];
    let nearest = null;
    let shortestDistance = Infinity;
    candidates.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.height === 0 || rect.bottom < readingLine || rect.top > window.innerHeight) return;
      const distance = Math.abs(rect.top - readingLine);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearest = {element, top: rect.top, intent: scrollIntentRevision};
      }
    });
    const selected = nearest || {element: currentSection, top: currentSection.getBoundingClientRect().top, intent: scrollIntentRevision};
    return selected;
  }

  function restoreReadingAnchor(anchor) {
    if (!anchor?.element.isConnected || anchor.intent !== scrollIntentRevision) {
      return;
    }
    const difference = anchor.element.getBoundingClientRect().top - anchor.top;
    if (Math.abs(difference) < 1) {
      return;
    }
    const target = Math.max(0, window.scrollY + difference);
    window.scrollTo({left: window.scrollX, top: target, behavior: 'instant'});
  }

  function releaseLanguageAnchor(revision) {
    if (revision !== languageRevision) return;
    if (previousOverflowAnchor !== null) root.style.overflowAnchor = previousOverflowAnchor;
    previousOverflowAnchor = null;
    languageAnchor = null;
  }

  function transitionLanguage(callback) {
    // Keep one stable landmark for a burst of choices, before any asynchronous snapshot.
    if (!activeTransition && !languageUpdatePending) languageAnchor = readingAnchor();
    if (previousOverflowAnchor === null) previousOverflowAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = 'none';
    const revision = ++languageRevision;
    languageUpdatePending = true;
    activeTransition?.skipTransition();
    finishAnimations();
    let applied = false;
    const anchor = languageAnchor;
    const apply = async () => {
      // A skipped transition still calls its DOM updater, so only the latest request may run.
      if (applied || revision !== languageRevision) return;
      applied = true;
      languageUpdatePending = false;
      callback();
      restoreReadingAnchor(anchor);
      refresh();
      if (!reducedMotion.matches) {
        await new Promise(resolve => window.requestAnimationFrame(resolve));
        if (revision === languageRevision) {
          restoreReadingAnchor(anchor);
          refresh();
        }
      }
    };
    pendingLanguageUpdate = apply;
    if (reducedMotion.matches || document.hidden || typeof document.startViewTransition !== 'function') {
      root.classList.remove('language-transition');
      const update = apply();
      pendingLanguageUpdate = null;
      return update.finally(() => releaseLanguageAnchor(revision));
    }
    root.classList.add('language-transition');
    try {
      const transition = document.startViewTransition(apply);
      activeTransition = transition;
      // ready rejects when a rapid second selection deliberately skips the first animation.
      transition.ready.catch(() => {});
      transition.updateCallbackDone.catch(() => {
        if (!applied) return apply();
      });
      return transition.finished.catch(() => {}).finally(() => {
        if (activeTransition === transition) {
          activeTransition = null;
          pendingLanguageUpdate = null;
          root.classList.remove('language-transition');
          releaseLanguageAnchor(revision);
        }
      });
    } catch {
      root.classList.remove('language-transition');
      const update = apply();
      pendingLanguageUpdate = null;
      return update.finally(() => releaseLanguageAnchor(revision));
    }
  }

  function settleForReducedMotion() {
    if (!reducedMotion.matches) return;
    revealObserver?.disconnect();
    finishAnimations();
    pendingLanguageUpdate?.();
    activeTransition?.skipTransition();
    root.classList.remove('language-transition');
    refresh();
  }

  document.addEventListener('toggle', event => {
    const details = event.target;
    if (details.tagName !== 'DETAILS') return;
    const panel = details.querySelector('.archive-panel') || (details.matches('.original-citation') ? details.querySelector('p') : null);
    if (panel) {
      animationsByElement.get(panel)?.cancel();
      if (details.open) animateIn(panel, {distance: 6, duration: 230});
    }
    // Native details changes layout once; the panel itself only animates opacity and transform.
    refresh();
  }, true);

  document.addEventListener('click', event => {
    if (!event.target.closest('[data-filter]')) return;
    document.querySelectorAll('.paper:not([hidden])').forEach((paper, index) => {
      revealed.add(paper);
      revealObserver?.unobserve(paper);
      animateIn(paper, {distance: 8, duration: 260, delay: index * 28});
    });
    refresh();
  });

  document.addEventListener('focusin', event => {
    // A keyboard user should never arrive at an interactive control in a fading block.
    let element = event.target;
    while (element && element !== document.body) {
      const animation = animationsByElement.get(element);
      if (animation) {
        try { animation.finish(); } catch { /* Already settled. */ }
        animation.cancel();
      }
      element = element.parentElement;
    }
  });

  window.addEventListener('scroll', () => refresh(false), {passive: true});
  window.addEventListener('wheel', () => {scrollIntentRevision++;}, {passive: true});
  window.addEventListener('touchmove', () => {scrollIntentRevision++;}, {passive: true});
  window.addEventListener('keydown', event => {
    if (event.target.closest('button,a,input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) scrollIntentRevision++;
  });
  window.addEventListener('resize', () => refresh(), {passive: true});
  window.addEventListener('load', () => refresh(), {once: true});
  window.addEventListener('pageshow', () => refresh());
  document.addEventListener('site:languagechange', () => refresh());
  reducedMotion.addEventListener('change', settleForReducedMotion);
  if ('ResizeObserver' in window) new ResizeObserver(() => refresh()).observe(document.body);
  document.fonts?.ready.then(() => refresh());
  window.siteMotion = {transitionLanguage, refresh, get languagePending() {return languageUpdatePending;}};
  prepareReveals();
  enterHero();
  refresh();
})();
