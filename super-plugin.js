
(function () {
    'use strict';

    // --- Перевірка на ініціалізацію ---
    if (window.superPlugin && window.superPlugin.__initialized) return;
    window.superPlugin = window.superPlugin || {};
    window.superPlugin.__initialized = true;

    // === Плагін Логотипи ===
    var logoPlugin = {
        id: 'logos',
        title: 'Логотипи',
        category: 'Оформлення',
        enabled: true,
        init: function() {
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
                }
            });

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

            Lampa.Listener.follow('full', function(event) {
                if (event.type == 'complite' && Lampa.Storage.get('logo_main') !== '1') {
                    var item = event.data.movie;
                    var mediaType = item.name ? 'tv' : 'movie';
                    var url = Lampa.TMDB.api(mediaType + '/' + item.id + '/images?api_key=' + Lampa.TMDB.key());
                    $.get(url, function(response) {
                        if (response.logos && response.logos[0]) {
                            renderLogo(response.logos[0].file_path, event);
                        }
                    }).fail(function() {});
                }
            });

            function renderLogo(logoPath, event) {
                var card = event.object.activity.render();
                var logoHtml = '<div><img src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" /></div>';
                card.find('.full-start__title').html(logoHtml);
            }
        }
    };

    // === Плагін Платформи ===
    var platformsPlugin = {
        id: 'platforms',
        title: 'Платформи',
        category: 'Оформлення',
        enabled: true,
        init: function() {
            Lampa.Lang.add({
                tmdb_networks_plugin_platforms: {
                    en: 'Platforms',
                    uk: 'Платформи',
                    ru: 'Платформы'
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'platforms',
                param: {
                    name: 'platfroms_movie_list_mode',
                    type: 'select',
                    values: {
                        0: Lampa.Lang.translate('platform_display_hide'),
                        1: Lampa.Lang.translate('platform_display_logo'),
                        2: Lampa.Lang.translate('platform_display_name')
                    },
                    default: 1
                },
                field: {
                    name: Lampa.Lang.translate('tmdb_networks_plugin_platforms')
                }
            });

            Lampa.Listener.follow('full', function(event) {
                if (event.type == 'movie') {
                    var networks = event.data.movie.networks;
                    var container = event.object.activity.render().find('.full-start-new__buttons');
                    container.append(createPlatformButton(networks));
                }
            });

            function createPlatformButton(networks) {
                var button = $('<div class="network-btn"></div>');
                networks.forEach(function(network) {
                    button.append('<img src="' + Lampa.TMDB.image('/t/p/w300' + network.logo_path) + '" alt="' + network.name + '" />');
                });
                return button;
            }
        }
    };

    // === Плагін Якість ===
    var qualityPlugin = {
        id: 'quality',
        title: 'Якість',
        category: 'Оформлення',
        enabled: true,
        init: function() {
            Lampa.Lang.add({
                maxsm_themes_quality: {
                    en: 'Quality',
                    uk: 'Якість',
                    ru: 'Качество'
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'quality',
                param: {
                    name: 'quality_display_mode',
                    type: 'select',
                    values: {
                        'high': Lampa.Lang.translate('high_quality'),
                        'medium': Lampa.Lang.translate('medium_quality'),
                        'low': Lampa.Lang.translate('low_quality')
                    },
                    default: 'high'
                },
                field: {
                    name: Lampa.Lang.translate('maxsm_themes_quality')
                }
            });

            Lampa.Listener.follow('full', function(event) {
                if (event.type == 'movie') {
                    var movie = event.data.movie;
                    var quality = movie.quality || 'high';
                    event.object.activity.render().find('.full-start__quality').text(quality);
                }
            });
        }
    };

    // === Плагін Сезони ===
    var seasonsPlugin = {
        id: 'seasons',
        title: 'Сезони',
        category: 'Оформлення',
        enabled: true,
        init: function() {
            Lampa.Lang.add({
                season_label: {
                    en: 'Season',
                    uk: 'Сезон',
                    ru: 'Сезон'
                }
            });

            Lampa.Listener.follow('full', function(event) {
                if (event.type == 'tv') {
                    var seasons = event.data.movie.seasons;
                    var container = event.object.activity.render().find('.full-start-new__buttons');
                    container.append(createSeasonsLabel(seasons));
                }
            });

            function createSeasonsLabel(seasons) {
                var label = $('<div class="season-label"></div>');
                seasons.forEach(function(season) {
                    label.append('<span>' + Lampa.Lang.translate('season_label') + ' ' + season.season_number + '</span>');
                });
                return label;
            }
        }
    };

    // === Плагін Теми ===
    var themesPlugin = {
        id: 'themes',
        title: 'Теми',
        category: 'Оформлення',
        enabled: true,
        init: function() {
            Lampa.Lang.add({
                themes_title: {
                    en: 'Themes',
                    uk: 'Теми',
                    ru: 'Темы'
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'themes',
                param: {
                    name: 'theme_select',
                    type: 'select',
                    values: {
                        'default': 'Default',
                        'dark': 'Dark Theme',
                        'light': 'Light Theme'
                    },
                    default: 'default'
                },
                field: {
                    name: Lampa.Lang.translate('themes_title')
                },
                onChange: function(value) {
                    changeTheme(value);
                }
            });

            function changeTheme(theme) {
                document.body.className = theme;
            }
        }
    };

    // Об'єднання всіх плагінів
    var plugins = [logoPlugin, platformsPlugin, qualityPlugin, seasonsPlugin, themesPlugin];

    // Ініціалізація плагінів
    plugins.forEach(function(plugin) {
        if (plugin.enabled) {
            plugin.init();
        }
    });

    // Створення пункту "Оформлення" в меню
    Lampa.SettingsApi.addComponent({
        component: 'interface',
        name: 'Оформлення',
        icon: 'paint-brush'
    });

    // Додавання плагінів до пунктів меню
    plugins.forEach(function(plugin) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: plugin.id,
                type: 'button',
                values: {
                    '1': plugin.title
                },
                default: '1'
            },
            field: {
                name: plugin.title
            }
        });
    });
})();
