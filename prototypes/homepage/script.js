// Chaos Icons Animation
const chaosArea = document.getElementById('chaos-area');
const icons = chaosArea ? chaosArea.querySelectorAll('.chaos-icon') : [];
const iconData = [];
let mouseX = -1000;
let mouseY = -1000;
let animationId;

function initChaos() {
  if (!chaosArea) return;
  const rect = chaosArea.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  icons.forEach((icon, i) => {
    const size = 40;
    const pad = 4;
    iconData[i] = {
      x: Math.random() * (w - size - pad * 2) + pad,
      y: Math.random() * (h - size - pad * 2) + pad,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      rot: (Math.random() - 0.5) * 20,
      rotV: (Math.random() - 0.5) * 0.5,
      scale: 1,
      scaleV: (Math.random() - 0.5) * 0.008,
      baseScale: 0.85 + Math.random() * 0.3,
    };
  });
}

function updateChaos() {
  if (!chaosArea) return;
  const rect = chaosArea.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const size = 40;
  const pad = 4;
  const repelRadius = 60;
  const repelStrength = 0.3;

  icons.forEach((icon, i) => {
    const d = iconData[i];
    if (!d) return;

    // Mouse repulsion
    const iconCx = d.x + size / 2;
    const iconCy = d.y + size / 2;
    const dx = iconCx - mouseX;
    const dy = iconCy - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < repelRadius && dist > 0) {
      const force = (repelRadius - dist) / repelRadius * repelStrength;
      d.vx += (dx / dist) * force;
      d.vy += (dy / dist) * force;
    }

    // Damping
    d.vx *= 0.99;
    d.vy *= 0.99;

    // Clamp velocity
    const maxV = 1.5;
    const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
    if (speed > maxV) {
      d.vx = (d.vx / speed) * maxV;
      d.vy = (d.vy / speed) * maxV;
    }

    // Position
    d.x += d.vx;
    d.y += d.vy;

    // Bounce off walls
    if (d.x < pad) { d.x = pad; d.vx *= -0.8; }
    if (d.x > w - size - pad) { d.x = w - size - pad; d.vx *= -0.8; }
    if (d.y < pad) { d.y = pad; d.vy *= -0.8; }
    if (d.y > h - size - pad) { d.y = h - size - pad; d.vy *= -0.8; }

    // Rotation
    d.rot += d.rotV;

    // Scale pulsing
    d.scale += d.scaleV;
    if (d.scale > 1.15 || d.scale < 0.85) d.scaleV *= -1;

    // Apply
    const scale = d.baseScale * d.scale;
    icon.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg) scale(${scale})`;
  });

  animationId = requestAnimationFrame(updateChaos);
}

// Mouse tracking for chaos repulsion
document.addEventListener('mousemove', (e) => {
  if (!chaosArea) return;
  const rect = chaosArea.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

// Scroll reveal
function handleScroll() {
  const elements = document.querySelectorAll('.feature-card, .ai-content, .editor-mock, .price-card, .cta-section');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });

  // Navbar opacity
  const nav = document.getElementById('navbar');
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
}

// Pricing toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('billing-toggle');
  const monthlyLabel = document.getElementById('toggle-monthly');
  const yearlyLabel = document.getElementById('toggle-yearly');
  const amounts = document.querySelectorAll('.amount');

  if (toggle) {
    toggle.addEventListener('change', () => {
      const isYearly = toggle.checked;
      amounts.forEach(el => {
        el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
      });
      if (monthlyLabel && yearlyLabel) {
        monthlyLabel.classList.toggle('active', !isYearly);
        yearlyLabel.classList.toggle('active', isYearly);
      }
    });
  }

  // Current year in footer
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Init animations
  initChaos();
  animationId = requestAnimationFrame(updateChaos);
  handleScroll();
  window.addEventListener('scroll', handleScroll);

  // Handle resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animationId);
      initChaos();
      animationId = requestAnimationFrame(updateChaos);
    }, 200);
  });
});
