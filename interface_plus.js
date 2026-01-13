(function () {
  'use strict';

  /* ============================================================
   * ПОЛІФІЛИ ТА УТИЛІТИ
   * ============================================================ */

  /**
   * Поліфіл для String.prototype.startsWith
   */
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  /**
   * Повертає правильну форму слова для числівника
   * @param {number} n - Число
   * @param {string} one - 'година'
   * @param {string} two - 'години'
   * @param {string} five - 'годин'
   * @returns {string}
   */
  function plural(n, one, two, five) {
    n = Math.abs(n) % 100;
    if (n >= 5 && n <= 20) return five;
    n = n % 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }

  /**
   * Отримує булеве значення зі сховища Lampa
   * @param {string} key - Ключ у сховищі
   * @param {boolean} def - Значення за замовчуванням
   * @returns {boolean}
   */
  function getBool(key, def) {
    var v = Lampa.Storage.get(key, def);
    if (typeof v === 'string') v = v.trim().toLowerCase();
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  /**
   * Розраховує середню тривалість епізоду (в хвилинах)
   * @param {object} movie - Об'єкт movie з Lampa
   * @returns {number} - Середня тривалість в хвилинах
   */
  function calculateAverageEpisodeDuration(movie) {
    if (!movie || typeof movie !== 'object') return 0;
    var total = 0,
      count = 0;

    if (Array.isArray(movie.episode_run_time) && movie.episode_run_time.length) {
      movie.episode_run_time.forEach(function (m) {
        if (m > 0 && m <= 200) {
          total += m;
          count++;
        }
      });
    } else if (Array.isArray(movie.seasons)) {
      movie.seasons.forEach(function (s) {
        if (Array.isArray(s.episodes)) {
          s.episodes.forEach(function (e) {
            if (e.runtime && e.runtime > 0 && e.runtime <= 200) {
              total += e.runtime;
              count++;
            }
          });
        }
      });
    }

    if (count > 0) return Math.round(total / count);

    if (movie.last_episode_to_air && movie.last_episode_to_air.runtime &&
      movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
      return movie.last_episode_to_air.runtime;
    }
    return 0;
  }

  /**
   * Форматує хвилини у рядок "X годин Y хвилин"
   * @param {number} minutes - Тривалість в хвилинах
   * @returns {string}
   */
  function formatDurationMinutes(minutes) {
    if (!minutes || minutes <= 0) return '';
    var h = Math.floor(minutes / 60),
      m = minutes % 60,
      out = '';
    if (h > 0) {
      out += h + ' ' + plural(h, 'година', 'години', 'годин');
      if (m > 0) out += ' ' + m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    } else {
      out += m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    }
    return out;
  }

  /* ============================================================
   * ЛОКАЛІЗАЦІЯ
   * ============================================================ */
  Lampa.Lang.add({
    interface_mod_new_group_title: {
      en: 'Interface +',
      uk: 'Інтерфейс +'
    },
    interface_mod_new_plugin_name: {
      en: 'Interface +',
      uk: 'Інтерфейс +'
    },

    // Кнопка перезавантаження
    interface_mod_new_reload_button: {
      en: 'Reload button',
      uk: 'Кнопка перезавантаження'
    },
    interface_mod_new_reload_button_desc: {
      en: 'Show reload button in the header',
      uk: 'Показати кнопку перезавантаження в заголовку'
    },

    interface_mod_new_info_panel: {
      en: 'New info panel',
      uk: 'Нова інфо-панель'
    },
    interface_mod_new_info_panel_desc: {
      en: 'Colored and rephrased info line',
      uk: 'Кольорова та перефразована інформаційна панель'
    },

    interface_mod_new_colored_ratings: {
      en: 'Colored rating',
      uk: 'Кольоровий рейтинг'
    },
    interface_mod_new_colored_ratings_desc: {
      en: 'Enable colored rating highlight',
      uk: 'Увімкнути кольорове виділення рейтингу в повній картці'
    },

    interface_mod_new_colored_status: {
      en: 'Colored statuses',
      uk: 'Кольорові статуси'
    },
    interface_mod_new_colored_status_desc: {
      en: 'Colorize series status',
      uk: 'Підсвічувати статус фільму/серіалу в повній картці'
    },

    interface_mod_new_colored_age: {
      en: 'Colored age rating',
      uk: 'Кольоровий віковий рейтинг '
    },
    interface_mod_new_colored_age_desc: {
      en: 'Colorize age rating',
      uk: 'Підсвічувати віковий рейтинг в повній картці'
    },

    // Логотипи замість назв
    logo_main_title: {
      en: 'Logos instead of titles',
      uk: 'Логотипи замість назв',
      ru: 'Логотипы вместо названий'
    },
    logo_main_description: {
      en: 'Displays movie logos instead of text',
      uk: 'Відображає логотипи фільмів замість тексту',
      ru: 'Отображает логотипы фильмов вместо текста'
    },
    logo_main_show: {
      en: 'Show',
      uk: 'Показати',
      ru: 'Отображать'
    },
    logo_main_hide: {
      en: 'Hide',
      uk: 'Приховати',
      ru: 'Скрыть'
    },
    logo_display_mode_title: {
      en: 'Display mode',
      uk: 'Режим відображення',
      ru: 'Режим отображения'
    },
    logo_display_mode_logo_only: {
      en: 'Logo only',
      uk: 'Тільки логотип',
      ru: 'Только логотип'
    },
    logo_display_mode_logo_and_text: {
      en: 'Logo and text',
      uk: 'Логотип і текст',
      ru: 'Логотип и текст'
    },

    // Теми (інтегровані з themes_ua_loader.js)
    interface_mod_new_themes: {
      en: 'Themes',
      uk: 'Теми'
    },
    interface_mod_new_themes_desc: {
      en: 'Interface themes',
      uk: 'Теми оформлення інтерфейсу'
    },
    interface_mod_new_theme_mint_dark: {
      en: 'Mint Dark',
      uk: 'Мінтий темний'
    },
    interface_mod_new_theme_deep_aurora: {
      en: 'Deep Aurora',
      uk: 'Глибока Аврора'
    },
    interface_mod_new_theme_crystal_cyan: {
      en: 'Crystal Cyan',
      uk: 'Кришталевий Блакитний'
    },
    interface_mod_new_theme_amber_noir: {
      en: 'Amber Noir',
      uk: 'Бурштиновий Нуар'
    },
    interface_mod_new_theme_velvet_sakura: {
      en: 'Velvet Sakura',
      uk: 'Оксамитова Сакура'
    },
    interface_mod_new_theme_default: {
      en: 'Default LAMPA',
      uk: 'Стандартна LAMPA'
    },

    // Анімації (з themes_ua_loader.js)
    interface_mod_new_animations: {
      en: 'Animations',
      uk: 'Анімації'
    },
    interface_mod_new_animations_desc: {
      en: 'Enable interface animations',
      uk: 'Увімкнути анімації інтерфейсу'
    },

    // ОРИГІНАЛЬНА НАЗВА
    interface_mod_new_en_data: {
      en: 'Original title',
      uk: 'Оригінальна назва'
    },
    interface_mod_new_en_data_desc: {
      en: 'Show original (EN) title under the card header',
      uk: 'Показувати оригінальну назву в заголовку картки'
    },

    // КНОПКИ
    interface_mod_new_all_buttons: {
      en: 'All buttons in card',
      uk: 'Всі кнопки в картці'
    },
    interface_mod_new_all_buttons_desc: {
      en: 'Show all buttons in the card. Order: Online → Torrents → Trailers',
      uk: 'Показує всі кнопки у картці (Потрібне перезавантаження)'
    },

    interface_mod_new_icon_only: {
      en: 'Icons only',
      uk: 'Кнопки без тексту'
    },
    interface_mod_new_icon_only_desc: {
      en: 'Hide button labels, keep only icons',
      uk: 'Ховає підписи на кнопках, лишає тільки іконки'
    },

    interface_mod_new_colored_buttons: {
      en: 'Colored buttons',
      uk: 'Кольорові кнопки'
    },
    interface_mod_new_colored_buttons_desc: {
      en: 'Colorize card buttons and update icons',
      uk: 'Оновлює іконки та кольори кнопок онлайн, торенти, трейлери'
    },

    // НОВЕ: Розмір кнопок
    interface_mod_new_button_size: {
      en: 'Button size',
      uk: 'Розмір кнопок'
    },
    interface_mod_new_button_size_desc: {
      en: 'Adjust button size (applied after restart)',
      uk: 'Змінити розмір кнопок (застосовується після перезапуску)'
    },
    interface_mod_new_button_size_small: {
      en: 'Small',
      uk: 'Маленькі'
    },
    interface_mod_new_button_size_normal: {
      en: 'Normal',
      uk: 'Нормальні'
    },
    interface_mod_new_button_size_large: {
      en: 'Large',
      uk: 'Великі'
    },

    // ТОРЕНТИ (з torrents+mod)
    torr_mod_frame: {
      uk: 'Кольорова рамка блоку торентів',
      en: 'Torrent frame by seeders'
    },
    torr_mod_frame_desc: {
      uk: 'Підсвічувати блоки торентів кольоровою рамкою залежно від кількості сідерів',
      en: 'Outline torrent rows based on seeder count'
    },
    torr_mod_bitrate: {
      uk: 'Кольоровий  бітрейт',
      en: 'Bitrate-based coloring'
    },
    torr_mod_bitrate_desc: {
      uk: 'Підсвічувати бітрейт кольором в залежності від розміру',
      en: 'Color bitrate by value'
    },
    torr_mod_seeds: {
      uk: 'Кольорова кількість роздаючих',
      en: 'Seeder count coloring'
    },
    torr_mod_seeds_desc: {
      uk: 'Підсвічувати кількість сідерів на роздачі: \n0–4 — червоний, 5–14 — жовтий, 15 і вище — зелений',
      en: 'Seeders: 0–4 red, 5–14 yellow, 15+ green'
    },
    
    // РЕЙТИНГИ (з rating_my.js)
    interface_mod_new_ratings_group: {
      en: 'Ratings',
      uk: 'Рейтинги'
    },
    interface_mod_new_ratings_desc: {
      en: 'Enhanced ratings from MDBList + OMDb',
      uk: 'Покращені рейтинги з MDBList + OMDb'
    },
    interface_mod_new_ratings_show_awards: {
      en: 'Show awards',
      uk: 'Показувати нагороди'
    },
    interface_mod_new_ratings_show_awards_desc: {
      en: 'Show Oscars, Emmy and other awards',
      uk: 'Показувати Оскари, Еммі та інші нагороди'
    },
    interface_mod_new_ratings_show_average: {
      en: 'Average rating',
      uk: 'Середній рейтинг'
    },
    interface_mod_new_ratings_show_average_desc: {
      en: 'Show average rating',
      uk: 'Показувати середній рейтинг'
    },
    interface_mod_new_ratings_colorize_all: {
      en: 'Colorize ratings',
      uk: 'Кольорові рейтинги'
    },
    interface_mod_new_ratings_colorize_all_desc: {
      en: 'Color highlighting of ratings',
      uk: 'Кольорове виділення оцінок рейтингів'
    },
    interface_mod_new_ratings_enable_imdb: {
      en: 'IMDb',
      uk: 'IMDb'
    },
    interface_mod_new_ratings_enable_imdb_desc: {
      en: 'Show/hide source',
      uk: 'Показувати/ховати джерело'
    },
    interface_mod_new_ratings_enable_tmdb: {
      en: 'TMDB',
      uk: 'TMDB'
    },
    interface_mod_new_ratings_enable_tmdb_desc: {
      en: 'Show/hide source',
      uk: 'Показувати/ховати джерело'
    },
    interface_mod_new_ratings_enable_mc: {
      en: 'Metacritic',
      uk: 'Metacritic'
    },
    interface_mod_new_ratings_enable_mc_desc: {
      en: 'Show/hide source',
      uk: 'Показувати/ховати джерело'
    },
    interface_mod_new_ratings_enable_rt: {
      en: 'Rotten Tomatoes',
      uk: 'Rotten Tomatoes'
    },
    interface_mod_new_ratings_enable_rt_desc: {
      en: 'Show/hide source',
      uk: 'Показувати/ховати джерело'
    },
    interface_mod_new_ratings_enable_popcorn: {
      en: 'Popcornmeter',
      uk: 'Popcornmeter'
    },
    interface_mod_new_ratings_enable_popcorn_desc: {
      en: 'Show/hide source',
      uk: 'Показувати/ховати джерело'
    },
    interface_mod_new_ratings_clear_cache: {
      en: 'Clear ratings cache',
      uk: 'Очистити кеш рейтингів'
    },
    oscars_label: {
      uk: 'Оскар'
    },
    emmy_label: {
      uk: 'Еммі'
    },
    awards_other_label: {
      uk: 'Нагороди'
    },
    popcorn_label: {
      uk: 'Глядачі'
    },
    source_tmdb: {
      ru: 'TMDB',
      en: 'TMDB',
      uk: 'TMDB'
    },
    source_imdb: {
      ru: 'IMDb',
      en: 'IMDb',
      uk: 'IMDb'
    },
    source_mc: {
      ru: 'Metacritic',
      en: 'Metacritic',
      uk: 'Metacritic'
    },
    source_rt: {
      ru: 'Rotten',
      en: 'Rotten',
      uk: 'Rotten'
    }
  });

  /* ============================================================
   * НАЛАШТУВАННЯ
   * ============================================================ */

  /**
   * Отримує налаштування оригінальної назви (зі зворотною сумісністю)
   */
  function getOriginalTitleEnabled() {
    var rawNew = Lampa.Storage.get('interface_mod_new_en_data');
    if (typeof rawNew !== 'undefined') return getBool('interface_mod_new_en_data', true);
    // Fallback до старого ключа
    return getBool('interface_mod_new_english_data', false);
  }

  /**
   * Конфігурація API ключів для рейтингів
   */
  var LMP_ENH_CONFIG = {
    apiKeys: {
      mdblist: 'nmqhlb9966w9m86h3yntb0dpz', // ключ до MDBList
      omdb: '358837db' // ключ до OMDb
    }
  };

  /**
   * Налаштування за замовчуванням для рейтингів
   */
  var RCFG_DEFAULT = {
    ratings_show_awards: true,
    ratings_show_average: true,
    ratings_colorize_all: false,
    ratings_enable_imdb: true,
    ratings_enable_tmdb: true,
    ratings_enable_mc: true,
    ratings_enable_rt: true,
    ratings_enable_popcorn: true
  };

  /**
   * Джерела іконок для рейтингів
   */
  var BASE_ICON = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/';
  var ICONS = {
    total_star: BASE_ICON + 'star.png',
    imdb: BASE_ICON + 'imdb.png',
    tmdb: BASE_ICON + 'tmdb.png',
    metacritic: BASE_ICON + 'metacritic.png',
    rotten_good: BASE_ICON + 'RottenTomatoes.png',
    rotten_bad: BASE_ICON + 'RottenBad.png',
    popcorn: BASE_ICON + 'PopcornGood.png',
    awards: BASE_ICON + 'awards.png',
    oscar: BASE_ICON + 'OscarGold.png',
    emmy: BASE_ICON + 'EmmyGold.png'
  };

  /**
   * Об'єкт з поточними налаштуваннями плагіну
   */
  var settings = {
    reload_button: getBool('interface_mod_new_reload_button', true), // Новий параметр для кнопки перезавантаження
    info_panel: getBool('interface_mod_new_info_panel', true),
    colored_ratings: getBool('interface_mod_new_colored_ratings', false),
    colored_status: getBool('interface_mod_new_colored_status', false),
    colored_age: getBool('interface_mod_new_colored_age', false),

    en_data: getOriginalTitleEnabled(),
    all_buttons: getBool('interface_mod_new_all_buttons', false),
    icon_only: getBool('interface_mod_new_icon_only', false),
    colored_buttons: getBool('interface_mod_new_colored_buttons', false),
    button_size: (Lampa.Storage.get('interface_mod_new_button_size', 'normal') || 'normal'),

    // Налаштування для логотипів
    logo_main: Lampa.Storage.get('logo_main', '0'),
    logo_display_mode: Lampa.Storage.get('logo_display_mode', 'logo_only'),

    // Налаштування для torrents+mod
    tor_frame: getBool('interface_mod_new_tor_frame', true),
    tor_bitrate: getBool('interface_mod_new_tor_bitrate', true),
    tor_seeds: getBool('interface_mod_new_tor_seeds', true),

    // Налаштування тем (з themes_ua_loader.js)
    theme: Lampa.Storage.get('interface_mod_new_theme', 'mint_dark'),
    animations: getBool('interface_mod_new_animations', true),

    // Налаштування для рейтингів
    ratings_show_awards: getBool('ratings_show_awards', RCFG_DEFAULT.ratings_show_awards),
    ratings_show_average: getBool('ratings_show_average', RCFG_DEFAULT.ratings_show_average),
    ratings_colorize_all: getBool('ratings_colorize_all', RCFG_DEFAULT.ratings_colorize_all),
    ratings_enable_imdb: getBool('ratings_enable_imdb', RCFG_DEFAULT.ratings_enable_imdb),
    ratings_enable_tmdb: getBool('ratings_enable_tmdb', RCFG_DEFAULT.ratings_enable_tmdb),
    ratings_enable_mc: getBool('ratings_enable_mc', RCFG_DEFAULT.ratings_enable_mc),
    ratings_enable_rt: getBool('ratings_enable_rt', RCFG_DEFAULT.ratings_enable_rt),
    ratings_enable_popcorn: getBool('ratings_enable_popcorn', RCFG_DEFAULT.ratings_enable_popcorn),

    // Видалені налаштування
    translate_tv: false,
    incardtemplate: false,
    bigbuttons: false
  };

  /**
   * Кеш DOM-елементів та даних поточної відкритої картки
   */
  var __ifx_last = {
    details: null,
    movie: null,
    originalHTML: '',
    isTv: false,
    fullRoot: null
  };
  var __ifx_btn_cache = {
    container: null,
    nodes: null
  };

  /* ============================================================
   * ФОЛБЕК-CSS + ПРІОРИТЕТ СТИЛІВ
   * ============================================================ */

  /**
   * Додає CSS для "відкату" стилів (якщо кольорові статуси/рейтинги вимкнені)
   */
  function injectFallbackCss() {
    if (document.getElementById('ifx_fallback_css')) return;
    var st = document.createElement('style');
    st.id = 'ifx_fallback_css';
    st.textContent = `
      .ifx-status-fallback{ border-color:#fff !important; background:none !important; color:inherit !important; }
      .ifx-age-fallback{    border-color:#fff !important; background:none !important; color:inherit !important; }
    `;
    document.head.appendChild(st);
  }

  /**
   * Переконується, що стилі плагіну (особливо теми) мають вищий пріоритет
   */
  function ensureStylesPriority(ids) {
    var head = document.head;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode === head) {
        head.removeChild(el);
        head.appendChild(el);
      }
    });
  }

  /* ============================================================
   * БАЗОВІ СТИЛІ
   * ============================================================ */
  (function injectBaseCss() {
    if (document.getElementById('interface_mod_base')) return;

    var css = `
      .full-start-new__details{
        color:#fff !important;
        margin:-0.45em !important;
        margin-bottom:1em !important;
        display:flex !important;
        align-items:center !important;
        flex-wrap:wrap !important;
        min-height:1.9em !important;
        font-size:1.1em !important;
      }
      *:not(input){ -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important; user-select:none !important; }
      *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }

      .full-start-new__rate-line > * {
        margin-left: 0 !important;
        margin-right: 1em !important;
        flex-shrink: 0;
        flex-grow: 0;
      }

      /* ОРИГІНАЛЬНА НАЗВА — сірий, −25%, з лівою лінією */
      .ifx-original-title{
        color:#aaa;
        font-size: 0.75em;
        font-weight: 600;
        margin-top: 4px;
        border-left: 2px solid #777;
        padding-left: 8px;
      }

      /* Іконки без тексту */
      .ifx-btn-icon-only .full-start__button span,
      .ifx-btn-icon-only .full-start__button .full-start__text{
        display:none !important;
      }

      .full-start__buttons.ifx-flex,
      .full-start-new__buttons.ifx-flex{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:10px !important;
      }
      
      /* Приховуємо позначку TV на постерах серіалів */
      .card__type {
        display: none !important;
      }
      
      /* Стилі для логотипів */
      .full-start-new__title img,
      .full-start__title img {
        max-height: 2.8em;
        display: block;
        margin-bottom: 0.2em;
      }
      
      /* Стилі для кнопки перезавантаження */
      #RELOAD {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5em;
        height: 2.5em;
        margin-left: 0.5em;
      }
      #RELOAD svg {
        width: 1.5em;
        height: 1.5em;
        color: #fff;
      }
      #RELOAD.focus,
      #RELOAD.hover {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.3em;
      }
      
      /* Стилі для режиму "тільки логотип" - приховування тексту */
      .logo-only-mode .full-start-new__title > span,
      .logo-only-mode .full-start__title > span {
        display: none !important;
      }
      
      /* Стилі для режиму "логотип і текст" */
      .logo-text-mode .full-start-new__title > span,
      .logo-text-mode .full-start__title > span {
        display: block !important;
        margin-top: 0.2em;
      }
    `;
    var st = document.createElement('style');
    st.id = 'interface_mod_base';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* ============================================================
   * СТИЛІ ДЛЯ РЕЙТИНГІВ
   * ============================================================ */
  (function injectRatingsCss() {
    if (document.getElementById('interface_mod_ratings_css')) return;

    var css = `
      /* --- Лоадер "Пошук..." --- */
      .loading-dots-container {
        display: flex;
        align-items: center;
        font-size: 0.85em;
        color: #ccc;
        padding: 0.6em 1em;
        border-radius: 0.5em;
      }
      .loading-dots__text {
        margin-right: 1em;
      }
      .loading-dots__dot {
        width: 0.5em;
        height: 0.5em;
        border-radius: 50%;
        background-color: currentColor;
        animation: loading-dots-bounce 1.4s infinite ease-in-out both;
      }
      .loading-dots__dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .loading-dots__dot:nth-child(2) {
        animation-delay: -0.16s;
      }
      @keyframes loading-dots-bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
        40% { transform: translateY(-0.5em); opacity: 1; }
      }

      /* --- CSS Змінні (розміри іконок) --- */
      :root{
        --lmp-h-imdb:24px;
        --lmp-h-mc:24px;
        --lmp-h-rt:26px;
        --lmp-h-popcorn:26px;
        --lmp-h-tmdb:26px;
        --lmp-h-awards:20px;
        --lmp-h-avg:20px;
        --lmp-h-oscar:22px;
        --lmp-h-emmy:24px;
      }

      /* --- Кольоровий режим --- */
      .rate--oscars, .rate--emmy, .rate--awards, .rate--gold {
        color: gold;
      }

      /* --- Кольори оцінок --- */
      .full-start__rate.rating--green  { color: #2ecc71; } /* ≥ 8.0  */
      .full-start__rate.rating--blue   { color: #60a5fa; } /* 6.0–7.9 */
      .full-start__rate.rating--orange { color: #f59e0b; } /* 4.0–5.9 */
      .full-start__rate.rating--red    { color: #ef4444; } /* < 4.0   */

      /* --- Ущільнення відступів --- */
      .full-start-new__rate-line .full-start__rate {
        margin-right: 0.3em !important;
      }
      .full-start-new__rate-line .full-start__rate:last-child {
        margin-right: 0 !important;
      }

      /* --- Приховування рядка під час завантаження --- */
      .full-start-new__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader),
      .full-start__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader) {
        opacity: 0 !important;
        pointer-events: none !important;
        transition: opacity 0.15s;
      }

      /* --- Вирівнювання іконок нагород --- */
      .lmp-award-icon{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        line-height:1;
        height:auto;
        width:auto;
        flex-shrink:0;
      }
      .lmp-award-icon img{
        height:auto;
        width:auto;
        display:block;
        object-fit:contain;
      }
      .lmp-award-icon--oscar img{height:var(--lmp-h-oscar);}
      .lmp-award-icon--emmy  img{height:var(--lmp-h-emmy);}

      /* --- Базові розміри іконок сервісів --- */
      .rate--imdb    .source--name img{height:var(--lmp-h-imdb);}
      .rate--mc      .source--name img{height:var(--lmp-h-mc);}
      .rate--rt      .source--name img{height:var(--lmp-h-rt);}
      .rate--popcorn .source--name img{height:var(--lmp-h-popcorn);}
      .rate--tmdb    .source--name img{height:var(--lmp-h-tmdb);}
      .rate--awards  .source--name img{height:var(--lmp-h-awards);}
      .rate--avg     .source--name img{height:var(--lmp-h-avg);}

      /* --- Вирівнювання іконок --- */
      .full-start__rate .source--name{
        display:inline-flex;
        align-items:center;
        justify-content:center;
      }

      /* --- Налаштування --- */
      .settings-param__descr,.settings-param__subtitle{white-space:pre-line;}

      /* --- Адаптив (Mobile) --- */
      @media (max-width: 600px){
        .full-start-new__rate-line{flex-wrap:wrap;}
        .full-start__rate{
          margin-right:.25em !important;
          margin-bottom:.25em;
          font-size:16px;
          min-width:unset;
        }
        :root{
          --lmp-h-imdb:14px; --lmp-h-mc:14px; --lmp-h-rt:16px;
          --lmp-h-popcorn:16px; --lmp-h-tmdb:16px; --lmp-h-awards:14px;
          --lmp-h-avg:14px; --lmp-h-oscar:14px; --lmp-h-emmy:16px;
        }
        .loading-dots-container{font-size:.8em; padding:.4em .8em;}
        .lmp-award-icon{height:16px;}
      }

      /* --- Адаптив (Small Mobile) --- */
      @media (max-width: 360px){
        .full-start__rate{font-size:14px;}
        :root{
          --lmp-h-imdb:12px; --lmp-h-mc:12px; --lmp-h-rt:14px;
          --lmp-h-popcorn:14px; --lmp-h-tmdb:14px; --lmp-h-awards:12px;
          --lmp-h-avg:12px; --lmp-h-oscar:12px; --lmp-h-emmy:14px;
        }
        .lmp-award-icon{height:12px;}
      }

      /* Приховування стандартного рейтингу Кінопошуку */
      .full-start__rate.rate--kp, .rate--kp{display:none!important;}
    `;
    
    var st = document.createElement('style');
    st.id = 'interface_mod_ratings_css';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* ============================================================
   * ФУНКЦІОНАЛ КНОПКИ ПЕРЕЗАВАНТАЖЕННЯ
   * ============================================================ */
  
  var icon_server_reload = '<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="0.4800000000000001"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></g></svg></div>';
  
  /**
   * Додає кнопку перезавантаження в заголовок
   */
  function addReloadButton() {
    // Перевіряємо, чи вже існує кнопка
    if ($('#RELOAD').length) return;
    
    // Перевіряємо, чи увімкнено кнопку перезавантаження
    if (!getBool('interface_mod_new_reload_button', true)) return;
    
    var reloadBUTT = '<div id="RELOAD" class="head__action selector redirect-screen">' + icon_server_reload + '</div>';
    
    // Додаємо кнопку в заголовок
    $('#app > div.head > div > div.head__actions').append(reloadBUTT);
    
    // Додаємо обробник подій
    $('#RELOAD').on('hover:enter hover:click hover:touch', function() {
      location.reload();
    });
    
    console.log('✅ Кнопка перезавантаження додана');
  }
  
  /**
   * Видаляє кнопку перезавантаження
   */
  function removeReloadButton() {
    $('#RELOAD').remove();
    console.log('❌ Кнопка перезавантаження видалена');
  }
  
  /**
   * Оновлює стан кнопки перезавантаження
   */
  function updateReloadButton() {
    if (getBool('interface_mod_new_reload_button', true)) {
      addReloadButton();
    } else {
      removeReloadButton();
    }
  }

  /* ============================================================
   * ФУНКЦІОНАЛ ЛОГОТИПІВ ЗАМІСТЬ НАЗВ
   * ============================================================ */

  /**
   * Функція для заміни логотипу замість назви в інтерфейсі
   */
  function initLogosInsteadOfTitles() {
    // Перевірка, чи плагін уже ініціалізований
    if (window.logoplugin) return;
    window.logoplugin = true;

    // Підписка на подію активності для обробки повноекранного режиму
    Lampa.Listener.follow('full', function (event) {
      // Перевірка, чи подія є завершенням рендерингу або типом movie та чи увімкнена заміна логотипу
      if ((event.type == 'complite' || event.type == 'movie') && Lampa.Storage.get('logo_main') != '1') {
        var item = event.data.movie;
        var mediaType = item.name ? 'tv' : 'movie';
        var currentLang = Lampa.Storage.get('language');
        // Формування URL для запиту логотипу з TMDB (поточна мова)
        var url = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);

        // Виконання AJAX-запиту для отримання логотипів
        $.get(url, function (response) {
          if (response.logos && response.logos[0]) {
            // Логотип знайдено для поточної мови (uk/ru)
            renderLogo(response.logos[0].file_path, event, mediaType, currentLang);
          } else if (currentLang !== 'en') {
            // Якщо логотип відсутній і мова не англійська, спробувати англійську
            var enUrl = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
            $.get(enUrl, function (enResponse) {
              if (enResponse.logos && enResponse.logos[0]) {
                // Використати англійський логотип
                renderLogo(enResponse.logos[0].file_path, event, mediaType, currentLang, true);
              }
            }).fail(function () {});
          }
        }).fail(function () {
          if (currentLang !== 'en') {
            // Спробувати англійську мову при помилці
            var enUrl = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
            $.get(enUrl, function (enResponse) {
              if (enResponse.logos && enResponse.logos[0]) {
                renderLogo(enResponse.logos[0].file_path, event, mediaType, currentLang, true);
              }
            }).fail(function () {});
          }
        });

        // Функція для рендерингу логотипу
        function renderLogo(logoPath, event, mediaType, currentLang, isEnglishLogo) {
          if (logoPath !== '') {
            var card = event.object.activity.render();
            var logoHtml;
            var displayMode = Lampa.Storage.get('logo_display_mode', 'logo_only');
            
            // Отримуємо оригінальний текст заголовка
            var titleElement = card.find('.full-start-new__title, .full-start__title');
            var originalTitleText = titleElement.find('> span').text() || item.title || item.name || '';
            
            // Видаляємо всі попередні логотипи
            titleElement.find('.logo-container').remove();
            
            // Створюємо контейнер для логотипа
            var logoContainer = $('<div class="logo-container"></div>');
            
            // Додаємо зображення логотипу
            var imgUrl = Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png'));
            var logoImg = $('<img>').attr('src', imgUrl)
                .css({
                    'display': 'block',
                    'margin-bottom': '0.2em',
                    'max-height': displayMode === 'logo_only' ? '2.8em' : '1.8em'
                });
            
            logoContainer.append(logoImg);
            
            // Якщо режим "логотип і текст", додаємо текст після логотипу
            if (displayMode === 'logo_and_text' && originalTitleText) {
                logoContainer.append($('<span>').text(originalTitleText));
            }
            
            // Замінюємо вміст заголовка
            titleElement.html(logoContainer);
            
            // Додаємо клас режиму до заголовка
            titleElement.addClass(displayMode === 'logo_only' ? 'logo-only-mode' : 'logo-text-mode');
            
            // Видаляємо зайві елементи
            card.find('.full-start-new__tagline, .full-start__title-original').remove();
            
            // Налаштовуємо стилі для старого інтерфейсу
            if (Lampa.Storage.get('card_interfice_type') === 'old' && !card.find('div[data-name="card_interfice_cover"]').length) {
                titleElement.css({
                    'height': 'auto !important',
                    'max-height': 'none !important',
                    'overflow': 'visible !important'
                });
                logoImg.css('margin-bottom', '0em');
            }
          }
        }
      }
    });
  }

  /**
   * Застосовує режим відображення логотипів до поточних елементів
   */
  function applyLogoDisplayMode() {
    var displayMode = Lampa.Storage.get('logo_display_mode', 'logo_only');
    var isLogoEnabled = Lampa.Storage.get('logo_main') !== '1';
    
    if (!isLogoEnabled) return;
    
    // Знаходимо всі контейнери з логотипами
    var logoContainers = document.querySelectorAll('.full-start-new__title, .full-start__title');
    
    logoContainers.forEach(function(container) {
      // Видаляємо попередні класи режимів
      container.classList.remove('logo-only-mode', 'logo-text-mode');
      
      // Додаємо новий клас режиму
      container.classList.add(displayMode === 'logo_only' ? 'logo-only-mode' : 'logo-text-mode');
      
      // Знаходимо текст всередині контейнера
      var span = container.querySelector('> span');
      if (span) {
        span.style.display = displayMode === 'logo_only' ? 'none' : 'block';
      }
      
      // Знаходимо текст у лого-контейнері
      var logoContainer = container.querySelector('.logo-container');
      if (logoContainer) {
        var logoSpan = logoContainer.querySelector('span');
        if (logoSpan) {
          logoSpan.style.display = displayMode === 'logo_only' ? 'none' : 'block';
        }
      }
    });
  }

  /* ============================================================
   * ТЕМИ (інтегровані з themes_ua_loader.js)
   * ============================================================ */
  
  // GIF loader для всіх тем
  var gifLoaderUrl = "https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/logo.gif";
  
  // Функція для застосування теми
  function applyTheme(theme) {
    console.log('Застосовується тема:', theme);
    
    // Видаляємо попередні стилі теми
    $('#maxsm_themes_theme').remove();
    
    if (theme === 'default') {
      // Видаляємо всі додаткові налаштування для стандартної теми
      removeAdditionalSettings();
      return;
    }
    
    var loaderStyles = `
.screensaver__preload {
    background: url("${gifLoaderUrl}") no-repeat 50% 50% !important;
    background-size: 120px 120px !important;
    pointer-events: none !important;
}
.activity__loader {
    background: url("${gifLoaderUrl}") no-repeat 50% 50% !important;
    background-size: 80px 80px !important;
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    display:none !important;
    pointer-events: none !important;
}
.activity--load .activity__loader,
.activity--preload .activity__loader {
    display:block !important;
}
`;

    var style = $('<style id="maxsm_themes_theme"></style>');

    var themes = {
      mint_dark: loaderStyles + `
.navigation-bar__body
{background: rgba(18, 32, 36, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #1e6262dd, #3da18ddd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #0a1b2a, #1a4036);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #1e2c2f;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #1e6262, #3da18d);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #1e6262, #3da18d);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #3da18d;
box-shadow: 0 0 0.8em rgba(61, 161, 141, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #3da18d, #1e6262);
}
.modal__content {
background: rgba(18, 32, 36, 0.96);
border: 0em solid rgba(18, 32, 36, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(18, 32, 36, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #1a3b36cc;
border: 0.2em solid #3da18d;
}
`,
      crystal_cyan: loaderStyles + `
.navigation-bar__body
{background: rgba(10, 25, 40, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #00d2ffdd, #3a8ee6dd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #081822, #104059);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #112b3a;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #00d2ff, #3a8ee6);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #00d2ff, #3a8ee6);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #00d2ff;
box-shadow: 0 0 0.8em rgba(72, 216, 255, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #00d2ff, #3a8ee6);
}
.modal__content {
background: rgba(10, 25, 40, 0.96);
border: 0em solid rgba(10, 25, 40, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(10, 25, 40, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #0c2e45cc;
border: 0.2em solid #00d2ff;
}
`,
      deep_aurora: loaderStyles + `
.navigation-bar__body
{background: rgba(18, 34, 59, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #2c6fc1dd, #7e7ed9dd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #1a102b, #0a1c3f);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #171f3a;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #2c6fc1, #7e7ed9);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(124, 194, 255, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #2c6fc1, #7e7ed9);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(124, 194, 255, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #7e7ed9;
box-shadow: 0 0 0.8em rgba(124, 194, 255, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #7e7ed9, #2c6fc1);
}
.modal__content {
background: rgba(18, 34, 59, 0.96);
border: 0em solid rgba(18, 34, 59, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(18, 34, 59, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #1a102bcc;
border: 0.2em solid #7e7ed9;
}
`,
      amber_noir: loaderStyles + `
.navigation-bar__body
{background: rgba(28, 18, 10, 0.96);
}
.card__quality,
 .card__type::after {
background: linear-gradient(to right, #f4a261dd, #e76f51dd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #1f0e04, #3b2a1e);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #2a1c11;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #f4a261, #e76f51);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(255, 160, 90, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #f4a261, #e76f51);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(255, 160, 90, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #f4a261;
box-shadow: 0 0 0.8em rgba(255, 160, 90, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #f4a261, #e76f51);
}
.modal__content {
background: rgba(28, 18, 10, 0.96);
border: 0em solid rgba(28, 18, 10, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(28, 18, 10, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #3b2412cc;
border: 0.2em solid #f4a261;
}
`,
      velvet_sakura: loaderStyles + `
.navigation-bar__body
{background: rgba(56, 32, 45, 0.96);
}
.card__quality,
 .card__type::after  {
background: linear-gradient(to right, #f6a5b0dd, #f9b8d3dd);
}
html, body, .extensions
 {
background: linear-gradient(135deg, #4b0e2b, #7c2a57);
color: #ffffff;
}
.company-start.icon--broken .company-start__icon,
.explorer-card__head-img > img,
.bookmarks-folder__layer,
.card-more__box,
.card__img
,.extensions__block-add
,.extensions__item
 {
background-color: #5c0f3f;
}
.search-source.focus,
.simple-button.focus,
.menu__item.focus,
.menu__item.traverse,
.menu__item.hover,
.full-start__button.focus,
.full-descr__tag.focus,
.player-panel .button.focus,
.full-person.selector.focus,
.tag-count.selector.focus,
.full-review.focus {
background: linear-gradient(to right, #f6a5b0, #f9b8d3);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(246, 165, 176, 0.0);
}
.selectbox-item.focus,
.settings-folder.focus,
.settings-param.focus {
background: linear-gradient(to right, #f6a5b0, #f9b8d3);
color: #fff;
box-shadow: 0 0.0em 0.4em rgba(246, 165, 176, 0.0);
border-radius: 0.5em 0 0 0.5em;
}
.full-episode.focus::after,
.card-episode.focus .full-episode::after,
.items-cards .selector.focus::after,  
.card-more.focus .card-more__box::after,
.card-episode.focus .full-episode::after,
.card-episode.hover .full-episode::after,
.card.focus .card__view::after,
.card.hover .card__view::after,
.torrent-item.focus::after,
.online-prestige.selector.focus::after,
.online-prestige--full.selector.focus::after,
.explorer-card__head-img.selector.focus::after,
.extensions__item.focus::after,
.extensions__block-add.focus::after,
.full-review-add.focus::after {
border: 0.2em solid #f6a5b0;
box-shadow: 0 0 0.8em rgba(246, 165, 176, 0.0);
}
.head__action.focus,
.head__action.hover {
background: linear-gradient(45deg, #f9b8d3, #f6a5b0);
}
.modal__content {
background: rgba(56, 32, 45, 0.96);
border: 0em solid rgba(56, 32, 45, 0.96);
}
.settings__content,
.settings-input__content,
.selectbox__content,
.settings-input {
background: rgba(56, 32, 45, 0.96);
}
.torrent-serial {
background: rgba(0, 0, 0, 0.22);
border: 0.2em solid rgba(0, 0, 0, 0.22);
}
.torrent-serial.focus {
background-color: #7c2a57cc;
border: 0.2em solid #f6a5b0;
}
`
    };

    if (themes[theme]) {
      style.html(themes[theme]);
      $('head').append(style);
    }

    // Застосовуємо інші налаштування
    applyAnimations();
  }

  // Функція для виправлення мови
  function fixLang() {
    Lampa.Lang.add({
      tv_status_returning_series: { uk: "Триває" },
      tv_status_planned: { uk: "Заплановано" },
      tv_status_in_production: { uk: "У виробництві" },
      tv_status_ended: { uk: "Завершено" },
      tv_status_canceled: { uk: "Скасовано" },
      tv_status_pilot: { uk: "Пілот" },
      tv_status_released: { uk: "Випущено" },
      tv_status_rumored: { uk: "За чутками" },
      tv_status_post_production: { uk: "Скоро" }
    });
  }

  // Видаляємо додаткові налаштування для стандартної теми
  function removeAdditionalSettings() {
    Lampa.Settings.listener.follow('open', function(e) {
      if (e.name == 'interface_mod_new') {
        // Видаляємо лише ті налаштування, які ще залишилися
      }
    });
  }

  // Приховуємо зайві налаштування в основному інтерфейсі
  function removeFromSettingsMenu() {
    Lampa.Settings.listener.follow('open', function(e) {
      if (e.name == 'interface') {
        e.body.find('[data-name="light_version"]').remove();
        e.body.find('[data-name="background"]').remove();
        e.body.find('[data-name="background_type"]').remove();
        e.body.find('[data-name="card_interfice_type"]').remove();
        e.body.find('[data-name="glass_style"]').prev('.settings-param-title').remove();
        e.body.find('[data-name="glass_style"]').remove();
        e.body.find('[data-name="glass_opacity"]').remove();
        e.body.find('[data-name="card_interfice_poster"]').prev('.settings-param-title').remove();
        e.body.find('[data-name="card_interfice_poster"]').remove();
        e.body.find('[data-name="card_interfice_cover"]').remove();
        e.body.find('[data-name="advanced_animation"]').remove();
      }
    });
    Lampa.Storage.set('light_version', 'false');
    Lampa.Storage.set('background', 'false');
    Lampa.Storage.set('card_interfice_type', 'new');
    Lampa.Storage.set('glass_style', 'false');
    Lampa.Storage.set('card_interfice_poster', 'false');
    Lampa.Storage.set('card_interfice_cover', 'true');
    Lampa.Storage.set('advanced_animation', 'false');
  }

  // Додаємо загальні стилі для всіх тем
  function applyForAll() {
    Lampa.Template.add('card', "<div class=\"card selector layer--visible layer--render\">\n    <div class=\"card__view\">\n        <img src=\"./img/img_load.svg\" class=\"card__img\" />\n\n        <div class=\"card__icons\">\n            <div class=\"card__icons-inner\">\n                \n            </div>\n        </div>\n    <div class=\"card__age\">{release_year}</div>\n    </div>\n\n    <div class=\"card__title\">{title}</div>\n    </div>");
    Lampa.Template.add('card_episode', "<div class=\"card-episode selector layer--visible layer--render\">\n    <div class=\"card-episode__body\">\n        <div class=\"full-episode\">\n            <div class=\"full-episode__img\">\n                <img />\n            </div>\n\n            <div class=\"full-episode__body\">\n     <div class=\"card__title\">{title}</div>\n            <div class=\"card__age\">{release_year}</div>\n            <div class=\"full-episode__num hide\">{num}</div>\n                <div class=\"full-episode__name\">{name}</div>\n                <div class=\"full-episode__date\">{date}</div>\n            </div>\n        </div>\n    </div>\n    <div class=\"card-episode__footer hide\">\n        <div class=\"card__imgbox\">\n            <div class=\"card__view\">\n                <img class=\"card__img\" />\n            </div>\n        </div>\n\n        <div class=\"card__left\">\n            <div class=\"card__title\">{title}</div>\n            <div class=\"card__age\">{release_year}</div>\n        </div>\n    </div>\n</div>");

    var forall_style = "\n<style id=\"interface_mod_forall\">\n " +
      "@media screen and (max-width: 480px) { .full-start-new__head, .full-start-new__title, .full-start__title-original, .full-start__rate, .full-start-new__reactions, .full-start-new__rate-line, .full-start-new__buttons, .full-start-new__details, .full-start-new__tagline { -webkit-justify-content: center; justify-content: center; text-align: center; }\n" +
      ".full-start__title-original {\n   max-width: 100%;\n}\n}" +
      "@media screen and (max-width: 480px) { .full-start-new__right { background: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), to(rgba(0, 0, 0, 0))); background: -webkit-linear-gradient(top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); background: -o-linear-gradient(top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%); background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 100%);}}" +
      ".selectbox-item__checkbox\n {\nborder-radius: 100%\n}\n" +
      ".selectbox-item--checked .selectbox-item__checkbox\n {\nbackground: #ccc;\n}\n" +
      ".full-start-new__rate-line .full-start__pg {\n    font-size: 1em;\nbackground: #fff;\n    color: #000;\n}\n." +
      ".full-start__rate \n{\n     border-radius: 0.25em;\n padding: 0.3em;\n background-color: rgba(0, 0, 0, 0.3);\n}\n" +
      ".card__title {\n                    height: 3.6em;\n                    text-overflow: ellipsis;\n                     -o-text-overflow: ellipsis;\n                    text-overflow: ellipsis;\n                    -webkit-line-clamp: 3;\n                    line-clamp: 3;\n                }\n " +
      ".card__age {\n  position: absolute;\n  right: 0em;\n  bottom: 0em;\n  z-index: 10;\n  background: rgba(0, 0, 0, 0.6);\n  color: #ffffff;\n  font-weight: 700;\n  padding: 0.4em 0.6em;\n    -webkit-border-radius: 0.48em 0 0.48em 0;\n     -moz-border-radius: 0.48em 0 0.48em 0;\n          border-radius: 0.48em 0 0.48em 0;\nline-height: 1.0;\nfont-size: 1.0em;\n}\n " +
      ".card__vote {\n  position: absolute;\n  bottom: auto; \n right: 0em;\n  top: 0em;\n  background: rgba(0, 0, 0, 0.6);\n    font-weight: 700;\n  color: #fff;\n -webkit-border-radius: 0 0.34em 0 0.34em;\n     -moz-border-radius: 0 0.34em 0 0.34em;\n          border-radius: 0 0.34em 0 0.34em;\nline-height: 1.0;\nfont-size: 1.4em;\n}\n  " +
      ".card__icons {\n  position: absolute;\n  top: 2em;\n  left: 0;\n  right: auto;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n     -moz-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n background: rgba(0, 0, 0, 0.6);\n  color: #fff;\n    -webkit-border-radius: 0 0.5em 0.5em 0;\n     -moz-border-radius: 0 0.5em 0.5em 0;\n          border-radius: 0 0.5em 0.5em 0;\n}\n" +
      ".card__icons-inner {\n  background: rgba(0, 0, 0, 0); \n}\n" +
      ".card__marker {\n position: absolute;\n  left: 0em;\n  top: 4em;\n  bottom: auto; \n  background: rgba(0, 0, 0, 0.6);\n  -webkit-border-radius: 0 0.5em 0.5em 0;\n     -moz-border-radius: 0 0.5em 0.5em 0;\n          border-radius: 0 0.5em 0.5em 0;\n  font-weight: 700;\n font-size: 1.0em;\n   padding: 0.4em 0.6em;\n    display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n     -moz-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  line-height: 1.2;\nmax-width: min(12em, 95%);\nbox-sizing: border-box;\n}\n" +
      ".card__marker > span {\n max-width: min(12em, 95%);\n}\n" +
      ".items-line.items-line--type-cards + .items-line.items-line--type-cards  {\nmargin-top: 1em;\n}\n" +
      ".card--small .card__view {\nmargin-bottom: 2em;\n}\n" +
      ".items-line--type-cards {\n min-height: 18em;\n}\n" +
      "@media screen and (min-width: 580px) {\n.full-start-new {\nmin-height: 80vh;\ndisplay: flex\n}\n}\n" +
      ".full-start__background.loaded {\nopacity: 0.8;\n}\n.full-start__background.dim {\nopacity: 0.2;\n}\n" +
      ".explorer__files .torrent-filter .simple-button {\nfont-size: 1.2em;\n-webkit-border-radius: 0.5em;\n-moz-border-radius: 0.5em;\nborder-radius: 0.5em;\n}\n" +
      ".full-review-add,\n.full-review,\n.extensions__item,\n.extensions__block-add,\n.search-source,\n.bookmarks-folder__layer,\n.bookmarks-folder__body,\n.card__img,\n.card__promo,\n.full-episode--next .full-episode__img:after,\n.full-episode__img img,\n.full-episode__body,\n.full-person__photo,\n.card-more__box,\n.full-start__button,\n.simple-button,\n.register {\nborder-radius: 0.5em;\n}\n" +
      ".extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-episode.focus::after,\n.full-review-add.focus::after,\n.card-parser.focus::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.card-more.focus .card-more__box::after,\n.register.focus::after {\nborder-radius: 1em;\n}\n" +
      ".search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus {\nborder-radius: 0.5em;\n}\n" +
      ".menu__item.focus {border-radius: 0 0.5em 0.5em 0;\n}\n" +
      ".menu__list {\npadding-left: 0em;\n}\n" +
      ".menu__item.focus .menu__ico {\n   -webkit-filter: invert(1);\n    filter: invert(1);\n }\n " +
      "</style>\n";
    Lampa.Template.add('forall_style_css', forall_style);
    $('body').append(Lampa.Template.get('forall_style_css', {}, true));
  }

  // Застосовуємо анімації
  function applyAnimations() {
    var animations = settings.animations;
    $('#interface_mod_animations').remove();
    if (animations) {
      var animations_style = "\n<style id=\"interface_mod_animations\">\n " +
        ".card\n{transform: scale(1);\ntransition: transform 0.3s ease;\n}\n" +
        ".card.focus\n{transform: scale(1.03);\n}\n" +
        ".torrent-item,\n.online-prestige\n{transform: scale(1);\ntransition: transform 0.3s ease;\n}\n" +
        ".torrent-item.focus,\n.online-prestige.focus\n{transform: scale(1.01);\n}\n" +
        ".extensions__item,\n.extensions__block-add,\n.full-review-add,\n.full-review,\n.tag-count,\n.full-person,\n.full-episode,\n.simple-button,\n.full-start__button,\n.items-cards .selector,\n.card-more,\n.explorer-card__head-img.selector,\n.card-episode\n{transform: scale(1);\ntransition: transform 0.3s ease;\n}\n" +
        ".extensions__item.focus,\n.extensions__block-add.focus,\n.full-review-add.focus,\n.full-review.focus,\n.tag-count.focus,\n.full-person.focus,\n.full-episode.focus,\n.simple-button.focus,\n.full-start__button.focus,\n.items-cards .selector.focus,\n.card-more.focus,\n.explorer-card__head-img.selector.focus,\n.card-episode.focus\n{transform: scale(1.03);\n}\n" +
        ".menu__item {\n  transition: transform 0.3s ease;\n}\n" +
        ".menu__item.focus {\n transform: translateX(-0.2em);\n}\n" +
        ".selectbox-item,\n.settings-folder,\n.settings-param {\n transition: transform 0.3s ease;\n}\n" +
        ".selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\n transform: translateX(0.2em);\n}\n" +
      "</style>\n";
      $('body').append(animations_style);
    }
  }

  /* ============================================================
   * СЕЛЕКТОРИ ДЛЯ СТАТУСІВ ТА PG
   * ============================================================ */
  var STATUS_BASE_SEL = '.full-start__status, .full-start-new__status, .full-start__soon, .full-start-new__soon, .full-start [data-status], .full-start-new [data-status]';
  var AGE_BASE_SEL = '.full-start__pg, .full-start-new__pg, .full-start [data-pg], .full-start-new [data-pg], .full-start [data-age], .full-start-new [data-age]';

  /* ============================================================
   * НАЛАШТУВАННЯ UI
   * ============================================================ */

  /**
   * Ініціалізує компонент налаштувань "Інтерфейс +"
   */
  function initInterfaceModSettingsUI() {
    if (window.__ifx_settings_ready) return;
    window.__ifx_settings_ready = true;

    Lampa.SettingsApi.addComponent({
      component: 'interface_mod_new',
      name: Lampa.Lang.translate('interface_mod_new_group_title'),
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 5c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm0 6c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Zm0 6c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z"/></svg>'
    });

    var add = Lampa.SettingsApi.addParam;

    // Кнопка перезавантаження - додаємо першою
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_reload_button',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_reload_button'),
        description: Lampa.Lang.translate('interface_mod_new_reload_button_desc')
      }
    });

    // Інфо-панель
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_info_panel',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_info_panel'),
        description: Lampa.Lang.translate('interface_mod_new_info_panel_desc')
      }
    });

    // Кольоровий рейтинг
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_ratings',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_ratings'),
        description: Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')
      }
    });

    // Кольорові статуси
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_status',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_status'),
        description: Lampa.Lang.translate('interface_mod_new_colored_status_desc')
      }
    });

    // Кольоровий віковий рейтинг
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_age',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_age'),
        description: Lampa.Lang.translate('interface_mod_new_colored_age_desc')
      }
    });

    // Логотипи замість назв
    add({
      component: 'interface_mod_new',
      param: {
        name: 'logo_main',
        type: 'select',
        values: {
          '0': Lampa.Lang.translate('logo_main_show'),
          '1': Lampa.Lang.translate('logo_main_hide')
        },
        default: '0'
      },
      field: {
        name: Lampa.Lang.translate('logo_main_title'),
        description: Lampa.Lang.translate('logo_main_description')
      }
    });

    // Режим відображення логотипів (залежить від logo_main)
    add({
      component: 'interface_mod_new',
      param: {
        name: 'logo_display_mode',
        type: 'select',
        values: {
          'logo_only': Lampa.Lang.translate('logo_display_mode_logo_only'),
          'logo_and_text': Lampa.Lang.translate('logo_display_mode_logo_and_text')
        },
        default: 'logo_only'
      },
      field: {
        name: Lampa.Lang.translate('logo_display_mode_title'),
        description: Lampa.Lang.translate('logo_main_description'),
        show: function () {
          return Lampa.Storage.get('logo_main') === '0';
        }
      }
    });

    // Теми
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_theme',
        type: 'select',
        values: {
          'mint_dark': Lampa.Lang.translate('interface_mod_new_theme_mint_dark'),
          'deep_aurora': Lampa.Lang.translate('interface_mod_new_theme_deep_aurora'),
          'crystal_cyan': Lampa.Lang.translate('interface_mod_new_theme_crystal_cyan'),
          'amber_noir': Lampa.Lang.translate('interface_mod_new_theme_amber_noir'),
          'velvet_sakura': Lampa.Lang.translate('interface_mod_new_theme_velvet_sakura'),
          'default': Lampa.Lang.translate('interface_mod_new_theme_default')
        },
        default: 'mint_dark'
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_themes'),
        description: Lampa.Lang.translate('interface_mod_new_themes_desc')
      }
    });

    // Анімації
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_animations',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_animations'),
        description: Lampa.Lang.translate('interface_mod_new_animations_desc')
      }
    });

    // Оригінальна назва
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_en_data',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_en_data'),
        description: Lampa.Lang.translate('interface_mod_new_en_data_desc')
      }
    });

    // Всі кнопки
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_all_buttons',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_all_buttons'),
        description: Lampa.Lang.translate('interface_mod_new_all_buttons_desc')
      }
    });

    // Іконки без тексту
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_icon_only',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_icon_only'),
        description: Lampa.Lang.translate('interface_mod_new_icon_only_desc')
      }
    });

    // Кольорові кнопки
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_buttons',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_buttons'),
        description: Lampa.Lang.translate('interface_mod_new_colored_buttons_desc')
      }
    });

    // Розмір кнопок (збільшені значення)
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_button_size',
        type: 'select',
        values: {
          'small': Lampa.Lang.translate('interface_mod_new_button_size_small'),
          'normal': Lampa.Lang.translate('interface_mod_new_button_size_normal'),
          'large': Lampa.Lang.translate('interface_mod_new_button_size_large')
        },
        default: 'normal'
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_button_size'),
        description: Lampa.Lang.translate('interface_mod_new_button_size_desc')
      }
    });

    // Торенти: кольорова рамка
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_tor_frame',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('torr_mod_frame'),
        description: Lampa.Lang.translate('torr_mod_frame_desc')
      }
    });

    // Торенти: кольоровий бітрейт
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_tor_bitrate',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('torr_mod_bitrate'),
        description: Lampa.Lang.translate('torr_mod_bitrate_desc')
      }
    });

    // Торенти: кольорова кількість сідерів
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_tor_seeds',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('torr_mod_seeds'),
        description: Lampa.Lang.translate('torr_mod_seeds_desc')
      }
    });

    // Рейтинги: заголовок групи
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_group',
        type: 'title'
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_group'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_desc')
      }
    });

    // Рейтинги: нагороди
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_show_awards',
        type: 'trigger',
        values: '',
        "default": RCFG_DEFAULT.ratings_show_awards
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_show_awards'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_show_awards_desc')
      },
      onRender: function(item) {}
    });

    // Рейтинги: середній рейтинг
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_show_average',
        type: 'trigger',
        values: '',
        "default": RCFG_DEFAULT.ratings_show_average
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_show_average'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_show_average_desc')
      },
      onRender: function(item) {}
    });

    // Рейтинги: кольорові рейтинги
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_colorize_all',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_colorize_all
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_colorize_all'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_colorize_all_desc')
      },
      onRender: function() {}
    });
    
    // Рейтинги: IMDb
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_enable_imdb',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_imdb
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_enable_imdb'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_enable_imdb_desc')
      }
    });
    
    // Рейтинги: TMDB
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_enable_tmdb',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_tmdb
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_enable_tmdb'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_enable_tmdb_desc')
      }
    });
    
    // Рейтинги: Metacritic
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_enable_mc',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_mc
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_enable_mc'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_enable_mc_desc')
      }
    });
    
    // Рейтинги: Rotten Tomatoes
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_enable_rt',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_rt
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_enable_rt'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_enable_rt_desc')
      }
    });
    
    // Рейтинги: Popcornmeter
    add({
      component: 'interface_mod_new',
      param: {
        name: 'ratings_enable_popcorn',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_popcorn
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_enable_popcorn'),
        description: Lampa.Lang.translate('interface_mod_new_ratings_enable_popcorn_desc')
      }
    });

    // Рейтинги: кнопка очищення кешу
    add({
      component: 'interface_mod_new',
      param: {
        type: 'button',
        component: 'ratings_clear_cache'
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_ratings_clear_cache')
      },
      onChange: function() {
        lmpRatingsClearCache();
      }
    });

    /**
     * Переміщує групу "Інтерфейс +" відразу після групи "Інтерфейс"
     */
    function moveAfterInterface() {
      var $folders = $('.settings-folder');
      var $interface = $folders.filter(function () {
        return $(this).data('component') === 'interface';
      });
      var $mod = $folders.filter(function () {
        return $(this).data('component') === 'interface_mod_new';
      });
      if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
    }

    var tries = 0,
      t = setInterval(function () {
        moveAfterInterface();
        if (++tries >= 40) clearInterval(t);
      }, 150);

    var obsMenu = new MutationObserver(function () {
      moveAfterInterface();
    });
    obsMenu.observe(document.body, {
      childList: true,
      subtree: true
    });

    /**
     * Закриває випадаючі списки і оновлює налаштування
     */
    function closeOpenSelects() {
      setTimeout(function () {
        $('.selectbox').remove();
        Lampa.Settings.update();
      }, 60);
    }

    // Патч Lampa.Storage.set для реактивності
    if (!window.__ifx_patch_storage) {
      window.__ifx_patch_storage = true;
      var _set = Lampa.Storage.set;

      Lampa.Storage.set = function (key, val) {
        var res = _set.apply(this, arguments);

        // Реагуємо тільки на зміни *наших* налаштувань
        if (typeof key === 'string' && key.indexOf('interface_mod_new_') === 0) {
          
          switch (key) {
            case 'interface_mod_new_reload_button':
              settings.reload_button = getBool(key, true);
              updateReloadButton();
              break;
              
            case 'interface_mod_new_info_panel':
              settings.info_panel = getBool(key, true);
              rebuildInfoPanelActive();
              break;
              
            case 'interface_mod_new_colored_ratings':
              settings.colored_ratings = getBool(key, false);
              if (settings.colored_ratings) updateVoteColors();
              else clearVoteColors();
              break;
              
            case 'interface_mod_new_colored_status':
              settings.colored_status = getBool(key, false);
              setStatusBaseCssEnabled(settings.colored_status);
              if (settings.colored_status) enableStatusColoring();
              else disableStatusColoring(true);
              break;
              
            case 'interface_mod_new_colored_age':
              settings.colored_age = getBool(key, false);
              setAgeBaseCssEnabled(settings.colored_age);
              if (settings.colored_age) enableAgeColoring();
              else disableAgeColoring(true);
              break;
              
            case 'interface_mod_new_theme':
              settings.theme = val || 'mint_dark';
              applyTheme(settings.theme);
              break;
              
            case 'interface_mod_new_animations':
              settings.animations = getBool(key, true);
              applyAnimations();
              break;
              
            case 'interface_mod_new_en_data':
            case 'interface_mod_new_english_data':
              settings.en_data = getOriginalTitleEnabled();
              applyOriginalTitleToggle();
              break;
              
            case 'interface_mod_new_all_buttons':
              settings.all_buttons = getBool(key, false);
              rebuildButtonsNow();
              break;
              
            case 'interface_mod_new_icon_only':
              settings.icon_only = getBool(key, false);
              rebuildButtonsNow();
              break;
              
            case 'interface_mod_new_colored_buttons':
              settings.colored_buttons = getBool(key, false);
              if (settings.colored_buttons) {
                initializeColoredButtons();
              } else {
                disableColoredButtons();
              }
              break;
              
            case 'interface_mod_new_button_size':
              settings.button_size = (val || 'normal');
              applyButtonSize();
              updateAllButtonIconsSize();
              break;
              
            case 'interface_mod_new_tor_frame':
              settings.tor_frame = getBool(key, true);
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
              break;
              
            case 'interface_mod_new_tor_bitrate':
              settings.tor_bitrate = getBool(key, true);
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
              break;
              
            case 'interface_mod_new_tor_seeds':
              settings.tor_seeds = getBool(key, true);
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
              break;
          }
        }
        
        // Реагуємо на зміни налаштувань логотипів
        if (typeof key === 'string' && (key === 'logo_main' || key === 'logo_display_mode')) {
          settings.logo_main = Lampa.Storage.get('logo_main', '0');
          settings.logo_display_mode = Lampa.Storage.get('logo_display_mode', 'logo_only');
          // Логотипи будуть автоматично оновлені при наступному відкритті картки
          // Застосовуємо режим відображення до поточних елементів
          applyLogoDisplayMode();
        }
        
        // Реагуємо на зміни налаштувань рейтингів
        if (typeof key === 'string' && key.indexOf('ratings_') === 0) {
          switch (key) {
            case 'ratings_show_awards':
              settings.ratings_show_awards = getBool(key, RCFG_DEFAULT.ratings_show_awards);
              toggleAwards(settings.ratings_show_awards);
              break;
            case 'ratings_show_average':
              settings.ratings_show_average = getBool(key, RCFG_DEFAULT.ratings_show_average);
              toggleAverage(settings.ratings_show_average);
              break;
            case 'ratings_colorize_all':
              settings.ratings_colorize_all = getBool(key, RCFG_DEFAULT.ratings_colorize_all);
              applyRatingsStyles();
              break;
            case 'ratings_enable_imdb':
              settings.ratings_enable_imdb = getBool(key, RCFG_DEFAULT.ratings_enable_imdb);
              updateRatingsDisplay();
              break;
            case 'ratings_enable_tmdb':
              settings.ratings_enable_tmdb = getBool(key, RCFG_DEFAULT.ratings_enable_tmdb);
              updateRatingsDisplay();
              break;
            case 'ratings_enable_mc':
              settings.ratings_enable_mc = getBool(key, RCFG_DEFAULT.ratings_enable_mc);
              updateRatingsDisplay();
              break;
            case 'ratings_enable_rt':
              settings.ratings_enable_rt = getBool(key, RCFG_DEFAULT.ratings_enable_rt);
              updateRatingsDisplay();
              break;
            case 'ratings_enable_popcorn':
              settings.ratings_enable_popcorn = getBool(key, RCFG_DEFAULT.ratings_enable_popcorn);
              updateRatingsDisplay();
              break;
          }
        }
        return res;
      };
    }
  }

  /* ============================================================
   * РОЗМІР КНОПОК ТА ІКОНОК (ОНОВЛЕНІ РОЗМІРИ)
   * ============================================================ */
  
  // Функція для отримання розмірів іконок відповідно до розміру кнопок (оновлені значення)
  function getIconSizeForButtonSize() {
    switch (settings.button_size) {
      case 'small':
        return { 
          width: '30',      // Збільшено до 30px (замість 24)
          height: '30',     // Збільшено до 30px (замість 24)
          svgWidth: '1.8em', // Збільшено з 1.6em
          svgHeight: '1.8em' // Збільшено з 1.6em
        };
      case 'large':
        return { 
          width: '38',      // Збільшено до 38px (замість 34)
          height: '38',     // Збільшено до 38px (замість 34)
          svgWidth: '2.6em', // Збільшено з 2.4em
          svgHeight: '2.6em' // Збільшено з 2.4em
        };
      default: // normal
        return { 
          width: '34',      // Збільшено до 34px (замість 32)
          height: '34',     // Збільшено до 34px (замість 32)
          svgWidth: '2.2em', // Збільшено з 2.0em
          svgHeight: '2.2em' // Збільшено з 2.0em
        };
    }
  }
  
  function applyButtonSize() {
    var styleId = 'interface_mod_button_size';
    var oldStyle = document.getElementById(styleId);
    if (oldStyle) oldStyle.remove();
    
    var iconSize = getIconSizeForButtonSize();
    
    var css = '';
    switch (settings.button_size) {
      case 'small':
        css = `
          .full-start__button, .full-start-new__button {
            min-height: 3.3em !important;
            padding: 0.5em 1.2em !important;
            font-size: 1.0em !important;
          }
          .full-start__button svg, .full-start-new__button svg {
            width: ${iconSize.svgWidth} !important;
            height: ${iconSize.svgHeight} !important;
            min-width: ${iconSize.svgWidth} !important;
            min-height: ${iconSize.svgHeight} !important;
            max-width: ${iconSize.svgWidth} !important;
            max-height: ${iconSize.svgHeight} !important;
          }
        `;
        break;
      case 'large':
        css = `
          .full-start__button, .full-start-new__button {
            min-height: 4.0em !important;
            padding: 0.7em 1.6em !important;
            font-size: 1.3em !important;
          }
          .full-start__button svg, .full-start-new__button svg {
            width: ${iconSize.svgWidth} !important;
            height: ${iconSize.svgHeight} !important;
            min-width: ${iconSize.svgWidth} !important;
            min-height: ${iconSize.svgHeight} !important;
            max-width: ${iconSize.svgWidth} !important;
            max-height: ${iconSize.svgHeight} !important;
          }
        `;
        break;
      default: // normal
        css = `
          .full-start__button, .full-start-new__button {
            min-height: 3.8em !important;
            padding: 0.6em 1.4em !important;
            font-size: 1.1em !important;
          }
          .full-start__button svg, .full-start-new__button svg {
            width: ${iconSize.svgWidth} !important;
            height: ${iconSize.svgHeight} !important;
            min-width: ${iconSize.svgWidth} !important;
            min-height: ${iconSize.svgHeight} !important;
            max-width: ${iconSize.svgWidth} !important;
            max-height: ${iconSize.svgHeight} !important;
          }
        `;
    }
    
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
    
    // Оновлюємо розміри для кастомних SVG
    updateAllButtonIconsSize();
  }
  
  // Функція для оновлення розмірів всіх іконок кнопок
  function updateAllButtonIconsSize() {
    var iconSize = getIconSizeForButtonSize();
    
    // Оновлюємо розміри для всіх SVG у кнопках
    var allButtonSvgs = document.querySelectorAll('.full-start__button svg, .full-start-new__button svg');
    allButtonSvgs.forEach(function(svg) {
      svg.setAttribute('width', iconSize.width);
      svg.setAttribute('height', iconSize.height);
      svg.style.width = iconSize.svgWidth;
      svg.style.height = iconSize.svgHeight;
    });
    
    // Оновлюємо розміри для всіх кастомних SVG
    var customSvgs = document.querySelectorAll('.custom-svg-replaced, .reyohoho-custom-icon, .online-mod-custom-icon');
    customSvgs.forEach(function(svg) {
      svg.setAttribute('width', iconSize.width);
      svg.setAttribute('height', iconSize.height);
      svg.style.width = iconSize.svgWidth;
      svg.style.height = iconSize.svgHeight;
    });
    
    // Оновлюємо розміри для всіх SVG в кольорових кнопках
    if (settings.colored_buttons) {
      updateColoredButtonsIconSizes();
    }
  }

  function updateColoredButtonsIconSizes() {
    var iconSize = getIconSizeForButtonSize();
    
    // Оновлюємо розміри для всіх кастомних SVG
    var customSvgs = document.querySelectorAll('.custom-svg-replaced, .reyohoho-custom-icon, .online-mod-custom-icon');
    customSvgs.forEach(function(svg) {
      svg.setAttribute('width', iconSize.width);
      svg.setAttribute('height', iconSize.height);
      svg.style.width = iconSize.svgWidth;
      svg.style.height = iconSize.svgHeight;
    });
  }

  /* ============================================================
   * ІНФО-ПАНЕЛЬ (4 ряди + кольорові жанри)
   * ============================================================ */

  /**
   * Створює і наповнює нову інфо-панель
   */
  function buildInfoPanel(details, movie, isTvShow, originalDetails) {
    var container = $('<div>').css({
      display: 'flex',
      'flex-direction': 'column',
      width: '100%',
      gap: '0em',
      margin: '-1.0em 0 0.2em 0.45em'
    });

    var row1 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
    var row2 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
    var row3 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
    var row4 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'flex-start', margin: '0 0 0.2em 0' });

    var colors = {
      seasons: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
      episodes: { bg: 'rgba(46,204,113,0.8)', text: 'white' },
      duration: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
      next: { bg: 'rgba(230,126,34,0.9)', text: 'white' },
      genres: {
        'Бойовик': { bg: 'rgba(231,76,60,.85)', text: 'white' }, 'Пригоди': { bg: 'rgba(39,174,96,.85)', text: 'white' },
        'Мультфільм': { bg: 'rgba(155,89,182,.85)', text: 'white' }, 'Комедія': { bg: 'rgba(241,196,15,.9)', text: 'black' },
        'Кримінал': { bg: 'rgba(88,24,69,.85)', text: 'white' }, 'Документальний': { bg: 'rgba(22,160,133,.85)', text: 'white' },
        'Драма': { bg: 'rgba(102,51,153,.85)', text: 'white' }, 'Сімейний': { bg: 'rgba(139,195,74,.90)', text: 'white' },
        'Фентезі': { bg: 'rgba(22,110,116,.85)', text: 'white' }, 'Історія': { bg: 'rgba(121,85,72,.85)', text: 'white' },
        'Жахи': { bg: 'rgba(155,27,48,.85)', text: 'white' }, 'Музика': { bg: 'rgba(63,81,181,.85)', text: 'white' },
        'Детектив': { bg: 'rgba(52,73,94,.85)', text: 'white' }, 'Мелодрама': { bg: 'rgba(233,30,99,.85)', text: 'white' },
        'Фантастика': { bg: 'rgba(41,128,185,.85)', text: 'white' }, 'Трилер': { bg: 'rgba(165,27,11,.90)', text: 'white' },
        'Військовий': { bg: 'rgba(85,107,47,.85)', text: 'white' }, 'Вестерн': { bg: 'rgba(211,84,0,.85)', text: 'white' },
        'Бойовик і Пригоди': { bg: 'rgba(231,76,60,.85)', text: 'white' }, 'Дитячий': { bg: 'rgba(0,188,212,.85)', text: 'white' },
        'Новини': { bg: 'rgba(70,130,180,.85)', text: 'white' }, 'Реаліті-шоу': { bg: 'rgba(230,126,34,.9)', text: 'white' },
        'НФ і Фентезі': { bg: 'rgba(41,128,185,.85)', text: 'white' }, 'Мильна опера': { bg: 'rgba(233,30,99,.85)', text: 'white' },
        'Ток-шоу': { bg: 'rgba(241,196,15,.9)', text: 'black' }, 'Війна і Політика': { bg: 'rgba(96,125,139,.85)', text: 'white' },
        'Екшн і Пригоди': { bg: 'rgba(231,76,60,.85)', text: 'white' },
        'Екшн': { bg: 'rgba(231,76,60,.85)', text: 'white' },
        'Науково фантастичний': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Науково-фантастичний': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Наукова фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Наукова-фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Науково-фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' }
      }
    };

    var baseBadge = {
      'border-radius': '0.3em',
      border: '0',
      'font-size': '1.0em',
      padding: '0.2em 0.6em',
      display: 'inline-block',
      'white-space': 'nowrap',
      'line-height': '1.2em',
      'margin-right': '0.4em',
      'margin-bottom': '0.2em'
    };

    // 1 — Серії (для серіалів)
    if (isTvShow && Array.isArray(movie.seasons)) {
      var totalEps = 0,
        airedEps = 0,
        now = new Date(),
        hasEpisodes = false;
      movie.seasons.forEach(function (s) {
        if (s.season_number === 0) return;
        if (s.episode_count) totalEps += s.episode_count;
        if (Array.isArray(s.episodes) && s.episodes.length) {
          hasEpisodes = true;
          s.episodes.forEach(function (e) {
            if (e.air_date && new Date(e.air_date) <= now) airedEps++;
          });
        } else if (s.air_date && new Date(s.air_date) <= now && s.episode_count) {
          airedEps += s.episode_count;
        }
      });

      if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
        var nextS = movie.next_episode_to_air.season_number,
          nextE = movie.next_episode_to_air.episode_number,
          rem = 0;
        movie.seasons.forEach(function (s) {
          if (s.season_number === nextS) rem += (s.episode_count || 0) - nextE + 1;
          else if (s.season_number > nextS) rem += s.episode_count || 0;
        });
        if (rem > 0 && totalEps > 0) airedEps = Math.max(0, totalEps - rem);
      }

      var epsText = '';
      if (totalEps > 0 && airedEps > 0 && airedEps < totalEps) epsText = airedEps + ' ' + plural(airedEps, 'Серія', 'Серії', 'Серій') + ' з ' + totalEps;
      else if (totalEps > 0) epsText = totalEps + ' ' + plural(totalEps, 'Серія', 'Серії', 'Серій');

      if (epsText) row1.append($('<span>').text(epsText).css($.extend({}, baseBadge, {
        'background-color': colors.episodes.bg,
        color: colors.episodes.text
      })));
    }

    // 2 — Наступна серія
    if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
      var nextDate = new Date(movie.next_episode_to_air.air_date),
        today = new Date();
      nextDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      var diff = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
      var txt = diff === 0 ? 'Наступна серія вже сьогодні' : diff === 1 ? 'Наступна серія вже завтра' : diff > 1 ? ('Наступна серія через ' + diff + ' ' + plural(diff, 'день', 'дні', 'днів')) : '';
      if (txt) row2.append($('<span>').text(txt).css($.extend({}, baseBadge, {
        'background-color': colors.next.bg,
        color: colors.next.text
      })));
    }

    // 3 — Тривалість
    if (!isTvShow && movie.runtime > 0) {
      var mins = movie.runtime,
        h = Math.floor(mins / 60),
        m = mins % 60;
      var t = 'Тривалість фільму: ';
      if (h > 0) t += h + ' ' + plural(h, 'година', 'години', 'годин');
      if (m > 0) t += (h > 0 ? ' ' : '') + m + ' хв.';
      row3.append($('<span>').text(t).css($.extend({}, baseBadge, {
        'background-color': colors.duration.bg,
        color: colors.duration.text
      })));
    } else if (isTvShow) {
      var avg = calculateAverageEpisodeDuration(movie);
      if (avg > 0) row3.append($('<span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg)).css($.extend({}, baseBadge, {
        'background-color': colors.duration.bg,
        color: colors.duration.text
      })));
    }

    // 4 — Сезони + Жанри
    var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function (s) {
      return s.season_number !== 0;
    }).length : 0)) || 0;
    if (isTvShow && seasonsCount > 0) {
      row4.append($('<span>').text('Сезони: ' + seasonsCount).css($.extend({}, baseBadge, {
        'background-color': colors.seasons.bg,
        color: colors.seasons.text
      })));
    }

    var genreList = [];
    if (Array.isArray(movie.genres) && movie.genres.length) {
      genreList = movie.genres.map(function (g) {
        return g.name;
      });
    }
    genreList = genreList.filter(Boolean).filter(function (v, i, a) {
      return a.indexOf(v) === i;
    });

    var baseGenre = {
      'border-radius': '0.3em',
      border: '0',
      'font-size': '1.0em',
      padding: '0.2em 0.6em',
      display: 'inline-block',
      'white-space': 'nowrap',
      'line-height': '1.2em',
      'margin-right': '0.4em',
      'margin-bottom': '0.2em'
    };
    genreList.forEach(function (gn) {
      var c = colors.genres[gn] || {
        bg: 'rgba(255,255,255,.12)',
        text: 'white'
      };
      row4.append($('<span>').text(gn).css($.extend({}, baseGenre, {
        'background-color': c.bg,
        color: c.text
      })));
    });

    container.append(row1);
    if (row2.children().length) container.append(row2);
    if (row3.children().length) container.append(row3);
    if (row4.children().length) container.append(row4);
    details.append(container);
  }

  /**
   * Перебудовує інфо-панель на відкритій картці (або повертає оригінальну)
   */
  function rebuildInfoPanelActive() {
    var enabled = getBool('interface_mod_new_info_panel', true);
    if (!__ifx_last.details || !__ifx_last.details.length) return;

    if (!enabled) {
      __ifx_last.details.html(__ifx_last.originalHTML);
    } else {
      __ifx_last.details.empty();
      buildInfoPanel(__ifx_last.details, __ifx_last.movie, __ifx_last.isTv, __ifx_last.originalHTML);
    }
  }

  /**
   * Встановлює слухача Lampa.Listener 'full' для нової інфо-панелі
   */
  function newInfoPanel() {
    Lampa.Listener.follow('full', function (data) {
      if (data.type !== 'complite') return;

      setTimeout(function () {
        var details = $('.full-start-new__details');
        if (!details.length) details = $('.full-start__details');
        if (!details.length) return;

        var movie = data.data.movie || {};
        var isTvShow = (movie && (
          movie.number_of_seasons > 0 ||
          (movie.seasons && movie.seasons.length > 0) ||
          movie.type === 'tv' || movie.type === 'serial'
        ));

        // Кешуємо дані про відкриту картку
        __ifx_last.details = details;
        __ifx_last.movie = movie;
        __ifx_last.isTv = isTvShow;
        __ifx_last.originalHTML = details.html();
        __ifx_last.fullRoot = $(data.object.activity.render());

        // Якщо налаштування вимкнене, нічого не робимо
        if (!getBool('interface_mod_new_info_panel', true)) return;

        // Будуємо нову панель
        details.empty();
        buildInfoPanel(details, movie, isTvShow, __ifx_last.originalHTML);
      }, 100);
    });
  }

  /* ============================================================
   * КОЛЬОРОВІ РЕЙТИНГИ
   * ============================================================ */

  /**
   * Застосовує кольори до всіх видимих рейтингів
   */
  function updateVoteColors() {
    if (!getBool('interface_mod_new_colored_ratings', false)) return;

    var SEL = [
      '.card__vote',
      '.full-start__rate',
      '.full-start-new__rate',
      '.info__rate',
      '.card__imdb-rate',
      '.card__kinopoisk-rate'
    ].join(',');

    function paint(el) {
      var txt = ($(el).text() || '').trim();
      var m = txt.match(/(\d+(\.\d+)?)/);
      if (!m) return;
      var v = parseFloat(m[0]);
      if (isNaN(v) || v < 0 || v > 10) return;

      var color = (v <= 3) ? 'red' : (v < 6) ? 'orange' : (v < 8) ? 'cornflowerblue' : 'lawngreen';
      $(el).css('color', color);
    }

    $(SEL).each(function () {
      paint(this);
    });
  }

  /**
   * Скидає кольори рейтингів до стандартних
   */
  function clearVoteColors() {
    var SEL = '.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate';
    $(SEL).css({
      color: '',
      border: ''
    });
  }

  /**
   * Встановлює MutationObserver для динамічного оновлення рейтингів
   */
  var __voteObserverDebounce = null;
  function setupVoteColorsObserver() {
    setTimeout(function () {
      if (getBool('interface_mod_new_colored_ratings', false)) updateVoteColors();
    }, 400);

    var obs = new MutationObserver(function () {
      if (getBool('interface_mod_new_colored_ratings', false)) {
        if (__voteObserverDebounce) clearTimeout(__voteObserverDebounce);
        __voteObserverDebounce = setTimeout(updateVoteColors, 200);
      }
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true
    });

    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' && getBool('interface_mod_new_colored_ratings', false)) setTimeout(updateVoteColors, 100);
    });
  }

  /* ============================================================
   * БАЗА СТИЛІВ ДЛЯ СТАТУСІВ/PG
   * ============================================================ */

  /**
   * Вмикає/вимикає базові стилі для плашок СТАТУСУ
   */
  function setStatusBaseCssEnabled(enabled) {
    var idEn = 'interface_mod_status_enabled';
    var idDis = 'interface_mod_status_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    if (enabled) {
      st.id = idEn;
      st.textContent =
        STATUS_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid transparent!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        'display:inline-block!important;' +
        '}';
    } else {
      st.id = idDis;
      st.textContent =
        STATUS_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid #fff!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        'display:inline-block!important;' +
        '}';
    }
    document.head.appendChild(st);
  }

  /**
   * Вмикає/вимикає базові стилі для плашок ВІКОВОГО РЕЙТИНГУ (PG)
   */
  function setAgeBaseCssEnabled(enabled) {
    var idEn = 'interface_mod_age_enabled';
    var idDis = 'interface_mod_age_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    if (enabled) {
      st.id = idEn;
      st.textContent =
        AGE_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid transparent!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        '}';
    } else {
      st.id = idDis;
      st.textContent =
        AGE_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid #fff!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        '}';
    }
    document.head.appendChild(st);
  }

  /* ============================================================
   * КОЛЬОРОВІ СТАТУСИ
   * ============================================================ */
  var __statusObserver = null;
  var __statusFollowReady = false;

  /**
   * Застосовує кольори до плашок статусів
   */
  function applyStatusOnceIn(elRoot) {
    if (!getBool('interface_mod_new_colored_status', false)) return;

    var palette = {
      completed: {
        bg: 'rgba(46,204,113,.85)',
        text: 'white'
      },
      canceled: {
        bg: 'rgba(231,76,60,.9)',
        text: 'white'
      },
      ongoing: {
        bg: 'rgba(243,156,18,.95)',
        text: 'black'
      },
      production: {
        bg: 'rgba(52,152,219,.9)',
        text: 'white'
      },
      planned: {
        bg: 'rgba(155,89,182,.9)',
        text: 'white'
      },
      pilot: {
        bg: 'rgba(230,126,34,.95)',
        text: 'white'
      },
      released: {
        bg: 'rgba(26,188,156,.9)',
        text: 'white'
      },
      rumored: {
        bg: 'rgba(149,165,166,.9)',
        text: 'white'
      },
      post: {
        bg: 'rgba(0,188,212,.9)',
        text: 'white'
      },
      soon: {
        bg: 'rgba(142,68,173,.95)',
        text: 'white'
      }
    };

    var $root = $(elRoot || document);
    $root.find(STATUS_BASE_SEL).each(function () {
      var el = this;
      var t = ($(el).text() || '').trim();
      var key = '';
      if (/заверш/i.test(t) || /ended/i.test(t)) key = 'completed';
      else if (/скасов/i.test(t) || /cancel(l)?ed/i.test(t)) key = 'canceled';
      else if (/онгоїн|виходить|триває/i.test(t) || /returning/i.test(t)) key = 'ongoing';
      else if (/виробництв/i.test(t) || /in\s*production/i.test(t)) key = 'production';
      else if (/заплан/i.test(t) || /planned/i.test(t)) key = 'planned';
      else if (/пілот/i.test(t) || /pilot/i.test(t)) key = 'pilot';
      else if (/випущ/i.test(t) || /released/i.test(t)) key = 'released';
      else if (/чутк/i.test(t) || /rumored/i.test(t)) key = 'rumored';
      else if (/пост/i.test(t) || /post/i.test(t)) key = 'post';
      else if (/незабаром|скоро|soon/i.test(t)) key = 'soon';

      el.classList.remove('ifx-status-fallback');

      if (!key) {
        // Якщо статус не розпізнано, повертаємо білу рамку
        el.classList.add('ifx-status-fallback');
        el.style.setProperty('border-width', '1px', 'important');
        el.style.setProperty('border-style', 'solid', 'important');
        el.style.setProperty('border-color', '#fff', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('color', 'inherit', 'important');
        return;
      }
      var c = palette[key];
      $(el).css({
        'background-color': c.bg,
        color: c.text,
        'border-color': 'transparent',
        'display': 'inline-block'
      });
    });
  }

  function enableStatusColoring() {
    applyStatusOnceIn(document);

    if (__statusObserver) __statusObserver.disconnect();
    __statusObserver = new MutationObserver(function (muts) {
      if (!getBool('interface_mod_new_colored_status', false)) return;
      muts.forEach(function (m) {
        (m.addedNodes || []).forEach(function (n) {
          if (n.nodeType !== 1) return;
          applyStatusOnceIn(n);
        });
      });
    });
    __statusObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    if (!__statusFollowReady) {
      __statusFollowReady = true;
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' && getBool('interface_mod_new_colored_status', false)) {
          setTimeout(function () {
            applyStatusOnceIn(e.object.activity.render());
          }, 120);
        }
      });
    }
  }

  function disableStatusColoring(clearInline) {
    if (__statusObserver) {
      __statusObserver.disconnect();
      __statusObserver = null;
    }
    if (clearInline) $(STATUS_BASE_SEL).each(function () {
      this.classList.remove('ifx-status-fallback');
      this.style.removeProperty('border-width');
      this.style.removeProperty('border-style');
      this.style.removeProperty('border-color');
      this.style.removeProperty('background-color');
      this.style.removeProperty('color');
    }).css({
      'background-color': '',
      color: '',
      border: ''
    });
  }

  /* ============================================================
   * КОЛЬОРОВІ ВІКОВІ РЕЙТИНГИ (PG)
   * ============================================================ */
  var __ageObserver = null;
  var __ageFollowReady = false;

  var __ageGroups = {
    kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
    children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
    teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
    almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
    adult: ['NC-17', '18+', '18', 'X']
  };
  var __ageColors = {
    kids: {
      bg: '#2ecc71',
      text: 'white'
    },
    children: {
      bg: '#3498db',
      text: 'white'
    },
    teens: {
      bg: '#f1c40f',
      text: 'black'
    },
    almostAdult: {
      bg: '#e67e22',
      text: 'white'
    },
    adult: {
      bg: '#e74c3c',
      text: 'white'
    }
  };

  /**
   * Визначає вікову категорію за текстом
   */
  function ageCategoryFor(text) {
    var t = (text || '').trim();

    // 1) Спочатку числовий формат N+
    var mm = t.match(/(^|\D)(\d{1,2})\s*\+(?=\D|$)/);
    if (mm) {
      var n = parseInt(mm[2], 10);
      if (n >= 18) return 'adult';
      if (n >= 17) return 'almostAdult';
      if (n >= 13) return 'teens';
      if (n >= 6)  return 'children';
      return 'kids';
    }

    // 2) Маркери (дорослі → дитячі) з точними межами
    var ORDER = ['adult', 'almostAdult', 'teens', 'children', 'kids'];
    for (var oi = 0; oi < ORDER.length; oi++) {
      var k = ORDER[oi];
      if (__ageGroups[k] && __ageGroups[k].some(function (mark) {
        var mEsc = (mark || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\+/g, '\\+');
        var re = new RegExp('(^|\\D)' + mEsc + '(?=\\D|$)', 'i');
        return re.test(t);
      })) return k;
    }
    return '';
  }
  
  /**
   * Застосовує кольори до вікових рейтингів (PG)
   */
  function applyAgeOnceIn(elRoot) {
    if (!getBool('interface_mod_new_colored_age', false)) return;

    var $root = $(elRoot || document);
    $root.find(AGE_BASE_SEL).each(function () {
      var el = this;

      // беремо текст або значення з атрибутів
      var t = (el.textContent || '').trim();
      if (!t) {
        var attr = ((el.getAttribute('data-age') || el.getAttribute('data-pg') || '') + '').trim();
        if (attr) t = attr;
      }

      // якщо ПУСТО — ховаємо елемент і зчищаємо все
      if (!t) {
        el.classList.add('hide');
        el.classList.remove('ifx-age-fallback');
        ['border-width', 'border-style', 'border-color', 'background-color', 'color', 'display'].forEach(function (p) {
          el.style.removeProperty(p);
        });
        return;
      }

      // є значення — показуємо та фарбуємо
      el.classList.remove('hide');
      el.classList.remove('ifx-age-fallback');
      ['border-width', 'border-style', 'border-color', 'background-color', 'color'].forEach(function (p) {
        el.style.removeProperty(p);
      });

      var g = ageCategoryFor(t);
      if (g) {
        var c = __ageColors[g];
        $(el).css({
          'background-color': c.bg,
          color: c.text,
          'border-color': 'transparent'
        });
        el.style.display = 'inline-block';
      } else {
        // невідома категорія — «fallback», але тільки коли є текст
        el.classList.add('ifx-age-fallback');
        el.style.setProperty('border-width', '1px', 'important');
        el.style.setProperty('border-style', 'solid', 'important');
        el.style.setProperty('border-color', '#fff', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('color', 'inherit', 'important');
        el.style.display = 'inline-block';
      }
    });
  }

  function enableAgeColoring() {
    applyAgeOnceIn(document);

    if (__ageObserver) __ageObserver.disconnect();

    __ageObserver = new MutationObserver(function (muts) {
      if (!getBool('interface_mod_new_colored_age', false)) return;

      muts.forEach(function (m) {
        (m.addedNodes || []).forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches(AGE_BASE_SEL)) applyAgeOnceIn(n);
          $(n).find && $(n).find(AGE_BASE_SEL).each(function () {
            applyAgeOnceIn(this);
          });
        });

        if (m.type === 'attributes' && m.target && m.target.nodeType === 1) {
          var target = m.target;
          if (target.matches && target.matches(AGE_BASE_SEL)) {
            applyAgeOnceIn(target);
          }
        }

        if (m.type === 'characterData' && m.target && m.target.parentNode) {
          var parent = m.target.parentNode;
          if (parent.matches && parent.matches(AGE_BASE_SEL)) {
            applyAgeOnceIn(parent);
          }
        }
      });
    });

    __ageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: ['class', 'data-age', 'data-pg', 'style']
    });

    if (!__ageFollowReady) {
      __ageFollowReady = true;
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' && getBool('interface_mod_new_colored_age', false)) {
          var root = e.object.activity.render();
          setTimeout(function () {
            applyAgeOnceIn(root);
          }, 120);
          [100, 300, 800, 1600].forEach(function (ms) {
            setTimeout(function () {
              applyAgeOnceIn(root);
            }, ms);
          });
        }
      });
    }
  }

  function disableAgeColoring(clearInline) {
    if (__ageObserver) {
      __ageObserver.disconnect();
      __ageObserver = null;
    }
    if (clearInline) $(AGE_BASE_SEL).each(function () {
      this.classList.remove('ifx-age-fallback');
      this.style.removeProperty('border-width');
      this.style.removeProperty('border-style');
      this.style.removeProperty('border-color');
      this.style.removeProperty('background-color');
      this.style.removeProperty('color');
    }).css({
      'background-color': '',
      color: '',
      border: '1px solid #fff',
      'display': 'inline-block'
    });
  }

  /* ============================================================
   * ОРИГІНАЛЬНА НАЗВА (EN)
   * ============================================================ */

  /**
   * Додає оригінальну назву в заголовок картки
   */
  function setOriginalTitle(fullRoot, movie) {
    if (!fullRoot || !movie) return;
    var head = fullRoot.find('.full-start-new__head, .full-start__head').first();
    if (!head.length) return;

    head.find('.ifx-original-title').remove();
    if (!getOriginalTitleEnabled()) return;

    var original = movie.original_title || movie.original_name || movie.original || movie.name || movie.title || '';
    if (!original) return;

    $('<div class="ifx-original-title"></div>').text(original).appendTo(head);
  }

  /**
   * Оновлює показ оригінальної назви (для реактивності)
   */
  function applyOriginalTitleToggle() {
    if (!__ifx_last.fullRoot) return;
    var head = __ifx_last.fullRoot.find('.full-start-new__head, .full-start__head').first();
    if (!head.length) return;
    head.find('.ifx-original-title').remove();
    if (getOriginalTitleEnabled()) setOriginalTitle(__ifx_last.fullRoot, __ifx_last.movie || {});
  }

  /* ============================================================
   * КНОПКИ (Всі / Іконки без тексту)
   * ============================================================ */

  /**
   * Перевіряє, чи є кнопка кнопкою "Play" (щоб уникнути дублювання)
   */
  function isPlayBtn($b) {
    var cls = ($b.attr('class') || '').toLowerCase();
    var act = String($b.data('action') || '').toLowerCase();
    var txt = ($b.text() || '').trim().toLowerCase();
    if (/trailer/.test(cls) || /trailer/.test(act) || /трейлер|trailer/.test(txt)) return false;
    if (/(^|\s)(button--play|view--play|button--player|view--player)(\s|$)/.test(cls)) return true;
    if (/(^|\s)(play|player|resume|continue)(\s|$)/.test(act)) return true;
    if (/^(play|відтворити|продовжити|старт)$/i.test(txt)) return true;
    return false;
  }

  /**
   * Перезбирає кнопки в порядку Онлайн -> Торенти -> Трейлери
   */
  function reorderAndShowButtons(fullRoot) {
    if (!fullRoot) return;

    var $container = fullRoot.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!$container.length) return;

    // Прибрати можливі дублі "play"
    fullRoot.find('.button--play, .button--player, .view--play, .view--player').remove();

    // Зібрати всі кнопки
    var $source = fullRoot.find(
      '.buttons--container .full-start__button, ' +
      '.full-start__buttons .full-start__button, ' +
      '.full-start-new__buttons .full-start__button'
    );

    var seen = new Set();
    function sig($b) {
      return ($b.attr('data-action') || '') + '|' + ($b.attr('href') || '') + '|' + ($b.attr('class') || '');
    }

    var groups = {
      online: [],
      torrent: [],
      trailer: [],
      other: []
    };

    $source.each(function () {
      var $b = $(this);
      if (isPlayBtn($b)) return; // Ігноруємо кнопки "Play"

      var s = sig($b);
      if (seen.has(s)) return; // Уникаємо дублікатів
      seen.add(s);

      var cls = ($b.attr('class') || '').toLowerCase();

      if (cls.includes('online')) {
        groups.online.push($b);
      } else if (cls.includes('torrent')) {
        groups.torrent.push($b);
      } else if (cls.includes('trailer')) {
        groups.trailer.push($b);
      } else {
        groups.other.push($b.clone(true));
      }
    });

    // Хак для перефокусування Lampa
    var needToggle = false;
    try {
      needToggle = (Lampa.Controller.enabled().name === 'full_start');
    } catch (e) {}
    if (needToggle) {
      try {
        Lampa.Controller.toggle('settings_component');
      } catch (e) {}
    }

    // Вставляємо кнопки у правильному порядку
    $container.empty();
    ['online', 'torrent', 'trailer', 'other'].forEach(function (cat) {
      groups[cat].forEach(function ($b) {
        $container.append($b);
      });
    });

    // Видаляємо "пусті" кнопки (без тексту та іконок)
    $container.find('.full-start__button').filter(function () {
      return $(this).text().trim() === '' && $(this).find('svg').length === 0;
    }).remove();

    $container.addClass('controller');

    applyIconOnlyClass(fullRoot);

    // Повертаємо фокус
    if (needToggle) {
      setTimeout(function () {
        try {
          Lampa.Controller.toggle('full_start');
        } catch (e) {}
      }, 80);
    }
  }

  /**
   * Відновлює оригінальний порядок кнопок (з кешу)
   */
  function restoreButtons() {
    if (!__ifx_btn_cache.container || !__ifx_btn_cache.nodes) return;

    var needToggle = false;
    try {
      needToggle = (Lampa.Controller.enabled().name === 'full_start');
    } catch (e) {}
    if (needToggle) {
      try {
        Lampa.Controller.toggle('settings_component');
      } catch (e) {}
    }

    var $c = __ifx_btn_cache.container;
    $c.empty().append(__ifx_btn_cache.nodes.clone(true, true));

    $c.addClass('controller');

    if (needToggle) {
      setTimeout(function () {
        try {
          Lampa.Controller.toggle('full_start');
        } catch (e) {}
      }, 80);
    }
    applyIconOnlyClass(__ifx_last.fullRoot || $(document));
  }

  /**
   * Примусово перебудовує кнопки (для реактивності)
   */
  function rebuildButtonsNow() {
    if (!__ifx_last.fullRoot) return;
    if (settings.all_buttons) {
      reorderAndShowButtons(__ifx_last.fullRoot);
    } else {
      restoreButtons();
    }
    applyIconOnlyClass(__ifx_last.fullRoot);
  }

  /**
   * Додає/видаляє клас для режиму "тільки іконки"
   */
  function applyIconOnlyClass(fullRoot) {
    var $c = fullRoot.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!$c.length) return;

    if (settings.icon_only) {
      $c.addClass('ifx-btn-icon-only')
        .find('.full-start__button').css('min-width', 'auto');
    } else {
      $c.removeClass('ifx-btn-icon-only')
        .find('.full-start__button').css('min-width', '');
    }
  }

  /* ============================================================
   * КОЛЬОРОВІ КНОПКИ
   * ============================================================ */
  var TORRENT_SVG_SOURCE = "\n<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"0\" y=\"0\" viewBox=\"0 0 48 48\">\n  <path fill=\"#4caf50\" fill-rule=\"evenodd\" d=\"M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20c-11.016,0-20,8.985-20,20C3.501,35.141,12.485,44.125,23.501,44.125z\" clip-rule=\"evenodd\"></path>\n  <path fill=\"#fff\" fill-rule=\"evenodd\" d=\"M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376c6.868,1.552,12.308-0.869,12.962-6.203c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z\" clip-rule=\"evenodd\"></path>\n</svg>";

  var ONLINE_SVG_SOURCE = null;
  var REYOHOHO_SVG_SOURCE = null;
  var lastActiveButton = null;
  var isColoredButtonsInitialized = false;

  // Стратегія завантаження останнім
  function loadAsLast() {
    // Стратегія 1: Чекаємо повного завантаження сторінки
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // Стратегія 2: Чекаємо ще трохи після DOMContentLoaded
        setTimeout(initializeColoredButtons, 1000);
      });
    } else {
      // Стратегія 3: Якщо DOM вже завантажений, чекаємо поки все заспокоїться
      setTimeout(initializeColoredButtons, 2000);
    }

    // Стратегія 4: Чекаємо поки всі ресурси завантажаться
    window.addEventListener('load', function() {
      setTimeout(initializeColoredButtons, 500);
    });

    // Стратегія 5: Останній шанс - максимальна затримка
    setTimeout(initializeColoredButtons, 5000);
  }

  // Основна функція ініціалізації
  function initializeColoredButtons() {
    if (isColoredButtonsInitialized || !settings.colored_buttons) return;
    isColoredButtonsInitialized = true;
    
    console.log('🚀 Кольорові кнопки запускаються');
    
    // Додаємо кастомні стилі
    addCustomStyles();

    // Завантажуємо SVG
    loadOnlineSVG();
    loadReyohohoSVG();
    
    // Запускаємо спостереження
    observeButtons();
    watchTitle();
    
    // Множинні спроби обробки зі зростаючими затримками
    setTimeout(processButtons, 100);
    setTimeout(processButtons, 500);
    setTimeout(processButtons, 1000);
    setTimeout(processButtons, 2000);
    setTimeout(processButtons, 3000);
    
    // Застосовуємо поточний розмір іконок
    updateColoredButtonsIconSizes();
  }

  function loadOnlineSVG() {
    if (ONLINE_SVG_SOURCE) return;
    
    fetch('https://raw.githubusercontent.com/ARST113/Buttons-/refs/heads/main/play-video-svgrepo-com.svg').then(function (response) {
      return response.text();
    }).then(function (svg) {
      ONLINE_SVG_SOURCE = svg;
      console.log('✅ SVG для онлайн завантажено');
      if (settings.colored_buttons) processButtons();
    })["catch"](function (error) {
      console.error('❌ Помилка завантаження SVG:', error);
    });
  }

  function loadReyohohoSVG() {
    if (REYOHOHO_SVG_SOURCE) return;
    
    fetch('https://raw.githubusercontent.com/ARST113/Buttons-/refs/heads/main/AIVector_clapperboard.svg').then(function (response) {
      return response.text();
    }).then(function (svg) {
      REYOHOHO_SVG_SOURCE = svg;
      console.log('✅ SVG для reyohoho завантажено');
      if (settings.colored_buttons) processButtons();
    })["catch"](function (error) {
      console.error('❌ Помилка завантаження SVG reyohoho:', error);
    });
  }

  function buildSVG(svgSource) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(svgSource.trim(), 'image/svg+xml');
    return doc.documentElement;
  }

  function replaceIconPreservingAttrs(origSvg, newSvgSource, options) {
    try {
      var fresh = buildSVG(newSvgSource);
      var keep = ['width', 'height', 'class', 'style', 'preserveAspectRatio', 'shape-rendering', 'aria-hidden', 'role', 'focusable'];
      keep.forEach(function (a) {
        var v = origSvg.getAttribute(a);
        if (v != null && v !== '') fresh.setAttribute(a, v);
      });

      // Отримуємо розміри іконок відповідно до розміру кнопок
      var iconSize = getIconSizeForButtonSize();

      // Застосовуємо кастомні налаштування якщо є
      if (options) {
        if (options.width) fresh.setAttribute('width', options.width);
        if (options.height) fresh.setAttribute('height', options.height);
        if (options.className) fresh.classList.add(options.className);
      } else {
        // Встановлюємо розміри за замовчуванням
        fresh.setAttribute('width', iconSize.width);
        fresh.setAttribute('height', iconSize.height);
        fresh.style.width = iconSize.svgWidth;
        fresh.style.height = iconSize.svgHeight;
      }

      origSvg.replaceWith(fresh);
      return true;
    } catch (error) {
      console.error('Помилка при заміні іконки:', error);
      return false;
    }
  }

  function getPluginName(btn) {
    if (!btn) return 'Online';
    var pluginName = btn.getAttribute('data-subtitle');
    if (pluginName) {
      var shortName = pluginName.split(' ')[0];
      if (pluginName.includes('by Skaz')) {
        shortName = 'Z01';
      }
      return shortName;
    }
    return 'Online';
  }

  function attachHoverEnter(btn) {
    if (btn.classList.contains('hover-enter-attached')) return;
    btn.addEventListener('hover:enter', function (e) {
      lastActiveButton = btn;
      console.log('🎯 hover:enter на кнопці:', getPluginName(btn));
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        lastActiveButton = btn;
        console.log('🎯 Enter на кнопці:', getPluginName(btn));
      }
    });
    btn.addEventListener('click', function (e) {
      lastActiveButton = btn;
      console.log('🎯 Click на кнопці:', getPluginName(btn));
    });
    btn.classList.add('hover-enter-attached');
  }

  function watchTitle() {
    var lastCheck = '';
    function checkAndUpdate() {
      var titleElement = document.querySelector('.head__title');
      if (titleElement) {
        var currentText = titleElement.textContent.trim();
        if (currentText !== lastCheck) {
          lastCheck = currentText;
          if (currentText === 'Онлайн' && lastActiveButton) {
            var pluginName = getPluginName(lastActiveButton);
            requestAnimationFrame(function () {
              titleElement.textContent = pluginName + " - Online";
              console.log("✅ Заголовок змінено на: " + pluginName + " - Online");
            });
          }
        }
      }
    }

    var observer = new MutationObserver(function (mutations) {
      var titleChanged = mutations.some(function (mutation) {
        return mutation.type === 'childList' || mutation.type === 'characterData' || mutation.target && mutation.target.classList && mutation.target.classList.contains('head__title');
      });
      if (titleChanged) {
        setTimeout(checkAndUpdate, 10);
      }
    });

    var titleElement = document.querySelector('.head__title');
    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    var bodyObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1 && node.querySelector) {
              var title = node.querySelector('.head__title');
              if (title && !title.hasAttribute('data-title-watched')) {
                title.setAttribute('data-title-watched', 'true');
                observer.observe(title, {
                  childList: true,
                  characterData: true,
                  subtree: true
                });
              }
            }
          });
        }
      });
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Функція для додавання CSS стилів
  function addCustomStyles() {
    // Перевіряємо, чи не додані стилі вже
    if (document.getElementById('custom-button-styles')) return;
    
    var style = document.createElement('style');
    style.id = 'custom-button-styles';
    
    // Отримуємо розміри іконок відповідно до розміру кнопок
    var iconSize = getIconSizeForButtonSize();
    
    style.textContent = `
      /* Прибираємо анімацію трансформації для reyohoho кнопок */
      .full-start__button.view--reyohoho_mod.selector {
        transition: opacity 0.3s ease !important;
      }
      .full-start__button.view--reyohoho_mod.selector:hover,
      .full-start__button.view--reyohoho_mod.selector:focus {
        transform: none !important;
      }
      
      /* Специфічні стилі для кастомних іконок */
      .reyohoho-custom-icon,
      .online-mod-custom-icon,
      .custom-svg-replaced {
        width: ${iconSize.width}px !important;
        height: ${iconSize.height}px !important;
        min-width: ${iconSize.width}px !important;
        min-height: ${iconSize.height}px !important;
      }
    `;
    document.head.appendChild(style);
  }

  function processButtons() {
    if (!isColoredButtonsInitialized || !settings.colored_buttons) return;
    
    var count = 0;
    var iconSize = getIconSizeForButtonSize();

    // Торрент-кнопки - обробляємо всі
    var torrentButtons = document.querySelectorAll('.full-start__button.view--torrent.selector');
    torrentButtons.forEach(function (btn) {
      if (btn.classList.contains('utorrent-svg-applied')) return;
      var svg = btn.querySelector('svg');
      if (svg) {
        if (replaceIconPreservingAttrs(svg, TORRENT_SVG_SOURCE, {
          width: iconSize.width,
          height: iconSize.height
        })) {
          btn.classList.add('utorrent-svg-applied');
          count++;
        }
      }
    });

    // Онлайн-кнопки - обробляємо тільки BwaRC і Cinema
    if (ONLINE_SVG_SOURCE) {
      var onlineButtons = document.querySelectorAll('.full-start__button.view--online.selector');
      onlineButtons.forEach(function (btn) {
        // Завжди додаємо обробники hover
        attachHoverEnter(btn);

        // Пропускаємо якщо вже оброблена
        if (btn.classList.contains('online-svg-applied')) return;

        var pluginName = getPluginName(btn);
        console.log('Перевіряємо плагін:', pluginName, btn);

        // Міняємо іконку та текст для BwaRC
        if (pluginName.toLowerCase().includes('bwa')) {
          setTimeout(function() {
            if (!btn.parentNode) {
              console.log('❌ Кнопка BwaRC більше не існує, пропускаємо');
              return;
            }

            var svg = btn.querySelector('svg');
            var span = btn.querySelector('span');

            if (svg && !svg.classList.contains('custom-svg-replaced')) {
              if (replaceIconPreservingAttrs(svg, ONLINE_SVG_SOURCE, {
                width: iconSize.width,
                height: iconSize.height
              })) {
                svg.classList.add('custom-svg-replaced');
                count++;
              }
            }

            if (span && span.textContent !== 'BWA') {
              span.textContent = 'BWA';
            }

            btn.classList.add('online-svg-applied');
            console.log('✅ Застосовано зміни для плагіна BwaRC');
          }, 50);
        } 
        // Міняємо тільки текст для Cinema
        else if (pluginName.toLowerCase().includes('cinema')) {
          setTimeout(function() {
            if (!btn.parentNode) return;

            var span = btn.querySelector('span');
            if (span && span.textContent !== 'Cinema') {
              span.textContent = 'Cinema';
            }
            btn.classList.add('online-svg-applied');
            console.log('✅ Текст змінено на Cinema для плагіна cinema');
          }, 50);
        } 
        // Для інших плагінів просто позначаємо як оброблені, щоб не чіпати в майбутньому
        else {
          btn.classList.add('online-svg-applied');
          console.log('⚠️ Плагін ' + pluginName + ' позначено як оброблений (без змін)');
        }
      });
    }

    // Обробляємо кнопки reyohoho_mod
    if (REYOHOHO_SVG_SOURCE) {
      var reyohohoButtons = document.querySelectorAll('.full-start__button.view--reyohoho_mod.selector');
      reyohohoButtons.forEach(function (btn) {
        // Завжди додаємо обробники hover
        attachHoverEnter(btn);

        // Пропускаємо якщо вже оброблена
        if (btn.classList.contains('reyohoho-svg-applied')) return;

        var svg = btn.querySelector('svg');
        if (svg) {
          setTimeout(function() {
            if (!btn.parentNode) return;

            if (replaceIconPreservingAttrs(svg, REYOHOHO_SVG_SOURCE, {
              width: iconSize.width,
              height: iconSize.height,
              className: 'reyohoho-custom-icon'
            })) {
              btn.classList.add('reyohoho-svg-applied');
              count++;
              console.log('✅ Іконка замінена для reyohoho_mod');
            }
          }, 50);
        }
      });
    }

    // Обробляємо кнопки online_mod - використовуємо ту ж іконку що і для reyohoho
    if (REYOHOHO_SVG_SOURCE) {
      var onlineModButtons = document.querySelectorAll('.full-start__button.view--online_mod.selector');
      onlineModButtons.forEach(function (btn) {
        // Завжди додаємо обробники hover
        attachHoverEnter(btn);

        // Пропускаємо якщо вже оброблена
        if (btn.classList.contains('online-mod-svg-applied')) return;

        var pluginName = getPluginName(btn);
        console.log('🔧 Обробляємо online_mod кнопку:', pluginName, btn);

        setTimeout(function() {
          if (!btn.parentNode) {
            console.log('❌ Кнопка online_mod більше не існує, пропускаємо');
            return;
          }

          var svg = btn.querySelector('svg');
          var span = btn.querySelector('span');

          // Замінюємо іконку на ту ж, що і для reyohoho_mod
          if (svg && !svg.classList.contains('online-mod-svg-replaced')) {
            if (replaceIconPreservingAttrs(svg, REYOHOHO_SVG_SOURCE, {
              width: iconSize.width,
              height: iconSize.height,
              className: 'online-mod-custom-icon'
            })) {
              svg.classList.add('online-mod-svg-replaced');
              count++;
              console.log('✅ Іконка замінена для online_mod (на іконку reyohoho)');
            }
          }

          btn.classList.add('online-mod-svg-applied');
          console.log('✅ Застосовано зміни для плагіна online_mod');
        }, 50);
      });
    }

    if (count) console.log('✅ Іконки замінено:', count);
  }

  function observeButtons() {
    var mo = new MutationObserver(function (muts) {
      var needsUpdate = false;
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes && muts[i].addedNodes.length) {
          needsUpdate = true;
          break;
        }
      }
      if (needsUpdate) {
        // Використовуємо кілька спроб із затримками для надійності
        setTimeout(processButtons, 100);
        setTimeout(processButtons, 500);
        setTimeout(processButtons, 1000);
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function disableColoredButtons() {
    isColoredButtonsInitialized = false;
    // Видаляємо кастомні стилі
    var style = document.getElementById('custom-button-styles');
    if (style) style.remove();
    console.log('❌ Кольорові кнопки вимкнено');
  }

  /* ============================================================
   * СЛУХАЧ КАРТКИ
   * ============================================================ */

  /**
   * Встановлює слухача Lampa.Listener 'full' для кнопок та оригінальної назви
   */
  function wireFullCardEnhancers() {
    Lampa.Listener.follow('full', function (e) {
      if (e.type !== 'complite') return;
      
      setTimeout(function () {
        var root = $(e.object.activity.render());

        // кешуємо поточний контейнер і його дітей (для відновлення)
        var $container = root.find('.full-start-new__buttons, .full-start__buttons').first();
        if ($container.length) {
          __ifx_btn_cache.container = $container;
          __ifx_btn_cache.nodes = $container.children().clone(true, true);
        }

        __ifx_last.fullRoot = root;
        __ifx_last.movie = e.data.movie || __ifx_last.movie || {};

        // 1. Оригінальна назва
        setOriginalTitle(root, __ifx_last.movie);

        // 2. Всі кнопки
        if (settings.all_buttons) reorderAndShowButtons(root);

        // 3. Режим «іконки без тексту»
        applyIconOnlyClass(root);

        // 4. Кольорові кнопки
        if (settings.colored_buttons) {
          setTimeout(function() {
            processButtons();
          }, 100);
        }
        
        // 5. Розмір кнопок
        applyButtonSize();
        
        // 6. Застосовуємо режим відображення логотипів
        applyLogoDisplayMode();
      }, 120);
    });
  }

  // Слухач для оновлення стилів торентів при відкритті картки
  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite') {
      setTimeout(function () {
        try {
          if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
        } catch (e) {}
      }, 120);
    }
  });

  // Спостерігач для динамічного оновлення блоків торентів
  (function observeTorrents() {
    var obs = new MutationObserver(function (muts) {
      if (typeof window.runTorrentStyleRefresh === 'function') {
        // антидребезг (debounce)
        clearTimeout(window.__ifx_tor_debounce);
        window.__ifx_tor_debounce = setTimeout(function () {
          try {
            window.runTorrentStyleRefresh();
          } catch (e) {}
        }, 200);
      }
    });
    try {
      obs.observe(document.body, {
        subtree: true,
        childList: true
      });
    } catch (e) {}
  })();

  /* ============================================================
   * РЕЙТИНГИ (ІНТЕГРОВАНИЙ ФУНКЦІОНАЛ rating_my.js)
   * ============================================================ */

  // Змінні для рейтингів
  var __lmpRateLineObs = null;
  var currentRatingsData = null;
  var __lmpLastReqToken = null;
  var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 дні
  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';
  var ID_MAPPING_CACHE = 'lmp_rating_id_cache';

  // Мапінг вікових рейтингів
  var AGE_RATINGS = {
    'G': '3+',
    'PG': '6+',
    'PG-13': '13+',
    'R': '17+',
    'NC-17': '18+',
    'TV-Y': '0+',
    'TV-Y7': '7+',
    'TV-G': '3+',
    'TV-PG': '6+',
    'TV-14': '14+',
    'TV-MA': '17+'
  };

  /**
   * Визначає тип картки (movie/tv)
   */
  function getCardType(card) {
    var type = card.media_type || card.type;
    if (type === 'movie' || type === 'tv') return type;
    return card.name || card.original_name ? 'tv' : 'movie';
  }

  /**
   * Повертає CSS-клас для кольору рейтингу
   */
  function getRatingClass(rating) {
    var r = parseFloat(rating);
    if (isNaN(r)) return 'rating--red';
    if (r >= 8.0) return 'rating--green';
    if (r >= 6.0) return 'rating--blue';
    if (r >= 4.0) return 'rating--orange';
    return 'rating--red';
  }

  /**
   * Генерує HTML для іконки сервісу
   */
  function iconImg(url, alt, sizePx, extraStyle) {
    return '<img style="' +
      'width:auto; display:inline-block; vertical-align:middle; ' +
      'object-fit:contain; ' +
      (extraStyle || '') + ' ' +
      '" ' +
      'src="' + url + '" alt="' + (alt || '') + '">';
  }

  /**
   * Генерує HTML для іконки Emmy
   */
  function emmyIconInline() {
    return '<span class="lmp-award-icon lmp-award-icon--emmy"><img src="' + ICONS.emmy + '" alt="Emmy"></span>';
  }

  /**
   * Генерує HTML для іконки Oscar
   */
  function oscarIconInline() {
    return '<span class="lmp-award-icon lmp-award-icon--oscar"><img src="' + ICONS.oscar + '" alt="Oscar"></span>';
  }

  /**
   * "Затемнює" рядок рейтингів
   */
  function dimRateLine(rateLine) {
    if (!rateLine || !rateLine.length) return;
    rateLine.addClass('lmp-is-loading-ratings');
  }

  /**
   * Відновлює видимість рядка рейтингів
   */
  function undimRateLine(rateLine) {
    if (!rateLine || !rateLine.length) return;
    rateLine.removeClass('lmp-is-loading-ratings');
  }

  /**
   * Додає анімацію завантаження ("Пошук...")
   */
  function addLoadingAnimation() {
    var render = Lampa.Activity.active().activity.render();
    if (!render || !render[0]) return;

    if ($('#lmp-search-loader', render).length) return;

    var loaderHtml =
      '<div id="lmp-search-loader" class="loading-dots-container">' +
      '<div class="loading-dots__text">Пошук…</div>' +
      '<div class="loading-dots__dot"></div>' +
      '<div class="loading-dots__dot"></div>' +
      '<div class="loading-dots__dot"></div>' +
      '</div>';

    var realSel = '.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])';
    var rateLine = $(realSel, render).first();
    if (rateLine.length) {
      rateLine.append(loaderHtml);
      dimRateLine(rateLine);
      return;
    }

    var fake = $(
      '<div class="full-start-new__rate-line" ' +
      '     id="lmp-loader-fake" data-lmp-fake="1" ' +
      '     style="min-height:28px; display:flex; align-items:center;"></div>'
    );

    var anchor = $('.full-start-new__title, .full-start__title', render).first();
    if (anchor.length) anchor.after(fake);
    else $(render).append(fake);

    fake.append(loaderHtml);

    try {
      if (__lmpRateLineObs) __lmpRateLineObs.disconnect();
    } catch (_) {}
    __lmpRateLineObs = new MutationObserver(function() {
      var rl = $(realSel, render).first();
      var loader = $('#lmp-search-loader', render);
      if (rl.length && loader.length) {
        rl.append(loader);
        dimRateLine(rl);
        $('#lmp-loader-fake', render).remove();
        try {
          __lmpRateLineObs.disconnect();
        } catch (_) {}
        __lmpRateLineObs = null;
      }
    });
    __lmpRateLineObs.observe(render[0], {
      childList: true,
      subtree: true
    });

    setTimeout(function() {
      if (__lmpRateLineObs) {
        try {
          __lmpRateLineObs.disconnect();
        } catch (_) {}
        __lmpRateLineObs = null;
      }
    }, 6000);
  }

  /**
   * Прибирає анімацію завантаження
   */
  function removeLoadingAnimation() {
    var render = Lampa.Activity.active().activity.render();
    if (!render || !render[0]) return;

    $('#lmp-search-loader', render).remove();
    $('#lmp-loader-fake', render).remove();

    var rl = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render).first();
    if (rl.length) undimRateLine(rl);

    try {
      if (__lmpRateLineObs) __lmpRateLineObs.disconnect();
    } catch (_) {}
    __lmpRateLineObs = null;
  }

  /**
   * Отримує дані з кешу
   */
  function getCachedRatings(key) {
    var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
    var item = cache[key];
    if (!item) return null;
    if (Date.now() - item.timestamp > CACHE_TIME) return null;
    return item.data || null;
  }

  /**
   * Зберігає дані в кеш
   */
  function saveCachedRatings(key, data) {
    if (!data) return;
    var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
    cache[key] = {
      timestamp: Date.now(),
      data: data
    };
    Lampa.Storage.set(RATING_CACHE_KEY, cache);
  }

  /**
   * Парсить рядок нагород з OMDB
   */
  function parseAwards(awardsText) {
    if (typeof awardsText !== 'string') return {
      oscars: 0,
      emmy: 0,
      awards: 0
    };

    var result = {
      oscars: 0,
      emmy: 0,
      awards: 0
    };
    var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
    if (oscarMatch && oscarMatch[1]) {
      result.oscars = parseInt(oscarMatch[1], 10);
    }
    var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
    if (emmyMatch && emmyMatch[1]) {
      result.emmy = parseInt(emmyMatch[1], 10);
    }
    var otherMatch = awardsText.match(/Another (\d+) wins?/i);
    if (otherMatch && otherMatch[1]) {
      result.awards = parseInt(otherMatch[1], 10);
    }
    if (result.awards === 0) {
      var simpleMatch = awardsText.match(/(\d+) wins?/i);
      if (simpleMatch && simpleMatch[1]) {
        result.awards = parseInt(simpleMatch[1], 10);
      }
    }
    return result;
  }

  /**
   * FIX: Замінює "10.0" на "10"
   */
  (function() {
    function fixTenIn(el) {
      var t = (el.textContent || '').replace(/\u00A0/g, ' ').trim();
      if (/^10(?:[.,]0+)?$/.test(t)) {
        el.textContent = '10';
      }
    }

    function scan(root) {
      try {
        var nodes = root.querySelectorAll('.full-start__rate > div:first-child');
        for (var i = 0; i < nodes.length; i++) fixTenIn(nodes[i]);
      } catch (e) {}
    }

    window.__lmpTenFixStart = function() {
      try {
        var render = Lampa && Lampa.Activity && Lampa.Activity.active() &&
          Lampa.Activity.active().activity.render &&
          Lampa.Activity.active().activity.render();
        if (!render || !render[0]) return;

        var target =
          render[0].querySelector('.full-start-new__rate-line, .full-start__rate-line') ||
          render[0];

        scan(target);

        var MObs = window.MutationObserver || window.WebKitMutationObserver;
        if (!MObs) return;

        if (window.__lmpTenObs) {
          window.__lmpTenObs.disconnect();
          window.__lmpTenObs = null;
        }

        var obs = new MObs(function(muts) {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'characterData') {
              var p = m.target && m.target.parentNode;
              if (p && p.nodeType === 1 && p.matches('.full-start__rate > div:first-child')) fixTenIn(p);
            } else if (m.type === 'childList') {
              var added = m.addedNodes || [];
              for (var j = 0; j < added.length; j++) {
                var n = added[j];
                if (!n || n.nodeType !== 1) continue;
                if (n.matches && n.matches('.full-start__rate > div:first-child')) fixTenIn(n);
                if (n.querySelectorAll) {
                  var inner = n.querySelectorAll('.full-start__rate > div:first-child');
                  for (var k = 0; k < inner.length; k++) fixTenIn(inner[k]);
                }
              }
            }
          }
        });

        obs.observe(target, {
          subtree: true,
          childList: true,
          characterData: true
        });
        window.__lmpTenObs = obs;
      } catch (e) {}
    };
  })();

  /* --- Функція для сповіщень (Toast) --- */
  function lmpToast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') {
        Lampa.Noty(msg);
        return;
      }
      if (Lampa && Lampa.Noty && Lampa.Noty.show) {
        Lampa.Noty.show(msg);
        return;
      }
    } catch (e) {}
    var id = 'lmp_toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function() {
      el.style.opacity = '0';
    }, 1300);
  }

  /* --- Функція очищення кешу --- */
  function lmpRatingsClearCache() {
    try {
      Lampa.Storage.set(RATING_CACHE_KEY, {});
      Lampa.Storage.set(ID_MAPPING_CACHE, {});
      lmpToast('Кеш рейтингів очищено');
    } catch (e) {
      console.error('LMP Ratings: clear cache error', e);
      lmpToast('Помилка очищення кешу');
    }
  }

  /**
   * Отримує imdb_id з TMDB
   */
  function getImdbIdFromTmdb(tmdbId, type, callback) {
    if (!tmdbId) return callback(null);

    var preferredType = (type === 'movie') ? 'movie' : 'tv';
    var altType = preferredType === 'movie' ? 'tv' : 'movie';

    var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};
    var now = Date.now();

    function fromCache(key) {
      var item = cache[key];
      if (!item) return null;
      if (!item.imdb_id) return null;
      if (now - item.timestamp > CACHE_TIME) return null;
      return item.imdb_id;
    }

    var keyPreferred = preferredType + '_' + tmdbId;
    var keyAlt = altType + '_' + tmdbId;

    var cachedId = fromCache(keyPreferred) || fromCache(keyAlt);
    if (cachedId) return callback(cachedId);

    var tmdbKey = Lampa.TMDB.key();
    var queue = [
      'https://api.themoviedb.org/3/' + preferredType + '/' + tmdbId + '/external_ids?api_key=' + tmdbKey,
      'https://api.themoviedb.org/3/' + preferredType + '/' + tmdbId + '?api_key=' + tmdbKey + '&append_to_response=external_ids',
      'https://api.themoviedb.org/3/' + altType + '/' + tmdbId + '/external_ids?api_key=' + tmdbKey,
      'https://api.themoviedb.org/3/' + altType + '/' + tmdbId + '?api_key=' + tmdbKey + '&append_to_response=external_ids'
    ];

    var makeRequest = function(u, success, error) {
      new Lampa.Reguest().silent(u, success, function() {
        new Lampa.Reguest().native(
          u,
          function(data) {
            try {
              success(typeof data === 'string' ? JSON.parse(data) : data);
            } catch (e) {
              error();
            }
          },
          error,
          false, {
            dataType: 'json'
          }
        );
      });
    };

    function extractImdbId(obj) {
      if (!obj || typeof obj !== 'object') return null;
      if (obj.imdb_id && typeof obj.imdb_id === 'string') return obj.imdb_id;
      if (obj.external_ids && typeof obj.external_ids.imdb_id === 'string') return obj.external_ids.imdb_id;
      return null;
    }

    function saveAndReturn(id) {
      var payload = {
        imdb_id: id,
        timestamp: Date.now()
      };
      cache[keyPreferred] = payload;
      cache[keyAlt] = payload;
      Lampa.Storage.set(ID_MAPPING_CACHE, cache);
      callback(id);
    }

    (function next() {
      var url = queue.shift();
      if (!url) return callback(null);

      makeRequest(url, function(data) {
        var imdbId = extractImdbId(data);
        if (imdbId) saveAndReturn(imdbId);
        else next();
      }, function() {
        next();
      });
    })();
  }

  /**
   * Завантажує рейтинги з MDBList
   */
  function fetchMdbListRatings(card, callback) {
    var key = LMP_ENH_CONFIG.apiKeys.mdblist;
    if (!key) {
      callback(null);
      return;
    }

    var typeSegment = (card.type === 'tv') ? 'show' : card.type;
    var url = 'https://api.mdblist.com/tmdb/' + typeSegment + '/' + card.id +
      '?apikey=' + encodeURIComponent(key);

    new Lampa.Reguest().silent(url, handleSuccess, handleFail);

    function handleFail() {
      new Lampa.Reguest().native(
        url,
        function(data) {
          try {
            handleSuccess(typeof data === 'string' ? JSON.parse(data) : data);
          } catch (e) {
            callback(null);
          }
        },
        function() {
          callback(null);
        },
        false, {
          dataType: 'json'
        }
      );
    }

    function handleSuccess(response) {
      if (!response || !response.ratings || !response.ratings.length) {
        callback(null);
        return;
      }

      var res = {
        tmdb_display: null,
        tmdb_for_avg: null,
        imdb_display: null,
        imdb_for_avg: null,
        mc_user_display: null,
        mc_user_for_avg: null,
        mc_critic_display: null,
        mc_critic_for_avg: null,
        rt_display: null,
        rt_for_avg: null,
        rt_fresh: null,
        popcorn_display: null,
        popcorn_for_avg: null
      };

      function parseRawScore(rawVal) {
        if (rawVal === null || rawVal === undefined) return null;
        if (typeof rawVal === 'number') return rawVal;
        if (typeof rawVal === 'string') {
          if (rawVal.indexOf('%') !== -1) {
            return parseFloat(rawVal.replace('%', ''));
          }
          if (rawVal.indexOf('/') !== -1) {
            return parseFloat(rawVal.split('/')[0]);
          }
          return parseFloat(rawVal);
        }
        return null;
      }

      function isUserSource(src) {
        return (
          src.indexOf('user') !== -1 ||
          src.indexOf('users') !== -1 ||
          src.indexOf('metacriticuser') !== -1 ||
          src.indexOf('metacritic_user') !== -1
        );
      }

      response.ratings.forEach(function(r) {
        var src = (r.source || '').toLowerCase();
        var val = parseRawScore(r.value);
        if (val === null || isNaN(val)) return;

        if (src.indexOf('tmdb') !== -1) {
          var tmdb10 = val > 10 ? (val / 10) : val;
          res.tmdb_display = tmdb10.toFixed(1);
          res.tmdb_for_avg = tmdb10;
        }
        if (src.indexOf('imdb') !== -1) {
          var imdb10 = val > 10 ? (val / 10) : val;
          res.imdb_display = imdb10.toFixed(1);
          res.imdb_for_avg = imdb10;
        }
        if (src.indexOf('metacritic') !== -1 && isUserSource(src)) {
          var user10 = val > 10 ? (val / 10) : val;
          res.mc_user_display = user10.toFixed(1);
          res.mc_user_for_avg = user10;
        }
        if (src.indexOf('metacritic') !== -1 && !isUserSource(src)) {
          var critic10 = val > 10 ? (val / 10) : val;
          res.mc_critic_display = critic10.toFixed(1);
          res.mc_critic_for_avg = critic10;
        }
        if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) {
          res.rt_display = String(Math.round(val));
          res.rt_for_avg = val / 10;
          res.rt_fresh = val >= 60;
        }
        if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) {
          res.popcorn_display = String(Math.round(val));
          res.popcorn_for_avg = val / 10;
        }
      });

      res._mdblist_ratings = Array.isArray(response.ratings) ? response.ratings.slice() : [];

      callback(res);
    }
  }

  /**
   * Завантажує рейтинги з OMDB
   */
  function fetchOmdbRatings(card, callback) {
    var key = LMP_ENH_CONFIG.apiKeys.omdb;
    if (!key || !card.imdb_id) {
      callback(null);
      return;
    }

    var typeParam = (card.type === 'tv') ? '&type=series' : '';
    var url = 'https://www.omdbapi.com/?apikey=' + encodeURIComponent(key) +
      '&i=' + encodeURIComponent(card.imdb_id) + typeParam;

    new Lampa.Reguest().silent(url, function(data) {
      if (!data || data.Response !== 'True') {
        callback(null);
        return;
      }

      var awardsParsed = parseAwards(data.Awards || '');
      var rtScore = null;
      var mcScore = null;

      if (Array.isArray(data.Ratings)) {
        data.Ratings.forEach(function(r) {
          if (r.Source === 'Rotten Tomatoes') {
            var v = parseInt((r.Value || '').replace('%', ''));
            if (!isNaN(v)) rtScore = v;
          }
          if (r.Source === 'Metacritic') {
            var m = parseInt((r.Value || '').split('/')[0]);
            if (!isNaN(m)) mcScore = m;
          }
        });
      }

      var mc10 = (mcScore !== null && !isNaN(mcScore)) ?
        (mcScore > 10 ? mcScore / 10 : mcScore) :
        null;

      var res = {
        tmdb_display: null,
        tmdb_for_avg: null,
        imdb_display: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating).toFixed(1) : null,
        imdb_for_avg: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
        mc_user_display: null,
        mc_user_for_avg: null,
        mc_critic_display: (mc10 !== null ? mc10.toFixed(1) : null),
        mc_critic_for_avg: (mc10 !== null ? mc10 : null),
        rt_display: (rtScore !== null && !isNaN(rtScore)) ? String(rtScore) : null,
        rt_for_avg: (rtScore !== null && !isNaN(rtScore)) ? (rtScore / 10) : null,
        rt_fresh: (rtScore !== null && !isNaN(rtScore)) ? (rtScore >= 60) : null,
        popcorn_display: null,
        popcorn_for_avg: null,
        ageRating: data.Rated || null,
        oscars: awardsParsed.oscars || 0,
        emmy: awardsParsed.emmy || 0,
        awards: awardsParsed.awards || 0
      };

      callback(res);
    }, function() {
      callback(null);
    });
  }

  /**
   * Змерджує результати MDBList та OMDB
   */
  function mergeRatings(mdb, omdb) {
    mdb = mdb || {};
    omdb = omdb || {};

    var mc_display = null;
    var mc_for_avg = null;

    if (mdb.mc_user_display) {
      mc_display = mdb.mc_user_display;
      mc_for_avg = mdb.mc_user_for_avg;
    } else if (mdb.mc_critic_display) {
      mc_display = mdb.mc_critic_display;
      mc_for_avg = mdb.mc_critic_for_avg;
    } else if (omdb.mc_critic_display) {
      mc_display = omdb.mc_critic_display;
      mc_for_avg = omdb.mc_critic_for_avg;
    }

    var merged = {
      tmdb_display: mdb.tmdb_display || null,
      tmdb_for_avg: mdb.tmdb_for_avg || null,
      imdb_display: mdb.imdb_display || omdb.imdb_display || null,
      imdb_for_avg: mdb.imdb_for_avg || omdb.imdb_for_avg || null,
      mc_display: mc_display || null,
      mc_for_avg: (typeof mc_for_avg === 'number' ? mc_for_avg : null),
      rt_display: mdb.rt_display || omdb.rt_display || null,
      rt_for_avg: mdb.rt_for_avg || omdb.rt_for_avg || null,
      rt_fresh: (mdb.rt_display || omdb.rt_display) ?
        (mdb.rt_display ? mdb.rt_fresh : omdb.rt_fresh) :
        null,
      popcorn_display: mdb.popcorn_display || null,
      popcorn_for_avg: mdb.popcorn_for_avg || null,
      ageRating: omdb.ageRating || null,
      oscars: omdb.oscars || 0,
      emmy: omdb.emmy || 0,
      awards: omdb.awards || 0,
      _mdblist_ratings: Array.isArray(mdb._mdblist_ratings) ? mdb._mdblist_ratings.slice() : []
    };

    return merged;
  }

  /**
   * Оновлює приховані елементи (вік, IMDb, TMDB)
   */
  function updateHiddenElements(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render || !render[0]) return;

    var pgElement = $('.full-start__pg.hide', render);
    if (pgElement.length && data.ageRating) {
      var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
      var isValid = invalidRatings.indexOf(data.ageRating) === -1;
      if (isValid) {
        var localized = AGE_RATINGS[data.ageRating] || data.ageRating;
        pgElement.removeClass('hide').text(localized);
      }
    }

    var imdbContainer = $('.rate--imdb', render);
    if (imdbContainer.length) {
      var cfg = getRatingsCfg();
      if (!cfg.enableImdb || !data.imdb_display) {
        imdbContainer.addClass('hide')
          .removeClass('rating--green rating--blue rating--orange rating--red');
      } else {
        imdbContainer.removeClass('hide');
        var imdbDivs = imdbContainer.find('> div');
        if (imdbDivs.length >= 2) {
          imdbDivs.eq(0).text(parseFloat(data.imdb_display).toFixed(1));
          imdbDivs.eq(1).addClass('source--name').html(iconImg(ICONS.imdb, 'IMDb', 22));
        }
        imdbContainer.removeClass('rating--green rating--blue rating--orange rating--red');
        if (cfg.colorizeAll && data.imdb_for_avg && !isNaN(data.imdb_for_avg)) {
          imdbContainer.addClass(getRatingClass(parseFloat(data.imdb_for_avg)));
        }
      }
    }

    var tmdbContainer = $('.rate--tmdb', render);
    if (tmdbContainer.length) {
      var cfg = getRatingsCfg();
      if (!cfg.enableTmdb || !data.tmdb_display) {
        tmdbContainer.addClass('hide')
          .removeClass('rating--green rating--blue rating--orange rating--red');
      } else {
        var tmdbDivs = tmdbContainer.find('> div');
        if (tmdbDivs.length >= 2) {
          tmdbDivs.eq(0).text(parseFloat(data.tmdb_display).toFixed(1));
          tmdbDivs.eq(1).addClass('source--name').html(iconImg(ICONS.tmdb, 'TMDB', 24));
        }
        tmdbContainer.removeClass('hide rating--green rating--blue rating--orange rating--red');
        if (cfg.colorizeAll && data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) {
          tmdbContainer.addClass(getRatingClass(parseFloat(data.tmdb_for_avg)));
        }
      }
    }
  }

  /**
   * Застосовує "золотий" колір до нагород
   */
  function applyAwardsColor(rateLine, cfg) {
    var $tiles = rateLine.find('.rate--awards, .rate--oscars, .rate--emmy');
    $tiles.removeClass('rating--green rating--blue rating--orange rating--red');

    if (cfg && cfg.colorizeAll) {
      $tiles.addClass('rate--gold');
    } else {
      $tiles.removeClass('rate--gold');
    }
  }

  /**
   * Вставляє нові бейджі (MC, RT, Popcorn, Awards)
   */
  function insertRatings(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var rateLine = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render);
    if (!rateLine.length) return;

    var cfg = getRatingsCfg();

    (function() {
      var cont = $('.rate--mc', rateLine);
      if (!cfg.enableMc) {
        cont.remove();
        return;
      }

      var mcVal = null;
      if (data.mc_user_for_avg && !isNaN(data.mc_user_for_avg)) {
        mcVal = parseFloat(data.mc_user_for_avg);
      } else if (data.mc_critic_for_avg && !isNaN(data.mc_critic_for_avg)) {
        mcVal = parseFloat(data.mc_critic_for_avg);
      } else if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
        mcVal = parseFloat(data.mc_for_avg);
      } else if (data.mc_display && !isNaN(parseFloat(data.mc_display))) {
        var md = parseFloat(data.mc_display);
        mcVal = (md > 10) ? (md / 10) : md;
      }

      if (mcVal == null || isNaN(mcVal)) {
        cont.remove();
        return;
      }

      var mcText = mcVal.toFixed(1);

      if (!cont.length) {
        cont = $(
          '<div class="full-start__rate rate--mc">' +
          '<div>' + mcText + '</div>' +
          '<div class="source--name"></div>' +
          '</div>'
        );
        cont.find('.source--name').html(iconImg(ICONS.metacritic, 'Metacritic', 22));

        var afterImdb = $('.rate--imdb', rateLine);
        if (afterImdb.length) cont.insertAfter(afterImdb);
        else rateLine.append(cont);
      } else {
        cont.find('> div').eq(0).text(mcText);
      }

      cont.removeClass('rating--green rating--blue rating--orange rating--red');
      if (cfg.colorizeAll) cont.addClass(getRatingClass(mcVal));
    })();

    (function() {
      var cont = $('.rate--rt', rateLine);
      if (!cfg.enableRt) {
        cont.remove();
        return;
      }

      var rtVal = null;
      if (data.rt_for_avg && !isNaN(data.rt_for_avg)) rtVal = parseFloat(data.rt_for_avg);
      else if (data.rt_display && !isNaN(parseFloat(data.rt_display))) {
        var rtd = parseFloat(data.rt_display);
        rtVal = (rtd > 10) ? (rtd / 10) : rtd;
      }

      if (rtVal == null || isNaN(rtVal)) {
        cont.remove();
        return;
      }

      var rtText = rtVal.toFixed(1);
      var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
      var extra = data.rt_fresh ? 'border-radius:4px;' : '';

      if (!cont.length) {
        cont = $(
          '<div class="full-start__rate rate--rt">' +
          '<div>' + rtText + '</div>' +
          '<div class="source--name"></div>' +
          '</div>'
        );
        cont.find('.source--name').html(iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra));

        var afterMc = $('.rate--mc', rateLine);
        if (afterMc.length) cont.insertAfter(afterMc);
        else {
          var afterImdb2 = $('.rate--imdb', rateLine);
          if (afterImdb2.length) cont.insertAfter(afterImdb2);
          else rateLine.prepend(cont);
        }
      } else {
        cont.find('> div').eq(0).text(rtText);
        cont.find('.source--name').html(iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra));
      }

      cont.removeClass('rating--green rating--blue rating--orange rating--red');
      if (cfg.colorizeAll) cont.addClass(getRatingClass(rtVal));
    })();

    (function() {
      var cont = $('.rate--popcorn', rateLine);
      if (!cfg.enablePop) {
        cont.remove();
        return;
      }

      var pcVal = null;
      if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) pcVal = parseFloat(data.popcorn_for_avg);
      else if (data.popcorn_display && !isNaN(parseFloat(data.popcorn_display))) {
        var pcd = parseFloat(data.popcorn_display);
        pcVal = (pcd > 10) ? (pcd / 10) : pcd;
      }

      if (pcVal == null || isNaN(pcVal)) {
        cont.remove();
        return;
      }

      var pcText = pcVal.toFixed(1);

      if (!cont.length) {
        cont = $(
          '<div class="full-start__rate rate--popcorn">' +
          '<div>' + pcText + '</div>' +
          '<div class="source--name"></div>' +
          '</div>'
        );
        cont.find('.source--name').html(iconImg(ICONS.popcorn, 'Audience', 22));

        var anchors = rateLine.find('.rate--rt, .rate--mc, .rate--tmdb, .rate--imdb');
        if (anchors.length) cont.insertAfter(anchors.last());
        else rateLine.prepend(cont);
      } else {
        cont.find('> div').eq(0).text(pcText);
        cont.find('.source--name').html(iconImg(ICONS.popcorn, 'Audience', 22));
      }

      cont.removeClass('rating--green rating--blue rating--orange rating--red');
      if (cfg.colorizeAll) cont.addClass(getRatingClass(pcVal));
    })();

    if (data.awards && data.awards > 0 && !$('.rate--awards', rateLine).length) {
      var awardsElement = $(
        '<div class="full-start__rate rate--awards rate--gold">' +
        '<div>' + data.awards + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      awardsElement.find('.source--name')
        .html(iconImg(ICONS.awards, 'Awards', 20))
        .attr('title', Lampa.Lang.translate('awards_other_label'));
      rateLine.prepend(awardsElement);
    }

    if (data.emmy && data.emmy > 0 && !$('.rate--emmy', rateLine).length) {
      var emmyElement = $(
        '<div class="full-start__rate rate--emmy rate--gold">' +
        '<div>' + data.emmy + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      emmyElement.find('.source--name')
        .html(emmyIconInline())
        .attr('title', Lampa.Lang.translate('emmy_label'));
      rateLine.prepend(emmyElement);
    }

    if (data.oscars && data.oscars > 0 && !$('.rate--oscars', rateLine).length) {
      var oscarsElement = $(
        '<div class="full-start__rate rate--oscars rate--gold">' +
        '<div>' + data.oscars + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      oscarsElement.find('.source--name')
        .html(oscarIconInline())
        .attr('title', Lampa.Lang.translate('oscars_label'));
      rateLine.prepend(oscarsElement);
    }

    try {
      applyAwardsColor(rateLine, cfg);
    } catch (e) {}
  }

  /**
   * Розраховує та вставляє середній рейтинг (AVG)
   */
  function calculateAverageRating(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var rateLine = $('.full-start-new__rate-line:not([data-lmp-fake]), .full-start__rate-line:not([data-lmp-fake])', render);
    if (!rateLine.length) return;

    var cfg = getRatingsCfg();

    $('.rate--avg', rateLine).remove();
    if (!cfg.showAverage) {
      try {
        applyAwardsColor(rateLine, cfg);
      } catch (e) {}
      removeLoadingAnimation();
      undimRateLine(rateLine);
      return;
    }

    var parts = [];
    if (cfg.enableTmdb && data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(parseFloat(data.tmdb_for_avg));
    if (cfg.enableImdb && data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(parseFloat(data.imdb_for_avg));

    if (cfg.enableMc) {
      if (data.mc_user_for_avg && !isNaN(data.mc_user_for_avg)) {
        parts.push(parseFloat(data.mc_user_for_avg));
      } else if (data.mc_critic_for_avg && !isNaN(data.mc_critic_for_avg)) {
        parts.push(parseFloat(data.mc_critic_for_avg));
      } else if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
        parts.push(parseFloat(data.mc_for_avg));
      }
    }

    if (cfg.enableRt && data.rt_for_avg && !isNaN(data.rt_for_avg)) parts.push(parseFloat(data.rt_for_avg));
    if (cfg.enablePop && data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) parts.push(parseFloat(data.popcorn_for_avg));

    if (!parts.length) {
      removeLoadingAnimation();
      undimRateLine(rateLine);
      return;
    }

    var sum = 0;
    for (var i = 0; i < parts.length; i++) sum += parts[i];
    var avg = sum / parts.length;
    var colorClass = cfg.colorizeAll ? getRatingClass(avg) : '';

    var avgElement = $(
      '<div class="full-start__rate rate--avg ' + colorClass + '">' +
      '<div>' + avg.toFixed(1) + '</div>' +
      '<div class="source--name"></div>' +
      '</div>'
    );

    var starHtml = iconImg(ICONS.total_star, 'AVG', 20);
    avgElement.find('.source--name').html(starHtml);

    var firstRate = $('.full-start__rate:first', rateLine);
    if (firstRate.length) firstRate.before(avgElement);
    else rateLine.prepend(avgElement);

    try {
      applyAwardsColor(rateLine, getRatingsCfg());
    } catch (e) {}

    removeLoadingAnimation();
    undimRateLine(rateLine);
  }

  /**
   * Головна функція, що запускає весь процес рейтингів
   */
  function fetchAdditionalRatings(card) {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;

    var normalizedCard = {
      id: card.id,
      imdb_id: card.imdb_id || card.imdb || null,
      title: card.title || card.name || '',
      original_title: card.original_title || card.original_name || '',
      type: getCardType(card),
      release_date: card.release_date || card.first_air_date || '',
      vote: card.vote_average || card.vote || null
    };

    var cardKeyForToken = (normalizedCard.type || getCardType(normalizedCard)) + '_' + (normalizedCard.imdb_id || normalizedCard.id || '');
    var reqToken = cardKeyForToken + '_' + Date.now();
    __lmpLastReqToken = reqToken;

    function renderAll() {
      if (reqToken !== __lmpLastReqToken) return;
      if (!currentRatingsData) {
        removeLoadingAnimation();
        return;
      }

      updateHiddenElements(currentRatingsData);
      insertRatings(currentRatingsData);
      calculateAverageRating(currentRatingsData);

      applyRatingsStyles();
    }

    function proceedWithImdbId() {
      var cacheKeyBase = normalizedCard.imdb_id || normalizedCard.id;
      var cacheKey = cacheKeyBase ? (normalizedCard.type + '_' + cacheKeyBase) : null;

      var cached = cacheKey ? getCachedRatings(cacheKey) : null;
      if (cached) {
        currentRatingsData = cached;
        renderAll();
        return;
      }

      addLoadingAnimation();

      var pending = 2;
      var mdbRes = null;
      var omdbRes = null;

      function oneDone() {
        pending--;
        if (pending !== 0) return;

        currentRatingsData = mergeRatings(mdbRes, omdbRes);

        if (
          (!currentRatingsData.tmdb_display || !currentRatingsData.tmdb_for_avg) &&
          normalizedCard.vote != null
        ) {
          var tm = parseFloat(normalizedCard.vote);
          if (!isNaN(tm)) {
            if (tm > 10) tm = tm / 10;
            if (tm < 0) tm = 0;
            if (tm > 10) tm = 10;
            currentRatingsData.tmdb_for_avg = tm;
            currentRatingsData.tmdb_display = tm.toFixed(1);
          }
        }

        if (
          cacheKey &&
          currentRatingsData && (
            currentRatingsData.tmdb_display ||
            currentRatingsData.imdb_display ||
            currentRatingsData.mc_display ||
            currentRatingsData.rt_display ||
            currentRatingsData.popcorn_display ||
            currentRatingsData.oscars ||
            currentRatingsData.emmy ||
            currentRatingsData.awards
          )
        ) {
          saveCachedRatings(cacheKey, currentRatingsData);
        }

        renderAll();
      }

      fetchMdbListRatings(normalizedCard, function(r1) {
        mdbRes = r1 || {};
        oneDone();
      });
      fetchOmdbRatings(normalizedCard, function(r2) {
        omdbRes = r2 || {};
        oneDone();
      });
    }

    if (!normalizedCard.imdb_id) {
      getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, function(imdb_id) {
        normalizedCard.imdb_id = imdb_id;
        proceedWithImdbId();
      });
    } else {
      proceedWithImdbId();
    }
  }

  /**
   * Отримує актуальні налаштування рейтингів
   */
  function getRatingsCfg() {
    return {
      showAwards: settings.ratings_show_awards,
      showAverage: settings.ratings_show_average,
      colorizeAll: settings.ratings_colorize_all,
      enableImdb: settings.ratings_enable_imdb,
      enableTmdb: settings.ratings_enable_tmdb,
      enableMc: settings.ratings_enable_mc,
      enableRt: settings.ratings_enable_rt,
      enablePop: settings.ratings_enable_popcorn
    };
  }

  /**
   * Ховає/показує блоки з нагородами
   */
  function toggleAwards(showAwards) {
    var nodes = document.querySelectorAll('.rate--oscars, .rate--emmy, .rate--awards');
    nodes.forEach(function(n) {
      n.style.display = showAwards ? '' : 'none';
    });
  }

  /**
   * Ховає/показує блок середнього рейтингу
   */
  function toggleAverage(showAverage) {
    var nodes = document.querySelectorAll('.rate--avg');
    nodes.forEach(function(n) {
      n.style.display = showAverage ? '' : 'none';
    });
  }

  /**
   * Головна функція стилізації рейтингів
   */
  function applyRatingsStyles() {
    toggleAwards(settings.ratings_show_awards);
    toggleAverage(settings.ratings_show_average);
  }

  /**
   * Оновлює відображення рейтингів
   */
  function updateRatingsDisplay() {
    if (currentRatingsData) {
      updateHiddenElements(currentRatingsData);
      insertRatings(currentRatingsData);
      calculateAverageRating(currentRatingsData);
    }
    applyRatingsStyles();
  }

  // Debounce-обробник для resize
  var reapplyOnResize = (function() {
    var t;
    return function() {
      clearTimeout(t);
      t = setTimeout(function() {
        applyRatingsStyles();
      }, 150);
    };
  })();

  /**
   * Встановлює дефолтні значення для тумблерів рейтингів
   */
  function ensureDefaultToggles() {
    if (typeof Lampa.Storage.get('ratings_show_awards') === 'undefined') {
      Lampa.Storage.set('ratings_show_awards', true);
    }
    if (typeof Lampa.Storage.get('ratings_show_average') === 'undefined') {
      Lampa.Storage.set('ratings_show_average', true);
    }
  }

  /**
   * "Живе" оновлення стилів при зміні в меню
   */
  function attachLiveSettingsHandlers() {
    var scheduleApply = (function() {
      var t;
      return function() {
        clearTimeout(t);
        t = setTimeout(function() {
          try {
            updateRatingsDisplay();
          } catch (e) {}
        }, 150);
      };
    })();

    function onDomChange(e) {
      var t = e.target;
      if (!t) return;
      var n = (t.getAttribute('name') || t.getAttribute('data-name') || '');
      if (n && n.indexOf('ratings_') === 0) scheduleApply();
    }

    document.addEventListener('input', onDomChange, true);
    document.addEventListener('change', onDomChange, true);
    document.addEventListener('click', function(e) {
      var el = e.target.closest('[data-name^="ratings_"],[name^="ratings_"]');
      if (el) scheduleApply();
    }, true);
    document.addEventListener('keyup', onDomChange, true);
  }

  /* ============================================================
   * ЗАПУСК РЕЙТИНГІВ
   * ============================================================ */
  function startRatingsPlugin() {
    window.combined_ratings_plugin = true;
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        setTimeout(function() {
          fetchAdditionalRatings(e.data.movie || e.object || {});
          __lmpTenFixStart();
        }, 500);
      }
    });
  }

  /* ============================================================
   * СТИЛІ ТОРРЕНТІВ ЯК У TORRENT_STYLES.JS (без рамок)
   * ============================================================ */
  (function () {
    try {
      // Thresholds
      var TH = {
        seeds: {
          danger_below: 5,
          good_from: 10,
          top_from: 20
        },
        bitrate: {
          warn_from: 50,
          danger_from: 100
        },
        size: {
          mid_from_gb: 50,
          high_from_gb: 100,
          top_from_gb: 200
        },
        debounce_ms: 60
      };

      var styles = {
        '.torrent-item__details': {
          'font-size': '0.9em'
        },
        // Base badge look (emerald theme)
        '.torrent-item__bitrate > span.ts-bitrate, .torrent-item__seeds > span.ts-seeds, .torrent-item__grabs > span.ts-grabs, .torrent-item__size.ts-size': {
          'display': 'inline-flex',
          '-webkit-box-align': 'center',
          '-webkit-align-items': 'center',
          '-moz-box-align': 'center',
          '-ms-flex-align': 'center',
          'align-items': 'center',
          '-webkit-box-pack': 'center',
          '-webkit-justify-content': 'center',
          '-moz-box-pack': 'center',
          '-ms-flex-pack': 'center',
          'justify-content': 'center',
          'box-sizing': 'border-box',
          'min-height': '1.7em',
          'padding': '0.15em 0.45em',
          'border-radius': '0.5em',
          'font-weight': '700',
          'font-size': '0.9em',
          'line-height': '1',
          'white-space': 'nowrap',
          'vertical-align': 'middle',
          'font-variant-numeric': 'tabular-nums'
        },

        // Tighten spacing so everything fits on one row
        '.torrent-item__bitrate, .torrent-item__grabs, .torrent-item__seeds': {
          'margin-right': '0.55em'
        },

        // Seeds
        '.torrent-item__seeds > span.ts-seeds': {
          color: '#5cd4b0',
          'background-color': 'rgba(92, 212, 176, 0.14)',
          border: '0.15em solid rgba(92, 212, 176, 0.90)',
          'box-shadow': '0 0 0.75em rgba(92, 212, 176, 0.28)'
        },
        // Low seeds (danger) — soft red (emerald palette)
        '.torrent-item__seeds > span.ts-seeds.low-seeds': {
          color: '#ff5f6d',
          'background-color': 'rgba(255, 95, 109, 0.14)',
          border: '0.15em solid rgba(255, 95, 109, 0.82)',
          'box-shadow': '0 0 0.65em rgba(255, 95, 109, 0.26)',
          'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.25)'
        },
        // 10..19 (good) — emerald
        '.torrent-item__seeds > span.ts-seeds.good-seeds': {
          color: '#43cea2',
          'background-color': 'rgba(67, 206, 162, 0.16)',
          border: '0.15em solid rgba(67, 206, 162, 0.92)',
          'box-shadow': '0 0 0.9em rgba(67, 206, 162, 0.34)'
        },
        '.torrent-item__seeds > span.ts-seeds.high-seeds': {
          color: '#ffc371',
          background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
          border: '0.15em solid rgba(255, 195, 113, 0.92)',
          'box-shadow': '0 0 0.95em rgba(255, 195, 113, 0.38)',
          'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.25)'
        },

        // Grabs/Peers (download) — theme blue
        '.torrent-item__grabs > span.ts-grabs': {
          color: '#4db6ff',
          'background-color': 'rgba(77, 182, 255, 0.12)',
          border: '0.15em solid rgba(77, 182, 255, 0.82)',
          'box-shadow': '0 0 0.35em rgba(77, 182, 255, 0.16)'
        },
        '.torrent-item__grabs > span.ts-grabs.high-grabs': {
          color: '#4db6ff',
          background: 'linear-gradient(135deg, rgba(77, 182, 255, 0.18), rgba(52, 152, 219, 0.10))',
          border: '0.15em solid rgba(77, 182, 255, 0.92)',
          'box-shadow': '0 0 0.55em rgba(77, 182, 255, 0.22)'
        },

        // Bitrate — light emerald accent
        '.torrent-item__bitrate > span.ts-bitrate': {
          color: '#5cd4b0',
          'background-color': 'rgba(67, 206, 162, 0.10)',
          border: '0.15em solid rgba(92, 212, 176, 0.78)',
          'box-shadow': '0 0 0.45em rgba(92, 212, 176, 0.20)'
        },
        // 50..100 Mbps (gold)
        '.torrent-item__bitrate > span.ts-bitrate.high-bitrate': {
          color: '#ffc371',
          background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
          border: '0.15em solid rgba(255, 195, 113, 0.92)',
          'box-shadow': '0 0 0.95em rgba(255, 195, 113, 0.38)',
          'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.25)'
        },
        // >100 Mbps (danger)
        '.torrent-item__bitrate > span.ts-bitrate.very-high-bitrate': {
          color: '#ff5f6d',
          background: 'linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08))',
          border: '0.15em solid rgba(255, 95, 109, 0.92)',
          'box-shadow': '0 0 1.05em rgba(255, 95, 109, 0.40)',
          'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.25)'
        },

        // Size — tiered
        '.torrent-item__size.ts-size': {
          color: '#5cd4b0',
          'background-color': 'rgba(92, 212, 176, 0.12)',
          border: '0.15em solid rgba(92, 212, 176, 0.82)',
          'box-shadow': '0 0 0.7em rgba(92, 212, 176, 0.26)',
          'font-weight': '700'
        },
        // 50..100GB: emerald
        '.torrent-item__size.ts-size.mid-size': {
          color: '#43cea2',
          'background-color': 'rgba(67, 206, 162, 0.16)',
          border: '0.15em solid rgba(67, 206, 162, 0.92)',
          'box-shadow': '0 0 0.9em rgba(67, 206, 162, 0.34)'
        },
        // 100..200GB: gold
        '.torrent-item__size.ts-size.high-size': {
          color: '#ffc371',
          background: 'linear-gradient(135deg, rgba(255, 195, 113, 0.28), rgba(67, 206, 162, 0.10))',
          border: '0.15em solid rgba(255, 195, 113, 0.95)',
          'box-shadow': '0 0 1.05em rgba(255, 195, 113, 0.40)',
          'text-shadow': '0 0 0.25em rgba(255, 195, 113, 0.22)'
        },
        // >200GB: red (danger)
        '.torrent-item__size.ts-size.top-size': {
          color: '#ff5f6d',
          background: 'linear-gradient(135deg, rgba(255, 95, 109, 0.28), rgba(67, 206, 162, 0.08))',
          border: '0.15em solid rgba(255, 95, 109, 0.95)',
          'box-shadow': '0 0 1.1em rgba(255, 95, 109, 0.42)',
          'text-shadow': '0 0 0.25em rgba(255, 95, 109, 0.22)'
        },

        '.torrent-item.selector.focus': {
          'box-shadow': '0 0 0 0.3em rgba(67, 206, 162, 0.4)'
        },
        '.torrent-serial.selector.focus': {
          'box-shadow': '0 0 0 0.25em rgba(67, 206, 162, 0.4)'
        },
        '.torrent-file.selector.focus': {
          'box-shadow': '0 0 0 0.25em rgba(67, 206, 162, 0.4)'
        },
        '.torrent-item.focus::after': {
          border: '0.24em solid #5cd4b0',
          'box-shadow': '0 0 0.6em rgba(92, 212, 176, 0.18)',
          'border-radius': '0.9em'
        },
        '.scroll__body': {
          margin: '5px'
        }
      };

      function injectTorrentStyles() {
        var styleId = 'interface_mod_torrent_styles';
        var oldStyle = document.getElementById(styleId);
        if (oldStyle) oldStyle.remove();
        
        var css = Object.keys(styles)
          .map(function (selector) {
            var props = styles[selector];
            var rules = Object.keys(props)
              .map(function (prop) {
                return prop + ': ' + props[prop] + ' !important';
              })
              .join('; ');
            return selector + ' { ' + rules + ' }';
          })
          .join('\n');
        
        var style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
      }

      function tsParseFloat(text) {
        var t = ((text || '') + '').trim();
        var m = t.match(/(\d+(?:[.,]\d+)?)/);
        return m ? (parseFloat(m[1].replace(',', '.')) || 0) : 0;
      }

      function tsParseInt(text) {
        var t = ((text || '') + '').trim();
        var v = parseInt(t, 10);
        return isNaN(v) ? 0 : v;
      }

      function tsApplyTier(el, classesToClear, classToAdd) {
        try {
          for (var i = 0; i < classesToClear.length; i++) el.classList.remove(classesToClear[i]);
          if (classToAdd) el.classList.add(classToAdd);
        } catch (e) { }
      }

      function tsParseSizeToGb(text) {
        try {
          var t = ((text || '') + '').replace(/\u00A0/g, ' ').trim();
          var m = t.match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|tb|кб|мб|гб|тб)/i);
          if (!m) return null;

          var num = parseFloat((m[1] || '0').replace(',', '.')) || 0;
          var unit = (m[2] || '').toLowerCase();
          var gb = 0;

          if (unit === 'tb' || unit === 'тб') gb = num * 1024;
          else if (unit === 'gb' || unit === 'гб') gb = num;
          else if (unit === 'mb' || unit === 'мб') gb = num / 1024;
          else if (unit === 'kb' || unit === 'кб') gb = num / (1024 * 1024);
          else gb = 0;

          return gb;
        } catch (e) {
          return null;
        }
      }

      function updateTorrentStylesInternal() {
        try {
          document.querySelectorAll('.torrent-item__seeds span').forEach(function (span) {
            var value = tsParseInt(span.textContent);
            span.classList.add('ts-seeds');

            var seedTier = '';
            if (value < TH.seeds.danger_below) seedTier = 'low-seeds';
            else if (value >= TH.seeds.top_from) seedTier = 'high-seeds';
            else if (value >= TH.seeds.good_from) seedTier = 'good-seeds';
            tsApplyTier(span, ['low-seeds', 'good-seeds', 'high-seeds'], seedTier);
          });

          document.querySelectorAll('.torrent-item__bitrate span').forEach(function (span) {
            var value = tsParseFloat(span.textContent);
            span.classList.add('ts-bitrate');

            var brTier = '';
            if (value > TH.bitrate.danger_from) brTier = 'very-high-bitrate';
            else if (value >= TH.bitrate.warn_from) brTier = 'high-bitrate';
            tsApplyTier(span, ['high-bitrate', 'very-high-bitrate'], brTier);
          });

          document.querySelectorAll('.torrent-item__grabs span').forEach(function (span) {
            var value = tsParseInt(span.textContent);
            span.classList.add('ts-grabs');
            tsApplyTier(span, ['high-grabs'], value > 10 ? 'high-grabs' : '');
          });

          document.querySelectorAll('.torrent-item__size').forEach(function (el) {
            var text = (el.textContent || '');
            el.classList.add('ts-size');

            var gb = tsParseSizeToGb(text);
            if (gb === null) {
              tsApplyTier(el, ['mid-size', 'high-size', 'top-size'], '');
              return;
            }

            var szTier = '';
            if (gb > TH.size.top_from_gb) szTier = 'top-size';
            else if (gb >= TH.size.high_from_gb) szTier = 'high-size';
            else if (gb >= TH.size.mid_from_gb) szTier = 'mid-size';
            tsApplyTier(el, ['mid-size', 'high-size', 'top-size'], szTier);
          });
        } catch (e) {
          console.error('Torrent styles update error:', e);
        }
      }

      var tsUpdateTimer = null;
      function scheduleUpdate(delayMs) {
        try {
          if (tsUpdateTimer) clearTimeout(tsUpdateTimer);
        } catch (e) { }

        var ms = typeof delayMs === 'number' ? delayMs : TH.debounce_ms;
        tsUpdateTimer = setTimeout(function () {
          tsUpdateTimer = null;
          updateTorrentStylesInternal();
        }, ms);
      }

      function observeTorrentsDom() {
        try {
          var observer = new MutationObserver(function (mutations) {
            var needsUpdate = false;
            for (var i = 0; i < mutations.length; i++) {
              var mutation = mutations[i];
              if (mutation.addedNodes && mutation.addedNodes.length) {
                needsUpdate = true;
                break;
              }
              if (mutation.type === 'characterData' ||
                (mutation.type === 'childList' && mutation.target &&
                  (mutation.target.classList &&
                    (mutation.target.classList.contains('torrent-item__bitrate') ||
                      mutation.target.classList.contains('torrent-item__seeds') ||
                      mutation.target.classList.contains('torrent-item__grabs') ||
                      mutation.target.classList.contains('torrent-item__size'))))) {
                needsUpdate = true;
                break;
              }
            }
            if (needsUpdate) scheduleUpdate();
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
          });
          scheduleUpdate(0);
        } catch (e) {
          console.error('Torrent styles observer error:', e);
          scheduleUpdate(0);
        }
      }

      // Ініціалізація стилів торентів
      injectTorrentStyles();
      observeTorrentsDom();
      
      // Перше оновлення
      setTimeout(function() {
        updateTorrentStylesInternal();
      }, 500);
      
    } catch (e) {
      console.error('Torrent styles initialization error:', e);
    }
  })();

  /* Torrent toggles overrides */
  // Цей блок динамічно вмикає/вимикає стилі з torrents+mod
  // на основі налаштувань з "Інтерфейс +"
  (function () {
    // Власна реалізація getBool, щоб бути незалежним
    function getBool(key, def) {
      var v = Lampa.Storage.get(key);
      if (v === true || v === false) return v;
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (v == null) return def;
      return !!v;
    }

    function apply() {
      var s = document.getElementById('torr_mod_overrides');
      if (!s) {
        s = document.createElement('style');
        s.id = 'torr_mod_overrides';
        document.head.appendChild(s);
      }
      
      // Отримуємо налаштування з "Інтерфейс +"
      var ef = getBool('interface_mod_new_tor_frame', true),
          eb = getBool('interface_mod_new_tor_bitrate', true),
          es = getBool('interface_mod_new_tor_seeds', true);
          
      var css = '';
      
      // Якщо налаштування вимкнені, додаємо CSS, який "скидає" стилі
      if (!eb) css += '.torrent-item__bitrate span.low-bitrate, .torrent-item__bitrate span.medium-bitrate, .torrent-item__bitrate span.high-bitrate{ color: inherit !important; font-weight: inherit !important; }\n';
      if (!es) css += '.torrent-item__seeds span.low-seeds, .torrent-item__seeds span.medium-seeds, .torrent-item__seeds span.high-seeds{ color: inherit !important; font-weight: inherit !important; }\n';
      if (!ef) css += '.torrent-item.low-seeds, .torrent-item.medium-seeds, .torrent-item.high-seeds{ border: none !important; }\n';
      
      s.textContent = css;
    }
    
    // Робимо функцію глобальною, щоб її міг викликати основний плагін
    window.runTorrentStyleRefresh = apply;
    setTimeout(apply, 0); // Перший запуск
  })();

  /* BEGIN torrents+mod */
  (function () {
    try {
      (function () {
        // ===================== КОНФІГУРАЦІЯ ПРАПОРЦЯ =====================
        const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

        // ===================== СИСТЕМА ТЕКСТОВИХ ЗАМІН =====================
        const REPLACEMENTS = [
          ['Uaflix', 'UaFlix'],
          ['Zetvideo', 'UaFlix'],
          ['Нет истории просмотра', 'Історія перегляду відсутня'],
          ['Дублированный', 'Дубльований'],
          ['Дубляж', 'Дубльований'],
          ['Многоголосый', 'багатоголосий'],
          ['многоголосый', 'багатоголосий'],
          ['двухголосый', 'двоголосий'],
          ['Украинский', UKRAINE_FLAG_SVG + ' Українською'],
          ['Український', UKRAINE_FLAG_SVG + ' Українською'],
          ['Украинская', UKRAINE_FLAG_SVG + ' Українською'],
          ['Українська', UKRAINE_FLAG_SVG + ' Українською'],
          ['1+1', UKRAINE_FLAG_SVG + ' 1+1'],
          {
            pattern: /\bUkr\b/gi,
            replacement: UKRAINE_FLAG_SVG + ' Українською',
            condition: (text) => !text.includes('flag-container')
          },
          {
            pattern: /\bUa\b/gi,
            replacement: UKRAINE_FLAG_SVG + ' UA',
            condition: (text) => !text.includes('flag-container')
          }
        ];

        // ===================== СИСТЕМА СТИЛІВ ДЛЯ ПРАПОРЦЯ =====================
        const FLAG_STYLES = `
          .flag-container {
              display: inline-flex;
              align-items: center;
              vertical-align: middle;
              height: 1.27em;
              margin-left: 3px;
          }
          .flag-svg {
              display: inline-block;
              vertical-align: middle;
              margin-right: 2px;
              margin-top: -5.5px;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              border: 1px solid rgba(0,0,0,0.15);
              width: 22.56px;
              height: 17.14px;
          }
          @media (max-width: 767px) {
              .flag-svg {
                  width: 16.03px;
                  height: 12.19px;
                  margin-right: 1px;
                  margin-top: -4px;
              }
          }
          .flag-container ~ span,
          .flag-container + * {
              vertical-align: middle;
          }
          .ua-flag-processed {
              position: relative;
          }
          .filter-item .flag-svg,
          .selector-item .flag-svg,
          .dropdown-item .flag-svg,
          .voice-option .flag-svg,
          .audio-option .flag-svg {
              margin-right: 1px;
              margin-top: -2px;
              width: 18.05px;
              height: 13.54px;
          }
          @media (max-width: 767px) {
              .filter-item .flag-svg,
              .selector-item .flag-svg,
              .dropdown-item .flag-svg,
              .voice-option .flag-svg,
              .audio-option .flag-svg {
                  width: 11.97px;
                  height: 8.98px;
                  margin-right: 0px;
                  margin-top: -1px;
              }
          }
          .online-prestige__description,
          .video-description,
          [class*="description"],
          [class*="info"] {
              line-height: 1.5;
          }
      `;

        // ===================== СИСТЕМА КОЛЬОРОВИХ ІНДИКАТОРІВ =====================
        const STYLES = {
          '.torrent-item__seeds span.low-seeds': {
            color: '#e74c3c',
            'font-weight': 'bold'
          },
          '.torrent-item__seeds span.medium-seeds': {
            color: '#ffff00',
            'font-weight': 'bold'
          },
          '.torrent-item__seeds span.high-seeds': {
            color: '#2ecc71',
            'font-weight': 'bold'
          },
          '.torrent-item.low-seeds': {
            'border': '2px solid rgba(231, 76, 60, 0.6)',
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item.medium-seeds': {
            'border': '2px solid rgba(255, 255, 0, 0.6)',
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item.high-seeds': {
            'border': '2px solid rgba(46, 204, 113, 0.6)',
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item__bitrate span.low-bitrate': {
            color: '#ffff00',
            'font-weight': 'bold'
          },
          '.torrent-item__bitrate span.medium-bitrate': {
            color: '#2ecc71',
            'font-weight': 'bold'
          },
          '.torrent-item__bitrate span.high-bitrate': {
            color: '#e74c3c',
            'font-weight': 'bold'
          },
          '.torrent-item__tracker.utopia': {
            color: '#9b59b6',
            'font-weight': 'bold'
          },
          '.torrent-item__tracker.toloka': {
            color: '#3498db',
            'font-weight': 'bold'
          },
          '.torrent-item__tracker.mazepa': {
            color: '#C9A0DC',
            'font-weight': 'bold'
          }
        };

        // ===================== ІНІЦІАЛІЗАЦІЯ СТИЛІВ =====================
        let style = document.createElement('style');
        style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
          return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
        }).join('\n');
        document.head.appendChild(style);

        // ===================== СИСТЕМА ЗАМІНИ ТЕКСТУ ДЛЯ ФІЛЬТРІВ =====================
        const UKRAINIAN_STUDIOS = [
          'DniproFilm', 'Дніпрофільм', 'Цікава Ідея', 'Колодій Трейлерів',
          'UaFlix', 'BaibaKo', 'В одне рило', 'Так Треба Продакшн',
          'TreleMore', 'Гуртом', 'Exit Studio', 'FilmUA', 'Novator Film',
          'LeDoyen', 'Postmodern', 'Pryanik', 'CinemaVoice', 'UkrainianVoice'
        ];

        function processVoiceFilters() {
          const voiceFilterSelectors = [
            '[data-type="voice"]', '[data-type="audio"]',
            '.voice-options', '.audio-options',
            '.voice-list', '.audio-list',
            '.studio-list', '.translation-filter', '.dubbing-filter'
          ];

          voiceFilterSelectors.forEach(selector => {
            try {
              const filters = document.querySelectorAll(selector);
              filters.forEach(filter => {
                if (filter.classList.contains('ua-voice-processed')) return;

                let html = filter.innerHTML;
                let changed = false;

                UKRAINIAN_STUDIOS.forEach(studio => {
                  if (html.includes(studio) && !html.includes(UKRAINE_FLAG_SVG)) {
                    html = html.replace(new RegExp(studio, 'g'), UKRAINE_FLAG_SVG + ' ' + studio);
                    changed = true;
                  }
                });

                if (html.includes('Українська') && !html.includes(UKRAINE_FLAG_SVG)) {
                  html = html.replace(/Українська/g, UKRAINE_FLAG_SVG + ' Українська');
                  changed = true;
                }
                if (html.includes('Украинская') && !html.includes(UKRAINE_FLAG_SVG)) {
                  html = html.replace(/Украинская/g, UKRAINE_FLAG_SVG + ' Українська');
                  changed = true;
                }
                if (html.includes('Ukr') && !html.includes(UKRAINE_FLAG_SVG)) {
                  html = html.replace(/Ukr/gi, UKRAINE_FLAG_SVG + ' Українською');
                  changed = true;
                }

                if (changed) {
                  filter.innerHTML = html;
                  filter.classList.add('ua-voice-processed');

                  filter.querySelectorAll('svg').forEach(svg => {
                    if (!svg.closest('.flag-container')) {
                      svg.classList.add('flag-svg');
                      const wrapper = document.createElement('span');
                      wrapper.className = 'flag-container';
                      svg.parentNode.insertBefore(wrapper, svg);
                      wrapper.appendChild(svg);
                    }
                  });
                }
              });
            } catch (error) {
              console.warn('Помилка обробки фільтрів озвучення:', error);
            }
          });
        }

        // ===================== ОПТИМІЗОВАНА СИСТЕМА ЗАМІНИ ТЕКСТУ =====================
        function replaceTexts() {
          const safeContainers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info',
            '.online-prestige__description',
            '.video-description',
            '.content__description',
            '.movie-info',
            '.series-info'
          ];

          const processSafeElements = () => {
            
            // [!!!] OPTIMIZATION: Combine selectors into one query
            const selectors = safeContainers.map(s => s + ':not(.ua-flag-processed)').join(', ');
            
            try {
              const elements = document.querySelectorAll(selectors);
              elements.forEach(element => {
                if (element.closest('.hidden, [style*="display: none"]')) return;

                let html = element.innerHTML;
                let changed = false;

                REPLACEMENTS.forEach(item => {
                  if (Array.isArray(item)) {
                    if (html.includes(item[0]) && !html.includes(UKRAINE_FLAG_SVG)) {
                      html = html.replace(new RegExp(item[0], 'g'), item[1]);
                      changed = true;
                    }
                  } else if (item.pattern) {
                    if ((!item.condition || item.condition(html)) && item.pattern.test(html) && !html.includes(UKRAINE_FLAG_SVG)) {
                      html = html.replace(item.pattern, item.replacement);
                      changed = true;
                    }
                  }
                });

                if (changed) {
                  element.innerHTML = html;
                  element.classList.add('ua-flag-processed');

                  element.querySelectorAll('svg').forEach(svg => {
                    if (!svg.closest('.flag-container')) {
                      svg.classList.add('flag-svg');
                      const wrapper = document.createElement('span');
                      wrapper.className = 'flag-container';
                      svg.parentNode.insertBefore(wrapper, svg);
                      wrapper.appendChild(svg);

                      if (svg.nextSibling && svg.nextSibling.nodeType === 3) {
                        wrapper.appendChild(svg.nextSibling);
                      }
                    }
                  });
                }
              });
            } catch (error) {
              console.warn('Помилка обробки селекторів:', error);
            }
          };

          const startTime = Date.now();
          const TIME_LIMIT = 50;

          processSafeElements();

          if (Date.now() - startTime < TIME_LIMIT) {
            processVoiceFilters();
          }
        }

        // ===================== СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРЕНТІВ =====================
        function updateTorrentStyles() {
          const visibleElements = {
            seeds: document.querySelectorAll('.torrent-item__seeds span:not([style*="display: none"])'),
            bitrate: document.querySelectorAll('.torrent-item__bitrate span:not([style*="display: none"])'),
            tracker: document.querySelectorAll('.torrent-item__tracker:not([style*="display: none"])')
          };

          if (visibleElements.seeds.length > 0) {
            visibleElements.seeds.forEach(span => {
              const seeds = parseInt(span.textContent) || 0;
              const torrentItem = span.closest('.torrent-item');

              span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
              if (torrentItem) {
                torrentItem.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
              }

              if (seeds <= 4) {
                span.classList.add('low-seeds');
                if (torrentItem) torrentItem.classList.add('low-seeds');
              } else if (seeds <= 14) {
                span.classList.add('medium-seeds');
                if (torrentItem) torrentItem.classList.add('medium-seeds');
              } else {
                span.classList.add('high-seeds');
                if (torrentItem) torrentItem.classList.add('high-seeds');
              }
            });
          }

          if (visibleElements.bitrate.length > 0) {
            visibleElements.bitrate.forEach(span => {
              const bitrate = parseFloat(span.textContent) || 0;
              span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');

              if (bitrate <= 10) {
                span.classList.add('low-bitrate');
              } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate');
              } else {
                span.classList.add('high-bitrate');
              }
            });
          }

          if (visibleElements.tracker.length > 0) {
            visibleElements.tracker.forEach(tracker => {
              const text = tracker.textContent.trim().toLowerCase();
              tracker.classList.remove('utopia', 'toloka', 'mazepa');

              if (text.includes('utopia')) tracker.classList.add('utopia');
              else if (text.includes('toloka')) tracker.classList.add('toloka');
              else if (text.includes('mazepa')) tracker.classList.add('mazepa');
            });
          }
        }

        // ===================== ОСНОВНА ФУНКЦІЯ ОНОВЛЕННЯ =====================
        function updateAll() {
          try {
            replaceTexts();
            updateTorrentStyles();
          } catch (error) {
            console.warn('Помилка оновлення:', error);
          }
        }

        // ===================== ОПТИМІЗОВАНА СИСТЕМА СПОСТЕРЕЖЕННЯ =====================
        let updateTimeout = null;
        const observer = new MutationObserver(mutations => {
          const hasImportantChanges = mutations.some(mutation => {
            return mutation.addedNodes.length > 0 &&
              !mutation.target.closest('.hidden, [style*="display: none"]');
          });

          if (hasImportantChanges) {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateAll, 250);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false
        });

        setTimeout(updateAll, 1000);
      })();
    } catch (e) {
      try {
        console.error('torrents+mod error', e);
      } catch (_e) {}
    }
  })();
  /* END torrents+mod ==== */

  /* ============================================================
   * ЗАПУСК
   * ============================================================ */
  function startPlugin() {
    injectFallbackCss();
    initInterfaceModSettingsUI();
    newInfoPanel();
    setupVoteColorsObserver();

    if (settings.colored_ratings) updateVoteColors();

    setStatusBaseCssEnabled(settings.colored_status);
    if (settings.colored_status) enableStatusColoring();
    else disableStatusColoring(true);

    setAgeBaseCssEnabled(settings.colored_age);
    if (settings.colored_age) enableAgeColoring();
    else disableAgeColoring(true);

    // Ініціалізуємо функціонал кнопки перезавантаження
    updateReloadButton();
    
    // Ініціалізуємо функціонал логотипів
    initLogosInsteadOfTitles();

    // Ініціалізуємо теми
    window.__ifx_first_theme_apply = true;
    applyTheme(settings.theme);
    applyAnimations();
    applyForAll();
    removeFromSettingsMenu();
    fixLang();

    wireFullCardEnhancers();

    if (settings.colored_buttons) {
      // Запускаємо стратегію завантаження останнім
      loadAsLast();
    }
    
    // Застосовуємо розмір кнопок
    applyButtonSize();
    
    // Застосовуємо режим відображення логотипів
    applyLogoDisplayMode();
    
    // Ініціалізація рейтингів
    ensureDefaultToggles();
    attachLiveSettingsHandlers();
    window.LampaRatings = window.LampaRatings || {};
    window.LampaRatings.applyStyles = applyRatingsStyles;
    window.LampaRatings.getConfig = getRatingsCfg;
    applyRatingsStyles();
    
    if (!window.combined_ratings_plugin) {
      startRatingsPlugin();
    }
    
    // Перший запуск стилів торентів
    try {
      if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
    } catch (e) {}
  }

  // Запуск плагіну при готовності Lampa
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }

})();
