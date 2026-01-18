!(function () {
  "use strict";
  var EASYTORRENT_NAME = "EasyTorrent";
  var EASYTORRENT_VERSION = "1.1.0 Beta";
  var EASYTORRENT_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>';
  
  var SUPABASE_URL = "https://wozuelafumpzgvllcjne.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvenVlbGFmdW1wemd2bGxjam5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Mjg1MDgsImV4cCI6MjA4MjUwNDUwOH0.ODnHlq_P-1wr_D6Jwaba1mLXIVuGBnnUZsrHI8Twdug";
  var QR_SETUP_URL = "https://darkestclouds.github.io/plugins/easytorrent/";
  
  var recommendedTorrents = [];
  var configPollInterval = null;

  // Базова конфігурація
  var DEFAULT_CONFIG = {
    version: "2.0",
    generated: "2026-01-01T21:21:24.718Z",
    device: {
      type: "tv_4k",
      supported_hdr: ["hdr10", "hdr10plus", "dolby_vision"],
      supported_audio: ["stereo"]
    },
    network: { speed: "very_fast", stability: "stable" },
    parameter_priority: [
      "audio_track",
      "resolution",
      "availability",
      "bitrate",
      "hdr",
      "audio_quality"
    ],
    audio_track_priority: [
      "Дубляж UKR",
      "UKR НеЗупиняйПродакшн",
      "Дубляж LeDoyen"
    ],
    preferences: { min_seeds: 2, recommendation_count: 3 },
    scoring_rules: {
      weights: {
        audio_track: 100,
        resolution: 85,
        availability: 70,
        bitrate: 55,
        hdr: 40,
        audio_quality: 25
      },
      resolution: { 480: -60, 720: -30, 1080: 17, 1440: 42.5, 2160: 85 },
      hdr: { dolby_vision: 40, hdr10plus: 32, hdr10: 32, sdr: -16 },
      bitrate_bonus: {
        thresholds: [
          { min: 0, max: 15, bonus: 0 },
          { min: 15, max: 30, bonus: 15 },
          { min: 30, max: 60, bonus: 30 },
          { min: 60, max: 999, bonus: 35 }
        ],
        weight: 0.55
      },
      availability: { weight: 0.7, min_seeds: 2 },
      audio_quality: { weight: 0.25 },
      audio_track: { weight: 1 }
    }
  };

  var currentConfig = DEFAULT_CONFIG;

  // Локалізація
  var LOCALIZATION = {
    easytorrent_title: {
      ru: "Рекомендации торрентов",
      uk: "Рекомендації торрентів",
      en: "Torrent Recommendations"
    },
    easytorrent_desc: {
      ru: "Показывать рекомендуемые торренты на основе качества, HDR и озвучки",
      uk: "Показувати рекомендовані торренти на основі якості, HDR та озвучки",
      en: "Show recommended torrents based on quality, HDR and audio"
    },
    recommended_section_title: {
      ru: "Рекомендуемые",
      uk: "Рекомендовані",
      en: "Recommended"
    },
    show_scores: {
      ru: "Показывать оценки",
      uk: "Показувати бали",
      en: "Show scores"
    },
    show_scores_desc: {
      ru: "Отображать оценку качества торрента",
      uk: "Відображати оцінку якості торрента",
      en: "Display torrent quality score"
    },
    ideal_badge: {
      ru: "Идеальный",
      uk: "Ідеально",
      en: "Ideal"
    },
    recommended_badge: {
      ru: "Рекомендуется",
      uk: "Рекомендовано",
      en: "Recommended"
    },
    config_json: {
      ru: "Конфигурация (JSON)",
      uk: "Конфігурація (JSON)",
      en: "Configuration (JSON)"
    },
    config_json_desc: {
      ru: "Нажмите для просмотра или изменения настроек",
      uk: "Натисніть для перегляду або зміни налаштувань",
      en: "Click to view or change settings"
    },
    config_view: {
      ru: "Просмотреть параметры",
      uk: "Переглянути параметри",
      en: "View parameters"
    },
    config_edit: {
      ru: "Вставить JSON",
      uk: "Вставити JSON",
      en: "Paste JSON"
    },
    config_reset: {
      ru: "Сбросить к заводским",
      uk: "Скинути до заводських",
      en: "Reset to defaults"
    },
    config_error: {
      ru: "Ошибка: Неверный формат JSON",
      uk: "Помилка: Невірний формат JSON",
      en: "Error: Invalid JSON format"
    }
  };

  function getLocalizedText(key) {
    var lang = Lampa.Storage.get("language", "ru");
    if (LOCALIZATION[key] && LOCALIZATION[key][lang]) {
      return LOCALIZATION[key][lang];
    }
    if (LOCALIZATION[key] && LOCALIZATION[key].uk) {
      return LOCALIZATION[key].uk;
    }
    if (LOCALIZATION[key] && LOCALIZATION[key].ru) {
      return LOCALIZATION[key].ru;
    }
    return key;
  }

  function saveConfig(config) {
    var configStr = typeof config === "string" ? config : JSON.stringify(config);
    Lampa.Storage.set("easytorrent_config_json", configStr);
    try {
      currentConfig = JSON.parse(configStr);
    } catch (e) {
      currentConfig = DEFAULT_CONFIG;
    }
  }

  function showConfigDetails() {
    var config = currentConfig;
    var items = [
      { title: "Версія конфігу", subtitle: config.version, noselect: true },
      {
        title: "Тип пристрою",
        subtitle: config.device.type.toUpperCase(),
        noselect: true
      },
      {
        title: "Підтримка HDR",
        subtitle: config.device.supported_hdr.join(", ") || "немає",
        noselect: true
      },
      {
        title: "Підтримка звуку",
        subtitle: config.device.supported_audio.join(", ") || "стерео",
        noselect: true
      },
      {
        title: "Пріоритет параметрів",
        subtitle: config.parameter_priority.join(" > "),
        noselect: true
      },
      {
        title: "Пріоритет озвучок",
        subtitle: config.audio_track_priority.length + " шт. • Натисніть для перегляду",
        action: "show_voices"
      },
      {
        title: "Мінімально сидів",
        subtitle: config.preferences.min_seeds,
        noselect: true
      },
      {
        title: "Кількість рекомендацій",
        subtitle: config.preferences.recommendation_count,
        noselect: true
      }
    ];

    Lampa.Select.show({
      title: "Поточна конфігурація",
      items: items,
      onSelect: function (item) {
        if (item.action === "show_voices") {
          showVoicesList();
        }
      },
      onBack: function () {
        Lampa.Controller.toggle("settings");
      }
    });
  }

  function showVoicesList() {
    var config = currentConfig;
    var items = config.audio_track_priority.map(function (voice, index) {
      return {
        title: (index + 1) + ". " + voice,
        noselect: true
      };
    });

    Lampa.Select.show({
      title: "Пріоритет озвучок",
      items: items,
      onBack: function () {
        showConfigDetails();
      }
    });
  }

  function detectResolution(torrent) {
    var title = (torrent.Title || torrent.title || "").toLowerCase();
    
    // Спроба отримати з ffprobe
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
        var stream = torrent.ffprobe[i];
        if (stream.codec_type === "video" && stream.height) {
          if (stream.height >= 2160 || (stream.width && stream.width >= 3800)) return 2160;
          if (stream.height >= 1440 || (stream.width && stream.width >= 2500)) return 1440;
          if (stream.height >= 1080 || (stream.width && stream.width >= 1900)) return 1080;
          if (stream.height >= 720 || (stream.width && stream.width >= 1260)) return 720;
          return 480;
        }
      }
    }
    
    // Виявлення з назви
    if (/\b2160p\b/.test(title) || /\b4k\b/.test(title)) return 2160;
    if (/\b1440p\b/.test(title) || /\b2k\b/.test(title)) return 1440;
    if (/\b1080p\b/.test(title)) return 1080;
    if (/\b720p\b/.test(title)) return 720;
    
    return null;
  }

  function detectHDR(torrent) {
    var title = (torrent.Title || torrent.title || "").toLowerCase();
    var hdrTypes = [];
    
    // Перевірка ffprobe для Dolby Vision
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
        var stream = torrent.ffprobe[i];
        if (stream.codec_type === "video" && stream.side_data_list) {
          for (var j = 0; j < stream.side_data_list.length; j++) {
            var sideData = stream.side_data_list[j];
            if (sideData.side_data_type === "DOVI configuration record" ||
                sideData.side_data_type === "Dolby Vision RPU") {
              hdrTypes.push("dolby_vision");
              break;
            }
          }
        }
      }
    }
    
    // Виявлення з назви
    if ((title.indexOf("hdr10+") !== -1 || title.indexOf("hdr10plus") !== -1 || title.indexOf("hdr10 plus") !== -1) &&
        hdrTypes.indexOf("hdr10plus") === -1) {
      hdrTypes.push("hdr10plus");
    }
    
    if ((title.indexOf("hdr10") !== -1 || /hdr-?10/.test(title)) &&
        hdrTypes.indexOf("hdr10") === -1) {
      hdrTypes.push("hdr10");
    }
    
    if ((title.indexOf("dolby vision") !== -1 || title.indexOf("dovi") !== -1 ||
         /\sp8\s/.test(title) || /\(dv\)/.test(title) || /\[dv\]/.test(title) ||
         /\sdv\s/.test(title) || /,\s*dv\s/.test(title)) &&
        hdrTypes.indexOf("dolby_vision") === -1) {
      hdrTypes.push("dolby_vision");
    }
    
    if ((/\bhdr\b/.test(title) || title.indexOf("[hdr]") !== -1 || 
         title.indexOf("(hdr)") !== -1 || title.indexOf(", hdr") !== -1) &&
        hdrTypes.indexOf("hdr10plus") === -1 && hdrTypes.indexOf("hdr10") === -1) {
      hdrTypes.push("hdr10");
    }
    
    if ((title.indexOf("sdr") !== -1 || title.indexOf("[sdr]") !== -1 || 
         title.indexOf("(sdr)") !== -1) && hdrTypes.indexOf("sdr") === -1) {
      hdrTypes.push("sdr");
    }
    
    if (hdrTypes.length === 0) return "sdr";
    
    var hdrScores = currentConfig.scoring_rules.hdr || {
      dolby_vision: 40,
      hdr10plus: 32,
      hdr10: 32,
      sdr: -16
    };
    
    var bestType = hdrTypes[0];
    var bestScore = hdrScores[bestType] || 0;
    
    for (var i = 0; i < hdrTypes.length; i++) {
      var type = hdrTypes[i];
      var score = hdrScores[type] || 0;
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }
    
    return bestType;
  }

  function parseIntSafe(value) {
    var num = parseInt(value, 10);
    return isFinite(num) ? num : null;
  }

  function createRange(start, end) {
    if (start === null) return null;
    if (end === null || end === start) {
      return { start: start, end: start };
    }
    return {
      start: Math.min(start, end),
      end: Math.max(start, end)
    };
  }

  function isSeasonValid(season) {
    return Number.isInteger ? Number.isInteger(season) : Math.floor(season) === season;
  }

  function isEpisodeValid(episode) {
    return Number.isInteger ? Number.isInteger(episode) : Math.floor(episode) === episode;
  }

  function isYearRangeValid(start, end) {
    var startInt = parseIntSafe(start);
    var endInt = parseIntSafe(end);
    if (startInt === null || endInt === null) return false;
    if (startInt < 1900 || startInt > 2100) return false;
    if (endInt < 1900 || endInt > 2100) return false;
    if (endInt < startInt) return false;
    return (endInt - startInt) <= 60;
  }

  function isTrashTitle(title) {
    if (!title) return false;
    var lowerTitle = title.toLowerCase();
    
    var trashPatterns = [
      /(?:^|[^a-zа-я0-9])(фильм|film|movie|movies)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(спецвыпуск|special|specials|sp|ova|ona|bonus|extra|экстра|спэшл|спешл|спэшал|ова|она|спэшел)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(трейлер|trailer|teaser|тизер)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(саундтрек|ost|soundtrack)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(клип|clip|pv)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(интервью|interview)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(репортаж|report)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(промо|promo)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(отрывок|preview)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(анонс|announcement)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(съемки|making of|behind the scenes)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(сборник|collection)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(документальный|docu|documentary)(?:$|[^a-zа-я0-9])/i,
      /(?:^|[^a-zа-я0-9])(концерт|concert|live)(?:$|[^a-zа-я0-9])/i,
      /movie\s*\d+/i,
      /film\s*\d+/i,
      /(?:^|[^a-zа-я0-9])(мультфильм|аниме-фильм|спецэпизод|спецсерія)(?:$|[^a-zа-я0-9])/i,
      /\bepisode of\b/i
    ];
    
    for (var i = 0; i < trashPatterns.length; i++) {
      if (trashPatterns[i].test(lowerTitle)) {
        return true;
      }
    }
    
    return false;
  }

  function isDubPattern(text, matchIndex, matchText) {
    if (String(matchText).toLowerCase().replace(/\s+/g, "") === "2x2") return true;
    
    var before = text.slice(Math.max(0, matchIndex - 12), matchIndex).toLowerCase();
    var after = text.slice(matchIndex + matchText.length, matchIndex + matchText.length + 12).toLowerCase();
    
    var isDubStart = /(дб|dub)\s*\(/i.test(before);
    var isDubEnd = /^\s*\)/.test(after);
    
    return isDubStart && isDubEnd;
  }

  function calculateConfidence(data) {
    var season = data.season;
    var seasonRange = data.seasonRange;
    var episode = data.episode;
    var episodeRange = data.episodeRange;
    var baseScore = data.base;
    var title = data.title;
    
    if (title && isTrashTitle(title)) return 0;
    
    var score = baseScore;
    var seasonNum = season !== null && season !== undefined ? season : 
                   (seasonRange && seasonRange.start !== null && seasonRange.start !== undefined ? seasonRange.start : null);
    var episodeNum = episode !== null && episode !== undefined ? episode : 
                     (episodeRange && episodeRange.start !== null && episodeRange.start !== undefined ? episodeRange.start : null);
    
    if (seasonNum !== null) score += 10;
    if (episodeNum !== null) score += 10;
    if (seasonNum !== null && episodeNum !== null) score += 15;
    if (seasonRange && seasonRange.end !== seasonRange.start) score += 5;
    if (episodeRange && episodeRange.end !== episodeRange.start) score += 5;
    
    if (seasonNum === null || !isSeasonValid(seasonNum)) score -= 60;
    if (episodeNum === null || !isEpisodeValid(episodeNum)) score -= 60;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function parseSeasonEpisode(title) {
    if (!title) {
      return { season: null, episode: null, source: "none", confidence: 0 };
    }
    
    // Нормалізація тексту
    var normalized = String(title);
    normalized = normalized.replace(/[\u2012\u2013\u2014\u2212]/g, "-");
    normalized = normalized.replace(/х/gi, "x");
    normalized = normalized.replace(/\u00A0/g, " ");
    normalized = normalized.replace(/\s+/g, " ").trim();
    
    // Пошук "із N" для загальної кількості серій
    var totalEpisodesMatch = /(?:^|[^a-zа-я0-9])(?:из|of)\s*(\d{1,4})(?:$|[^a-zа-я0-9])/i.exec(normalized);
    var totalEpisodes = totalEpisodesMatch ? parseIntSafe(totalEpisodesMatch[1]) : null;
    
    if (isTrashTitle(normalized)) {
      return { season: null, episode: null, source: "trash", confidence: 0 };
    }
    
    var seasonCandidates = [];
    var episodeCandidates = [];
    
    // Паттерн SxxEyy
    var sxxEyyMatch = /s(\d{1,2})\s*[ex](\d{1,3})(?:\s*[-]\s*[ex]?(\d{1,3}))?\b/i.exec(normalized);
    if (sxxEyyMatch) {
      var season = parseIntSafe(sxxEyyMatch[1]);
      var episodeStart = parseIntSafe(sxxEyyMatch[2]);
      var episodeEnd = sxxEyyMatch[3] ? parseIntSafe(sxxEyyMatch[3]) : null;
      var episodeRange = createRange(episodeStart, episodeEnd);
      
      if (isSeasonValid(season)) {
        seasonCandidates.push({
          season: season,
          base: 90,
          name: "SxxEyy"
        });
      }
      
      if (episodeRange && episodeRange.start !== null && isEpisodeValid(episodeRange.start)) {
        episodeCandidates.push({
          episode: episodeRange.start,
          episodeRange: episodeRange.start !== episodeRange.end ? episodeRange : undefined,
          base: 90,
          name: "SxxEyy"
        });
      }
    }
    
    // Паттерн xxXyy
    var xxXyyMatch = /\b(\d{1,2})\s*x\s*(\d{1,3})(?:\s*[-]\s*(\d{1,3}))?\b/i.exec(normalized);
    if (xxXyyMatch && !isDubPattern(normalized, xxXyyMatch.index, xxXyyMatch[0])) {
      var season2 = parseIntSafe(xxXyyMatch[1]);
      var epStart2 = parseIntSafe(xxXyyMatch[2]);
      var epEnd2 = xxXyyMatch[3] ? parseIntSafe(xxXyyMatch[3]) : null;
      var epRange2 = createRange(epStart2, epEnd2);
      
      if (isSeasonValid(season2)) {
        seasonCandidates.push({
          season: season2,
          base: 85,
          name: "xxXyy"
        });
      }
      
      if (epRange2 && epRange2.start !== null && isEpisodeValid(epRange2.start)) {
        episodeCandidates.push({
          episode: epRange2.start,
          episodeRange: epRange2.start !== epRange2.end ? epRange2 : undefined,
          base: 85,
          name: "xxXyy"
        });
      }
    }
    
    // Пошук у дужках []
    var bracketRegex = /[\[\(]([^\]\)]+)[\]\)]/g;
    var bracketMatch;
    while ((bracketMatch = bracketRegex.exec(normalized)) !== null) {
      var bracketContent = bracketMatch[1];
      
      // Діапазон у дужках
      var rangeInBracket = /(\d{1,4})\s*[-]\s*(\d{1,4})/.exec(bracketContent);
      if (rangeInBracket) {
        var rangeStart = parseIntSafe(rangeInBracket[1]);
        var rangeEnd = parseIntSafe(rangeInBracket[2]);
        
        if (rangeStart !== null && rangeEnd !== null && !isYearRangeValid(rangeStart, rangeEnd)) {
          var contextAfter = bracketContent.slice(rangeInBracket.index + rangeInBracket[0].length, 
                                                  rangeInBracket.index + rangeInBracket[0].length + 12).toLowerCase();
          var contextBefore = bracketContent.slice(Math.max(0, rangeInBracket.index - 12), 
                                                   rangeInBracket.index).toLowerCase();
          var hasEpisodeContext = /(эп|ep|из|of|tv|series|сер)/i.test(contextBefore + " " + contextAfter);
          
          if (hasEpisodeContext || Math.max(rangeStart, rangeEnd) >= 50) {
            var episodeRange3 = createRange(rangeStart, rangeEnd);
            episodeCandidates.push({
              episode: episodeRange3 ? episodeRange3.start : null,
              episodeRange: episodeRange3 && episodeRange3.start !== episodeRange3.end ? episodeRange3 : undefined,
              base: hasEpisodeContext ? 75 : 70,
              name: "bracket range"
            });
          }
        }
      }
      
      // Одиночний номер у дужках
      var singleInBracket = /(?:эп|ep|сер|серия)\s*(\d{1,4})(?:$|[^\d])/i.exec(bracketContent) ||
                            /(?:^|[^\d])(\d{1,4})(?:\s*(?:из|эп|ep|сер|of|from))(?:$|[^\d])/i.exec(bracketContent);
      if (singleInBracket) {
        var singleEpisode = parseIntSafe(singleInBracket[1]);
        if (singleEpisode !== null && isEpisodeValid(singleEpisode)) {
          episodeCandidates.push({
            episode: singleEpisode,
            base: 65,
            name: "bracket single"
          });
        }
      }
    }
    
    // Сезонні паттерни
    var seasonPatterns = [
      { re: /(?:^|[^a-zа-я0-9])(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?\s*сезон(?:а|ы|ів)?(?:$|[^a-zа-я0-9])/i, base: 75, name: "N сезон" },
      { re: /(?:^|[^a-zа-я0-9])сезон(?:а|ы|и|ів)?\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?(?:$|[^a-zа-я0-9])/i, base: 70, name: "Сезон N" },
      { re: /(?:^|[^a-zа-я0-9])сезон(?:а|ы|и|ів)?\s*:\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?/i, base: 66, name: "Сезон: N" },
      { re: /\bseason\s*[: ]\s*(\d{1,2})(?:\s*[-]\s*(\d{1,2}))?\b/i, base: 55, name: "Season:" },
      { re: /\bseason\s*(\d{1,2})\b/i, base: 52, name: "Season N" },
      { re: /\[\s*s(\d{1,2})\s*\]/i, base: 80, name: "[Sxx]" },
      { re: /\bs(\d{1,2})\b/i, base: 50, name: "Sxx (season-only)" }
    ];
    
    for (var i = 0; i < seasonPatterns.length; i++) {
      var pattern = seasonPatterns[i];
      var match = pattern.re.exec(normalized);
      if (match) {
        if (pattern.name === "Сезон: N") {
          var context = normalized.slice(match.index + match[0].length, 
                                         match.index + match[0].length + 20).toLowerCase();
          if (/^[\s]* (сер|series|episode|эпиз)/i.test(context)) {
            continue;
          }
        }
        
        var seasonStart = parseIntSafe(match[1]);
        var seasonEnd = match[2] ? parseIntSafe(match[2]) : null;
        
        if (seasonStart !== null) {
          var range = createRange(seasonStart, seasonEnd);
          seasonCandidates.push({
            season: range ? range.start : null,
            seasonRange: range && range.end !== range.start ? range : undefined,
            base: pattern.base,
            name: pattern.name
          });
        }
      }
    }
    
    // Серійні паттерни
    var episodePatterns = [
      { re: /(?:^|[^a-zа-я0-9])(?:серии|серія|серії|эпизод(?:ы)?|episodes|эп\.?)\s*[: ]?\s*(\d{1,4})(?:\s*[-]\s*(\d{1,4}))?(?:$|[^a-zа-я0-9])/i, base: 60, name: "серии" },
      { re: /(?:^|[^a-zа-я0-9])(\d{1,4})(?:\s*[-]\s*(\d{1,4}))?\s*(?:серии|серія|серії|эпизод(?:ы)?|эп\.?)(?:$|[^a-zа-я0-9])/i, base: 62, name: "1-4 серии" },
      { re: /(?:^|[^a-zа-я0-9])(\d{1,4})\s*[-]\s*(\d{1,4})\s*серия(?:$|[^a-zа-я0-9])/i, base: 62, name: "1-4 серия" },
      { re: /(?:^|[^a-zа-я0-9])(\d{1,4})\s*(?:серия|серія)(?:$|[^a-zа-я0-9])/i, base: 54, name: "N серия" },
      { re: /(?:серии|серії)\s*(\d{1,4})\s*из\s*(\d{1,4})/i, base: 65, name: "серии X из Y" }
    ];
    
    for (var j = 0; j < episodePatterns.length; j++) {
      var epPattern = episodePatterns[j];
      var epMatch = epPattern.re.exec(normalized);
      if (epMatch) {
        var epStart = parseIntSafe(epMatch[1]);
        var epEnd = epMatch[2] ? parseIntSafe(epMatch[2]) : null;
        
        if (epStart !== null) {
          var epRange = createRange(epStart, epEnd);
          episodeCandidates.push({
            episode: epRange ? epRange.start : null,
            episodeRange: epRange && epRange.end !== epRange.start ? epRange : undefined,
            base: epPattern.base,
            name: epPattern.name
          });
        }
      }
    }
    
    // Вибір найкращих кандидатів
    seasonCandidates.sort(function(a, b) {
      return b.base - a.base;
    });
    
    episodeCandidates.sort(function(a, b) {
      return b.base - a.base;
    });
    
    var bestSeason = seasonCandidates[0] || null;
    var bestEpisode = episodeCandidates[0] || null;
    
    if (bestSeason || bestEpisode) {
      var finalSeason = bestSeason && bestSeason.season !== null ? bestSeason.season : null;
      var finalEpisode = bestEpisode && bestEpisode.episode !== null ? bestEpisode.episode : null;
      var finalSeasonRange = bestSeason && bestSeason.seasonRange;
      var finalEpisodeRange = bestEpisode && bestEpisode.episodeRange;
      
      var validSeason = finalSeason !== null && isSeasonValid(finalSeason) ? finalSeason : null;
      var validEpisode = finalEpisode !== null && isEpisodeValid(finalEpisode) ? finalEpisode : null;
      
      var sourceParts = [];
      if (bestSeason && bestSeason.name) sourceParts.push(bestSeason.name);
      if (bestEpisode && bestEpisode.name) sourceParts.push(bestEpisode.name);
      var source = sourceParts.length > 0 ? sourceParts.join(" + ") : "heuristic";
      
      var baseScore = Math.max(
        bestSeason ? bestSeason.base : 0,
        bestEpisode ? bestEpisode.base : 0
      );
      
      var confidence = calculateConfidence({
        season: validSeason,
        seasonRange: finalSeasonRange,
        episode: validEpisode,
        episodeRange: finalEpisodeRange,
        base: baseScore,
        title: normalized
      });
      
      return {
        season: validSeason,
        seasonRange: finalSeasonRange,
        episode: validEpisode,
        episodeRange: finalEpisodeRange,
        episodesTotal: totalEpisodes,
        episodesCount: finalEpisodeRange ? 
          (finalEpisodeRange.end - finalEpisodeRange.start + 1) : 
          (validEpisode !== null ? 1 : null),
        source: source,
        confidence: confidence
      };
    }
    
    return { season: null, episode: null, source: "none", confidence: 0 };
  }

  function estimateBitrate(torrent, movieInfo, isSeries, episodeCount) {
    var title = torrent.Title || torrent.title || "";
    var size = torrent.Size || torrent.size_bytes || 0;
    
    // Спроба отримати з ffprobe
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
        var stream = torrent.ffprobe[i];
        if (stream.codec_type === "video") {
          if (stream.tags && stream.tags.BPS) {
            var bps = parseInt(stream.tags.BPS, 10);
            if (!isNaN(bps) && bps > 0) return Math.round(bps / 1000000);
          }
          if (stream.bit_rate) {
            var bitrate = parseInt(stream.bit_rate, 10);
            if (!isNaN(bitrate) && bitrate > 0) return Math.round(bitrate / 1000000);
          }
        }
      }
    }
    
    var duration = movieInfo ? (movieInfo.runtime || movieInfo.duration || movieInfo.episode_run_time) : 0;
    if (Array.isArray(duration)) {
      duration = duration.length > 0 ? duration[0] : 0;
    }
    if (!duration && isSeries) {
      duration = 45; // Припущення для серії
    }
    
    if (size > 0 && duration > 0) {
      var episodes = 1;
      if (isSeries) {
        var parsed = parseSeasonEpisode(title);
        if (parsed.episodesCount && parsed.episodesCount > 1) {
          episodes = parsed.episodesCount;
        } else if (parsed.episodesTotal && parsed.episodesTotal > 1) {
          episodes = parsed.episodesTotal;
        } else if (episodeCount > 1) {
          // Перевірка розміру для визначення кількості серій
          var is4k = /\b2160p\b|4k\b/i.test(title);
          var threshold = is4k ? 32212254720 : 10737418240; // 30GB для 4K, 10GB для HD
          if (size > threshold) {
            episodes = episodeCount;
          }
        }
      }
      
      var totalSeconds = 60 * duration * episodes;
      var totalBits = 8 * size;
      var bitrateMbps = Math.round(totalBits / (1000 * 1000) / totalSeconds);
      
      if (bitrateMbps > 0) return Math.min(bitrateMbps, 150);
    }
    
    // Спроба отримати з поля bitrate
    if (torrent.bitrate) {
      var bitrateMatch = String(torrent.bitrate).match(/(\d+\.?\d*)/);
      if (bitrateMatch) return Math.round(parseFloat(bitrateMatch[1]));
    }
    
    // Виявлення з назви
    var titleMatch = title.match(/(\d+\.?\d*)\s*(?:Mbps|Мбит)/i);
    if (titleMatch) return Math.round(parseFloat(titleMatch[1]));
    
    return 0;
  }

  var AUDIO_TRACKS_MAP = {
    "Дубляж RU": ["дубляж", "дб", "d", "dub"],
    "Дубляж UKR": ["ukr", "укр"],
    "Дубляж Піфагор": ["піфагор", "пифагор"],
    "Дубляж Red Head Sound": ["red head sound", "rhs"],
    "Дубляж Videofilm": ["videofilm"],
    "Дубляж MovieDalen": ["moviedalen"],
    "Дубляж LeDoyen": ["ledoyen"],
    "Дубляж Whiskey Sound": ["whiskey sound"],
    "Дубляж IRON VOICE": ["iron voice"],
    "Дубляж AlexFilm": ["alexfilm"],
    "Дубляж Amedia": ["amedia"],
    "MVO HDRezka": ["hdrezka", "hdrezka studio"],
    "MVO LostFilm": ["lostfilm"],
    "MVO TVShows": ["tvshows", "tv shows"],
    "MVO Jaskier": ["jaskier"],
    "MVO RuDub": ["rudub"],
    "MVO LE-Production": ["le-production"],
    "MVO Кубик в Кубі": ["кубик в кубе", "кубик в кубі"],
    "MVO NewStudio": ["newstudio"],
    "MVO Good People": ["good people"],
    "MVO IdeaFilm": ["ideafilm"],
    "MVO AMS": ["ams"],
    "MVO Baibako": ["baibako"],
    "MVO Profix Media": ["profix media"],
    "MVO NewComers": ["newcomers"],
    "MVO GoLTFilm": ["goltfilm"],
    "MVO JimmyJ": ["jimmyj"],
    "MVO Kerob": ["kerob"],
    "MVO LakeFilms": ["lakefilms"],
    "MVO Novamedia": ["novamedia"],
    "MVO Twister": ["twister"],
    "MVO Voice Project": ["voice project"],
    "MVO Dragon Money Studio": ["dragon money", "dms"],
    "MVO Syncmer": ["syncmer"],
    "MVO ColdFilm": ["coldfilm"],
    "MVO SunshineStudio": ["sunshinestudio"],
    "MVO Ultradox": ["ultradox"],
    "MVO Octopus": ["octopus"],
    "MVO OMSKBIRD": ["omskbird records", "omskbird"],
    "AVO Володарський": ["володарский"],
    "AVO Яроцький": ["яроцкий", "м. яроцкий"],
    "AVO Сербін": ["сербин", "ю. сербин"],
    "PRO Gears Media": ["gears media"],
    "PRO Hamsterstudio": ["hamsterstudio", "hamster"],
    "PRO P.S.Energy": ["p.s.energy"],
    "UKR НеЗупиняйПродакшн": ["незупиняйпродакшн"],
    "Original": ["original"]
  };

  function hasAudioTrack(text, trackName) {
    if (!text || !trackName) return false;
    
    var lowerText = text.toLowerCase();
    var keywords = AUDIO_TRACKS_MAP[trackName];
    
    if (!keywords) return false;
    
    for (var i = 0; i < keywords.length; i++) {
      var keyword = keywords[i].toLowerCase();
      if (keyword.length <= 3) {
        var regex = new RegExp("\\b" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        if (regex.test(lowerText)) return true;
      } else {
        if (lowerText.indexOf(keyword) !== -1) return true;
      }
    }
    
    return false;
  }

  function extractAudioTracks(torrent) {
    var title = (torrent.Title || torrent.title || "").toLowerCase();
    var tracks = [];
    
    // Перевірка ffprobe для аудіо
    if (torrent.ffprobe && Array.isArray(torrent.ffprobe)) {
      for (var i = 0; i < torrent.ffprobe.length; i++) {
        var stream = torrent.ffprobe[i];
        if (stream.codec_type === "audio") {
          var tags = stream.tags || {};
          var streamTitle = (tags.title || tags.handler_name || "").toLowerCase();
          var language = (tags.language || "").toLowerCase();
          
          for (var trackName in AUDIO_TRACKS_MAP) {
            if (tracks.indexOf(trackName) !== -1) continue;
            
            // Особлива обробка для російського дубляжу
            if (trackName === "Дубляж RU") {
              if ((language === "rus" || language === "russian") &&
                  (streamTitle.indexOf("dub") !== -1 || streamTitle.indexOf("дубляж") !== -1)) {
                tracks.push(trackName);
                continue;
              }
            }
            
            var keywords = AUDIO_TRACKS_MAP[trackName];
            for (var j = 0; j < keywords.length; j++) {
              var keyword = keywords[j].toLowerCase();
              if (keyword === language) {
                tracks.push(trackName);
                break;
              }
              if (keyword.length <= 3) {
                var regex = new RegExp("\\b" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
                if (regex.test(streamTitle)) {
                  tracks.push(trackName);
                  break;
                }
              } else {
                if (streamTitle.indexOf(keyword) !== -1) {
                  tracks.push(trackName);
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    // Перевірка назви торренту
    for (var trackName in AUDIO_TRACKS_MAP) {
      if (tracks.indexOf(trackName) !== -1) continue;
      if (hasAudioTrack(title, trackName)) {
        tracks.push(trackName);
      }
    }
    
    return tracks;
  }

  function extractFeatures(torrent, movieInfo, isSeries, episodeCount) {
    return {
      resolution: detectResolution(torrent),
      hdr_type: detectHDR(torrent),
      audio_tracks: extractAudioTracks(torrent),
      bitrate: estimateBitrate(torrent, movieInfo, isSeries, episodeCount)
    };
  }

  function calculateScore(torrentWithFeatures) {
    var config = currentConfig;
    var rules = config.scoring_rules;
    var features = torrentWithFeatures.features;
    var torrent = torrentWithFeatures;
    
    var score = 100;
    var seeds = torrent.Seeds || torrent.seeds || torrent.Seeders || torrent.seeders || 0;
    var trackerName = (torrent.Tracker || torrent.tracker || "").toLowerCase();
    
    var breakdown = {
      base: 100,
      resolution: 0,
      hdr: 0,
      bitrate: 0,
      availability: 0,
      audio: 0,
      audio_track: 0,
      tracker_bonus: 0
    };
    
    // Бонус за Toloka
    if (trackerName.indexOf("toloka") !== -1) {
      var tolokaBonus = 20;
      breakdown.tracker_bonus = tolokaBonus;
      score += tolokaBonus;
    }
    
    var paramPriority = config.parameter_priority || [
      "resolution", "hdr", "bitrate", "audio_track", "availability", "audio_quality"
    ];
    
    // Роздільна здатність
    var resolutionWeight = (rules.weights && rules.weights.resolution || 100) / 100;
    var resolutionScore = (rules.resolution && rules.resolution[features.resolution] || 0) * resolutionWeight;
    breakdown.resolution = resolutionScore;
    score += resolutionScore;
    
    // HDR
    var hdrWeight = (rules.weights && rules.weights.hdr || 100) / 100;
    var hdrScore = (rules.hdr && rules.hdr[features.hdr_type] || 0) * hdrWeight;
    breakdown.hdr = hdrScore;
    score += hdrScore;
    
    // Бітрейт
    var bitrateWeight = (rules.weights && rules.weights.bitrate || 
                        100 * (rules.bitrate_bonus && rules.bitrate_bonus.weight) || 55) / 100;
    var bitrateScore = 0;
    
    if (features.bitrate > 0) {
      var thresholds = rules.bitrate_bonus && rules.bitrate_bonus.thresholds;
      if (thresholds) {
        for (var i = 0; i < thresholds.length; i++) {
          var threshold = thresholds[i];
          if (features.bitrate >= threshold.min && features.bitrate < threshold.max) {
            bitrateScore = threshold.bonus * bitrateWeight;
            break;
          }
        }
      }
    } else {
      var bitratePriorityIndex = paramPriority.indexOf("bitrate");
      bitrateScore = (bitratePriorityIndex === 0 ? -50 : 
                     bitratePriorityIndex === 1 ? -30 : -15) * bitrateWeight;
    }
    
    breakdown.bitrate = bitrateScore;
    score += bitrateScore;
    
    // Аудіо доріжка
    var audioTrackWeight = (rules.weights && rules.weights.audio_track || 100) / 100;
    var priorityTracks = config.audio_track_priority || [];
    var torrentTracks = features.audio_tracks || [];
    var audioTrackScore = 0;
    
    for (var j = 0; j < priorityTracks.length; j++) {
      var trackName = priorityTracks[j];
      var hasTrack = false;
      
      for (var k = 0; k < torrentTracks.length; k++) {
        if (hasAudioTrack(torrentTracks[k], trackName)) {
          hasTrack = true;
          break;
        }
      }
      
      if (hasTrack) {
        audioTrackScore = 15 * (priorityTracks.length - j) * audioTrackWeight;
        break;
      }
    }
    
    breakdown.audio_track = audioTrackScore;
    score += audioTrackScore;
    
    // Доступність (сіди)
    var minSeeds = config.preferences && config.preferences.min_seeds ||
                   rules.availability && rules.availability.min_seeds || 1;
    var availabilityWeight = (rules.weights && rules.weights.availability ||
                             100 * (rules.availability && rules.availability.weight) || 70) / 100;
    var availabilityScore = 0;
    
    if (seeds < minSeeds) {
      var availabilityPriorityIndex = paramPriority.indexOf("availability");
      availabilityScore = (availabilityPriorityIndex === 0 ? -80 :
                         availabilityPriorityIndex === 1 ? -40 : -20) * availabilityWeight;
    } else {
      availabilityScore = 12 * Math.log10(seeds + 1) * availabilityWeight;
    }
    
    breakdown.availability = availabilityScore;
    score += availabilityScore;
    
    // Спеціальний бонус для 4K
    if (paramPriority[0] === "resolution" && 
        config.device && config.device.type && config.device.type.indexOf("4k") !== -1) {
      if (features.resolution === 2160 && features.bitrate > 0) {
        breakdown.special = 80;
        score += 80;
      } else if (features.resolution === 2160) {
        breakdown.special = 30;
        score += 30;
      } else if (features.resolution === 1080 && seeds > 50 && features.bitrate > 0) {
        breakdown.special = 10;
        score += 10;
      }
    }
    
    score = Math.max(0, Math.round(score));
    
    // Логування оцінки
    if (Lampa.Storage.get("easytorrent_show_scores", false)) {
      var torrentTitle = (torrent.Title || torrent.title || "").substring(0, 80);
      console.log("[EasyTorrent Score]", torrentTitle, {
        total: score,
        breakdown: breakdown,
        features: {
          resolution: features.resolution,
          hdr_type: features.hdr_type,
          bitrate: features.bitrate,
          audio_tracks: features.audio_tracks
        },
        seeds: seeds,
        paramPriority: paramPriority.slice(0, 3)
      });
    }
    
    return {
      score: score,
      breakdown: breakdown
    };
  }

  function processTorrentResults(results, requestData) {
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    if (!results || !Array.isArray(results)) return;
    
    console.log("[EasyTorrent] Отримано " + results.length + " торрентів");
    
    var movieInfo = requestData ? requestData.movie : null;
    var isSeries = !!(movieInfo && (movieInfo.original_name || 
                                   (movieInfo.number_of_seasons && movieInfo.number_of_seasons > 0) || 
                                   movieInfo.seasons));
    
    var episodeCount = 1;
    if (isSeries) {
      var maxEpisodesCount = 1;
      var maxEpisodesTotal = 1;
      
      for (var i = 0; i < results.length; i++) {
        var parsed = parseSeasonEpisode(results[i].Title || results[i].title || "");
        if (parsed.episodesCount && parsed.episodesCount > maxEpisodesCount) {
          maxEpisodesCount = parsed.episodesCount;
        }
        if (parsed.episodesTotal && parsed.episodesTotal > maxEpisodesTotal) {
          maxEpisodesTotal = parsed.episodesTotal;
        }
      }
      
      episodeCount = maxEpisodesCount > 1 ? maxEpisodesCount : maxEpisodesTotal;
      
      if (episodeCount > 1) {
        console.log("[EasyTorrent] Серіал: " + episodeCount + " серій у пакеті");
      }
    }
    
    // Оцінка всіх торрентів
    var scoredTorrents = [];
    for (var i = 0; i < results.length; i++) {
      var torrent = results[i];
      var features = extractFeatures(torrent, movieInfo, isSeries, episodeCount);
      var scoreResult = calculateScore({
        features: features,
        Seeds: torrent.Seeds,
        seeds: torrent.seeds,
        Seeders: torrent.Seeders,
        seeders: torrent.seeders,
        Title: torrent.Title,
        title: torrent.title,
        Tracker: torrent.Tracker,
        tracker: torrent.tracker
      });
      
      scoredTorrents.push({
        element: torrent,
        originalIndex: i,
        features: features,
        score: scoreResult.score,
        breakdown: scoreResult.breakdown
      });
    }
    
    // ВИПРАВЛЕНА ФУНКЦІЯ СОРТУВАННЯ
    scoredTorrents.sort(function(a, b) {
      // Спочатку за оцінкою (вищі оцінки перші)
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      
      // Потім за бітрейтом
      if (a.features.bitrate !== b.features.bitrate) {
        return b.features.bitrate - a.features.bitrate;
      }
      
      // Потім за кількістю сідів
      var aSeeds = a.element.Seeds || a.element.seeds || a.element.Seeders || a.element.seeders || 0;
      var bSeeds = b.element.Seeds || b.element.seeds || b.element.Seeders || b.element.seeders || 0;
      
      if (aSeeds !== bSeeds) {
        return bSeeds - aSeeds;
      }
      
      // Якщо все однакове, зберігаємо оригінальний порядок
      return a.originalIndex - b.originalIndex;
    });
    
    // Логування всіх оцінок
    if (scoredTorrents.length > 0) {
      console.log("=== ВСІ ТОРРЕНТИ (за оцінкою) ===");
      for (var i = 0; i < scoredTorrents.length; i++) {
        var item = scoredTorrents[i];
        var seeds = item.element.Seeds || item.element.seeds || 
                   item.element.Seeders || item.element.seeders || 0;
        var breakdown = item.breakdown;
        var titleShort = (item.element.Title || item.element.title || "").substring(0, 100);
        
        var parts = [];
        if (breakdown.audio_track !== undefined && breakdown.audio_track !== 0) {
          parts.push("A:" + (breakdown.audio_track > 0 ? "+" : "") + Math.round(breakdown.audio_track));
        }
        if (breakdown.resolution !== undefined && breakdown.resolution !== 0) {
          parts.push("R:" + (breakdown.resolution > 0 ? "+" : "") + Math.round(breakdown.resolution));
        }
        if (breakdown.bitrate !== undefined && breakdown.bitrate !== 0) {
          parts.push("B:" + (breakdown.bitrate > 0 ? "+" : "") + Math.round(breakdown.bitrate));
        }
        if (breakdown.availability !== undefined && breakdown.availability !== 0) {
          parts.push("S:" + (breakdown.availability > 0 ? "+" : "") + Math.round(breakdown.availability));
        }
        if (breakdown.hdr !== undefined && breakdown.hdr !== 0) {
          parts.push("H:" + (breakdown.hdr > 0 ? "+" : "") + Math.round(breakdown.hdr));
        }
        if (breakdown.special !== undefined && breakdown.special !== 0) {
          parts.push("SP:" + (breakdown.special > 0 ? "+" : "") + Math.round(breakdown.special));
        }
        
        var breakdownStr = parts.length > 0 ? "[" + parts.join(" ") + "]" : "[без деталей]";
        
        console.log(
          (i + 1) + ". [" + item.score + "] " + 
          (item.features.resolution || "?") + "p " + 
          item.features.hdr_type + " " + 
          item.features.bitrate + "Mbps Сіди:" + seeds + " " + 
          breakdownStr + " | " + titleShort
        );
      }
      console.log("=== ВСЬОГО: " + scoredTorrents.length + " торрентів ===");
    }
    
    // Вибір рекомендованих
    var recCount = currentConfig.preferences.recommendation_count || 3;
    var minSeeds = currentConfig.preferences.min_seeds || 2;
    
    var filtered = scoredTorrents.filter(function(item) {
      var seeds = item.element.Seeds || item.element.seeds || 
                 item.element.Seeders || item.element.seeders || 0;
      return seeds >= minSeeds;
    });
    
    recommendedTorrents = filtered.slice(0, recCount).map(function(item, index) {
      return {
        element: item.element,
        rank: index,
        score: item.score,
        features: item.features,
        isIdeal: index === 0 && item.score >= 150
      };
    });
    
    // Додавання даних до торрентів для подальшого відображення
    for (var i = 0; i < scoredTorrents.length; i++) {
      var item = scoredTorrents[i];
      item.element._recommendScore = item.score;
      item.element._recommendBreakdown = item.breakdown;
      item.element._recommendFeatures = item.features;
      
      // Визначення рангу на основі відсортованого списку
      var rank = i; // Ранг відповідає позиції в відсортованому списку
      item.element._recommendRank = rank;
      
      // Перевірка чи це ідеальний торрент
      var isRecommended = rank < recCount && 
                         (item.element.Seeds || item.element.seeds || 
                          item.element.Seeders || item.element.seeders || 0) >= minSeeds;
      
      item.element._recommendIsIdeal = rank === 0 && isRecommended && item.score >= 150;
      item.element._recommendIsRecommended = isRecommended;
    }
    
    // ВІДСОРТОВАНІ РЕЗУЛЬТАТИ ПОВЕРТАЄМО БЕЗПОСЕРЕДНЬО
    // Це найважливіша зміна - ми повертаємо відсортований список
    var sortedResults = scoredTorrents.map(function(item) {
      return item.element;
    });
    
    console.log("[EasyTorrent] Рекомендації збережені: " + recommendedTorrents.length + " шт.");
    console.log("[EasyTorrent] Повертаємо відсортований список з " + sortedResults.length + " торрентів");
    
    // Повертаємо відсортовані результати
    return sortedResults;
  }

  function renderTorrentBadge(eventData) {
    if (!Lampa.Storage.get("easytorrent_enabled", true)) return;
    
    var torrent = eventData.element;
    var itemElement = eventData.item;
    
    if (torrent._recommendRank === undefined) return;
    
    // Видалення старих бейджів
    itemElement.find(".torrent-recommend-badge").remove();
    itemElement.find(".torrent-recommend-panel").remove();
    
    var rank = torrent._recommendRank;
    var score = torrent._recommendScore;
    var breakdown = torrent._recommendBreakdown || {};
    var features = torrent._recommendFeatures || {};
    var recCount = currentConfig.preferences.recommendation_count || 3;
    var showScores = Lampa.Storage.get("easytorrent_show_scores", true);
    
    // Перевірка чи потрібно відображати бейдж
    if (!torrent._recommendIsIdeal && !torrent._recommendIsRecommended && rank >= recCount && !showScores) {
      return;
    }
    
    // Підготовка метаданих
    var metaParts = [];
    if (features.resolution) {
      metaParts.push(features.resolution + "p");
    }
    if (features.hdr_type) {
      var hdrDisplay = {
        dolby_vision: "DV",
        hdr10plus: "HDR10+",
        hdr10: "HDR10",
        sdr: "SDR"
      }[features.hdr_type] || String(features.hdr_type).toUpperCase();
      metaParts.push(hdrDisplay);
    }
    if (features.bitrate) {
      metaParts.push(features.bitrate + " Mbps");
    }
    
    // Визначення типу бейджа
    var badgeType = "neutral";
    var badgeLabel = "";
    
    if (torrent._recommendIsIdeal) {
      badgeType = "ideal";
      badgeLabel = getLocalizedText("ideal_badge");
    } else if (torrent._recommendIsRecommended) {
      badgeType = "recommended";
      badgeLabel = getLocalizedText("recommended_badge") + " • #" + (rank + 1);
    } else if (showScores) {
      badgeType = "neutral";
      badgeLabel = "Оцінка";
    } else {
      return; // Не показувати бейдж для нерекомендованих торрентів без оцінок
    }
    
    // Створення панелі
    var panel = $('<div class="torrent-recommend-panel torrent-recommend-panel--' + badgeType + '"></div>');
    
    var leftSide = $('<div class="torrent-recommend-panel__left"></div>');
    leftSide.append('<div class="torrent-recommend-panel__label">' + badgeLabel + '</div>');
    
    if (metaParts.length > 0) {
      leftSide.append('<div class="torrent-recommend-panel__meta">' + metaParts.join(" • ") + '</div>');
    }
    
    var rightSide = $('<div class="torrent-recommend-panel__right"></div>');
    if (showScores && score !== undefined) {
      rightSide.append('<div class="torrent-recommend-panel__score">' + score + '</div>');
    }
    
    panel.append(leftSide);
    
    // Додавання breakdown чипсів
    if (showScores && breakdown && Object.keys(breakdown).length > 0) {
      var chipsContainer = $('<div class="torrent-recommend-panel__chips"></div>');
      
      var breakdownItems = [
        { key: "audio_track", name: "Озвучка" },
        { key: "resolution", name: "Розд." },
        { key: "bitrate", name: "Бітрейт" },
        { key: "availability", name: "Сіди" },
        { key: "hdr", name: "HDR" },
        { key: "special", name: "Бонус" },
        { key: "tracker_bonus", name: "Трекер" }
      ];
      
      for (var i = 0; i < breakdownItems.length; i++) {
        var item = breakdownItems[i];
        var value = breakdown[item.key];
        
        if (value === undefined || value === 0) continue;
        
        var rounded = Math.round(value);
        var sign = rounded > 0 ? "+" : "";
        var chipClass = rounded >= 0 ? "tr-chip--pos" : "tr-chip--neg";
        
        chipsContainer.append(
          '<div class="tr-chip ' + chipClass + '">' +
          '<span class="tr-chip__name">' + item.name + '</span>' +
          '<span class="tr-chip__val">' + sign + rounded + '</span>' +
          '</div>'
        );
      }
      
      if (chipsContainer.children().length > 0) {
        panel.append(chipsContainer);
      }
    }
    
    panel.append(rightSide);
    itemElement.append(panel);
  }

  function setupSettings() {
    // Ініціалізація налаштувань
    if (Lampa.Storage.get("easytorrent_enabled") === undefined) {
      Lampa.Storage.set("easytorrent_enabled", true);
    }
    if (Lampa.Storage.get("easytorrent_show_scores") === undefined) {
      Lampa.Storage.set("easytorrent_show_scores", true);
    }
    
    // Додавання компонента в налаштування
    Lampa.SettingsApi.addComponent({
      component: "easytorrent",
      name: EASYTORRENT_NAME,
      icon: EASYTORRENT_ICON
    });
    
    // Про плагін
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_about", type: "static" },
      field: { name: "<div>" + EASYTORRENT_NAME + " " + EASYTORRENT_VERSION + "</div>" },
      onRender: function(element) {
        element.css("opacity", "0.7");
        element.find(".settings-param__name").css({
          "font-size": "1.2em",
          "margin-bottom": "0.3em"
        });
        element.append(
          '<div style="font-size: 0.9em; padding: 0 1.2em; line-height: 1.4;">' +
          'Автор: DarkestClouds<br>' +
          'Система рекомендацій торрентів на основі якості, HDR та озвучки' +
          '</div>'
        );
      }
    });
    
    // Увімкнення/вимкнення
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_enabled", type: "trigger", default: true },
      field: {
        name: getLocalizedText("easytorrent_title"),
        description: getLocalizedText("easytorrent_desc")
      }
    });
    
    // Показ оцінок
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_show_scores", type: "trigger", default: true },
      field: {
        name: getLocalizedText("show_scores"),
        description: getLocalizedText("show_scores_desc")
      }
    });
    
    // Конфігурація JSON
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: {
        name: "easytorrent_config_json",
        type: "static",
        default: JSON.stringify(DEFAULT_CONFIG)
      },
      field: {
        name: getLocalizedText("config_json"),
        description: getLocalizedText("config_json_desc")
      },
      onRender: function(element) {
        var updateDisplay = function() {
          var config = currentConfig;
          var displayText = config.device.type.toUpperCase() + " | " + config.parameter_priority[0];
          element.find(".settings-param__value").text(displayText);
        };
        
        updateDisplay();
        
        element.on("hover:enter", function() {
          Lampa.Select.show({
            title: getLocalizedText("config_json"),
            items: [
              { title: getLocalizedText("config_view"), action: "view" },
              { title: getLocalizedText("config_edit"), action: "edit" },
              { title: getLocalizedText("config_reset"), action: "reset" }
            ],
            onSelect: function(item) {
              if (item.action === "view") {
                showConfigDetails();
              } else if (item.action === "edit") {
                Lampa.Input.edit(
                  {
                    value: Lampa.Storage.get("easytorrent_config_json") || JSON.stringify(DEFAULT_CONFIG),
                    free: true
                  },
                  function(newValue) {
                    if (newValue) {
                      try {
                        JSON.parse(newValue);
                        saveConfig(newValue);
                        updateDisplay();
                        Lampa.Noty.show("OK");
                      } catch (e) {
                        Lampa.Noty.show(getLocalizedText("config_error"));
                      }
                    }
                    Lampa.Controller.toggle("settings");
                  }
                );
              } else if (item.action === "reset") {
                saveConfig(DEFAULT_CONFIG);
                updateDisplay();
                Lampa.Noty.show("OK");
                Lampa.Controller.toggle("settings");
              }
            },
            onBack: function() {
              Lampa.Controller.toggle("settings");
            }
          });
        });
      }
    });
    
    // QR налаштування
    Lampa.SettingsApi.addParam({
      component: "easytorrent",
      param: { name: "easytorrent_qr_setup", type: "static" },
      field: {
        name: "Розставити пріоритети",
        description: "Відкрийте візард на телефоні через QR-код"
      },
      onRender: function(element) {
        element.on("hover:enter", function() {
          startQRSetup();
        });
      }
    });
  }

  function startQRSetup() {
    // Генерація коду сполучення
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var pairCode = "";
    for (var i = 0; i < 6; i++) {
      pairCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    var qrUrl = QR_SETUP_URL + "?pairCode=" + pairCode;
    
    var modalHtml = 
      '<div class="about">' +
      '  <div style="text-align: center; margin-bottom: 20px;">' +
      '    <div id="qrCodeContainer" style="background: white; padding: 20px; border-radius: 15px; display: inline-block; margin-bottom: 20px; height: 20em; width: 20em;"></div>' +
      '  </div>' +
      '  <div class="about__text" style="text-align: center; margin-bottom: 15px;">' +
      '    <strong>Або перейдіть вручну:</strong><br>' +
      '    <span style="word-break: break-all;">' + qrUrl + '</span>' +
      '  </div>' +
      '  <div class="about__text" style="text-align: center;">' +
      '    <strong>Код сполучення:</strong>' +
      '    <div style="font-size: 2em; font-weight: bold; letter-spacing: 0.3em; margin: 10px 0; color: #667eea;">' + pairCode + '</div>' +
      '  </div>' +
      '  <div class="about__text" id="qrStatus" style="text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; margin-top: 20px;">' +
      '    ⏳ Очікування конфігурації...' +
      '  </div>' +
      '</div>';
    
    Lampa.Modal.open({
      title: "🔗 Налаштування пріоритетів",
      html: $(modalHtml),
      size: "medium",
      onBack: function() {
        if (configPollInterval) {
          clearInterval(configPollInterval);
          configPollInterval = null;
        }
        Lampa.Modal.close();
        Lampa.Controller.toggle("settings_component");
      }
    });
    
    // Генерація QR-коду
    setTimeout(function() {
      var container = document.getElementById("qrCodeContainer");
      if (container && Lampa.Utils && Lampa.Utils.qrcode) {
        try {
          Lampa.Utils.qrcode(qrUrl, container);
        } catch (e) {
          container.innerHTML = '<p style="color: #f44336;">Помилка генерації QR-коду</p>';
        }
      }
    }, 100);
    
    var lastGenerated = null;
    
    // Опитування сервера для отримання конфігурації
    configPollInterval = setInterval(function() {
      fetchConfigFromServer(pairCode, function(config) {
        if (config) {
          var generated = config.generated;
          if (generated !== lastGenerated) {
            lastGenerated = generated;
            saveConfig(config);
            
            $("#qrStatus")
              .html("✅ Конфігурація отримана!")
              .css("color", "#4CAF50");
            
            setTimeout(function() {
              if (configPollInterval) {
                clearInterval(configPollInterval);
                configPollInterval = null;
              }
              Lampa.Modal.close();
              Lampa.Noty.show("Конфігурація оновлена!");
              Lampa.Controller.toggle("settings_component");
            }, 2000);
          }
        }
      });
    }, 5000);
  }

  function fetchConfigFromServer(pairCode, callback) {
    var url = SUPABASE_URL + "/rest/v1/tv_configs?id=eq." + encodeURIComponent(pairCode) + "&select=data,updated_at";
    
    fetch(url, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY
      }
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      if (data && data.length > 0) {
        callback(data[0].data);
      } else {
        callback(null);
      }
    })
    .catch(function(error) {
      console.error("[EasyTorrent] Помилка отримання конфігурації:", error);
      callback(null);
    });
  }

  function patchParser() {
    var parser = window.Lampa.Parser || 
                 (window.Lampa.Component ? window.Lampa.Component.Parser : null);
    
    if (!parser || !parser.get) {
      console.log("[EasyTorrent] Parser не знайдено");
      return;
    }
    
    console.log("[EasyTorrent] Патчимо Parser.get");
    
    var originalGet = parser.get;
    
    parser.get = function(requestData, successCallback, errorCallback) {
      return originalGet.call(
        this,
        requestData,
        function(results) {
          if (results && results.Results && Array.isArray(results.Results)) {
            // ВИПРАВЛЕННЯ: Отримуємо відсортовані результати
            var sortedResults = processTorrentResults(results.Results, requestData);
            
            if (sortedResults && Array.isArray(sortedResults)) {
              // Замінюємо оригінальні результати відсортованими
              results.Results = sortedResults;
            }
          }
          
          successCallback(results);
        },
        errorCallback
      );
    };
    
    console.log("[EasyTorrent] Parser.get успішно пропатчено");
  }

  function addStyles() {
    var style = document.createElement("style");
    style.textContent = `
      /* Панель рекомендацій */
      .torrent-recommend-panel {
        display: flex;
        align-items: center;
        gap: 0.9em;
        margin: 0.8em -1em -1em;
        padding: 0.75em 1em 0.85em;
        border-radius: 0 0 0.3em 0.3em;
        border-top: 1px solid rgba(255,255,255,0.10);
        background: rgba(0,0,0,0.18);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
      }
      
      .torrent-recommend-panel__left {
        min-width: 0;
        flex: 1 1 auto;
      }
      
      .torrent-recommend-panel__label {
        font-size: 0.95em;
        font-weight: 800;
        letter-spacing: 0.2px;
        color: rgba(255,255,255,0.92);
        line-height: 1.15;
      }
      
      .torrent-recommend-panel__meta {
        margin-top: 0.25em;
        font-size: 0.82em;
        font-weight: 600;
        color: rgba(255,255,255,0.58);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .torrent-recommend-panel__right {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }
      
      .torrent-recommend-panel__score {
        font-size: 1.05em;
        font-weight: 900;
        padding: 0.25em 0.55em;
        border-radius: 0.6em;
        background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.95);
      }
      
      /* Чіпси breakdown */
      .torrent-recommend-panel__chips {
        display: flex;
        flex: 2 1 auto;
        gap: 0.45em;
        flex-wrap: wrap;
        justify-content: flex-start;
      }
      
      .torrent-recommend-panel__chips:empty {
        display: none;
      }
      
      .tr-chip {
        display: inline-flex;
        align-items: baseline;
        gap: 0.35em;
        padding: 0.28em 0.55em;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.10);
      }
      
      .tr-chip__name {
        font-size: 0.78em;
        font-weight: 700;
        color: rgba(255,255,255,0.60);
      }
      
      .tr-chip__val {
        font-size: 0.86em;
        font-weight: 900;
        color: rgba(255,255,255,0.92);
      }
      
      .tr-chip--pos {
        background: rgba(76,175,80,0.10);
        border-color: rgba(76,175,80,0.22);
      }
      .tr-chip--pos .tr-chip__val {
        color: rgba(120,255,170,0.95);
      }
      
      .tr-chip--neg {
        background: rgba(244,67,54,0.10);
        border-color: rgba(244,67,54,0.22);
      }
      .tr-chip--neg .tr-chip__val {
        color: rgba(255,120,120,0.95);
      }
      
      /* Варіанти */
      .torrent-recommend-panel--ideal {
        background: linear-gradient(135deg, rgba(255,215,0,0.16) 0%, rgba(255,165,0,0.08) 100%);
        border-top-color: rgba(255,215,0,0.20);
      }
      .torrent-recommend-panel--ideal .torrent-recommend-panel__label {
        color: rgba(255,235,140,0.98);
      }
      
      .torrent-recommend-panel--recommended {
        background: rgba(76,175,80,0.08);
        border-top-color: rgba(76,175,80,0.18);
      }
      .torrent-recommend-panel--recommended .torrent-recommend-panel__label {
        color: rgba(160,255,200,0.92);
      }
      
      /* Анімація */
      .torrent-recommend-panel {
        animation: tr-panel-in 0.22s ease-out;
      }
      @keyframes tr-panel-in {
        from { opacity: 0; transform: translateY(-3px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Підсвітка */
      .torrent-item.focus .torrent-recommend-panel {
        background: rgba(255,255,255,0.08);
        border-top-color: rgba(255,255,255,0.16);
      }
      
      /* Компакт */
      @media (max-width: 520px) {
        .torrent-recommend-panel {
          gap: 0.7em;
          padding: 0.65em 0.9em 0.75em;
        }
        .torrent-recommend-panel__meta {
          display: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  function initializePlugin() {
    console.log("[EasyTorrent] Ініціалізація " + EASYTORRENT_VERSION);
    
    // Завантаження конфігурації
    var savedConfig = Lampa.Storage.get("easytorrent_config_json");
    if (savedConfig) {
      try {
        var parsed = typeof savedConfig === "string" ? JSON.parse(savedConfig) : savedConfig;
        if (parsed && (parsed.version === "2.0" || parsed.version === 2)) {
          currentConfig = parsed;
        }
      } catch (e) {
        currentConfig = DEFAULT_CONFIG;
      }
    }
    
    // Додавання стилів
    addStyles();
    
    // Налаштування
    setupSettings();
    
    // Патч парсера
    if (window.Lampa && window.Lampa.Parser) {
      patchParser();
    } else {
      setTimeout(patchParser, 1000);
    }
    
    // Слухачі подій
    Lampa.Listener.follow("torrent", function(event) {
      if (event.type === "render") {
        renderTorrentBadge(event);
      }
    });
    
    Lampa.Listener.follow("activity", function(event) {
      if (event.type === "start" && event.component === "torrents") {
        console.log("[EasyTorrent] Нова сторінка торрентів");
        recommendedTorrents = [];
      }
    });
    
    console.log("[EasyTorrent] Готовий до роботи!");
  }

  // Запуск плагіна
  if (window.appready) {
    initializePlugin();
  } else {
    Lampa.Listener.follow("app", function(event) {
      if (event.type === "ready") {
        initializePlugin();
      }
    });
  }
})();
