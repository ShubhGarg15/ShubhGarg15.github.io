// Ensure content visible even if JS fails
document.body.classList.add('js-loaded');

// Single mouse state
const mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

// ============================================
// MATRIX RAIN — 15fps max, minimal draw
// ============================================
const matrixCanvas = document.getElementById('matrix-canvas');
if (matrixCanvas) {
  const ctx = matrixCanvas.getContext('2d');
  let cols, drops;
  let skip = 0;

  function resizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    cols = Math.floor(matrixCanvas.width / 18);
    drops = Array(cols).fill(0).map(() => Math.random() * -matrixCanvas.height);
  }
  resizeMatrix();

  const chars = '0123456789<>/{}[]|&^%$#@!';

  function drawMatrix() {
    if (++skip < 4) { requestAnimationFrame(drawMatrix); return; }
    skip = 0;
    ctx.fillStyle = 'rgba(8,8,14,0.04)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    ctx.font = '14px "JetBrains Mono", monospace';
    for (let i = 0; i < drops.length; i++) {
      const y = drops[i];
      const intensity = Math.min(1, (y + 100) / matrixCanvas.height);
      ctx.fillStyle = `rgba(0,229,255,${0.02 + intensity * 0.12})`;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, y);
      if (y > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 10 + Math.random() * 4;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
  window.addEventListener('resize', resizeMatrix);
}

// ============================================
// CURSOR — CSS transition glow, no RAF loop
// ============================================
const dot = document.querySelector('.cursor-dot');
const glow = document.querySelector('.cursor-glow');

if (dot && glow && window.innerWidth > 600) {
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX, y = e.clientY;
    dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    glow.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
  });

  document.addEventListener('mouseover', (e) => {
    const t = e.target.closest('a, button, input, textarea, .proj-card, .channel, .tube, .explore-pills span, .holo-stat');
    if (t) glow.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target.closest('a, button, input, textarea, .proj-card, .channel, .tube, .explore-pills span, .holo-stat');
    if (t) glow.classList.remove('hover');
  });
}

// ============================================
// SECTION COLOR
// ============================================
const sections = ['home', 'about', 'projects', 'skills', 'experience', 'contact'];
const colors = ['#ff2d55', '#00e5ff', '#ffd700', '#a855f7', '#f97316', '#34d399'];

function applySectionColor(idx) {
  const color = colors[idx] || '#ff2d55';
  if (dot) { dot.style.background = color; dot.style.boxShadow = `0 0 6px ${color}, 0 0 12px ${color}`; }
  if (glow) glow.style.borderColor = color + '4d';
  document.documentElement.style.setProperty('--c1', color);
  const ring = document.querySelector('.ring-fill');
  if (ring) ring.style.stroke = color;
}

const colorIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      const idx = sections.indexOf(e.target.id);
      if (idx >= 0) applySectionColor(idx);
    }
  }
}, { threshold: 0.3 });
sections.forEach(id => { const el = document.getElementById(id); if (el) colorIO.observe(el); });

const ss = document.createElement('style');
ss.textContent = `.nav-link::after { background:var(--c1)!important;box-shadow:0 0 8px var(--c1)!important; }`;
document.head.appendChild(ss);

document.querySelectorAll('[data-delay]').forEach(el => el.style.setProperty('--d', el.dataset.delay));

const glitchName = document.querySelector('.glitch-name');
if (glitchName) {
  glitchName.addEventListener('mouseenter', () => {
    glitchName.style.animation = 'none';
    void glitchName.offsetWidth;
    glitchName.style.animation = 'glitchName 0.3s ease 2';
  });
}

// ============================================
// OBSERVERS
// ============================================
const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) { if (e.isIntersecting) e.target.classList.add('visible'); }
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealIO.observe(el));

const tubeIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      setTimeout(() => { e.target.style.width = (e.target.dataset.pct || '0') + '%'; }, 200);
      tubeIO.unobserve(e.target);
    }
  }
}, { threshold: 0.3 });
document.querySelectorAll('.tube-fill').forEach(t => tubeIO.observe(t));

const tlItems = document.querySelectorAll('.tl-item');
const tlIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), 120 * Array.from(tlItems).indexOf(e.target));
      tlIO.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });
tlItems.forEach(i => tlIO.observe(i));

const counterIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.target) || 0;
      const dur = 1200;
      const start = performance.now();
      function anim(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(anim); else el.textContent = target;
      }
      requestAnimationFrame(anim);
      counterIO.unobserve(el);
    }
  }
}, { threshold: 0.5 });
document.querySelectorAll('.h-num').forEach(c => counterIO.observe(c));

