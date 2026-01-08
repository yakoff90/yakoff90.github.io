(function () {
    "use strict";
    
    console.log("Стильний інтерфейс v3: Завантаження для TV...");
    
    // Примусово TV режим
    Lampa.Platform.tv();
    
    // Вимкнемо складні перевірки
    var isTV = true;

    if (typeof Lampa === "undefined") {
        console.log("Lampa не знайдено");
        return;
    }
    
    if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) {
        console.log("Необхідні компоненти Lampa відсутні");
        return;
    }
    
    if (window.plugin_interface_ready_v3) {
        console.log("Плагін вже завантажено");
        return;
    }

    window.plugin_interface_ready_v3 = true;
    console.log("Стильний інтерфейс: Ініціалізація");

    var globalInfoCache = {};

    // Прості налаштування за замовчуванням
    Lampa.Storage.set("interface_size", "small");
    Lampa.Storage.set("background", "false");
    
    // Оптимізації для TV - прибираємо анімації
    Lampa.Storage.set("advanced_animation", "false");
    Lampa.Storage.set("async_load", "true");

    // Додаємо стилі (спрощені для TV)
    addTVStyles();
    // Ініціалізуємо налаштування
    initializeTVSettings();
    
    // Запускаємо основний функціонал
    startInterfaceModification();

    // Спрощені стилі для TV
    function addTVStyles() {
        if (window.tv_styles_added) return;
        window.tv_styles_added = true;
        
        var style = document.createElement('style');
        style.id = 'tv-interface-styles';
        style.textContent = `
            /* Основні стилі для TV */
            .new-interface {
                position: relative;
            }
            
            .new-interface-info {
                position: relative;
                padding: 30px 40px;
                height: 220px;
                background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%);
                z-index: 100;
                margin-bottom: 20px;
            }
            
            .new-interface-info__body {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .new-interface-info__title {
                font-size: 46px;
                font-weight: 600;
                margin-bottom: 15px;
                color: white;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .new-interface-info__details {
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
                font-size: 24px;
                color: rgba(255,255,255,0.9);
            }
            
            .new-interface-info__description {
                font-size: 26px;
                font-weight: 300;
                line-height: 1.4;
                color: rgba(255,255,255,0.9);
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                line-clamp: 2;
                -webkit-box-orient: vertical;
                max-width: 80%;
            }
            
            .full-start__rate {
                font-size: 22px;
                padding: 5px 10px;
                background: rgba(0,0,0,0.5);
                border-radius: 4px;
                color: #ffd700;
            }
            
            /* Картки для TV */
            .new-interface .card {
                width: 280px !important;
                margin: 10px !important;
            }
            
            .new-interface .card.card--wide {
                width: 300px !important;
            }
            
            .new-interface .items-line {
                padding-left: 40px !important;
                padding-right: 40px !important;
            }
            
            .full-start__background-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
                overflow: hidden;
            }
            
            .full-start__background {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                opacity: 0;
                object-fit: cover;
                filter: blur(10px) brightness(0.6);
            }
            
            .full-start__background.active {
                opacity: 0.3;
            }
            
            /* Приховування підписів */
            ${Lampa.Storage.get("hide_captions", true) ? ".card:not(.card--collection) .card__age, .card:not(.card--collection) .card__title { opacity: 0 !important; }" : ""}
            
            /* TV оптимізації */
            @media (min-width: 1920px) {
                .new-interface-info__title {
                    font-size: 52px;
                }
                
                .new-interface-info__description {
                    font-size: 28px;
                }
                
                .new-interface .card {
                    width: 320px !important;
                }
                
                .new-interface .card.card--wide {
                    width: 340px !important;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log("Стильний інтерфейс: Стилі додані");
    }

    function startInterfaceModification() {
        console.log("Стильний інтерфейс: Початок модифікації");
        
        // Чекаємо готовності Lampa
        var checkInterval = setInterval(function() {
            var mainMaker = Lampa.Maker.map("Main");
            
            if (mainMaker && mainMaker.Items && mainMaker.Create) {
                clearInterval(checkInterval);
                console.log("Стильний інтерфейс: Lampa готова");
                applyModifications(mainMaker);
            }
        }, 100);
    }

    function applyModifications(mainMaker) {
        // Зберігаємо оригінальні методи
        var originalItemsInit = mainMaker.Items.onInit;
        var originalCreate = mainMaker.Create.onCreate;
        var originalCreateAndAppend = mainMaker.Create.onCreateAndAppend;
        var originalItemsAppend = mainMaker.Items.onAppend;
        var originalItemsDestroy = mainMaker.Items.onDestroy;
        
        // Модифікуємо onInit
        mainMaker.Items.onInit = function() {
            var result = originalItemsInit ? originalItemsInit.apply(this, arguments) : undefined;
            
            this.__newInterfaceEnabled = true;
            
            if (this.__newInterfaceEnabled) {
                if (this.object) {
                    this.object.wide = false;
                    // Для TV - менше карток
                    if (!this.object.params) this.object.params = {};
                    this.object.params.items_per_row = 6;
                    this.object.params.view = 6;
                }
                this.wide = false;
            }
            
            return result;
        };
        
        // Модифікуємо onCreate
        mainMaker.Create.onCreate = function() {
            var result = originalCreate ? originalCreate.apply(this, arguments) : undefined;
            
            if (this.__newInterfaceEnabled) {
                var state = getOrCreateState(this);
                setTimeout(function() {
                    state.attach();
                }, 100);
            }
            
            return result;
        };
        
        // Модифікуємо onCreateAndAppend
        mainMaker.Create.onCreateAndAppend = function() {
            var args = arguments;
            var data = args && args[0];
            
            if (this.__newInterfaceEnabled && data) {
                data.wide = false;
                
                if (!data.params) data.params = {};
                if (!data.params.items) data.params.items = {};
                
                // Для TV
                data.params.items.view = 6;
                data.params.items_per_row = 6;
                data.items_per_row = 6;
                
                // Застосовуємо стилі
                if (Array.isArray(data.results)) {
                    data.results.forEach(function(card) {
                        card.wide = false;
                    });
                    
                    Lampa.Utils.extendItemsParams(data.results, {
                        style: {
                            name: Lampa.Storage.get("wide_post") !== false ? "wide" : "small",
                        },
                    });
                }
            }
            
            return originalCreateAndAppend ? originalCreateAndAppend.apply(this, arguments) : undefined;
        };
        
        // Модифікуємо onAppend
        mainMaker.Items.onAppend = function() {
            var result = originalItemsAppend ? originalItemsAppend.apply(this, arguments) : undefined;
            
            if (this.__newInterfaceEnabled) {
                var element = arguments[0];
                var data = arguments[1];
                
                if (element && data && !element.__newInterfaceLine) {
                    setTimeout(function() {
                        handleLineAppend(this, element, data);
                    }.bind(this), 50);
                }
            }
            
            return result;
        };
        
        // Модифікуємо onDestroy
        mainMaker.Items.onDestroy = function() {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            
            return originalItemsDestroy ? originalItemsDestroy.apply(this, arguments) : undefined;
        };
        
        console.log("Стильний інтерфейс: Модифікації застосовані");
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
        
        var backgroundWrapper = document.createElement("div");
        backgroundWrapper.className = "full-start__background-wrapper";
        
        var bg = document.createElement("img");
        bg.className = "full-start__background";
        bg.alt = "";
        backgroundWrapper.appendChild(bg);
        
        var state = {
            main: mainInstance,
            info: infoPanel,
            background: bg,
            infoElement: null,
            backgroundTimer: null,
            attached: false,
            
            attach: function() {
                if (this.attached) return;
                
                var container = mainInstance.render();
                if (!container) return;
                
                container.classList.add("new-interface");
                
                // Додаємо фон
                if (!backgroundWrapper.parentElement) {
                    container.insertBefore(backgroundWrapper, container.firstChild);
                }
                
                // Додаємо інфо панель
                var infoElement = infoPanel.render(true);
                this.infoElement = infoElement;
                
                if (infoElement && infoElement.parentNode !== container) {
                    container.insertBefore(infoElement, container.firstChild);
                }
                
                this.attached = true;
                console.log("Стильний інтерфейс: Інтерфейс приєднано");
            },
            
            update: function(data) {
                if (!data) return;
                
                infoPanel.update(data);
                
                // Оновлюємо фон
                var show_bg = Lampa.Storage.get("show_background", true);
                if (show_bg && data.backdrop_path) {
                    var bg_resolution = Lampa.Storage.get("background_resolution", "w1280");
                    var backdropUrl = Lampa.Api.img(data.backdrop_path, bg_resolution);
                    
                    clearTimeout(this.backgroundTimer);
                    
                    this.backgroundTimer = setTimeout(function() {
                        bg.src = backdropUrl;
                        setTimeout(function() {
                            bg.classList.add("active");
                        }, 100);
                    }, 300);
                } else {
                    bg.classList.remove("active");
                }
            },
            
            reset: function() {
                infoPanel.empty();
                bg.classList.remove("active");
            },
            
            destroy: function() {
                clearTimeout(this.backgroundTimer);
                infoPanel.destroy();
                
                var container = this.main.render();
                if (container) {
                    container.classList.remove("new-interface");
                }
                
                if (this.infoElement && this.infoElement.parentNode) {
                    this.infoElement.parentNode.removeChild(this.infoElement);
                }
                
                if (backgroundWrapper.parentNode) {
                    backgroundWrapper.parentNode.removeChild(backgroundWrapper);
                }
                
                this.attached = false;
            }
        };
        
        return state;
    }

    function handleLineAppend(items, line, data) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;
        
        var state = getOrCreateState(items);
        
        // Налаштування лінії для TV
        line.items_per_row = 6;
        line.view = 6;
        
        if (line.params) {
            line.params.items_per_row = 6;
            if (line.params.items) {
                line.params.items.view = 6;
            }
        }
        
        // Обробка карток у лінії
        var processCard = function(card) {
            if (!card || card.__newInterfaceCard) return;
            if (typeof card.use !== "function" || !card.data) return;
            
            card.__newInterfaceCard = true;
            
            // Застосовуємо стиль
            var targetStyle = Lampa.Storage.get("wide_post") !== false ? "wide" : "small";
            card.params = card.params || {};
            card.params.style = card.params.style || {};
            card.params.style.name = targetStyle;
            
            // Оновлюємо відображення
            if (card.render) {
                var element = card.render(true);
                if (element) {
                    var node = element.jquery ? element[0] : element;
                    if (node && node.classList) {
                        node.classList.add("card--" + targetStyle);
                    }
                }
            }
            
            // Додаємо обробники подій
            card.use({
                onFocus: function() {
                    state.update(card.data);
                },
                onHover: function() {
                    state.update(card.data);
                },
                onDestroy: function() {
                    delete card.__newInterfaceCard;
                }
            });
        };
        
        // Додаємо обробники подій для лінії
        line.use({
            onInstance: function(instance) {
                processCard(instance);
            },
            onActive: function(card, results) {
                var cardData = card && card.data ? card.data : 
                             (results && results.results && results.results[0]) ? results.results[0] : null;
                if (cardData) state.update(cardData);
            },
            onDestroy: function() {
                state.reset();
                delete line.__newInterfaceLine;
            }
        });
        
        // Обробляємо існуючі картки
        if (Array.isArray(line.items)) {
            line.items.forEach(processCard);
        }
    }

    function InfoPanel() {
        this.html = null;
        this.timer = null;
        this.network = new Lampa.Reguest();
        this.loaded = globalInfoCache;
        this.currentUrl = null;
    }

    InfoPanel.prototype.create = function() {
        this.html = $(`
            <div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__title"></div>
                    <div class="new-interface-info__details"></div>
                    <div class="new-interface-info__description"></div>
                </div>
            </div>
        `);
    };

    InfoPanel.prototype.render = function(asElement) {
        if (!this.html) this.create();
        return asElement ? this.html[0] : this.html;
    };

    InfoPanel.prototype.update = function(data) {
        if (!data || !this.html) return;
        
        // Оновлюємо заголовок
        var title = this.html.find(".new-interface-info__title");
        var desc = this.html.find(".new-interface-info__description");
        
        title.text(data.title || data.name || "");
        desc.text(data.overview || "Опис відсутній");
        
        // Завантажуємо деталі
        this.load(data);
        
        // Спроба показати логотип
        if (Lampa.Storage.get("logo_show", true)) {
            this.tryShowLogo(data);
        }
    };

    InfoPanel.prototype.tryShowLogo = function(data) {
        if (!data || !data.id) return;
        
        var type = data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "en";
        var cacheKey = "logo_tv_" + type + "_" + data.id + "_" + language;
        var cachedUrl = Lampa.Storage.get(cacheKey);
        
        if (cachedUrl && cachedUrl !== "none") {
            this.showLogoImage(cachedUrl);
        }
    };

    InfoPanel.prototype.showLogoImage = function(imgUrl) {
        var title = this.html.find(".new-interface-info__title");
        if (!title.length) return;
        
        var img = new Image();
        img.onload = function() {
            title.empty().append(img);
            img.style.maxHeight = "60px";
            img.style.maxWidth = "300px";
            img.style.objectFit = "contain";
        };
        img.src = imgUrl;
    };

    InfoPanel.prototype.load = function(data) {
        if (!data || !data.id) return;
        
        var mediaType = data.media_type === "tv" || data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "ru";
        var apiUrl = Lampa.TMDB.api(mediaType + "/" + data.id + "?api_key=" + Lampa.TMDB.key() + 
                                  "&append_to_response=content_ratings,release_dates&language=" + language);
        
        this.currentUrl = apiUrl;
        
        // Перевіряємо кеш
        if (this.loaded[apiUrl]) {
            this.draw(this.loaded[apiUrl]);
            return;
        }
        
        // Завантажуємо дані
        clearTimeout(this.timer);
        var self = this;
        
        this.timer = setTimeout(function() {
            self.network.clear();
            self.network.timeout(5000);
            self.network.silent(apiUrl, function(response) {
                self.loaded[apiUrl] = response;
                if (self.currentUrl === apiUrl) {
                    self.draw(response);
                }
            });
        }, 300);
    };

    InfoPanel.prototype.draw = function(data) {
        if (!data || !this.html) return;
        
        var details = this.html.find(".new-interface-info__details");
        if (!details.length) return;
        
        var detailsInfo = [];
        var year = ((data.release_date || data.first_air_date || "0000") + "").slice(0, 4);
        var rating = parseFloat((data.vote_average || 0) + "").toFixed(1);
        
        // Рейтинг
        if (Lampa.Storage.get("rat") !== false && rating > 0) {
            var color = this.getRatingColor(rating);
            var style = color ? ' style="color: ' + color + '"' : '';
            detailsInfo.push('<div class="full-start__rate"' + style + '><div>' + rating + '</div><div>TMDB</div></div>');
        }
        
        // Рік
        if (year !== "0000") {
            detailsInfo.push('<span>' + year + '</span>');
        }
        
        // Жанри
        if (Lampa.Storage.get("ganr") !== false && data.genres && data.genres.length > 0) {
            var genres = data.genres.slice(0, 2).map(function(g) { 
                return Lampa.Utils.capitalizeFirstLetter(g.name); 
            }).join(" | ");
            detailsInfo.push('<span>' + genres + '</span>');
        }
        
        // Тривалість
        if (Lampa.Storage.get("vremya") !== false && data.runtime) {
            detailsInfo.push('<span>' + Lampa.Utils.secondsToTime(data.runtime * 60, true) + '</span>');
        }
        
        // Сезони
        if (Lampa.Storage.get("seas", false) && data.number_of_seasons) {
            detailsInfo.push('<span>Сезонів: ' + data.number_of_seasons + '</span>');
        }
        
        // Епізоди
        if (Lampa.Storage.get("eps", false) && data.number_of_episodes) {
            detailsInfo.push('<span>Епізодів: ' + data.number_of_episodes + '</span>');
        }
        
        // Статус
        if (Lampa.Storage.get("status") !== false && data.status) {
            var statusText = this.translateStatus(data.status);
            if (statusText) {
                detailsInfo.push('<span>' + statusText + '</span>');
            }
        }
        
        details.html(detailsInfo.join('<span style="margin: 0 10px; opacity: 0.5">•</span>'));
    };

    InfoPanel.prototype.getRatingColor = function(rating) {
        var vote = parseFloat(rating);
        if (vote >= 8) return "#00ff00";
        if (vote >= 7) return "#ffa500";
        if (vote >= 6) return "#ffff00";
        if (vote >= 5) return "#ff4500";
        return "#ff0000";
    };

    InfoPanel.prototype.translateStatus = function(status) {
        switch(status.toLowerCase()) {
            case "released": return "Випущений";
            case "ended": return "Завершений";
            case "returning series": return "Триває";
            case "canceled": return "Скасовано";
            case "post production": return "Скоро";
            case "planned": return "Заплановано";
            case "in production": return "У виробництві";
            default: return status;
        }
    };

    InfoPanel.prototype.empty = function() {
        if (!this.html) return;
        this.html.find(".new-interface-info__title").text("");
        this.html.find(".new-interface-info__details").text("");
        this.html.find(".new-interface-info__description").text("");
    };

    InfoPanel.prototype.destroy = function() {
        clearTimeout(this.timer);
        this.network.clear();
        this.currentUrl = null;
        
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };

    function initializeTVSettings() {
        console.log("Стильний інтерфейс: Ініціалізація налаштувань");
        
        // Чекаємо готовності SettingsApi
        var checkSettings = setInterval(function() {
            if (Lampa.SettingsApi && Lampa.SettingsApi.addComponent) {
                clearInterval(checkSettings);
                setupSettings();
            }
        }, 100);
        
        function setupSettings() {
            // Додаємо компонент
            Lampa.SettingsApi.addComponent({
                component: "style_interface",
                name: "Стильний інтерфейс",
            });
            
            // Додаємо пункт в основні налаштування
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: { name: "style_interface", type: "static", default: true },
                field: { 
                    name: "Стильний інтерфейс",
                    description: "Налаштування елементів інтерфейсу"
                },
                onRender: function(item) {
                    setTimeout(function() {
                        var target = $('div[data-name="interface_size"]');
                        if (target.length) {
                            item.insertAfter(target);
                        }
                        item.css("opacity", "1");
                    }, 100);
                    
                    item.on("hover:enter", function() {
                        Lampa.Settings.create("style_interface");
                        Lampa.Controller.enabled().controller.back = function() {
                            Lampa.Settings.create("interface");
                        };
                    });
                }
            });
            
            // Додаємо всі параметри українською
            var settings = [
                { name: "logo_show", type: "trigger", default: true, 
                  field: { name: "Показувати логотип замість назви" } },
                { name: "show_background", type: "trigger", default: true, 
                  field: { name: "Відображати постeри на фоні" } },
                { name: "status", type: "trigger", default: true, 
                  field: { name: "Показувати статус фільму/серіалу" } },
                { name: "seas", type: "trigger", default: false, 
                  field: { name: "Показувати кількість сезонів" } },
                { name: "eps", type: "trigger", default: false, 
                  field: { name: "Показувати кількість епізодів" } },
                { name: "year_ogr", type: "trigger", default: true, 
                  field: { name: "Показувати вікове обмеження" } },
                { name: "vremya", type: "trigger", default: true, 
                  field: { name: "Показувати час фільму" } },
                { name: "ganr", type: "trigger", default: true, 
                  field: { name: "Показувати жанр фільму" } },
                { name: "rat", type: "trigger", default: true, 
                  field: { name: "Показувати рейтинг фільму" } },
                { name: "si_colored_ratings", type: "trigger", default: true, 
                  field: { name: "Кольорові рейтинги" } },
                { name: "async_load", type: "trigger", default: true, 
                  field: { name: "Асинхронне завантаження даних" } },
                { name: "background_resolution", type: "select", default: "w1280", 
                  values: { w300: "w300", w780: "w780", w1280: "w1280", original: "original" },
                  field: { name: "Роздільна здатність фону" } },
                { name: "hide_captions", type: "trigger", default: true, 
                  field: { name: "Приховувати назви та рік", description: "Потрібна перезагрузка" },
                  onChange: function() { setTimeout(function() { location.reload(); }, 100); } },
                { name: "wide_post", type: "trigger", default: true, 
                  field: { name: "Широкі постeри", description: "Потрібна перезагрузка" },
                  onChange: function() { setTimeout(function() { location.reload(); }, 100); } }
            ];
            
            settings.forEach(function(setting) {
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: setting,
                    field: setting.field,
                    onChange: setting.onChange
                });
            });
            
            // Додаємо кнопку очистки кеша
            Lampa.SettingsApi.addParam({
                component: "style_interface",
                param: { name: "clear_cache", type: "static" },
                field: { 
                    name: "Очистити кеш логотипів",
                    description: "Потрібна перезагрузка"
                },
                onRender: function(item) {
                    item.on("hover:enter", function() {
                        Lampa.Select.show({
                            title: "Очистити кеш логотипів?",
                            items: [
                                { title: "Так", confirm: true },
                                { title: "Ні" }
                            ],
                            onSelect: function(a) {
                                if (a.confirm) {
                                    var keys = [];
                                    for (var i = 0; i < localStorage.length; i++) {
                                        var key = localStorage.key(i);
                                        if (key.indexOf("logo_tv_") !== -1 || key.indexOf("logo_cache_") !== -1) {
                                            keys.push(key);
                                        }
                                    }
                                    keys.forEach(function(key) {
                                        localStorage.removeItem(key);
                                    });
                                    setTimeout(function() { location.reload(); }, 100);
                                }
                            }
                        });
                    });
                }
            });
            
            // Встановлюємо налаштування за замовчуванням
            if (!Lampa.Storage.get("int_plug_tv", false)) {
                Lampa.Storage.set("int_plug_tv", "true");
                Lampa.Storage.set("wide_post", "true");
                Lampa.Storage.set("logo_show", "true");
                Lampa.Storage.set("show_background", "true");
                Lampa.Storage.set("background_resolution", "w1280");
                Lampa.Storage.set("status", "true");
                Lampa.Storage.set("seas", "false");
                Lampa.Storage.set("eps", "false");
                Lampa.Storage.set("year_ogr", "true");
                Lampa.Storage.set("vremya", "true");
                Lampa.Storage.set("ganr", "true");
                Lampa.Storage.set("rat", "true");
                Lampa.Storage.set("si_colored_ratings", "true");
                Lampa.Storage.set("async_load", "true");
                Lampa.Storage.set("hide_captions", "true");
                console.log("Стильний інтерфейс: Налаштування за замовчуванням встановлено");
            }
        }
    }

    // Додаємо обробник для детальної сторінки
    if (Lampa.Listener) {
        Lampa.Listener.follow("full", function(data) {
            if (data.type === "complite") {
                console.log("Стильний інтерфейс: Детальна сторінка завантажена");
            }
        });
    }

    // Ініціалізація після завантаження сторінки
    $(document).ready(function() {
        console.log("Стильний інтерфейс: Документ готовий");
        
        // Невелика затримка для ініціалізації
        setTimeout(function() {
            console.log("Стильний інтерфейс: Повністю ініціалізовано");
        }, 2000);
    });

})();
