(function () {
    'use strict';

    // Перевірка чи плагін вже ініціалізовано
    if (window.customPlugin && window.customPlugin.__initialized) return;

    window.customPlugin = window.customPlugin || {};
    window.customPlugin.__initialized = true;

    // Конфігурація плагіну
    var CONFIG = {
        logoEnabled: true,        // Увімкнення/вимкнення логотипів
        networksEnabled: true,    // Увімкнення/вимкнення платформ
        qualityEnabled: true,     // Увімкнення/вимкнення якості
        themesEnabled: true,      // Увімкнення/вимкнення тем
        seasonsEnabled: true,     // Увімкнення/вимкнення бейджів сезонів
    };

    // Додавання налаштувань плагінів
    function addPluginSettings() {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logoEnabled',
                type: 'select',
                values: {
                    '1': 'Увімкнути логотипи',
                    '0': 'Вимкнути логотипи'
                },
                default: CONFIG.logoEnabled ? '1' : '0'
            },
            field: {
                name: 'Логотипи',
                description: 'Увімкнути або вимкнути логотипи замість назв'
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

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'networksEnabled',
                type: 'select',
                values: {
                    '1': 'Увімкнути платформи',
                    '0': 'Вимкнути платформи'
                },
                default: CONFIG.networksEnabled ? '1' : '0'
            },
            field: {
                name: 'Платформи',
                description: 'Увімкнути або вимкнути кнопки платформ'
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

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'qualityEnabled',
                type: 'select',
                values: {
                    '1': 'Увімкнути якість',
                    '0': 'Вимкнути якість'
                },
                default: CONFIG.qualityEnabled ? '1' : '0'
            },
            field: {
                name: 'Якість',
                description: 'Увімкнути або вимкнути показ якості відео'
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

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'themesEnabled',
                type: 'select',
                values: {
                    '1': 'Увімкнути теми',
                    '0': 'Вимкнути теми'
                },
                default: CONFIG.themesEnabled ? '1' : '0'
            },
            field: {
                name: 'Теми',
                description: 'Увімкнути або вимкнути теми інтерфейсу'
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

        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'seasonsEnabled',
                type: 'select',
                values: {
                    '1': 'Увімкнути бейджі сезонів',
                    '0': 'Вимкнути бейджі сезонів'
                },
                default: CONFIG.seasonsEnabled ? '1' : '0'
            },
            field: {
                name: 'Сезони',
                description: 'Увімкнути або вимкнути бейджі сезонів та статус серіалів'
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

    // Функції для увімкнення плагінів
    function enableLogoPlugin() {
        console.log('Логотипи увімкнено');
        // Код для активації плагіну logo.js
        // Наприклад, заміна назв на логотипи
        (function() {
            // Ваш код з logo.js для активації логотипів
        })();
    }

    function disableLogoPlugin() {
        console.log('Логотипи вимкнено');
        // Код для вимкнення плагіну logo.js
        // Можна скинути логотипи назад на текст
    }

    function enableNetworksPlugin() {
        console.log('Платформи увімкнено');
        // Код для активації плагіну networks.js
        // Наприклад, додавання кнопок для платформи
        (function() {
            // Ваш код з networks.js для активації кнопок платформ
        })();
    }

    function disableNetworksPlugin() {
        console.log('Платформи вимкнено');
        // Код для вимкнення плагіну networks.js
        // Можна видалити кнопки платформ
    }

    function enableQualityPlugin() {
        console.log('Якість увімкнено');
        // Код для активації плагіну Quality.js
        // Наприклад, відображення якості відео
        (function() {
            // Ваш код з Quality.js для активації показу якості
        })();
    }

    function disableQualityPlugin() {
        console.log('Якість вимкнено');
        // Код для вимкнення плагіну Quality.js
        // Можна прибрати відображення якості
    }

    function enableThemesPlugin() {
        console.log('Теми увімкнено');
        // Код для активації плагіну themes.js
        // Наприклад, зміна тем інтерфейсу
        (function() {
            // Ваш код з themes.js для активації тем
        })();
    }

    function disableThemesPlugin() {
        console.log('Теми вимкнено');
        // Код для вимкнення плагіну themes.js
        // Можна повернути стандартну тему
    }

    function enableSeasonsPlugin() {
        console.log('Сезони увімкнено');
        // Код для активації плагіну SeasonsFull.js
        // Наприклад, відображення бейджів сезонів
        (function() {
            // Ваш код з SeasonsFull.js для активації бейджів сезонів
        })();
    }

    function disableSeasonsPlugin() {
        console.log('Сезони вимкнено');
        // Код для вимкнення плагіну SeasonsFull.js
        // Можна видалити бейджі сезонів
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
