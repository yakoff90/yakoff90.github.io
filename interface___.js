(function () {
    'use strict';

    // Поліфіл для String.prototype.startsWith для ES5
    // Додає метод startsWith, якщо він відсутній у браузері (для сумісності зі старими версіями)
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // Локалізація текстів плагіна
    // Ключі - ідентифікатори текстів, значення - переклади на різні мови
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Интерфейс +',
            en: 'Interface +',
            uk: 'Інтерфейс +'
        },
        interface_mod_new_about_plugin: {
            ru: 'О плагине',
            en: 'About plugin',
            uk: 'Про плагін'
        },
        interface_mod_new_show_movie_type: {
            ru: 'Показывать лейблы типа',
            en: 'Show type labels',
            uk: 'Показувати мітки типу'
        },
        interface_mod_new_show_movie_type_desc: {
            ru: 'Показывать лейблы "Фильм" и "Сериал" на постере',
            en: 'Show "Movie" and "Series" labels on poster',
            uk: 'Показувати мітки "Фільм" і "Серіал" на постері'
        },
        interface_mod_new_label_serial: {
            ru: 'Сериал',
            en: 'Series',
            uk: 'Серіал'
        },
        interface_mod_new_label_movie: {
            ru: 'Фильм',
            en: 'Movie',
            uk: 'Фільм'
        },
        interface_mod_new_info_panel: {
            ru: 'Новая инфо-панель',
            en: 'New info panel',
            uk: 'Нова інфо-панель'
        },
        interface_mod_new_info_panel_desc: {
            ru: 'Цветная и перефразированная строка информации о фильме/сериале',
            en: 'Colored and rephrased info line about movie/series',
            uk: 'Кольорова та перефразована інформаційна панель'
        },
        interface_mod_new_colored_ratings: {
            ru: 'Цветной рейтинг',
            en: 'Colored rating',
            uk: 'Кольоровий рейтинг'
        },
        interface_mod_new_colored_ratings_desc: {
            ru: 'Включить цветовое выделение рейтинга',
            en: 'Enable colored rating highlight',
            uk: 'Увімкнути кольорове виділення рейтингу'
        },
        interface_mod_new_colored_status: {
            ru: 'Цветные статусы',
            en: 'Colored statuses',
            uk: 'Кольорові статуси'
        },
        interface_mod_new_colored_status_desc: {
            ru: 'Включить цветовое выделение статуса сериала',
            en: 'Enable colored series status',
            uk: 'Увімкнути кольоровий статус серіалу'
        },
        interface_mod_new_colored_age: {
            ru: 'Цветные возрастные ограничения',
            en: 'Colored age ratings',
            uk: 'Кольорові вікові обмеження'
        },
        interface_mod_new_colored_age_desc: {
            ru: 'Включить цветовое выделение возрастных ограничений',
            en: 'Enable colored age rating highlight',
            uk: 'Увімкнути кольорове виділення вікових обмежень'
        },
        interface_mod_new_show_all_buttons: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode: {
            ru: 'Стиль кнопок',
            en: 'Button style',
            uk: 'Стиль кнопок'
        },
        interface_mod_new_buttons_style_mode_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_buttons_style_mode_all: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode_custom: {
            ru: 'Пользовательский',
            en: 'Custom',
            uk: 'Користувацький'
        },
        interface_mod_new_theme_select: {
            ru: 'Тема интерфейса',
            en: 'Interface theme',
            uk: 'Тема інтерфейсу'
        },
        interface_mod_new_theme_select_desc: {
            ru: 'Выберите тему оформления интерфейса',
            en: 'Choose interface theme',
            uk: 'Виберіть тему оформлення інтерфейсу'
        },
        interface_mod_new_theme_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_theme_minimalist: {
            ru: 'Минималистичная',
            en: 'Minimalist',
            uk: 'Мінімалістична'
        },
        interface_mod_new_theme_glow_outline: {
            ru: 'Светящийся контур',
            en: 'Glowing outline',
            uk: 'Світловий контур'
        },
        interface_mod_new_theme_menu_lines: {
            ru: 'Меню с линиями',
            en: 'Menu with lines',
            uk: 'Меню з лініями'
        },
        interface_mod_new_theme_dark_emerald: {
            ru: 'Тёмный Emerald',
            en: 'Dark Emerald',
            uk: 'Темний Emerald'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style',
            uk: 'Новий стиль заголовків'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включает стильное оформление заголовков подборок с анимацией и спецэффектами',
            en: 'Enables stylish titles with animation and special effects',
            uk: 'Включає стильне оформлення заголовків підборівок з анімацією та спеціальними ефектами'
        },
        interface_mod_new_enhance_detailed_info: {
            ru: 'Увеличенная информация Beta',
            en: 'Enhanced detailed info Beta',
            uk: 'Збільшена інформація Beta'
        },
        interface_mod_new_enhance_detailed_info_desc: {
            ru: 'Включить увеличенную информацию о фильме/сериале',
            en: 'Enable enhanced detailed info about movie/series',
            uk: 'Увімкнути збільшену інформацію про фільм/серіал'
        }
    });

    // Налаштування за замовчуванням
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true), // Показувати мітки типу (фільм/серіал)
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true), // Відображати нову інформаційну панель
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true), // Включити кольорове виділення рейтингу
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'), // Стиль кнопок (default, all, custom)
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'), // Тема інтерфейсу
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false), // Стилізація заголовків підборок
        enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false) // Збільшена детальна інформація
    };

    // Інформація про плагін (буде завантажена пізніше)
    var aboutPluginData = null;

    // Функція для додавання лейблів на картки
    function changeMovieTypeLabels() {
        // Стилі для лейблів
        // Коментарі до стилів:
        // position: absolute!important; - фіксує позицію лейбла відносно батьківського елемента
        // left: 0.3em!important; - відступ зліва, можна збільшити для зсуву праворуч
        // top: 0.3em!important; - відступ зверху, можна збільшити для зсуву вниз
        // background: rgba(0,0,0,0.5)!important; - напівпрозорий чорний фон, змінюючи альфа-канал можна зробити фон більш прозорим або насиченим
        // color: #fff!important; - колір тексту, можна змінити на інший для контрасту
        // font-size: 1.3em!important; - розмір шрифту, збільшуючи робить текст більшим
        // padding: 0.2em 0.5em!important; - внутрішні відступи, збільшуючи робить лейбл більшим
        // border-radius: 1em!important; - округлення кутів, збільшуючи робить лейбл більш "округлим"
        // font-weight: 700; - жирність шрифту
        // z-index: 20!important; - шар поверх інших елементів
        var styleTag = $('<style id="movie_type_styles_new"></style>').html(`
            .content-label-new {
                position: absolute!important;
                left: 0.3em!important;
                top: 0.3em!important;
                background: rgba(0,0,0,0.5)!important;
                color: #fff!important;
                font-size: 1.3em!important;
                padding: 0.2em 0.5em!important;
                -webkit-border-radius: 1em!important;
                -moz-border-radius: 1em!important;
                border-radius: 1em!important;
                font-weight: 700;
                z-index: 20!important;
            }
            .serial-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3498db!important; /* Синій колір для серіалів */
            }
            .movie-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3da18d!important; /* Зелений колір для фільмів */
            }
            /* При увімкненій функції приховуємо вбудований лейбл TV */
            body[data-movie-labels-new="on"] .card--tv .card__type {
                display: none!important;
            }
        `);
        $('head').append(styleTag);

        // Встановлюємо атрибут для body, щоб керувати стилями через CSS
        if (settings.show_movie_type) {
            $('body').attr('data-movie-labels-new', 'on');
        } else {
            $('body').attr('data-movie-labels-new', 'off');
        }

        // Функція для додавання лейбла до картки
        function addLabelToCard(card) {
            if (!settings.show_movie_type) return; // Якщо функція вимкнена - нічого не робимо
            var $card = $(card);
            var $view = $card.find('.card__view');
            if (!$view.length || $card.find('.content-label-new').length) return; // Якщо немає контейнера для лейбла або лейбл вже доданий - вихід
            var is_tv = false;
            var cardText = $card.text().toLowerCase();
            // Визначаємо, чи це серіал за класом або текстом
            if ($card.hasClass('card--tv') || $card.find('.card__type').text().trim() === 'TV') {
                is_tv = true;
            }
            var isUnwantedContent = false;
            // Перевіряємо, чи не належить картка до небажаного контенту (sisi)
            if ($card.parents('.sisi-results, .sisi-videos, .sisi-section').length ||
                $card.closest('[data-component="sisi"]').length ||
                $card.closest('[data-name*="sisi"]').length) {
                isUnwantedContent = true;
            }
            if (window.location.href.indexOf('sisi') !== -1) {
                isUnwantedContent = true;
            }
            // Змінено: перевіряємо лише наявність .card__time, ігноруємо .card__quality
            if ($card.find('.card__time').length) {
                 isUnwantedContent = true;
            }
            // Фільтруємо заборонені слова (порно, секс, adult тощо)
            if (/(xxx|porn|эрот|секс|порно|для взрослых|sex|adult|erotica|ass|boobs|milf|teen|amateur|anal|webcam|private|18\+)/i.test(cardText)) {
                isUnwantedContent = true;
            }
            if (!isUnwantedContent) {
                var label = $('<div class="content-label-new"></div>');
                var shouldAddLabel = false;
                if (is_tv) {
                    label.addClass('serial-label-new');
                    label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                    shouldAddLabel = true;
                } else {
                    // Визначаємо, чи це фільм за наявністю вікового обмеження, рейтингу, року або ключових слів
                    var hasMovieTraits = $card.find('.card__age').length ||
                        $card.find('.card__vote').length ||
                        /\b(19|20)\d{2}\b/.test(cardText) ||
                        /(фильм|movie|полнометражный)/i.test(cardText);
                    if (hasMovieTraits) {
                        label.addClass('movie-label-new');
                        label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        shouldAddLabel = true;
                    }
                }
                if (shouldAddLabel) {
                    $view.append(label);
                }
            }
        }

        // Оновлення лейбла при зміні даних картки
        function updateCardLabel(card) {
            if (!settings.show_movie_type) return;
            $(card).find('.content-label-new').remove(); // Видаляємо старий лейбл
            addLabelToCard(card); // Додаємо новий
        }

        // Обробка всіх карток на сторінці
        function processAllCards() {
            if (!settings.show_movie_type) return;
            $('.card').each(function() {
                addLabelToCard(this);
            });
        }

        // Слухач подій для детального перегляду фільму/серіалу
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                var movie = data.data.movie;
                var posterContainer = $(data.object.activity.render()).find('.full-start__poster');
                if (posterContainer.length && movie) {
                    var is_tv = false;
                    // Визначаємо, чи це серіал за кількістю сезонів або типом
                    if (movie.number_of_seasons > 0 || movie.seasons || movie.season_count > 0) {
                        is_tv = true;
                    } else if (movie.type === 'tv' || movie.card_type === 'tv') {
                        is_tv = true;
                    }
                    if (settings.show_movie_type) {
                        var existingLabel = posterContainer.find('.content-label-new');
                        if (existingLabel.length) {
                            existingLabel.remove();
                        }
                        var label = $('<div class="content-label-new"></div>');
                        if (is_tv) {
                            label.addClass('serial-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                        } else {
                            label.addClass('movie-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        }
                        posterContainer.css('position', 'relative'); // Щоб лейбл позиціонувався відносно постера
                        posterContainer.append(label);
                    }
                }
            }
        });

        // MutationObserver для відслідковування появи нових карток та змін у них
        var observer = new MutationObserver(function(mutations) {
            var needCheck = false;
            var cardsToUpdate = new Set();
            mutations.forEach(function(mutation) {
                // Перевіряємо додані вузли
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if ($(node).hasClass('card')) {
                            cardsToUpdate.add(node);
                            needCheck = true;
                        } else if ($(node).find('.card').length) {
                            $(node).find('.card').each(function() {
                                cardsToUpdate.add(this);
                            });
                            needCheck = true;
                        }
                    }
                }
                // Перевіряємо зміни атрибутів, які можуть впливати на картку
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' ||
                        mutation.attributeName === 'data-card' ||
                        mutation.attributeName === 'data-type')) {
                    var targetNode = mutation.target;
                    if ($(targetNode).hasClass('card')) {
                        cardsToUpdate.add(targetNode);
                        needCheck = true;
                    }
                }
            });
            if (needCheck) {
                setTimeout(function() {
                    cardsToUpdate.forEach(function(card) {
                        updateCardLabel(card);
                    });
                }, 100); // Затримка для уникнення надмірних викликів
            }
        });
        observer.observe(document.body, {
            childList: true, // Слідкуємо за додаванням/видаленням дочірніх елементів
            subtree: true, // Слідкуємо за всіма нащадками
            attributes: true, // Слідкуємо за змінами атрибутів
            attributeFilter: ['class', 'data-card', 'data-type'] // Лише ці атрибути
        });

        // Початкова обробка всіх карток
        processAllCards();
    }

    // Додавання налаштування в меню Lampa
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });
        // Переміщаємо пункт "Інтерфейс+" одразу після "Інтерфейс" (без зациклювання)
        function moveModSettingsFolder() {
            var $folders = $('.settings-folder');
            var $interface = $folders.filter(function() {
                return $(this).data('component') === 'interface';
            });
            var $mod = $folders.filter(function() {
                return $(this).data('component') === 'interface_mod_new';
            });
            if ($interface.length && $mod.length) {
                // Перевіряємо, чи вже не знаходиться на потрібному місці
                if ($mod.prev()[0] !== $interface[0]) {
                    $mod.insertAfter($interface);
                }
            }
        }
        // Викликаємо функцію переміщення після завантаження меню
        setTimeout(moveModSettingsFolder, 100);
    }

    // Функція відмінювання слів (для правильного відображення числівників)
    // number - число, one - форма для 1, two - для 2-4, five - для 5 і більше
    function plural(number, one, two, five) {
        var n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    // Допоміжні функції для інформаційної панелі

    // Обчислення середньої тривалості серії
    // Фільтрує неадекватні значення (більше 200 хвилин)
    // Працює з різними форматами даних (episode_run_time, seasons.episodes)
    function calculateAverageEpisodeDuration(movie) {
        if (!movie || typeof movie !== 'object') return 0;
        var totalDuration = 0, episodeCount = 0;

        // Якщо є масив episode_run_time
        if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length > 0) {
            var filtered = movie.episode_run_time.filter(function(duration) {
                return duration > 0 && duration <= 200;
            });
            if (filtered.length > 0) {
                filtered.forEach(function(duration) {
                    totalDuration += duration;
                    episodeCount++;
                });
            }
        }
        // Якщо є seasons з episodes
        else if (movie.seasons && Array.isArray(movie.seasons)) {
            movie.seasons.forEach(function(season) {
                if (season.episodes && Array.isArray(season.episodes)) {
                    season.episodes.forEach(function(episode) {
                        if (episode.runtime && episode.runtime > 0 && episode.runtime <= 200) {
                            totalDuration += episode.runtime;
                            episodeCount++;
                        }
                    });
                }
            });
        }

        // Якщо знайшли адекватні значення - повертаємо середнє
        if (episodeCount > 0) return Math.round(totalDuration / episodeCount);

        // Якщо не знайшли адекватних значень — пробуємо last_episode_to_air.runtime
        if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
            return movie.last_episode_to_air.runtime;
        }

        // Якщо все одно нічого — повертаємо 0
        return 0;
    }

    // Форматування тривалості в хвилинах у зручний текстовий вигляд
    // Наприклад, 125 -> "2 години 5 хвилин"
    function formatDurationMinutes(minutes) {
        if (!minutes || minutes <= 0) return '';
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        var result = '';
        if (hours > 0) {
            result += hours + ' ' + plural(hours, 'година', 'години', 'годин');
            if (mins > 0) result += ' ' + mins + ' ' + plural(mins, 'хвилина', 'хвилини', 'хвилин');
        } else {
            result += mins + ' ' + plural(mins, 'хвилина', 'хвилини', 'хвилин');
        }
        return result;
    }

    // Основна функція нової інформаційної панелі
    // Відповідає за відображення кольорових бейджів з інформацією про фільм/серіал
    function newInfoPanel() {
        if (!settings.info_panel) return;

        // Визначення кольорів для різних типів інформації
        var colors = {
            seasons: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' }, // Сезони - синій фон, білий текст
            episodes: { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' }, // Серії - зелений фон, білий текст
            duration: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' }, // Тривалість - синій фон, білий текст
            next: { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' }, // Наступна серія - помаранчевий фон, білий текст
            genres: { // Кольори для жанрів
                'Бойовик': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' }, 		  // Червоний фон
                'Пригоди': { bg: 'rgba(39, 174, 96, 0.8)', text: 'white' }, 		  // Зелений фон
                'Мультфільм': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' }, 	  // Фіолетовий фон
                'Комедія': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' }, 		  // Жовтий фон, чорний текст
				'Кримінал': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },          // Темно-червоний фон, білий текст
				'Документальний': { bg: 'rgba(22, 160, 133, 0.8)', text: 'white' },   // Бірюзовий фон, білий текст
				'Драма': { bg: 'rgba(142, 68, 173, 0.8)', text: 'white' },            // Фіолетовий фон, білий текст
				'Сімейний': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },         // Зелений фон, білий текст
				'Фентезі': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },          // Світло-фіолетовий фон, білий текст
				'Історія': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },            // Помаранчевий фон, білий текст
				'Жахи': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },              // Темно-червоний фон, білий текст
				'Музика': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },           // Синій фон, білий текст
				'Детектив': { bg: 'rgba(52, 73, 94, 0.8)', text: 'white' },           // Темно-сірий фон, білий текст
				'Мелодрама': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },         // Яскраво-рожевий фон, білий текст
				'Фантастика': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },        // Темно-синій фон, білий текст
				'Трилер': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },             // Темно-червоний фон, білий текст
				'Військовий': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' },       // Сірий фон, білий текст
				'Вестерн': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },             // Помаранчевий фон, білий текст
				'Бойовик і Пригоди': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },  // Яскраво-червоний фон, білий текст
				'Дитячий': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },           // Зелений фон, білий текст
				'Новини': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },            // Синій фон, білий текст
				'Реаліті-шоу': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },       // Помаранчевий фон, білий текст
				'НФ і Фентезі': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },       // Темно-синій фон, білий текст
				'Мильна опера': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },        // Яскраво-рожевий фон, білий текст
				'Ток-шоу': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },            // Жовтий фон, чорний текст (для кращої читабельності)
				'Війна і Політика': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' }   // Сірий фон, білий текст
			}
        };
    }
})();

