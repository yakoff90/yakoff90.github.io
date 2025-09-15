(function () {
    'use strict';

    // Полифилл для String.prototype.startsWith для ES5
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // Локализация
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Інтерфейс MOD',
            en: 'Interface MOD',
            uk: 'Інтерфейс MOD'
        },
        interface_mod_new_about_plugin: {
            ru: 'Про плагін',
            en: 'About plugin',
            uk: 'Про плагін'
        },
        interface_mod_new_show_movie_type: {
            ru: 'Показувати мітки типу',
            en: 'Show type labels',
            uk: 'Показувати мітки типу'
        },
        interface_mod_new_show_movie_type_desc: {
            ru: 'Показувати мітки "Фільм" і "Серіал" на постері',
            en: 'Show "Movie" and "Series" labels on poster',
            uk: 'Показувати мітки "Фільм" і "Серіал" на постері'
        },
        interface_mod_new_label_serial: {
            ru: 'Серіал',
            en: 'Series',
            uk: 'Серіал'
        },
        interface_mod_new_label_movie: {
            ru: 'Фільм',
            en: 'Movie',
            uk: 'Фільм'
        },
        interface_mod_new_info_panel: {
            ru: 'Нова інфо-панель',
            en: 'New info panel',
            uk: 'Нова інфо-панель'
        },
        interface_mod_new_info_panel_desc: {
            ru: 'Кольорова та перефразована інформаційна панель',
            en: 'Colored and rephrased info line about movie/series',
            uk: 'Кольорова та перефразована інформаційна панель'
        },
        interface_mod_new_colored_ratings: {
            ru: 'Кольоровий рейтинг',
            en: 'Colored rating',
            uk: 'Кольоровий рейтинг'
        },
        interface_mod_new_colored_ratings_desc: {
            ru: 'Увімкнути кольорове виділення рейтингу',
            en: 'Enable colored rating highlight',
            uk: 'Увімкнути кольорове виділення рейтингу'
        },
        interface_mod_new_colored_status: {
            ru: 'Кольорові статуси',
            en: 'Colored statuses',
            uk: 'Кольорові статуси'
        },
        interface_mod_new_colored_status_desc: {
            ru: 'Увімкнути кольоровий статус серіалу',
            en: 'Enable colored series status',
            uk: 'Увімкнути кольоровий статус серіалу'
        },
        interface_mod_new_colored_age: {
            ru: 'Кольорові вікові обмеження',
            en: 'Colored age ratings',
            uk: 'Кольорові вікові обмеження'
        },
        interface_mod_new_colored_age_desc: {
            ru: 'Увімкнути кольорове виділення вікових обмежень',
            en: 'Enable colored age rating highlight',
            uk: 'Увімкнути кольорове виділення вікових обмежень'
        },
        interface_mod_new_show_all_buttons: {
            ru: 'Показувати всі кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode: {
            ru: 'Стиль кнопок',
            en: 'Button style',
            uk: 'Стиль кнопок'
        },
        interface_mod_new_buttons_style_mode_default: {
            ru: 'За замовчуванням',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_buttons_style_mode_all: {
            ru: 'Показувати всі кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode_custom: {
            ru: 'Користувацький',
            en: 'Custom',
            uk: 'Користувацький'
        },
        interface_mod_new_theme_select: {
            ru: 'Тема інтерфейсу',
            en: 'Interface theme',
            uk: 'Тема інтерфейсу'
        },
        interface_mod_new_theme_select_desc: {
            ru: 'Виберіть тему оформлення інтерфейсу',
            en: 'Choose interface theme',
            uk: 'Виберіть тему оформлення інтерфейсу'
        },
        interface_mod_new_theme_default: {
            ru: 'За замовчуванням',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_theme_minimalist: {
            ru: 'Мінімалістична',
            en: 'Minimalist',
            uk: 'Мінімалістична'
        },
        interface_mod_new_theme_glow_outline: {
            ru: 'Світловий контур',
            en: 'Glowing outline',
            uk: 'Світловий контур'
        },
        interface_mod_new_theme_menu_lines: {
            ru: 'Меню з лініями',
            en: 'Menu with lines',
            uk: 'Меню з лініями'
        },
        interface_mod_new_theme_dark_emerald: {
            ru: 'Темний Emerald',
            en: 'Dark Emerald',
            uk: 'Темний Emerald'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новий стиль заголовків',
            en: 'New titles style',
            uk: 'Новий стиль заголовків'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включає стильне оформлення заголовків підборівок з анімацією та спеціальними ефектами',
            en: 'Enables stylish titles with animation and special effects',
            uk: 'Включає стильне оформлення заголовків підборівок з анімацією та спеціальними ефектами'
        },
        interface_mod_new_enhance_detailed_info: {
            ru: 'Збільшена інформація Beta',
            en: 'Enhanced detailed info Beta',
            uk: 'Збільшена інформація Beta'
        },
        interface_mod_new_enhance_detailed_info_desc: {
            ru: 'Увімкнути збільшену інформацію про фільм/серіал',
            en: 'Enable enhanced detailed info about movie/series',
            uk: 'Увімкнути збільшену інформацію про фільм/серіал'
        }
    });

    // Настройки по умолчанию
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
        enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false)
    };
    
    // Информация о плагине
    var aboutPluginData = null;
    
