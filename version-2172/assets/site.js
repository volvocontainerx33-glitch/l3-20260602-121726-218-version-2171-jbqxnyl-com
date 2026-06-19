(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-nav-toggle]');
  var menu = qs('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        startTimer();
      });
    }

    show(0);
    startTimer();
  });

  qsa('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('main') || document;
    var input = qs('[data-search-input]', panel);
    var filters = qsa('[data-filter]', panel);
    var cards = qsa('[data-card]', scope);

    function valueOf(name) {
      var el = filters.find(function (filter) {
        return filter.getAttribute('data-filter') === name;
      });
      return el ? el.value.trim().toLowerCase() : '';
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = valueOf('year');
      var region = valueOf('region');
      var type = valueOf('type');

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
          ok = false;
        }
        if (region && (card.getAttribute('data-region') || '').toLowerCase() !== region) {
          ok = false;
        }
        if (type && (card.getAttribute('data-type') || '').toLowerCase() !== type) {
          ok = false;
        }
        card.classList.toggle('hidden-card', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
  });

  qsa('.movie-player').forEach(function (box) {
    var video = qs('video', box);
    var button = qs('.player-cover', box);
    var src = box.getAttribute('data-video');
    var ready = false;

    function attach() {
      if (!video || !src || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('hidden');
      }
      var promise = video && video.play ? video.play() : null;
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  });
})();
