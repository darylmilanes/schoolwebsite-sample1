// Preloader hide after page load
window.addEventListener('load', function() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.display = 'none';
  }
});

// Set current year in footer
document.addEventListener('DOMContentLoaded', function() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile header hide/show on scroll with lock across navigation
  let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
  const header = document.querySelector('header');
  let ticking = false;

  // detect navigation type: if this load is a reload, clear lock
  let navigationType = 'navigate';
  try {
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (nav && nav.length) navigationType = nav[0].type; // 'navigate' | 'reload' | 'back_forward' | 'prerender'
    else if (performance.navigation) navigationType = (performance.navigation.type === 1) ? 'reload' : 'navigate';
  } catch (e) {
    // ignore
  }

  if (navigationType === 'reload') {
    sessionStorage.removeItem('hideHeader');
    sessionStorage.removeItem('hideHeaderLocked');
  }

  // restore hide state from session if present
  if (window.innerWidth <= 700 && sessionStorage.getItem('hideHeader') === 'true' && header) {
    header.classList.add('hide-header');
  }

  function onScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // only on small screens
    if (window.innerWidth <= 700 && header) {
      const isLocked = sessionStorage.getItem('hideHeaderLocked') === 'true';

      if (currentScroll > lastScroll && currentScroll > 50) {
        // scrolling down -> hide brand and lock the hidden state across navigation
        header.classList.add('hide-header');
        sessionStorage.setItem('hideHeader', 'true');
        sessionStorage.setItem('hideHeaderLocked', 'true');
      } else {
        // scrolling up -> show brand only if not locked
        if (!isLocked) {
          header.classList.remove('hide-header');
          sessionStorage.setItem('hideHeader', 'false');
        }
        // if locked, do not reveal header on scroll up
      }
    } else if (header) {
      // ensure header is visible on larger screens or when resized
      header.classList.remove('hide-header');
      sessionStorage.setItem('hideHeader', 'false');
      sessionStorage.removeItem('hideHeaderLocked');
    }

    lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // on resize ensure header visibility state is correct
  window.addEventListener('resize', function() {
    if (window.innerWidth > 700 && header) {
      header.classList.remove('hide-header');
      sessionStorage.setItem('hideHeader', 'false');
      sessionStorage.removeItem('hideHeaderLocked');
    }
  });

  // Set active navbar item based on current URL and update on click
  const navLinks = Array.from(document.querySelectorAll('nav .menu a'));
  function updateActiveNav() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
      const linkFile = (link.getAttribute('href') || '').split('/').pop();
      if (linkFile === currentFile) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }
  updateActiveNav();
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });
  });

  // Programs page: filter behavior
  const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
  const programCards = Array.from(document.querySelectorAll('.program-card'));

  function applyFilter(filter) {
    programCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  // Prog-photo fade on other pages (disabled on programs page via CSS)
  if (!document.querySelector('.programs-page')) {
    const progPhotos = Array.from(document.querySelectorAll('.prog-photo'));
    let lastY = window.pageYOffset || document.documentElement.scrollTop;

    function handleGalleryScroll() {
      const currentY = window.pageYOffset || document.documentElement.scrollTop;
      const goingDown = currentY > lastY;

      progPhotos.forEach(el => {
        const rect = el.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (goingDown) {
          if (inViewport) el.classList.add('visible');
        } else {
          if (!inViewport) el.classList.remove('visible');
        }
      });

      lastY = currentY;
    }

    window.addEventListener('scroll', handleGalleryScroll, { passive: true });
    // initial check
    handleGalleryScroll();
  }
});
