(function() {
    "use strict";
    
    // Перевіряємо наявність Lampa
    if (typeof Lampa === "undefined") return;
    if (window.plugin_interface_ready_v3) return;
    window.plugin_interface_ready_v3 = true;
    
    // Ініціалізуємо платформу TV для Samsung
    Lampa.Platform.tv();
    
    // Функція додавання стилів
    function addStyles() {
        var style = document.createElement('style');
        style.innerHTML = `
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
        `;
        document.head.appendChild(style);
    }
    
    // Додаємо стилі одразу
    addStyles();
    
    // Чекаємо готовності Lampa
    setTimeout(function() {
        if (!Lampa.Maker || !Lampa.Maker.map) return;
        
        var mainMaker = Lampa.Maker.map("Main");
        if (!mainMaker || !mainMaker.Items || !mainMaker.Create) return;
        
        // Перехоплюємо створення інтерфейсу
        var originalCreate = mainMaker.Create.onCreate;
        mainMaker.Create.onCreate = function() {
            if (originalCreate) originalCreate.apply(this, arguments);
            
            // Перевіряємо чи це TV
            var isTV = Lampa.Platform.is('tizen') || 
                      Lampa.Platform.is('webos') || 
                      Lampa.Platform.is('tv') ||
                      navigator.userAgent.toLowerCase().indexOf('smart-tv') > -1 ||
                      navigator.userAgent.toLowerCase().indexOf('tizen') > -1;
            
            if (!isTV && window.innerWidth < 767) return;
            
            // Створюємо інтерфейс
            var container = this.render(true);
            if (!container) return;
            
            container.classList.add("new-interface");
            
            // Створюємо інформаційну панель
            var infoPanel = document.createElement('div');
            infoPanel.className = 'new-interface-info';
            infoPanel.innerHTML = `
                <div class="new-interface-info__body">
                    <div class="new-interface-info__head"></div>
                    <div class="new-interface-info__title"></div>
                    <div class="new-interface-info__details"></div>
                    <div class="new-interface-info__description"></div>
                </div>
            `;
            
            // Додаємо фон
            var backgroundWrapper = document.createElement("div");
            backgroundWrapper.className = "full-start__background-wrapper";
            var bg = document.createElement("img");
            bg.className = "full-start__background";
            backgroundWrapper.appendChild(bg);
            
            container.insertBefore(backgroundWrapper, container.firstChild);
            container.insertBefore(infoPanel, backgroundWrapper.nextSibling);
            
            // Зберігаємо посилання
            this.infoPanel = infoPanel;
            this.background = bg;
        };
        
        // Перехоплюємо додавання карток
        var originalAppend = mainMaker.Items.onAppend;
        mainMaker.Items.onAppend = function() {
            if (originalAppend) originalAppend.apply(this, arguments);
            
            var element = arguments[0];
            var data = arguments[1];
            
            if (element && data) {
                // Змінюємо ширину карток
                if (element.items) {
                    element.items_per_row = 12;
                    element.view = 12;
                }
                
                // Додаємо обробку фокусу
                if (element.use) {
                    element.use({
                        onFocus: function(card) {
                            updateInfo(card.data, this.infoPanel, this.background);
                        }.bind(this)
                    });
                }
            }
        };
        
        // Функція оновлення інформації
        function updateInfo(data, infoPanel, background) {
            if (!data || !infoPanel) return;
            
            var title = infoPanel.querySelector('.new-interface-info__title');
            var desc = infoPanel.querySelector('.new-interface-info__description');
            var details = infoPanel.querySelector('.new-interface-info__details');
            var head = infoPanel.querySelector('.new-interface-info__head');
            
            if (title) title.textContent = data.title || data.name || "";
            if (desc) desc.textContent = data.overview || "Немає опису";
            
            // Оновлюємо деталі
            var year = data.release_date ? data.release_date.substring(0, 4) : 
                     data.first_air_date ? data.first_air_date.substring(0, 4) : "";
            var rating = data.vote_average ? parseFloat(data.vote_average).toFixed(1) : "";
            
            var detailsHTML = [];
            if (year) detailsHTML.push(year);
            if (rating) detailsHTML.push('<div class="full-start__rate"><div>' + rating + '</div><div>TMDB</div></div>');
            
            if (details) details.innerHTML = detailsHTML.join('<span class="new-interface-info__split">●</span>');
            
            // Оновлюємо фон
            if (background && data.backdrop_path) {
                var backdropUrl = Lampa.Api.img(data.backdrop_path, "original");
                background.src = backdropUrl;
                setTimeout(function() {
                    background.classList.add("active");
                }, 100);
            }
        }
        
        // Додаємо налаштування
        setTimeout(function() {
            if (Lampa.SettingsApi && Lampa.SettingsApi.addComponent) {
                Lampa.SettingsApi.addComponent({
                    component: "style_interface",
                    name: "Стильний інтерфейс",
                });
                
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
                    onRender: function(item) {
                        item.on("hover:enter", function() {
                            Lampa.Settings.create("style_interface");
                        });
                    },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "show_background", type: "trigger", default: true },
                    field: { name: "Відображати постера на фоні" },
                });
                
                Lampa.SettingsApi.addParam({
                    component: "style_interface",
                    param: { name: "wide_post", type: "trigger", default: true },
                    field: { name: "Широкі постера" },
                });
            }
        }, 1000);
        
    }, 1000);
    
})();
