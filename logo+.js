(function () {
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
            },
            // Додаємо переклади для масштабування з Applecation
            settings_title_scaling: {
                en: 'Scaling',
                uk: 'Масштабування',
                ru: 'Масштабирование'
            },
            logo_scale: {
                en: 'Logo Size',
                uk: 'Розмір логотипу',
                ru: 'Размер логотипа'
            },
            logo_scale_desc: {
                en: 'Movie logo scale',
                uk: 'Масштаб логотипу фільму',
                ru: 'Масштаб логотипа фильма'
            },
            text_scale: {
                en: 'Text Size',
                uk: 'Розмір тексту',
                ru: 'Размер текста'
            },
            text_scale_desc: {
                en: 'Movie data text scale',
                uk: 'Масштаб тексту даних про фільм',
                ru: 'Масштаб текста данных о фильме'
            },
            scale_default: {
                en: 'Default',
                uk: 'За замовчуванням',
                ru: 'По умолчанию'
            },
            spacing_scale: {
                en: 'Spacing Between Lines',
                uk: 'Відступи між рядками',
                ru: 'Отступы между строками'
            },
            spacing_scale_desc: {
                en: 'Distance between information elements',
                uk: 'Відстань між елементами інформації',
                ru: 'Расстояние между элементами информации'
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

        // =========================================================
        // ІНТЕГРОВАНІ НАЛАШТУВАННЯ МАСШТАБУВАННЯ З APPLECATION
        // =========================================================
        
        // Ініціалізація значень за замовчуванням для масштабування
        if (Lampa.Storage.get('logo_logo_scale') === undefined) {
            Lampa.Storage.set('logo_logo_scale', '100');
        }
        if (Lampa.Storage.get('logo_text_scale') === undefined) {
            Lampa.Storage.set('logo_text_scale', '100');
        }
        if (Lampa.Storage.get('logo_spacing_scale') === undefined) {
            Lampa.Storage.set('logo_spacing_scale', '100');
        }

        // Заголовок: Масштабирование
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_scaling_title',
                type: 'title'
            },
            field: {
                name: Lampa.Lang.translate('settings_title_scaling')
            }
        });

        // Розмір логотипу
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_logo_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': Lampa.Lang.translate('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%',
                    '200': '200%',
                    '250': '250%',
                    '300': '300%'
                },
                default: '100'
            },
            field: {
                name: Lampa.Lang.translate('logo_scale'),
                description: Lampa.Lang.translate('logo_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('logo_logo_scale', value);
                applyLogoScales();
            }
        });

        // Розмір тексту
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_text_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': Lampa.Lang.translate('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%'
                },
                default: '100'
            },
            field: {
                name: Lampa.Lang.translate('text_scale'),
                description: Lampa.Lang.translate('text_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('logo_text_scale', value);
                applyLogoScales();
            }
        });

        // Відступи між рядками
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'logo_spacing_scale',
                type: 'select',
                values: {
                    '50': '50%',
                    '60': '60%',
                    '70': '70%',
                    '80': '80%',
                    '90': '90%',
                    '100': Lampa.Lang.translate('scale_default'),
                    '110': '110%',
                    '120': '120%',
                    '130': '130%',
                    '140': '140%',
                    '150': '150%',
                    '160': '160%',
                    '170': '170%',
                    '180': '180%',
                    '200': '200%',
                    '250': '250%',
                    '300': '300%'
                },
                default: '100'
            },
            field: {
                name: Lampa.Lang.translate('spacing_scale'),
                description: Lampa.Lang.translate('spacing_scale_desc')
            },
            onChange: function(value) {
                Lampa.Storage.set('logo_spacing_scale', value);
                applyLogoScales();
            }
        });

        // Функція застосування масштабування для логотипів
        function applyLogoScales() {
            const logoScale = parseInt(Lampa.Storage.get('logo_logo_scale', '100'));
            const textScale = parseInt(Lampa.Storage.get('logo_text_scale', '100'));
            const spacingScale = parseInt(Lampa.Storage.get('logo_spacing_scale', '100'));

            // Видаляємо старі стилі якщо вони є
            $('style[data-id="logo_scales"]').remove();

            // Створюємо нові стилі для масштабування логотипів
            const scaleStyles = `
                <style data-id="logo_scales">
                    /* Масштаб логотипу для старих карток */
                    .full-start__title img {
                        max-height: ${200 * logoScale / 100}px !important;
                        max-width: ${800 * logoScale / 100}px !important;
                        height: auto !important;
                        width: auto !important;
                    }
                    
                    /* Масштаб логотипу для нових карток */
                    .full-start-new__title img {
                        max-height: ${100 * logoScale / 100}px !important;
                        max-width: ${800 * logoScale / 100}px !important;
                        height: auto !important;
                        width: auto !important;
                    }
                    
                    /* Масштаб тексту біля логотипу */
                    .full-start__title span,
                    .full-start-new__title span {
                        font-size: ${textScale}% !important;
                        display: block !important;
                        margin-top: ${5 * spacingScale / 100}px !important;
                    }
                    
                    /* Відступи для старих карток */
                    .full-start__title > div {
                        margin-bottom: ${10 * spacingScale / 100}px !important;
                    }
                    
                    /* Відступи для нових карток */
                    .full-start-new__title > div {
                        margin-bottom: ${10 * spacingScale / 100}px !important;
                    }
                    
                    /* Спеціальні стилі для cover інтерфейсу */
                    .card_interfice_cover .full-start-new__title img {
                        max-height: ${150 * logoScale / 100}px !important;
                        max-width: ${900 * logoScale / 100}px !important;
                    }
                    
                    /* Адаптація для маленьких екранів (<585px) */
                    @media (max-width: 585px) {
                        .full-start__title img {
                            max-height: ${100 * logoScale / 100}px !important;
                            max-width: ${500 * logoScale / 100}px !important;
                        }
                        
                        .full-start-new__title img {
                            max-height: ${80 * logoScale / 100}px !important;
                            max-width: ${600 * logoScale / 100}px !important;
                        }
                        
                        .card_interfice_cover .full-start-new__title img {
                            max-height: ${120 * logoScale / 100}px !important;
                            max-width: ${700 * logoScale / 100}px !important;
                        }
                    }
                    
                    /* Для дуже великих логотипів (понад 150%) */
                    .full-start__title img[style*="max-height"],
                    .full-start-new__title img[style*="max-height"] {
                        max-height: none !important;
                        height: ${logoScale}% !important;
                    }
                </style>
            `;

            $('body').append(scaleStyles);
        }

        // Застосовуємо поточні налаштування масштабування при завантаженні
        applyLogoScales();

        // =========================================================
        // КІНЕЦЬ ІНТЕГРОВАНИХ НАЛАШТУВАНЬ МАСШТАБУВАННЯ
        // =========================================================

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
                        
                        // Отримуємо налаштування масштабування
                        var logoScale = parseInt(Lampa.Storage.get('logo_logo_scale', '100'));
                        var textScale = parseInt(Lampa.Storage.get('logo_text_scale', '100'));
                        var spacingScale = parseInt(Lampa.Storage.get('logo_spacing_scale', '100'));
                        
                        // Розраховуємо розміри на основі масштабу
                        var maxHeightLarge = Math.round(200 * logoScale / 100);
                        var maxHeightSmall = Math.round(100 * logoScale / 100);
                        var maxHeightCover = Math.round(150 * logoScale / 100);
                        var fontSize = textScale + '%';
                        var marginBottom = (10 * spacingScale / 100) + 'px';
                        var marginTopText = (5 * spacingScale / 100) + 'px';
                        
                        // Логіка залежно від налаштувань та ширини екрану
                        if (window.innerWidth > 585) {
                            if (Lampa.Storage.get('card_interfice_type') === 'new' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div style="margin-bottom: ' + marginBottom + ';">' +
                                          '<img style="display: block; height: ' + logoScale + '%; max-height: ' + maxHeightSmall + 'px; max-width: ' + (800 * logoScale / 100) + 'px; width: auto;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + 
                                          (titleText ? '<span style="font-size: ' + fontSize + '; margin-top: ' + marginTopText + '; display: block;">' + titleText + '</span>' : '') + 
                                          '</div>';
                                card.find('.full-start-new__tagline').remove();
                                card.find('.full-start-new__title').html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'new' && card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div style="margin-bottom: ' + marginBottom + ';">' +
                                          '<img style="display: block; height: ' + logoScale + '%; max-height: ' + maxHeightCover + 'px; max-width: ' + (900 * logoScale / 100) + 'px; width: auto;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + 
                                          (titleText ? '<span style="font-size: ' + fontSize + '; margin-top: ' + marginTopText + '; display: block;">' + titleText + '</span>' : '') + 
                                          '</div>';
                                card.find('.full-start-new__title').html(logoHtml);
                            } else if (Lampa.Storage.get('card_interfice_type') === 'old' && !card.find('div[data-name="card_interfice_cover"]').length) {
                                logoHtml = '<div style="height: auto !important; overflow: visible !important; margin-bottom: ' + marginBottom + ';">' +
                                          '<img style="display: block; height: ' + logoScale + '%; max-height: ' + maxHeightLarge + 'px; max-width: ' + (800 * logoScale / 100) + 'px; width: auto;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" />' + 
                                          (titleText ? '<span style="display: block; line-height: normal; font-size: ' + fontSize + '; margin-top: ' + marginTopText + ';">' + titleText + '</span>' : '') + 
                                          '</div>';
                                card.find('.full-start__title-original').remove();
                                card.find('.full-start__title').css({
                                    'height': 'auto !important',
                                    'max-height': 'none !important',
                                    'overflow': 'visible !important'
                                }).html(logoHtml);
                            }
                        } else {
                            // Для мобільних пристроїв
                            if (Lampa.Storage.get('card_interfice_type') === 'new') {
                                var mobileMaxHeight = Math.round(80 * logoScale / 100);
                                var mobileMaxWidth = Math.round(600 * logoScale / 100);
                                logoHtml = '<div style="margin-bottom: ' + marginBottom + ';">' +
                                          '<img style="display: block; height: ' + logoScale + '%; max-height: ' + mobileMaxHeight + 'px; max-width: ' + mobileMaxWidth + 'px; width: auto;" src="' + Lampa.TMDB.image('/t/p/w500' + logoPath.replace('.svg', '.png')) + '" />' + 
                                          (titleText ? '<span style="font-size: ' + fontSize + '; margin-top: ' + marginTopText + '; display: block;">' + titleText + '</span>' : '') + 
                                          '</div>';
                                card.find('.full-start-new__tagline').remove();
                                card.find('.full-start-new__title').html(logoHtml);
                            } else {
                                var mobileMaxHeightOld = Math.round(100 * logoScale / 100);
                                var mobileMaxWidthOld = Math.round(500 * logoScale / 100);
                                logoHtml = '<div style="height: auto !important; overflow: visible !important; margin-bottom: ' + marginBottom + ';">' +
                                          '<img style="display: block; height: ' + logoScale + '%; max-height: ' + mobileMaxHeightOld + 'px; max-width: ' + mobileMaxWidthOld + 'px; width: auto;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg', '.png')) + '" />' + 
                                          (titleText ? '<span style="display: block; line-height: normal; font-size: ' + fontSize + '; margin-top: ' + marginTopText + ';">' + titleText + '</span>' : '') + 
                                          '</div>';
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
