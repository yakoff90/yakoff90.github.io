/**
 * Lampa Track Finder v3 (Samsung TV Compatible)
 * --------------------------------------------------------------------------------
 * Цей плагін призначений для пошуку та відображення інформації про наявність
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * Адаптовано для Samsung TV (обмежена підтримка ES6+)
 * --------------------------------------------------------------------------------
 */

(function() {
    'use strict';

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА =====================
    
    // Прапор у форматі base64 для кращої сумісності
    var ukraineFlagSVG = '<i class="flag-css"></i>';
    
    var LTF_CONFIG = window.LTF_CONFIG || {
        BADGE_STYLE: 'text',
        SHOW_FOR_TV: true,
        CACHE_VERSION: 4,
        CACHE_KEY: 'lampa_ukr_tracks_cache',
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000,
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000,
        LOGGING_GENERAL: true,
        LOGGING_TRACKS: true,
        LOGGING_CARDLIST: true,
        JACRED_PROTOCOL: 'https://',
        JACRED_URL: 'jacred.xyz',
        PROXY_LIST: [
            'https://my-finder.kozak-bohdan.workers.dev/?url=',
            'http://cors.bwa.workers.dev/',
            'https://api.allorigins.win/raw?url='
        ],
        PROXY_TIMEOUT_MS: 3000,
        MAX_PARALLEL_REQUESTS: 15,
        MAX_RETRY_ATTEMPTS: 2,
        SHOW_TRACKS_FOR_TV_SERIES: true,
        DISPLAY_MODE: 'flag_count',
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
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var hasOld = false;
        var keys = Object.keys(cache);
        for (var i = 0; i < keys.length; i++) {
            if (!keys[i].startsWith(LTF_CONFIG.CACHE_VERSION + '_')) {
                hasOld = true;
                break;
            }
        }
        if (hasOld) {
            console.log('UA-Finder: виявлено старий кеш, виконується очищення...');
            Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
        }
    })();

    // ===================== СТИЛІ CSS =====================
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        ".card__view { position: relative; }" +
        ".card__tracks {" +
        " position: absolute !important;" +
        " right: 0.3em !important;" +
        " left: auto !important;" +
        " top: 0.3em !important;" +
        " background: rgba(0,0,0,0.5) !important;" +
        " color: #FFFFFF !important;" +
        " font-size: 1.3em !important;" +
        " padding: 0.2em 0.5em !important;" +
        " border-radius: 1em !important;" +
        " font-weight: 700 !important;" +
        " z-index: 20 !important;" +
        " width: fit-content !important;" +
        " max-width: calc(100% - 1em) !important;" +
        " overflow: hidden !important;" +
        "}" +
        ".card__tracks.positioned-below-rating {" +
        " top: 1.85em !important;" +
        "}" +
        ".card__tracks div {" +
        " text-transform: none !important;" +
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important;" +
        " font-weight: 700 !important;" +
        " letter-spacing: 0.1px !important;" +
        " font-size: 1.05em !important;" +
        " color: #FFFFFF !important;" +
        " padding: 0 !important;" +
        " white-space: nowrap !important;" +
        " display: flex !important;" +
        " align-items: center !important;" +
        " gap: 4px !important;" +
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important;" +
        "}" +
        ".card__tracks .flag-css {" +
        " display: inline-block;" +
        " width: 1.5em;" +
        " height: 0.8em;" +
        " vertical-align: middle;" +
        " background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%);" +
        " border-radius: 2px;" +
        " border: none !important;" +
        " box-shadow: 0 0 2px 0 rgba(0,0,0,0.6), 0 0 1px 1px rgba(0,0,0,0.2), inset 0px 1px 0px 0px #004593, inset 0px -1px 0px 0px #D0A800;" +
        "}" +
        "</style>";
    
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ =====================
    var requestQueue = [];
    var activeRequests = 0;
    var networkHealth = 1.0;

    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }

    function processQueue() {
        var adaptiveLimit = LTF_CONFIG.MAX_PARALLEL_REQUESTS;
        if (activeRequests >= adaptiveLimit) return;
        
        var task = requestQueue.shift();
        if (!task) return;

        activeRequests++;
        
        try {
            task(function onTaskDone() {
                activeRequests--;
                setTimeout(processQueue, 0);
            });
        } catch (e) {
            console.error("LTF-LOG", "Помилка виконання завдання:", e);
            activeRequests--;
            setTimeout(processQueue, 0);
        }
    }

    function updateNetworkHealth(success) {
        if (success) {
            networkHealth = Math.min(1.0, networkHealth + 0.1);
        } else {
            networkHealth = Math.max(0.3, networkHealth - 0.2);
        }
        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG", "Оновлено здоров'я мережі:", networkHealth);
    }

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= LTF_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    updateNetworkHealth(false);
                    callback(new Error('Всі проксі не відповіли для ' + url));
                }
                return;
            }
            
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, LTF_CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Помилка проксі: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        updateNetworkHealth(true);
                        callback(null, data);
                    }
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy();
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
        var subsIndex = cleanTitle.indexOf('sub');
        if (subsIndex !== -1) {
            cleanTitle = cleanTitle.substring(0, subsIndex);
        }

        var multiTrackMatch = cleanTitle.match(/(\d+)x\s*ukr/);
        if (multiTrackMatch && multiTrackMatch[1]) {
            return parseInt(multiTrackMatch[1], 10);
        }

        var singleTrackMatches = cleanTitle.match(/\bukr\b/g);
        if (singleTrackMatches) {
            return singleTrackMatches.length;
        }

        return 0;
    }

    function formatTrackLabel(count) {
        if (!count || count === 0) return null;

        if (LTF_CONFIG.DISPLAY_MODE === 'flag_only') {
            return ukraineFlagSVG;
        } else if (LTF_CONFIG.DISPLAY_MODE === 'flag_count') {
            if (count === 1) return ukraineFlagSVG;
            return count + 'x' + ukraineFlagSVG;
        } else {
            if (count === 1) return 'Ukr';
            return count + 'xUkr';
        }
    }

    // ===================== ПОШУК НА JACRED =====================
    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {
            if (!normalizedCard.release_date || normalizedCard.release_date.toLowerCase().indexOf('невідомо') !== -1 || isNaN(new Date(normalizedCard.release_date).getTime())) {
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
            
            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                var currentYear = new Date().getFullYear();
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 2) {
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            function searchJacredApi(searchTitle, searchYear, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', '');
                var apiUrl = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    '&uid=' + userId;
                
                fetchWithProxy(apiUrl, cardId, function(error, responseText) {
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
                        var bestFoundTorrent = null;

                        for (var i = 0; i < torrents.length; i++) {
                            var currentTorrent = torrents[i];
                            var torrentTitle = currentTorrent.title.toLowerCase();

                            var isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(torrentTitle);
                            
                            if (normalizedCard.type === 'tv' && !isSeriesTorrent) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Пропускаємо (схожий на фільм для картки серіалу):', currentTorrent.title);
                                continue;
                            }
                            if (normalizedCard.type === 'movie' && isSeriesTorrent) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Пропускаємо (схожий на серіал для картки фільму):', currentTorrent.title);
                                continue;
                            }
                            
                            if (normalizedCard.type === 'movie') {
                                var hasStrongSeriesIndicators = /(сезон|season|s\d|серії|episodes|епізод|\d+×\d+)/i.test(torrentTitle);
                                if (hasStrongSeriesIndicators) {
                                    if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Пропускаємо (чіткі ознаки серіалу для картки фільму):', currentTorrent.title);
                                    continue;
                                }
                            }
                            
                            var parsedYear = extractYearFromTitle(currentTorrent.title) || parseInt(currentTorrent.relased, 10);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);

                            if (parsedYear > 1900 && yearDifference > 0) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Пропускаємо (рік не співпадає: ' + parsedYear + ' vs ' + searchYearNum + '):', currentTorrent.title);
                                continue;
                            }
                            
                            var currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            if (currentTrackCount > bestTrackCount) {
                                bestTrackCount = currentTrackCount;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentTrackCount === bestTrackCount && bestTrackCount > 0 && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        if (bestFoundTorrent) {
                            apiCallback({ track_count: bestTrackCount });
                        } else {
                            apiCallback(null);
                        }
                    } catch (e) {
                        apiCallback(null);
                    }
                });
            }

            var titlesToSearch = [normalizedCard.original_title, normalizedCard.title];
            var uniqueTitles = [];
            var seen = {};
            for (var i = 0; i < titlesToSearch.length; i++) {
                var title = titlesToSearch[i];
                if (title && !seen[title]) {
                    seen[title] = true;
                    uniqueTitles.push(title);
                }
            }
            
            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', '[' + cardId + '] Запускаємо пошук за назвами:', uniqueTitles);
            
            var searchPromises = [];
            for (var j = 0; j < uniqueTitles.length; j++) {
                searchPromises.push(new Promise(function(resolve) {
                    searchJacredApi(uniqueTitles[j], year, resolve);
                }));
            }

            Promise.all(searchPromises).then(function(results) {
                var bestOverallResult = null;
                var maxTrackCount = 0;
                
                for (var k = 0; k < results.length; k++) {
                    var result = results[k];
                    if (!result || !result.track_count) continue;
                    if (result.track_count > maxTrackCount) {
                        maxTrackCount = result.track_count;
                        bestOverallResult = result;
                    }
                }
                
                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', '[' + cardId + '] Найкращий результат з усіх пошуків:', bestOverallResult);
                
                callback(bestOverallResult);
                done();
            });
        });
    }

    // ===================== РОБОТА З КЕШЕМ =====================
    function getTracksCache(key) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var item = cache[key];
        var isCacheValid = item && (Date.now() - item.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS);
        return isCacheValid ? item : null;
    }

    function saveTracksCache(key, data) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        cache[key] = {
            track_count: data.track_count,
            timestamp: Date.now()
        };
        Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, cache);
    }

    function clearTracksCache() {
        Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
        console.log('UA-Finder: Кеш повністю очищено.');
        var cache = {};
        Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, cache);
    }
    
    document.addEventListener('ltf:settings-changed', function(){
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var view = card.querySelector('.card__view');
            var data = card.card_data;
            if (!view || !data) continue;

            var type = (data.media_type || data.type || (data.name || data.original_name ? 'tv' : 'movie'));
            if (type === 'tv' && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES){
                var ex = view.querySelector('.card__tracks');
                if (ex) ex.remove();
                continue;
            }

            var id = data.id || '';
            var manual = LTF_CONFIG.MANUAL_OVERRIDES && LTF_CONFIG.MANUAL_OVERRIDES[id];
            if (manual){
                updateCardListTracksElement(view, manual.track_count || 0);
                continue;
            }

            var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + type + '_' + id;
            var cached = getTracksCache(cacheKey);
            var count = cached ? (cached.track_count || 0) : 0;

            updateCardListTracksElement(view, count);
        }
    });

    // ===================== ОНОВЛЕННЯ ІНТЕРФЕЙСУ =====================
    function updateCardListTracksElement(cardView, trackCount) {
        var displayLabel = formatTrackLabel(trackCount);
        var wrapper = cardView.querySelector('.card__tracks');

        function ensurePositionClass(el){
            var parentCard = cardView.closest('.card');
            if (!parentCard) return;
            var vote = parentCard.querySelector('.card__vote');
            if (!vote) {
                el.classList.remove('positioned-below-rating');
                return;
            }
            var topStyle = getComputedStyle(vote).top;
            if (topStyle !== 'auto' && parseInt(topStyle) < 100) {
                el.classList.add('positioned-below-rating');
            } else {
                el.classList.remove('positioned-below-rating');
            }
        }

        if (!displayLabel) {
            if (wrapper) wrapper.remove();
            return;
        }

        if (wrapper) {
            var inner = wrapper.firstElementChild;
            if (!inner) {
                inner = document.createElement('div');
                wrapper.appendChild(inner);
            }

            if (inner.innerHTML === displayLabel) {
                ensurePositionClass(wrapper);
                return;
            }

            inner.innerHTML = displayLabel;
            ensurePositionClass(wrapper);
            return;
        }

        var newWrapper = document.createElement('div');
        newWrapper.className = 'card__tracks';

        var inner = document.createElement('div');
        inner.innerHTML = displayLabel;

        newWrapper.appendChild(inner);
        ensurePositionClass(newWrapper);
        cardView.appendChild(newWrapper);
    }

    function reprocessVisibleCardsChunked(){
        var cards = document.querySelectorAll('.card');
        var visibleCards = [];
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].isConnected && document.body.contains(cards[i])) {
                visibleCards.push(cards[i]);
            }
        }
        
        var BATCH = 20, DELAY = 25;
        var i = 0;
        
        function tick() {
            var part = visibleCards.slice(i, i + BATCH);
            for (var j = 0; j < part.length; j++) {
                processListCard(part[j]);
            }
            i += BATCH;
            if (i < visibleCards.length) {
                setTimeout(tick, DELAY);
            }
        }
        tick();
    }
    
    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    function processListCard(cardElement) {
        if (!cardElement || !cardElement.isConnected || !document.body.contains(cardElement)) {
            return;
        }
        
        var cardData = cardElement.card_data;
        var cardView = cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        var isTvSeries = (getCardType(cardData) === 'tv');
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

        var manualOverrideData = LTF_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Використовується ручне перевизначення:', manualOverrideData);
            updateCardListTracksElement(cardView, manualOverrideData.track_count);
            return;
        }

        var cachedData = getTracksCache(cacheKey);

        if (cachedData) {
            updateCardListTracksElement(cardView, cachedData.track_count);
            
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Кеш застарілий, фонове оновлення...');
                
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    var trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    
                    if (document.body.contains(cardElement)) {
                        updateCardListTracksElement(cardView, trackCount);
                    }
                });
            }
        } else {
            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG [' + cardId + ']: Кеш відсутній, новий пошук...');
            
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                var trackCount = liveResult ? liveResult.track_count : 0;
                saveTracksCache(cacheKey, { track_count: trackCount });
                
                if (document.body.contains(cardElement)) {
                    updateCardListTracksElement(cardView, trackCount);
                }
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    var observerDebounceTimer = null;
    var cardsToProcess = [];

    function debouncedProcessCards() {
        clearTimeout(observerDebounceTimer);
        
        observerDebounceTimer = setTimeout(function() {
            var uniqueCards = [];
            var seen = {};
            for (var i = 0; i < cardsToProcess.length; i++) {
                var card = cardsToProcess[i];
                if (!seen[card]) {
                    seen[card] = true;
                    uniqueCards.push(card);
                }
            }
            cardsToProcess = [];
            
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG: Обробка пачки з", uniqueCards.length, "карток.");

            var BATCH_SIZE = 12;
            var DELAY_MS = 30;

            function processBatch(startIndex) {
                var currentBatch = uniqueCards.slice(startIndex, startIndex + BATCH_SIZE);
                
                for (var i = 0; i < currentBatch.length; i++) {
                    var card = currentBatch[i];
                    if (card.isConnected && document.body.contains(card)) {
                        processListCard(card);
                    }
                }
                
                var nextIndex = startIndex + BATCH_SIZE;
                if (nextIndex < uniqueCards.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                }
            }
            
            if (uniqueCards.length > 0) {
                processBatch(0);
            }
        }, 150);
    }

    var observer = new MutationObserver(function(mutations) {
        var newCardsFound = false;
        for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (mutation.addedNodes) {
                var nodes = mutation.addedNodes;
                for (var j = 0; j < nodes.length; j++) {
                    var node = nodes[j];
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('card')) {
                            cardsToProcess.push(node);
                            newCardsFound = true;
                        }
                        var nestedCards = node.querySelectorAll('.card');
                        if (nestedCards.length) {
                            for (var k = 0; k < nestedCards.length; k++) {
                                cardsToProcess.push(nestedCards[k]);
                            }
                            newCardsFound = true;
                        }
                    }
                }
            }
        }
        
        if (newCardsFound) {
            debouncedProcessCards();
        }
    });

    function initializeLampaTracksPlugin() {
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length) {
            for (var i = 0; i < containers.length; i++) {
                observer.observe(containers[i], { childList: true, subtree: true });
            }
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        setTimeout(function () {
            var allCards = document.querySelectorAll('.card');
            if (LTF_CONFIG.LOGGING_GENERAL && allCards.length > 0) {
                 console.log('UA-Finder: Разова перевірка кешу для ' + allCards.length + ' карток...');
            }
            for (var i = 0; i < allCards.length; i++) {
                var card = allCards[i];
                if (card.card_data && card.querySelector('.card__view')) {
                    processListCard(card);
                }
            }
        }, 1200);

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок (v3.3 Samsung) успішно ініціалізовано!");
    }

    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }

    // ===================== НАЛАШТУВАННЯ =====================
    (function(){
        var SETTINGS_KEY = 'ltf_user_settings_v1';
        var st;

        function ltfToast(msg){
            try { if (Lampa && Lampa.Noty) return Lampa.Noty(msg); } catch(e){}
            var id='ltf_toast', el=document.getElementById(id);
            if(!el){
                el=document.createElement('div');
                el.id=id;
                el.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
                document.body.appendChild(el);
            }
            el.textContent=msg; el.style.opacity='1';
            setTimeout(function(){ el.style.opacity='0'; },1300);
        }

        function toBool(v){ return v===true || String(v)==='true'; }

        function load(){
            var s = Lampa.Storage.get(SETTINGS_KEY) || {};
            return {
                badge_style: s.badge_style || 'text',
                show_tv: (typeof s.show_tv === 'boolean') ? s.show_tv : true
            };
        }

        function apply(){
            LTF_CONFIG.DISPLAY_MODE = st.badge_style;
            LTF_CONFIG.BADGE_STYLE = st.badge_style;
            LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES = !!st.show_tv;
            LTF_CONFIG.SHOW_FOR_TV = !!st.show_tv;
            try {
                document.dispatchEvent(new CustomEvent('ltf:settings-changed',{detail:st}));
            } catch(e){}
        }

        function save(){ Lampa.Storage.set(SETTINGS_KEY, st); apply(); ltfToast('Збережено'); }

        function clearTracks(){
            try {
                clearTracksCache();
            } catch(e) {
                Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
            }

            try{
                document.dispatchEvent(new CustomEvent('ltf:settings-changed',{detail:st}));
            }catch(e){}
            
            ltfToast('Кеш очищено. Оновлюю дані...');

            var cards = document.querySelectorAll('.card');
            var index = 0;

            function processNext() {
                if (index >= cards.length) return;
                var card = cards[index];
                if (card.isConnected) {
                    if(typeof processListCard === 'function') {
                        processListCard(card);
                    }
                }
                index++;
                setTimeout(processNext, 250);
            }
            processNext();
        }

        Lampa.Template.add('settings_ltf','<div></div>');

        function registerUI(){
            Lampa.SettingsApi.addParam({
                component:'interface',
                param:{ type:'button', component:'ltf' },
                field:{ name:'Мітки "UA" доріжок', description:'Керування відображенням міток українських доріжок' },
                onChange:function(){
                    Lampa.Settings.create('ltf', {
                        template:'settings_ltf',
                        onBack:function(){ Lampa.Settings.create('interface'); }
                    });
                }
            });

            Lampa.SettingsApi.addParam({
                component:'ltf',
                param:{ name:'ltf_badge_style', type:'select',
                    values:{ text:'Текстова мітка ("Ukr", "2xUkr")', flag_count:'Прапорець із лічильником', flag_only:'Лише прапорець' },
                    default: st.badge_style
                },
                field:{ name:'Стиль мітки' },
                onChange:function(v){ st.badge_style=v; save(); }
            });

            Lampa.SettingsApi.addParam({
                component:'ltf',
                param:{ name:'ltf_show_tv', type:'select', values:{'true':'Увімкнено','false':'Вимкнено'}, default:String(st.show_tv) },
                field:{ name:'Показувати для серіалів' },
                onChange:function(v){ st.show_tv = toBool(v); save(); }
            });

            Lampa.SettingsApi.addParam({
                component:'ltf',
                param:{ type:'button', component:'ltf_clear_cache' },
                field:{ name:'Очистити кеш доріжок' },
                onChange: clearTracks
            });
        }

        function start(){ 
            st=load(); 
            apply(); 
            
            if (Lampa && Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
                setTimeout(registerUI, 0);
            }
        }
        
        if (window.appready) start();
        else if (Lampa && Lampa.Listener) Lampa.Listener.follow('app', function(e){ if(e.type==='ready') start(); });
    })();

})();