Lampa.Listener.follow('full', function(data) {
    // Перевіряємо, чи подія завершена і чи увімкнена панель інформації
    if (data.type === 'complite' && settings.info_panel) {
        setTimeout(function() {
            var details = $('.full-start-new__details');
            if (!details.length) return; // Якщо елемент не знайдено, виходимо

            var movie = data.data.movie;
            // Визначаємо, чи це серіал (наявність сезонів або тип 'tv'/'serial')
            var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');

            var originalDetails = details.html(); // Зберігаємо початковий HTML
            details.empty(); // Очищаємо контейнер для подальшого заповнення

            // Створюємо новий контейнер з флексбоксом, вертикальне розташування
            var newContainer = $('<div>').css({
                'display': 'flex', // Встановлює flex-контейнер
                'flex-direction': 'column', // Елементи розташовуються вертикально
                'width': '100%', // Ширина контейнера 100% від батьківського елемента
                'gap': '0em', // Відстань між елементами (0, тобто без відступів)
                'margin': '-1.0em 0 0.2em 0.45em' // Відступи: зверху -1em (зсуває вгору), справа 0, знизу 0.2em, зліва 0.45em
                // Зміна відступу зверху з 0 на -1em зсуває блок вгору, що може зблизити його з попереднім елементом
                // Зміна лівого відступу з 0 на 0.45em додає відступ зліва, відсуваючи блок праворуч
            });

            // Перший рядок: флексбокс, обтікання, відступи
            var firstRow = $('<div>').css({
                'display': 'flex', // Встановлює flex-контейнер
                'flex-wrap': 'wrap', // Дозволяє переносити елементи на наступний рядок, якщо не вміщаються
                'gap': '0.2em', // Відстань між елементами 0.2em
                'align-items': 'center', // Вертикальне вирівнювання по центру
                'margin': '0 0 0.2em 0' // Відступ знизу 0.2em, інші сторони 0
                // Зміна gap збільшує або зменшує відстань між бейджами
                // Зміна align-items на 'flex-start' вирівняє елементи по верхньому краю
            });

            // Другий рядок: аналогічні стилі для додаткової інформації
            var secondRow = $('<div>').css({
                'display': 'flex',
                'flex-wrap': 'wrap',
                'gap': '0.2em',
                'align-items': 'center',
                'margin': '0 0 0.2em 0'
            });

            // Третій рядок: для жанрів або іншої інформації
            var thirdRow = $('<div>').css({
                'display': 'flex',
                'flex-wrap': 'wrap',
                'gap': '0.2em',
                'align-items': 'center',
                'margin': '0 0 0.2em 0'
            });

            // Ініціалізуємо змінні для елементів тривалості, сезонів, серій, наступних серій, жанрів
            var durationElement = null, seasonElements = [], episodeElements = [], nextEpisodeElements = [], genreElements = [];

            // Створюємо тимчасовий контейнер для обробки початкового HTML
            var tempContainer = $('<div>').html(originalDetails);

            // Видаляємо стандартні позначки про наступний епізод (тексти "Наступна:" або "Залишилось днів:")
            tempContainer.find('span').filter(function() {
                var t = $(this).text();
                return t.indexOf('Наступна:') !== -1 || t.indexOf('Залишилось днів:') !== -1;
            }).remove();

            // Обробляємо всі спани для перефразування та стилізації
            tempContainer.find('span').each(function() {
                var $span = $(this);
                var text = $span.text();

                if ($span.hasClass('full-start-new__split')) return; // Пропускаємо роздільники

                // Базові стилі для бейджів
                var baseStyle = {
                    'border-radius': '0.3em', // Закруглення кутів бейджа (0.3em робить кути плавними)
                    'border': '0px', // Відсутність рамки
                    'font-size': '1.0em', // Розмір шрифту 1em (стандартний)
                    'padding': '0.2em 0.6em', // Відступи всередині: зверху/знизу 0.2em, зліва/справа 0.6em
                    'display': 'inline-block', // Відображення як блочно-рядковий елемент
                    'white-space': 'nowrap', // Запобігає переносу тексту всередині бейджа
                    'line-height': '1.2em', // Висота рядка 1.2em для кращої читабельності
                    'margin-right': '0.4em', // Відступ справа 0.4em, щоб бейджі не злипалися
                    'margin-bottom': '0.2em' // Відступ знизу 0.2em для вертикального розриву між рядками
                    // Збільшення border-radius зробить кути більш округлими, зменшення — більш гострими
                    // Зміна padding вплине на розмір бейджа: збільшення зробить його більшим
                    // Зміна margin-right вплине на відстань між бейджами по горизонталі
                };

                // Перефразування сезонів: шукаємо текст "Сезон" з числом
                var matchSeasons = text.match(/Сезон(?:ы)?:?\s*(\d+)/i);
                if (matchSeasons) {
                    var n = parseInt(matchSeasons[1], 10);
                    // Встановлюємо текст з правильним відмінком (приклад: "3 Сезони")
                    $span.text(n + ' ' + plural(n, 'Сезон', 'Сезону', 'Сезонів'));
                    // Застосовуємо стилі з кольорами для сезонів
                    $span.css($.extend({}, baseStyle, { 'background-color': colors.seasons.bg, 'color': colors.seasons.text }));
                    seasonElements.push($span.clone()); // Додаємо копію в масив сезонів
                    return;
                }

                // Перефразування серій: шукаємо текст "Серія" з числом
                var matchEpisodes = text.match(/Серії?:?\s*(\d+)/i);
                if (matchEpisodes) {
                    var n = parseInt(matchEpisodes[1], 10);
                    // Встановлюємо текст з правильним відмінком (приклад: "12 Серій")
                    $span.text(n + ' ' + plural(n, 'Серія', 'Серії', 'Серій'));
                    // Застосовуємо стилі з кольорами для серій
                    $span.css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                    episodeElements.push($span.clone()); // Додаємо копію в масив серій
                    return;
                }

                // Обробка жанрів: якщо текст містить роздільник " | ", розбиваємо на окремі жанри
                var genres = text.split(' | ');
                if (genres.length > 1) {
                    // Контейнер для бейджів жанрів з флексбоксом
                    var $genresContainer = $('<div>').css({
                        'display': 'flex', // Флекс-контейнер
                        'flex-wrap': 'wrap', // Перенос рядків
                        'align-items': 'center' // Вертикальне вирівнювання по центру
                    });
                    for (var i = 0; i < genres.length; i++) {
                        var genre = genres[i].trim();
                        // Визначаємо кольори для жанру або ставимо дефолтні
                        var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                        // Створюємо бейдж для жанру
                        var $badge = $('<span>').text(genre).css($.extend({}, baseStyle, {
                            'background-color': color.bg, // Фоновий колір бейджа
                            'color': color.text // Колір тексту
                            // margin видалено, щоб уникнути зайвих відступів між жанрами
                        }));
                        $genresContainer.append($badge); // Додаємо бейдж у контейнер
                    }
                    genreElements.push($genresContainer); // Додаємо контейнер у масив жанрів
                } else {
                    // Якщо жанр один, просто стилізуємо спан
                    var genre = text.trim();
                    var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                    $span.css($.extend({}, baseStyle, {
                        'background-color': color.bg,
                        'color': color.text,
                        // margin закоментовано, щоб уникнути зайвих відступів
                    }));
                    genreElements.push($span.clone()); // Додаємо копію в масив жанрів
                }
            });

            // --- КОРЕКТНИЙ ВИВІД СЕРІЙ ДЛЯ СЕРІАЛІВ + МЕТКА ПРО НАСТУПНУ СЕРІЮ ---
            if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)) {
                var totalEpisodes = 0; // Загальна кількість серій
                var airedEpisodes = 0; // Кількість вже вийшлих серій
                var currentDate = new Date(); // Поточна дата
                var hasEpisodes = false; // Чи є детальна інформація про епізоди

                // Підрахунок серій і вийшлих епізодів
                movie.seasons.forEach(function(season) {
                    if (season.season_number === 0) return; // Пропускаємо спецсезони (сезон 0)
                    if (season.episode_count) totalEpisodes += season.episode_count; // Додаємо кількість серій сезону

                    if (season.episodes && Array.isArray(season.episodes) && season.episodes.length) {
                        hasEpisodes = true; // Є детальна інформація про епізоди
                        season.episodes.forEach(function(episode) {
                            if (episode.air_date) {
                                var epAirDate = new Date(episode.air_date);
                                if (epAirDate <= currentDate) airedEpisodes++; // Підрахунок вийшлих епізодів
                            }
                        });
                    } else if (season.air_date) {
                        var airDate = new Date(season.air_date);
                        if (airDate <= currentDate && season.episode_count) airedEpisodes += season.episode_count;
                    }
                });

                // Вивід у консоль для налагодження
                console.log('[interface_mod_new] airedEpisodes:', airedEpisodes, 'totalEpisodes:', totalEpisodes, movie);

                // Якщо немає детальних даних по епізодах, але є інформація про наступний епізод
                if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
                    var nextSeason = movie.next_episode_to_air.season_number;
                    var nextEpisode = movie.next_episode_to_air.episode_number;
                    var remainingEpisodes = 0;

                    // Підрахунок залишку серій після наступного епізоду
                    movie.seasons.forEach(function(season) {
                        if (season.season_number === nextSeason) {
                            remainingEpisodes = (season.episode_count || 0) - nextEpisode + 1;
                        } else if (season.season_number > nextSeason) {
                            remainingEpisodes += season.episode_count || 0;
                        }
                    });

                    // Коригуємо кількість вийшлих епізодів
                    if (remainingEpisodes > 0 && totalEpisodes > 0) {
                        var calculatedAired = totalEpisodes - remainingEpisodes;
                        if (calculatedAired >= 0 && calculatedAired <= totalEpisodes) {
                            airedEpisodes = calculatedAired;
                        }
                    }
                }

                // Формуємо текст для відображення серій
                var episodesText = '';
                if (totalEpisodes > 0 && airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                    episodesText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серія', 'Серії', 'Серій') + ' з ' + totalEpisodes;
                } else if (totalEpisodes > 0) {
                    episodesText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серія', 'Серії', 'Серій');
                }

                // --- Новий порядок рядків ---
                // 1 рядок: сезони і серії
                firstRow.empty();
                seasonElements.forEach(function(el) { firstRow.append(el); });

                // Видаляємо всі бейджі серій з episodeElements, щоб уникнути дублювання
                // Завжди показуємо тільки наш кастомний бейдж
                if (episodesText) {
                    var baseStyle = {
                        'border-radius': '0.3em',
                        'border': '0px',
                        'font-size': '1.0em',
                        'padding': '0.2em 0.6em',
                        'display': 'inline-block',
                        'white-space': 'nowrap',
                        'line-height': '1.2em',
                        'margin-right': '0.4em',
                        'margin-bottom': '0.2em'
                    };
                    var $badge = $('<span>').text(episodesText).css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                    firstRow.append($badge);
                }

                // 2 рядок: мітка про наступну серію
                secondRow.empty();
                if (movie.next_episode_to_air && movie.next_episode_to_air.air_date && airedEpisodes < totalEpisodes) {
                    var nextDate = new Date(movie.next_episode_to_air.air_date);
                    var today = new Date();
                    nextDate.setHours(0,0,0,0); // Обнуляємо час для точного порівняння дат
                    today.setHours(0,0,0,0);
                    var diffDays = Math.floor((nextDate.getTime() - today.getTime()) / (1000*60*60*24)); // Різниця в днях

                    var nextText = '';
                    if (diffDays === 0) nextText = 'Наступна серія вже сьогодні';
                    else if (diffDays === 1) nextText = 'Наступна серія вже завтра';
                    else if (diffDays > 1) nextText = 'Наступна серія через ' + diffDays + ' ' + plural(diffDays, 'день', 'дні', 'днів');

                    if (nextText) {
                        var nextStyle = {
                            'border-radius': '0.3em', // Закруглення кутів
                            'border': '0px', // Без рамки
                            'font-size': '1.0em', // Розмір шрифту
                            'padding': '0.2em 0.6em', // Відступи всередині
                            'display': 'inline-block', // Відображення
                            'white-space': 'nowrap', // Без переносу
                            'line-height': '1.2em', // Висота рядка
                            'background-color': colors.next.bg, // Фон для позначки наступної серії
                            'color': colors.next.text, // Колір тексту
                            'margin-right': '0.4em', // Відступ справа
                            'margin-bottom': '0.2em' // Відступ знизу
                        };
                        var $nextBadge = $('<span>').text(nextText).css(nextStyle);
                        secondRow.append($nextBadge);
                    }
                }

                // 3 рядок: тривалість серії
                thirdRow.empty();
                var avgDuration = calculateAverageEpisodeDuration(movie);
                if (avgDuration > 0) {
                    var durationText = 'Тривалість серії ≈ ' + formatDurationMinutes(avgDuration);
                    var baseStyle = {
                        'border-radius': '0.3em',
                        'border': '0px',
                        'font-size': '1.0em',
                        'padding': '0.2em 0.6em',
                        'display': 'inline-block',
                        'white-space': 'nowrap',
                        'line-height': '1.2em',
                        'margin-right': '0.2em', // Відступ справа (зменшено з 0.4em)
                        'margin-bottom': '0.2em'
                    };
                    var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                    thirdRow.append($avgDurationBadge);
                }

                // 4 рядок: жанри
                var genresRow = $('<div>').css({
                    'display':'flex', // Флекс-контейнер
                    'flex-wrap':'wrap', // Перенос рядків
                    'gap':'0.2em', // Відстань між елементами
                    'align-items':'flex-start', // Вирівнювання по верхньому краю (раніше було 'center')
                    'margin':'0 0 0.2em 0' // Відступ знизу 0.2em
                    // Зміна align-items на 'center' вирівняє жанри по центру вертикально
                });

                // Додаємо елементи жанрів з додатковою логікою для відступів
                genreElements.forEach(function(el) {
                    if (!isTvShow && el.children().length > 1) { // Якщо це фільм з кількома жанрами
                        el.css({ 'margin-left': '0' }); // Відміняємо лівий відступ
                    }
                    genresRow.append(el);
                });

                // Очищаємо контейнер і додаємо всі рядки
                newContainer.empty();
                newContainer.append(firstRow);
                if (secondRow.children().length) newContainer.append(secondRow);
                if (thirdRow.children().length) newContainer.append(thirdRow);
                if (genresRow.children().length) newContainer.append(genresRow);

                details.append(newContainer); // Додаємо сформований контейнер у DOM
                return;
            }
            // --- КІНЕЦЬ БЛОКУ ПРО НАСТУПНУ СЕРІЮ ---

            // --- ДОПОЛНИТЕЛЬНА ОБРОБКА ДЛЯ ФІЛЬМІВ ---
            if (!isTvShow && movie && movie.runtime > 0) {
                // Видаляємо стандартні бейджі з часом (формат HH:MM) і "Тривалість серії ≈ ..." з тимчасового контейнера
                tempContainer.find('span').filter(function() {
                    var t = $(this).text().trim();
                    return /^\d{2}:\d{2}$/.test(t) || t.indexOf('Тривалість серії ≈') === 0;
                }).remove();

                // Також видаляємо такі бейджі з масиву жанрів, якщо вони там випадково є
                genreElements = genreElements.filter(function(el) {
                    var t = $(el).text().trim();
                    return !/^\d{2}:\d{2}$/.test(t);
                });

                // Формуємо рядок тривалості фільму
                var mins = movie.runtime;
                var hours = Math.floor(mins / 60);
                var min = mins % 60;
                var text = 'Тривалість фільму: ';
                if (hours > 0) text += hours + ' ' + plural(hours, 'година', 'години', 'годин');
                if (min > 0) text += (hours > 0 ? ' ' : '') + min + ' хв.';

                // Створюємо бейдж з тривалістю
                var $badge = $('<span>').text(text).css({
                    'border-radius': '0.3em', // Закруглення кутів
                    'border': '0px', // Без рамки
                    'font-size': '1.0em', // Розмір шрифту
                    'padding': '0.2em 0.6em', // Відступи всередині
                    'display': 'inline-block', // Відображення
                    'white-space': 'nowrap', // Без переносу
                    'line-height': '1.2em', // Висота рядка
                    'background-color': colors.duration.bg, // Фон бейджа
                    'color': colors.duration.text, // Колір тексту
                    //'margin': '0.2em', // Закоментовано, щоб уникнути зайвих відступів
                    'margin-right': '0.4em', // Відступ справа
                    'margin-bottom': '0.2em' // Відступ знизу
                });

                secondRow.empty().append($badge); // Додаємо бейдж у другий рядок
            } else if (isTvShow) {
                // Для серіалів виводимо середню тривалість серії
                var avgDuration = calculateAverageEpisodeDuration(movie);
                if (avgDuration > 0) {
                    var durationText = 'Тривалість серії ≈ ' + formatDurationMinutes(avgDuration);
                    var baseStyle = {
                        'border-radius': '0.3em',
                        'border': '0px',
                        'font-size': '1.0em',
                        'padding': '0.2em 0.6em',
                        'display': 'inline-block',
                        'white-space': 'nowrap',
                        'line-height': '1.2em',
                        'margin-right': '0.4em',
                        'margin-bottom': '0.2em'
                    };
                    var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                    secondRow.prepend($avgDurationBadge); // Додаємо бейдж на початок другого рядка
                }
            }

            // Якщо є елемент тривалості, додаємо його в перший рядок
            if (durationElement) firstRow.append(durationElement);

            // Додаємо сезони, серії, наступні епізоди в перший рядок
            seasonElements.forEach(function(el) { firstRow.append(el); });
            episodeElements.forEach(function(el) { firstRow.append(el); });
            nextEpisodeElements.forEach(function(el) { firstRow.append(el); });

            // Додаємо жанри в третій рядок
            genreElements.forEach(function(el) { thirdRow.append(el); });

            // Додаємо всі рядки в контейнер
            newContainer.append(firstRow).append(secondRow).append(thirdRow);

            // Додаємо контейнер у DOM
            details.append(newContainer);
        }, 100);
    }
});

