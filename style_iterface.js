// Samsung Tizen Interface Plugin v1.0
// Оптимізовано для GitHub та Samsung Tizen

(function() {
    'use strict';
    
    console.log('[Samsung Plugin] Ініціалізація...');
    
    // Перевірка на Tizen
    function isSamsungTizen() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('tizen') > -1 || 
               (ua.indexOf('samsung') > -1 && ua.indexOf('smarttv') > -1);
    }
    
    if (!isSamsungTizen()) {
        console.log('[Samsung Plugin] Тільки для Samsung Tizen');
        return;
    }
    
    // Чекаємо Lampa
    var checkLampa = setInterval(function() {
        if (window.Lampa && Lampa.Storage && Lampa.Utils) {
            clearInterval(checkLampa);
            startPlugin();
        }
    }, 500);
    
    function startPlugin() {
        try {
            // Конфігурація
            var config = {
                initialized: false,
                cache: {},
                elements: {},
                currentFocus: null,
                updateInterval: null
            };
            
            // Налаштування за замовчуванням
            function initSettings() {
                var defaults = {
                    'tiz_wide': 'true',
                    'tiz_bg': 'true',
                    'tiz_rating': 'true',
                    'tiz_genre': 'true',
                    'tiz_year': 'true',
                    'tiz_time': 'true',
                    'tiz_hide': 'true',
                    'tiz_color': 'true',
                    'tiz_init': 'true'
                };
                
                for (var key in defaults) {
                    if (!Lampa.Storage.get(key)) {
                        Lampa.Storage.set(key, defaults[key]);
                    }
                }
                
                return {
                    wide: Lampa.Storage.get('tiz_wide') === 'true',
                    bg: Lampa.Storage.get('tiz_bg') === 'true',
                    rating: Lampa.Storage.get('tiz_rating') === 'true',
                    genre: Lampa.Storage.get('tiz_genre') === 'true',
                    year: Lampa.Storage.get('tiz_year') === 'true',
                    time: Lampa.Storage.get('tiz_time') === 'true',
                    hide: Lampa.Storage.get('tiz_hide') === 'true',
                    color: Lampa.Storage.get('tiz_color') === 'true'
                };
            }
            
            // Додаємо стилі
            function addStyles() {
                var style = document.createElement('style');
                style.id = 'tizen-styles';
                
                var settings = config.settings;
                var css = `
                    .tiz-info {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: ${settings.wide ? '250px' : '200px'};
                        background: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.5));
                        padding: 20px 40px;
                        z-index: 9990;
                        display: none;
                    }
                    
                    .tiz-info.visible { display: block; }
                    
                    .tiz-title {
                        font-size: ${settings.wide ? '36px' : '30px'};
                        font-weight: bold;
                        color: white;
                        margin-bottom: 10px;
                    }
                    
                    .tiz-details {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin: 15px 0;
                        font-size: 18px;
                        color: rgba(255,255,255,0.9);
                    }
                    
                    .tiz-rating {
                        background: rgba(0,0,0,0.6);
                        padding: 5px 10px;
                        border-radius: 5px;
                    }
                    
                    .tiz-bg {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-size: cover;
                        background-position: center;
                        opacity: 0;
                        transition: opacity 1s;
                        z-index: -1;
                        filter: blur(20px) brightness(0.6);
                    }
                    
                    .tiz-bg.active { opacity: 0.5; }
                    
                    ${settings.hide ? `
                        .tiz-hide .card__title,
                        .tiz-hide .card__age {
                            display: none !important;
                        }
                    ` : ''}
                    
                    .card.focus {
                        transform: scale(1.05);
                        transition: transform 0.2s;
                    }
                `;
                
                style.textContent = css;
                document.head.appendChild(style);
                
                // Додаємо клас до body
                if (settings.wide) document.body.classList.add('tiz-wide');
                if (settings.hide) document.body.classList.add('tiz-hide');
            }
            
            // Створюємо елементи
            function createElements() {
                // Інфо панель
                var info = document.createElement('div');
                info.className = 'tiz-info';
                info.innerHTML = `
                    <div class="tiz-title"></div>
                    <div class="tiz-details"></div>
                `;
                
                // Фон
                var bg = document.createElement('div');
                bg.className = 'tiz-bg';
                
                document.body.appendChild(bg);
                document.body.appendChild(info);
                
                config.elements = {
                    info: info,
                    bg: bg,
                    title: info.querySelector('.tiz-title'),
                    details: info.querySelector('.tiz-details')
                };
            }
            
            // Оновлюємо інтерфейс
            function updateInterface() {
                try {
                    var focused = document.querySelector('.card.focus, .selector.focus .card');
                    if (!focused) {
                        hideInterface();
                        return;
                    }
                    
                    var data = getCardData(focused);
                    if (!data || data === config.currentFocus) return;
                    
                    config.currentFocus = data;
                    showInterface();
                    updateContent(data);
                    
                } catch(e) {
                    console.error('[Samsung Plugin] Update error:', e);
                }
            }
            
            // Оновлюємо контент
            function updateContent(data) {
                if (!config.elements.title) return;
                
                // Заголовок
                config.elements.title.textContent = data.title || data.name || '';
                
                // Деталі
                var details = [];
                
                // Рейтинг
                if (config.settings.rating && data.vote_average) {
                    var rating = parseFloat(data.vote_average).toFixed(1);
                    var color = config.settings.color ? getRatingColor(rating) : '';
                    details.push(`
                        <div class="tiz-rating" style="${color ? 'color:' + color : ''}">
                            ${rating} TMDB
                        </div>
                    `);
                }
                
                // Рік
                if (config.settings.year) {
                    var year = (data.release_date || data.first_air_date || '').substr(0,4);
                    if (year && year !== '0000') details.push(year);
                }
                
                // Жанри
                if (config.settings.genre && data.genre_names) {
                    details.push(data.genre_names);
                }
                
                // Час
                if (config.settings.time && data.runtime) {
                    var time = formatTime(data.runtime);
                    if (time) details.push(time);
                }
                
                config.elements.details.innerHTML = details.join(' • ');
                
                // Фон
                if (config.settings.bg && data.backdrop_path && config.elements.bg) {
                    updateBackground(data.backdrop_path);
                }
            }
            
            // Оновлюємо фон
            function updateBackground(path) {
                try {
                    var url = Lampa.Api.img(path, 'w780');
                    var bg = config.elements.bg;
                    
                    bg.style.transition = 'opacity 1s';
                    bg.classList.remove('active');
                    
                    var img = new Image();
                    img.onload = function() {
                        bg.style.backgroundImage = "url('" + url + "')";
                        setTimeout(function() {
                            bg.classList.add('active');
                        }, 50);
                    };
                    img.src = url;
                    
                } catch(e) {
                    console.error('[Samsung Plugin] Background error:', e);
                }
            }
            
            // Допоміжні функції
            function getCardData(element) {
                if (!element) return null;
                
                try {
                    // З атрибута
                    if (element.getAttribute('data-card')) {
                        return JSON.parse(element.getAttribute('data-card'));
                    }
                    
                    // З об'єкта
                    if (element.card && element.card.data) {
                        return element.card.data;
                    }
                    
                    // Пошук у батьківських елементах
                    var parent = element;
                    for (var i = 0; i < 3; i++) {
                        if (parent.card_data) return parent.card_data;
                        parent = parent.parentNode;
                        if (!parent) break;
                    }
                    
                    return null;
                } catch(e) {
                    return null;
                }
            }
            
            function getRatingColor(rating) {
                var num = parseFloat(rating);
                if (num >= 8) return '#00ff00';
                if (num >= 7) return '#ffff00';
                if (num >= 6) return '#ff9900';
                return '#ff0000';
            }
            
            function formatTime(minutes) {
                if (!minutes) return '';
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;
                return hours > 0 ? hours + ' год ' + mins + ' хв' : mins + ' хв';
            }
            
            function showInterface() {
                if (config.elements.info) {
                    config.elements.info.classList.add('visible');
                }
            }
            
            function hideInterface() {
                if (config.elements.info) {
                    config.elements.info.classList.remove('visible');
                }
                if (config.elements.bg) {
                    config.elements.bg.classList.remove('active');
                }
                config.currentFocus = null;
            }
            
            // Додаємо налаштування
            function addSettings() {
                var check = setInterval(function() {
                    if (Lampa.SettingsApi) {
                        clearInterval(check);
                        createSettings();
                    }
                }, 1000);
                
                function createSettings() {
                    try {
                        // Компонент
                        Lampa.SettingsApi.addComponent({
                            component: "tizen_plugin",
                            name: "Samsung Tizen"
                        });
                        
                        // Параметри
                        var params = [
                            {
                                name: "tiz_wide",
                                type: "trigger",
                                default: true,
                                field: { name: "Широкі постереи" }
                            },
                            {
                                name: "tiz_bg",
                                type: "trigger",
                                default: true,
                                field: { name: "Фонове зображення" }
                            },
                            {
                                name: "tiz_rating",
                                type: "trigger",
                                default: true,
                                field: { name: "Рейтинг" }
                            },
                            {
                                name: "tiz_genre",
                                type: "trigger",
                                default: true,
                                field: { name: "Жанри" }
                            },
                            {
                                name: "tiz_year",
                                type: "trigger",
                                default: true,
                                field: { name: "Рік" }
                            },
                            {
                                name: "tiz_time",
                                type: "trigger",
                                default: true,
                                field: { name: "Час" }
                            },
                            {
                                name: "tiz_color",
                                type: "trigger",
                                default: true,
                                field: { name: "Кольорові рейтинги" }
                            },
                            {
                                name: "tiz_hide",
                                type: "trigger",
                                default: true,
                                field: { name: "Приховати підписи" }
                            }
                        ];
                        
                        // Додаємо
                        params.forEach(function(p) {
                            Lampa.SettingsApi.addParam({
                                component: "tizen_plugin",
                                param: { name: p.name, type: p.type, default: p.default },
                                field: p.field,
                                onChange: function() {
                                    setTimeout(function() {
                                        location.reload();
                                    }, 300);
                                }
                            });
                        });
                        
                        // Пункт у меню
                        Lampa.SettingsApi.addParam({
                            component: "interface",
                            param: { name: "tizen_menu", type: "static" },
                            field: { name: "Samsung Tizen" },
                            onRender: function(item) {
                                item.onclick = function() {
                                    Lampa.Settings.create("tizen_plugin");
                                };
                            }
                        });
                        
                    } catch(e) {
                        console.error('[Samsung Plugin] Settings error:', e);
                    }
                }
            }
            
            // Ініціалізація
            function init() {
                console.log('[Samsung Plugin] Запуск...');
                
                // Налаштування
                config.settings = initSettings();
                
                // Стилі
                addStyles();
                
                // Налаштування Lampa
                addSettings();
                
                // Елементи
                setTimeout(createElements, 1000);
                
                // Цикл оновлення
                config.updateInterval = setInterval(updateInterface, 500);
                
                // Обробник клавіатури
                document.addEventListener('keydown', function(e) {
                    if ([37,38,39,40,13].includes(e.keyCode)) {
                        setTimeout(updateInterface, 100);
                    }
                });
                
                config.initialized = true;
                console.log('[Samsung Plugin] Готово!');
            }
            
            // Запуск
            init();
            
        } catch(error) {
            console.error('[Samsung Plugin] Критична помилка:', error);
        }
    }
    
})();
