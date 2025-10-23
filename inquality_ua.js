!function() {
    "use strict";

    // === Налаштування ===
    var PLUGIN_NAME = "ua_releases_multi";
    var TMDB_API_KEY = "27489d4d8c9dbd0f2b3e89f68821de34"; // твій ключ
    var TMDB_NOW_PLAYING = "https://api.themoviedb.org/3/movie/now_playing?api_key=" + TMDB_API_KEY + "&language=uk-UA&page=";
    var KINOXA_JSON = "http://kinoxa.click/inq_parser.json"; // залишено як одне з джерел
    var FILMIX_JSON = "https://example.com/filmix_parser.json"; // <- заміни на реальний URL або залиш пустим
    var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256,81.077C159.55,81.077,81.077,159.55,81.077,256c0,10.578,8.574,19.152,19.152,19.152s19.152-8.574,19.152-19.158c0-75.325,61.287-136.612,136.618-136.612c10.572,0,19.152-8.574,19.152-19.152S266.578,81.077,256,81.077z"/><path fill="currentColor" d="M411.771,236.848c-10.578,0-19.152,8.574-19.152,19.152c0,75.325-61.287,136.618-136.618,136.618c-10.578,0-19.152,8.574-19.152,19.152c0,10.578,8.574,19.152,19.152,19.152c96.45,0,174.923-78.473,174.923-174.923C430.923,245.422,422.349,236.848,411.771,236.848z"/></svg>';

    Lampa.Lang.add({
        ua_releases_multi_title: { uk: "Нові релізи (UA)", en: "New Releases (UA)" }
    });

    // === Службові функції для роботи з мережою ===
    function fetchJson(url) {
        return new Promise(function(resolve) {
            if (!url) return resolve(null);
            var network = new Lampa.Reguest();
            network.silent(url, function(json) {
                resolve(json);
            }, function() {
                resolve(null);
            });
        });
    }

    function tmdbSearch(title) {
        return new Promise(function(resolve) {
            if (!title) return resolve(null);
            // використовуємо Lampa.TMDB.search — повертає результати TMDB
            try {
                Lampa.TMDB.search(title, function(found) {
                    if (found && found.results && found.results.length) resolve(found.results[0]);
                    else resolve(null);
                }, function() { resolve(null); }, { language: 'uk-UA', api_key: TMDB_API_KEY, type: 'movie' });
            } catch (e) { resolve(null); }
        });
    }

    // Нормалізуємо назву для дедупа
    function normalizeTitle(t) {
        if (!t) return "";
        return t.toString().trim().toLowerCase().replace(/[^a-z0-9\u0400-\u04FF]+/gi, ' ');
    }

    // === Основний сервіс плагіна ===
    function MultiSourceService() {
        var self = this;
        var network = new Lampa.Reguest();
        var localCache = {}; // кеш для швидкого оновлення карток

        // повертає список для Lampa
        self.list = function(params, onComplete, onError) {
            var page = parseInt(params.page) || 1;

            // паралельно беремо кілька джерел:
            Promise.all([
                fetchJson(TMDB_NOW_PLAYING + page),        // TMDB now_playing (українською)
                fetchJson(KINOXA_JSON),                   // Kinoxa JSON (якщо доступний)
                fetchJson(FILMIX_JSON)                    // Filmix (якщо вказано валідний URL)
            ]).then(async function(results) {
                var tmdb = results[0];
                var kinoxa = results[1];
                var filmix = results[2];

                var collected = [];

                // 1) Додаємо TMDB результати — вони вже українські та з постерами
                if (tmdb && Array.isArray(tmdb.results)) {
                    tmdb.results.forEach(function(item) {
                        var card = {
                            id: 'tmdb-' + item.id,
                            title: item.title || item.original_title || '',
                            original_title: item.original_title || '',
                            poster_path: item.poster_path ? "https://image.tmdb.org/t/p/w500" + item.poster_path : '',
                            vote_average: item.vote_average || 0,
                            release_date: item.release_date || '',
                            source: 'tmdb',
                            type: 'movie'
                        };
                        collected.push(card);
                        localCache[normalizeTitle(card.title) + (card.release_date||'')] = card;
                    });
                }

                // Helper: обработчик внешних источников (kinoxa/filmix): ожидаем либо array results либо root array
                function parseExternalList(json) {
                    if (!json) return [];
                    if (Array.isArray(json)) return json;
                    if (Array.isArray(json.results)) return json.results;
                    if (Array.isArray(json.items)) return json.items;
                    return [];
                }

                // 2) Додаємо Kinoxa — з JSON беремо мінімум (title, poster_path, release_date)
                var kinList = parseExternalList(kinoxa);
                for (var i=0;i<kinList.length;i++) {
                    var it = kinList[i];
                    var srcTitle = it.title || it.name || it.original_title || '';
                    var idKey = 'kinoxa-' + (it.id || i + '-k');
                    var baseCard = {
                        id: idKey,
                        title: srcTitle,
                        original_title: srcTitle,
                        poster_path: it.poster_path || it.poster || '',
                        vote_average: it.vote_average || it.rating || 0,
                        release_date: it.release_date || it.year || '',
                        source: 'kinoxa',
                        source_data: it,
                        type: 'movie'
                    };

                    // якщо в колекції вже є такий фільм (по нормалізованій назві + рік) — пропускаємо
                    var norm = normalizeTitle(srcTitle) + (baseCard.release_date||'');
                    if (!localCache[norm]) {
                        collected.push(baseCard);
                        localCache[norm] = baseCard;
                        // асинхронно підтягуємо з TMDB UA назву та постер
                        enrichCardFromTMDB(baseCard);
                    }
                }

                // 3) Додаємо Filmix (опціонально)
                var filmixList = parseExternalList(filmix);
                for (var j=0;j<filmixList.length;j++) {
                    var f = filmixList[j];
                    var fTitle = f.title || f.name || '';
                    var fIdKey = 'filmix-' + (f.id || j + '-f');
                    var fCard = {
                        id: fIdKey,
                        title: fTitle,
                        original_title: fTitle,
                        poster_path: f.poster_path || f.poster || '',
                        vote_average: f.vote_average || f.rating || 0,
                        release_date: f.release_date || f.year || '',
                        source: 'filmix',
                        source_data: f,
                        type: 'movie'
                    };

                    var normf = normalizeTitle(fTitle) + (fCard.release_date||'');
                    if (!localCache[normf]) {
                        collected.push(fCard);
                        localCache[normf] = fCard;
                        enrichCardFromTMDB(fCard);
                    }
                }

                // якщо взагалі нічого не знайшлося — повертаємо пустий список
                if (!collected.length) {
                    return onComplete({ results: [], page: 1, total_pages: 1, total_results: 0 });
                }

                // пагінація — Lampa чекає pageSize = 20
                var PAGE_SIZE = 20;
                var start = (page - 1) * PAGE_SIZE;
                var pageItems = collected.slice(start, start + PAGE_SIZE);

                // повертаємо картки одразу — без чекання TMDB-оновлень
                onComplete({
                    results: pageItems,
                    page: page,
                    total_pages: Math.ceil(collected.length / PAGE_SIZE),
                    total_results: collected.length
                });

                // Після відправки списку асинхронно будемо підвантажувати українські назви/постери для карток,
                // якщо вони були не з TMDB (функція enrichCardFromTMDB викликається при додаванні картки).
            }).catch(function(e) {
                onError(e);
            });
        };

        // Окрема функція: намагаємось знайти в TMDB український варіант за назвою і оновити картку
        async function enrichCardFromTMDB(card) {
            if (!card || !card.title) return;
            try {
                var found = await tmdbSearch(card.title);
                if (!found) {
                    // спроба з англійською/оригінальною назвою (без локалізації) — fallback: шукаємо по original title
                    if (card.source_data && card.source_data.original_title) {
                        found = await tmdbSearch(card.source_data.original_title);
                    }
                }
                if (found) {
                    var newTitle = found.title || found.name || card.title;
                    var newPoster = found.poster_path ? "https://image.tmdb.org/t/p/w500" + found.poster_path : (card.poster_path || '');
                    card.title = newTitle;
                    card.original_title = found.original_title || card.original_title || newTitle;
                    if (newPoster) card.poster_path = newPoster;
                    card.vote_average = found.vote_average || card.vote_average;
                    card.release_date = found.release_date || card.release_date;

                    // Оновлюємо картку у Lampa (якщо вона ще відображена)
                    try { Lampa.Activity.updateCard(card); } catch(e){}
                }
            } catch(e){}
        }

        self.full = function(params, onSuccess, onError) {
            if (!params.card) return onError(new Error("Missing card"));
            // делегуємо повну інфо до TMDB, якщо це tmdb-картка, або пробуємо витягти id з знайденого
            if (params.card.source === 'tmdb' && params.card.id && typeof params.card.id === 'string' && params.card.id.indexOf('tmdb-') === 0) {
                var tmdbId = params.card.id.replace('tmdb-','');
                Lampa.Api.sources.tmdb.full({ id: tmdbId, method: "movie", card: params.card }, onSuccess, onError);
            } else {
                // якщо картка з kinoxa/filmix — просто показуємо базову інформацію (Lampa вміє відкривати card без повних даних)
                onSuccess(params.card);
            }
        };

        self.clear = function() {
            network.clear();
            localCache = {};
        };
    }

    // === Реєстрація плагіна в Lampa та пункту меню ===
    function startPlugin() {
        var svc = new MultiSourceService();
        Lampa.Api.sources[PLUGIN_NAME] = svc;

        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('ua_releases_multi_title') + '</div>' +
            '</li>'
        );

        menuItem.on('hover:enter', function() {
            Lampa.Activity.push({
                url: PLUGIN_NAME,
                title: Lampa.Lang.translate('ua_releases_multi_title'),
                component: 'category_full',
                source: PLUGIN_NAME,
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') startPlugin(); });

}();
