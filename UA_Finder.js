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
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?'
        ],
        PROXY_TIMEOUT_MS: 3500,
        MAX_PARALLEL_REQUESTS: 5,
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
        ".card__tracks { position: absolute !important; right: 0.3em !important; left: auto !important; top: 0.3em !important; background: rgba(0,0,0,0.6) !important; color: #FFFFFF !important; font-size: 1.1em !important; padding: 0.2em 0.5em !important; border-radius: 0.4em !important; font-weight: 700 !important; z-index: 20 !important; width: fit-content !important; }" +
        ".card__tracks.positioned-below-rating { top: 1.85em !important; }" +
        ".card__tracks div { display: flex !important; align-items: center !important; gap: 4px !important; }" +
        ".card__tracks .flag-css { display: inline-block; width: 1.2em; height: 0.8em; background: linear-gradient(to bottom, #0057B7 50%, #FFD700 50%); border-radius: 1px; }" +
        "</style>";
    
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    var requestQueue = [];
    var activeRequests = 0;

    function processQueue() {
        if (activeRequests >= LTF_CONFIG.MAX_PARALLEL_REQUESTS) return; 
        var task = requestQueue.shift();
        if (!task) return;
        activeRequests++;
        task(function() {
            activeRequests--;
            setTimeout(processQueue, 50);
        });
    }

    function fetchWithProxy(url, callback) {
        var currentProxyIndex = 0;
        function tryNextProxy() {
            if (currentProxyIndex >= LTF_CONFIG.PROXY_LIST.length) return callback(new Error('All proxies failed'));
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            
            $.ajax({
                url: proxyUrl,
                method: 'GET',
                timeout: LTF_CONFIG.PROXY_TIMEOUT_MS,
                success: function(data) { callback(null, data); },
                error: function() {
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

    function updateCardListTracksElement(cardView, trackCount) {
        if (!trackCount) return;
        var wrapper = cardView.querySelector('.card__tracks');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'card__tracks';
            var inner = document.createElement('div');
            wrapper.appendChild(inner);
            cardView.appendChild(wrapper);
        }
        var displayLabel = (trackCount === 1) ? ukraineFlagSVG : trackCount + 'x' + ukraineFlagSVG;
        wrapper.querySelector('div').innerHTML = displayLabel;
    }

    function processListCard(cardElement) {
        var data = cardElement.card_data;
        var view = cardElement.querySelector('.card__view');
        if (!data || !view) return;

        var type = data.media_type || data.type || (data.name ? 'tv' : 'movie');
        var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + type + '_' + data.id;
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var cached = cache[cacheKey];

        if (cached && (Date.now() - cached.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS)) {
            updateCardListTracksElement(view, cached.track_count);
        } else {
            requestQueue.push(function(done) {
                var searchTitle = data.original_title || data.title || data.name || '';
                var year = (data.release_date || data.first_air_date || '').substring(0, 4);
                if (!year) { done(); return; }

                var url = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(searchTitle) + '&year=' + year;
                
                fetchWithProxy(url, function(err, dataProxy) {
                    var count = 0;
                    if (!err && dataProxy) {
                        try {
                            var torrents = typeof dataProxy === 'string' ? JSON.parse(dataProxy) : dataProxy;
                            for (var i = 0; i < torrents.length; i++) {
                                var c = countUkrainianTracks(torrents[i].title);
                                if (c > count) count = c;
                            }
                        } catch(e) {}
                    }
                    var currentCache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
                    currentCache[cacheKey] = { track_count: count, timestamp: Date.now() };
                    Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, currentCache);
                    updateCardListTracksElement(view, count);
                    done();
                });
            });
            processQueue();
        }
    }

    function init() {
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
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
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', function(e) { if (e.type === 'ready') init(); });

})();
