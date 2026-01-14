[file name]: rating_my_ap.js
[file content begin]
/**
 * Lampa: Enhanced Ratings (MDBList + OMDb)
 * --------------------------------------------------------
 * - Працює на старих WebView: локальні шими/поліфіли (localStorage, Promise, fetch, DOM-методи)
 * - Бере рейтинги з MDBList (+ OMDb для віку/нагород) і малює їх у деталці
 * - Адаптовано для Applecation: відображає рейтинги у картці перед описом фільму
 * - Має секцію налаштувань "Рейтинги", живе застосування стилів без перезавантаження
 */

(function() {
  'use strict';

  /*
  |==========================================================================
  | 1. ШИМИ / ПОЛІФІЛИ
  | (Для старих Android Webview)
  |==========================================================================
  */

  // localStorage shim
  (function() {
    var ok = true;
    try {
      var t = '__lmp_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
    } catch (e) {
      ok = false;
    }

    if (!ok) {
      var mem = {};
      window.localStorage = {
        getItem: function(k) {
          return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
        },
        setItem: function(k, v) {
          mem[k] = String(v);
        },
        removeItem: function(k) {
          delete mem[k];
        },
        clear: function() {
          mem = {};
        }
      };
    }
  })();

  // Promise polyfill
  (function(global) {
    if (global.Promise) return;
    var PENDING = 0,
      FULFILLED = 1,
      REJECTED = 2;

    function asap(fn) {
      setTimeout(fn, 0);
    }

    function MiniPromise(executor) {
      if (!(this instanceof MiniPromise)) return new MiniPromise(executor);
      var self = this;
      self._state = PENDING;
      self._value = void 0;
      self._handlers = [];

      function resolve(value) {
        if (self._state !== PENDING) return;
        if (value && (typeof value === 'object' || typeof value === 'function')) {
          var then;
          try {
            then = value.then;
          } catch (e) {
            return reject(e);
          }
          if (typeof then === 'function') return then.call(value, resolve, reject);
        }
        self._state = FULFILLED;
        self._value = value;
        finale();
      }

      function reject(reason) {
        if (self._state !== PENDING) return;
        self._state = REJECTED;
        self._value = reason;
        finale();
      }

      function finale() {
        asap(function() {
          var q = self._handlers;
          self._handlers = [];
          for (var i = 0; i < q.length; i++) handle(q[i]);
        });
      }

      function handle(h) {
        if (self._state === PENDING) {
          self._handlers.push(h);
          return;
        }
        var cb = self._state === FULFILLED ? h.onFulfilled : h.onRejected;
        if (!cb) {
          (self._state === FULFILLED ? h.resolve : h.reject)(self._value);
          return;
        }
        try {
          var ret = cb(self._value);
          h.resolve(ret);
        } catch (e) {
          h.reject(e);
        }
      }
      this.then = function(onFulfilled, onRejected) {
        return new MiniPromise(function(resolve, reject) {
          handle({
            onFulfilled: onFulfilled,
            onRejected: onRejected,
            resolve: resolve,
            reject: reject
          });
        });
      };
      this.catch = function(onRejected) {
        return this.then(null, onRejected);
      };
      try {
        executor(resolve, reject);
      } catch (e) {
        reject(e);
      }
    }
    MiniPromise.resolve = function(v) {
      return new MiniPromise(function(res) {
        res(v);
      });
    };
    MiniPromise.reject = function(r) {
      return new MiniPromise(function(_, rej) {
        rej(r);
      });
    };
    MiniPromise.all = function(arr) {
      return new MiniPromise(function(resolve, reject) {
        if (!arr || !arr.length) return resolve([]);
        var out = new Array(arr.length),
          left = arr.length;
        for (var i = 0; i < arr.length; i++)(function(i) {
          MiniPromise.resolve(arr[i]).then(function(v) {
            out[i] = v;
            if (--left === 0) resolve(out);
          }, reject);
        })(i);
      });
    };
    global.Promise = MiniPromise;
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

  // fetch polyfill
  (function(global) {
    if (global.fetch) return;

    function Response(body, init) {
      this.status = init && init.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this._body = body == null ? '' : String(body);
      this.headers = (init && init.headers) || {};
    }
    Response.prototype.text = function() {
      var self = this;
      return Promise.resolve(self._body);
    };
    Response.prototype.json = function() {
      var self = this;
      return Promise.resolve().then(function() {
        return JSON.parse(self._body || 'null');
      });
    };

    global.fetch = function(input, init) {
      init = init || {};
      var url = (typeof input === 'string') ? input : (input && input.url) || '';
      var method = (init.method || 'GET').toUpperCase();
      var headers = init.headers || {};
      var body = init.body || null;

      if (global.Lampa && Lampa.Reguest) {
        return new Promise(function(resolve) {
          new Lampa.Reguest().native(
            url,
            function(data) {
              var text = (typeof data === 'string') ? data : (data != null ? JSON.stringify(data) : '');
              resolve(new Response(text, {
                status: 200,
                headers: headers
              }));
            },
            function() {
              resolve(new Response('', {
                status: 500,
                headers: headers
              }));
            },
            false, {
              dataType: 'text',
              method: method,
              headers: headers,
              data: body
            }
          );
        });
      }

      return new Promise(function(resolve, reject) {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open(method, url, true);
          for (var k in headers) {
            if (Object.prototype.hasOwnProperty.call(headers, k)) xhr.setRequestHeader(k, headers[k]);
          }
          xhr.onload = function() {
            resolve(new Response(xhr.responseText, {
              status: xhr.status,
              headers: headers
            }));
          };
          xhr.onerror = function() {
            reject(new TypeError('Network request failed'));
          };
          xhr.send(body);
        } catch (e) {
          reject(e);
        }
      });
    };
  })(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));

})();

