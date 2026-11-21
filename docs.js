/* ═══════════════════════════════════════════════════════════════
   VRA+ docs — filter, expand all, copy buttons, active section
   The page works without it (native <details>).
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function initDocs() {
  const all = [...document.querySelectorAll('.docs__main details.flag')];
  const sections = [...document.querySelectorAll('.doc-sec')];

  // ─── Copy button on every code block ────────────────────────────
  document.querySelectorAll('.doc-code').forEach((pre) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy copy--float';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Copy commands only — drop "# comment" lines.
      const text = pre.innerText
        .split('\n')
        .filter((l) => !l.trim().startsWith('#'))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch { ok = false; }
      btn.textContent = ok ? 'Copied' : 'Select & copy';
      btn.classList.toggle('is-done', ok);
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1600);
    });
    // Wrap so the button stays put while long lines scroll sideways.
    const wrap = document.createElement('div');
    wrap.className = 'doc-code-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.append(pre, btn);
  });

  // ─── Expand / collapse all ──────────────────────────────────────
  const toggle = document.getElementById('toggle-all');
  const syncToggle = () => {
    const visible = all.filter((d) => !d.hidden);
    toggle.textContent = visible.length && visible.every((d) => d.open) ? 'Collapse all' : 'Expand all';
  };
  toggle.addEventListener('click', () => {
    const open = toggle.textContent === 'Expand all';
    all.forEach((d) => { if (!d.hidden) d.open = open; });
    syncToggle();
  });
  all.forEach((d) => d.addEventListener('toggle', syncToggle));

  // ─── Filter ─────────────────────────────────────────────────────
  const input = document.getElementById('doc-filter');
  const none = document.getElementById('no-result');
  const textOf = new Map(all.map((d) => [d, d.textContent.toLowerCase()]));
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    all.forEach((d) => {
      const hit = !q || textOf.get(d).includes(q);
      d.hidden = !hit;
      if (q) d.open = hit && d.querySelector('summary').textContent.toLowerCase().includes(q);
      if (hit) shown += 1;
    });
    // Hide sections with nothing left in them (only while filtering).
    sections.forEach((s) => {
      const flags = s.querySelectorAll('details.flag');
      s.hidden = Boolean(q) && (flags.length === 0 || [...flags].every((d) => d.hidden));
    });
    none.hidden = shown > 0;
    syncToggle();
  });
  // "/" focuses the filter.
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      input.focus();
    }
  });

  // ─── Open the flag a link points at (#scan etc. just scroll) ────
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target && target.tagName === 'DETAILS') target.open = true;
  }

  // ─── Highlight the current section in the sidebar ───────────────
  const links = new Map(
    [...document.querySelectorAll('.docs__toc a')].map((a) => [a.getAttribute('href').slice(1), a]),
  );
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.remove('is-active'));
        links.get(e.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    sections.forEach((s) => io.observe(s));
  }
})();
