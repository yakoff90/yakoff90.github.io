(function () {
    "use strict";
    
    // Перевірка чи це Samsung Tizen
    var isTizen = typeof tizen !== 'undefined' || 
                 (navigator.userAgent.toLowerCase().indexOf('tizen') > -1) ||
                 (navigator.userAgent.toLowerCase().indexOf('samsung') > -1 && 
                  navigator.userAgent.toLowerCase().indexOf('smarttv') > -1);
    
    if (!isTizen) {
        console.log('Ця версія призначена тільки для Samsung Tizen');
        return;
    }
    
    if (typeof Lampa === "undefined") return;
    if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
    if (window.plugin_interface_ready_v3_tizen) return;
    
    window.plugin_interface_ready_v3_tizen = true;
    
    // Глобальний кеш для Tizen (обмежений розмір)
    var globalInfoCache = {};
    var MAX_CACHE_SIZE = 50;
    
    // Налаштування за замовчуванням для Tizen
    Lampa.Storage.set("interface_size", "small");
    Lampa.Storage.set("background", "false");
    
    // Основний таймер для оновлення інтерфейсу
    var updateTimer = null;
    var currentFocusedCard = null;
    
    // Ініціалізація
    addStyles();
    initializeSettings();
    
    // Спостереження за змінами (спрощена версія для Tizen)
    setupSimpleObserver();
    
    var mainMaker = Lampa.Maker.map("Main");
    if (!mainMaker || !mainMaker.Items || !mainMaker.Create) return;
    
    // Обгортка методів для Tizen
    wrapMethodSafe(mainMaker.Items, "onInit", function (originalMethod, args) {
        this.__newInterfaceEnabled = shouldEnableInterface(this && this.object);
        
        if (this.__newInterfaceEnabled) {
            if (this.object) this.object.wide = false;
            this.wide = false;
        }
        
        if (originalMethod) originalMethod.apply(this, args);
    });
    
    wrapMethodSafe(mainMaker.Create, "onCreate", function (originalMethod, args) {
        if (originalMethod) originalMethod.apply(this, args);
        if (!this.__newInterfaceEnabled) return;
        
        var state = getOrCreateState(this);
        state.attach();
    });
    
    wrapMethodSafe(mainMaker.Create, "onCreateAndAppend", function (originalMethod, args) {
        var data = args && args[0];
        if (this.__newInterfaceEnabled && data) {
            data.wide = false;
            
            if (!data.params) data.params = {};
            if (!data.params.items) data.params.items = {};
            data.params.items.view = 8; // Менше карток для Tizen
            data.params.items_per_row = 8;
            data.items_per_row = 8;
            
            extendResultsWithStyle(data);
        }
        return originalMethod ? originalMethod.apply(this, args) : undefined;
    });
    
    wrapMethodSafe(mainMaker.Items, "onAppend", function (originalMethod, args) {
        if (originalMethod) originalMethod.apply(this, args);
        if (!this.__newInterfaceEnabled) return;
        
        var element = args && args[0];
        var data = args && args[1];
        
        if (element && data) {
            handleLineAppend(this, element, data);
        }
    });
    
    wrapMethodSafe(mainMaker.Items, "onDestroy", function (originalMethod, args) {
        if (this.__newInterfaceState) {
            this.__newInterfaceState.destroy();
            delete this.__newInterfaceState;
        }
        delete this.__newInterfaceEnabled;
        if (originalMethod) originalMethod.apply(this, args);
    });
    
    function shouldEnableInterface(object) {
        if (!object) return false;
        if (object.title === "Избранное") return false;
        
        // Для Tizen завжди вмикаємо інтерфейс
        return true;
    }
    
    function getOrCreateState(createInstance) {
        if (createInstance.__newInterfaceState) {
            return createInstance.__newInterfaceState;
        }
        var state = createState(createInstance);
        createInstance.__newInterfaceState = state;
        return state;
    }
    
    function createState(mainInstance) {
        var infoPanel = new InfoPanel();
        infoPanel.create();
        
        // Спрощена версія фону для Tizen
        var backgroundWrapper = document.createElement("div");
        backgroundWrapper.className = "tizen-background-wrapper";
        
        var bg = document.createElement("div");
        bg.className = "tizen-background";
        backgroundWrapper.appendChild(bg);
        
        var state = {
            main: mainInstance,
            info: infoPanel,
            background: bg,
            infoElement: null,
            attached: false,
            currentBg: "",
            
            attach: function () {
                if (this.attached) return;
                
                var container = mainInstance.render(true);
                if (!container) return;
                
                container.classList.add("tizen-interface");
                
                // Додаємо фон
                if (!backgroundWrapper.parentElement) {
                    container.insertBefore(backgroundWrapper, container.firstChild);
                }
                
                // Додаємо інфо-панель
                var infoElement = infoPanel.render(true);
                this.infoElement = infoElement;
                
                if (infoElement && infoElement.parentNode !== container) {
                    container.insertBefore(infoElement, backgroundWrapper.nextSibling);
                }
                
                this.attached = true;
            },
            
            update: function (data) {
                if (!data) return;
                
                // Оновлюємо інфо-панель
                infoPanel.update(data);
                
                // Оновлюємо фон (спрощено)
                this.updateBackground(data);
            },
            
            updateBackground: function (data) {
                try {
                    var show_bg = Lampa.Storage.field("show_background", true).value();
                    if (!show_bg || !data || !data.backdrop_path) {
                        this.background.style.opacity = "0";
                        this.currentBg = "";
                        return;
                    }
                    
                    var bgUrl = Lampa.Api.img(data.backdrop_path, "w780"); // Використовуємо менше роздільну здатність
                    
                    if (bgUrl === this.currentBg) return;
                    
                    this.currentBg = bgUrl;
                    
                    // Плавна зміна фону
                    this.background.style.transition = "opacity 0.5s ease";
                    this.background.style.opacity = "0";
                    
                    var img = new Image();
                    var self = this;
                    
                    img.onload = function () {
                        self.background.style.backgroundImage = "url('" + bgUrl + "')";
                        setTimeout(function () {
                            self.background.style.opacity = "0.4";
                        }, 50);
                    };
                    
                    img.onerror = function () {
                        self.background.style.opacity = "0";
                        self.currentBg = "";
                    };
                    
                    img.src = bgUrl;
                    
                } catch (e) {
                    console.log("Tizen background error:", e);
                }
            },
            
            reset: function () {
                infoPanel.empty();
                this.background.style.opacity = "0";
            },
            
            destroy: function () {
                infoPanel.destroy();
                
                var container = mainInstance.render(true);
                if (container) {
                    container.classList.remove("tizen-interface");
                }
                
                if (this.infoElement && this.infoElement.parentNode) {
                    this.infoElement.parentNode.removeChild(this.infoElement);
                }
                
                if (backgroundWrapper && backgroundWrapper.parentNode) {
                    backgroundWrapper.parentNode.removeChild(backgroundWrapper);
                }
                
                this.attached = false;
            }
        };
        
        return state;
    }
    
    function extendResultsWithStyle(data) {
        if (!data || !Array.isArray(data.results)) return;
        
        data.results.forEach(function (card) {
            card.wide = false;
        });
        
        // Використовуємо нативний метод замість Lampa.Utils.extendItemsParams
        var styleName = Lampa.Storage.field("wide_post", true).value() ? "wide" : "small";
        
        data.results.forEach(function(card) {
            if (!card.params) card.params = {};
            if (!card.params.style) card.params.style = {};
            card.params.style.name = styleName;
        });
    }
    
    function handleCard(state, card) {
        if (!card || card.__newInterfaceCard) return;
        if (typeof card.use !== "function" || !card.data) return;
        
        card.__newInterfaceCard = true;
        
        // Налаштовуємо стиль картки
        var targetStyle = Lampa.Storage.field("wide_post", true).value() ? "wide" : "small";
        
        if (!card.params) card.params = {};
        if (!card.params.style) card.params.style = {};
        card.params.style.name = targetStyle;
        
        // Додаємо класи для стилізації
        try {
            var element = card.render ? card.render(true) : null;
            if (element) {
                var node = element.nodeName ? element : (element[0] || element);
                if (node && node.classList) {
                    node.classList.add("tizen-card");
                    node.classList.add("card--" + targetStyle);
                }
            }
        } catch (e) {}
        
        // Підписуємося на події
        card.use({
            onFocus: function () {
                currentFocusedCard = card.data;
                state.update(card.data);
            },
            onHover: function () {
                currentFocusedCard = card.data;
                state.update(card.data);
            },
            onDestroy: function () {
                delete card.__newInterfaceCard;
            }
        });
    }
    
    function handleLineAppend(items, line, data) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;
        
        var state = getOrCreateState(items);
        
        // Налаштовуємо кількість карток у рядку
        line.items_per_row = 8;
        line.view = 8;
        if (line.params) {
            line.params.items_per_row = 8;
            if (line.params.items) line.params.items.view = 8;
        }
        
        // Обробляємо картки
        var processCard = function (card) {
            handleCard(state, card);
        };
        
        // Підписуємося на події лінії
        line.use({
            onInstance: processCard,
            onActive: function (card) {
                if (card && card.data) {
                    currentFocusedCard = card.data;
                    state.update(card.data);
                }
            },
            onMore: function () {
                state.reset();
            },
            onDestroy: function () {
                state.reset();
                delete line.__newInterfaceLine;
            }
        });
        
        // Обробляємо існуючі картки
        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(processCard);
        }
    }
    
    function wrapMethodSafe(object, methodName, wrapper) {
        if (!object || typeof object[methodName] !== "function") return;
        
        var originalMethod = object[methodName];
        
        object[methodName] = function () {
            try {
                var args = Array.prototype.slice.call(arguments);
                return wrapper.call(this, originalMethod, args);
            } catch (e) {
                console.log("Tizen wrapMethod error:", e);
                return originalMethod.apply(this, arguments);
            }
        };
    }
    
    function addStyles() {
        if (document.getElementById("tizen-interface-styles")) return;
        
        var style = document.createElement("style");
        style.id = "tizen-interface-styles";
        style.textContent = getTizenStyles();
        document.head.appendChild(style);
    }
    
    function getTizenStyles() {
        var widePost = Lampa.Storage.field("wide_post", true).value();
        
        return `
            /* Основні стилі для Tizen */
            .tizen-interface {
                position: relative;
                min-height: 100vh;
            }
            
            .tizen-background-wrapper {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                overflow: hidden;
            }
            
            .tizen-background {
                position: absolute;
                width: 100%;
                height: 120%;
                top: -10%;
                left: 0;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                opacity: 0;
                transition: opacity 0.8s ease;
                filter: blur(10px) brightness(0.7);
            }
            
            .tizen-info-panel {
                position: relative;
                padding: 1.5em 2em;
                height: ${widePost ? '25em' : '20em'};
                background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%);
                z-index: 10;
            }
            
            .tizen-info-body {
                max-width: 70%;
                padding-top: 1em;
            }
            
            .tizen-info-title {
                font-size: ${widePost ? '3.5em' : '2.8em'};
                font-weight: 600;
                margin-bottom: 0.3em;
                color: white;
                line-height: 1.2;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            
            .tizen-info-details {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.8em;
                margin: 1em 0;
                font-size: 1.2em;
                color: rgba(255,255,255,0.8);
            }
            
            .tizen-info-description {
                font-size: 1.3em;
                line-height: 1.4;
                color: rgba(255,255,255,0.9);
                margin-top: 1em;
                max-height: ${widePost ? '6.5em' : '4.5em'};
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: ${widePost ? 3 : 2};
                -webkit-box-orient: vertical;
            }
            
            .tizen-info-rating {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                padding: 0.3em 0.6em;
                background: rgba(0,0,0,0.5);
                border-radius: 4px;
                font-size: 0.9em;
                min-width: 3.5em;
            }
            
            .tizen-info-rating-value {
                font-weight: bold;
                font-size: 1.2em;
            }
            
            .tizen-info-rating-label {
                font-size: 0.8em;
                opacity: 0.7;
            }
            
            .tizen-info-separator {
                margin: 0 0.5em;
                opacity: 0.5;
            }
            
            .tizen-info-genre {
                color: #ffcc00;
            }
            
            .tizen-info-year {
                color: #00ccff;
            }
            
            .tizen-info-age {
                padding: 0.1em 0.5em;
                background: rgba(255,50,50,0.3);
                border-radius: 3px;
                font-size: 0.9em;
            }
            
            /* Стилі карток для Tizen */
            .tizen-interface .tizen-card {
                transition: transform 0.2s ease;
            }
            
            .tizen-interface .tizen-card.focus {
                transform: scale(1.05);
                z-index: 100;
            }
            
            .tizen-interface .card--wide {
                width: 16em !important;
            }
            
            .tizen-interface .card--small {
                width: 14em !important;
            }
            
            .tizen-interface .items-line {
                padding-bottom: 3em !important;
            }
            
            /* Приховування підписів якщо потрібно */
            ${Lampa.Storage.field("hide_captions", true).value() ? 
                `.tizen-interface .card:not(.card--collection) .card__age,
                 .tizen-interface .card:not(.card--collection) .card__title {
                    display: none !important;
                 }` : ''}
            
            /* Анімації для Tizen */
            @keyframes tizen-card-focus {
                0% { transform: scale(1); }
                100% { transform: scale(1.05); }
            }
            
            .tizen-interface .tizen-card.focus {
                animation: tizen-card-focus 0.2s ease forwards;
            }
            
            /* Адаптація для темної теми */
            body.light--version .tizen-info-panel {
                background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 50%, transparent 100%);
            }
            
            body.light--version .tizen-info-title,
            body.light--version .tizen-info-description,
            body.light--version .tizen-info-details {
                color: rgba(0,0,0,0.9);
            }
            
            /* Оптимізація для 4K телевізорів */
            @media (min-width: 3840px) {
                .tizen-info-title {
                    font-size: ${widePost ? '5em' : '4em'};
                }
                
                .tizen-info-details {
                    font-size: 1.8em;
                }
                
                .tizen-info-description {
                    font-size: 2em;
                }
                
                .tizen-interface .card--wide {
                    width: 24em !important;
                }
                
                .tizen-interface .card--small {
                    width: 20em !important;
                }
            }
        `;
    }
    
    function InfoPanel() {
        this.element = null;
        this.currentData = null;
        this.updateTimer = null;
    }
    
    InfoPanel.prototype.create = function() {
        var html = `
            <div class="tizen-info-panel">
                <div class="tizen-info-body">
                    <div class="tizen-info-title"></div>
                    <div class="tizen-info-details"></div>
                    <div class="tizen-info-description"></div>
                </div>
            </div>
        `;
        
        var div = document.createElement('div');
        div.innerHTML = html;
        this.element = div.firstChild;
    };
    
    InfoPanel.prototype.render = function(asElement) {
        if (!this.element) this.create();
        return asElement ? this.element : $(this.element);
    };
    
    InfoPanel.prototype.update = function(data) {
        if (!data || !this.element) return;
        this.currentData = data;
        
        clearTimeout(this.updateTimer);
        var self = this;
        
        this.updateTimer = setTimeout(function() {
            self._updateContent(data);
        }, 50); // Невелика затримка для плавності
    };
    
    InfoPanel.prototype._updateContent = function(data) {
        try {
            var titleEl = this.element.querySelector('.tizen-info-title');
            var detailsEl = this.element.querySelector('.tizen-info-details');
            var descEl = this.element.querySelector('.tizen-info-description');
            
            if (!titleEl || !detailsEl || !descEl) return;
            
            // Заголовок
            titleEl.textContent = data.title || data.name || '';
            
            // Опис
            descEl.textContent = data.overview || Lampa.Lang.translate("full_notext");
            
            // Деталі
            var details = [];
            
            // Рейтинг
            if (Lampa.Storage.field("rat", true).value() && data.vote_average) {
                var rating = parseFloat(data.vote_average).toFixed(1);
                var color = this._getRatingColor(rating);
                var ratingStyle = color ? `style="color: ${color}"` : '';
                
                details.push(`
                    <div class="tizen-info-rating" ${ratingStyle}>
                        <div class="tizen-info-rating-value">${rating}</div>
                        <div class="tizen-info-rating-label">TMDB</div>
                    </div>
                `);
            }
            
            // Рік
            var year = (data.release_date || data.first_air_date || '').substring(0,4);
            if (year && year !== '0000') {
                details.push(`<span class="tizen-info-year">${year}</span>`);
            }
            
            // Жанри
            if (Lampa.Storage.field("ganr", true).value() && data.genres && data.genres.length) {
                var genres = data.genres.slice(0, 2).map(g => g.name).join(', ');
                details.push(`<span class="tizen-info-genre">${genres}</span>`);
            }
            
            // Тривалість
            if (Lampa.Storage.field("vremya", true).value() && data.runtime) {
                var time = Lampa.Utils.secondsToTime(data.runtime * 60, true);
                details.push(`<span>${time}</span>`);
            }
            
            // Вікове обмеження
            if (Lampa.Storage.field("year_ogr", true).value()) {
                var ageRating = this._getAgeRating(data);
                if (ageRating) {
                    details.push(`<span class="tizen-info-age">${ageRating}+</span>`);
                }
            }
            
            // Статус
            if (Lampa.Storage.field("status", true).value() && data.status) {
                var status = this._translateStatus(data.status);
                if (status) {
                    details.push(`<span>${status}</span>`);
                }
            }
            
            // Відображаємо деталі
            detailsEl.innerHTML = details.join('<span class="tizen-info-separator">•</span>');
            
        } catch (e) {
            console.log("Tizen info panel error:", e);
        }
    };
    
    InfoPanel.prototype._getRatingColor = function(rating) {
        if (!Lampa.Storage.field("si_colored_ratings", true).value()) return '';
        
        var vote = parseFloat(rating);
        if (vote >= 0 && vote <= 3) return "#ff4444";
        if (vote > 3 && vote < 6) return "#ffaa44";
        if (vote >= 6 && vote < 7) return "#44aaff";
        if (vote >= 7 && vote < 8) return "#aa44ff";
        if (vote >= 8 && vote <= 10) return "#44ff44";
        return '';
    };
    
    InfoPanel.prototype._getAgeRating = function(data) {
        try {
            if (data.release_dates && data.release_dates.results) {
                var ruRelease = data.release_dates.results.find(r => r.iso_3166_1 === 'RU');
                if (ruRelease && ruRelease.release_dates && ruRelease.release_dates[0]) {
                    return ruRelease.release_dates[0].certification;
                }
            }
            if (data.content_ratings && data.content_ratings.results) {
                var ruRating = data.content_ratings.results.find(r => r.iso_3166_1 === 'RU');
                if (ruRating && ruRating.rating) return ruRating.rating;
            }
        } catch (e) {}
        return '';
    };
    
    InfoPanel.prototype._translateStatus = function(status) {
        var statusMap = {
            'released': 'Випущений',
            'ended': 'Завершено',
            'returning series': 'Продовжується',
            'canceled': 'Скасовано',
            'in production': 'В производстве',
            'post production': 'Пост-продакшн',
            'planned': 'Заплановано'
        };
        return statusMap[status.toLowerCase()] || status;
    };
    
    InfoPanel.prototype.empty = function() {
        if (!this.element) return;
        
        var titleEl = this.element.querySelector('.tizen-info-title');
        var detailsEl = this.element.querySelector('.tizen-info-details');
        var descEl = this.element.querySelector('.tizen-info-description');
        
        if (titleEl) titleEl.textContent = '';
        if (detailsEl) detailsEl.innerHTML = '';
        if (descEl) descEl.textContent = '';
    };
    
    InfoPanel.prototype.destroy = function() {
        clearTimeout(this.updateTimer);
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.currentData = null;
    };
    
    function setupSimpleObserver() {
        // Спрощене спостереження для Tizen
        var checkInterval = null;
        
        function checkForCards() {
            var cards = document.querySelectorAll('.card:not(.tizen-card)');
            if (cards.length > 0) {
                cards.forEach(function(card) {
                    card.classList.add('tizen-card');
                });
            }
        }
        
        checkInterval = setInterval(checkForCards, 1000);
        
        // Зупиняємо перевірку при виході
        window.addEventListener('beforeunload', function() {
            if (checkInterval) clearInterval(checkInterval);
        });
    }
    
    function initializeSettings() {
        // Чекаємо на готовність Lampa
        var initAttempts = 0;
        var maxAttempts = 10;
        
        function tryInit() {
            if (typeof Lampa.SettingsApi === 'undefined') {
                if (initAttempts < maxAttempts) {
                    initAttempts++;
                    setTimeout(tryInit, 500);
                }
                return;
            }
            
            // Додаємо налаштування для Tizen
            addTizenSettings();
        }
        
        setTimeout(tryInit, 1000);
    }
    
    function addTizenSettings() {
        try {
            // Основний компонент налаштувань
            Lampa.SettingsApi.addComponent({
                component: "style_interface_tizen",
                name: "Інтерфейс для Samsung"
            });
            
            // Параметри
            var settings = [
                {
                    name: "wide_post",
                    type: "trigger",
                    default: true,
                    field: { name: "Широкі постереи", description: "Перезавантаження потрібне" },
                    onChange: function() { setTimeout(() => location.reload(), 100); }
                },
                {
                    name: "show_background",
                    type: "trigger",
                    default: true,
                    field: { name: "Фонове зображення" }
                },
                {
                    name: "rat",
                    type: "trigger",
                    default: true,
                    field: { name: "Показувати рейтинг" }
                },
                {
                    name: "ganr",
                    type: "trigger",
                    default: true,
                    field: { name: "Показувати жанри" }
                },
                {
                    name: "vremya",
                    type: "trigger",
                    default: true,
                    field: { name: "Показувати тривалість" }
                },
                {
                    name: "year_ogr",
                    type: "trigger",
                    default: true,
                    field: { name: "Показувати вікове обмеження" }
                },
                {
                    name: "status",
                    type: "trigger",
                    default: true,
                    field: { name: "Показувати статус" }
                },
                {
                    name: "si_colored_ratings",
                    type: "trigger",
                    default: true,
                    field: { name: "Кольорові рейтинги" }
                },
                {
                    name: "hide_captions",
                    type: "trigger",
                    default: true,
                    field: { name: "Приховати підписи", description: "Перезавантаження потрібне" },
                    onChange: function() { setTimeout(() => location.reload(), 100); }
                }
            ];
            
            // Додаємо всі параметри
            settings.forEach(function(setting) {
                Lampa.SettingsApi.addParam({
                    component: "style_interface_tizen",
                    param: {
                        name: setting.name,
                        type: setting.type,
                        default: setting.default
                    },
                    field: setting.field,
                    onChange: setting.onChange
                });
            });
            
            // Кнопка очищення кешу
            Lampa.SettingsApi.addParam({
                component: "style_interface_tizen",
                param: { name: "clear_tizen_cache", type: "static" },
                field: { name: "Очистити кеш", description: "Очистити всі дані плагіна" },
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
                                    // Очищаємо localStorage
                                    var keys = [];
                                    for (var i = 0; i < localStorage.length; i++) {
                                        var key = localStorage.key(i);
                                        if (key.indexOf('tizen_') === 0 || 
                                            key.indexOf('logo_') === 0 ||
                                            key.indexOf('int_') === 0) {
                                            keys.push(key);
                                        }
                                    }
                                    keys.forEach(function(key) {
                                        localStorage.removeItem(key);
                                    });
                                    
                                    // Очищаємо глобальний кеш
                                    globalInfoCache = {};
                                    
                                    Lampa.Noty.show("Кеш очищено. Перезавантаження...");
                                    setTimeout(function() {
                                        location.reload();
                                    }, 1000);
                                }
                            }
                        });
                    });
                }
            });
            
            // Встановлюємо значення за замовчуванням при першому запуску
            if (!Lampa.Storage.get('tizen_interface_initialized')) {
                settings.forEach(function(setting) {
                    Lampa.Storage.set(setting.name, setting.default.toString());
                });
                Lampa.Storage.set('tizen_interface_initialized', 'true');
            }
            
        } catch (e) {
            console.log("Tizen settings error:", e);
        }
    }
    
    // Додаємо обробку подій клавіатури для Tizen
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
            // При навігації оновлюємо інтерфейс
            if (updateTimer) clearTimeout(updateTimer);
            updateTimer = setTimeout(function() {
                var focused = document.querySelector('.selector.focus, .focus');
                if (focused) {
                    var cardData = findCardData(focused);
                    if (cardData) {
                        // Оновлюємо всі активні стани
                        var containers = document.querySelectorAll('.tizen-interface');
                        containers.forEach(function(container) {
                            var state = container.__newInterfaceState;
                            if (state && typeof state.update === 'function') {
                                state.update(cardData);
                            }
                        });
                    }
                }
            }, 100);
        }
    });
    
    function findCardData(element) {
        if (!element) return null;
        
        var node = element.nodeName ? element : (element[0] || element);
        
        // Шукаємо дані картки
        while (node && !node.card_data && node !== document.body) {
            node = node.parentNode;
        }
        
        return node && node.card_data ? node.card_data : null;
    }
    
    // Оптимізація для Tizen
    window.addEventListener('load', function() {
        // Зменшуємо кількість одночасних запитів
        if (window.Lampa && Lampa.Reguest) {
            var originalRequest = Lampa.Reguest.prototype.silent;
            Lampa.Reguest.prototype.silent = function(url, callback) {
                // Обмежуємо кількість одночасних запитів
                if (this.activeRequests && this.activeRequests >= 3) {
                    setTimeout(function() {
                        originalRequest.call(this, url, callback);
                    }.bind(this), 100);
                    return;
                }
                originalRequest.call(this, url, callback);
            };
        }
    });
    
    console.log('Tizen Interface Plugin loaded successfully');
    
})();
