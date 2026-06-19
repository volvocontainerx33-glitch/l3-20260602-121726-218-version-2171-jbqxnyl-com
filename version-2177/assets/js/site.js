(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initSearchFilters();
        initLocalFilter();
    });

    function initMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var drawer = document.querySelector("[data-mobile-drawer]");

        if (!button || !drawer) {
            return;
        }

        button.addEventListener("click", function () {
            drawer.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            if (timer || slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                stop();
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearchFilters() {
        var panel = document.querySelector("[data-search-panel]");

        if (!panel) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var input = panel.querySelector("[data-search-input]");
        var region = panel.querySelector("[data-region-filter]");
        var year = panel.querySelector("[data-year-filter]");
        var category = panel.querySelector("[data-category-filter]");
        var sort = panel.querySelector("[data-card-sort]");
        var grid = document.querySelector("[data-card-grid]");
        var resultCount = document.querySelector("[data-result-count]");
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];

        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        [input, region, year, category, sort].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();

        function applyFilters() {
            var query = normalize(input ? input.value : "");
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var categoryValue = category ? category.value : "";
            var visible = [];

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.dataset.type,
                    card.textContent
                ].join(" "));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchRegion = !regionValue || card.dataset.region === regionValue;
                var matchYear = !yearValue || card.dataset.year === yearValue;
                var matchCategory = !categoryValue || card.dataset.category === categoryValue;
                var isVisible = matchQuery && matchRegion && matchYear && matchCategory;

                card.hidden = !isVisible;
                if (isVisible) {
                    visible.push(card);
                }
            });

            sortCards(visible, sort ? sort.value : "default", grid);

            if (resultCount) {
                resultCount.textContent = "共 " + visible.length + " 部影片";
            }
        }
    }

    function initLocalFilter() {
        var input = document.querySelector("[data-local-filter]");
        var grid = document.querySelector("[data-card-grid]");
        var sort = document.querySelector("[data-card-sort]");

        if (!input || !grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        input.addEventListener("input", applyLocalFilter);
        if (sort) {
            sort.addEventListener("change", applyLocalFilter);
        }

        function applyLocalFilter() {
            var query = normalize(input.value);
            var visible = [];

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.dataset.type,
                    card.textContent
                ].join(" "));
                var isVisible = !query || haystack.indexOf(query) !== -1;
                card.hidden = !isVisible;
                if (isVisible) {
                    visible.push(card);
                }
            });

            sortCards(visible, sort ? sort.value : "default", grid);
        }
    }

    function sortCards(cards, mode, grid) {
        if (!grid || mode === "default") {
            return;
        }

        var sorted = cards.slice().sort(function (a, b) {
            if (mode === "year") {
                return numberFrom(b.dataset.year) - numberFrom(a.dataset.year);
            }
            if (mode === "rating") {
                return numberFrom(b.dataset.rating) - numberFrom(a.dataset.rating);
            }
            if (mode === "views") {
                return numberFrom(b.dataset.views) - numberFrom(a.dataset.views);
            }
            return 0;
        });

        sorted.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    function scoreFrom(card) {
        var badge = card.querySelector(".score-badge");
        return badge ? parseFloat(badge.textContent) || 0 : 0;
    }

    function numberFrom(value) {
        var match = String(value || "").match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    function textNumber(value) {
        var matches = String(value || "").match(/\d+/g);
        return matches ? parseInt(matches.join(""), 10) : 0;
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }
})();
