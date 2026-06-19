document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.mobile-toggle');
  var menu = document.querySelector('.mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('.hero-slider');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupSimpleFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('.no-result');

    if (!input || !cards.length) {
      return;
    }

    function run() {
      var q = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = !q || haystack.indexOf(q) !== -1;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', run);
    run();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(setupSimpleFilter);

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = searchPage.querySelector('#searchInput');
    var typeFilter = searchPage.querySelector('#typeFilter');
    var yearFilter = searchPage.querySelector('#yearFilter');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
    var empty = searchPage.querySelector('.no-result');

    if (input) {
      input.value = q;
    }

    function runSearch() {
      var keyword = normalize(input && input.value);
      var typeValue = normalize(typeFilter && typeFilter.value);
      var yearValue = normalize(yearFilter && yearFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var ok = okKeyword && okType && okYear;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [input, typeFilter, yearFilter].forEach(function (el) {
      if (el) {
        el.addEventListener('input', runSearch);
        el.addEventListener('change', runSearch);
      }
    });

    runSearch();
  }
});
