(function () {
    'use strict';

    const OSV3 = 'https://opensubtitles-v3.strem.io/';
    const cache = {};

    function getInterfaceLang() {
        var lang = navigator.language || navigator.userLanguage || 'en';
        var shortLang = lang.substring(0, 2).toLowerCase();
        return ['uk', 'ru', 'en'].indexOf(shortLang) >= 0 ? shortLang : 'en';
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

    function getVideoInfo() {
        try {
            var metaTags = document.getElementsByTagName('meta');
            var imdbId = '';
            var tmdbId = '';
            var isSeries = false;
            var season, episode;
            
            for (var i = 0; i < metaTags.length; i++) {
                var tag = metaTags[i];
                var name = tag.getAttribute('name') || tag.getAttribute('property') || '';
                var content = tag.getAttribute('content') || '';
                
                if (name.indexOf('imdb') !== -1) {
                    imdbId = content.replace('tt', '');
                }
                if (name.indexOf('tmdb') !== -1 || name.indexOf('themoviedb') !== -1) {
                    tmdbId = content;
                }
                if (name.indexOf('type') !== -1 && content.indexOf('tv') !== -1) {
                    isSeries = true;
                }
                if (name.indexOf('season') !== -1) {
                    season = parseInt(content);
                }
                if (name.indexOf('episode') !== -1) {
                    episode = parseInt(content);
                }
            }
            
            var urlParams = new URLSearchParams(window.location.search);
            
            imdbId = imdbId || urlParams.get('imdb') || urlParams.get('imdbId') || '';
            tmdbId = tmdbId || urlParams.get('tmdb') || urlParams.get('tmdbId') || '';
            
            if (imdbId && imdbId.indexOf('tt') === 0) {
                imdbId = imdbId.substring(2);
            }
            
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
        
        var key = (isTmdb ? 'tmdb' : 'imdb') + '_' + id + '_' + (season || 0) + '_' + (episode || 0);
        if (cache[key]) return cache[key];

        try {
            var pathId = isTmdb ? 'tmdb:' + id : id;
            var url;

            if (season && episode) {
                url = OSV3 + 'subtitles/series/' + pathId + ':' + season + ':' + episode + '.json';
            } else {
                url = OSV3 + 'subtitles/movie/' + pathId + '.json';
            }

            console.log('[OS Subs] Fetching from:', url);
            var response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            
            var data = await response.json();
            console.log('[OS Subs] Found subtitles:', data.subtitles ? data.subtitles.length : 0);
            cache[key] = data.subtitles || [];
            return cache[key];
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
        
        console.log('[OS Subs] Adding subtitles:', subtitles.length);
        
        var videos = document.querySelectorAll('video');
        
        for (var v = 0; v < videos.length; v++) {
            var video = videos[v];
            
            for (var s = 0; s < subtitles.length; s++) {
                var subtitle = subtitles[s];
                try {
                    var track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = subtitle.label;
                    track.srclang = subtitle.lang;
                    track.src = subtitle.url;
                    track.default = s === 0;
                    
                    video.appendChild(track);
                    console.log('[OS Subs] Added subtitle track:', subtitle.label);
                } catch (err) {
                    console.error('[OS Subs] Error adding track:', err);
                }
            }
            
            setTimeout(function(vid) {
                return function() {
                    try {
                        if (vid.textTracks && vid.textTracks.length > 0) {
                            for (var t = 0; t < vid.textTracks.length; t++) {
                                vid.textTracks[t].mode = t === 0 ? 'showing' : 'hidden';
                            }
                            console.log('[OS Subs] Subtitles activated');
                        }
                    } catch (err) {
                        console.error('[OS Subs] Error activating subtitles:', err);
                    }
                };
            }(video), 1000);
        }
    }

    async function setupSubs() {
        console.log('[OS Subs] Setting up subtitles...');
        
        var videoInfo = getVideoInfo();
        console.log('[OS Subs] Video info:', videoInfo);
        
        if (!videoInfo.imdb && !videoInfo.tmdb) {
            console.log('[OS Subs] No video ID found');
            return;
        }

        var interfaceLang = getInterfaceLang();
        console.log('[OS Subs] Interface language:', interfaceLang);
        
        var priority = LANG_PRIORITY[interfaceLang] || LANG_PRIORITY.en;

        var subs = [];

        if (videoInfo.imdb) {
            console.log('[OS Subs] Fetching IMDB subtitles for:', videoInfo.imdb);
            subs = await fetchSubs(videoInfo.imdb, false, videoInfo.season, videoInfo.episode);
        }

        if (!subs.length && videoInfo.tmdb) {
            console.log('[OS Subs] Fetching TMDB subtitles for:', videoInfo.tmdb);
            subs = await fetchSubs(videoInfo.tmdb, true, videoInfo.season, videoInfo.episode);
        }

        if (!subs.length) {
            console.log('[OS Subs] No subtitles found');
            return;
        }

        var processed = [];
        for (var i = 0; i < subs.length; i++) {
            var s = subs[i];
            if (s.url && LANG_LABELS[s.lang]) {
                processed.push({
                    lang: s.lang,
                    url: s.url,
                    label: LANG_LABELS[s.lang][interfaceLang] || LANG_LABELS[s.lang].en
                });
            }
        }

        processed.sort(function(a, b) {
            return priority.indexOf(a.lang) - priority.indexOf(b.lang);
        });

        console.log('[OS Subs] Processed subtitles:', processed.length);
        
        addSubtitlesToPlayer(processed);
    }

    window.addEventListener('load', function() {
        console.log('[OS Subs] Page loaded, starting subtitle setup...');
        setTimeout(setupSubs, 2000);
    });

    var lastUrl = window.location.href;
    setInterval(function() {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            console.log('[OS Subs] URL changed, reloading subtitles...');
            setTimeout(setupSubs, 1000);
        }
    }, 1000);

    window.enableSubtitles = function() {
        console.log('[OS Subs] Manual trigger');
        setupSubs();
    };

    console.log('[OS Subs] Plugin loaded');

})();
