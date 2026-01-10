//лагін субтитрів працює тільки якщо у фільма є imdb. Додана локалізація і завантаження українських. Спасибі @BDV_Burik
(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        return (Lampa.Storage.get('language') || 'en').toLowerCase();
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

            // Використання Lampa.Request для сумісності з Tizen
            const response = await Lampa.Request.json(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            return (cache[key] = response.subtitles || []);
        } catch (e) {
            console.warn('[OS Subs]', e);
            return [];
        }
    }

    async function setupSubs() {
        const activity = Lampa.Activity.active?.();
        const playdata = Lampa.Player.playdata?.();
        const movie = activity?.movie;

        if (!activity || !playdata || !movie || !movie.imdb_id) {
            console.log('[OS Subs] Немає даних для завантаження субтитрів');
            return;
        }

        const imdb = movie.imdb_id;
        const isSeries = !!movie.first_air_date;

        const season = isSeries ? playdata.season : undefined;
        const episode = isSeries ? playdata.episode : undefined;

        const interfaceLang = getInterfaceLang();
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        console.log('[OS Subs] Завантаження субтитрів для IMDB:', imdb, 'Серія:', season, 'Епізод:', episode);

        const osSubs = await fetchSubs(imdb, season, episode);
        console.log('[OS Subs] Знайдено субтитрів:', osSubs.length);

        let subs = osSubs
            .filter(s =>
                s.url &&
                LANG_LABELS[s.lang]
            )
            .map(s => ({
                lang: s.lang,
                url: s.url,
                label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
            }));

        const current = (playdata.subtitles || []).map(s => ({
            lang: s.lang || '',
            url: s.url,
            label: s.label
        }));

        subs.forEach(s => {
            if (!current.find(c => c.url === s.url)) {
                current.push(s);
            }
        });

        current.sort((a, b) => {
            const aIndex = priority.indexOf(a.lang);
            const bIndex = priority.indexOf(b.lang);
            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });

        if (!current.length) {
            console.log('[OS Subs] Немає доступних субтитрів');
            return;
        }

        const defaultIndex = current.findIndex(s => s.lang === priority[0]);
        console.log('[OS Subs] Додано субтитрів:', current.length, 'Мова за замовчуванням:', priority[0]);

        Lampa.Player.subtitles(current, defaultIndex >= 0 ? defaultIndex : 0);
    }

    // Чекаємо поки Lampa повністю завантажиться
    if (window.Lampa && Lampa.Player) {
        Lampa.Player.listener.follow('start', function () {
            console.log('[OS Subs] Початок відтворення, завантаження субтитрів...');
            setTimeout(setupSubs, 500);
        });
    } else {
        // Якщо Lampa ще не завантажилась, чекаємо на подію завантаження
        document.addEventListener('lampa-loaded', function () {
            Lampa.Player.listener.follow('start', function () {
                console.log('[OS Subs] Початок відтворення, завантаження субтитрів...');
                setTimeout(setupSubs, 500);
            });
        });
    }

})();
