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

  /*
  |==========================================================================
  | 1. КОНСТАНТИ ТА КОНФІГУРАЦІЯ
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
   * CSS стилі плагіну (оновлені для Applecation)
   */
  var pluginStyles = "<style>" +
    /* --- Кольори оцінок --- */
    ".lmp-rate--green  { color: #2ecc71 !important; }" + /* ≥ 8.0  */
    ".lmp-rate--blue   { color: #60a5fa !important; }" + /* 6.0–7.9 */
    ".lmp-rate--orange { color: #f59e0b !important; }" + /* 4.0–5.9 */
    ".lmp-rate--red    { color: #ef4444 !important; }" + /* < 4.0   */
    
    /* --- Кольоровий режим для нагород --- */
    ".lmp-rate--gold { color: gold !important; }" +
    ".lmp-rate--oscar, .lmp-rate--emmy, .lmp-rate--awards { color: gold !important; }" +

    /* --- Стилі для Applecation --- */
    ".applecation .lmp-ratings-container {" +
    "    display: flex;" +
    "    align-items: center;" +
    "    gap: 0.8em;" +
    "    margin-bottom: 0.5em;" +
    "    opacity: 0;" +
    "    transform: translateY(15px);" +
    "    transition: opacity 0.4s ease-out, transform 0.4s ease-out;" +
    "    transition-delay: 0.08s;" +
    "}" +
    
    ".applecation .lmp-ratings-container.show {" +
    "    opacity: 1;" +
    "    transform: translateY(0);" +
    "}" +
    
    ".applecation .lmp-rating-item {" +
    "    display: flex;" +
    "    align-items: center;" +
    "    gap: 0.35em;" +
    "    font-size: 0.95em;" +
    "    font-weight: 600;" +
    "    line-height: 1;" +
    "    color: #fff;" +
    "}" +
    
    ".applecation .lmp-rating-item svg {" +
    "    width: 1.8em;" +
    "    height: auto;" +
    "    flex-shrink: 0;" +
    "    color: rgba(255, 255, 255, 0.85);" +
    "}" +
    
    ".applecation .lmp-rating-item.kp svg {" +
    "    width: 1.5em;" +
    "}" +
    
    /* --- Стилі для стандартного інтерфейсу --- */
    ":not(.applecation) .lmp-ratings-container {" +
    "    display: flex;" +
    "    align-items: center;" +
    "    gap: 0.8em;" +
    "    margin: 0.5em 0;" +
    "}" +
    
    ":not(.applecation) .lmp-rating-item {" +
    "    display: flex;" +
    "    align-items: center;" +
    "    gap: 0.35em;" +
    "    font-size: 16px;" +
    "    font-weight: 600;" +
    "    line-height: 1;" +
    "}" +
    
    ":not(.applecation) .lmp-rating-item svg {" +
    "    width: 24px;" +
    "    height: auto;" +
    "    flex-shrink: 0;" +
    "}" +

    /* --- Універсальні стилі --- */
    ".lmp-rating-item.hide { display: none !important; }" +
    ".lmp-rating-item .source--name {" +
    "    display: inline-flex;" +
    "    align-items: center;" +
    "    justify-content: center;" +
    "}" +
    
    /* --- Іконки сервісів --- */
    ".lmp-rating-item.imdb .source--name img {" +
    "    height: 24px;" +
    "}" +
    ".lmp-rating-item.mc .source--name img {" +
    "    height: 24px;" +
    "}" +
    ".lmp-rating-item.rt .source--name img {" +
    "    height: 26px;" +
    "}" +
    ".lmp-rating-item.popcorn .source--name img {" +
    "    height: 26px;" +
    "}" +
    ".lmp-rating-item.tmdb .source--name img {" +
    "    height: 26px;" +
    "}" +
    ".lmp-rating-item.awards .source--name img {" +
    "    height: 20px;" +
    "}" +
    ".lmp-rating-item.avg .source--name img {" +
    "    height: 20px;" +
    "}" +
    
    /* --- Іконки нагород --- */
    ".lmp-award-icon {" +
    "    display: inline-flex;" +
    "    align-items: center;" +
    "    justify-content: center;" +
    "    line-height: 1;" +
    "    height: auto;" +
    "    width: auto;" +
    "    flex-shrink: 0;" +
    "}" +
    ".lmp-award-icon img {" +
    "    height: auto;" +
    "    width: auto;" +
    "    display: block;" +
    "    object-fit: contain;" +
    "}" +
    ".lmp-award-icon--oscar img { height: 22px; }" +
    ".lmp-award-icon--emmy img { height: 24px; }" +
    
    /* --- Адаптив --- */
    "@media (max-width: 600px) {" +
    "    .lmp-ratings-container {" +
    "        flex-wrap: wrap;" +
    "        gap: 0.5em;" +
    "    }" +
    "    .lmp-rating-item {" +
    "        font-size: 14px;" +
    "    }" +
    "    .lmp-rating-item svg {" +
    "        width: 18px;" +
    "    }" +
    "    .lmp-award-icon--oscar img { height: 16px; }" +
    "    .lmp-award-icon--emmy img { height: 18px; }" +
    "}" +
    "</style>";

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
    ratings_colorize_all: true, // ЗАЗНАЧТЕ: за замовчуванням увімкнено кольорове виділення
    ratings_enable_imdb: true,
    ratings_enable_tmdb: true,
    ratings_enable_mc: true,
    ratings_enable_rt: true,
    ratings_enable_popcorn: true
  };

  /*
  |==========================================================================
  | 2. ДОПОМІЖНІ ФУНКЦІЇ
  |==========================================================================
  */

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
   * Перевіряє, чи використовується Applecation
   */
  function isApplecationActive() {
    var render = Lampa.Activity.active() && Lampa.Activity.active().activity.render();
    return render && render.hasClass('applecation');
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

  /*
  |==========================================================================
  | 3. МЕРЕЖА (API запити)
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
  | 4. ОБ'ЄДНАННЯ ДАНИХ
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
  | 5. РЕНДЕР (оновлений для Applecation)
  |==========================================================================
  */

  /**
   * Створює контейнер для рейтингів
   */
  function createRatingsContainer() {
    var container = $('<div class="lmp-ratings-container"></div>');
    
    // Додаємо контейнер в залежності від інтерфейсу
    if (isApplecationActive()) {
      var render = Lampa.Activity.active().activity.render();
      var descriptionWrapper = render.find('.applecation__description-wrapper');
      
      if (descriptionWrapper.length) {
        // Вставляємо перед описом фільму
        descriptionWrapper.before(container);
        setTimeout(function() {
          container.addClass('show');
        }, 100);
      } else {
        // Резервний варіант
        render.find('.applecation__meta').after(container);
      }
    } else {
      // Стандартний інтерфейс
      var render = Lampa.Activity.active().activity.render();
      var rateLine = render.find('.full-start-new__rate-line, .full-start__rate-line');
      
      if (rateLine.length) {
        rateLine.before(container);
      } else {
        render.find('.full-start-new__title').after(container);
      }
    }
    
    return container;
  }

  /**
   * Створює елемент рейтингу
   */
  function createRatingItem(type, value, config) {
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
        var extraStyle = config.rt_fresh ? 'border-radius:4px;' : '';
        iconSpan.html(iconImg(rtIcon, 'Rotten Tomatoes', extraStyle));
        break;
      case 'popcorn':
        iconSpan.html(iconImg(ICONS.popcorn, 'Audience'));
        break;
      case 'avg':
        iconSpan.html(iconImg(ICONS.total_star, 'AVG'));
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
        iconSpan.html(iconImg(ICONS.awards, 'Awards'));
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
    var render = Lampa.Activity.active().activity.render();
    
    if (!render || !data) return;
    
    // Видаляємо старі рейтинги
    render.find('.lmp-ratings-container').remove();
    
    var container = createRatingsContainer();
    if (!container.length) return;
    
    // Додаємо рейтинги в контейнер
    if (cfg.enableImdb && data.imdb_display) {
      var imdbItem = createRatingItem('imdb', data.imdb_display, {
        colorizeAll: cfg.colorizeAll,
        imdb_for_avg: data.imdb_for_avg
      });
      container.append(imdbItem);
    }
    
    if (cfg.enableTmdb && data.tmdb_display) {
      var tmdbItem = createRatingItem('tmdb', data.tmdb_display, {
        colorizeAll: cfg.colorizeAll,
        tmdb_for_avg: data.tmdb_for_avg
      });
      container.append(tmdbItem);
    }
    
    if (cfg.enableMc && data.mc_display) {
      var mcItem = createRatingItem('mc', data.mc_display, {
        colorizeAll: cfg.colorizeAll,
        mc_for_avg: data.mc_for_avg
      });
      container.append(mcItem);
    }
    
    if (cfg.enableRt && data.rt_display) {
      var rtItem = createRatingItem('rt', data.rt_display, {
        colorizeAll: cfg.colorizeAll,
        rt_fresh: data.rt_fresh,
        rt_for_avg: data.rt_for_avg
      });
      container.append(rtItem);
    }
    
    if (cfg.enablePop && data.popcorn_display) {
      var popcornItem = createRatingItem('popcorn', data.popcorn_display, {
        colorizeAll: cfg.colorizeAll,
        popcorn_for_avg: data.popcorn_for_avg
      });
      container.append(popcornItem);
    }
    
    // Додаємо нагороди
    if (cfg.showAwards) {
      if (data.oscars && data.oscars > 0) {
        var oscarItem = createRatingItem('oscar', data.oscars, {});
        container.prepend(oscarItem);
      }
      
      if (data.emmy && data.emmy > 0) {
        var emmyItem = createRatingItem('emmy', data.emmy, {});
        container.prepend(emmyItem);
      }
      
      if (data.awards && data.awards > 0) {
        var awardsItem = createRatingItem('awards', data.awards, {});
        container.prepend(awardsItem);
      }
    }
    
    // Додаємо середній рейтинг
    if (cfg.showAverage) {
      var avg = calculateAverage(data, cfg);
      if (avg !== null) {
        var avgItem = createRatingItem('avg', avg.toFixed(1), {
          colorizeAll: cfg.colorizeAll
        });
        if (cfg.colorizeAll) {
          avgItem.addClass(getRatingClass(avg));
        }
        container.prepend(avgItem);
      }
    }
    
    // Оновлюємо віковий рейтинг
    updateAgeRating(data.ageRating);
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
  function updateAgeRating(ageRating) {
    if (!ageRating) return;
    
    var render = Lampa.Activity.active().activity.render();
    if (!render) return;
    
    var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
    var isValid = invalidRatings.indexOf(ageRating) === -1;
    
    if (isValid) {
      var localized = AGE_RATINGS[ageRating] || ageRating;
      
      if (isApplecationActive()) {
        // Для Applecation
        var pgElement = render.find('.full-start__pg');
        if (pgElement.length) {
          pgElement.removeClass('hide').text(localized);
        } else {
          // Створюємо елемент якщо його немає
          var metaContainer = render.find('.applecation__meta-left');
          if (metaContainer.length) {
            metaContainer.append('<div class="full-start__pg">' + localized + '</div>');
          }
        }
      } else {
        // Для стандартного інтерфейсу
        var pgElement = render.find('.full-start__pg.hide');
        if (pgElement.length) {
          pgElement.removeClass('hide').text(localized);
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
        return;
      }

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
  | 7. НАЛАШТУВАННЯ
  |==========================================================================
  */

  /**
   * Отримує актуальні налаштування
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
              renderRatings(currentRatingsData);
            }
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
  }

  /**
   * Додає секцію налаштувань
   */
  function addSettingsSection() {
    if (window.lmp_ratings_add_param_ready) return;
    window.lmp_ratings_add_param_ready = true;

    // Додаємо компонент
    if (!Lampa.SettingsApi.hasComponent('lmp_ratings')) {
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
    }

    // Додаємо параметри
    var params = [
      {
        param: {
          name: 'ratings_show_awards',
          type: 'trigger',
          values: '',
          "default": RCFG_DEFAULT.ratings_show_awards
        },
        field: {
          name: 'Нагороди',
          description: 'Показувати Оскари, Еммі та інші нагороди.'
        }
      },
      {
        param: {
          name: 'ratings_show_average',
          type: 'trigger',
          values: '',
          "default": RCFG_DEFAULT.ratings_show_average
        },
        field: {
          name: 'Середній рейтинг',
          description: 'Показувати середній рейтинг'
        }
      },
      {
        param: {
          name: 'ratings_colorize_all',
          type: 'trigger',
          "default": RCFG_DEFAULT.ratings_colorize_all
        },
        field: {
          name: 'Кольорові оцінки',
          description: 'Кольорове виділення оцінок рейтингів'
        }
      },
      {
        param: {
          name: 'ratings_enable_imdb',
          type: 'trigger',
          "default": RCFG_DEFAULT.ratings_enable_imdb
        },
        field: {
          name: 'IMDb',
          description: 'Показувати/ховати джерело'
        }
      },
      {
        param: {
          name: 'ratings_enable_tmdb',
          type: 'trigger',
          "default": RCFG_DEFAULT.ratings_enable_tmdb
        },
        field: {
          name: 'TMDB',
          description: 'Показувати/ховати джерело'
        }
      },
      {
        param: {
          name: 'ratings_enable_mc',
          type: 'trigger',
          "default": RCFG_DEFAULT.ratings_enable_mc
        },
        field: {
          name: 'Metacritic',
          description: 'Показувати/ховати джерело'
        }
      },
      {
        param: {
          name: 'ratings_enable_rt',
          type: 'trigger',
          "default": RCFG_DEFAULT.ratings_enable_rt
        },
        field: {
          name: 'Rotten Tomatoes',
          description: 'Показувати/ховати джерело'
        }
      },
      {
        param: {
          name: 'ratings_enable_popcorn',
          type: 'trigger',
          "default": RCFG_DEFAULT.ratings_enable_popcorn
        },
        field: {
          name: 'Popcornmeter',
          description: 'Показувати/ховати джерело'
        }
      },
      {
        param: {
          type: 'button',
          component: 'lmp_clear_cache'
        },
        field: {
          name: 'Очистити кеш рейтингів'
        },
        onChange: function() {
          try {
            Lampa.Storage.set(RATING_CACHE_KEY, {});
            Lampa.Storage.set(ID_MAPPING_CACHE, {});
            if (Lampa.Noty) Lampa.Noty('Кеш рейтингів очищено');
          } catch (e) {
            console.error('LMP Ratings: clear cache error', e);
          }
        }
      }
    ];

    params.forEach(function(p) {
      p.component = 'lmp_ratings';
      Lampa.SettingsApi.addParam(p);
    });
  }

  /**
   * Ініціалізація UI налаштувань
   */
  function initRatingsPluginUI() {
    // Встановлюємо дефолтні значення
    Object.keys(RCFG_DEFAULT).forEach(function(key) {
      if (Lampa.Storage.get(key) === undefined) {
        Lampa.Storage.set(key, RCFG_DEFAULT[key]);
      }
    });

    addSettingsSection();
    attachLiveSettingsHandlers();
    
    // Зберігаємо функцію для оновлення стилів
    window.LampaRatings = window.LampaRatings || {};
    window.LampaRatings.applyStyles = function() {
      if (currentRatingsData) {
        renderRatings(currentRatingsData);
      }
    };
  }

  /*
  |==========================================================================
  | 8. ЗАПУСК
  |==========================================================================
  */

  /**
   * Ініціалізація плагіна
   */
  function startPlugin() {
    window.combined_ratings_plugin = true;
    
    // Слухаємо завантаження сторінки детальної інформації
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        setTimeout(function() {
          fetchAdditionalRatings(e.data.movie || e.object || {});
        }, 500);
      }
    });
  }

  // --- Початок виконання коду ---

  // Додаємо стилі
  Lampa.Template.add('lmp_enh_styles', pluginStyles);
  $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));

  // Ініціалізуємо налаштування
  initRatingsPluginUI();

  // Запускаємо плагін
  if (!window.combined_ratings_plugin) {
    startPlugin();
  }

})();
