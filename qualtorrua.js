(function () {
    'use strict';

    /**
     * TORRQUA UA ULTRA - МОДИФІКОВАНИЙ ДЛЯ СУМІСНОСТІ
     * Цей плагін шукає українські роздачі та відображає їх окремою міткою.
     */

    // --- 1. ПОЛІФІЛИ ДЛЯ СУМІСНОСТІ ЗІ СТАРИМИ ТВ (WebOS, Tizen, Android 4.4) ---
    
    if (typeof AbortController === 'undefined') {
        window.AbortController = function () {
            this.signal = {
                aborted: false,
                _handlers: [],
                addEventListener: function (type, handler) {
                    if (type === 'abort') this._handlers.push(handler);
                }
            };
            this.abort = function () {
                this.signal.aborted = true;
                this.signal._handlers.forEach(function (h) { h(); });
            };
        };
    }

    if (!window.performance || !window.performance.now) {
        window.performance = {
            now: function () { return new Date().getTime(); }
        };
    }

    // --- 2. КОНФІГУРАЦІЯ ТА УНІКАЛЬНІ КЛЮЧІ ---
    
    var ENABLE_LOGGING = true;
    var JACRED_PROTOCOL = 'http://';
    var JACRED_URL = Lampa.Storage.get('jacred.xyz') || 'jacred.xyz';
    
    // Унікальні ключі для ізоляції від інших плагінів
    var CACHE_NAME = 'torrqua_ua_ultimate_cache_v2'; 
    var PLUGIN_PREFIX = 'torrqua_';

    var PROXY_LIST = [
        'http://well-informed-normal-function.anvil.app/_/api/jackett_proxy?u=',
        'http://my-finder.kozak-bohdan.workers.dev/?url=',
        'http://api.allorigins.win/raw?url=',
        'http://cors.bwa.workers.dev/'
    ];
    var PROXY_TIMEOUT = 12000;

    var Logger = {
        log: function (msg) {
            if (ENABLE_LOGGING) console.log("[TORRQUA-UA] " + msg);
        }
    };

    var EMOJI_UA = '<span style="margin-right: 4px; font-size: 1.1em; vertical-align: middle;">🇺🇦</span>';
    var EMOJI_PROJ = '<span style="margin: 0 4px; font-size: 1.0em; vertical-align: middle;">📽️</span>';

    // --- 3. СТИЛІ (УНІКАЛЬНІ КЛАСИ ДЛЯ УНИКНЕННЯ КОНФЛІКТІВ) ---
    
    var styleId = 'torrqua-ua-styles';
    if (!document.getElementById(styleId)) {
        var styleTag = document.createElement('style');
        styleTag.id = styleId;
        styleTag.textContent = [
            '.full-start__status.torrqua_label_unique {',
            '    padding: 0.2em 0.5em;',
            '    font-weight: bold;',
            '    margin-left: 10px;',
            '    display: inline-flex;',
            '    align-items: center;',
            '    background: rgba(255, 255, 255, 0.1);',
            '    border-radius: 4px;',
            '    line-height: 1;',
            '}',
            '.torrqua_label_unique span { white-space: nowrap; }',
            '.torrqua_label_unique .seeds_count { margin-left: 4px; font-size: 0.85em; opacity: 0.7; font-weight: normal; }'
        ].join('\n');
        document.head.appendChild(styleTag);
    }

    // --- 4. ЯДРО АНАЛІЗУ ЯКОСТІ ---

    function getQualityWeight(title) {
        if (!title) return 0;
        var t = title.toLowerCase();
        
        if (/\b(ts|tc|telesync|cam|camrip|hdtc|dvdscr)\b/.test(t)) return -1; // Trash
        if (/\b(2160p|4k|uhd)\b/.test(t)) return 2160;
        if (/\b(1080p|fhd|fullhd|bdremux|remux)\b/.test(t)) return 1080;
        if (/\b(720p|hd)\b/.test(t)) return 720;
        if (/\b(bdrip|brrip|bluray)\b/.test(t)) return 1079;
        if (/\b(dvdrip|dvd|dvdr)\b/.test(t)) return 481;
        if (/\b(480p|360p|sd|webrip|web-dl)\b/.test(t)) return 480;
        
        return 1; // Unknown but exists
    }

    function getLabelData(weight) {
        if (weight === -1) return { t: 'CAM', c: '#ff4c4c' };
        if (weight >= 2160) return { t: '4K', c: '#ff0000' };
        if (weight >= 1080) return { t: 'FHD', c: '#3498db' };
        if (weight >= 720) return { t: 'HD', c: '#2ecc71' };
        if (weight > 0) return { t: 'SD', c: '#bdc3c7' };
        return { t: '?', c: '#777' };
    }

    // --- 5. РОБОТА З МЕРЕЖЕЮ ТА КЕШЕМ ---

    function getStorage() {
        try {
            return JSON.parse(localStorage.getItem(CACHE_NAME) || '{}');
        } catch (e) { return {}; }
    }

    function saveToStorage(id, data) {
        var store = getStorage();
        store[id] = {
            val: data,
            exp: Date.now() + (1000 * 60 * 60 * 48) // 48 годин
        };
        // Очистка старих записів, щоб не забивати пам'ять
        var now = Date.now();
        for (var k in store) { if (store[k].exp < now) delete store[k]; }
        localStorage.setItem(CACHE_NAME, JSON.stringify(store));
    }

    function smartFetch(url, attempt) {
        attempt = attempt || 0;
        if (attempt >= PROXY_LIST.length) return Promise.reject("All proxies failed");

        return new Promise(function (resolve, reject) {
            var controller = new AbortController();
            var timer = setTimeout(function () {
                controller.abort();
            }, PROXY_TIMEOUT);

            var finalUrl = PROXY_LIST[attempt] + encodeURIComponent(url);

            fetch(finalUrl, { signal: controller.signal })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    clearTimeout(timer);
                    resolve(data);
                })
                .catch(function () {
                    clearTimeout(timer);
                    Logger.log("Proxy " + attempt + " failed, trying next...");
                    smartFetch(url, attempt + 1).then(resolve).catch(reject);
                });
        });
    }

    // --- 6. ОСНОВНИЙ ПОШУК ---

    function findUaRelease(movie, callback) {
        var movieKey = movie.id + '_ua';
        var cached = getStorage()[movieKey];
        
        if (cached && cached.exp > Date.now()) {
            return callback(cached.val);
        }

        var query = (movie.title || movie.name);
        var searchUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v1/search?query=' + encodeURIComponent(query + " ukr");

        smartFetch(searchUrl)
            .then(function (json) {
                var results = Array.isArray(json) ? json : [];
                var best = { w: 0, s: 0, title: '' };
                var popular = { w: 0, s: 0, title: '' };

                results.forEach(function (item) {
                    var w = getQualityWeight(item.title);
                    var s = parseInt(item.seeds) || 0;

                    // Шукаємо найкращу якість
                    if (w > best.w) {
                        best = { w: w, s: s, title: item.title };
                    } else if (w === best.w && s > best.s) {
                        best.s = s;
                    }

                    // Шукаємо найпопулярніше (найбільше сидів)
                    if (s > popular.s) {
                        popular = { w: w, s: s, title: item.title };
                    }
                });

                var finalData = { best: best, popular: popular };
                saveToStorage(movieKey, finalData);
                callback(finalData);
            })
            .catch(function (err) {
                Logger.log("Search error: " + err);
                callback(null);
            });
    }

    // --- 7. ВІДОБРАЖЕННЯ В ІНТЕРФЕЙСІ ---

    function buildHtml(data) {
        if (!data || !data.best || data.best.w === 0) return '';

        var bLabel = getLabelData(data.best.w);
        var html = EMOJI_UA + '<span style="color:' + bLabel.c + '">' + bLabel.t + '</span>';

        // Якщо є популярна роздача з іншою якістю, показуємо її теж
        if (data.popular && data.popular.w > 0 && data.popular.title !== data.best.title) {
            var pLabel = getLabelData(data.popular.w);
            html += EMOJI_PROJ + '<span style="color:' + pLabel.c + '">' + pLabel.t + '</span>';
            if (data.popular.s > 0) {
                html += '<span class="seeds_count">(' + data.popular.s + ')</span>';
            }
        }

        return html;
    }

    function renderLabels(movie, container) {
        // Не працюємо з серіалами в цій логіці (опціонально)
        if (!movie || movie.number_of_seasons) return;

        var rateLine = container.find('.full-start-new__rate-line');
        if (!rateLine.length) return;

        // Видаляємо стару мітку якщо вона є (запобігання дублікатам)
        rateLine.find('.torrqua_label_unique').remove();

        var placeholder = $('<div class="full-start__status torrqua_label_unique" style="opacity:0.4">UA...</div>');
        rateLine.append(placeholder);

        findUaRelease(movie, function (res) {
            placeholder.remove();
            var content = buildHtml(res);
            if (content) {
                var label = $('<div class="full-start__status torrqua_label_unique"></div>');
                label.html(content);
                rateLine.append(label);
            }
        });
    }

    // --- 8. ІНІЦІАЛІЗАЦІЯ ПЛАГІНА ---

    function init() {
        if (window.torrquaUaInitialized) return;
        window.torrquaUaInitialized = true;

        Logger.log("Plugin Integrated & Conflict-Free Mode Enabled");

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                // Використовуємо таймаут щоб дочекатися відмальовки базового інтерфейсу Lampa
                setTimeout(function() {
                    renderLabels(e.data.movie, e.object.activity.render());
                }, 10);
            }
        });
    }

    // Запуск після завантаження Lampa
    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();