(function() {
    "use strict";
    
    if (typeof Lampa === "undefined") return;
    if (window.plugin_interface_ready_v3) return;
    window.plugin_interface_ready_v3 = true;
    
    // Проста перевірка на TV
    function isTV() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('smart-tv') > -1 || 
               ua.indexOf('tizen') > -1 || 
               ua.indexOf('webos') > -1 ||
               Lampa.Platform.is('tizen') ||
               Lampa.Platform.is('tv');
    }
    
    // Тільки для TV
    if (!isTV() && window.innerWidth < 767) return;
    
    // Додаємо стилі
    var style = document.createElement('style');
    style.textContent = `
        .new-interface-info {
            position: relative;
            padding: 20px;
            height: 300px;
            z-index: 100;
        }
        .new-interface-info__title {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .new-interface-info__description {
            font-size: 18px;
            max-width: 60%;
            margin-top: 20px;
        }
        .interface-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.3;
            object-fit: cover;
        }
    `;
    document.head.appendChild(style);
    
    // Чекаємо завантаження
    setTimeout(function() {
        if (!Lampa.Maker || !Lampa.Maker.map) return;
        
        var mainMaker = Lampa.Maker.map("Main");
        if (!mainMaker) return;
        
        // Додаємо інтерфейс
        var originalCreate = mainMaker.Create.onCreate;
        mainMaker.Create.onCreate = function() {
            if (originalCreate) originalCreate.apply(this, arguments);
            
            var container = this.render(true);
            if (!container) return;
            
            var infoDiv = document.createElement('div');
            infoDiv.className = 'new-interface-info';
            infoDiv.innerHTML = '<div class="new-interface-info__title"></div><div class="new-interface-info__description"></div>';
            
            var bg = document.createElement('img');
            bg.className = 'interface-background';
            
            container.insertBefore(bg, container.firstChild);
            container.insertBefore(infoDiv, container.firstChild);
            
            this.infoDiv = infoDiv;
            this.bg = bg;
        };
        
        // Додаємо налаштування
        if (Lampa.SettingsApi) {
            setTimeout(function() {
                Lampa.SettingsApi.addComponent({
                    component: "style_interface",
                    name: "Стильний інтерфейс",
                });
                
                Lampa.SettingsApi.addParam({
                    component: "interface",
                    param: { name: "style_interface", type: "static", default: true },
                    field: { name: "Стильний інтерфейс", description: "Для телевізорів" },
                });
            }, 2000);
        }
        
    }, 2000);
    
})();
