(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function filterCards(input) {
    var scope = input.closest('main');
    var target = scope ? scope.querySelector('[data-filter-scope]') : document;
    if (!target) {
      target = document;
    }
    var cards = target.querySelectorAll('[data-movie-card]');
    var query = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var hay = normalize(card.getAttribute('data-search'));
      var matched = !query || hay.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    var line = document.querySelector('[data-result-count]');
    if (line) {
      line.textContent = query ? '匹配内容：' + visible : '';
    }
  }

  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  document.querySelectorAll('[data-query-input]').forEach(function (input) {
    input.value = query;
  });
  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    if (input.hasAttribute('data-query-input') && query) {
      filterCards(input);
    }
    input.addEventListener('input', function () {
      filterCards(input);
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = hero.querySelectorAll('.hero-slide');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  });

  document.querySelectorAll('.js-player').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-cover');
    var src = box.getAttribute('data-src');
    var ready = false;
    var hls = null;

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function prepare() {
      if (ready || !src || !video) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        ready = true;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        ready = true;
        return;
      }
      video.src = src;
      ready = true;
      playVideo();
    }

    function start() {
      if (!video) {
        return;
      }
      box.classList.add('is-playing');
      prepare();
      if (ready) {
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }
  });
})();
