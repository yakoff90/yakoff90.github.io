/**
 * UA-Finder для Samsung TV - спрощена, але повнофункціональна версія
 */

(function() {
    'use strict';
    
    // ===================== КОНФІГУРАЦІЯ =====================
    var LTF_CONFIG = {
        CACHE_VERSION: 4,
        CACHE_KEY: 'lampa_ukr_tracks_cache_tv',
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000,
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        DISPLAY_MODE: 'flag_count',
        SHOW_TRACKS_FOR_TV_SERIES: true,
        PROXY_LIST: [
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        MANUAL_OVERRIDES: {
            '207703': { track_count: 1 },
            '1195518': { track_count: 2 },
            '215995': { track_count: 2 },
            '1234821': { track_count: 2 },
            '933260': { track_count: 3 },
            '245827': { track_count: 0 }
        }
    };
    
    window.LTF_CONFIG = LTF_CONFIG;
    
    // ===================== СТИЛІ =====================
    var styleElement = document.createElement('style');
    styleElement.innerHTML = '' +
        '.card__tracks {' +
        'position: absolute !important;' +
        'right: 0.3em !important;' +
        'top: 0.3em !important;' +
        'background: rgba(0,0,0,0.7) !important;' +
        'color: #FFFFFF !important;' +
        'font-size: 1.2em !important;' +
        'padding: 0.15em 0.4em !important;' +
        'border-radius: 0.8em !important;' +
        'font-weight: 700 !important;' +
        'z-index: 20 !important;' +
        'min-width: 3em !important;' +
        'text-align: center !important;' +
        'border: 1px solid rgba(255,255,255,0.3) !important;' +
        '}' +
        '.card__tracks.positioned-below-rating {' +
        'top: 1.85em !important;' +
        '}' +
        '.card__tracks .flag {' +
        'display: inline-block;' +
        'width: 1.3em;' +
        'height: 0.7em;' +
        'background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%);' +
        'border-radius: 2px;' +
        'margin-right: 3px;' +
        'vertical-align: middle;' +
        'box-shadow: 0 0 2px 0 rgba(0,0,0,0.7);' +
        '}';
    document.head.appendChild(styleElement);
    
    // ===================== УТІЛІТИ =====================
    function getCardType(cardData) {
        var type = cardData.type || cardData.media_type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name ? 'tv' : 'movie';
    }
    
    function countUkrainianTracks(title) {
        if (!title) return 0;
        var cleanTitle = title.toLowerCase();
        
        var subIndex = cleanTitle.indexOf('sub');
        if (subIndex !== -1) {
            cleanTitle = cleanTitle.substring(0, subIndex);
        }
        
        var multiMatch = cleanTitle.match(/(\d+)x\s*ukr/);
        if (multiMatch) return parseInt(multiMatch[1], 10);
        
        var singleMatches = cleanTitle.match(/\bukr\b/g);
        return singleMatches ? singleMatches.length : 0;
    }
    
    function formatTrackLabel(count) {
        if (!count || count === 0) return '';
        
        var flagHTML = '<span class="flag"></span>';
        
        switch (LTF_CONFIG.DISPLAY_MODE) {
            case 'flag_only':
                return flagHTML;
            case 'flag_count':
                return count === 1 ? flagHTML : count + 'x' + flagHTML;
            case 'text':
            default:
                return count === 1 ? 'Ukr' : count + 'xUkr';
        }
    }
    
    // ===================== МЕРЕЖА =====================
    function fetchWithProxy(url, callback) {
        var proxyIndex = 0;
        var maxAttempts = 2;
        var attempts = 0;
        
        function tryRequest() {
            if (attempts >= maxAttempts) {
                callback(new Error('Не вдалося отримати дані'));
                return;
            }
            
            var proxyUrl = LTF_CONFIG.PROXY_LIST[proxyIndex] + encodeURIComponent(url);
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        callback(null, xhr.responseText);
                    } else {
                        attempts++;
                        proxyIndex = (proxyIndex + 1) % LTF_CONFIG.PROXY_LIST.length;
                        setTimeout(tryRequest, 1000);
                    }
                }
            };
            
            xhr.ontimeout = function() {
                attempts++;
                proxyIndex = (proxyIndex + 1) % LTF_CONFIG.PROXY_LIST.length;
                setTimeout(tryRequest, 1000);
            };
            
            xhr.timeout = 5000;
            xhr.open('GET', proxyUrl, true);
            
            try {
                xhr.send();
            } catch(e) {
                attempts++;
                proxyIndex = (proxyIndex + 1) % LTF_CONFIG.PROXY_LIST.length;
                setTimeout(tryRequest, 1000);
            }
        }
        
        tryRequest();
    }
    
    // ===================== КЕШ =====================
    function getTracksCache(key) {
        try {
            var cache = JSON.parse(localStorage.getItem(LTF_CONFIG.CACHE_KEY) || '{}');
            var item = cache[key];
            if (item && Date.now() - item.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS) {
                return item;
            }
        } catch(e) {}
        return null;
    }
    
    function saveTracksCache(key, data) {
        try {
            var cache = JSON.parse(localStorage.getItem(LTF_CONFIG.CACHE_KEY) || '{}');
            cache[key] = {
                track_count: data.track_count || 0,
                timestamp: Date.now()
            };
            localStorage.setItem(LTF_CONFIG.CACHE_KEY, JSON.stringify(cache));
        } catch(e) {}
    }
    
    // ===================== ПОШУК =====================
    function searchForTracks(normalizedCard, callback) {
        if (!normalizedCard.release_date) {
            callback(null);
            return;
        }
        
        var yearMatch = normalizedCard.release_date.match(/\d{4}/);
        if (!yearMatch) {
            callback(null);
            return;
        }
        
        var year = yearMatch[0];
        var userId = '';
        try {
            userId = Lampa.Storage ? Lampa.Storage.get('lampac_unic_id', '') : '';
        } catch(e) {}
        
        var apiUrl = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + 
                     '/api/v1.0/torrents?search=' + encodeURIComponent(normalizedCard.title) +
                     '&year=' + year + '&uid=' + userId;
        
        fetchWithProxy(apiUrl, function(error, data) {
            if (error || !data) {
                callback(null);
                return;
            }
            
            try {
                var torrents = JSON.parse(data);
                if (!Array.isArray(torrents)) {
                    callback(null);
                    return;
                }
                
                var bestCount = 0;
                
                for (var i = 0; i < torrents.length; i++) {
                    var torrent = torrents[i];
                    var torrentTitle = (torrent.title || '').toLowerCase();
                    
                    // Фільтр фільм/серіал
                    var isSeries = /(сезон|season|s\d|серії|episodes)/.test(torrentTitle);
                    if (normalizedCard.type === 'movie' && isSeries) continue;
                    if (normalizedCard.type === 'tv' && !isSeries) continue;
                    
                    var count = countUkrainianTracks(torrent.title);
                    if (count > bestCount) {
                        bestCount = count;
                    }
                }
                
                if (bestCount > 0) {
                    callback({ track_count: bestCount });
                } else {
                    callback(null);
                }
            } catch(e) {
                callback(null);
            }
        });
    }
    
    // ===================== ВІДОБРАЖЕННЯ =====================
    function updateCardBadge(cardElement, trackCount) {
        var cardView = cardElement.querySelector('.card__view');
        if (!cardView) return;
        
        var existingBadge = cardView.querySelector('.card__tracks');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        if (!trackCount || trackCount === 0) return;
        
        var badgeText = formatTrackLabel(trackCount);
        if (!badgeText) return;
        
        var badge = document.createElement('div');
        badge.className = 'card__tracks';
        badge.innerHTML = badgeText;
        
        // Позиціонування відносно рейтингу
        var rating = cardElement.querySelector('.card__vote');
        if (rating) {
            var ratingTop = parseInt(window.getComputedStyle(rating).top || '0');
            if (ratingTop < 50) {
                badge.classList.add('positioned-below-rating');
            }
        }
        
        cardView.appendChild(badge);
    }
    
    // ===================== ОБРОБКА КАРТОК =====================
    function processCard(cardElement) {
        if (!cardElement || !cardElement.card_data) return;
        
        var cardData = cardElement.card_data;
        var cardId = cardData.id || '';
        var cardType = getCardType(cardData);
        
        if (cardType === 'tv' && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) {
            return;
        }
        
        // Перевірка ручних перевизначень
        var manual = LTF_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manual) {
            updateCardBadge(cardElement, manual.track_count);
            return;
        }
        
        var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + cardType + '_' + cardId;
        var cached = getTracksCache(cacheKey);
        
        if (cached) {
            updateCardBadge(cardElement, cached.track_count);
        } else {
            var normalizedCard = {
                id: cardId,
                title: cardData.title || cardData.name || '',
                type: cardType,
                release_date: cardData.release_date || cardData.first_air_date || ''
            };
            
            searchForTracks(normalizedCard, function(result) {
                var trackCount = result ? result.track_count : 0;
                saveTracksCache(cacheKey, { track_count: trackCount });
                updateCardBadge(cardElement, trackCount);
            });
        }
    }
    
    // ===================== СПОСТЕРІГАЧ =====================
    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var addedNodes = mutations[i].addedNodes;
            for (var j = 0; j < addedNodes.length; j++) {
                var node = addedNodes[j];
                if (node.nodeType === 1) {
                    if (node.classList && node.classList.contains('card')) {
                        setTimeout(function(card) {
                            return function() {
                                processCard(card);
                            };
                        }(node), 100);
                    }
                    
                    var cards = node.querySelectorAll('.card');
                    for (var k = 0; k < cards.length; k++) {
                        (function(card) {
                            setTimeout(function() {
                                processCard(card);
                            }, 100);
                        })(cards[k]);
                    }
                }
            }
        }
    });
    
    // ===================== ІНІЦІАЛІЗАЦІЯ =====================
    function initializePlugin() {
        console.log('UA-Finder: Ініціалізація для Samsung TV');
        
        // Спостерігаємо за змінами в DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Обробляємо існуючі картки
        setTimeout(function() {
            var cards = document.querySelectorAll('.card');
            for (var i = 0; i < cards.length; i++) {
                (function(card) {
                    setTimeout(function() {
                        if (card.card_data) {
                            processCard(card);
                        }
                    }, 200 + (i * 50));
                })(cards[i]);
            }
        }, 1000);
    }
    
    // ===================== НАЛАШТУВАННЯ =====================
    function initSettings() {
        if (!Lampa || !Lampa.SettingsApi) return;
        
        var SETTINGS_KEY = 'ltf_tv_settings';
        var settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"mode":"flag_count","showTv":true}');
        
        // Застосовуємо налаштування
        LTF_CONFIG.DISPLAY_MODE = settings.mode;
        LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES = settings.showTv;
        
        // Додаємо пункт у налаштування
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { type: 'button', component: 'ltf' },
            field: { name: 'Мітки "UA" доріжок', description: 'Налаштування українських доріжок' },
            onChange: function() {
                Lampa.Settings.create('ltf', {
                    template: '<div></div>',
                    onBack: function() {
                        Lampa.Settings.create('interface');
                    }
                });
            }
        });
        
        // Додаємо підменю
        Lampa.SettingsApi.addParam({
            component: 'ltf',
            param: {
                name: 'ltf_mode',
                type: 'select',
                values: {
                    'text': 'Текст ("Ukr", "2xUkr")',
                    'flag_count': 'Прапорець з лічильником',
                    'flag_only': 'Лише прапорець'
                },
                default: settings.mode
            },
            field: { name: 'Стиль мітки' },
            onChange: function(v) {
                settings.mode = v;
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                LTF_CONFIG.DISPLAY_MODE = v;
                updateAllBadges();
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'ltf',
            param: {
                name: 'ltf_show_tv',
                type: 'select',
                values: { 'true': 'Увімкнено', 'false': 'Вимкнено' },
                default: String(settings.showTv)
            },
            field: { name: 'Показувати для серіалів' },
            onChange: function(v) {
                settings.showTv = v === 'true';
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES = settings.showTv;
                updateAllBadges();
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'ltf',
            param: { type: 'button' },
            field: { name: 'Очистити кеш' },
            onChange: function() {
                localStorage.removeItem(LTF_CONFIG.CACHE_KEY);
                if (Lampa.Noty) {
                    Lampa.Noty('Кеш очищено');
                }
                updateAllBadges();
            }
        });
    }
    
    function updateAllBadges() {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
            processCard(cards[i]);
        }
    }
    
    // ===================== ЗАПУСК =====================
    function startPlugin() {
        // Чекаємо готовності Lampa
        if (typeof Lampa === 'undefined') {
            setTimeout(startPlugin, 500);
            return;
        }
        
        // Запускаємо основний плагін
        setTimeout(initializePlugin, 1000);
        
        // Ініціалізуємо налаштування
        setTimeout(initSettings, 2000);
    }
    
    // Запускаємо при завантаженні сторінки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPlugin);
    } else {
        setTimeout(startPlugin, 1000);
    }
    
})();
