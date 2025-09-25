(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    var CONFIG = {
        tmdbApiKey: '4ef0d7355d9ffb5151e987764708ce96',
        cacheTime: 24 * 60 * 60 * 1000,
        enabled: true,
        language: 'uk'
    };

    // Стилі
    var style = document.createElement('style');
    style.textContent = "\
    .card--season-complete, .card--season-progress {\
        position: absolute;\
        left: 0;\
        bottom: 0.50em;\
        z-index: 12;\
        width: fit-content;\
        max-width: calc(100% - 1em);\
        border-radius: 0 0.8em 0.8em 0em;\
        overflow: hidden;\
        opacity: 0;\
        transition: opacity 0.22s ease-in-out;\
    }\
    .card--season-complete { background-color: rgba(61, 161, 141, 0.8); }\
    .card--season-progress { background-color: rgba(255, 193, 7, 0.8); }\
    .card--season-complete div, .card--season-progress div {\
        text-transform: uppercase;\
        font-family: Arial, sans-serif;\
        font-weight: 700;\
        font-size: 1.05em;\
        padding: 0.3em 0.4em;\
        white-space: nowrap;\
        display: flex;\
        align-items: center;\
        gap: 4px;\
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);\
    }\
    .card--season-complete div { color: #fff; }\
    .card--season-progress div { color: #000; }\
    .card--season-complete.show, .card--season-progress.show { opacity: 1; }";
    document.head.appendChild(style);

    var cache = {};

    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }
            if (!CONFIG.tmdbApiKey) {
                return reject(new Error('Немає API ключа TMDB'));
            }

            var url = "https://api.themoviedb.org/3/tv/" + tmdbId + "?api_key=" + CONFIG.tmdbApiKey + "&language=" + CONFIG.language;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            cache[tmdbId] = { data: data, timestamp: Date.now() };
                            resolve(data);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("TMDB помилка: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function () { reject(new Error("Помилка мережі")); };
            xhr.send();
        });
    }

    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = null;
        for (var i = 0; i < tmdbData.seasons.length; i++) {
            if (tmdbData.seasons[i].season_number === lastEpisode.season_number && tmdbData.seasons[i].season_number > 0) {
                currentSeason = tmdbData.seasons[i];
                break;
            }
        }
        if (!currentSeason) return false;

        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;

        return {
            seasonNumber: lastEpisode.season_number,
            airedEpisodes: airedEpisodes,
            totalEpisodes: totalEpisodes,
            isComplete: airedEpisodes >= totalEpisodes
        };
    }

    function createBadge(content, isComplete, loading) {
        var badge = document.createElement('div');
        badge.className = (isComplete ? 'card--season-complete' : 'card--season-progress') + (loading ? ' loading' : '');
        badge.innerHTML = "<div>" + content + "</div>";
        return badge;
    }

    function adjustBadgePosition(cardEl, badge) {
        var quality = cardEl.querySelector('.card__quality');
        if (quality && badge) {
            var qHeight = quality.offsetHeight;
            var qBottom = parseFloat(getComputedStyle(quality).bottom) || 0;
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else if (badge) {
            badge.style.bottom = '0.50em';
        }
    }

    function updateBadgePositions(cardEl) {
        var badges = cardEl.querySelectorAll('.card--season-complete, .card--season-progress');
        for (var i = 0; i < badges.length; i++) {
            adjustBadgePosition(cardEl, badges[i]);
        }
    }

    var qualityObserver = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var mutation = mutations[i];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.classList && node.classList.contains('card__quality')) {
                        var cardEl = node.closest('.card');
                        if (cardEl) {
                            setTimeout(function(card) {
                                return function() { updateBadgePositions(card); };
                            }(cardEl), 100);
                        }
                    }
                }
            }
            if (mutation.removedNodes) {
                for (var k = 0; k < mutation.removedNodes.length; k++) {
                    var node2 = mutation.removedNodes[k];
                    if (node2.classList && node2.classList.contains('card__quality')) {
                        var cardEl2 = node2.closest('.card');
                        if (cardEl2) {
                            setTimeout(function(card) {
                                return function() { updateBadgePositions(card); };
                            }(cardEl2), 100);
                        }
                    }
                }
            }
        }
    });

    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (!cardEl.card_data) {
            requestAnimationFrame(function() { addSeasonBadge(cardEl); });
            return;
        }
        var data = cardEl.card_data;
        if (!(data && data.name)) return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        for (var i = 0; i < oldBadges.length; i++) {
            oldBadges[i].remove();
        }

        var badge = createBadge('...', false, true);
        view.appendChild(badge);
        adjustBadgePosition(cardEl, badge);

        try {
            qualityObserver.observe(view, { childList: true, subtree: true });
        } catch (e) {
            console.log('Помилка спостереження за мітками якості:', e);
        }

        cardEl.setAttribute('data-season-processed', 'loading');

        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                var progressInfo = getSeasonProgress(tmdbData);
                if (progressInfo) {
                    var content = progressInfo.isComplete ?
                        "S" + progressInfo.seasonNumber + " ✓" :
                        "S" + progressInfo.seasonNumber + " " + progressInfo.airedEpisodes + "/" + progressInfo.totalEpisodes;
                    badge.className = progressInfo.isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = "<div>" + content + "</div>";
                    adjustBadgePosition(cardEl, badge);
                    setTimeout(function() {
                        badge.classList.add('show');
                        adjustBadgePosition(cardEl, badge);
                    }, 50);
                    cardEl.setAttribute('data-season-processed', progressInfo.isComplete ? 'complete' : 'in-progress');
                } else {
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'error');
                }
            })
            .catch(function(error) {
                console.log('SeasonBadgePlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    function initPlugin() {
        if (!CONFIG.enabled) return;
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                if (mutation.addedNodes) {
                    for (var j = 0; j < mutation.addedNodes.length; j++) {
                        var node = mutation.addedNodes[j];
                        if (node.nodeType !== 1) continue;
                        if (node.classList && node.classList.contains('card')) {
                            addSeasonBadge(node);
                        }
                        if (node.querySelectorAll) {
                            var cards = node.querySelectorAll('.card');
                            for (var k = 0; k < cards.length; k++) {
                                addSeasonBadge(cards[k]);
                            }
                        }
                    }
                }
            }
        });

        if (containers.length > 0) {
            for (var i = 0; i < containers.length; i++) {
                try {
                    observer.observe(containers[i], { childList: true, subtree: true });
                } catch (e) {
                    console.log('Помилка спостереження за контейнером:', e);
                }
            }
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        var cardsInit = document.querySelectorAll('.card:not([data-season-processed])');
        for (var i = 0; i < cardsInit.length; i++) {
            (function(card, delay) {
                setTimeout(function() { addSeasonBadge(card); }, delay);
            })(cardsInit[i], i * 300);
        }
    }

    setTimeout(initPlugin, 2000);

})();