/**
 * Lampa: Enhanced Ratings (MDBList + OMDb) - Applecation Compatible
 * ----------------------------------------------------------------
 * - Працює з плагіном Applecation та інтерфейс +
 * - Бере рейтинги з MDBList (+ OMDb для віку/нагород) і малює їх у деталці
 * - Відображає оцінки перед описом фільму та виділяє кольором
 * - Автоматично виявляє та адаптується до Applecation
 */

(function() {
  'use strict';

  // Чекаємо готовності Lampa
  if (!window.Lampa) {
    setTimeout(arguments.callee, 100);
    return;
  }

  /*
  |==========================================================================
  | 1. ПОЛІФІЛИ ДЛЯ СТАРИХ WEBVIEW
  |==========================================================================
  */
  
  // localStorage shim
  if (typeof window.localStorage === 'undefined') {
    var localStorageMock = (function() {
      var store = {};
      return {
        getItem: function(key) {
          return store[key] || null;
        },
        setItem: function(key, value) {
          store[key] = String(value);
        },
        removeItem: function(key) {
          delete store[key];
        },
        clear: function() {
          store = {};
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: false
    });
  }

  // Promise polyfill для старих Android
  if (typeof Promise === 'undefined') {
    window.Promise = function(executor) {
      var self = this;
      self._state = 'pending';
      self._value = undefined;
      self._callbacks = [];

      function resolve(value) {
        if (self._state !== 'pending') return;
        self._state = 'fulfilled';
        self._value = value;
        self._callbacks.forEach(function(callback) {
          setTimeout(function() {
            callback.onFulfilled && callback.onFulfilled(value);
          }, 0);
        });
      }

      function reject(reason) {
        if (self._state !== 'pending') return;
        self._state = 'rejected';
        self._value = reason;
        self._callbacks.forEach(function(callback) {
          setTimeout(function() {
            callback.onRejected && callback.onRejected(reason);
          }, 0);
        });
      }

      this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
          var handle = function() {
            try {
              var result = self._state === 'fulfilled' 
                ? (onFulfilled ? onFulfilled(self._value) : self._value)
                : (onRejected ? onRejected(self._value) : Promise.reject(self._value));
              
              if (result instanceof Promise) {
                result.then(resolve, reject);
              } else {
                resolve(result);
              }
            } catch (error) {
              reject(error);
            }
          };

          if (self._state !== 'pending') {
            setTimeout(handle, 0);
          } else {
            self._callbacks.push({
              onFulfilled: onFulfilled,
              onRejected: onRejected
            });
          }
        });
      };

      this.catch = function(onRejected) {
        return this.then(null, onRejected);
      };

      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    };

    Promise.resolve = function(value) {
      return new Promise(function(resolve) {
        resolve(value);
      });
    };

    Promise.reject = function(reason) {
      return new Promise(function(_, reject) {
        reject(reason);
      });
    };
  }

  // fetch polyfill
  if (typeof window.fetch === 'undefined') {
    window.fetch = function(url, options) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(options && options.method || 'GET', url);
        
        if (options && options.headers) {
          for (var key in options.headers) {
            if (options.headers.hasOwnProperty(key)) {
              xhr.setRequestHeader(key, options.headers[key]);
            }
          }
        }
        
        xhr.onload = function() {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            text: function() {
              return Promise.resolve(xhr.responseText);
            },
            json: function() {
              try {
                return Promise.resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                return Promise.reject(e);
              }
            }
          });
        };
        
        xhr.onerror = function() {
          reject(new Error('Network request failed'));
        };
        
        xhr.send(options && options.body);
      });
    };
  }

  // Array.forEach для NodeList
  if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function(callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
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
      mdblist: 'nmqhlb9966w9m86h3yntb0dpz', // ключ до MDBList
      omdb: '358837db' // ключ до OMDb
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
   * Налаштування кешу
   */
  var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 дні
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
    ratings_colorize_all: true,
    ratings_enable_imdb: true,
    ratings_enable_tmdb: true,
    ratings_enable_mc: true,
    ratings_enable_rt: true,
    ratings_enable_popcorn: true
  };

  /*
  |==========================================================================
  | 3. ДОПОМІЖНІ ФУНКЦІЇ
  |==========================================================================
  */

  var currentRatingsData = null;
  var __lmpLastReqToken = null;

  /**
   * Безпечний доступ до Lampa API
   */
  function safeLampaGet(path, defaultValue) {
    try {
      var parts = path.split('.');
      var value = window;
      for (var i = 0; i < parts.length; i++) {
        if (value[parts[i]] === undefined) return defaultValue;
        value = value[parts[i]];
      }
      return value;
    } catch (e) {
      return defaultValue;
    }
  }

  /**
   * Визначає тип картки (movie/tv)
   */
  function getCardType(card) {
    if (!card) return 'movie';
    var type = card.media_type || card.type;
    if (type === 'movie' || type === 'tv') return type;
    return card.name || card.original_name ? 'tv' : 'movie';
  }

  /**
   * Перевіряє, чи використовується Applecation
   */
  function isApplecationActive() {
    try {
      var render = safeLampaGet('Lampa.Activity.active.activity.render', null);
      return render && render.hasClass && render.hasClass('applecation');
    } catch (e) {
      return false;
    }
  }

  /**
   * Повертає CSS-клас для кольору рейтингу
   */
  function getRatingClass(rating) {
    if (typeof rating !== 'number') {
      rating = parseFloat(rating);
      if (isNaN(rating)) return '';
    }
    
    if (rating >= 8.0) return 'lmp-rate--green';
    if (rating >= 6.0) return 'lmp-rate--blue';
    if (rating >= 4.0) return 'lmp-rate--orange';
    return 'lmp-rate--red';
  }

  /**
   * Генерує HTML для іконки сервісу
   */
  function iconImg(url, alt, extraStyle) {
    return '<img style="' +
      'width:auto; height:auto; display:inline-block; vertical-align:middle; ' +
      'object-fit:contain; ' +
      (extraStyle || '') + '" ' +
      'src="' + url + '" alt="' + (alt || '') + '">';
  }

  /**
   * Генерує HTML для іконки Emmy
   */
  function emmyIconInline() {
    return '<span class="lmp-award-icon lmp-award-icon--emmy">' +
           '<img src="' + ICONS.emmy + '" alt="Emmy" style="height:20px; width:auto;">' +
           '</span>';
  }

  /**
   * Генерує HTML для іконки Oscar
   */
  function oscarIconInline() {
    return '<span class="lmp-award-icon lmp-award-icon--oscar">' +
           '<img src="' + ICONS.oscar + '" alt="Oscar" style="height:18px; width:auto;">' +
           '</span>';
  }

  /**
   * Отримує дані з кешу
   */
  function getCachedRatings(key) {
    try {
      var cache = JSON.parse(localStorage.getItem(RATING_CACHE_KEY) || '{}');
      var item = cache[key];
      if (!item) return null;
      if (Date.now() - item.timestamp > CACHE_TIME) return null;
      return item.data || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Зберігає дані в кеш
   */
  function saveCachedRatings(key, data) {
    if (!data) return;
    try {
      var cache = JSON.parse(localStorage.getItem(RATING_CACHE_KEY) || '{}');
      cache[key] = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem(RATING_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.log('LMP Ratings: Cache save error', e);
    }
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

  /*
  |==========================================================================
  | 4. МЕРЕЖА (API запити)
  |==========================================================================
  */

  /**
   * Виконує безпечний запит
   */
  function makeRequest(url, callback) {
    try {
      if (safeLampaGet('Lampa.Reguest', null)) {
        // Використовуємо Lampa.Reguest для обходу CORS
        new Lampa.Reguest().native(
          url,
          function(data) {
            callback(typeof data === 'string' ? JSON.parse(data) : data);
          },
          function() {
            callback(null);
          },
          false,
          { dataType: 'json' }
        );
      } else {
        // Використовуємо fetch
        fetch(url)
          .then(function(response) {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
          })
          .then(function(data) {
            callback(data);
          })
          .catch(function() {
            callback(null);
          });
      }
    } catch (e) {
      console.log('LMP Ratings: Request error', e);
      callback(null);
    }
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

    makeRequest(url, function(response) {
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
        src = (src || '').toLowerCase();
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

      callback(res);
    });
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

    makeRequest(url, function(data) {
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
            var v = parseInt((r.Value || '').replace('%', ''), 10);
            if (!isNaN(v)) rtScore = v;
          }
          if (r.Source === 'Metacritic') {
            var m = parseInt((r.Value || '').split('/')[0], 10);
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
    });
  }

  /*
  |==========================================================================
  | 5. ОБ'ЄДНАННЯ ДАНИХ ТА РЕНДЕР
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
      tmdb_display: mdb.tmdb_display || omdb.tmdb_display || null,
      tmdb_for_avg: mdb.tmdb_for_avg || omdb.tmdb_for_avg || null,
      imdb_display: mdb.imdb_display || omdb.imdb_display || null,
      imdb_for_avg: mdb.imdb_for_avg || omdb.imdb_for_avg || null,
      mc_display: mc_display,
      mc_for_avg: (typeof mc_for_avg === 'number' ? mc_for_avg : null),
      rt_display: mdb.rt_display || omdb.rt_display || null,
      rt_for_avg: mdb.rt_for_avg || omdb.rt_for_avg || null,
      rt_fresh: (mdb.rt_display || omdb.rt_display) ?
        (mdb.rt_display ? mdb.rt_fresh : omdb.rt_fresh) :
        null,
      popcorn_display: mdb.popcorn_display || omdb.popcorn_display || null,
      popcorn_for_avg: mdb.popcorn_for_avg || omdb.popcorn_for_avg || null,
      ageRating: omdb.ageRating || null,
      oscars: omdb.oscars || 0,
      emmy: omdb.emmy || 0,
      awards: omdb.awards || 0
    };

    return merged;
  }

  /**
   * Створює контейнер для рейтингів
   */
  function createRatingsContainer() {
    var $ = safeLampaGet('jQuery', window.$);
    if (!$) return null;
    
    var container = $('<div class="lmp-ratings-container"></div>');
    
    try {
      if (isApplecationActive()) {
        var render = safeLampaGet('Lampa.Activity.active.activity.render', null);
        if (render && render.find) {
          var descriptionWrapper = render.find('.applecation__description-wrapper');
          
          if (descriptionWrapper.length) {
            descriptionWrapper.before(container);
            setTimeout(function() {
              container.addClass('show');
            }, 100);
            return container;
          }
          
          // Резервний варіант для Applecation
          var meta = render.find('.applecation__meta');
          if (meta.length) {
            meta.after(container);
            setTimeout(function() {
              container.addClass('show');
            }, 100);
            return container;
          }
        }
      } else {
        // Стандартний інтерфейс
        var render = safeLampaGet('Lampa.Activity.active.activity.render', null);
        if (render && render.find) {
          var title = render.find('.full-start-new__title, .full-start__title');
          if (title.length) {
            title.after(container);
            return container;
          }
        }
      }
    } catch (e) {
      console.log('LMP Ratings: Container creation error', e);
    }
    
    return container;
  }

  /**
   * Створює елемент рейтингу
   */
  function createRatingItem(type, value, config) {
    var $ = safeLampaGet('jQuery', window.$);
    if (!$) return null;
    
    var item = $('<div class="lmp-rating-item ' + type + '"></div>');
    var valueSpan = $('<div>' + value + '</div>');
    var iconSpan = $('<div class="source--name"></div>');
    
    item.append(valueSpan);
    item.append(iconSpan);
    
    // Додаємо іконку в залежності від типу
    switch(type) {
      case 'imdb':
        iconSpan.html(iconImg(ICONS.imdb, 'IMDb'));
        break;
      case 'tmdb':
        iconSpan.html(iconImg(ICONS.tmdb, 'TMDB'));
        break;
      case 'mc':
        iconSpan.html(iconImg(ICONS.metacritic, 'Metacritic'));
        break;
      case 'rt':
        var rtIcon = config.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
        var extraStyle = config.rt_fresh ? 'border-radius:4px; height:20px;' : 'height:20px;';
        iconSpan.html(iconImg(rtIcon, 'Rotten Tomatoes', extraStyle));
        break;
      case 'popcorn':
        iconSpan.html(iconImg(ICONS.popcorn, 'Audience', 'height:20px;'));
        break;
      case 'avg':
        iconSpan.html(iconImg(ICONS.total_star, 'AVG', 'height:16px;'));
        break;
      case 'oscar':
        iconSpan.html(oscarIconInline());
        item.addClass('lmp-rate--gold');
        break;
      case 'emmy':
        iconSpan.html(emmyIconInline());
        item.addClass('lmp-rate--gold');
        break;
      case 'awards':
        iconSpan.html(iconImg(ICONS.awards, 'Awards', 'height:16px;'));
        item.addClass('lmp-rate--gold');
        break;
    }
    
    // Застосовуємо колір залежно від налаштувань
    if (config.colorizeAll && type !== 'oscar' && type !== 'emmy' && type !== 'awards') {
      var ratingClass = getRatingClass(parseFloat(value));
      if (ratingClass) {
        item.addClass(ratingClass);
      }
    }
    
    return item;
  }

  /**
   * Відображає рейтинги
   */
  function renderRatings(data) {
    var cfg = getCfg();
    var $ = safeLampaGet('jQuery', window.$);
    if (!$) return;
    
    try {
      var render = safeLampaGet('Lampa.Activity.active.activity.render', null);
      if (!render) return;
      
      // Видаляємо старі рейтинги
      render.find('.lmp-ratings-container').remove();
      
      var container = createRatingsContainer();
      if (!container || !container.length) return;
      
      // Додаємо середній рейтинг
      if (cfg.showAverage) {
        var avg = calculateAverage(data, cfg);
        if (avg !== null) {
          var avgItem = createRatingItem('avg', avg.toFixed(1), {
            colorizeAll: cfg.colorizeAll
          });
          if (avgItem) {
            if (cfg.colorizeAll) {
              avgItem.addClass(getRatingClass(avg));
            }
            container.append(avgItem);
          }
        }
      }
      
      // Додаємо нагороди
      if (cfg.showAwards) {
        if (data.oscars && data.oscars > 0) {
          var oscarItem = createRatingItem('oscar', data.oscars, {});
          if (oscarItem) container.append(oscarItem);
        }
        
        if (data.emmy && data.emmy > 0) {
          var emmyItem = createRatingItem('emmy', data.emmy, {});
          if (emmyItem) container.append(emmyItem);
        }
        
        if (data.awards && data.awards > 0) {
          var awardsItem = createRatingItem('awards', data.awards, {});
          if (awardsItem) container.append(awardsItem);
        }
      }
      
      // Додаємо рейтинги
      if (cfg.enableImdb && data.imdb_display) {
        var imdbItem = createRatingItem('imdb', data.imdb_display, {
          colorizeAll: cfg.colorizeAll,
          imdb_for_avg: data.imdb_for_avg
        });
        if (imdbItem) container.append(imdbItem);
      }
      
      if (cfg.enableTmdb && data.tmdb_display) {
        var tmdbItem = createRatingItem('tmdb', data.tmdb_display, {
          colorizeAll: cfg.colorizeAll,
          tmdb_for_avg: data.tmdb_for_avg
        });
        if (tmdbItem) container.append(tmdbItem);
      }
      
      if (cfg.enableMc && data.mc_display) {
        var mcItem = createRatingItem('mc', data.mc_display, {
          colorizeAll: cfg.colorizeAll,
          mc_for_avg: data.mc_for_avg
        });
        if (mcItem) container.append(mcItem);
      }
      
      if (cfg.enableRt && data.rt_display) {
        var rtItem = createRatingItem('rt', data.rt_display, {
          colorizeAll: cfg.colorizeAll,
          rt_fresh: data.rt_fresh,
          rt_for_avg: data.rt_for_avg
        });
        if (rtItem) container.append(rtItem);
      }
      
      if (cfg.enablePop && data.popcorn_display) {
        var popcornItem = createRatingItem('popcorn', data.popcorn_display, {
          colorizeAll: cfg.colorizeAll,
          popcorn_for_avg: data.popcorn_for_avg
        });
        if (popcornItem) container.append(popcornItem);
      }
      
      // Оновлюємо віковий рейтинг
      updateAgeRating(data.ageRating, render);
      
    } catch (e) {
      console.log('LMP Ratings: Render error', e);
    }
  }

  /**
   * Розраховує середній рейтинг
   */
  function calculateAverage(data, cfg) {
    var parts = [];
    
    if (cfg.enableTmdb && data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) {
      parts.push(parseFloat(data.tmdb_for_avg));
    }
    
    if (cfg.enableImdb && data.imdb_for_avg && !isNaN(data.imdb_for_avg)) {
      parts.push(parseFloat(data.imdb_for_avg));
    }
    
    if (cfg.enableMc && data.mc_for_avg && !isNaN(data.mc_for_avg)) {
      parts.push(parseFloat(data.mc_for_avg));
    }
    
    if (cfg.enableRt && data.rt_for_avg && !isNaN(data.rt_for_avg)) {
      parts.push(parseFloat(data.rt_for_avg));
    }
    
    if (cfg.enablePop && data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) {
      parts.push(parseFloat(data.popcorn_for_avg));
    }
    
    if (parts.length === 0) return null;
    
    var sum = 0;
    for (var i = 0; i < parts.length; i++) {
      sum += parts[i];
    }
    
    return sum / parts.length;
  }

  /**
   * Оновлює віковий рейтинг
   */
  function updateAgeRating(ageRating, render) {
    if (!ageRating || !render || !render.find) return;
    
    var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
    var isValid = invalidRatings.indexOf(ageRating) === -1;
    
    if (isValid) {
      var localized = AGE_RATINGS[ageRating] || ageRating;
      
      if (isApplecationActive()) {
        var pgElement = render.find('.full-start__pg');
        if (pgElement.length) {
          pgElement.text(localized);
        }
      } else {
        var pgElement = render.find('.full-start__pg');
        if (pgElement.length) {
          pgElement.text(localized);
        }
      }
    }
  }

  /*
  |==========================================================================
  | 6. ГОЛОВНИЙ ПРОЦЕС
  |==========================================================================
  */

  /**
   * Завантажує рейтинги для картки
   */
  function fetchAdditionalRatings(card) {
    if (!card || !card.id) return;
    
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
      if (!currentRatingsData) return;
      
      renderRatings(currentRatingsData);
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

      var pending = 2;
      var mdbRes = null;
      var omdbRes = null;

      function oneDone() {
        pending--;
        if (pending !== 0) return;

        currentRatingsData = mergeRatings(mdbRes, omdbRes);

        // Якщо немає TMDB рейтингу, використовуємо vote_average
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

        // Зберігаємо в кеш
        if (cacheKey && currentRatingsData) {
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
      // Для спрощення, якщо немає imdb_id, просто продовжуємо
      proceedWithImdbId();
    } else {
      proceedWithImdbId();
    }
  }

  /*
  |==========================================================================
  | 7. НАЛАШТУВАННЯ
  |==========================================================================
  */

  /**
   * Отримує актуальні налаштування
   */
  function getCfg() {
    try {
      var storage = safeLampaGet('Lampa.Storage', null);
      if (!storage) return RCFG_DEFAULT;
      
      return {
        showAwards: !!storage.field('ratings_show_awards', RCFG_DEFAULT.ratings_show_awards),
        showAverage: !!storage.field('ratings_show_average', RCFG_DEFAULT.ratings_show_average),
        colorizeAll: !!storage.field('ratings_colorize_all', RCFG_DEFAULT.ratings_colorize_all),
        enableImdb: !!storage.field('ratings_enable_imdb', RCFG_DEFAULT.ratings_enable_imdb),
        enableTmdb: !!storage.field('ratings_enable_tmdb', RCFG_DEFAULT.ratings_enable_tmdb),
        enableMc: !!storage.field('ratings_enable_mc', RCFG_DEFAULT.ratings_enable_mc),
        enableRt: !!storage.field('ratings_enable_rt', RCFG_DEFAULT.ratings_enable_rt),
        enablePop: !!storage.field('ratings_enable_popcorn', RCFG_DEFAULT.ratings_enable_popcorn)
      };
    } catch (e) {
      return RCFG_DEFAULT;
    }
  }

  /**
   * Додає секцію налаштувань
   */
  function addSettingsSection() {
    try {
      if (window.lmp_ratings_add_param_ready) return;
      window.lmp_ratings_add_param_ready = true;
      
      var SettingsApi = safeLampaGet('Lampa.SettingsApi', null);
      if (!SettingsApi) return;
      
      // Додаємо компонент
      if (!SettingsApi.hasComponent || !SettingsApi.hasComponent('lmp_ratings')) {
        SettingsApi.addComponent({
          component: 'lmp_ratings',
          name: 'Рейтинги',
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" ' +
                'stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>'
        });
      }
      
      // Додаємо параметри
      var params = [
        {
          param: { name: 'ratings_show_awards', type: 'trigger', default: true },
          field: { name: 'Нагороди', description: 'Показувати Оскари, Еммі та інші нагороди.' }
        },
        {
          param: { name: 'ratings_show_average', type: 'trigger', default: true },
          field: { name: 'Середній рейтинг', description: 'Показувати середній рейтинг' }
        },
        {
          param: { name: 'ratings_colorize_all', type: 'trigger', default: true },
          field: { name: 'Кольорові оцінки', description: 'Кольорове виділення оцінок рейтингів' }
        },
        {
          param: { name: 'ratings_enable_imdb', type: 'trigger', default: true },
          field: { name: 'IMDb', description: 'Показувати/ховати джерело' }
        },
        {
          param: { name: 'ratings_enable_tmdb', type: 'trigger', default: true },
          field: { name: 'TMDB', description: 'Показувати/ховати джерело' }
        },
        {
          param: { name: 'ratings_enable_mc', type: 'trigger', default: true },
          field: { name: 'Metacritic', description: 'Показувати/ховати джерело' }
        },
        {
          param: { name: 'ratings_enable_rt', type: 'trigger', default: true },
          field: { name: 'Rotten Tomatoes', description: 'Показувати/ховати джерело' }
        },
        {
          param: { name: 'ratings_enable_popcorn', type: 'trigger', default: true },
          field: { name: 'Popcornmeter', description: 'Показувати/ховати джерело' }
        }
      ];
      
      params.forEach(function(p) {
        p.component = 'lmp_ratings';
        SettingsApi.addParam(p);
      });
      
    } catch (e) {
      console.log('LMP Ratings: Settings error', e);
    }
  }

  /**
   * Ініціалізація плагіна
   */
  function initRatingsPlugin() {
    try {
      // Додаємо стилі
      var styleEl = document.createElement('style');
      styleEl.id = 'lmp-ratings-styles';
      styleEl.textContent = `
        /* Основні стилі рейтингів */
        .lmp-ratings-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin: 10px 0;
        }
        
        .lmp-rating-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        
        /* Кольори оцінок */
        .lmp-rate--green { color: #2ecc71 !important; }
        .lmp-rate--blue { color: #60a5fa !important; }
        .lmp-rate--orange { color: #f59e0b !important; }
        .lmp-rate--red { color: #ef4444 !important; }
        .lmp-rate--gold { color: gold !important; }
        
        /* Іконки */
        .lmp-rating-item img {
          height: 20px;
          width: auto;
          display: block;
        }
        
        /* Для Applecation */
        .applecation .lmp-ratings-container {
          margin: 0.5em 0;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        }
        
        .applecation .lmp-ratings-container.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .applecation .lmp-rating-item {
          font-size: 0.95em;
          gap: 0.35em;
        }
        
        /* Адаптив */
        @media (max-width: 600px) {
          .lmp-ratings-container {
            gap: 8px;
          }
          
          .lmp-rating-item {
            font-size: 14px;
          }
          
          .lmp-rating-item img {
            height: 16px;
          }
        }
      `;
      document.head.appendChild(styleEl);
      
      // Додаємо налаштування
      addSettingsSection();
      
      // Слухаємо завантаження сторінки
      var Listener = safeLampaGet('Lampa.Listener', null);
      if (Listener && Listener.follow) {
        Listener.follow('full', function(e) {
          if (e.type === 'complite') {
            setTimeout(function() {
              fetchAdditionalRatings(e.data && e.data.movie || e.object || {});
            }, 800);
          }
        });
        
        // Слухаємо зміни в налаштуваннях
        var Storage = safeLampaGet('Lampa.Storage', null);
        if (Storage && Storage.set) {
          var originalSet = Storage.set;
          Storage.set = function(key, value) {
            var result = originalSet.apply(this, arguments);
            if (typeof key === 'string' && key.indexOf('ratings_') === 0) {
              setTimeout(function() {
                if (currentRatingsData) {
                  renderRatings(currentRatingsData);
                }
              }, 100);
            }
            return result;
          };
        }
      }
      
      console.log('LMP Ratings: Plugin initialized successfully');
      
    } catch (e) {
      console.log('LMP Ratings: Initialization error', e);
    }
  }

  /*
  |==========================================================================
  | 8. ЗАПУСК ПЛАГІНА
  |==========================================================================
  */

  // Запускаємо після повного завантаження сторінки
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initRatingsPlugin, 1000);
    });
  } else {
    setTimeout(initRatingsPlugin, 1000);
  }

})();
