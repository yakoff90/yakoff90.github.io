(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

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

    var DEFAULT_ROWS_SETTINGS = [
        { id: 'ym_row_history', title: 'Історія перегляду', defOrder: '1', default: true },
        { id: 'ym_row_movies_new', title: 'Новинки фільмів', defOrder: '2', default: true },
        { id: 'ym_row_series_new', title: 'Новинки серіалів', defOrder: '3', default: true },
        { id: 'ym_row_collections', title: 'Підбірки', defOrder: '4', default: true },
        { id: 'ym_row_kinobaza', title: 'Новинки Стрімінгів UA', defOrder: '5', default: true },
        { id: 'ym_row_community', title: 'Приховані геми LME', defOrder: '6', default: true },
        { id: 'ym_row_movies_watch', title: 'Популярні фільми', defOrder: '7', default: true },
        { id: 'ym_row_series_pop', title: 'Популярні серіали', defOrder: '8', default: true },
        { id: 'ym_row_random', title: 'Випадкові фільми', defOrder: '9', default: true }
    ];

    var inflight = {};
    var lmeCache = null;
    var listCache = {};      
    var tmdbItemCache = {};  
    var itemUrlCache = {};   
    var seasonsCache = {};

    Lampa.Lang.add({
        main: 'Головна UA',
        title_main: 'Головна UA',
        title_tmdb: 'Головна UA'
    });

    var safeStorage = (function () {
        var memoryStore = {};
        try {
            if (typeof window.localStorage !== 'undefined') {
                var testKey = '__season_test_v5__';
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

    try { seasonsCache = JSON.parse(safeStorage.getItem('seasonBadgeCacheV5') || '{}'); } catch (e) {}

    function debounce(func, wait) {
        var timer;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () { func.apply(context, args); }, wait);
        };
    }

    function Cache(config) {
        var self = this;
        var storage = {};
        function cleanupExpired() {
            var now = Date.now(), changed = false, keys = Object.keys(storage);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i], node = storage[key];
                if (!node || !node.timestamp || typeof node.value !== 'boolean') { delete storage[key]; changed = true; continue; }
                var ttl = node.value ? config.positiveTtl : config.negativeTtl;
                if (node.timestamp <= now - ttl) { delete storage[key]; changed = true; }
            }
            if (changed) self.save();
        }
        self.save = debounce(function () { Lampa.Storage.set(config.key, storage); }, 400);
        self.init = function () { storage = Lampa.Storage.get(config.key, {}) || {}; cleanupExpired(); };
        self.get = function (id) {
            var node = storage[id];
            if (!node || !node.timestamp || typeof node.value !== 'boolean') return null;
            var ttl = node.value ? config.positiveTtl : config.negativeTtl;
            if (node.timestamp > Date.now() - ttl) return node.value;
            delete storage[id]; self.save(); return null;
        };
        self.set = function (id, value) {
            cleanupExpired();
            storage[id] = { timestamp: Date.now(), value: !!value };
            self.save();
        };
    }

    var requestQueue = {
        activeCount: 0, queue:[], maxParallel: CONFIG.queue.maxParallel,
        add: function (task) { this.queue.push(task); this.process(); },
        process: function () {
            var _this = this;
            while (this.activeCount < this.maxParallel && this.queue.length) {
                var task = this.queue.shift(); this.activeCount++;
                Promise.resolve().then(task)["catch"](function () {})["finally"](function () { _this.activeCount--; _this.process(); });
            }
        }
    };

    function fetchHtml(url) {
        return new Promise(function (resolve, reject) {
            var proxyIndex = 0;
            function tryProxy() {
                if (proxyIndex >= PROXIES.length) {
                    resolve('');
                    return;
                }
                var proxy = PROXIES[proxyIndex];
                var proxyUrl = proxy.includes('?url=') ? proxy + encodeURIComponent(url) : proxy + url;
                fetch(proxyUrl).then(function (res) {
                    if (res.ok) {
                        return res.text();
                    }
                    throw new Error('Not OK');
                }).then(function (text) {
                    if (text && text.length > 500 && text.indexOf('<html') !== -1 && text.indexOf('just a moment...') === -1) {
                        resolve(text);
                    } else {
                        proxyIndex++;
                        tryProxy();
                    }
                }).catch(function () {
                    proxyIndex++;
                    tryProxy();
                });
            }
            tryProxy();
        });
    }

    function getTmdbKey() {
        var custom = (Lampa.Storage.get('uas_pro_tmdb_apikey') || '').trim();
        return custom || CONFIG.tmdbApiKey || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
    }

    function getTmdbEndpoint(path) {
        var url = Lampa.TMDB.api(path);
        if (url.indexOf('api_key') === -1) url += (url.indexOf('?') !== -1 ? '&' : '?') + 'api_key=' + getTmdbKey();
        if (url.indexOf('http') !== 0) url = 'https://api.themoviedb.org/3/' + url;
        return url;
    }

    function safeFetch(url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({ ok: true, json: function() { return Promise.resolve(JSON.parse(xhr.responseText)); } });
                    } else {
                        reject(new Error('HTTP ' + xhr.status));
                    }
                }
            };
            xhr.onerror = function () { reject(new Error('Network error')); };
            xhr.send(null);
        });
    }

    function fetchCommunityWatches(url) {
        return new Promise(function(resolve, reject) {
            if (window.Lampa && Lampa.Network) {
                Lampa.Network.silent(url, function(json) {
                    resolve(json);
                }, function(err) {
                    reject(err);
                });
            } else {
                safeFetch(url).then(function(r) { return r.json(); }).then(resolve).catch(reject);
            }
        });
    }

    function fetchTmdbWithFallback(type, id) {
        return new Promise(function (resolve, reject) {
            var endpoint = getTmdbEndpoint(type + '/' + id + '?language=uk');
            fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).then(function (res) {
                if (res && (!res.overview || res.overview.trim() === '')) {
                    var enEndpoint = getTmdbEndpoint(type + '/' + id + '?language=en');
                    fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); }).then(function (enRes) {
                        if (enRes && enRes.overview) res.overview = enRes.overview;
                        resolve(res);
                    }).catch(function () { resolve(res); });
                } else {
                    resolve(res);
                }
            }).catch(function () { resolve(null); });
        });
    }

    function createMediaMeta(data) {
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

    function isSuccessResponse(response) {
        if (response === true) return true;
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            if (response.error || response.status === 'error' || response.success === false || response.ok === false) return false;
            if (response.success === true || response.status === 'success' || response.ok === true) return true;
            return Object.keys(response).length > 0;
        }
        return false;
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
                    })["finally"](function () {
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

    function fetchSeriesData(tmdbId) {
        return new Promise(function (resolve, reject) {
            var now = (new Date()).getTime();
            if (seasonsCache[tmdbId] && (now - seasonsCache[tmdbId].timestamp < CONFIG.cacheTime)) {
                resolve(seasonsCache[tmdbId].data);
                return;
            }
            if (window.Lampa && Lampa.TMDB && typeof Lampa.TMDB.tv === 'function') {
                Lampa.TMDB.tv(tmdbId, function (data) {
                    seasonsCache[tmdbId] = { data: data, timestamp: now };
                    try { safeStorage.setItem('seasonBadgeCacheV5', JSON.stringify(seasonsCache)); } catch (e) {}
                    resolve(data);
                }, reject, { language: CONFIG.language });
            } else {
                var url = 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + getTmdbKey() + '&language=' + CONFIG.language;
                safeFetch(url).then(function (r) { return r.json(); }).then(function(data) {
                    seasonsCache[tmdbId] = { data: data, timestamp: now };
                    try { safeStorage.setItem('seasonBadgeCacheV5', JSON.stringify(seasonsCache)); } catch (e) {}
                    resolve(data);
                }).catch(reject);
            }
        });
    }

    function renderSeasonBadge(cardHtml, tmdbData) {
        if (!tmdbData || !tmdbData.last_episode_to_air) return;
        var last = tmdbData.last_episode_to_air;
        var currentSeason = null;
        for (var i = 0; i < tmdbData.seasons.length; i++) {
            if (tmdbData.seasons[i].season_number === last.season_number) {
                currentSeason = tmdbData.seasons[i];
                break;
            }
        }
        if (currentSeason && last.season_number > 0) {
            var isComplete = currentSeason.episode_count > 0 && last.episode_number >= currentSeason.episode_count;
            var text = isComplete ? "S" + last.season_number : "S" + last.season_number + " " + last.episode_number + "/" + currentSeason.episode_count;
            var typeBadge = cardHtml.querySelector('.card__type');
            if (!typeBadge) {
                var view = cardHtml.querySelector('.card__view');
                if (!view) return;
                typeBadge = document.createElement('div');
                typeBadge.className = 'card__type';
                view.appendChild(typeBadge);
            }
            var bgColor = isComplete ? 'rgba(46, 204, 113, 0.8)' : 'rgba(170, 20, 20, 0.8)';
            typeBadge.innerHTML = text;
            typeBadge.classList.add('card__type--season');
            typeBadge.style.backgroundColor = bgColor;
            typeBadge.style.display = 'flex';
        }
    }

    function getColor(rating, alpha) {
        var rgb = '';
        if (rating >= 0 && rating <= 3) rgb = '231, 76, 60';
        else if (rating > 3 && rating <= 5) rgb = '230, 126, 34';
        else if (rating > 5 && rating <= 6.5) rgb = '241, 196, 15';
        else if (rating > 6.5 && rating < 8) rgb = '52, 152, 219';
        else if (rating >= 8 && rating <= 10) rgb = '46, 204, 113';
        return rgb ? 'rgba(' + rgb + ', ' + alpha + ')' : null;
    }

    function extractItemLinks(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var links = [];
        var anchors = doc.querySelectorAll('a[href]');
        for (var i = 0; i < anchors.length; i++) {
            var a = anchors[i];
            var href = a.getAttribute('href');
            if (href && href.match(/\/\d+-[^/]+\.html$/) && href.indexOf('#') === -1) {
                var fullUrl = href.indexOf('http') === 0 ? href : 'https://uaserials.com' + href;
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
            if (href && href.match(/\/collections\/\d+/) && href.indexOf('/page/') === -1) {
                var fullUrl = href.indexOf('http') === 0 ? href : 'https://uaserials.com' + href;
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

    function getImdbId(url) {
        return new Promise(function (resolve, reject) {
            if (itemUrlCache[url]) {
                resolve(itemUrlCache[url]);
                return;
            }
            fetchHtml(url).then(function (html) {
                var match = html.match(/imdb\.com\/title\/(tt\d+)/i);
                var id = match ? match[1] : null;
                if (id) itemUrlCache[url] = id;
                resolve(id);
            }).catch(function () { resolve(null); });
        });
    }

    function processSingleItem(url) {
        return new Promise(function (resolve, reject) {
            getImdbId(url).then(function (imdb) {
                if (!imdb) { resolve(null); return; }
                if (tmdbItemCache[imdb]) { resolve(tmdbItemCache[imdb]); return; }
                var endpoint = getTmdbEndpoint('find/' + imdb + '?external_source=imdb_id&language=uk');
                fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).then(function (data) {
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
                        fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); }).then(function (enData) {
                            var enRes = (enData.movie_results && enData.movie_results.length > 0) ? enData.movie_results[0] : (enData.tv_results && enData.tv_results.length > 0) ? enData.tv_results[0] : null;
                            if (enRes && enRes.overview) res.overview = enRes.overview;
                            if (res) tmdbItemCache[imdb] = res;
                            resolve(res);
                        }).catch(function () {
                            if (res) tmdbItemCache[imdb] = res;
                            resolve(res);
                        });
                    } else {
                        if (res) tmdbItemCache[imdb] = res;
                        resolve(res);
                    }
                }).catch(function () { resolve(null); });
            }).catch(function () { resolve(null); });
        });
    }

    function searchTmdbByTitleAndYear(title, year, expectedType) {
        return new Promise(function (resolve, reject) {
            var cacheKey = 'kinobaza_search_' + title + '_' + year + '_' + (expectedType || 'any');
            if (tmdbItemCache[cacheKey]) { resolve(tmdbItemCache[cacheKey]); return; }
            var endpointsToTry = [];
            if (expectedType === 'tv') endpointsToTry.push('search/tv', 'search/multi');
            else if (expectedType === 'movie') endpointsToTry.push('search/movie', 'search/multi');
            else endpointsToTry.push('search/multi');
            var endpointIndex = 0;
            function tryEndpoint() {
                if (endpointIndex >= endpointsToTry.length) { resolve(null); return; }
                var path = endpointsToTry[endpointIndex];
                var endpoint = getTmdbEndpoint(path + '?query=' + encodeURIComponent(title) + '&language=uk');
                fetch(PROXIES[0] + endpoint).then(function (r) { return r.json(); }).then(function (data) {
                    if (data && data.results && data.results.length > 0) {
                        var res = null;
                        for (var i = 0; i < data.results.length; i++) {
                            var r = data.results[i];
                            if (expectedType && r.media_type && r.media_type !== expectedType && path === 'search/multi') continue;
                            var rYear = (r.release_date || r.first_air_date || '').substring(0, 4);
                            if (rYear === year || rYear === (parseInt(year)-1).toString() || rYear === (parseInt(year)+1).toString()) {
                                res = r;
                                break;
                            }
                        }
                        if (!res) {
                            for (var j = 0; j < data.results.length; j++) {
                                var r2 = data.results[j];
                                if (expectedType && r2.media_type && r2.media_type !== expectedType && path === 'search/multi') continue;
                                var t1 = (r2.original_title || r2.original_name || '').toLowerCase();
                                var t2 = title.toLowerCase();
                                if (t1 === t2) {
                                    res = r2;
                                    break;
                                }
                            }
                        }
                        if (res) {
                            if (!res.overview || res.overview.trim() === '') {
                                var enEndpoint = getTmdbEndpoint(path + '?query=' + encodeURIComponent(title) + '&language=en');
                                fetch(PROXIES[0] + enEndpoint).then(function (r) { return r.json(); }).then(function (enData) {
                                    var enRes = null;
                                    if (enData.results) {
                                        for (var k = 0; k < enData.results.length; k++) {
                                            if (enData.results[k].id === res.id) {
                                                enRes = enData.results[k];
                                                break;
                                            }
                                        }
                                    }
                                    if (enRes && enRes.overview) res.overview = enRes.overview;
                                    if (!res.media_type) res.media_type = expectedType || (res.first_air_date ? 'tv' : 'movie');
                                    tmdbItemCache[cacheKey] = res;
                                    resolve(res);
                                }).catch(function () {
                                    if (!res.media_type) res.media_type = expectedType || (res.first_air_date ? 'tv' : 'movie');
                                    tmdbItemCache[cacheKey] = res;
                                    resolve(res);
                                });
                            } else {
                                if (!res.media_type) res.media_type = expectedType || (res.first_air_date ? 'tv' : 'movie');
                                tmdbItemCache[cacheKey] = res;
                                resolve(res);
                            }
                            return;
                        }
                    }
                    endpointIndex++;
                    tryEndpoint();
                }).catch(function () {
                    endpointIndex++;
                    tryEndpoint();
                });
            }
            tryEndpoint();
        });
    }

    function processInQueue(items, processFn, concurrency) {
        concurrency = concurrency || 5;
        return new Promise(function (resolve, reject) {
            var results = new Array(items.length);
            var index = 0;
            var completed = 0;
            function worker() {
                function next() {
                    if (index >= items.length) {
                        completed++;
                        if (completed === concurrency) {
                            resolve(results.filter(Boolean));
                        }
                        return;
                    }
                    var currentIndex = index++;
                    processFn(items[currentIndex]).then(function (res) {
                        if (res) results[currentIndex] = res;
                        next();
                    }).catch(function () {
                        next();
                    });
                }
                next();
            }
            var workers = [];
            for (var i = 0; i < concurrency; i++) workers.push(worker());
        });
    }

    function fetchCatalogPage(url, limit) {
        limit = limit || 15;
        return new Promise(function (resolve, reject) {
            if (listCache[url]) { resolve(listCache[url]); return; }
            fetchHtml(url).then(function (listHtml) {
                var links = extractItemLinks(listHtml).slice(0, limit);
                processInQueue(links, processSingleItem, 5).then(function (tmdbItems) {
                    var unique = {};
                    var finalItems = [];
                    for (var i = 0; i < tmdbItems.length; i++) {
                        var item = tmdbItems[i];
                        if (!item || !item.id || !item.backdrop_path) continue;
                        if (unique[item.id]) continue;
                        unique[item.id] = true;
                        finalItems.push(item);
                    }
                    if (finalItems.length > 0) listCache[url] = finalItems;
                    resolve(finalItems);
                }).catch(reject);
            }).catch(reject);
        });
    }

    function fetchKinobazaCatalog(url, limit, noCache) {
        return new Promise(function (resolve, reject) {
            if (!noCache && listCache[url]) { resolve(listCache[url]); return; }
            fetchHtml(url).then(function (html) {
                var items = extractKinobazaItems(html);
                processInQueue(items, function (item) {
                    return searchTmdbByTitleAndYear(item.title, item.year, item.type);
                }, 5).then(function (tmdbItems) {
                    var unique = {};
                    var finalItems = [];
                    for (var i = 0; i < tmdbItems.length; i++) {
                        var item = tmdbItems[i];
                        if (!item || !item.id || !item.backdrop_path) continue;
                        if (unique[item.id]) continue;
                        unique[item.id] = true;
                        finalItems.push(item);
                    }
                    if (limit) finalItems = finalItems.slice(0, limit);
                    if (!noCache && finalItems.length > 0) listCache[url] = finalItems;
                    resolve(finalItems);
                }).catch(reject);
            }).catch(reject);
        });
    }

    function getLmeTmdbItems(items) {
        var promises = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            promises.push(new Promise(function (resolve) {
                if (!item) { resolve(null); return; }
                var type, id;
                if (item.id && typeof item.id === 'string' && item.id.indexOf(':') !== -1) {
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
                    resolve(null);
                    return;
                }
                fetchTmdbWithFallback(type, id).then(function (tmdbData) {
                    if (tmdbData && !tmdbData.error && tmdbData.backdrop_path) {
                        tmdbData.media_type = type;
                        resolve(tmdbData);
                    } else {
                        resolve(null);
                    }
                }).catch(function () { resolve(null); });
            }));
        }
        return Promise.all(promises).then(function (results) {
            return results.filter(Boolean);
        });
    }

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
                    for (var i = 0; i < res.logos.length; i++) {
                        if (res.logos[i].iso_639_1 === 'uk') { found = res.logos[i]; break; }
                    }
                } else if (langPref === 'en') {
                    for (var i = 0; i < res.logos.length; i++) {
                        if (res.logos[i].iso_639_1 === 'en') { found = res.logos[i]; break; }
                    }
                } else {
                    for (var i = 0; i < res.logos.length; i++) {
                        if (res.logos[i].iso_639_1 === 'uk') { found = res.logos[i]; break; }
                    }
                    if (!found) {
                        for (var i = 0; i < res.logos.length; i++) {
                            if (res.logos[i].iso_639_1 === 'en') { found = res.logos[i]; break; }
                        }
                    }
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

    function makeTitleButtonItem(title, url, iconUrl) {
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

    function makeCollectionButtonItem(collection) {
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

    function makeFavoriteCardItem(bgUrl) {
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

    function makeHistoryButtonCardItem(bgUrl) {
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

    function makeHistoryCardItem(movie) {
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
                            var meta = createMediaMeta(movie);
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

    function makeWideCardItem(movie) {
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
                        if (Lampa.Storage.get('uas_show_flag', true)) {
                            var meta = createMediaMeta(movie);
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

    function loadHistoryRow(callback) {
        var hist = [];
        var allFavs = {};
        try {
            if (window.Lampa && Lampa.Favorite && typeof Lampa.Favorite.all === 'function') {
                allFavs = Lampa.Favorite.all() || {};
                if (allFavs.history) hist = allFavs.history;
            }
        } catch(e) {}
        var results = [];
        var randFavImg = '';
        try {
            var favItems = [];
            if (allFavs.book) favItems = favItems.concat(allFavs.book);
            if (allFavs.like) favItems = favItems.concat(allFavs.like);
            var validFavs = [];
            for (var i = 0; i < favItems.length; i++) {
                if (favItems[i] && (favItems[i].backdrop_path || favItems[i].poster_path)) validFavs.push(favItems[i]);
            }
            if (validFavs.length > 0) {
                var randItem = validFavs[Math.floor(Math.random() * validFavs.length)];
                var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                var imgUrlPath = randItem.backdrop_path || randItem.poster_path;
                randFavImg = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgUrlPath)) : '';
            }
        } catch(e) {}
        var randHistImg = '';
        try {
            var validHist = [];
            var historyItems = allFavs.history || [];
            for (var i = 0; i < historyItems.length; i++) {
                if (historyItems[i] && (historyItems[i].backdrop_path || historyItems[i].poster_path)) validHist.push(historyItems[i]);
            }
            if (validHist.length > 0) {
                var randItem = validHist[Math.floor(Math.random() * validHist.length)];
                var quality = Lampa.Storage.get('ym_img_quality', 'w300');
                var imgUrlPath = randItem.backdrop_path || randItem.poster_path;
                randHistImg = imgUrlPath ? (PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + imgUrlPath)) : '';
            }
        } catch(e) {}
        var showFav = Lampa.Storage.get('uas_show_fav_card');
        if (showFav === null || showFav === undefined || showFav === '' || showFav === true || showFav === 'true') {
            results.push(makeFavoriteCardItem(randFavImg));
        }
        var showHistBtn = Lampa.Storage.get('uas_show_history_btn');
        if (showHistBtn === null || showHistBtn === undefined || showHistBtn === '' || showHistBtn === true || showHistBtn === 'true') {
            results.push(makeHistoryButtonCardItem(randHistImg));
        }
        if (hist && hist.length > 0) {
            var unique = {};
            var validItems = [];
            for (var i = 0; i < hist.length; i++) {
                var h = hist[i];
                if (h && h.id && (h.title || h.name) && !unique[h.id]) {
                    unique[h.id] = true;
                    validItems.push(h);
                }
                if (validItems.length >= 20) break;
            }
            if (validItems.length > 0) {
                for (var i = 0; i < validItems.length; i++) {
                    results.push(makeHistoryCardItem(validItems[i]));
                }
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

    function loadRow(urlId, loadUrl, title, callback) {
        fetchCatalogPage(loadUrl, 15).then(function (items) {
            var mapped = [];
            for (var i = 0; i < items.length; i++) {
                mapped.push(makeWideCardItem(items[i]));
            }
            callback({
                results: mapped,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        }).catch(function () {
            callback({ results: [] });
        });
    }

    function loadKinobazaRow(urlId, loadUrl, title, callback) {
        var fetchUrl = loadUrl + '1';
        fetchKinobazaCatalog(fetchUrl, 15).then(function (items) {
            var mapped = [];
            for (var i = 0; i < items.length; i++) {
                mapped.push(makeWideCardItem(items[i]));
            }
            callback({
                results: mapped,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        }).catch(function () {
            callback({ results: [] });
        });
    }

    function loadUaserialsCollectionsRow(urlId, loadUrl, title, callback) {
        fetchHtml(loadUrl).then(function (html) {
            var items = extractUaserialsCollections(html);
            items.sort(function () { return 0.5 - Math.random(); });
            var mapped = [];
            for (var i = 0; i < items.length && i < 7; i++) {
                mapped.push(makeCollectionButtonItem(items[i]));
            }
            callback({
                results: mapped,
                title: '',
                source: 'uas_pro_source',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 15 } }
            });
        }).catch(function () {
            callback({ results: [] });
        });
    }

    function loadCommunityGemsRow(callback) {
        var listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=15&page=1';
        safeFetch(listUrl).then(function (r) { return r.json(); }).then(function (res) {
            var items = Array.isArray(res) ? res : (res.items || []);
            getLmeTmdbItems(items).then(function (tmdbItems) {
                var mappedResults = [];
                for (var i = 0; i < tmdbItems.length; i++) {
                    mappedResults.push(makeWideCardItem(tmdbItems[i]));
                }
                callback({
                    results: mappedResults,
                    title: '',
                    source: 'uas_pro_source',
                    uas_content_row: true,
                    params: { items: { mapping: 'line', view: 15 } }
                });
            });
        }).catch(function () {
            callback({ results: [] });
        });
    }

    function loadRandomMoviesRow(callback) {
        var baseRandomUrl = 'https://kinobaza.com.ua/titles?q=&search_type=&order_by=random&display=&user_rated_year=0&user_seen_year=0&type=&tv_status=&ys=&ye=&rating=1&rating_max=10&votes=&imdb_rating=7&imdb_rating_max=10&imdb_votes=5000&metacritic_min=&metacritic_max=&tomato_min=&tomato_max=&age_min=&age_max=&per_page=30&distributor=&translated=has_ukr_audio';
        var fetchUrl = baseRandomUrl + '&_t=' + Date.now();
        fetchKinobazaCatalog(fetchUrl, 5, true).then(function (movies) {
            var mapped = [];
            for (var i = 0; i < movies.length; i++) {
                mapped.push(makeWideCardItem(movies[i]));
            }
            callback({
                results: mapped,
                title: '',
                uas_content_row: true,
                params: { items: { mapping: 'line', view: 5 } }
            });
        }).catch(function () {
            callback({ results: [] });
        });
    }

    function getOrCreateLoadingToast() {
        var toast = document.getElementById('uas-loading-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'uas-loading-toast';
            toast.innerText = 'Завантаження нових карток...';
            toast.style.cssText = 'display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(40,40,40,0.95); color:#fff; padding:12px 24px; border-radius:8px; z-index:99999; font-size:1.2em; font-weight:bold; pointer-events:none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); opacity:0; transition: opacity 0.3s ease;';
            document.body.appendChild(toast);
        }
        return toast;
    }

    function showLoadingToast() {
        var toast = getOrCreateLoadingToast();
        toast.style.display = 'block';
        setTimeout(function () { toast.style.opacity = '1'; }, 10);
    }

    function hideLoadingToast() {
        var toast = getOrCreateLoadingToast();
        toast.style.opacity = '0';
        setTimeout(function () {
            if (toast.style.opacity === '0') toast.style.display = 'none';
        }, 300);
    }

    Lampa.Api.sources.uas_pro_source = {
        list: function (params, oncomplete, onerror) {
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
                onerror();
                return;
            }
            function fetchPageData(targetPage) {
                return new Promise(function (resolve, reject) {
                    var pageMapped = [];
                    var pageTotal = 50;
                    if (isLME) {
                        var listUrl = 'https://wh.lme.isroot.in/v2/top?period=7d&top=asc&min_rating=7&per_page=20&page=' + targetPage;
                        fetchCommunityWatches(listUrl).then(function (res) {
                            var items = Array.isArray(res) ? res : (res.items || []);
                            pageTotal = res.total_pages || 10;
                            getLmeTmdbItems(items).then(function (tmdbItems) {
                                resolve({ mapped: tmdbItems, total: pageTotal });
                            }).catch(reject);
                        }).catch(reject);
                    } else if (isUasCollectionsList) {
                        if (targetPage > 1) {
                            resolve({ mapped: [], total: 1 });
                            return;
                        }
                        var listUrl = baseUrl;
                        if (listCache[listUrl]) {
                            resolve({ mapped: listCache[listUrl], total: 1 });
                        } else {
                            fetchHtml(listUrl).then(function (html) {
                                var items = extractUaserialsCollections(html);
                                var mappedItems = [];
                                for (var i = 0; i < items.length; i++) {
                                    mappedItems.push(makeCollectionButtonItem(items[i]));
                                }
                                if (mappedItems.length > 0) listCache[listUrl] = mappedItems;
                                resolve({ mapped: mappedItems, total: 1 });
                            }).catch(reject);
                        }
                    } else if (isUasCollection) {
                        var listUrl = params.url;
                        if (targetPage > 1) {
                            if (listUrl.indexOf('.html') !== -1) {
                                listUrl = listUrl.replace('.html', '/page/' + targetPage + '/');
                            } else {
                                listUrl = listUrl.replace(/\/$/, '') + '/page/' + targetPage + '/';
                            }
                        }
                        if (listCache[listUrl]) {
                            resolve({ mapped: listCache[listUrl], total: 50 });
                        } else {
                            fetchCatalogPage(listUrl, 20).then(function (items) {
                                if (items.length > 0) listCache[listUrl] = items;
                                resolve({ mapped: items, total: 50 });
                            }).catch(reject);
                        }
                    } else if (isKinobazaOnline) {
                        var fetchUrl = baseUrl + targetPage;
                        fetchKinobazaCatalog(fetchUrl, 30).then(function (items) {
                            resolve({ mapped: items, total: 50 });
                        }).catch(reject);
                    } else {
                        var fetchUrl = targetPage === 1 ? baseUrl : baseUrl + 'page/' + targetPage + '/';
                        fetchCatalogPage(fetchUrl, 20).then(function (items) {
                            resolve({ mapped: items, total: 50 });
                        }).catch(reject);
                    }
                });
            }
            if (requestedPage > 1) {
                showLoadingToast();
            }
            fetchPageData(1).then(function (res1) {
                if (requestedPage === 1) {
                    fetchPageData(2).then(function (res2) {
                        hideLoadingToast();
                        var allMapped = res1.mapped.concat(res2.mapped);
                        oncomplete({
                            results: allMapped,
                            page: requestedPage,
                            total_pages: res1.total
                        });
                    }).catch(function () {
                        hideLoadingToast();
                        oncomplete({
                            results: res1.mapped,
                            page: requestedPage,
                            total_pages: res1.total
                        });
                    });
                } else {
                    fetchPageData(requestedPage + 1).then(function (res) {
                        hideLoadingToast();
                        oncomplete({
                            results: res.mapped,
                            page: requestedPage,
                            total_pages: res.total
                        });
                    }).catch(function () {
                        hideLoadingToast();
                        onerror();
                    });
                }
            }).catch(function () {
                if (requestedPage > 1) hideLoadingToast();
                onerror();
            });
        }
    };

    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        Lampa.SettingsApi.addComponent({
            component: 'ymainpage',
            name: 'YMainPage',
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
        var orderValues = { '1': 'Позиція 1', '2': 'Позиція 2', '3': 'Позиція 3', '4': 'Позиція 4', '5': 'Позиція 5', '6': 'Позиція 6', '7': 'Позиція 7', '8': 'Позиція 8', '9': 'Позиція 9' };
        for (var i = 0; i < DEFAULT_ROWS_SETTINGS.length; i++) {
            var r = DEFAULT_ROWS_SETTINGS[i];
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: r.id, type: 'trigger', default: r.default },
                field: { name: 'Вимкнути / Увімкнути: ' + r.title, description: 'Показувати цей рядок на головній' }
            });
            Lampa.SettingsApi.addParam({
                component: 'ymainpage',
                param: { name: r.id + '_order', type: 'select', values: orderValues, default: r.defOrder },
                field: { name: 'Порядок: ' + r.title, description: 'Яким по рахунку виводити цей рядок' }
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

    function overrideApi() {
        Lampa.Api.sources.tmdb.main = function (params, oncomplite, onerror) {
            var rowDefs = [
                { id: 'ym_row_history', defOrder: 1, type: 'history', url: '', title: 'Історія перегляду', icon: '' },
                { id: 'ym_row_movies_new', defOrder: 2, type: 'uas', url: 'uas_movies_new', loadUrl: 'https://uaserials.com/films/p/', title: 'Новинки фільмів', icon: '' },
                { id: 'ym_row_series_new', defOrder: 3, type: 'uas', url: 'uas_series_new', loadUrl: 'https://uaserials.com/series/p/', title: 'Новинки серіалів', icon: '' },
                { id: 'ym_row_collections', defOrder: 4, type: 'uas_collections', url: 'uas_collections_list', loadUrl: 'https://uaserials.com/collections/', title: 'Підбірки', icon: '' },
                { id: 'ym_row_kinobaza', defOrder: 5, type: 'kinobaza', url: 'kinobaza_streaming', loadUrl: 'https://kinobaza.com.ua/online', title: 'Новинки Стрімінгів UA', icon: '' },
                { id: 'ym_row_community', defOrder: 6, type: 'community', url: 'uas_community', title: 'Приховані геми LME', icon: '' },
                { id: 'ym_row_movies_watch', defOrder: 7, type: 'uas', url: 'uas_movies_pop', loadUrl: 'https://uaserials.my/filmss/w/', title: 'Популярні фільми', icon: '' },
                { id: 'ym_row_series_pop', defOrder: 8, type: 'uas', url: 'uas_series_pop', loadUrl: 'https://uaserials.com/series/w/', title: 'Популярні серіали', icon: '' },
                { id: 'ym_row_random', defOrder: 9, type: 'random', url: '', title: 'Випадкові фільми', icon: '' }
            ];
            var activeRows = [];
            for (var i = 0; i < rowDefs.length; i++) {
                var def = rowDefs[i];
                var defSetting = null;
                for (var j = 0; j < DEFAULT_ROWS_SETTINGS.length; j++) {
                    if (DEFAULT_ROWS_SETTINGS[j].id === def.id) {
                        defSetting = DEFAULT_ROWS_SETTINGS[j];
                        break;
                    }
                }
                var defaultEnabled = defSetting ? defSetting.default : true;
                var enabled = Lampa.Storage.get(def.id);
                if (enabled === null || enabled === undefined || enabled === '') {
                    enabled = defaultEnabled;
                } else if (enabled === 'false') {
                    enabled = false;
                } else if (enabled === 'true') {
                    enabled = true;
                }
                var orderVal = Lampa.Storage.get(def.id + '_order');
                var order = parseInt(orderVal);
                if (isNaN(order)) order = def.defOrder;
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
            for (var i = 0; i < activeRows.length; i++) {
                var def = activeRows[i];
                if (def.type !== 'history') {
                    parts_data.push((function (def) {
                        return function (cb) {
                            cb({
                                results: [makeTitleButtonItem(def.title, def.url, def.icon)],
                                title: '',
                                uas_title_row: true,
                                params: { items: { mapping: 'line', view: 1 } }
                            });
                        };
                    })(def));
                }
                parts_data.push((function (def) {
                    return function (cb) {
                        if (def.type === 'history') loadHistoryRow(cb);
                        else if (def.type === 'uas') loadRow(def.url, def.loadUrl, def.title, cb);
                        else if (def.type === 'kinobaza') loadKinobazaRow(def.url, def.loadUrl, def.title, cb);
                        else if (def.type === 'uas_collections') loadUaserialsCollectionsRow(def.url, def.loadUrl, def.title, cb);
                        else if (def.type === 'community') loadCommunityGemsRow(cb);
                        else if (def.type === 'random') loadRandomMoviesRow(cb);
                    };
                })(def));
            }
            if (parts_data.length === 0) {
                parts_data.push(function (cb) {
                    loadRow('uas_movies_new', 'https://uaserials.com/films/p/', 'Новинки фільмів', cb);
                });
            }
            Lampa.Api.partNext(parts_data, 2, oncomplite, onerror);
        };
    }

    function start() {
        if (window.uaserials_pro_v8_loaded) return;
        window.uaserials_pro_v8_loaded = true;
        if (!Lampa.Storage.get('ym_rows_init_v8_fix_8')) {
            Lampa.Storage.set('ym_rows_init_v8_fix_8', true);
            for (var i = 0; i < DEFAULT_ROWS_SETTINGS.length; i++) {
                var r = DEFAULT_ROWS_SETTINGS[i];
                var current = Lampa.Storage.get(r.id);
                if (current === null || current === undefined || current === '') {
                    Lampa.Storage.set(r.id, r.default);
                }
            }
            var sf = Lampa.Storage.get('uas_show_flag');
            if (sf === null || sf === undefined || sf === '') Lampa.Storage.set('uas_show_flag', true);
            var sfc = Lampa.Storage.get('uas_show_fav_card');
            if (sfc === null || sfc === undefined || sfc === '') Lampa.Storage.set('uas_show_fav_card', true);
            var shb = Lampa.Storage.get('uas_show_history_btn');
            if (shb === null || shb === undefined || shb === '') Lampa.Storage.set('uas_show_history_btn', true);
        }
        lmeCache = new Cache(CONFIG.cache);
        lmeCache.init();
        overrideApi();
        createSettings();
    }

    if (typeof Lampa !== 'undefined') {
        if (Lampa.Activity && Lampa.Activity.listeners && Lampa.Activity.listeners.start) {
            start();
        } else {
            Lampa.Listener.follow('start', start);
        }
    }
})();
