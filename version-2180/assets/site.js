(function () {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const base = document.body.getAttribute('data-base') || './';
  const searchInputs = Array.from(document.querySelectorAll('.global-search'));

  const renderSearch = function (input) {
    const wrap = input.closest('.search-wrap');
    const panel = wrap ? wrap.querySelector('.search-results') : null;
    if (!panel || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    const query = input.value.trim().toLowerCase();
    if (!query) {
      panel.classList.remove('is-visible');
      panel.innerHTML = '';
      return;
    }

    const results = window.SITE_MOVIES.filter(function (movie) {
      return movie.s.indexOf(query) !== -1;
    }).slice(0, 10);

    if (!results.length) {
      panel.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到匹配内容</strong><span>换一个片名、类型或年份试试</span></div></div>';
      panel.classList.add('is-visible');
      return;
    }

    panel.innerHTML = results.map(function (movie) {
      return '<a class="search-result-item" href="' + base + movie.l + '">' +
        '<img src="' + base + movie.c + '" alt="' + movie.t.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + movie.t + '</strong><span>' + movie.y + ' · ' + movie.r + ' · ' + movie.g + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('is-visible');
  };

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input);
    });
    input.addEventListener('focus', function () {
      renderSearch(input);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.search-wrap')) {
      document.querySelectorAll('.search-results').forEach(function (panel) {
        panel.classList.remove('is-visible');
      });
    }
  });

  const filterInput = document.querySelector('.filter-input');
  const filterYear = document.querySelector('.filter-year');
  const filterGrid = document.querySelector('[data-filterable]');

  const runFilter = function () {
    if (!filterGrid) {
      return;
    }

    const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const year = filterYear ? filterYear.value : '';
    const cards = Array.from(filterGrid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      const haystack = card.getAttribute('data-search') || '';
      const cardYear = card.getAttribute('data-year') || '';
      const matchText = !query || haystack.indexOf(query) !== -1;
      const matchYear = !year || cardYear === year;
      card.classList.toggle('is-hidden-card', !(matchText && matchYear));
    });
  };

  if (filterInput) {
    filterInput.addEventListener('input', runFilter);
  }

  if (filterYear) {
    filterYear.addEventListener('change', runFilter);
  }

  const playerShell = document.querySelector('[data-player]');

  if (playerShell) {
    const video = playerShell.querySelector('video');
    const source = video ? video.querySelector('source') : null;
    const cover = playerShell.querySelector('.player-cover');
    const src = source ? source.getAttribute('src') : '';
    let attached = false;

    const attachStream = function () {
      if (!video || !src || attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          maxBufferLength: 32,
          enableWorker: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        attached = true;
        return;
      }

      video.src = src;
      attached = true;
    };

    const startPlay = function () {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    };

    if (cover) {
      cover.addEventListener('click', startPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('loadedmetadata', function () {
        if (cover && !video.paused) {
          cover.classList.add('is-hidden');
        }
      });
    }
  }
})();