// === ФУНКЦІЇ ДЛЯ КОЛЬОРОВИХ РЕЙТИНГІВ, СТАТУСІВ І ВІКОВИХ ОБМЕЖЕНЬ ===

// Функція оновлення кольорів рейтингу
function updateVoteColors() {
    if (!settings.colored_ratings) return; // Якщо кольорові рейтинги вимкнені, виходимо

    // Застосовуємо колір залежно від значення рейтингу
    function applyColorByRating(element) {
        var voteText = $(element).text().trim();
        var match = voteText.match(/(\d+(\.\d+)?)/);
        if (!match) return;
        var vote = parseFloat(match[0]);

        // Встановлюємо колір тексту залежно від рейтингу
        if (vote >= 0 && vote <= 3) {
            $(element).css('color', 'red'); // Дуже низький рейтинг - червоний
        } else if (vote > 3 && vote < 6) {
            $(element).css('color', 'orange'); // Низький рейтинг - оранжевий
        } else if (vote >= 6 && vote < 8) {
            $(element).css('color', 'cornflowerblue'); // Середній рейтинг - блакитний
        } else if (vote >= 8 && vote <= 10) {
            $(element).css('color', 'lawngreen'); // Високий рейтинг - зелений
        }
    }

    // Застосовуємо колір до всіх елементів з класами рейтингу
    $(".card__vote").each(function() { applyColorByRating(this); });
    $(".full-start__rate, .full-start-new__rate").each(function() { applyColorByRating(this); });
    $(".info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function() { applyColorByRating(this); });
}

// Налаштовуємо MutationObserver для автоматичного оновлення кольорів при зміні DOM
function setupVoteColorsObserver() {
    if (!settings.colored_ratings) return;
    setTimeout(updateVoteColors, 500); // Початкове оновлення через 500мс

    var observer = new MutationObserver(function() { setTimeout(updateVoteColors, 100); });
    observer.observe(document.body, { childList: true, subtree: true }); // Слідкуємо за всіма змінами в DOM
}

// Оновлення кольорів на сторінці деталей
function setupVoteColorsForDetailPage() {
    if (!settings.colored_ratings) return;
    Lampa.Listener.follow('full', function (data) {
        if (data.type === 'complite') {
            setTimeout(updateVoteColors, 100);
        }
    });
}

// Функція для кольорового відображення статусу серіалу
function colorizeSeriesStatus() {
    // Застосовуємо колір залежно від тексту статусу
    function applyStatusColor(statusElement) {
        var statusText = $(statusElement).text().trim();

        // Визначаємо кольори для різних статусів
        var statusColors = {
            'completed': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' }, // Завершено - зелений фон
            'canceled': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' }, // Скасовано - червоний фон
            'ongoing': { bg: 'rgba(243, 156, 18, 0.8)', text: 'black' }, // В процесі - оранжевий фон
            'production': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' }, // Виробництво - синій фон
            'planned': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' }, // Заплановано - фіолетовий фон
            'pilot': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' }, // Пілот - помаранчевий фон
            'released': { bg: 'rgba(26, 188, 156, 0.8)', text: 'white' }, // Випущено - бірюзовий фон
            'rumored': { bg: 'rgba(149, 165, 166, 0.8)', text: 'white' }, // За чутками - сірий фон
            'post': { bg: 'rgba(0, 188, 212, 0.8)', text: 'white' } // Пост-продакшн - блакитний фон
        };

        var bgColor = '', textColor = '';

        // Визначаємо колір залежно від ключових слів у статусі (українською та англійською)
        if (statusText.includes('Заверш') || statusText.includes('Ended')) { bgColor = statusColors.completed.bg; textColor = statusColors.completed.text; }
        else if (statusText.includes('Скасован') || statusText.includes('Canceled')) { bgColor = statusColors.canceled.bg; textColor = statusColors.canceled.text; }
        else if (statusText.includes('Онгоїнг') || statusText.includes('Выход') || statusText.includes('В процессе') || statusText.includes('Return')) { bgColor = statusColors.ongoing.bg; textColor = statusColors.ongoing.text; }
        else if (statusText.includes('виробництві') || statusText.includes('Production')) { bgColor = statusColors.production.bg; textColor = statusColors.production.text; }
        else if (statusText.includes('Запланировано') || statusText.includes('Planned')) { bgColor = statusColors.planned.bg; textColor = statusColors.planned.text; }
        else if (statusText.includes('Пилотный') || statusText.includes('Pilot')) { bgColor = statusColors.pilot.bg; textColor = statusColors.pilot.text; }
        else if (statusText.includes('Выпущенный') || statusText.includes('Released')) { bgColor = statusColors.released.bg; textColor = statusColors.released.text; }
        else if (statusText.includes('слухам') || statusText.includes('Rumored')) { bgColor = statusColors.rumored.bg; textColor = statusColors.rumored.text; }
        else if (statusText.includes('Скоро') || statusText.includes('Post')) { bgColor = statusColors.post.bg; textColor = statusColors.post.text; }

        // Якщо колір визначено, застосовуємо стилі
        if (bgColor) {
            $(statusElement).css({
                'background-color': bgColor, // Фоновий колір
                'color': textColor, // Колір тексту
                'border-radius': '0.3em', // Закруглення кутів
                'border': '0px', // Без рамки
                'font-size': '1.3em', // Розмір шрифту збільшено з 1.0em для кращої видимості
                'display': 'inline-block' // Відображення як блочно-рядковий елемент
            });
        }
    }

    // Застосовуємо колір до всіх елементів статусу
    $('.full-start__status').each(function() { applyStatusColor(this); });

    // Спостерігач за змінами DOM для динамічного оновлення кольорів статусів
    var statusObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    $(node).find('.full-start__status').each(function() { applyStatusColor(this); });
                    if ($(node).hasClass('full-start__status')) { applyStatusColor(node); }
                }
            }
        });
    });
    statusObserver.observe(document.body, { childList: true, subtree: true });

    // Слухаємо події завантаження деталей для оновлення кольорів
    Lampa.Listener.follow('full', function(data) {
        if (data.type === 'complite' && data.data.movie) {
            setTimeout(function() {
                $(data.object.activity.render()).find('.full-start__status').each(function() { applyStatusColor(this); });
            }, 100);
        }
    });
}

// Функція для кольорового відображення вікових обмежень
function colorizeAgeRating() {
    // Застосовуємо колір залежно від вікового рейтингу
    function applyAgeRatingColor(ratingElement) {
        var ratingText = $(ratingElement).text().trim();

        // Групи вікових рейтингів
        var ageRatings = {
            kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'], // Для дітей
            children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'], // Для дітей старшого віку
            teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'], // Підлітки
            almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'], // Майже дорослі
            adult: ['NC-17', '18+', '18', 'X'] // Дорослі
        };

        // Кольори для кожної групи
        var colors = {
            kids: { bg: '#2ecc71', text: 'white' }, // Зелений фон
            children: { bg: '#3498db', text: 'white' }, // Синій фон
            teens: { bg: '#f1c40f', text: 'black' }, // Жовтий фон, чорний текст
            almostAdult: { bg: '#e67e22', text: 'white' }, // Помаранчевий фон
            adult: { bg: '#e74c3c', text: 'white' } // Червоний фон
        };

        var group = null;

        // Визначаємо групу за текстом рейтингу
        for (var groupKey in ageRatings) {
            if (ageRatings[groupKey].includes(ratingText)) { group = groupKey; break; }
            for (var i = 0; i < ageRatings[groupKey].length; i++) {
                if (ratingText.includes(ageRatings[groupKey][i])) { group = groupKey; break; }
            }
            if (group) break;
        }

        // Якщо група визначена, застосовуємо стилі
        if (group) {
            $(ratingElement).css({
                'background-color': colors[group].bg, // Фон
                'color': colors[group].text, // Колір тексту
                'border-radius': '0.3em', // Закруглення кутів
                'font-size': '1.3em', // Збільшений розмір шрифту для кращої видимості
                'border': '0px' // Без рамки
            });
        }
    }

    // Застосовуємо колір до всіх елементів вікового рейтингу
    $('.full-start__pg').each(function() { applyAgeRatingColor(this); });

    // Спостерігач за змінами DOM для динамічного оновлення кольорів вікових рейтингів
    var ratingObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    $(node).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                    if ($(node).hasClass('full-start__pg')) { applyAgeRatingColor(node); }
                }
            }
        });
    });
    ratingObserver.observe(document.body, { childList: true, subtree: true });

    // Слухаємо події завантаження деталей для оновлення кольорів
    Lampa.Listener.follow('full', function(data) {
        if (data.type === 'complite' && data.data.movie) {
            setTimeout(function() {
                $(data.object.activity.render()).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
            }, 100);
        }
    });
}
// === КІНЕЦЬ ФУНКЦІЙ ДЛЯ КОЛЬОРІВ ===

