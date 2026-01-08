(function () {
    "use strict";
    
    // Включаємо TV режим
    Lampa.Platform.tv();
    
    // Флаг для TV
    var isTV = /smart-|tv|samsung|tizen|webos/i.test(navigator.userAgent.toLowerCase());

    if (typeof Lampa === "undefined") return;
    if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
    if (window.plugin_interface_ready_v3) return;

    window.plugin_interface_ready_v3 = true;

    var globalInfoCache = {};

    // Налаштування за замовчуванням
    Lampa.Storage.set("interface_size", "small");
    Lampa.Storage.set("background", "false");

    // Додаємо стилі
    addTVStyles();
    // Ініціалізація налаштувань
    initializeSettings();

    var mainMaker = Lampa.Maker.map("Main");
    if (!mainMaker || !mainMaker.Items || !mainMaker.Create) return;

    // Проста обгортка методів
    function wrapMethod(obj, method, wrapper) {
        var original = obj[method];
        if (typeof original !== 'function') return;
        
        obj[method] = function() {
            var args = arguments;
            return wrapper.call(this, original, args);
        };
    }

    wrapMethod(mainMaker.Items, "onInit", function (original, args) {
        this.__newInterfaceEnabled = true; // Всегда включаем для TV
        
        if (this.__newInterfaceEnabled) {
            if (this.object) this.object.wide = false;
            this.wide = false;
            
            // Для TV меньше карточек
            if (this.object && !this.object.params) {
                this.object.params = {};
            }
            if (this.object && this.object.params) {
                this.object.params.items_per_row = 6;
                this.object.params.view = 6;
            }
        }

        if (original) return original.apply(this, args);
    });

    wrapMethod(mainMaker.Create, "onCreate", function (original, args) {
        if (original) original.apply(this, args);
        if (!this.__newInterfaceEnabled) return;

        var state = getOrCreateState(this);
        setTimeout(function() {
            state.attach();
        }, 100);
    });

    wrapMethod(mainMaker.Create, "onCreateAndAppend", function (original, args) {
        var data = args && args[0];
        if (this.__newInterfaceEnabled && data) {
            data.wide = false;

            if (!data.params) data.params = {};
            if (!data.params.items) data.params.items = {};
            
            // Для TV
            data.params.items.view = 6;
            data.params.items_per_row = 6;
            data.items_per_row = 6;

            // Применяем стили
            if (Array.isArray(data.results)) {
                data.results.forEach(function (card) {
                    card.wide = false;
                });

                Lampa.Utils.extendItemsParams(data.results, {
                    style: {
                        name: Lampa.Storage.get("wide_post") !== false ? "wide" : "small",
                    },
                });
            }
        }
        return original ? original.apply(this, args) : undefined;
    });

    wrapMethod(mainMaker.Items, "onAppend", function (original, args) {
        if (original) original.apply(this, args);
        if (!this.__newInterfaceEnabled) return;

        var element = args && args[0];
        var data = args && args[1];

        if (element && data) {
            handleLineAppend(this, element, data);
        }
    });

    wrapMethod(mainMaker.Items, "onDestroy", function (original, args) {
        if (this.__newInterfaceState) {
            this.__newInterfaceState.destroy();
            delete this.__newInterfaceState;
        }
        delete this.__newInterfaceEnabled;
        if (original) original.apply(this, args);
    });

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

        var state = {
            main: mainInstance,
            info: infoPanel,
            infoElement: null,
            attached: false,

            attach: function () {
                if (this.attached) return;

                var container = mainInstance.render();
                if (!container) return;

                container.classList.add("new-interface");

                var infoElement = infoPanel.render(true);
                this.infoElement = infoElement;

                if (infoElement && infoElement.parentNode !== container) {
                    container.insertBefore(infoElement, container.firstChild);
                }

                this.attached = true;
            },

            update: function (data) {
                if (!data) return;
                infoPanel.update(data);
            },

            reset: function () {
                infoPanel.empty();
            },

            destroy: function () {
                infoPanel.destroy();

                var container = this.main.render();
                if (container) {
                    container.classList.remove("new-interface");
                }

                if (this.infoElement && this.infoElement.parentNode) {
                    this.infoElement.parentNode.removeChild(this.infoElement);
                }

                this.attached = false;
            },
        };

        return state;
    }

    function handleCard(state, card) {
        if (!card || card.__newInterfaceCard) return;
        if (typeof card.use !== "function" || !card.data) return;

        card.__newInterfaceCard = true;
        card.params = card.params || {};
        card.params.style = card.params.style || {};

        var targetStyle = Lampa.Storage.get("wide_post") !== false ? "wide" : "small";
        card.params.style.name = targetStyle;

        if (card.render) {
            var element = card.render(true);
            if (element) {
                var node = element.jquery ? element[0] : element;
                if (node && node.classList) {
                    node.classList.add("card--" + targetStyle);
                }
            }
        }

        card.use({
            onFocus: function () {
                state.update(card.data);
            },
            onHover: function () {
                state.update(card.data);
            },
            onDestroy: function () {
                delete card.__newInterfaceCard;
            },
        });
    }

    function findCardData(element) {
        if (!element) return null;

        var node = element.jquery ? element[0] : element;
        while (node && !node.card_data) {
            node = node.parentNode;
        }
        return node && node.card_data ? node.card_data : null;
    }

    function handleLineAppend(items, line, data) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;

        var state = getOrCreateState(items);

        line.items_per_row = 6;
        line.view = 6;
        
        if (line.params) {
            line.params.items_per_row = 6;
            if (line.params.items) line.params.items.view = 6;
        }

        var processCard = function (card) {
            handleCard(state, card);
        };

        line.use({
            onInstance: function (instance) {
                processCard(instance);
            },
            onActive: function (card, results) {
                var cardData = card && card.data ? card.data : 
                             (results && results.results && results.results[0]) ? results.results[0] : null;
                if (cardData) state.update(cardData);
            },
            onDestroy: function () {
                state.reset();
                delete line.__newInterfaceLine;
            },
        });

        if (Array.isArray(line.items)) {
            line.items.forEach(processCard);
        }
    }

    function addTVStyles() {
        if (window.tv_styles_added) return;
        window.tv_styles_added = true;

        var style = document.createElement('style');
        style.textContent = `
            .new-interface-info {
                padding: 20px 40px;
                background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%);
                z-index: 100;
            }
            
            .new-interface-info__title {
                font-size: 40px;
                font-weight: bold;
                color: white;
                margin-bottom: 10px;
            }
            
            .new-interface-info__details {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 15px;
                font-size: 22px;
                color: rgba(255,255,255,0.8);
            }
            
            .new-interface-info__description {
                font-size: 24px;
                color: rgba(255,255,255,0.9);
                max-width: 70%;
                line-height: 1.3;
            }
            
            .new-interface .card {
                width: 250px !important;
                margin: 5px !important;
            }
            
            .new-interface .card.card--wide {
                width: 280px !important;
            }
            
            .new-interface .card.card--small {
                width: 220px !important;
            }
            
            .full-start__rate {
                background: rgba(0,0,0,0.5);
                padding: 2px 8px;
                border-radius: 4px;
                color: #ffd700;
            }
            
            ${Lampa.Storage.get("hide_captions", true) ? `
            .card:not(.card--collection) .card__age,
            .card:not(.card--collection) .card__title {
                display: none !important;
            }
            ` : ''}
        `;
        document.head.appendChild(style);
    }

    function InfoPanel() {
        this.html = null;
        this.network = new Lampa.Reguest();
        this.loaded = globalInfoCache;
    }

    InfoPanel.prototype.create = function() {
        this.html = $(`
            <div class="new-interface-info">
                <div class="new-interface-info__title"></div>
                <div class="new-interface-info__details"></div>
                <div class="new-interface-info__description"></div>
            </div>
        `);
    };

    InfoPanel.prototype.render = function(asElement) {
        if (!this.html) this.create();
        return asElement ? this.html[0] : this.html;
    };

    InfoPanel.prototype.update = function(data) {
        if (!data || !this.html) return;

        var title = this.html.find(".new-interface-info__title");
        var desc = this.html.find(".new-interface-info__description");
        
        title.text(data.title || data.name || "");
        desc.text(data.overview || "Опис відсутній");
        
        // Загружаем детали
        this.loadDetails(data);
    };

    InfoPanel.prototype.loadDetails = function(data) {
        if (!data || !data.id) return;
        
        var mediaType = data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "ru";
        var apiUrl = Lampa.TMDB.api(mediaType + "/" + data.id + "?api_key=" + Lampa.TMDB.key() + 
                                  "&append_to_response=content_ratings,release_dates&language=" + language);
        
        var self = this;
        
        // Проверяем кэш
        if (this.loaded[apiUrl]) {
            this.displayDetails(this.loaded[apiUrl]);
            return;
        }
        
        // Загружаем
        this.network.clear();
        this.network.silent(apiUrl, function(response) {
            self.loaded[apiUrl] = response;
            self.displayDetails(response);
        });
    };

    InfoPanel.prototype.displayDetails = function(data) {
        if (!data || !this.html) return;
        
        var details = this.html.find(".new-interface-info__details");
        var info = [];
        
        // Год
        var year = ((data.release_date || data.first_air_date || "").substring(0, 4) || "");
        if (year) info.push('<span>' + year + '</span>');
        
        // Рейтинг
        if (Lampa.Storage.get("rat") !== false && data.vote_average) {
            var rating = parseFloat(data.vote_average).toFixed(1);
            info.push('<div class="full-start__rate">' + rating + ' TMDB</div>');
        }
        
        // Жанры
        if (Lampa.Storage.get("ganr") !== false && data.genres && data.genres.length) {
            var genres = data.genres.slice(0, 2).map(function(g) {
                return g.name;
            }).join(", ");
            info.push('<span>' + genres + '</span>');
        }
        
        // Время
        if (Lampa.Storage.get("vremya") !== false && data.runtime) {
            var time = Lampa.Utils.secondsToTime(data.runtime * 60, true);
            info.push('<span>' + time + '</span>');
        }
        
        // Статус
        if (Lampa.Storage.get("status") !== false && data.status) {
            var status = this.translateStatus(data.status);
            info.push('<span>' + status + '</span>');
        }
        
        details.html(info.join(' • '));
    };

    InfoPanel.prototype.translateStatus = function(status) {
        var translations = {
            'released': 'Випущений',
            'ended': 'Завершений',
            'returning series': 'Триває',
            'canceled': 'Скасовано',
            'post production': 'Скоро',
            'planned': 'Заплановано',
            'in production': 'У виробництві'
        };
        return translations[status.toLowerCase()] || status;
    };

    InfoPanel.prototype.empty = function() {
        if (!this.html) return;
        this.html.find(".new-interface-info__title").text("");
        this.html.find(".new-interface-info__details").text("");
        this.html.find(".new-interface-info__description").text("");
    };

    InfoPanel.prototype.destroy = function() {
        this.network.clear();
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };

    function initializeSettings() {
        // Ждем готовности Settings
        var check = setInterval(function() {
            if (Lampa.SettingsApi && Lampa.SettingsApi.addComponent) {
                clearInterval(check);
                setupAllSettings();
            }
        }, 100);
        
        function setupAllSettings() {
            // Добавляем компонент
            Lampa.SettingsApi.addComponent({
                component: "style_interface",
                name: "Стильний інтерфейс",
            });

            // Пункт в основных настройках
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: { name: "style_interface", type: "static", default: true },
                field: { 
                    name: "Стильний інтерфейс",
                    description: "Налаштування елементів"
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
                    });
                }
            });

            // Все настройки украинском
            var settingsList = [
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
                  field: { name: "Асинхронне завантаження" } },
                { name: "hide_captions", type: "trigger", default: true, 
                  field: { name: "Приховувати назви та рік", description: "Потрібна перезагрузка" },
                  onChange: function() { setTimeout(location.reload, 100); } },
                { name: "wide_post", type: "trigger", default: true, 
                  field: { name: "Широкі постeри", description: "Потрібна перезагрузка" },
                  onChange: function() { setTimeout(location.reload, 100); } }
            ];

            settingsList.forEach(function(setting) {
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: setting,
                    field: setting.field,
                    onChange: setting.onChange
                });
            });

            // Кнопка очистки кеша
            Lampa.SettingsApi.addParam({
                component: "style_interface",
                param: { name: "clear_cache", type: "static" },
                field: { name: "Очистити кеш логотипів" },
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
                                    for (var i = 0; i < localStorage.length; i++) {
                                        var key = localStorage.key(i);
                                        if (key.indexOf("logo_") === 0) {
                                            localStorage.removeItem(key);
                                        }
                                    }
                                    setTimeout(location.reload, 100);
                                }
                            }
                        });
                    });
                }
            });

            // Устанавливаем настройки по умолчанию
            if (!Lampa.Storage.get("style_int_defaults", false)) {
                Lampa.Storage.set("style_int_defaults", "true");
                Lampa.Storage.set("wide_post", "true");
                Lampa.Storage.set("logo_show", "true");
                Lampa.Storage.set("show_background", "true");
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
            }
        }
    }

    // Запускаем после загрузки
    $(document).ready(function() {
        console.log("Стильний інтерфейс для TV завантажено");
    });

})();
