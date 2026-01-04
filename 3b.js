(function() {  
    'use strict';  
      
    // Константи для зберігання налаштувань  
    var ORDER_KEY = 'button_editor_order';  
    var HIDE_KEY = 'button_editor_hide';  
      
    var lastFullContainer = null;  
    var lastStartInstance = null;  
      
    // Функція для зчитування масиву зі сховища  
    function readArray(key) {  
        try {  
            return Lampa.Storage.get(key, []);  
        } catch (e) {  
            return [];  
        }  
    }  
      
    // Функція для отримання заголовка кнопки (покращена версія)  
    function getButtonTitle(id, $btn) {  
        var title = $btn.find('.full-start__button-text').text().trim();  
        if (!title) {  
            title = $btn.attr('title') || '';  
        }  
        if (!title) {  
            var iconTitle = $btn.find('svg').attr('title') || '';  
            title = iconTitle;  
        }  
        if (!title) {  
            // Якщо тексту немає, спробуємо отримати з ID  
            if (id.startsWith('text_')) {  
                title = id.replace('text_', '').replace(/_/g, ' ');  
            } else if (id.startsWith('class_')) {  
                title = id.replace('class_', '').replace(/_/g, ' ');  
            } else {  
                title = id;  
            }  
        }  
        return title || id;  
    }  
      
    // Функція для отримання активного контейнера  
    function resolveActiveFullContainer() {  
        var active = Lampa.Activity.active();  
        if (active && active.activity && active.activity.render) {  
            var render = active.activity.render();  
            return render.find('.full-start-new').first();  
        }  
        return null;  
    }  
      
    // Функція для отримання повного контейнера  
    function getFullContainer(e) {  
        if (e.object && e.object.activity && e.object.activity.render) {  
            return e.object.activity.render().find('.full-start-new').first();  
        }  
        return null;  
    }  
      
    // Функція для забезпечення стилів  
    function ensureStyles() {  
        if (!$('#button-editor-styles').length) {  
            var styles = `  
                <style id="button-editor-styles">  
                    .lme-button-hide { display: none !important; }  
                    .lme-button-text-hidden .full-start__button-text { display: none !important; }  
                    .lme-buttons { display: flex; flex-wrap: wrap; gap: 0.5em; }  
                    .menu-edit-list { max-height: 70vh; overflow-y: auto; }  
                    .menu-edit-list__item {   
                        display: flex;   
                        align-items: center;   
                        padding: 0.8em;   
                        border-bottom: 1px solid rgba(255,255,255,0.1);  
                        cursor: pointer;  
                    }  
                    .menu-edit-list__item:hover { background: rgba(255,255,255,0.05); }  
                    .menu-edit-list__icon { width: 2em; height: 2em; margin-right: 1em; }  
                    .menu-edit-list__title { flex: 1; }  
                    .menu-edit-list__move {   
                        width: 2em;   
                        height: 2em;   
                        margin: 0 0.2em;   
                        cursor: pointer;  
                        opacity: 0.7;  
                    }  
                    .menu-edit-list__move:hover { opacity: 1; }  
                    .menu-edit-list__toggle {   
                        width: 2em;   
                        height: 2em;   
                        margin-left: 0.5em;   
                        cursor: pointer;  
                        opacity: 0.7;  
                    }  
                    .menu-edit-list__toggle:hover { opacity: 1; }  
                    .lme-button-hidden { opacity: 0.3; }  
                </style>  
            `;  
            $('head').append(styles);  
        }  
    }  
      
    // Функція для сканування кнопок (виправлена версія)  
    function scanButtons(fullContainer, detach) {  
        var items = [];  
        var map = {};  
        var targetContainer = fullContainer.find('.full-start-new__buttons');  
        var extraContainer = fullContainer.find('.full-start-new__extra');  
          
        function collect(container) {  
            container.find('.full-start__button').each(function () {  
                var $btn = $(this);  
                var id;  
                  
                // Спробуємо отримати стабільний ID з різних джерел  
                if ($btn.attr('data-action')) {  
                    id = $btn.attr('data-action');  
                } else if ($btn.attr('data-id')) {  
                    id = $btn.attr('data-id');  
                } else if ($btn.attr('class')) {  
                    // Використовуємо клас як ID  
                    id = 'class_' + $btn.attr('class').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');  
                } else {  
                    // Використовуємо текст кнопки як ID  
                    var text = $btn.find('.full-start__button-text').text().trim();  
                    if (text) {  
                        id = 'text_' + text.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');  
                    } else {  
                        // Як fallback - використовуємо позицію кнопки  
                        id = 'pos_' + $btn.index();  
                    }  
                }  
                  
                map[id] = detach ? $btn.detach() : $btn;  
                items.push(id);  
            });  
        }  
          
        collect(targetContainer);  
        collect(extraContainer);  
          
        return {  
            items: items,  
            map: map,  
            targetContainer: targetContainer,  
            extraContainer: extraContainer  
        };  
    }  
      
    // Функція для переміщення всіх кнопок в основний контейнер  
    function moveAllButtons(fullContainer) {  
        if (!fullContainer || !fullContainer.length) return;  
          
        var mainContainer = fullContainer.find('.full-start-new__buttons');  
        var hiddenContainer = fullContainer.find('.buttons--container');  
          
        if (hiddenContainer.length) {  
            var buttons = hiddenContainer.find('.full-start__button').detach();  
            mainContainer.append(buttons);  
        }  
    }  
      
    // Функція для нормалізації порядку  
    function normalizeOrder(order, ids) {  
        var result = [];  
        var known = new Set(ids);  
          
        order.forEach(function (id) {  
            if (known.has(id)) result.push(id);  
        });  
          
        ids.forEach(function (id) {  
            if (!result.includes(id)) result.push(id);  
        });  
          
        return result;  
    }  
      
    // Функція для застосування прихованих кнопок  
    function applyHidden(map) {  
        var hidden = new Set(readArray(HIDE_KEY));  
        Object.keys(map).forEach(function (id) {  
            map[id].toggleClass('lme-button-hide', hidden.has(id));  
        });  
    }  
      
    // Основна функція для застосування розкладки (з діагностикою)  
    function applyLayout(fullContainer) {  
        if (!fullContainer || !fullContainer.length) return;  
          
        ensureStyles();  
          
        // Спочатку перемістити всі кнопки в основний контейнер  
        moveAllButtons(fullContainer);  
          
        var priority = fullContainer.find('.full-start-new__buttons .button--priority').detach();  
        fullContainer.find('.full-start-new__buttons .button--play').remove();  
          
        var _scanButtons = scanButtons(fullContainer, true);  
        var items = _scanButtons.items;  
        var map = _scanButtons.map;  
        var targetContainer = _scanButtons.targetContainer;  
          
        var savedOrder = readArray(ORDER_KEY);  
        var savedHidden = readArray(HIDE_KEY);  
          
        console.log('Застосування налаштувань:', {  
            availableItems: items,  
            savedOrder: savedOrder,  
            savedHidden: savedHidden  
        });  
          
        var order = normalizeOrder(savedOrder, items);  
          
        targetContainer.empty();  
          
        if (priority.length) targetContainer.append(priority);  
          
        order.forEach(function (id) {  
            if (map[id]) {  
                targetContainer.append(map[id]);  
                console.log('Додано кнопку:', id);  
            } else {  
                console.log('Кнопку не знайдено:', id);  
            }  
        });  
          
        targetContainer.toggleClass('lme-button-text-hidden', Lampa.Storage.get('button_editor_hide_text') == true);  
        targetContainer.addClass('lme-buttons');  
          
        applyHidden(map);  
          
        Lampa.Controller.toggle("full_start");  
          
        if (lastStartInstance && lastStartInstance.html && fullContainer[0] === lastStartInstance.html[0]) {  
            var firstButton = targetContainer.find('.full-start__button.selector').not('.hide').not('.lme-button-hide').first();  
            if (firstButton.length) lastStartInstance.last = firstButton[0];  
        }  
    }
    // Функція для відкриття редактора (виправлена версія)  
    function openEditor(fullContainer) {  
        if (!fullContainer || !fullContainer.length) return;  
          
        var _scanButtons = scanButtons(fullContainer, false);  
        var items = _scanButtons.items;  
        var map = _scanButtons.map;  
          
        var order = normalizeOrder(readArray(ORDER_KEY), items);  
        var hidden = new Set(readArray(HIDE_KEY));  
          
        var list = $('<div class="menu-edit-list"></div>');  
          
        order.forEach(function (id) {  
            var $btn = map[id];  
            if (!$btn || !$btn.length) return;  
              
            var title = getButtonTitle(id, $btn);  
            var icon = $btn.find('svg').first().prop('outerHTML') || '';  
              
            var item = $("<div class=\"menu-edit-list__item\" data-id=\"".concat(id, "\">\n                <div class=\"menu-edit-list__icon\"></div>\n                <div class=\"menu-edit-list__title\">").concat(title, "</div>\n                <div class=\"menu-edit-list__move move-up selector\">\n                    <svg width=\"22\" height=\"14\" viewBox=\"0 0 22 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <path d=\"M2 12L11 3L20 12\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n                    </svg>\n                </div>\n                <div class=\"menu-edit-list__move move-down selector\">\n                    <svg width=\"22\" height=\"14\" viewBox=\"0 0 22 14\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <path d=\"M2 2L11 11L20 2\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\"/>\n                    </svg>\n                </div>\n                <div class=\"menu-edit-list__toggle toggle selector\">\n                    <svg width=\"26\" height=\"26\" viewBox=\"0 0 26 26\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                        <rect x=\"1.89111\" y=\"1.78369\" width=\"21.793\" height=\"21.793\" rx=\"3.5\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                        <path d=\"M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588\" stroke=\"currentColor\" stroke-width=\"3\" class=\"dot\" opacity=\"0\" stroke-linecap=\"round\"/>\n                    </svg>\n                </div>\n            </div>"));  
              
            if (icon) item.find('.menu-edit-list__icon').append(icon);  
              
            item.toggleClass('lme-button-hidden', hidden.has(id));  
            item.find('.dot').attr('opacity', hidden.has(id) ? 0 : 1);  
              
            item.find('.move-up').on('hover:enter', function () {  
                var prev = item.prev();  
                if (prev.length) item.insertBefore(prev);  
            });  
              
            item.find('.move-down').on('hover:enter', function () {  
                var next = item.next();  
                if (next.length) item.insertAfter(next);  
            });  
              
            item.find('.toggle').on('hover:enter', function () {  
                item.toggleClass('lme-button-hidden');  
                item.find('.dot').attr('opacity', item.hasClass('lme-button-hidden') ? 0 : 1);  
            });  
              
            list.append(item);  
        });  
          
        Lampa.Modal.open({  
            title: 'Редагування кнопок',  
            html: list,  
            size: 'small',  
            scroll_to_center: true,  
            onBack: function onBack() {  
                var newOrder = [];  
                var newHidden = [];  
                  
                list.find('.menu-edit-list__item').each(function () {  
                    var id = $(this).data('id');  
                    if (!id) return;  
                    newOrder.push(id);  
                    if ($(this).hasClass('lme-button-hidden')) newHidden.push(id);  
                });  
                  
                // Зберігаємо налаштування з перевіркою  
                console.log('Збереження налаштувань:', {order: newOrder, hidden: newHidden});  
                  
                Lampa.Storage.set(ORDER_KEY, newOrder);  
                Lampa.Storage.set(HIDE_KEY, newHidden);  
                  
                // Перевіряємо, що налаштування збережені  
                var savedOrder = Lampa.Storage.get(ORDER_KEY, []);  
                var savedHidden = Lampa.Storage.get(HIDE_KEY, []);  
                  
                console.log('Перевірка збереження:', {order: savedOrder, hidden: savedHidden});  
                  
                Lampa.Modal.close();  
                applyLayout(fullContainer);  
            }  
        });  
    }  
      
    // Функція для відкриття редактора з налаштувань (виправлена версія)  
    function openEditorFromSettings() {  
        if (!lastFullContainer || !lastFullContainer.length || !document.body.contains(lastFullContainer[0])) {  
            var current = resolveActiveFullContainer();  
            if (current) {  
                lastFullContainer = current;  
            }  
        }  
          
        if (!lastFullContainer || !lastFullContainer.length || !document.body.contains(lastFullContainer[0])) {  
            Lampa.Modal.open({  
                title: Lampa.Lang.translate('title_error'),  
                html: Lampa.Template.get('error', {  
                    title: Lampa.Lang.translate('title_error'),  
                    text: 'Відкрийте картку фільму для редагування кнопок'  
                }),  
                size: 'small',  
                scroll_to_center: true,  
                onBack: function onBack() {  
                    Lampa.Modal.close();  
                    // Повертаємо контролер до налаштувань  
                    Lampa.Controller.toggle('settings_component');  
                }  
            });  
            return;  
        }  
          
        // Зберігаємо поточний контролер  
        var enabledController = Lampa.Controller.enabled().name;  
          
        openEditor(lastFullContainer);  
          
        // Переконуємось, що модальне вікно закриється правильно  
        Lampa.Modal.listener.follow('close', function() {  
            setTimeout(function() {  
                Lampa.Controller.toggle(enabledController);  
            }, 100);  
        });  
    }  
      
    // Основна функція плагіна  
    function main() {  
        Lampa.Listener.follow('full', function (e) {  
            if (e.type === 'build' && e.name === 'start' && e.item && e.item.html) {  
                lastStartInstance = e.item;  
            }  
              
            if (e.type === 'complite') {  
                var fullContainer = getFullContainer(e);  
                if (!fullContainer) return;  
                  
                lastFullContainer = fullContainer;  
                  
                setTimeout(function () {  
                    if (Lampa.Storage.get('button_editor_enabled') == true) {  
                        applyLayout(fullContainer);  
                    }  
                }, 0);  
            }  
        });  
    }  
      
    // Функція для налаштувань (з оновленою назвою)  
    function settings() {  
        Lampa.SettingsApi.addComponent({  
            component: "button_editor",  
            name: 'Редактор кнопок',  
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.65-.07-.97l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.32-.07.64-.07.97c0 .33.03.65.07.97l-2.11 1.63c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.08.49 0 .61-.22l2-3.46c.13-.22.07-.49-.12-.64l-2.11-1.63Z" fill="currentColor"/></svg>'  
        });  
          
        // Основний перемикач (з оновленою назвою)  
        Lampa.SettingsApi.addParam({  
            component: "button_editor",  
            param: {  
                name: "button_editor_enabled",  
                type: "trigger",  
                "default": false  
            },  
            field: {  
                name: 'Розділити всі кнопки',  
                description: 'Дозволяє змінювати порядок та приховувати кнопки в картках'  
            },  
            onChange: function onChange(value) {  
                Lampa.Settings.update();  
            }  
        });  
          
        // Приховати текст кнопок  
        Lampa.SettingsApi.addParam({  
            component: "button_editor",  
            param: {  
                name: "button_editor_hide_text",  
                type: "trigger",  
                "default": false  
            },  
            field: {  
                name: 'Приховати текст кнопок',  
                description: 'Показувати тільки іконки кнопок для компактності'  
            },  
            onChange: function onChange(value) {  
                Lampa.Settings.update();  
                if (lastFullContainer) {  
                    applyLayout(lastFullContainer);  
                }  
            }  
        });  
          
        // Кнопка редактора  
        Lampa.SettingsApi.addParam({  
            component: "button_editor",  
            param: {  
                name: "button_editor_open",  
                type: "button"  
            },  
            field: {  
                name: 'Відкрити редактор кнопок',  
                description: 'Редагувати порядок та видимість кнопок'  
            },  
            onChange: function onChange() {  
                openEditorFromSettings();  
            }  
        });  
    }
    // Маніфест плагіна  
    var manifest = {  
        type: "other",  
        version: "1.0.0",  
        author: 'Button Editor Plugin',  
        name: "Редактор кнопок",  
        description: "Плагін для управління кнопками в картках фільмів",  
        component: "button_editor"  
    };  
      
    // Функція ініціалізації плагіна  
    function add() {  
        Lampa.Manifest.plugins = manifest;  
        settings();  
        main();  
    }  
      
    // Функція запуску плагіна  
    function startPlugin() {  
        window.plugin_button_editor_ready = true;  
        if (window.appready) {  
            add();  
        } else {  
            Lampa.Listener.follow("app", function (e) {  
                if (e.type === "ready") {  
                    add();  
                }  
            });  
        }  
    }  
      
    // Запуск плагіна якщо він ще не завантажений  
    if (!window.plugin_button_editor_ready) {  
        startPlugin();  
    }  
})();
