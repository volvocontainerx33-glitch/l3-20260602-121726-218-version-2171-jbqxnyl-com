(function() {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("open");
    });
  }

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
      });
    });

    window.setInterval(function() {
      showSlide(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterGrid(grid, query, category, year) {
    var q = normalize(query);
    var c = normalize(category);
    var y = normalize(year);
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre")
      ].join(" "));
      var okQuery = !q || haystack.indexOf(q) !== -1;
      var okCategory = !c || normalize(card.getAttribute("data-category")) === c;
      var okYear = !y || normalize(card.getAttribute("data-year")) === y;
      card.classList.toggle("is-filtered-out", !(okQuery && okCategory && okYear));
    });
  }

  var homeGrid = document.getElementById("homeMovieGrid");
  var homeSearch = document.getElementById("homeSearch");
  var homeCategory = document.getElementById("homeCategory");

  if (homeGrid && homeSearch && homeCategory) {
    function applyHomeFilter() {
      filterGrid(homeGrid, homeSearch.value, homeCategory.value, "");
    }
    homeSearch.addEventListener("input", applyHomeFilter);
    homeCategory.addEventListener("change", applyHomeFilter);
  }

  var filterableGrid = document.querySelector(".filterable-grid");
  if (filterableGrid) {
    var pageSearch = document.querySelector(".pageSearch");
    var categoryFilter = document.querySelector(".categoryFilter");
    var yearFilter = document.querySelector(".yearFilter");

    function applyPageFilter() {
      filterGrid(
        filterableGrid,
        pageSearch ? pageSearch.value : "",
        categoryFilter ? categoryFilter.value : "",
        yearFilter ? yearFilter.value : ""
      );
    }

    if (pageSearch) {
      pageSearch.addEventListener("input", applyPageFilter);
    }
    if (categoryFilter) {
      categoryFilter.addEventListener("change", applyPageFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyPageFilter);
    }
  }
}());
