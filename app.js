'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
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
window.matchMedia('(min-width: 801px)').addEventListener('change', event => {
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
      field.setAttribute('aria-label', '联系邮箱');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      let copied;
      try { copied = document.execCommand('copy'); }
      finally { field.remove(); copyButton.focus(); }
      if (!copied) throw new Error('Clipboard unavailable');
    }
    copyButton.querySelector('span').textContent = '已复制邮箱';
    copyStatus.textContent = '邮箱已复制：' + email;
  } catch {
    copyButton.querySelector('span').textContent = '请长按或选中上方邮箱复制';
    copyStatus.textContent = '复制未完成，请选中上方邮箱手动复制。';
  }
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    copyButton.querySelector('span').textContent = '复制邮箱';
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
filters.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let visibleCount = 0;
  papers.forEach(paper => {
    const show = filter === 'all' || paper.dataset.status === filter;
    paper.hidden = !show;
    paper.classList.toggle('filter-enter', show);
    if (show) visibleCount++;
  });
  publicationStatus.textContent = '已显示' + visibleCount + '篇' + (filter === 'all' ? '论文' : filter === 'published' ? '已发表论文' : '待刊论文');
}));

async function copyCitationText(text, trigger) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('aria-label', '论文题录');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let copied;
  try { copied = document.execCommand('copy'); }
  finally { field.remove(); trigger.focus(); }
  if (!copied) throw new Error('Clipboard unavailable');
}
document.querySelectorAll('.copy-citation').forEach(button => {
  let resetTimer;
  button.addEventListener('click', async () => {
    const citation = document.getElementById(button.dataset.citation).textContent.trim();
    try {
      await copyCitationText(citation, button);
      button.querySelector('span').textContent = '已复制';
      publicationStatus.textContent = '题录已复制：' + citation;
    } catch {
      button.querySelector('span').textContent = '请选中上方题录复制';
      publicationStatus.textContent = '复制未完成，请选中题录手动复制。';
    }
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { button.querySelector('span').textContent = '复制题录'; }, 4000);
  });
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
