//лагін субтитрів працює тільки якщо у фільма є imdb. Додана локалізація і завантаження українських. Спасибі @BDV_Burik
(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        try {
            const lang = Lampa.Storage.get('language') || 'en';
            return lang.toLowerCase();
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

    function fetchSubs(imdb, season, episode) {
        const key = `${imdb}_${season || 0}_${episode || 0}`;
        if (cache[key]) return Promise.resolve(cache[key]);

        const url = season && episode
            ? `${OSV3}subtitles/series/${imdb}:${season}:${episode}.json`
            : `${OSV3}subtitles/movie/${imdb}.json`;

        return fetch(url)
            .then(r => r.json())
            .then(j => {
                cache[key] = j.subtitles || [];
                return cache[key];
            })
            .catch(e => {
                console.warn('[OS Subs]', e);
                return [];
            });
    }

    function setupSubs() {
        setTimeout(function() {
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

                fetchSubs(imdb, season, episode).then(osSubs => {
                    const interfaceLang = getInterfaceLang();
                    const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

                    let subs = osSubs
                        .filter(s => s.url && LANG_LABELS[s.lang])
                        .map(s => ({
                            lang: s.lang,
                            url: s.url,
                            label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
                        }));

                    let current = [];
                    
                    // Отримуємо поточні субтитри з плеєра
                    if (Lampa.Player.current() && Lampa.Player.current().subtitles) {
                        current = Lampa.Player.current().subtitles.map(s => ({
                            lang: s.lang || '',
                            url: s.url || '',
                            label: s.label || s.lang || ''
                        }));
                    }

                    // Додаємо субтитри з opensubtitles
                    subs.forEach(s => {
                        if (!current.find(c => c.url === s.url)) {
                            current.push(s);
                        }
                    });

                    if (current.length === 0) return;

                    // Сортуємо
                    current.sort((a, b) => {
                        const aIndex = priority.indexOf(a.lang);
                        const bIndex = priority.indexOf(b.lang);
                        const aPos = aIndex === -1 ? 999 : aIndex;
                        const bPos = bIndex === -1 ? 999 : bIndex;
                        return aPos - bPos;
                    });

                    // Знаходимо дефолтний індекс
                    let defaultIndex = 0;
                    for (let i = 0; i < current.length; i++) {
                        if (current[i].lang === priority[0]) {
                            defaultIndex = i;
                            break;
                        }
                    }

                    // Додаємо субтитри
                    Lampa.Player.subtitles(current, defaultIndex);
                    
                    // Також зберігаємо в playdata для подальшого використання
                    if (playdata) {
                        playdata.subtitles = current;
                    }
                });
            } catch (e) {
                console.warn('[OS Subs] Error:', e);
            }
        }, 1000); // Збільшена затримка до 1 секунди
    }

    // Ініціалізація
    function init() {
        if (!window.Lampa) {
            setTimeout(init, 100);
            return;
        }

        // Додаємо обробник на старт відтворення
        Lampa.Player.listener.follow('start', setupSubs);
        
        // Також спробуємо під час паузи (іноді це спрацьовує краще)
        Lampa.Player.listener.follow('pause', function() {
            setTimeout(setupSubs, 300);
        });
        
        console.log('[OS Subs] Завантажено');
    }

    // Запускаємо при завантаженні сторінки
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
