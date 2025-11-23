(function () {
    'use strict';

    // Перевірка чи плагін вже ініціалізовано
    if (window.customPlugin && window.customPlugin.__initialized) return;
    
    window.customPlugin = window.customPlugin || {};
    window.customPlugin.__initialized = true;

    // Конфігурація плагіну
    var CONFIG = {
        logoEnabled: true,        // Включення/вимкнення логотипів
        networksEnabled: true,    // Включення/вимкнення платформ
        qualityEnabled: true,     // Включення/вимкнення якості
        themesEnabled: true,      // Включення/вимкнення тем
        seasonsEnabled: true,     // Включення/вимкнення бейджів сезонів
    };

    // Функція для додавання налаштувань плагінів
    function addPluginSettings() {
        // Додавання налаштувань для кожного плагіну
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logoEnabled',
                type: 'select',
                values: {
                    '1': 'Включити логотипи',
                    '0': 'Вимкнути логотипи'
                },
                default: CONFIG.logoEnabled ? '1' : '0'
            },
            field: {
                name: 'Логотипи',
                description: 'Включити або вимкнути логотипи замість назв'
            },
            onChange: function(value) {
                CONFIG.logoEnabled = value === '1';
                if (CONFIG.logoEnabled) {
                    enableLogoPlugin();
                } else {
                    disableLogoPlugin();
                }
            }
        });

        // Додавання налаштувань для платформ
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'networksEnabled',
                type: 'select',
                values: {
                    '1': 'Включити платформи',
                    '0': 'Вимкнути платформи'
                },
                default: CONFIG.networksEnabled ? '1' : '0'
            },
            field: {
                name: 'Платформи',
                description: 'Включити або вимкнути кнопки платформ'
            },
            onChange: function(value) {
                CONFIG.networksEnabled = value === '1';
                if (CONFIG.networksEnabled) {
                    enableNetworksPlugin();
                } else {
                    disableNetworksPlugin();
                }
            }
        });

        // Додавання налаштувань для якості
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'qualityEnabled',
                type: 'select',
                values: {
                    '1': 'Включити якість',
                    '0': 'Вимкнути якість'
                },
                default: CONFIG.qualityEnabled ? '1' : '0'
            },
            field: {
                name: 'Якість',
                description: 'Включити або вимкнути показ якості відео'
            },
            onChange: function(value) {
                CONFIG.qualityEnabled = value === '1';
                if (CONFIG.qualityEnabled) {
                    enableQualityPlugin();
                } else {
                    disableQualityPlugin();
                }
            }
        });

        // Додавання налаштувань для тем
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'themesEnabled',
                type: 'select',
                values: {
                    '1': 'Включити теми',
                    '0': 'Вимкнути теми'
                },
                default: CONFIG.themesEnabled ? '1' : '0'
            },
            field: {
                name: 'Теми',
                description: 'Включити або вимкнути теми інтерфейсу'
            },
            onChange: function(value) {
                CONFIG.themesEnabled = value === '1';
                if (CONFIG.themesEnabled) {
                    enableThemesPlugin();
                } else {
                    disableThemesPlugin();
                }
            }
        });

        // Додавання налаштувань для бейджів сезонів
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'seasonsEnabled',
                type: 'select',
                values: {
                    '1': 'Включити бейджі сезонів',
                    '0': 'Вимкнути бейджі сезонів'
                },
                default: CONFIG.seasonsEnabled ? '1' : '0'
            },
            field: {
                name: 'Сезони',
                description: 'Включити або вимкнути бейджі сезонів та статус серіалів'
            },
            onChange: function(value) {
                CONFIG.seasonsEnabled = value === '1';
                if (CONFIG.seasonsEnabled) {
                    enableSeasonsPlugin();
                } else {
                    disableSeasonsPlugin();
                }
            }
        });
    }

    // Функції для включення плагінів
    function enableLogoPlugin() {
        console.log('Логотипи увімкнено');
        // Код для активації плагіну logo.js
        (function() {
            Lampa.Lang.add({
                logo_main_title: {
                    en: 'Logos instead of titles',
                    uk: 'Логотипи замість назв',
                    ru: 'Логотипы вместо названий'
                },
                logo_main_description: {
                    en: 'Displays movie logos instead of text',
                    uk: 'Відображає логотипи фільмів замість тексту',
                    ru: 'Отображает логотипы фильмов вместо текста'
                },
                logo_main_show: {
                    en: 'Show',
                    uk: 'Показати',
                    ru: 'Отображать'
                },
                logo_main_hide: {
                    en: 'Hide',
                    uk: 'Приховати',
                    ru: 'Скрыть'
                }
            });

            // Додання параметру для увімкнення/вимкнення заміни логотипу
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: 'logo_main',
                    type: 'select',
                    values: {
                        '1': Lampa.Lang.translate('logo_main_hide'),
                        '0': Lampa.Lang.translate('logo_main_show')
                    },
                    default: '0'
                },
                field: {
                    name: Lampa.Lang.translate('logo_main_title'),
                    description: Lampa.Lang.translate('logo_main_description')
                }
            });
        })();
    }

    function disableLogoPlugin() {
        console.log('Логотипи вимкнено');
        // Код для вимкнення плагіну logo.js
    }

    function enableNetworksPlugin() {
        console.log('Платформи увімкнено');
        // Код для активації плагіну networks.js
    }

    function disableNetworksPlugin() {
        console.log('Платформи вимкнено');
        // Код для вимкнення плагіну networks.js
    }

    function enableQualityPlugin() {
        console.log('Якість увімкнено');
        // Код для активації плагіну Quality.js
    }

    function disableQualityPlugin() {
        console.log('Якість вимкнено');
        // Код для вимкнення плагіну Quality.js
    }

    function enableThemesPlugin() {
        console.log('Теми увімкнено');
        // Код для активації плагіну themes.js
    }

    function disableThemesPlugin() {
        console.log('Теми вимкнено');
        // Код для вимкнення плагіну themes.js
    }

    function enableSeasonsPlugin() {
        console.log('Сезони увімкнено');
        // Код для активації плагіну SeasonsFull.js
    }

    function disableSeasonsPlugin() {
        console.log('Сезони вимкнено');
        // Код для вимкнення плагіну SeasonsFull.js
    }

    // Ініціалізація плагіна
    function initPlugin() {
        addPluginSettings();
    }

    // Запуск плагіна після готовності
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                initPlugin();
            }
        });
    }

})();
