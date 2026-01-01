// Версія плагіну: 4.2 - Версія з налаштуваннями    
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери + оптимізовані SVG та стилі    
// Підтримка кнопки "Дивитись" для Lampa 3.0.0+ + Налаштування    
    
(function() {    
    'use strict';    
        
    const PLUGIN_NAME = 'UnifiedButtonManager';    
    let observer = null;    
        
    // === Перевірка версії Lampa ===    
    function isLampaVersionOrHigher(minVersion) {    
        try {    
            let version = null;    
                
            if (window.Lampa && window.Lampa.Manifest && window.Lampa.Manifest.app_version) {    
                version = window.Lampa.Manifest.app_version;    
            } else if (window.lampa_settings && window.lampa_settings.version) {    
                version = window.lampa_settings.version;    
            } else if (window.Lampa && window.Lampa.App && window.Lampa.App.version) {    
                version = window.Lampa.App.version;    
            }    
                
            if (!version) return false;    
                
            const current = parseInt(version.replace(/\./g, ''));    
            const minimum = parseInt(minVersion.replace(/\./g, ''));    
                
            return current >= minimum;    
        } catch (e) {    
            console.warn(`${PLUGIN_NAME}: Помилка перевірки версії`, e);    
            return false;    
        }    
    }    
        
    // === Додавання перекладів ===    
    function addTranslations() {    
        Lampa.Lang.add({    
            unified_button_manager_title: {    
                ru: 'Менеджер кнопок',    
                uk: 'Менеджер кнопок',    
                en: 'Button Manager'    
            },    
            unified_button_manager_edit_buttons: {    
                ru: 'Редактировать кнопки',    
                uk: 'Редагувати кнопки',    
                en: 'Edit Buttons'    
            },    
            unified_button_manager_colorful_buttons: {    
                ru: 'Цветные кнопки',    
                uk: 'Кольорові кнопки',    
                en: 'Colorful Buttons'    
            },    
            unified_button_manager_custom_order: {    
                ru: 'Настраиваемый порядок кнопок',    
                uk: 'Налаштовуваний порядок кнопок',    
                en: 'Custom Button Order'    
            }    
        });    
    }    
        
    // === Застосування налаштувань ===    
    function applySettings() {    
        const settings = Lampa.Storage.get('unified_button_manager_settings', {    
            enable_online: true,    
            enable_torrent: true,    
            enable_trailer: true,    
            hide_sources: true,    
            colorful_buttons: true,    
            custom_order: ['play', 'online', 'torrent', 'trailer']    
        });    
            
        return settings;    
    }    
        
    // === CSS стилі ===    
    function addStyles() {    
        if (!document.getElementById('unified-buttons-style')) {    
            const style = document.createElement('style');    
            style.id = 'unified-buttons-style';    
            style.textContent = `    
                .full-start__button {    
                    position: relative !important;    
                    transition: transform 0.2s ease !important;    
                }    
                .full-start__button:active {    
                    transform: scale(0.98) !important;    
                }    
                    
                /* Кольорові кнопки (за замовчуванням) */    
                .full-start__button.view--online svg path {       
                    fill: #2196f3 !important;       
                }    
                .full-start__button.view--torrent svg path {       
                    fill: lime !important;       
                }    
                .full-start__button.view--trailer svg path {       
                    fill: #f44336 !important;       
                }    
                .full-start__button.button--play svg path {       
                    fill: #2196f3 !important;       
                }    
                    
                /* Чорно-білі кнопки (коли colorful_buttons = false) */    
                .full-start__button.monochrome.view--online svg path,    
                .full-start__button.monochrome.view--torrent svg path,    
                .full-start__button.monochrome.view--trailer svg path,    
                .full-start__button.monochrome.button--play svg path {    
                    fill: currentColor !important;    
                }    
                    
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
                    
                /* Стилі для редактора кнопок */    
                .button-edit-list {    
                    background: rgba(0,0,0,0.8);    
                    border-radius: 0.5em;    
                    padding: 1em;    
                }    
                    
                .button-edit-list__item {    
                    display: flex !important;    
                    padding: 0.8em !important;    
                    border-radius: 0.3em !important;    
                    align-items: center !important;    
                    margin-bottom: 0.5em !important;    
                    background: rgba(255, 255, 255, 0.05) !important;    
                }    
                    
                .button-edit-list__item:nth-child(even) {    
                    background: rgba(255, 255, 255, 0.1) !important;    
                }    
                    
                .button-edit-list__icon {    
                    width: 2em !important;    
                    height: 2em !important;    
                    margin-right: 1em !important;    
                    flex-shrink: 0 !important;    
                    display: flex !important;    
                    align-items: center !important;    
                    justify-content: center !important;    
                }    
                    
                .button-edit-list__title {    
                    font-size: 1.1em !important;    
                    font-weight: 300 !important;    
                    flex-grow: 1 !important;    
                }    
                    
                .button-edit-list__move,    
                .button-edit-list__toggle {    
                    width: 2.4em !important;    
                    height: 2.4em !important;    
                    display: flex !important;    
                    align-items: center !important;    
                    justify-content: center !important;    
                    margin-left: 0.5em !important;    
                }    
                    
                .button-edit-list__move svg {    
                    width: 1em !important;    
                    height: 1em !important;    
                }    
                    
                .button-edit-list__toggle svg {    
                    width: 1.2em !important;    
                    height: 1.2em !important;    
                }    
            `;    
            document.head.appendChild(style);    
        }    
    }    
        
    // === SVG іконки ===    
    const svgs = {    
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/></svg>`,    
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`,    
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg>`,    
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`    
    };
    // === Функція редагування кнопок ===    
    function editButtons() {    
        let list = $('<div class="button-edit-list"></div>');    
        let settings = applySettings();    
            
        // Створюємо елементи для редагування    
        const buttonTypes = [    
            { key: 'play', name: 'Дивитись', class: 'button--play', svg: svgs.play },    
            { key: 'online', name: 'Онлайн', class: 'view--online', svg: svgs.online },    
            { key: 'torrent', name: 'Торрент', class: 'view--torrent', svg: svgs.torrent },    
            { key: 'trailer', name: 'Трейлер', class: 'view--trailer', svg: svgs.trailer }    
        ];    
            
        // Сортуємо відповідно до збереженого порядку    
        buttonTypes.sort((a, b) => {    
            const orderA = settings.custom_order.indexOf(a.key);    
            const orderB = settings.custom_order.indexOf(b.key);    
            return orderA - orderB;    
        });    
            
        buttonTypes.forEach((buttonType, index) => {    
            const isEnabled = settings[`enable_${buttonType.key}`];    
                
            let item_sort = $(`<div class="button-edit-list__item">    
                <div class="button-edit-list__icon">${buttonType.svg}</div>    
                <div class="button-edit-list__title">${buttonType.name}</div>    
                <div class="button-edit-list__move move-up selector">    
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                        <path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                    </svg>    
                </div>    
                <div class="button-edit-list__move move-down selector">    
                    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">    
                        <path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>    
                    </svg>    
                </div>    
                <div class="button-edit-list__toggle toggle selector">    
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">    
                        <rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>    
                        <path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="0" stroke-linecap="round"/>    
                    </svg>    
                </div>    
            </div>`);    
                
            // Обробники переміщення    
            item_sort.find('.move-up').on('hover:enter', () => {    
                let prev = item_sort.prev();    
                if (prev.length) {    
                    item_sort.insertBefore(prev);    
                }    
            });    
                
            item_sort.find('.move-down').on('hover:enter', () => {    
                let next = item_sort.next();    
                if (next.length) {    
                    item_sort.insertAfter(next);    
                }    
            });    
                
            // Обробник увімкнення/вимкнення    
            item_sort.find('.toggle').on('hover:enter', () => {    
                const dot = item_sort.find('.dot');    
                const currentOpacity = dot.attr('opacity');    
                dot.attr('opacity', currentOpacity == '0' ? '1' : '0');    
            }).find('.dot').attr('opacity', isEnabled ? '1' : '0');    
                
            list.append(item_sort);    
        });    
            
        // Відкриваємо модальне вікно    
        Lampa.Modal.open({    
            title: Lampa.Lang.translate('unified_button_manager_edit_buttons'),    
            html: list,    
            size: 'small',    
            scroll_to_center: true,    
            onBack: () => {    
                saveButtonSettings();    
                Lampa.Modal.close();    
                Lampa.Controller.toggle('settings_component');    
            }    
        });    
    }    
        
    // === Збереження налаштувань кнопок ===    
    function saveButtonSettings() {    
        let settings = applySettings();    
        let newOrder = [];    
            
        $('.button-edit-list__item').each(function() {    
            const title = $(this).find('.button-edit-list__title').text();    
            const buttonType = [    
                { key: 'play', name: 'Дивитись' },    
                { key: 'online', name: 'Онлайн' },    
                { key: 'torrent', name: 'Торрент' },    
                { key: 'trailer', name: 'Трейлер' }    
            ].find(type => type.name === title);    
                
            if (buttonType) {    
                newOrder.push(buttonType.key);    
                const isEnabled = $(this).find('.dot').attr('opacity') == '1';    
                settings[`enable_${buttonType.key}`] = isEnabled;    
            }    
        });    
            
        settings.custom_order = newOrder;    
        Lampa.Storage.set('unified_button_manager_settings', settings);    
            
        // Застосовуємо зміни    
        applyCurrentSettings();    
    }    
        
    // === Застосування поточних налаштувань ===    
    function applyCurrentSettings() {    
        const settings = applySettings();    
            
        // Оновлюємо видимість кнопок    
        $('.full-start__button').each(function() {    
            const button = $(this);    
            const classes = button.attr('class') || '';    
                
            if (classes.includes('view--online') && !settings.enable_online) {    
                button.hide();    
            } else if (classes.includes('view--torrent') && !settings.enable_torrent) {    
                button.hide();    
            } else if (classes.includes('view--trailer') && !settings.enable_trailer) {    
                button.hide();    
            } else {    
                button.show();    
            }    
        });    
            
        // Застосовуємо кольоровий режим    
        const colorfulButtons = settings.colorful_buttons;    
        $('.full-start__button').each(function() {    
            const button = $(this);    
            if (colorfulButtons) {    
                button.removeClass('monochrome');    
            } else {    
                button.addClass('monochrome');    
            }    
        });    
            
        // Оновлюємо порядок кнопок    
        reorderButtonsWithSettings(settings);    
    }    
        
    // === Перевпорядкування кнопок з урахуванням налаштувань ===    
    function reorderButtonsWithSettings(settings) {    
        const container = $('.full-start-new__buttons, .full-start__buttons, .buttons--container').first();    
            
        if (!container.length) return;    
            
        container.css('display', 'flex');    
            
        container.find('.full-start__button').each(function() {    
            const button = $(this);    
            const classes = button.attr('class') || '';    
            const text = button.text().toLowerCase();    
                
            let order = 999;    
            let buttonKey = null;    
                
            if (classes.includes('button--play') || text.includes('дивитись') || text.includes('watch')) {    
                buttonKey = 'play';    
            } else if (classes.includes('view--online') || text.includes('онлайн')) {    
                buttonKey = 'online';    
            } else if (classes.includes('view--torrent') || text.includes('торрент')) {    
                buttonKey = 'torrent';    
            } else if (classes.includes('view--trailer') || text.includes('трейлер')) {    
                buttonKey = 'trailer';    
            }    
                
            if (buttonKey && settings.custom_order.includes(buttonKey)) {    
                order = settings.custom_order.indexOf(buttonKey);    
            }    
                
            button.css('order', order);    
        });    
    }    
    // === Основна функція обробки кнопок ===    
    function processButtons(event) {    
        try {    
            const render = event.object.activity.render();    
            const settings = applySettings();    
                
            // Шукаємо контейнери різними способами    
            let mainContainer = render.find('.full-start-new__buttons');    
            if (!mainContainer.length) {    
                mainContainer = render.find('.full-start__buttons');    
            }    
            if (!mainContainer.length) {    
                mainContainer = render.find('.buttons--container');    
            }    
                
            const hiddenContainer = render.find('.buttons--container');    
                
            if (!mainContainer.length) {    
                console.warn(`${PLUGIN_NAME}: Не знайдено контейнер кнопок`);    
                return;    
            }    
                
            // Переміщуємо кнопки з урахуванням налаштувань    
            const torrentBtn = hiddenContainer.find('.view--torrent');    
            const trailerBtn = hiddenContainer.find('.view--trailer');    
                
            if (torrentBtn.length > 0 && settings.enable_torrent) {    
                torrentBtn.removeClass('hide').addClass('selector');    
                mainContainer.append(torrentBtn);    
            }    
                
            if (trailerBtn.length > 0 && settings.enable_trailer) {    
                trailerBtn.removeClass('hide').addClass('selector');    
                mainContainer.append(trailerBtn);    
            }    
                
            setTimeout(() => {    
                removeSourcesButton(mainContainer, settings);    
            }, 200);    
                
            reorderButtonsWithSettings(settings);    
                
            setTimeout(() => {    
                updateButtons();    
            }, 300);    
                
            if (Lampa.Controller) {    
                setTimeout(() => {    
                    Lampa.Controller.collectionSet(mainContainer.parent());    
                }, 400);    
            }    
                
        } catch (error) {    
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, error);    
        }    
    }    
        
    // === Видалення непотрібних кнопок ===    
    function removeSourcesButton(mainContainer, settings) {    
        const allButtons = mainContainer.find('.full-start__button');    
        const isVersion3OrHigher = isLampaVersionOrHigher('3.0.0');    
            
        allButtons.each(function() {    
            const button = $(this);    
            const text = button.text().toLowerCase().trim();    
            const classes = button.attr('class') || '';    
                
            const isImportantButton = classes.includes('view--online') ||         
                                     classes.includes('view--torrent') ||         
                                     classes.includes('view--trailer') ||        
                                     classes.includes('button--book') ||        
                                     classes.includes('button--reaction') ||        
                                     classes.includes('button--subscribe') ||        
                                     classes.includes('button--subs') ||        
                                     text.includes('онлайн') ||        
                                     text.includes('online');    
                
            const isPlayButton = classes.includes('button--play');    
            const isSourcesButton = text.includes('джерела') ||         
                                   text.includes('джерело') ||        
                                   text.includes('sources') ||         
                                   text.includes('source') ||        
                                   text.includes('источники') ||        
                                   text.includes('источник');    
                
            const isOptionsButton = classes.includes('button--options');    
            const isEmpty = text === '' || text.length <= 2;    
                
            // Видаляємо кнопки згідно з налаштуваннями    
            if (!isImportantButton &&       
                ((isPlayButton && !isVersion3OrHigher) ||       
                 (isSourcesButton && settings.hide_sources) ||       
                 (isOptionsButton && isEmpty))) {    
                button.remove();    
            }    
        });    
    }    
        
    // === Оновлення SVG іконок ===    
    function updateButtons() {    
        const map = {    
            'view--torrent': svgs.torrent,    
            'view--online': svgs.online,    
            'view--trailer': svgs.trailer,    
            'button--play': svgs.play    
        };    
            
        for (const cls in map) {    
            $(`.full-start__button.${cls}`).each(function() {    
                const button = $(this);    
                const oldSvg = button.find('svg');    
                    
                if (oldSvg.length === 0) return;    
                    
                const newSvg = $(map[cls]);    
                    
                const width = oldSvg.attr('width') || '1.5em';    
                const height = oldSvg.attr('height') || '1.5em';    
                    
                if (oldSvg.attr('class')) {    
                    newSvg.attr('class', oldSvg.attr('class'));    
                }    
                    
                oldSvg.html(newSvg.html());    
                    
                if (newSvg.attr('viewBox')) {    
                    oldSvg.attr('viewBox', newSvg.attr('viewBox'));    
                }    
                if (newSvg.attr('xmlns')) {    
                    oldSvg.attr('xmlns', newSvg.attr('xmlns'));    
                }    
                    
                oldSvg.css({    
                    'width': width,    
                    'height': height    
                });    
            });    
        }    
    }
    // === Запуск спостерігача за змінами ===    
    function startObserver(event) {    
        const render = event.object.activity.render();    
        const mainContainer = render.find('.full-start-new__buttons')[0];    
            
        if (!mainContainer) return;    
            
        observer = new MutationObserver((mutations) => {    
            mutations.forEach((mutation) => {    
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {    
                    mutation.addedNodes.forEach((node) => {    
                        if (node.nodeType === 1 && node.classList && node.classList.contains('full-start__button')) {    
                            const settings = applySettings();    
                            const text = node.textContent.toLowerCase().trim();    
                            const classes = node.className || '';    
                                
                            const isImportantButton = classes.includes('view--online') ||         
                                                     classes.includes('view--torrent') ||         
                                                     classes.includes('view--trailer') ||        
                                                     classes.includes('button--book') ||        
                                                     classes.includes('button--reaction') ||        
                                                     classes.includes('button--subscribe') ||        
                                                     classes.includes('button--subs') ||        
                                                     text.includes('онлайн') ||        
                                                     text.includes('online');    
                                
                            const isPlayButton = classes.includes('button--play');    
                            const isSourcesButton = text.includes('джерела') ||         
                                                   text.includes('джерело') ||        
                                                   text.includes('sources') ||         
                                                   text.includes('source') ||        
                                                   text.includes('источники') ||        
                                                   text.includes('источник');    
                                
                            const isOptionsButton = classes.includes('button--options');    
                            const isEmpty = text === '' || text.length <= 2;    
                                
                            const isVersion3OrHigher = isLampaVersionOrHigher('3.0.0');    
                                
                            if (!isImportantButton &&       
                                ((isPlayButton && !isVersion3OrHigher) ||       
                                 (isSourcesButton && settings.hide_sources) ||       
                                 (isOptionsButton && isEmpty))) {    
                                $(node).remove();    
                            }    
                        }    
                    });    
                        
                    // Оновлюємо SVG після змін в DOM    
                    setTimeout(updateButtons, 50);    
                }    
            });    
        });    
            
        observer.observe(mainContainer, {    
            childList: true,    
            subtree: false    
        });    
    }    
        
    // === Зупинка спостерігача ===    
    function stopObserver() {    
        if (observer) {    
            observer.disconnect();    
            observer = null;    
        }    
    }    
        
    // === Ініціалізація плагіна ===    
    function initPlugin() {    
        if (typeof Lampa === 'undefined') {    
            setTimeout(initPlugin, 100);    
            return;    
        }    
            
        // Додаємо переклади та стилі    
        addTranslations();    
        addStyles();    
            
        // Застосовуємо налаштування при старті    
        setTimeout(() => {    
            applyCurrentSettings();    
        }, 500);    
            
        Lampa.Listener.follow('full', function(event) {    
            if (event.type === 'complite') {    
                setTimeout(() => {    
                    processButtons(event);    
                    startObserver(event);    
                }, 500);    
            }    
                
            if (event.type === 'destroy') {    
                stopObserver();    
            }    
        });    
    }    
        
    // === Додавання налаштувань до системи ===    
    function addSettings() {    
        Lampa.SettingsApi.addComponent({    
            component: 'unified_button_manager',    
            icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">    
                <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>    
            </svg>`,    
            name: Lampa.Lang.translate('unified_button_manager_title')    
        });    
            
        // Кнопка редагування кнопок    
        Lampa.SettingsApi.addParam({    
            component: 'unified_button_manager',    
            param: {    
                name: 'edit_buttons',    
                type: 'button',    
            },    
            field: {    
                name: Lampa.Lang.translate('unified_button_manager_edit_buttons'),    
            },    
            onChange: editButtons    
        });    
            
        // Перемикач для кольорових кнопок    
        Lampa.SettingsApi.addParam({    
            component: 'unified_button_manager',    
            param: {    
                name: 'colorful_buttons',    
                type: 'trigger',    
                default: true    
            },    
            field: {    
                name: Lampa.Lang.translate('unified_button_manager_colorful_buttons'),    
                description: 'Вмикає/вимикає кольорові іконки кнопок'    
            },    
            onChange: applyCurrentSettings    
        });    
    }    
        
    // === Реєстрація плагіна ===    
    if (window.plugin) {    
        window.plugin('unified_button_manager', {    
            type: 'component',    
            name: 'Unified Button Manager',    
            version: '4.2',    
            author: 'Enhanced Plugin',    
            description: 'Об\'єднаний плагін: розділення кнопок + оптимізовані SVG та стилі з підтримкою Lampa 3.0.0+ та налаштуваннями'    
        });    
    }    
        
    // === Основна функція запуску ===    
    function startPlugin() {    
        if (typeof Lampa === 'undefined') {    
            setTimeout(startPlugin, 100);    
            return;    
        }    
            
        // Ініціалізуємо плагін    
        initPlugin();    
            
        // Додаємо налаштування    
        addSettings();    
            
        // Застосовуємо налаштування при старті    
        setTimeout(() => {    
            applyCurrentSettings();    
        }, 1000);    
    }    
        
    // === Запуск плагіна ===    
    if (document.readyState === 'loading') {    
        document.addEventListener('DOMContentLoaded', startPlugin);    
    } else {    
        startPlugin();    
    }    
        
})();
