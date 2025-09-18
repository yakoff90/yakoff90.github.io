/*
Для получения данных Metacritic, Tomatoes, наград испольузется https://www.omdbapi.com/ - получите API ключ

Можно использовать одиночный ключ или массив ключей, после получения API ключей передайте их как массивы через:
    window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEYS
Или просто введите ниже в коде плагина:
    var OMDB_API_KEYS = (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEYS) || ['YOU_KEY']; // api ключи массивом

Для получения данных о качестве используется jacred парсер, по умолчанию плагин настроен на получение адреса и ключа вашего введеного jacred,
вы можете изменить это в переменных:
    var JACRED_PROTOCOL = 'https://'; // Протокол JacRed
    var JACRED_URL = Lampa.Storage.get('jackett_url'); // Адрес JacRed для получения информации о карточках без протокола (jacred.xyz)
    var JACRED_API_KEY = Lampa.Storage.get('jackett_key'); // api ключ JacRed

*/

(function () {
    'use strict';
    var OMDB_API_KEYS = (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEYS) || ['YOU_KEY']; // api ключи массивом
    var IMDB_API_KEYS = (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.IMDB_API_KEYS) || ['']; // api ключи массивом
    var TMDB_API_KEYS = (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.TMDB_API_KEYS) || ['']; // api ключи массивом
    var TMDB_URL = 'https://api.themoviedb.org/3/';
    var TMDB_URL_APPEND = 'append_to_response=images,videos';
    var JACRED_PROTOCOL = 'https://'; // Протокол JacRed
    var JACRED_URL = Lampa.Storage.get('jackett_url'); // Адрес JacRed для получения информации о карточках без протокола (jacred.xyz)
    var JACRED_API_KEY = Lampa.Storage.get('jackett_key'); // api ключ JacRed

    var WEIGHTS = {
        imdb: 0.8,
        tmdb: 0.6,
        rt: 0.5,
        mc: 0.4
    };
    
    var OMDB_CACHE = 'maxsm_ratings_omdb_cache';
    var IMDB_CACHE = 'maxsm_ratings_imdb_cache';
    var ID_MAPPING_CACHE = 'maxsm_ratings_id_mapping_cache';
    var QUALITY_CACHE = 'maxsm_ratings_quality_cache';

    var globalCurrentCard = null;

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.classList && node.classList.contains('card')) {
                        setTimeout(function () {
                            const id = node.getAttribute('data-id');
                            const type = node.getAttribute('data-type');
                            if (id && type && localStorage.getItem('maxsm_ratings_quality_inlist') === 'true') {
                                getQuality(id, node);
                            }
                        }, 500);
                    }
                });
            }
        });
    });

    Lampa.Lang.add({
        maxsm_ratings_omdb_apikey: {
            ru: 'OMDB API ключ',
            en: 'OMDB API key',
            uk: 'OMDB API ключ',
            be: 'OMDB API ключ',
            pt: 'OMDB API key',
            zh: 'OMDB API 密钥',
            he: 'מפתח OMDB API',
            cs: 'OMDB API klíč',
            bg: 'OMDB API ключ'
        },
        maxsm_ratings_kp_apikey: {
            ru: 'Kinopoisk Unofficial API ключ',
            en: 'Kinopoisk Unofficial API key',
            uk: 'Kinopoisk Unofficial API ключ',
            be: 'Kinopoisk Unofficial API ключ',
            pt: 'Kinopoisk Unofficial API key',
            zh: 'Kinopoisk 非官方 API 密钥',
            he: 'מפתח API לא רשמי של Kinopoisk',
            cs: 'Kinopoisk neoficiální API klíč',
            bg: 'Kinopoisk неофициален API ключ'
        },
        maxsm_ratings_tmdb_apikey: {
            ru: 'TMDB API ключ',
            en: 'TMDB API key',
            uk: 'TMDB API ключ',
            be: 'TMDB API ключ',
            pt: 'TMDB API key',
            zh: 'TMDB API 密钥',
            he: 'מפתח TMDB API',
            cs: 'TMDB API klíč',
            bg: 'TMDB API ключ'
        },
        maxsm_ratings_omdb_cache: {
            ru: 'Очистить кеш',
            en: 'Clear cache',
            uk: 'Очистити кеш',
            be: 'Ачысціць кэш',
            pt: 'Limpar cache',
            zh: '清除缓存',
            he: 'נקה מטמון',
            cs: 'Vymazat mezipaměť',
            bg: 'Изчистване на кеша'
        },
        maxsm_ratings_imdb: {
            ru: 'IMDB рейтинг',
            en: 'IMDB rating',
            uk: 'IMDB рейтинг',
            be: 'IMDB рэйтынг',
            pt: 'Classificação IMDB',
            zh: 'IMDB 评分',
            he: 'דירוג IMDB',
            cs: 'IMDB hodnocení',
            bg: 'IMDB рейтинг'
        },
        maxsm_ratings_kp: {
            ru: 'Кинопоиск рейтинг',
            en: 'Kinopoisk rating',
            uk: 'Рейтинг Кінопоіск',
            be: 'Кінапошук рэйтынг',
            pt: 'Classificação Kinopoisk',
            zh: 'Kinopoisk 评分',
            he: 'דירוג Kinopoisk',
            cs: 'Kinopoisk hodnocení',
            bg: 'Рейтинг Кинопоиск'
        },
        maxsm_ratings_mc: {
            ru: 'Metacritic рейтинг',
            en: 'Metacritic rating',
            uk: 'Metacritic рейтинг',
            be: 'Metacritic рэйтынг',
            pt: 'Classificação Metacritic',
            zh: 'Metacritic 评分',
            he: 'דירוג Metacritic',
            cs: 'Metacritic hodnocení',
            bg: 'Metacritic рейтинг'
        },
        maxsm_ratings_rt: {
            ru: 'Rotten Tomatoes рейтинг',
            en: 'Rotten Tomatoes rating',
            uk: 'Rotten Tomatoes рейтинг',
            be: 'Rotten Tomatoes рэйтынг',
            pt: 'Classificação Rotten Tomatoes',
            zh: '烂番茄评分',
            he: 'דירוג Rotten Tomatoes',
            cs: 'Rotten Tomatoes hodnocení',
            bg: 'Rotten Tomatoes рейтинг'
        },
        maxsm_ratings_total: {
            ru: 'Общий рейтинг',
            en: 'Total rating',
            uk: 'Загальний рейтинг',
            be: 'Агульны рэйтынг',
            pt: 'Classificação total',
            zh: '总评分',
            he: 'דירוג כללי',
            cs: 'Celkové hodnocení',
            bg: 'Общ рейтинг'
        },
        maxsm_ratings_quality_movie: {
            ru: 'Качество для фильмов',
            en: 'Quality for movies',
            uk: 'Якість для фільмів',
            be: 'Якасць для фільмаў',
            pt: 'Qualidade para filmes',
            zh: '电影质量',
            he: 'איכות לסרטים',
            cs: 'Kvalita pro filmy',
            bg: 'Качество за филми'
        },
        maxsm_ratings_quality_tv: {
            ru: 'Качество для сериалов',
            en: 'Quality for series',
            uk: 'Якість для серіалів',
            be: 'Якасць для серыялаў',
            pt: 'Qualidade para séries',
            zh: '剧集质量',
            he: 'איכות לסדרות',
            cs: 'Kvalita pro seriály',
            bg: 'Качество за сериали'
        },
        maxsm_ratings_quality_inlist: {
            ru: 'Показывать качество в списке',
            en: 'Show quality in list',
            uk: 'Показувати якість у списку',
            be: 'Паказваць якасць у спісе',
            pt: 'Mostrar qualidade na lista',
            zh: '在列表中显示质量',
            he: 'הצג איכות ברשימה',
            cs: 'Zobrazit kvalitu v seznamu',
            bg: 'Показване на качеството в списъка'
        },
        maxsm_ratings_quality_all_sources: {
            ru: 'Показывать качество для всех источников',
            en: 'Show quality for all sources',
            uk: 'Показувати якість для всіх джерел',
            be: 'Паказваць якасць для ўсіх крыніц',
            pt: 'Mostrar qualidade para todas as fontes',
            zh: '显示所有来源的质量',
            he: 'הצג איכות לכל המקורות',
            cs: 'Zobrazit kvalitu pro všechny zdroje',
            bg: 'Показване на качеството за всички източници'
        },
        maxsm_ratings_cc: {
            ru: 'Сбросить весь кеш',
            en: 'Clear all cache',
            uk: 'Скинути весь кеш',
            be: 'Скінуць увесь кэш',
            pt: 'Limpar todo o cache',
            zh: '清除所有缓存',
            he: 'נקה את כל המטמון',
            cs: 'Vymazat veškerou mezipaměť',
            bg: 'Изчистване на целия кеш'
        },
    });

    var Api = {
        omdb: 'https://www.omdbapi.com/',
        tmdb: 'https://api.themoviedb.org/3/',
        jackett: JACRED_PROTOCOL + JACRED_URL + '/api/v2.0/indexers/all/results/torznab',
        imdbId: 'https://www.omdbapi.com/?apikey=OMDB_API_KEY&i=ID',
        search: 'https://www.omdbapi.com/?apikey=OMDB_API_KEY&t=NAME&y=YEAR&r=json&plot=full'
    };

    var omdbAPIKeyIndex = 0;
    var tmdbAPIKeyIndex = 0;

    function getOMDBAPIKey() {
        if (OMDB_API_KEYS.length === 0) return null;
        var key = OMDB_API_KEYS[omdbAPIKeyIndex];
        omdbAPIKeyIndex = (omdbAPIKeyIndex + 1) % OMDB_API_KEYS.length;
        return key;
    }

    function getTMDBAPIKey() {
        if (TMDB_API_KEYS.length === 0) return null;
        var key = TMDB_API_KEYS[tmdbAPIKeyIndex];
        tmdbAPIKeyIndex = (tmdbAPIKeyIndex + 1) % TMDB_API_KEYS.length;
        return key;
    }

    function isExpired(cacheItem) {
        if (!cacheItem) return true;
        var now = new Date().getTime();
        return now - cacheItem.timestamp > 86400000;
    }
    
    function getFromCache(cacheName, key) {
        try {
            var cache = JSON.parse(localStorage.getItem(cacheName) || '{}');
            var item = cache[key];
            if (item && !isExpired(item)) {
                return item.data;
            }
            return null;
        } catch (e) {
            console.error('MAXSM-RATINGS: Error retrieving from cache:', e);
            return null;
        }
    }

    function saveToCache(cacheName, key, data) {
        try {
            var cache = JSON.parse(localStorage.getItem(cacheName) || '{}');
            cache[key] = {
                data: data,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(cacheName, JSON.stringify(cache));
        } catch (e) {
            console.error('MAXSM-RATINGS: Error saving to cache:', e);
        }
    }

    function displayRating(ratings, render) {
        var html = '';
        var ratingsExist = false;
        var totalRating = 0;
        var totalCount = 0;
        var averageRatings = {};
        
        var imdbRating = getFromCache(IMDB_CACHE, globalCurrentCard) || 'N/A';
        if (imdbRating !== 'N/A') {
            html += '<div class="full-start__rate rate--imdb">' +
                '<div>' + imdbRating + '</div>' +
                '<div class="source--name">' + Lampa.Lang.translate('source_imdb') + '</div>' +
                '</div>';
            ratingsExist = true;
        }

        if (ratings.imdb) {
            totalRating += parseFloat(ratings.imdb) * 10;
            totalCount++;
            averageRatings.imdb = ratings.imdb;
        }
        if (ratings.tmdb) {
            totalRating += ratings.tmdb;
            totalCount++;
            averageRatings.tmdb = ratings.tmdb;
        }
        if (ratings.mc) {
            totalRating += ratings.mc;
            totalCount++;
            averageRatings.mc = ratings.mc;
        }
        if (ratings.rt) {
            totalRating += ratings.rt;
            totalCount++;
            averageRatings.rt = ratings.rt;
        }

        var totalAvg = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : 0;
        if (totalAvg > 0) {
            var colorClass = getRatingClass(totalAvg);
            html += '<div class="full-start__rate rate--omdb-avg ' + colorClass + '">' +
                '<div>' + totalAvg + '</div>' +
                '<div class="source--name">' + Lampa.Lang.translate('ratimg_omdb_avg') + '</div>' +
                '</div>';
            ratingsExist = true;
        }

        for (var source in ratings) {
            if (ratings.hasOwnProperty(source)) {
                var value = ratings[source];
                var name = Lampa.Lang.translate('source_' + source);

                if (source === 'rt' || source === 'mc') {
                    if (value > 0) {
                        html += '<div class="full-start__rate rate--' + source + '">' +
                            '<div>' + value + '</div>' +
                            '<div class="source--name">' + name + '</div>' +
                            '</div>';
                        ratingsExist = true;
                    }
                } else if (source !== 'tmdb') {
                    if (value > 0) {
                        html += '<div class="full-start__rate rate--' + source + '">' +
                            '<div>' + (value * 10).toFixed(1) + '</div>' +
                            '<div class="source--name">' + name + '</div>' +
                            '</div>';
                        ratingsExist = true;
                    }
                }
            }
        }
        
        var oscarsText = ratings.oscars ? '<div class="source--name">' + Lampa.Lang.translate('maxsm_omdb_oscars') + ': ' + ratings.oscars + '</div>' : '';
        if (oscarsText) {
            html += '<div class="full-start__rate">' + oscarsText + '</div>';
            ratingsExist = true;
        }
        
        var imdbLink = ratings.imdbId ? '<div class="source--name"><a href="https://www.imdb.com/title/' + ratings.imdbId + '" target="_blank">IMDb</a></div>' : '';
        if (imdbLink) {
            html += '<div class="full-start__rate">' + imdbLink + '</div>';
            ratingsExist = true;
        }

        if (ratingsExist) {
            var infoElement = render.querySelector('.full-start__info');
            if (infoElement) {
                var newDiv = document.createElement('div');
                newDiv.className = 'full-start__ratings';
                newDiv.innerHTML = html;
                infoElement.after(newDiv);
            }
        }
    }
    
    function fetchAdditionalRatings(movie, render) {
        if (!movie || !movie.id) return;
        var title = movie.original_title || movie.title;
        var year = movie.release_date ? movie.release_date.substring(0, 4) : '';
        var ratings = {};
        
        var cachedOmdb = getFromCache(OMDB_CACHE, title + '_' + year);
        if (cachedOmdb) {
            ratings = cachedOmdb;
            displayRating(ratings, render);
            return;
        }
        
        var tmdbApiKey = getTMDBAPIKey();
        if (tmdbApiKey) {
            fetch(TMDB_URL + (movie.media_type || movie.type || 'movie') + '/' + movie.id + '?api_key=' + tmdbApiKey)
                .then(res => res.json())
                .then(data => {
                    if (data && data.vote_average) {
                        ratings.tmdb = parseFloat(data.vote_average.toFixed(1));
                    }
                    if (data && data.imdb_id) {
                        fetchOMDB(data.imdb_id, ratings, render);
                    } else {
                        fetchOMDB(null, ratings, render);
                    }
                }).catch(e => {
                    console.error('MAXSM-RATINGS: TMDB fetch error', e);
                    fetchOMDB(null, ratings, render);
                });
        } else {
            fetchOMDB(null, ratings, render);
        }
    }
    
    function fetchOMDB(imdbId, ratings, render) {
        var omdbApiKey = getOMDBAPIKey();
        if (!omdbApiKey) {
            displayRating(ratings, render);
            return;
        }
        var url = imdbId ? Api.imdbId.replace('ID', imdbId).replace('OMDB_API_KEY', omdbApiKey) : Api.search.replace('NAME', encodeURIComponent(movie.original_title || movie.title)).replace('YEAR', movie.release_date ? movie.release_date.substring(0, 4) : '').replace('OMDB_API_KEY', omdbApiKey);

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data && data.Response === 'True') {
                    if (data.imdbRating) ratings.imdb = parseFloat(data.imdbRating);
                    if (data.imdbID) ratings.imdbId = data.imdbID;
                    if (data.Awards && data.Awards.indexOf('Oscar') !== -1) {
                        var oscarWins = data.Awards.match(/(\d+ wins?)/i);
                        if (oscarWins && oscarWins[1]) {
                            ratings.oscars = oscarWins[1];
                        }
                    }
                    if (data.Ratings) {
                        data.Ratings.forEach(rating => {
                            if (rating.Source === 'Rotten Tomatoes' && rating.Value) {
                                ratings.rt = parseInt(rating.Value.replace('%', ''), 10);
                            } else if (rating.Source === 'Metacritic' && rating.Value) {
                                ratings.mc = parseInt(rating.Value.split('/')[0], 10);
                            }
                        });
                    }
                    saveToCache(OMDB_CACHE, (movie.original_title || movie.title) + '_' + (movie.release_date ? movie.release_date.substring(0, 4) : ''), ratings);
                }
                displayRating(ratings, render);
            }).catch(e => {
                console.error('MAXSM-RATINGS: OMDB fetch error', e);
                displayRating(ratings, render);
            });
    }

    function getQuality(id, card) {
        var type = card.getAttribute('data-type');
        var qualityCacheKey = id + '_' + type;
        var cachedQuality = getFromCache(QUALITY_CACHE, qualityCacheKey);
        if (cachedQuality) {
            displayQuality(card, cachedQuality);
            return;
        }

        var url = JACRED_PROTOCOL + JACRED_URL + '/api/v2.0/indexers/all/results/torznab/api?apikey=' + JACRED_API_KEY + '&t=search&cat=' + (type === 'tv' ? '5030,5040' : '2000') + '&q=' + encodeURIComponent(card.querySelector('.card__title').innerText);
        if (type === 'tv' && card.querySelector('.card__extra').innerText) {
            url += '+' + encodeURIComponent(card.querySelector('.card__extra').innerText);
        }

        fetch(url)
            .then(response => response.text())
            .then(text => {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(text, 'text/xml');
                var items = xmlDoc.getElementsByTagName('item');
                var quality = null;

                for (var i = 0; i < items.length; i++) {
                    var title = items[i].getElementsByTagName('title')[0].textContent;
                    if (isQualityFound(title)) {
                        quality = isQualityFound(title);
                        break;
                    }
                }
                if (quality) {
                    saveToCache(QUALITY_CACHE, qualityCacheKey, quality);
                    displayQuality(card, quality);
                }
            })
            .catch(error => console.error('MAXSM-RATINGS: JacRed fetch error:', error));
    }

    function isQualityFound(title) {
        var qualityPatterns = {
            '4K': /(4K|2160p)/i,
            'FHD': /(1080p|FHD)/i,
            'HD': /(720p|HD)/i,
        };
        for (var quality in qualityPatterns) {
            if (qualityPatterns[quality].test(title)) {
                return quality;
            }
        }
        return null;
    }

    function displayQuality(card, quality) {
        var cardLink = card.querySelector('.card__link');
        if (cardLink) {
            var qualityElement = document.createElement('div');
            qualityElement.className = 'quality-label ' + quality.toLowerCase();
            qualityElement.textContent = quality;
            cardLink.appendChild(qualityElement);
        }
    }

    function getRatingClass(rating) {
        if (rating >= 7.0) return 'high';
        if (rating >= 5.0) return 'medium';
        return 'low';
    }

    function startPlugin() {
        if (window.combined_ratings_plugin) return;
        window.combined_ratings_plugin = true;
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                globalCurrentCard = e.data.movie.id;
                fetchAdditionalRatings(e.data.movie, render);
            }
        });

        // Добавляем настройки
        Lampa.SettingsApi.add({
            title: Lampa.Lang.translate('maxsm_ratings_omdb_apikey'),
            component: 'maxsm_ratings',
            param: 'omdb_api_key',
            type: 'text',
            value: OMDB_API_KEYS.join(','),
            onChange: function (value) {
                OMDB_API_KEYS = value.split(',').map(key => key.trim()).filter(key => key);
            },
            onRender: function (item) {
                var button = document.createElement('div');
                button.className = 'settings-param';
                button.innerHTML = Lampa.Lang.translate('maxsm_ratings_omdb_cache');
                button.addEventListener('click', function () {
                    localStorage.removeItem(OMDB_CACHE);
                    Lampa.Noty.show('Кеш OMDB очищен');
                });
                item.before(button);
            }
        });

        Lampa.SettingsApi.add({
            title: Lampa.Lang.translate('maxsm_ratings_tmdb_apikey'),
            component: 'maxsm_ratings',
            param: 'tmdb_api_key',
            type: 'text',
            value: TMDB_API_KEYS.join(','),
            onChange: function (value) {
                TMDB_API_KEYS = value.split(',').map(key => key.trim()).filter(key => key);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_quality_inlist',
                type: 'toggle'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_ratings_quality_inlist'),
                description: ''
            },
            onChange: function (value) {
                if (value) {
                    observer.observe(document.body, { childList: true, subtree: true });
                    console.log('MAXSM-RATINGS: observer Start');
                } else {
                    observer.disconnect();
                    console.log('MAXSM-RATINGS: observer Stop');
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_quality_all_sources',
                type: 'toggle'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_ratings_quality_all_sources'),
                description: ''
            },
            onChange: function (value) {
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_quality_movie',
                type: 'select'
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_quality_movie"),
                description: ''
            },
            onChange: function (value) {
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_quality_tv',
                type: 'select'
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_quality_tv"),
                description: ''
            },
            onChange: function (value) {
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_cc',
                type: 'button'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_ratings_cc')
            },
            onChange: function () {
                localStorage.removeItem(OMDB_CACHE);
                localStorage.removeItem(KP_CACHE);
                localStorage.removeItem(IMDB_CACHE);
                localStorage.removeItem(ID_MAPPING_CACHE);
                localStorage.removeItem(QUALITY_CACHE);
                window.location.reload();
            }
        });

        if (localStorage.getItem('maxsm_ratings_quality_inlist') === 'true') {
            // Вызов наблюдателя
            observer.observe(document.body, { childList: true, subtree: true });
            console.log('MAXSM-RATINGS: observer Start');
        }

        // Попадания внутри карточки
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var render = e.object.activity.render();
                globalCurrentCard = e.data.movie.id;
                fetchAdditionalRatings(e.data.movie, render);
            }
        });

        // Перехват попадения на страницу постерки
        Lampa.Listener.follow('content', function (e) {
            if (e.type == 'complite') {
                setTimeout(function () {
                    var cards = document.querySelectorAll('.card');
                    cards.forEach(card => {
                        const id = card.getAttribute('data-id');
                        const type = card.getAttribute('data-type');
                        if (id && type && localStorage.getItem('maxsm_ratings_quality_inlist') === 'true') {
                            getQuality(id, card);
                        }
                    });
                }, 500);
            }
        });
    }

    if (!window.combined_ratings_plugin) {
        startPlugin();
    }

})();