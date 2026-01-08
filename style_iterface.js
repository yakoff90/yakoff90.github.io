(function() {
    "use strict";
    
    // Перевірка та ініціалізація для Samsung TV
    function initializeForSamsung() {
        try {
            // Встановлюємо TV режим для Samsung
            if (typeof Lampa !== 'undefined' && Lampa.Platform && Lampa.Platform.tv) {
                Lampa.Platform.tv();
            }
            
            // Додаємо клас для Samsung для специфічних стилів
            var userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf('webos') !== -1 || userAgent.indexOf('samsung') !== -1) {
                document.body.classList.add('samsung-tv');
            }
        } catch (e) {
            console.log('Samsung TV initialization error:', e);
        }
    }
    
    // Чекаємо на завантаження Lampa
    function waitForLampa(callback) {
        if (typeof Lampa !== 'undefined') {
            callback();
        } else {
            setTimeout(function() {
                waitForLampa(callback);
            }, 100);
        }
    }
    
    // Основна функція ініціалізації
    function initPlugin() {
        if (window.plugin_interface_ready_v3) return;
        window.plugin_interface_ready_v3 = true;
        
        // Ініціалізація для Samsung
        initializeForSamsung();
        
        // Перевірка обов'язкових компонентів
        if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) {
            console.error('Стильний інтерфейс: Не знайдено обов\'язкові компоненти Lampa');
            return;
        }
        
        // Ініціалізація глобальних змінних
        var globalInfoCache = {};
        
        // Встановлення налаштувань за замовчуванням
        try {
            Lampa.Storage.set("interface_size", "small");
            Lampa.Storage.set("background", "false");
        } catch (e) {
            console.log('Помилка налаштувань:', e);
        }
        
        // Додавання стилів
        addStyles();
        
        // Ініціалізація налаштувань
        initializeSettings();
        
        // Налаштування спостерігачів
        siStyleSetupVoteColorsObserver();
        siStyleSetupVoteColorsForDetailPage();
        setupPreloadObserver();
        
        // Отримання основного компонента
        var mainMaker = Lampa.Maker.map("Main");
        if (!mainMaker || !mainMaker.Items || !mainMaker.Create) {
            console.error('Стильний інтерфейс: Не знайдено основний компонент');
            return;
        }
        
        // Обгортка методів
        wrapMethod(mainMaker.Items, "onInit", function(originalMethod, args) {
            this.__newInterfaceEnabled = shouldEnableInterface(this && this.object);
            
            if (this.__newInterfaceEnabled) {
                if (this.object) this.object.wide = false;
                this.wide = false;
            }
            
            if (originalMethod) originalMethod.apply(this, args);
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
            return originalMethod ? originalMethod.apply(this, args) : undefined;
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
            if (originalMethod) originalMethod.apply(this, args);
        });
    }
    
    // Функція перевірки активності інтерфейсу
    function shouldEnableInterface(object) {
        if (!object) return false;
        if (window.innerWidth < 767) return false;
        if (Lampa.Platform.screen("mobile")) return false;
        if (object.title === "Обране") return false;
        return true;
    }
    
    // Створення стану інтерфейсу
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
                    container.insertBefore(backgroundWrapper, container.firstChild || null);
                }
                
                var infoElement = infoPanel.render(true);
                this.infoElement = infoElement;
                
                if (infoElement && infoElement.parentNode !== container) {
                    if (backgroundWrapper.parentElement === container) {
                        container.insertBefore(infoElement, backgroundWrapper.nextSibling);
                    } else {
                        container.insertBefore(infoElement, container.firstChild || null);
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
                var BACKGROUND_DEBOUNCE_DELAY = 300;
                var self = this;
                
                clearTimeout(this.backgroundTimer);
                
                if (this._pendingImg) {
                    this._pendingImg.onload = null;
                    this._pendingImg.onerror = null;
                    this._pendingImg = null;
                }
                
                var show_bg = Lampa.Storage.get("show_background", true);
                var bg_resolution = Lampa.Storage.get("background_resolution", "original");
                var backdropUrl = data && data.backdrop_path && show_bg ? Lampa.Api.img(data.backdrop_path, bg_resolution) : "";
                
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
                }, BACKGROUND_DEBOUNCE_DELAY);
            },
            
            reset: function() {
                infoPanel.empty();
            },
            
            destroy: function() {
                clearTimeout(this.backgroundTimer);
                infoPanel.destroy();
                
                var container = mainInstance.render(true);
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
    
    // Інформаційна панель
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
        this.html = $('<div class="new-interface-info">' +
            '<div class="new-interface-info__body">' +
            '<div class="new-interface-info__head"></div>' +
            '<div class="new-interface-info__title"></div>' +
            '<div class="new-interface-info__details"></div>' +
            '<div class="new-interface-info__description"></div>' +
            '</div>' +
            '</div>');
        
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
        
        if (Lampa.Background && Lampa.Background.change) {
            Lampa.Background.change(Lampa.Api.img(data.backdrop_path, "original"));
        }
        
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
        var _this = this;
        
        if (!data.id) return;
        
        var type = data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "uk";
        var cache_key = "logo_cache_v2_" + type + "_" + data.id + "_" + language;
        var cached_url = Lampa.Storage.get(cache_key);
        
        if (cached_url && cached_url !== "none") {
            var img = new Image();
            img.src = cached_url;
            img.className = "logo-image";
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            
            _this.html.find(".new-interface-info__title").empty().append(img);
        } else if (Lampa.TMDB && Lampa.TMDB.api) {
            var url = Lampa.TMDB.api(type + "/" + data.id + "/images?api_key=" + Lampa.TMDB.key() + "&include_image_language=" + language + ",en,null");
            
            $.get(url, function(data_api) {
                if (renderId && renderId !== _this.lastRenderId) return;
                
                var final_logo = null;
                if (data_api.logos && data_api.logos.length > 0) {
                    for (var i = 0; i < data_api.logos.length; i++) {
                        if (data_api.logos[i].iso_639_1 == language) {
                            final_logo = data_api.logos[i].file_path;
                            break;
                        }
                    }
                    if (!final_logo) {
                        for (var j = 0; j < data_api.logos.length; j++) {
                            if (data_api.logos[j].iso_639_1 == "en") {
                                final_logo = data_api.logos[j].file_path;
                                break;
                            }
                        }
                    }
                    if (!final_logo) final_logo = data_api.logos[0].file_path;
                }
                
                if (final_logo) {
                    var img_url = Lampa.TMDB.image("/t/p/original" + final_logo.replace(".svg", ".png"));
                    Lampa.Storage.set(cache_key, img_url);
                    
                    var img = new Image();
                    img.src = img_url;
                    img.className = "logo-image";
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    
                    _this.html.find(".new-interface-info__title").empty().append(img);
                } else {
                    Lampa.Storage.set(cache_key, "none");
                }
            }).fail(function() {
                console.log("Помилка завантаження логотипу");
            });
        }
    };
    
    InfoPanel.prototype.load = function(data) {
        if (!data || !data.id) return;
        
        var source = data.source || "tmdb";
        if (source !== "tmdb" && source !== "cub") return;
        
        if (!Lampa.TMDB || typeof Lampa.TMDB.api !== "function" || typeof Lampa.TMDB.key !== "function") return;
        
        var mediaType = data.media_type === "tv" || data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "uk";
        var apiUrl = Lampa.TMDB.api(mediaType + "/" + data.id + "?api_key=" + Lampa.TMDB.key() + "&append_to_response=content_ratings,release_dates&language=" + language);
        
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
        
        var year = ((data.release_date || data.first_air_date || "0000") + "").slice(0, 4);
        var rating = parseFloat((data.vote_average || 0) + "").toFixed(1);
        var detailsInfo = [];
        
        // Рейтинг
        if (Lampa.Storage.get("rat") !== false && rating > 0) {
            var rate_style = "";
            if (Lampa.Storage.get("si_colored_ratings", true)) {
                var vote_num = parseFloat(rating);
                var color = "";
                
                if (vote_num >= 0 && vote_num <= 3) color = "red";
                else if (vote_num > 3 && vote_num < 6) color = "orange";
                else if (vote_num >= 6 && vote_num < 7) color = "cornflowerblue";
                else if (vote_num >= 7 && vote_num < 8) color = "darkmagenta";
                else if (vote_num >= 8 && vote_num <= 10) color = "lawngreen";
                
                if (color) rate_style = ' style="color: ' + color + '"';
            }
            
            detailsInfo.push('<div class="full-start__rate"' + rate_style + '><div>' + rating + '</div><div>TMDB</div></div>');
        }
        
        // Жанри
        if (Lampa.Storage.get("ganr") !== false && data.genres && data.genres.length > 0) {
            var genres = data.genres.slice(0, 2).map(function(genre) {
                return genre.name;
            }).join(" | ");
            detailsInfo.push(genres);
        }
        
        // Тривалість
        if (Lampa.Storage.get("vremya") !== false && data.runtime) {
            var time = Lampa.Utils.secondsToTime(data.runtime * 60, true);
            detailsInfo.push(time);
        }
        
        // Сезони
        if (Lampa.Storage.get("seas", false) && data.number_of_seasons) {
            detailsInfo.push('<span class="full-start__pg" style="font-size: 0.9em;">Сезонів ' + data.number_of_seasons + '</span>');
        }
        
        // Епізоди
        if (Lampa.Storage.get("eps", false) && data.number_of_episodes) {
            detailsInfo.push('<span class="full-start__pg" style="font-size: 0.9em;">Епізодів ' + data.number_of_episodes + '</span>');
        }
        
        // Вікове обмеження
        if (Lampa.Storage.get("year_ogr") !== false) {
            var ageRating = Lampa.Api.sources.tmdb.parsePG(data);
            if (ageRating) {
                detailsInfo.push('<span class="full-start__pg" style="font-size: 0.9em;">' + ageRating + '</span>');
            }
        }
        
        // Статус
        if (Lampa.Storage.get("status") !== false && data.status) {
            var statusText = "";
            switch (data.status.toLowerCase()) {
                case "released": statusText = "Випущено"; break;
                case "ended": statusText = "Завершено"; break;
                case "returning series": statusText = "Онґоїнг"; break;
                case "canceled": statusText = "Скасовано"; break;
                case "post production": statusText = "Скоро"; break;
                case "planned": statusText = "Заплановано"; break;
                case "in production": statusText = "У виробництві"; break;
                default: statusText = data.status;
            }
            
            if (statusText) {
                detailsInfo.push('<span class="full-start__status" style="font-size: 0.9em;">' + statusText + '</span>');
            }
        }
        
        // Рік та країни
        var yc = [];
        if (year !== "0000") yc.push("<span>" + year + "</span>");
        
        var countries = Lampa.Api.sources.tmdb.parseCountries(data);
        if (countries && countries.length > 0) {
            if (countries.length > 2) countries = countries.slice(0, 2);
            yc.push(countries.join(", "));
        }
        
        if (yc.length > 0) {
            detailsInfo.push(yc.join(", "));
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
        
        data.results.forEach(function(card) {
            if (card.wide !== false) {
                card.wide = false;
            }
        });
        
        if (Lampa.Utils.extendItemsParams) {
            Lampa.Utils.extendItemsParams(data.results, {
                style: {
                    name: Lampa.Storage.get("wide_post") !== false ? "wide" : "small"
                }
            });
        }
    }
    
    function handleCard(state, card) {
        if (!card || card.__newInterfaceCard) return;
        if (typeof card.use !== "function" || !card.data) return;
        
        card.__newInterfaceCard = true;
        card.params = card.params || {};
        card.params.style = card.params.style || {};
        
        var targetStyle = Lampa.Storage.get("wide_post") !== false ? "wide" : "small";
        card.params.style.name = targetStyle;
        
        if (card.render && typeof card.render === "function") {
            var element = card.render(true);
            if (element) {
                var node = element.jquery ? element[0] : element;
                if (node && node.classList) {
                    if (targetStyle === "wide") {
                        node.classList.add("card--wide");
                        node.classList.remove("card--small");
                    } else {
                        node.classList.add("card--small");
                        node.classList.remove("card--wide");
                    }
                }
            }
        }
        
        card.use({
            onFocus: function() {
                state.update(card.data);
            },
            onHover: function() {
                state.update(card.data);
            },
            onTouch: function() {
                state.update(card.data);
            },
            onDestroy: function() {
                delete card.__newInterfaceCard;
            }
        });
    }
    
    function getCardData(card, results, index) {
        index = index || 0;
        
        if (card && card.data) return card.data;
        if (results && Array.isArray(results.results)) {
            return results.results[index] || results.results[0];
        }
        
        return null;
    }
    
    function findCardData(element) {
        if (!element) return null;
        
        var node = element && element.jquery ? element[0] : element;
        
        while (node && !node.card_data) {
            node = node.parentNode;
        }
        
        return node && node.card_data ? node.card_data : null;
    }
    
    function getFocusedCard(items) {
        var container = items && typeof items.render === "function" ? items.render(true) : null;
        if (!container || !container.querySelector) return null;
        
        var focusedElement = container.querySelector(".selector.focus") || container.querySelector(".focus");
        return findCardData(focusedElement);
    }
    
    function handleLineAppend(items, line, data) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;
        
        var state = getOrCreateState(items);
        
        line.items_per_row = 12;
        line.view = 12;
        if (line.params) {
            line.params.items_per_row = 12;
            if (line.params.items) line.params.items.view = 12;
        }
        
        var processCard = function(card) {
            handleCard(state, card);
        };
        
        line.use({
            onInstance: function(instance) {
                processCard(instance);
            },
            onActive: function(card, results) {
                var cardData = getCardData(card, results);
                if (cardData) state.update(cardData);
            },
            onToggle: function() {
                setTimeout(function() {
                    var focusedCard = getFocusedCard(line);
                    if (focusedCard) state.update(focusedCard);
                }, 32);
            },
            onMore: function() {
                state.reset();
            },
            onDestroy: function() {
                state.reset();
                delete line.__newInterfaceLine;
            }
        });
        
        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(processCard);
        }
        
        if (line.last) {
            var lastCardData = findCardData(line.last);
            if (lastCardData) state.update(lastCardData);
        }
    }
    
    function wrapMethod(object, methodName, wrapper) {
        if (!object) return;
        
        var originalMethod = typeof object[methodName] === "function" ? object[methodName] : null;
        
        object[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            return wrapper.call(this, originalMethod, args);
        };
    }
    
    function addStyles() {
        if (addStyles.added) return;
        addStyles.added = true;
        
        var styles = Lampa.Storage.get("wide_post") !== false ? getWideStyles() : getSmallStyles();
        
        if (Lampa.Template && Lampa.Template.add) {
            Lampa.Template.add("new_interface_style_v3", styles);
        }
        
        if ($) {
            $("body").append(styles);
        } else {
            var styleEl = document.createElement("style");
            styleEl.innerHTML = styles;
            document.head.appendChild(styleEl);
        }
    }
    
    function getWideStyles() {
        return '<style>' +
            '.new-interface .card.card--wide { width: 18.3em; }' +
            '.new-interface .card.card--small { width: 18.3em; }' +
            '.new-interface-info { position: relative; padding: 1.5em; height: 27.5em; }' +
            '.new-interface-info__body { position: absolute; z-index: 9999999; width: 80%; padding-top: 1.1em; }' +
            '.new-interface-info__head { color: rgba(255, 255, 255, 0.6); font-size: 1.3em; min-height: 1em; }' +
            '.new-interface-info__head.visible, .new-interface-info__details.visible { opacity: 1; }' +
            '.new-interface-info__head, .new-interface-info__details { opacity: 0; transition: opacity 0.5s ease; min-height: 2.2em !important; }' +
            '.new-interface-info__title { font-size: 4em; font-weight: 600; margin-bottom: 0.3em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; margin-left: -0.03em; line-height: 1.3; }' +
            '.new-interface-info__details { margin-top: 1.2em; margin-bottom: 1.6em; display: flex; align-items: center; flex-wrap: wrap; min-height: 1.9em; font-size: 1.3em; }' +
            '.new-interface-info__split { margin: 0 1em; font-size: 0.7em; }' +
            '.new-interface-info__description { font-size: 1.4em; font-weight: 310; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; width: 65%; }' +
            '.new-interface .full-start__background-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }' +
            '.new-interface .full-start__background { position: absolute; height: 108%; width: 100%; top: -5em; left: 0; opacity: 0; object-fit: cover; transition: opacity 0.8s ease; }' +
            '.new-interface .full-start__background.active { opacity: 0.5; }' +
            '.new-interface .full-start__rate { font-size: 1.3em; margin-right: 0; }' +
            '.new-interface .card__promo { display: none; }' +
            '.new-interface .card.card--wide .card-watched { display: none !important; }' +
            '.logo-image { max-width: 100%; height: auto; }' +
            (Lampa.Storage.get("hide_captions", true) ? ".card:not(.card--collection) .card__age, .card:not(.card--collection) .card__title { display: none !important; }" : "") +
            '</style>';
    }
    
    function getSmallStyles() {
        return '<style>' +
            '.new-interface .card.card--wide { width: 18.3em; }' +
            '.new-interface-info { position: relative; padding: 1.5em; height: 19.8em; }' +
            '.new-interface-info__body { position: absolute; z-index: 9999999; width: 80%; padding-top: 0.2em; }' +
            '.new-interface-info__head { color: rgba(255, 255, 255, 0.6); margin-bottom: 0.3em; font-size: 1.2em; min-height: 1em; }' +
            '.new-interface-info__head.visible, .new-interface-info__details.visible { opacity: 1; }' +
            '.new-interface-info__head, .new-interface-info__details { opacity: 0; transition: opacity 0.5s ease; min-height: 2.2em !important; }' +
            '.new-interface-info__title { font-size: 3em; font-weight: 600; margin-bottom: 0.2em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; margin-left: -0.03em; line-height: 1.3; }' +
            '.new-interface-info__details { margin-top: 1.2em; margin-bottom: 1.6em; display: flex; align-items: center; flex-wrap: wrap; min-height: 1.9em; font-size: 1.2em; }' +
            '.new-interface-info__split { margin: 0 1em; font-size: 0.7em; }' +
            '.new-interface-info__description { font-size: 1.3em; font-weight: 310; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; width: 70%; }' +
            '.new-interface .full-start__background-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }' +
            '.new-interface .full-start__background { position: absolute; height: 108%; width: 100%; top: -5em; left: 0; opacity: 0; object-fit: cover; transition: opacity 0.8s ease; }' +
            '.new-interface .full-start__background.active { opacity: 0.5; }' +
            '.new-interface .full-start__rate { font-size: 1.2em; margin-right: 0; }' +
            '.new-interface .card__promo { display: none; }' +
            '.new-interface .card.card--wide .card-watched { display: none !important; }' +
            '.logo-image { max-width: 100%; height: auto; }' +
            (Lampa.Storage.get("hide_captions", true) ? ".card:not(.card--collection) .card__age, .card:not(.card--collection) .card__title { display: none !important; }" : "") +
            '</style>';
    }
    
    // Налаштування кольорів рейтингів
    function siStyleGetColorByRating(vote) {
        if (isNaN(vote)) return "";
        if (vote >= 0 && vote <= 3) return "red";
        if (vote > 3 && vote < 6) return "orange";
        if (vote >= 6 && vote < 7) return "cornflowerblue";
        if (vote >= 7 && vote < 8) return "darkmagenta";
        if (vote >= 8 && vote <= 10) return "lawngreen";
        return "";
    }
    
    function siStyleApplyColorByRating(element) {
        var $el = $(element);
        var voteText = $el.text().trim();
        
        var match = voteText.match(/(\d+(\.\d+)?)/);
        if (!match) return;
        
        var vote = parseFloat(match[0]);
        var color = siStyleGetColorByRating(vote);
        
        if (color && Lampa.Storage.get("si_colored_ratings", true)) {
            $el.css("color", color);
            
            if (Lampa.Storage.get("si_rating_border", false)) {
                $el.css("border", "1px solid " + color);
            } else {
                $el.css("border", "");
            }
        } else {
            $el.css("color", "");
            $el.css("border", "");
        }
    }
    
    function siStyleUpdateVoteColors() {
        if (!Lampa.Storage.get("si_colored_ratings", true)) return;
        
        $(".card__vote").each(function() {
            siStyleApplyColorByRating(this);
        });
        
        $(".full-start__rate").each(function() {
            siStyleApplyColorByRating(this);
        });
    }
    
    function siStyleSetupVoteColorsObserver() {
        siStyleUpdateVoteColors();
        
        var observer = new MutationObserver(function(mutations) {
            if (!Lampa.Storage.get("si_colored_ratings", true)) return;
            
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType === 1) {
                        var $node = $(node);
                        $node.find(".card__vote, .full-start__rate").each(function() {
                            siStyleApplyColorByRating(this);
                        });
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function siStyleSetupVoteColorsForDetailPage() {
        if (!window.Lampa || !Lampa.Listener) return;
        
        Lampa.Listener.follow("full", function(data) {
            if (data.type === "complite") {
                siStyleUpdateVoteColors();
            }
        });
    }
    
    // Попереднє завантаження
    var preloadTimer = null;
    function preloadAllVisibleCards() {
        if (!Lampa.Storage.get("async_load", true)) return;
        
        clearTimeout(preloadTimer);
        preloadTimer = setTimeout(function() {
            var layer = $(".layer--visible");
            if (!layer.length) return;
            
            var cards = layer.find(".card");
            cards.each(function() {
                var data = findCardData(this);
                if (data) {
                    preloadData(data, true);
                }
            });
        }, 800);
    }
    
    function preloadData(data, silent) {
        if (!data || !data.id) return;
        var source = data.source || "tmdb";
        if (source !== "tmdb" && source !== "cub") return;
        
        var mediaType = data.media_type === "tv" || data.name ? "tv" : "movie";
        var language = Lampa.Storage.get("language") || "uk";
        var apiUrl = Lampa.TMDB.api(mediaType + "/" + data.id + "?api_key=" + Lampa.TMDB.key() + "&append_to_response=content_ratings,release_dates&language=" + language);
        
        if (!globalInfoCache[apiUrl]) {
            var network = new Lampa.Reguest();
            network.silent(apiUrl, function(response) {
                globalInfoCache[apiUrl] = response;
            });
        }
    }
    
    function setupPreloadObserver() {
        var observer = new MutationObserver(function(mutations) {
            if (!Lampa.Storage.get("async_load", true)) return;
            
            var hasNewCards = false;
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType === 1) {
                        if (node.classList && (node.classList.contains("card") || node.querySelector(".card"))) {
                            hasNewCards = true;
                            break;
                        }
                    }
                }
                if (hasNewCards) break;
            }
            
            if (hasNewCards) {
                preloadAllVisibleCards();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Ініціалізація налаштувань
    function initializeSettings() {
        try {
            if (!Lampa.SettingsApi) return;
            
            // Дитячий режим
            if (Lampa.TMDB && Lampa.TMDB.api) {
                var originalApi = Lampa.TMDB.api;
                Lampa.TMDB.api = function(url) {
                    if (Lampa.Storage.get("child_mode", false)) {
                        if (url.indexOf("discover/") !== -1 || url.indexOf("trending/") !== -1) {
                            if (url.indexOf("certification") === -1) {
                                var separator = url.indexOf("?") !== -1 ? "&" : "?";
                                url = url + separator + "certification_country=RU&certification.lte=16&include_adult=false";
                            }
                        }
                        if (url.indexOf("include_adult") === -1 && url.indexOf("search/") !== -1) {
                            var separator = url.indexOf("?") !== -1 ? "&" : "?";
                            url = url + separator + "include_adult=false";
                        }
                    }
                    return originalApi(url);
                };
            }
            
            // Додавання компонента налаштувань
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: { name: "style_interface", type: "static", default: true },
                field: { name: "Стильний інтерфейс", description: "Налаштування елементів" },
                onRender: function(item) {
                    item.css("opacity", "0");
                    setTimeout(function() {
                        var target = $('div[data-name="interface_size"]');
                        if (target.length) {
                            item.insertAfter(target);
                        }
                        item.css("opacity", "");
                    }, 100);
                    
                    item.on("hover:enter", function() {
                        Lampa.Settings.create("style_interface");
                        if (Lampa.Controller.enabled() && Lampa.Controller.enabled().controller) {
                            Lampa.Controller.enabled().controller.back = function() {
                                Lampa.Settings.create("interface");
                            };
                        }
                    });
                }
            });
            
            // Додавання параметрів налаштувань
            var settings = [
                { name: "logo_show", type: "trigger", default: true, field: { name: "Показувати логотип замість назви" } },
                { name: "show_background", type: "trigger", default: true, field: { name: "Відображати постери на фоні" } },
                { name: "status", type: "trigger", default: true, field: { name: "Показувати статус фільму/серіалу" } },
                { name: "seas", type: "trigger", default: false, field: { name: "Показувати кількість сезонів" } },
                { name: "eps", type: "trigger", default: false, field: { name: "Показувати кількість епізодів" } },
                { name: "year_ogr", type: "trigger", default: true, field: { name: "Показувати вікове обмеження" } },
                { name: "vremya", type: "trigger", default: true, field: { name: "Показувати тривалість фільму" } },
                { name: "ganr", type: "trigger", default: true, field: { name: "Показувати жанр фільму" } },
                { name: "rat", type: "trigger", default: true, field: { name: "Показувати рейтинг фільму" } },
                { name: "si_colored_ratings", type: "trigger", default: true, field: { name: "Кольорові рейтинги" } },
                { name: "si_rating_border", type: "trigger", default: false, field: { name: "Обводка рейтингів" } },
                { name: "child_mode", type: "trigger", default: false, field: { name: "Дитячий режим", description: "Lampa буде перезавантажена" } },
                { name: "async_load", type: "trigger", default: true, field: { name: "Включити асинхронне завантаження даних" } },
                { name: "background_resolution", type: "select", default: "original", values: { w300: "w300", w780: "w780", w1280: "w1280", original: "original" }, field: { name: "Роздільна здатність фону" } },
                { name: "hide_captions", type: "trigger", default: true, field: { name: "Приховувати назви та рік", description: "Lampa буде перезавантажена" } },
                { name: "wide_post", type: "trigger", default: true, field: { name: "Широкі постери", description: "Lampa буде перезавантажена" } }
            ];
            
            settings.forEach(function(setting) {
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: setting,
                    field: setting.field
                });
            });
            
            // Додавання кнопки очищення кешу
            Lampa.SettingsApi.addParam({
                component: "style_interface",
                param: { name: "int_clear_logo_cache", type: "static" },
                field: { name: "Очистити кеш логотипів", description: "Lampa буде перезавантажена" },
                onRender: function(item) {
                    item.on("hover:enter", function() {
                        if (Lampa.Select && Lampa.Select.show) {
                            Lampa.Select.show({
                                title: "Очистити кеш логотипів?",
                                items: [{ title: "Так", confirm: true }, { title: "Ні" }],
                                onSelect: function(a) {
                                    if (a.confirm) {
                                        var keys = [];
                                        for (var i = 0; i < localStorage.length; i++) {
                                            var key = localStorage.key(i);
                                            if (key && key.indexOf("logo_cache_v2_") !== -1) {
                                                keys.push(key);
                                            }
                                        }
                                        keys.forEach(function(key) {
                                            localStorage.removeItem(key);
                                        });
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    });
                }
            });
            
            // Встановлення налаштувань за замовчуванням
            setTimeout(function() {
                if (!Lampa.Storage.get("int_plug", false)) {
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
                        "child_mode": "false",
                        "interface_size": "small"
                    };
                    
                    for (var key in defaults) {
                        if (defaults.hasOwnProperty(key)) {
                            Lampa.Storage.set(key, defaults[key]);
                        }
                    }
                }
            }, 1000);
            
        } catch (e) {
            console.log("Помилка ініціалізації налаштувань:", e);
        }
    }
    
    // Запуск плагіна
    waitForLampa(initPlugin);
    
})();
