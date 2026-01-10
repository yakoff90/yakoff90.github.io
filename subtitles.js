// Plugin: OpenSubtitles для Tizen Samsung TV
// Субтитри працюють тільки якщо у фільма є imdb. Додана локалізація і завантаження українських.
// УКРАЇНСЬКІ СУБТИТРИ ЗАВЖДИ ПЕРШІ - ВСІ В КОНЦІ СПИСКУ
(function() {
    'use strict';

    // Конфігурація
    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};
    const RETRY_DELAY = 1000;
    const MAX_RETRIES = 3;

    // Функція для безпечного логування
    function log(message, data) {
        try {
            if (console && console.log) {
                console.log('[OS Subs Tizen]', message, data || '');
            }
        } catch (e) {
            // Ігноруємо помилки логування
        }
    }

    // Функція для отримання мови інтерфейсу
    function getInterfaceLang() {
        try {
            // Для Tizen/WebOS
            var systemLang = (navigator.language || 'en').substring(0, 2).toLowerCase();
            
            if (systemLang === 'uk') {
                return 'uk';
            } else if (systemLang === 'ru') {
                return 'ru';
            } else {
                return 'en';
            }
        } catch (e) {
            return 'en';
        }
    }

    // Лейбли мов
    var LANG_LABELS = {
        eng: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        ukr: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        rus: { uk: 'Російські', ru: 'Русские', en: 'Russian' },
        spa: { uk: 'Іспанські', ru: 'Испанские', en: 'Spanish' },
        fra: { uk: 'Французькі', ru: 'Французские', en: 'French' },
        ger: { uk: 'Німецькі', ru: 'Немецкие', en: 'German' }
    };

    // Пріоритет мов для сортування після українських
    var LANG_PRIORITY_AFTER_UKRAINIAN = ['eng', 'rus', 'spa', 'fra', 'ger'];

    // Функція для отримання субтитрів з кешуванням
    function fetchSubs(imdb, season, episode, retryCount) {
        if (retryCount === undefined) retryCount = 0;
        
        var key = imdb + '_' + (season || 0) + '_' + (episode || 0);
        
        // Перевірка кешу
        if (cache[key]) {
            log('Використовую кеш для', key);
            return Promise.resolve(cache[key]);
        }

        try {
            var url;
            if (season && episode) {
                url = OSV3 + 'subtitles/series/' + imdb + ':' + season + ':' + episode + '.json';
            } else {
                url = OSV3 + 'subtitles/movie/' + imdb + '.json';
            }

            log('Запит субтитрів', url);
            
            return fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                var subtitles = data.subtitles || [];
                
                // Кешування результатів
                cache[key] = subtitles;
                
                // Автоматична очистка кешу через 1 годину
                setTimeout(function() {
                    delete cache[key];
                }, 3600000);
                
                log('Отримано субтитрів', subtitles.length);
                return subtitles;
            })
            .catch(function(error) {
                log('Помилка отримання субтитрів', error.message);
                
                // Повторна спроба
                if (retryCount < MAX_RETRIES) {
                    log('Повторна спроба ' + (retryCount + 1) + '/' + MAX_RETRIES);
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(fetchSubs(imdb, season, episode, retryCount + 1));
                        }, RETRY_DELAY * (retryCount + 1));
                    });
                }
                
                return [];
            });
            
        } catch (error) {
            log('Помилка в fetchSubs', error);
            return Promise.resolve([]);
        }
    }

    // Функція для групування та сортування субтитрів
    function groupAndSortSubtitles(allSubtitles, interfaceLang) {
        if (!allSubtitles || allSubtitles.length === 0) return [];
        
        // Групуємо українські та інші субтитри
        var ukrainianSubs = [];
        var otherSubs = [];
        
        allSubtitles.forEach(function(sub) {
            if (sub.url && LANG_LABELS[sub.lang]) {
                var isUkrainian = sub.lang === 'ukr';
                
                var formattedSub = {
                    lang: sub.lang,
                    url: sub.url,
                    label: isUkrainian ? 
                        '🇺🇦 ' + (LANG_LABELS[sub.lang][interfaceLang] || LANG_LABELS[sub.lang].en) :
                        (LANG_LABELS[sub.lang][interfaceLang] || LANG_LABELS[sub.lang].en),
                    rating: sub.rating || 0,
                    isUkrainian: isUkrainian
                };
                
                if (isUkrainian) {
                    ukrainianSubs.push(formattedSub);
                } else {
                    otherSubs.push(formattedSub);
                }
            }
        });
        
        log('Знайдено українських субтитрів', ukrainianSubs.length);
        log('Знайдено інших субтитрів', otherSubs.length);
        
        // Сортуємо українські субтитри за рейтингом (спадання)
        ukrainianSubs.sort(function(a, b) {
            return b.rating - a.rating;
        });
        
        // Сортуємо інші субтитри за пріоритетом мови
        otherSubs.sort(function(a, b) {
            var aIndex = LANG_PRIORITY_AFTER_UKRAINIAN.indexOf(a.lang);
            var bIndex = LANG_PRIORITY_AFTER_UKRAINIAN.indexOf(b.lang);
            
            // Якщо мова не в пріоритеті - ставимо в кінець
            if (aIndex === -1 && bIndex === -1) return b.rating - a.rating;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            
            // Спершу за пріоритетом мови
            if (aIndex !== bIndex) {
                return aIndex - bIndex;
            }
            
            // Якщо одна мова - за рейтингом
            return b.rating - a.rating;
        });
        
        // Об'єднуємо: спочатку всі українські, потім всі інші
        return ukrainianSubs.concat(otherSubs);
    }

    // Основна функція налаштування субтитрів
    function setupSubs() {
        try {
            log('Запуск налаштування субтитрів (УКРАЇНСЬКІ НА ПОЧАТКУ)');
            
            // Перевірка наявності необхідних об'єктів
            if (typeof Lampa === 'undefined') {
                log('Lampa не знайдено');
                return;
            }

            var activity = Lampa.Activity ? Lampa.Activity.active ? Lampa.Activity.active() : null : null;
            var playdata = Lampa.Player ? Lampa.Player.playdata ? Lampa.Player.playdata() : null : null;
            var movie = activity ? activity.movie : null;

            if (!activity || !playdata || !movie) {
                log('Відсутні дані про відтворення');
                return;
            }

            // Перевірка IMDB ID
            var imdb = movie.imdb_id;
            if (!imdb || imdb.length < 9) {
                log('Невірний або відсутній IMDB ID', imdb);
                return;
            }

            // Визначення типу контенту
            var isSeries = !!movie.first_air_date;
            var season = isSeries ? playdata.season : undefined;
            var episode = isSeries ? playdata.episode : undefined;

            log('Інформація', {
                imdb: imdb,
                isSeries: isSeries,
                season: season,
                episode: episode,
                title: movie.title || movie.name
            });

            // Отримання мови інтерфейсу
            var interfaceLang = getInterfaceLang();
            
            log('Обрана мова інтерфейсу', interfaceLang);

            // Отримання субтитрів
            fetchSubs(imdb, season, episode)
                .then(function(osSubs) {
                    // Групуємо та сортуємо всі субтитри
                    var allFormattedSubs = groupAndSortSubtitles(osSubs, interfaceLang);

                    log('Всього відформатованих субтитрів', allFormattedSubs.length);

                    // Отримання поточних субтитрів (якщо є)
                    var existingSubs = [];
                    if (Array.isArray(playdata.subtitles)) {
                        existingSubs = playdata.subtitles.map(function(s) {
                            var isUkrainian = (s.lang || '') === 'ukr';
                            return {
                                lang: s.lang || '',
                                url: s.url,
                                label: isUkrainian ? '🇺🇦 ' + (s.label || 'Українські') : (s.label || ''),
                                rating: 0,
                                isUkrainian: isUkrainian,
                                isExisting: true
                            };
                        });
                    }

                    // Об'єднуємо нові субтитри з існуючими
                    var finalSubs = [];
                    
                    // Спочатку додаємо всі існуючі субтитри
                    existingSubs.forEach(function(existing) {
                        if (!finalSubs.find(function(s) { return s.url === existing.url; })) {
                            finalSubs.push(existing);
                        }
                    });
                    
                    // Потім додаємо всі нові субтитри
                    allFormattedSubs.forEach(function(newSub) {
                        if (!finalSubs.find(function(s) { return s.url === newSub.url; })) {
                            finalSubs.push(newSub);
                        }
                    });

                    // Тепер сортуємо фінальний список: всі українські спочатку
                    finalSubs.sort(function(a, b) {
                        // Українські завжди перші
                        if (a.isUkrainian && !b.isUkrainian) return -1;
                        if (!a.isUkrainian && b.isUkrainian) return 1;
                        
                        // Якщо обидва українські - за рейтингом
                        if (a.isUkrainian && b.isUkrainian) {
                            return b.rating - a.rating;
                        }
                        
                        // Якщо обидва не українські - за пріоритетом мови
                        var aIndex = LANG_PRIORITY_AFTER_UKRAINIAN.indexOf(a.lang);
                        var bIndex = LANG_PRIORITY_AFTER_UKRAINIAN.indexOf(b.lang);
                        
                        if (aIndex === -1 && bIndex === -1) return 0;
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        
                        return aIndex - bIndex;
                    });

                    if (finalSubs.length === 0) {
                        log('Субтитри не знайдено');
                        return;
                    }

                    // Перевіряємо позначку прапорця для всіх українських
                    finalSubs.forEach(function(sub, index) {
                        if (sub.isUkrainian && !sub.label.includes('🇺🇦')) {
                            log('Додаю прапорець для українських субтитрів', { index: index, lang: sub.lang });
                            sub.label = '🇺🇦 ' + sub.label.replace('🇺🇦 ', '');
                        }
                    });

                    // Логуємо результат
                    var ukrainianCount = finalSubs.filter(function(s) { return s.isUkrainian; }).length;
                    log('Фінальний список субтитрів', { 
                        всього: finalSubs.length,
                        українських: ukrainianCount,
                        список: finalSubs.map(function(s, i) {
                            return i + '. ' + s.label + ' (' + s.lang + ')' + (s.isUkrainian ? ' 🇺🇦' : '');
                        })
                    });

                    // Визначення субтитрів за замовчуванням
                    var defaultIndex = 0;
                    var ukrainianIndex = finalSubs.findIndex(function(s) { return s.isUkrainian; });
                    
                    if (ukrainianIndex !== -1) {
                        defaultIndex = ukrainianIndex;
                        log('Вибір українських субтитрів за замовчуванням', { 
                            index: defaultIndex,
                            label: finalSubs[defaultIndex].label 
                        });
                    } else {
                        log('Українських субтитрів немає, вибір перших доступних', { 
                            index: defaultIndex,
                            label: finalSubs[defaultIndex].label 
                        });
                    }

                    // Встановлення субтитрів
                    if (Lampa.Player && Lampa.Player.subtitles) {
                        log('Встановлення субтитрів в плеєр', { 
                            count: finalSubs.length, 
                            defaultIndex: defaultIndex
                        });
                        
                        // Невелика затримка для стабілізації плеєра
                        setTimeout(function() {
                            try {
                                // Видаляємо тимчасові поля перед передачею в плеєр
                                var cleanSubs = finalSubs.map(function(s) {
                                    return {
                                        lang: s.lang,
                                        url: s.url,
                                        label: s.label,
                                        rating: s.rating
                                    };
                                });
                                
                                Lampa.Player.subtitles(cleanSubs, defaultIndex);
                                log('Субтитри успішно встановлені');
                            } catch (e) {
                                log('Помилка встановлення субтитрів', e);
                            }
                        }, 100);
                    }
                })
                .catch(function(error) {
                    log('Помилка в обробці субтитрів', error);
                });
                
        } catch (error) {
            log('Критична помилка в setupSubs', error);
        }
    }

    // Ініціалізація плагіна
    function initializePlugin() {
        log('Ініціалізація плагіна OpenSubtitles для Tizen (УСІ УКРАЇНСЬКІ НА ПОЧАТКУ)');
        
        // Перевірка наявності необхідних API
        if (typeof Lampa === 'undefined') {
            log('Помилка: Lampa не знайдено');
            return false;
        }

        if (!Lampa.Player || !Lampa.Player.listener) {
            log('Помилка: Player API не доступне');
            return false;
        }

        // Слідкування за подіями відтворення
        try {
            // Обробка старту відтворення
            Lampa.Player.listener.follow('start', function() {
                log('Подія start викликана');
                // Затримка для стабілізації плеєра
                setTimeout(setupSubs, 800);
            });

            // Додаткова обробка для зміни епізодів у серіалах
            Lampa.Player.listener.follow('episode', function() {
                log('Подія episode викликана');
                setTimeout(setupSubs, 1000);
            });

            // Оновлення при зміні якості
            Lampa.Player.listener.follow('quality', function() {
                log('Подія quality викликана');
                setTimeout(setupSubs, 500);
            });

            log('Плагін успішно ініціалізовано (Всі українські субтитри на початку)');
            return true;
            
        } catch (error) {
            log('Помилка ініціалізації плагіна', error);
            return false;
        }
    }

    // Запуск ініціалізації
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlugin);
    } else {
        // Якщо документ вже завантажений
        setTimeout(initializePlugin, 2000);
    }

    // Експорт для відладки
    if (typeof window !== 'undefined') {
        window.OpenSubtitlesPlugin = {
            version: '2.2.0',
            description: 'УСІ УКРАЇНСЬКІ СУБТИТРИ НА ПОЧАТКУ СПИСКУ',
            setupSubs: setupSubs,
            fetchSubs: fetchSubs,
            getInterfaceLang: getInterfaceLang,
            initializePlugin: initializePlugin,
            groupAndSortSubtitles: groupAndSortSubtitles
        };
    }

})();
