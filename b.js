(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ============ НАЛАШТУВАННЯ ============
    const CONFIG = {
        language: 'uk',
        cacheTime: 23 * 60 * 60 * 1000,
        endpoint: 'https://wh.lme.isroot.in/'
    };

    // Налаштування для якості
    const Q_LOGGING = false;
    const Q_CACHE_TIME = 24 * 60 * 60 * 1000;
    const QUALITY_CACHE = 'ua_quality_cache';
    const JACRED_PROTOCOL = 'http://';
    var JACRED_URL = Lampa.Storage.get('jac_red_url') || 'jac.red';
    const PROXY_TIMEOUT = 5000;
    const PROXY_LIST = [
        'https://cors.lampa.stream/',
        'https://cors.eu.org/',
        'https://corsproxy.io/?url='
    ];

    const PROXIES = PROXY_LIST;

    // Кеш для даних
    var seasonsCache = {};
    var flagCache = {};
    var qualityCache = {};
    var inflight = {};

    try {
        seasonsCache = JSON.parse(Lampa.Storage.get('season_cache_ua_v5', '{}'));
        flagCache = JSON.parse(Lampa.Storage.get('flag_cache_ua_v5', '{}'));
        qualityCache = JSON.parse(Lampa.Storage.get(QUALITY_CACHE, '{}'));
    } catch (e) {}

    // ============ ДОПОМІЖНІ ФУНКЦІЇ ============
    function getTmdbKey() {
        let custom = (Lampa.Storage.get('uas_pro_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
    }

    // Черга запитів
    var requestQueue = {
        activeCount: 0,
        queue: [],
        maxParallel: 3,
        add: function (task) {
            this.queue.push(task);
            this.process();
        },
        process: function () {
            var _this = this;
            while (this.activeCount < this.maxParallel && this.queue.length) {
                var task = this.queue.shift();
                this.activeCount++;
                Promise.resolve().then(task)["catch"](function () {})["finally"](function () {
                    _this.activeCount--;
                    _this.process();
                });
            }
        }
    };

    // Функція для перевірки наявності української озвучки
    function isSuccessResponse(response) {
        if (response === true) return true;
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            if (response.error || response.status === 'error' || response.success === false || response.ok === false) return false;
            if (response.success === true || response.status === 'success' || response.ok === true) return true;
            return Object.keys(response).length > 0;
        }
        return false;
    }

    // Функція для отримання кольору рейтингу
    function getRatingColor(rating) {
        if (rating >= 0 && rating <= 3) return 'rgba(231, 76, 60, 0.9)';
        if (rating > 3 && rating <= 5) return 'rgba(230, 126, 34, 0.9)';
        if (rating > 5 && rating <= 6.5) return 'rgba(241, 196, 15, 0.9)';
        if (rating > 6.5 && rating < 8) return 'rgba(52, 152, 219, 0.9)';
        if (rating >= 8 && rating <= 10) return 'rgba(46, 204, 113, 0.9)';
        return 'rgba(0, 0, 0, 0.7)';
    }

    // ============ ФУНКЦІЇ ДЛЯ ЯКОСТІ ============
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed for ' + url));
                }
                return;
            }
            var proxyUrl = PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, PROXY_TIMEOUT);
            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Proxy error: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        clearTimeout(timeoutId);
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

    function translateQuality(quality) {
        if (typeof quality !== 'number') return quality;
        if (quality >= 2160) return '4K';
        if (quality >= 1080) return 'FHD';
        if (quality >= 720) return 'HD';
        if (quality > 0) return 'SD';
        return null;
    }

    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        if (!JACRED_URL) {
            callback(null);
            return;
        }

        var year = '';
        var dateStr = normalizedCard.release_date || '';
        if (dateStr.length >= 4) {
            year = dateStr.substring(0, 4);
        }
        if (!year || isNaN(year)) {
            callback(null);
            return;
        }

        function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
            var userId = Lampa.Storage.get('lampac_unic_id', '');
            var apiUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v1.0/torrents?search=' +
                encodeURIComponent(searchTitle) +
                '&year=' + searchYear +
                (exactMatch ? '&exact=true' : '') +
                '&uid=' + userId;

            var timeoutId = setTimeout(function() {
                apiCallback(null);
            }, PROXY_TIMEOUT * PROXY_LIST.length + 1000);

            fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                clearTimeout(timeoutId);
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
                    var bestNumericQuality = -1;
                    var bestFoundTorrent = null;

                    for (var i = 0; i < torrents.length; i++) {
                        var currentTorrent = torrents[i];
                        var currentNumericQuality = currentTorrent.quality;

                        var lowerTitle = (currentTorrent.title || '').toLowerCase();
                        if (/\b(ts|telesync|camrip|cam)\b/i.test(lowerTitle)) {
                            if (currentNumericQuality < 720) continue;
                        }

                        if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
                            continue;
                        }

                        if (currentNumericQuality > bestNumericQuality) {
                            bestNumericQuality = currentNumericQuality;
                            bestFoundTorrent = currentTorrent;
                        }
                    }
                    if (bestFoundTorrent) {
                        apiCallback({
                            quality: translateQuality(bestFoundTorrent.quality || bestNumericQuality),
                            title: bestFoundTorrent.title
                        });
                    } else {
                        apiCallback(null);
                    }
                } catch (e) {
                    apiCallback(null);
                }
            });
        }

        var searchStrategies = [];
        if (normalizedCard.original_title && /[a-zа-яё0-9]/i.test(normalizedCard.original_title)) {
            searchStrategies.push({
                title: normalizedCard.original_title.trim(),
                year: year,
                exact: true,
                name: "OriginalTitle Exact Year"
            });
        }
        if (normalizedCard.title && /[a-zа-яё0-9]/i.test(normalizedCard.title)) {
            searchStrategies.push({
                title: normalizedCard.title.trim(),
                year: year,
                exact: true,
                name: "Title Exact Year"
            });
        }

        function executeNextStrategy(index) {
            if (index >= searchStrategies.length) {
                callback(null);
                return;
            }
            var strategy = searchStrategies[index];
            searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function(result) {
                if (result !== null) {
                    callback(result);
                } else {
                    executeNextStrategy(index + 1);
                }
            });
        }

        if (searchStrategies.length > 0) {
            executeNextStrategy(0);
        } else {
            callback(null);
        }
    }

    function getQualityCache(key) {
        var item = qualityCache[key];
        return item && (Date.now() - item.timestamp < Q_CACHE_TIME) ? item : null;
    }

    function saveQualityCache(key, data, cardId) {
        qualityCache[key] = {
            quality: data.quality || null,
            timestamp: Date.now()
        };
        try {
            Lampa.Storage.set(QUALITY_CACHE, JSON.stringify(qualityCache));
        } catch (e) {}
    }

    // ============ ФУНКЦІЇ ДЛЯ ПРАПОРЦЯ ============
    function checkUkrVoice(tmdbId, serial, callback) {
        var cacheKey = (serial ? 'tv' : 'movie') + ':' + tmdbId;
        
        if (flagCache[cacheKey]) {
            var now = Date.now();
            if (now - flagCache[cacheKey].timestamp < CONFIG.cacheTime) {
                callback(flagCache[cacheKey].value);
                return;
            }
        }

        if (inflight[cacheKey]) {
            inflight[cacheKey].then(callback);
            return;
        }

        var promise = new Promise(function(resolve) {
            requestQueue.add(function() {
                var url = CONFIG.endpoint + '?tmdb_id=' + encodeURIComponent(tmdbId) + '&serial=' + (serial ? 1 : 0) + '&silent=true';
                
                Lampa.Network.silent(url, 
                    function(response) {
                        var hasVoice = isSuccessResponse(response);
                        
                        flagCache[cacheKey] = {
                            value: hasVoice,
                            timestamp: Date.now()
                        };
                        try {
                            Lampa.Storage.set('flag_cache_ua_v5', JSON.stringify(flagCache));
                        } catch (e) {}
                        
                        resolve(hasVoice);
                        delete inflight[cacheKey];
                    },
                    function() {
                        resolve(false);
                        delete inflight[cacheKey];
                    },
                    null,
                    { timeout: 5000 }
                );
            });
        });

        inflight[cacheKey] = promise;
        promise.then(callback);
    }

    // ============ ФУНКЦІЇ ДЛЯ СЕЗОНІВ ============
    function getSeasonData(tmdbId, callback) {
        var now = Date.now();
        
        if (seasonsCache[tmdbId] && (now - seasonsCache[tmdbId].timestamp < CONFIG.cacheTime)) {
            callback(seasonsCache[tmdbId].data);
            return;
        }

        var url = 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + getTmdbKey() + '&language=' + CONFIG.language;
        
        fetch(PROXIES[0] + url)
            .then(function(r) { return r.json(); })
            .then(function(data) {
                seasonsCache[tmdbId] = { data: data, timestamp: now };
                try {
                    Lampa.Storage.set('season_cache_ua_v5', JSON.stringify(seasonsCache));
                } catch (e) {}
                callback(data);
            })
            .catch(function() { callback(null); });
    }

    // ============ ФУНКЦІЯ ДЛЯ ДОДАВАННЯ ВСІХ ЕЛЕМЕНТІВ ============
    function addBadges(cardElement, movieData) {
        var view = cardElement.find('.card__view');
        if (!view.length) return;

        var tmdbId = movieData.id;
        var isSerial = movieData.name ? true : false;

        // 1. ЯКІСТЬ (лівий кут, над прапорцем)
        if (Lampa.Storage.get('show_quality', true) !== false) {
            var normalizedCard = {
                id: movieData.id || '',
                title: movieData.title || movieData.name || '',
                original_title: movieData.original_title || movieData.original_name || '',
                release_date: movieData.release_date || movieData.first_air_date || '',
                type: getCardType(movieData)
            };
            var qCacheKey = normalizedCard.type + '_' + normalizedCard.id;
            var cacheQualityData = getQualityCache(qCacheKey);

            if (cacheQualityData && cacheQualityData.quality) {
                addQualityBadge(view, cacheQualityData.quality);
            } else {
                getBestReleaseFromJacred(normalizedCard, tmdbId, function(jrResult) {
                    var quality = (jrResult && jrResult.quality) || null;
                    if (quality) {
                        saveQualityCache(qCacheKey, { quality: quality }, tmdbId);
                        addQualityBadge(view, quality);
                    }
                });
            }
        }

        // 2. РІК (верхній правий кут) - ЧОРНИЙ
        if (Lampa.Storage.get('show_year', true) !== false) {
            var yearStr = (movieData.release_date || movieData.first_air_date || '').toString().substring(0, 4);
            if (yearStr && yearStr.length === 4 && !view.find('.badge-year').length) {
                var yearDiv = document.createElement('div');
                yearDiv.className = 'badge-year';
                yearDiv.innerText = yearStr;
                view.append(yearDiv);
            }
        }

        // 3. РЕЙТИНГ (нижній правий кут) - КОЛЬОРОВИЙ
        if (Lampa.Storage.get('show_rating', true) !== false) {
            var voteVal = parseFloat(movieData.vote_average);
            if (!isNaN(voteVal) && voteVal > 0 && !view.find('.badge-rating').length) {
                var ratingDiv = document.createElement('div');
                ratingDiv.className = 'badge-rating';
                ratingDiv.innerText = voteVal.toFixed(1);
                ratingDiv.style.backgroundColor = getRatingColor(voteVal);
                view.append(ratingDiv);
            }
        }

        // 4. ПРАПОРЕЦЬ ОЗВУЧКИ (нижній лівий кут)
        if (tmdbId && Lampa.Storage.get('show_ua_flag', true) !== false) {
            checkUkrVoice(tmdbId, isSerial ? 1 : 0, function(hasVoice) {
                if (hasVoice && !view.find('.badge-ua-flag').length) {
                    var flagDiv = document.createElement('div');
                    flagDiv.className = 'badge-ua-flag';
                    view.append(flagDiv);
                }
            });
        }

        // 5. СЕЗОН (верхній лівий кут) - ЧОРНИЙ (тільки для серіалів)
        if (isSerial && Lampa.Storage.get('show_season_badge', true) !== false) {
            getSeasonData(tmdbId, function(tmdbData) {
                if (!tmdbData || !tmdbData.last_episode_to_air) return;
                
                var last = tmdbData.last_episode_to_air;
                var currentSeason = tmdbData.seasons.filter(function(s) { 
                    return s.season_number === last.season_number; 
                })[0];

                if (currentSeason && last.season_number > 0 && !view.find('.badge-season').length) {
                    var text = "S" + last.season_number;
                    if (currentSeason.episode_count > 0 && last.episode_number < currentSeason.episode_count) {
                        text += " " + last.episode_number + "/" + currentSeason.episode_count;
                    }
                    
                    var seasonDiv = document.createElement('div');
                    seasonDiv.className = 'badge-season';
                    seasonDiv.innerText = text;
                    view.append(seasonDiv);
                }
            });
        }
    }

    function addQualityBadge(view, qualityText) {
        if (!qualityText || view.find('.badge-quality').length) return;
        
        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'badge-quality';
        qualityDiv.innerText = qualityText;
        view.append(qualityDiv);
    }

    // ============ ПЕРЕОПРЕДЕЛЕННЯ МЕТОДУ Lampa ============
    var CardMaker = Lampa.Maker.map('Card');
    var originalOnCreate = CardMaker.Card.onCreate;

    CardMaker.Card.onCreate = function() {
        if (originalOnCreate) {
            originalOnCreate.call(this);
        }

        var item = $(this.html);
        var data = this.data;

        if (data && data.id) {
            item.addClass('card--ua-styled');
            
            setTimeout(function() {
                addBadges(item, data);
            }, 50);
        }
    };

    // ============ СТИЛІ ============
    var style = document.createElement('style');
    style.innerHTML = `
        /* Приховуємо стандартні елементи Lampa */
        .card .card__age,
        .card .card__vote:not(.badge-rating),
        .card .card__type:not(.badge-season) {
            display: none !important;
        }

        /* Загальні стилі для всіх бейджів */
        .badge-year,
        .badge-rating,
        .badge-season,
        .badge-ua-flag,
        .badge-quality {
            position: absolute !important;
            z-index: 100 !important;
            color: #fff !important;
            font-weight: bold !important;
            pointer-events: none !important;
            font-size: 1.1em !important;
            padding: 0.2em 0.45em !important;
            line-height: 1 !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
        }

        /* ЯКІСТЬ - лівий кут, над прапорцем */
        .badge-quality {
            left: 0 !important;
            bottom: 1.8em !important;
            background: rgba(0, 0, 0, 0.7) !important;
            border-radius: 0 0.5em 0 0 !important;
            font-size: 0.9em !important;
            border: 1px solid rgba(255,255,255,0.5) !important;
        }

        /* РІК - верхній правий (ЧОРНИЙ) */
        .badge-year {
            right: 0 !important;
            top: 0 !important;
            background: rgba(0, 0, 0, 0.7) !important;
            border-radius: 0 0 0 0.5em !important;
        }

        /* РЕЙТИНГ - нижній правий (КОЛЬОРОВИЙ) */
        .badge-rating {
            right: 0 !important;
            bottom: 0 !important;
            border-radius: 0.5em 0 0 0 !important;
        }

        /* СЕЗОН - верхній лівий (ЧОРНИЙ) */
        .badge-season {
            left: 0 !important;
            top: 0 !important;
            background: rgba(0, 0, 0, 0.7) !important;
            border-radius: 0 0 0.5em 0 !important;
            font-size: 1em !important;
        }

        /* ПРАПОРЕЦЬ УКРАЇНИ - нижній лівий */
        .badge-ua-flag {
            left: 0 !important;
            bottom: 0 !important;
            width: 2.2em !important;
            height: 1.3em !important;
            padding: 0 !important;
            background: linear-gradient(180deg, #0057b8 50%, #ffd700 50%) !important;
            border-radius: 0 0.5em 0 0 !important;
            box-shadow: 2px 2px 3px rgba(0,0,0,0.3) !important;
        }

        /* Адаптація для різних типів карток */
        .card--poster .badge-year,
        .card--poster .badge-rating,
        .card--poster .badge-season,
        .card--poster .badge-quality {
            font-size: 0.9em !important;
        }
        
        .card--poster .badge-ua-flag {
            width: 1.8em !important;
            height: 1.1em !important;
        }
    `;
    document.head.appendChild(style);

    // ============ НАЛАШТУВАННЯ ============
    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        
        Lampa.SettingsApi.addComponent({
            component: 'uabadges',
            name: 'UA Бейджі',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_quality', type: 'trigger', default: true },
            field: { name: 'Показувати якість', description: 'Якість відео (лівий кут, над прапорцем)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_year', type: 'trigger', default: true },
            field: { name: 'Показувати рік', description: 'Рік випуску у верхньому правому куті' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_rating', type: 'trigger', default: true },
            field: { name: 'Показувати рейтинг', description: 'Рейтинг у нижньому правому куті (кольоровий)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_season_badge', type: 'trigger', default: true },
            field: { name: 'Показувати сезон', description: 'Інформація про сезон для серіалів (чорний)' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_ua_flag', type: 'trigger', default: true },
            field: { name: 'Показувати прапорець', description: 'Позначка про українську озвучку (нижній лівий кут)' }
        });

        // Використовуємо button з полем вводу замість input
        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'jac_red_url_btn', type: 'button' },
            field: { name: 'Налаштувати JacRed URL', description: 'Поточна адреса: ' + JACRED_URL }
        });
    }

    // ============ ЗАПУСК ============
    function start() {
        if (window.ua_badges_loaded) return;
        window.ua_badges_loaded = true;

        createSettings();

        // Обробка натискання на кнопку налаштувань JacRed
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'uabadges') {
                e.body.find('[data-name="jac_red_url_btn"]').on('hover:enter', function () {
                    var currentUrl = Lampa.Storage.get('jac_red_url') || 'jac.red';
                    Lampa.Input.edit({
                        title: 'Введіть адресу JacRed',
                        value: currentUrl,
                        free: true,
                        nosave: true
                    }, function (new_val) {
                        if (new_val !== undefined && new_val.trim()) {
                            Lampa.Storage.set('jac_red_url', new_val.trim());
                            JACRED_URL = new_val.trim();
                            Lampa.Noty.show('JacRed URL збережено: ' + new_val.trim());
                            
                            // Оновлюємо опис кнопки
                            var btnField = e.body.find('[data-name="jac_red_url_btn"] .setting-field__text');
                            if (btnField.length) {
                                btnField.text('Поточна адреса: ' + new_val.trim());
                            }
                        }
                    });
                });
            }
        });

        // Динамічне приховування через CSS
        function updateVisibility() {
            var styleEl = document.querySelector('#ua-badges-dynamic');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'ua-badges-dynamic';
                document.head.appendChild(styleEl);
            }

            var css = '';
            if (Lampa.Storage.get('show_quality', true) === false) css += '.badge-quality { display: none !important; }';
            if (Lampa.Storage.get('show_year', true) === false) css += '.badge-year { display: none !important; }';
            if (Lampa.Storage.get('show_rating', true) === false) css += '.badge-rating { display: none !important; }';
            if (Lampa.Storage.get('show_season_badge', true) === false) css += '.badge-season { display: none !important; }';
            if (Lampa.Storage.get('show_ua_flag', true) === false) css += '.badge-ua-flag { display: none !important; }';
            
            styleEl.innerHTML = css;
        }

        Lampa.Listener.follow('settings', function(e) {
            if (e.type === 'change' && e.name && e.name.startsWith('show_')) {
                updateVisibility();
                Lampa.Noty.show('Налаштування збережено');
            }
        });

        setTimeout(updateVisibility, 1000);
    }

    start();

})();