// Функція для генерації кольору з рядка (хешування)
function stringToColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var color = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

// Функція для вилучення іконки провайдера з кнопки
function extractProviderIcon(btn) {
    var iconHtml = '';

    // Перевіряємо наявність SVG
    if (btn.find('svg').length) {
        var icon = btn.find('svg').clone();
        // Зберігаємо оригінальний viewBox, якщо є
        var originalViewBox = icon.attr('viewBox');
        // Видаляємо зайві атрибути, щоб уникнути конфліктів
        icon.removeAttr('width height style x y class version xml:space');
        if (!originalViewBox) {
            // Якщо viewBox відсутній, встановлюємо стандартний
            icon.attr('viewBox', '0 0 512 512');
        }
        // Встановлюємо фіксований розмір для відображення іконки
        icon.attr({
            width: 32,
            height: 32,
            style: 'width:32px;height:32px;display:block;'
        });

        // Перевіряємо, чи є всередині path або g (групи)
        if (icon.find('path').length === 0 && icon.find('g').length === 0) {
            // Якщо немає path, можливо це контейнер, беремо весь HTML батька
            iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                btn.find('svg').parent().html() + '</div>';
        } else {
            iconHtml = icon[0].outerHTML; // Витягуємо SVG як HTML
        }
    }
    // Перевіряємо наявність зображень img
    else if (btn.find('img').length) {
        var imgSrc = btn.find('img').attr('src');
        iconHtml = '<img src="' + imgSrc + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
    }
    // Перевіряємо елементи з класом .ico
    else if (btn.find('.ico').length) {
        var icoElement = btn.find('.ico').clone();
        // Якщо всередині є SVG, обгортаємо в div для центрування
        if (icoElement.find('svg').length) {
            iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                icoElement.html() + '</div>';
        } else {
            icoElement.attr('style', 'width:32px;height:32px;display:block;');
            iconHtml = icoElement[0].outerHTML;
        }
    }
    // Перевіряємо елементи з класом .button__ico
    else if (btn.find('.button__ico').length) {
        var buttonIco = btn.find('.button__ico').clone();
        if (buttonIco.find('svg').length) {
            iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                buttonIco.html() + '</div>';
        } else {
            buttonIco.attr('style', 'width:32px;height:32px;display:block;');
            iconHtml = buttonIco[0].outerHTML;
        }
    }
    // Перевіряємо елементи з фоновим зображенням
    else {
        var elemWithBg = btn.find('[style*="background-image"]');
        if (elemWithBg.length) {
            var bgStyle = elemWithBg.css('background-image');
            if (bgStyle && bgStyle.indexOf('url') !== -1) {
                iconHtml = '<div style="width:32px;height:32px;display:block;background-image:' + bgStyle + ';background-size:contain;background-position:center;background-repeat:no-repeat;"></div>';
            }
        }
    }

    return iconHtml; // Повертаємо HTML іконки
}

// Функція для отримання HTML іконки провайдера з кнопки
// btn - jQuery-елемент кнопки
// Повертає HTML рядок з іконкою або першу літеру назви з кольоровим фоном
function extractProviderIcon(btn) {
    var iconHtml = '';

    // Шукаємо іконку всередині кнопки за класами або тегами
    var icon = btn.find('svg, img').first();
    if (icon.length) {
        // Якщо знайдено SVG або IMG, беремо зовнішній HTML елемента
        iconHtml = icon[0].outerHTML;
    }
    // Якщо SVG або IMG немає, шукаємо інші можливі іконки
    else {
        // Шукаємо перший елемент з класом, що містить "icon" або "logo"
        var possibleIcons = btn.find('.icon, .logo, [class*="icon"], [class*="logo"]').first();

        if (possibleIcons.length) {
            // Якщо всередині є SVG, зберігаємо весь внутрішній HTML з обгорткою для розміру 32x32 пікселі
            if (possibleIcons.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    possibleIcons.html() + '</div>';
            } else {
                // Клонуємо елемент і задаємо стилі для розміру 32x32 пікселі
                var possibleIcon = possibleIcons.clone();
                possibleIcon.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = possibleIcon[0].outerHTML;
            }
        }
        // Якщо іконок немає, перевіряємо data-атрибути кнопки
        else {
            var dataIcon = btn.attr('data-icon') || btn.attr('data-logo');
            if (dataIcon) {
                // Якщо data-атрибут починається з <svg або <img, використовуємо його як HTML
                if (dataIcon.indexOf('<svg') === 0 || dataIcon.indexOf('<img') === 0) {
                    iconHtml = dataIcon;
                }
                // Якщо data-атрибут - URL (починається з http або /), створюємо тег img з цим src
                else if (dataIcon.indexOf('http') === 0 || dataIcon.indexOf('/') === 0) {
                    iconHtml = '<img src="' + dataIcon + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
                }
            }
            // Якщо нічого не знайдено, використовуємо першу літеру назви провайдера
            else {
                var providerName = btn.text().trim();
                if (providerName) {
                    var firstLetter = providerName.charAt(0).toUpperCase();
                    // Функція stringToColor генерує колір на основі рядка (назви провайдера)
                    var backgroundColor = stringToColor(providerName);
                    // Створюємо круглу іконку з першою літерою на кольоровому фоні
                    iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background-color:' + backgroundColor + ';color:white;border-radius:50%;font-weight:bold;font-size:18px;">' + firstLetter + '</div>';
                }
            }
        }
    }

    return iconHtml;
}

// Функція для створення меню кнопки "Ещё" (показує додаткові опції)
// otherButtons - масив jQuery-елементів кнопок, які будуть у меню
// Повертає функцію, яка відкриває меню при виклику
function createMoreButtonMenu(otherButtons) {
    return function() {
        var items = [];

        // Формуємо масив пунктів меню з кнопок
        otherButtons.forEach(function(btn) {
            var btnText = btn.text().trim();
            // Підзаголовок береться з data-subtitle, data('subtitle') або title
            var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
            var iconHtml = extractProviderIcon(btn);

            items.push({
                title: btnText,
                icon: iconHtml,
                subtitle: subtitle,
                btn: btn
            });
        });

        // Викликаємо Lampa.Select для показу меню з пунктами
        Lampa.Select.show({
            title: 'Дополнительные опции',
            items: items,
            onSelect: function(selected) {
                // При виборі пункту виконуємо подію hover:enter на відповідній кнопці
                if (selected && selected.btn) {
                    selected.btn.trigger('hover:enter');
                }
            },
            onBack: function() {}
        });

        // Через 50 мс налаштовуємо стилі та анімації для пунктів меню
        setTimeout(function() {
            $('.selectbox-item').each(function(i) {
                if (items[i]) {
                    var iconHtml = '';
                    if (items[i].icon) {
                        // Обгортка для іконки з фіксованим розміром і позиціонуванням
                        iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                    }

                    // Додаємо відступ зліва, якщо є іконка, і позиціонуємо іконку
                    $(this).css({
                        'position': 'relative',
                        'padding-left': items[i].icon ? '56px' : '16px'
                    }).prepend(iconHtml);

                    // Встановлюємо розмір SVG іконок для кращої видимості
                    $(this).find('.menu__ico svg').css({
                        'width': '100%',
                        'height': '100%',
                        'max-width': '32px',
                        'max-height': '32px'
                    });

                    // Підганяємо розмір SVG всередині контейнера
                    $(this).find('.menu__ico svg > *').each(function() {
                        // Якщо атрибут viewBox не заданий або має стандартне значення, змінюємо його
                        var svg = $(this).closest('svg');
                        if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                            // Якщо є шляхи (path), встановлюємо viewBox 512x512 для кращої масштабованості
                            var paths = svg.find('path');
                            if (paths.length) {
                                svg.attr('viewBox', '0 0 512 512');
                                svg.attr('preserveAspectRatio', 'xMidYMid meet');
                            }
                        }
                    });

                    // Додаємо анімацію збільшення іконки при наведенні або фокусі
                    $(this).on('hover:focus hover:hover', function(){
                        $(this).find('.menu__ico').css({
                            'transform': 'translateY(-50%) scale(1.1)',
                            'transition': 'all 0.3s'
                        });
                    }).on('hover:blur', function(){
                        $(this).find('.menu__ico').css({
                            'transform': 'translateY(-50%)',
                            'transition': 'all 0.3s'
                        });
                    });
                }
            });
        }, 50);
    };
}

