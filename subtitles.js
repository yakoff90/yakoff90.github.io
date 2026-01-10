// Plugin: OpenSubtitles для Tizen Samsung TV
// Лагіт субтитрів працює тільки якщо у фільма є imdb. Додана локалізація і завантаження українських.
(function () {
    'use strict';

    // Конфігурація
    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};
    const RETRY_DELAY = 1000; // Затримка при помилках
    const MAX_RETRIES = 3;

    // Перевірка середовища
    const isTizen = typeof tizen !== 'undefined';
    const isWebOS = typeof webOS !== 'undefined';

    // Функція для безпечного логування
    function log(message, data) {
        if (console && console.log) {
            console.log('[OS Subs Tizen]', message, data || '');
        }
    }

    // Функція для отримання мови інтерфейсу
    function getInterfaceLang() {
        try {
            // Для Tizen/WebOS
            if (isTizen || isWebOS) {
                const systemLang = (navigator.language || 'en').substring(0, 2);
                return systemLang === 'uk' ? 'uk' : 
                       systemLang === 'ru' ? 'ru' : 'en';
            }
            
            // Для звичайних браузерів (fallback)
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                return (Lampa.Storage.get('language') || 'en').toLowerCase();
            }
            
            return 'en';
        } catch (e) {
            return 'en';
        }
    }

    // Лейбли мов
    const LANG_LABELS = {
        eng: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        ukr: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        rus: { uk: 'Російські', ru: 'Русские', en: 'Russian' },
        spa: { uk: 'Іспанські', ru: 'Испанские', en: 'Spanish' },
        fra: { uk: 'Французькі', ru: 'Французские', en: 'French' },
        ger: { uk: 'Німецькі', ru: 'Немецкие', en: 'German' }
    };

    // Пріоритети мов
    const LANG_PRIORITY = {
        uk: ['ukr', 'eng', 'rus', 'spa', 'fra', 'ger'],
        ru: ['rus', 'eng', 'ukr', 'spa', 'fra', 'ger'],
        en: ['eng', 'ukr', 'rus', 'spa', 'fra', 'ger']
    };

    // Функція для отримання субтитрів з кешуванням
    async function fetchSubs(imdb, season, episode, retryCount = 0) {
        const key = `${imdb}_${season || 0}_${episode || 0}`;
        
        // Перевірка кешу
        if (cache[key]) {
            log('Використовую кеш для', key);
            return cache[key];
        }

        try {
            const url = season && episode
                ? `${OSV3}subtitles/series/${imdb}:${season}:${episode}.json`
                : `${OSV3}subtitles/movie/${imdb}.json`;

            log('Запит субтитрів', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Tizen/Stremio-OpenSubtitles-Plugin'
                },
                timeout: 10000 // 10 секунд таймаут
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const subtitles = data.subtitles || [];
            
            // Кешування результатів
            cache[key] = subtitles;
            
            // Автоматична очистка кешу через 1 годину
            setTimeout(() => {
                delete cache[key];
            }, 3600000);
            
            log('Отримано субтитрів', subtitles.length);
            return subtitles;
            
        } catch (error) {
            log('Помилка отримання субтитрів', error.message);
            
            // Повторна спроба
            if (retryCount < MAX_RETRIES) {
                log(`Повторна спроба ${retryCount + 1}/${MAX_RETRIES}`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
                return fetchSubs(imdb, season, episode, retryCount + 1);
            }
            
            return [];
        }
    }

    // Основна функція налаштування субтитрів
    async function setupSubs() {
        try {
            log('Запуск налаштування субтитрів');
            
            // Перевірка наявності необхідних об'єктів
            if (typeof Lampa === 'undefined') {
                log('Lampa не знайдено');
                return;
            }

            const activity = Lampa.Activity?.active?.();
            const playdata = Lampa.Player?.playdata?.();
            const movie = activity?.movie;

            if (!activity || !playdata || !movie) {
                log('Відсутні дані про відтворення');
                return;
            }

            // Перевірка IMDB ID
            const imdb = movie.imdb_id;
            if (!imdb || imdb.length < 9) {
                log('Невірний або відсутній IMDB ID', imdb);
                return;
            }

            // Визначення типу контенту
            const isSeries = !!movie.first_air_date;
            const season = isSeries ? playdata.season : undefined;
            const episode = isSeries ? playdata.episode : undefined;

            log('Інформація', {
                imdb,
                isSeries,
                season,
                episode,
                title: movie.title || movie.name
            });

            // Отримання мови інтерфейсу
            const interfaceLang = getInterfaceLang();
            const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;
            
            log('Обрана мова інтерфейсу', interfaceLang);

            // Отримання субтитрів
            const osSubs = await fetchSubs(imdb, season, episode);

            // Фільтрація та форматування субтитрів
            let subs = osSubs
                .filter(s => s.url && LANG_LABELS[s.lang])
                .map(s => ({
                    lang: s.lang,
                    url: s.url,
                    label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en,
                    rating: s.rating || 0
                }));

            log('Знайдено субтитрів після фільтрації', subs.length);

            // Отримання поточних субтитрів
            const current = Array.isArray(playdata.subtitles) 
                ? playdata.subtitles.map(s => ({
                    lang: s.lang || '',
                    url: s.url,
                    label: s.label || '',
                    rating: 0
                }))
                : [];

            // Додавання нових субтитрів
            subs.forEach(newSub => {
                if (!current.find(existing => existing.url === newSub.url)) {
                    current.push(newSub);
                }
            });

            // Сортування за пріоритетом мов
            current.sort((a, b) => {
                const aIndex = priority.indexOf(a.lang);
                const bIndex = priority.indexOf(b.lang);
                
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

            log('Доступні субтитри', current.map(s => `${s.label} (${s.lang})`));

            // Визначення субтитрів за замовчуванням
            let defaultIndex = current.findIndex(s => s.lang === priority[0]);
            if (defaultIndex === -1 && current.length > 0) {
                defaultIndex = 0;
            }

            // Встановлення субтитрів
            if (Lampa.Player && Lampa.Player.subtitles) {
                log('Встановлюю субтитри', { 
                    count: current.length, 
                    defaultIndex,
                    defaultLang: current[defaultIndex]?.lang 
                });
                
                // Невелика затримка для стабілізації плеєра
                await new Promise(resolve => setTimeout(resolve, 100));
                Lampa.Player.subtitles(current, defaultIndex);
            }

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
            Lampa.Player.listener.follow('start', function () {
                log('Подія start викликана');
                // Затримка для стабілізації плеєра
                setTimeout(setupSubs, 800);
            });

            // Додаткова обробка для зміни епізодів у серіалах
            Lampa.Player.listener.follow('episode', function () {
                log('Подія episode викликана');
                setTimeout(setupSubs, 1000);
            });

            // Оновлення при зміні якості
            Lampa.Player.listener.follow('quality', function () {
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
        setTimeout(initializePlugin, 2000); // Затримка для завантаження Lampa
    }

    // Експорт для відладки
    if (typeof window !== 'undefined') {
        window.OpenSubtitlesPlugin = {
            version: '2.0.0',
            setupSubs,
            fetchSubs,
            getInterfaceLang,
            initializePlugin
        };
    }

})();
