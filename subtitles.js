(function () {
    'use strict';

    var OSV3 = 'https://opensubtitles-v3.strem.io/';
    var cache = {};

    function getInterfaceLang() {
        var lang = Lampa.Storage.get('language') || 'en';
        return lang.toLowerCase();
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

        return fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (j) {
                cache[key] = j.subtitles || [];
                return cache[key];
            })
            .catch(function (e) {
                console.warn('[OS Subs]', e);
                return [];
            });
    }

    function setupSubs() {
        var activity = Lampa.Activity.active ? Lampa.Activity.active() : null;
        var playdata = Lampa.Player.playdata ? Lampa.Player.playdata() : null;
        var movie = activity ? activity.movie : null;

        if (!activity || !playdata || !movie || !movie.imdb_id) return;

        var imdb = movie.imdb_id;
        var isSeries = !!movie.first_air_date;
        var season = isSeries ? playdata.season : null;
        var episode = isSeries ? playdata.episode : null;
        var interfaceLang = getInterfaceLang();
        var priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        fetchSubs(imdb, season, episode).then(function (osSubs) {
            var subs = [];
            var current = [];
            var i, s, found, defaultIndex = -1;

            for (i = 0; i < osSubs.length; i++) {
                s = osSubs[i];
                if (s.url && LANG_LABELS[s.lang]) {
                    subs.push({
                        lang: s.lang,
                        url: s.url,
                        label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
                    });
                }
            }

            if (playdata.subtitles) {
                for (i = 0; i < playdata.subtitles.length; i++) {
                    s = playdata.subtitles[i];
                    current.push({
                        lang: s.lang || '',
                        url: s.url,
                        label: s.label
                    });
                }
            }

            for (i = 0; i < subs.length; i++) {
                s = subs[i];
                found = false;
                for (var j = 0; j < current.length; j++) {
                    if (current[j].url === s.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) current.push(s);
            }

            if (!current.length) return;

            current.sort(function (a, b) {
                var aIndex = priority.indexOf(a.lang);
                var bIndex = priority.indexOf(b.lang);
                if (aIndex === -1) aIndex = 999;
                if (bIndex === -1) bIndex = 999;
                return aIndex - bIndex;
            });

            for (i = 0; i < current.length; i++) {
                if (current[i].lang === priority[0]) {
                    defaultIndex = i;
                    break;
                }
            }

            if (Lampa.Player.subtitles) {
                Lampa.Player.subtitles(current, defaultIndex >= 0 ? defaultIndex : 0);
            }
        });
    }

    if (Lampa && Lampa.Player && Lampa.Player.listener) {
        Lampa.Player.listener.follow('start', function () {
            setTimeout(setupSubs, 500);
        });
    } else {
        console.warn('[OS Subs] Lampa API not available');
    }

})();