// === ВІДОБРАЖЕННЯ ВСІХ КНОПОК ===
function showAllButtons() {
    // Відключаємо глобальне додавання стилю normalize_svg_icons_style
    // (Більше не додаємо document.head.appendChild(normalizeIconsStyle))
    // ... інший код ...

    // --- Кастомні кнопки для режиму main2 ---
    if (!document.getElementById('interface_mod_new_buttons_style')) {
        var buttonStyle = document.createElement('style');
        buttonStyle.id = 'interface_mod_new_buttons_style';
        buttonStyle.innerHTML = `
            /* Контейнер кнопок: відображення у вигляді флексу з переносом і відступами */
            .full-start-new__buttons, .full-start__buttons {
                display: flex !important; /* Змінити на block - кнопки будуть вертикально */
                flex-wrap: wrap !important; /* Змінити на nowrap - кнопки не будуть переноситись */
                gap: 0.7em !important; /* Змінити на 1em - збільшить відстань між кнопками */
            }
            /* Стиль для кастомної кнопки онлайн */
            .custom-online-btn { 
                background-color: #2f2f2fd1; /* Змінити колір фону, наприклад, на #000000 - кнопка стане темнішою */
                box-shadow: 0 0 13px #00b2ff; /* Змінити розмір тіні, наприклад, 0 0 5px - тінь стане меншою */
                margin: 0.6em; /* Відступ навколо кнопки */
                margin-right: 1.1em; /* Відступ справа */
            }
            /* Стиль для кастомної кнопки торрент */
            .custom-torrent-btn { 
                background-color: #2f2f2fd1; /* Аналогічно, можна змінити колір */
                box-shadow: 0 0 13px #00ff40; /* Тінь зеленого кольору */
            }
            /* Стиль для кнопки "Ещё" */
            .main2-more-btn { 
                background-color: #2f2f2fd1; /* Колір фону */
                margin-left: 1.4em; /* Відступ зліва */
                font-weight: bold; /* Жирний шрифт */
                box-shadow: 0 0 13px #e67e22; /* Помаранчева тінь */
            }
            
            /* Медіа-запит для екранів шириною до 600px (мобільні пристрої) */
            @media (max-width: 600px) {
                .custom-online-btn { 
                    background-color: #2f2f2fd1; /* Залишаємо колір */
                    box-shadow: 0 0 8px #00b2ff; /* Зменшуємо тінь для мобільних */
                    margin: 0.8em; /* Збільшуємо відступ */
                }
                .custom-torrent-btn { 
                    background-color: #2f2f2fd1;
                    box-shadow: 0 0 8px #00ff40; /* Зменшена тінь */
                }
                .main2-more-btn { 
                    background-color: #2f2f2fd1;
                    margin-left: 1.4em;
                    font-weight: bold;
                    box-shadow: 0 0 8px #e67e22; /* Зменшена тінь */
                }

                /* Стилі для кнопок у фокусі (при наведенні або виборі) */
                .full-start__button.focus,
                .custom-online-btn.focus,
                .custom-torrent-btn.focus,
                .main2-more-btn.focus {
                    background: none; /* Прибрати фон */
                    background-color: #2f2f2fd1; /* Залишити напівпрозорий фон */
                    color: #fff; /* Білий колір тексту */
                    filter: none; /* Відключити фільтри */
                }
            }
        `;
        // Додаємо стилі в head документа
        document.head.appendChild(buttonStyle);
    }

    var originFullCard;
    if (Lampa.FullCard) {
        // Зберігаємо оригінальну функцію побудови картки
        originFullCard = Lampa.FullCard.build;

        // Перевизначаємо функцію build для додавання кастомної логіки
        Lampa.FullCard.build = function(data) {
            var card = originFullCard(data);

            // Метод для організації кнопок на картці
            card.organizeButtons = function() {
                var activity = card.activity;
                if (!activity) return;
                var element = activity.render();
                if (!element) return;

                // Шукаємо контейнер для кнопок у різних можливих селекторах
                var targetContainer = element.find('.full-start-new__buttons');
                if (!targetContainer.length) targetContainer = element.find('.full-start__buttons');
                if (!targetContainer.length) targetContainer = element.find('.buttons-container');
                if (!targetContainer.length) return;

                var allButtons = [];
                // Селектори для пошуку всіх кнопок
                var buttonSelectors = [
                    '.buttons--container .full-start__button',
                    '.full-start-new__buttons .full-start__button',
                    '.full-start__buttons .full-start__button',
                    '.buttons-container .button',
                    '.full-start-new__buttons .button',
                    '.full-start__buttons .button'
                ];
                // Збираємо всі кнопки у масив allButtons
                buttonSelectors.forEach(function(selector) {
                    element.find(selector).each(function() {
                        allButtons.push(this);
                    });
                });
                if (allButtons.length === 0) return;

                // Розподіляємо кнопки по категоріях
                var categories = {
                    online: [],
                    torrent: [],
                    trailer: [],
                    other: []
                };
                var addedButtonTexts = {}; // Для уникнення дублікатів по тексту
                $(allButtons).each(function() {
                    var button = this;
                    var buttonText = $(button).text().trim();
                    var className = button.className || '';
                    if (!buttonText || addedButtonTexts[buttonText]) return;
                    addedButtonTexts[buttonText] = true;

                    // Визначаємо категорію кнопки за класом
                    if (className.includes('online')) {
                        categories.online.push(button);
                    } else if (className.includes('torrent')) {
                        categories.torrent.push(button);
                    } else if (className.includes('trailer')) {
                        categories.trailer.push(button);
                    } else {
                        categories.other.push(button);
                    }
                });

                // Порядок сортування категорій кнопок
                var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];

                // Перевіряємо, чи потрібно переключати контролер (режим full_start)
                var needToggle = Lampa.Controller.enabled().name === 'full_start';
                if (needToggle) Lampa.Controller.toggle('settings_component');

                // Від'єднуємо всі поточні кнопки з контейнера
                var originalElements = targetContainer.children().detach();

                // Задаємо стилі контейнеру для флекс-розмітки
                targetContainer.css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.7em'
                });

                // Додаємо кнопки у контейнер у визначеному порядку
                buttonSortOrder.forEach(function(category) {
                    categories[category].forEach(function(button) {
                        targetContainer.append(button);
                    });
                });

                // --- Кастомні кнопки для режиму main2 ---
                if (settings.buttons_style_mode === 'main2') {
                    // Зберігаємо всі оригінальні онлайн-кнопки (унікальні за текстом і підзаголовком)
                    var allOnlineButtons = [];
                    var seenOnlineTexts = {};
                    $(allButtons).each(function() {
                        var btn = $(this);
                        // Перевіряємо, чи клас починається з view--online
                        if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                            var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                            if (!seenOnlineTexts[key]) {
                                allOnlineButtons.push(btn);
                                seenOnlineTexts[key] = true;
                            }
                        }
                    });

                    // Ховаємо всі кнопки
                    allButtons.forEach(function(btn) { $(btn).hide(); });

                    // Знаходимо оригінальні кнопки онлайн і торрент
                    var origOnline = targetContainer.find('.full-start__button.view--online');
                    var origTorrent = targetContainer.find('.full-start__button.view--torrent');

                    // Ховаємо оригінальні кнопки онлайн і торрент
                    origOnline.hide();
                    origTorrent.hide();

                    // Видаляємо кастомні кнопки, якщо вони вже є
                    targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();

                    // Створюємо велику кастомну кнопку Онлайн (без інлайн-стилів)
                    var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                        .text('Онлайн')
                        .attr('data-subtitle', 'Lampac v1.4.8')
                        .on('hover:focus', function(){ $(this).addClass('focus'); })
                        .on('hover:blur', function(){ $(this).removeClass('focus'); });

                    // Меню вибору онлайн-провайдера (спочатку приховане)
                    var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');

                    // Функція для показу меню онлайн-провайдерів
                    function showOnlineMenu() {
                        if (allOnlineButtons.length === 0) {
                            Lampa.Noty.show('Нет онлайн-провайдера');
                            return;
                        }
                        if (allOnlineButtons.length === 1) {
                            allOnlineButtons[0].trigger('hover:enter');
                            return;
                        }
                        var items = [];
                        for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                            var btn = allOnlineButtons[idx];
                            var iconHtml = extractProviderIcon(btn);
                            var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                            items.push({
                                title: btn.text().trim(),
                                icon: iconHtml,
                                subtitle: subtitle,
                                idx: idx
                            });
                        }
                        Lampa.Select.show({
                            title: 'Выберите онлайн-провайдера',
                            items: items,
                            onSelect: function(selected) {
                                if (selected && typeof selected.idx !== 'undefined') {
                                    allOnlineButtons[selected.idx].trigger('hover:enter');
                                }
                            },
                            onBack: function() {}
                        });
                        // Налаштовуємо стилі і анімації для пунктів меню
                        setTimeout(function() {
                            $('.selectbox-item').each(function(i) {
                                if (items[i]) {
                                    var iconHtml = '';
                                    if (items[i].icon) {
                                        iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                    }
                                    
                                    $(this).css({
                                        'position': 'relative',
                                        'padding-left': items[i].icon ? '56px' : '16px'
                                    }).prepend(iconHtml);
                                    
                                    // Встановлюємо розмір SVG іконок
                                    $(this).find('.menu__ico svg').css({
                                        'width': '100%',
                                        'height': '100%',
                                        'max-width': '32px',
                                        'max-height': '32px'
                                    });
                                    
                                    // Підганяємо viewBox для SVG
                                    $(this).find('.menu__ico svg > *').each(function() {
                                        var svg = $(this).closest('svg');
                                        if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                            var paths = svg.find('path');
                                            if (paths.length) {
                                                svg.attr('viewBox', '0 0 512 512');
                                                svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                            }
                                        }
                                    });
                                    
                                    // Анімація при наведенні
                                    $(this).on('hover:focus hover:hover', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%) scale(1.1)',
                                            'transition': 'all 0.3s'
                                        });
                                    }).on('hover:blur', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%)',
                                            'transition': 'all 0.3s'
                                        });
                                    });
                                }
                            });
                        }, 50);
                    }

                    // Обробник події натискання на кнопку Онлайн
                    onlineBtn.on('hover:enter', function() {
                        if (allOnlineButtons.length === 0) {
                            Lampa.Noty.show('Нет онлайн-провайдера');
                            return;
                        }
                        if (allOnlineButtons.length === 1) {
                            allOnlineButtons[0].trigger('hover:enter');
                            return;
                        }
                        var items = [];
                        for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                            var btn = allOnlineButtons[idx];
                            var iconHtml = extractProviderIcon(btn);
                            var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                            items.push({
                                title: btn.text().trim(),
                                icon: iconHtml,
                                subtitle: subtitle,
                                idx: idx
                            });
                        }
                        Lampa.Select.show({
                            title: 'Выберите онлайн-провайдера',
                            items: items,
                            onSelect: function(selected) {
                                if (selected && typeof selected.idx !== 'undefined') {
                                    allOnlineButtons[selected.idx].trigger('hover:enter');
                                }
                            },
                            onBack: function() {}
                        });
                        // Налаштування стилів меню (аналогічно попередньому)
                        setTimeout(function() {
                            $('.selectbox-item').each(function(i) {
                                if (items[i]) {
                                    var iconHtml = '';
                                    if (items[i].icon) {
                                        iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                    }
                                    
                                    $(this).css({
                                        'position': 'relative',
                                        'padding-left': items[i].icon ? '56px' : '16px'
                                    }).prepend(iconHtml);
                                    
                                    $(this).find('.menu__ico svg').css({
                                        'width': '100%',
                                        'height': '100%',
                                        'max-width': '32px',
                                        'max-height': '32px'
                                    });
                                    
                                    $(this).find('.menu__ico svg > *').each(function() {
                                        var svg = $(this).closest('svg');
                                        if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                            var paths = svg.find('path');
                                            if (paths.length) {
                                                svg.attr('viewBox', '0 0 512 512');
                                                svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                            }
                                        }
                                    });
                                    
                                    $(this).on('hover:focus hover:hover', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%) scale(1.1)',
                                            'transition': 'all 0.3s'
                                        });
                                    }).on('hover:blur', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%)',
                                            'transition': 'all 0.3s'
                                        });
                                    });
                                }
                            });
                        }, 50);
                    });

                    // Обробка клавіш у меню онлайн-провайдерів (закриття меню при натисканні Back або Escape)
                    onlineMenu.on('keydown', function(e) {
                        if (e.key === 'Back' || e.key === 'Escape') {
                            onlineMenu.hide();
                            onlineBtn.addClass('focus');
                        }
                    });

                    // При втраті фокусу меню ховається, якщо немає елементів з фокусом
                    onlineMenu.on('focusout', function() {
                        setTimeout(function() {
                            if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                        }, 100);
                    });

                    // Створюємо велику кастомну кнопку Торрент (без інлайн-стилів)
                    var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                        .text('Торрент')
                        .attr('data-subtitle', 'Торрент')
                        .on('hover:focus', function(){ $(this).addClass('focus'); })
                        .on('hover:blur', function(){ $(this).removeClass('focus'); })
                        .on('hover:enter', function() {
                            if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                            else Lampa.Noty.show('Нет торрент-провайдера');
                        });

                    // Збираємо інші кнопки, які не є онлайн або торрент, і не дублюють онлайн-кнопки
                    var otherButtons = [];
                    var onlineButtonTexts = {};
                    allOnlineButtons.forEach(function(btn) {
                        var text = $(btn).text().trim();
                        if (text) {
                            onlineButtonTexts[text] = true;
                        }
                    });

                    // Список текстів кнопок, які потрібно приховати з меню "Ещё"
                    var hideButtonTexts = {
                        'Смотреть': true,
                        'Подписаться': true
                    };

                    // Фільтруємо кнопки для меню "Ещё"
                    $(allButtons).each(function() {
                        var btn = $(this);
                        var btnText = btn.text().trim();
                        if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                            !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                            // Клонуємо кнопку, видаляємо клас focus
                            otherButtons.push(btn.clone(true, true).removeClass('focus'));
                        }
                    });

                    // Створюємо кнопку "Ещё" (без інлайн-стилів)
                    var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                        .on('hover:focus', function(){ $(this).addClass('focus'); })
                        .on('hover:blur', function(){ $(this).removeClass('focus'); });

                    // Відкриваємо меню при натисканні на кнопку "Ещё"
                    moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));

                    // Вставляємо кастомні кнопки у контейнер у потрібному порядку
                    targetContainer.prepend(moreBtn);
                    targetContainer.prepend(torrentBtn);
                    targetContainer.prepend(onlineBtn);
                    targetContainer.prepend(onlineMenu);

                    // Через 10 мс видаляємо інлайн-стилі у кастомних кнопок (щоб уникнути конфліктів)
                    setTimeout(function() {
                        targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                            this.removeAttribute('style');
                        });
                    }, 10);

                    // Додаємо клас controller для контейнера, щоб він став контролером для навігації
                    targetContainer.addClass('controller');

                    // Вмикаємо контролер full_start
                    Lampa.Controller.enable('full_start');

                    // Через 100 мс додаємо фокус на кнопку Онлайн
                    setTimeout(function() {
                        onlineBtn.addClass('focus');
                    }, 100);
                }
                // --- Кінець блоку кастомних кнопок main2 ---

                // Якщо був переключений контролер, повертаємо його назад через 100 мс
                if (needToggle) {
                    setTimeout(function() {
                        Lampa.Controller.toggle('full_start');
                    }, 100);
                }
            };

            // При створенні картки виконуємо організацію кнопок, якщо увімкнено відповідний стиль
            card.onCreate = function() {
                if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
                    setTimeout(function() {
                        card.organizeButtons();
                    }, 300);
                }
            };

            return card;
        };
    }
}

