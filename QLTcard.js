/**
 * Likhtar Marks Only — плагін (Likhtar Team).
 * Залишено вивід міток (якість, озвучка (UA, EN), рейтинг) на постери.
 * Вилучено польську озвучку.
 * Оптимізовано: миттєвий рендер збережених міток, додано Storage кеш для UaFix, прибрано анімацію.
 * 
 * Модифікація: Використано SVG-мітки з плагіну QLT для повної картки фільму.
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

        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_ua', type: 'trigger', default: true }, field: { name: 'Українська озвучка (UA)' } });
        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_en', type: 'trigger', default: true }, field: { name: 'Англійська озвучка (EN)' } });
        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_4k', type: 'trigger', default: true }, field: { name: 'Якість 4K' } });
        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_fhd', type: 'trigger', default: true }, field: { name: 'Якість FHD/HD' } });
        Lampa.SettingsApi.addParam({ component: 'likhtar_marks', param: { name: 'likhtar_badge_hdr', type: 'trigger', default: true }, field: { name: 'HDR / Dolby Vision' } });
    }

    // =================================================================
    // ІНТЕГРАЦІЯ МІТОК З QLT ДЛЯ ПОВНОЇ КАРТКИ
    // =================================================================
    
    // Копіюємо конфігурацію SVG-іконок з QLT.js
    var pluginPath = 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/';
    
    var svgIcons = {
        '4K': pluginPath + '4K.svg',
        '2K': pluginPath + '2K.svg',
        'FULL HD': pluginPath + 'FULL%20HD.svg',
        'HD': pluginPath + 'HD.svg',
        'HDR': pluginPath + 'HDR.svg',
        'Dolby Vision': pluginPath + 'DolbyV.png',
        '7.1': pluginPath + '7.1.svg',
        '5.1': pluginPath + '5.1.svg',
        '4.0': pluginPath + '4.0.svg',
        '2.0': pluginPath + '2.0.svg',
        'UKR': pluginPath + 'UA.png'
    };

    // Функція створення SVG-бейджа (з QLT.js)
    function createSvgBadge(type, index) {
        var iconPath = svgIcons[type];
        if (!iconPath) return '';
        var delay = (index * 0.08) + 's';
        return (
            '<div class="quality-badge" style="animation-delay:' + delay + '">' +
                '<img src="' + iconPath + '" draggable="false" oncontextmenu="return false;">' +
            '</div>'
        );
    }

    // Функція побудови HTML з бейджів (з QLT.js, адаптована)
    function buildSvgBadgesHtml(best) {
        if (!best || !best.ukr) return '';

        var badges = [];

        // Якість/аудіо — тільки серед релізів з UA
        if (best.resolution) {
            // Використовуємо ті самі ключі, що й у svgIcons
            var resMap = {
                '4K': '4K',
                '2K': '2K',
                'FHD': 'FULL HD',  // FHD -> FULL HD
                'HD': 'HD'
            };
            var resBadge = resMap[best.resolution];
            if (resBadge) {
                console.log('[SVG] Додаємо бейдж resolution:', resBadge);
                badges.push(createSvgBadge(resBadge, badges.length));
            }
        }
        
        if (best.hdr) {
            console.log('[SVG] Додаємо бейдж HDR');
            badges.push(createSvgBadge('HDR', badges.length));
        }
        
        if (best.dolbyVision) {
            console.log('[SVG] Додаємо бейдж Dolby Vision');
            badges.push(createSvgBadge('Dolby Vision', badges.length));
        }
        
        if (best.audio) {
            console.log('[SVG] Додаємо бейдж audio:', best.audio);
            badges.push(createSvgBadge(best.audio, badges.length));
        }

        // UA іконка в кінці
        console.log('[SVG] Додаємо бейдж UKR');
        badges.push(createSvgBadge('UKR', badges.length));

        return badges.join('');
    }

    // Стилі для SVG-бейджів (з QLT.js, адаптовані)
    var svgStyles = '<style id="svgq_styles_for_likhtar">\
        /* CSS var: розмір міток */\
        :root{ --svgq-badge-size: 2.0em; }\
        \
        .jacred-info-marks-v2 {\
            display: flex;\
            flex-direction: row;\
            flex-wrap: wrap;\
            gap: 0.3em;\
            margin-right: 1em;\
            align-items: center;\
        }\
        \
        .quality-badge {\
            height: var(--svgq-badge-size);\
            display: inline-flex;\
            align-items: center;\
            justify-content: center;\
            padding: 0;\
            background: none;\
            box-shadow: none;\
            border: none;\
            border-radius: 0;\
            box-sizing: border-box;\
            opacity: 0;\
            transform: translateY(8px);\
            animation: qb_in 0.38s ease forwards;\
        }\
        \
        @keyframes qb_in {\
            to { opacity: 1; transform: translateY(0); }\
        }\
        \
        .quality-badge img {\
            height: 100%;\
            width: auto;\
            display: block;\
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.85));\
        }\
        \
        @media (max-width:768px) {\
            .quality-badge {\
                height: calc(var(--svgq-badge-size) * 0.85);\
            }\
        }\
    </style>';

    // Додаємо стилі для SVG-бейджів
    function injectSvgStyles() {
        if (!document.getElementById('svgq_styles_for_likhtar')) {
            $('body').append(svgStyles);
        }
    }

    // Функція для додавання SVG-міток у повну картку (замінює стару)
    function injectFullCardSvgMarks(movie, renderEl) {
        if (!movie || !movie.id || !renderEl) {
            console.log('[SVG] Немає movie або renderEl');
            return;
        }
        
        var $render = $(renderEl);
        var rateLine = $render.find('.full-start-new__rate-line, .full-start__rate-line').first();
        
        if (!rateLine.length) {
            console.log('[SVG] Не знайдено rateLine');
            return;
        }
        
        console.log('[SVG] Знайдено rateLine, movie:', movie.title || movie.name);
        
        // Видаляємо старий контейнер, якщо він є
        rateLine.find('.jacred-info-marks-v2').remove();
        
        var marksContainer = $('<div class="jacred-info-marks-v2"></div>');
        rateLine.prepend(marksContainer);
        
        // Використовуємо існуючу функцію getBestJacred для отримання даних
        getBestJacred(movie, function (data) {
            console.log('[SVG] Отримано дані з JacRed:', data);
            
            if (data && !data.empty) {
                // Конвертуємо дані у формат, який розуміє buildSvgBadgesHtml
                var bestForSvg = {
                    resolution: data.resolution,
                    ukr: data.ukr,
                    hdr: data.hdr,
                    dolbyVision: data.dolbyVision || false,
                    audio: data.audio || null
                };
                
                console.log('[SVG] Дані для SVG:', bestForSvg);
                
                var html = buildSvgBadgesHtml(bestForSvg);
                console.log('[SVG] Згенерований HTML:', html);
                
                if (html) {
                    marksContainer.html(html);
                } else {
                    console.log('[SVG] HTML порожній, можливо немає UKR');
                }
            } else {
                console.log('[SVG] Немає даних або data.empty = true');
            }
        });
    }

    // =================================================================
    // LIKHTAR QUALITY MARKS (JacRed + UaFix) - БЕЗ ЗМІН
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
                console.log('[JacRed] З кешу:', _jacredCache[cacheKey]);
                callback(_jacredCache[cacheKey]);
                return;
            }

            try {
                var raw = Lampa.Storage.get(cacheKey, '');
                if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < 48 * 60 * 60 * 1000)) {
                    _jacredCache[cacheKey] = raw;
                    console.log('[JacRed] З Storage:', raw);
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
            console.log('[JacRed] Запит до API:', apiUrl);

            fetchWithProxy(apiUrl, function (err, data) {
                if (err || !data) {
                    console.log('[JacRed] Помилка запиту:', err);
                    callback(null);
                    return;
                }

                try {
                    var parsed;
                    try { parsed = JSON.parse(data); } catch (e) {
                        console.log('[JacRed] Помилка парсингу JSON:', e);
                        callback(null); 
                        return;
                    }

                    if (parsed.contents) {
                        try { parsed = JSON.parse(parsed.contents); } catch (e) { }
                    }

                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                    console.log('[JacRed] Отримано results:', results.length);

                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) { }
                        callback(null);
                        return;
                    }

                    var best = { resolution: 'SD', ukr: false, eng: false, hdr: false, dolbyVision: false, audio: null };
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
                        
                        // Виявлення аудіо
                        if (/\b7[\.\s]?1\b|\b8ch\b|\b8\s*ch\b/i.test(t)) best.audio = '7.1';
                        else if (/\b5[\.\s]?1\b|\b6ch\b|\b6\s*ch\b/i.test(t)) best.audio = '5.1';
                        else if (/\b4[\.\s]?0\b|\b4ch\b|\b4\s*ch\b/i.test(t)) best.audio = '4.0';
                        else if (/\b2[\.\s]?0\b|\b2ch\b|\b2\s*ch\b/i.test(t)) best.audio = '2.0';
                        
                        if (t.indexOf('ukr') >= 0 || t.indexOf('укр') >= 0 || t.indexOf('ua') >= 0 || t.indexOf('ukrainian') >= 0) best.ukr = true;
                        if (t.indexOf('eng') >= 0 || t.indexOf('english') >= 0 || t.indexOf('multi') >= 0) best.eng = true;
                        if (t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0) { 
                            best.hdr = true; 
                            best.dolbyVision = true; 
                        } else if (t.indexOf('hdr') >= 0) {
                            best.hdr = true;
                        }
                    });

                    if (card.original_language === 'uk') best.ukr = true;
                    if (card.original_language === 'en') best.eng = true;

                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try { Lampa.Storage.set(cacheKey, best); } catch (e) { }
                    console.log('[JacRed] Best result:', best);
                    callback(best);

                } catch (e) { 
                    console.log('[JacRed] Помилка обробки:', e);
                    callback(null); 
                }
            });
        }

        function createBadge(cssClass, label) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
            badge.textContent = label;
            return badge;
        }

        // Функція для повної картки з SVG-мітками (оновлена)
        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            
            // Додаємо стилі для SVG
            injectSvgStyles();
            
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
                var movie = e.data && e.data.movie;
                var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                
                // Використовуємо нову функцію з SVG-мітками
                injectFullCardSvgMarks(movie, renderEl);
            });

            setTimeout(function () {
                try {
                    var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                    if (!act || act.component !== 'full') return;
                    var movie = act.card || act.movie;
                    var renderEl = act.activity && act.activity.render && act.activity.render();
                    injectFullCardSvgMarks(movie, renderEl);
                } catch (err) { }
            }, 300);
        }

        function processCards() {
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    addMarksToContainer(card, movie, '.card__view');
                }
            });
        }

        function observeCardRows() {
            var observer = new MutationObserver(function () { processCards(); });
            observer.observe(document.body, { childList: true, subtree: true });
            processCards();
        }

        var _uafixCache = {};

        function checkUafixDirect(movie, callback) {
            var query = movie.original_title || movie.original_name || movie.title || movie.name || '';
            if (!query) return callback(false);
            var searchUrl = 'https://uafix.net/index.php?do=search&subaction=search&story=' + encodeURIComponent(query);
            fetchWithProxy(searchUrl, function (err, html) {
                if (err || !html) return callback(false);
                var hasResults = html.indexOf('знайдено') >= 0 && html.indexOf('0 відповідей') < 0;
                callback(hasResults);
            });
        }

        function checkUafix(movie, callback) {
            if (!movie || !movie.id) return callback(false);
            var key = 'uafix_v2_' + movie.id;
            
            if (_uafixCache[key] !== undefined) return callback(_uafixCache[key]);
            
            var storageVal = Lampa.Storage.get(key, '');
            if (storageVal !== '') {
                var isFound = (storageVal === 'true' || storageVal === true);
                _uafixCache[key] = isFound;
                return callback(isFound);
            }

            checkUafixDirect(movie, function (found) {
                _uafixCache[key] = found;
                try { Lampa.Storage.set(key, found ? 'true' : 'false'); } catch (e) {}
                callback(found);
            });
        }

        function addMarksToContainer(element, movie, viewSelector) {
            var containerParent = viewSelector ? element.find(viewSelector) : element;
            if (!containerParent.length) containerParent = element;

            var marksContainer = containerParent.find('.card-marks');
            if (!marksContainer.length) {
                marksContainer = $('<div class="card-marks"></div>');
                containerParent.append(marksContainer);
            }

            if (movie.has_ua !== undefined || movie.quality !== undefined) {
                var staticData = {
                    ukr: movie.has_ua === true,
                    resolution: movie.quality || 'SD',
                    hdr: movie.is_hdr === true,
                    eng: false
                };
                renderBadges(marksContainer, staticData, movie);
                return; 
            }

            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true };
                checkUafix(movie, function (hasUafix) {
                    if (hasUafix && data) {
                        data.ukr = true;
                        data.empty = false;
                    }
                    if (data && !data.empty) renderBadges(marksContainer, data, movie);
                });
            });
        }

        function renderBadges(container, data, movie) {
            container.empty();
            if (data.ukr && Lampa.Storage.get('likhtar_badge_ua', true)) container.append(createBadge('ua', 'UA'));
            if (data.eng && Lampa.Storage.get('likhtar_badge_en', true)) container.append(createBadge('en', 'EN'));
            
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('likhtar_badge_4k', true)) container.append(createBadge('4k', '4K'));
                else if (data.resolution === 'FHD' && Lampa.Storage.get('likhtar_badge_fhd', true)) container.append(createBadge('fhd', 'FHD'));
                else if (data.resolution === 'HD' && Lampa.Storage.get('likhtar_badge_fhd', true)) container.append(createBadge('hd', 'HD'));
                else if (Lampa.Storage.get('likhtar_badge_fhd', true)) container.append(createBadge('hd', data.resolution));
            }
            if (data.hdr && Lampa.Storage.get('likhtar_badge_hdr', true)) container.append(createBadge('hdr', 'HDR'));
            
            if (movie) {
                var rating = parseFloat(movie.imdb_rating || movie.kp_rating || movie.vote_average || 0);
                if (rating > 0) {
                    var rBadge = document.createElement('div');
                    rBadge.classList.add('card__mark', 'card__mark--rating');
                    rBadge.innerHTML = '<span class="mark-star">★</span>' + rating.toFixed(1);
                    container.append(rBadge);
                }
            }
        }

        var style = document.createElement('style');
        style.innerHTML = `
            .card .card__type { left: -0.2em !important; }

            .card-marks {
                position: absolute;
                top: 2.7em;
                left: -0.2em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            .card:not(.card--tv):not(.card--movie) .card-marks,
            .card--movie .card-marks {
                top: 1.4em;
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
            .card__mark--ua  { background: linear-gradient(135deg, #1565c0, #42a5f5); color: #fff; border-color: rgba(66,165,245,0.4); }
            .card__mark--4k  { background: linear-gradient(135deg, #e65100, #ff9800); color: #fff; border-color: rgba(255,152,0,0.4); }
            .card__mark--fhd { background: linear-gradient(135deg, #4a148c, #ab47bc); color: #fff; border-color: rgba(171,71,188,0.4); }
            .card__mark--hd  { background: linear-gradient(135deg, #1b5e20, #66bb6a); color: #fff; border-color: rgba(102,187,106,0.4); }
            .card__mark--en  { background: linear-gradient(135deg, #37474f, #78909c); color: #fff; border-color: rgba(120,144,156,0.4); }
            .card__mark--hdr { background: linear-gradient(135deg, #f57f17, #ffeb3b); color: #000; border-color: rgba(255,235,59,0.4); }
            .card__mark--rating { background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffd700; border-color: rgba(255,215,0,0.3); font-size: 0.75em; white-space: nowrap; }
            .card__mark--rating .mark-star { margin-right: 0.15em; font-size: 0.9em; }

            .card.jacred-mark-processed-v2 .card__vote { display: none !important; }
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
