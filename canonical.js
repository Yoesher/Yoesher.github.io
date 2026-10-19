'use strict';
(() => {
  if (window.location.hostname !== 'he-guoxi-academic.silky-cow-4938.chatgpt.site') return;
  const allowedSections = new Set(['#home', '#research', '#publications', '#experience', '#opensource', '#about', '#contact']);
  const section = allowedSections.has(window.location.hash) ? window.location.hash : '#home';
  // Only public section anchors are transferred; no path or query parameters follow.
  window.location.replace('https://yoesher.github.io/' + section);
})();