// ============================================
// SCROLL — cached section positions, no offsetTop on every frame
// ============================================
const progressRing = document.querySelector('.progress-ring');
const ringFill = document.querySelector('.ring-fill');
const ringPct = document.querySelector('.ring-pct');
const scrollTop = document.querySelector('.scroll-top');
const nav = document.querySelector('.nav');
const circumference = 100.53;
const navLinks = document.querySelectorAll('.nav-link');

// Cache section positions
let sectionTops = [];
function cacheSectionTops() {
  sectionTops = sections.map(id => {
    const el = document.getElementById(id);
    return el ? { id, top: el.offsetTop - 120, bottom: el.offsetTop + el.offsetHeight } : null;
  }).filter(Boolean);
}
cacheSectionTops();
window.addEventListener('resize', cacheSectionTops);

let scrollPending = false;
function onScroll() {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    const scrolled = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(100, Math.round((scrolled / h) * 100)) : 0;

    if (progressRing) progressRing.classList.toggle('visible', scrolled > 300);
    if (ringFill) ringFill.style.strokeDashoffset = circumference - (circumference * pct) / 100;
    if (ringPct) ringPct.textContent = pct + '%';
    if (scrollTop) scrollTop.classList.toggle('visible', scrolled > 300);
    if (nav) nav.classList.toggle('scrolled', scrolled > 40);

    let activeIdx = 0;
    for (let i = 0; i < sectionTops.length; i++) {
      const s = sectionTops[i];
      if (scrolled >= s.top && scrolled < s.bottom) { activeIdx = i; break; }
    }
    navLinks.forEach((link, i) => link.classList.toggle('active', i === activeIdx));

    scrollPending = false;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (scrollTop) scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    const m = document.querySelector('.nav-menu');
    const t = document.querySelector('.nav-toggle');
    if (m && t) { m.classList.remove('open'); t.classList.remove('active'); }
  });
});

const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => { menu.classList.toggle('open'); toggle.classList.toggle('active'); });
}

// ============================================
// PROJECTS AUTO-SCROLL CAROUSEL
// ============================================
const projectGrid = document.querySelector('.projects-grid');
if (projectGrid && window.innerWidth > 768) {
  const arrows = document.querySelectorAll('.scroll-arrow');
  const dots = document.querySelectorAll('.scroll-dot');
  const cardCount = projectGrid.querySelectorAll('.proj-card').length;
  let isHovering = false;
  let autoTimer;

  arrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
      const dir = arrow.classList.contains('left') ? -1 : 1;
      const card = projectGrid.querySelector('.proj-card');
      if (card) {
        isHovering = true;
        projectGrid.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' });
        setTimeout(() => { isHovering = false; }, 800);
      }
    });
  });

  function updateDots() {
    const card = projectGrid.querySelector('.proj-card');
    if (!card || cardCount < 2) return;
    const idx = Math.round(projectGrid.scrollLeft / (card.offsetWidth + 24));
    dots.forEach((d, i) => d.classList.toggle('active', i === Math.min(idx, cardCount - 1)));
  }

  projectGrid.addEventListener('scroll', updateDots);

  function startAutoScroll() {
    stopAutoScroll();
    autoTimer = setInterval(() => {
      if (!isHovering) {
        const maxScroll = projectGrid.scrollWidth - projectGrid.clientWidth;
        if (projectGrid.scrollLeft >= maxScroll - 5) {
          projectGrid.scrollLeft = 0;
        } else {
          projectGrid.scrollLeft += 1;
        }
      }
    }, 16);
  }

  function stopAutoScroll() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  projectGrid.addEventListener('mouseenter', () => { isHovering = true; });
  projectGrid.addEventListener('mouseleave', () => { isHovering = false; });

  const projectsSection = document.getElementById('projects');
  const projectObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) startAutoScroll();
      else stopAutoScroll();
    }
  }, { threshold: 0.1 });
  if (projectsSection) projectObserver.observe(projectsSection);

  // Fallback: start if already visible
  if (projectsSection) {
    const rect = projectsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) startAutoScroll();
  }
}

