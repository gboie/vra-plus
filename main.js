/* ═══════════════════════════════════════════════════════════════
   VRA+ — main.js
   Network canvas · scroll reveals · terminal · tabs · copy · nav
   No dependencies; the page works without it.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Hero background: drifting network of nodes ────────────────────
(function initCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const LINK = 140;
  let nodes = [];
  let width = 0;
  let height = 0;
  let raf = 0;
  let running = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (width * height) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
      hot: Math.random() < 0.08,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.22 * (1 - d / LINK)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = n.hot ? 'rgba(56, 189, 248, 0.95)' : 'rgba(165, 216, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.hot ? n.r + 1 : n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;
    }
    draw();
    if (running) raf = requestAnimationFrame(step);
  }

  resize();
  if (reducedMotion) {
    draw(); // a still frame
  } else {
    step();
    // Pause when the hero is off-screen or the tab is hidden.
    const io = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && !document.hidden;
      if (visible && !running) { running = true; raf = requestAnimationFrame(step); }
      if (!visible) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(canvas);
  }

  let t = 0;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => { resize(); draw(); }, 150);
  });
})();

// ─── Scroll reveals ────────────────────────────────────────────────
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      // Stagger siblings that enter together.
      const siblings = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 5) * 70}ms`;
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
})();

// ─── Terminal: lines appear one by one ─────────────────────────────
(function initTerminal() {
  const term = document.querySelector('.terminal');
  if (!term) return;
  const lines = term.querySelectorAll('.t-line');
  lines.forEach((ln, i) => {
    ln.style.transitionDelay = reducedMotion ? '0ms' : `${300 + i * 140}ms`;
  });
  requestAnimationFrame(() => term.classList.add('is-typed'));
})();

// ─── Mobile navigation ─────────────────────────────────────────────
(function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  });
  links.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ─── Tabs (install platforms, CI examples) — keyboard accessible ──
(function initTabs() {
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];

    function select(tab) {
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      }
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!dir) return;
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });
  });

  // Preselect the visitor's platform in the install tabs.
  const ua = navigator.userAgent;
  const id = /Windows/.test(ua) ? 't-win' : /Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua) ? 't-mac' : null;
  if (id) document.getElementById(id)?.click();
})();

// ─── Copy buttons ──────────────────────────────────────────────────
(function initCopy() {
  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const src = document.getElementById(btn.dataset.copy);
      if (!src) return;
      const text = src.innerText.trim();
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        // Fallback for http:// or older browsers.
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove();
      }
      btn.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      btn.classList.toggle('is-done', ok);
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1800);
    });
  });
})();

// ─── Footer year ───────────────────────────────────────────────────
(function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
})();