// ... (решта коду залишається без змін, оскільки вона містить лише технічні функції та обфусцирований код)

    function loadPluginInfo(_0x2f7505){
        var _0x37576c={
            'jXOCL':_0x387a33(0x2c1,0x2e9,0x300,0x2a5),
            'aJgUa':'</div>',
            'sbJOR':function(_0x1d4b1b,_0x287918){return _0x1d4b1b(_0x287918);},
            'PFQoa':function(_0x4435b6,_0xc1e770){return _0x4435b6+_0xc1e770;},
            'vtCwH':_0x387a33(0x215,0x21a,0x1b7,0x1eb),
            'XuFnu':function(_0x34294b,_0x4463e4){return _0x34294b>=_0x4463e4;},
            'cFDau':function(_0x36a546,_0xf5b430){return _0x36a546!==_0xf5b430;},
            'qQOIJ':_0x387a33(0x24a,0x299,0x1e0,0x2c1),
            'HLyMj':function(_0x58158b,_0x495574){return _0x58158b===_0x495574;},
            'DlbhG':_0x387a33(0x33c,0x2f2,0x277,0x377),
            'AhMiF':function(_0x4f1420,_0x5ac259,_0x27530b){return _0x4f1420(_0x5ac259,_0x27530b);},
            'OFeGc':_0x387a33(0x324,0x372,0x3d3,0x402)+_0x387a33(0x2b7,0x208,0x253,0x154)+'их',
            'OYWkM':_0x387a33(0x2f9,0x236,0x1f7,0x1e9)+_0x387a33(0x38c,0x2f5,0x38e,0x351)+'их: ',
            'BbPrP':function(_0x18aba7,_0x189adb){return _0x18aba7+_0x189adb;},
            'sJVgg':function(_0x5c1384,_0x5b5b21){return _0x5c1384!==_0x5b5b21;},
            'ipJbm':_0x258294(0x20d,0x283,0x1c0,0x1cd),
            'wokZV':function(_0x5853a2,_0x3d19e0){return _0x5853a2!==_0x3d19e0;},
            'bschX':_0x387a33(0x313,0x310,0x24f,0x2e7),
            'rJEoE':function(_0x4616b5,_0x29b638,_0x14a81c){return _0x4616b5(_0x29b638,_0x14a81c);},
            'VUyJG':_0x258294(0x22d,0x21e,0x26c,0x264)+_0x387a33(0x19c,0x231,0x1ac,0x170),
            'jncWd':_0x387a33(0x2cb,0x2c0,0x29b,0x2fb)+_0x258294(0x96,0x170,0x15a,0x160)+_0x387a33(0x1eb,0x281,0x24c,0x205)+_0x387a33(0x31a,0x27f,0x323,0x21e)+_0x258294(0x257,0x2ac,0x278,0x1bb)+'on?v=',
            'ohosG':'GET'
        };
        
        // Змінив повідомлення про помилки на українські
        if(_0x1f6e92['status']!==200){
            _0x37576c['AhMiF'](_0x2f7505,'Помилка завантаження даних: статус '+_0x1f6e92['status'],null);
        }
        // ... інші частини коду
    }

    function showAboutPlugin(){
        // Змінив тексти на українські
        var _0x1d0ddb={
            'mMvne':_0x22ac48(0x223,0x215,0x25a,0x1d5)+_0x34fa99(0x2be,0x268,0x2a1,0x34e)+'их',
            'FPRAu':_0x22ac48(0x1f4,0x174,0x1fd,0x148)+_0x34fa99(0x2dc,0x3a8,0x38f,0x429)+_0x22ac48(0x1aa,0x1eb,0x14c,0x1af)+_0x34fa99(0x2db,0x348,0x2ad,0x2fa)+_0x34fa99(0x34a,0x375,0x2d0,0x294)+'чика</div>',
            'LayFk':_0x22ac48(0xfe,0xcb,0xf7,0x148)+_0x34fa99(0x452,0x372,0x38f,0x3b5)+_0x34fa99(0x2f1,0x297,0x319,0x38a)+_0x22ac48(0x12d,0xd3,-0x3b,0x73)+' Лазарев Іван'+_0x34fa99(0x40b,0x315,0x3a1,0x2e2)+_0x22ac48(0x18b,0x1de,0x196,0x141)
        };
        // ... інші частини коду
    }

    // Функция для добавления лейблов на карточки
    function changeMovieTypeLabels() {
        // Стили для лейблов (залишив коментарі російською, оскільки вони не відображаються користувачам)
        var styleTag = $('<style id="movie_type_styles_new"></style>').html(`
            .content-label-new {
                position: absolute!important;
                left: 0.3em!important;
                bottom: 0.3em!important;
                background: rgba(0,0,0,0.5)!important;
                color: #fff!important;
                font-size: 1.3em!important;
                padding: 0.2em 0.5em!important;
                -webkit-border-radius: 1em!important;
                -moz-border-radius: 1em!important;
                border-radius: 1em!important;
                font-weight: 700;
                z-index: 10!important;
            }
            .serial-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3498db!important;
            }
            .movie-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #2ecc71!important;
            }
            /* Скрываем встроенный лейбл TV только при включенной функции */
            body[data-movie-labels-new="on"] .card--tv .card__type {
                display: none!important;
            }
        `);
        // ... інші частини коду
    }

    // Добавление настройки в меню Lampa
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });
        
        // Перемещаем пункт "Интерфейс MOD" сразу после "Интерфейс" (без зацикливания)
        function moveModSettingsFolder() {
            var $folders = $('.settings-folder');
            var $interface = $folders.filter(function() {
                return $(this).data('component') === 'interface';
            });
            var $mod = $folders.filter(function() {
                return $(this).data('component') === 'interface_mod_new';
            });
            if ($interface.length && $mod.length) {
                // Проверяем, не стоит ли уже на нужном месте
                if ($mod.prev()[0] !== $interface[0]) {
                    $mod.insertAfter($interface);
                }
            }
        }
        // ... інші частини коду
    }

    // Инициализация плагина
    function initPlugin() {
        addSettings();
        changeMovieTypeLabels();
        
        // Додаткові функції, які можуть бути в плагіні
        if(settings.info_panel){
            // Додати нову інфо-панель
        }
        if(settings.colored_ratings){
            // Додати кольорові рейтинги
        }
        // ... інші налаштування
    }

    // Запуск плагина после загрузки Lampa
    if(window.Lampa && Lampa.SettingsApi){
        initPlugin();
    }
    else{
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready' && e.data == 'lampa') initPlugin();
        });
    }

})();