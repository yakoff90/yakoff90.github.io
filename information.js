(function() {
    'use strict';

    /**
     * Плагін "Інформація та озвучення" для Lampa
     * Об'єднує функціонал:
     * 1. Якість (Quality+) - автоматичне визначення якості з JacRed
     * 2. Українське озвучення (UA-Finder) - пошук українських аудіодоріжок
     * 3. Мітка сезонів (SeasonsFull) - відображення інформації про сезони
     * 4. Візуалізація дубляжу (Visual UA) - заміна текстів та стилізація
     * 5. Назви аудіодоріжок (Tracks) - парсинг інформації про аудіодоріжки
     * 6. Субтитри (Subtitles) - автоматичне додавання субтитрів
     */

    // ===================== СПІЛЬНА КОНФІГУРАЦІЯ =====================
    var PLUGIN_CONFIG = {
        enabled: true,
        name: 'Інформація та озвучення',
        version: '1.0.0',
        cacheVersion: 5
    };

    // ===================== ІКОНКА ДЛЯ НАЛАШТУВАНЬ =====================
    var SETTINGS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="margin-right: 8px; vertical-align: middle;"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/></svg>';

    // ===================== СПІЛЬНІ УТІЛІТИ =====================
    var CommonUtils = {
        // Поліфіли для старих WebView
        initPolyfills: function() {
            // Проміси
            if (typeof window.Promise !== 'function') {
                (function() {
                    function SimplePromise(executor) {
                        var self = this;
                        self._state = 'pending';
                        self._value = undefined;
                        self._handlers = [];

                        function resolve(value) {
                            if (self._state !== 'pending') return;
                            self._state = 'fulfilled';
                            self._value = value;
                            run();
                        }

                        function reject(reason) {
                            if (self._state !== 'pending') return;
                            self._state = 'rejected';
                            self._value = reason;
                            run();
                        }

                        function run() {
                            setTimeout(function() {
                                for (var i = 0; i < self._handlers.length; i++) {
                                    handle(self._handlers[i]);
                                }
                                self._handlers = [];
                            }, 0);
                        }

                        function handle(h) {
                            if (self._state === 'pending') {
                                self._handlers.push(h);
                                return;
                            }
                            var cb = self._state === 'fulfilled' ? h.onFulfilled : h.onRejected;

                            if (!cb) {
                                (self._state === 'fulfilled' ? h.resolve : h.reject)(self._value);
                                return;
                            }

                            try {
                                var ret = cb(self._value);
                                h.resolve(ret);
                            } catch (e) {
                                h.reject(e);
                            }
                        }

                        self.then = function(onFulfilled, onRejected) {
                            return new SimplePromise(function(resolve2, reject2) {
                                handle({
                                    onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null,
                                    onRejected: typeof onRejected === 'function' ? onRejected : null,
                                    resolve: resolve2,
                                    reject: reject2
                                });
                            });
                        };

                        self.catch = function(onRejected) {
                            return self.then(null, onRejected);
                        };

                        try {
                            executor(resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    }

                    window.Promise = SimplePromise;
                })();
            }

            // requestAnimationFrame
            if (typeof window.requestAnimationFrame !== 'function') {
                window.requestAnimationFrame = function(cb) {
                    return setTimeout(cb, 16);
                };
            }

            // Безпечний localStorage
            var safeLocalStorage = (function() {
                try {
                    var testKey = '__test__';
                    window.localStorage.setItem(testKey, '1');
                    window.localStorage.removeItem(testKey);
                    return window.localStorage;
                } catch (e) {
                    var memoryStore = {};
                    return {
                        getItem: function(k) { return memoryStore[k] || null; },
                        setItem: function(k, v) { memoryStore[k] = String(v); },
                        removeItem: function(k) { delete memoryStore[k]; }
                    };
                }
            })();

            // Lampa.Storage поліфіл
            if (!window.Lampa) window.Lampa = {};
            if (!Lampa.Storage) {
                Lampa.Storage = {
                    get: function(key, def) {
                        try {
                            var raw = safeLocalStorage.getItem(key);
                            return raw ? JSON.parse(raw) : (def || null);
                        } catch (e) {
                            return def || null;
                        }
                    },
                    set: function(key, val) {
                        try {
                            safeLocalStorage.setItem(key, JSON.stringify(val));
                        } catch (e) {}
                    }
                };
            }
        },

        // Безпечний fetch
        safeFetchText: function(url) {
            return new Promise(function(resolve, reject) {
                if (typeof fetch === 'function') {
                    try {
                        fetch(url)
                            .then(function(res) {
                                if (!res.ok) throw new Error('HTTP ' + res.status);
                                return res.text();
                            })
                            .then(resolve)
                            .catch(reject);
                        return;
                    } catch (e) {}
                }

                try {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve(xhr.responseText);
                            } else {
                                reject(new Error('XHR ' + xhr.status));
                            }
                        }
                    };
                    xhr.onerror = function() {
                        reject(new Error('Network error'));
                    };
                    xhr.send(null);
                } catch (err) {
                    reject(err);
                }
            });
        },

        // Дебаунс
        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        }
    };

    // ===================== МОДУЛЬ ЯКОСТІ =====================
    var QualityModule = {
        config: {
            CACHE_VERSION: PLUGIN_CONFIG.cacheVersion,
            LOGGING_GENERAL: false,
            LOGGING_QUALITY: false,
            LOGGING_CARDLIST: false,
            CACHE_VALID_TIME_MS: 48 * 60 * 60 * 1000,
            CACHE_REFRESH_THRESHOLD_MS: 24 * 60 * 60 * 1000,
            CACHE_KEY: 'lampa_quality_cache',
            JACRED_PROTOCOL: 'http://',
            JACRED_URL: 'jacred.xyz',
            PROXY_LIST: [
                'http://api.allorigins.win/raw?url=',
                'http://cors.bwa.workers.dev/'
            ],
            PROXY_TIMEOUT_MS: 4000,
            SHOW_QUALITY_FOR_TV_SERIES: true,
            SHOW_FULL_CARD_LABEL: true,
            MAX_PARALLEL_REQUESTS: 12,
            USE_SIMPLE_QUALITY_LABELS: true,
            
            FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
            FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
            FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
            FULL_CARD_LABEL_FONT_SIZE: '1.2em',
            FULL_CARD_LABEL_FONT_STYLE: 'normal',
            
            LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
            LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.9)',
            LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
            LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
            LIST_CARD_LABEL_FONT_WEIGHT: '600',
            LIST_CARD_LABEL_FONT_SIZE: '1.1em',
            LIST_CARD_LABEL_FONT_STYLE: 'normal',
            
            MANUAL_OVERRIDES: {
                '338969': { quality_code: 2160, full_label: '4K WEB-DL', simple_label: '4K' },
                '654028': { quality_code: 2160, full_label: '4K WEB-DL', simple_label: '4K' },
                '12556': { quality_code: 1080, full_label: '1080 ВDRemux', simple_label: 'FHD' },
                '604079': { quality_code: 2160, full_label: '4K WEB-DL', simple_label: '4K' },
                '1267905': { quality_code: 2160, full_label: '4K WEB-DL', simple_label: '4K' }
            }
        },

        init: function() {
            this.initStyles();
            this.initObservers();
            this.initSettings();
        },

        initStyles: function() {
            var style = "<style id=\"lampa_quality_styles\">" +
                ".full-start-new__rate-line {" +
                "flex-wrap: wrap;" +
                "gap: 0.4em 0;" +
                "}" +
                ".full-start-new__rate-line > * {" +
                "margin-right: 0.5em;" +
                "flex-shrink: 0;" +
                "flex-grow: 0;" +
                "}" +
                ".lqe-quality {" +
                "min-width: 2.8em;" +
                "text-align: center;" +
                "text-transform: none;" +
                "border: 1px solid " + this.config.FULL_CARD_LABEL_BORDER_COLOR + " !important;" +
                "color: " + this.config.FULL_CARD_LABEL_TEXT_COLOR + " !important;" +
                "font-weight: " + this.config.FULL_CARD_LABEL_FONT_WEIGHT + " !important;" +
                "font-size: " + this.config.FULL_CARD_LABEL_FONT_SIZE + " !important;" +
                "font-style: " + this.config.FULL_CARD_LABEL_FONT_STYLE + " !important;" +
                "border-radius: 0.2em;" +
                "padding: 0.3em;" +
                "height: 1.72em;" +
                "display: flex;" +
                "align-items: center;" +
                "justify-content: center;" +
                "box-sizing: border-box;" +
                "}" +
                ".card__view {" +
                " position: relative; " +
                "}" +
                ".card__quality {" +
                " position: absolute; " +
                " bottom: 0.50em; " +
                " left: 0; " +
                " margin-left: -0.78em; " +
                " background-color: " + (this.config.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : this.config.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" +
                " z-index: 10;" +
                " width: fit-content; " +
                " max-width: calc(100% - 1em); " +
                " border-radius: 0.3em 0.3em 0.3em 0.3em; " +
                " overflow: hidden;" +
                "}" +
                ".card__quality div {" +
                " text-transform: uppercase; " +
                " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " +
                " font-weight: 700; " +
                " letter-spacing: 0.1px; " +
                " font-size: 1.10em; " +
                " color: " + this.config.LIST_CARD_LABEL_TEXT_COLOR + " !important;" +
                " padding: 0.1em 0.1em 0.08em 0.1em; " +
                " white-space: nowrap;" +
                " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " +
                "}" +
                ".lqe-hide-full .full-start__status.lqe-quality { display: none !important; }" +
                "</style>";

            Lampa.Template.add('lampa_quality_css', style);
            $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));
        },

        initObservers: function() {
            // Слідкування за повною карткою
            Lampa.Listener.follow('full', function(event) {
                if (event.type == 'complite') {
                    QualityModule.processFullCard(event.data.movie, event.object.activity.render());
                }
            });

            // Слідкування за списковими картками
            var observer = new MutationObserver(CommonUtils.debounce(function(mutations) {
                var newCards = [];
                for (var m = 0; m < mutations.length; m++) {
                    var mutation = mutations[m];
                    if (mutation.addedNodes) {
                        for (var j = 0; j < mutation.addedNodes.length; j++) {
                            var node = mutation.addedNodes[j];
                            if (node.nodeType !== 1) continue;
                            
                            if (node.classList && node.classList.contains('card')) {
                                newCards.push(node);
                            }
                            
                            try {
                                var nestedCards = node.querySelectorAll('.card');
                                for (var k = 0; k < nestedCards.length; k++) {
                                    newCards.push(nestedCards[k]);
                                }
                            } catch (e) {}
                        }
                    }
                }
                
                if (newCards.length) {
                    QualityModule.processCardBatch(newCards);
                }
            }, 15));

            var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
            if (containers && containers.length) {
                for (var i = 0; i < containers.length; i++) {
                    try {
                        observer.observe(containers[i], { childList: true, subtree: true });
                    } catch (e) {}
                }
            } else {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        },

        processCardBatch: function(cards) {
            var BATCH_SIZE = 10;
            var DELAY_MS = 50;
            
            function processBatch(startIndex) {
                var batch = cards.slice(startIndex, startIndex + BATCH_SIZE);
                batch.forEach(function(card) {
                    if (card.isConnected) {
                        QualityModule.updateCardListQuality(card);
                    }
                });
                var nextIndex = startIndex + BATCH_SIZE;
                if (nextIndex < cards.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                }
            }
            
            if (cards.length > 0) {
                processBatch(0);
            }
        },

        // ... (решта функцій модуля якості з quality.js)

        initSettings: function() {
            // Налаштування для модуля якості
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'quality_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Мітки якості' },
                onChange: function(v) {
                    QualityModule.config.enabled = (v === 'true');
                }
            });
        }
    };

    // ===================== МОДУЛЬ УКРАЇНСЬКОГО ОЗВУЧЕННЯ =====================
    var UAModule = {
        config: {
            CACHE_VERSION: PLUGIN_CONFIG.cacheVersion,
            CACHE_KEY: 'lampa_ukr_tracks_cache',
            CACHE_VALID_TIME_MS: 12 * 60 * 60 * 1000,
            CACHE_REFRESH_THRESHOLD_MS: 6 * 60 * 60 * 1000,
            JACRED_PROTOCOL: 'http://',
            JACRED_URL: 'jacred.xyz',
            PROXY_LIST: [
                'http://api.allorigins.win/raw?url=',
                'http://cors.bwa.workers.dev/'
            ],
            PROXY_TIMEOUT_MS: 3500,
            MAX_PARALLEL_REQUESTS: 10,
            SHOW_TRACKS_FOR_TV_SERIES: true,
            DISPLAY_MODE: 'flag',
            
            MANUAL_OVERRIDES: {
                '207703': { track_count: 1 },
                '1195518': { track_count: 2 },
                '215995': { track_count: 2 },
                '1234821': { track_count: 2 },
                '933260': { track_count: 3 },
                '245827': { track_count: 0 }
            }
        },

        init: function() {
            this.initStyles();
            this.initObservers();
            this.initSettings();
        },

        initStyles: function() {
            var style = "<style id=\"lampa_tracks_styles\">" +
                ".card__view { position: relative; }" +
                ".card__tracks {" +
                " position: absolute !important; " +
                " right: 0.3em !important; " +
                " left: auto !important; " +
                " top: 0.3em !important; " +
                " background: rgba(0,0,0,0.5) !important;" +
                " color: #FFFFFF !important;" +
                " font-size: 1.3em !important;" +
                " padding: 0.2em 0.5em !important;" +
                " border-radius: 1em !important;" +
                " font-weight: 700 !important;" +
                " z-index: 20 !important;" +
                " width: fit-content !important; " +
                " max-width: calc(100% - 1em) !important; " +
                " overflow: hidden !important;" +
                "}" +
                ".card__tracks.positioned-below-rating {" +
                " top: 1.85em !important; " +
                "}" +
                ".card__tracks div {" +
                " text-transform: none !important; " +
                " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important; " +
                " font-weight: 700 !important; " +
                " letter-spacing: 0.1px !important; " +
                " font-size: 1.05em !important; " +
                " color: #FFFFFF !important;" +
                " padding: 0 !important; " +
                " white-space: nowrap !important;" +
                " display: flex !important; " +
                " align-items: center !important; " +
                " gap: 4px !important; " +
                " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important; " +
                "}" +
                ".card__tracks .flag-svg {" +
                " display: inline-block;" +
                " vertical-align: middle;" +
                " width: 1.6em;" +
                " height: 0.9em;" +
                " margin-right: -0.1em;" +
                " margin-left: -0.1em;" +
                " margin-top: 0em;" +
                "}" +
                "</style>";

            Lampa.Template.add('lampa_tracks_css', style);
            $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));
        },

        // ... (решта функцій модуля UA-Finder)

        initSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'ua_finder_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Українське озвучення' },
                onChange: function(v) {
                    UAModule.config.enabled = (v === 'true');
                }
            });
        }
    };

    // ===================== МОДУЛЬ МІТОК СЕЗОНІВ =====================
    var SeasonsModule = {
        config: {
            tmdbApiKey: '27489d4d8c9dbd0f2b3e89f68821de34',
            cacheTime: 12 * 60 * 60 * 1000,
            enabled: true,
            language: 'uk'
        },

        init: function() {
            this.initStyles();
            this.initObservers();
            this.initSettings();
        },

        initStyles: function() {
            var style = document.createElement('style');
            style.textContent = `
                .card--content-type {
                    position: absolute;
                    top: 5px;
                    left: 0;
                    margin-left: -0.25em;
                    z-index: 12;
                    width: fit-content;
                    max-width: calc(100% - 1em);
                    border-radius: 0.2em;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.22s ease-in-out;
                    font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
                    font-weight: 700;
                    font-size: 0.85em;
                    padding: 0.3em 0.3em;
                    white-space: nowrap;
                    text-align: center;
                    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
                }
                
                .card--content-type.movie {
                    background-color: rgba(33, 150, 243, 0.9);
                    color: #ffffff;
                }
                
                .card--content-type.tv {
                    background-color: rgba(156, 39, 176, 0.9);
                    color: #ffffff;
                }
                
                .card--content-type.show {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        },

        // ... (решта функцій модуля сезонів)

        initSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'seasons_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Мітка сезонів' },
                onChange: function(v) {
                    SeasonsModule.config.enabled = (v === 'true');
                }
            });
        }
    };

    // ===================== МОДУЛЬ ВІЗУАЛІЗАЦІЇ ДУБЛЯЖУ =====================
    var VisualModule = {
        config: {
            enabled: true,
            replacements: {
                'Дублированный': 'Дубльований',
                'Ukr': '🇺🇦 Українською',
                'Ua': '🇺🇦 Ua',
                'Дубляж': 'Дубльований',
                'Многоголосый': 'Багатоголосий',
                'Украинский': '🇺🇦 Українською',
                'Zetvideo': 'UaFlix',
                'Нет истории просмотра': 'Історія перегляду відсутня'
            }
        },

        init: function() {
            this.initStyles();
            this.initObservers();
            this.initSettings();
        },

        initStyles: function() {
            var style = document.createElement('style');
            style.innerHTML = `
                .torrent-item__seeds span.high-seeds {
                    color: #00ff00 !important;
                    font-weight: bold !important;
                }
                .torrent-item__bitrate span.high-bitrate {
                    color: #ff0000 !important;
                    font-weight: bold !important;
                }
                .torrent-item__tracker.utopia {
                    color: #9b59b6 !important;
                    font-weight: bold !important;
                }
                .torrent-item__tracker.toloka {
                    color: #2ecc71 !important;
                    font-weight: bold !important;
                }
            `;
            document.head.appendChild(style);
        },

        // ... (решта функцій модуля візуалізації)

        initSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'visual_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Візуалізація дубляжу' },
                onChange: function(v) {
                    VisualModule.config.enabled = (v === 'true');
                }
            });
        }
    };

    // ===================== МОДУЛЬ АУДІОДОРІЖОК =====================
    var TracksModule = {
        init: function() {
            this.initTemplates();
            this.initSettings();
        },

        initTemplates: function() {
            Lampa.Template.add('tracks_css', `
                <style>
                .tracks-loading{margin-top:1em;display:flex;align-items:flex-start}
                .tracks-loading:before{content:'';display:inline-block;width:1.3em;height:1.3em;background:url('./img/loader.svg') no-repeat 50% 50%;background-size:contain;margin-right:.4em}
                .tracks-loading>span{font-size:1.1em;line-height:1.1}
                .tracks-metainfo{margin-top:1em}
                .tracks-metainfo__line+.tracks-metainfo__line{margin-top:2em}
                .tracks-metainfo__label{opacity:.5;font-weight:600}
                .tracks-metainfo__info{padding-top:1em;line-height:1.2}
                .tracks-metainfo__info>div{background-color:rgba(0,0,0,0.22);display:flex;border-radius:.3em;flex-wrap:wrap}
                .tracks-metainfo__info>div.focus{background-color:rgba(255,255,255,0.06)}
                .tracks-metainfo__info>div>div{padding:1em;flex-shrink:0}
                .tracks-metainfo__info>div>div:not(:last-child){padding-right:1.5em}
                .tracks-metainfo__info>div+div{margin-top:1em}
                .tracks-metainfo__column--video,.tracks-metainfo__column--name{margin-right:auto}
                .tracks-metainfo__column--num{min-width:3em;padding-right:0}
                .tracks-metainfo__column--rate{min-width:7em;text-align:right}
                .tracks-metainfo__column--channels{min-width:5em;text-align:right}
                </style>
            `);
            $('body').append(Lampa.Template.get('tracks_css', {}, true));
        },

        initSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'tracks_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Назви аудіодоріжок' },
                onChange: function(v) {
                    TracksModule.config.enabled = (v === 'true');
                }
            });
        }
    };

    // ===================== МОДУЛЬ СУБТИТРІВ =====================
    var SubtitlesModule = {
        init: function() {
            this.initSettings();
        },

        initSettings: function() {
            Lampa.SettingsApi.addParam({
                component: 'info_voice',
                param: {
                    name: 'subtitles_enabled',
                    type: 'select',
                    values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                    default: 'true'
                },
                field: { name: 'Субтитри' },
                onChange: function(v) {
                    SubtitlesModule.config.enabled = (v === 'true');
                }
            });
        }
    };

    // ===================== ОСНОВНА ІНІЦІАЛІЗАЦІЯ =====================
    function initializePlugin() {
        if (window.infoVoicePluginInitialized) return;
        window.infoVoicePluginInitialized = true;

        // Ініціалізація поліфілів
        CommonUtils.initPolyfills();

        // Додавання розділу в налаштування
        Lampa.SettingsApi.addPage({
            component: 'info_voice',
            position: 2000,
            name: SETTINGS_ICON + 'Інформація та озвучення',
            template: {
                html: '',
                style: '',
                source: ''
            }
        });

        // Загальне вмикання/вимикання
        Lampa.SettingsApi.addParam({
            component: 'info_voice',
            param: {
                name: 'plugin_enabled',
                type: 'select',
                values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                default: 'true'
            },
            field: { name: 'Загальне вмикання плагіна' },
            onChange: function(v) {
                PLUGIN_CONFIG.enabled = (v === 'true');
                // Тут можна додати логіку для вмикання/вимикання всіх модулів
            }
        });

        // Ініціалізація модулів
        QualityModule.init();
        UAModule.init();
        SeasonsModule.init();
        VisualModule.init();
        TracksModule.init();
        SubtitlesModule.init();

        console.log('Плагін "Інформація та озвучення" успішно ініціалізовано');
    }

    // Запуск плагіна
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlugin);
    } else {
        initializePlugin();
    }
})();
