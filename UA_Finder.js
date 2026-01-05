/**
 * Lampa Track Finder v3 для Samsung TV
 * --------------------------------------------------------------------------------
 * Адаптовано для Samsung Smart TV з урахуванням:
 * - Обмежень WebKit старшої версії
 * - Медленнішого JavaScript рушія
 * - Обмежень пам'яті
 * - Проблем з CORS
 * --------------------------------------------------------------------------------
 */

(function () {
  'use strict';

  // ===================== КОНФІГУРАЦІЯ ДЛЯ SAMSUNG TV =====================
  
  // ✅ Прапор України (CSS для швидкості відмальовки)
  var ukraineFlagSVG = '<i class="flag-css"></i>';

  // Головний об'єкт конфігурації
  var LTF_CONFIG = window.LTF_CONFIG || {
    BADGE_STYLE: 'flag_count', // 'text' | 'flag_count' | 'flag_only'
    SHOW_FOR_TV: true, // показувати на серіалах
    
    // --- Налаштування кешу ---
    CACHE_VERSION: 5, // Збільшуємо для TV версії
    CACHE_KEY: 'lampa_ukr_tracks_cache_tv', // Унікальний ключ для TV
    CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000, // Час життя кешу (24 години)
    CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // Оновлення через 12 годин

    // --- Налаштування логування (вимкнути на TV для продуктивності) ---
    LOGGING_GENERAL: false,
    LOGGING_TRACKS: false,
    LOGGING_CARDLIST: false,

    // --- Налаштування API та мережі для TV ---
    JACRED_PROTOCOL: 'https://', // Використовуємо HTTPS
    JACRED_URL: 'jacred.xyz', // Домен API JacRed
    
    // Проксі для TV (безпечніші варіанти)
    PROXY_LIST: [
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://corsproxy.io/?'
    ],
    
    PROXY_TIMEOUT_MS: 6000, // Більший таймаут для TV
    MAX_PARALLEL_REQUESTS: 3, // Менше паралельних запитів для TV
    MAX_RETRY_ATTEMPTS: 1, // Менше спроб для TV

    // --- Налаштування функціоналу ---
    SHOW_TRACKS_FOR_TV_SERIES: true,
    
    // --- Налаштування відображення ---
    DISPLAY_MODE: 'flag_count', // Прапорець з лічильником за замовчуванням для TV
    
    // --- Оптимізації для TV ---
    USE_SIMPLE_FETCH: true, // Використовувати XMLHttpRequest замість fetch
    BATCH_SIZE: 8, // Менші пачки для TV
    PROCESS_DELAY: 100, // Більша затримка між пачками
    
    // --- Ручні перевизначення ---
    MANUAL_OVERRIDES: {
      '207703': { track_count: 1 },
      '1195518': { track_count: 2 },
      '215995': { track_count: 2 },
      '1234821': { track_count: 2 },
      '933260': { track_count: 3 },
      '245827': { track_count: 0 }
    }
  };

  window.LTF_CONFIG = LTF_CONFIG;

  // ======== АВТОМАТИЧНЕ СКИДАННЯ СТАРОГО КЕШУ ========
  (function resetOldCache() {
    try {
      var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
      var hasOld = Object.keys(cache).some(function(k) {
        return !k.startsWith(LTF_CONFIG.CACHE_VERSION + '_');
      });
      if (hasOld) {
        console.log('UA-Finder TV: очищення старого кешу');
        Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
      }
    } catch (e) {
      console.error('UA-Finder TV: помилка очищення кешу', e);
    }
  })();

  // ===================== СТИЛІ CSS =====================
  var styleTracks = "<style id=\"lampa_tracks_styles_tv\">" +
    ".card__view { position: relative; }" +
    
    ".card__tracks {" +
    " position: absolute !important;" +
    " right: 0.3em !important;" +
    " left: auto !important;" +
    " top: 0.3em !important;" +
    " background: rgba(0,0,0,0.7) !important;" +
    " color: #FFFFFF !important;" +
    " font-size: 1.2em !important;" +
    " padding: 0.15em 0.4em !important;" +
    " border-radius: 0.8em !important;" +
    " font-weight: 700 !important;" +
    " z-index: 20 !important;" +
    " width: fit-content !important;" +
    " max-width: calc(100% - 1em) !important;" +
    " overflow: hidden !important;" +
    " border: 1px solid rgba(255,255,255,0.2) !important;" +
    "}" +
    
    ".card__tracks.positioned-below-rating {" +
    " top: 1.85em !important;" +
    "}" +
    
    ".card__tracks div {" +
    " text-transform: none !important;" +
    " font-family: 'Roboto Condensed', Arial, sans-serif !important;" +
    " font-weight: 700 !important;" +
    " letter-spacing: 0.1px !important;" +
    " font-size: 1em !important;" +
    " color: #FFFFFF !important;" +
    " padding: 0 !important;" +
    " white-space: nowrap !important;" +
    " display: flex !important;" +
    " align-items: center !important;" +
    " gap: 3px !important;" +
    " text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;" +
    "}" +
    
    /* Прапор України */
    ".card__tracks .flag-css {" +
    " display: inline-block;" +
    " width: 1.4em;" +
    " height: 0.75em;" +
    " vertical-align: middle;" +
    " background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%);" +
    " border-radius: 2px;" +
    " border: none !important;" +
    " box-shadow: " +
    "0 0 2px 0 rgba(0,0,0,0.7), " +
    "0 0 1px 1px rgba(0,0,0,0.3), " +
    "inset 0px 1px 0px 0px #004593, " +
    "inset 0px -1px 0px 0px #D0A800;" +
    "}" +
    "</style>";

  // Додаємо стилі
  function addStyles() {
    if (typeof Lampa !== 'undefined' && Lampa.Template) {
      Lampa.Template.add('lampa_tracks_css_tv', styleTracks);
    }
    // Чекаємо готовності DOM
    function waitForDOM() {
      if (document.body && !document.getElementById('lampa_tracks_styles_tv')) {
        document.body.insertAdjacentHTML('beforeend', styleTracks);
      } else {
        setTimeout(waitForDOM, 100);
      }
    }
    waitForDOM();
  }

  // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ (оптимізовано для TV) =====================
  var requestQueue = [];
  var activeRequests = 0;

  function enqueueTask(fn) {
    requestQueue.push(fn);
    processQueue();
  }

  function processQueue() {
    if (activeRequests >= LTF_CONFIG.MAX_PARALLEL_REQUESTS || requestQueue.length === 0) {
      return;
    }
    
    var task = requestQueue.shift();
    if (!task) return;
    
    activeRequests++;
    
    try {
      task(function onTaskDone() {
        activeRequests--;
        setTimeout(processQueue, 0);
      });
    } catch (e) {
      console.error("LTF TV: помилка завдання", e);
      activeRequests--;
      setTimeout(processQueue, 0);
    }
  }

  // ===================== МЕРЕЖЕВІ ФУНКЦІЇ ДЛЯ TV =====================
  
  /**
   * Спрощена версія fetch для Samsung TV (використовує XMLHttpRequest)
   */
  function fetchForTV(url, callback) {
    var attempts = 0;
    var maxAttempts = LTF_CONFIG.MAX_RETRY_ATTEMPTS + 1;
    
    function attempt() {
      attempts++;
      if (attempts > maxAttempts) {
        callback(new Error('Досягнуто максимум спроб'));
        return;
      }
      
      // Вибираємо проксі
      var proxyIndex = (attempts - 1) % LTF_CONFIG.PROXY_LIST.length;
      var proxyUrl = LTF_CONFIG.PROXY_LIST[proxyIndex] + encodeURIComponent(url);
      
      var xhr = new XMLHttpRequest();
      var timeoutId = setTimeout(function() {
        xhr.abort();
        if (attempts < maxAttempts) {
          setTimeout(attempt, 500);
        } else {
          callback(new Error('Таймаут запиту'));
        }
      }, LTF_CONFIG.PROXY_TIMEOUT_MS);
      
      xhr.open('GET', proxyUrl, true);
      xhr.timeout = LTF_CONFIG.PROXY_TIMEOUT_MS;
      
      xhr.onload = function() {
        clearTimeout(timeoutId);
        if (xhr.status >= 200 && xhr.status < 300) {
          callback(null, xhr.responseText);
        } else if (attempts < maxAttempts) {
          setTimeout(attempt, 500);
        } else {
          callback(new Error('HTTP ' + xhr.status));
        }
      };
      
      xhr.onerror = function() {
        clearTimeout(timeoutId);
        if (attempts < maxAttempts) {
          setTimeout(attempt, 500);
        } else {
          callback(new Error('Мережева помилка'));
        }
      };
      
      try {
        xhr.send();
      } catch(e) {
        clearTimeout(timeoutId);
        callback(e);
      }
    }
    
    attempt();
  }

  // ===================== ДОПОМІЖНІ ФУНКЦІЇ =====================
  function getCardType(cardData) {
    var type = cardData.media_type || cardData.type;
    if (type === 'movie' || type === 'tv') return type;
    return cardData.name || cardData.original_name ? 'tv' : 'movie';
  }

  function countUkrainianTracks(title) {
    if (!title) return 0;
    var cleanTitle = title.toLowerCase();
    
    // Ігноруємо субтитри
    var subsIndex = cleanTitle.indexOf('sub');
    if (subsIndex !== -1) {
      cleanTitle = cleanTitle.substring(0, subsIndex);
    }
    
    // Шукаємо NxUkr
    var multiMatch = cleanTitle.match(/(\d+)x\s*ukr/);
    if (multiMatch && multiMatch[1]) {
      return parseInt(multiMatch[1], 10);
    }
    
    // Шукаємо окремі ukr
    var singleMatches = cleanTitle.match(/\bukr\b/g);
    return singleMatches ? singleMatches.length : 0;
  }

  function formatTrackLabel(count) {
    if (!count || count === 0) return null;
    
    switch (LTF_CONFIG.DISPLAY_MODE) {
      case 'flag_only':
        return ukraineFlagSVG;
      case 'flag_count':
        if (count === 1) return ukraineFlagSVG;
        return count + 'x' + ukraineFlagSVG;
      case 'text':
      default:
        if (count === 1) return 'Ukr';
        return count + 'xUkr';
    }
  }

  // ===================== ОНОВЛЕННЯ ІНТЕРФЕЙСУ =====================
  function updateCardListTracksElement(cardView, trackCount) {
    var displayLabel = formatTrackLabel(trackCount);
    var wrapper = cardView.querySelector('.card__tracks');
    
    // Якщо мітка не потрібна
    if (!displayLabel) {
      if (wrapper) wrapper.remove();
      return;
    }
    
    // Оновлення існуючої мітки
    if (wrapper) {
      var inner = wrapper.firstElementChild;
      if (!inner) {
        inner = document.createElement('div');
        wrapper.appendChild(inner);
      }
      
      if (inner.innerHTML !== displayLabel) {
        inner.innerHTML = displayLabel;
      }
      
      // Позиція відносно рейтингу
      var parentCard = cardView.closest('.card');
      if (parentCard) {
        var vote = parentCard.querySelector('.card__vote');
        if (vote) {
          var topStyle = window.getComputedStyle(vote).top;
          if (topStyle !== 'auto' && parseInt(topStyle) < 100) {
            wrapper.classList.add('positioned-below-rating');
          } else {
            wrapper.classList.remove('positioned-below-rating');
          }
        }
      }
      return;
    }
    
    // Створення нової мітки
    var newWrapper = document.createElement('div');
    newWrapper.className = 'card__tracks';
    
    var inner = document.createElement('div');
    inner.innerHTML = displayLabel;
    newWrapper.appendChild(inner);
    
    cardView.appendChild(newWrapper);
  }

  // ===================== ПОШУК НА JACRED (оптимізовано для TV) =====================
  function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
    enqueueTask(function(done) {
      // Перевірка дати
      if (!normalizedCard.release_date || 
          normalizedCard.release_date.toLowerCase().includes('невідомо')) {
        callback(null);
        done();
        return;
      }
      
      var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
      if (releaseDate && releaseDate.getTime() > Date.now()) {
        callback(null);
        done();
        return;
      }
      
      // Отримуємо рік
      var year = '';
      if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
        year = normalizedCard.release_date.substring(0, 4);
      }
      if (!year || isNaN(parseInt(year, 10))) {
        callback(null);
        done();
        return;
      }
      
      var searchYearNum = parseInt(year, 10);
      
      // Функція пошуку
      function searchJacredApi(searchTitle, searchYear, apiCallback) {
        var userId = '';
        try {
          userId = Lampa.Storage.get('lampac_unic_id', '');
        } catch(e) {}
        
        var apiUrl = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + 
                     '/api/v1.0/torrents?search=' + encodeURIComponent(searchTitle) +
                     '&year=' + searchYear + '&uid=' + userId;
        
        fetchForTV(apiUrl, function(error, responseText) {
          if (error || !responseText) {
            apiCallback(null);
            return;
          }
          
          try {
            var torrents = JSON.parse(responseText);
            if (!Array.isArray(torrents) || torrents.length === 0) {
              apiCallback(null);
              return;
            }
            
            var bestTrackCount = 0;
            
            for (var i = 0; i < torrents.length; i++) {
              var torrent = torrents[i];
              var torrentTitle = torrent.title.toLowerCase();
              
              // Фільтр фільм/серіал
              var isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод)/.test(torrentTitle);
              
              if (normalizedCard.type === 'tv' && !isSeriesTorrent) continue;
              if (normalizedCard.type === 'movie' && isSeriesTorrent) continue;
              
              // Перевірка року (спрощено)
              var torrentYear = 0;
              var yearMatch = torrentTitle.match(/(?:^|[^\d])(\d{4})(?:[^\d]|$)/);
              if (yearMatch) {
                torrentYear = parseInt(yearMatch[1], 10);
              }
              
              if (torrentYear > 1900 && Math.abs(torrentYear - searchYearNum) > 1) {
                continue;
              }
              
              // Підрахунок доріжок
              var trackCount = countUkrainianTracks(torrent.title);
              if (trackCount > bestTrackCount) {
                bestTrackCount = trackCount;
              }
            }
            
            if (bestTrackCount > 0) {
              apiCallback({ track_count: bestTrackCount });
            } else {
              apiCallback(null);
            }
          } catch(e) {
            apiCallback(null);
          }
        });
      }
      
      // Пошук за назвами
      var titlesToSearch = [normalizedCard.original_title, normalizedCard.title];
      var uniqueTitles = [];
      
      for (var i = 0; i < titlesToSearch.length; i++) {
        if (titlesToSearch[i] && uniqueTitles.indexOf(titlesToSearch[i]) === -1) {
          uniqueTitles.push(titlesToSearch[i]);
        }
      }
      
      if (uniqueTitles.length === 0) {
        callback(null);
        done();
        return;
      }
      
      // Спрощений паралельний пошук
      var completed = 0;
      var bestResult = null;
      var maxTrackCount = 0;
      
      function onSearchComplete(result) {
        completed++;
        if (result && result.track_count && result.track_count > maxTrackCount) {
          maxTrackCount = result.track_count;
          bestResult = result;
        }
        
        if (completed >= uniqueTitles.length) {
          callback(bestResult);
          done();
        }
      }
      
      // Запускаємо пошук для кожної назви
      for (var j = 0; j < uniqueTitles.length; j++) {
        searchJacredApi(uniqueTitles[j], year, onSearchComplete);
      }
    });
  }

  // ===================== РОБОТА З КЕШЕМ =====================
  function getTracksCache(key) {
    try {
      var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
      var item = cache[key];
      var isValid = item && (Date.now() - item.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS);
      return isValid ? item : null;
    } catch(e) {
      return null;
    }
  }

  function saveTracksCache(key, data) {
    try {
      var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
      cache[key] = {
        track_count: data.track_count || 0,
        timestamp: Date.now()
      };
      Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, cache);
    } catch(e) {
      console.error('LTF TV: помилка збереження кешу', e);
    }
  }

  function clearTracksCache() {
    try {
      Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
      console.log('UA-Finder TV: кеш очищено');
    } catch(e) {
      console.error('UA-Finder TV: помилка очищення кешу', e);
    }
  }

  // ===================== ОБРОБКА КАРТОК =====================
  function processListCard(cardElement) {
    if (!cardElement || !cardElement.isConnected) return;
    
    var cardData = cardElement.card_data;
    var cardView = cardElement.querySelector('.card__view');
    if (!cardData || !cardView) return;
    
    var isTvSeries = getCardType(cardData) === 'tv';
    if (isTvSeries && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;
    
    var normalizedCard = {
      id: cardData.id || '',
      title: cardData.title || cardData.name || '',
      original_title: cardData.original_title || cardData.original_name || '',
      type: getCardType(cardData),
      release_date: cardData.release_date || cardData.first_air_date || ''
    };
    
    var cardId = normalizedCard.id;
    var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + normalizedCard.type + '_' + cardId;
    
    // Ручні перевизначення
    var manualOverride = LTF_CONFIG.MANUAL_OVERRIDES[cardId];
    if (manualOverride) {
      updateCardListTracksElement(cardView, manualOverride.track_count);
      return;
    }
    
    // Перевірка кешу
    var cachedData = getTracksCache(cacheKey);
    
    if (cachedData) {
      updateCardListTracksElement(cardView, cachedData.track_count);
      
      if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
        getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
          var trackCount = liveResult ? liveResult.track_count : 0;
          saveTracksCache(cacheKey, { track_count: trackCount });
          
          if (document.body.contains(cardElement)) {
            updateCardListTracksElement(cardView, trackCount);
          }
        });
      }
    } else {
      getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
        var trackCount = liveResult ? liveResult.track_count : 0;
        saveTracksCache(cacheKey, { track_count: trackCount });
        
        if (document.body.contains(cardElement)) {
          updateCardListTracksElement(cardView, trackCount);
        }
      });
    }
  }

  // ===================== ІНІЦІАЛІЗАЦІЯ НА TV =====================
  function initializeForTV() {
    if (window.lampaTrackFinderPluginTV) return;
    window.lampaTrackFinderPluginTV = true;
    
    // Додаємо стилі
    addStyles();
    
    // Обробник для нових карток
    var cardsToProcess = [];
    var processing = false;
    
    function processBatch() {
      if (processing || cardsToProcess.length === 0) return;
      
      processing = true;
      var batch = cardsToProcess.splice(0, LTF_CONFIG.BATCH_SIZE);
      
      for (var i = 0; i < batch.length; i++) {
        if (batch[i].isConnected) {
          processListCard(batch[i]);
        }
      }
      
      processing = false;
      
      if (cardsToProcess.length > 0) {
        setTimeout(processBatch, LTF_CONFIG.PROCESS_DELAY);
      }
    }
    
    // Спостерігач DOM
    if (typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        var newCards = false;
        
        for (var i = 0; i < mutations.length; i++) {
          var addedNodes = mutations[i].addedNodes;
          for (var j = 0; j < addedNodes.length; j++) {
            var node = addedNodes[j];
            if (node.nodeType === 1) {
              if (node.classList && node.classList.contains('card')) {
                cardsToProcess.push(node);
                newCards = true;
              }
              
              var nestedCards = node.querySelectorAll('.card');
              for (var k = 0; k < nestedCards.length; k++) {
                cardsToProcess.push(nestedCards[k]);
                newCards = true;
              }
            }
          }
        }
        
        if (newCards) {
          setTimeout(processBatch, 150);
        }
      });
      
      // Починаємо спостереження
      setTimeout(function() {
        try {
          observer.observe(document.body, { 
            childList: true, 
            subtree: true 
          });
        } catch(e) {
          console.error('LTF TV: помилка спостерігача', e);
        }
      }, 1000);
    }
    
    // Обробка вже наявних карток
    setTimeout(function() {
      var existingCards = document.querySelectorAll('.card');
      for (var i = 0; i < existingCards.length; i++) {
        if (existingCards[i].card_data) {
          cardsToProcess.push(existingCards[i]);
        }
      }
      
      if (cardsToProcess.length > 0) {
        processBatch();
      }
    }, 2000);
    
    console.log('UA-Finder для Samsung TV ініціалізовано');
  }

  // Обробник події налаштувань
  document.addEventListener('ltf:settings-changed', function() {
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var view = card.querySelector('.card__view');
      var data = card.card_data;
      if (!view || !data) continue;
      
      var type = data.media_type || data.type || (data.name || data.original_name ? 'tv' : 'movie');
      if (type === 'tv' && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) {
        var ex = view.querySelector('.card__tracks');
        if (ex) ex.remove();
        continue;
      }
      
      var id = data.id || '';
      var manual = LTF_CONFIG.MANUAL_OVERRIDES && LTF_CONFIG.MANUAL_OVERRIDES[id];
      if (manual) {
        updateCardListTracksElement(view, manual.track_count || 0);
        continue;
      }
      
      var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + type + '_' + id;
      var cached = getTracksCache(cacheKey);
      var count = cached ? (cached.track_count || 0) : 0;
      updateCardListTracksElement(view, count);
    }
  });

  // ===================== НАЛАШТУВАННЯ ДЛЯ TV =====================
  (function() {
    'use strict';
    
    var SETTINGS_KEY = 'ltf_user_settings_tv_v1';
    var st;
    
    function ltfToast(msg) {
      try {
        if (Lampa && Lampa.Noty) {
          Lampa.Noty(msg);
          return;
        }
      } catch(e) {}
      
      var el = document.getElementById('ltf_toast_tv');
      if (!el) {
        el = document.createElement('div');
        el.id = 'ltf_toast_tv';
        el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:3rem;padding:.8rem 1.2rem;background:rgba(0,0,0,0.9);color:#fff;border-radius:.5rem;z-index:9999;font-size:16px;transition:opacity 0.3s;opacity:0';
        document.body.appendChild(el);
      }
      
      el.textContent = msg;
      el.style.opacity = '1';
      
      setTimeout(function() {
        el.style.opacity = '0';
      }, 1500);
    }
    
    function toBool(v) {
      return v === true || String(v) === 'true';
    }
    
    function load() {
      var s = {};
      try {
        s = Lampa.Storage.get(SETTINGS_KEY) || {};
      } catch(e) {}
      
      return {
        badge_style: s.badge_style || 'flag_count',
        show_tv: typeof s.show_tv === 'boolean' ? s.show_tv : true
      };
    }
    
    function apply() {
      LTF_CONFIG.DISPLAY_MODE = st.badge_style;
      LTF_CONFIG.BADGE_STYLE = st.badge_style;
      LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES = !!st.show_tv;
      LTF_CONFIG.SHOW_FOR_TV = !!st.show_tv;
      
      try {
        document.dispatchEvent(new CustomEvent('ltf:settings-changed'));
      } catch(e) {}
    }
    
    function save() {
      try {
        Lampa.Storage.set(SETTINGS_KEY, st);
        apply();
        ltfToast('Збережено');
      } catch(e) {
        console.error('LTF TV: помилка збереження налаштувань', e);
      }
    }
    
    function clearTracks() {
      clearTracksCache();
      ltfToast('Кеш очищено. Оновлюю дані...');
      
      // Поступове оновлення карток
      var cards = document.querySelectorAll('.card');
      var index = 0;
      
      function processNext() {
        if (index >= cards.length) return;
        
        var card = cards[index];
        if (card.isConnected) {
          processListCard(card);
        }
        
        index++;
        setTimeout(processNext, 300);
      }
      
      setTimeout(processNext, 500);
    }
    
    // Додаємо шаблон налаштувань
    if (typeof Lampa !== 'undefined' && Lampa.Template) {
      Lampa.Template.add('settings_ltf_tv', '<div></div>');
    }
    
    function registerUI() {
      if (!Lampa || !Lampa.SettingsApi) return;
      
      // Вхід у підменю
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
          type: 'button',
          component: 'ltf'
        },
        field: {
          name: 'Мітки "UA" доріжок',
          description: 'Керування відображенням міток українських доріжок'
        },
        onChange: function() {
          Lampa.Settings.create('ltf', {
            template: 'settings_ltf_tv',
            onBack: function() {
              Lampa.Settings.create('interface');
            }
          });
        }
      });
      
      // Пункти підменю
      Lampa.SettingsApi.addParam({
        component: 'ltf',
        param: {
          name: 'ltf_badge_style',
          type: 'select',
          values: {
            text: 'Текстова мітка ("Ukr", "2xUkr")',
            flag_count: 'Прапорець із лічильником',
            flag_only: 'Лише прапорець'
          },
          default: st.badge_style
        },
        field: {
          name: 'Стиль мітки'
        },
        onChange: function(v) {
          st.badge_style = v;
          save();
        }
      });
      
      Lampa.SettingsApi.addParam({
        component: 'ltf',
        param: {
          name: 'ltf_show_tv',
          type: 'select',
          values: {
            'true': 'Увімкнено',
            'false': 'Вимкнено'
          },
          default: String(st.show_tv)
        },
        field: {
          name: 'Показувати для серіалів'
        },
        onChange: function(v) {
          st.show_tv = toBool(v);
          save();
        }
      });
      
      Lampa.SettingsApi.addParam({
        component: 'ltf',
        param: {
          type: 'button',
          component: 'ltf_clear_cache'
        },
        field: {
          name: 'Очистити кеш доріжок'
        },
        onChange: clearTracks
      });
    }
    
    function start() {
      st = load();
      apply();
      
      if (Lampa && Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
        // Чекаємо трохи перед реєстрацією UI
        setTimeout(registerUI, 500);
      }
    }
    
    // Запуск налаштувань
    if (window.appready) {
      setTimeout(start, 1000);
    } else if (Lampa && Lampa.Listener) {
      Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
          setTimeout(start, 1000);
        }
      });
    }
  })();

  // ===================== ЗАПУСК ПЛАГІНА =====================
  function startPlugin() {
    // Чекаємо, доки Lampa буде готова
    if (typeof Lampa !== 'undefined') {
      setTimeout(initializeForTV, 1500);
    } else {
      var checkInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
          clearInterval(checkInterval);
          setTimeout(initializeForTV, 1500);
        }
      }, 500);
    }
  }
  
  // Запускаємо при завантаженні сторінки
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(startPlugin, 1000);
    });
  } else {
    setTimeout(startPlugin, 1000);
  }
})();
