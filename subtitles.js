//лагін субтитрів працює тільки якщо у фільма є imdb. Додана локалізація і завантаження українських. Спасибі @BDV_Burik
(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        try {
            return (Lampa.Storage.get('language') || 'en').toLowerCase();
        } catch (e) {
            return 'en';
        }
    }

    const LANG_LABELS = {
        eng: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        ukr: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        rus: { uk: 'Російські', ru: 'Русские', en: 'Russian' }
    };

    const LANG_PRIORITY = {
        uk: ['ukr', 'eng', 'rus'],
        ru: ['rus', 'eng', 'ukr'],
        en: ['eng', 'ukr', 'rus']
    };

    async function fetchSubs(imdb, season, episode) {
        const key = `${imdb}_${season || 0}_${episode || 0}`;
        if (cache[key]) return cache[key];

        try {
            const url = season && episode
                ? `${OSV3}subtitles/series/${imdb}:${season}:${episode}.json`
                : `${OSV3}subtitles/movie/${imdb}.json`;

            // Оригінальний fetch, який працює на Tizen
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return (cache[key] = data.subtitles || []);
        } catch (e) {
            console.warn('[OS Subs] Помилка завантаження:', e.message || e);
            return [];
        }
    }

    function setupSubs() {
        try {
            const activity = Lampa.Activity.active();
            if (!activity) return;
            
            const playdata = Lampa.Player.playdata();
            if (!playdata) return;
            
            const movie = activity.movie;
            if (!movie || !movie.imdb_id) return;

            const imdb = movie.imdb_id;
            const isSeries = !!movie.first_air_date;

            const season = isSeries ? playdata.season : undefined;
            const episode = isSeries ? playdata.episode : undefined;

            const interfaceLang = getInterfaceLang();
            const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

            // Асинхронне завантаження субтитрів
            fetchSubs(imdb, season, episode).then(osSubs => {
                let subs = osSubs
                    .filter(s => s.url && LANG_LABELS[s.lang])
                    .map(s => ({
                        lang: s.lang,
                        url: s.url,
                        label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
                    }));

                // Отримуємо поточні субтитри
                let current = [];
                try {
                    if (playdata.subtitles && Array.isArray(playdata.subtitles)) {
                        current = playdata.subtitles.map(s => ({
                            lang: s.lang || '',
                            url: s.url,
                            label: s.label || ''
                        }));
                    }
                } catch (e) {
                    console.warn('[OS Subs] Помилка читання поточних субтитрів:', e);
                }

                // Додаємо нові субтитри
                subs.forEach(s => {
                    if (!current.find(c => c.url === s.url)) {
                        current.push(s);
                    }
                });

                // Сортуємо за пріоритетом мов
                if (current.length > 0) {
                    current.sort((a, b) => {
                        const aIndex = priority.indexOf(a.lang);
                        const bIndex = priority.indexOf(b.lang);
                        const aPos = aIndex === -1 ? 999 : aIndex;
                        const bPos = bIndex === -1 ? 999 : bIndex;
                        return aPos - bPos;
                    });

                    // Знаходимо індекс мови за замовчуванням
                    let defaultIndex = 0;
                    for (let i = 0; i < current.length; i++) {
                        if (current[i].lang === priority[0]) {
                            defaultIndex = i;
                            break;
                        }
                    }

                    // Додаємо субтитри до плеєра
                    try {
                        Lampa.Player.subtitles(current, defaultIndex);
                        console.log('[OS Subs] Субтитри додано:', current.length, 'шт');
                    } catch (e) {
                        console.warn('[OS Subs] Помилка додавання субтитрів:', e);
                    }
                }
            });
        } catch (e) {
            console.warn('[OS Subs] Помилка в setupSubs:', e);
        }
    }

    // Ініціалізація при старті плеєра
    function init() {
        if (!window.Lampa || !Lampa.Player) {
            setTimeout(init, 100);
            return;
        }
        
        // Слухаємо подію старту відтворення
        Lampa.Player.listener.follow('start', function () {
            // Невелика затримка для завантаження метаданих
            setTimeout(setupSubs, 300);
        });
        
        // Також спробуємо при зміні субтитрів
        Lampa.Player.listener.follow('subtitles', function () {
            setTimeout(setupSubs, 100);
        });
        
        console.log('[OS Subs] Плагін ініціалізовано');
    }

    // Запускаємо ініціалізацію
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
