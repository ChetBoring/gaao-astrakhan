const menuBtn = document.querySelector('.menuButton');
const mainNav = document.querySelector('.mainMenu');

if (menuBtn && mainNav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });
}

const loginModal = document.getElementById('loginModal');

function openLoginModal(event) {
  event.preventDefault();
  if (!loginModal) return;

  loginModal.classList.add('open');
  loginModal.setAttribute('aria-hidden', 'false');
}

function closeLoginModal() {
  if (!loginModal) return;

  loginModal.classList.remove('open');
  loginModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-login]').forEach((button) => {
  button.addEventListener('click', openLoginModal);
});

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', closeLoginModal);
});

if (loginModal) {
  loginModal.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });
}

function initYandexMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || !window.ymaps) return;

  const lat = Number(mapElement.dataset.lat) || 46.358698;
  const lon = Number(mapElement.dataset.lon) || 48.053382;
  const center = [lat, lon];

  window.ymaps.ready(() => {
    mapElement.innerHTML = '';

    const map = new window.ymaps.Map(mapElement, {
      center,
      zoom: 17,
      controls: ['zoomControl', 'fullscreenControl']
    });

    const placemark = new window.ymaps.Placemark(center, {
      balloonContentHeader: 'ГКУ АО «ГААО»',
      balloonContentBody: '414040, г. Астрахань, ул. Академика Королева, д. 39-А'
    });

    map.geoObjects.add(placemark);
  });
}

function loadYandexMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  if (window.ymaps) {
    initYandexMap();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
  script.onload = initYandexMap;
  script.onerror = () => {
    mapElement.classList.add('mapError');
  };

  document.head.appendChild(script);
}

loadYandexMap();


document.querySelectorAll('a.newsCard').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
  });
});

function initNewsPage() {
  const list = document.getElementById('newsList');
  const search = document.getElementById('newsSearch');
  const pagination = document.getElementById('newsPagination');
  const count = document.getElementById('newsCount');
  const empty = document.getElementById('newsEmpty');
  const loading = document.getElementById('newsLoading');

  if (!list || !search || !pagination) return;

  const cards = Array.from(list.querySelectorAll('.newsCard'));

  const perPage = 6;
  let currentPage = 1;
  let timerId;

  function getFilteredCards() {
    const query = search.value.trim().toLowerCase();

    if (!query) {
      return cards;
    }

    return cards.filter((card) => {
      const title = card.dataset.title || '';
      const category = card.dataset.category || '';
      const text = `${title} ${category} ${card.textContent}`.toLowerCase();

      return text.includes(query);
    });
  }

  function renderNews() {
    const filteredCards = getFilteredCards();
    const pagesCount = Math.max(1, Math.ceil(filteredCards.length / perPage));

    currentPage = Math.min(currentPage, pagesCount);

    const startIndex = (currentPage - 1) * perPage;
    const visibleCards = filteredCards.slice(startIndex, startIndex + perPage);

    cards.forEach((card) => card.classList.add('is-hidden'));
    visibleCards.forEach((card) => card.classList.remove('is-hidden'));

    if (count) {
      count.textContent = `Найдено материалов: ${filteredCards.length}`;
    }

    if (empty) {
      empty.classList.toggle('active', filteredCards.length === 0);
    }

    pagination.innerHTML = '';

    if (filteredCards.length <= perPage) {
      return;
    }

    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.textContent = '‹';
    previousButton.disabled = currentPage === 1;
    previousButton.setAttribute('aria-label', 'Предыдущая страница');
    previousButton.addEventListener('click', () => {
      currentPage -= 1;
      showNewsLoading(renderNews);
    });
    pagination.appendChild(previousButton);

    for (let page = 1; page <= pagesCount; page += 1) {
      const pageButton = document.createElement('button');
      pageButton.type = 'button';
      pageButton.textContent = String(page);
      pageButton.classList.toggle('active', page === currentPage);
      pageButton.setAttribute('aria-label', `Страница ${page}`);
      pageButton.addEventListener('click', () => {
        currentPage = page;
        showNewsLoading(renderNews);
      });
      pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.textContent = '›';
    nextButton.disabled = currentPage === pagesCount;
    nextButton.setAttribute('aria-label', 'Следующая страница');
    nextButton.addEventListener('click', () => {
      currentPage += 1;
      showNewsLoading(renderNews);
    });
    pagination.appendChild(nextButton);
  }

  function showNewsLoading(callback) {
    if (!loading) {
      callback();
      return;
    }

    loading.classList.add('active');
    list.classList.add('is-updating');

    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      callback();
      loading.classList.remove('active');
      list.classList.remove('is-updating');
    }, 160);
  }

  search.addEventListener('input', () => {
    currentPage = 1;
    showNewsLoading(renderNews);
  });

  renderNews();
}

initNewsPage();

function startNewsSlider() {
  const slider = document.getElementById('newsSlider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.sliderSlide'));
  const dots = Array.from(slider.querySelectorAll('.sliderDots button'));
  const prev = slider.querySelector('.sliderPrev');
  const next = slider.querySelector('.sliderNext');
  let current = 0;
  let sliderTimer;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goNext() {
    showSlide(current + 1);
  }

  function restartTimer() {
    window.clearInterval(sliderTimer);
    sliderTimer = window.setInterval(goNext, 15000);
  }

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(current - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      goNext();
      restartTimer();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      restartTimer();
    });
  });

  slides.forEach((slide) => {
    slide.addEventListener('click', (event) => event.preventDefault());
  });

  restartTimer();
}

startNewsSlider();
