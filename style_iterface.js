// Samsung Tizen Interface Plugin v1.0
// Повна адаптація оригінального плагіна для Samsung Tizen

(function() {
    console.log('Завантаження Samsung Tizen Interface Plugin...');
    
    // 1. Перевірка на Tizen телевізор
    var isSamsungTizen = (function() {
        var ua = navigator.userAgent.toLowerCase();
        var isTizen = ua.indexOf('tizen') > -1;
        var isSamsung = ua.indexOf('samsung') > -1 && ua.indexOf('smarttv') > -1;
        var isTizenTV = /smart-tv|tizen|samsungbrowser/i.test(ua);
        
        console.log('User Agent:', navigator.userAgent);
        console.log('isTizen:', isTizen, 'isSamsung:', isSamsung, 'isTizenTV:', isTizenTV);
        
        return isTizen || isSamsung || isTizenTV;
    })();
    
    if (!isSamsungTizen) {
        console.log('Цей плагін тільки для Samsung Tizen телевізорів');
        return;
    }
    
    // 2. Чекаємо на завантаження Lampa
    var initAttempts = 0;
    var maxAttempts = 30; // 15 секунд
    
    var checkLampa = setInterval(function() {
        initAttempts++;
        
        if (typeof Lampa !== 'undefined' && 
            typeof Lampa.Storage !== 'undefined' && 
            typeof Lampa.Utils !== 'undefined') {
            
            clearInterval(checkLampa);
            console.log('Lampa завантажена, запуск плагіна...');
            initializePlugin();
            
        } else if (initAttempts >= maxAttempts) {
            clearInterval(checkLampa);
            console.error('Не вдалося завантажити Lampa API');
        }
    }, 500);
    
    function initializePlugin() {
        try {
            // Запобігаємо повторному запуску
            if (window.samsungPluginActive) {
                console.log('Плагін вже активний');
                return;
            }
            window.samsungPluginActive = true;
            
            // Основний об'єкт плагіна
            var SamsungPlugin = {
                initialized: false,
                stylesAdded: false,
                currentFocus: null,
                lastUpdate: 0,
                updateDelay: 300,
                cache: {},
                elements: {},
                settings: {}
            };
            
            // Ініціалізація налаштувань
            function initSettings() {
                console.log('Ініціалізація налаштувань...');
                
                var defaults = {
                    'si_wide_post': 'true',
                    'si_logo_show': 'false', // На Tizen часто проблеми з лого
                    'si_show_background': 'true',
                    'si_background_resolution': 'w780',
                    'si_status': 'true',
                    'si_seas': 'false',
                    'si_eps': 'false',
                    'si_year_ogr': 'true',
                    'si_vremya': 'true',
                    'si_ganr': 'true',
                    'si_rat': 'true',
                    'si_colored_ratings': 'true',
                    'si_async_load': 'true',
                    'si_hide_captions': 'true',
                    'si_child_mode': 'false',
                    'si_rating_border': 'false',
                    'si_tizen_initialized': 'true'
                };
                
                // Встановлюємо значення за замовчуванням
                for (var key in defaults) {
                    if (Lampa.Storage.get(key) === null || Lampa.Storage.get(key) === undefined) {
                        Lampa.Storage.set(key, defaults[key]);
                        console.log('Встановлено за замовчуванням:', key, defaults[key]);
                    }
                }
                
                SamsungPlugin.settings = {
                    widePost: Lampa.Storage.get('si_wide_post') === 'true',
                    showLogo: Lampa.Storage.get('si_logo_show') === 'true',
                    showBackground: Lampa.Storage.get('si_show_background') === 'true',
                    bgResolution: Lampa.Storage.get('si_background_resolution') || 'w780',
                    showStatus: Lampa.Storage.get('si_status') === 'true',
                    showSeasons: Lampa.Storage.get('si_seas') === 'true',
                    showEpisodes: Lampa.Storage.get('si_eps') === 'true',
                    showAge: Lampa.Storage.get('si_year_ogr') === 'true',
                    showTime: Lampa.Storage.get('si_vremya') === 'true',
                    showGenre: Lampa.Storage.get('si_ganr') === 'true',
                    showRating: Lampa.Storage.get('si_rat') === 'true',
                    coloredRatings: Lampa.Storage.get('si_colored_ratings') === 'true',
                    asyncLoad: Lampa.Storage.get('si_async_load') === 'true',
                    hideCaptions: Lampa.Storage.get('si_hide_captions') === 'true',
                    childMode: Lampa.Storage.get('si_child_mode') === 'true',
                    ratingBorder: Lampa.Storage.get('si_rating_border') === 'true'
                };
                
                console.log('Налаштування завантажені:', SamsungPlugin.settings);
            }
            
            // Додаємо стилі для Tizen
            function addStyles() {
                if (SamsungPlugin.stylesAdded) return;
                
                console.log('Додавання стилів для Tizen...');
                
                var styleContent = `
                    <style id="samsung-tizen-styles">
                        /* Основні стилі для Samsung Tizen */
                        .samsung-tizen-interface {
                            position: relative;
                        }
                        
                        .samsung-tizen-info {
                            position: relative;
                            padding: 20px 40px;
                            height: 250px;
                            background: linear-gradient(180deg, 
                                rgba(0,0,0,0.95) 0%, 
                                rgba(0,0,0,0.7) 50%, 
                                rgba(0,0,0,0) 100%);
                            z-index: 9990;
                            display: none;
                        }
                        
                        .samsung-tizen-info.visible {
                            display: block;
                        }
                        
                        .samsung-tizen-info-body {
                            max-width: 75%;
                            margin-top: 10px;
                        }
                        
                        .samsung-tizen-info-title {
                            font-size: 38px;
                            font-weight: bold;
                            color: #FFFFFF;
                            margin-bottom: 5px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        
                        .samsung-tizen-info-logo {
                            max-height: 60px;
                            max-width: 400px;
                            object-fit: contain;
                            margin-bottom: 10px;
                        }
                        
                        .samsung-tizen-info-details {
                            display: flex;
                            flex-wrap: wrap;
                            align-items: center;
                            gap: 15px;
                            margin: 10px 0;
                            font-size: 18px;
                            color: rgba(255,255,255,0.9);
                            min-height: 30px;
                        }
                        
                        .samsung-tizen-info-description {
                            font-size: 18px;
                            line-height: 1.4;
                            color: rgba(255,255,255,0.9);
                            max-height: 70px;
                            overflow: hidden;
                            display: -webkit-box;
                            -webkit-line-clamp: 3;
                            -webkit-box-orient: vertical;
                            margin-top: 10px;
                        }
                        
                        /* Фон */
                        .samsung-tizen-bg {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-size: cover;
                            background-position: center;
                            opacity: 0;
                            transition: opacity 1s ease;
                            z-index: -1;
                            filter: blur(20px) brightness(0.5);
                        }
                        
                        .samsung-tizen-bg.active {
                            opacity: 0.6;
                        }
                        
                        /* Рейтинг */
                        .samsung-tizen-rate {
                            display: inline-flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 5px 10px;
                            background: rgba(0,0,0,0.5);
                            border-radius: 5px;
                            font-size: 16px;
                            min-width: 70px;
                        }
                        
                        .samsung-tizen-rate-value {
                            font-weight: bold;
                            font-size: 22px;
                        }
                        
                        .samsung-tizen-rate-label {
                            font-size: 12px;
                            opacity: 0.8;
                            margin-top: 2px;
                        }
                        
                        /* Роздільник */
                        .samsung-tizen-split {
                            margin: 0 8px;
                            opacity: 0.5;
                        }
                        
                        /* Вікове обмеження */
                        .samsung-tizen-age {
                            padding: 3px 8px;
                            background: rgba(255,0,0,0.3);
                            border-radius: 3px;
                            font-size: 16px;
                        }
                        
                        /* Картки */
                        .samsung-tizen-card {
                            transition: all 0.2s ease;
                        }
                        
                        .samsung-tizen-card.focus {
                            transform: scale(1.05);
                            z-index: 100;
                        }
                        
                        /* Широкі постереи */
                        .samsung-tizen-wide .card {
                            width: 220px !important;
                        }
                        
                        /* Звичайні постереи */
                        .samsung-tizen-normal .card {
                            width: 180px !important;
                        }
                        
                        /* Приховування підписів */
                        .samsung-tizen-hide-captions .card:not(.card--collection) .card__age,
                        .samsung-tizen-hide-captions .card:not(.card--collection) .card__title {
                            display: none !important;
                        }
                        
                        /* Анімація фокусу */
                        @keyframes samsungFocus {
                            0% { transform: scale(1); }
                            100% { transform: scale(1.05); }
                        }
                        
                        .card.focus {
                            animation: samsungFocus 0.2s ease forwards;
                        }
                        
                        /* Для елементів ліній */
                        .samsung-tizen-line {
                            padding-bottom: 30px !important;
                        }
                        
                        /* Адаптація для 4K */
                        @media (min-width: 3840px) {
                            .samsung-tizen-info {
                                height: 350px;
                                padding: 30px 60px;
                            }
                            
                            .samsung-tizen-info-title {
                                font-size: 56px;
                            }
                            
                            .samsung-tizen-info-logo {
                                max-height: 90px;
                                max-width: 600px;
                            }
                            
                            .samsung-tizen-info-details {
                                font-size: 26px;
                                gap: 25px;
                            }
                            
                            .samsung-tizen-info-description {
                                font-size: 26px;
                                max-height: 100px;
                            }
                            
                            .samsung-tizen-rate {
                                font-size: 24px;
                                min-width: 100px;
                                padding: 8px 15px;
                            }
                            
                            .samsung-tizen-rate-value {
                                font-size: 32px;
                            }
                            
                            .samsung-tizen-wide .card {
                                width: 320px !important;
                            }
                            
                            .samsung-tizen-normal .card {
                                width: 280px !important;
                            }
                        }
                        
                        /* Для Full HD */
                        @media (max-width: 1920px) {
                            .samsung-tizen-info {
                                height: 220px;
                                padding: 15px 30px;
                            }
                            
                            .samsung-tizen-info-title {
                                font-size: 32px;
                            }
                            
                            .samsung-tizen-info-details {
                                font-size: 16px;
                                gap: 10px;
                            }
                            
                            .samsung-tizen-info-description {
                                font-size: 16px;
                                max-height: 60px;
                            }
                        }
                    </style>
                `;
                
                document.head.insertAdjacentHTML('beforeend', styleContent);
                SamsungPlugin.stylesAdded = true;
                console.log('Стилі додані');
            }
            
            // Створюємо інтерфейсні елементи
            function createInterface() {
                console.log('Створення інтерфейсу...');
                
                // Інфо панель
                var infoPanel = document.createElement('div');
                infoPanel.className = 'samsung-tizen-info';
                infoPanel.id = 'samsung-tizen-info-panel';
                infoPanel.innerHTML = `
                    <div class="samsung-tizen-info-body">
                        <div class="samsung-tizen-info-title"></div>
                        <div class="samsung-tizen-info-details"></div>
                        <div class="samsung-tizen-info-description"></div>
                    </div>
                `;
                
                // Фон
                var background = document.createElement('div');
                background.className = 'samsung-tizen-bg';
                background.id = 'samsung-tizen-background';
                
                // Додаємо до body
                document.body.appendChild(background);
                document.body.appendChild(infoPanel);
                
                // Додаємо класи до body
                updateBodyClasses();
                
                SamsungPlugin.elements = {
                    infoPanel: infoPanel,
                    background: background,
                    title: infoPanel.querySelector('.samsung-tizen-info-title'),
                    details: infoPanel.querySelector('.samsung-tizen-info-details'),
                    description: infoPanel.querySelector('.samsung-tizen-info-description')
                };
                
                console.log('Інтерфейс створений');
            }
            
            // Оновлюємо класи body
            function updateBodyClasses() {
                // Видаляємо старі класи
                document.body.classList.remove('samsung-tizen-wide', 'samsung-tizen-normal', 'samsung-tizen-hide-captions');
                
                // Додаємо нові
                if (SamsungPlugin.settings.widePost) {
                    document.body.classList.add('samsung-tizen-wide');
                } else {
                    document.body.classList.add('samsung-tizen-normal');
                }
                
                if (SamsungPlugin.settings.hideCaptions) {
                    document.body.classList.add('samsung-tizen-hide-captions');
                }
            }
            
            // Оновлюємо інтерфейс при фокусі на картці
            function updateInterface() {
                var now = Date.now();
                if (now - SamsungPlugin.lastUpdate < SamsungPlugin.updateDelay) {
                    return;
                }
                
                SamsungPlugin.lastUpdate = now;
                
                try {
                    // Шукаємо активну картку
                    var focusedCard = findFocusedCard();
                    if (!focusedCard) {
                        hideInterface();
                        return;
                    }
                    
                    // Отримуємо дані картки
                    var cardData = getCardData(focusedCard);
                    if (!cardData) {
                        hideInterface();
                        return;
                    }
                    
                    // Якщо дані не змінилися
                    if (SamsungPlugin.currentFocus && 
                        SamsungPlugin.currentFocus.id === cardData.id &&
                        SamsungPlugin.currentFocus.media_type === cardData.media_type) {
                        return;
                    }
                    
                    SamsungPlugin.currentFocus = cardData;
                    
                    // Показуємо інтерфейс
                    showInterface();
                    
                    // Оновлюємо контент
                    updateContent(cardData);
                    
                } catch (error) {
                    console.error('Помилка оновлення інтерфейсу:', error);
                    hideInterface();
                }
            }
            
            // Знаходимо фокусовану картку
            function findFocusedCard() {
                // Спробуємо різні селектори
                var selectors = [
                    '.card.focus',
                    '.selector.focus .card',
                    '.card.focus:not(.card-more)',
                    '.items-line .card.focus',
                    '[class*="focus"] .card',
                    '.focus'
                ];
                
                for (var i = 0; i < selectors.length; i++) {
                    var element = document.querySelector(selectors[i]);
                    if (element) {
                        // Перевіряємо чи це дійсно картка
                        if (element.classList && element.classList.contains('card')) {
                            return element;
                        }
                        // Якщо не картка, шукаємо картку всередині
                        var cardInside = element.querySelector('.card');
                        if (cardInside) return cardInside;
                    }
                }
                
                return null;
            }
            
            // Отримуємо дані картки
            function getCardData(cardElement) {
                if (!cardElement) return null;
                
                try {
                    // Метод 1: З атрибута data
                    if (cardElement.getAttribute('data-card')) {
                        try {
                            return JSON.parse(cardElement.getAttribute('data-card'));
                        } catch (e) {}
                    }
                    
                    // Метод 2: З об'єкта картки
                    if (cardElement.card && cardElement.card.data) {
                        return cardElement.card.data;
                    }
                    
                    // Метод 3: З найближчого елемента з даними
                    var parent = cardElement;
                    for (var i = 0; i < 5; i++) {
                        if (parent.card_data) {
                            return parent.card_data;
                        }
                        if (!parent.parentNode) break;
                        parent = parent.parentNode;
                    }
                    
                    // Метод 4: З глобального об'єкта Lampa (якщо є доступ)
                    if (window.Lampa && Lampa.Cards && Lampa.Cards.active) {
                        var active = Lampa.Cards.active();
                        if (active && active.data) return active.data;
                    }
                    
                    return null;
                } catch (error) {
                    console.error('Помилка отримання даних картки:', error);
                    return null;
                }
            }
            
            // Показуємо інтерфейс
            function showInterface() {
                if (!SamsungPlugin.elements.infoPanel) {
                    createInterface();
                }
                
                if (SamsungPlugin.elements.infoPanel) {
                    SamsungPlugin.elements.infoPanel.classList.add('visible');
                }
            }
            
            // Ховаємо інтерфейс
            function hideInterface() {
                if (SamsungPlugin.elements.infoPanel) {
                    SamsungPlugin.elements.infoPanel.classList.remove('visible');
                }
                if (SamsungPlugin.elements.background) {
                    SamsungPlugin.elements.background.classList.remove('active');
                }
                SamsungPlugin.currentFocus = null;
            }
            
            // Оновлюємо контент
            function updateContent(data) {
                if (!data || !SamsungPlugin.elements.title) return;
                
                try {
                    // Заголовок
                    updateTitle(data);
                    
                    // Деталі
                    updateDetails(data);
                    
                    // Опис
                    updateDescription(data);
                    
                    // Фон
                    updateBackground(data);
                    
                } catch (error) {
                    console.error('Помилка оновлення контенту:', error);
                }
            }
            
            // Оновлюємо заголовок
            function updateTitle(data) {
                var title = data.title || data.name || '';
                SamsungPlugin.elements.title.textContent = title;
                SamsungPlugin.elements.title.style.display = 'block';
                
                // Логотип (спрощено для Tizen)
                if (SamsungPlugin.settings.showLogo && data.id) {
                    // На Tizen часто проблеми з завантаженням лого, тому спрощуємо
                    SamsungPlugin.elements.title.textContent = title;
                }
            }
            
            // Оновлюємо деталі
            function updateDetails(data) {
                if (!SamsungPlugin.elements.details) return;
                
                var details = [];
                
                // Рейтинг
                if (SamsungPlugin.settings.showRating && data.vote_average) {
                    var rating = parseFloat(data.vote_average).toFixed(1);
                    var color = SamsungPlugin.settings.coloredRatings ? getRatingColor(rating) : '';
                    var borderStyle = SamsungPlugin.settings.ratingBorder && color ? 'border: 1px solid ' + color + ';' : '';
                    
                    details.push(`
                        <div class="samsung-tizen-rate" style="${color ? 'color: ' + color + ';' : ''} ${borderStyle}">
                            <div class="samsung-tizen-rate-value">${rating}</div>
                            <div class="samsung-tizen-rate-label">TMDB</div>
                        </div>
                    `);
                }
                
                // Рік
                var year = (data.release_date || data.first_air_date || '').substring(0, 4);
                if (year && year !== '0000') {
                    details.push(`<span>${year}</span>`);
                }
                
                // Жанри
                if (SamsungPlugin.settings.showGenre) {
                    var genres = '';
                    if (data.genres && Array.isArray(data.genres)) {
                        genres = data.genres.slice(0, 2).map(function(g) {
                            return Lampa.Utils.capitalizeFirstLetter ? 
                                   Lampa.Utils.capitalizeFirstLetter(g.name) : 
                                   g.name;
                        }).join(', ');
                    } else if (data.genre_names) {
                        genres = data.genre_names;
                    }
                    
                    if (genres) {
                        details.push(`<span>${genres}</span>`);
                    }
                }
                
                // Тривалість
                if (SamsungPlugin.settings.showTime && data.runtime) {
                    var time = formatTime(data.runtime);
                    if (time) details.push(`<span>${time}</span>`);
                }
                
                // Вікове обмеження
                if (SamsungPlugin.settings.showAge) {
                    var age = getAgeRating(data);
                    if (age) {
                        details.push(`<span class="samsung-tizen-age">${age}</span>`);
                    }
                }
                
                // Статус
                if (SamsungPlugin.settings.showStatus && data.status) {
                    var status = translateStatus(data.status);
                    if (status) details.push(`<span>${status}</span>`);
                }
                
                // Сезони
                if (SamsungPlugin.settings.showSeasons && data.number_of_seasons) {
                    details.push(`<span>Сезонів: ${data.number_of_seasons}</span>`);
                }
                
                // Епізоди
                if (SamsungPlugin.settings.showEpisodes && data.number_of_episodes) {
                    details.push(`<span>Епізодів: ${data.number_of_episodes}</span>`);
                }
                
                // Країни
                if (data.production_countries && Array.isArray(data.production_countries)) {
                    var countries = data.production_countries.slice(0, 2).map(function(c) {
                        return c.iso_3166_1;
                    }).join(', ');
                    if (countries) details.push(`<span>${countries}</span>`);
                }
                
                SamsungPlugin.elements.details.innerHTML = details.join('<span class="samsung-tizen-split">•</span>');
            }
            
            // Оновлюємо опис
            function updateDescription(data) {
                if (!SamsungPlugin.elements.description) return;
                
                var description = data.overview || '';
                if (!description && Lampa.Lang && Lampa.Lang.translate) {
                    description = Lampa.Lang.translate("full_notext") || 'Опис відсутній';
                }
                
                SamsungPlugin.elements.description.textContent = description;
            }
            
            // Оновлюємо фон
            function updateBackground(data) {
                if (!SamsungPlugin.settings.showBackground || !SamsungPlugin.elements.background) {
                    return;
                }
                
                try {
                    if (data.backdrop_path) {
                        var bgUrl = Lampa.Api.img(data.backdrop_path, SamsungPlugin.settings.bgResolution);
                        
                        // Плавна зміна фону
                        SamsungPlugin.elements.background.style.transition = 'opacity 1s ease';
                        SamsungPlugin.elements.background.classList.remove('active');
                        
                        var img = new Image();
                        var self = SamsungPlugin;
                        
                        img.onload = function() {
                            setTimeout(function() {
                                if (self.elements.background) {
                                    self.elements.background.style.backgroundImage = "url('" + bgUrl + "')";
                                    self.elements.background.classList.add('active');
                                }
                            }, 50);
                        };
                        
                        img.onerror = function() {
                            if (SamsungPlugin.elements.background) {
                                SamsungPlugin.elements.background.classList.remove('active');
                            }
                        };
                        
                        img.src = bgUrl;
                        
                    } else {
                        SamsungPlugin.elements.background.classList.remove('active');
                    }
                } catch (error) {
                    console.error('Помилка оновлення фону:', error);
                    if (SamsungPlugin.elements.background) {
                        SamsungPlugin.elements.background.classList.remove('active');
                    }
                }
            }
            
            // Допоміжні функції
            function getRatingColor(rating) {
                var num = parseFloat(rating);
                if (num >= 8) return '#00ff00';
                if (num >= 7) return '#a0ff00';
                if (num >= 6) return '#ffff00';
                if (num >= 5) return '#ffa500';
                return '#ff0000';
            }
            
            function formatTime(minutes) {
                if (!minutes) return '';
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;
                
                if (hours > 0 && mins > 0) return hours + ' год ' + mins + ' хв';
                if (hours > 0) return hours + ' год';
                return mins + ' хв';
            }
            
            function getAgeRating(data) {
                try {
                    // Спрощена версія для Tizen
                    if (data.adult === true) return '18';
                    if (data.adult === false) return '16';
                    
                    return '';
                } catch (e) {
                    return '';
                }
            }
            
            function translateStatus(status) {
                var map = {
                    'released': 'Випущено',
                    'ended': 'Завершено',
                    'returning series': 'Триває',
                    'canceled': 'Скасовано',
                    'in production': 'В производстве',
                    'post production': 'Пост-продакшн',
                    'planned': 'Заплановано',
                    'pilot': 'Пілот'
                };
                
                return map[status.toLowerCase()] || status;
            }
            
            // Дитячий режим (спрощено)
            function initChildMode() {
                if (!SamsungPlugin.settings.childMode) return;
                
                console.log('Дитячий режим активовано');
                // На Tizen це може бути реалізовано через фільтрацію контенту
            }
            
            // Додаємо налаштування в інтерфейс Lampa
            function addSettingsToLampa() {
                console.log('Додавання налаштувань до Lampa...');
                
                // Чекаємо на готовність SettingsApi
                var checkSettings = setInterval(function() {
                    if (typeof Lampa.SettingsApi !== 'undefined') {
                        clearInterval(checkSettings);
                        createSettingsMenu();
                    }
                }, 1000);
                
                function createSettingsMenu() {
                    try {
                        // Створюємо компонент
                        Lampa.SettingsApi.addComponent({
                            component: "samsung_tizen_interface",
                            name: "Samsung Tizen Interface"
                        });
                        
                        // Додаємо параметри
                        var settingsList = [
                            {
                                name: "si_wide_post",
                                type: "trigger",
                                default: true,
                                field: {
                                    name: "Широкі постереи",
                                    description: "Потрібне перезавантаження"
                                },
                                onChange: function() {
                                    Lampa.Noty.show("Перезавантаження...");
                                    setTimeout(location.reload, 1000);
                                }
                            },
                            {
                                name: "si_logo_show",
                                type: "trigger",
                                default: false,
                                field: {
                                    name: "Показувати логотип",
                                    description: "На Tizen може працювати нестабільно"
                                }
                            },
                            {
                                name: "si_show_background",
                                type: "trigger",
                                default: true,
                                field: { name: "Показувати фон" }
                            },
                            {
                                name: "si_background_resolution",
                                type: "select",
                                default: "w780",
                                values: {
                                    w300: "Низька (w300)",
                                    w780: "Середня (w780)",
                                    w1280: "Висока (w1280)",
                                    original: "Оригінал"
                                },
                                field: {
                                    name: "Якість фону",
                                    description: "Якість фонових зображень"
                                }
                            },
                            {
                                name: "si_rat",
                                type: "trigger",
                                default: true,
                                field: { name: "Показувати рейтинг" }
                            },
                            {
                                name: "si_colored_ratings",
                                type: "trigger",
                                default: true,
                                field: { name: "Кольорові рейтинги" }
                            },
                            {
                                name: "si_rating_border",
                                type: "trigger",
                                default: false,
                                field: { name: "Обводка рейтингу" }
                            },
                            {
                                name: "si_ganr",
                                type: "trigger",
                                default: true,
                                field: { name: "Показувати жанри" }
                            },
                            {
                                name: "si_year_ogr",
                                type: "trigger",
                                default: true,
                                field: { name: "Показувати вікове обмеження" }
                            },
                            {
                                name: "si_vremya",
                                type: "trigger",
                                default: true,
                                field: { name: "Показувати тривалість" }
                            },
                            {
                                name: "si_status",
                                type: "trigger",
                                default: true,
                                field: { name: "Показувати статус" }
                            },
                            {
                                name: "si_seas",
                                type: "trigger",
                                default: false,
                                field: { name: "Показувати сезони" }
                            },
                            {
                                name: "si_eps",
                                type: "trigger",
                                default: false,
                                field: { name: "Показувати епізоди" }
                            },
                            {
                                name: "si_hide_captions",
                                type: "trigger",
                                default: true,
                                field: {
                                    name: "Приховати підписи",
                                    description: "Потрібне перезавантаження"
                                },
                                onChange: function() {
                                    Lampa.Noty.show("Перезавантаження...");
                                    setTimeout(location.reload, 1000);
                                }
                            },
                            {
                                name: "si_child_mode",
                                type: "trigger",
                                default: false,
                                field: {
                                    name: "Дитячий режим",
                                    description: "Фільтрація контенту"
                                },
                                onChange: function() {
                                    Lampa.Noty.show("Перезавантаження...");
                                    setTimeout(location.reload, 1000);
                                }
                            },
                            {
                                name: "si_clear_cache",
                                type: "static",
                                field: {
                                    name: "Очистити кеш плагіна",
                                    description: "Видалити всі збережені дані"
                                },
                                onRender: function(item) {
                                    item.addEventListener('click', function() {
                                        Lampa.Select.show({
                                            title: "Очистити кеш плагіна?",
                                            items: [
                                                { title: "Так, очистити", confirm: true },
                                                { title: "Скасувати" }
                                            ],
                                            onSelect: function(a) {
                                                if (a.confirm) {
                                                    // Видаляємо наші налаштування
                                                    var keys = [];
                                                    for (var i = 0; i < localStorage.length; i++) {
                                                        var key = localStorage.key(i);
                                                        if (key.indexOf('si_') === 0) {
                                                            keys.push(key);
                                                        }
                                                    }
                                                    
                                                    keys.forEach(function(key) {
                                                        localStorage.removeItem(key);
                                                    });
                                                    
                                                    // Очищаємо глобальний кеш
                                                    SamsungPlugin.cache = {};
                                                    
                                                    Lampa.Noty.show("Кеш очищено. Перезавантаження...");
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
                        settingsList.forEach(function(param) {
                            Lampa.SettingsApi.addParam({
                                component: "samsung_tizen_interface",
                                param: {
                                    name: param.name,
                                    type: param.type,
                                    default: param.default,
                                    values: param.values
                                },
                                field: param.field,
                                onChange: param.onChange,
                                onRender: param.onRender
                            });
                        });
                        
                        // Додаємо пункт у головне меню налаштувань
                        Lampa.SettingsApi.addParam({
                            component: "interface",
                            param: { name: "samsung_tizen_menu", type: "static" },
                            field: { name: "Samsung Tizen Interface" },
                            onRender: function(item) {
                                item.addEventListener('click', function() {
                                    Lampa.Settings.create("samsung_tizen_interface");
                                });
                            }
                        });
                        
                        console.log('Меню налаштувань створено');
                    } catch (error) {
                        console.error('Помилка створення меню налаштувань:', error);
                    }
                }
            }
            
            // Модифікація карток для роботи з плагіном
            function modifyCards() {
                console.log('Модифікація карток...');
                
                // Додаємо обробник клавіатури
                document.addEventListener('keydown', function(e) {
                    // Оновлюємо інтерфейс при навігації
                    if ([37, 38, 39, 40, 13].includes(e.keyCode)) {
                        setTimeout(updateInterface, 100);
                    }
                });
                
                // Додаємо обробник скролу
                var scrollTimer;
                window.addEventListener('scroll', function() {
                    clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(updateInterface, 200);
                });
                
                // Регулярна перевірка оновлення
                setInterval(updateInterface, 1000);
                
                // Додаємо класи до карток
                var cardCheckInterval = setInterval(function() {
                    var cards = document.querySelectorAll('.card:not(.samsung-tizen-card)');
                    if (cards.length > 0) {
                        cards.forEach(function(card) {
                            card.classList.add('samsung-tizen-card');
                        });
                    }
                }, 2000);
            }
            
            // Головна функція ініціалізації
            function main() {
                console.log('Запуск головної ініціалізації...');
                
                // 1. Налаштування
                initSettings();
                
                // 2. Стилі
                addStyles();
                
                // 3. Налаштування в Lampa
                addSettingsToLampa();
                
                // 4. Дитячий режим
                initChildMode();
                
                // 5. Модифікація карток
                setTimeout(modifyCards, 2000);
                
                // 6. Перше оновлення
                setTimeout(updateInterface, 3000);
                
                // 7. Позначаємо як ініціалізований
                SamsungPlugin.initialized = true;
                
                console.log('Samsung Tizen Interface Plugin повністю ініціалізовано');
                
                // Повідомлення про успішне завантаження
                setTimeout(function() {
                    if (Lampa.Noty) {
                        Lampa.Noty.show('Samsung Tizen Interface завантажено');
                    }
                }, 5000);
            }
            
            // Запускаємо головну функцію
            main();
            
        } catch (error) {
            console.error('Критична помилка ініціалізації плагіна:', error);
        }
    }
    
    // Обробник глобальних помилок
    window.addEventListener('error', function(e) {
        console.error('Глобальна помилка в Tizen плагіні:', e.error);
    });
    
})();