Lampa.Listener.follow('full', function(e) {
    // Слухаємо подію 'full' (повний екран або повний опис)
    if (e.type === 'complite' && e.object && e.object.activity) {
        // Якщо подія типу 'complite' (завершена) і є активність
        if ((settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') && !Lampa.FullCard) {
            // Якщо стиль кнопок 'all' або 'main2' і немає повної картки (FullCard)
            setTimeout(function() {
                // Затримка 300мс для коректного рендеру
                var fullContainer = e.object.activity.render();
                // Отримуємо контейнер з кнопками
                var targetContainer = fullContainer.find('.full-start-new__buttons');
                if (!targetContainer.length) targetContainer = fullContainer.find('.full-start__buttons');
                if (!targetContainer.length) targetContainer = fullContainer.find('.buttons-container');
                if (!targetContainer.length) return; // Якщо контейнер не знайдено - вихід

                // Задаємо стилі для контейнера кнопок: flex, обтікання, відступи
                targetContainer.css({
                    display: 'flex',       // Відображення у вигляді flex-контейнера
                    flexWrap: 'wrap',     // Дозволяємо перенос кнопок на новий рядок
                    gap: '0.7em'          // Відступ між кнопками 0.7em (змінити на 1em - збільшить відстань)
                });

                var allButtons = [];
                // Селектори для пошуку кнопок у різних контейнерах
                var buttonSelectors = [
                    '.buttons--container .full-start__button',
                    '.full-start-new__buttons .full-start__button',
                    '.full-start__buttons .full-start__button',
                    '.buttons-container .button',
                    '.full-start-new__buttons .button',
                    '.full-start__buttons .button'
                ];
                // Збираємо всі кнопки за вказаними селекторами
                buttonSelectors.forEach(function(selector) {
                    fullContainer.find(selector).each(function() {
                        allButtons.push(this);
                    });
                });
                if (allButtons.length === 0) return; // Якщо кнопок немає - вихід

                // Категоризуємо кнопки за типами: онлайн, торрент, трейлер, інші
                var categories = {
                    online: [],
                    torrent: [],
                    trailer: [],
                    other: []
                };
                var addedButtonTexts = {}; // Для унікальності кнопок за текстом
                $(allButtons).each(function() {
                    var button = this;
                    var buttonText = $(button).text().trim();
                    var className = button.className || '';
                    if (!buttonText || addedButtonTexts[buttonText]) return; // Пропускаємо пусті або дублікати
                    addedButtonTexts[buttonText] = true;
                    if (className.includes('online')) {
                        categories.online.push(button); // Кнопки онлайн
                    } else if (className.includes('torrent')) {
                        categories.torrent.push(button); // Кнопки торрент
                    } else if (className.includes('trailer')) {
                        categories.trailer.push(button); // Кнопки трейлерів
                    } else {
                        categories.other.push(button); // Інші кнопки
                    }
                });

                // Порядок сортування кнопок за категоріями
                var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];

                // Перевіряємо, чи активний контролер 'full_start'
                var needToggle = Lampa.Controller.enabled().name === 'full_start';
                if (needToggle) Lampa.Controller.toggle('settings_component'); // Тимчасово переключаємо контролер

                // Від'єднуємо всі поточні кнопки з контейнера (щоб переставити)
                var originalElements = targetContainer.children().detach();

                // Додаємо кнопки у контейнер у визначеному порядку
                buttonSortOrder.forEach(function(category) {
                    categories[category].forEach(function(button) {
                        targetContainer.append(button);
                    });
                });

                // --- кастомні кнопки для режиму main2 ---
                if (settings.buttons_style_mode === 'main2') {
                    // Зберігаємо всі унікальні онлайн-кнопки до їх приховування/переміщення
                    var allOnlineButtons = [];
                    var seenOnlineTexts = {};
                    $(allButtons).each(function() {
                        var btn = $(this);
                        // Перевіряємо, чи клас починається з 'view--online'
                        if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                            var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                            if (!seenOnlineTexts[key]) {
                                allOnlineButtons.push(btn);
                                seenOnlineTexts[key] = true;
                            }
                        }
                    });

                    // Ховаємо всі кнопки
                    allButtons.forEach(function(btn) { $(btn).hide(); });

                    // Знаходимо оригінальні кнопки онлайн і торрент
                    var origOnline = targetContainer.find('.full-start__button.view--online');
                    var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                    origOnline.hide();  // Ховаємо оригінальні онлайн-кнопки
                    origTorrent.hide(); // Ховаємо оригінальні торрент-кнопки

                    // Видаляємо кастомні кнопки, якщо вони вже є (щоб не дублювати)
                    targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();

                    // Створюємо велику кастомну кнопку "Онлайн" без інлайн-стилів
                    var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                        .text('Онлайн') // Текст кнопки
                        .attr('data-subtitle', 'Lampac v1.4.8') // Підзаголовок кнопки
                        .on('hover:focus', function(){ $(this).addClass('focus'); }) // Додаємо клас при фокусі
                        .on('hover:blur', function(){ $(this).removeClass('focus'); }); // Видаляємо клас при втраті фокусу

                    // Меню вибору онлайн-провайдера (спочатку приховане)
                    var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');

                    // Функція показу меню онлайн-провайдерів
                    function showOnlineMenu() {
                        if (allOnlineButtons.length === 0) {
                            Lampa.Noty.show('Нет онлайн-провайдера'); // Повідомлення, якщо провайдерів немає
                            return;
                        }
                        if (allOnlineButtons.length === 1) {
                            allOnlineButtons[0].trigger('hover:enter'); // Якщо один провайдер - одразу виконуємо
                            return;
                        }
                        var items = [];
                        for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                            var btn = allOnlineButtons[idx];
                            var iconHtml = extractProviderIcon(btn); // Витягуємо іконку провайдера
                            var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                            items.push({
                                title: btn.text().trim(), // Назва провайдера
                                icon: iconHtml,           // Іконка провайдера
                                subtitle: subtitle,       // Підзаголовок
                                idx: idx                  // Індекс для вибору
                            });
                        }
                        // Відкриваємо селектор з провайдерами
                        Lampa.Select.show({
                            title: 'Выберите онлайн-провайдера',
                            items: items,
                            onSelect: function(selected) {
                                if (selected && typeof selected.idx !== 'undefined') {
                                    allOnlineButtons[selected.idx].trigger('hover:enter'); // Виконуємо вибраного провайдера
                                }
                            },
                            onBack: function() {}
                        });
                        // Через 50мс додаємо стилі та анімації до пунктів меню
                        setTimeout(function() {
                            $('.selectbox-item').each(function(i) {
                                if (items[i]) {
                                    var iconHtml = '';
                                    if (items[i].icon) {
                                        iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                    }

                                    $(this).css({
                                        'position': 'relative',
                                        'padding-left': items[i].icon ? '56px' : '16px' // Відступ зліва під іконку або без неї
                                    }).prepend(iconHtml);

                                    // Виправляємо розмір SVG іконок для кращої видимості
                                    $(this).find('.menu__ico svg').css({
                                        'width': '100%',
                                        'height': '100%',
                                        'max-width': '32px',   // Максимальна ширина іконки
                                        'max-height': '32px'   // Максимальна висота іконки
                                    });

                                    // Підганяємо розмір SVG всередині контейнера
                                    $(this).find('.menu__ico svg > *').each(function() {
                                        // Якщо viewBox не заданий або некоректний, встановлюємо його
                                        var svg = $(this).closest('svg');
                                        if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                            // Пробуємо визначити правильний viewBox по вмісту
                                            var paths = svg.find('path');
                                            if (paths.length) {
                                                svg.attr('viewBox', '0 0 512 512'); // Задаємо великий viewBox для кращої деталізації
                                                svg.attr('preserveAspectRatio', 'xMidYMid meet'); // Зберігаємо пропорції
                                            }
                                        }
                                    });

                                    // Додаємо анімацію при наведенні на пункт меню
                                    $(this).on('hover:focus hover:hover', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%) scale(1.1)', // Збільшуємо іконку
                                            'transition': 'all 0.3s'                    // Плавний перехід
                                        });
                                    }).on('hover:blur', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%)',           // Повертаємо до початкового розміру
                                            'transition': 'all 0.3s'
                                        });
                                    });
                                }
                            });
                        }, 50);
                    }

                    // Обробник натискання на кнопку "Онлайн"
                    onlineBtn.on('hover:enter', function() {
                        if (allOnlineButtons.length === 0) {
                            Lampa.Noty.show('Нет онлайн-провайдера'); // Повідомлення, якщо провайдерів немає
                            return;
                        }
                        if (allOnlineButtons.length === 1) {
                            allOnlineButtons[0].trigger('hover:enter'); // Якщо один провайдер - одразу виконуємо
                            return;
                        }
                        var items = [];
                        for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                            var btn = allOnlineButtons[idx];
                            var iconHtml = extractProviderIcon(btn);
                            var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                            items.push({
                                title: btn.text().trim(),
                                icon: iconHtml,
                                subtitle: subtitle,
                                idx: idx
                            });
                        }
                        Lampa.Select.show({
                            title: 'Выберите онлайн-провайдера',
                            items: items,
                            onSelect: function(selected) {
                                if (selected && typeof selected.idx !== 'undefined') {
                                    allOnlineButtons[selected.idx].trigger('hover:enter');
                                }
                            },
                            onBack: function() {}
                        });
                        setTimeout(function() {
                            $('.selectbox-item').each(function(i) {
                                if (items[i]) {
                                    var iconHtml = '';
                                    if (items[i].icon) {
                                        iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                    }

                                    $(this).css({
                                        'position': 'relative',
                                        'padding-left': items[i].icon ? '56px' : '16px'
                                    }).prepend(iconHtml);

                                    $(this).find('.menu__ico svg').css({
                                        'width': '100%',
                                        'height': '100%',
                                        'max-width': '32px',
                                        'max-height': '32px'
                                    });

                                    $(this).find('.menu__ico svg > *').each(function() {
                                        var svg = $(this).closest('svg');
                                        if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                            var paths = svg.find('path');
                                            if (paths.length) {
                                                svg.attr('viewBox', '0 0 512 512');
                                                svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                            }
                                        }
                                    });

                                    $(this).on('hover:focus hover:hover', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%) scale(1.1)',
                                            'transition': 'all 0.3s'
                                        });
                                    }).on('hover:blur', function(){
                                        $(this).find('.menu__ico').css({
                                            'transform': 'translateY(-50%)',
                                            'transition': 'all 0.3s'
                                        });
                                    });
                                }
                            });
                        }, 50);
                    });

                    // Навігація по меню з пульта (обробка клавіш)
                    onlineMenu.on('keydown', function(e) {
                        if (e.key === 'Back' || e.key === 'Escape') {
                            onlineMenu.hide(); // Ховаємо меню при натисканні Back або Escape
                            onlineBtn.addClass('focus'); // Повертаємо фокус на кнопку Онлайн
                        }
                    });

                    // При втраті фокусу меню ховаємо його через 100мс, якщо немає фокусу всередині
                    onlineMenu.on('focusout', function() {
                        setTimeout(function() {
                            if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                        }, 100);
                    });

                    // Створюємо велику кастомну кнопку "Торрент" без інлайн-стилів
                    var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                        .text('Торрент') // Текст кнопки
                        .attr('data-subtitle', 'Торрент') // Підзаголовок
                        .on('hover:focus', function(){ $(this).addClass('focus'); }) // Додаємо клас при фокусі
                        .on('hover:blur', function(){ $(this).removeClass('focus'); }) // Видаляємо клас при втраті фокусу
                        .on('hover:enter', function() {
                            if (origTorrent.length) origTorrent.first().trigger('hover:enter'); // Виконуємо оригінальну торрент-кнопку
                            else Lampa.Noty.show('Нет торрент-провайдера'); // Повідомлення, якщо провайдера немає
                        });

                    // Збираємо інші кнопки, які не онлайн і не торрент, для меню "Ещё"
                    var otherButtons = [];

                    // Зберігаємо тексти онлайн-кнопок, щоб уникнути дублювання
                    var onlineButtonTexts = {};
                    allOnlineButtons.forEach(function(btn) {
                        var text = $(btn).text().trim();
                        if (text) {
                            onlineButtonTexts[text] = true;
                        }
                    });

                    // Список текстів кнопок, які потрібно приховати з меню "Ещё"
                    var hideButtonTexts = {
                        'Смотреть': true,
                        'Подписаться': true
                    };

                    // Перебираємо всі кнопки і додаємо до otherButtons, якщо вони не онлайн, не торрент, не дублікати і не в списку прихованих
                    $(allButtons).each(function() {
                        var btn = $(this);
                        var btnText = btn.text().trim();
                        if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                            !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                            otherButtons.push(btn.clone(true, true).removeClass('focus')); // Клонуємо кнопку без класу focus
                        }
                    });

                    // Створюємо кнопку "Ещё" (три крапки) без інлайн-стилів
                    var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                        .on('hover:focus', function(){ $(this).addClass('focus'); }) // Додаємо клас при фокусі
                        .on('hover:blur', function(){ $(this).removeClass('focus'); }); // Видаляємо клас при втраті фокусу

                    // Відкриття меню по натисканню кнопки "Ещё"
                    moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));

                    // Вставляємо кастомні кнопки у контейнер у потрібному порядку
                    targetContainer.prepend(moreBtn);
                    targetContainer.prepend(torrentBtn);
                    targetContainer.prepend(onlineBtn);
                    targetContainer.prepend(onlineMenu);

                    // Скидаємо інлайн-стилі для кастомних кнопок (на всяк випадок)
                    setTimeout(function() {
                        targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                            this.removeAttribute('style');
                        });
                    }, 10);

                    // Додаємо клас controller для контейнера, щоб він став контролером для навігації
                    targetContainer.addClass('controller');
                    Lampa.Controller.enable('full_start'); // Активуємо контролер full_start

                    // Через 100мс додаємо фокус на кнопку Онлайн
                    setTimeout(function() {
                        onlineBtn.addClass('focus');
                    }, 100);
                }
                // --- кінець блоку кастомних кнопок main2 ---

                // Нова функція для коректного переключення контролера
                if (needToggle) {
                    setTimeout(function() {
                        // Перевіряємо, що контролер full_start ще активний
                        if (Lampa.Controller.enabled() === 'full_start') {
                            Lampa.Controller.toggle('full_start'); // Вимикаємо контролер full_start
                        }
                    }, 100);
                }

                // Оригінальна функція (закоментована)
                /*
                if (needToggle) {
                    setTimeout(function() {
                        Lampa.Controller.toggle('full_start');
                    }, 100);
                }
                */
            }, 300);
        }
    }
});

// Спостерігач за змінами в DOM для кнопок
var buttonObserver = new MutationObserver(function(mutations) {
    // Якщо стиль кнопок не 'all' і не 'main2' - вихід
    if (settings.buttons_style_mode !== 'all' && settings.buttons_style_mode !== 'main2') return;

    var needReorganize = false; // Прапорець для реорганізації кнопок
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' &&
            (mutation.target.classList.contains('full-start-new__buttons') ||
                mutation.target.classList.contains('full-start__buttons') ||
                mutation.target.classList.contains('buttons-container'))) {
            needReorganize = true; // Якщо зміни в контейнерах кнопок - потрібно реорганізувати
        }
    });
    if (needReorganize) {
        setTimeout(function() {
            // Якщо є активна повна картка і функція організації кнопок існує - викликаємо її
            if (Lampa.FullCard && Lampa.Activity.active() && Lampa.Activity.active().activity.card) {
                if (typeof Lampa.Activity.active().activity.card.organizeButtons === 'function') {
                    Lampa.Activity.active().activity.card.organizeButtons();
                }
            }
        }, 100);
    }
});

// Запускаємо спостерігача за всіма змінами в тілі документа
buttonObserver.observe(document.body, {
    childList: true, // Слідкуємо за додаванням/видаленням дочірніх елементів
    subtree: true    // Слідкуємо за всіма нащадками
});

// Функція для застосування теми інтерфейсу
function applyTheme(theme) {
    // Видаляємо попередній стиль теми, якщо він є
    const oldStyle = document.querySelector('#interface_mod_theme');
    if (oldStyle) oldStyle.remove();

    // Якщо вибрана тема "default" (за замовчуванням)
    if (theme === 'default') {
        // Вимикаємо всі зовнішні теми (якщо вони підключені)
        document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
            el.disabled = true;
        });
        return; // Вихід, бо тема за замовчуванням не потребує додаткових стилів
    }

    // Перевіряємо, чи є зовнішня тема з відповідним id
    var externalThemeStyle = document.querySelector('#theme-style-' + theme);
    if (externalThemeStyle) {
        // Вимикаємо всі зовнішні теми
        document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
            el.disabled = true;
        });
        // Активуємо потрібну зовнішню тему
        externalThemeStyle.disabled = false;
        return; // Вихід, бо тема застосована
    }

    // Якщо зовнішньої теми немає, створюємо стиль для вбудованої теми
    const style = document.createElement('style');
    style.id = 'interface_mod_theme';

// Визначаємо CSS стилі для різних тем
const themes = {
    neon: `
        /* Задаємо фон сторінки з градієнтом від темно-синього до фіолетового */
        body { 
            background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%) !important; 
            color: #ffffff !important; /* Білий текст */
        }
        /* Стилі для активних/фокусованих елементів меню, кнопок, тегів */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #ff00ff, #00ffff) !important; /* Градієнт від рожевого до блакитного */
            color: #fff !important; /* Білий текст */
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.4) !important; /* Світіння рожевого кольору */
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important; /* Світіння тексту */
            border: none !important; /* Без обводки */
        }
        /* Обводка і тінь для активних/наведених карток */
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #ff00ff !important; /* Рожева обводка товщиною 2px */
            box-shadow: 0 0 20px #00ffff !important; /* Світіння блакитного кольору */
        }
        /* Стилі для активних/наведених дій у шапці */
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #ff00ff, #00ffff) !important; /* Градієнт */
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.3) !important; /* Світіння */
        }
        /* Стилі для фону повного старту */
        .full-start__background {
            opacity: 0.7 !important; /* Прозорість 70% */
            filter: brightness(1.2) saturate(1.3) !important; /* Збільшення яскравості і насиченості */
        }
        /* Фон і обводка для контенту налаштувань, селекторів, модалок */
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(15, 2, 33, 0.95) !important; /* Темно-фіолетовий напівпрозорий фон */
            border: 1px solid rgba(255, 0, 255, 0.1) !important; /* Легка рожева обводка */
        }
    `,
    sunset: `
        /* Фон з градієнтом від темно-фіолетового до синього */
        body { 
            background: linear-gradient(135deg, #2d1f3d 0%, #614385 50%, #516395 100%) !important; 
            color: #ffffff !important; /* Білий текст */
        }
        /* Стилі для активних/фокусованих елементів */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #ff6e7f, #bfe9ff) !important; /* Градієнт від рожевого до світло-блакитного */
            color: #2d1f3d !important; /* Темно-фіолетовий текст */
            box-shadow: 0 0 15px rgba(255, 110, 127, 0.3) !important; /* Світіння рожевого кольору */
            font-weight: bold !important; /* Жирний шрифт */
        }
        /* Обводка і тінь для активних/наведених карток */
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #ff6e7f !important; /* Рожева обводка */
            box-shadow: 0 0 15px rgba(255, 110, 127, 0.5) !important; /* Світіння */
        }
        /* Стилі для активних/наведених дій у шапці */
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #ff6e7f, #bfe9ff) !important; /* Градієнт */
            color: #2d1f3d !important; /* Темно-фіолетовий текст */
        }
        /* Фон повного старту */
        .full-start__background {
            opacity: 0.8 !important; /* Прозорість 80% */
            filter: saturate(1.2) contrast(1.1) !important; /* Збільшення насиченості і контрасту */
        }
    `,
    emerald: `
        /* Фон з градієнтом від темно-синього до бірюзового */
        body { 
            background: linear-gradient(135deg, #1a2a3a 0%, #2C5364 50%, #203A43 100%) !important; 
            color: #ffffff !important; /* Білий текст */
        }
        /* Стилі для активних/фокусованих елементів */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #43cea2, #185a9d) !important; /* Градієнт від бірюзового до темно-синього */
            color: #fff !important; /* Білий текст */
            box-shadow: 0 4px 15px rgba(67, 206, 162, 0.3) !important; /* Світіння бірюзового кольору */
            border-radius: 5px !important; /* Закруглені кути */
        }
        /* Обводка і тінь для активних/наведених карток */
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 3px solid #43cea2 !important; /* Бірюзова обводка товщиною 3px */
            box-shadow: 0 0 20px rgba(67, 206, 162, 0.4) !important; /* Світіння */
        }
        /* Стилі для активних/наведених дій у шапці */
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #43cea2, #185a9d) !important; /* Градієнт */
        }
        /* Фон повного старту */
        .full-start__background {
            opacity: 0.85 !important; /* Прозорість 85% */
            filter: brightness(1.1) saturate(1.2) !important; /* Збільшення яскравості і насиченості */
        }
        /* Фон і обводка для контенту налаштувань, селекторів, модалок */
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(26, 42, 58, 0.98) !important; /* Темно-синій напівпрозорий фон */
            border: 1px solid rgba(67, 206, 162, 0.1) !important; /* Легка бірюзова обводка */
        }
    `,
    aurora: `
        /* Фон з градієнтом від темно-синього до бірюзового */
        body { 
            background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important; 
            color: #ffffff !important; /* Білий текст */
        }
        /* Стилі для активних/фокусованих елементів */
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99) !important; /* Градієнт від рожевого до сірого і бірюзового */
            color: #fff !important; /* Білий текст */
            box-shadow: 0 0 20px rgba(170, 75, 107, 0.3) !important; /* Світіння рожевого кольору */
            transform: scale(1.02) !important; /* Збільшення елемента на 2% */
            transition: all 0.3s ease !important; /* Плавний перехід */
        }
        /* Обводка і тінь для активних/наведених карток */
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #aa4b6b !important; /* Рожева обводка */
            box-shadow: 0 0 25px rgba(170, 75, 107, 0.5) !important; /* Світіння */
        }
        /* Стилі для активних/наведених дій у шапці */
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #aa4b6b, #3b8d99) !important; /* Градієнт */
            transform: scale(1.05) !important; /* Збільшення на 5% */
        }
        /* Фон повного старту */
        .full-start__background {
            opacity: 0.75 !important; /* Прозорість 75% */
            filter: contrast(1.1) brightness(1.1) !important; /* Збільшення контрасту і яскравості */
        }
    `,
    // ... тут можуть бути інші теми
};

