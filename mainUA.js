(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // =================================================================
    // CONFIGURATION & CONSTANTS
    // =================================================================
    var VERSION = '2.0';
    var CONFIG = {
        tmdbApiKey: '',
        cacheTime: 23 * 60 * 60 * 1000,
        language: 'uk',
        endpoint: 'https://wh.lme.isroot.in/',
        timeout: 10000,
        queue: { maxParallel: 10 },
        cache: {
            key: 'lme_wh_cache_v5',
            size: 3000,
            positiveTtl: 1000 * 60 * 60 * 24,
            negativeTtl: 1000 * 60 * 60 * 6
        }
    };

    var PROXIES = [
        'https://cors.lampa.stream/',
        'https://cors.eu.org/',
        'https://corsproxy.io/?url='
    ];

    // Налаштування рядів (аналогічно SERVICE_CONFIGS у Flixio)
    var ROWS_CONFIG = [
        { id: 'ym_row_history', title: 'Історія перегляду', type: 'history', order: 1, default: true },
        { id: 'ym_row_movies_new', title: 'Новинки фільмів', type: 'uas', url: 'uas_movies_new', loadUrl: 'https://uaserials.com/films/p/', order: 2, default: true },
        { id: 'ym_row_series_new', title: 'Новинки серіалів', type: 'uas', url: 'uas_series_new', loadUrl: 'https://uaserials.com/series/p/', order: 3, default: true },
        { id: 'ym_row_collections', title: 'Підбірки', type: 'collections', url: 'uas_collections_list', loadUrl: 'https://uaserials.com/collections/', order: 4, default: true },
        { id: 'ym_row_kinobaza', title: 'Новинки Стрімінгів UA', type: 'kinobaza', url: 'kinobaza_streaming', loadUrl: 'https://kinobaza.com.ua/online', order: 5, default: true },
        { id: 'ym_row_community', title: 'Приховані геми LME', type: 'community', url: 'uas_community', order: 6, default: true },
        { id: 'ym_row_movies_watch', title: 'Популярні фільми', type: 'uas', url: 'uas_movies_pop', loadUrl: 'https://uaserials.my/filmss/w/', order: 7, default: true },
        { id: 'ym_row_series_pop', title: 'Популярні серіали', type: 'uas', url: 'uas_series_pop', loadUrl: 'https://uaserials.com/series/w/', order: 8, default: true },
        { id: 'ym_row_random', title: 'Випадкові фільми', type: 'random', order: 9, default: true }
    ];

    // Мови для інтерфейсу (аналогічно FLIXIO_I18N)
    var I18N = {
        settings_tab_title: { uk: 'Головна UA', ru: 'Главная UA', en: 'Main UA' },
        settings_header_info: { uk: 'Кастомна головна сторінка з українським контентом', ru: 'Кастомная главная страница с украинским контентом', en: 'Custom home page with Ukrainian content' },
        settings_sections_title: { uk: 'Секції головної сторінки', ru: 'Секции главной страницы', en: 'Main screen sections' },
        loading: { uk: 'Завантаження...', ru: 'Загрузка...', en: 'Loading...' }
    };

    var currentLang = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (currentLang === 'ua') currentLang = 'uk';

    function t(key) {
        var pack = I18N[key];
        if (!pack) return key;
        return pack[currentLang] || pack.uk || pack.en || key;
    }

    // =================================================================
    // CACHE & UTILITIES
    // =================================================================
    var lmeCache = null;
    var listCache = {};
    var tmdbItemCache = {};
    var itemUrlCache = {};
    var seasonsCache = {};
    var inflight = {};

    // Безпечне сховище
    var safeStorage = (function () {
        var memoryStore = {};
        try {
            if (typeof window.localStorage !== 'undefined') {
                var testKey = '__test_v2__';
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

    // Кеш для LME перевірок
    function LmeCache(config) {
        var self = this;
        var storage = {};

        function cleanupExpired() {
            var now = Date.now();
            var changed = false;
            var keys = Object.keys(storage);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var node = storage[key];
                if (!node || !node.timestamp || typeof node.value !== 'boolean') {
                    delete storage[key];
                    changed = true;
                    continue;
                }
                var ttl = node.value ? config.positiveTtl : config.negativeTtl;
                if (node.timestamp <= now - ttl) {
                    delete storage[key];
                    changed = true;
                }
            }
            if (changed) self.save();
        }

        self.save = function () {
            Lampa.Storage.set(config.key, storage);
        };

        self.init = function () {
            storage = Lampa.Storage.get(config.key, {}) || {};
            cleanupExpired();
        };

        self.get = function (id) {
            var node = storage[id];
            if (!node || !node.timestamp || typeof node.value !== 'boolean') return null;
            var ttl = node.value ? config.positiveTtl : config.negativeTtl;
            if (node.timestamp > Date.now() - ttl) return node.value;
            delete storage[id];
            self.save();
            return null;
        };

        self.set = function (id, value) {
            cleanupExpired();
            storage[id] = { timestamp: Date.now(), value: !!value };
            self.save();
        };
    }

    // Черга запитів
    var requestQueue = {
        activeCount: 0,
        queue: [],
        maxParallel: CONFIG.queue.maxParallel,
        add: function (task) {
            this.queue.push(task);
            this.process();
        },
        process: function () {
            var self = this;
            while (this.activeCount < this.maxParallel && this.queue.length) {
                var task = this.queue.shift();
                this.activeCount++;
                Promise.resolve().then(task)["catch"](function () {})["finally"](function () {
                    self.activeCount--;
                    self.process();
                });
            }
        }
    };

    // =================================================================
    // NETWORK HELPERS
    // =================================================================
    function getTmdbKey() {
        var custom = (Lampa.Storage.get('uas_pro_tmdb_apikey') || '').trim();
        return custom || CONFIG.tmdbApiKey || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
    }

    function getTmdbEndpoint(path) {
        var url = Lampa.TMDB.api(path);
        if (!url.includes('api_key')) url += (url.includes('?') ? '&' : '?') + 'api_key=' + getTmdbKey();
        if (!url.startsWith('http')) url = 'https://api.themoviedb.org/3/' + url;
        return url;
    }

    function safeFetch(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({ ok: true, json: function () { return Promise.resolve(JSON.parse(xhr.responseText)); } });
                    } else {
                        reject(new Error('HTTP ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function () { reject(new Error('Network error')); };
            xhr.send(null);
        });
    }

    async function fetchHtml(url) {
        for (var i = 0; i < PROXIES.length; i++) {
            var proxy = PROXIES[i];
            try {
                var proxyUrl = proxy.includes('?url=') ? proxy + encodeURIComponent(url) : proxy + url;
                var res = await fetch(proxyUrl);
                if (res.ok) {
                    var text = await res.text();
                    if (text && text.length > 500 && text.includes('<html') && !text.includes('just a moment...')) {
                        return text;
                    }
                }
            } catch (e) {}
        }
        return '';
    }

    async function fetchTmdbWithFallback(type, id) {
        var endpoint = getTmdbEndpoint(type + '/' + id + '?language=uk');
        var res = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).catch(function () { return null; });
        if (res && (!res.overview || res.overview.trim() === '')) {
            var enEndpoint = getTmdbEndpoint(type + '/' + id + '?language=en');
            var enRes = await fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); }).catch(function () { return null; });
            if (enRes && enRes.overview) res.overview = enRes.overview;
        }
        return res;
    }

    function isSuccessResponse(response) {
        if (response === true) return true;
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            if (response.error || response.status === 'error' || response.success === false || response.ok === false) return false;
            if (response.success === true || response.status === 'success' || response.ok === true) return true;
            return Object.keys(response).length > 0;
        }
        return false;
    }

    // =================================================================
    // LME FLAG CHECK
    // =================================================================
    function getMediaMeta(data) {
        var tmdbId = parseInt(data && data.id, 10);
        if (!Number.isFinite(tmdbId) || tmdbId <= 0) return null;
        var mediaKind = String(data.media_type || '').toLowerCase();
        if (mediaKind !== 'tv' && mediaKind !== 'movie') {
            if (data.original_name || data.first_air_date || data.number_of_seasons) mediaKind = 'tv';
            else if (data.title || data.original_title || data.release_date) mediaKind = 'movie';
            else return null;
        }
        return { tmdbId: tmdbId, mediaKind: mediaKind, serial: mediaKind === 'tv' ? 1 : 0, cacheKey: mediaKind + ':' + tmdbId };
    }

    function loadFlag(meta) {
        if (!inflight[meta.cacheKey]) {
            inflight[meta.cacheKey] = new Promise(function (resolve) {
                requestQueue.add(function () {
                    var url = CONFIG.endpoint + '?tmdb_id=' + encodeURIComponent(meta.tmdbId) + '&serial=' + meta.serial + '&silent=true';
                    return new Promise(function (res) {
                        Lampa.Network.silent(url, function (r) {
                            res(isSuccessResponse(r));
                        }, function () {
                            res(false);
                        }, null, { timeout: CONFIG.timeout });
                    }).then(function (isSuccess) {
                        lmeCache.set(meta.cacheKey, isSuccess);
                        resolve(isSuccess);
                    }).finally(function () {
                        delete inflight[meta.cacheKey];
                    });
                });
            });
        }
        return inflight[meta.cacheKey];
    }

    function renderFlag(cardHtml) {
        var view = cardHtml.querySelector('.card__view');
        if (!view || view.querySelector('.card__ua_flag')) return;
        var badge = document.createElement('div');
        badge.className = 'card__ua_flag';
        view.appendChild(badge);
    }

    // =================================================================
    // DATA EXTRACTION FUNCTIONS
    // =================================================================
    function extractItemLinks(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var links = [];
        var anchors = doc.querySelectorAll('a[href]');
        for (var i = 0; i < anchors.length; i++) {
            var a = anchors[i];
            var href = a.getAttribute('href');
            if (href && href.match(/\/\d+-[^/]+\.html$/) && !href.includes('#')) {
                var fullUrl = href.startsWith('http') ? href : 'https://uaserials.com' + href;
                if (links.indexOf(fullUrl) === -1) links.push(fullUrl);
            }
        }
        return links;
    }

    function extractUaserialsCollections(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var results = [];
        var seen = {};
        var collectionLinks = doc.querySelectorAll('a[href*="/collections/"]');
        
        for (var i = 0; i < collectionLinks.length; i++) {
            var a = collectionLinks[i];
            var href = a.getAttribute('href');
            if (href && href.match(/\/collections\/\d+/) && !href.includes('/page/')) {
                var fullUrl = href.startsWith('http') ? href : 'https://uaserials.com' + href;
                var title = '';
                var img = a.querySelector('img');
                if (img) title = img.getAttribute('alt') || '';
                if (!title) title = a.textContent.trim();
                if (!title) {
                    var parent = a.closest('.short, .collection-item, article');
                    if (parent) {
                        var titleEl = parent.querySelector('.short-title, .title, .name, h2, h3, .collection-title');
                        if (titleEl) title = titleEl.textContent.trim();
                    }
                }
                title = title.replace(/[\n\r]+/g, ' ').replace(/\s*\d+\s*$/, '').trim();
                if (title && title.length > 2 && !seen[fullUrl]) {
                    seen[fullUrl] = true;
                    results.push({ title: title, url: fullUrl });
                }
            }
        }
        return results;
    }

    function extractKinobazaItems(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var results = [];
        var seen = {};
        var headings = doc.querySelectorAll('h4.text-muted.h6.d-inline-block');
        
        for (var i = 0; i < headings.length; i++) {
            var h4 = headings[i];
            var enTitle = h4.textContent.trim();
            var parent = h4.parentElement;
            var small = null;
            var container = parent;
            
            for (var j = 0; j < 5; j++) {
                if (!container || container.tagName === 'BODY') break;
                small = container.querySelector('small.text-muted');
                if (small && small.textContent.match(/\(\d{4}\)/)) break;
                small = null;
                container = container.parentElement;
            }
            
            var yearMatch = small ? small.textContent.match(/\((\d{4})\)/) : null;
            var year = yearMatch ? yearMatch[1] : null;
            var searchContext = container ? container.textContent : (parent ? parent.textContent : "");
            var isTv = /Серіал|сезон|епізод|Мінісеріал/i.test(searchContext);
            var expectedType = isTv ? 'tv' : 'movie';
            var key = enTitle + year + expectedType;
            
            if (enTitle && year && !seen[key]) {
                seen[key] = true;
                results.push({ title: enTitle, year: year, type: expectedType });
            }
        }
        
        if (results.length === 0) {
            var titleLinks = doc.querySelectorAll('a[href^="/titles/"]');
            for (var k = 0; k < titleLinks.length; k++) {
                var a = titleLinks[k];
                var title = a.textContent.trim();
                if (title.length > 1) {
                    var year = null;
                    var parentEl = a.parentElement;
                    var containerEl = parentEl;
                    for (var m = 0; m < 4; m++) {
                        if (!containerEl || containerEl.tagName === 'BODY') break;
                        var text = containerEl.textContent;
                        var yMatch = text.match(/(?:^|\s|\()((?:19|20)\d{2})(?:\)|\s|$)/);
                        if (yMatch) {
                            year = yMatch[1];
                            break;
                        }
                        containerEl = containerEl.parentElement;
                    }
                    if (!year) {
                        var hrefMatch = a.getAttribute('href').match(/(?:19|20)\d{2}/);
                        if (hrefMatch) year = hrefMatch[0];
                    }
                    var ctx = containerEl ? containerEl.textContent : (parentEl ? parentEl.textContent : "");
                    var isSeries = /Серіал|сезон|епізод|Мінісеріал/i.test(ctx);
                    var type = isSeries ? 'tv' : 'movie';
                    if (year) {
                        var uniqueKey = title + year + type;
                        if (!seen[uniqueKey]) {
                            seen[uniqueKey] = true;
                            results.push({ title: title, year: year, type: type });
                        }
                    }
                }
            }
        }
        return results;
    }

    // =================================================================
    // TMDB SEARCH & ITEM PROCESSING
    // =================================================================
    async function getImdbId(url) {
        if (itemUrlCache[url]) return itemUrlCache[url];
        var html = await fetchHtml(url);
        var match = html.match(/imdb\.com\/title\/(tt\d+)/i);
        var id = match ? match[1] : null;
        if (id) itemUrlCache[url] = id;
        return id;
    }

    async function processSingleItem(url) {
        var imdb = await getImdbId(url);
        if (!imdb) return null;
        if (tmdbItemCache[imdb]) return tmdbItemCache[imdb];
        
        var endpoint = getTmdbEndpoint('find/' + imdb + '?external_source=imdb_id&language=uk');
        try {
            var data = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); });
            var res = null;
            if (data.movie_results && data.movie_results.length > 0) {
                res = data.movie_results[0];
                res.media_type = 'movie';
            } else if (data.tv_results && data.tv_results.length > 0) {
                res = data.tv_results[0];
                res.media_type = 'tv';
            }
            
            if (res && (!res.overview || res.overview.trim() === '')) {
                var enEndpoint = getTmdbEndpoint('find/' + imdb + '?external_source=imdb_id&language=en');
                var enData = await fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); });
                var enRes = (enData.movie_results && enData.movie_results.length > 0) ? enData.movie_results[0] : (enData.tv_results && enData.tv_results.length > 0) ? enData.tv_results[0] : null;
                if (enRes && enRes.overview) res.overview = enRes.overview;
            }
            
            if (res) tmdbItemCache[imdb] = res;
            return res;
        } catch (e) {
            return null;
        }
    }

    async function searchTmdbByTitleAndYear(title, year, expectedType) {
        var cacheKey = 'kinobaza_search_' + title + '_' + year + '_' + (expectedType || 'any');
        if (tmdbItemCache[cacheKey]) return tmdbItemCache[cacheKey];
        
        var endpointsToTry = [];
        if (expectedType === 'tv') endpointsToTry.push('search/tv', 'search/multi');
        else if (expectedType === 'movie') endpointsToTry.push('search/movie', 'search/multi');
        else endpointsToTry.push('search/multi');
        
        for (var i = 0; i < endpointsToTry.length; i++) {
            var path = endpointsToTry[i];
            var endpoint = getTmdbEndpoint(path + '?query=' + encodeURIComponent(title) + '&language=uk');
            try {
                var data = await fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); });
                if (data && data.results && data.results.length > 0) {
                    var res = data.results.find(function (r) {
                        if (expectedType && r.media_type && r.media_type !== expectedType && path === 'search/multi') return false;
                        var rYear = (r.release_date || r.first_air_date || '').substring(0, 4);
                        return rYear === year || rYear === (parseInt(year) - 1).toString() || rYear === (parseInt(year) + 1).toString();
                    });
                    if (!res) {
                        res = data.results.find(function (r) {
                            if (expectedType && r.media_type && r.media_type !== expectedType && path === 'search/multi') return false;
                            var t1 = (r.original_title || r.original_name || '').toLowerCase();
                            var t2 = title.toLowerCase();
                            return t1 === t2;
                        });
                    }
                    if (res) {
                        if (!res.overview || res.overview.trim() === '') {
                            var enEndpoint = getTmdbEndpoint(path + '?query=' + encodeURIComponent(title) + '&language=en');
                            var enData = await fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); });
                            var enRes = (enData.results || []).find(function (r) { return r.id === res.id; });
                            if (enRes && enRes.overview) res.overview = enRes.overview;
                        }
                        if (!res.media_type) res.media_type = expectedType || (res.first_air_date ? 'tv' : 'movie');
                        tmdbItemCache[cacheKey] = res;
                        return res;
                    }
                }
            } catch (e) {}
        }
        return null;
    }

    async function processInQueue(items, processFn, concurrency) {
        concurrency = concurrency || 5;
        var results = new Array(items.length);
        var index = 0;
        
        async function worker() {
            while (index < items.length) {
                var currentIndex = index++;
                try {
                    var res = await processFn(items[currentIndex]);
                    if (res) results[currentIndex] = res;
                } catch (e) {}
            }
        }
        
        var workers = [];
        for (var i = 0; i < concurrency; i++) workers.push(worker());
        await Promise.all(workers);
        return results.filter(Boolean);
    }

    async function fetchCatalogPage(url, limit) {
        limit = limit || 15;
        if (listCache[url]) return listCache[url];
        
        var listHtml = await fetchHtml(url);
        var links = extractItemLinks(listHtml).slice(0, limit);
        var tmdbItems = await processInQueue(links, processSingleItem, 5);
        
        var unique = {};
        var finalItems = tmdbItems.filter(function (item) {
            if (!item || !item.id || !item.backdrop_path) return false;
            if (unique[item.id]) return false;
            unique[item.id] = true;
            return true;
        });
        
        if (finalItems.length > 0) listCache[url] = finalItems;
        return finalItems;
    }

    async function fetchKinobazaCatalog(url, limit, noCache) {
        if (!noCache && listCache[url]) return listCache[url];
        
        var html = await fetchHtml(url);
        var items = extractKinobazaItems(html);
        var tmdbItems = await processInQueue(items, function (item) {
            return searchTmdbByTitleAndYear(item.title, item.year, item.type);
        }, 5);
        
        var unique = {};
        var finalItems = tmdbItems.filter(function (item) {
            if (!item || !item.id || !item.backdrop_path) return false;
            if (unique[item.id]) return false;
            unique[item.id] = true;
            return true;
        });
        
        if (limit) finalItems = finalItems.slice(0, limit);
        if (!noCache && finalItems.length > 0) listCache[url] = finalItems;
        return finalItems;
    }

    async function getLmeTmdbItems(items) {
        var promises = items.map(async function (item) {
            if (!item) return null;
            
            var type, id;
            if (item.id && typeof item.id === 'string' && item.id.includes(':')) {
                var parts = item.id.split(':');
                type = parts[0];
                id = parts[1];
            } else if (item.source_id && item.type) {
                type = item.type;
                id = item.source_id;
            } else if (item.id && (item.media_type || item.type)) {
                type = item.media_type || item.type;
                id = item.id;
            } else {
                return null;
            }
            
            var tmdbData = await fetchTmdbWithFallback(type, id);
            if (tmdbData && !tmdbData.error && tmdbData.backdrop_path) {
                tmdbData.media_type = type;
                return tmdbData;
            }
            return null;
        });
        return await Promise.all(promises).then(function (results) {
            return results.filter(Boolean);
        });
    }

    // =================================================================
    // CARD CREATION (аналогічно Flixio)
    // =================================================================
    function fetchLogo(movie, itemElement) {
        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
        var langPref = Lampa.Storage.get('ym_logo_lang', 'uk_en');
        var quality = Lampa.Storage.get('ym_img_quality', 'w300');
        
        function applyTextLogo() {
            var textLogo = document.createElement('div');
            textLogo.className = 'card-custom-logo-text';
            var txt = movie.title || movie.name;
            if (langPref === 'en' || langPref === 'text_en') {
                txt = movie.original_title || movie.original_name || txt;
            }
            textLogo.innerText = txt;
            var view = itemElement.find('.card__view');
            if (view.length) view.append(textLogo);
        }
        
        if (langPref === 'text_uk' || langPref === 'text_en') {
            applyTextLogo();
            return;
        }
        
        var cacheKey = 'logo_uas_v8_' + quality + '_' + langPref + '_' + mType + '_' + movie.id;
        var cachedUrl = Lampa.Storage.get(cacheKey);
        
        function applyLogo(url) {
            if (url && url !== 'none') {
                var img = new Image();
                img.crossOrigin = "anonymous";
                img.className = 'card-custom-logo';
                img.onload = function () {
                    var view = itemElement.find('.card__view');
                    if (view.length) view.append(img);
                };
                img.onerror = applyTextLogo;
                img.src = url;
            } else {
                applyTextLogo();
            }
        }
        
        if (cachedUrl) {
            applyLogo(cachedUrl);
            return;
        }
        
        var endpoint = getTmdbEndpoint(mType + '/' + movie.id + '/images?include_image_language=uk,en,null');
        fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).then(function (res) {
            var finalLogo = 'none';
            if (res.logos && res.logos.length > 0) {
                var found = null;
                if (langPref === 'uk') {
                    found = res.logos.find(function (l) { return l.iso_639_1 === 'uk'; });
                } else if (langPref === 'en') {
                    found = res.logos.find(function (l) { return l.iso_639_1 === 'en'; });
                } else {
                    found = res.logos.find(function (l) { return l.iso_639_1 === 'uk'; }) || res.logos.find(function (l) { return l.iso_639_1 === 'en'; });
                }
                if (found) finalLogo = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + found.file_path);
            }
            Lampa.Storage.set(cacheKey, finalLogo);
            applyLogo(finalLogo);
        }).catch(function () {
            Lampa.Storage.set(cacheKey, 'none');
            applyLogo('none');
        });
    }

    function createWideCardItem(movie) {
        return {
            title: movie.title || movie.name,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', movie, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--wide-custom');
                        var view = item.find('.card__view');
                        view.empty();
                        
                        var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                        var imgUrl = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + movie.backdrop_path);
                        view.css({
                            'background-image': 'url(' + imgUrl + ')',
                            'background-size': 'cover',
                            'background-position': 'center',
                            'padding-bottom': '56.25%',
                            'height': '0',
                            'position': 'relative'
                        });
                        
                        view.append('<div class="card-backdrop-overlay"></div>');
                        
                        var voteVal = parseFloat(movie.vote_average);
                        if (!isNaN(voteVal) && voteVal > 0) {
                            var voteDiv = document.createElement('div');
                            voteDiv.className = 'card__vote';
                            voteDiv.innerText = voteVal.toFixed(1);
                            view.append(voteDiv);
                        }
                        
                        var yearStr = (movie.release_date || movie.first_air_date || '').toString().substring(0, 4);
                        if (yearStr && yearStr.length === 4) {
                            var ageDiv = document.createElement('div');
                            ageDiv.className = 'card-badge-age';
                            ageDiv.innerText = yearStr;
                            view.append(ageDiv);
                        }
                        
                        fetchLogo(movie, item);
                        
                        var descText = movie.overview || 'Опис відсутній.';
                        item.append('<div class="custom-title-bottom">' + (movie.title || movie.name) + '</div>');
                        item.append('<div class="custom-overview-bottom">' + descText + '</div>');
                        
                        // Додавання прапорця UA (якщо налаштовано)
                        if (Lampa.Storage.get('uas_show_flag', true)) {
                            var meta = getMediaMeta(movie);
                            if (meta) {
                                loadFlag(meta).then(function (hasUa) {
                                    if (hasUa) renderFlag(item[0]);
                                });
                            }
                        }
                    },
                    onlyEnter: function () {
                        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
                        Lampa.Activity.push({ url: '', component: 'full', id: movie.id, method: mType, card: movie, source: movie.source || 'tmdb' });
                    }
                }
            }
        };
    }

    function createTitleButtonItem(title, url, iconUrl) {
        return {
            title: title,
            is_title_btn: true,
            url: url,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: title }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--title-btn');
                        item.empty();
                        
                        if (!url) {
                            item.removeClass('selector focusable');
                            item.addClass('card--title-btn-static');
                        }
                        
                        var iconHtml = iconUrl ? '<img src="' + iconUrl + '" class="title-btn-icon" onerror="this.style.display=\'none\'" />' : '';
                        item.append('<div class="title-btn-text">' + iconHtml + title + '</div>');
                    },
                    onlyEnter: function () {
                        if (url) {
                            Lampa.Activity.push({
                                url: url,
                                title: title,
                                component: 'category_full',
                                page: 1,
                                source: 'uas_pro_source'
                            });
                        }
                    }
                }
            }
        };
    }

    function createCollectionButtonItem(collection) {
        return {
            title: collection.title,
            is_collection_btn: true,
            url: collection.url,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: collection.title }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--collection-btn');
                        item.empty();
                        item.append('<div class="collection-title">' + collection.title + '</div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: collection.url,
                            title: collection.title,
                            component: 'category_full',
                            page: 1,
                            source: 'uas_pro_source',
                            is_uas_collection: true
                        });
                    }
                }
            }
        };
    }

    function createFavoriteCardItem(bgUrl) {
        return {
            title: 'Обране',
            is_title_btn: true,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: 'Обране' }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--history-custom');
                        var view = item.find('.card__view');
                        view.empty();
                        
                        view.css({
                            'background-image': bgUrl ? 'url(' + bgUrl + ')' : 'rgba(30,30,30,0.8)',
                            'background-size': 'cover',
                            'background-position': 'center',
                            'padding-bottom': '56.25%',
                            'height': '0',
                            'position': 'relative',
                            'display': 'block'
                        });
                        
                        view.append('<div class="card-backdrop-overlay" style="background: rgba(0,0,0,0.65);"></div>');
                        view.append('<div style="position: absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction: column; align-items:center; justify-content:center; z-index: 2; padding: 10%; box-sizing: border-box;">' +
                            '<svg style="width: 35%; height: 35%; margin-bottom: 0.5em; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.8)); color: #fff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
                            '<div style="font-size: 1.1em; font-weight: bold; text-shadow: 0px 2px 4px rgba(0,0,0,0.8); text-align: center; color: #fff;">Обране</div>' +
                            '</div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            url: '',
                            title: 'Обране',
                            component: 'bookmarks',
                            page: 1
                        });
                    }
                }
            }
        };
    }

    function createHistoryButtonCardItem(bgUrl) {
        return {
            title: 'Історія',
            is_title_btn: true,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', { title: 'Історія' }, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--history-custom');
                        var view = item.find('.card__view');
                        view.empty();
                        
                        view.css({
                            'background-image': bgUrl ? 'url(' + bgUrl + ')' : 'rgba(30,30,30,0.8)',
                            'background-size': 'cover',
                            'background-position': 'center',
                            'padding-bottom': '56.25%',
                            'height': '0',
                            'position': 'relative',
                            'display': 'block'
                        });
                        
                        view.append('<div class="card-backdrop-overlay" style="background: rgba(0,0,0,0.65);"></div>');
                        view.append('<div style="position: absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction: column; align-items:center; justify-content:center; z-index: 2; padding: 10%; box-sizing: border-box;">' +
                            '<svg style="width: 35%; height: 35%; margin-bottom: 0.5em; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.8)); color: #fff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
                            '<div style="font-size: 1.1em; font-weight: bold; text-shadow: 0px 2px 4px rgba(0,0,0,0.8); text-align: center; color: #fff;">Історія</div>' +
                            '</div>');
                    },
                    onlyEnter: function () {
                        Lampa.Activity.push({
                            title: 'Історія переглядів',
                            component: 'favorite',
                            type: 'history',
                            source: 'tmdb',
                            page: 1
                        });
                    }
                }
            }
        };
    }

    function createHistoryCardItem(movie) {
        return {
            title: movie.title || movie.name,
            params: {
                createInstance: function () {
                    return Lampa.Maker.make('Card', movie, function (module) { return module.only('Card', 'Callback'); });
                },
                emit: {
                    onCreate: function () {
                        var item = $(this.html);
                        item.addClass('card--history-custom');
                        var view = item.find('.card__view');
                        view.empty();
                        
                        var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                        var imgUrlPath = movie.backdrop_path || movie.poster_path;
                        var imgUrl = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgUrlPath)) : '';
                        
                        view.css({
                            'background-image': imgUrl ? 'url(' + imgUrl + ')' : 'none',
                            'background-size': 'cover',
                            'background-position': 'center',
                            'padding-bottom': '56.25%',
                            'height': '0',
                            'position': 'relative'
                        });
                        
                        view.append('<div class="card-backdrop-overlay"></div>');
                        
                        var voteVal = parseFloat(movie.vote_average);
                        if (!isNaN(voteVal) && voteVal > 0) {
                            var voteDiv = document.createElement('div');
                            voteDiv.className = 'card__vote';
                            voteDiv.innerText = voteVal.toFixed(1);
                            view.append(voteDiv);
                        }
                        
                        fetchLogo(movie, item);
                        
                        if (Lampa.Storage.get('uas_show_flag', true)) {
                            var meta = getMediaMeta(movie);
                            if (meta) {
                                loadFlag(meta).then(function (hasUa) {
                                    if (hasUa) renderFlag(item[0]);
                                });
                            }
                        }
                    },
                    onlyEnter: function () {
                        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
                        Lampa.Activity.push({ url: '', component: 'full', id: movie.id, method: mType, card: movie, source: movie.source || 'tmdb' });
                    }
                }
            }
        };
    }

    // =================================================================
    // ROW LOADERS (аналогічно функціям завантаження у Flixio)
    // =================================================================
    function loadHistoryRow(callback) {
        var hist = [];
        var allFavs = {};
        try {
            if (window.Lampa && Lampa.Favorite && typeof Lampa.Favorite.all === 'function') {
                allFavs = Lampa.Favorite.all() || {};
                if (allFavs.history) hist = allFavs.history;
            }
        } catch (e) {}
        
        var results = [];
        
        var randFavImg = '';
        try {
            var favItems = [];
            if (allFavs.book) favItems = favItems.concat(allFavs.book);
            if (allFavs.like) favItems = favItems.concat(allFavs.like);
            var validFavs = favItems.filter(function (item) { return item && (item.backdrop_path || item.poster_path); });
            if (validFavs.length > 0) {
                var randItem = validFavs[Math.floor(Math.random() * validFavs.length)];
                var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                var imgUrlPath = randItem.backdrop_path || randItem.poster_path;
                randFavImg = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgUrlPath)) : '';
            }
        } catch (e) {}
        
        var randHistImg = '';
        try {
            var validHist = (allFavs.history || []).filter(function (item) { return item && (item.backdrop_path || item.poster_path); });
            if (validHist.length > 0) {
                var randItem = validHist[Math.floor(Math.random() * validHist.length)];
                var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                var imgUrlPath = randItem.backdrop_path || randItem.poster_path;
                randHistImg = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgUrlPath)) : '';
            }
        } catch (e) {}
        
        var showFav = Lampa.Storage.get('uas_show_fav_card');
        if (showFav === null || showFav === undefined || showFav === '' || showFav === true || showFav === 'true') {
            results.push(createFavoriteCardItem(randFavImg));
        }
        
        var showHistBtn = Lampa.Storage.get('uas_show_history_btn');
        if (showHistBtn === null || showHistBtn === undefined || showHistBtn === '' || showHistBtn === true || showHistBtn === 'true') {
            results.push(createHistoryButtonCardItem(randHistImg));
        }
        
        if (hist && hist.length > 0) {
            var unique = {};
            var validItems = hist.filter(function (h) {
                if (h && h.id && (h.title || h.name) && !unique[h.id]) {
                    unique[h.id] = true;
                    return true;
                }
                return false;
            }).slice(0, 20);
            
            if (validItems.length > 0) {
                results = results.concat(validItems.map(createHistoryCardItem));
            }
        }
        
        if (results.length > 0) {
            callback({
                results: results,
                title: '',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } else {
            callback({ results: [] });
        }
    }

    async function loadUasRow(urlId, loadUrl, title, callback) {
        try {
            var items = await fetchCatalogPage(loadUrl, 15);
            var mapped = items.map(createWideCardItem);
            callback({
                results: mapped,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) {
            callback({ results: [] });
        }
    }

    async function loadKinobazaRow(urlId, loadUrl, title, callback) {
        try {
            var fetchUrl = loadUrl + '?q=&search_type=&order_by=date_desc&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=1&imdb_rating_max=10&imdb_votes=&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio&page=1';
            var items = await fetchKinobazaCatalog(fetchUrl, 15);
            var mapped = items.map(createWideCardItem);
            callback({
                results: mapped,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) {
            callback({ results: [] });
        }
    }

    async function loadUaserialsCollectionsRow(urlId, loadUrl, title, callback) {
        try {
            var html = await fetchHtml(loadUrl);
            var items = extractUaserialsCollections(html);
            items.sort(function () { return 0.5 - Math.random(); });
            var mapped = items.slice(0, 7).map(createCollectionButtonItem);
            callback({
                results: mapped,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) {
            callback({ results: [] });
        }
    }

    async function loadCommunityGemsRow(callback) {
        try {
            var listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=15&page=1';
            var res = await safeFetch(listUrl).then(function (r) { return r.json(); }).catch(function () { return { items: [] }; });
            var items = Array.isArray(res) ? res : (res.items || []);
            var tmdbItems = await getLmeTmdbItems(items);
            var mappedResults = tmdbItems.map(createWideCardItem);
            callback({
                results: mappedResults,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        } catch (e) {
            callback({ results: [] });
        }
    }

    async function loadRandomMoviesRow(callback) {
        try {
            var baseRandomUrl = 'https://kinobaza.com.ua/titles?q=&search_type=&order_by=random&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=7&imdb_rating_max=10&imdb_votes=5000&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio';
            var fetchUrl = baseRandomUrl + '&_t=' + Date.now();
            var movies = await fetchKinobazaCatalog(fetchUrl, 5, true);
            callback({
                results: movies.map(createWideCardItem),
                title: '',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 5 } }
            });
        } catch (e) {
            callback({ results: [] });
        }
    }

    // =================================================================
    // CATEGORY FULL HANDLER (для пагінації)
    // =================================================================
    Lampa.Api.sources.uas_pro_source = {
        list: async function (params, oncomplete, onerror) {
            var requestedPage = params.page || 1;
            var baseUrl = '';
            var isLME = false;
            var isKinobazaOnline = false;
            var isUasCollection = params.is_uas_collection;
            var isUasCollectionsList = false;
            
            if (params.url === 'uas_movies_new') baseUrl = 'https://uaserials.com/films/p/';
            else if (params.url === 'uas_movies_pop') baseUrl = 'https://uaserials.my/filmss/w/';
            else if (params.url === 'uas_series_new') baseUrl = 'https://uaserials.com/series/p/';
            else if (params.url === 'uas_series_pop') baseUrl = 'https://uaserials.com/series/w/';
            else if (params.url === 'kinobaza_streaming') {
                baseUrl = 'https://kinobaza.com.ua/online?q=&search_type=&order_by=date_desc&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=1&imdb_rating_max=10&imdb_votes=&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio&page=';
                isKinobazaOnline = true;
            } else if (params.url === 'uas_collections_list') {
                isUasCollectionsList = true;
                baseUrl = 'https://uaserials.com/collections/';
            } else if (params.url === 'uas_community') {
                isLME = true;
            } else if (!isUasCollection) {
                return onerror();
            }
            
            function showLoadingToast() {
                var toast = document.getElementById('uas-loading-toast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'uas-loading-toast';
                    toast.innerText = 'Завантаження нових карток...';
                    toast.style.cssText = 'display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(40,40,40,0.95); color:#fff; padding:12px 24px; border-radius:8px; z-index:99999; font-size:1.2em; font-weight:bold; pointer-events:none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); opacity:0; transition: opacity 0.3s ease;';
                    document.body.appendChild(toast);
                }
                toast.style.display = 'block';
                setTimeout(function () { toast.style.opacity = '1'; }, 10);
            }
            
            function hideLoadingToast() {
                var toast = document.getElementById('uas-loading-toast');
                if (toast) {
                    toast.style.opacity = '0';
                    setTimeout(function () {
                        if (toast.style.opacity === '0') toast.style.display = 'none';
                    }, 300);
                }
            }
            
            async function fetchPageData(targetPage) {
                var pageMapped = [];
                var pageTotal = 50;
                
                if (isLME) {
                    var listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=20&page=' + targetPage;
                    var res = await safeFetch(listUrl).catch(function () { return { items: [] }; });
                    var items = Array.isArray(res) ? res : (res.items || []);
                    pageTotal = res.total_pages || 10;
                    pageMapped = await getLmeTmdbItems(items);
                } else if (isUasCollectionsList) {
                    if (targetPage > 1) {
                        return { mapped: [], total: 1 };
                    }
                    var listUrl = baseUrl;
                    if (listCache[listUrl]) {
                        pageMapped = listCache[listUrl];
                    } else {
                        var html = await fetchHtml(listUrl);
                        var items = extractUaserialsCollections(html);
                        pageMapped = items.map(createCollectionButtonItem);
                        if (pageMapped.length > 0) listCache[listUrl] = pageMapped;
                    }
                    pageTotal = 1;
                } else if (isUasCollection) {
                    var listUrl = params.url;
                    if (targetPage > 1) {
                        if (listUrl.endsWith('.html')) {
                            listUrl = listUrl.replace('.html', '/page/' + targetPage + '/');
                        } else {
                            listUrl = listUrl.replace(/\/$/, '') + '/page/' + targetPage + '/';
                        }
                    }
                    if (listCache[listUrl]) {
                        pageMapped = listCache[listUrl];
                    } else {
                        var fetchedItems = await fetchCatalogPage(listUrl, 20);
                        pageMapped = fetchedItems;
                        if (pageMapped.length > 0) listCache[listUrl] = pageMapped;
                    }
                } else if (isKinobazaOnline) {
                    var fetchUrl = baseUrl + targetPage;
                    var kinobazaItems = await fetchKinobazaCatalog(fetchUrl, 30);
                    pageMapped = kinobazaItems;
                } else {
                    var fetchUrl = targetPage === 1 ? baseUrl : baseUrl + 'page/' + targetPage + '/';
                    var catalogItems = await fetchCatalogPage(fetchUrl, 20);
                    pageMapped = catalogItems;
                }
                
                return { mapped: pageMapped, total: pageTotal };
            }
            
            try {
                var mapped = [];
                var totalPages = 50;
                
                if (requestedPage === 1) {
                    var [res1, res2] = await Promise.all([fetchPageData(1), fetchPageData(2)]);
                    mapped = res1.mapped.concat(res2.mapped);
                    totalPages = res1.total;
                } else {
                    var res = await fetchPageData(requestedPage + 1);
                    mapped = res.mapped;
                    totalPages = res.total;
                }
                
                if (requestedPage > 1) hideLoadingToast();
                
                if (mapped.length > 0) {
                    oncomplete({
                        results: mapped,
                        page: requestedPage,
                        total_pages: totalPages
                    });
                } else {
                    onerror();
                }
            } catch (e) {
                if (requestedPage > 1) hideLoadingToast();
                onerror();
            }
        }
    };

    // =================================================================
    // MAIN FUNCTION (аналогічно Flixio)
    // =================================================================
    function start() {
        if (window.ymain_pro_loaded) return;
        window.ymain_pro_loaded = true;
        
        // Ініціалізація кешу LME
        lmeCache = new LmeCache(CONFIG.cache);
        lmeCache.init();
        
        // Ініціалізація налаштувань рядів
        if (!Lampa.Storage.get('ym_rows_init_v2')) {
            Lampa.Storage.set('ym_rows_init_v2', true);
            for (var i = 0; i < ROWS_CONFIG.length; i++) {
                var row = ROWS_CONFIG[i];
                var current = Lampa.Storage.get(row.id);
                if (current === null || current === undefined || current === '') {
                    Lampa.Storage.set(row.id, row.default);
                }
            }
            if (Lampa.Storage.get('uas_show_flag') === null) Lampa.Storage.set('uas_show_flag', true);
            if (Lampa.Storage.get('uas_show_fav_card') === null) Lampa.Storage.set('uas_show_fav_card', true);
            if (Lampa.Storage.get('uas_show_history_btn') === null) Lampa.Storage.set('uas_show_history_btn', true);
        }
        
        // Перевизначення основної функції TMDB
        Lampa.Api.sources.tmdb.main = function (params, oncomplite, onerror) {
            // Фільтруємо активні ряди
            var activeRows = [];
            for (var i = 0; i < ROWS_CONFIG.length; i++) {
                var def = ROWS_CONFIG[i];
                var enabled = Lampa.Storage.get(def.id);
                if (enabled === null || enabled === undefined || enabled === '') {
                    enabled = def.default;
                } else if (enabled === 'false') {
                    enabled = false;
                } else if (enabled === 'true') {
                    enabled = true;
                }
                
                var orderVal = Lampa.Storage.get(def.id + '_order');
                var order = parseInt(orderVal);
                if (isNaN(order)) order = def.order;
                
                if (enabled) {
                    activeRows.push({
                        id: def.id,
                        type: def.type,
                        url: def.url,
                        loadUrl: def.loadUrl,
                        title: def.title,
                        order: order
                    });
                }
            }
            activeRows.sort(function (a, b) { return a.order - b.order; });
            
            var parts_data = [];
            
            for (var j = 0; j < activeRows.length; j++) {
                var row = activeRows[j];
                
                // Додаємо кнопку-заголовок для всіх рядів крім історії
                if (row.type !== 'history') {
                    parts_data.push(function (rowData, cb) {
                        return function () {
                            cb({
                                results: [createTitleButtonItem(rowData.title, rowData.url, '')],
                                title: '',
                                uas_title_row: true,
                                params: { items: { mapping: 'line', view: 1 } }
                            });
                        };
                    }(row, function (cb) { return cb; }));
                }
                
                // Додаємо функцію завантаження контенту
                parts_data.push(function (rowData, cb) {
                    return function () {
                        if (rowData.type === 'history') {
                            loadHistoryRow(cb);
                        } else if (rowData.type === 'uas') {
                            loadUasRow(rowData.url, rowData.loadUrl, rowData.title, cb);
                        } else if (rowData.type === 'kinobaza') {
                            loadKinobazaRow(rowData.url, rowData.loadUrl, rowData.title, cb);
                        } else if (rowData.type === 'collections') {
                            loadUaserialsCollectionsRow(rowData.url, rowData.loadUrl, rowData.title, cb);
                        } else if (rowData.type === 'community') {
                            loadCommunityGemsRow(cb);
                        } else if (rowData.type === 'random') {
                            loadRandomMoviesRow(cb);
                        }
                    };
                }(row, function (cb) { return cb; }));
            }
            
            if (parts_data.length === 0) {
                parts_data.push(function (cb) {
                    loadUasRow('uas_movies_new', 'https://uaserials.com/films/p/', 'Новинки фільмів', cb);
                });
            }
            
            Lampa.Api.partNext(parts_data, 2, oncomplite, onerror);
        };
        
        // Додаємо налаштування
        if (window.Lampa && Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'ymainpage',
                name: t('settings_tab_title'),
                icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
            });
            
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'uas_support_yarik', type: 'button' },
                field: { name: "Підтримати розробників: Yarik's Mod's", description: 'https://lampalampa.free.nf/' }
            });
            
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'uas_support_lme', type: 'button' },
                field: { name: 'Підтримати розробників: LampaME', description: 'https://lampame.github.io/' }
            });
            
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'uas_show_flag', type: 'trigger', default: true },
                field: { name: 'Відображення УКР озвучок', description: 'Пошук та відображення прапорця на картках' }
            });
            
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'uas_show_fav_card', type: 'trigger', default: true },
                field: { name: 'Картка "Обране" в історії', description: 'Показувати швидкий доступ до Обраного першим у рядку історії' }
            });
            
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'uas_show_history_btn', type: 'trigger', default: true },
                field: { name: 'Картка "Історія" в історії', description: 'Показувати швидкий доступ до Історії поруч із Обраним' }
            });
            
            var langValues = {
                'uk': 'Тільки українською',
                'uk_en': 'Укр + Англ (За замовчуванням)',
                'en': 'Тільки англійською',
                'text_uk': 'Завжди текст (Укр)',
                'text_en': 'Завжди текст (Англ)'
            };
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'ym_logo_lang', type: 'select', values: langValues, default: 'uk_en' },
                field: { name: 'Мова логотипів', description: 'Оберіть пріоритет мови для логотипів' }
            });
            
            var qualValues = {
                'w300': 'w300 (За замовчуванням)',
                'w500': 'w500',
                'w780': 'w780',
                'original': 'Оригінал'
            };
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'ym_img_quality', type: 'select', values: qualValues, default: 'w300' },
                field: { name: 'Якість зображень (Фон/Лого)', description: 'Впливає на швидкість завантаження сторінки' }
            });
            
            // Додаємо налаштування для кожного ряду
            var orderValues = { '1': 'Позиція 1', '2': 'Позиція 2', '3': 'Позиція 3', '4': 'Позиція 4', '5': 'Позиція 5', '6': 'Позиція 6', '7': 'Позиція 7', '8': 'Позиція 8', '9': 'Позиція 9' };
            
            for (var i = 0; i < ROWS_CONFIG.length; i++) {
                var row = ROWS_CONFIG[i];
                Lampa.SettingsApi.addParam({
                    component: 'ymainpage',
                    param: { name: row.id, type: 'trigger', default: row.default },
                    field: { name: 'Вимкнути / Увімкнути: ' + row.title, description: 'Показувати цей рядок на головній' }
                });
                Lampa.SettingsApi.addParam({
                    component: 'ymainpage',
                    param: { name: row.id + '_order', type: 'select', values: orderValues, default: row.order.toString() },
                    field: { name: 'Порядок: ' + row.title, description: 'Яким по рахунку виводити цей рядок' }
                });
            }
            
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: 'uas_pro_tmdb_btn', type: 'button' },
                field: { name: 'Власний TMDB API ключ', description: 'Натисніть, щоб ввести ключ (працює першочергово)' }
            });
            
            Lampa.Settings.listener.follow('open', function (e) {
                if (e.name === 'ymainpage') {
                    e.body.find('[data-name="uas_support_yarik"]').on('hover:enter', function () {
                        window.open('https://lampalampa.free.nf/', '_blank');
                    });
                    e.body.find('[data-name="uas_support_lme"]').on('hover:enter', function () {
                        window.open('https://lampame.github.io/main/#uk', '_blank');
                    });
                    e.body.find('[data-name="uas_pro_tmdb_btn"]').on('hover:enter', function () {
                        var currentKey = Lampa.Storage.get('uas_pro_tmdb_apikey') || '';
                        Lampa.Input.edit({
                            title: 'Введіть TMDB API Ключ',
                            value: currentKey,
                            free: true,
                            nosave: true
                        }, function (new_val) {
                            if (new_val !== undefined) {
                                Lampa.Storage.set('uas_pro_tmdb_apikey', new_val.trim());
                                Lampa.Noty.show('TMDB ключ збережено. Перезапустіть застосунок.');
                            }
                        });
                    });
                }
            });
        }
    }
    
    // Запуск плагіна
    if (typeof Lampa !== 'undefined') {
        if (Lampa.Activity && Lampa.Activity.listeners && Lampa.Activity.listeners.start) {
            start();
        } else {
            Lampa.Listener.follow('start', start);
        }
    }
})();
