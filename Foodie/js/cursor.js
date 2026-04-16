(function () {
  'use strict';

  const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isDesktop) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';

  const cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';

  const cursorRing = document.createElement('div');
  cursorRing.className = 'cursor-ring';

  cursor.appendChild(cursorDot);
  document.body.appendChild(cursor);

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-particle-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none'; 
  canvas.style.zIndex = '9998'; 
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });


  function getAccentColor() {
    const docStyle = getComputedStyle(document.documentElement);
    let color = docStyle.getPropertyValue('--primary-color')?.trim() ||
                docStyle.getPropertyValue('--accent-color')?.trim() ||
                '#ff6347';
    if (!color.startsWith('#')) {
      color = '#ff6347';
    }
    return color;
  }
  function generatePalette(baseColor) {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    return [
      baseColor,
      `#${Math.min(255, r + 30).toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      `#${r.toString(16).padStart(2, '0')}${Math.min(255, g + 30).toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
      `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${Math.min(255, b + 30).toString(16).padStart(2, '0')}`
    ].map(c => c.length === 7 ? c : `#${c}`);
  }

  let currentColors = generatePalette(getAccentColor());
  const observer = new MutationObserver(() => {
    currentColors = generatePalette(getAccentColor());
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });

    class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 4 + 1;
      this.speedX = (Math.random() - 0.5) * 4;
      this.speedY = (Math.random() - 0.5) * 4;
      this.color = color;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.01; // variable fade speed
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;
      this.size *= 0.97;
    }
    draw() {
      if (this.alpha <= 0) return;

      const hex = this.color.slice(1);
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const particles = [];
  const maxParticles = 100;
  let lastEmit = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastEmit < 16) return;
    lastEmit = now;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const count = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < count; i++) {
      if (particles.length < maxParticles) {
        const color = currentColors[Math.floor(Math.random() * currentColors.length)];
        particles.push(new Particle(mouseX, mouseY, color));
      }
    }
  });

  function animateParticles() {
    requestAnimationFrame(animateParticles);
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.alpha <= 0 || p.size < 0.2) {
        particles.splice(i, 1);
      }
    }
  }
  animateParticles();

  let mouseX = 0;
  let mouseY = 0;
  let dotX = 0;
  let dotY = 0;

  const dotSpeed = 0.15;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateDOMCursor() {
    dotX += (mouseX - dotX) * dotSpeed;
    dotY += (mouseY - dotY) * dotSpeed;

    cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(animateDOMCursor);
  }

  animateDOMCursor();

  const interactiveSelector = 'a, button, [role="button"], input[type="submit"], input[type="button"], .clickable, .card, [onclick], .region-card, .cta-btn';

  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(interactiveSelector);
    if (el) cursor.classList.add('hover');

    if (['P', 'H1', 'H2', 'H3', 'H4', 'SPAN'].includes(e.target.tagName)) {
      cursor.classList.add('text');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    cursor.classList.remove('hover', 'text');
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
  });

  document.addEventListener('mouseup', () => {
    cursor.classList.remove('click');
  });

  // Hide on inputs
  document.addEventListener('mouseover', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      cursor.classList.add('hidden');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      cursor.classList.remove('hidden');
    }
  }, { passive: true });

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cursor.style.opacity = '0';
    } else {
      cursor.style.opacity = '1';
    }
  });

})();