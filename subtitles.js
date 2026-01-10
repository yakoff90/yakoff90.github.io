(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        // Для Samsung TV перевіряємо різні джерела мови
        const lang = navigator.language || navigator.userLanguage || 'en';
        const shortLang = lang.substring(0, 2).toLowerCase();
        return ['uk', 'ru', 'en'].includes(shortLang) ? shortLang : 'en';
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

    function getVideoInfo() {
        // Спроба отримати інформацію про відео різними способами
        try {
            // Спробуємо отримати з метаданих сторінки
            const metaTags = document.getElementsByTagName('meta');
            let imdbId = '';
            let tmdbId = '';
            let isSeries = false;
            let season, episode;
            
            for (let tag of metaTags) {
                const name = tag.getAttribute('name') || tag.getAttribute('property') || '';
                const content = tag.getAttribute('content') || '';
                
                if (name.includes('imdb') || name.includes('imdb')) {
                    imdbId = content.replace('tt', '');
                }
                if (name.includes('tmdb') || name.includes('themoviedb')) {
                    tmdbId = content;
                }
                if (name.includes('type') && content.includes('tv')) {
                    isSeries = true;
                }
                if (name.includes('season')) {
                    season = parseInt(content);
                }
                if (name.includes('episode')) {
                    episode = parseInt(content);
                }
            }
            
            // Спробуємо отримати з URL
            const url = window.location.href;
            const urlParams = new URLSearchParams(window.location.search);
            
            // Перевіряємо різні формати параметрів
            imdbId = imdbId || urlParams.get('imdb') || urlParams.get('imdbId') || '';
            tmdbId = tmdbId || urlParams.get('tmdb') || urlParams.get('tmdbId') || '';
            
            // Чистимо ID
            if (imdbId && imdbId.startsWith('tt')) imdbId = imdbId.substring(2);
            
            return {
                imdb: imdbId,
                tmdb: tmdbId,
                isSeries: isSeries,
                season: season,
                episode: episode
            };
        } catch (e) {
            console.error('[OS Subs] Error getting video info:', e);
            return {};
        }
    }

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

            console.log('[OS Subs] Fetching from:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('[OS Subs] Found subtitles:', data.subtitles?.length || 0);
            return (cache[key] = data.subtitles || []);
        } catch (error) {
            console.warn('[OS Subs] Fetch error:', error);
            return [];
        }
    }

    function addSubtitlesToPlayer(subtitles) {
        if (!subtitles || !subtitles.length) {
            console.log('[OS Subs] No subtitles to add');
            return;
        }
        
        console.log('[OS Subs] Adding subtitles:', subtitles);
        
        // Пошук всіх відео елементів на сторінці
        const videos = document.querySelectorAll('video');
        
        videos.forEach((video, index) => {
            subtitles.forEach((subtitle, subIndex) => {
                try {
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = subtitle.label;
                    track.srclang = subtitle.lang;
                    track.src = subtitle.url;
                    track.default = subIndex === 0; // Перші субтитри за замовчуванням
                    
                    video.appendChild(track);
                    console.log(`[OS Subs] Added subtitle track ${subIndex} to video ${index}:`, subtitle);
                } catch (e) {
                    console.error('[OS Subs] Error adding track:', e);
                }
            });
            
            // Активація субтитрів
            setTimeout(() => {
                try {
                    if (video.textTracks && video.textTracks.length > 0) {
                        for (let i = 0; i < video.textTracks.length; i++) {
                            video.textTracks[i].mode = i === 0 ? 'showing' : 'hidden';
                        }
                        console.log('[OS Subs] Subtitles activated for video', index);
                    }
                } catch (e) {
                    console.error('[OS Subs] Error activating subtitles:', e);
                }
            }, 1000);
        });
    }

    async function setupSubs() {
        console.log('[OS Subs] Setting up subtitles...');
        
        const videoInfo = getVideoInfo();
        console.log('[OS Subs] Video info:', videoInfo);
        
        if (!videoInfo.imdb && !videoInfo.tmdb) {
            console.log('[OS Subs] No video ID found');
            return;
        }

        const interfaceLang = getInterfaceLang();
        console.log('[OS Subs] Interface language:', interfaceLang);
        
        const priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        let subs = [];

        // 1️⃣ IMDB
        if (videoInfo.imdb) {
            console.log('[OS Subs] Fetching IMDB subtitles for:', videoInfo.imdb);
            subs = await fetchSubs(videoInfo.imdb, false, videoInfo.season, videoInfo.episode);
        }

        // 2️⃣ TMDB fallback
        if (!subs.length && videoInfo.tmdb) {
            console.log('[OS Subs] Fetching TMDB subtitles for:', videoInfo.tmdb);
            subs = await fetchSubs(videoInfo.tmdb, true, videoInfo.season, videoInfo.episode);
        }

        if (!subs.length) {
            console.log('[OS Subs] No subtitles found');
            return;
        }

        // Фільтруємо та обробляємо субтитри
        let processed = subs
            .filter(s => s.url && LANG_LABELS[s.lang])
            .map(s => ({
                lang: s.lang,
                url: s.url,
                label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
            }));

        // Сортуємо за пріоритетом мови
        processed.sort((a, b) =>
            priority.indexOf(a.lang) - priority.indexOf(b.lang)
        );

        console.log('[OS Subs] Processed subtitles:', processed);
        
        // Додаємо субтитри до плеєра
        addSubtitlesToPlayer(processed);
    }

    // Запускаємо коли сторінка завантажиться
    window.addEventListener('load', function() {
        console.log('[OS Subs] Page loaded, starting subtitle setup...');
        setTimeout(setupSubs, 2000);
    });

    // Також запускаємо при зміні URL (для SPA)
    let lastUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            console.log('[OS Subs] URL changed, reloading subtitles...');
            setTimeout(setupSubs, 1000);
        }
    }, 1000);

    // Мануальний запуск через кнопку (для тестування)
    window.enableSubtitles = function() {
        console.log('[OS Subs] Manual trigger');
        setupSubs();
    };

    console.log('[OS Subs] Plugin loaded');

})();
