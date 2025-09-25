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
    style.textContent = `
    .card--season-complete, .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    .card--season-complete { background-color: rgba(61, 161, 141, 0.8); }
    .card--season-progress { background-color: rgba(255, 193, 7, 0.8); }
    .card--season-complete div, .card--season-progress div {
        text-transform: uppercase;
        font-family: Arial, sans-serif;
        font-weight: 700;
        font-size: 1.05em;
        padding: 0.3em 0.4em;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
    .card--season-complete div { color: #fff; }
    .card--season-progress div { color: #000; }
    .card--season-complete.show, .card--season-progress.show { opacity: 1; }
    `;
    document.head.appendChild(style);

    // Кеш у пам’яті
    var cache = {};

    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }
            if (!CONFIG.tmdbApiKey) {
                return reject(new Error('Немає API ключа TMDB'));
            }

            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
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
        var currentSeason = tmdbData.seasons.find(s => s.season_number === lastEpisode.season_number && s.season_number > 0);
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
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    function adjustBadgePosition(cardEl, badge) {
        let quality = cardEl.querySelector('.card__quality');
        if (quality && badge) {
            let qHeight = quality.offsetHeight;
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0;
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else if (badge) {
            badge.style.bottom = '0.50em';
        }
    }

    function updateBadgePositions(cardEl) {
        var badges = cardEl.querySelectorAll('.card--season-complete, .card--season-progress');
        badges.forEach(function(badge) {
            adjustBadgePosition(cardEl, badge);
        });
    }

    var qualityObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.classList && node.classList.contains('card__quality')) {
                    var cardEl = node.closest('.card');
                    if (cardEl) {
                        setTimeout(() => {
                            updateBadgePositions(cardEl);
                        }, 100);
                    }
                }
            });
            mutation.removedNodes?.forEach(function(node) {
                if (node.classList && node.classList.contains('card__quality')) {
                    var cardEl = node.closest('.card');
                    if (cardEl) {
                        setTimeout(() => {
                            updateBadgePositions(cardEl);
                        }, 100);
                    }
                }
            });
        });
    });

    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }
        var data = cardEl.card_data;
        if (!(data && data.name)) return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        oldBadges.forEach(function(b) { b.remove(); });

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
                        `S${progressInfo.seasonNumber} ✓` :
                        `S${progressInfo.seasonNumber} ${progressInfo.airedEpisodes}/${progressInfo.totalEpisodes}`;
                    badge.className = progressInfo.isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = `<div>${content}</div>`;
                    adjustBadgePosition(cardEl, badge);
                    setTimeout(() => {
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
            mutations.forEach(function(mutation) {
                mutation.addedNodes?.forEach(function(node) {
                    if (node.nodeType !== 1) return;
                    if (node.classList && node.classList.contains('card')) {
                        addSeasonBadge(node);
                    }
                    if (node.querySelectorAll) {
                        node.querySelectorAll('.card').forEach(addSeasonBadge);
                    }
                });
            });
        });

        if (containers.length > 0) {
            containers.forEach(container => {
                try {
                    observer.observe(container, { childList: true, subtree: true });
                } catch (e) {
                    console.log('Помилка спостереження за контейнером:', e);
                }
            });
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            setTimeout(() => addSeasonBadge(card), index * 300);
        });
    }

    // Запуск тільки через setTimeout (сумісність із Samsung TV)
    setTimeout(initPlugin, 2000);

})();