(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (header) {
      var update = function () {
        if (window.scrollY > 18) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
    }
    if (button && nav) {
      button.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    var show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === index);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    start();
  }

  function uniqueOptions(cards, attr) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(attr);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort();
  }

  function fillSelect(select, values) {
    if (!select || select.children.length > 1) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var cardList = document.querySelector('[data-card-list]');
      if (!cardList) {
        return;
      }
      var cards = Array.prototype.slice.call(cardList.querySelectorAll('.searchable-card'));
      var input = scope.querySelector('[data-local-search]');
      var region = scope.querySelector('[data-local-region]');
      var type = scope.querySelector('[data-local-type]');
      var year = scope.querySelector('[data-local-year]');
      fillSelect(region, uniqueOptions(cards, 'data-region'));
      fillSelect(type, uniqueOptions(cards, 'data-type'));
      fillSelect(year, uniqueOptions(cards, 'data-year').reverse());
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query) {
        input.value = query;
      }
      var apply = function () {
        var words = input && input.value ? input.value.trim().toLowerCase().split(/\s+/) : [];
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var searchText = (card.getAttribute('data-search') || '').toLowerCase();
          var matchedWords = words.every(function (word) {
            return searchText.indexOf(word) !== -1;
          });
          var matchedRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
          card.classList.toggle('is-hidden', !(matchedWords && matchedRegion && matchedType && matchedYear));
        });
      };
      [input, region, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function startVideo(card) {
    var video = card.querySelector('video');
    var cover = card.querySelector('.player-cover');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.controls = true;
    if (video.getAttribute('data-ready') !== '1') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        card.hlsPlayer = hls;
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (card) {
      var cover = card.querySelector('.player-cover');
      var video = card.querySelector('video');
      if (cover) {
        cover.addEventListener('click', function () {
          startVideo(card);
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.getAttribute('data-ready') !== '1') {
            startVideo(card);
          }
        });
      }
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initPlayers();
  });
})();
