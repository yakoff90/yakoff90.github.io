(function () {
    'use strict';

    console.log('[OS Subs] Plugin loading for Samsung TV');

    var OSV3 = 'https://opensubtitles-v3.strem.io/';
    var cache = {};
    var attempts = 0;
    var maxAttempts = 30;

    function getInterfaceLang() {
        try {
            var lang = 'en';
            if (window.Lampa && Lampa.Storage) {
                lang = Lampa.Storage.get('language') || 'en';
            }
            return lang.toLowerCase();
        } catch (e) {
            return 'en';
        }
    }

    var LANG_MAP = {
        eng: 'Англійські',
        ukr: 'Українські', 
        rus: 'Російські'
    };

    function fetchSubs(imdb, season, episode) {
        var key = imdb + '_' + (season || '0') + '_' + (episode || '0');
        if (cache[key]) {
            return Promise.resolve(cache[key]);
        }

        var url = '';
        if (season && episode && season > 0 && episode > 0) {
            url = OSV3 + 'subtitles/series/' + imdb + ':' + season + ':' + episode + '.json';
        } else {
            url = OSV3 + 'subtitles/movie/' + imdb + '.json';
        }

        return new Promise(function(resolve) {
            var xhr = new XMLHttpRequest();
            xhr.timeout = 5000;
            xhr.open('GET', url, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        var data = JSON.parse(xhr.responseText);
                        cache[key] = data.subtitles || [];
                        resolve(cache[key]);
                    } catch(e) {
                        resolve([]);
                    }
                } else {
                    resolve([]);
                }
            };
            xhr.onerror = function() {
                resolve([]);
            };
            xhr.ontimeout = function() {
                resolve([]);
            };
            setTimeout(function() {
                xhr.send();
            }, 200);
        });
    }

    function addSubtitlesToPlayer(subsArray, defaultIndex) {
        if (!subsArray || subsArray.length === 0) return;
        
        attempts = 0;
        var interval = setInterval(function() {
            attempts++;
            
            if (window.Lampa && Lampa.Player && typeof Lampa.Player.subtitles === 'function') {
                try {
                    Lampa.Player.subtitles(subsArray, defaultIndex);
                    console.log('[OS Subs] Successfully added ' + subsArray.length + ' subtitles');
                    clearInterval(interval);
                } catch(e) {
                    console.warn('[OS Subs] Error adding subtitles:', e);
                }
            }
            
            if (attempts >= maxAttempts) {
                console.warn('[OS Subs] Failed to add subtitles after ' + maxAttempts + ' attempts');
                clearInterval(interval);
            }
        }, 300);
    }

    function loadSubtitlesForCurrentVideo() {
        try {
            if (!window.Lampa || !Lampa.Activity || !Lampa.Player) {
                console.warn('[OS Subs] Lampa not ready, retrying...');
                setTimeout(loadSubtitlesForCurrentVideo, 1000);
                return;
            }

            var activity = Lampa.Activity.active();
            if (!activity || !activity.movie) return;

            var movie = activity.movie;
            if (!movie.imdb_id) return;

            var playdata = Lampa.Player.playdata();
            if (!playdata) return;

            var imdb = movie.imdb_id.replace('tt', '');
            var season = 0;
            var episode = 0;
            
            if (movie.first_air_date && playdata.season && playdata.episode) {
                season = parseInt(playdata.season) || 0;
                episode = parseInt(playdata.episode) || 0;
            }

            console.log('[OS Subs] Loading for IMDB:' + imdb + ' S' + season + 'E' + episode);

            fetchSubs(imdb, season > 0 ? season : null, episode > 0 ? episode : null).then(function(subs) {
                if (subs.length === 0) {
                    console.log('[OS Subs] No subtitles found');
                    return;
                }

                var lang = getInterfaceLang();
                var priority = lang === 'uk' ? ['ukr', 'eng', 'rus'] : 
                              lang === 'ru' ? ['rus', 'eng', 'ukr'] : 
                                              ['eng', 'ukr', 'rus'];

                var formattedSubs = [];
                
                for (var i = 0; i < subs.length; i++) {
                    var sub = subs[i];
                    if (sub && sub.url && sub.lang && LANG_MAP[sub.lang]) {
                        formattedSubs.push({
                            lang: sub.lang,
                            url: sub.url,
                            label: LANG_MAP[sub.lang]
                        });
                    }
                }

                if (formattedSubs.length === 0) return;

                formattedSubs.sort(function(a, b) {
                    var aIdx = priority.indexOf(a.lang);
                    var bIdx = priority.indexOf(b.lang);
                    aIdx = aIdx === -1 ? 999 : aIdx;
                    bIdx = bIdx === -1 ? 999 : bIdx;
                    return aIdx - bIdx;
                });

                var defaultIdx = 0;
                for (var j = 0; j < formattedSubs.length; j++) {
                    if (formattedSubs[j].lang === priority[0]) {
                        defaultIdx = j;
                        break;
                    }
                }

                console.log('[OS Subs] Found ' + formattedSubs.length + ' subtitles, adding...');
                
                setTimeout(function() {
                    addSubtitlesToPlayer(formattedSubs, defaultIdx);
                }, 1500);
            });
        } catch(e) {
            console.error('[OS Subs] Error:', e);
        }
    }

    function startListener() {
        console.log('[OS Subs] Starting listener...');
        
        var checkCount = 0;
        var checkInterval = setInterval(function() {
            checkCount++;
            
            if (window.Lampa && Lampa.Player && Lampa.Player.listener) {
                console.log('[OS Subs] Lampa API found, attaching listener');
                
                Lampa.Player.listener.follow('start', function() {
                    console.log('[OS Subs] Video started event');
                    setTimeout(loadSubtitlesForCurrentVideo, 1200);
                });
                
                Lampa.Player.listener.follow('change', function() {
                    console.log('[OS Subs] Video changed event');
                    setTimeout(loadSubtitlesForCurrentVideo, 1000);
                });
                
                clearInterval(checkInterval);
            } else if (checkCount > 50) {
                console.warn('[OS Subs] Lampa API not found after 25 seconds');
                clearInterval(checkInterval);
                
                setTimeout(function() {
                    if (window.Lampa && Lampa.Player) {
                        console.log('[OS Subs] Lampa loaded late, trying to load subtitles');
                        loadSubtitlesForCurrentVideo();
                    }
                }, 5000);
            }
        }, 500);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(startListener, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(startListener, 1000);
        });
    }

    window.addEventListener('load', function() {
        console.log('[OS Subs] Page fully loaded');
    });

})();
