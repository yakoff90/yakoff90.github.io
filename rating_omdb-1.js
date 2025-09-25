(function() {
    'use strict';

    if (window.RatingOmdbPlugin && window.RatingOmdbPlugin.__initialized) return;
    window.RatingOmdbPlugin = window.RatingOmdbPlugin || {};
    window.RatingOmdbPlugin.__initialized = true;

    // --- Стилі ---
    var style = document.createElement('style');
    style.textContent = "\
    .card--rating {\
        position: absolute;\
        right: 0;\
        top: 0.50em;\
        z-index: 12;\
        background-color: rgba(0,0,0,0.65);\
        border-radius: 0.8em 0 0 0.8em;\
        overflow: hidden;\
        opacity: 0;\
        transition: opacity 0.22s ease-in-out;\
        padding: 0.2em 0.6em;\
        font-size: 1em;\
        font-family: Arial, sans-serif;\
        font-weight: 700;\
        color: #fff;\
        display: flex;\
        align-items: center;\
        gap: 4px;\
    }\
    .card--rating.show { opacity: 1; }";
    document.head.appendChild(style);

    var CONFIG = {
        apiKey: '4ef0d7355d9ffb5151e987764708ce96',
        enabled: true
    };

    function fetchRating(imdbId) {
        return new Promise(function(resolve, reject) {
            if (!imdbId) return reject(new Error("Немає IMDb ID"));
            var url = "https://www.omdbapi.com/?i=" + imdbId + "&apikey=" + CONFIG.apiKey;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            resolve(data);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("OMDb помилка: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function () { reject(new Error("Помилка мережі")); };
            xhr.send();
        });
    }

    function createBadge(content) {
        var badge = document.createElement('div');
        badge.className = 'card--rating';
        badge.innerHTML = content;
        return badge;
    }

    function addRatingBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-rating-processed')) return;
        if (!cardEl.card_data) {
            requestAnimationFrame(function() { addRatingBadge(cardEl); });
            return;
        }
        var data = cardEl.card_data;
        if (!(data && data.imdb_id)) return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        var oldBadges = view.querySelectorAll('.card--rating');
        for (var i = 0; i < oldBadges.length; i++) {
            oldBadges[i].remove();
        }

        var badge = createBadge('⭐ ...');
        view.appendChild(badge);
        cardEl.setAttribute('data-rating-processed', 'loading');

        fetchRating(data.imdb_id)
            .then(function(apiData) {
                if (apiData && apiData.imdbRating) {
                    var content = "⭐ " + apiData.imdbRating;
                    badge.innerHTML = content;
                    setTimeout(function() { badge.classList.add('show'); }, 50);
                    cardEl.setAttribute('data-rating-processed', 'complete');
                } else {
                    badge.remove();
                    cardEl.setAttribute('data-rating-processed', 'error');
                }
            })
            .catch(function(error) {
                console.log('RatingOmdbPlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-rating-processed', 'error');
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
                            addRatingBadge(node);
                        }
                        if (node.querySelectorAll) {
                            var cards = node.querySelectorAll('.card');
                            for (var k = 0; k < cards.length; k++) {
                                addRatingBadge(cards[k]);
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

        var cardsInit = document.querySelectorAll('.card:not([data-rating-processed])');
        for (var i = 0; i < cardsInit.length; i++) {
            (function(card, delay) {
                setTimeout(function() { addRatingBadge(card); }, delay);
            })(cardsInit[i], i * 300);
        }
    }

    setTimeout(initPlugin, 2000);

})();