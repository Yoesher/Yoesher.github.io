'use strict';
(() => {
  const storageKey = 'he-guoxi-language';
  const supportedLanguages = new Set(['zh-CN', 'en']);
  const translations = [];
  const citations = new Map();
  let currentLanguage = 'zh-CN';

  // Snapshot the approved Chinese markup so switching back restores it exactly.
  function translate(selector, english, attribute) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) throw new Error('Missing translation target: ' + selector);
    elements.forEach(element => translations.push({
      element,
      english,
      attribute,
      chinese: attribute ? element.getAttribute(attribute) : element.innerHTML
    }));
  }

  translate('title', 'He Guoxi | Academic Website');
  translate('meta[name="description"]', 'He Guoxi is a PhD student in sociology at Central China Normal University. His research interests include computational social science, population sociology, and historical sociology.', 'content');
  translate('meta[property="og:title"]', 'He Guoxi | Academic Website', 'content');
  translate('meta[property="og:description"]', 'Computational Social Science · Population Sociology · Historical Sociology', 'content');
  translate('.skip-link', 'Skip to main content');
  translate('.wordmark', 'He Guoxi<span lang="zh-CN">何国希</span>');
  translate('.wordmark', 'He Guoxi, return to the homepage', 'aria-label');
  translate('.menu-toggle>span', 'Menu');
  translate('#main-nav', 'Main navigation', 'aria-label');
  translate('#main-nav a[href="#research"]', 'Research');
  translate('#main-nav a[href="#publications"]', 'Publications');
  translate('#main-nav a[href="#experience"]', 'Projects &amp; Honors');
  translate('#main-nav a[href="#opensource"]', 'Open Source');
  translate('#main-nav a[href="#about"]', 'About');
  translate('#main-nav a[href="#contact"]', 'Contact <span aria-hidden="true">↗</span>');
  translate('.language-switch', 'Website language', 'aria-label');
  translate('[data-language="zh-CN"]', 'Switch to Simplified Chinese', 'aria-label');
  translate('[data-language="en"]', 'Switch to English', 'aria-label');
  translate('.hero-role', 'PhD Student in Sociology · Central China Normal University');
  translate('#hero-title', 'He Guoxi<i aria-hidden="true">.</i><span lang="zh-CN">何国希</span>');
  translate('.hero-intro', 'Exploring society through computation,<br>population, and history.');
  translate('.hero-actions .button', 'Read My Publications <span aria-hidden="true">↗</span>');
  translate('.hero-actions .text-link', 'Email Me <span aria-hidden="true">↗</span>');
  translate('.hero-bottom>span', 'Research · Writing · Exchange');
  translate('.hero-bottom>a', 'Explore My Research <span aria-hidden="true">↓</span>');
  translate('.hero-bottom>a', 'Scroll to research interests', 'aria-label');
  translate('.hero-portrait img', 'He Guoxi by the sea', 'alt');
  translate('#research-title', 'Research Interests');
  translate('#research .section-note', 'Connecting methods, population, and history<br>through sociology.');
  translate('.research-item:nth-child(1) h3', 'Computational Social Science');
  translate('.research-item:nth-child(2) h3', 'Population Sociology');
  translate('.research-item:nth-child(3) h3', 'Historical Sociology');
  translate('#publications-title', 'Publications');
  translate('#publications .section-note', 'Research on work, families, and childbearing.');
  translate('.publication-filters', 'Filter publications by publication status', 'aria-label');
  translate('[data-filter="all"]', 'All <span>3</span>');
  translate('[data-filter="published"]', 'Published <span>1</span>');
  translate('[data-filter="forthcoming"]', 'Forthcoming <span>2</span>');
  translate('.status-tag.published', 'Published');
  translate('.status-tag.forthcoming', 'Forthcoming');

  const papers = [
    {
      id: 'one',
      title: 'The Labor Process, Occupational Stress, and Social Attitudes among Workers in Flexible Employment: Moderated Mediation and Latent Profile Analyses',
      journal: 'Xuexi yu Shijian', originalJournal: '学习与实践', issue: '1', author: 'second', forthcoming: false
    },
    {
      id: 'two',
      title: 'Family Anchoring: Mechanisms of Territorial Reorganization in Fertility Support Policy',
      journal: 'Qiushi', originalJournal: '求实', issue: '6', author: 'second', forthcoming: true
    },
    {
      id: 'three',
      title: 'Proceed, Postpone, or Forgo: Mechanisms of Divergence in Childbearing Decisions from a Family Risk Management Perspective',
      journal: 'Nanfang Renkou', originalJournal: '南方人口', issue: '5', author: 'first', forthcoming: true
    }
  ];
  papers.forEach((paper, index) => {
    const selector = '.paper:nth-child(' + (index + 1) + ')';
    const citationElement = document.getElementById('citation-' + paper.id);
    const originalCitation = citationElement.textContent.trim();
    citations.set(citationElement.id, originalCitation);
    const details = document.createElement('details');
    details.className = 'original-citation';
    details.hidden = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Original Chinese citation';
    const citation = document.createElement('p');
    citation.lang = 'zh-CN';
    citation.textContent = originalCitation;
    details.append(summary, citation);
    citationElement.after(details);
    translate(selector + ' .paper-meta p', paper.journal + '<span class="journal-original" lang="zh-CN">' + paper.originalJournal + '</span><span>2026 · No. ' + paper.issue + '</span>');
    translate('#paper-' + paper.id + '-title', paper.title);
    translate('#citation-' + paper.id, 'He Guoxi (' + paper.author + ' author). 2026. “' + paper.title + '.” ' + paper.journal + ' (<span lang="zh-CN">' + paper.originalJournal + '</span>), No. ' + paper.issue + (paper.forthcoming ? ' (forthcoming).' : '.'));
    translate(selector + ' .copy-citation', 'Copy the original Chinese citation for “' + paper.title + '”', 'aria-label');
  });
  translate('.copy-citation>span:first-child', 'Copy Chinese Citation');
  translate('.paper-actions a[href^="https://doi.org/"]', 'View the DOI for “The Labor Process, Occupational Stress, and Social Attitudes among Workers in Flexible Employment” (opens in a new tab)', 'aria-label');
  const translationNote = document.createElement('p');
  translationNote.className = 'translation-note';
  translationNote.hidden = true;
  translationNote.textContent = 'Article titles are translated from Chinese. Original Chinese citations are available with each paper.';
  document.querySelector('.publication-toolbar').after(translationNote);

  translate('#experience-title', 'Projects &amp; Honors');
  translate('#experience .section-note', 'Contributions to research,<br>milestones along the way.');
  translate('.projects .subheading', 'Research Projects <span>RESEARCH PROJECTS</span>');
  translate('.honors .subheading', 'Honors &amp; Awards <span>HONORS &amp; AWARDS</span>');
  translate('.project-item:nth-of-type(1) .project-tag', 'National Social Science Fund of China');
  translate('.project-item:nth-of-type(1) h4', 'Youth Project, National Social Science Fund of China');
  translate('.project-item:nth-of-type(2) .project-tag', 'Hubei Provincial Social Science Fund');
  translate('.project-item:nth-of-type(2) h4', 'Key Project, Hubei Provincial Social Science Fund');
  translate('.project-item p', 'Second-listed project team member');
  translate('.honor-list li:nth-child(1) h4', 'Li Jing Scholarship — Research Achievement Award');
  translate('.honor-list li:nth-child(1) p', 'Recognition for research achievements');
  translate('.honor-list li:nth-child(2) h4', 'Li Jing Scholarship — General Projects');
  translate('.honor-list li:nth-child(2) p', 'Projects approved in 2024, 2025, and 2026');
  translate('.honor-list li:nth-child(3) .honor-year', '13th edition');
  translate('.honor-list li:nth-child(3) h4', 'Huiguang Award, Peking University Forum for Doctoral Students in Sociology');
  translate('.honor-list li:nth-child(3) p', 'Selected for the 12th and 13th editions of the Peking University Forum for Doctoral Students in Sociology');
  translate('#opensource-title', 'Open Source');
  translate('.profile-link', 'Visit Yoesher on GitHub (opens in a new tab)', 'aria-label');
  translate('.software-category', 'RESEARCH TOOLS / LOCAL FIRST');
  translate('#software-title', 'Sociology PhD Desk');
  translate('.software-description', 'A local-first workspace for sociological research, bringing literature, fieldwork, analysis, evidence, and writing together in one place.');
  translate('.software-tags', 'Project features', 'aria-label');
  translate('.software-tags span:nth-child(1)', 'Literature Management');
  translate('.software-tags span:nth-child(2)', 'Fieldwork Materials');
  translate('.software-tags span:nth-child(3)', 'Evidence &amp; Writing');
  translate('.software-actions .button', 'Open the Workspace <span aria-hidden="true">↗</span>');
  translate('.software-actions .button', 'Open Sociology PhD Desk (opens in a new tab)', 'aria-label');
  translate('.software-actions .text-link', 'View Source <span aria-hidden="true">↗</span>');
  translate('.software-actions .text-link', 'View the Sociology PhD Desk source code on GitHub (opens in a new tab)', 'aria-label');

  translate('#about-title', 'About Me');
  translate('.about-kicker', 'My Intellectual Interests');
  translate('.about-lead', 'How are individual lives connected to the times we live in?');
  translate('.about-copy>p:nth-of-type(3)', "Each of our lives is part of a history that began long before us. The institutions and social relations through which we organize our lives take shape and endure through the practices of successive generations, shaping the opportunities available to us and the responsibilities we must bear. My interest in sociology lies in understanding how these historically formed conditions shape life in the present, and how people, through their own actions, sustain or alter them. From this perspective, circumstances that seem personal reveal historical roots that extend beyond an individual's lifetime.");
  translate('.about-copy>p:nth-of-type(4)', "The discussion of sociology's responsibilities in the general preface to Mills's collected writings expresses a scholarly commitment I share: helping a general readership understand how private troubles are connected to social structure. When similar difficulties recur in different people's lives, explanations that focus only on individual ability and choice cannot fully account for their circumstances. Where problems are rooted in social structure, fundamental improvements in people's circumstances depend on changes in the relevant social conditions. Expectations of individual effort cannot replace the responsibilities that society should assume.");
  translate('.about-copy>p:nth-of-type(5)', "I hope my research and writing can provide a solid basis for this understanding. Tracing the historical origins of present circumstances can turn arrangements we take for granted back into questions that require explanation. It also allows us to ask why they persist and under what conditions they might change. For me, this is sociology's appeal: beginning with questions arising from personal experience, seeking explanations in the connections between history and society, and bringing that understanding to bear on how we think about our shared life.");
  translate('.about-signature span', 'Research begins with curiosity.');
  translate('#contact-title', 'A conversation begins with an email.');
  translate('#contact .contact-inner>div:first-child>p:not(.eyebrow)', 'Get in touch about research, writing, or academic collaboration.');
  translate('.copy-email>span', 'Copy Email');
  translate('.contact-secondary>a', 'Yoesher on GitHub (opens in a new tab)', 'aria-label');
  translate('.footer-name', 'He Guoxi <span lang="zh-CN">何国希</span>');
  translate('.back-top', 'Back to Top <span aria-hidden="true">↑</span>');

  translate('#main-nav a[href="#resources"]', 'Archive');
  translate('#resources-title', 'Academic Archive');
  translate('#resources .section-note', 'CV, working papers, teaching, talks, and research materials.');
  translate('#archive-cv .archive-title', 'Curriculum Vitae');
  translate('#archive-cv .archive-state', 'To be added');
  translate('#archive-cv .archive-facts>div:nth-child(1) dt', 'Current study');
  translate('#archive-cv .archive-facts>div:nth-child(1) dd', 'PhD student in Sociology · Central China Normal University');
  translate('#archive-cv .archive-facts>div:nth-child(2) dt', 'Dates');
  translate('#archive-cv .archive-facts>div:nth-child(2) dd', 'To be added');
  translate('#archive-cv .archive-note', 'Full education and academic history, together with a PDF CV, will be added here.');
  translate('#archive-papers .archive-title', 'Working Papers');
  translate('#archive-papers .archive-state', 'No public entries');
  translate('#archive-papers .archive-note', 'Working papers will be listed when they are ready to be shared publicly.');
  translate('#archive-teaching .archive-title', 'Teaching &amp; Talks');
  translate('#archive-teaching .archive-state', 'To be added');
  translate('#archive-teaching .archive-note', 'Courses, teaching assistantships, conference presentations, and lecture materials will be added here.');
  translate('#archive-materials .archive-title', 'Data &amp; Research Notes');
  translate('#archive-materials .archive-state', 'To be added');
  translate('#archive-materials .archive-note', 'Data, replication code, and research notes will be added here.');
  translate('#archive-materials .archive-related', 'Explore the published research tool <span aria-hidden="true">↗</span>');
  translate('.updated-label', 'Updated');

  const messages = {
    'zh-CN': {
      menuOpen: '打开主导航', menuClose: '关闭主导航', emailField: '联系邮箱',
      emailCopy: '复制邮箱', emailCopied: '已复制邮箱', emailCopiedStatus: '邮箱已复制：{email}',
      emailError: '请长按或选中上方邮箱复制', emailErrorStatus: '复制未完成，请选中上方邮箱手动复制。',
      citationField: '论文题录', citationCopy: '复制题录', citationCopied: '已复制',
      citationCopiedStatus: '题录已复制：{citation}', citationError: '请选中上方题录复制', citationErrorStatus: '复制未完成，请选中题录手动复制。',
      filterAll: '已显示{count}篇论文', filterPublished: '已显示{count}篇已发表论文', filterForthcoming: '已显示{count}篇待刊论文',
      languageChanged: '已切换为简体中文。'
    },
    en: {
      menuOpen: 'Open main navigation', menuClose: 'Close main navigation', emailField: 'Contact email',
      emailCopy: 'Copy Email', emailCopied: 'Email Copied', emailCopiedStatus: 'Email copied: {email}',
      emailError: 'Select the email above to copy', emailErrorStatus: 'Copying was unsuccessful. Please select the email above and copy it manually.',
      citationField: 'Original Chinese citation', citationCopy: 'Copy Chinese Citation', citationCopied: 'Copied',
      citationCopiedStatus: 'Original Chinese citation copied: {citation}', citationError: 'Select the original citation to copy', citationErrorStatus: 'Copying was unsuccessful. Please expand the original Chinese citation and copy it manually.',
      filterAll: 'Publications shown: {count}.', filterPublished: 'Published papers shown: {count}.', filterForthcoming: 'Forthcoming papers shown: {count}.',
      languageChanged: 'Language set to English.'
    }
  };
  function t(key, variables = {}) {
    const template = messages[currentLanguage][key] || messages['zh-CN'][key] || key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(variables[name] ?? ''));
  }
  const languageStatus = document.createElement('span');
  languageStatus.id = 'language-status';
  languageStatus.className = 'sr-only';
  languageStatus.setAttribute('role', 'status');
  languageStatus.setAttribute('aria-live', 'polite');
  document.body.append(languageStatus);

  function setLanguage(language, {persist = true, announce = true} = {}) {
    if (!supportedLanguages.has(language)) return;
    currentLanguage = language;
    document.documentElement.lang = language;
    translations.forEach(({element, english, chinese, attribute}) => {
      const value = language === 'en' ? english : chinese;
      if (attribute) {
        if (value === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, value);
      } else element.innerHTML = value;
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.querySelectorAll('.original-citation').forEach(details => {
      details.hidden = language !== 'en';
      if (details.hidden) details.open = false;
    });
    translationNote.hidden = language !== 'en';
    const menuButton = document.querySelector('.menu-toggle');
    menuButton.setAttribute('aria-label', t(menuButton.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen'));
    if (persist) {
      try { localStorage.setItem(storageKey, language); } catch { /* The switch also works when storage is blocked. */ }
    }
    if (announce) languageStatus.textContent = t('languageChanged');
    document.dispatchEvent(new CustomEvent('site:languagechange', {detail: {language}}));
  }
  window.siteI18n = {t, setLanguage, get language() {return currentLanguage;}, getCitation: id => citations.get(id) || ''};
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      const nextLanguage = button.dataset.language;
      if (nextLanguage === currentLanguage && !window.siteMotion?.languagePending) return;
      const change = () => setLanguage(nextLanguage);
      if (window.siteMotion?.transitionLanguage) window.siteMotion.transitionLanguage(change);
      else change();
    });
  });
  let initialLanguage = 'zh-CN';
  try {
    const savedLanguage = localStorage.getItem(storageKey);
    if (supportedLanguages.has(savedLanguage)) initialLanguage = savedLanguage;
  } catch { /* Simplified Chinese remains the default without storage. */ }
  setLanguage(initialLanguage, {persist: false, announce: false});
})();