(function() {
  'use strict';

  /*
  |==========================================================================
  | 1. ШИМИ / ПОЛІФІЛИ
  | (Для старих Android Webview)
  |==========================================================================
  */

  // NodeList.forEach
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  // Element.matches
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(selector) {
        var node = this;
        var nodes = (node.parentNode || document).querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === node) return true;
        }
        return false;
      };
  }

  // Element.closest
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
      var el = this;
      while (el && el.nodeType === 1) {
        if (el.matches(selector)) return el;
        el = el.parentElement || el.parentNode;
      }
      return null;
    };
  }

  /*
  |==========================================================================
  | 2. КОНСТАНТИ ТА КОНФІГУРАЦІЯ
  |==========================================================================
  */

  /**
   * Конфігурація API ключів
   */
  var LMP_ENH_CONFIG = {
    apiKeys: {
      mdblist: 'nmqhlb9966w9m86h3yntb0dpz',
      omdb: '358837db'
    }
  };

  /**
   * Джерела іконок
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
   * Локалізація (Переклади)
   */
  Lampa.Lang.add({
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

  /**
   * CSS стилі плагіну - адаптовано для Applecation
   */
  var pluginStyles = "<style>" +
    /* --- Загальні стилі --- */
    ".full-start-new.applecation .full-start-new__rate-line {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    flex-wrap: wrap !important;" +
    "    gap: 0.8em !important;" +
    "    margin-bottom: 0.5em !important;" +
    "    opacity: 0 !important;" +
    "    transform: translateY(15px) !important;" +
    "    transition: opacity 0.4s ease-out, transform 0.4s ease-out !important;" +
    "}" +
    
    ".full-start-new.applecation .full-start-new__rate-line.show {" +
    "    opacity: 1 !important;" +
    "    transform: translateY(0) !important;" +
    "}" +
    
    /* --- Стилі для рейтингів у Applecation --- */
    ".full-start-new.applecation .applecation__ratings {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    flex-wrap: wrap !important;" +
    "    gap: 0.8em !important;" +
    "    margin-bottom: 0.5em !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .full-start__rate {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    gap: 0.35em !important;" +
    "    font-size: 0.95em !important;" +
    "    font-weight: 600 !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .source--name {" +
    "    display: flex !important;" +
    "    align-items: center !important;" +
    "    justify-content: center !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .source--name img {" +
    "    width: auto !important;" +
    "    height: var(--lmp-h-default, 1.8em) !important;" +
    "    object-fit: contain !important;" +
    "}" +
    
    /* --- Специфічні висоти іконок --- */
    ".full-start-new.applecation .rate--imdb .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--kp .source--name img { height: 1.5em !important; }" +
    ".full-start-new.applecation .rate--tmdb .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--mc .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--rt .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--popcorn .source--name img { height: 1.8em !important; }" +
    ".full-start-new.applecation .rate--avg .source--name img { height: 1.4em !important; }" +
    ".full-start-new.applecation .rate--oscars .source--name img," +
    ".full-start-new.applecation .rate--emmy .source--name img," +
    ".full-start-new.applecation .rate--awards .source--name img { height: 1.4em !important; }" +
    
    /* --- Кольоровий режим --- */
    ".rate--oscars, .rate--emmy, .rate--awards, .rate--gold {" +
    "    color: gold !important;" +
    "}" +
    
    /* --- Кольори оцінок --- */
    ".full-start-new.applecation .applecation__ratings .full-start__rate.rating--green," +
    ".full-start-new .full-start__rate.rating--green {" +
    "    color: #2ecc71 !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .full-start__rate.rating--blue," +
    ".full-start-new .full-start__rate.rating--blue {" +
    "    color: #60a5fa !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .full-start__rate.rating--orange," +
    ".full-start-new .full-start__rate.rating--orange {" +
    "    color: #f59e0b !important;" +
    "}" +
    
    ".full-start-new.applecation .applecation__ratings .full-start__rate.rating--red," +
    ".full-start-new .full-start__rate.rating--red {" +
    "    color: #ef4444 !important;" +
    "}" +
    
    /* --- Стиль для білого кольору коли кольоровий режим вимкнений --- */
    ".full-start-new.applecation .applecation__ratings .full-start__rate {" +
    "    color: #fff !important;" +
    "}" +
    
    /* --- Важливо! Приховування рейтингів коли Applecation вимкнено --- */
    "body.applecation--hide-ratings .full-start-new.applecation .applecation__ratings {" +
    "    display: none !important;" +
    "}" +
    
    /* --- Лоадер "Пошук..." --- */
    ".loading-dots-container {" +
    "    display: flex;" +
    "    align-items: center;" +
    "    font-size: 0.85em;" +
    "    color: #ccc;" +
    "    padding: 0.6em 1em;" +
    "    border-radius: 0.5em;" +
    "}" +
    ".loading-dots__text {" +
    "    margin-right: 1em;" +
    "}" +
    ".loading-dots__dot {" +
    "    width: 0.5em;" +
    "    height: 0.5em;" +
    "    border-radius: 50%;" +
    "    background-color: currentColor;" +
    "    animation: loading-dots-bounce 1.4s infinite ease-in-out both;" +
    "}" +
    ".loading-dots__dot:nth-child(1) {" +
    "    animation-delay: -0.32s;" +
    "}" +
    ".loading-dots__dot:nth-child(2) {" +
    "    animation-delay: -0.16s;" +
    "}" +
    "@keyframes loading-dots-bounce {" +
    "    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }" +
    "    40% { transform: translateY(-0.5em); opacity: 1; }" +
    "}" +
    
    /* --- Приховування під час завантаження --- */
    ".full-start-new__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader)," +
    ".full-start__rate-line.lmp-is-loading-ratings > :not(#lmp-search-loader) {" +
    "    opacity: 0 !important;" +
    "    pointer-events: none !important;" +
    "    transition: opacity 0.15s;" +
    "}" +
    
    /* --- Вирівнювання іконок нагород --- */
    ".lmp-award-icon{" +
    "  display:inline-flex;" +
    "  align-items:center;" +
    "  justify-content:center;" +
    "  line-height:1;" +
    "  height:auto;" +
    "  width:auto;" +
    "  flex-shrink:0;" +
    "}" +
    ".lmp-award-icon img{" +
    "  height:auto;" +
    "  width:auto;" +
    "  display:block;" +
    "  object-fit:contain;" +
    "}" +
    
    /* --- Приховування стандартного рейтингу Кінопошуку --- */
    ".full-start__rate.rate--kp, .rate--kp{display:none!important;}" +
    
    /* --- Адаптив (Mobile) --- */
    "@media (max-width: 600px){" +
    "  .full-start-new.applecation .applecation__ratings {" +
    "    gap: 0.5em !important;" +
    "  }" +
    "  .full-start-new.applecation .applecation__ratings .full-start__rate {" +
    "    font-size: 0.85em !important;" +
    "  }" +
    "}" +
    "</style>";

  /**
   * Налаштування кешу
   */
  var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;
  var RATING_CACHE_KEY = 'lmp_enh_rating_cache';
  var ID_MAPPING_CACHE = 'lmp_rating_id_cache';

  /**
   * Мапінг вікових рейтингів
   */
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
   * Налаштування за замовчуванням
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

  /*
  |==========================================================================
  | 3. ДОПОМІЖНІ ФУНКЦІЇ (HELPERS)
  |==========================================================================
  */

  var __lmpRateLineObs = null;
  var currentRatingsData = null;
  var __lmpLastReqToken = null;

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
    if (isNaN(r)) return '';
    if (r >= 8.0) return 'rating--green';
    if (r >= 6.0) return 'rating--blue';
    if (r >= 4.0) return 'rating--orange';
    return 'rating--red';
  }

  /**
   * Застосовує кольорові класи до всіх рейтингів
   */
  function applyRatingColorsToAll() {
    var cfg = getCfg();
    if (!cfg.colorizeAll) {
      // Вимикаємо кольори - видаляємо всі кольорові класи
      var ratingsContainer = $('.applecation__ratings');
      if (ratingsContainer.length) {
        ratingsContainer.find('.full-start__rate').removeClass('rating--green rating--blue rating--orange rating--red');
      }
      return;
    }
    
    var ratingsContainer = $('.applecation__ratings');
    if (!ratingsContainer.length) return;
    
    // Знаходимо всі рейтинги (крім нагород)
    var ratingElements = $('.full-start__rate:not(.rate--oscars):not(.rate--emmy):not(.rate--awards)', ratingsContainer);
    
    ratingElements.each(function() {
      var $element = $(this);
      // Знаходимо числове значення рейтингу
      var ratingText = $element.find('div:first-child').text().trim();
      var ratingValue = parseFloat(ratingText);
      
      if (!isNaN(ratingValue)) {
        // Видаляємо попередні кольорові класи
        $element.removeClass('rating--green rating--blue rating--orange rating--red');
        // Додаємо правильний клас
        $element.addClass(getRatingClass(ratingValue));
      }
    });
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

    // Для Applecation шукаємо блок з рейтингами
    var rateLine = $('.applecation__ratings', render).first();
    if (rateLine.length) {
      rateLine.append(loaderHtml);
      dimRateLine(rateLine);
      return;
    }

    var fake = $(
      '<div class="applecation__ratings" ' +
      '     id="lmp-loader-fake" data-lmp-fake="1" ' +
      '     style="min-height:28px; display:flex; align-items:center;"></div>'
    );

    var anchor = $('.applecation__meta', render).first();
    if (anchor.length) anchor.after(fake);
    else $(render).append(fake);

    fake.append(loaderHtml);

    try {
      if (__lmpRateLineObs) __lmpRateLineObs.disconnect();
    } catch (_) {}
    __lmpRateLineObs = new MutationObserver(function() {
      var rl = $('.applecation__ratings', render).first();
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

    var rl = $('.applecation__ratings', render).first();
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
          render[0].querySelector('.applecation__ratings') ||
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
      el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;padding:.6rem 1em;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
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

  /*
  |==========================================================================
  | 4. МЕРЕЖА (NETWORK)
  |==========================================================================
  */

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

  /*
  |==========================================================================
  | 5. ОБ'ЄДНАННЯ ДАНИХ (MERGE)
  |==========================================================================
  */

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

  /*
  |==========================================================================
  | 6. РЕНДЕР (RENDER) - АДАПТОВАНО ДЛЯ APPLECATION
  |==========================================================================
  */

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
  }

  /**
   * Застосовує "золотий" колір до нагород
   */
  function applyAwardsColor(rateLine, cfg) {
    var $tiles = rateLine.find('.rate--awards, .rate--oscars, .rate--emmy');
    $tiles.removeClass('rating--green rating--blue rating--orange rating--red');

    if (cfg && cfg.showAwards) {
      $tiles.addClass('rate--gold');
    } else {
      $tiles.removeClass('rate--gold');
    }
  }

  /**
   * Створює або знаходить контейнер для рейтингів у Applecation
   */
  function getApplecationRatingsContainer() {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return null;
    
    // Шукаємо існуючий контейнер для рейтингів у Applecation
    var ratingsContainer = $('.applecation__ratings', render);
    
    // Якщо контейнера немає, створюємо його
    if (!ratingsContainer.length) {
      // Шукаємо місце для вставки (після мета-інформації)
      var metaContainer = $('.applecation__meta', render);
      if (metaContainer.length) {
        ratingsContainer = $('<div class="applecation__ratings"></div>');
        metaContainer.after(ratingsContainer);
      } else {
        // Якщо мета-інформації немає, вставляємо після заголовка
        var titleContainer = $('.full-start-new__title', render);
        if (titleContainer.length) {
          ratingsContainer = $('<div class="applecation__ratings"></div>');
          titleContainer.after(ratingsContainer);
        }
      }
    }
    
    return ratingsContainer;
  }

  /**
   * Вставляє нові бейджі (MC, RT, Popcorn, Awards) у Applecation
   */
  function insertRatings(data) {
    var ratingsContainer = getApplecationRatingsContainer();
    if (!ratingsContainer || !ratingsContainer.length) return;

    var cfg = (typeof getCfg === 'function') ? getCfg() : {
      enableImdb: true,
      enableTmdb: true,
      enableMc: true,
      enableRt: true,
      enablePop: true,
      mcMode: 'meta',
      colorizeAll: false,
      showAwards: true
    };

    // Спочатку очищаємо всі старі рейтинги (крім завантажувача)
    ratingsContainer.find('.full-start__rate:not(#lmp-search-loader)').remove();

    // Додаємо іконку IMDb
    (function() {
      if (!cfg.enableImdb || !data.imdb_display) return;
      
      var imdbVal = data.imdb_for_avg ? parseFloat(data.imdb_for_avg) : null;
      var imdbText = imdbVal ? imdbVal.toFixed(1) : 'N/A';
      var colorClass = cfg.colorizeAll && imdbVal ? getRatingClass(imdbVal) : '';
      
      var imdbElement = $(
        '<div class="full-start__rate rate--imdb ' + colorClass + '">' +
        '<div>' + imdbText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      imdbElement.find('.source--name').html(iconImg(ICONS.imdb, 'IMDb', 22));
      
      ratingsContainer.append(imdbElement);
    })();

    // Додаємо іконку TMDB
    (function() {
      if (!cfg.enableTmdb || !data.tmdb_display) return;
      
      var tmdbVal = data.tmdb_for_avg ? parseFloat(data.tmdb_for_avg) : null;
      var tmdbText = tmdbVal ? tmdbVal.toFixed(1) : 'N/A';
      var colorClass = cfg.colorizeAll && tmdbVal ? getRatingClass(tmdbVal) : '';
      
      var tmdbElement = $(
        '<div class="full-start__rate rate--tmdb ' + colorClass + '">' +
        '<div>' + tmdbText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      tmdbElement.find('.source--name').html(iconImg(ICONS.tmdb, 'TMDB', 24));
      
      ratingsContainer.append(tmdbElement);
    })();

    // Додаємо Metacritic
    (function() {
      if (!cfg.enableMc) return;

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

      if (mcVal == null || isNaN(mcVal)) return;

      var mcText = mcVal.toFixed(1);
      var colorClass = cfg.colorizeAll ? getRatingClass(mcVal) : '';
      
      var mcElement = $(
        '<div class="full-start__rate rate--mc ' + colorClass + '">' +
        '<div>' + mcText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      mcElement.find('.source--name').html(iconImg(ICONS.metacritic, 'Metacritic', 22));

      ratingsContainer.append(mcElement);
    })();

    // Додаємо Rotten Tomatoes
    (function() {
      if (!cfg.enableRt) return;

      var rtVal = null;
      if (data.rt_for_avg && !isNaN(data.rt_for_avg)) rtVal = parseFloat(data.rt_for_avg);
      else if (data.rt_display && !isNaN(parseFloat(data.rt_display))) {
        var rtd = parseFloat(data.rt_display);
        rtVal = (rtd > 10) ? (rtd / 10) : rtd;
      }

      if (rtVal == null || isNaN(rtVal)) return;

      var rtText = rtVal.toFixed(1);
      var colorClass = cfg.colorizeAll ? getRatingClass(rtVal) : '';
      var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
      var extra = data.rt_fresh ? 'border-radius:4px;' : '';

      var rtElement = $(
        '<div class="full-start__rate rate--rt ' + colorClass + '">' +
        '<div>' + rtText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      rtElement.find('.source--name').html(iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra));

      ratingsContainer.append(rtElement);
    })();

    // Додаємо Popcorn
    (function() {
      if (!cfg.enablePop) return;

      var pcVal = null;
      if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) pcVal = parseFloat(data.popcorn_for_avg);
      else if (data.popcorn_display && !isNaN(parseFloat(data.popcorn_display))) {
        var pcd = parseFloat(data.popcorn_display);
        pcVal = (pcd > 10) ? (pcd / 10) : pcd;
      }

      if (pcVal == null || isNaN(pcVal)) return;

      var pcText = pcVal.toFixed(1);
      var colorClass = cfg.colorizeAll ? getRatingClass(pcVal) : '';
      
      var pcElement = $(
        '<div class="full-start__rate rate--popcorn ' + colorClass + '">' +
        '<div>' + pcText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      pcElement.find('.source--name').html(iconImg(ICONS.popcorn, 'Audience', 22));

      ratingsContainer.append(pcElement);
    })();

    // Додаємо нагороди ТІЛЬКИ якщо вони включені в налаштуваннях
    if (cfg.showAwards) {
      if (data.awards && data.awards > 0) {
        var awardsElement = $(
          '<div class="full-start__rate rate--awards rate--gold">' +
          '<div>' + data.awards + '</div>' +
          '<div class="source--name"></div>' +
          '</div>'
        );
        awardsElement.find('.source--name')
          .html(iconImg(ICONS.awards, 'Awards', 20))
          .attr('title', Lampa.Lang.translate('awards_other_label'));
        ratingsContainer.prepend(awardsElement);
      }

      if (data.emmy && data.emmy > 0) {
        var emmyElement = $(
          '<div class="full-start__rate rate--emmy rate--gold">' +
          '<div>' + data.emmy + '</div>' +
          '<div class="source--name"></div>' +
          '</div>'
        );
        emmyElement.find('.source--name')
          .html(emmyIconInline())
          .attr('title', Lampa.Lang.translate('emmy_label'));
        ratingsContainer.prepend(emmyElement);
      }

      if (data.oscars && data.oscars > 0) {
        var oscarsElement = $(
          '<div class="full-start__rate rate--oscars rate--gold">' +
          '<div>' + data.oscars + '</div>' +
          '<div class="source--name"></div>' +
          '</div>'
        );
        oscarsElement.find('.source--name')
          .html(oscarIconInline())
          .attr('title', Lampa.Lang.translate('oscars_label'));
        ratingsContainer.prepend(oscarsElement);
      }
    }

    try {
      applyAwardsColor(ratingsContainer, cfg);
    } catch (e) {}
  }

  /**
   * Розраховує та вставляє середній рейтинг (AVG) у Applecation
   */
  function calculateAverageRating(data) {
    var ratingsContainer = getApplecationRatingsContainer();
    if (!ratingsContainer || !ratingsContainer.length) {
      removeLoadingAnimation();
      return;
    }

    var cfg = (typeof getCfg === 'function') ? getCfg() : {
      enableImdb: true,
      enableTmdb: true,
      enableMc: true,
      enableRt: true,
      enablePop: true,
      colorizeAll: true,
      showAverage: true
    };

    $('.rate--avg', ratingsContainer).remove();
    if (!cfg.showAverage) {
      try {
        applyAwardsColor(ratingsContainer, cfg);
      } catch (e) {}
      removeLoadingAnimation();
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

    ratingsContainer.prepend(avgElement);

    try {
      applyAwardsColor(ratingsContainer, (typeof getCfg === 'function') ? getCfg() : null);
    } catch (e) {}

    removeLoadingAnimation();
    
    // Додаємо клас show для анімації появи
    ratingsContainer.addClass('show');
    
    // Застосовуємо кольори до всіх рейтингів
    if (cfg.colorizeAll) {
      setTimeout(applyRatingColorsToAll, 100);
    }
  }

  /*
  |==========================================================================
  | 7. ГОЛОВНИЙ ПРОЦЕС (Orchestrator)
  |==========================================================================
  */

  /**
   * Головна функція, що запускає весь процес
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

      applyStylesToAll();
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

  /*
  |==========================================================================
  | 8. НАЛАШТУВАННЯ (SETTINGS)
  |==========================================================================
  */

  /**
   * Отримує актуальні налаштування з Lampa.Storage
   */
  function getCfg() {
    var showAwards = !!Lampa.Storage.field('ratings_show_awards', RCFG_DEFAULT.ratings_show_awards);
    var showAverage = !!Lampa.Storage.field('ratings_show_average', RCFG_DEFAULT.ratings_show_average);
    var colorizeAll = !!Lampa.Storage.field('ratings_colorize_all', RCFG_DEFAULT.ratings_colorize_all);
    var enIMDB = !!Lampa.Storage.field('ratings_enable_imdb', RCFG_DEFAULT.ratings_enable_imdb);
    var enTMDB = !!Lampa.Storage.field('ratings_enable_tmdb', RCFG_DEFAULT.ratings_enable_tmdb);
    var enMC = !!Lampa.Storage.field('ratings_enable_mc', RCFG_DEFAULT.ratings_enable_mc);
    var enRT = !!Lampa.Storage.field('ratings_enable_rt', RCFG_DEFAULT.ratings_enable_rt);
    var enPopcorn = !!Lampa.Storage.field('ratings_enable_popcorn', RCFG_DEFAULT.ratings_enable_popcorn);

    return {
      showAwards: showAwards,
      showAverage: showAverage,
      colorizeAll: colorizeAll,
      enableImdb: enIMDB,
      enableTmdb: enTMDB,
      enableMc: enMC,
      enableRt: enRT,
      enablePop: enPopcorn
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
   * Увімкнення/вимкнення кольорового виділення
   */
  function toggleColorizeAll(colorizeAll) {
    var ratingsContainer = $('.applecation__ratings');
    if (!ratingsContainer.length) return;
    
    var ratingElements = $('.full-start__rate:not(.rate--oscars):not(.rate--emmy):not(.rate--awards)', ratingsContainer);
    
    if (colorizeAll) {
      // Додаємо кольорові класи до всіх рейтингів
      ratingElements.each(function() {
        var $element = $(this);
        var ratingText = $element.find('div:first-child').text().trim();
        var ratingValue = parseFloat(ratingText);
        
        if (!isNaN(ratingValue)) {
          $element.removeClass('rating--green rating--blue rating--orange rating--red');
          $element.addClass(getRatingClass(ratingValue));
        }
      });
    } else {
      // Видаляємо кольорові класи з усіх рейтингів
      ratingElements.removeClass('rating--green rating--blue rating--orange rating--red');
    }
  }

  /**
   * Головна функція стилізації
   */
  function applyStylesToAll() {
    var cfg = getCfg();
    toggleAwards(cfg.showAwards);
    toggleAverage(cfg.showAverage);
    toggleColorizeAll(cfg.colorizeAll);
    
    // Застосовуємо кольорові класи до нагород
    var awardsElements = $('.rate--oscars, .rate--emmy, .rate--awards');
    if (cfg.showAwards) {
      awardsElements.addClass('rate--gold');
    } else {
      awardsElements.removeClass('rate--gold');
    }
  }

  /**
   * Патч Lampa.Storage для миттєвого застосування стилів
   */
  function patchStorageSetOnce() {
    if (window.__lmpRatingsPatchedStorage) return;
    window.__lmpRatingsPatchedStorage = true;

    var _set = Lampa.Storage.set;
    Lampa.Storage.set = function(k, v) {
      var out = _set.apply(this, arguments);
      if (typeof k === 'string' && k.indexOf('ratings_') === 0) {
        setTimeout(function() {
          applyStylesToAll();
        }, 0);
      }
      return out;
    };
  }

  /**
   * Debounce-обробник для resize
   */
  var reapplyOnResize = (function() {
    var t;
    return function() {
      clearTimeout(t);
      t = setTimeout(function() {
        applyStylesToAll();
      }, 150);
    };
  })();

  /**
   * Встановлює дефолтні значення для тумблерів
   */
  function ensureDefaultToggles() {
    if (typeof Lampa.Storage.get('ratings_show_awards') === 'undefined') {
      Lampa.Storage.set('ratings_show_awards', true);
    }
    if (typeof Lampa.Storage.get('ratings_show_average') === 'undefined') {
      Lampa.Storage.set('ratings_show_average', true);
    }
    if (typeof Lampa.Storage.get('ratings_colorize_all') === 'undefined') {
      Lampa.Storage.set('ratings_colorize_all', false);
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
            if (typeof currentRatingsData === 'object' && currentRatingsData) {
              updateHiddenElements(currentRatingsData);
              insertRatings(currentRatingsData);
              calculateAverageRating(currentRatingsData);
            }
          } catch (e) {}
          applyStylesToAll();
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

    try {
      if (Lampa.SettingsApi && Lampa.SettingsApi.listener && Lampa.SettingsApi.listener.follow) {
        Lampa.SettingsApi.listener.follow('change', function(ev) {
          if (ev && ev.name && ev.name.indexOf('ratings_') === 0) scheduleApply();
        });
      }
    } catch (_) {}
  }

  /**
   * Реєструє секцію "Рейтинги" у налаштуваннях
   */
  function addSettingsSection() {
    if (window.lmp_ratings_add_param_ready) return;
    window.lmp_ratings_add_param_ready = true;

    Lampa.SettingsApi.addComponent({
      component: 'lmp_ratings',
      name: 'Рейтинги',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" ' +
        'fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 ' +
        '12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" ' +
        'stroke="currentColor" stroke-width="2" ' +
        'fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
        '</svg>'
    });

    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_show_awards',
        type: 'trigger',
        values: '',
        "default": RCFG_DEFAULT.ratings_show_awards
      },
      field: {
        name: 'Нагороди',
        description: 'Показувати Оскари, Еммі та інші нагороди.'
      },
      onRender: function(item) {}
    });

    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_show_average',
        type: 'trigger',
        values: '',
        "default": RCFG_DEFAULT.ratings_show_average
      },
      field: {
        name: 'Середній рейтинг',
        description: 'Показувати середній рейтинг'
      },
      onRender: function(item) {}
    });

    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_colorize_all',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_colorize_all
      },
      field: {
        name: 'Кольорові оцінки рейтингів',
        description: 'Кольорове виділення оцінок рейтингів'
      },
      onRender: function() {}
    });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_enable_imdb',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_imdb
      },
      field: {
        name: 'IMDb',
        description: 'Показувати/ховати джерело'
      }
    });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_enable_tmdb',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_tmdb
      },
      field: {
        name: 'TMDB',
        description: 'Показувати/ховати джерело'
      }
    });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_enable_mc',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_mc
      },
      field: {
        name: 'Metacritic',
        description: 'Показувати/ховати джерело'
      }
    });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_enable_rt',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_rt
      },
      field: {
        name: 'RottenTomatoes',
        description: 'Показувати/ховати джерело'
      }
    });
    
    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        name: 'ratings_enable_popcorn',
        type: 'trigger',
        "default": RCFG_DEFAULT.ratings_enable_popcorn
      },
      field: {
        name: 'Popcornmeter',
        description: 'Показувати/ховати джерело'
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'lmp_ratings',
      param: {
        type: 'button',
        component: 'lmp_clear_cache'
      },
      field: {
        name: 'Очистити кеш рейтингів'
      },
      onChange: function() {
        lmpRatingsClearCache();
      }
    });
  }

  /**
   * Ініціалізація UI налаштувань
   */
  function initRatingsPluginUI() {
    ensureDefaultToggles();
    addSettingsSection();
    patchStorageSetOnce();
    attachLiveSettingsHandlers();
    window.LampaRatings = window.LampaRatings || {};
    window.LampaRatings.applyStyles = applyStylesToAll;
    window.LampaRatings.getConfig = getCfg;
    applyStylesToAll();
  }

  /*
  |==========================================================================
  | 9. ЗАПУСК (LAUNCH)
  |==========================================================================
  */

  /**
   * Ініціалізація (основний слухач)
   */
  function startPlugin() {
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

  // --- Початок виконання коду ---

  Lampa.Template.add('lmp_enh_styles', pluginStyles);
  $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));

  initRatingsPluginUI();

  window.addEventListener('resize', reapplyOnResize);
  window.addEventListener('orientationchange', reapplyOnResize);

  if (!window.combined_ratings_plugin) {
    startPlugin();
  }

})();
[file content end]
