(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        return (window.localStorage.getItem('language') || 'en').toLowerCase();
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

    async function fetchSubs(id, isTmdb, season, episode) {
        if (!id) return [];
        
        const key = `${isTmdb ? 'tmdb' : 'imdb'}_${id}_${season || 0}_${episode || 0}`;
        if (cache[key]) return cache[key];

        try {
            let pathId = isTmdb ? `tmdb:${id}` : id;
            let url;

            if (season && episode) {
                url = `${OSV3}subtitles/series/${pathId}:${season}:${episode}.json`;
            } else {
                url = `${OSV3}subtitles/movie/${pathId}.json`;
            }

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            return (cache[key] = data.subtitles || []);
        } catch (error) {
            console.warn('[OS Subs] Fetch error:', error);
            return [];
        }
    }

    function findPlayer() {
        // Для Samsung Tizen/WebOS потрібно знайти глобальний об'єкт плеєра
        if (window.videoPlayer) return window.videoPlayer;
        if (window.player) return window.player;
        
        // Спробуємо знайти через DOM
        const videos = document.querySelectorAll('video');
        return videos.length > 0 ? videos[0] : null;
    }

    function setSubtitles(player, subtitles, defaultIndex) {
        if (!player || !subtitles || !subtitles.length) return;
        
        // Для Samsung Tizen
        if (player.setSubtitleSources) {
            player.setSubtitleSources(subtitles.map(s => ({
                src: s.url,
                label: s.label,
                lang: s.lang
            })));
            
            if (defaultIndex >= 0) {
                player.setCurrentSubtitle(defaultIndex);
            }
        } 
        // Для стандартного HTML5 video
        else if (player.textTracks) {
            subtitles.forEach((sub, index) => {
                const track = player.addTextTrack('subtitles', sub.label, sub.lang);
                track.mode = index === defaultIndex ? 'showing' : 'hidden';
                track.src = sub.url;
            });
        }
    }

    async function setupSubs() {
        // Отримуємо дані з глобального об'єкта або localStorage
        const playData = JSON.parse(window.localStorage.getItem('playdata') || '{}');
        const movieData = JSON.parse(window.localStorage.getItem('moviedata') || '{}');
        
        if (!playData || !movieData) return;

        const imdb = movieData.imdb_id;
        const tmdb = movieData.id || movieData.tmdb_id;
        const isSeries = !!movieData.first_air_date;
        const season = isSeries ? playData.season : undefined;
        const episode = isSeries ? playData.episode : undefined;

        const interfaceLang = getInterfaceLang();
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        let subs = [];

        // 1️⃣ IMDB
        if (imdb) {
            subs = await fetchSubs(imdb, false, season, episode);
        }

        // 2️⃣ TMDB fallback
        if (!subs.length && tmdb) {
            subs = await fetchSubs(tmdb, true, season, episode);
        }

        if (!subs.length) return;

        let processed = subs
            .filter(s => s.url && LANG_LABELS[s.lang])
            .map(s => ({
                lang: s.lang,
                url: s.url,
                label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
            }));

        const current = (playData.subtitles || []).map(s => ({
            lang: s.lang || '',
            url: s.url,
            label: s.label
        }));

        processed.forEach(s => {
            if (!current.find(c => c.url === s.url)) {
                current.push(s);
            }
        });

        current.sort((a, b) =>
            priority.indexOf(a.lang) - priority.indexOf(b.lang)
        );

        const idx = current.findIndex(s => s.lang === priority[0]);
        const player = findPlayer();
        
        setSubtitles(player, current, idx >= 0 ? idx : 0);
    }

    // Запускаємо через 1 секунду після завантаження
    window.addEventListener('load', function() {
        setTimeout(setupSubs, 1000);
    });

    // Також слухаємо зміни плейліста/плеєра
    document.addEventListener('playlistChanged', setupSubs);
    document.addEventListener('playerReady', setupSubs);

})();
