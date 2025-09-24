(function () {
    'use strict';

    // --- Захист від повторного запуску плагіна ---
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАННЯ ПЛАГІНА ===
    var CONFIG = {
        tmdbApiKey: '27489d4d8c9dbd0f2b3e89f68821de34',
        cacheTime: 24 * 60 * 60 * 1000,
        enabled: true,
        language: 'uk'
    };

    // === СТИЛІ ДЛЯ МІТОК СЕЗОНУ ===
    var style = document.createElement('style');
    style.textContent = `
    .card--season-complete {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(61, 161, 141, 0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(255, 193, 7, 0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    .card--season-complete div,
    .card--season-progress div {
        text-transform: uppercase;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 1.05em;
        padding: 0.3em 0.4em;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
    
    .card--season-complete div {
        color: #ffffff;
    }
    
    .card--season-progress div {
        color: #000000;
    }
    
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;
    }
    
    @media (max-width: 768px) {
        .card--season-complete div,
        .card--season-progress div {
            font-size: 0.95em;
            padding: 0.22em 0.5em;
        }
    }
    `;
    document.head.appendChild(style);

    // === ДОПОМІЖНІ ФУНКЦІЇ ===

    // Поліфіл для Object.assign для старих браузерів
    if (typeof Object.assign != 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }

    // Проста функція для HTTP запитів (замість fetch)
    function makeRequest(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 10000;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        callback(null, data);
                    } catch (e) {
                        callback(e, null);
                    }
                } else {
                    callback(new Error('Request failed with status: ' + xhr.status), null);
                }
            }
        };
        xhr.onerror = function() {
            callback(new Error('Network error'), null);
        };
        xhr.ontimeout = function() {
            callback(new Error('Request timeout'), null);
        };
        xhr.send();
    }

    // Кешування даних
    var cache = {};

    function setCache(key, data) {
        cache[key] = {
            data: data,
            timestamp: Date.now()
        };
    }

    function getCache(key) {
        var cached = cache[key];
        if (cached && (Date.now() - cached.timestamp) < CONFIG.cacheTime) {
            return cached.data;
        }
        return null;
    }

    // Отримання ID серіалу з URL картки
    function getSeriesIdFromCard(card) {
        try {
            var link = card.querySelector('a[href*="/series/"]');
            if (link) {
                var href = link.getAttribute('href');
                var match = href.match(/\/series\/(\d+)/);
                return match ? match[1] : null;
            }
        } catch (e) {
            console.error('Error getting series ID:', e);
        }
        return null;
    }

    // Отримання інформації про серіал з TMDB
    function getSeriesInfo(seriesId, callback) {
        var cacheKey = 'series_' + seriesId;
        var cachedData = getCache(cacheKey);
        
        if (cachedData) {
            callback(null, cachedData);
            return;
        }

        var url = 'https://api.themoviedb.org/3/tv/' + seriesId + 
                 '?api_key=' + CONFIG.tmdbApiKey + 
                 '&language=' + CONFIG.language + 
                 '&append_to_response=season';

        makeRequest(url, function(error, data) {
            if (error) {
                callback(error, null);
                return;
            }
            setCache(cacheKey, data);
            callback(null, data);
        });
    }

    // Аналіз статусу сезону
    function analyzeSeasonStatus(season) {
        var currentDate = new Date();
        var airDate = season.air_date ? new Date(season.air_date) : null;
        
        if (!airDate) {
            return { status: 'unknown', progress: 0 };
        }

        // Якщо дата виходу в майбутньому
        if (airDate > currentDate) {
            return { status: 'upcoming', progress: 0 };
        }

        // Перевірка чи всі серії вийшли
        var totalEpisodes = season.episode_count || 0;
        var airedEpisodes = season.episodes ? season.episodes.filter(function(ep) {
            var epAirDate = ep.air_date ? new Date(ep.air_date) : null;
            return epAirDate && epAirDate <= currentDate;
        }).length : 0;

        var progress = totalEpisodes > 0 ? (airedEpisodes / totalEpisodes) * 100 : 0;

        if (progress >= 100) {
            return { status: 'complete', progress: 100 };
        } else if (progress > 0) {
            return { status: 'progress', progress: Math.round(progress) };
        } else {
            return { status: 'unknown', progress: 0 };
        }
    }

    // Створення мітки сезону
    function createSeasonBadge(seasonData, seasonNumber) {
        var analysis = analyzeSeasonStatus(seasonData);
        
        if (analysis.status === 'unknown' || analysis.status === 'upcoming') {
            return null;
        }

        var badge = document.createElement('div');
        var badgeText = document.createElement('div');

        if (analysis.status === 'complete') {
            badge.className = 'card--season-complete';
            badgeText.innerHTML = '✓ Сезон ' + seasonNumber + ' завершено';
        } else if (analysis.status === 'progress') {
            badge.className = 'card--season-progress';
            badgeText.innerHTML = '↻ Сезон ' + seasonNumber + ' - ' + analysis.progress + '%';
        }

        badge.appendChild(badgeText);
        return badge;
    }

    // Обробка окремої картки
    function processCard(card) {
        try {
            // Перевірка чи картка вже оброблена
            if (card.getAttribute('data-season-processed') === 'true') {
                return;
            }

            var seriesId = getSeriesIdFromCard(card);
            if (!seriesId) {
                return;
            }

            getSeriesInfo(seriesId, function(error, seriesData) {
                if (error || !seriesData || !seriesData.seasons) {
                    return;
                }

                // Знаходимо останній сезон (найвищий номер)
                var latestSeason = null;
                var highestNumber = -1;
                
                for (var i = 0; i < seriesData.seasons.length; i++) {
                    var season = seriesData.seasons[i];
                    if (season.season_number > highestNumber && season.season_number > 0) {
                        highestNumber = season.season_number;
                        latestSeason = season;
                    }
                }

                if (!latestSeason) {
                    return;
                }

                var badge = createSeasonBadge(latestSeason, latestSeason.season_number);
                if (badge) {
                    card.style.position = 'relative';
                    card.appendChild(badge);
                    
                    // Плавне з'явлення мітки
                    setTimeout(function() {
                        badge.classList.add('show');
                    }, 100);
                }

                card.setAttribute('data-season-processed', 'true');
            });

        } catch (e) {
            console.error('Error processing card:', e);
        }
    }

    // Основний спостерігач за DOM
    function initPlugin() {
        if (!CONFIG.enabled) {
            return;
        }

        function processAllCards() {
            var cards = document.querySelectorAll('.card, .movie-card, .series-card');
            for (var i = 0; i < cards.length; i++) {
                processCard(cards[i]);
            }
        }

        // Спостерігач за змінами DOM
        var observer = new MutationObserver(function(mutations) {
            var shouldProcess = false;
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldProcess = true;
                    break;
                }
            }
            if (shouldProcess) {
                setTimeout(processAllCards, 500);
            }
        });

        // Запуск обробки при завантаженні
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(processAllCards, 1000);
                observer.observe(document.body, { childList: true, subtree: true });
            });
        } else {
            setTimeout(processAllCards, 1000);
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Додаткова обробка при прокрутці
        var scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(processAllCards, 300);
        });
    }

    // Запуск плагіна
    initPlugin();

})();
