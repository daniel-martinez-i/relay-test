/* ═══════════════════════════════════════════
   RELAY PITCH DECK – Interactions & Animations
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initNavHighlight();
  initCoverCanvas();
  initModalClose();
  initDataExpanders();
  initVerticalScrollNav();
  initDataRoomFab();
});

/* ═══ SCROLL REVEAL ═══ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ═══ NUMBER COUNTERS ═══ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return Math.round(n / 1000) + 'K';
    return n.toString();
  }

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + formatNumber(current) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

/* ═══ NAV HIGHLIGHT ═══ */
function initNavHighlight() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  const dotLinks = document.querySelectorAll('.dot-nav a');
  const nav = document.getElementById('main-nav');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
        dotLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));

  // Nav background on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

/* ═══ COVER CANVAS – Particle Grid ═══ */
function initCoverCanvas() {
  const canvas = document.getElementById('cover-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let w, h;

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const spacing = 60;
    const cols = Math.ceil(w / spacing);
    const rows = Math.ceil(h / spacing);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        particles.push({
          x: i * spacing + spacing / 2,
          y: j * spacing + spacing / 2,
          baseX: i * spacing + spacing / 2,
          baseY: j * spacing + spacing / 2,
          size: 1.2,
          opacity: 0.15 + Math.random() * 0.1,
        });
      }
    }
  }

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const accentR = 173, accentG = 73, accentB = 37;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;

      if (dist < maxDist) {
        const force = (1 - dist / maxDist) * 0.6;
        p.x += (p.x - mouse.x) * force * 0.05;
        p.y += (p.y - mouse.y) * force * 0.05;
      }

      // Spring back
      p.x += (p.baseX - p.x) * 0.08;
      p.y += (p.baseY - p.y) * 0.08;

      // Color based on distance to mouse
      let alpha = p.opacity;
      let r = 240, g = 240, b = 245;
      if (dist < maxDist) {
        const t = 1 - dist / maxDist;
        r = Math.round(240 + (accentR - 240) * t);
        g = Math.round(240 + (accentG - 240) * t);
        b = Math.round(245 + (accentB - 245) * t);
        alpha = p.opacity + t * 0.5;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

      // Draw connections to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
        if (d < 80) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / 80) * 0.08})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ═══ MODAL SYSTEM ═══ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function initModalClose() {
  // Close on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
      });
      document.body.style.overflow = '';
    }
  });
}

// Make modal functions global
window.openModal = openModal;
window.closeModal = closeModal;

/* ═══ DATA EXPANDER SYSTEM ═══ */
function initDataExpanders() {
  if (!document.body.classList.contains('version-1')) return;
  const wrappers = document.querySelectorAll('.data-expander-wrapper');

  function positionExpander(wrapper) {
    const btn = wrapper.querySelector('.data-expander-btn');
    const content = wrapper.querySelector('.data-expander-content');
    if (!btn || !content) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 12;
    const gap = 12;

    const buttonRect = btn.getBoundingClientRect();
    const panelWidth = Math.min(520, viewportWidth - viewportPadding * 2);

    content.style.width = `${panelWidth}px`;
    content.style.bottom = 'auto';

    const availableBelow = viewportHeight - buttonRect.bottom - viewportPadding - gap;
    const availableAbove = buttonRect.top - viewportPadding - gap;

    const minimumOpenHeight = 200;
    const openDown = availableBelow >= minimumOpenHeight || availableBelow >= availableAbove;
    const availableSpace = openDown ? availableBelow : availableAbove;
    const panelHeight = Math.max(180, Math.min(availableSpace, Math.floor(viewportHeight * 0.78)));

    content.style.maxHeight = `${panelHeight}px`;

    let left = buttonRect.left + buttonRect.width / 2 - panelWidth / 2;
    left = Math.max(viewportPadding, Math.min(left, viewportWidth - viewportPadding - panelWidth));

    let top;
    if (openDown) {
      top = Math.min(viewportHeight - viewportPadding - panelHeight, buttonRect.bottom + gap);
    } else {
      top = Math.max(viewportPadding, buttonRect.top - gap - panelHeight);
    }

    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const arrowLeft = Math.max(18, Math.min(panelWidth - 18, buttonCenterX - left));

    content.style.left = `${left}px`;
    content.style.top = `${top}px`;
    content.style.setProperty('--expander-arrow-left', `${arrowLeft}px`);
    content.classList.toggle('open-down', openDown);
  }
  
  wrappers.forEach(wrapper => {
    const btn = wrapper.querySelector('.data-expander-btn');
    let isPinned = false;

    const updatePosition = () => {
      if (!wrapper.classList.contains('active')) return;
      positionExpander(wrapper);
    };

    // Hover logic
    wrapper.addEventListener('mouseenter', () => {
      wrapper.classList.add('active');
      updatePosition();
    });

    wrapper.addEventListener('mouseleave', () => {
      if (!isPinned) {
        wrapper.classList.remove('active');
      }
    });

    // Click to pin logic
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isPinned = !isPinned;
      
      if (isPinned) {
        btn.classList.add('pinned');
        wrapper.classList.add('active');
        updatePosition();
      } else {
        btn.classList.remove('pinned');
        // If unpinned while mouse is outside, close it. Otherwise leave it open from hover.
        if (!wrapper.matches(':hover')) {
          wrapper.classList.remove('active');
        }
      }
    });
    
    // Close pinned expander if clicked outside
    document.addEventListener('click', (e) => {
      if (isPinned && !wrapper.contains(e.target)) {
        isPinned = false;
        btn.classList.remove('pinned');
        wrapper.classList.remove('active');
      }
    });

    window.addEventListener('resize', updatePosition, { passive: true });
    window.addEventListener('scroll', updatePosition, true);
  });
}

