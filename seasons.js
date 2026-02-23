(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // --- ПОЛІФІЛИ ---
    if (typeof window.Promise === 'undefined') {
        (function () {
            function SimplePromise(executor) {
                var self = this; self._state = 'pending'; self._value = undefined; self._handlers = [];
                function fulfill(result) { if (self._state !== 'pending') return; self._state = 'fulfilled'; self._value = result; runHandlers(); }
                function reject(err) { if (self._state !== 'pending') return; self._state = 'rejected'; self._value = err; runHandlers(); }
                function runHandlers() { setTimeout(function () { var handlers = self._handlers.slice(); self._handlers = []; for (var i = 0; i < handlers.length; i++) { handle(handlers[i]); } }, 0); }
                function handle(handler) {
                    if (self._state === 'pending') { self._handlers.push(handler); return; }
                    var cb = self._state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;
                    if (!cb) { if (self._state === 'fulfilled') handler.resolve(self._value); else handler.reject(self._value); return; }
                    try { var ret = cb(self._value); handler.resolve(ret); } catch (e) { handler.reject(e); }
                }
                self.then = function (onFulfilled, onRejected) { return new SimplePromise(function (resolve, reject) { handle({ onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null, onRejected: typeof onRejected === 'function' ? onRejected : null, resolve: resolve, reject: reject }); }); };
                self.catch = function (onRejected) { return self.then(null, onRejected); };
                try { executor(fulfill, reject); } catch (e) { reject(e); }
            }
            window.Promise = SimplePromise;
        })();
    }

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    var safeStorage = (function () {
        var memoryStore = {};
        try {
            if (typeof window.localStorage !== 'undefined') {
                var testKey = '__season_test__';
                window.localStorage.setItem(testKey, '1');
                window.localStorage.removeItem(testKey);
                return window.localStorage;
            }
        } catch (e) {}
        return {
            getItem: function (k) { return memoryStore.hasOwnProperty(k) ? memoryStore[k] : null; },
            setItem: function (k, v) { memoryStore[k] = String(v); },
            removeItem: function (k) { delete memoryStore[k]; }
        };
    })();

    function safeFetch(url) {
        return new Promise(function (resolve, reject) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, json: function() { return new Promise(function(res){ res(JSON.parse(xhr.responseText)); }); } });
                        else reject(new Error('HTTP ' + xhr.status));
                    }
                };
                xhr.onerror = function () { reject(new Error('Network error')); };
                xhr.send(null);
            } catch (err) { reject(err); }
        });
    }

    // --- НАЛАШТУВАННЯ ---
    var CONFIG = { tmdbApiKey: '', cacheTime: 23 * 60 * 60 * 1000, enabled: true, language: 'uk' };

    function tmdbGet(tvId, resolve, reject) {
        try {
            if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.tv === 'function') {
                Lampa.TMDB.tv(tvId, function (data) { resolve(data); }, function (err) { reject(err); }, { language: CONFIG.language });
                return;
            }
        } catch (e) {}
        var url = 'https://api.themoviedb.org/3/tv/' + tvId + '?api_key=' + CONFIG.tmdbApiKey + '&language=' + CONFIG.language;
        safeFetch(url).then(function (r) { return r.json(); }).then(resolve).catch(reject);
    }

    // --- СТИЛІ (ЯК У SEASONSINFO: ЗЕЛЕНИЙ ТА ЧЕРВОНИЙ) ---
    var style = document.createElement('style');
    style.textContent =
        "/* Стиль для ЗАВЕРШЕНИХ сезонів (зелена мітка) */\n" +
        ".card--season-complete {\n" +
        "    position: absolute;\n" +
        "    left: 0;\n" +
        "    margin-left: -0.65em;\n" +
        "    bottom: 0.50em;\n" +
        "    background-color: rgba(61, 161, 141, 0.9);\n" +
        "    z-index: 12;\n" +
        "    width: fit-content;\n" +
        "    max-width: calc(100% - 1em);\n" +
        "    border-radius: 0.3em 0.3em 0.3em 0.3em;\n" +
        "    overflow: hidden;\n" +
        "    opacity: 0;\n" +
        "    transition: opacity 0.22s ease-in-out;\n" +
        "}\n" +
        "\n" +
        "/* Стиль для НЕЗАВЕРШЕНИХ сезонів (червона мітка) */\n" +
        ".card--season-progress {\n" +
        "    position: absolute;\n" +
        "    left: 0;\n" +
        "    margin-left: -0.65em;\n" +
        "    bottom: 0.50em;\n" +
        "    background-color: rgba(255, 66, 66, 1);\n" +
        "    z-index: 12;\n" +
        "    width: fit-content;\n" +
        "    max-width: calc(100% - 1em);\n" +
        "    border-radius: 0.3em 0.3em 0.3em 0.3em;\n" +
        "    overflow: hidden;\n" +
        "    opacity: 0;\n" +
        "    transition: opacity 0.22s ease-in-out;\n" +
        "}\n" +
        "\n" +
        "/* Спільні стилі тексту для обох типів міток */\n" +
        ".card--season-complete div,\n" +
        ".card--season-progress div {\n" +
        "    text-transform: uppercase;\n" +
        "    font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;\n" +
        "    font-weight: 700;\n" +
        "    font-size: 1.0em;\n" +
        "    padding: 0.39em 0.39em;\n" +
        "    white-space: nowrap;\n" +
        "    display: flex;\n" +
        "    align-items: center;\n" +
        "    gap: 4px;\n" +
        "    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);\n" +
        "    color: #ffffff;\n" +
        "}\n" +
        "\n" +
        "/* Клас .show робить мітку видимою */\n" +
        ".card--season-complete.show,\n" +
        ".card--season-progress.show {\n" +
        "    opacity: 1;\n" +
        "}\n" +
        "\n" +
        "/* Адаптація для телевізорів / маленьких екранів */\n" +
        "@media (max-width: 768px) {\n" +
        "    .card--season-complete div,\n" +
        "    .card--season-progress div {\n" +
        "        font-size: 0.95em;\n" +
        "        padding: 0.35em 0.40em;\n" +
        "    }\n" +
        "}";
    document.head.appendChild(style);

    // --- ЛОГІКА ---
    var cache = {};
    try { cache = JSON.parse(safeStorage.getItem('seasonBadgeCache') || '{}'); } catch (e) {}

    function fetchSeriesData(tmdbId) {
        return new Promise(function (resolve, reject) {
            var now = (new Date()).getTime();
            if (cache[tmdbId] && (now - cache[tmdbId].timestamp < CONFIG.cacheTime)) return resolve(cache[tmdbId].data);
            if (!CONFIG.tmdbApiKey) return reject();
            tmdbGet(tmdbId, function (data) {
                cache[tmdbId] = { data: data, timestamp: now };
                try { safeStorage.setItem('seasonBadgeCache', JSON.stringify(cache)); } catch (e) {}
                resolve(data);
            }, reject);
        });
    }

    function adjustBadgePosition(cardEl, badge) {
        if (!cardEl || !badge) return;
        
        var vote = cardEl.querySelector('.card__vote');
        var quality = cardEl.querySelector('.card__quality');
        
        var baseBottom = 0;
        var targetHeight = 0;

        // Визначаємо верхню межу нижніх бейджів
        var target = vote || quality;
        if (target) {
            targetHeight = target.offsetHeight || 20;
            var st = window.getComputedStyle(target);
            baseBottom = parseFloat(st.bottom) || 0;
        }

        // Позиція: (відступ знизу + висота нижнього бейджа) + ще 0.5em (приблизно 8-10px)
        var finalBottom = baseBottom + targetHeight + 10; 
        badge.style.bottom = finalBottom + 'px';
    }

    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (!cardEl.card_data) { requestAnimationFrame(function () { addSeasonBadge(cardEl); }); return; }
        
        var data = cardEl.card_data;
        if (!(data.name || data.first_air_date || data.number_of_seasons)) return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Видаляємо старі мітки
        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        for (var i = 0; i < oldBadges.length; i++) {
            if (oldBadges[i] && oldBadges[i].parentNode) {
                oldBadges[i].parentNode.removeChild(oldBadges[i]);
            }
        }

        var badge = document.createElement('div');
        badge.className = 'card--season-progress'; // Тимчасово використовуємо progress
        badge.innerHTML = '<div>...</div>';
        view.appendChild(badge);
        cardEl.setAttribute('data-season-processed', 'loading');
        
        adjustBadgePosition(cardEl, badge);

        fetchSeriesData(data.id).then(function (tmdbData) {
            if (!tmdbData || !tmdbData.last_episode_to_air) { badge.remove(); return; }
            
            var last = tmdbData.last_episode_to_air;
            var currentSeason = tmdbData.seasons.filter(function(s) { return s.season_number === last.season_number; })[0];
            
            if (currentSeason && last.season_number > 0) {
                var isComplete = last.episode_number >= currentSeason.episode_count;
                var text = isComplete ? "S" + last.season_number : "S" + last.season_number + " " + last.episode_number + "/" + currentSeason.episode_count;
                
                // Змінюємо клас в залежності від статусу
                badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                badge.innerHTML = '<div>' + text + '</div>';
                
                requestAnimationFrame(function() {
                    adjustBadgePosition(cardEl, badge);
                    badge.classList.add('show');
                });
                cardEl.setAttribute('data-season-processed', 'done');
            } else { badge.remove(); }
        }).catch(function () { badge.remove(); });
    }

    // --- ІНІЦІАЛІЗАЦІЯ ---
    var mainObserver = new (window.MutationObserver || window.WebKitMutationObserver)(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var nodes = mutations[i].addedNodes;
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].nodeType !== 1) continue;
                if (nodes[j].classList.contains('card')) addSeasonBadge(nodes[j]);
                else {
                    var cards = nodes[j].querySelectorAll('.card');
                    for (var k = 0; k < cards.length; k++) addSeasonBadge(cards[k]);
                }
            }
        }
    });

    function init() {
        if (!CONFIG.enabled) return;
        mainObserver.observe(document.body, { childList: true, subtree: true });
        var existing = document.querySelectorAll('.card');
        for (var i = 0; i < existing.length; i++) {
            (function(c, t){ setTimeout(function(){ addSeasonBadge(c); }, t); })(existing[i], i * 20);
        }
    }

    // --- НАЛАШТУВАННЯ ---
    (function () {
        var SETTINGS_KEY = 'sbadger_settings_v1';
        function load() {
            var s = Lampa.Storage.get(SETTINGS_KEY) || {};
            if (s.tmdb_key) CONFIG.tmdbApiKey = s.tmdb_key;
        }
        function registerUI() {
            if (!Lampa.SettingsApi) return;
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { type: 'button', component: 'sbadger' },
                field: { name: 'Мітки сезонів', description: 'Налаштування прогресу серій' },
                onChange: function () { Lampa.Settings.create('sbadger', { template: 'settings_sbadger', onBack: function () { Lampa.Settings.create('interface'); } }); }
            });
            Lampa.SettingsApi.addParam({
                component: 'sbadger',
                param: { name: 'sbadger_tmdb_key', type: 'input', values: '', "default": CONFIG.tmdbApiKey },
                field: { name: 'TMDB API ключ', description: 'Введіть ваш API ключ від TMDB' },
                onChange: function (v) { CONFIG.tmdbApiKey = String(v || '').trim(); Lampa.Storage.set(SETTINGS_KEY, {tmdb_key: CONFIG.tmdbApiKey}); }
            });
        }
        Lampa.Template.add('settings_sbadger', '<div></div>');
        if (window.appready) { load(); registerUI(); init(); }
        else { Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') { load(); registerUI(); init(); } }); }
    })();
})();
