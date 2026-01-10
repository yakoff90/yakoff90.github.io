(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        const lang = navigator.language || navigator.userLanguage || 'en';
        const shortLang = lang.substring(0, 2).toLowerCase();
        return ['uk', 'ru', 'en'].indexOf(shortLang) >= 0 ? shortLang : 'en';
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

    // Функція для отримання даних фільму (заміна Lampa API)
    function getMovieData() {
        // Спробуємо отримати з глобальних змінних
        if (window.movieData) return window.movieData;
        if (window.currentMovie) return window.currentMovie;
        
        // Спробуємо отримати з localStorage
        try {
            const stored = localStorage.getItem('currentMovie');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        
        return null;
    }

    // Функція для отримання даних відтворення (заміна Lampa.Player.playdata)
    function getPlayData() {
        // Спробуємо отримати з глобальних змінних
        if (window.playData) return window.playData;
        if (window.currentPlayData) return window.currentPlayData;
        
        // Спробуємо отримати з localStorage
        try {
            const stored = localStorage.getItem('playData');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        
        return null;
    }

    // Функція для отримання активної активності (заміна Lampa.Activity.active)
    function getActiveActivity() {
        // На Samsung TV часто використовується один екран перегляду
        // Повертаємо об'єкт, схожий на оригінальну активність
        const movie = getMovieData();
        if (!movie) return null;
        
        return {
            movie: movie,
            isSeries: !!movie.first_air_date || !!movie.seasons
        };
    }

    async function fetchSubs(id, isTmdb, season, episode) {
        if (!id) return [];

        const key = (isTmdb ? 'tmdb' : 'imdb') + '_' + id + '_' + (season || 0) + '_' + (episode || 0);
        if (cache[key]) return cache[key];

        try {
            let pathId = isTmdb ? 'tmdb:' + id : id;
            let url;

            if (season && episode) {
                url = OSV3 + 'subtitles/series/' + pathId + ':' + season + ':' + episode + '.json';
            } else {
                url = OSV3 + 'subtitles/movie/' + pathId + '.json';
            }

            console.log('[OS Subs] Fetching:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            
            const data = await response.json();
            console.log('[OS Subs] Found:', (data.subtitles || []).length, 'subtitles');
            
            cache[key] = data.subtitles || [];
            return cache[key];
        } catch (e) {
            console.warn('[OS Subs] Error:', e);
            return [];
        }
    }

    // Функція для встановлення субтитрів у відеоплеєр
    function setPlayerSubtitles(subtitles, defaultIndex) {
        if (!subtitles || !subtitles.length) {
            console.log('[OS Subs] No subtitles to set');
            return;
        }

        // Знаходимо всі відео елементи на сторінці
        const videos = document.querySelectorAll('video');
        
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            
            // Очищаємо старі субтитри
            const oldTracks = video.querySelectorAll('track');
            for (let j = 0; j < oldTracks.length; j++) {
                video.removeChild(oldTracks[j]);
            }
            
            // Додаємо нові субтитри
            for (let j = 0; j < subtitles.length; j++) {
                const sub = subtitles[j];
                try {
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = sub.label;
                    track.srclang = sub.lang;
                    track.src = sub.url;
                    track.default = (j === defaultIndex);
                    
                    video.appendChild(track);
                    console.log('[OS Subs] Added track:', sub.label);
                } catch (err) {
                    console.error('[OS Subs] Error adding track:', err);
                }
            }
            
            // Активація обраних субтитрів
            setTimeout(function() {
                try {
                    if (video.textTracks && video.textTracks.length > 0) {
                        const selectedIndex = Math.min(defaultIndex, video.textTracks.length - 1);
                        for (let k = 0; k < video.textTracks.length; k++) {
                            video.textTracks[k].mode = k === selectedIndex ? 'showing' : 'hidden';
                        }
                        console.log('[OS Subs] Activated subtitle index:', selectedIndex);
                    }
                } catch (err) {
                    console.error('[OS Subs] Error activating subtitles:', err);
                }
            }, 500);
        }
    }

    async function setupSubs() {
        console.log('[OS Subs] Starting setup...');
        
        const activity = getActiveActivity();
        const playdata = getPlayData();
        const movie = activity ? activity.movie : null;

        if (!activity || !playdata || !movie) {
            console.log('[OS Subs] Missing data:', { 
                hasActivity: !!activity, 
                hasPlaydata: !!playdata, 
                hasMovie: !!movie 
            });
            return;
        }

        console.log('[OS Subs] Movie data:', { 
            imdb: movie.imdb_id, 
            tmdb: movie.id || movie.tmdb_id,
            title: movie.title || movie.name 
        });

        const imdb = movie.imdb_id;
        const tmdb = movie.id || movie.tmdb_id;

        const isSeries = !!movie.first_air_date || !!movie.seasons;
        const season = isSeries ? (playdata.season || 1) : undefined;
        const episode = isSeries ? (playdata.episode || 1) : undefined;

        const interfaceLang = getInterfaceLang();
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        console.log('[OS Subs] Language:', interfaceLang, 'Priority:', priority);

        let subs = [];

        // 1️⃣ IMDB
        if (imdb) {
            console.log('[OS Subs] Fetching IMDB:', imdb);
            subs = await fetchSubs(imdb, false, season, episode);
        }

        // 2️⃣ TMDB fallback
        if (!subs.length && tmdb) {
            console.log('[OS Subs] Fetching TMDB:', tmdb);
            subs = await fetchSubs(tmdb, true, season, episode);
        }

        if (!subs.length) {
            console.log('[OS Subs] No subtitles found');
            return;
        }

        // Обробка субтитрів
        let processed = [];
        for (let i = 0; i < subs.length; i++) {
            const s = subs[i];
            if (s.url && LANG_LABELS[s.lang]) {
                processed.push({
                    lang: s.lang,
                    url: s.url,
                    label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
                });
            }
        }

        // Початкові субтитри
        const current = (playdata.subtitles || []).map(function(s) {
            return {
                lang: s.lang || '',
                url: s.url,
                label: s.label
            };
        });

        // Додаємо нові субтитри
        for (let i = 0; i < processed.length; i++) {
            const s = processed[i];
            let found = false;
            
            for (let j = 0; j < current.length; j++) {
                if (current[j].url === s.url) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                current.push(s);
            }
        }

        // Сортуємо за пріоритетом
        current.sort(function(a, b) {
            const aIndex = priority.indexOf(a.lang);
            const bIndex = priority.indexOf(b.lang);
            
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            
            return aIndex - bIndex;
        });

        // Знаходимо індекс за замовчуванням
        let defaultIndex = 0;
        for (let i = 0; i < current.length; i++) {
            if (current[i].lang === priority[0]) {
                defaultIndex = i;
                break;
            }
        }

        console.log('[OS Subs] Setting', current.length, 'subtitles, default:', defaultIndex);
        
        // Встановлюємо субтитри
        setPlayerSubtitles(current, defaultIndex);
    }

    // Слухаємо події відтворення
    function listenForVideoStart() {
        // Слухаємо появу відео елементів
        const observer = new MutationObserver(function(mutations) {
            for (let i = 0; i < mutations.length; i++) {
                const mutation = mutations[i];
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    const node = mutation.addedNodes[j];
                    if (node.tagName === 'VIDEO' || (node.querySelector && node.querySelector('video'))) {
                        console.log('[OS Subs] Video element detected');
                        setTimeout(setupSubs, 1000);
                    }
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Також слухаємо події відео
        document.addEventListener('play', function() {
            console.log('[OS Subs] Video play event');
            setTimeout(setupSubs, 500);
        });

        document.addEventListener('playing', function() {
            console.log('[OS Subs] Video playing event');
            setTimeout(setupSubs, 500);
        });
    }

    // Ініціалізація
    window.addEventListener('load', function() {
        console.log('[OS Subs] Plugin loaded');
        listenForVideoStart();
        
        // Запускаємо через 2 секунди після завантаження
        setTimeout(setupSubs, 2000);
        
        // Також запускаємо кожні 5 секунд для надійності
        setInterval(function() {
            const videos = document.querySelectorAll('video');
            if (videos.length > 0 && videos[0].currentTime > 0) {
                setupSubs();
            }
        }, 5000);
    });

    // Глобальна функція для ручного запуску
    window.loadSubtitles = function() {
        console.log('[OS Subs] Manual trigger');
        setupSubs();
    };

    console.log('[OS Subs] Script initialized');

})();
