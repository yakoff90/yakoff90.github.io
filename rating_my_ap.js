/**
 * Lampa: Enhanced Ratings (MDBList + OMDb) - ВЕРСІЯ БЕЗ КОНФЛІКТІВ
 * ----------------------------------------------------------------
 * - Працює навіть з плагіном "Інтерфейс +"
 * - Видаляє власну систему кольорів та делегує її плагіну "Інтерфейс +"
 * - Зберігає всі функції отримання рейтингів
 */

(function() {
  'use strict';

  /*
  |==========================================================================
  | 1. ПОЛІФІЛИ (лише необхідні)
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

  // NodeList.forEach (для старих WebView)
  if (window.NodeList && !NodeList.prototype.forEach) {
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

  var LMP_ENH_CONFIG = {
    apiKeys: {
      mdblist: 'nmqhlb9966w9m86h3yntb0dpz',
      omdb: '358837db'
    }
  };

  var BASE_ICON = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/';
  var ICONS = {
    total_star: BASE_ICON + 'star.png',
    imdb: BASE_ICON + 'imdb.png',
    tmdb: BASE_ICON + 'tmdb.png',
    metacritic: BASE_ICON + 'metacritic.png',
    rotten_good: BASE_ICON + 'RottenTomatoes.png',
    rotten_bad: BASE_ICON + 'RottenBad.png',
    popcorn: BASE_ICON + 'PopcornGood.png'
  };

  Lampa.Lang.add({
    popcorn_label: { uk: 'Глядачі' },
    source_tmdb: { ru: 'TMDB', en: 'TMDB', uk: 'TMDB' },
    source_imdb: { ru: 'IMDb', en: 'IMDb', uk: 'IMDb' },
    source_mc: { ru: 'Metacritic', en: 'Metacritic', uk: 'Metacritic' },
    source_rt: { ru: 'Rotten', en: 'Rotten', uk: 'Rotten' }
  });

  /*
  |==========================================================================
  | 3. СТИЛІ (МІНІМАЛЬНІ, БЕЗ КОЛЬОРІВ)
  |==========================================================================
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
    
    /* --- ВАЖЛИВО: ВИДАЛЕНО ВСІ КОЛЬОРОВІ СТИЛІ --- */
    /* --- Кольори тепер керуються виключно плагіном "Інтерфейс +" --- */
    
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

  /*
  |==========================================================================
  | 4. ДОПОМІЖНІ ФУНКЦІЇ
  |==========================================================================
  */

  var __lmpRateLineObs = null;
  var currentRatingsData = null;
  var __lmpLastReqToken = null;

  function getCardType(card) {
    var type = card.media_type || card.type;
    if (type === 'movie' || type === 'tv') return type;
    return card.name || card.original_name ? 'tv' : 'movie';
  }

  function iconImg(url, alt, sizePx, extraStyle) {
    return '<img style="' +
      'width:auto; display:inline-block; vertical-align:middle; ' +
      'object-fit:contain; ' +
      (extraStyle || '') + ' ' +
      '" ' +
      'src="' + url + '" alt="' + (alt || '') + '">';
  }

  function dimRateLine(rateLine) {
    if (!rateLine || !rateLine.length) return;
    rateLine.addClass('lmp-is-loading-ratings');
  }

  function undimRateLine(rateLine) {
    if (!rateLine || !rateLine.length) return;
    rateLine.removeClass('lmp-is-loading-ratings');
  }

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

  /*
  |==========================================================================
  | 5. МЕРЕЖА (API запити)
  |==========================================================================
  */

  function getImdbIdFromTmdb(tmdbId, type, callback) {
    if (!tmdbId) return callback(null);

    var preferredType = (type === 'movie') ? 'movie' : 'tv';
    var altType = preferredType === 'movie' ? 'tv' : 'movie';

    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;
    var ID_MAPPING_CACHE = 'lmp_rating_id_cache';
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
        ageRating: data.Rated || null
      };

      callback(res);
    }, function() {
      callback(null);
    });
  }

  /*
  |==========================================================================
  | 6. ОБ'ЄДНАННЯ ДАНИХ
  |==========================================================================
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
      _mdblist_ratings: Array.isArray(mdb._mdblist_ratings) ? mdb._mdblist_ratings.slice() : []
    };

    return merged;
  }

  /*
  |==========================================================================
  | 7. РЕНДЕР (без кольорів!)
  |==========================================================================
  */

  function getApplecationRatingsContainer() {
    var render = Lampa.Activity.active().activity.render();
    if (!render) return null;
    
    var ratingsContainer = $('.applecation__ratings', render);
    
    if (!ratingsContainer.length) {
      var metaContainer = $('.applecation__meta', render);
      if (metaContainer.length) {
        ratingsContainer = $('<div class="applecation__ratings"></div>');
        metaContainer.after(ratingsContainer);
      } else {
        var titleContainer = $('.full-start-new__title', render);
        if (titleContainer.length) {
          ratingsContainer = $('<div class="applecation__ratings"></div>');
          titleContainer.after(ratingsContainer);
        }
      }
    }
    
    return ratingsContainer;
  }

  function insertRatings(data) {
    var ratingsContainer = getApplecationRatingsContainer();
    if (!ratingsContainer || !ratingsContainer.length) return;

    // ВАЖЛИВО: не завантажуємо налаштування кольорів
    // Кольори тепер керуються виключно плагіном "Інтерфейс +"

    // Додаємо IMDb (без кольорових класів!)
    if (data.imdb_display) {
      var imdbVal = data.imdb_for_avg ? parseFloat(data.imdb_for_avg) : null;
      var imdbText = imdbVal ? imdbVal.toFixed(1) : 'N/A';
      
      var imdbElement = $(
        '<div class="full-start__rate rate--imdb">' +
        '<div>' + imdbText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      imdbElement.find('.source--name').html(iconImg(ICONS.imdb, 'IMDb', 22));
      ratingsContainer.append(imdbElement);
    }

    // Додаємо TMDB (без кольорових класів!)
    if (data.tmdb_display) {
      var tmdbVal = data.tmdb_for_avg ? parseFloat(data.tmdb_for_avg) : null;
      var tmdbText = tmdbVal ? tmdbVal.toFixed(1) : 'N/A';
      
      var tmdbElement = $(
        '<div class="full-start__rate rate--tmdb">' +
        '<div>' + tmdbText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      tmdbElement.find('.source--name').html(iconImg(ICONS.tmdb, 'TMDB', 24));
      ratingsContainer.append(tmdbElement);
    }

    // Додаємо Metacritic (без кольорових класів!)
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

    if (mcVal != null && !isNaN(mcVal)) {
      var mcText = mcVal.toFixed(1);
      var mcElement = $(
        '<div class="full-start__rate rate--mc">' +
        '<div>' + mcText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      mcElement.find('.source--name').html(iconImg(ICONS.metacritic, 'Metacritic', 22));
      ratingsContainer.append(mcElement);
    }

    // Додаємо Rotten Tomatoes (без кольорових класів!)
    var rtVal = null;
    if (data.rt_for_avg && !isNaN(data.rt_for_avg)) rtVal = parseFloat(data.rt_for_avg);
    else if (data.rt_display && !isNaN(parseFloat(data.rt_display))) {
      var rtd = parseFloat(data.rt_display);
      rtVal = (rtd > 10) ? (rtd / 10) : rtd;
    }

    if (rtVal != null && !isNaN(rtVal)) {
      var rtText = rtVal.toFixed(1);
      var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
      var extra = data.rt_fresh ? 'border-radius:4px;' : '';

      var rtElement = $(
        '<div class="full-start__rate rate--rt">' +
        '<div>' + rtText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      rtElement.find('.source--name').html(iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra));
      ratingsContainer.append(rtElement);
    }

    // Додаємо Popcorn (без кольорових класів!)
    var pcVal = null;
    if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) pcVal = parseFloat(data.popcorn_for_avg);
    else if (data.popcorn_display && !isNaN(parseFloat(data.popcorn_display))) {
      var pcd = parseFloat(data.popcorn_display);
      pcVal = (pcd > 10) ? (pcd / 10) : pcd;
    }

    if (pcVal != null && !isNaN(pcVal)) {
      var pcText = pcVal.toFixed(1);
      var pcElement = $(
        '<div class="full-start__rate rate--popcorn">' +
        '<div>' + pcText + '</div>' +
        '<div class="source--name"></div>' +
        '</div>'
      );
      pcElement.find('.source--name').html(iconImg(ICONS.popcorn, 'Audience', 22));
      ratingsContainer.append(pcElement);
    }
  }

  function calculateAverageRating(data) {
    var ratingsContainer = getApplecationRatingsContainer();
    if (!ratingsContainer || !ratingsContainer.length) {
      removeLoadingAnimation();
      return;
    }

    $('.rate--avg', ratingsContainer).remove();

    var parts = [];
    if (data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(parseFloat(data.tmdb_for_avg));
    if (data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(parseFloat(data.imdb_for_avg));
    
    if (data.mc_user_for_avg && !isNaN(data.mc_user_for_avg)) {
      parts.push(parseFloat(data.mc_user_for_avg));
    } else if (data.mc_critic_for_avg && !isNaN(data.mc_critic_for_avg)) {
      parts.push(parseFloat(data.mc_critic_for_avg));
    } else if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
      parts.push(parseFloat(data.mc_for_avg));
    }
    
    if (data.rt_for_avg && !isNaN(data.rt_for_avg)) parts.push(parseFloat(data.rt_for_avg));
    if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) parts.push(parseFloat(data.popcorn_for_avg));

    if (!parts.length) {
      removeLoadingAnimation();
      return;
    }

    var sum = 0;
    for (var i = 0; i < parts.length; i++) sum += parts[i];
    var avg = sum / parts.length;

    // БЕЗ кольорових класів!
    var avgElement = $(
      '<div class="full-start__rate rate--avg">' +
      '<div>' + avg.toFixed(1) + '</div>' +
      '<div class="source--name"></div>' +
      '</div>'
    );

    var starHtml = iconImg(ICONS.total_star, 'AVG', 20);
    avgElement.find('.source--name').html(starHtml);
    ratingsContainer.prepend(avgElement);

    removeLoadingAnimation();
    ratingsContainer.addClass('show');
    
    // ВАЖЛИВО: НЕ викликаємо applyRatingColorsToAll
    // Кольори тепер керуються виключно плагіном "Інтерфейс +"
    
    // Але ми можемо вручну викликати updateVoteColors з плагіна "Інтерфейс +"
    setTimeout(function() {
      if (window.updateVoteColors && typeof window.updateVoteColors === 'function') {
        window.updateVoteColors();
      }
    }, 300);
  }

  /*
  |==========================================================================
  | 8. ГОЛОВНИЙ ПРОЦЕС
  |==========================================================================
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

      insertRatings(currentRatingsData);
      calculateAverageRating(currentRatingsData);
    }

    function proceedWithImdbId() {
      var RATING_CACHE_KEY = 'lmp_enh_rating_cache';
      var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;
      
      var cacheKeyBase = normalizedCard.imdb_id || normalizedCard.id;
      var cacheKey = cacheKeyBase ? (normalizedCard.type + '_' + cacheKeyBase) : null;

      function getCachedRatings(key) {
        var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
        var item = cache[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > CACHE_TIME) return null;
        return item.data || null;
      }

      function saveCachedRatings(key, data) {
        if (!data) return;
        var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
        cache[key] = {
          timestamp: Date.now(),
          data: data
        };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
      }

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
            currentRatingsData.popcorn_display
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
  | 9. НАЛАШТУВАННЯ (спрощені)
  |==========================================================================
  */

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

  function lmpRatingsClearCache() {
    try {
      Lampa.Storage.set('lmp_enh_rating_cache', {});
      Lampa.Storage.set('lmp_rating_id_cache', {});
      lmpToast('Кеш рейтингів очищено');
    } catch (e) {
      console.error('LMP Ratings: clear cache error', e);
      lmpToast('Помилка очищення кешу');
    }
  }

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

    // ВАЖЛИВО: видаляємо налаштування кольорів
    // Лишаємо лише кнопку очищення кешу
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

  function initRatingsPluginUI() {
    addSettingsSection();
  }

  /*
  |==========================================================================
  | 10. ЗАПУСК
  |==========================================================================
  */

  function startPlugin() {
    window.combined_ratings_plugin = true;
    Lampa.Listener.follow('full', function(e) {
      if (e.type === 'complite') {
        setTimeout(function() {
          fetchAdditionalRatings(e.data.movie || e.object || {});
        }, 500);
      }
    });
  }

  // --- Початок виконання коду ---

  Lampa.Template.add('lmp_enh_styles', pluginStyles);
  $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));

  initRatingsPluginUI();

  if (!window.combined_ratings_plugin) {
    startPlugin();
  }

})();
