(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || '0'));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
  filterForms.forEach(function (form) {
    var scope = form.closest('main') || document;
    var input = form.querySelector('[data-filter-input]');
    var year = form.querySelector('[data-filter-year]');
    var type = form.querySelector('[data-filter-type]');
    var count = scope.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    function applyFilter() {
      var query = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var isVisible = matchesQuery && matchesYear && matchesType;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, applyFilter);
    });
    applyFilter();
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var source = player.getAttribute('data-src');
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
  });

  var searchForm = document.querySelector('[data-global-search-form]');
  var searchInput = document.querySelector('[data-global-search-input]');
  var searchResults = document.querySelector('[data-global-search-results]');
  var searchCount = document.querySelector('[data-global-search-count]');

  function buildSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="detail/' + movie.id + '.html" aria-label="查看' + escapeHtml(movie.title) + '">',
      '    <span class="poster-fallback"></span>',
      '    <img src="' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add('image-missing');" />',
      '    <b class="badge-year">' + escapeHtml(movie.year) + '</b>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line">',
      '      <a href="' + movie.categoryFile + '">' + escapeHtml(movie.categoryName) + '</a>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="detail/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function runGlobalSearch(keyword) {
    if (!searchResults || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var query = normalize(keyword);
    if (!query) {
      searchResults.innerHTML = '';
      if (searchCount) {
        searchCount.textContent = '请输入关键词';
      }
      return;
    }
    var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      return normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' ')).indexOf(query) !== -1;
    }).slice(0, 120);
    searchResults.innerHTML = results.map(buildSearchCard).join('');
    if (searchCount) {
      searchCount.textContent = results.length + ' 条结果';
    }
  }

  if (searchForm && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    runGlobalSearch(initialQuery);

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value || '';
      var nextUrl = query ? '?q=' + encodeURIComponent(query) : window.location.pathname;
      window.history.replaceState(null, '', nextUrl);
      runGlobalSearch(query);
    });

    searchInput.addEventListener('input', function () {
      runGlobalSearch(searchInput.value || '');
    });
  }
})();