bywolf_mod: `
    /* Стилі для тіла сторінки */
    body { 
        background: linear-gradient(135deg, #090227 0%, #170b34 50%, #261447 100%) !important; /* Градієнт фону від темно-синього до фіолетового */
        /* Якщо змінити кут градієнта (135deg) на 90deg, градієнт буде вертикальним */
        color: #ffffff !important; /* Білий колір тексту */
        /* Якщо змінити на #000000, текст стане чорним */
    }

    /* Стилі для активних/фокусованих елементів меню та кнопок */
    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
    .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
        background: linear-gradient(to right, #fc00ff, #00dbde) !important; /* Градієнт фону з фуксії в бірюзовий */
        /* Зміна кольорів градієнта змінить відтінок підсвітки */
        color: #fff !important; /* Білий колір тексту */
        box-shadow: 0 0 30px rgba(252, 0, 255, 0.3) !important; /* Світіння навколо елемента фуксії */
        /* Збільшення розміру тіні (30px) зробить світіння більш розмитим */
        animation: cosmic-pulse 2s infinite !important; /* Анімація пульсації світіння */
    }

    /* Ключові кадри анімації пульсації */
    @keyframes cosmic-pulse {
        0% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3) !important; } /* Початкове світіння фуксії */
        50% { box-shadow: 0 0 30px rgba(0, 219, 222, 0.3) !important; } /* Максимальне світіння бірюзового */
        100% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3) !important; } /* Повернення до початкового */
        /* Зміна тривалості (2s) вплине на швидкість пульсації */
    }

    /* Стилі для карток при фокусі або наведенні */
    .card.focus .card__view::after, .card.hover .card__view::after {
        border: 2px solid #fc00ff !important; /* Рамка кольору фуксії */
        /* Зміна товщини рамки (2px) зробить її більш або менш помітною */
        box-shadow: 0 0 30px rgba(0, 219, 222, 0.5) !important; /* Світіння бірюзового навколо рамки */
    }

    /* Стилі для кнопок дій у заголовку при фокусі або наведенні */
    .head__action.focus, .head__action.hover {
        background: linear-gradient(45deg, #fc00ff, #00dbde) !important; /* Градієнт фону */
        animation: cosmic-pulse 2s infinite !important; /* Та сама анімація пульсації */
    }

    /* Стилі для фону стартового екрану */
    .full-start__background {
        opacity: 0.8 !important; /* Прозорість 80% */
        /* Зменшення opacity зробить фон більш прозорим */
        filter: saturate(1.3) contrast(1.1) !important; /* Підвищення насиченості та контрасту */
        /* Зміна saturate вплине на яскравість кольорів */
    }

    /* Стилі для вмісту налаштувань та модальних вікон */
    .settings__content, .settings-input__content, .selectbox__content, .modal__content {
        background: rgba(9, 2, 39, 0.95) !important; /* Темний напівпрозорий фон */
        /* Зміна прозорості (0.95) зробить фон більш або менш прозорим */
        border: 1px solid rgba(252, 0, 255, 0.1) !important; /* Тонка рамка фуксії з прозорістю */
        box-shadow: 0 0 30px rgba(0, 219, 222, 0.1) !important; /* Легке бірюзове світіння */
    }
`,

minimalist: `
    /* Стилі для тіла сторінки */
    body { 
        background: #121212 !important; /* Темно-сірий фон */
        /* Зміна кольору фону на світліший зробить інтерфейс світлішим */
        color: #e0e0e0 !important; /* Світло-сірий колір тексту */
    }

    /* Стилі для активних/фокусованих елементів меню та кнопок */
    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
    .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
        background: #2c2c2c !important; /* Темно-сірий фон */
        color: #ffffff !important; /* Білий текст */
        box-shadow: none !important; /* Відсутність тіні */
        border-radius: 3px !important; /* Закруглені кути */
        /* Збільшення border-radius зробить кути більш округлими */
        border-left: 3px solid #3d3d3d !important; /* Ліва рамка темно-сірого кольору */
    }

    /* Стилі для карток при фокусі або наведенні */
    .card.focus .card__view::after, .card.hover .card__view::after {
        border: 1px solid #3d3d3d !important; /* Тонка рамка */
        box-shadow: none !important; /* Відсутність тіні */
    }

    /* Стилі для кнопок дій у заголовку при фокусі або наведенні */
    .head__action.focus, .head__action.hover {
        background: #2c2c2c !important; /* Темно-сірий фон */
    }

    /* Стилі для фону стартового екрану */
    .full-start__background {
        opacity: 0.6 !important; /* Прозорість 60% */
        filter: grayscale(0.5) brightness(0.7) !important; /* Зменшення яскравості та відтінку кольору */
        /* Зміна grayscale вплине на відтінок сірого */
    }

    /* Стилі для вмісту налаштувань та модальних вікон */
    .settings__content, .settings-input__content, .selectbox__content, .modal__content {
        background: rgba(18, 18, 18, 0.95) !important; /* Темний напівпрозорий фон */
        border: 1px solid #2c2c2c !important; /* Темна рамка */
    }

    /* Стилі для розділення елементів списку */
    .selectbox-item + .selectbox-item {
        border-top: 1px solid #2c2c2c !important; /* Верхня рамка між елементами */
    }

    /* Стилі для заголовків та рейтингів карток */
    .card__title, .card__vote, .full-start__title, .full-start__rate, .full-start-new__title, .full-start-new__rate {
        color: #e0e0e0 !important; /* Світло-сірий колір тексту */
    }
`,

glow_outline: `
    /* Стилі для тіла сторінки */
    body { 
        background: #0a0a0a !important; /* Дуже темний фон */
        color: #f5f5f5 !important; /* Світлий текст */
    }

    /* Стилі для активних/фокусованих елементів меню та кнопок */
    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
    .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
        background: rgba(40, 40, 40, 0.8) !important; /* Напівпрозорий темно-сірий фон */
        color: #fff !important; /* Білий текст */
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3) !important; /* Світла обводка */
        border-radius: 3px !important; /* Закруглені кути */
        transition: all 0.3s ease !important; /* Плавна анімація змін */
        position: relative !important; /* Для псевдоелементів */
        z-index: 1 !important; /* Щоб елемент був над іншими */
    }

    /* Псевдоелементи для світіння навколо активних елементів */
    .menu__item.focus::before, .settings-folder.focus::before, .settings-param.focus::before, .selectbox-item.focus::before,
    .custom-online-btn.focus::before, .custom-torrent-btn.focus::before, .main2-more-btn.focus::before, .simple-button.focus::before {
        content: '' !important; /* Порожній контент */
        position: absolute !important; /* Абсолютне позиціювання */
        top: -2px !important; /* Відступ зверху */
        left: -2px !important; /* Відступ зліва */
        right: -2px !important; /* Відступ справа */
        bottom: -2px !important; /* Відступ знизу */
        z-index: -1 !important; /* Під елементом */
        border-radius: 5px !important; /* Закруглені кути */
        background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent) !important; /* Градієнт світіння */
        animation: glowing 1.5s linear infinite !important; /* Анімація світіння */
    }

    /* Ключові кадри анімації світіння */
    @keyframes glowing {
        0% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff !important; } /* Початкове світіння */
        50% { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff !important; } /* Максимальне світіння */
        100% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff !important; } /* Повернення */
        /* Зміна тривалості (1.5s) вплине на швидкість анімації */
    }

    /* Стилі для карток при фокусі або наведенні */
    .card.focus .card__view::after, .card.hover .card__view::after {
        border: none !important; /* Відсутність рамки */
        box-shadow: 0 0 0 2px #fff, 0 0 10px #0ff, 0 0 15px rgba(0, 255, 255, 0.5) !important; /* Світіння бірюзового */
        animation: card-glow 1.5s ease-in-out infinite alternate !important; /* Анімація світіння */
    }

    /* Ключові кадри анімації світіння картки */
    @keyframes card-glow {
        from { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff !important; }
        to { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff !important; }
    }

    /* Стилі для кнопок дій у заголовку при фокусі або наведенні */
    .head__action.focus, .head__action.hover {
        background: #292929 !important; /* Темно-сірий фон */
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.5) !important; /* Світіння */
    }

    /* Стилі для фону стартового екрану */
    .full-start__background {
        opacity: 0.7 !important; /* Прозорість 70% */
        filter: brightness(0.8) contrast(1.2) !important; /* Зменшення яскравості, збільшення контрасту */
    }
`,

menu_lines: `
    /* Стилі для тіла сторінки */
    body { 
        background: #121212 !important; /* Темно-сірий фон */
        color: #f5f5f5 !important; /* Світлий текст */
    }

    /* Стилі для елементів меню */
    .menu__item {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; /* Тонка світла лінія внизу */
        margin-bottom: 5px !important; /* Відступ знизу */
        padding-bottom: 5px !important; /* Відступ всередині знизу */
        /* Зміна товщини border-bottom зробить лінію більш помітною */
    }

    /* Стилі для активних/фокусованих елементів меню та кнопок */
    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
    .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
        background: linear-gradient(to right, #303030 0%, #404040 100%) !important; /* Градієнт темно-сірого */
        color: #fff !important; /* Білий текст */
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3) !important; /* Тінь знизу */
        border-left: 3px solid #808080 !important; /* Сіра ліва рамка */
        border-bottom: 1px solid #808080 !important; /* Сіра нижня рамка */
    }

    /* Стилі для папок налаштувань */
    .settings-folder, .settings-param {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; /* Тонка світла лінія */
        margin-bottom: 5px !important; /* Відступ знизу */
        padding-bottom: 5px !important; /* Відступ всередині знизу */
    }

    /* Відсутність верхньої рамки між папками */
    .settings-folder + .settings-folder {
        border-top: none !important;
    }

    /* Стилі для карток при фокусі або наведенні */
    .card.focus .card__view::after, .card.hover .card__view::after {
        border: 2px solid #808080 !important; /* Сіра рамка */
        box-shadow: 0 0 10px rgba(128, 128, 128, 0.5) !important; /* Світіння сірої рамки */
    }

    /* Стилі для кнопок дій у заголовку при фокусі або наведенні */
    .head__action.focus, .head__action.hover {
        background: #404040 !important; /* Темно-сірий фон */
        border-left: 3px solid #808080 !important; /* Сіра ліва рамка */
    }

    /* Стилі для фону стартового екрану */
    .full-start__background {
        opacity: 0.7 !important; /* Прозорість 70% */
        filter: brightness(0.8) !important; /* Зменшення яскравості */
    }

    /* Стилі для списку меню */
    .menu__list {
        border-right: 1px solid rgba(255, 255, 255, 0.1) !important; /* Тонка світла права рамка */
    }

    /* Розділення елементів списку */
    .selectbox-item + .selectbox-item {
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important; /* Верхня рамка між елементами */
    }
`,

dark_emerald: `
    /* Стилі для тіла сторінки */
    body { 
        background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important; /* Градієнт темно-зелених відтінків */
        color: #dfdfdf !important; /* Світло-сірий текст */
    }

    /* Закруглення кутів для меню, папок, кнопок */
    .menu__item, .settings-folder, .settings-param, .selectbox-item, .full-start__button, .full-descr__tag, .player-panel .button,
    .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button, .menu__version {
        border-radius: 1.0em !important; /* Дуже округлі кути */
        /* Зменшення border-radius зробить кути більш гострими */
    }

    /* Стилі для активних/фокусованих елементів меню та кнопок */
    .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
    .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
        background: linear-gradient(to right, #1a594d, #0e3652) !important; /* Градієнт темно-зелених відтінків */
        color: #fff !important; /* Білий текст */
        box-shadow: 0 2px 8px rgba(26, 89, 77, 0.2) !important; /* Легке зелене світіння */
        border-radius: 1.0em !important; /* Закруглені кути */
    }

    /* Закруглення кутів для карток */
    .card, .card.focus, .card.hover {
        border-radius: 1.0em !important;
    }

    /* Стилі для карток при фокусі або наведенні */
    .card.focus .card__view::after, .card.hover .card__view::after {
        border: 2px solid #1a594d !important; /* Темно-зелена рамка */
        box-shadow: 0 0 10px rgba(26, 89, 77, 0.3) !important; /* Світіння */
        border-radius: 1.0em !important; /* Закруглені кути */
    }

    /* Закруглення кутів для кнопок дій у заголовку */
    .head__action, .head__action.focus, .head__action.hover {
        border-radius: 1.0em !important;
    }

    /* Стилі для кнопок дій у заголовку при фокусі або наведенні */
    .head__action.focus, .head__action.hover {
        background: linear-gradient(45deg, #1a594d, #0e3652) !important; /* Градієнт темно-зелених відтінків */
    }

    /* Стилі для фону стартового екрану */
    .full-start__background {
        opacity: 0.75 !important; /* Прозорість 75% */
        filter: brightness(0.9) saturate(1.1) !important; /* Злегка підвищена яскравість та насиченість */
    }

    /* Стилі для вмісту налаштувань та модальних вікон */
    .settings__content, .settings-input__content, .selectbox__content, .modal__content {
        background: rgba(12, 22, 25, 0.97) !important; /* Темний напівпрозорий фон */
        border: 1px solid rgba(26, 89, 77, 0.1) !important; /* Тонка зелена рамка */
        border-radius: 1.0em !important; /* Закруглені кути */
    }
`
};

