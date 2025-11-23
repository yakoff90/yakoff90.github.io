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
        var logoPlugin = document.createElement('script');
        logoPlugin.src = "/mnt/data/logo.js"; // ваш файл logo.js
        document.head.appendChild(logoPlugin);
    }

    function disableLogoPlugin() {
        console.log('Логотипи вимкнено');
        var logoElements = document.querySelectorAll('.logo-class'); // Замінити на ваш клас
        logoElements.forEach(function(element) {
            element.remove();
        });
    }

    function enableNetworksPlugin() {
        console.log('Платформи увімкнено');
        var networksPlugin = document.createElement('script');
        networksPlugin.src = "/mnt/data/networks.js"; // ваш файл networks.js
        document.head.appendChild(networksPlugin);
    }

    function disableNetworksPlugin() {
        console.log('Платформи вимкнено');
        var networkButtons = document.querySelectorAll('.network-button'); // Замінити на ваш клас
        networkButtons.forEach(function(button) {
            button.remove();
        });
    }

    function enableQualityPlugin() {
        console.log('Якість увімкнено');
        var qualityPlugin = document.createElement('script');
        qualityPlugin.src = "/mnt/data/Quality.js"; // ваш файл Quality.js
        document.head.appendChild(qualityPlugin);
    }

    function disableQualityPlugin() {
        console.log('Якість вимкнено');
        var qualityElements = document.querySelectorAll('.quality-class'); // Замінити на ваш клас
        qualityElements.forEach(function(element) {
            element.remove();
        });
    }

    function enableThemesPlugin() {
        console.log('Теми увімкнено');
        var themesPlugin = document.createElement('script');
        themesPlugin.src = "/mnt/data/themes.js"; // ваш файл themes.js
        document.head.appendChild(themesPlugin);
    }

    function disableThemesPlugin() {
        console.log('Теми вимкнено');
        document.body.classList.remove('mint_dark', 'deep_aurora', 'crystal_cyan'); // Замінити на ваші класи тем
    }

    function enableSeasonsPlugin() {
        console.log('Сезони увімкнено');
        var seasonsPlugin = document.createElement('script');
        seasonsPlugin.src = "/mnt/data/SeasonsFull.js"; // ваш файл SeasonsFull.js
        document.head.appendChild(seasonsPlugin);
    }

    function disableSeasonsPlugin() {
        console.log('Сезони вимкнено');
        var seasonBadges = document.querySelectorAll('.season-badge'); // Замінити на ваш клас
        seasonBadges.forEach(function(badge) {
            badge.remove();
        });
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
