// Версія плагіну: .5 - Фінальна версія з адаптацією під Lampa 3.0.0+  
// Поєднує розділення кнопок та оптимізовані SVG/стилі  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'EnhancedButtonSeparator';  
    let observer = null;  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        initStyles();  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                    updateButtonSVGs();  
                    startObserver(event);  
                }, 300);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    function initStyles() {  
        if (!document.getElementById('enhanced-buttons-style')) {  
            const style = document.createElement('style');  
            style.id = 'enhanced-buttons-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                  
                .full-start__button.view--online svg path { fill: #2196f3 !important; }  
                .full-start__button.view--torrent svg path { fill: lime !important; }  
                .full-start__button.view--trailer svg path { fill: #f44336 !important; }  
                  
                .full-start__button svg {  
                    width: 1.5em !important;  
                    height: 1.5em !important;  
                }  
                  
                .full-start__button.loading::before {  
                    content: '';  
                    position: absolute;  
                    top: 0; left: 0; right: 0;  
                    height: 2px;  
                    background: rgba(255,255,255,0.5);  
                    animation: loading 1s linear infinite;  
                }  
                  
                @keyframes loading {  
                    from { transform: translateX(-100%); }  
                    to   { transform: translateX(100%); }  
                }  
                  
                @media (max-width: 767px) {  
                    .full-start__button {  
                        min-height: 44px !important;  
                        padding: 10px !important;  
                    }  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    const svgs = {  
        online: `  
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.051 30.051">  
                <g>  
                    <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z"/>  
                    <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z"/>  
                </g>  
            </svg>  
        `,  
        torrent: `  
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">  
                <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z"/>  
            </svg>  
        `,  
        trailer: `  
            <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">  
                <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"/>  
            </svg>  
        `  
    };  
      
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const mainContainer = render.find('.full-start-new__buttons');  
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) return;  
              
            // Додаємо тільки торренти та трейлери (без онлайн кнопки)  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
            }  
              
            reorderButtons(mainContainer);  
              
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 200);  
            }  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    function updateButtonSVGs() {  
        // Оновлюємо кнопку "Дивитись" з іконкою онлайн  
        $('.full-start__button.button--play').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                // Створюємо новий SVG елемент з правильним контентом  
                const newSvg = $(svgs.online);  
                oldSvg.replaceWith(newSvg);  
                  
                // Додаємо синій колір через CSS  
                button.addClass('view--online');  
                console.log('Іконку онлайн застосовано до кнопки Дивитись');  
            }  
        });  
          
        // Оновлюємо торренти  
        $('.full-start__button.view--torrent').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                const newSvg = $(svgs.torrent);  
                oldSvg.replaceWith(newSvg);  
            }  
        });  
          
        // Оновлюємо трейлери  
        $('.full-start__button.view--trailer').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                const newSvg = $(svgs.trailer);  
                oldSvg.replaceWith(newSvg);  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
              
            let order = 999;  
              
            // Кнопка "Дивитись" - перша  
            if (classes.includes('button--play')) {  
                order = 0;  
            } else if (classes.includes('view--torrent')) {  
                order = 1;  
            } else if (classes.includes('view--trailer')) {  
                order = 2;  
            }  
              
            button.css('order', order);  
        });  
    }  
      
    function startObserver(event) {  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver(() => {  
            setTimeout(updateButtonSVGs, 100);  
        });  
          
        observer.observe(mainContainer, {  
            childList: true,  
            subtree: false  
        });  
    }  
      
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
        }  
    }  
      
    // Реєстрація плагіна  
    if (typeof Lampa !== 'undefined') {  
        const manifest = {  
            type: 'component',  
            name: 'Enhanced Button Separator',  
            version: '4.5.0',  
            author: 'Merged Plugin',  
            description: 'Об\'єднаний плагін: розділення кнопок + оптимізовані SVG/стилі з адаптацією під Lampa 3.0.0+'  
        };  
          
        if (window.plugin) {  
            window.plugin('enhanced_button_separator', manifest);  
        }  
          
        Lampa.Manifest.plugins = manifest;  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
})();
