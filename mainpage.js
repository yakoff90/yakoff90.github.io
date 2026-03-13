(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // ============ НАЛАШТУВАННЯ ============
    const CONFIG = {
        language: 'uk',
        cacheTime: 23 * 60 * 60 * 1000,
        endpoint: 'https://wh.lme.isroot.in/'
    };

    const PROXIES = [
        'https://cors.lampa.stream/',
        'https://cors.eu.org/',
        'https://corsproxy.io/?url='
    ];

    // Кеш для даних серіалів і прапорців
    var seasonsCache = {};
    var flagCache = {};
    var inflight = {};

    try {
        seasonsCache = JSON.parse(Lampa.Storage.get('season_cache_ua', '{}'));
        flagCache = JSON.parse(Lampa.Storage.get('flag_cache_ua', '{}'));
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
        maxParallel: 5,
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

    // Отримання кольору для рейтингу
    function getRatingColor(rating) {
        if (rating >= 0 && rating <= 3) return 'rgba(231, 76, 60, 0.9)';
        if (rating > 3 && rating <= 5) return 'rgba(230, 126, 34, 0.9)';
        if (rating > 5 && rating <= 6.5) return 'rgba(241, 196, 15, 0.9)';
        if (rating > 6.5 && rating < 8) return 'rgba(52, 152, 219, 0.9)';
        if (rating >= 8 && rating <= 10) return 'rgba(46, 204, 113, 0.9)';
        return 'rgba(0, 0, 0, 0.6)';
    }

    // ============ ФУНКЦІЯ ДЛЯ ПРАПОРЦЯ ОЗВУЧКИ ============
    function checkUkrVoice(tmdbId, serial, callback) {
        var cacheKey = serial + ':' + tmdbId;
        
        // Перевіряємо кеш
        if (flagCache[cacheKey]) {
            var now = Date.now();
            if (now - flagCache[cacheKey].timestamp < CONFIG.cacheTime) {
                callback(flagCache[cacheKey].value);
                return;
            }
        }

        // Якщо вже є запит - чекаємо
        if (inflight[cacheKey]) {
            inflight[cacheKey].then(callback);
            return;
        }

        // Створюємо новий запит
        var promise = new Promise(function(resolve) {
            requestQueue.add(function() {
                var url = CONFIG.endpoint + '?tmdb_id=' + encodeURIComponent(tmdbId) + '&serial=' + (serial ? 1 : 0) + '&silent=true';
                
                Lampa.Network.silent(url, 
                    function(response) {
                        var hasVoice = false;
                        if (response === true) hasVoice = true;
                        else if (response && typeof response === 'object' && !Array.isArray(response)) {
                            if (response.success === true || response.status === 'success' || response.ok === true) hasVoice = true;
                        }
                        
                        // Зберігаємо в кеш
                        flagCache[cacheKey] = {
                            value: hasVoice,
                            timestamp: Date.now()
                        };
                        try {
                            Lampa.Storage.set('flag_cache_ua', JSON.stringify(flagCache));
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

    // ============ ФУНКЦІЯ ДЛЯ СЕЗОНІВ ============
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
                    Lampa.Storage.set('season_cache_ua', JSON.stringify(seasonsCache));
                } catch (e) {}
                callback(data);
            })
            .catch(function() { callback(null); });
    }

    // ============ ФУНКЦІЯ ДЛЯ ДОДАВАННЯ ЕЛЕМЕНТІВ ============
    function addBadges(cardElement, movieData) {
        var view = cardElement.find('.card__view');
        if (!view.length) return;

        // 1. РІК (верхній правий кут)
        var yearStr = (movieData.release_date || movieData.first_air_date || '').toString().substring(0, 4);
        if (yearStr && yearStr.length === 4 && !view.find('.badge-year').length) {
            var yearDiv = document.createElement('div');
            yearDiv.className = 'badge-year';
            yearDiv.innerText = yearStr;
            view.append(yearDiv);
        }

        // 2. РЕЙТИНГ (нижній правий кут)
        var voteVal = parseFloat(movieData.vote_average);
        if (!isNaN(voteVal) && voteVal > 0 && !view.find('.badge-rating').length) {
            var ratingDiv = document.createElement('div');
            ratingDiv.className = 'badge-rating';
            ratingDiv.innerText = voteVal.toFixed(1);
            ratingDiv.style.backgroundColor = getRatingColor(voteVal);
            view.append(ratingDiv);
        }

        // 3. ПРАПОРЕЦЬ ОЗВУЧКИ (нижній лівий кут)
        var tmdbId = movieData.id;
        var isSerial = movieData.name ? 1 : 0;
        
        if (tmdbId && Lampa.Storage.get('show_ua_flag', true) !== false) {
            checkUkrVoice(tmdbId, isSerial, function(hasVoice) {
                if (hasVoice && !view.find('.badge-ua-flag').length) {
                    var flagDiv = document.createElement('div');
                    flagDiv.className = 'badge-ua-flag';
                    view.append(flagDiv);
                }
            });
        }

        // 4. СЕЗОН (верхній лівий кут) - тільки для серіалів
        if (movieData.name && Lampa.Storage.get('show_season_badge', true) !== false) {
            getSeasonData(tmdbId, function(tmdbData) {
                if (!tmdbData || !tmdbData.last_episode_to_air) return;
                
                var last = tmdbData.last_episode_to_air;
                var currentSeason = tmdbData.seasons.filter(function(s) { 
                    return s.season_number === last.season_number; 
                })[0];

                if (currentSeason && last.season_number > 0 && !view.find('.badge-season').length) {
                    var isComplete = currentSeason.episode_count > 0 && last.episode_number >= currentSeason.episode_count;
                    var text = isComplete ? "S" + last.season_number : "S" + last.season_number + " " + last.episode_number + "/" + currentSeason.episode_count;
                    
                    var seasonDiv = document.createElement('div');
                    seasonDiv.className = 'badge-season';
                    seasonDiv.innerText = text;
                    seasonDiv.style.backgroundColor = isComplete ? 'rgba(46, 204, 113, 0.9)' : 'rgba(170, 20, 20, 0.9)';
                    view.append(seasonDiv);
                }
            });
        }
    }

    // ============ ПЕРЕОПРЕДЕЛЕННЯ МЕТОДУ LAhttps://notsupportedMPA ============
    var CardMaker = Lampa.Maker.map('Card');
    var originalOnCreate = CardMaker.Card.onCreate;

    CardMaker.Card.onCreate = function() {
        if (originalOnCreate) {
            originalOnCreate.call(this);
        }

        var item = $(this.html);
        var data = this.data;

        if (data && data.id) {
            // Додаємо базовий клас
            item.addClass('card--ua-styled');
            
            // Додаємо всі бейджі
            addBadges(item, data);
        }
    };

    // ============ СТИЛІ ============
    var style = document.createElement('style');
    style.innerHTML = `
        /* Приховуємо стандартні елементи */
        .card .card__age,
        .card .card__vote:not(.badge-rating),
        .card .card__type:not(.badge-season) {
            display: none !important;
        }

        /* Загальні стилі для всіх бейджів */
        .badge-year,
        .badge-rating,
        .badge-season,
        .badge-ua-flag {
            position: absolute !important;
            z-index: 10 !important;
            color: #fff !important;
            font-weight: bold !important;
            pointer-events: none !important;
            font-size: 1.1em !important;
            padding: 0.2em 0.45em !important;
            line-height: 1 !important;
        }

        /* РІК - верхній правий */
        .badge-year {
            right: 0 !important;
            top: 0 !important;
            background: rgba(0, 0, 0, 0.7) !important;
            border-radius: 0 0 0 0.5em !important;
        }

        /* РЕЙТИНГ - нижній правий */
        .badge-rating {
            right: 0 !important;
            bottom: 0 !important;
            border-radius: 0.5em 0 0 0 !important;
        }

        /* СЕЗОН - верхній лівий */
        .badge-season {
            left: 0 !important;
            top: 0 !important;
            border-radius: 0 0 0.5em 0 !important;
        }

        /* ПРАПОРЕЦЬ УКРАЇНИ - нижній лівий */
        .badge-ua-flag {
            left: 0 !important;
            bottom: 0 !important;
            width: 2.4em !important;
            height: 1.4em !important;
            padding: 0 !important;
            background: linear-gradient(180deg, #0057b8 50%, #ffd700 50%) !important;
            border-radius: 0 0.5em 0 0 !important;
        }

        /* Затемнення фону для кращої видимості */
        .card__view::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            pointer-events: none;
            z-index: 1;
            border-radius: inherit;
        }

        /* Фокус для карток */
        .card.focus .card__view {
            box-shadow: 0 10px 25px rgba(0,0,0,0.9) !important;
            border: 3px solid #fff !important;
            outline: none !important;
        }
        
        .card.focus .card__view::after {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // ============ НАЛАШТУВАННЯ ============
    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        
        Lampa.SettingsApi.addComponent({
            component: 'uabadges',
            name: 'UA Бейджі',
            description: 'Рік, рейтинг, сезон, прапорець',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_year', type: 'trigger', default: true },
            field: { name: 'Показувати рік', description: 'Рік випуску у верхньому правому куті' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_rating', type: 'trigger', default: true },
            field: { name: 'Показувати рейтинг', description: 'Рейтинг у нижньому правому куті' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_season_badge', type: 'trigger', default: true },
            field: { name: 'Показувати сезон', description: 'Інформація про сезон для серіалів' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uabadges',
            param: { name: 'show_ua_flag', type: 'trigger', default: true },
            field: { name: 'Показувати прапорець', description: 'Позначка про українську озвучку' }
        });

        // Обробка змін
        Lampa.Listener.follow('settings', function(e) {
            if (e.type === 'change' && e.name && e.name.startsWith('show_')) {
                Lampa.Noty.show('Для застосування змін перезапустіть програму');
            }
        });
    }

    // ============ ЗАПУСК ============
    function start() {
        if (window.ua_badges_loaded) return;
        window.ua_badges_loaded = true;

        createSettings();

        // Динамічне приховування елементів через CSS
        Lampa.Listener.follow('settings', function(e) {
            if (e.type === 'change' && e.name && e.name.startsWith('show_')) {
                var styleEl = document.querySelector('#ua-badges-dynamic');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'ua-badges-dynamic';
                    document.head.appendChild(styleEl);
                }

                var css = '';
                if (Lampa.Storage.get('show_year', true) === false) css += '.badge-year { display: none !important; }';
                if (Lampa.Storage.get('show_rating', true) === false) css += '.badge-rating { display: none !important; }';
                if (Lampa.Storage.get('show_season_badge', true) === false) css += '.badge-season { display: none !important; }';
                if (Lampa.Storage.get('show_ua_flag', true) === false) css += '.badge-ua-flag { display: none !important; }';
                
                styleEl.innerHTML = css;
            }
        });

        Lampa.Noty.show('Плагін "UA Бейджі" завантажено');
    }

    start();

})();
