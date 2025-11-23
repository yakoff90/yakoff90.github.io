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
        logoPlugin.src = "/mnt/data/logo.js"; // (function () {
    'use strict';
    // Функція для заміни логотипу замість назви в інтерфейсі
    (function () {
        // Додавання локалізації для плагіна
        Lampa.Lang.add({
            logo_main_title: {
                en: 'Logos instead of titles',
                uk: 'Логотипи замість назв',
                ru: 'Логотипы вместо названий'
            },
            logo_main_description: {
                en: 'Displaysração movie logos instead of text',
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
            },
            logo_display_mode_title: {
                en: 'Display mode',
                uk: 'Режим відображення',
                ru: 'Режим отображения'
            },
            logo_display_mode_logo_only: {
                en: 'Logo only',
                uk: 'Тільки логотип',
                ru: 'Только логотип'
            },
            logo_display_mode_logo_and_text: {
                en: 'Logo and text',
                uk: 'Логотип і текст',
                ru: 'Логотип и текст'
            }
        });

        // Додавання параметру для увімкнення/вимкнення заміни логотипу
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

        // Додавання параметру для вибору режиму відображення (залежить від logo_main)
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_display_mode',
                type: 'select',
                values: {
                    'logo_only': Lampa.Lang.translate('logo_display_mode_logo_only'),
                    'logo_and_text': Lampa.Lang.translate('logo_display_mode_logo_and_text')
                },
                default: 'logo_only'
            },
            field: {
                name: Lampa.Lang.translate('logo_display_mode_title'),
                description: Lampa.Lang.translate('logo_main_description'),
                show: function () {
                    return Lampa.Storage.get('logo_main') === '0';
                }
            }
        });

        // Перевірка, чи плагін уже ініціалізований
        if (window.logoplugin) return;
        window.logoplugin = true;

        // Підписка на подію активності для обробки повноекранного режиму
        Lampa.Listener.follow('full', function (event) {
            // Перевірка, чи подія є завершенням рендерингу або типом movie та чи увімкнена заміна логотипу
            // Примітка: якщо 'complite' або 'movie' не працюють, перевірте логи для інших типів (наприклад, 'render', 'ready')
            if ((event.type == 'complite' || event.type == 'movie') && Lampa.Storage.get('logo_main') != '1') {
                var item = event.data.movie;
                var mediaType = item.name ? 'tv' : 'movie';
                var currentLang = Lampa.Storage.get('language');
                // Формування URL для запиту логотипу з TMDB (поточна мова)
                var url = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);

                // Виконання AJAX-запиту для отримання логотипів
                $.get(url, function (response) {
                    if (response.logos && response.logos[0]) {
                        // Логотип знайдено для поточної мови (uk/ru)
                        renderLogo(response.logos[0].file_path, event, mediaType, currentLang);
                    } else if (currentLang !== 'en') {
                        // Якщо логотип відсутній і мова не англійська, спробувати англійську
                        var enUrl = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
                        $.get(enUrl, function (enResponse) {
                            if (enResponse.logos && enResponse.logos[0]) {
                                // Використати англійський логотип
                                renderLogo(enResponse.logos[0].file_path, event, mediaType, currentLang, true);
                            }
                        }).fail(function () {});
                    }
                }).fail(function () {
                    if (currentLang !== 'en') {
                        // Спробувати англійську мову при помилці
                        var enUrl = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
                        $.get(enUrl, function (enResponse) {
                            if (enResponse.logos && enResponse.logos[0]) {
                                renderLogo(enResponse.logos[0].file_path, event, mediaType, currentLang, true);
                            }
                        }).fail(function () {});
                    }
                });

                // Функція для рендерингу логотипу
                function renderLogo(logoPath, event, mediaType, currentLang, isEnglishLogo) {
                    if (logoPath !== '') {
                        var card = event.object.activity.render();
                        var logoHtml;
                        var showTitle = Lampa.Storage.get('logo_display_mode') === 'logo_and_text' || (isEnglishLogo && Lampa.Storage.get('logo_display_mode') === 'logo_only');
                        var titleText = showTitle ? (card.find('.full-start-new__title').text() || card.find('.full-start__title').text() || item.title || item.name) : '';
                        // Логіка залежно від налаштувань та ширини екрану
                        if (window.innerWidth > 585) {
                            if (Lampa.Storage.get('card_interfice_type') === 'new' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start-new__tagline').remove();
                                card.find('.full-start-new__title').html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'new' && card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 2.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start-new__title').html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div style="height: auto !important; overflow: visible !important;"><img style="display: block; margin-bottom: 0em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" onload="if(this.naturalHeight > 80) { let ratio = this.naturalWidth / this.naturalHeight; this.height = 80; this.width = 80 * ratio; }" />' + (titleText ? '<span style="display: block; line-height: normal;">' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start__title-original').remove();
                                card.find('.full-start__title').css({
                                    'height': 'auto !important',
                                    'max-height': 'none !important',
                                    'overflow': 'visible !important'
                                }).html(logoHtml);
                            }
                        } else {
                            if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                logoHtml = '<div><img style="display: block; margin-bottom: 0.2em; max-height: 1.8em;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + (titleText ? '<span>' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start-new__tagline').remove();
                                card.find('.full-start-new__title').html(logoHtml);
                            } else {
                                logoHtml = '<div style="height: auto !important; overflow: visible !important;"><img style="display: block; margin-bottom: 0em;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" onload="if(this.naturalHeight > 38) { let ratio = this.naturalWidth / this.naturalHeight; this.height = 38; this.width = 38 * ratio; }" />' + (titleText ? '<span style="display: block; line-height: normal;">' + titleText + '</span>' : '') + '</div>';
                                card.find('.full-start__title-original').remove();
                                card.find('.full-start__title').css({
                                    'height': 'auto !important',
                                    'max-height': 'none !important',
                                    'overflow': 'visible !important'
                                }).html(logoHtml);
                            }
                        }
                    }
                }
            }
        });
    })();
})();
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