// Додаємо стилі в документ
style.textContent = themes[theme] || '';
document.head.appendChild(style);
}

// Функція для завантаження зовнішніх тем
function loadExternalThemes(callback) {
    var themeUrl = 'https://bywolf88.github.io/lampa-plugins/theme.json'; // URL з темами
    var xhr = new XMLHttpRequest();
    xhr.open('GET', themeUrl, true);
    xhr.timeout = 5000; // Таймаут 5 секунд
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var externalThemes = JSON.parse(xhr.responseText);
                if (externalThemes && typeof externalThemes === 'object') {
                    callback(null, externalThemes); // Повертаємо теми
                } else {
                    callback('Invalid themes data format', null); // Некоректний формат
                }
            } catch (e) {
                callback('Error parsing themes data: ' + e.message, null); // Помилка парсингу JSON
            }
        } else {
            callback('HTTP Error: ' + xhr.status, null); // HTTP помилка
        }
    };
    xhr.onerror = function() {
        callback('Network error', null); // Помилка мережі
    };
    xhr.ontimeout = function() {
        callback('Request timeout', null); // Таймаут запиту
    };
    xhr.send();
}

// Функція для стилізації заголовків підбірок
function stylizeCollectionTitles() {
    if (!settings.stylize_titles) return; // Якщо опція вимкнена - вихід

    // Видаляємо попередні стилі, якщо вони є
    var oldStyle = document.getElementById('stylized-titles-css');
    if (oldStyle) oldStyle.remove();

    // Створюємо новий елемент стилю
    var styleElement = document.createElement('style');
    styleElement.id = 'stylized-titles-css';

    // CSS для стилізації заголовків
    var css = `
        /* Стиль заголовків підбірок */
        .items-line__title {
            font-size: 2.4em; /* Розмір шрифту заголовка */
            /* Збільшення font-size зробить заголовок більшим */
            display: inline-block; /* Щоб можна було застосувати фон */
            background: linear-gradient(45deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%); /* Градієнт тексту */
            background-size: 200% auto; /* Розмір фону для анімації */
            background-clip: text; /* Обрізка фону по тексту */
            -webkit-background-clip: text; /* Підтримка для WebKit */
            -webkit-text-fill-color: transparent; /* Прозорий колір тексту для показу градієнта */
            animation: gradient-text 3s ease infinite; /* Анімація градієнта */
            font-weight: 800; /* Жирний шрифт */
            text-shadow: 0 1px 3px rgba(0,0,0,0.2); /* Тінь тексту для кращої читабельності */
            position: relative; /* Для псевдоелементів */
            padding: 0 5px; /* Відступи з боків */
            z-index: 1; /* Щоб бути над псевдоелементами */
        }

        /* Лінія під заголовком */
        .items-line__title::before {
            content: ''; /* Порожній контент */
            position: absolute; /* Абсолютне позиціювання */
            bottom: 0; /* Внизу */
            left: 0; /* Зліва */
            width: 100%; /* Повна ширина */
            height: 2px; /* Висота лінії */
            background: linear-gradient(to right, transparent, #784BA0, transparent); /* Градієнт лінії */
            z-index: -1; /* Під заголовком */
            transform: scaleX(0); /* Початково схована */
            transform-origin: bottom right; /* Точка трансформації */
            transition: transform 0.5s ease-out; /* Плавна анімація */
            animation: line-animation 3s ease infinite; /* Анімація лінії */
        }

        /* Тло навколо заголовка */
        .items-line__title::after {
            content: ''; /* Порожній контент */
            position: absolute; /* Абсолютне позиціювання */
            top: -5px; /* Відступ зверху */
            left: -5px; /* Відступ зліва */
            right: -5px; /* Відступ справа */
            bottom: -5px; /* Відступ знизу */
            background: rgba(0,0,0,0.05); /* Світло-сірий напівпрозорий фон */
            border-radius: 6px; /* Закруглені кути */
            z-index: -2; /* Під заголовком і лінією */
            opacity: 0; /* Початково прозорий */
            transition: opacity 0.3s ease; /* Плавна зміна прозорості */
        }

        /* При наведенні на рядок з підбіркою */
        .items-line:hover .items-line__title::before {
            transform: scaleX(1); /* Показати лінію */
            transform-origin: bottom left; /* Точка трансформації */
        }

        .items-line:hover .items-line__title::after {
            opacity: 1; /* Показати тло */
        }

        /* Анімація градієнта тексту */
        @keyframes gradient-text {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
            /* Зміна background-position створює рух градієнта */
        }

        /* Анімація лінії під заголовком */
        @keyframes line-animation {
            0% { transform: scaleX(0.2); opacity: 0.5; }
            50% { transform: scaleX(1); opacity: 1; }
            100% { transform: scaleX(0.2); opacity: 0.5; }
            /* Лінія пульсує та змінює прозорість */
        }
    `;

    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    // Спостерігач за додаванням нових заголовків у DOM
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Перевірка, що це елемент
                        var titles = node.querySelectorAll('.items-line__title');
                        if (titles.length) {
                            // Можна додати додаткові дії з новими заголовками
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true, // Спостерігати за додаванням/видаленням дочірніх елементів
        subtree: true // Спостерігати за всіма нащадками
    });
}

// Функція для збільшення інформації у деталях
function enhanceDetailedInfo() {
    if (!settings.enhance_detailed_info) return; // Якщо опція вимкнена - вихід

    // Видаляємо попередні стилі, якщо вони є
    var oldStyle = document.getElementById('enhanced-info-css');
    if (oldStyle) oldStyle.remove();

    // Створюємо новий стиль для збільшеної інформації
    var enhancedInfoStyle = document.createElement('style');
    enhancedInfoStyle.id = 'enhanced-info-css';
    enhancedInfoStyle.textContent = `
         /* Збільшення розміру шрифту для деталей */
         .full-start-new__details {
             font-size: 1.9em; /* Збільшений розмір тексту */
             /* Зменшення font-size зробить текст меншим */
         }
         
         .full-start-new__details > * {
             font-size: 1.9em; /* Збільшений розмір для дочірніх елементів */
             margin: 0.1em; /* Невеликий відступ */
         }

         /* Збільшення розміру кнопок */
         .full-start-new__buttons, .full-start__buttons {
             font-size: 1.4em !important;
         }
         
         .full-start__button {
             font-size: 1.8em;
         }

         /* Збільшення розміру рядка рейтингу */
         .full-start-new__rate-line {
             font-size: 1.5em;
             margin-bottom: 1em;
         }

         /* Приховуємо постер */
         .full-start-new__poster {
             display: none;
         }
         
         /* Приховуємо ліву колонку */
         .full-start-new__left {
             display: none;
         }
         
         /* Права колонка займає всю ширину */
         .full-start-new__right {
             width: 100%;
         }
         
         /* Збільшення розміру тексту опису */
         .full-descr__text {
             font-size: 1.8em;
             line-height: 1.4;
             font-weight: 600;
             width: 100%;
         }
         
         /* Стилі для інформаційних рядків */
         .info-unified-line {
             display: flex;
             flex-wrap: wrap;
             align-items: center;
             gap: 0.5em; /* Відстань між елементами */
             margin-bottom: 0.5em;
         }
         
         /* Стилі для інформаційних елементів */
         .info-unified-item {
             border-radius: 0.3em; /* Закруглені кути */
             border: 0px; /* Без рамки */
             font-size: 1.3em;
             padding: 0.2em 0.6em; /* Відступи */
             display: inline-block;
             white-space: nowrap; /* Запобігає переносу */
             line-height: 1.2em;
         }
         
         /* Збільшення заголовку фільму */
         .full-start-new__title {
             font-size: 2.2em !important;
         }
         
         /* Збільшення розміру слогану */
         .full-start-new__tagline {
             font-size: 1.4em !important;
         }
         
         /* Збільшення опису */
         .full-start-new__desc {
             font-size: 1.6em !important;
             margin-top: 1em !important;
         }
         
         /* Збільшення шрифту інформаційної панелі */
         .full-start-new__info {
             font-size: 1.4em !important;
         }
         
         /* Адаптивність для мобільних пристроїв */
         @media (max-width: 768px) {
             .full-start-new__title {
                 font-size: 1.8em !important;
             }
             
             .full-start-new__desc {
                 font-size: 1.4em !important;
             }
             
             .full-start-new__details {
                 font-size: 1.5em;
             }
             
             .full-start-new__details > * {
                 font-size: 1.5em;
                 margin: 0.3em;
             }
             
             .full-descr__text {
                 font-size: 1.5em;
             }
         }
    `;
    document.head.appendChild(enhancedInfoStyle);
}

// Додаємо обробник події для об'єднання інформації в один рядок
Lampa.Listener.follow('full', function(data) {
    // Перевіряємо, чи тип події 'complite' і чи увімкнено покращену детальну інформацію
    if (data.type === 'complite' && settings.enhance_detailed_info) {
        // Затримка 300 мс для того, щоб DOM встиг оновитись
        setTimeout(function() {
            // Знаходимо контейнер з деталями (інформація про сезон, серії, тривалість)
            var details = $('.full-start-new__details');
            if (!details.length) return; // Якщо контейнер не знайдено, виходимо
            
            // Ініціалізуємо змінні для збереження тексту про сезони, серії та тривалість
            var seasonText = '';
            var episodeText = '';
            var durationText = '';
            
            // Перебираємо всі <span> всередині details, щоб знайти потрібну інформацію
            details.find('span').each(function() {
                var text = $(this).text().trim();
                
                // Шукаємо текст, що містить інформацію про сезони (різні варіанти написання)
                if (text.match(/Сезон(?:и)?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сезон(?:а|ів)?/i)) {
                    seasonText = text;
                } 
                // Шукаємо текст, що містить інформацію про серії (різні варіанти написання)
                else if (text.match(/Серії?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сері(?:я|ї|й)/i)) {
                    episodeText = text;
                } 
                // Шукаємо текст, що містить інформацію про тривалість (слово "Тривалість" або символ приблизно "≈")
                else if (text.match(/Тривалість/i) || text.indexOf('≈') !== -1) {
                    durationText = text;
                }
            });
            
            // Якщо знайдено принаймні дві з трьох інформацій, об'єднуємо їх в один рядок
            if ((seasonText && episodeText) || (seasonText && durationText) || (episodeText && durationText)) {
                // Створюємо новий контейнер для об'єднаного рядка інформації
                var unifiedLine = $('<div class="info-unified-line"></div>');
                
                // Додаємо інформацію про сезони, якщо вона є
                if (seasonText) {
                    var seasonItem = $('<span class="info-unified-item"></span>')
                        .text(seasonText)
                        .css({
                            // Колір фону: напівпрозорий синій
                            // Зміна значення 'background-color' змінить колір підкладки, наприклад:
                            // 'rgba(231, 76, 60, 0.8)' - червоний фон
                            'background-color': 'rgba(52, 152, 219, 0.8)',
                            // Колір тексту: білий
                            // Зміна 'color' на інший колір, наприклад 'black', зробить текст темним
                            'color': 'white'
                        });
                    unifiedLine.append(seasonItem);
                }
                
                // Додаємо інформацію про серії, якщо вона є
                if (episodeText) {
                    var episodeItem = $('<span class="info-unified-item"></span>')
                        .text(episodeText)
                        .css({
                            // Колір фону: напівпрозорий зелений
                            // Зміна 'background-color' на інший колір, наприклад 'rgba(241, 196, 15, 0.8)' - жовтий фон
                            'background-color': 'rgba(46, 204, 113, 0.8)',
                            // Колір тексту: білий
                            'color': 'white'
                        });
                    unifiedLine.append(episodeItem);
                }
                
                // Додаємо інформацію про тривалість, якщо вона є
                if (durationText) {
                    var durationItem = $('<span class="info-unified-item"></span>')
                        .text(durationText)
                        .css({
                            // Колір фону: напівпрозорий синій (такий самий, як для сезону)
                            'background-color': 'rgba(52, 152, 219, 0.8)',
                            // Колір тексту: білий
                            'color': 'white'
                        });
                    unifiedLine.append(durationItem);
                }
                
                // Видаляємо старі елементи з цією інформацією, щоб не дублювати
                details.find('span').each(function() {
                    var text = $(this).text().trim();
                    if (text === seasonText || text === episodeText || text === durationText) {
                        $(this).remove();
                    }
                });
                
                // Додаємо об'єднаний рядок на початок контейнера з деталями
                details.prepend(unifiedLine);
            }
        }, 300); // Затримка 300 мс
    }
});

// Ініціалізація плагіна
function startPlugin() {
    // Завантажуємо теми та додаємо налаштування користувача
    addSettings();
    // Змінюємо підписи типів фільмів
    changeMovieTypeLabels();
    // Додаємо нову панель інформації
    newInfoPanel();
    // Якщо увімкнено кольорові рейтинги, оновлюємо їх та налаштовуємо спостерігачі
    if (settings.colored_ratings) {
        updateVoteColors();
        setupVoteColorsObserver();
        setupVoteColorsForDetailPage();
    }
    // Застосовуємо кольорове виділення статусу серіалів
    colorizeSeriesStatus();
    // Застосовуємо кольорове виділення вікового рейтингу
    colorizeAgeRating();
    // Якщо стиль кнопок 'all' або 'main2', показуємо всі кнопки
    if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
        showAllButtons();
    }
    
    // Якщо вибрана тема, застосовуємо її
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    // Якщо увімкнено стилізацію заголовків, застосовуємо її
    if (settings.stylize_titles) {
        stylizeCollectionTitles();
    }
    
    // Якщо увімкнено покращену детальну інформацію, застосовуємо її
    if (settings.enhance_detailed_info) {
        enhanceDetailedInfo();
    }
}

// Запуск плагіна після готовності додатку
if (window.appready) {
    // Якщо додаток вже готовий, запускаємо плагін одразу
    startPlugin();
} else {
    // Інакше чекаємо подію 'ready' від додатку
    Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
            startPlugin();
        }
    });
}

})();
