(function () {
    'use strict';

    var OSV3 = 'https://opensubtitles-v3.strem.io/';
    var cache = {};
    var initialized = false;

    function getInterfaceLang() {
        try {
            var lang = Lampa.Storage.get('language') || 'en';
            return lang.toLowerCase();
        } catch (e) {
            return 'en';
        }
    }

    var LANG_LABELS = {
        eng: { uk: 'Англійські', ru: 'Английские', en: 'English' },
        ukr: { uk: 'Українські', ru: 'Украинские', en: 'Ukrainian' },
        rus: { uk: 'Російські', ru: 'Русские', en: 'Russian' }
    };

    var LANG_PRIORITY = {
        uk: ['ukr', 'eng', 'rus'],
        ru: ['rus', 'eng', 'ukr'],
        en: ['eng', 'ukr', 'rus']
    };

    function fetchSubs(imdb, season, episode) {
        var key = imdb + '_' + (season || 0) + '_' + (episode || 0);
        if (cache[key]) return Promise.resolve(cache[key]);

        var url = season && episode
            ? OSV3 + 'subtitles/series/' + imdb + ':' + season + ':' + episode + '.json'
            : OSV3 + 'subtitles/movie/' + imdb + '.json';

        return new Promise(function (resolve) {
            setTimeout(function () {
                fetch(url)
                    .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP error'); })
                    .then(function (j) {
                        cache[key] = j.subtitles || [];
                        resolve(cache[key]);
                    })
                    .catch(function (e) {
                        console.warn('[OS Subs] Fetch error:', e);
                        resolve([]);
                    });
            }, 100);
        });
    }

    function setupSubs() {
        if (!Lampa || !Lampa.Activity || !Lampa.Player) {
            console.warn('[OS Subs] Lampa API not ready');
            return;
        }

        try {
            var activity = Lampa.Activity.active();
            var playdata = Lampa.Player.playdata();
            if (!activity || !playdata) return;

            var movie = activity.movie;
            if (!movie || !movie.imdb_id) return;

            var imdb = movie.imdb_id;
            var isSeries = !!(movie.first_air_date);
            var season = isSeries ? playdata.season : null;
            var episode = isSeries ? playdata.episode : null;

            if (!imdb) return;

            var interfaceLang = getInterfaceLang();
            var priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

            fetchSubs(imdb, season, episode).then(function (osSubs) {
                if (!Lampa.Player || !Lampa.Player.subtitles) return;

                var subs = [];
                var current = [];
                var i, j, s, found;

                for (i = 0; i < osSubs.length; i++) {
                    s = osSubs[i];
                    if (s && s.url && s.lang && LANG_LABELS[s.lang]) {
                        subs.push({
                            lang: s.lang,
                            url: s.url,
                            label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
                        });
                    }
                }

                if (playdata.subtitles && Array.isArray(playdata.subtitles)) {
                    for (i = 0; i < playdata.subtitles.length; i++) {
                        s = playdata.subtitles[i];
                        if (s && s.url) {
                            current.push({
                                lang: s.lang || '',
                                url: s.url,
                                label: s.label || ''
                            });
                        }
                    }
                }

                for (i = 0; i < subs.length; i++) {
                    s = subs[i];
                    found = false;
                    for (j = 0; j < current.length; j++) {
                        if (current[j].url === s.url) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        current.push(s);
                    }
                }

                if (current.length === 0) return;

                current.sort(function (a, b) {
                    var aIndex = priority.indexOf(a.lang);
                    var bIndex = priority.indexOf(b.lang);
                    aIndex = aIndex === -1 ? 999 : aIndex;
                    bIndex = bIndex === -1 ? 999 : bIndex;
                    return aIndex - bIndex;
                });

                var defaultIndex = 0;
                for (i = 0; i < current.length; i++) {
                    if (current[i].lang === priority[0]) {
                        defaultIndex = i;
                        break;
                    }
                }

                setTimeout(function () {
                    if (Lampa.Player && Lampa.Player.subtitles) {
                        Lampa.Player.subtitles(current, defaultIndex);
                        console.log('[OS Subs] Added', current.length, 'subtitles');
                    }
                }, 300);
            });
        } catch (e) {
            console.error('[OS Subs] Setup error:', e);
        }
    }

    function initPlugin() {
        if (initialized) return;
        
        if (window.Lampa && Lampa.Player && Lampa.Player.listener) {
            Lampa.Player.listener.follow('start', function () {
                console.log('[OS Subs] Player started');
                setTimeout(setupSubs, 800);
            });
            initialized = true;
            console.log('[OS Subs] Plugin initialized');
        } else {
            setTimeout(initPlugin, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        setTimeout(initPlugin, 500);
    }

})();
