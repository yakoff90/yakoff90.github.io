(function() {
    'use strict';

    var ukraineFlagSVG = '<i class="flag-css"></i>';
    
    var LTF_CONFIG = window.LTF_CONFIG || {
        BADGE_STYLE: 'text',
        SHOW_FOR_TV: true,
        CACHE_VERSION: 4,
        CACHE_KEY: 'lampa_ukr_tracks_cache',
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000,
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000,
        LOGGING_GENERAL: false,
        LOGGING_TRACKS: false,
        LOGGING_CARDLIST: false,
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        PROXY_LIST: [
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 3500,
        MAX_PARALLEL_REQUESTS: 10,
        DISPLAY_MODE: 'flag_count',
        SHOW_TRACKS_FOR_TV_SERIES: true,
        MANUAL_OVERRIDES: {
            '207703': { track_count: 1 },
            '1195518': { track_count: 2 }
        }
    };

    window.LTF_CONFIG = LTF_CONFIG;

    (function resetOldCache() {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var keys = Object.keys(cache);
        var hasOld = false;
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].indexOf(LTF_CONFIG.CACHE_VERSION + '_') !== 0) {
                hasOld = true;
                break;
            }
        }
        if (hasOld) {
            Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
        }
    })();

    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        ".card__view { position: relative; }" +
        ".card__tracks { position: absolute !important; right: 0.3em !important; left: auto !important; top: 0.3em !important; background: rgba(0,0,0,0.5) !important; color: #FFFFFF !important; font-size: 1.3em !important; padding: 0.2em 0.5em !important; border-radius: 1em !important; font-weight: 700 !important; z-index: 20 !important; width: fit-content !important; max-width: calc(100% - 1em) !important; overflow: hidden !important; }" +
        ".card__tracks.positioned-below-rating { top: 1.85em !important; }" +
        ".card__tracks div { text-transform: none !important; font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important; font-weight: 700 !important; letter-spacing: 0.1px !important; font-size: 1.05em !important; color: #FFFFFF !important; padding: 0 !important; white-space: nowrap !important; display: flex !important; align-items: center !important; gap: 4px !important; text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important; }" +
        ".card__tracks .flag-css { display: inline-block; width: 1.5em; height: 0.8em; vertical-align: middle; background: linear-gradient(to bottom, #0057B7 0%, #0057B7 50%, #FFD700 50%, #FFD700 100%); border-radius: 2px; box-shadow: 0 0 2px 0 rgba(0,0,0,0.6), 0 0 1px 1px rgba(0,0,0,0.2), inset 0px 1px 0px 0px #004593, inset 0px -1px 0px 0px #D0A800; }" +
        "</style>";
    
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    var requestQueue = [];
    var activeRequests = 0;
    var networkHealth = 1.0;

    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }

    function processQueue() {
        var adaptiveLimit = Math.max(3, Math.min(LTF_CONFIG.MAX_PARALLEL_REQUESTS, Math.floor(LTF_CONFIG.MAX_PARALLEL_REQUESTS * networkHealth)));
        if (activeRequests >= adaptiveLimit) return; 
        var task = requestQueue.shift();
        if (!task) return;
        activeRequests++;
        try {
            task(function() {
                activeRequests--;
                setTimeout(processQueue, 10);
            });
        } catch (e) {
            activeRequests--;
            setTimeout(processQueue, 10);
        }
    }

    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;
        function tryNextProxy() {
            if (currentProxyIndex >= LTF_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('Proxy error'));
                }
                return;
            }
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, LTF_CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl).then(function(r) {
                clearTimeout(timeoutId);
                return r.text();
            }).then(function(data) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(null, data);
                }
            }).catch(function() {
                clearTimeout(timeoutId);
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            });
        }
        tryNextProxy();
    }

    function countUkrainianTracks(title) {
        if (!title) return 0;
        var cleanTitle = title.toLowerCase();
        var subsIndex = cleanTitle.indexOf('sub');
        if (subsIndex !== -1) cleanTitle = cleanTitle.substring(0, subsIndex);
        var multiTrackMatch = cleanTitle.match(/(\d+)x\s*ukr/);
        if (multiTrackMatch && multiTrackMatch[1]) return parseInt(multiTrackMatch[1], 10);
        var singleTrackMatches = cleanTitle.match(/\bukr\b/g);
        return singleTrackMatches ? singleTrackMatches.length : 0;
    }

    function formatTrackLabel(count) {
        if (!count || count === 0) return null;
        var mode = LTF_CONFIG.DISPLAY_MODE;
        if (mode === 'flag_only') return ukraineFlagSVG;
        if (mode === 'flag_count') return (count === 1) ? ukraineFlagSVG : count + 'x' + ukraineFlagSVG;
        return (count === 1) ? 'Ukr' : count + 'xUkr';
    }

    function updateCardListTracksElement(cardView, trackCount) {
        var displayLabel = formatTrackLabel(trackCount);
        var wrapper = cardView.querySelector('.card__tracks');
        if (!displayLabel) {
            if (wrapper) wrapper.remove();
            return;
        }
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'card__tracks';
            var inner = document.createElement('div');
            wrapper.appendChild(inner);
            cardView.appendChild(wrapper);
        }
        var innerEl = wrapper.querySelector('div');
        if (innerEl && innerEl.innerHTML !== displayLabel) {
            innerEl.innerHTML = displayLabel;
        }
        var parentCard = cardView.closest('.card');
        if (parentCard) {
            var vote = parentCard.querySelector('.card__vote');
            if (vote && getComputedStyle(vote).top !== 'auto') wrapper.classList.add('positioned-below-rating');
            else wrapper.classList.remove('positioned-below-rating');
        }
    }

    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {
            var year = (normalizedCard.release_date || '').substring(0, 4);
            if (!year || isNaN(parseInt(year, 10))) { callback(null); done(); return; }

            function searchApi(title, apiCallback) {
                var url = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;
                fetchWithProxy(url, cardId, function(err, data) {
                    if (err || !data) return apiCallback(null);
                    try {
                        var torrents = JSON.parse(data);
                        var best = 0;
                        for (var i = 0; i < torrents.length; i++) {
                            var t = torrents[i];
                            var count = countUkrainianTracks(t.title);
                            if (count > best) best = count;
                        }
                        apiCallback(best > 0 ? {track_count: best} : null);
                    } catch(e) { apiCallback(null); }
                });
            }

            var titles = [];
            if (normalizedCard.original_title) titles.push(normalizedCard.original_title);
            if (normalizedCard.title && titles.indexOf(normalizedCard.title) === -1) titles.push(normalizedCard.title);

            var results = [];
            var completed = 0;
            titles.forEach(function(t) {
                searchApi(t, function(res) {
                    if (res) results.push(res);
                    completed++;
                    if (completed === titles.length) {
                        var finalBest = null;
                        var max = 0;
                        results.forEach(function(r) {
                            if (r.track_count > max) { max = r.track_count; finalBest = r; }
                        });
                        callback(finalBest);
                        done();
                    }
                });
            });
        });
    }

    function processListCard(cardElement) {
        if (!cardElement || !cardElement.isConnected) return;
        var data = cardElement.card_data;
        var view = cardElement.querySelector('.card__view');
        if (!data || !view) return;

        var type = data.media_type || data.type || (data.name ? 'tv' : 'movie');
        if (type === 'tv' && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;

        var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + type + '_' + data.id;
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var cached = cache[cacheKey];

        if (cached && (Date.now() - cached.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS)) {
            updateCardListTracksElement(view, cached.track_count);
        } else {
            getBestReleaseWithUkr({
                title: data.title || data.name,
                original_title: data.original_title || data.original_name,
                release_date: data.release_date || data.first_air_date
            }, data.id, function(res) {
                var count = res ? res.track_count : 0;
                var currentCache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
                currentCache[cacheKey] = { track_count: count, timestamp: Date.now() };
                Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, currentCache);
                if (cardElement.isConnected) updateCardListTracksElement(view, count);
            });
        }
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.addedNodes) {
                for (var i = 0; i < m.addedNodes.length; i++) {
                    var node = m.addedNodes[i];
                    if (node.nodeType === 1) {
                        if (node.classList.contains('card')) processListCard(node);
                        var nested = node.querySelectorAll('.card');
                        for (var j = 0; j < nested.length; j++) processListCard(nested[j]);
                    }
                }
            }
        });
    });

    function init() {
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;
        var containers = document.querySelectorAll('.cards, .card-list, .content');
        if (containers.length) {
            for (var i = 0; i < containers.length; i++) observer.observe(containers[i], { childList: true, subtree: true });
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }
        setTimeout(function() {
            var all = document.querySelectorAll('.card');
            for (var i = 0; i < all.length; i++) processListCard(all[i]);
        }, 1500);
    }

    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init);

    // Settings
    (function() {
        var SETTINGS_KEY = 'ltf_user_settings_v1';
        function startSettings() {
            if (!Lampa.SettingsApi) return;
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { type: 'button', component: 'ltf' },
                field: { name: 'Мітки "UA" доріжок', description: 'Налаштування українських аудіодоріжок' },
                onChange: function() {
                    Lampa.Settings.create('ltf', {
                        template: 'settings_ltf',
                        onBack: function() { Lampa.Settings.create('interface'); }
                    });
                }
            });
            Lampa.Template.add('settings_ltf', '<div></div>');
        }
        if (window.appready) startSettings();
        else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') startSettings(); });
    })();
})();
