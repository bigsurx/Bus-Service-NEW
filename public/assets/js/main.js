/* ============================================================
   BUS SERVICE KG — Main JS
   ============================================================ */

// ── Header scroll effect ──
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile menu ──
const menuToggle = document.querySelector('.menu-toggle');
const siteNav    = document.querySelector('.site-nav');
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open);
    // Animate hamburger
    const spans = menuToggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  // Close on nav link click
  siteNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', false);
      const spans = menuToggle.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ── Active nav on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.site-nav a[href^="#"]');
if (sections.length && navLinks.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

// ── Fleet tabs ──
const fleetTabs = document.querySelectorAll('.fleet-tab');
const fleetPanels = document.querySelectorAll('.fleet-panel');
fleetTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.category;
    fleetTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    fleetPanels.forEach(panel => {
      panel.style.display = (panel.dataset.category === target || target === 'all') ? '' : 'none';
    });
    // Update grid visibility
    document.querySelectorAll('.vehicle-card[data-category]').forEach(card => {
      card.style.display = (target === 'all' || card.dataset.category === target) ? '' : 'none';
    });
  });
});

// ── Counter animation ──
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1600;
  const step = Math.ceil(target / (duration / 16));
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + (el.dataset.suffix || '');
    if (current >= target) clearInterval(timer);
  }, 16);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Gallery thumbnails (vehicle detail) ──
document.querySelectorAll('.vehicle-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    const main = thumb.closest('.vehicle-gallery')?.querySelector('.vehicle-gallery-main img');
    if (main) {
      main.src = thumb.querySelector('img').src;
      thumb.closest('.vehicle-gallery-thumbs')?.querySelectorAll('.vehicle-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    }
  });
});

// ── Sticky WhatsApp tooltip ──
const stickyLabel = document.querySelector('.sticky-wa-label');
if (stickyLabel) {
  setTimeout(() => { stickyLabel.style.display = 'none'; }, 4000);
}

// ── Contact form ──
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    setTimeout(() => {
      contactForm.innerHTML = `
        <div style="text-align:center;padding:40px 0">
          <div style="font-size:3rem;margin-bottom:16px">✓</div>
          <p style="font-size:1.125rem;font-weight:700;color:var(--color-primary);margin-bottom:8px">Заявка отправлена!</p>
          <p style="color:var(--color-text-muted)">Мы свяжемся с вами в ближайшее время.</p>
        </div>`;
    }, 1200);
  });
}
