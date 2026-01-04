(function() {
    'use strict';
    
    // EasyTorrent плагін для Lampa - виправлена версія для Samsung TV (Tizen)
    var EasyTorrent = {};
    var version = '2.0-fixed';
    var icon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"></path></svg>';
    
    // Конфігурація для TV
    var config = {
        version: '2.0',
        generated: '2026-01-04',
        device: {
            type: 'tv4k',
            supportedhdr: ['hdr10', 'hdr10plus', 'dolbyvision'],
            supportedaudio: ['stereo']
        },
        parameterpriority: ['audiotrack', 'resolution', 'availability', 'bitrate', 'hdr', 'audioquality'],
        audiotrackpriority: ['UKR', 'LeDoyen'],
        preferences: {
            minseeds: 2,
            recommendationcount: 3
        },
        scoringrules: {
            weights: {
                audiotrack: 100,
                resolution: 85,
                availability: 70,
                bitrate: 55,
                hdr: 40,
                audioquality: 25
            },
            resolution: {'480': -60, '720': -30, '1080': 17, '1440': 42.5, '2160': 85},
            hdr: {'dolbyvision': 40, 'hdr10plus': 32, 'hdr10': 32, 'sdr': -16}
        }
    };
    
    // Перевірка наявності Lampa
    if (typeof Lampa === 'undefined') {
        console.error('EasyTorrent: Lampa не знайдено');
        return;
    }
    
    // Збереження конфігурації
    function saveConfig(newConfig) {
        try {
            if (typeof Lampa.Storage !== 'undefined' && Lampa.Storage.set) {
                Lampa.Storage.set('easytorrent_config_json', JSON.stringify(newConfig || config));
            }
        } catch(e) {
            console.error('EasyTorrent: помилка збереження', e);
        }
    }
    
    // Завантаження конфігурації
    function loadConfig() {
        try {
            if (typeof Lampa.Storage !== 'undefined' && Lampa.Storage.get) {
                var saved = Lampa.Storage.get('easytorrent_config_json', '{}');
                return JSON.parse(saved);
            }
        } catch(e) {
            console.error('EasyTorrent: помилка завантаження конфігурації', e);
        }
        return config;
    }
    
    var currentConfig = loadConfig();
    
    // Отримання роздільної здатності
    function getResolution(torrent) {
        if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
            var video = torrent.ffprobe.find(function(s) { return s.codectype === 'video'; });
            if (video) {
                if (video.height) {
                    return Math.min(video.height, 2160);
                }
                if (video.width) {
                    if (video.width >= 3800) return 2160;
                    if (video.width >= 2500) return 1440;
                    if (video.width >= 1900) return 1080;
                    if (video.width >= 1260) return 720;
                }
            }
        }
        var title = (torrent.Title || torrent.title || '').toLowerCase();
        if (/2160p|4k/i.test(title)) return 2160;
        if (/1440p|2k/i.test(title)) return 1440;
        if (/1080p/i.test(title)) return 1080;
        if (/720p/i.test(title)) return 720;
        return null;
    }
    
    // Пріоритет аудіодоріжок
    function getAudioPriority(torrent) {
        var tracks = [];
        if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
            torrent.ffprobe.filter(function(s) { return s.codectype === 'audio'; })
                .forEach(function(stream) {
                    var tags = stream.tags || {};
                    var title = (tags.title || tags.handlername || '').toLowerCase();
                    var lang = (tags.language || '').toLowerCase();
                    
                    // UKR, LeDoyen та інші пріоритети
                    if (title.includes('ukr') || lang.includes('ukr') || lang.includes('rus')) {
                        tracks.push('UKR');
                    }
                    if (title.includes('ledoyen')) tracks.push('LeDoyen');
                });
        }
        return tracks;
    }
    
    // Основна логіка підрахунку балів
    function calculateScore(torrent, isSeries, episodesCount) {
        var score = 100;
        var features = {
            resolution: getResolution(torrent),
            audiotracks: getAudioPriority(torrent),
            seeds: torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0
        };
        
        // Бали за роздільну здатність
        if (features.resolution) {
            var resScore = currentConfig.scoringrules.resolution[features.resolution] || 0;
            score += resScore;
        }
        
        // Бали за сіди
        var seeds = features.seeds;
        if (seeds >= currentConfig.preferences.minseeds) {
            score += Math.min(30, Math.log10(seeds + 1) * 12);
        }
        
        // TV бонус
        if (currentConfig.device.type.includes('tv') && features.resolution >= 1080) {
            score += 20;
        }
        
        return Math.max(0, Math.round(score));
    }
    
    // Патч парсера торентів
    function patchTorrentParser() {
        if (typeof Lampa.Parser === 'undefined' || !Lampa.Parser.get) return;
        
        var originalGet = Lampa.Parser.get;
        Lampa.Parser.get = function(data, call, failed) {
            var result = originalGet.apply(this, arguments);
            
            if (data.Results && Array.isArray(data.Results)) {
                data.Results.forEach(function(torrent, index) {
                    torrent.recommendScore = calculateScore(torrent);
                    torrent.recommendRank = index + 1;
                });
                
                // Сортування за балами
                data.Results.sort(function(a, b) {
                    return b.recommendScore - a.recommendScore;
                });
            }
            
            return result;
        };
    }
    
    // Додавання UI елементів
    function addRecommendationUI(element, item) {
        if (!element.recommendScore || !Lampa.Storage.get('easytorrent_enabled', true)) return;
        
        var scoreHtml = '<div class="torrent-score" style="background: rgba(76,175,80,0.2); color: #fff; padding: 0.3em 0.6em; border-radius: 12px; font-weight: bold; margin: 0.2em 0;">' + element.recommendScore + '</div>';
        var scoreDiv = $(scoreHtml);
        item.find('.torrent-item__title').after(scoreDiv);
    }
    
    // Ініціалізація налаштувань
    function initSettings() {
        if (typeof Lampa.SettingsApi === 'undefined') return;
        
        Lampa.SettingsApi.addComponent({
            component: 'easytorrent',
            name: 'EasyTorrent',
            icon: icon
        });
        
        Lampa.SettingsApi.addParam({
            component: 'easytorrent',
            param_name: 'easytorrent_enabled',
            type: 'trigger',
            default: true,
            field_name: 'Torrent Recommendations',
            description: 'Показувати рекомендовані торренти за якістю'
        });
    }
    
    // Слухач подій торентів
    function initListeners() {
        if (typeof Lampa.Listener === 'undefined') return;
        
        Lampa.Listener.follow('torrent', function(e) {
            if (e.type === 'render') {
                var element = e.element;
                if (element && element.recommendScore) {
                    addRecommendationUI(element, e.item);
                }
            }
        });
    }
    
    // Основна ініціалізація
    function init() {
        console.log('EasyTorrent: Ініціалізація v' + version);
        
        saveConfig(currentConfig);
        patchTorrentParser();
        initSettings();
        initListeners();
        
        Lampa.Noty.show('EasyTorrent активовано');
    }
    
    // Запуск після завантаження Lampa
    if (window.appready) {
        init();
    } else {
        document.addEventListener('appready', init);
    }
    
})();
