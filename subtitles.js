// Plugin: OpenSubtitles для Tizen Samsung TV з альтернативними джерелами
// Покращений пошук українських субтитрів
(function() {
    'use strict';

    // Конфігурація - КІЛЬКА ДЖЕРЕЛ СУБТИТРІВ
    var SOURCES = [
        {
            name: 'OpenSubtitles-v3',
            url: 'https://opensubtitles-v3.strem.io/',
            priority: 1
        },
        {
            name: 'OpenSubtitles-API',
            url: 'https://api.opensubtitles.com/api/v1/',
            priority: 2
        },
        {
            name: 'SubDB',
            url: 'https://api.thesubdb.com/',
            priority: 3
        }
    ];

    var cache = {};
    var RETRY_DELAY = 1000;
    var MAX_RETRIES = 2;
    var CURRENT_SOURCE_INDEX = 0;

    // Функція для безпечного логування
    function log(message, data) {
        try {
            if (console && console.log) {
                console.log('[UA-Subs TV]', message, data || '');
            }
        } catch (e) {
            // Ігноруємо помилки логування
        }
    }

    // Отримання хешу відео для альтернативних джерел
    function getVideoHash(videoData) {
        try {
            // Спробуємо отримати хеш з URL або даних відео
            if (videoData && videoData.url) {
                var url = videoData.url.toLowerCase();
                if (url.includes('tt') && url.length > 20) {
                    // Спроба витягти IMDB ID з URL
                    var match = url.match(/tt(\d+)/);
                    if (match && match[1]) {
                        return 'tt' + match[1];
                    }
                }
            }
            
            // Якщо немає IMDB ID, використовуємо назву для створення унікального ідентифікатора
            if (videoData && videoData.title) {
                var title = videoData.title.replace(/[^a-z0-9]/gi, '').toLowerCase();
                return title.substring(0, 20);
            }
            
            return null;
        } catch (e) {
            log('Помилка отримання хешу', e);
            return null;
        }
    }

    // Функція для отримання мови інтерфейсу
    function getInterfaceLang() {
        try {
            var systemLang = (navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase();
            
            // Пріоритет української мови
            if (systemLang === 'uk' || systemLang === 'ua') {
                return 'uk';
            } else if (systemLang === 'ru') {
                return 'ru';
            } else {
                return 'en';
            }
        } catch (e) {
            return 'uk'; // За замовчуванням українська
        }
    }

    // Розширені лейбли мов з додатковими кодами
    var LANG_LABELS = {
        // Українська (різні коди)
        ukr: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        ua: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        uk: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        
        // Англійська
        eng: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        en: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        
        // Російська
        rus: { uk: 'Російські', ru: 'Русские', en: 'Russian' },
        ru: { uk: 'Російські', ru: 'Русские', en: 'Russian' },
        
        // Інші мови
        spa: { uk: 'Іспанські', ru: 'Испанские', en: 'Spanish' },
        fra: { uk: 'Французькі', ru: 'Французские', en: 'French' },
        ger: { uk: 'Німецькі', ru: 'Немецкие', en: 'German' },
        pol: { uk: 'Польські', ru: 'Польские', en: 'Polish' }
    };

    // Пріоритети мов - УКРАЇНСЬКА ПЕРША!
    var LANG_PRIORITY = {
        uk: ['ukr', 'ua', 'uk', 'eng', 'en', 'rus', 'ru', 'pol', 'spa', 'fra', 'ger'],
        ru: ['rus', 'ru', 'ukr', 'ua', 'uk', 'eng', 'en', 'pol', 'spa', 'fra', 'ger'],
        en: ['eng', 'en', 'ukr', 'ua', 'uk', 'rus', 'ru', 'pol', 'spa', 'fra', 'ger']
    };

    // Функція для перевірки української мови
    function isUkrainian(langCode) {
        var ukCodes = ['ukr', 'ua', 'uk', 'ukrainian', 'укр', 'українська'];
        return ukCodes.includes(langCode.toLowerCase());
    }

    // Отримання субтитрів з альтернативних джерел
    function fetchFromAlternativeSource(imdb, title, year, retryCount) {
        if (retryCount === undefined) retryCount = 0;
        
        // Якщо це не IMDB ID, спробуємо інші методи
        if (!imdb || !imdb.startsWith('tt')) {
            log('Шукаємо альтернативними методами для:', title);
            
            // Спробуємо знайти через назву та рік
            if (title && year) {
                var searchTitle = encodeURIComponent(title + ' ' + year);
                var searchUrl = 'https://rest.opensubtitles.org/search/query-' + searchTitle + '/sublanguageid-ukr';
                
                return fetch(searchUrl, {
                    headers: {
                        'User-Agent': 'Tizen UA-Subs TV'
                    }
                })
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status);
                    }
                    return response.json();
                })
                .then(function(data) {
                    var subtitles = [];
                    
                    if (data && Array.isArray(data)) {
                        data.forEach(function(sub) {
                            if (sub.SubDownloadLink) {
                                subtitles.push({
                                    lang: 'ukr',
                                    url: sub.SubDownloadLink,
                                    label: 'Українські (альтернативні)',
                                    source: 'OpenSubtitles-Search',
                                    rating: sub.SubRating || 0
                                });
                            }
                        });
                    }
                    
                    log('Знайдено через пошук:', subtitles.length);
                    return subtitles;
                })
                .catch(function(error) {
                    log('Помилка альтернативного пошуку', error);
                    return [];
                });
            }
        }
        
        return Promise.resolve([]);
    }

    // Основна функція отримання субтитрів
    function fetchSubs(imdb, season, episode, title, year, retryCount) {
        if (retryCount === undefined) retryCount = 0;
        
        var key = imdb + '_' + (season || 0) + '_' + (episode || 0);
        
        // Перевірка кешу
        if (cache[key]) {
            log('Використовую кеш для', key);
            return Promise.resolve(cache[key]);
        }

        try {
            var source = SOURCES[CURRENT_SOURCE_INDEX];
            log('Використовую джерело:', source.name);
            
            var url;
            if (season && episode) {
                url = source.url + 'subtitles/series/' + imdb + ':' + season + ':' + episode + '.json';
            } else {
                url = source.url + 'subtitles/movie/' + imdb + '.json';
            }

            return fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Tizen-UA-Subs-TV/1.0'
                },
                timeout: 8000
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error(source.name + ' HTTP ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                var subtitles = data.subtitles || [];
                
                // Додаємо інформацію про джерело
                subtitles.forEach(function(sub) {
                    sub.source = source.name;
                });
                
                // Кешування
                cache[key] = subtitles;
                setTimeout(function() {
                    delete cache[key];
                }, 1800000); // 30 хвилин
                
                log('Отримано з ' + source.name + ':', subtitles.length);
                
                // Якщо немає українських, спробуємо наступне джерело
                var hasUkrainian = subtitles.some(function(sub) {
                    return isUkrainian(sub.lang);
                });
                
                if (!hasUkrainian && retryCount < SOURCES.length - 1) {
                    log('Українських не знайдено, пробую наступне джерело');
                    CURRENT_SOURCE_INDEX = (CURRENT_SOURCE_INDEX + 1) % SOURCES.length;
                    return fetchSubs(imdb, season, episode, title, year, retryCount + 1);
                }
                
                return subtitles;
            })
            .catch(function(error) {
                log('Помилка ' + source.name + ':', error.message);
                
                // Спробуємо наступне джерело
                if (retryCount < SOURCES.length - 1) {
                    CURRENT_SOURCE_INDEX = (CURRENT_SOURCE_INDEX + 1) % SOURCES.length;
                    return fetchSubs(imdb, season, episode, title, year, retryCount + 1);
                }
                
                // Якщо всі джерела не спрацювали, спробуємо альтернативний пошук
                return fetchFromAlternativeSource(imdb, title, year);
            });
            
        } catch (error) {
            log('Критична помилка fetchSubs', error);
            return Promise.resolve([]);
        }
    }

    // Основна функція налаштування субтитрів
    function setupSubs() {
        try {
            log('=== ПОЧАТОК ПОШУКУ СУБТИТРІВ ===');
            
            if (typeof Lampa === 'undefined') {
                log('Lampa не знайдено');
                return;
            }

            var activity = Lampa.Activity ? Lampa.Activity.active ? Lampa.Activity.active() : null : null;
            var playdata = Lampa.Player ? Lampa.Player.playdata ? Lampa.Player.playdata() : null : null;
            var movie = activity ? activity.movie : null;

            if (!activity || !playdata || !movie) {
                log('Немає даних відтворення');
                return;
            }

            // Отримуємо всі можливі ідентифікатори
            var imdb = movie.imdb_id;
            var title = movie.title || movie.name || '';
            var year = movie.year || (movie.release_date ? movie.release_date.substring(0, 4) : '');
            
            // Якщо немає IMDB, спробуємо інші ID
            if (!imdb || imdb.length < 9) {
                imdb = movie.id || movie.kinopoisk_id || '';
                log('IMDB не знайдено, використовую альтернативний ID:', imdb);
            }

            var isSeries = !!movie.first_air_date;
            var season = isSeries ? playdata.season : undefined;
            var episode = isSeries ? playdata.episode : undefined;

            log('Дані фільму:', {
                title: title,
                year: year,
                imdb: imdb,
                isSeries: isSeries,
                season: season,
                episode: episode
            });

            // Отримання мови інтерфейсу
            var interfaceLang = getInterfaceLang();
            var priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.uk;
            
            log('Мова інтерфейсу:', interfaceLang);
            log('Пріоритет мов:', priority);

            // Отримання субтитрів
            fetchSubs(imdb, season, episode, title, year)
                .then(function(allSubs) {
                    // Фільтрація та форматування
                    var formattedSubs = allSubs
                        .filter(function(s) {
                            return s.url && (LANG_LABELS[s.lang] || isUkrainian(s.lang));
                        })
                        .map(function(s) {
                            var label;
                            if (isUkrainian(s.lang)) {
                                label = '🇺🇦 Українські';
                                if (s.source) label += ' (' + s.source + ')';
                            } else if (LANG_LABELS[s.lang]) {
                                label = LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en;
                            } else {
                                label = s.lang.toUpperCase();
                            }
                            
                            return {
                                lang: isUkrainian(s.lang) ? 'ukr' : s.lang,
                                url: s.url,
                                label: label,
                                rating: s.rating || 0,
                                source: s.source || 'unknown'
                            };
                        });

                    log('Знайдено після фільтрації:', formattedSubs.length);
                    
                    // Перевірка на українські субтитри
                    var ukrainianSubs = formattedSubs.filter(function(s) {
                        return isUkrainian(s.lang);
                    });
                    
                    log('Українських знайдено:', ukrainianSubs.length);
                    
                    if (ukrainianSubs.length === 0) {
                        log('УВАГА: Українських субтитрів не знайдено!');
                        // Можна додати повідомлення для користувача
                    }

                    // Поточні субтитри
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

                    // Додаємо нові унікальні субтитри
                    formattedSubs.forEach(function(newSub) {
                        var exists = current.find(function(existing) {
                            return existing.url === newSub.url || 
                                   (existing.lang === newSub.lang && existing.label === newSub.label);
                        });
                        
                        if (!exists) {
                            current.push(newSub);
                        }
                    });

                    // Сортування: українські перші, потім за пріоритетом
                    current.sort(function(a, b) {
                        var aIsUk = isUkrainian(a.lang);
                        var bIsUk = isUkrainian(b.lang);
                        
                        // Українські завжди перші
                        if (aIsUk && !bIsUk) return -1;
                        if (!aIsUk && bIsUk) return 1;
                        
                        // Обидві українські або обидві не українські
                        var aIndex = priority.indexOf(a.lang);
                        var bIndex = priority.indexOf(b.lang);
                        
                        if (aIndex === -1 && bIndex === -1) return b.rating - a.rating;
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        
                        return aIndex - bIndex;
                    });

                    if (current.length === 0) {
                        log('Субтитрів не знайдено взагалі');
                        return;
                    }

                    // Логування знайдених субтитрів
                    log('ВСІ знайдені субтитри:');
                    current.forEach(function(sub, index) {
                        log((index + 1) + '. ' + sub.label + ' [' + sub.lang + ']', sub.source);
                    });

                    // Визначення дефолтних
                    var defaultIndex = current.findIndex(function(s) {
                        return isUkrainian(s.lang);
                    });
                    
                    if (defaultIndex === -1) {
                        defaultIndex = current.findIndex(function(s) {
                            return s.lang === priority[0];
                        });
                    }
                    
                    if (defaultIndex === -1 && current.length > 0) {
                        defaultIndex = 0;
                    }

                    // Встановлення субтитрів
                    if (Lampa.Player && Lampa.Player.subtitles) {
                        log('Встановлюю субтитри:', {
                            всього: current.length,
                            українських: ukrainianSubs.length,
                            дефолтний: defaultIndex,
                            дефолтна_мова: current[defaultIndex] ? current[defaultIndex].lang : 'none'
                        });
                        
                        setTimeout(function() {
                            try {
                                Lampa.Player.subtitles(current, defaultIndex);
                                log('Субтитри успішно встановлено!');
                            } catch (e) {
                                log('Помилка встановлення субтитрів', e);
                            }
                        }, 300);
                    }
                })
                .catch(function(error) {
                    log('Фатальна помилка', error);
                });
                
        } catch (error) {
            log('Критична помилка setupSubs', error);
        }
    }

    // Ініціалізація плагіна
    function initializePlugin() {
        log('=== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА УКРАЇНСЬКИХ СУБТИТРІВ ===');
        
        if (typeof Lampa === 'undefined') {
            log('Lampa не завантажена, чекаю...');
            setTimeout(initializePlugin, 2000);
            return;
        }

        if (!Lampa.Player || !Lampa.Player.listener) {
            log('Player API не готове, чекаю...');
            setTimeout(initializePlugin, 1000);
            return;
        }

        try {
            // Обробка старту відтворення
            Lampa.Player.listener.follow('start', function() {
                log('Початок відтворення');
                setTimeout(setupSubs, 1000);
            });

            // Для серіалів
            Lampa.Player.listener.follow('episode', function() {
                log('Зміна епізоду');
                setTimeout(setupSubs, 1200);
            });

            log('Плагін успішно ініціалізовано!');
            log('Джерела субтитрів:', SOURCES.length);
            
            // Тестування
            log('Тест мови інтерфейсу:', getInterfaceLang());
            
        } catch (error) {
            log('Помилка ініціалізації', error);
        }
    }

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializePlugin, 3000);
        });
    } else {
        setTimeout(initializePlugin, 3000);
    }

    // Додаткові функції для тестування
    if (typeof window !== 'undefined') {
        window.UASubs = {
            version: '3.0.0',
            setupSubs: setupSubs,
            getInterfaceLang: getInterfaceLang,
            testSearch: function(title, year) {
                log('Тест пошуку для:', title);
                fetchFromAlternativeSource(null, title, year || '2023')
                    .then(function(subs) {
                        log('Результат тесту:', subs.length + ' субтитрів');
                    });
            }
        };
    }

    log('Плагін українських субтитрів завантажено!');

})();
