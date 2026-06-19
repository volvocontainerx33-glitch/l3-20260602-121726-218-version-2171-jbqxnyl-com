import { H as Hls } from "./hls-dru42stk.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $("[data-menu-button]");
  const panel = $("[data-mobile-panel]");

  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function setupHero() {
  const hero = $("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = $$("[data-hero-slide]", hero);
  const dots = $$("[data-hero-dot]", hero);
  let index = 0;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => show(dotIndex));
  });

  if (slides.length > 1) {
    window.setInterval(() => show(index + 1), 5200);
  }
}

function setupFilters() {
  const panel = $("[data-filter-panel]");
  const grid = $("[data-card-grid]");

  if (!panel || !grid) {
    return;
  }

  const input = $("[data-filter-input]", panel);
  const selects = $$("[data-filter-select]", panel);
  const sortSelect = $("[data-sort-select]", panel);
  const count = $("[data-filter-count]", panel);
  const cards = $$(".movie-card", grid);
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  const getNumber = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const sortCards = () => {
    if (!sortSelect || sortSelect.value === "default") {
      return;
    }

    const sorted = [...cards].sort((left, right) => {
      if (sortSelect.value === "year-desc") {
        return getNumber(right.dataset.year) - getNumber(left.dataset.year);
      }

      if (sortSelect.value === "year-asc") {
        return getNumber(left.dataset.year) - getNumber(right.dataset.year);
      }

      if (sortSelect.value === "title-asc") {
        return (left.dataset.title || "").localeCompare(right.dataset.title || "", "zh-Hans-CN");
      }

      return 0;
    });

    sorted.forEach((card) => grid.appendChild(card));
  };

  const apply = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const filters = Object.fromEntries(
      selects.map((select) => [select.dataset.filterSelect, select.value])
    );
    let visible = 0;

    cards.forEach((card) => {
      const searchText = (card.dataset.search || "").toLowerCase();
      const keywordMatched = !keyword || searchText.includes(keyword);
      const yearMatched = !filters.year || card.dataset.year === filters.year;
      const regionMatched = !filters.region || card.dataset.region === filters.region;
      const typeMatched = !filters.type || card.dataset.type === filters.type;
      const matched = keywordMatched && yearMatched && regionMatched && typeMatched;

      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `显示 ${visible} 部`;
    }

    sortCards();
  };

  input?.addEventListener("input", apply);
  selects.forEach((select) => select.addEventListener("change", apply));
  sortSelect?.addEventListener("change", apply);
  apply();
}

function setupPlayers() {
  const players = $$("[data-player]");

  players.forEach((player) => {
    const video = $("video", player);
    const button = $("[data-play-button]", player);

    if (!video || !button) {
      return;
    }

    const start = async () => {
      const source = video.dataset.src;

      if (!source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      button.hidden = true;

      try {
        await video.play();
      } catch (error) {
        button.hidden = false;
        console.warn("播放器需要用户再次点击才能开始播放。", error);
      }
    };

    button.addEventListener("click", start, { once: false });
  });
}

setupMobileMenu();
setupHero();
setupFilters();
setupPlayers();
