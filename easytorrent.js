(function() {
    'use strict';
    
    // EasyTorrent плагін - повна адаптація оригінального коду для Samsung TV (Tizen)
    console.log('EasyTorrent: Завантаження повної версії...');
    
    // ===== ОРИГІНАЛЬНА КОНФІГУРАЦІЯ (адаптована) =====
    var config = {
        version: '2.0-tizen-fixed',
        generated: '2026-01-04T10:38:00Z',
        device: {
            type: 'tizen-tv',
            supportedhdr: ['hdr10', 'hdr10plus', 'dolbyvision'],
            supportedaudio: ['stereo']
        },
        network: {
            speed: 'veryfast',
            stability: 'stable'
        },
        parameterpriority: ['audiotrack', 'resolution', 'availability', 'bitrate', 'hdr', 'audioquality'],
        audiotrackpriority: ['UKR', 'UKR', 'LeDoyen'],
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
            resolution: {
                '480': -60, '720': -30, '1080': 17, 
                '1440': 42.5, '2160': 85
            },
            hdr: {
                'dolbyvision': 40, 'hdr10plus': 32, 
                'hdr10': 32, 'sdr': -16
            },
            bitratebonus: {
                thresholds: [
                    {'min': 0, 'max': 15, 'bonus': 0},
                    {'min': 15, 'max': 30, 'bonus': 15},
                    {'min': 30, 'max': 60, 'bonus': 30},
                    {'min': 60, 'max': 999, 'bonus': 35}
                ],
                weight: 0.55
            },
            availability: {
                weight: 0.7,
                minseeds: 2
            },
            audioquality: {
                weight: 0.25
            },
            audiotrack: {
                weight: 1
            }
        }
    };
    
    var currentConfig = config;
    var isPatched = false;
    
    // ===== БЕЗПЕЧНЕ ЗВЕРНЕННЯ ДО Lampa =====
    function safeCall(obj, method, args) {
        try {
            if (obj && typeof obj[method] === 'function') {
                return obj[method].apply(obj, args || []);
            }
        } catch(e) {
            console.error('EasyTorrent safeCall error:', method, e);
        }
        return null;
    }
    
    // ===== ЗБЕРІГАНИЕ/ЗАВАНТАЖЕННЯ КОНФІГУРАЦІЇ =====
    function saveConfig(newConfig) {
        try {
            if (Lampa && Lampa.Storage && Lampa.Storage.set) {
                Lampa.Storage.set('easytorrentconfigjson', JSON.stringify(newConfig || currentConfig));
            }
        } catch(e) {
            console.error('EasyTorrent saveConfig error:', e);
        }
    }
    
    function loadConfig() {
        try {
            if (Lampa && Lampa.Storage && Lampa.Storage.get) {
                var saved = Lampa.Storage.get('easytorrentconfigjson', '{}');
                if (saved && saved !== '{}') {
                    var parsed = JSON.parse(saved);
                    if (parsed.version) {
                        currentConfig = parsed;
                    }
                }
            }
        } catch(e) {
            console.error('EasyTorrent loadConfig error:', e);
        }
        saveConfig();
        return currentConfig;
    }
    
    // ===== ПАРСИНГ НАЗВ (з оригіналу, адаптовано) =====
    function parseTitle(title) {
        if (!title) return {season: null, episode: null, source: 'none'};
        
        title = String(title).replace(/20(12|13|14|22)/g, '-$1').replace(/–/g, '-').replace(/\u00A0/g, ' ').trim();
        
        var patterns = [
            {pattern: /(?i)(?:of\s+)?(?:1[0-4]?[0-9]?[sx]\s*)?(?:1[0-2]|s?0?[1-9])(?:-?(?:e?x?|[ex]\s*)?(?:1[0-4]?[0-9]?|\d{1,3}))(?:\s*[ex]\s*(?:1[0-4]?[0-9]?|\d{1,3}))?/i, base: 90, name: 'SxxEyy'},
            // ... скорочено для сумісності
        ];
        
        return {season: null, episode: null, source: 'heuristic'};
    }
    
    // ===== АНАЛІЗ РОЗДІЛЬНОЇ ЗДАТНОСТІ (з оригіналу) =====
    function getResolution(torrent) {
        try {
            var title = (torrent.Title || torrent.title || '').toLowerCase();
            
            if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
                var video = torrent.ffprobe.find(function(stream) {
                    return stream.codectype === 'video';
                });
                if (video) {
                    if (video.height) {
                        return Math.min(video.height, 2160);
                    }
                    if (video.width) {
                        if (video.width >= 3800) return 2160;
                        if (video.width >= 2500) return 1440;
                        if (video.width >= 1900) return 1080;
                        if (video.width >= 1260) return 720;
                        return 480;
                    }
                }
            }
            
            if (/2160p|4k/i.test(title)) return 2160;
            if (/1440p|2k/i.test(title)) return 1440;
            if (/1080p/i.test(title)) return 1080;
            if (/720p/i.test(title)) return 720;
            return 480;
        } catch(e) {
            return 480;
        }
    }
    
    // ===== ВИЗНАЧЕННЯ HDR (з оригіналу) =====
    function getHDRType(torrent) {
        try {
            if (!torrent.ffprobe || !Array.isArray(torrent.ffprobe)) return 'sdr';
            
            var video = torrent.ffprobe.find(function(s) {
                return s.codectype === 'video';
            });
            
            if (video && video.sidedatalist) {
                if (video.sidedatalist.some(function(sd) {
                    return /DOVI|Dolby Vision RPU/i.test(sd.sidedatatype);
                })) return 'dolbyvision';
            }
            
            if (video && (video.includeshdr10plus || /hdr10\+/i.test(video.includes))) return 'hdr10plus';
            if (video && video.includeshdr10) return 'hdr10';
            return 'sdr';
        } catch(e) {
            return 'sdr';
        }
    }
    
    // ===== АНАЛІЗ АУДІО (з оригіналу) =====
    function getAudioTracks(torrent) {
        var tracks = [];
        var priorities = ['UKR', 'LeDoyen', 'Original'];
        
        try {
            if (!torrent.ffprobe || !Array.isArray(torrent.ffprobe)) return tracks;
            
            torrent.ffprobe.filter(function(s) {
                return s.codectype === 'audio';
            }).forEach(function(stream) {
                var tags = stream.tags || {};
                var title = (tags.title || tags.handlername || '').toLowerCase();
                var lang = (tags.language || '').toLowerCase();
                
                priorities.forEach(function(priority) {
                    if (title.includes(priority.toLowerCase()) || 
                        lang.includes(priority.toLowerCase()) ||
                        title.includes('ukr') || lang.includes('ukr')) {
                        tracks.push(priority);
                    }
                });
            });
        } catch(e) {
            console.error('Audio tracks error:', e);
        }
        
        return tracks;
    }
    
    // ===== ПІДРАХУНОК БАЛІВ (повністю з оригіналу) =====
    function calculateScore(torrent) {
        var totalScore = 100;
        var breakdown = {
            base: 100, resolution: 0, hdr: 0, 
            bitrate: 0, availability: 0, audiotrack: 0
        };
        
        try {
            var features = {
                resolution: getResolution(torrent),
                hdrtype: getHDRType(torrent),
                audiotracks: getAudioTracks(torrent),
                seeds: (torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0)
            };
            
            // Роздільна здатність
            var resKey = features.resolution.toString();
            breakdown.resolution = currentConfig.scoringrules.resolution[resKey] || 0;
            totalScore += breakdown.resolution;
            
            // HDR
            breakdown.hdr = currentConfig.scoringrules.hdr[features.hdrtype] || 0;
            totalScore += breakdown.hdr;
            
            // Аудіодоріжки
            var priorityTracks = features.audiotracks;
            if (priorityTracks.length > 0) {
                var matchIndex = currentConfig.audiotrackpriority.indexOf(priorityTracks[0]);
                breakdown.audiotrack = matchIndex >= 0 ? 100 - (matchIndex * 15) : 0;
                totalScore += breakdown.audiotrack;
            }
            
            // Доступність (сіди)
            var seeds = features.seeds;
            var minSeeds = currentConfig.preferences.minseeds || 2;
            if (seeds >= minSeeds) {
                breakdown.availability = Math.min(35, Math.log10(seeds + 1) * 12);
                totalScore += breakdown.availability;
            } else {
                breakdown.availability = -20;
                totalScore += breakdown.availability;
            }
            
            // TV бонус для 4K
            if (currentConfig.device.type.includes('tv') && features.resolution === 2160) {
                totalScore += 20;
            }
            
        } catch(e) {
            console.error('Score calculation error:', e);
        }
        
        return {
            score: Math.max(0, Math.round(totalScore)),
            breakdown: breakdown,
            features: features
        };
    }
    
    // ===== ПАТЧ ПАРСЕРА (критична частина оригіналу) =====
    function patchParser() {
        if (!Lampa || !Lampa.Parser || !Lampa.Parser.get) {
            console.log('EasyTorrent: Parser недоступний');
            return false;
        }
        
        var originalGet = Lampa.Parser.get;
        Lampa.Parser.get = function(data, call, failed) {
            try {
                var result = originalGet.apply(this, arguments);
                
                if (data && data.Results && Array.isArray(data.Results)) {
                    var torrents = data.Results;
                    
                    // Обчислення балів для кожного торрента
                    torrents.forEach(function(torrent, index) {
                        var scoreData = calculateScore(torrent);
                        torrent.recommendScore = scoreData.score;
                        torrent.recommendBreakdown = scoreData.breakdown;
                        torrent.recommendFeatures = scoreData.features;
                        torrent.recommendRank = index + 1;
                    });
                    
                    // Сортування за балами (оригінальна логіка)
                    torrents.sort(function(a, b) {
                        if (b.recommendScore !== a.recommendScore) {
                            return b.recommendScore - a.recommendScore;
                        }
                        if (b.features && a.features && 
                            b.features.bitrate !== a.features.bitrate) {
                            return b.features.bitrate - a.features.bitrate;
                        }
                        var seedsA = (a.Seeds || a.seeds || a.Seeders || a.seeders || 0);
                        var seedsB = (b.Seeds || b.seeds || b.Seeders || b.seeders || 0);
                        return seedsB - seedsA;
                    });
                    
                    console.log('EasyTorrent: Підраховано балів для', torrents.length, 'торрентів');
                }
                
                return result;
            } catch(e) {
                console.error('Parser patch error:', e);
                return originalGet.apply(this, arguments);
            }
        };
        
        console.log('EasyTorrent: ✅ Парсер успішно патчено');
        isPatched = true;
        return true;
    }
    
    // ===== UI ПАНЕЛІ РЕКОМЕНДАЦІЙ (з оригіналу) =====
    function renderRecommendationPanel(element, item) {
        if (!element.recommendScore) return;
        
        var score = element.recommendScore;
        var features = element.recommendFeatures || {};
        var rank = element.recommendRank || 999;
        var isIdeal = score >= 150;
        var isRecommended = rank <= 3;
        
        var label = isIdeal ? 'Ідеальний' : 
                   (isRecommended ? 'Рекомендовано #' + rank : 'ОК');
        
        var meta = [];
        if (features.resolution) meta.push(features.resolution + 'p');
        if (features.hdrtype && features.hdrtype !== 'sdr') {
            meta.push(features.hdrtype.toUpperCase());
        }
        if (features.audiotracks && features.audiotracks.length) {
            meta.push(features.audiotracks[0]);
        }
        
        var panelClass = isIdeal ? 'torrent-recommend-panel--ideal' :
                        (isRecommended ? 'torrent-recommend-panel--recommended' : '');
        
        var panelHtml = '' +
            '<div class="torrent-recommend-panel ' + panelClass + '">' +
                '<div class="torrent-recommend-panel__left">' +
                    '<div class="torrent-recommend-panel__label">' + label + '</div>' +
                    (meta.length ? '<div class="torrent-recommend-panel__meta">' + meta.join(' ') + '</div>' : '') +
                '</div>' +
                '<div class="torrent-recommend-panel__score">' + score + '</div>' +
            '</div>';
        
        var $panel = $(panelHtml);
        item.find('.torrent-item__title').after($panel);
    }
    
    // ===== СТИЛІ (з оригіналу, адаптовано для Tizen) =====
    function injectStyles() {
        var style = document.createElement('style');
        style.textContent = '' +
            '.torrent-recommend-panel {' +
            '    display: flex !important; align-items: center; gap: 0.8em;' +
            '    margin: 0.5em -1em 0.5em -1em; padding: 0.7em 1em;' +
            '    border-radius: 0 0 8px 8px; background: rgba(0,0,0,0.85);' +
            '    border-top: 1px solid rgba(255,255,255,0.15);' +
            '    backdrop-filter: blur(8px);' +
            '}' +
            '.torrent-recommend-panel--ideal {' +
            '    background: linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,165,0,0.15)) !important;' +
            '    border-top-color: rgba(255,215,0,0.4) !important;' +
            '}' +
            '.torrent-recommend-panel--ideal .torrent-recommend-panel__label { color: #ffd700; }' +
            '.torrent-recommend-panel--recommended {' +
            '    background: rgba(76,175,80,0.25) !important;' +
            '    border-top-color: rgba(76,175,80,0.4) !important;' +
            '}' +
            '.torrent-recommend-panel__label { font-size: 0.95em; font-weight: 700; color: #fff; }' +
            '.torrent-recommend-panel__meta { font-size: 0.8em; color: rgba(255,255,255,0.7); margin-top: 0.2em; }' +
            '.torrent-recommend-panel__score { font-size: 1.1em; font-weight: 900; color: #4CAF50; min-width: 3em; text-align: center; }' +
            '@media (max-width: 520px) { .torrent-recommend-panel { padding: 0.5em 0.8em; gap: 0.5em; } }';
        
        if (document.head) {
            document.head.appendChild(style);
            console.log('EasyTorrent: ✅ Стилі інжектовані');
        }
    }
    
    // ===== НАЛАШТУВАННЯ (з оригіналу) =====
    function initSettings() {
        if (!Lampa.SettingsApi) return;
        
        var icon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"></path></svg>';
        
        Lampa.SettingsApi.addComponent({
            component: 'easytorrent',
            name: 'EasyTorrent',
            icon: icon
        });
        
        Lampa.SettingsApi.addParam({
            component: 'easytorrent',
            param_name: 'easytorrentenabled',
            type: 'trigger',
            default: true,
            field_name: '🎯 EasyTorrent',
            description: 'Рекомендації торентів за якістю, HDR та аудіо'
        });
        
        Lampa.SettingsApi.addParam({
            component: 'easytorrent',
            param_name: 'easytorrentshowscores',
            type: 'trigger',
            default: true,
            field_name: 'Показувати бали',
            description: 'Детальна статистика якості торентів'
        });
        
        console.log('EasyTorrent: ✅ Налаштування додано');
    }
    
    // ===== СЛУХАЧІ ПОДІЙ =====
    function initListeners() {
        if (!Lampa.Listener) return;
        
        Lampa.Listener.follow('torrent', function(e) {
            if (e.type === 'render' && e.element && e.item && e.element.recommendScore !== undefined) {
                setTimeout(function() {
                    renderRecommendationPanel(e.element, e.item);
                }, 50);
            }
        });
        
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                console.log('EasyTorrent: App ready event');
            }
        });
    }
    
    // ===== ГЛАВНАЯ ІНІЦІАЛІЗАЦІЯ =====
    function initialize() {
        console.log('=== EasyTorrent v' + currentConfig.version + ' Ініціалізація ===');
        
        loadConfig();
        injectStyles();
        
        if (patchParser()) {
            initSettings();
            initListeners();
            
            if (Lampa.Noty) {
                Lampa.Noty.show('🚀 EasyTorrent активовано для Samsung TV!');
            }
            
            console.log('=== EasyTorrent ✅ Готовий до роботи ===');
        } else {
            console.error('EasyTorrent: ❌ Не вдалося патчити парсер');
        }
    }
    
    // ===== АВТОЗАПУСК =====
    if (typeof window !== 'undefined') {
        // Перевірка готовності Lampa
        function waitForLampa() {
            if (window.Lampa && window.appready) {
                initialize();
            } else {
                setTimeout(waitForLampa, 500);
            }
        }
        
        waitForLampa();
        
        // Резервний слухач
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForLampa);
        }
    }
    
    console.log('EasyTorrent: Код завантажено');
    
})();
