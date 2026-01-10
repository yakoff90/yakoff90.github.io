// Plugin: OpenSubtitles для Tizen Samsung TV
// Субтитри працюють тільки якщо у фільма є imdb. Додана локалізація і завантаження українських.
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

    // Пріоритети мов
    var LANG_PRIORITY = {
        uk: ['ukr', 'eng', 'rus', 'spa', 'fra', 'ger'],
        ru: ['rus', 'eng', 'ukr', 'spa', 'fra', 'ger'],
        en: ['eng', 'ukr', 'rus', 'spa', 'fra', 'ger']
    };

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

    // Основна функція налаштування субтитрів
    function setupSubs() {
        try {
            log('Запуск налаштування субтитрів');
            
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
            var priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;
            
            log('Обрана мова інтерфейсу', interfaceLang);

            // Отримання субтитрів
            fetchSubs(imdb, season, episode)
                .then(function(osSubs) {
                    // Фільтрація та форматування субтитрів
                    var subs = osSubs
                        .filter(function(s) {
                            return s.url && LANG_LABELS[s.lang];
                        })
                        .map(function(s) {
                            return {
                                lang: s.lang,
                                url: s.url,
                                label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en,
                                rating: s.rating || 0
                            };
                        });

                    log('Знайдено субтитрів після фільтрації', subs.length);

                    // Отримання поточних субтитрів
                    var current = Array.isArray(playdata.subtitles) 
                        ? playdata.subtitles.map(function(s) {
                            return {
                                lang: s.lang || '',
                                url: s.url,
                                label: s.label || '',
                                rating: 0
                            };
                        })
                        : [];

                    // Додавання нових субтитрів
                    subs.forEach(function(newSub) {
                        var exists = current.find(function(existing) {
                            return existing.url === newSub.url;
                        });
                        
                        if (!exists) {
                            current.push(newSub);
                        }
                    });

                    // Сортування за пріоритетом мов
                    current.sort(function(a, b) {
                        var aIndex = priority.indexOf(a.lang);
                        var bIndex = priority.indexOf(b.lang);
                        
                        // Якщо мова не в пріоритеті - ставимо в кінець
                        if (aIndex === -1 && bIndex === -1) return b.rating - a.rating;
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        
                        return aIndex - bIndex;
                    });

                    if (current.length === 0) {
                        log('Субтитри не знайдено');
                        return;
                    }

                    log('Доступні субтитри', current.map(function(s) {
                        return s.label + ' (' + s.lang + ')';
                    }));

                    // Визначення субтитрів за замовчуванням
                    var defaultIndex = current.findIndex(function(s) {
                        return s.lang === priority[0];
                    });
                    
                    if (defaultIndex === -1 && current.length > 0) {
                        defaultIndex = 0;
                    }

                    // Встановлення субтитрів
                    if (Lampa.Player && Lampa.Player.subtitles) {
                        log('Встановлюю субтитри', { 
                            count: current.length, 
                            defaultIndex: defaultIndex,
                            defaultLang: current[defaultIndex] ? current[defaultIndex].lang : 'none'
                        });
                        
                        // Невелика затримка для стабілізації плеєра
                        setTimeout(function() {
                            try {
                                Lampa.Player.subtitles(current, defaultIndex);
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
        log('Ініціалізація плагіна OpenSubtitles для Tizen');
        
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

            log('Плагін успішно ініціалізовано');
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
            version: '2.0.0',
            setupSubs: setupSubs,
            fetchSubs: fetchSubs,
            getInterfaceLang: getInterfaceLang,
            initializePlugin: initializePlugin
        };
    }

})();