// ============================================
// PROJECT CARDS — RAF coalesced, delegated from grid
// ============================================
if (projectGrid && window.innerWidth > 900) {
  let currentCard = null;
  let pending = false;

  projectGrid.addEventListener('mousemove', (e) => {
    if (pending) return;
    const card = e.target.closest('.proj-card');
    if (!card) return;
    pending = true;
    requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientX - rect.left) / rect.width) * 100;
      const ry = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', rx + '%');
      card.style.setProperty('--my', ry + '%');
      if (window.innerWidth > 900) {
        const tx = (e.clientX - rect.left) / rect.width - 0.5;
        const ty = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${tx * 8}deg) rotateX(${-ty * 8}deg) translateY(-6px)`;
      }
      pending = false;
    });
  });

  projectGrid.addEventListener('mouseleave', (e) => {
    if (!e.target.closest('.proj-card')) return;
    document.querySelectorAll('.proj-card').forEach(c => c.style.transform = '');
  });
}

// ============================================
// MAGNETIC
// ============================================
document.querySelectorAll('.magnetic').forEach(el => {
  let pending = false;
  el.addEventListener('mousemove', (e) => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 12;
      const y = (e.clientY - rect.top - rect.height / 2) / 12;
      el.style.transform = `translate(${x}px,${y}px)`;
      pending = false;
    });
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

// ============================================
// HOLO TILT
// ============================================
const holoFrame = document.querySelector('.holo-frame');
if (holoFrame && window.innerWidth > 900) {
  let pending = false;
  holoFrame.addEventListener('mousemove', (e) => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const rect = holoFrame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      holoFrame.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      pending = false;
    });
  });
  holoFrame.addEventListener('mouseleave', () => { holoFrame.style.transform = ''; });
}

// ============================================
// PARTICLES — minimal: 15 dots, no connections, 20fps
// ============================================
const pCanvas = document.getElementById('particles-canvas');
if (pCanvas) {
  const pctx = pCanvas.getContext('2d');
  let pw, ph, particles = [];
  let pFrame = 0;

  function resizeParticles() {
    pw = pCanvas.width = Math.floor(window.innerWidth / 2) * 2;
    ph = pCanvas.height = Math.floor(window.innerHeight / 2) * 2;
    const count = Math.min(15, Math.floor((pw * ph) / 50000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * pw, y: Math.random() * ph,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15 - 0.02,
      r: 1 + Math.random()
    }));
  }
  resizeParticles();

  function drawParticles() {
    if (++pFrame < 3) { requestAnimationFrame(drawParticles); return; }
    pFrame = 0;
    const time = performance.now() * 0.002;
    pctx.clearRect(0, 0, pw, ph);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      p.vy -= 0.001;
      if (p.y < -10) { p.y = ph + 10; p.vy = (Math.random() - 0.5) * 0.15 - 0.02; }
      if (p.x < -10) p.x = pw + 10;
      if (p.x > pw + 10) p.x = -10;
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) { p.vx -= (dx / dist) * 0.002; p.vy -= (dy / dist) * 0.002; }
      p.vx *= 0.99; p.vy *= 0.99;
      const pulse = 0.7 + 0.3 * Math.sin(time + p.x * 0.01);
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
      pctx.fillStyle = `rgba(0,229,255,${0.1 * pulse})`;
      pctx.fill();
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
  window.addEventListener('resize', resizeParticles);
}

// ============================================
// TYPING (ABOUT)
// ============================================
const typeEl = document.querySelector('.about-typing span');
if (typeEl) {
  const words = ['Data Analyst', 'ML Enthusiast', 'Business Analyst', 'Problem Solver', 'Pipeline Builder'];
  let wordIdx = 0, charIdx = 0, isDeleting = false;
  function typeLoop() {
    const current = words[wordIdx];
    if (isDeleting) {
      typeEl.textContent = current.substring(0, charIdx--);
      if (charIdx < 0) { isDeleting = false; wordIdx = (wordIdx + 1) % words.length; }
    } else {
      typeEl.textContent = current.substring(0, charIdx++);
      if (charIdx > current.length) isDeleting = true;
    }
    setTimeout(typeLoop, isDeleting ? 60 : 120);
  }
  typeLoop();
}

// ============================================
// TERMINAL FORM
// ============================================
const termForm = document.getElementById('term-form');
const termStatus = document.querySelector('.term-status');
if (termForm) {
  termForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = termForm.querySelector('.btn-neon');
    if (btn) btn.textContent = 'sending...';
    const data = Object.fromEntries(new FormData(termForm));
    try {
      const res = await fetch(termForm.action, {
        method: 'POST', body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });
      if (res.ok) { if (termStatus) termStatus.textContent = '✓ message transmitted'; termForm.reset(); }
      else { if (termStatus) termStatus.textContent = '✗ transmission failed'; }
    } catch { if (termStatus) termStatus.textContent = '✗ transmission failed'; }
    if (btn) btn.textContent = 'send_message';
    setTimeout(() => { if (termStatus) termStatus.textContent = ''; }, 4000);
  });
}

// ============================================
// HERO TYPING
// ============================================
if (document.querySelector('.hero .typing') && typeof Typed === 'function') {
  new Typed('.hero .typing', {
    strings: ['Data', 'ML Pipelines', 'Insights', 'Intelligent Systems', 'Predictions'],
    typeSpeed: 80, backSpeed: 50, backDelay: 2000, loop: true
  });
}

// ============================================
// CLICK RIPPLE
// ============================================
document.addEventListener('click', (e) => {
  const ripple = document.createElement('div');
  ripple.className = 'click-ripple';
  const size = 60 + Math.random() * 40;
  ripple.style.left = (e.clientX - size / 2) + 'px';
  ripple.style.top = (e.clientY - size / 2) + 'px';
  ripple.style.setProperty('--r-size', size + 'px');
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 800);
});

// ============================================
// TRIPLE CLICK GLITCH
// ============================================
let clickTimes = [];
document.addEventListener('click', () => {
  const now = Date.now();
  clickTimes.push(now);
  clickTimes = clickTimes.filter(t => now - t < 600);
  if (clickTimes.length < 3) return;
  clickTimes = [];
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#000;display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,monospace;font-size:28px;color:#0f0;cursor:pointer;flex-direction:column;gap:12px;';
  overlay.innerHTML = '<span style="font-size:48px;">⚠</span><span>SYSTEM COMPROMISED</span><span style="font-size:16px;color:#666;">click anywhere to restore</span>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => overlay.remove());
  setTimeout(() => { if (document.body.contains(overlay)) overlay.remove(); }, 4000);
});

const gs = document.createElement('style');
gs.textContent = '@keyframes glitchFlash{0%{transform:translate(0)}25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-2px)}75%{transform:translate(-2px,4px)}100%{transform:translate(0)}}';
document.head.appendChild(gs);

// ============================================
// SECRET EXPLORER
// ============================================
const secretInput = document.getElementById('secret-cmd-input');
const secretOutput = document.querySelector('.secret-output');
if (secretInput && secretOutput) {
  const easter = [
    { cmd: 'ls', output: 'VPipe/  sales_analysis/  kmeans_clustering/' },
    { cmd: 'cat harmoniq', output: 'Music recommender using Spotify API + collaborative filtering. Predicts your next favorite track.' },
    { cmd: 'cat vpipe', output: 'Deep learning pipe detection using TensorFlow/Keras CNNs — 90% accuracy for industrial safety.' },
    { cmd: 'cat sales_analysis', output: 'E-commerce sales analysis with Python (Pandas, Matplotlib, Seaborn) and SQL dashboards.' },
    { cmd: 'cat kmeans_clustering', output: 'K-Means clustering on complaint data — improved tracking accuracy by 10%.' },
    { cmd: 'whoami', output: 'Shubham Sharma — Data Analyst, ML Enthusiast, Business Analyst.' },
    { cmd: 'date', output: () => `Last commit: ${new Date().toLocaleDateString()}` },
    { cmd: 'help', output: 'Available: ls, whoami, date, cat [harmoniq|vpipe|sales_analysis|kmeans_clustering], cat resume' },
    { cmd: 'clear', output: '__clear__' }, { cmd: 'exit', output: 'You can\'t exit the dream.' },
    { cmd: 'sudo', output: '⛔ nice try.' },
    { cmd: 'cat resume', output: 'B.Tech AI & DS (CGPA 9.0) | Data Analyst @ Sourcemash | BA @ Desire Energy | Python, SQL, TensorFlow, K-Means' },
  ];
  const history = [];
  let histIdx = -1;
  function runCommand(cmd) {
    cmd = cmd.trim().toLowerCase();
    const match = easter.find(e => e.cmd === cmd);
    if (match) {
      const out = typeof match.output === 'function' ? match.output() : match.output;
      if (out === '__clear__') { secretOutput.textContent = ''; return; }
      secretOutput.textContent = `$ ${cmd}\n${out}`;
    } else { secretOutput.textContent = `$ ${cmd}\nbash: ${cmd}: command not found`; }
    history.push(cmd); histIdx = history.length;
  }
  secretInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const val = secretInput.value.trim(); if (val) runCommand(val); secretInput.value = ''; }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (history.length) { histIdx = Math.max(0, histIdx - 1); secretInput.value = history[histIdx] || ''; } }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (history.length) { histIdx = Math.min(history.length, histIdx + 1); secretInput.value = history[histIdx] || ''; } }
  });
}

// ============================================
// TEXT SCRAMBLE
// ============================================
document.querySelectorAll('.scramble-trigger').forEach(el => {
  const textEl = el.querySelector('.scramble-text');
  if (!textEl) return;
  const original = textEl.textContent;
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  el.addEventListener('mouseenter', () => {
    let it = 0;
    const iv = setInterval(() => {
      textEl.textContent = original.split('').map((c, i) => i < it ? original[i] : chars[Math.floor(Math.random() * chars.length)]).join('');
      it += 0.35;
      if (it >= original.length) { clearInterval(iv); textEl.textContent = original; }
    }, 30);
  });
});

// ============================================
// TOAST
// ============================================
function showToast(msg, icon) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="fas fa-${icon || 'check-circle'}"></i><span>${msg}</span>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 3500);
}

// ============================================
// FOOTER YEAR
// ============================================
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = `\u00A9 ${new Date().getFullYear()} — all signals green`;