/* ═══ VERTICAL SCROLL (V1 & V3) ═══ */
function initVerticalScrollNav() {
  if (document.getElementById('horizontal-wrapper')) return; // Skip for V2

  let sections = Array.from(document.querySelectorAll('section'));

  function getTopOffset() {
    const nav = document.getElementById('main-nav');
    const progress = document.getElementById('v1-progress-container');
    const navHeight = nav ? nav.offsetHeight : 0;
    const progressHeight = progress ? progress.offsetHeight : 0;
    return navHeight + progressHeight + 8;
  }

  function scrollToSection(section) {
    if (!section) return;
    const topOffset = getTopOffset();
    const targetY = window.scrollY + section.getBoundingClientRect().top - topOffset;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }

  function getCurrentSection() {
    const topOffset = getTopOffset();
    const probeY = topOffset + 2;
    return sections.find(sec => {
      const rect = sec.getBoundingClientRect();
      return rect.top <= probeY && rect.bottom > probeY;
    }) || sections[0];
  }

  window.scrollV = function(dir) {
    const currentSection = getCurrentSection();
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex === -1) return;

    const topOffset = getTopOffset();
    const rect = currentSection.getBoundingClientRect();
    const viewportBottom = window.innerHeight;
    const travelStep = Math.max(220, Math.floor(window.innerHeight * 0.72));
    const edgeBuffer = 8;

    if (dir === 'down') {
      const hiddenBottom = rect.bottom - viewportBottom;

      if (hiddenBottom > edgeBuffer) {
        window.scrollBy({
          top: Math.min(travelStep, hiddenBottom),
          behavior: 'smooth'
        });
        return;
      }

      const nextSection = sections[currentIndex + 1];
      if (nextSection) scrollToSection(nextSection);
      return;
    }

    if (dir === 'up') {
      const hiddenTop = topOffset - rect.top;

      if (hiddenTop > edgeBuffer) {
        window.scrollBy({
          top: -Math.min(travelStep, hiddenTop),
          behavior: 'smooth'
        });
        return;
      }

      const previousSection = sections[currentIndex - 1];
      if (previousSection) scrollToSection(previousSection);
    }
  };

  document.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal-overlay.open')) return;
    if (document.getElementById('horizontal-wrapper')) return;

    // Use keys to snap to previous/next full slide without breaking normal trackpad scrolling
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      scrollV('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      scrollV('up');
    }
  });
}

/* ═══ DATA ROOM FAB VISIBILITY (V3) ═══ */
function initDataRoomFab() {
  const fab = document.getElementById('dataRoomFab');
  const dataroomSection = document.getElementById('dataroom');
  if (!fab || !dataroomSection) return;
  let hasUnlockedFab = false;

  function updateFabVisibility() {
    if (hasUnlockedFab) {
      fab.classList.add('visible');
      return;
    }

    const dataroomRect = dataroomSection.getBoundingClientRect();
    const activeProbe = window.innerHeight * 0.35;

    if (dataroomRect.top <= activeProbe && dataroomRect.bottom >= activeProbe) {
      hasUnlockedFab = true;
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', updateFabVisibility, { passive: true });
  updateFabVisibility();
}
