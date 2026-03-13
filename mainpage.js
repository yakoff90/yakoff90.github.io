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

    // ============ ДОПОМІЖНІ ФУНКЦІЇ ============
    function getTmdbKey() {
        let custom = (Lampa.Storage.get('uas_pro_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96');
    }

    function getTmdbEndpoint(path) {
        let url = Lampa.TMDB.api(path);
        if (!url.includes('api_key')) url += (url.includes('?') ? '&' : '?') + 'api_key=' + getTmdbKey();
        if (!url.startsWith('http')) url = 'https://api.themoviedb.org/3/' + url;
        return url;
    }

    // Кеш для сезонів
    var seasonsCache = {};
    try {
        seasonsCache = JSON.parse(Lampa.Storage.get('seasonBadgeCacheUA', '{}'));
    } catch (e) {}

    // ============ ОСНОВНІ ФУНКЦІЇ ОФОРМЛЕННЯ ============
    
    // Функція для аналізу та інвертування темних логотипів
    function analyzeAndInvert(imgElement) {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = imgElement.naturalWidth || imgElement.width;
            canvas.height = imgElement.naturalHeight || imgElement.height;
            if (canvas.width === 0 || canvas.height === 0) return;
            
            ctx.drawImage(imgElement, 0, 0);
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            var darkPixels = 0, totalPixels = 0;
            
            for (var i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 10) continue;
                totalPixels++;
                var brightness = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
                if (brightness < 120) darkPixels++;
            }
            
            if (totalPixels > 0 && (darkPixels / totalPixels) >= 0.85) {
                imgElement.style.filter += " brightness(0) invert(1)";
            }
        } catch (e) {}
    }

    // Функція для отримання кольору на основі рейтингу
    function getColor(rating, alpha) {
        var rgb = '';
        if (rating >= 0 && rating <= 3) rgb = '231, 76, 60';
        else if (rating > 3 && rating <= 5) rgb = '230, 126, 34';
        else if (rating > 5 && rating <= 6.5) rgb = '241, 196, 15';
        else if (rating > 6.5 && rating < 8) rgb = '52, 152, 219';
        else if (rating >= 8 && rating <= 10) rgb = '46, 204, 113';
        return rgb ? 'rgba(' + rgb + ', ' + alpha + ')' : null;
    }

    // Функція для відображення бейджа сезону
    function renderSeasonBadge(cardHtml, tmdbData) {
        if (!tmdbData || !tmdbData.last_episode_to_air) return;
        
        var last = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.filter(function(s) { 
            return s.season_number === last.season_number; 
        })[0];

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
        }
    }

    // Функція для завантаження даних серіалу
    function fetchSeriesData(tmdbId, callback) {
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
                    Lampa.Storage.set('seasonBadgeCacheUA', JSON.stringify(seasonsCache));
                } catch (e) {}
                callback(data);
            })
            .catch(function() { callback(null); });
    }

    // Функція для додавання логотипу
    function addLogo(movie, cardElement) {
        var mType = movie.media_type || (movie.name ? 'tv' : 'movie');
        var langPref = Lampa.Storage.get('ym_logo_lang', 'uk_en');
        var quality = Lampa.Storage.get('ym_img_quality', 'w300');
        var cacheKey = 'logo_ua_style_' + quality + '_' + langPref + '_' + mType + '_' + movie.id;
        var cachedUrl = Lampa.Storage.get(cacheKey);

        function applyLogo(url) {
            var view = cardElement.find('.card__view');
            if (!view.length) return;
            
            if (url && url !== 'none') {
                var img = new Image();
                img.crossOrigin = "anonymous";
                img.className = 'card-custom-logo';
                img.onload = function() { 
                    analyzeAndInvert(img); 
                    view.append(img); 
                };
                img.src = url;
            } else {
                var textLogo = document.createElement('div');
                textLogo.className = 'card-custom-logo-text';

                var txt = movie.title || movie.name;
                if (langPref === 'en') {
                    txt = movie.original_title || movie.original_name || txt;
                }

                textLogo.innerText = txt;
                view.append(textLogo);
            }
        }

        if (cachedUrl) {
            applyLogo(cachedUrl);
            return;
        }

        var endpoint = getTmdbEndpoint(mType + '/' + movie.id + '/images?include_image_language=uk,en,null');
        
        fetch(PROXIES[0] + endpoint)
            .then(function(r) { return r.json(); })
            .then(function(res) {
                var finalLogo = 'none';
                if (res.logos && res.logos.length > 0) {
                    var found = null;
                    if (langPref === 'uk') {
                        found = res.logos.find(function(l) { return l.iso_639_1 === 'uk'; });
                    } else if (langPref === 'en') {
                        found = res.logos.find(function(l) { return l.iso_639_1 === 'en'; });
                    } else {
                        found = res.logos.find(function(l) { return l.iso_639_1 === 'uk'; }) || 
                                res.logos.find(function(l) { return l.iso_639_1 === 'en'; });
                    }

                    if (found) {
                        finalLogo = PROXIES[0] + Lampa.TMDB.image('t/p/' + quality + found.file_path);
                    }
                }
                Lampa.Storage.set(cacheKey, finalLogo);
                applyLogo(finalLogo);
            })
            .catch(function() {
                Lampa.Storage.set(cacheKey, 'none');
                applyLogo('none');
            });
    }

    // ============ ПЕРЕОПРЕДЕЛЕННЯ МЕТОДІВ LAhttps://notsupportedMPA ============
    
    // Зберігаємо оригінальний метод onCreate
    var CardMaker = Lampa.Maker.map('Card');
    var originalOnCreate = CardMaker.Card.onCreate;

    // Створюємо новий метод onCreate з додатковим оформленням
    CardMaker.Card.onCreate = function() {
        // Викликаємо оригінальний метод
        if (originalOnCreate) {
            originalOnCreate.call(this);
        }

        var item = $(this.html);
        var data = this.data;

        // Додаємо базові класи для кастомізації
        if (data && (data.backdrop_path || data.poster_path)) {
            item.addClass('card--custom-styled');
        }

        // Додаємо рейтинг (якщо є)
        var voteVal = parseFloat(data.vote_average);
        if (!isNaN(voteVal) && voteVal > 0) {
            var view = item.find('.card__view');
            if (view.length) {
                // Перевіряємо чи вже є рейтинг
                if (!view.find('.card__vote').length) {
                    var voteDiv = document.createElement('div');
                    voteDiv.className = 'card__vote';
                    voteDiv.innerText = voteVal.toFixed(1);
                    
                    // Додаємо колір на основі рейтингу
                    var bgColor = getColor(voteVal, 0.8);
                    if (bgColor) {
                        voteDiv.style.backgroundColor = bgColor;
                    }
                    
                    view.append(voteDiv);
                }
            }
        }

        // Додаємо рік (якщо є)
        var yearStr = (data.release_date || data.first_air_date || '').toString().substring(0, 4);
        if (yearStr && yearStr.length === 4) {
            var view = item.find('.card__view');
            if (view.length && !view.find('.card-badge-age').length) {
                var ageDiv = document.createElement('div');
                ageDiv.className = 'card-badge-age';
                ageDiv.innerText = yearStr;
                view.append(ageDiv);
            }
        }

        // Якщо це серіал - додаємо бейдж сезону
        if (data && (data.name || data.media_type === 'tv')) {
            var tmdbId = data.id;
            if (tmdbId) {
                fetchSeriesData(tmdbId, function(tmdbData) {
                    if (tmdbData) {
                        renderSeasonBadge(item[0], tmdbData);
                    }
                });
            }
        }

        // Додаємо логотип (якщо налаштування дозволяють)
        if (Lampa.Storage.get('ym_show_logos', true) !== false) {
            if (data && data.id) {
                addLogo(data, item);
            }
        }
    };

    // ============ ДОДАВАННЯ СТИЛІВ ============
    var style = document.createElement('style');
    style.innerHTML = `
        /* ===== ОСНОВНІ СТИЛІ ДЛЯ КАРТОК ===== */
        
        /* Приховуємо стандартний вік */
        .card .card__age { 
            display: none !important; 
        }

        /* Стилі для бейджа року */
        .card__view .card-badge-age { 
            display: block !important; 
            right: 0 !important; 
            top: 0 !important; 
            padding: 0.2em 0.45em !important; 
            background: rgba(0, 0, 0, 0.6) !important; 
            position: absolute !important; 
            margin-top: 0 !important; 
            font-size: 1.1em !important; 
            z-index: 10 !important; 
            color: #fff !important; 
            font-weight: bold !important;
            border-radius: 0 0 0 0.5em !important;
            pointer-events: none !important;
        }

        /* Стилі для бейджа рейтингу */
        .card__vote { 
            right: 0 !important; 
            bottom: 0 !important; 
            padding: 0.2em 0.45em !important; 
            z-index: 10; 
            position: absolute !important; 
            font-weight: bold; 
            background: rgba(0,0,0,0.6);
            color: #fff !important;
            border-radius: 0.5em 0 0 0 !important;
            pointer-events: none !important;
        }

        /* Стилі для бейджа типу/сезону */
        .card__type { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: auto !important; 
            height: auto !important; 
            line-height: 1 !important; 
            padding: 0.3em !important; 
            background: rgba(0, 0, 0, 0.5) !important; 
            display: flex !important; 
            align-items: center; 
            justify-content: center; 
            z-index: 10; 
            color: #fff !important; 
            transition: background 0.3s !important;
            border-radius: 0 0 0.5em 0 !important;
            pointer-events: none !important;
        }
        
        .card__type.card__type--season { 
            font-size: 1.1em !important; 
            font-weight: bold !important; 
            padding: 0.2em 0.45em !important; 
            font-family: Roboto, Arial, sans-serif !important; 
        }

        /* Стилі для українського прапорця (якщо потрібен) */
        .card__ua_flag { 
            position: absolute !important; 
            left: 0 !important; 
            bottom: 0 !important; 
            width: 2.4em !important; 
            height: 1.4em !important; 
            font-size: 1.3em !important; 
            background: linear-gradient(180deg, #0057b8 50%, #ffd700 50%) !important; 
            opacity: 0.8 !important; 
            z-index: 10;
            border-radius: 0 0.5em 0 0 !important;
            pointer-events: none !important;
        }

        /* Стилі для логотипу */
        .card-custom-logo { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            width: 70% !important; 
            height: 70% !important; 
            max-width: 70% !important; 
            max-height: 70% !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            object-fit: contain; 
            z-index: 5; 
            filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.8)); 
            pointer-events: none; 
            transition: filter 0.3s ease; 
        }

        /* Стилі для текстового логотипу (запасний варіант) */
        .card-custom-logo-text { 
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            width: 80%; 
            max-height: 70%; 
            text-align: center; 
            font-size: 2em; 
            font-weight: 600; 
            color: #fff; 
            text-shadow: none !important; 
            z-index: 5; 
            pointer-events: none; 
            word-wrap: break-word; 
            white-space: normal; 
            line-height: 1.2; 
            font-family: sans-serif; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }

        /* Затемнення фону для кращої читабельності */
        .card__view {
            position: relative !important;
        }
        
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

        /* Адаптація для різних типів карток */
        .card--poster .card-custom-logo-text {
            font-size: 1.2em !important;
        }
        
        .card--poster .card-badge-age,
        .card--poster .card__vote,
        .card--poster .card__type {
            font-size: 0.9em !important;
        }

        /* Фокус для карток */
        .card.focus .card__view {
            box-shadow: 0 10px 25px rgba(0,0,0,0.9) !important;
            border: 3px solid #fff !important;
            outline: none !important;
        }
        
        .card.focus .card__view::after,
        .card.focus .card__view::before {
            display: none !important;
            content: none !important;
        }
    `;
    document.head.appendChild(style);

    // ============ НАЛАШТУВАННЯ ПЛАГІНА ============
    function createSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        
        Lampa.SettingsApi.addComponent({
            component: 'uastyle',
            name: 'UA Стиль карток',
            description: 'Налаштування оформлення карток',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>'
        });

        // Налаштування для логотипів
        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_show_logos', type: 'trigger', default: true },
            field: { 
                name: 'Показувати логотипи', 
                description: 'Відображати логотипи TMDB на картках' 
            }
        });

        var langValues = {
            'uk': 'Тільки українською',
            'uk_en': 'Укр + Англ (За замовчуванням)',
            'en': 'Тільки англійською'
        };
        
        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_logo_lang', type: 'select', values: langValues, default: 'uk_en' },
            field: { 
                name: 'Мова логотипів', 
                description: 'Пріоритетна мова для логотипів' 
            }
        });

        var qualValues = {
            'w300': 'w300 (За замовчуванням)',
            'w500': 'w500',
            'w780': 'w780',
            'original': 'Оригінал'
        };
        
        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_img_quality', type: 'select', values: qualValues, default: 'w300' },
            field: { 
                name: 'Якість зображень', 
                description: 'Впливає на швидкість завантаження' 
            }
        });

        // Налаштування для бейджів
        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_show_year', type: 'trigger', default: true },
            field: { 
                name: 'Показувати рік', 
                description: 'Відображати рік на картках' 
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_show_rating', type: 'trigger', default: true },
            field: { 
                name: 'Показувати рейтинг', 
                description: 'Відображати рейтинг на картках' 
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_show_season', type: 'trigger', default: true },
            field: { 
                name: 'Показувати сезон', 
                description: 'Відображати бейдж сезону для серіалів' 
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'uastyle',
            param: { name: 'ym_darken_bg', type: 'trigger', default: true },
            field: { 
                name: 'Затемнення фону', 
                description: 'Додавати темне тло для кращої читабельності' 
            }
        });

        // Обробка змін налаштувань
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'uastyle') {
                e.body.on('hover:enter', '[data-name="ym_show_logos"], [data-name="ym_logo_lang"], [data-name="ym_img_quality"], [data-name="ym_show_year"], [data-name="ym_show_rating"], [data-name="ym_show_season"], [data-name="ym_darken_bg"]', function() {
                    // Можна додати повідомлення про необхідність перезавантаження
                    Lampa.Noty.show('Деякі зміни вимагають перезапуску програми');
                });
            }
        });
    }

    // ============ ЗАПУСК ПЛАГІНА ============
    function start() {
        if (window.ua_style_plugin_loaded) return;
        window.ua_style_plugin_loaded = true;

        createSettings();

        // Динамічне оновлення стилів на основі налаштувань
        Lampa.Listener.follow('settings', function(e) {
            if (e.type === 'change' && e.name && e.name.startsWith('ym_')) {
                var styleEl = document.querySelector('#ua-style-dynamic');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'ua-style-dynamic';
                    document.head.appendChild(styleEl);
                }

                var css = '';
                
                // Затемнення фону
                if (Lampa.Storage.get('ym_darken_bg', true) === false) {
                    css += '.card__view::after { display: none !important; }';
                }

                // Рік
                if (Lampa.Storage.get('ym_show_year', true) === false) {
                    css += '.card-badge-age { display: none !important; }';
                }

                // Рейтинг
                if (Lampa.Storage.get('ym_show_rating', true) === false) {
                    css += '.card__vote { display: none !important; }';
                }

                // Сезон
                if (Lampa.Storage.get('ym_show_season', true) === false) {
                    css += '.card__type { display: none !important; }';
                }

                styleEl.innerHTML = css;
            }
        });

        Lampa.Noty.show('Плагін "UA Стиль карток" завантажено');
    }

    start();

})();
