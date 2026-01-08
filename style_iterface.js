(function() {
    "use strict";
    
    // Перевірка на вже завантажений плагін
    if (window.plugin_interface_ready_v3) return;
    window.plugin_interface_ready_v3 = true;
    
    // Функція очікування завантаження Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Storage && window.Lampa.Maker) {
            callback();
        } else {
            setTimeout(function() {
                waitForLampa(callback);
            }, 100);
        }
    }
    
    // Ініціалізація плагіна
    waitForLampa(function() {
        try {
            // Встановлення TV режиму
            if (Lampa.Platform && typeof Lampa.Platform.tv === 'function') {
                Lampa.Platform.tv();
            }
            
            // Перевірка обов'язкових компонентів
            if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) {
                console.error('Стильний інтерфейс: Не знайдено обов\'язкові компоненти');
                return;
            }
            
            // Ініціалізація
            initializePlugin();
        } catch (e) {
            console.error('Помилка ініціалізації плагіна:', e);
        }
    });
    
    function initializePlugin() {
        // Глобальний кеш
        var globalInfoCache = {};
        
        // Встановлення налаштувань за замовчуванням
        if (!Lampa.Storage.get('int_plug')) {
            setDefaultSettings();
        }
        
        // Додавання стилів
        addStyles();
        
        // Ініціалізація налаштувань
        initializeSettings();
        
        // Налаштування кольорів рейтингів
        setupVoteColors();
        
        // Отримання основного компонента
        var mainMaker = Lampa.Maker.map("Main");
        if (!mainMaker || !mainMaker.Items || !mainMaker.Create) {
            console.error('Стильний інтерфейс: Не знайдено основний компонент');
            return;
        }
        
        // Обгортка методів
        wrapMethod(mainMaker.Items, "onInit", function(originalMethod, args) {
            var object = this && this.object;
            this.__newInterfaceEnabled = shouldEnableInterface(object);
            
            if (this.__newInterfaceEnabled) {
                if (object) object.wide = false;
                this.wide = false;
            }
            
            if (originalMethod) {
                return originalMethod.apply(this, args);
            }
        });
        
        wrapMethod(mainMaker.Create, "onCreate", function(originalMethod, args) {
            if (originalMethod) originalMethod.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            
            var state = getOrCreateState(this);
            state.attach();
        });
        
        wrapMethod(mainMaker.Create, "onCreateAndAppend", function(originalMethod, args) {
            var data = args && args[0];
            if (this.__newInterfaceEnabled && data) {
                data.wide = false;
                
                if (!data.params) data.params = {};
                if (!data.params.items) data.params.items = {};
                data.params.items.view = 12;
                data.params.items_per_row = 12;
                data.items_per_row = 12;
                
                extendResultsWithStyle(data);
            }
            
            if (originalMethod) {
                return originalMethod.apply(this, args);
            }
        });
        
        wrapMethod(mainMaker.Items, "onAppend", function(originalMethod, args) {
            if (originalMethod) originalMethod.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            
            var element = args && args[0];
            var data = args && args[1];
            
            if (element && data) {
                handleLineAppend(this, element, data);
            }
        });
        
        wrapMethod(mainMaker.Items, "onDestroy", function(originalMethod, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            
            if (originalMethod) {
                return originalMethod.apply(this, args);
            }
        });
    }
    
    function shouldEnableInterface(object) {
        if (!object) return false;
        if (window.innerWidth < 767) return false;
        if (Lampa.Platform.screen("mobile")) return false;
        if (object.title === "Обране") return false;
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
            
            attach: function() {
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
                
                if (mainInstance.scroll && mainInstance.scroll.minus) {
                    mainInstance.scroll.minus(infoElement);
                }
                
                this.attached = true;
            },
            
            update: function(data) {
                if (!data) return;
                infoPanel.update(data);
                this.updateBackground(data);
            },
            
            updateBackground: function(data) {
                var self = this;
                var delay = 300;
                
                clearTimeout(this.backgroundTimer);
                
                if (this._pendingImg) {
                    this._pendingImg.onload = null;
                    this._pendingImg.onerror = null;
                    this._pendingImg = null;
                }
                
                var show_bg = Lampa.Storage.get("show_background", true);
                var bg_resolution = Lampa.Storage.get("background_resolution", "original");
                var backdropUrl = "";
                
                if (data && data.backdrop_path && show_bg && Lampa.Api && Lampa.Api.img) {
                    backdropUrl = Lampa.Api.img(data.backdrop_path, bg_resolution);
                }
                
                if (backdropUrl === this.backgroundLast) return;
                
                this.backgroundTimer = setTimeout(function() {
                    if (!backdropUrl) {
                        bg1.classList.remove("active");
                        bg2.classList.remove("active");
                        self.backgroundLast = "";
                        return;
                    }
                    
                    var nextLayer = bg1.classList.contains("active") ? bg2 : bg1;
                    var prevLayer = bg1.classList.contains("active") ? bg1 : bg2;
                    
                    var img = new Image();
                    self._pendingImg = img;
                    
                    img.onload = function() {
                        if (self._pendingImg !== img) return;
                        if (backdropUrl !== self.backgroundLast) return;
                        
                        self._pendingImg = null;
                        nextLayer.src = backdropUrl;
                        nextLayer.classList.add("active");
                        
                        setTimeout(function() {
                            if (backdropUrl !== self.backgroundLast) return;
                            prevLayer.classList.remove("active");
                        }, 100);
                    };
                    
                    self.backgroundLast = backdropUrl;
                    img.src = backdropUrl;
                }, delay);
            },
            
            reset: function() {
                infoPanel.empty();
            },
            
            destroy: function() {
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
    
    // Конструктор InfoPanel
    function InfoPanel() {
        this.html = null;
        this.timer = null;
        this.fadeTimer = null;
        this.network = null;
        this.loaded = {};
        this.currentUrl = null;
        this.lastRenderId = 0;
    }
    
    InfoPanel.prototype.create = function() {
        var html = '<div class="new-interface-info">';
        html += '<div class="new-interface-info__body">';
        html += '<div class="new-interface-info__head"></div>';
        html += '<div class="new-interface-info__title"></div>';
        html += '<div class="new-interface-info__details"></div>';
        html += '<div class="new-interface-info__description"></div>';
        html += '</div>';
        html += '</div>';
        
        this.html = $(html);
        
        if (Lampa.Reguest) {
            this.network = new Lampa.Reguest();
        }
    };
    
    InfoPanel.prototype.render = function(asElement) {
        if (!this.html) this.create();
        return asElement ? this.html[0] : this.html;
    };
    
    InfoPanel.prototype.update = function(data) {
        if (!data || !this.html) return;
        
        this.lastRenderId = Date.now();
        var currentRenderId = this.lastRenderId;
        
        this.html.find(".new-interface-info__head,.new-interface-info__details").removeClass("visible");
        
        var title = this.html.find(".new-interface-info__title");
        var desc = this.html.find(".new-interface-info__description");
        
        if (data.overview) {
            desc.text(data.overview);
        } else {
            desc.text("Опис відсутній");
        }
        
        clearTimeout(this.fadeTimer);
        
        this.load(data);
        
        if (Lampa.Storage.get("logo_show", true)) {
            title.text(data.title || data.name || "");
            title.css({ opacity: 1 });
            this.showLogo(data, currentRenderId);
        } else {
            title.text(data.title || data.name || "");
            title.css({ opacity: 1 });
        }
    };
    
    InfoPanel.prototype.showLogo = function(data, renderId) {
        var self = this;
        
        if (!data.id || !Lampa.TMDB || !Lampa.TMDB.api) {
            return;
        }
        
        var type = data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "uk";
        var cacheKey = "logo_cache_" + type + "_" + data.id + "_" + language;
        var cachedUrl = Lampa.Storage.get(cacheKey);
        
        if (cachedUrl && cachedUrl !== "none") {
            var img = new Image();
            img.src = cachedUrl;
            img.className = "logo-image";
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            
            self.html.find(".new-interface-info__title").empty().append(img);
        } else {
            var url = Lampa.TMDB.api(type + "/" + data.id + "/images");
            
            $.get(url, function(response) {
                if (renderId && renderId !== self.lastRenderId) return;
                
                var finalLogo = null;
                if (response.logos && response.logos.length > 0) {
                    // Шукаємо логотип українською мовою
                    for (var i = 0; i < response.logos.length; i++) {
                        if (response.logos[i].iso_639_1 === language) {
                            finalLogo = response.logos[i].file_path;
                            break;
                        }
                    }
                    
                    // Якщо не знайшли українською, шукаємо англійською
                    if (!finalLogo) {
                        for (var j = 0; j < response.logos.length; j++) {
                            if (response.logos[j].iso_639_1 === "en") {
                                finalLogo = response.logos[j].file_path;
                                break;
                            }
                        }
                    }
                    
                    // Беремо перший доступний
                    if (!finalLogo) {
                        finalLogo = response.logos[0].file_path;
                    }
                }
                
                if (finalLogo) {
                    var imgUrl = "https://image.tmdb.org/t/p/original" + finalLogo;
                    Lampa.Storage.set(cacheKey, imgUrl);
                    
                    var img = new Image();
                    img.src = imgUrl;
                    img.className = "logo-image";
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    
                    self.html.find(".new-interface-info__title").empty().append(img);
                } else {
                    Lampa.Storage.set(cacheKey, "none");
                }
            }).fail(function() {
                console.log("Не вдалося завантажити логотип");
            });
        }
    };
    
    InfoPanel.prototype.load = function(data) {
        if (!data || !data.id) return;
        
        var source = data.source || "tmdb";
        if (source !== "tmdb" && source !== "cub") return;
        
        if (!Lampa.TMDB || typeof Lampa.TMDB.api !== "function") return;
        
        var mediaType = data.media_type === "tv" || data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "uk";
        var apiUrl = mediaType + "/" + data.id + "?language=" + language;
        
        this.currentUrl = apiUrl;
        
        if (this.loaded[apiUrl]) {
            this.draw(this.loaded[apiUrl]);
            return;
        }
        
        clearTimeout(this.timer);
        var self = this;
        
        this.timer = setTimeout(function() {
            if (self.network) {
                self.network.clear();
                self.network.timeout(5000);
                self.network.silent(apiUrl, function(response) {
                    self.loaded[apiUrl] = response;
                    if (self.currentUrl === apiUrl) {
                        self.draw(response);
                    }
                });
            }
        }, 300);
    };
    
    InfoPanel.prototype.draw = function(data) {
        if (!data || !this.html) return;
        
        var year = "";
        if (data.release_date) {
            year = data.release_date.substring(0, 4);
        } else if (data.first_air_date) {
            year = data.first_air_date.substring(0, 4);
        }
        
        var rating = "0.0";
        if (data.vote_average) {
            rating = parseFloat(data.vote_average).toFixed(1);
        }
        
        var detailsInfo = [];
        
        // Рейтинг
        if (Lampa.Storage.get("rat") !== false && rating !== "0.0") {
            var rateStyle = "";
            if (Lampa.Storage.get("si_colored_ratings", true)) {
                var voteNum = parseFloat(rating);
                var color = "";
                
                if (voteNum >= 0 && voteNum <= 3) color = "red";
                else if (voteNum > 3 && voteNum < 6) color = "orange";
                else if (voteNum >= 6 && voteNum < 7) color = "cornflowerblue";
                else if (voteNum >= 7 && voteNum < 8) color = "darkmagenta";
                else if (voteNum >= 8 && voteNum <= 10) color = "lawngreen";
                
                if (color) {
                    rateStyle = ' style="color: ' + color + '"';
                }
            }
            
            detailsInfo.push('<div class="full-start__rate"' + rateStyle + '><div>' + rating + '</div><div>TMDB</div></div>');
        }
        
        // Жанри
        if (Lampa.Storage.get("ganr") !== false && data.genres && data.genres.length > 0) {
            var genres = [];
            for (var i = 0; i < Math.min(data.genres.length, 2); i++) {
                genres.push(data.genres[i].name);
            }
            detailsInfo.push(genres.join(" | "));
        }
        
        // Тривалість
        if (Lampa.Storage.get("vremya") !== false && data.runtime) {
            var time = Lampa.Utils.secondsToTime(data.runtime * 60, true);
            detailsInfo.push(time);
        }
        
        // Сезони
        if (Lampa.Storage.get("seas", false) && data.number_of_seasons) {
            detailsInfo.push('<span class="full-start__pg">Сезонів ' + data.number_of_seasons + '</span>');
        }
        
        // Епізоди
        if (Lampa.Storage.get("eps", false) && data.number_of_episodes) {
            detailsInfo.push('<span class="full-start__pg">Епізодів ' + data.number_of_episodes + '</span>');
        }
        
        // Вікове обмеження
        if (Lampa.Storage.get("year_ogr") !== false) {
            var ageRating = "";
            if (data.release_dates && data.release_dates.results) {
                for (var i = 0; i < data.release_dates.results.length; i++) {
                    if (data.release_dates.results[i].iso_3166_1 === "US") {
                        if (data.release_dates.results[i].release_dates && data.release_dates.results[i].release_dates.length > 0) {
                            ageRating = data.release_dates.results[i].release_dates[0].certification;
                            break;
                        }
                    }
                }
            }
            
            if (ageRating) {
                detailsInfo.push('<span class="full-start__pg">' + ageRating + '+</span>');
            }
        }
        
        // Статус
        if (Lampa.Storage.get("status") !== false && data.status) {
            var statusText = data.status;
            if (statusText === "Released") statusText = "Випущено";
            else if (statusText === "Ended") statusText = "Завершено";
            else if (statusText === "Returning Series") statusText = "Онґоїнг";
            else if (statusText === "Canceled") statusText = "Скасовано";
            
            detailsInfo.push('<span class="full-start__status">' + statusText + '</span>');
        }
        
        // Рік
        if (year) {
            detailsInfo.push(year);
        }
        
        this.html.find(".new-interface-info__details")
            .html(detailsInfo.join('<span class="new-interface-info__split">●</span>'))
            .addClass("visible");
    };
    
    InfoPanel.prototype.empty = function() {
        if (!this.html) return;
        this.html.find(".new-interface-info__head,.new-interface-info__details").text("").removeClass("visible");
    };
    
    InfoPanel.prototype.destroy = function() {
        clearTimeout(this.fadeTimer);
        clearTimeout(this.timer);
        if (this.network) {
            this.network.clear();
        }
        this.currentUrl = null;
        
        if (this.html) {
            this.html.remove();
            this.html = null;
        }
    };
    
    // Допоміжні функції
    function extendResultsWithStyle(data) {
        if (!data || !Array.isArray(data.results)) return;
        
        for (var i = 0; i < data.results.length; i++) {
            var card = data.results[i];
            if (card.wide !== false) {
                card.wide = false;
            }
        }
        
        if (Lampa.Utils.extendItemsParams) {
            Lampa.Utils.extendItemsParams(data.results, {
                style: {
                    name: Lampa.Storage.get("wide_post") !== false ? "wide" : "small"
                }
            });
        }
    }
    
    function wrapMethod(object, methodName, wrapper) {
        if (!object || typeof object[methodName] !== "function") return;
        
        var originalMethod = object[methodName];
        
        object[methodName] = function() {
            var args = [];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            return wrapper.call(this, originalMethod, args);
        };
    }
    
    function addStyles() {
        if (window.styleInterfaceAdded) return;
        window.styleInterfaceAdded = true;
        
        var isWide = Lampa.Storage.get("wide_post") !== false;
        var styles = isWide ? getWideStyles() : getSmallStyles();
        
        var styleElement = document.createElement("style");
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    function getWideStyles() {
        var styles = '.new-interface .card.card--wide { width: 18.3em; }';
        styles += '.new-interface .card.card--small { width: 18.3em; }';
        styles += '.new-interface-info { position: relative; padding: 1.5em; height: 27.5em; }';
        styles += '.new-interface-info__body { position: absolute; z-index: 999; width: 80%; padding-top: 1.1em; }';
        styles += '.new-interface-info__title { font-size: 4em; font-weight: 600; margin-bottom: 0.3em; }';
        styles += '.new-interface-info__details { margin-top: 1.2em; margin-bottom: 1.6em; display: flex; align-items: center; flex-wrap: wrap; font-size: 1.3em; }';
        styles += '.new-interface-info__description { font-size: 1.4em; font-weight: 300; line-height: 1.3; width: 65%; }';
        styles += '.new-interface .full-start__background-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }';
        styles += '.new-interface .full-start__background { position: absolute; height: 108%; width: 100%; top: -5em; left: 0; opacity: 0; object-fit: cover; transition: opacity 0.8s ease; }';
        styles += '.new-interface .full-start__background.active { opacity: 0.5; }';
        styles += '.logo-image { max-width: 100%; height: auto; }';
        
        if (Lampa.Storage.get("hide_captions", true)) {
            styles += '.card:not(.card--collection) .card__age, .card:not(.card--collection) .card__title { display: none !important; }';
        }
        
        return styles;
    }
    
    function getSmallStyles() {
        var styles = '.new-interface .card.card--wide { width: 18.3em; }';
        styles += '.new-interface-info { position: relative; padding: 1.5em; height: 19.8em; }';
        styles += '.new-interface-info__body { position: absolute; z-index: 999; width: 80%; padding-top: 0.2em; }';
        styles += '.new-interface-info__title { font-size: 3em; font-weight: 600; margin-bottom: 0.2em; }';
        styles += '.new-interface-info__details { margin-top: 1.2em; margin-bottom: 1.6em; display: flex; align-items: center; flex-wrap: wrap; font-size: 1.2em; }';
        styles += '.new-interface-info__description { font-size: 1.3em; font-weight: 300; line-height: 1.3; width: 70%; }';
        styles += '.new-interface .full-start__background-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }';
        styles += '.new-interface .full-start__background { position: absolute; height: 108%; width: 100%; top: -5em; left: 0; opacity: 0; object-fit: cover; transition: opacity 0.8s ease; }';
        styles += '.new-interface .full-start__background.active { opacity: 0.5; }';
        styles += '.logo-image { max-width: 100%; height: auto; }';
        
        if (Lampa.Storage.get("hide_captions", true)) {
            styles += '.card:not(.card--collection) .card__age, .card:not(.card--collection) .card__title { display: none !important; }';
        }
        
        return styles;
    }
    
    // Налаштування кольорів рейтингів
    function setupVoteColors() {
        updateVoteColors();
        
        var observer = new MutationObserver(function(mutations) {
            if (!Lampa.Storage.get("si_colored_ratings", true)) return;
            
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains("card__vote")) {
                            applyColorToRating(node);
                        }
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function updateVoteColors() {
        if (!Lampa.Storage.get("si_colored_ratings", true)) return;
        
        var votes = document.querySelectorAll(".card__vote, .full-start__rate");
        for (var i = 0; i < votes.length; i++) {
            applyColorToRating(votes[i]);
        }
    }
    
    function applyColorToRating(element) {
        var text = element.textContent || element.innerText;
        var match = text.match(/(\d+(\.\d+)?)/);
        if (!match) return;
        
        var vote = parseFloat(match[1]);
        var color = getColorByRating(vote);
        
        if (color) {
            element.style.color = color;
            
            if (Lampa.Storage.get("si_rating_border", false)) {
                element.style.border = "1px solid " + color;
            } else {
                element.style.border = "";
            }
        }
    }
    
    function getColorByRating(vote) {
        if (isNaN(vote)) return "";
        if (vote >= 0 && vote <= 3) return "red";
        if (vote > 3 && vote < 6) return "orange";
        if (vote >= 6 && vote < 7) return "cornflowerblue";
        if (vote >= 7 && vote < 8) return "darkmagenta";
        if (vote >= 8 && vote <= 10) return "lawngreen";
        return "";
    }
    
    // Ініціалізація налаштувань
    function initializeSettings() {
        // Чекаємо на завантаження SettingsApi
        setTimeout(function() {
            if (!Lampa.SettingsApi) {
                console.error('SettingsApi не завантажено');
                return;
            }
            
            try {
                // Додаємо пункт в головне меню налаштувань
                Lampa.SettingsApi.addParam({
                    component: "interface",
                    param: {
                        name: "style_interface",
                        type: "static",
                        default: true
                    },
                    field: {
                        name: "Стильний інтерфейс",
                        description: "Налаштування елементів"
                    },
                    onRender: function(item) {
                        item.css("opacity", "0");
                        setTimeout(function() {
                            var target = $('div[data-name="interface_size"]');
                            if (target.length) {
                                item.insertAfter(target);
                            }
                            item.css("opacity", "1");
                        }, 100);
                        
                        item.on("hover:enter", function() {
                            createStyleInterfaceSettings();
                        });
                    }
                });
                
                // Створюємо сторінку налаштувань стильного інтерфейсу
                function createStyleInterfaceSettings() {
                    Lampa.SettingsApi.addComponent({
                        component: "style_interface",
                        name: "Стильний інтерфейс"
                    });
                    
                    // Додаємо параметри налаштувань
                    var settings = [
                        {
                            name: "logo_show",
                            type: "trigger",
                            default: true,
                            field: { name: "Показувати логотип замість назви" }
                        },
                        {
                            name: "show_background",
                            type: "trigger", 
                            default: true,
                            field: { name: "Відображати постери на фоні" }
                        },
                        {
                            name: "status",
                            type: "trigger",
                            default: true,
                            field: { name: "Показувати статус" }
                        },
                        {
                            name: "seas",
                            type: "trigger",
                            default: false,
                            field: { name: "Показувати кількість сезонів" }
                        },
                        {
                            name: "eps",
                            type: "trigger",
                            default: false,
                            field: { name: "Показувати кількість епізодів" }
                        },
                        {
                            name: "year_ogr",
                            type: "trigger",
                            default: true,
                            field: { name: "Показувати вікове обмеження" }
                        },
                        {
                            name: "vremya",
                            type: "trigger",
                            default: true,
                            field: { name: "Показувати тривалість" }
                        },
                        {
                            name: "ganr",
                            type: "trigger",
                            default: true,
                            field: { name: "Показувати жанр" }
                        },
                        {
                            name: "rat",
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
                            field: { name: "Обводка рейтингів" }
                        },
                        {
                            name: "child_mode",
                            type: "trigger",
                            default: false,
                            field: { name: "Дитячий режим", description: "Перезавантажить Lampa" }
                        },
                        {
                            name: "async_load",
                            type: "trigger",
                            default: true,
                            field: { name: "Асинхронне завантаження" }
                        },
                        {
                            name: "background_resolution",
                            type: "select",
                            default: "original",
                            values: { w300: "w300", w780: "w780", w1280: "w1280", original: "original" },
                            field: { name: "Роздільна здатність фону" }
                        },
                        {
                            name: "hide_captions",
                            type: "trigger",
                            default: true,
                            field: { name: "Приховувати назви та рік", description: "Перезавантажить Lampa" }
                        },
                        {
                            name: "wide_post",
                            type: "trigger",
                            default: true,
                            field: { name: "Широкі постери", description: "Перезавантажить Lampa" }
                        },
                        {
                            name: "int_clear_logo_cache",
                            type: "static",
                            field: { name: "Очистити кеш логотипів", description: "Перезавантажить Lampa" }
                        }
                    ];
                    
                    settings.forEach(function(setting) {
                        Lampa.SettingsApi.addParam({
                            component: "style_interface",
                            param: setting,
                            field: setting.field
                        });
                    });
                    
                    // Обробник для кнопки очищення кешу
                    Lampa.SettingsApi.addParam({
                        component: "style_interface",
                        param: {
                            name: "clear_logo_action",
                            type: "static"
                        },
                        field: {
                            name: "Очистити кеш логотипів",
                            description: "Перезавантажить Lampa"
                        },
                        onRender: function(item) {
                            item.on("hover:enter", function() {
                                if (Lampa.Select && Lampa.Select.show) {
                                    Lampa.Select.show({
                                        title: "Очистити кеш логотипів?",
                                        items: [
                                            { title: "Так", value: "yes" },
                                            { title: "Ні", value: "no" }
                                        ],
                                        onSelect: function(result) {
                                            if (result.value === "yes") {
                                                clearLogoCache();
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                    
                    Lampa.Settings.create("style_interface");
                }
                
                function clearLogoCache() {
                    var keysToRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var key = localStorage.key(i);
                        if (key && key.indexOf("logo_cache_") !== -1) {
                            keysToRemove.push(key);
                        }
                    }
                    
                    keysToRemove.forEach(function(key) {
                        localStorage.removeItem(key);
                    });
                    
                    window.location.reload();
                }
                
            } catch (e) {
                console.error('Помилка ініціалізації налаштувань:', e);
            }
        }, 1000);
    }
    
    function setDefaultSettings() {
        var defaults = {
            "int_plug": "true",
            "wide_post": "true",
            "logo_show": "true",
            "show_background": "true",
            "background_resolution": "original",
            "status": "true",
            "seas": "false",
            "eps": "false",
            "year_ogr": "true",
            "vremya": "true",
            "ganr": "true",
            "rat": "true",
            "si_colored_ratings": "true",
            "async_load": "true",
            "hide_captions": "true",
            "si_rating_border": "false",
            "child_mode": "false"
        };
        
        for (var key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                Lampa.Storage.set(key, defaults[key]);
            }
        }
    }
    
})();
