(function() {
    'use strict';
    
    console.log('EasyTorrent: Завантаження плагіна...');
    
    // ===== КОНФІГУРАЦІЯ =====
    var CONFIG = {
        version: '2.0-fixed-samsung',
        generated: '2026-01-04',
        device: {
            type: 'tizen-tv',
            supportedhdr: ['hdr10', 'hdr10plus', 'dolbyvision'],
            supportedaudio: ['stereo', '5.1']
        },
        parameterpriority: ['audiotrack', 'resolution', 'availability', 'bitrate', 'hdr', 'audioquality'],
        audiotrackpriority: ['UKR', 'LeDoyen', 'Original'],
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
                    {min: 0, max: 15, bonus: 0},
                    {min: 15, max: 30, bonus: 15},
                    {min: 30, max: 60, bonus: 30},
                    {min: 60, max: 999, bonus: 35}
                ],
                weight: 0.55
            },
            availability: {
                weight: 0.7,
                minseeds: 2
            }
        }
    };
    
    // ===== ГЛОБАЛЬНІ ЗМІННІ =====
    var currentConfig = CONFIG;
    var isInitialized = false;
    
    // ===== УТИЛІТИ =====
    function safeStorage(key, value) {
        try {
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                if (value === undefined) {
                    return Lampa.Storage.get(key, '{}');
                } else {
                    Lampa.Storage.set(key, value);
                    return value;
                }
            }
        } catch(e) {
            console.error('EasyTorrent Storage error:', e);
        }
        return value;
    }
    
    function loadConfig() {
        try {
            var saved = safeStorage('easytorrent_config_json');
            if (saved) {
                var parsed = JSON.parse(saved);
                if (parsed.version && parsed.version >= '2.0') {
                    currentConfig = parsed;
                }
            }
        } catch(e) {
            console.error('EasyTorrent config load error:', e);
        }
        safeStorage('easytorrent_config_json', JSON.stringify(currentConfig));
        return currentConfig;
    }
    
    // ===== АНАЛІЗ ТОРРЕНТІВ =====
    function getResolution(torrent) {
        try {
            var title = (torrent.Title || torrent.title || '').toLowerCase();
            
            if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
                var video = torrent.ffprobe.find(function(s) {
                    return s.codectype === 'video';
                });
                if (video && video.height) {
                    return Math.min(video.height, 2160);
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
    
    function getHDRType(torrent) {
        try {
            if (!torrent.ffprobe || !Array.isArray(torrent.ffprobe)) return 'sdr';
            
            var video = torrent.ffprobe.find(function(s) {
                return s.codectype === 'video';
            });
            
            if (video && video.sidedatalist) {
                if (video.sidedatalist.some(function(sd) {
                    return sd.sidedatatype === 'Dolby Vision RPU';
                })) return 'dolbyvision';
            }
            
            if (video && (video.includeshdr10plus || video.includes('hdr10+'))) return 'hdr10plus';
            if (video && video.includeshdr10) return 'hdr10';
            
            return 'sdr';
        } catch(e) {
            return 'sdr';
        }
    }
    
    function getAudioTracks(torrent) {
        var tracks = [];
        try {
            if (!torrent.ffprobe || !Array.isArray(torrent.ffprobe)) return tracks;
            
            var audioStreams = torrent.ffprobe.filter(function(s) {
                return s.codectype === 'audio';
            });
            
            var priorities = currentConfig.audiotrackpriority || [];
            
            audioStreams.forEach(function(stream) {
                var tags = stream.tags || {};
                var title = (tags.title || tags.handlername || '').toLowerCase();
                var lang = (tags.language || '').toLowerCase();
                
                priorities.forEach(function(priority, index) {
                    if (title.includes(priority.toLowerCase()) || lang.includes(priority.toLowerCase())) {
                        tracks.push({
                            name: priority,
                            priority: priorities.length - index
                        });
                    }
                });
            });
        } catch(e) {
            console.error('Audio analysis error:', e);
        }
        return tracks;
    }
    
    function estimateBitrate(torrent) {
        try {
            if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
                var video = torrent.ffprobe.find(function(s) {
                    return s.codectype === 'video';
                });
                if (video) {
                    if (video.tags && video.tags.BPS) {
                        return Math.round(parseInt(video.tags.BPS) / 1e6);
                    }
                    if (video.bitrate) {
                        return Math.round(parseInt(video.bitrate) / 1e6);
                    }
                }
            }
            return 0;
        } catch(e) {
            return 0;
        }
    }
    
    // ===== СИСТЕМА БАЛІВ =====
    function calculateScore(torrent) {
        var baseScore = 100;
        var breakdown = {
            base: 100, resolution: 0, hdr: 0, 
            bitrate: 0, availability: 0, audiotrack: 0
        };
        
        try {
            var features = {
                resolution: getResolution(torrent),
                hdrtype: getHDRType(torrent),
                audiotracks: getAudioTracks(torrent),
                bitrate: estimateBitrate(torrent),
                seeds: (torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0)
            };
            
            // Роздільна здатність
            var resKey = features.resolution.toString();
            breakdown.resolution = currentConfig.scoringrules.resolution[resKey] || 0;
            baseScore += breakdown.resolution;
            
            // HDR
            breakdown.hdr = currentConfig.scoringrules.hdr[features.hdrtype] || 0;
            baseScore += breakdown.hdr;
            
            // Аудіодоріжки
            if (features.audiotracks.length > 0) {
                breakdown.audiotrack = 25 * Math.min(1, features.audiotracks[0].priority / 3);
                baseScore += breakdown.audiotrack;
            }
            
            // Сіди
            var seeds = features.seeds;
            if (seeds >= currentConfig.preferences.minseeds) {
                breakdown.availability = Math.min(30, Math.log10(seeds + 1) * 12);
                baseScor
