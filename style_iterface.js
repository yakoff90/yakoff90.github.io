(function () {
    "use strict";
    
    if (typeof Lampa === "undefined") return;
    if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
    if (window.plugin_interface_ready_v3) return;
    
    window.plugin_interface_ready_v3 = true;
    
    var globalInfoCache = {};
    
    // Додаємо стилі
    addStyles();
    
    // Чекаємо повного завантаження
    setTimeout(function() {
        initializeSettings();
        
        // Отримуємо головний Maker
        var mainMaker = Lampa.Maker.map("Main");
        if (!mainMaker || !mainMaker.Items || !mainMaker.Create) return;
        
        // Перехоплюємо створення
        var originalOnCreate = mainMaker.Create.onCreate;
        mainMaker.Create.onCreate = function() {
            if (originalOnCreate) originalOnCreate.apply(this, arguments);
            
            // Перевіряємо чи потрібно активувати
            var isTV = navigator.userAgent.toLowerCase().indexOf('smart-tv') > -1 || 
                      navigator.userAgent.toLowerCase().indexOf('tizen') > -1;
            
            if (!isTV && window.innerWidth < 767) return;
            
            this.__newInterfaceEnabled = true;
            
            // Створюємо стан
            var state = createState(this);
            state.attach();
            this.__newInterfaceState = state;
        };
        
        // Перехоплюємо додавання ліній
        var originalOnAppend = mainMaker.Items.onAppend;
        mainMaker.Items.onAppend = function() {
            if (originalOnAppend) originalOnAppend.apply(this, arguments);
            
            if (!this.__newInterfaceEnabled) return;
            
            var element = arguments[0];
            var data = arguments[1];
            
            if (element && data) {
                handleLineAppend(this, element, data);
            }
        };
        
        // Перехоплюємо знищення
        var originalOnDestroy = mainMaker.Items.onDestroy;
        mainMaker.Items.onDestroy = function() {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            
            if (originalOnDestroy) originalOnDestroy.apply(this, arguments);
        };
        
    }, 1000);
    
    function createState(mainInstance) {
        var infoPanel = new InfoPanel();
        infoPanel.create();
        
        var backgroundWrapper = document.createElement("div");
        backgroundWrapper.className = "full-start__background-wrapper";
        
        var bg1 = document.createElement("img");
        bg1.className = "full-start__background";
        var bg2 = document.createElement("img");
        bg2.className = "full-start__background";
        
        backgroundWrapper.appendChild(bg1);
        backgroundWrapper.appendChild(bg2);
        
        var state = {
            main: mainInstance,
            info: infoPanel,
            background: backgroundWrapper,
            infoElement: null,
            backgroundTimer: null,
            backgroundLast: "",
            attached: false,
            
            attach: function () {
                if (this.attached) return;
                
                var container = mainInstance.render(true);
                if (!container) return;
                
                container.classList.add("new-interface");
                
                if (!backgroundWrapper.parentElement) {
                    container.insertBefore(backgroundWrapper, container.firstChild);
                }
                
                var infoElement = infoPanel.render(true);
                this.infoElement = infoElement;
                
                if (infoElement && infoElement.parentNode !== container) {
                    if (backgroundWrapper.parentElement === container) {
                        container.insertBefore(infoElement, backgroundWrapper.nextSibling);
                    } else {
                        container.insertBefore(infoElement, container.firstChild);
                    }
                }
                
                this.attached = true;
            },
            
            update: function (data) {
                if (!data) return;
                infoPanel.update(data);
                this.updateBackground(data);
            },
            
            updateBackground: function (data) {
                var self = this;
                
                clearTimeout(this.backgroundTimer);
                
                var show_bg = Lampa.Storage.get("show_background", true);
                var bg_resolution = Lampa.Storage.get("background_resolution", "original");
                var backdropUrl = data && data.backdrop_path && show_bg ? Lampa.Api.img(data.backdrop_path, bg_resolution) : "";
                
                if (backdropUrl === this.backgroundLast) return;
                
                this.backgroundTimer = setTimeout(function () {
                    if (!backdropUrl) {
                        bg1.classList.remove("active");
                        bg2.classList.remove("active");
                        self.backgroundLast = "";
                        return;
                    }
                    
                    var nextLayer = bg1.classList.contains("active") ? bg2 : bg1;
                    var prevLayer = bg1.classList.contains("active") ? bg1 : bg2;
                    
                    var img = new Image();
                    
                    img.onload = function () {
                        nextLayer.src = backdropUrl;
                        nextLayer.classList.add("active");
                        
                        setTimeout(function () {
                            prevLayer.classList.remove("active");
                        }, 100);
                    };
                    
                    self.backgroundLast = backdropUrl;
                    img.src = backdropUrl;
                }, 300);
            },
            
            reset: function () {
                infoPanel.empty();
            },
            
            destroy: function () {
                clearTimeout(this.backgroundTimer);
                infoPanel.destroy();
                
                var container = this.main.render(true);
                if (container) {
                    container.classList.remove("new-interface");
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
    
    function handleLineAppend(items, line, data) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;
        
        var state = items.__newInterfaceState;
        if (!state) return;
        
        line.items_per_row = 12;
        line.view = 12;
        
        line.use({
            onActive: function (card, results) {
                if (card && card.data) {
                    state.update(card.data);
                }
            },
            onDestroy: function () {
                state.reset();
                delete line.__newInterfaceLine;
            },
        });
    }
    
    function InfoPanel() {
        this.html = null;
        this.timer = null;
        this.network = new Lampa.Reguest();
    }
    
    InfoPanel.prototype.create = function () {
        this.html = $('<div class="new-interface-info">' +
                            '<div class="new-interface-info__body">' +
                                '<div class="new-interface-info__head"></div>' +
                                '<div class="new-interface-info__title"></div>' +
                                '<div class="new-interface-info__details"></div>' +
                                '<div class="new-interface-info__description"></div>' +
                            '</div>' +
                        '</div>');
    };
    
    InfoPanel.prototype.render = function (asElement) {
        if (!this.html) this.create();
        return asElement ? this.html[0] : this.html;
    };
    
    InfoPanel.prototype.update = function (data) {
        if (!data || !this.html) return;
        
        var title = this.html.find(".new-interface-info__title");
        var desc = this.html.find(".new-interface-info__description");
        var details = this.html.find(".new-interface-info__details");
        var head = this.html.find(".new-interface-info__head");
        
        desc.text(data.overview || "Немає опису");
        
        if (Lampa.Storage.get("logo_show", true)) {
            title.text(data.title || data.name || "");
        } else {
            title.text(data.title || data.name || "");
        }
        
        var year = ((data.release_date || data.first_air_date || "0000") + "").slice(0, 4);
        var rating = parseFloat((data.vote_average || 0) + "").toFixed(1);
        
        var detailsInfo = [];
        
        if (Lampa.Storage.get("rat") !== false && rating > 0) {
            detailsInfo.push('<div class="full-start__rate"><div>' + rating + '</div><div>TMDB</div></div>');
        }
        
        if (Lampa.Storage.get("ganr") !== false && data.genres && data.genres.length > 0) {
            var genres = data.genres.slice(0, 2).map(function (genre) {
                return genre.name;
            }).join(" | ");
            detailsInfo.push(genres);
        }
        
        if (Lampa.Storage.get("vremya") !== false && data.runtime) {
            detailsInfo.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
        }
        
        if (year !== "0000") {
            detailsInfo.push(year);
        }
        
        details.html(detailsInfo.join('<span class="new-interface-info__split">●</span>')).addClass("visible");
        head.addClass("visible");
    };
    
    InfoPanel.prototype.empty = function () {
        if (!this.html) return;
        this.html.find(".new-interface-info__head,.new-interface-info__details").text("").removeClass("visible");
    };
    
    InfoPanel.prototype.destroy = function () {
        clearTimeout(this.timer);
        if (this.network) this.network.clear();
        
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };
    
    function addStyles() {
        var style = document.createElement('style');
        style.innerHTML = `
            .new-interface-info__head, .new-interface-info__details{ opacity: 0; transition: opacity 0.5s ease; min-height: 2.2em !important;}
            .new-interface-info__head.visible, .new-interface-info__details.visible{ opacity: 1; }
            .new-interface .card.card--wide {
                width: 18.3em;
            }
            .new-interface .card.card--small {
                width: 18.3em;
            }
            .new-interface-info {
                position: relative;
                padding: 1.5em;
                height: 27.5em;
            }
            .new-interface-info__body {
                position: absolute;
                z-index: 9999999;
                width: 80%;
                padding-top: 1.1em;
            }
            .new-interface-info__head {
                color: rgba(255, 255, 255, 0.6);
                font-size: 1.3em;
                min-height: 1em;
            }
            .new-interface-info__head span {
                color: #fff;
            }
            .new-interface-info__title {
                font-size: 4em;
                font-weight: 600;
                margin-bottom: 0.3em;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                line-clamp: 1;
                -webkit-box-orient: vertical;
                line-height: 1.3;
            }
            .new-interface-info__details {
                margin-top: 1.2em;
                margin-bottom: 1.6em;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                min-height: 1.9em;
                font-size: 1.3em;
            }
            .new-interface-info__split {
                margin: 0 1em;
                font-size: 0.7em;
            }
            .new-interface-info__description {
                font-size: 1.4em;
                font-weight: 310;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                width: 65%;
            }
            .new-interface .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .full-start__background-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            }
            .new-interface .full-start__background {
                position: absolute;
                height: 108%;
                width: 100%;
                top: -5em;
                left: 0;
                opacity: 0;
                object-fit: cover;
                transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .new-interface .full-start__background.active {
                opacity: 0.5;
            }
            .new-interface .full-start__rate {
                font-size: 1.3em;
                margin-right: 0;
            }
            .new-interface .card__promo {
                display: none;
            }
            .new-interface .card.card--wide + .card-more .card-more__box {
                padding-bottom: 95%;
            }
            .new-interface .card.card--wide .card-watched {
                display: none !important;
            }
            body.light--version .new-interface-info__body {
                position: absolute;
                z-index: 9999999;
                width: 69%;
                padding-top: 1.5em;
            }
            body.light--version .new-interface-info {
                height: 25.3em;
            }
        `;
        document.head.appendChild(style);
    }
    
    function initializeSettings() {
        // Чекаємо готовності SettingsApi
        var checkInterval = setInterval(function() {
            if (Lampa.SettingsApi && Lampa.SettingsApi.addComponent) {
                clearInterval(checkInterval);
                
                // Додаємо компонент налаштувань
                Lampa.SettingsApi.addComponent({
                    component: "style_interface",
                    name: "Стильний інтерфейс",
                });
                
                // Додаємо параметр в головні налаштування
                Lampa.SettingsApi.addParam({
                    component: "interface",
                    param: {
                        name: "style_interface",
                        type: "static",
                        default: true,
                    },
                    field: {
                        name: "Стильний інтерфейс",
                        description: "Налаштування елементів",
                    },
                    onRender: function (item) {
                        item.on("hover:enter", function () {
                            Lampa.Settings.create("style_interface");
                        });
                    },
                });
                
                // Додаємо налаштування для стильного інтерфейсу
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "logo_show", type: "trigger", default: true },
                    field: { name: "Показувати логотип замість назви" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "show_background", type: "trigger", default: true },
                    field: { name: "Відображати постера на фоні" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "status", type: "trigger", default: true },
                    field: { name: "Показувати статус фільму/серіалу" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "seas", type: "trigger", default: false },
                    field: { name: "Показувати кількість сезонів" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "eps", type: "trigger", default: false },
                    field: { name: "Показувати кількість серій" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "year_ogr", type: "trigger", default: true },
                    field: { name: "Показувати вікове обмеження" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "vremya", type: "trigger", default: true },
                    field: { name: "Показувати час фільму" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "ganr", type: "trigger", default: true },
                    field: { name: "Показувати жанр фільму" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "rat", type: "trigger", default: true },
                    field: { name: "Показувати рейтинг фільму" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "background_resolution", type: "select", default: "original", values: { w300: "w300", w780: "w780", w1280: "w1280", original: "original" } },
                    field: { name: "Роздільна здатність фону" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "wide_post", type: "trigger", default: true },
                    field: { name: "Широкі постера" },
                });
                
                // Встановлюємо дефолтні значення
                if (!Lampa.Storage.get("int_plug")) {
                    Lampa.Storage.set("int_plug", "true");
                    Lampa.Storage.set("wide_post", "true");
                    Lampa.Storage.set("logo_show", "true");
                    Lampa.Storage.set("show_background", "true");
                    Lampa.Storage.set("background_resolution", "original");
                    Lampa.Storage.set("status", "true");
                    Lampa.Storage.set("seas", "false");
                    Lampa.Storage.set("eps", "false");
                    Lampa.Storage.set("year_ogr", "true");
                    Lampa.Storage.set("vremya", "true");
                    Lampa.Storage.set("ganr", "true");
                    Lampa.Storage.set("rat", "true");
                }
            }
        }, 100);
    }
    
})();
