  /* --- Hamburger --- */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
  });

  /* --- Hero Carousel --- */
  const slides   = document.getElementById('heroSlides');
  const dotsWrap = document.getElementById('heroDots');
  let current = 0;
  const total = slides.children.length;

  // Crear dots
  for (let i = 0; i < total; i++) {
    const d = document.createElement('button');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Ir a noticia ' + (i+1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  }

  function goTo(idx) {
    current = (idx + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.hero-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  document.getElementById('heroPrev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('heroNext').addEventListener('click', () => goTo(current + 1));

  // Auto-play
  let autoplay = setInterval(() => goTo(current + 1), 5500);
  slides.addEventListener('mouseenter', () => clearInterval(autoplay));
  slides.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 5500);
  });

  // Swipe touch
  let touchStartX = 0;
  slides.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive: true});
  slides.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? current + 1 : current - 1);
  });

  /* --- Dark Mode (fix testing #1) --- */
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    showToast(document.body.classList.contains('dark-mode') ? 'Modo oscuro activado' : 'Modo claro activado');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  }
  if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');

  /* --- Font size --- */
  let baseSize = 16;
  function changeFontSize(dir) {
    baseSize = Math.min(22, Math.max(12, baseSize + dir * 2));
    document.documentElement.style.fontSize = baseSize + 'px';
    showToast('Tamaño de texto: ' + baseSize + 'px');
  }

  /* --- Toast --- */
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* --- FAB accesibilidad mobile --- */
  document.getElementById('fabAcc').addEventListener('click', () => {
    toggleDarkMode();
  });

  /* --- Activar nav item activo --- */
  const navLinks = document.querySelectorAll('.nav-link');
  const path = window.location.pathname;
  navLinks.forEach(l => {
    if (l.getAttribute('href') && l.getAttribute('href') !== '#' && path.includes(l.getAttribute('href').split('/').pop())) {
      l.classList.add('active');
    }
  });

  // --- Dropdown por CLIC (no hover) ---
  document.querySelectorAll('.nav-item').forEach(item => {
    const link = item.querySelector('.nav-link');
    const mega = item.querySelector('.dropdown-mega');
    if (!mega) return;

    // Evitar que el link navegue si tiene dropdown
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains('open');
      // Cerrar todos primero
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    }
  });

  function goTo(idx) {
    current = (idx + total) % total;
    slides.style.transform = `translateX(-${current * 100}%)`;
    
    // Opcional: Forzar al contenedor hero a igualar la altura de la imagen activa
    const activeImg = slides.children[current].querySelector('img');
    document.querySelector('.hero').style.height = activeImg.clientHeight + 'px';

    dotsWrap.querySelectorAll('.hero-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  /* --- Carrusel de Actividades Optimizado (Híbrido: Auto + Flechas) --- */
  document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById('actividadesTrack');
  const wrapper = document.getElementById('actividadesWrapper');
  const btnPrev = document.getElementById('actPrev');
  const btnNext = document.getElementById('actNext');

  if (!track || !wrapper) return;

  const originalItems = Array.from(track.children);
  originalItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
  });

  let isPaused = false;
  let isAnimating = false;
  let scrollPos = 0;
  const speed = 0.5;
  const cardWidth = 300;

  function autoScroll() {
      if (!isPaused && !isAnimating) {
          scrollPos += speed;
          if (scrollPos >= track.scrollWidth / 2) {
              scrollPos = 0; 
          }
          track.style.transform = `translateX(-${scrollPos}px)`;
      }
      requestAnimationFrame(autoScroll);
  }
  
  // Iniciar autoscroll y eventos de pausa
  requestAnimationFrame(autoScroll);
  wrapper.addEventListener('mouseenter', () => isPaused = true);
  wrapper.addEventListener('mouseleave', () => isPaused = false);

  function moveManual(direction) {
      if (isAnimating) return;
      isAnimating = true;

      const halfWidth = track.scrollWidth / 2;

      if (direction === -1 && (scrollPos - cardWidth) < 0) {
          track.style.transition = 'none'; 
          scrollPos += halfWidth; 
          track.style.transform = `translateX(-${scrollPos}px)`;
          track.offsetHeight;
      }

      track.style.transition = 'transform 0.3s ease';
      scrollPos += (direction * cardWidth);
      track.style.transform = `translateX(-${scrollPos}px)`;

      setTimeout(() => {
          track.style.transition = 'none'; 
          
          if (scrollPos >= halfWidth) {
              scrollPos -= halfWidth;
              track.style.transform = `translateX(-${scrollPos}px)`;
          }
          
          isAnimating = false; 
      }, 300);
  }

  btnNext.addEventListener('click', () => moveManual(1));
  btnPrev.addEventListener('click', () => moveManual(-1));
});

  /* --- Acordeón para Nav Móvil --- */
  const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');

  mobileNavBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Opcional: Cerrar los otros menús abiertos al hacer clic en uno nuevo
      mobileNavBtns.forEach(otherBtn => {
        if (otherBtn !== btn && otherBtn.classList.contains('active')) {
          otherBtn.classList.remove('active');
          otherBtn.nextElementSibling.style.maxHeight = null;
        }
      });

      // Alternar el estado activo del botón presionado
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      
      // Controlar la animación de altura
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });