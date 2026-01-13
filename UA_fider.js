
/**
 * Lampa Track Finder v3.4
 * --------------------------------------------------------------------------------
 * Цей плагін призначений для пошуку та відображення інформації про наявність
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * --------------------------------------------------------------------------------
 * Основні можливості:
 * - Шукає згадки українських доріжок (Ukr, 2xUkr і т.д.) у назвах торрентів.
 * - Ігнорує українські субтитри, аналізуючи лише частину назви до слова "sub".
 * - Виконує паралельний пошук за оригінальною та локалізованою назвою для максимального охоплення.
 * - Обирає реліз з найбільшою кількістю знайдених українських доріжок.
 * - Має надійний дворівневий фільтр для розрізнення фільмів та серіалів.
 * - Оптимізована обробка карток (дебаунсинг) для уникнення пропусків та підвищення продуктивності.
 * - Відображає мітку на постерах (динамічно адаптується до присутності плагіна RatingUp).
 * - Має систему кешування для зменшення навантаження та пришвидшення роботи.
 * - Не виконує пошук для майбутніх релізів або релізів з невідомою датою.
 *
 * --------------------------------------------------------------------------------
 * - 🟩 ДОДАНО: Розширено 'DISPLAY_MODE'. Тепер 3 опції: 'text', 'flag_count', 'flag_only'.(Прапор в SVG)
 * - 🟩 ДОДАНО: Детальні коментарі для всіх функцій, блоків та ключових налаштувань
 * - 🟩 Повністю перероблено логіку `processListCard` на ідемпотентну.
 * - 🟩 Мітки, що зникали при перемальовуванні DOM ("автозцілення").
 * - 🟩 "Примарні" мітки (хибний кеш) тепер коректно видаляються.
 * - 🟩 Збережено оптимізації (дебаунс, пакетна обробка).
 * - 🟩 Додано разову перевірку кешу при старті.
 * - 🟩 ВИПРАВЛЕНО: Проблема з показом міток для більшості фільмів
 */
(function() {
    'use strict';

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    
    // ✅ використовуємо CSS для швидкості відмальовки прапора 
    var ukraineFlagSVG = '<i class="flag-css"></i>';
    
    // Головний об'єкт конфігурації
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 6, // ❗ ЗБІЛЬШЕНО для примусового скидання кешу
        CACHE_KEY: 'lampa_ukr_tracks_cache',
        CACHE_VALID_TIME_MS: 12 * 60 * 60 * 1000, // 12 годин
        CACHE_REFRESH_THRESHOLD_MS: 6 * 60 * 60 * 1000, // 6 годин

        // --- Налаштування логування для налагодження ---
        LOGGING_GENERAL: true, // УВІМКНЕНО для діагностики
        LOGGING_TRACKS: true, // УВІМКНЕНО для діагностики
        LOGGING_CARDLIST: true, // УВІМКНЕНО для діагностики

        // --- Налаштування API та мережі ---
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        PROXY_LIST: [ // ОНОВЛЕНО список проксі
            'https://api.allorigins.win/raw?url=',
            'https://cors.bwa.workers.dev/?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest='
        ],
        PROXY_TIMEOUT_MS: 5000, // ЗБІЛЬШЕНО до 5 секунд
        MAX_PARALLEL_REQUESTS: 8,
        MAX_RETRY_ATTEMPTS: 2,

        // --- Налаштування функціоналу ---
        SHOW_TRACKS_FOR_TV_SERIES: true,

        // --- Налаштування відображення ---
        DISPLAY_MODE: 'flag_count', // 'text', 'flag_count', 'flag_only'

        // --- Ручні перевизначення доріжок для конкретних ID контенту ---
        MANUAL_OVERRIDES: {
            '207703': { track_count: 1 },    // Примусово показувати Ukr
            '1195518': { track_count: 2 },   // Примусово показувати 2xUkr
            '21595': { track_count: 2 },     // Примусово показувати 2xUkr
            '1234821': { track_count: 2 },   // Примусово показувати 2xUkr
            '933260': { track_count: 3 },    // Примусово показувати 3xUkr
            '245827': { track_count: 0 }     // Примусово не показувати Ukr
        }
    };

    // ======== АВТОМАТИЧНЕ СКИДАННЯ СТАРОГО КЕШУ ПРИ ОНОВЛЕННІ ========
    (function resetOldCache() {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var hasOld = Object.keys(cache).some(k => !k.startsWith(LTF_CONFIG.CACHE_VERSION + '_'));
        if (hasOld) {
            console.log('UA-Finder: Виявлено старий кеш, очищуємо...');
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
        var adaptiveLimit = Math.max(3, Math.min(LTF_CONFIG.MAX_PARALLEL_REQUESTS, Math.floor(LTF_CONFIG.MAX_PARALLEL_REQUESTS * networkHealth)));
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
        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG", "Мережеве здоров'я:", networkHealth);
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
            
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex];
            // Додаємо URL різними способами залежно від формату проксі
            if (proxyUrl.includes('?url=') || proxyUrl.includes('?quest=')) {
                proxyUrl += encodeURIComponent(url);
            } else if (proxyUrl.endsWith('?')) {
                proxyUrl += encodeURIComponent(url);
            } else {
                proxyUrl += encodeURIComponent(url);
            }
            
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG", `[${cardId}] Проксі ${currentProxyIndex} таймаут`);
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, LTF_CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error('Помилка проксі: ' + response.status);
                    }
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
                        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG", `[${cardId}] Проксі ${currentProxyIndex} помилка:`, error);
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

    // ===================== ОСНОВНА ЛОГІКА ПІДРАХУНКУ ДОРІЖОК =====================
    function countUkrainianTracks(title) {
        if (!title) return 0;
        let cleanTitle = title.toLowerCase();
        
        const subsIndex = cleanTitle.indexOf('sub');
        if (subsIndex !== -1) {
            cleanTitle = cleanTitle.substring(0, subsIndex);
        }

        // Розширений пошук українських доріжок
        const patterns = [
            /(\d+)x\s*ukr/i,        // 2xUkr, 3xUkr
            /ukr\s*(\d+)x/i,        // Ukr2x (альтернативний формат)
            /\bukr\b/i,             // Ukr
            /\bукр\b/i,             // Укр (кирилицею)
            /українська/i,          // Українська
            /український/i,         // Український
            /украінська/i,          // Украінська (з помилкою)
            /українською/i          // Українською
        ];

        // Спочатку шукаємо мульти-доріжки
        const multiTrackMatch = cleanTitle.match(patterns[0]) || cleanTitle.match(patterns[1]);
        if (multiTrackMatch && multiTrackMatch[1]) {
            return parseInt(multiTrackMatch[1], 10);
        }

        // Рахуємо всі знайдені згадки
        let totalCount = 0;
        for (let i = 2; i < patterns.length; i++) {
            const matches = cleanTitle.match(patterns[i]);
            if (matches) {
                totalCount += matches.length;
            }
        }

        return totalCount;
    }

    function formatTrackLabel(count) {
        if (!count || count === 0) return null;

        switch (LTF_CONFIG.DISPLAY_MODE) {
            case 'flag_only':
                return ukraineFlagSVG;
            case 'flag_count':
                if (count === 1) return ukraineFlagSVG;
                return `${count}x${ukraineFlagSVG}`;
            case 'text':
            default:
                if (count === 1) return 'Ukr';
                return `${count}xUkr`;
        }
    }

    // ===================== ПОШУК НА JACRED =====================
    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {
            if (!normalizedCard.release_date || normalizedCard.release_date.toLowerCase().includes('невідомо') || isNaN(new Date(normalizedCard.release_date).getTime())) {
                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо - невірна дата:`, normalizedCard.release_date);
                callback(null);
                done();
                return;
            }
            
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо - майбутній реліз:`, normalizedCard.release_date);
                callback(null);
                done();
                return;
            }

            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(parseInt(year, 10))) {
                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо - невірний рік:`, year);
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
                
                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Запит до API:`, apiUrl);
                
                fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                    if (error || !responseText) {
                        if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Помилка API:`, error);
                        apiCallback(null);
                        return;
                    }
                    
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Торрентів не знайдено`);
                            apiCallback(null);
                            return;
                        }

                        if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Знайдено торрентів:`, torrents.length);

                        let bestTrackCount = 0;
                        let bestFoundTorrent = null;

                        for (let i = 0; i < torrents.length; i++) {
                            const currentTorrent = torrents[i];
                            const torrentTitle = currentTorrent.title.toLowerCase();

                            // ПОСЛАБЛЕНО: Фільтр фільм/серіал
                            const isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(torrentTitle);
                            
                            // Тільки явні конфлікти (серіал vs фільм)
                            if (normalizedCard.type === 'movie' && isSeriesTorrent && /(сезон|season|s\d{1,2})/.test(torrentTitle)) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо - явний серіал для фільму:`, currentTorrent.title);
                                continue;
                            }
                            
                            // ПОСЛАБЛЕНО: Фільтр за роком (дозволяє різницю в 2 роки)
                            var parsedYear = extractYearFromTitle(currentTorrent.title) || parseInt(currentTorrent.relased, 10);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);

                            if (parsedYear > 1900 && yearDifference > 2) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо - рік не співпадає (${parsedYear} vs ${searchYearNum}):`, currentTorrent.title);
                                continue;
                            }
                            
                            const currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            if (currentTrackCount > 0 && LTF_CONFIG.LOGGING_TRACKS) {
                                console.log(`LTF-LOG [${cardId}]: Знайдено ${currentTrackCount} доріжок у:`, currentTorrent.title);
                            }
                            
                            if (currentTrackCount > bestTrackCount) {
                                bestTrackCount = currentTrackCount;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentTrackCount === bestTrackCount && bestTrackCount > 0 && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        if (bestFoundTorrent) {
                            if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Найкращий торрент:`, bestFoundTorrent.title, `(${bestTrackCount} доріжок)`);
                            apiCallback({ track_count: bestTrackCount });
                        } else {
                            if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Українських доріжок не знайдено`);
                            apiCallback(null);
                        }
                    } catch (e) {
                        if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Помилка парсингу JSON:`, e);
                        apiCallback(null);
                    }
                });
            }

            const titlesToSearch = [ normalizedCard.original_title, normalizedCard.title ];
            const uniqueTitles = [...new Set(titlesToSearch)].filter(Boolean);
            
            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Пошук за назвами:`, uniqueTitles);
            
            const searchPromises = uniqueTitles.map(title => {
                return new Promise(resolve => {
                    searchJacredApi(title, year, resolve);
                });
            });

            Promise.all(searchPromises).then(results => {
                let bestOverallResult = null;
                let maxTrackCount = 0;
                
                results.forEach(result => {
                    if (!result || !result.track_count) return;
                    if (result.track_count > maxTrackCount) {
                        maxTrackCount = result.track_count;
                        bestOverallResult = result;
                    }
                });
                
                if (LTF_CONFIG.LOGGING_TRACKS) {
                    console.log('LTF-LOG', `[${cardId}] Фінальний результат:`, 
                        bestOverallResult ? `${bestOverallResult.track_count} доріжок` : 'не знайдено');
                }
                
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
    
    // ===================== ОНОВЛЕННЯ ІНТЕРФЕЙСУ (UI) =====================
    function updateCardListTracksElement(cardView, trackCount) {
        const displayLabel = formatTrackLabel(trackCount); 
        const existingElement = cardView.querySelector('.card__tracks');
        
        if (!displayLabel) {
            if (existingElement) existingElement.remove();
            return;
        }
        
        if (existingElement && existingElement.innerHTML === displayLabel) {
            return;
        }
        
        if (existingElement) existingElement.remove();
        
        const trackDiv = document.createElement('div');
        trackDiv.className = 'card__tracks';

        const parentCard = cardView.closest('.card');
        if (parentCard) {
            const voteElement = parentCard.querySelector('.card__vote');
            if (voteElement) {
                 const topStyle = getComputedStyle(voteElement).top;
                 if (topStyle !== 'auto' && parseInt(topStyle) < 100) {
                     trackDiv.classList.add('positioned-below-rating');
                 }
            }
        }
        
        const innerElement = document.createElement('div');
        innerElement.innerHTML = displayLabel;
        
        trackDiv.appendChild(innerElement);
        cardView.appendChild(trackDiv);
        
        if (LTF_CONFIG.LOGGING_CARDLIST && trackCount > 0) {
            console.log("LTF-LOG: Намальовано мітку", trackCount, "доріжок");
        }
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
        var cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${normalizedCard.type}_${cardId}`;

        if (LTF_CONFIG.LOGGING_CARDLIST) {
            console.log(`LTF-LOG [${cardId}]: Обробка картки:`, normalizedCard.title, `(${normalizedCard.type})`);
        }

        var manualOverrideData = LTF_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log(`LTF-LOG [${cardId}]: Руне перевизначення:`, manualOverrideData);
            updateCardListTracksElement(cardView, manualOverrideData.track_count);
            return;
        }

        var cachedData = getTracksCache(cacheKey);

        if (cachedData) {
            updateCardListTracksElement(cardView, cachedData.track_count);
            
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                if (LTF_CONFIG.LOGGING_CARDLIST) console.log(`LTF-LOG [${cardId}]: Фонове оновлення кешу...`);
                
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    
                    if (document.body.contains(cardElement)) {
                        updateCardListTracksElement(cardView, trackCount);
                    }
                });
            }
        } else {
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log(`LTF-LOG [${cardId}]: Новий пошук...`);
            
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                let trackCount = liveResult ? liveResult.track_count : 0;
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
            const batch = [...new Set(cardsToProcess)]; 
            cardsToProcess = [];
            
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG: Обробка пачки з", batch.length, "карток");

            var BATCH_SIZE = 12;
            var DELAY_MS = 30;

            function processBatch(startIndex) {
                var currentBatch = batch.slice(startIndex, startIndex + BATCH_SIZE);
                
                currentBatch.forEach(card => {
                    if (card.isConnected && document.body.contains(card)) {
                        processListCard(card);
                    }
                });
                
                var nextIndex = startIndex + BATCH_SIZE;
                if (nextIndex < batch.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                }
            }
            
            if (batch.length > 0) {
                processBatch(0);
            }
            
        }, 150);
    }

    var observer = new MutationObserver(function(mutations) {
        let newCardsFound = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { 
                        if (node.classList && node.classList.contains('card')) {
                            cardsToProcess.push(node);
                            newCardsFound = true;
                        }
                        const nestedCards = node.querySelectorAll('.card');
                        if (nestedCards.length) {
                           nestedCards.forEach(card => cardsToProcess.push(card));
                           newCardsFound = true;
                        }
                    }
                });
            }
        });
        
        if (newCardsFound) {
            debouncedProcessCards();
        }
    });

    function initializeLampaTracksPlugin() {
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length) {
            containers.forEach(container => observer.observe(container, { childList: true, subtree: true }));
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Разова перевірка кешу при старті
        setTimeout(function () {
            const allCards = document.querySelectorAll('.card');
            if (LTF_CONFIG.LOGGING_GENERAL) {
                 console.log(`UA-Finder: Разова перевірка кешу для ${allCards.length} карток...`);
            }
            allCards.forEach(card => {
                if (card.card_data && card.querySelector('.card__view')) {
                    processListCard(card);
                }
            });
        }, 1200);

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок (v3.4) успішно ініціалізовано!");
    }

    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();
