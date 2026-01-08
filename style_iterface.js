// Samsung Tizen Interface Plugin
// Спрощена версія для стабільної роботи на Tizen

(function() {
    // Перевірка на Tizen
    var isTizen = navigator.userAgent.toLowerCase().indexOf('tizen') > -1 || 
                  navigator.userAgent.toLowerCase().indexOf('samsung') > -1;
    
    if (!isTizen) {
        console.log('Плагін тільки для Samsung Tizen');
        return;
    }
    
    // Чекаємо завантаження Lampa
    var checkLampa = setInterval(function() {
        if (typeof Lampa !== 'undefined' && 
            typeof Lampa.Storage !== 'undefined' && 
            typeof Lampa.Template !== 'undefined') {
            clearInterval(checkLampa);
            initPlugin();
        }
    }, 500);
    
    function initPlugin() {
        console.log('Ініціалізація Tizen Interface Plugin');
        
        try {
            // Запобігаємо повторному запуску
            if (window.tizenInterfaceActive) return;
            window.tizenInterfaceActive = true;
            
            // Налаштування за замовчуванням
            setDefaultSettings();
            
            // Додаємо стилі
            addTizenStyles();
            
            // Додаємо налаштування
            addSettings();
            
            // Основний цикл оновлення
            startMainLoop();
            
            console.log('Tizen Interface Plugin успішно завантажено');
        } catch (error) {
            console.error('Помилка ініціалізації плагіна:', error);
        }
    }
    
    function setDefaultSettings() {
        // Встановлюємо тільки якщо ще не встановлено
        var defaults = {
            'tizen_wide_post': 'true',
            'tizen_show_bg': 'true',
            'tizen_show_rating': 'true',
            'tizen_show_genre': 'true',
            'tizen_show_year': 'true',
            'tizen_show_time': 'true',
            'tizen_hide_captions': 'true',
            'tizen_colored_rat': 'true',
            'tizen_initialized': 'true'
        };
        
        for (var key in defaults) {
            if (!Lampa.Storage.get(key)) {
                Lampa.Storage.set(key, defaults[key]);
            }
        }
    }
    
    function addTizenStyles() {
        var styleId = 'tizen-interface-styles';
        if (document.getElementById(styleId)) return;
        
        var widePost = Lampa.Storage.get('tizen_wide_post') === 'true';
        
        var css = `
            <style id="${styleId}">
                /* Основні стилі Tizen Interface */
                .tizen-info-panel {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: ${widePost ? '280px' : '220px'};
                    background: linear-gradient(to bottom, 
                        rgba(0,0,0,0.95) 0%,
                        rgba(0,0,0,0.85) 50%,
                        rgba(0,0,0,0) 100%);
                    z-index: 9990;
                    padding: 20px 40px;
                    box-sizing: border-box;
                    display: none;
                }
                
                .tizen-info-visible {
                    display: block;
                }
                
                .tizen-info-content {
                    max-width: 70%;
                    margin-top: 10px;
                }
                
                .tizen-title {
                    font-size: ${widePost ? '42px' : '36px'};
                    font-weight: bold;
                    color: white;
                    margin-bottom: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .tizen-details {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 15px;
                    margin: 15px 0;
                    font-size: 18px;
                    color: rgba(255,255,255,0.9);
                }
                
                .tizen-rating {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(0,0,0,0.6);
                    padding: 5px 10px;
                    border-radius: 5px;
                    min-width: 60px;
                }
                
                .tizen-rating-value {
                    font-weight: bold;
                    font-size: 22px;
                    margin-right: 5px;
                }
                
                .tizen-rating-label {
                    font-size: 14px;
                    opacity: 0.8;
                }
                
                .tizen-description {
                    font-size: 18px;
                    line-height: 1.4;
                    color: rgba(255,255,255,0.9);
                    max-height: ${widePost ? '80px' : '60px'};
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: ${widePost ? 3 : 2};
                    -webkit-box-orient: vertical;
                }
                
                .tizen-dot {
                    margin: 0 8px;
                    opacity: 0.5;
                }
                
                /* Фон */
                .tizen-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-size: cover;
                    background-position: center;
                    opacity: 0;
                    transition: opacity 0.8s ease;
                    z-index: -1;
                    filter: blur(20px) brightness(0.6);
                }
                
                .tizen-bg-visible {
                    opacity: 1;
                }
                
                /* Картки */
                .tizen-card {
                    transition: transform 0.2s ease;
                }
                
                .tizen-card-focus {
                    transform: scale(1.05);
                }
                
                /* Широкі постереи */
                .tizen-wide .card {
                    width: 240px !important;
                }
                
                /* Звичайні постереи */
                .tizen-normal .card {
                    width: 200px !important;
                }
                
                /* Приховування підписів */
                .tizen-hide-captions .card__title,
                .tizen-hide-captions .card__age {
                    display: none !important;
                }
                
                /* Анімація фокусу */
                @keyframes tizenFocus {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                
                .card.focus {
                    animation: tizenFocus 0.2s ease forwards;
                }
                
                /* Для мобільних пристроїв */
                @media (max-width: 768px) {
                    .tizen-info-panel {
                        height: 180px;
                        padding: 15px 20px;
                    }
                    
                    .tizen-title {
                        font-size: 28px;
                    }
                    
                    .tizen-description {
                        font-size: 16px;
                        -webkit-line-clamp: 2;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', css);
    }
    
    // Головний цикл оновлення
    function startMainLoop() {
        var lastFocusedCard = null;
        var infoPanel = null;
        var background = null;
        
        // Створюємо інтерфейсні елементи
        function createInterface() {
            // Інфо панель
            infoPanel = document.createElement('div');
            infoPanel.className = 'tizen-info-panel';
            infoPanel.innerHTML = `
                <div class="tizen-info-content">
                    <div class="tizen-title"></div>
                    <div class="tizen-details"></div>
                    <div class="tizen-description"></div>
                </div>
            `;
            document.body.appendChild(infoPanel);
            
            // Фон
            background = document.createElement('div');
            background.className = 'tizen-bg';
            document.body.appendChild(background);
            
            // Додаємо класи до body
            var wide = Lampa.Storage.get('tizen_wide_post') === 'true';
            var hide = Lampa.Storage.get('tizen_hide_captions') === 'true';
            
            if (wide) document.body.classList.add('tizen-wide');
            else document.body.classList.add('tizen-normal');
            
            if (hide) document.body.classList.add('tizen-hide-captions');
        }
    
        // Оновлюємо інтерфейс
        function updateInterface() {
            try {
                // Шукаємо активну картку
                var focusedCard = document.querySelector('.card.focus, .selector.focus .card');
                if (!focusedCard) {
                    // Приховуємо інфо панель якщо немає фокусу
                    if (infoPanel) {
                        infoPanel.classList.remove('tizen-info-visible');
                        background.classList.remove('tizen-bg-visible');
                    }
                    return;
                }
                
                // Отримуємо дані картки
                var cardData = getCardData(focusedCard);
                if (!cardData || cardData === lastFocusedCard) return;
                
                lastFocusedCard = cardData;
                
                // Показуємо інтерфейс
                if (!infoPanel) createInterface();
                infoPanel.classList.add('tizen-info-visible');
                
                // Оновлюємо контент
                updateInfoPanel(cardData);
                
            } catch (error) {
                console.error('Помилка оновлення інтерфейсу:', error);
            }
        }
        
        // Оновлюємо інфо панель
        function updateInfoPanel(data) {
            if (!infoPanel || !data) return;
            
            try {
                // Заголовок
                var titleEl = infoPanel.querySelector('.tizen-title');
                if (titleEl) {
                    titleEl.textContent = data.title || data.name || '';
                }
                
                // Деталі
                var detailsEl = infoPanel.querySelector('.tizen-details');
                if (detailsEl) {
                    var details = [];
                    
                    // Рейтинг
                    if (Lampa.Storage.get('tizen_show_rating') === 'true' && data.vote_average) {
                        var rating = parseFloat(data.vote_average).toFixed(1);
                        var color = getRatingColor(rating);
                        var style = color ? `style="color: ${color}"` : '';
                        
                        details.push(`
                            <div class="tizen-rating" ${style}>
                                <span class="tizen-rating-value">${rating}</span>
                                <span class="tizen-rating-label">TMDB</span>
                            </div>
                        `);
                    }
                    
                    // Рік
                    if (Lampa.Storage.get('tizen_show_year') === 'true') {
                        var year = (data.release_date || data.first_air_date || '').substring(0,4);
                        if (year && year !== '0000') {
                            details.push(`<span>${year}</span>`);
                        }
                    }
                    
                    // Жанри
                    if (Lampa.Storage.get('tizen_show_genre') === 'true' && data.genre_names) {
                        var genres = Array.isArray(data.genre_names) ? 
                            data.genre_names.slice(0, 2).join(', ') : 
                            data.genre_names;
                        if (genres) details.push(`<span>${genres}</span>`);
                    }
                    
                    // Тривалість
                    if (Lampa.Storage.get('tizen_show_time') === 'true' && data.runtime) {
                        var time = formatTime(data.runtime);
                        if (time) details.push(`<span>${time}</span>`);
                    }
                    
                    detailsEl.innerHTML = details.join('<span class="tizen-dot">•</span>');
                }
                
                // Опис
                var descEl = infoPanel.querySelector('.tizen-description');
                if (descEl) {
                    descEl.textContent = data.overview || data.description || 'Опис відсутній';
                }
                
                // Фон
                if (Lampa.Storage.get('tizen_show_bg') === 'true' && data.backdrop_path) {
                    updateBackground(data.backdrop_path);
                } else {
                    background.classList.remove('tizen-bg-visible');
                }
                
            } catch (error) {
                console.error('Помилка оновлення інфо панелі:', error);
            }
        }
        
        // Оновлюємо фон
        function updateBackground(backdropPath) {
            if (!background || !backdropPath) return;
            
            try {
                var bgUrl = Lampa.Api.img(backdropPath, 'w780');
                background.style.backgroundImage = `url("${bgUrl}")`;
                background.classList.add('tizen-bg-visible');
            } catch (error) {
                background.classList.remove('tizen-bg-visible');
            }
        }
        
        // Отримуємо дані картки
        function getCardData(cardElement) {
            if (!cardElement) return null;
            
            try {
                // Спробуємо отримати дані з атрибутів
                var dataAttr = cardElement.getAttribute('data-card');
                if (dataAttr) {
                    try {
                        return JSON.parse(dataAttr);
                    } catch (e) {}
                }
                
                // Шукаємо дані в дочірніх елементах
                var dataElement = cardElement.querySelector('[data-card]');
                if (dataElement) {
                    var attr = dataElement.getAttribute('data-card');
                    if (attr) {
                        try {
                            return JSON.parse(attr);
                        } catch (e) {}
                    }
                }
                
                // Альтернативний метод - отримуємо з об'єкта картки
                if (cardElement.card && cardElement.card.data) {
                    return cardElement.card.data;
                }
                
                return null;
            } catch (error) {
                return null;
            }
        }
        
        // Допоміжні функції
        function getRatingColor(rating) {
            if (Lampa.Storage.get('tizen_colored_rat') !== 'true') return '';
            
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
            return hours > 0 ? `${hours} год ${mins} хв` : `${mins} хв`;
        }
        
        // Запускаємо цикл оновлення
        setInterval(updateInterface, 300);
        
        // Додаємо обробник подій
        document.addEventListener('keydown', function(e) {
            // Оновлюємо інтерфейс при навігації
            if ([37, 38, 39, 40, 13].includes(e.keyCode)) {
                setTimeout(updateInterface, 100);
            }
        });
    }
    
    // Додаємо налаштування
    function addSettings() {
        // Чекаємо на готовність SettingsApi
        var checkSettings = setInterval(function() {
            if (typeof Lampa.SettingsApi !== 'undefined') {
                clearInterval(checkSettings);
                createSettings();
            }
        }, 1000);
        
        function createSettings() {
            try {
                // Створюємо компонент налаштувань
                Lampa.SettingsApi.addComponent({
                    component: "tizen_interface",
                    name: "Samsung Tizen"
                });
                
                // Додаємо параметри
                var params = [
                    {
                        name: "tizen_wide_post",
                        type: "trigger",
                        default: true,
                        field: {
                            name: "Широкі постереи",
                            description: "Потрібне перезавантаження"
                        },
                        onChange: function() {
                            Lampa.Noty.show("Перезавантаження...");
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        }
                    },
                    {
                        name: "tizen_show_bg",
                        type: "trigger",
                        default: true,
                        field: { name: "Показувати фон" }
                    },
                    {
                        name: "tizen_show_rating",
                        type: "trigger",
                        default: true,
                        field: { name: "Показувати рейтинг" }
                    },
                    {
                        name: "tizen_show_year",
                        type: "trigger",
                        default: true,
                        field: { name: "Показувати рік" }
                    },
                    {
                        name: "tizen_show_genre",
                        type: "trigger",
                        default: true,
                        field: { name: "Показувати жанри" }
                    },
                    {
                        name: "tizen_show_time",
                        type: "trigger",
                        default: true,
                        field: { name: "Показувати тривалість" }
                    },
                    {
                        name: "tizen_colored_rat",
                        type: "trigger",
                        default: true,
                        field: { name: "Кольорові рейтинги" }
                    },
                    {
                        name: "tizen_hide_captions",
                        type: "trigger",
                        default: true,
                        field: {
                            name: "Приховати підписи",
                            description: "Потрібне перезавантаження"
                        },
                        onChange: function() {
                            Lampa.Noty.show("Перезавантаження...");
                            setTimeout(function() {
                                location.reload();
                            }, 1000);
                        }
                    },
                    {
                        name: "tizen_clear_cache",
                        type: "static",
                        field: {
                            name: "Очистити налаштування",
                            description: "Скинути всі налаштування"
                        },
                        onRender: function(item) {
                            item.addEventListener('click', function() {
                                Lampa.Select.show({
                                    title: "Очистити налаштування?",
                                    items: [
                                        { title: "Так", confirm: true },
                                        { title: "Ні" }
                                    ],
                                    onSelect: function(a) {
                                        if (a.confirm) {
                                            // Видаляємо наші налаштування
                                            var keys = [];
                                            for (var i = 0; i < localStorage.length; i++) {
                                                var key = localStorage.key(i);
                                                if (key.indexOf('tizen_') === 0) {
                                                    keys.push(key);
                                                }
                                            }
                                            
                                            keys.forEach(function(key) {
                                                localStorage.removeItem(key);
                                            });
                                            
                                            Lampa.Noty.show("Налаштування очищено. Перезавантаження...");
                                            setTimeout(function() {
                                                location.reload();
                                            }, 1500);
                                        }
                                    }
                                });
                            });
                        }
                    }
                ];
                
                // Додаємо кожен параметр
                params.forEach(function(param) {
                    Lampa.SettingsApi.addParam({
                        component: "tizen_interface",
                        param: {
                            name: param.name,
                            type: param.type,
                            default: param.default
                        },
                        field: param.field,
                        onChange: param.onChange,
                        onRender: param.onRender
                    });
                });
                
                // Додаємо пункт у головне меню
                Lampa.SettingsApi.addParam({
                    component: "interface",
                    param: { name: "tizen_interface_menu", type: "static" },
                    field: { name: "Samsung Tizen Interface" },
                    onRender: function(item) {
                        item.addEventListener('click', function() {
                            Lampa.Settings.create("tizen_interface");
                        });
                    }
                });
                
            } catch (error) {
                console.error('Помилка створення налаштувань:', error);
            }
        }
    }
    
    // Простий обробник помилок
    window.addEventListener('error', function(e) {
        console.error('Помилка Tizen плагіна:', e.error);
    });
    
})();
