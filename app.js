'use strict';
const t = (key, variables) => window.siteI18n.t(key, variables);
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', t('menuOpen'));
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 1101px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
const copyButton = document.querySelector('.copy-email');
const copyStatus = document.querySelector('#copy-status');
let feedbackTimer;
copyButton.addEventListener('click', async () => {
  const email = copyButton.dataset.email;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
    } else {
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('aria-label', t('emailField'));
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      let copied;
      try { copied = document.execCommand('copy'); }
      finally { field.remove(); copyButton.focus(); }
      if (!copied) throw new Error('Clipboard unavailable');
    }
    copyButton.querySelector('span').textContent = t('emailCopied');
    copyStatus.textContent = t('emailCopiedStatus', {email});
  } catch {
    copyButton.querySelector('span').textContent = t('emailError');
    copyStatus.textContent = t('emailErrorStatus');
  }
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    copyButton.querySelector('span').textContent = t('emailCopy');
    copyStatus.textContent = '';
  }, 4500);
});
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  const navLinks = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-18% 0px -65% 0px', threshold: 0});
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

const publicationStatus = document.querySelector('#publication-status');
const papers = [...document.querySelectorAll('.paper')];
const filters = [...document.querySelectorAll('[data-filter]')];
function announceFilter() {
  const filter = filters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'all';
  const count = papers.filter(paper => !paper.hidden).length;
  const key = filter === 'all' ? 'filterAll' : filter === 'published' ? 'filterPublished' : 'filterForthcoming';
  publicationStatus.textContent = t(key, {count});
}
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  papers.forEach(paper => {
    const show = filter === 'all' || paper.dataset.status === filter;
    paper.hidden = !show;
    paper.classList.toggle('filter-enter', show);
  });
  announceFilter();
}));

async function copyCitationText(text, trigger) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('aria-label', t('citationField'));
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let copied;
  try { copied = document.execCommand('copy'); }
  finally { field.remove(); trigger.focus(); }
  if (!copied) throw new Error('Clipboard unavailable');
}
const citationTimers = new Map();
document.querySelectorAll('.copy-citation').forEach(button => {
  button.addEventListener('click', async () => {
    const citation = window.siteI18n.getCitation(button.dataset.citation);
    try {
      await copyCitationText(citation, button);
      button.querySelector('span').textContent = t('citationCopied');
      publicationStatus.textContent = t('citationCopiedStatus', {citation});
    } catch {
      button.querySelector('span').textContent = t('citationError');
      publicationStatus.textContent = t('citationErrorStatus');
      if (window.siteI18n.language === 'en') button.closest('.paper').querySelector('.original-citation').open = true;
    }
    clearTimeout(citationTimers.get(button));
    citationTimers.set(button, setTimeout(() => {
      button.querySelector('span').textContent = t('citationCopy');
      citationTimers.delete(button);
    }, 4000));
  });
});

document.addEventListener('site:languagechange', () => {
  closeMenu();
  clearTimeout(feedbackTimer);
  copyButton.querySelector('span').textContent = t('emailCopy');
  copyStatus.textContent = '';
  citationTimers.forEach(timer => clearTimeout(timer));
  citationTimers.clear();
  document.querySelectorAll('.copy-citation').forEach(button => {
    button.querySelector('span').textContent = t('citationCopy');
  });
  announceFilter();
  window.requestAnimationFrame(updateReadingProgress);
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
if ('IntersectionObserver' in window && !motionPreference.matches) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -15px 0px'});
  document.querySelectorAll('.section-heading,.research-item,.experience-grid,.software-project,.about-copy,.contact-inner').forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('reveal-ready');
      revealObserver.observe(element);
    }
  });
}
motionPreference.addEventListener('change', event => {
  if (!event.matches) return;
  revealObserver?.disconnect();
  document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible'));
});
const readingProgress = document.querySelector('.reading-progress');
let scrollScheduled = false;
function updateReadingProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.style.width = Math.min(100, Math.max(0, total > 0 ? window.scrollY / total * 100 : 0)) + '%';
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(updateReadingProgress);
  }
}, {passive:true});
window.addEventListener('resize', updateReadingProgress);
updateReadingProgress();
