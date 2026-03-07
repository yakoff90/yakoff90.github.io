/**
 * Likhtar Marks Only — плагін (Likhtar Team).
 * Змінено: прибрано озвучки та HDR/Dolby Vision.
 * Залишено лише якість (нижній лівий кут) та рейтинг (нижній правий кут).
 */
(function () {
    'use strict';

    if (typeof Lampa === 'undefined') {
        console.error('Lampa not found (script loaded before app?)');
        return;
    }

    // =================================================================
    // НАЛАШТУВАННЯ ДЛЯ МІТОК
    // =================================================================
    function setupMarksSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        Lampa.SettingsApi.addComponent({
            component: 'likhtar_marks',
            name: 'Мітки на постерах',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21h6m-3-18v1m-6.36 1.64l.7.71m12.02-.71l-.7.71M4 12H3m18 0h-1M8 12a4 4 0 108 0 4 4 0 00-8 0zm-1 5h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'likhtar_marks',
            param: { type: 'title' },
            field: { name: 'Відображення міток на картках' }
        });

        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_4k', type: 'trigger', default: true }, field: { name: 'Якість 4K' } });
        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_fhd', type: 'trigger', default: true }, field: { name: 'Якість FHD/HD' } });
        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_rating', type: 'trigger', default: true }, field: { name: 'Рейтинг' } });
    }

    // =================================================================
    // LIKHTAR QUALITY MARKS (Jacred)
    // =================================================================
    function initMarksJacRed() {
        var workingProxy = null;
        var proxies = [
            'https://myfinder.kozak-bohdan.workers.dev/?key=lmp_2026_JacRed_K9xP7aQ4mV2E&url=',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url='
        ];

        function fetchWithProxy(url, callback) {
            try {
                var network = new Lampa.Reguest();
                network.timeout(10000);
                network.silent(url, function (json) {
                    var text = typeof json === 'string' ? json : JSON.stringify(json);
                    workingProxy = 'direct';
                    callback(null, text);
                }, function () {
                    tryProxies(url, callback);
                });
            } catch (e) {
                tryProxies(url, callback);
            }
        }

        function tryProxies(url, callback) {
            var proxyList = (workingProxy && workingProxy !== 'direct') ? [workingProxy] : proxies;

            function tryProxy(index) {
                if (index >= proxyList.length) {
                    callback(new Error('No proxy worked'));
                    return;
                }
                var p = proxyList[index];
                var target = p.indexOf('url=') > -1 ? p + encodeURIComponent(url) : p + url;

                var xhr = new XMLHttpRequest();
                xhr.open('GET', target, true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        workingProxy = p;
                        callback(null, xhr.responseText);
                    } else {
                        tryProxy(index + 1);
                    }
                };
                xhr.onerror = function () { tryProxy(index + 1); };
                xhr.timeout = 10000;
                xhr.ontimeout = function () { tryProxy(index + 1); };
                xhr.send();
            }
            tryProxy(0);
        }

        var _jacredCache = {};

        function getBestJacred(card, callback) {
            var cacheKey = 'jacred_v3_' + card.id;

            if (_jacredCache[cacheKey]) {
                callback(_jacredCache[cacheKey]);
                return;
            }

            try {
                var raw = Lampa.Storage.get(cacheKey, '');
                if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < 48 * 60 * 60 * 1000)) {
                    _jacredCache[cacheKey] = raw;
                    callback(raw);
                    return;
                }
            } catch (e) { }

            var title = (card.original_title || card.title || card.name || '').toLowerCase();
            var year = (card.release_date || card.first_air_date || '').substr(0, 4);

            if (!title || !year) {
                callback(null);
                return;
            }

            var releaseDate = new Date(card.release_date || card.first_air_date);
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null);
                return;
            }

            var apiUrl = 'https://jr.maxvol.pro/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;

            fetchWithProxy(apiUrl, function (err, data) {
                if (err || !data) {
                    callback(null);
                    return;
                }

                try {
                    var parsed;
                    try { parsed = JSON.parse(data); } catch (e) {
                        callback(null); return;
                    }

                    if (parsed.contents) {
                        try { parsed = JSON.parse(parsed.contents); } catch (e) { }
                    }

                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);

                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) { }
                        callback(null);
                        return;
                    }

                    var best = { resolution: 'SD' };
                    var resOrder = ['SD', 'HD', 'FHD', '2K', '4K'];

                    results.forEach(function (item) {
                        var t = (item.title || '').toLowerCase();
                        var currentRes = 'SD';
                        
                        if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) currentRes = '4K';
                        else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0) currentRes = '2K';
                        else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) currentRes = 'FHD';
                        else if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) currentRes = 'HD';

                        if (resOrder.indexOf(currentRes) > resOrder.indexOf(best.resolution)) {
                            best.resolution = currentRes;
                        }
                    });

                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try { Lampa.Storage.set(cacheKey, best); } catch (e) { }
                    callback(best);

                } catch (e) { callback(null); }
            });
        }

        function createBadge(cssClass, label) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
            badge.textContent = label;
            return badge;
        }

        function injectFullCardMarks(movie, renderEl) {
            if (!movie || !movie.id || !renderEl) return;
            var $render = $(renderEl);
            var rateLine = $render.find('.full-start-new__rate-line').first();
            if (!rateLine.length) return;
            if (rateLine.find('.jacred-info-marks-v2').length) return;
            
            var marksContainer = $('<div class="jacred-info-marks-v2"></div>');
            rateLine.prepend(marksContainer);
            
            getBestJacred(movie, function (data) {
                if (data && !data.empty) {
                    renderInfoRowBadges(marksContainer, data);
                }
            });
        }

        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
                var movie = e.data && e.data.movie;
                var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                injectFullCardMarks(movie, renderEl);
            });

            setTimeout(function () {
                try {
                    var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                    if (!act || act.component !== 'full') return;
                    var movie = act.card || act.movie;
                    var renderEl = act.activity && act.activity.render && act.activity.render();
                    injectFullCardMarks(movie, renderEl);
                } catch (err) { }
            }, 300);
        }

        function processCards() {
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    addMarksToContainer(card, movie);
                }
            });
        }

        function observeCardRows() {
            var observer = new MutationObserver(function () { processCards(); });
            observer.observe(document.body, { childList: true, subtree: true });
            processCards();
        }

        function renderInfoRowBadges(container, data) {
            container.empty();
            if (data.resolution && data.resolution !== 'SD') {
                var resText = data.resolution;
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';
                var qualityTag = $('<div class="full-start__pg"></div>');
                qualityTag.text(resText);
                container.append(qualityTag);
            }
        }

        function addMarksToContainer(element, movie) {
            // Видаляємо старі контейнери, якщо вони є
            element.find('.card-marks-quality, .card-marks-rating').remove();
            
            // Контейнер для мітки якості (лівий нижній кут)
            var qualityContainer = $('<div class="card-marks-quality"></div>');
            element.append(qualityContainer);
            
            // Контейнер для рейтингу (правий нижній кут)
            var ratingContainer = $('<div class="card-marks-rating"></div>');
            element.append(ratingContainer);

            if (movie.quality !== undefined) {
                var staticData = {
                    resolution: movie.quality || 'SD'
                };
                renderBadges(qualityContainer, ratingContainer, staticData, movie);
                return; 
            }

            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true, resolution: 'SD' };
                if (data && !data.empty) renderBadges(qualityContainer, ratingContainer, data, movie);
            });
        }

        function renderBadges(qualityContainer, ratingContainer, data, movie) {
            qualityContainer.empty();
            ratingContainer.empty();
            
            // Мітка якості (лівий нижній кут)
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('likhtar_badge_4k', true)) {
                    qualityContainer.append(createBadge('4k', '4K'));
                } else if (data.resolution === 'FHD' && Lampa.Storage.get('likhtar_badge_fhd', true)) {
                    qualityContainer.append(createBadge('fhd', 'FHD'));
                } else if (data.resolution === 'HD' && Lampa.Storage.get('likhtar_badge_fhd', true)) {
                    qualityContainer.append(createBadge('hd', 'HD'));
                } else if (Lampa.Storage.get('likhtar_badge_fhd', true)) {
                    qualityContainer.append(createBadge('hd', data.resolution));
                }
            }
            
            // Рейтинг (правий нижній кут)
            if (Lampa.Storage.get('likhtar_badge_rating', true) && movie) {
                var rating = parseFloat(movie.imdb_rating || movie.kp_rating || movie.vote_average || 0);
                if (rating > 0) {
                    var rBadge = document.createElement('div');
                    rBadge.classList.add('card__mark', 'card__mark--rating');
                    rBadge.innerHTML = '<span class="mark-star">★</span>' + rating.toFixed(1);
                    ratingContainer.append(rBadge);
                }
            }
        }

        var style = document.createElement('style');
        style.innerHTML = `
            .card .card__type { left: -0.2em !important; }

            .card-marks-quality {
                position: absolute;
                bottom: 0.5em;
                left: 0.5em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            
            .card-marks-rating {
                position: absolute;
                bottom: 0.5em;
                right: 0.5em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            
            .card__mark {
                padding: 0.35em 0.45em;
                font-size: 0.8em;
                font-weight: 800;
                line-height: 1;
                letter-spacing: 0.03em;
                border-radius: 0.3em;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                align-self: flex-start;
                border: 1px solid rgba(255,255,255,0.15);
            }
            .card__mark--4k  { background: linear-gradient(135deg, #e65100, #ff9800); color: #fff; border-color: rgba(255,152,0,0.4); }
            .card__mark--fhd { background: linear-gradient(135deg, #4a148c, #ab47bc); color: #fff; border-color: rgba(171,71,188,0.4); }
            .card__mark--hd  { background: linear-gradient(135deg, #1b5e20, #66bb6a); color: #fff; border-color: rgba(102,187,106,0.4); }
            .card__mark--rating { 
                background: linear-gradient(135deg, #1a1a2e, #16213e); 
                color: #ffd700; 
                border-color: rgba(255,215,0,0.3); 
                font-size: 0.75em; 
                white-space: nowrap;
            }
            .card__mark--rating .mark-star { margin-right: 0.15em; font-size: 0.9em; }

            .card.jacred-mark-processed-v2 .card__vote { display: none !important; }
            
            .jacred-info-marks-v2 {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                margin-right: 1em;
                align-items: center;
            }
        `;
        document.head.appendChild(style);

        initFullCardMarks();
        observeCardRows();
    }

    function init() {
        setupMarksSettings();
        initMarksJacRed();
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
