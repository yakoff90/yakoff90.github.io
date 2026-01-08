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
   * Об'єкт з поточними налаштуваннями плагіну
   */
  var settings = {
    info_panel: getBool('interface_mod_new_info_panel', true),
    colored_ratings: getBool('interface_mod_new_colored_ratings', false),
    colored_status: getBool('interface_mod_new_colored_status', false),
    colored_age: getBool('interface_mod_new_colored_age', false),

    en_data: getOriginalTitleEnabled(),
    all_buttons: getBool('interface_mod_new_all_buttons', false),
    icon_only: getBool('interface_mod_new_icon_only', false),
    colored_buttons: getBool('interface_mod_new_colored_buttons', false),
    button_size: (Lampa.Storage.get('interface_mod_new_button_size', 'normal') || 'normal'),

    // Налаштування для torrents+mod
    tor_frame: getBool('interface_mod_new_tor_frame', true),
    tor_bitrate: getBool('interface_mod_new_tor_bitrate', true),
    tor_seeds: getBool('interface_mod_new_tor_seeds', true),

    // Налаштування тем (з themes_ua_loader.js)
    theme: Lampa.Storage.get('interface_mod_new_theme', 'mint_dark'),
    animations: getBool('interface_mod_new_animations', true),

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
    `;
    var st = document.createElement('style');
    st.id = 'interface_mod_base';
    st.textContent = css;
    document.head.appendChild(st);
  })();

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
})();
