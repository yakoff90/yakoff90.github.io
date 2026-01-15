(function () {
    'use strict';

    // ============================================================
    // ===      ЗАХИСТ ВІД ПОВТОРНОГО ЗАПУСКУ ПЛАГІНА           ===
    // ============================================================
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;

    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // ============================================================
    // ===  ПОЛІФІЛИ ДЛЯ SAMSUNG SMART TV (TIZEN)              ===
    // ============================================================
    
    // Samsung Tizen має обмежену підтрижку сучасних API
    if (typeof window.Promise === 'undefined') {
        window.Promise = function (executor) {
            var self = this;
            self._state = 'pending';
            self._value = undefined;
            self._callbacks = [];

            function resolve(value) {
                if (self._state !== 'pending') return;
                self._state = 'fulfilled';
                self._value = value;
                executeCallbacks();
            }

            function reject(reason) {
                if (self._state !== 'pending') return;
                self._state = 'rejected';
                self._value = reason;
                executeCallbacks();
            }

            function executeCallbacks() {
                setTimeout(function () {
                    self._callbacks.forEach(function (callback) {
                        handleCallback(callback);
                    });
                    self._callbacks = [];
                }, 0);
            }

            function handleCallback(callback) {
                try {
                    if (self._state === 'fulfilled') {
                        var result = callback.onFulfilled ? callback.onFulfilled(self._value) : self._value;
                        callback.resolve(result);
                    } else if (self._state === 'rejected') {
                        var errorResult = callback.onRejected ? callback.onRejected(self._value) : self._value;
                        callback.reject(errorResult);
                    }
                } catch (error) {
                    callback.reject(error);
                }
            }

            this.then = function (onFulfilled, onRejected) {
                return new window.Promise(function (resolve, reject) {
                    self._callbacks.push({
                        onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null,
                        onRejected: typeof onRejected === 'function' ? onRejected : null,
                        resolve: resolve,
                        reject: reject
                    });
                    if (self._state !== 'pending') executeCallbacks();
                });
            };

            this.catch = function (onRejected) {
                return this.then(null, onRejected);
            };

            try {
                executor(resolve, reject);
            } catch (error) {
                reject(error);
            }
        };
    }

    // requestAnimationFrame polyfill
    if (typeof window.requestAnimationFrame === 'undefined') {
        var lastTime = 0;
        window.requestAnimationFrame = function (callback) {
            var currTime = Date.now();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
        
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }

    // Element.matches polyfill для Samsung TV
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.msMatchesSelector || 
            Element.prototype.webkitMatchesSelector ||
            function (selector) {
                var elements = (this.document || this.ownerDocument).querySelectorAll(selector);
                var i = elements.length;
                while (--i >= 0 && elements[i] !== this) {}
                return i > -1;
            };
    }

    // Element.closest polyfill
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (selector) {
            var el = this;
            while (el) {
                if (el.matches(selector)) {
                    return el;
                }
                el = el.parentElement;
            }
            return null;
        };
    }

    // Безпечне сховище для Samsung TV
    var safeStorage = (function () {
        try {
            if (window.localStorage && typeof window.localStorage.setItem === 'function') {
                // Тестуємо localStorage
                var testKey = '__season_badge_test__';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                return {
                    getItem: function (key) {
                        try {
                            return localStorage.getItem(key);
                        } catch (e) {
                            return null;
                        }
                    },
                    setItem: function (key, value) {
                        try {
                            localStorage.setItem(key, String(value));
                        } catch (e) {
                            // Ігноруємо помилки запису
                        }
                    },
                    removeItem: function (key) {
                        try {
                            localStorage.removeItem(key);
                        } catch (e) {
                            // Ігноруємо помилки видалення
                        }
                    }
                };
            }
        } catch (e) {
            console.log('LocalStorage недоступний, використовуємо пам\'ять');
        }

        // Fallback до об'єкта в пам'яті
        var memoryStore = {};
        return {
            getItem: function (key) {
                return memoryStore.hasOwnProperty(key) ? memoryStore[key] : null;
            },
            setItem: function (key, value) {
                memoryStore[key] = String(value);
            },
            removeItem: function (key) {
                delete memoryStore[key];
            }
        };
    })();

    // safeFetch для Samsung TV
    function safeFetch(url) {
        // Спроба використати нативний fetch
        if (typeof window.fetch === 'function') {
            return window.fetch(url).catch(function () {
                // Fallback до XHR якщо fetch не працює
                return xhrFetch(url);
            });
        }
        
        // Використовуємо XMLHttpRequest
        return xhrFetch(url);
    }
    
    function xhrFetch(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 10000; // 10 секунд таймаут
            
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 300) {
                    var response = {
                        ok: true,
                        status: xhr.status,
                        statusText: xhr.statusText,
                        json: function () {
                            return new Promise(function (res, rej) {
                                try {
                                    res(JSON.parse(xhr.responseText));
                                } catch (e) {
                                    rej(e);
                                }
                            });
                        },
                        text: function () {
                            return Promise.resolve(xhr.responseText);
                        }
                    };
                    resolve(response);
                } else {
                    reject(new Error('HTTP ' + xhr.status));
                }
            };
            
            xhr.onerror = function () {
                reject(new Error('Network error'));
            };
            
            xhr.ontimeout = function () {
                reject(new Error('Request timeout'));
            };
            
            try {
                xhr.send();
            } catch (error) {
                reject(error);
            }
        });
    }

    // MutationObserver polyfill для старих Samsung TV
    var NativeMutationObserver = window.MutationObserver || 
                                 window.WebKitMutationObserver || 
                                 window.MozMutationObserver;

    function createObserver(callback) {
        if (NativeMutationObserver) {
            try {
                return new NativeMutationObserver(callback);
            } catch (e) {
                // Fallback якщо створення не вдалося
                return createFallbackObserver();
            }
        }
        return createFallbackObserver();
    }
    
    function createFallbackObserver() {
        return {
            observe: function () {
                // No-op для TV без MutationObserver
            },
            disconnect: function () {
                // No-op
            },
            takeRecords: function () {
                return [];
            }
        };
    }

    // ============================================================
    // ===  НАЛАШТУВАННЯ ПЛАГІНА                                ===
    // ============================================================
    var CONFIG = {
        tmdbApiKey: '',
        cacheTime: 20 * 60 * 60 * 1000, // 20 годин
        enabled: true,
        language: 'uk',
        debug: false // Режим налагодження для Samsung TV
    };

    // ============================================================
    // ===  ДОСТУП ДО TMDB ДЛЯ SAMSUNG TV                      ===
    // ============================================================
    function tmdbGet(tvId, resolve, reject) {
        // Обмежуємо довжину URL для старих TV
        var url = 'https://api.themoviedb.org/3/tv/' + tvId + 
                  '?api_key=' + CONFIG.tmdbApiKey + 
                  '&language=' + CONFIG.language;
        
        // Спрощений запит для TV
        safeFetch(url)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('HTTP ' + response.status);
                }
            })
            .then(function (data) {
                if (data && data.success === false) {
                    reject(new Error(data.status_message || 'TMDB API error'));
                } else {
                    resolve(data);
                }
            })
            .catch(function (error) {
                reject(error);
            });
    }

    // ============================================================
    // ===  СТИЛІ ДЛЯ МІТОК СЕЗОНУ НА SAMSUNG TV               ===
    // ============================================================
    var style = document.createElement('style');
    style.textContent = 
        ".card--season-complete, .card--season-progress {\n" +
        "    position: absolute;\n" +
        "    left: 0;\n" +
        "    bottom: 0.5em;\n" +
        "    z-index: 12;\n" +
        "    background-color: rgba(61, 161, 141, 0.95);\n" +
        "    border-radius: 0.3em;\n" +
        "    max-width: 90%;\n" +
        "    opacity: 0;\n" +
        "    transition: opacity 0.3s;\n" +
        "}\n" +
        "\n" +
        ".card--season-progress {\n" +
        "    background-color: rgba(255, 66, 66, 0.95);\n" +
        "}\n" +
        "\n" +
        ".card--season-complete > div,\n" +
        ".card--season-progress > div {\n" +
        "    font-family: 'Roboto', Arial, sans-serif;\n" +
        "    font-weight: bold;\n" +
        "    font-size: 0.9em;\n" +
        "    padding: 0.3em 0.5em;\n" +
        "    color: white;\n" +
        "    white-space: nowrap;\n" +
        "    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);\n" +
        "}\n" +
        "\n" +
        ".card--season-complete.show,\n" +
        ".card--season-progress.show {\n" +
        "    opacity: 1;\n" +
        "}\n" +
        "\n" +
        "/* Адаптація для TV */\n" +
        "@media (max-width: 1920px) {\n" +
        "    .card--season-complete > div,\n" +
        "    .card--season-progress > div {\n" +
        "        font-size: 0.85em;\n" +
        "        padding: 0.25em 0.4em;\n" +
        "    }\n" +
        "}\n" +
        "\n" +
        "/* Для маленьких TV */\n" +
        "@media (max-width: 1280px) {\n" +
        "    .card--season-complete > div,\n" +
        "    .card--season-progress > div {\n" +
        "        font-size: 0.8em;\n" +
        "        padding: 0.2em 0.3em;\n" +
        "    }\n" +
        "}";
    
    document.head.appendChild(style);

    // ============================================================
    // ===  ДОПОМІЖНІ ФУНКЦІЇ                                 ===
    // ============================================================
    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
        return 'unknown';
    }

    // ============================================================
    // ===  КЕШ ДАНИХ TMDB                                    ===
    // ============================================================
    var cache = {};
    try {
        var cacheRaw = safeStorage.getItem('seasonBadgeCache') || '{}';
        cache = JSON.parse(cacheRaw) || {};
    } catch (e) {
        cache = {};
    }

    // ============================================================
    // ===  ЗАВАНТАЖЕННЯ ДАНИХ СЕРІАЛУ                       ===
    // ============================================================
    function fetchSeriesData(tmdbId) {
        return new Promise(function (resolve, reject) {
            var now = Date.now();
            
            // Перевірка кешу
            if (cache[tmdbId] && (now - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                resolve(cache[tmdbId].data);
                return;
            }
            
            // Перевірка API ключа
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey.trim() === '') {
                reject(new Error('Введіть TMDB API ключ в налаштуваннях'));
                return;
            }
            
            // Запит до TMDB
            tmdbGet(tmdbId, 
                function (data) {
                    // Оновлення кешу
                    cache[tmdbId] = {
                        data: data,
                        timestamp: now
                    };
                    
                    try {
                        safeStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                    } catch (e) {
                        // Ігноруємо помилки запису в сховище
                    }
                    
                    resolve(data);
                },
                function (error) {
                    reject(error);
                }
            );
        });
    }

    // ============================================================
    // ===  ОБЧИСЛЕННЯ ПРОГРЕСУ СЕЗОНУ                       ===
    // ============================================================
    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) {
            return false;
        }
        
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = null;
        
        // Пошук поточного сезону
        for (var i = 0; i < tmdbData.seasons.length; i++) {
            var season = tmdbData.seasons[i];
            if (season.season_number === lastEpisode.season_number && season.season_number > 0) {
                currentSeason = season;
                break;
            }
        }
        
        if (!currentSeason) return false;
        
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        return {
            seasonNumber: lastEpisode.season_number,
            airedEpisodes: airedEpisodes,
            totalEpisodes: totalEpisodes,
            isComplete: airedEpisodes >= totalEpisodes
        };
    }

    // ============================================================
    // ===  СТВОРЕННЯ МІТКИ                                  ===
    // ============================================================
    function createBadge(content, isComplete) {
        var badge = document.createElement('div');
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
        
        badge.className = badgeClass;
        badge.innerHTML = '<div>' + content + '</div>';
        
        return badge;
    }

    // ============================================================
    // ===  ПОЗИЦІОНУВАННЯ МІТКИ                             ===
    // ============================================================
    function adjustBadgePosition(cardEl, badge) {
        if (!cardEl || !badge) return;
        
        // Спрощена логіка для TV
        var qualityBadge = cardEl.querySelector('.card__quality');
        if (qualityBadge) {
            var qualityRect = qualityBadge.getBoundingClientRect();
            var cardRect = cardEl.getBoundingClientRect();
            
            if (qualityRect.bottom > cardRect.bottom - 20) {
                badge.style.bottom = (qualityRect.height + 10) + 'px';
            } else {
                badge.style.bottom = '0.5em';
            }
        } else {
            badge.style.bottom = '0.5em';
        }
    }

    // ============================================================
    // ===  ДОДАВАННЯ МІТКИ ДО КАРТКИ                        ===
    // ============================================================
    function addSeasonBadge(cardEl) {
        // Перевірка чи вже оброблено
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) {
            return;
        }
        
        // Чекаємо на дані картки
        if (!cardEl.card_data) {
            setTimeout(function () {
                addSeasonBadge(cardEl);
            }, 100);
            return;
        }
        
        var data = cardEl.card_data;
        
        // Працюємо тільки з серіалами
        if (getMediaType(data) !== 'tv') {
            cardEl.setAttribute('data-season-processed', 'not-tv');
            return;
        }
        
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        
        // Видаляємо старі мітки
        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        for (var i = 0; i < oldBadges.length; i++) {
            if (oldBadges[i].parentNode) {
                oldBadges[i].parentNode.removeChild(oldBadges[i]);
            }
        }
        
        // Створюємо тимчасову мітку
        var tempBadge = createBadge('...', false);
        view.appendChild(tempBadge);
        adjustBadgePosition(cardEl, tempBadge);
        
        // Позначаємо як оброблювану
        cardEl.setAttribute('data-season-processed', 'loading');
        
        // Завантажуємо дані
        fetchSeriesData(data.id)
            .then(function (tmdbData) {
                var progress = getSeasonProgress(tmdbData);
                
                if (progress) {
                    var content;
                    if (progress.isComplete) {
                        content = "S" + progress.seasonNumber;
                    } else {
                        content = "S" + progress.seasonNumber + " " + 
                                 progress.airedEpisodes + "/" + 
                                 progress.totalEpisodes;
                    }
                    
                    // Замінюємо тимчасову мітку на постійну
                    var finalBadge = createBadge(content, progress.isComplete);
                    if (tempBadge.parentNode) {
                        tempBadge.parentNode.replaceChild(finalBadge, tempBadge);
                    }
                    
                    adjustBadgePosition(cardEl, finalBadge);
                    
                    // Плавне з'явлення
                    setTimeout(function () {
                        finalBadge.classList.add('show');
                    }, 50);
                    
                    cardEl.setAttribute('data-season-processed', 
                        progress.isComplete ? 'complete' : 'in-progress');
                } else {
                    // Не вдалося отримати інформацію
                    if (tempBadge.parentNode) {
                        tempBadge.parentNode.removeChild(tempBadge);
                    }
                    cardEl.setAttribute('data-season-processed', 'no-data');
                }
            })
            .catch(function (error) {
                // Обробка помилок
                if (CONFIG.debug) {
                    console.log('SeasonBadge Error:', error.message);
                }
                
                if (tempBadge.parentNode) {
                    tempBadge.parentNode.removeChild(tempBadge);
                }
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    // ============================================================
    // ===  ГЛОБАЛЬНИЙ OBSERVER ДЛЯ НОВИХ КАРТОК              ===
    // ============================================================
    var observer = createObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    
                    if (node.nodeType === 1) {
                        // Безпосередньо додана картка
                        if (node.classList && node.classList.contains('card')) {
                            setTimeout(function () {
                                addSeasonBadge(node);
                            }, 100);
                        }
                        
                        // Картки всередині доданого контейнера
                        if (node.querySelectorAll) {
                            var innerCards = node.querySelectorAll('.card');
                            for (var j = 0; j < innerCards.length; j++) {
                                setTimeout((function (card) {
                                    return function () {
                                        addSeasonBadge(card);
                                    };
                                })(innerCards[j]), 100 * (j + 1));
                            }
                        }
                    }
                }
            }
        });
    });

    // ============================================================
    // ===  ІНІЦІАЛІЗАЦІЯ ПЛАГІНА                            ===
    // ============================================================
    function initPlugin() {
        if (!CONFIG.enabled) return;
        
        // Спрощений спостерігач для Samsung TV
        var containers = document.querySelectorAll('.cards, .card-list, .content');
        if (containers.length > 0) {
            for (var i = 0; i < containers.length; i++) {
                try {
                    observer.observe(containers[i], {
                        childList: true,
                        subtree: true
                    });
                } catch (e) {
                    // Резервний варіант
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    break;
                }
            }
        } else {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // Обробка наявних карток
        var existingCards = document.querySelectorAll('.card:not([data-season-processed])');
        for (var j = 0; j < existingCards.length; j++) {
            (function (card, delay) {
                setTimeout(function () {
                    addSeasonBadge(card);
                }, delay * 100);
            })(existingCards[j], j);
        }
    }

    // ============================================================
    // ===  СИСТЕМА ЗАПУСКУ                                  ===
    // ============================================================
    function startPlugin() {
        // Затримка для гарантованої ініціалізації Lampa
        setTimeout(function () {
            if (window.Lampa && window.Lampa.API && document.body) {
                initPlugin();
            } else {
                // Резервний запуск через 3 секунди
                setTimeout(initPlugin, 3000);
            }
        }, 2000);
    }
    
    // Запускаємо плагін
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPlugin);
    } else {
        startPlugin();
    }

    // ============================================================
    // ===  НАЛАШТУВАННЯ ДЛЯ SAMSUNG TV                      ===
    // ============================================================
    (function() {
        'use strict';
        
        var SETTINGS_KEY = 'season_badge_settings';
        var settings = {};
        
        // Функція для сповіщень
        function showToast(message) {
            try {
                if (window.Lampa && Lampa.Noty) {
                    Lampa.Noty.show(message);
                    return;
                }
            } catch (e) {}
            
            // Резервний варіант
            var toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = 
                'position: fixed;' +
                'bottom: 100px;' +
                'left: 50%;' +
                'transform: translateX(-50%);' +
                'background: rgba(0,0,0,0.8);' +
                'color: white;' +
                'padding: 10px 20px;' +
                'border-radius: 5px;' +
                'z-index: 9999;' +
                'font-size: 16px;';
            
            document.body.appendChild(toast);
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 2000);
        }
        
        // Завантаження налаштувань
        function loadSettings() {
            try {
                var saved = Lampa.Storage.get(SETTINGS_KEY) || {};
                settings = {
                    tmdb_key: saved.tmdb_key || '',
                    enabled: saved.enabled !== false,
                    language: saved.language || 'uk'
                };
            } catch (e) {
                settings = {
                    tmdb_key: '',
                    enabled: true,
                    language: 'uk'
                };
            }
            
            // Застосування налаштувань
            if (settings.tmdb_key) {
                CONFIG.tmdbApiKey = settings.tmdb_key.trim();
            }
            CONFIG.enabled = settings.enabled;
            CONFIG.language = settings.language;
        }
        
        // Збереження налаштувань
        function saveSettings() {
            try {
                Lampa.Storage.set(SETTINGS_KEY, settings);
                showToast('Налаштування збережено');
            } catch (e) {
                showToast('Помилка збереження');
            }
        }
        
        // Очищення кешу
        function clearCache() {
            try {
                cache = {};
                safeStorage.removeItem('seasonBadgeCache');
                showToast('Кеш очищено');
            } catch (e) {
                showToast('Помилка очищення кешу');
            }
        }
        
        // Реєстрація UI в налаштуваннях Lampa
        function registerSettingsUI() {
            if (!window.Lampa || !Lampa.SettingsApi) {
                // Спробуємо пізніше
                setTimeout(registerSettingsUI, 1000);
                return;
            }
            
            // Додаємо розділ в налаштування
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { 
                    type: 'button', 
                    component: 'season_badge_settings'
                },
                field: { 
                    name: 'Мітки сезонів (TV)', 
                    description: 'Налаштування бейджів прогресу сезонів' 
                },
                onChange: function() {
                    // Створюємо сторінку налаштувань
                    Lampa.Settings.create('season_badge_settings', {
                        onBack: function() {
                            Lampa.Settings.create('interface');
                        },
                        template: '<div class="season-badge-settings"></div>'
                    });
                    
                    // Додаємо поля налаштувань
                    setTimeout(function() {
                        var container = document.querySelector('.season-badge-settings');
                        if (container) {
                            // Поле API ключа
                            var apiKeyField = document.createElement('div');
                            apiKeyField.className = 'settings-field';
                            apiKeyField.innerHTML = 
                                '<div class="settings-field__name">TMDB API ключ</div>' +
                                '<input type="text" class="settings-field__input" ' +
                                'placeholder="Вставте ваш TMDB API ключ" ' +
                                'value="' + (settings.tmdb_key || '') + '">';
                            
                            var input = apiKeyField.querySelector('input');
                            input.addEventListener('input', function() {
                                settings.tmdb_key = this.value;
                                CONFIG.tmdbApiKey = this.value.trim();
                                saveSettings();
                            });
                            
                            container.appendChild(apiKeyField);
                            
                            // Кнопка очищення кешу
                            var clearCacheBtn = document.createElement('div');
                            clearCacheBtn.className = 'settings-button';
                            clearCacheBtn.textContent = 'Очистити кеш';
                            clearCacheBtn.style.marginTop = '20px';
                            clearCacheBtn.addEventListener('click', clearCache);
                            
                            container.appendChild(clearCacheBtn);
                            
                            // Інформація
                            var info = document.createElement('div');
                            info.className = 'settings-description';
                            info.style.marginTop = '20px';
                            info.innerHTML = 
                                '<div>Для роботи плагіна потрібен TMDB API ключ.</div>' +
                                '<div style="margin-top: 10px;">Отримати ключ можна на сайті: themoviedb.org</div>';
                            
                            container.appendChild(info);
                        }
                    }, 100);
                }
            });
        }
        
        // Ініціалізація налаштувань
        function initSettings() {
            loadSettings();
            
            // Чекаємо на готовність Lampa
            if (window.Lampa) {
                setTimeout(registerSettingsUI, 2000);
            } else {
                window.addEventListener('lampa-ready', registerSettingsUI);
            }
        }
        
        // Запускаємо налаштування
        setTimeout(initSettings, 3000);
        
    })();

})();
