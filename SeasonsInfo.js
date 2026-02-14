(function() {
    'use strict';
    
    // Захист від повторного запуску
    if (window.SeasonBadgeInstalled) return;
    window.SeasonBadgeInstalled = true;
    
    // ===== ПРОСТІ ПОЛІФІЛИ ДЛЯ SAMSUNG TV =====
    if (!window.Promise) {
        window.Promise = function(executor) {
            var callbacks = [];
            
            function resolve(value) {
                setTimeout(function() {
                    callbacks.forEach(function(cb) { cb(value); });
                }, 0);
            }
            
            executor(resolve, function() {});
            
            return {
                then: function(cb) {
                    callbacks.push(cb);
                    return this;
                }
            };
        };
    }
    
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(selector) {
            var el = this;
            while (el) {
                if (el.matches && el.matches(selector)) return el;
                el = el.parentElement;
            }
            return null;
        };
    }
    
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.webkitMatchesSelector || 
                                   Element.prototype.msMatchesSelector ||
                                   function(s) {
                                       var matches = (this.document || this.ownerDocument).querySelectorAll(s);
                                       var i = matches.length;
                                       while (i-- >= 0 && matches.item(i) !== this) {}
                                       return i > -1;
                                   };
    }
    
    // ===== НАЛАШТУВАННЯ =====
    var CONFIG = {
        apiKey: '',
        cacheTime: 86400000, // 24 години
        language: 'uk'
    };
    
    // ===== КЕШ =====
    var cache = {};
    try {
        var saved = localStorage.getItem('season_cache');
        if (saved) cache = JSON.parse(saved) || {};
    } catch(e) {}
    
    // ===== ОСНОВНІ ФУНКЦІЇ =====
    function getSeriesInfo(tmdbId, callback) {
        // Перевіряємо кеш
        var now = Date.now();
        if (cache[tmdbId] && (now - cache[tmdbId].time < CONFIG.cacheTime)) {
            callback(cache[tmdbId].data);
            return;
        }
        
        // Запит до TMDB
        var url = 'https://api.themoviedb.org/3/tv/' + tmdbId + 
                  '?api_key=' + CONFIG.apiKey + 
                  '&language=' + CONFIG.language;
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    
                    // Зберігаємо в кеш
                    cache[tmdbId] = {
                        data: data,
                        time: now
                    };
                    try {
                        localStorage.setItem('season_cache', JSON.stringify(cache));
                    } catch(e) {}
                    
                    callback(data);
                } catch(e) {}
            }
        };
        xhr.send();
    }
    
    function getSeasonText(data) {
        if (!data || !data.last_episode_to_air || !data.seasons) return null;
        
        var lastEp = data.last_episode_to_air;
        var seasonNum = lastEp.season_number;
        var airedEp = lastEp.episode_number;
        
        // Знаходимо сезон
        var season = null;
        for (var i = 0; i < data.seasons.length; i++) {
            if (data.seasons[i].season_number === seasonNum) {
                season = data.seasons[i];
                break;
            }
        }
        
        if (!season) return null;
        
        var totalEp = season.episode_count || 0;
        
        // Формуємо текст
        if (airedEp >= totalEp) {
            return 'S' + seasonNum; // Завершений
        } else {
            return 'S' + seasonNum + ' ' + airedEp + '/' + totalEp; // В процесі
        }
    }
    
    // ===== СТВОРЕННЯ МІТКИ =====
    function createBadge(text) {
        var badge = document.createElement('div');
        badge.style.cssText = 
            'position: absolute;' +
            'left: 5px;' +
            'bottom: 35px;' +
            'background-color: ' + (text.indexOf('/') > 0 ? '#ff4444' : '#3da18d') + ';' +
            'color: white;' +
            'padding: 4px 8px;' +
            'border-radius: 4px;' +
            'font-size: 12px;' +
            'font-weight: bold;' +
            'z-index: 100;' +
            'text-transform: uppercase;' +
            'box-shadow: 1px 1px 2px rgba(0,0,0,0.5);' +
            'pointer-events: none;' +
            'opacity: 0;' +
            'transition: opacity 0.2s;';
        badge.textContent = text;
        return badge;
    }
    
    // ===== ОБРОБКА КАРТКИ =====
    function processCard(card) {
        // Перевіряємо чи вже оброблено
        if (card._seasonProcessed) return;
        card._seasonProcessed = true;
        
        // Отримуємо дані картки
        var data = card.card_data;
        if (!data) {
            setTimeout(function() { processCard(card); }, 500);
            return;
        }
        
        // Тільки для серіалів
        if (!data.name && !data.first_air_date) return;
        if (!data.id) return;
        
        // Знаходимо контейнер для мітки
        var view = card.querySelector('.card__view');
        if (!view) return;
        
        // Видаляємо старі мітки
        var old = view.querySelector('.season-badge');
        if (old) old.remove();
        
        // Додаємо тимчасову мітку
        var loadingBadge = createBadge('...');
        loadingBadge.className = 'season-badge';
        view.appendChild(loadingBadge);
        
        // Показуємо через невелику затримку
        setTimeout(function() { loadingBadge.style.opacity = '1'; }, 10);
        
        // Отримуємо дані
        getSeriesInfo(data.id, function(seriesData) {
            var text = getSeasonText(seriesData);
            
            if (text) {
                // Замінюємо на постійну мітку
                var newBadge = createBadge(text);
                newBadge.className = 'season-badge';
                view.replaceChild(newBadge, loadingBadge);
                setTimeout(function() { newBadge.style.opacity = '1'; }, 10);
            } else {
                // Якщо немає даних - прибираємо
                loadingBadge.remove();
            }
        });
    }
    
    // ===== ПОШУК НОВИХ КАРТОК =====
    function scanForCards() {
        var cards = document.querySelectorAll('.card:not([data-season-checked])');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.setAttribute('data-season-checked', 'true');
            
            // Невелика затримка для кожної картки
            setTimeout(function(c) {
                return function() { processCard(c); };
            }(card), i * 200);
        }
    }
    
    // ===== НАЛАШТУВАННЯ =====
    function setupSettings() {
        if (!window.Lampa || !Lampa.SettingsApi) return;
        
        try {
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { type: 'button', component: 'season_settings' },
                field: { name: 'Мітки сезонів', description: 'Налаштування відображення міток' },
                onChange: function() {
                    Lampa.Settings.create('season_settings', {
                        template: 'season_settings',
                        onBack: function() { Lampa.Settings.create('interface'); }
                    });
                }
            });
            
            Lampa.Template.add('season_settings', '<div></div>');
            
            Lampa.SettingsApi.addParam({
                component: 'season_settings',
                param: { name: 'season_api_key', type: 'input', values: '', default: CONFIG.apiKey },
                field: { name: 'TMDB API ключ', description: 'Введіть ваш API ключ' },
                onChange: function(v) {
                    CONFIG.apiKey = String(v || '').trim();
                    try { localStorage.setItem('season_api_key', CONFIG.apiKey); } catch(e) {}
                }
            });
            
            Lampa.SettingsApi.addParam({
                component: 'season_settings',
                param: { type: 'button', component: 'season_clear_cache' },
                field: { name: 'Очистити кеш' },
                onChange: function() {
                    cache = {};
                    try { localStorage.removeItem('season_cache'); } catch(e) {}
                    if (Lampa.Noty) Lampa.Noty('Кеш очищено');
                }
            });
        } catch(e) {}
    }
    
    // ===== ЗАВАНТАЖЕННЯ ЗБЕРЕЖЕНИХ НАЛАШТУВАНЬ =====
    function loadSettings() {
        try {
            var saved = localStorage.getItem('season_api_key');
            if (saved) CONFIG.apiKey = saved;
        } catch(e) {}
    }
    
    // ===== ЗАПУСК =====
    function start() {
        loadSettings();
        setupSettings();
        
        // Постійно скануємо нові картки
        scanForCards();
        setInterval(scanForCards, 2000);
        
        // Скануємо при прокрутці
        var containers = document.querySelectorAll('.scroll__content, .content, .cards');
        for (var i = 0; i < containers.length; i++) {
            containers[i].addEventListener('scroll', function() {
                setTimeout(scanForCards, 100);
            });
        }
        
        // Скануємо при зміні контенту (простий спосіб без MutationObserver)
        document.addEventListener('click', function() {
            setTimeout(scanForCards, 500);
        });
    }
    
    // Очікуємо готовності Lampa
    if (window.appready) {
        setTimeout(start, 1000);
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') setTimeout(start, 1000);
        });
    } else {
        setTimeout(start, 3000);
    }
    
})();
