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

  const header = document.querySelector('header');
  let lastScroll = window.pageYOffset || document.documentElement.scrollTop;
  let ticking = false;

  // Determine current file (used for home vs other pages)
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const isHome = (currentFile === '' || currentFile === 'index.html' || currentFile === '/');

  // If this load is a reload, clear lock so reload always shows header
  try {
    const navEntries = performance.getEntriesByType ? performance.getEntriesByType('navigation') : null;
    const navType = navEntries && navEntries.length ? navEntries[0].type : (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');
    if (navType === 'reload') {
      sessionStorage.removeItem('hideHeader');
      sessionStorage.removeItem('hideHeaderLocked');
    }
  } catch (e) {
    // ignore
  }

  // On mobile, restore hide state only for non-home pages when locked
  if (window.innerWidth <= 700 && header) {
    const locked = sessionStorage.getItem('hideHeaderLocked') === 'true';
    const hidden = sessionStorage.getItem('hideHeader') === 'true';

    if (isHome) {
      // Home: never keep locked hidden state; reset any locks
      sessionStorage.removeItem('hideHeaderLocked');
      // If hidden was set, clear it so header shows on home
      if (hidden) {
        sessionStorage.setItem('hideHeader', 'false');
        header.classList.remove('hide-header');
      }
    } else {
      // Not home: restore hidden state if previously hidden
      if (hidden) header.classList.add('hide-header');
    }
  }

  function onScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (window.innerWidth <= 700 && header) {
      const isLocked = sessionStorage.getItem('hideHeaderLocked') === 'true';

      if (currentScroll > lastScroll && currentScroll > 50) {
        // scrolling down -> hide brand
        header.classList.add('hide-header');
        sessionStorage.setItem('hideHeader', 'true');

        if (!isHome) {
          // lock hidden state for non-home pages
          sessionStorage.setItem('hideHeaderLocked', 'true');
        }
      } else {
        // scrolling up
        if (isHome) {
          // on home page, show header when scrolling up (no lock)
          header.classList.remove('hide-header');
          sessionStorage.setItem('hideHeader', 'false');
        } else {
          // on other pages, only reveal if not locked
          if (!isLocked) {
            header.classList.remove('hide-header');
            sessionStorage.setItem('hideHeader', 'false');
          }
        }
      }
    } else if (header) {
      // ensure header visible on larger screens
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
